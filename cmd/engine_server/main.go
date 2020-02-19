package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/kirakira/zaixianxiangqi/internal/engine_server"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting engine server on port %s.\n", port)
	http.HandleFunc("/play", engine_server.HandlePlay)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
