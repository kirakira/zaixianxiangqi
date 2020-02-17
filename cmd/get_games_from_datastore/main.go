package main

import (
	"log"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/tools"
)

func main() {
	_, ctx, err := internal.InitXiangqi()
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	tools.ReadAndPrintGames(ctx)
}
