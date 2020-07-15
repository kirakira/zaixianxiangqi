package blur_bench

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"os/exec"
	"strings"
	"time"

	"github.com/google/orderedcode"
	"github.com/syndtr/goleveldb/leveldb"
	"github.com/syndtr/goleveldb/leveldb/util"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/timestamppb"

	. "github.com/kirakira/zaixianxiangqi/internal"
	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

const (
	NumNoProgressMovesToDraw = 50
	MoveTimeLimitCentis      = 100
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

func getGoCommand() string {
	return "go"
}

func getTimeCommand() string {
	return fmt.Sprintf("time %d", MoveTimeLimitCentis)
}

func getForceCommand() string {
	return "force"
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

	gameId := RandomString(8)
	log.Printf("Starting a new game %s: %s (red), %s (black)\n", gameId, handles[redPlayer].Name, handles[1-redPlayer].Name)

	gameRecord := GameRecord{
		GameId:       gameId,
		ControlIsRed: redPlayer == 0,
		StartTime:    timestamppb.New(time.Now()),
	}
	board := MakeInitialBoard()

	var playerColor []string
	if redPlayer == 0 {
		playerColor = []string{"R", "B"}
	} else {
		playerColor = []string{"B", "R"}
	}

	// Start the game.
	if err := sendCommand(handles[redPlayer], getGoCommand(), threadIndex); err != nil {
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
				gameRecord.ResultReason = GameResultReason_RESIGN
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
				gameRecord.ResultReason = GameResultReason_RULE_REPETITION
				break
			}

			if board.MovesSinceCapture() > NumNoProgressMovesToDraw {
				log.Printf("Declaring draw due to lack of progress.")
				gameRecord.Result = GameResult_DRAW
				gameRecord.ResultReason = GameResultReason_LACK_OF_PROGRESS
				break
			}

			// Send the move to the other engine.
			err = sendCommand(handles[1-i], getForceCommand(), threadIndex)
			err = sendCommand(handles[1-i], getTimeCommand(), threadIndex)
			err = sendCommand(handles[1-i], output.Move.XboardNotation(), threadIndex)
			err = sendCommand(handles[1-i], getGoCommand(), threadIndex)
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

func writeProtoRecordToDB(db *leveldb.DB, key []byte, record proto.Message) error {
	value, err := proto.Marshal(record)
	if err != nil {
		return err
	}

	err = db.Put(key, value, nil)
	if err != nil {
		return err
	}

	return nil
}

func writeProtoRecord(leveldbDirectory string, key []byte, record proto.Message) error {
	db, err := leveldb.OpenFile(leveldbDirectory, nil)
	if err != nil {
		return err
	}
	defer db.Close()
	return writeProtoRecordToDB(db, key, record)
}

func writeGameRecord(leveldbDirectory string, experimentId int64, record *GameRecord) error {
	return writeProtoRecord(leveldbDirectory, keyForGameRecord(experimentId, record.GameId), record)
}

func createExperimentMetadata(engines [2]string) *ExperimentMetadata {
	return &ExperimentMetadata{
		CreationTime: timestamppb.New(time.Now()),
		Control: &EngineInfo{
			Name: ExtractEngineName(engines[0]),
		},
		Treatment: &EngineInfo{
			Name: ExtractEngineName(engines[1]),
		},
	}
}

func findNextExperimentKey(db *leveldb.DB) (int64, error) {
	iter := db.NewIterator(util.BytesPrefix(keyPrefixForExperimentMetadata()), nil)
	var lastKey int64 = 9999
	if iter.Next() {
		var metadata ExperimentMetadata
		iter.Value()
		err := proto.Unmarshal(iter.Value(), &metadata)
		if err != nil {
			return 0, err
		}
		lastKey = metadata.Id
	}
	return lastKey + 1, nil
}

func writeExperimentMetadata(leveldbDirectory string, metadata *ExperimentMetadata) error {
	db, err := leveldb.OpenFile(leveldbDirectory, nil)
	if err != nil {
		return err
	}
	defer db.Close()

	metadata.Id, err = findNextExperimentKey(db)
	if err != nil {
		return err
	}
	return writeProtoRecordToDB(db, keyForExperimentMetadata(metadata.Id), metadata)
}

func keyPrefixForExperimentMetadata() []byte {
	key, err := orderedcode.Append(nil, "metadata_")
	if err != nil {
		log.Fatalf("Failed keyPrefixForExperimentMetadata: %v", err)
	}
	return key
}

func keyForExperimentMetadata(experimentId int64) []byte {
	key, err := orderedcode.Append(keyPrefixForExperimentMetadata(), orderedcode.Decr(experimentId))
	if err != nil {
		log.Fatalf("Failed keyForExperimentMetadata: %v", err)
	}
	return key
}

func keyPrefixForExperimentGames(experimentId int64) []byte {
	key, err := orderedcode.Append(nil, "game_", orderedcode.Decr(experimentId))
	if err != nil {
		log.Fatalf("Failed keyPrefixForExperimentGames: %v", err)
	}
	return key
}

func keyForGameRecord(experimentId int64, gameId string) []byte {
	key, err := orderedcode.Append(keyPrefixForExperimentGames(experimentId), gameId)
	if err != nil {
		log.Fatalf("Failed keyForGameRecord: %v", err)
	}
	return key
}

func recorderThread(engines [2]string, leveldbDirectory string, resultChannel chan *GameRecord) {
	metadata := createExperimentMetadata(engines)
	if err := writeExperimentMetadata(leveldbDirectory, metadata); err != nil {
		log.Fatalf("Failed to write test metadata: %v", err)
	}
	log.Printf("Starting experiment %d. Writing output to '%s'.", metadata.Id, leveldbDirectory)

	halfScores := [2]int{}
	for record := range resultChannel {
		if record.Result == GameResult_UNKNOWN_GAME_RESULT {
			log.Fatalf("Received a game with unknown result")
		}
		err := writeGameRecord(leveldbDirectory, metadata.Id, record)
		if err != nil {
			log.Printf("Failed to write game record: %s\n", err)
		}

		var redEngineIndex, blackEngineIndex int
		if record.ControlIsRed {
			redEngineIndex = 0
			blackEngineIndex = 1
		} else {
			redEngineIndex = 1
			blackEngineIndex = 0
		}
		if record.Result == GameResult_RED_WON {
			halfScores[redEngineIndex] += 2
		} else if record.Result == GameResult_BLACK_WON {
			halfScores[blackEngineIndex] += 2
		} else {
			halfScores[redEngineIndex] += 1
			halfScores[blackEngineIndex] += 1
		}
		log.Printf("Current Score: %s %f : %f %s\n", ExtractEngineName(engines[0]),
			float64(halfScores[0])/2, float64(halfScores[1])/2, ExtractEngineName(engines[1]))
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

func SelfPlay(engines [2]string, numThreads int, leveldbDirectory string) {
	rand.Seed(time.Now().UnixNano())
	ch := make(chan *GameRecord)
	redPlayer := rand.Intn(2)
	for i := 0; i < numThreads; i++ {
		go selfPlayThread(engines, redPlayer, i, ch)
		redPlayer = 1 - redPlayer
	}
	recorderThread(engines, leveldbDirectory, ch)
}
