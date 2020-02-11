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
	Description     string `datastore:",noindex"`
	Red             *datastore.Key
	Black           *datastore.Key
	Moves           string `datastore:",noindex"`
	RedActivity     *time.Time
	BlackActivity   *time.Time
	ForkedFrom      *string
	ForkedMoveCount *int64
	NextToMove      *datastore.Key
	Key             *datastore.Key `datastore:"__key__"`
}
