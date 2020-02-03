package main

import (
	"cloud.google.com/go/datastore"
	"time"
)

type Game struct {
	Creation        time.Time      `datastore:creation`
	Description     string         `datastore:description,"noindex"`
	Red             int64          `datastore:red`
	Black           int64          `datastore:black`
	Moves           string         `datastore:moves,"noindex"`
	RedActivity     time.Time      `datastore:redActivity`
	BlackActivity   time.Time      `datastore:blackActivity`
	ForkedFrom      string         `datastore:forkedFrom`
	ForkedMoveCount int64          `datastore:forkedMoveCount`
	NextToMove      int64          `datastore:nextToMove`
	Gid             *datastore.Key `datastore:"__key__"`
}
