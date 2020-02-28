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
	ctx, err := internal.InitXiangqi(internal.InitOptions{InitDatastoreClient: true})
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}
	rand.Seed(time.Now().UnixNano())

	log.Printf("Starting server on port %s.\n", ctx.Port)
	website.RegisterHandlers(ctx)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", ctx.Port), nil))
}
