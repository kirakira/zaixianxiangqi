package main

import (
	"log"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/tools"
)

func main() {
	ctx, err := internal.InitXiangqi(internal.InitOptions{InitDatastoreClient: true})
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	tools.ReadAndPrintGames(ctx)
}
