package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/blur_bench"
)

func main() {
	args := os.Args
	if len(args) < 2 {
		fmt.Println("Usage: game_record_viewer filename")
		os.Exit(1)
	}

	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)
	port := internal.GetPort()
	log.Printf("Starting server on port %s.\n", port)

	blur_bench.RegisterHandlers(args[1])
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
