package internal

import (
	"fmt"
	"strings"
	"unicode"
)

type HistoryMove struct {
	Move    Move
	Capture string
}

type Board struct {
	Board       [10][9]string
	RedToGo     bool
	MoveHistory []HistoryMove
}

const (
	// The number of times the board position needs to be repeated in order to invoke repetition rules.
	REPETITION_COUNT = 3
)

func MakeInitialBoard() *Board {
	var board Board
	board.SetBoard("rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR", true)
	return &board
}

func (board *Board) SetBoard(fen string, redToGo bool) {
	rows := strings.Split(fen, "/")
	for i := 0; i < 10; i++ {
		for j := 0; j < 9; j++ {
			board.Board[i][j] = ""
		}
		j := 0
		for _, c := range rows[i] {
			if unicode.IsDigit(c) {
				j += int(c) - '0'
			} else {
				board.Board[i][j] = string(c)
				j += 1
			}
		}
	}
	board.RedToGo = redToGo
	board.MoveHistory = nil
}

func (board *Board) Print() {
	for _, row := range board.Board {
		for _, c := range row {
			if len(c) == 0 {
				fmt.Print(".")
			} else {
				fmt.Printf("%s", c)
			}
		}
		fmt.Println()
	}
}

func (board *Board) Move(move Move) {
	board.MoveHistory = append(board.MoveHistory, HistoryMove{
		Move:    move,
		Capture: *board.At(move.To),
	})
	*board.At(move.To) = *board.At(move.From)
	*board.At(move.From) = ""
	board.RedToGo = !board.RedToGo
}

func (board *Board) Unmove() {
	last := board.MoveHistory[len(board.MoveHistory)-1]
	board.MoveHistory = board.MoveHistory[:len(board.MoveHistory)-1]
	*board.At(last.Move.From) = *board.At(last.Move.To)
	*board.At(last.Move.To) = last.Capture
	board.RedToGo = !board.RedToGo
}

func (board *Board) CheckedMove(move Move) bool {
	if !inBoard(move.From) || !inBoard(move.To) {
		return false
	}

	if *board.At(move.From) == "" || isRedPiece(*board.At(move.From)) != board.RedToGo {
		return false
	}

	found := false
	for _, m := range board.generatePieceMoves(*board.At(move.From), move.From) {
		if m == move {
			found = true
			break
		}
	}
	if !found {
		return false
	}

	board.Move(move)
	if board.hasWinningMove() {
		board.Unmove()
		return false
	}

	return true
}

func (board *Board) IsLosing() bool {
	for _, move := range board.GenerateAllMoves() {
		if isKing(*board.At(move.To)) {
			return false
		}
		board.Move(move)
		notLosing := false
		if !board.hasWinningMove() {
			notLosing = true
		}
		board.Unmove()
		if notLosing {
			return false
		}
	}
	return true
}

func (board *Board) GenerateAllMoves() []Move {
	var moves []Move
	for i := 0; i < 10; i++ {
		for j := 0; j < 9; j++ {
			pos := Position{Row: i, Col: j}
			if *board.At(pos) != "" && isRedPiece(*board.At(pos)) == board.RedToGo {
				moves = append(moves, board.generatePieceMoves(*board.At(pos), pos)...)
			}
		}
	}
	return moves
}

func (board *Board) At(pos Position) *string {
	return &board.Board[pos.Row][pos.Col]
}

// Returns whether the same board position has repeated 3 times or more.
func (board *Board) CheckRepetition() bool {
	return board.checkRepetitionOfCycle(4) || board.checkRepetitionOfCycle(6) || board.checkRepetitionOfCycle(8)
}

var di = [...]int{0, 1, 0, -1}
var dj = [...]int{1, 0, -1, 0}
var ddi = [...]int{1, 1, -1, -1}
var ddj = [...]int{1, -1, -1, 1}

func isRedPiece(piece string) bool {
	return unicode.IsUpper(rune(piece[0]))
}

func isKing(piece string) bool {
	return piece == "k" || piece == "K"
}

func inBoard(pos Position) bool {
	return pos.Row >= 0 && pos.Row < 10 && pos.Col >= 0 && pos.Col < 9
}

func inPalace(pos Position) bool {
	return ((pos.Row >= 0 && pos.Row <= 2) || (pos.Row >= 7 && pos.Row <= 9)) && pos.Col >= 3 && pos.Col <= 5
}

