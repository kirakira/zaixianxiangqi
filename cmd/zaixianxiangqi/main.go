package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/website"
)

func main() {
	port, ctx, err := internal.InitXiangqi()
	rand.Seed(time.Now().UnixNano())
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	log.Printf("Starting server on port %s.\n", port)
	website.RegisterHandlers(ctx)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
