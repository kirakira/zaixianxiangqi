package internal

import (
	"github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

type PlayerInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GameInfo struct {
	ID    string      `json:"id"`
	Title string      `json:"title"`
	Moves string      `json:"moves"`
	Red   *PlayerInfo `json:"red,omitempty"`
	Black *PlayerInfo `json:"black,omitempty"`
}

type GameInfoResponse struct {
	// "success" or "fail".
	Status   string    `json:"status"`
	GameInfo *GameInfo `json:"gameinfo,omitempty"`
}

type GameRecordResponse struct {
	GameInfo   *GameInfo              `json:"game_info"`
	GameRecord *blur_bench.GameRecord `json:"game_record"`
}

type UpdateProfileResponse struct {
	// "success" or "fail".
	Status string `json:"status"`
	// Mapping from fields to error messages.
	Errors map[string]string `json:"errors,omitempty"`
}
