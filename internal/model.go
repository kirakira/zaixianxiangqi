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
	Creation        time.Time
	Description     string `datastore:"noindex"`
	Red             int64
	Black           int64
	Moves           string `datastore:"noindex"`
	RedActivity     time.Time
	BlackActivity   time.Time
	ForkedFrom      string
	ForkedMoveCount int64
	NextToMove      int64
	Key             *datastore.Key `datastore:"__key__"`
}