func inRedBase(pos Position) bool {
	return inBoard(pos) && pos.Row >= 5
}

func inBlackBase(pos Position) bool {
	return inBoard(pos) && pos.Row < 5
}

func (board *Board) hasWinningMove() bool {
	for _, move := range board.GenerateAllMoves() {
		if isKing(*board.At(move.To)) {
			return true
		}
	}
	return false
}

func (board *Board) generatePieceMoves(piece string, pos Position) []Move {
	var moves []Move
	if strings.ToLower(piece) == "k" {
		moves = board.generateKMoves(pos)
	} else if strings.ToLower(piece) == "a" {
		moves = board.generateAMoves(pos)
	} else if strings.ToLower(piece) == "e" {
		if isRedPiece(piece) {
			moves = board.generateREMoves(pos)
		} else {
			moves = board.generateBEMoves(pos)
		}
	} else if strings.ToLower(piece) == "h" {
		moves = board.generateHMoves(pos)
	} else if strings.ToLower(piece) == "r" {
		moves = board.generateRMoves(pos)
	} else if strings.ToLower(piece) == "c" {
		moves = board.generateCMoves(pos)
	} else if strings.ToLower(piece) == "p" {
		if isRedPiece(piece) {
			moves = board.generateRPMoves(pos)
		} else {
			moves = board.generateBPMoves(pos)
		}
	}

	var filteredMoves []Move
	for _, move := range moves {
		target := *board.At(move.To)
		if target == "" || isRedPiece(target) != board.RedToGo {
			filteredMoves = append(filteredMoves, move)
		}
	}
	return filteredMoves
}

func generateShifts(pos Position, rowShift, colShift []int) []Move {
	var moves []Move
	for i := 0; i < len(rowShift); i++ {
		moves = append(moves, Move{
			From: pos,
			To: Position{
				Row: pos.Row + rowShift[i],
				Col: pos.Col + colShift[i],
			},
		})
	}
	return moves
}

func (board *Board) generateKMoves(pos Position) []Move {
	var moves []Move
	for _, move := range generateShifts(pos, di[:], dj[:]) {
		if inPalace(move.To) {
			moves = append(moves, move)
		}
	}
	for delta := -1; delta <= 1; delta += 2 {
		ii := pos.Row
		for ; ; ii += delta {
			to := Position{Row: ii + delta, Col: pos.Col}
			if !inBoard(to) {
				break
			}
			if isKing(*board.At(to)) {
				moves = append(moves, Move{From: pos, To: to})
			} else if *board.At(to) != "" {
				break
			}
		}
	}
	return moves
}

func (board *Board) generateAMoves(pos Position) []Move {
	var moves []Move
	for _, move := range generateShifts(pos, ddi[:], ddj[:]) {
		if inPalace(move.To) {
			moves = append(moves, move)
		}
	}
	return moves
}

func (board *Board) generateREMoves(pos Position) []Move {
	var moves []Move
	for r := 0; r < 4; r++ {
		to := Position{Row: pos.Row + 2*ddi[r], Col: pos.Col + 2*ddj[r]}
		check := Position{Row: pos.Row + ddi[r], Col: pos.Col + ddj[r]}
		if inRedBase(to) && *board.At(check) == "" {
			moves = append(moves, Move{From: pos, To: to})
		}
	}
	return moves
}

func (board *Board) generateBEMoves(pos Position) []Move {
	var moves []Move
	for r := 0; r < 4; r++ {
		to := Position{Row: pos.Row + 2*ddi[r], Col: pos.Col + 2*ddj[r]}
		check := Position{Row: pos.Row + ddi[r], Col: pos.Col + ddj[r]}
		if inBlackBase(to) && *board.At(check) == "" {
			moves = append(moves, Move{From: pos, To: to})
		}
	}
	return moves
}

func (board *Board) generateHMoves(pos Position) []Move {
	var table = [...][4]int{{1, 2, 0, 1}, {1, -2, 0, -1}, {-1, 2, 0, 1}, {-1, -2, 0, -1},
		{2, 1, 1, 0}, {2, -1, 1, 0}, {-2, 1, -1, 0}, {-2, -1, -1, 0}}
	var moves []Move
	for _, pattern := range table {
		to := Position{Row: pos.Row + pattern[0], Col: pos.Col + pattern[1]}
		check := Position{Row: pos.Row + pattern[2], Col: pos.Col + pattern[3]}
		if inBoard(to) && *board.At(check) == "" {
			moves = append(moves, Move{From: pos, To: to})
		}
	}
	return moves
}

