package internal

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

type ExtractedEngineOutput struct {
	// A single engine output line will contain at most one of the above fields.
	Move     *Move
	Winner   *string
	Thinking *EngineThinkingOutput
}

func parseEngineThinking(line string) *EngineThinkingOutput {
	fields := strings.Fields(line)
	if len(fields) >= 4 {
		var output EngineThinkingOutput

		// Depth. Remove the dot if there is one.
		depthString := fields[0]
		depthDotIndex := strings.Index(depthString, ".")
		if depthDotIndex != -1 {
			depthString = depthString[:depthDotIndex]
			output.DepthComplete = true
		}
		depth, err := strconv.Atoi(depthString)
		if err != nil {
			return nil
		}
		output.Depth = int32(depth)

		// Score.
		score, err := strconv.ParseFloat(fields[1], 64)
		if err != nil {
			return nil
		}
		output.Score = score

		// Time.
		time, err := strconv.ParseFloat(fields[2], 64)
		if err != nil {
			return nil
		}
		output.TimeCentiSeconds = time

		// Nodes.
		nodes, err := strconv.ParseInt(fields[3], 10, 64)
		if err != nil {
			return nil
		}
		output.Nodes = nodes

		// PV.
		output.Pv = fields[4:]

		return &output
	}
	return nil
}

// Parses an Xboard engine output line.
func ParseXboardEngineOutputLine(line string) (*ExtractedEngineOutput, error) {
	if strings.HasPrefix(line, "#") {
		return nil, nil
	} else if strings.HasPrefix(line, "move ") {
		move, err := ParseXboardMove(line[5:])
		if err != nil {
			return nil, errors.New(fmt.Sprintf("bad move received from engine: %s", err))
		}
		return &ExtractedEngineOutput{
			Move: &move,
		}, nil
	} else if strings.HasPrefix(line, "0-1") {
		winner := "B"
		return &ExtractedEngineOutput{
			Winner: &winner,
		}, nil
	} else if strings.HasPrefix(line, "1-0") {
		winner := "R"
		return &ExtractedEngineOutput{
			Winner: &winner,
		}, nil
	} else {
		thinking := parseEngineThinking(line)
		if thinking != nil {
			return &ExtractedEngineOutput{
				Thinking: thinking,
			}, nil
		} else {
			return nil, nil
		}
	}
}
