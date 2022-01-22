package internal

import (
	"strings"
	"time"

	"cloud.google.com/go/datastore"
)

const DerivedGameDataVersion int = 2

func GameHasEnded(game *Game) bool {
	return strings.HasSuffix(game.Moves, "R") || strings.HasSuffix(game.Moves, "B")
}

func calculateNextToMove(game *Game) *datastore.Key {
	if game.Red == nil || game.Black == nil {
		return nil
	} else if GameHasEnded(game) {
		return nil
	} else if len(strings.Split(game.Moves, "/"))%2 == 1 {
		return game.Red
	} else {
		return game.Black
	}
}

func calculateGameStatus(game *Game) GameStatus {
	if game.Red == nil || game.Black == nil {
		return Waiting
	}
	if strings.HasSuffix(game.Moves, "R") {
		return RedWon
	}
	if strings.HasSuffix(game.Moves, "B") {
		return BlackWon
	}
	return InProgress
}

func calculateLastActivity(game *Game) *time.Time {
	maxTime := func(t1, t2 *time.Time) *time.Time {
		if t1 == nil && t2 == nil {
			return nil
		}
		if t1 == nil {
			return t2
		}
		if t2 == nil {
			return t1
		}
		if (*t1).After(*t2) {
			return t1
		} else {
			return t2
		}
	}

	var t *time.Time
	t = maxTime(t, &game.Creation)
	t = maxTime(t, game.RedActivity)
	t = maxTime(t, game.BlackActivity)
	return t
}

func populateDerivedGameData(game *Game) {
	game.DerivedData.Version = DerivedGameDataVersion
	game.DerivedData.Status = calculateGameStatus(game)
	game.DerivedData.NextToMove = calculateNextToMove(game)
	game.DerivedData.LastActivity = calculateLastActivity(game)
	game.DerivedData.Started = game.DerivedData.Status >= InProgress
}

func StoreGame(tx *datastore.Transaction, key *datastore.Key, game *Game) error {
	populateDerivedGameData(game)
	_, err := tx.Put(key, game)
	return err
}