func (board *Board) generateRMoves(pos Position) []Move {
	var moves []Move
	for r := 0; r < 4; r++ {
		ni := pos.Row
		nj := pos.Col
		for ; ; ni, nj = ni+di[r], nj+dj[r] {
			to := Position{Row: ni + di[r], Col: nj + dj[r]}
			if !inBoard(to) {
				break
			}
			moves = append(moves, Move{From: pos, To: to})
			if *board.At(to) != "" {
				break
			}
		}
	}
	return moves
}

func (board *Board) generateCMoves(pos Position) []Move {
	var moves []Move
	for r := 0; r < 4; r++ {
		ni := pos.Row
		nj := pos.Col
		met := false
		for ; ; ni, nj = ni+di[r], nj+dj[r] {
			to := Position{Row: ni + di[r], Col: nj + dj[r]}
			if !inBoard(to) {
				break
			}
			if *board.At(to) != "" {
				if met {
					moves = append(moves, Move{From: pos, To: to})
					break
				} else {
					met = true
				}
			} else if !met {
				moves = append(moves, Move{From: pos, To: to})
			}
		}
	}
	return moves
}

func (board *Board) generateRPMoves(pos Position) []Move {
	var moves []Move
	var rowShifts, colShifts []int
	if inRedBase(pos) {
		rowShifts = []int{-1}
		colShifts = []int{0}
	} else {
		rowShifts = []int{-1, 0, 0}
		colShifts = []int{0, 1, -1}
	}
	for _, move := range generateShifts(pos, rowShifts, colShifts) {
		if inBoard(move.To) {
			moves = append(moves, move)
		}
	}
	return moves
}

func (board *Board) generateBPMoves(pos Position) []Move {
	var moves []Move
	var rowShifts, colShifts []int
	if inBlackBase(pos) {
		rowShifts = []int{1}
		colShifts = []int{0}
	} else {
		rowShifts = []int{1, 0, 0}
		colShifts = []int{0, 1, -1}
	}
	for _, move := range generateShifts(pos, rowShifts, colShifts) {
		if inBoard(move.To) {
			moves = append(moves, move)
		}
	}
	return moves
}

func sameMoveSequence(seq1, seq2 []HistoryMove) bool {
	for i := 0; i < len(seq1); i++ {
		if seq1[i].Move != seq2[i].Move {
			return false
		}
	}
	return true
}

func isSamePlayerMoveSequenceCyclic(seq []HistoryMove) bool {
	for i := 0; i < len(seq); i++ {
		ni := (i + 1) % len(seq)
		if seq[i].Move.To != seq[ni].Move.From {
			return false
		}
	}
	return true
}

func isMoveSequenceCyclic(seq []HistoryMove) bool {
	extractPlayerMoves := func(start int) []HistoryMove {
		var newSeq []HistoryMove
		for i := start; i < len(seq); i += 2 {
			newSeq = append(newSeq, seq[i])
		}
		return newSeq
	}
	return isSamePlayerMoveSequenceCyclic(extractPlayerMoves(0)) &&
		isSamePlayerMoveSequenceCyclic(extractPlayerMoves(1))
}

func (board *Board) checkRepetitionOfCycle(cycle int) bool {
	moveCount := len(board.MoveHistory)
	lastCapture := -1
	for i := moveCount - 1; i >= 0; i-- {
		if len(board.MoveHistory[i].Capture) > 0 {
			lastCapture = i
			break
		}
	}
	recentNonCapturingMoves := moveCount - lastCapture - 1
	if recentNonCapturingMoves < cycle*REPETITION_COUNT {
		return false
	}

	for i := 1; i < REPETITION_COUNT; i++ {
		if !sameMoveSequence(board.MoveHistory[moveCount-cycle:moveCount],
			board.MoveHistory[moveCount-cycle*i-cycle:moveCount-cycle*i]) {
			return false
		}
	}

	return isMoveSequenceCyclic(board.MoveHistory[moveCount-cycle : moveCount])
}
