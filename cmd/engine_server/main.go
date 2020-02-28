package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/engine_server"
)

func main() {
	ctx, err := internal.InitXiangqi(internal.InitOptions{})
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	log.Printf("Starting engine server on port %s.\n", ctx.Port)
	http.HandleFunc("/play", engine_server.HandlePlay)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", ctx.Port), nil))
}
