package internal

import (
	"time"

	"cloud.google.com/go/datastore"
)

type User struct {
	Name string
	AI   bool
	Key  *datastore.Key `datastore:"__key__"`
}

// This is child table of User.
type Session struct {
	Creation time.Time
	Key      *datastore.Key `datastore:"__key__"`
}

type Game struct {
	// if game is forked, this is the time when it is forked
	Creation      time.Time
	Description   string `datastore:",noindex"`
	Red           *datastore.Key
	Black         *datastore.Key
	Moves         string `datastore:",noindex"`
	RedActivity   *time.Time
	BlackActivity *time.Time
	// key of its parent game, or empty
	ForkedFrom *datastore.Key
	// how many moves from its parent game are forked
	ForkedMoveCount *int
	// key of the player to move next, or empty for new or ended games
	NextToMove *datastore.Key
	Key        *datastore.Key `datastore:"__key__"`
}

type OldUser struct {
	Name string         `datastore:"name"`
	AI   bool           `datastore:"ai"`
	Key  *datastore.Key `datastore:"__key__"`
}

type OldSession struct {
	Creation time.Time      `datastore:"creation"`
	Key      *datastore.Key `datastore:"__key__"`
}

// The old game model used in Python zaixianxiangqi.
type OldGame struct {
	Creation        time.Time      `datastore:"creation"`
	Description     string         `datastore:"description,noindex"`
	Red             int64          `datastore:"red"`
	Black           int64          `datastore:"black"`
	Moves           string         `datastore:"moves,noindex"`
	RedActivity     time.Time      `datastore:"redActivity"`
	BlackActivity   time.Time      `datastore:"blackActivity"`
	ForkedFrom      string         `datastore:"forkedFrom"`
	ForkedMoveCount int64          `datastore:"forkedMoveCount"`
	NextToMove      int64          `datastore:"nextToMove"`
	Key             *datastore.Key `datastore:"__key__"`
}
