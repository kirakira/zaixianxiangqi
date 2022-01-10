package internal

import (
	"time"

	"cloud.google.com/go/datastore"
)

type OldUser struct {
	Name         string         `datastore:"name"`
	AI           bool           `datastore:"ai"`
	MigrationKey string         `datastore:"migrationKey"`
	Key          *datastore.Key `datastore:"__key__"`
}

type OldSession struct {
	Creation time.Time      `datastore:"creation"`
	Uid      int64          `datastore:"uid"`
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

func UserFromOldUser(oldUser *OldUser) *User {
	return &User{
		Name: oldUser.Name,
		AI:   oldUser.AI,
		Key:  oldUser.Key,
	}
}

func SessionFromOldSession(oldSession *OldSession) *Session {
	return &Session{
		Creation: oldSession.Creation,
		Key:      oldSession.Key,
	}
}

func GameFromOldGame(oldGame *OldGame) *Game {
	game := Game{
		Creation:    oldGame.Creation,
		Description: oldGame.Description,
		Moves:       oldGame.Moves,
		Key:         oldGame.Key,
	}
	if oldGame.Red != 0 {
		game.Red = datastore.IDKey("User", oldGame.Red, nil)
	}
	if oldGame.Black != 0 {
		game.Black = datastore.IDKey("User", oldGame.Black, nil)
	}
	if !oldGame.RedActivity.IsZero() {
		game.RedActivity = new(time.Time)
		*game.RedActivity = oldGame.RedActivity
	}
	if !oldGame.BlackActivity.IsZero() {
		game.BlackActivity = new(time.Time)
		*game.BlackActivity = oldGame.BlackActivity
	}
	if oldGame.ForkedFrom != "" {
		game.GameFork = &GameFork{
			ParentGame:      datastore.NameKey("Game", oldGame.ForkedFrom, nil),
			ForkedMoveCount: int(oldGame.ForkedMoveCount),
		}
	}

	return &game
}
