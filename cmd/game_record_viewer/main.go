package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/blur_bench"
	"github.com/kirakira/zaixianxiangqi/internal/blur_bench/leveldb"
)

func main() {
	args := os.Args
	if len(args) < 2 {
		fmt.Println("Usage: game_record_viewer leveldb_directory")
		os.Exit(1)
	}

	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)
	port := internal.GetPort()
	log.Printf("Starting server on port %s.\n", port)

	storage := leveldb.Storage{
		LeveldbDirectory: args[1],
	}
	blur_bench.RegisterHandlers(storage)

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
