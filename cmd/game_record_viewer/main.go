package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/blur_bench"
	"github.com/kirakira/zaixianxiangqi/internal/blur_bench/mariadb"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)
	port := internal.GetPort()
	log.Printf("Starting server on port %s.\n", port)

	storage, err := mariadb.NewStorage()
	if err != nil {
		log.Printf("Failed to initialize storage: %v", err)
		os.Exit(1)
	}

	blur_bench.RegisterHandlers(storage)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
