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
