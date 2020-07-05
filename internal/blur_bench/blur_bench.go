package blur_bench

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"os"
	"os/exec"
	"sort"
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes"
	"kythe.io/kythe/go/util/riegeli"

	. "github.com/kirakira/zaixianxiangqi/internal"
	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

type engineHandles struct {
	Name    string
	Cmd     *exec.Cmd
	Stdin   io.WriteCloser
	Scanner *bufio.Scanner
}

func runEngine(engine string) (*engineHandles, error) {
	cmd := exec.Command(engine)

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}

	handles := engineHandles{
		Name:    ExtractEngineName(engine),
		Cmd:     cmd,
		Stdin:   stdin,
		Scanner: bufio.NewScanner(stdout),
	}

	err = cmd.Start()
	if err != nil {
		return nil, err
	}

	return &handles, nil
}

func sendCommand(engine *engineHandles, command string, threadIndex int) error {
	log.Printf("%s:IN[%d]  %s\n", engine.Name, threadIndex, command)
	_, err := engine.Stdin.Write([]byte(command + "\n"))
	return err
}

func readOutputLine(engine *engineHandles, threadIndex int) (string, error) {
	if engine.Scanner.Scan() {
		output := engine.Scanner.Text()
		log.Printf("%s:OUT[%d] %s\n", engine.Name, threadIndex, output)
		return output, nil
	} else if engine.Scanner.Err() != nil {
		return "", engine.Scanner.Err()
	} else {
		return "", io.EOF
	}
}

func readEngineMove(engine *engineHandles, threadIndex int) (*ExtractedEngineOutput, error) {
	var output ExtractedEngineOutput
	var lastThinking *EngineThinkingOutput
	for {
		line, err := readOutputLine(engine, threadIndex)
		if err != nil {
			return nil, err
		}
		thisOutput, err := ParseXboardEngineOutputLine(line)
		if err != nil {
			return nil, err
		}
		if thisOutput != nil {
			if thisOutput.Move != nil {
				output.Move = thisOutput.Move
				return &output, nil
			}
			if thisOutput.Winner != nil {
				output.Winner = thisOutput.Winner
				return &output, nil
			}
			if thisOutput.Thinking != nil {
				if lastThinking == nil || thisOutput.Thinking.DepthComplete {
					output.Thinking = thisOutput.Thinking
				} else if thisOutput.Thinking.Depth > lastThinking.Depth {
					output.Thinking = lastThinking
				}
				lastThinking = thisOutput.Thinking
			}
		}
	}
}

func sendInitialCommands(engine *engineHandles, threadIndex int) error {
	initialCommands := []string{"xboard"}
	for _, command := range initialCommands {
		err := sendCommand(engine, command, threadIndex)
		if err != nil {
			return err
		}
	}
	return nil
}

func closeEngine(engine *engineHandles) {
	log.Printf("%s:CLOSE\n", engine.Name)
	engine.Stdin.Close()
	engine.Cmd.Wait()
}

