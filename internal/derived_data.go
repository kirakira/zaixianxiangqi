package internal

import (
	"strings"

	"cloud.google.com/go/datastore"
)

const DerivedGameDataVersion int = 1

func GameHasEnded(game *Game) bool {
	return strings.HasSuffix(game.Moves, "R") || strings.HasSuffix(game.Moves, "B")
}

func CalculateNextToMove(game *Game) *datastore.Key {
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

func populateDerivedGameData(game *Game) {
	game.DerivedData.Version = DerivedGameDataVersion
	game.DerivedData.Status = calculateGameStatus(game)
	game.DerivedData.NextToMove = CalculateNextToMove(game)
}

func StoreGame(tx *datastore.Transaction, key *datastore.Key, game *Game) error {
	populateDerivedGameData(game)
	_, err := tx.Put(key, game)
	return err
}
