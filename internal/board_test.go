package internal

import (
	"bufio"
	"log"
	"os"
	"sort"
	"strings"
	"testing"
)

func TestGenerateAllMoves(t *testing.T) {
	file, err := os.Open("../testdata/board_tests.txt")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	board := MakeInitialBoard()
	for scanner.Scan() {
		tokens := strings.Split(scanner.Text(), " ")
		fen, turn, moves := tokens[0], tokens[1], tokens[2]
		redToGo := true
		if turn == "b" {
			redToGo = false
		}

		board.SetBoard(fen, redToGo)
		var generated_moves []string
		for _, move := range board.GenerateAllMoves() {
			generated_moves = append(generated_moves, move.XboardNotation())
		}
		sort.Strings(generated_moves)
		moves_concatenated := strings.Join(generated_moves, ",")

		if moves != moves_concatenated {
			board.Print()
			t.Errorf("%s %s expected %s actual %s", fen, turn, moves, moves_concatenated)
			break
		}
	}
}

func TestPastGames(t *testing.T) {
	file, err := os.Open("../testdata/past_games.txt")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		movesString := scanner.Text()
		if movesString == "" {
			continue
		}
		moves := strings.Split(movesString, "/")
		moves = moves[1:]

		board := MakeInitialBoard()
		for i, moveString := range moves {
			if moveString == "R" {
				if board.RedToGo {
					t.Errorf("not black to move for game %s", movesString)
					break
				}
				if !board.IsLosing() {
					t.Errorf("not losing for game %s", movesString)
					break
				}
			} else if moveString == "B" {
				if !board.RedToGo {
					t.Errorf("not red to move for game %s", movesString)
					break
				}
				if !board.IsLosing() {
					t.Errorf("not losing for game %s", movesString)
					break
				}
			} else {
				move, err := ParseNumericMove(moveString)
				if err != nil {
					t.Errorf("fail to parse move %s for game %s", moveString, movesString)
					break
				}
				if !board.CheckedMove(move) {
					t.Errorf("fail to make move %s for game %s", moveString, movesString)
					break
				}
				if i != len(moves)-2 && board.IsLosing() {
					t.Errorf("game %s is losing at %d (%s)", movesString, i, moveString)
					break
				}
			}
		}
	}
}

func TestCheckedMove(t *testing.T) {
	var board Board
	board.SetBoard("1heakae1r/r4c1C1/9/p1p1p3p/9/2P3p2/P3P1P1P/1C2E2cR/9/RH1AKAEH1", false)
	for _, moveString := range []string{"a0a1", "a8a6", "i8i6", "e9e8"} {
		move, err := ParseXboardMove(moveString)
		if err != nil {
			t.Errorf("invalid test case %s", moveString)
		}
		if board.CheckedMove(move) {
			t.Errorf("fail for illegal move %s", moveString)
		}
	}

	for _, moveString := range []string{"g4g3", "i9i7"} {
		move, err := ParseXboardMove(moveString)
		if err != nil {
			t.Errorf("invalid test case %s", moveString)
		}
		if !board.CheckedMove(move) {
			t.Errorf("fail for legal move %s", moveString)
		}
		board.Unmove()
	}
}

func toMoves(movesString []string) []Move {
	var moves []Move
	for _, s := range movesString {
		m, err := ParseXboardMove(s)
		if err != nil {
			log.Fatalf("Invalid test move %s", s)
		}
		moves = append(moves, m)
	}
	return moves
}

func Test4Repetition(t *testing.T) {
	board := MakeInitialBoard()
	moves1 := toMoves([]string{"a0a1", "a1a0"})
	moves2 := toMoves([]string{"a9a8", "a8a9"})

	for j := 0; j < 3; j++ {
		for i := 0; i < 2; i++ {
			board.Move(moves1[i])
			if board.CheckRepetition() {
				t.Errorf("should not report repetition yet")
			}
			board.Move(moves2[i])
		}
	}

	if !board.CheckRepetition() {
		t.Errorf("should report repetition")
	}
}

func Test6Repetition(t *testing.T) {
	board := MakeInitialBoard()
	moves1 := toMoves([]string{"a0a2", "a2a1", "a1a0"})
	moves2 := toMoves([]string{"a9a7", "a7a8", "a8a9"})

	for j := 0; j < 3; j++ {
		for i := 0; i < 3; i++ {
			board.Move(moves1[i])
			if board.CheckRepetition() {
				t.Errorf("should not report repetition yet")
			}
			board.Move(moves2[i])
		}
	}

	if !board.CheckRepetition() {
		t.Errorf("should report repetition")
	}
}

func Test8Repetition(t *testing.T) {
	board := MakeInitialBoard()
	moves1 := toMoves([]string{"a0a1", "a1a2", "a2a1", "a1a0"})
	moves2 := toMoves([]string{"a9a8", "a8a7", "a7a8", "a8a9"})

	for j := 0; j < 3; j++ {
		for i := 0; i < 4; i++ {
			board.Move(moves1[i])
			if board.CheckRepetition() {
				t.Errorf("should not report repetition yet")
			}
			board.Move(moves2[i])
		}
	}

	if !board.CheckRepetition() {
		t.Errorf("should report repetition")
	}
}
