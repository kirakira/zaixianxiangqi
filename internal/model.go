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
	Creation time.Time
	// This should be a "noindex" field. Not marking so due to Datastore bug.
	Description string
	Red         *datastore.Key
	Black       *datastore.Key
	// This should be a "noindex" field. Not marking so due to Datastore bug.
	Moves           string
	RedActivity     *time.Time
	BlackActivity   *time.Time
	ForkedFrom      *string
	ForkedMoveCount *int64
	NextToMove      *datastore.Key
	Key             *datastore.Key `datastore:"__key__"`
}
