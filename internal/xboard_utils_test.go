package internal

import (
	"reflect"
	"testing"

	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

func TestValidEngineMove(t *testing.T) {
	output, err := ParseXboardEngineOutputLine("move f5g5")
	if output == nil || err != nil {
		t.Errorf("should be valid move")
	}
	if output.Move == nil {
		t.Errorf("should contain a move")
	}
	if output.Move.XboardNotation() != "f5g5" {
		t.Errorf("parsed incorrect move move")
	}
}

func TestInvalidEngineMove(t *testing.T) {
	output, err := ParseXboardEngineOutputLine("move f5g")
	if output != nil || err == nil {
		t.Errorf("should be invalid move")
	}
}

func TestIrrelevantOutput(t *testing.T) {
	output, err := ParseXboardEngineOutputLine("# time 0.000483658s, visited 272 (562.380856K NPS), expanded 19 (39.283957K NPS)")
	if output != nil || err != nil {
		t.Errorf("should be irrelevant output")
	}
}

func TestRedWins(t *testing.T) {
	output, err := ParseXboardEngineOutputLine("1-0 # Black resigns")
	if output == nil || err != nil {
		t.Errorf("should be valid output")
	}
	if *output.Winner != "R" {
		t.Errorf("should be red winner")
	}
}

func TestBlackWins(t *testing.T) {
	output, err := ParseXboardEngineOutputLine("0-1")
	if output == nil || err != nil {
		t.Errorf("should be valid output")
	}
	if *output.Winner != "B" {
		t.Errorf("should be black winner")
	}
}

func TestThinkingIncompleteDepth(t *testing.T) {
	line := "10	-15	2	66229	d9e9 e6e3 g5f5 h6g6 f5g5 g6f6 g5f5 f6e6 f5f4 e3e5"
	output, err := ParseXboardEngineOutputLine(line)
	if output == nil || err != nil {
		t.Errorf("should be valid output")
	}
	if output.Thinking == nil {
		t.Errorf("should contain thinking")
	}
	expectedOutput := EngineThinkingOutputLine{
		Depth:            10,
		DepthComplete:    false,
		Score:            -15,
		TimeCentiSeconds: 2,
		Nodes:            66229,
		Pv:               []string{"d9e9", "e6e3", "g5f5", "h6g6", "f5g5", "g6f6", "g5f5", "f6e6", "f5f4", "e3e5"},
	}
	if !reflect.DeepEqual(*output.Thinking, expectedOutput) {
		t.Errorf("incorrect thinking output: expected %v actual %v", expectedOutput, output.Thinking)
	}
}

func TestThinkingCompleteDepth(t *testing.T) {
	line := "10.	-15	2	66229	d9e9 e6e3 g5f5 h6g6 f5g5 g6f6 g5f5 f6e6 f5f4 e3e5"
	output, err := ParseXboardEngineOutputLine(line)
	if output == nil || err != nil {
		t.Errorf("should be valid output")
	}
	if output.Thinking == nil {
		t.Errorf("should contain thinking")
	}
	expectedOutput := EngineThinkingOutputLine{
		Depth:            10,
		DepthComplete:    true,
		Score:            -15,
		TimeCentiSeconds: 2,
		Nodes:            66229,
		Pv:               []string{"d9e9", "e6e3", "g5f5", "h6g6", "f5g5", "g6f6", "g5f5", "f6e6", "f5f4", "e3e5"},
	}
	if !reflect.DeepEqual(*output.Thinking, expectedOutput) {
		t.Errorf("incorrect thinking output: expected %v actual %v", expectedOutput, output.Thinking)
	}
}
