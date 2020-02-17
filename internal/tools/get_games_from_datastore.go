package tools

import (
	"fmt"
	"log"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func ReadGames(ctx Context) []OldGame {
	q := datastore.NewQuery("Game")
	var games []OldGame
	_, err := ctx.Client.GetAll(ctx.Ctx, q, &games)
	if err != nil {
		log.Fatalf("Failed to query games: %v", err)
	}
	return games
}

func ReadAndPrintGames(ctx Context) {
	games := ReadGames(ctx)
	for _, game := range games {
		fmt.Println(game.Moves)
	}
}
