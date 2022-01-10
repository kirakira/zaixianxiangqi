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

type GameFork struct {
	// key of its parent game
	ParentGame *datastore.Key
	// the number of moves from its parent this game is forked
	ForkedMoveCount int
}

type GameStatus int

const (
	// The game is waiting for players to join.
	Waiting GameStatus = 0
	// Both players joined the game, and game is in progress.
	InProgress = 1
	// The game has concluded.
	RedWon   = 2
	BlackWon = 3
	Draw     = 4
)

type DerivedGameData struct {
	// Version of the derived game info. 0 means invalid.
	Version int
	Status  GameStatus
	// Key of the player to move next, or empty for new or ended games.
	NextToMove *datastore.Key
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
	GameFork      *GameFork
	DerivedData   DerivedGameData
	Key           *datastore.Key `datastore:"__key__"`

	// Deleted - do not use.
	NextToMove *datastore.Key
}