func playGame(engines [2]string, redPlayer int, threadIndex int) (*GameRecord, error) {
	// Start engines.
	var handles [2]*engineHandles
	for i := 0; i < 2; i++ {
		handle, err := runEngine(engines[i])
		if err != nil {
			return nil, err
		}
		handles[i] = handle
		err = sendInitialCommands(handle, threadIndex)
		if err != nil {
			return nil, err
		}
	}

	log.Printf("Starting a new game: %s (red), %s (black)\n", handles[redPlayer].Name, handles[1-redPlayer].Name)

	startTime, err := ptypes.TimestampProto(time.Now())
	if err != nil {
		return nil, err
	}
	gameRecord := GameRecord{
		RedId:     handles[redPlayer].Name,
		BlackId:   handles[1-redPlayer].Name,
		StartTime: startTime,
	}
	board := MakeInitialBoard()

	var playerColor []string
	if redPlayer == 0 {
		playerColor = []string{"R", "B"}
	} else {
		playerColor = []string{"B", "R"}
	}

	// Start the game.
	err = sendCommand(handles[redPlayer], "go", threadIndex)
	if err != nil {
		return nil, err
	}
	for i := redPlayer; true; i = 1 - i {
		output, err := readEngineMove(handles[i], threadIndex)
		if err != nil {
			return nil, err
		}

		if output.Winner != nil {
			if *output.Winner == playerColor[i] {
				return nil, errors.New(fmt.Sprintf("%s cannot declare win", handles[i].Name))
			} else {
				if *output.Winner == "R" {
					gameRecord.Result = GameResult_RED_WON
				} else {
					gameRecord.Result = GameResult_BLACK_WON
				}
				break
			}
		} else {
			if output.Move == nil {
				// TODO: handle timeouts.
				log.Fatalf("No move received from engine.")
			}
			// Check that the move is valid.
			if !board.CheckedMove(*output.Move) {
				return nil, errors.New(fmt.Sprintf("%s made an invalid move %s", handles[i].Name, output.Move.XboardNotation()))
			}

			gameRecord.Moves = append(gameRecord.Moves, output.Move.XboardNotation())
			var score float64
			if output.Thinking != nil {
				score = output.Thinking.Score
				// Negate the score if the player is black.
				if i != redPlayer {
					score = -score
				}
			}
			gameRecord.Scores = append(gameRecord.Scores, score)

			// Check if the move triggered repetition rules.
			if board.CheckRepetition() {
				log.Printf("Repetition rule triggered.")
				gameRecord.Result = GameResult_DRAW
				break
			}

			// Send the move to the other engine.
			err = sendCommand(handles[1-i], output.Move.XboardNotation(), threadIndex)
			if err != nil {
				return nil, err
			}
		}
	}

	for i := 0; i < 2; i++ {
		closeEngine(handles[i])
	}

	return &gameRecord, nil
}

func selfPlayThread(engines [2]string, redPlayer int, threadIndex int, resultChannel chan *GameRecord) {
	for ; true; redPlayer = 1 - redPlayer {
		gameRecord, err := playGame(engines, redPlayer, threadIndex)
		if err != nil {
			log.Printf("Game ended abnormally: %s\n", err)
			close(resultChannel)
			break
		}
		resultChannel <- gameRecord
	}
}

func printCurrentScore(halfScores map[string]int) {
	if len(halfScores) != 2 {
		log.Fatalf("Detected %d unique ids", len(halfScores))
	}

	type NameHalfScore struct {
		Name      string
		HalfScore int
	}
	var list []NameHalfScore
	for id, halfScore := range halfScores {
		list = append(list, NameHalfScore{
			Name:      id,
			HalfScore: halfScore,
		})
	}
	sort.Slice(list, func(i, j int) bool {
		return list[i].Name < list[j].Name
	})

	log.Printf("Current Score: %s %f : %f %s\n", list[0].Name,
		float64(list[0].HalfScore)/2, float64(list[1].HalfScore)/2, list[1].Name)
}

func writeGameRecord(outputFile string, record *GameRecord) error {
	f, err := os.OpenFile(outputFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	writer := riegeli.NewWriter(f, nil)
	writer.PutProto(record)
	writer.Close()
	return nil
}

func recorderThread(outputFile string, resultChannel chan *GameRecord) {
	halfScores := map[string]int{}
	for record := range resultChannel {
		if record.Result == GameResult_UNKNOWN {
			log.Fatalf("Received a game with unknown result")
		}
		err := writeGameRecord(outputFile, record)
		if err != nil {
			log.Printf("Failed to write game record: %s\n", err)
		}

		if record.Result == GameResult_RED_WON {
			halfScores[record.RedId] += 2
			halfScores[record.BlackId] += 0
		} else if record.Result == GameResult_BLACK_WON {
			halfScores[record.RedId] += 0
			halfScores[record.BlackId] += 2
		} else {
			halfScores[record.RedId] += 1
			halfScores[record.BlackId] += 1
		}
		printCurrentScore(halfScores)
	}
}

func ExtractEngineName(engine string) string {
	idx := strings.LastIndex(engine, "/")
	if idx == -1 {
		return engine
	} else {
		return engine[idx+1:]
	}
}

func SelfPlay(engines [2]string, numThreads int, outputFile string) {
	ch := make(chan *GameRecord)
	rand.Seed(time.Now().UnixNano())
	redPlayer := rand.Intn(2)
	for i := 0; i < numThreads; i++ {
		go selfPlayThread(engines, redPlayer, i, ch)
		redPlayer = 1 - redPlayer
	}
	recorderThread(outputFile, ch)
}
