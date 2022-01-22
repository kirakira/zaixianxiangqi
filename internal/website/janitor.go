package website

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func min(x, y int) int {
	if x < y {
		return x
	}
	return y
}

func divideIntoBatches(keys []*datastore.Key) [][]*datastore.Key {
	const maxBatchSize int = 500

	var batches [][]*datastore.Key
	for len(keys) > 0 {
		batchSize := min(maxBatchSize, len(keys))
		batches = append(batches, keys[:batchSize])
		keys = keys[batchSize:]
	}

	return batches
}

func removeEmptyGames(ctx Context, date_ub time.Time) {
	q := datastore.NewQuery("Game").Filter("DerivedData.Status = ", int(Waiting)).Filter("DerivedData.LastActivity <= ", date_ub)

	var games []Game
	_, err := ctx.Client.GetAll(ctx.Ctx, q, &games)
	if err != nil {
		log.Fatalf("Failed to query for past games: %v", err)
	}
	browsedCnt := 0
	removedCnt := 0

	var keys []*datastore.Key
	pred := func(game *Game) bool {
		return game.Red == nil || game.Black == nil
	}
	for _, game := range games {
		browsedCnt += 1
		if pred(&game) {
			keys = append(keys, game.Key)
		}
	}

	for _, batch := range divideIntoBatches(keys) {
		pendingDelete := 0
		if _, err := ctx.Client.RunInTransaction(ctx.Ctx, func(tx *datastore.Transaction) error {
			pendingDelete = 0
			games := make([]*Game, len(batch))
			if err := tx.GetMulti(batch, games); err != nil {
				return err
			}
			var keys []*datastore.Key
			for _, game := range games {
				if pred(game) {
					keys = append(keys, game.Key)
				}
			}
			if len(keys) == 0 {
				return nil
			}
			pendingDelete = len(keys)
			return tx.DeleteMulti(keys)
		}); err == nil {
			removedCnt += pendingDelete
		} else {
			log.Printf("failed to delete: %v", err)
		}
	}
	log.Printf("janitor GCed %d games after browsing %d", removedCnt, browsedCnt)
}

func janitorPage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}
	if _, ok := r.Header["X-Appengine-Cron"]; !ok {
		http.Error(w, "Not cron.", http.StatusNotFound)
		return
	}

	log.Println("janitor starting")

	duration_2d, err := time.ParseDuration(fmt.Sprintf("%dh", 24*2))
	if err != nil {
		log.Fatalf("failed to parse duration: %v", err)
	}
	date_ub := time.Now().Add(-duration_2d)
	removeEmptyGames(ctx, date_ub)
}
