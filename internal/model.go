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

type Game struct {
	// if game is forked, this is the time when it is forked
	Creation      time.Time
	Description   string `datastore:",noindex"`
	Red           *datastore.Key
	Black         *datastore.Key
	Moves         string `datastore:",noindex"`
	RedActivity   *time.Time
	BlackActivity *time.Time
	// key of the player to move next, or empty for new or ended games
	NextToMove *datastore.Key
	GameFork   *GameFork
	Key        *datastore.Key `datastore:"__key__"`
}
