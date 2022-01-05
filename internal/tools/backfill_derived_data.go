package tools

import (
	"log"
	"os"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func getAllKeys(ctx Context, kind string) []*datastore.Key {
	q := datastore.NewQuery(kind).KeysOnly()
	keys, err := ctx.Client.GetAll(ctx.Ctx, q, nil)
	if err != nil {
		log.Fatalf("Failed to get all keys: %v", err)
	}
	return keys
}

func backfillDerivedGameData(ctx Context) bool {
	numUpdated := 0
	success := false
	i := 0
	for ; i < 10; i++ {
		// Scanning all rows instead of querying for rows with outdated versions
		// because datastore queries will not return a row when the row doesn't
		// contain the field being queried over.
		keys := getAllKeys(ctx, "Game")
		log.Printf("Retrieved %d keys", len(keys))

		failedUpdate := 0
		for i, key := range keys {
			log.Printf("Processing %d of %d", i+1, len(keys))
			needUpdate := false
			if _, err := ctx.Client.RunInTransaction(ctx.Ctx, func(tx *datastore.Transaction) error {
				var game Game
				if err := tx.Get(key, &game); err != nil {
					return err
				}
				if game.DerivedData.Version >= DerivedGameDataVersion {
					return nil
				}
				needUpdate = true
				return StoreGame(tx, key, &game)
			}); err != nil {
				failedUpdate++
				log.Printf("Transaction failed on game %v: %v. Will retry.", key, err)
			} else if needUpdate {
				numUpdated++
			}
		}

		if failedUpdate == 0 {
			success = true
			break
		}
	}
	if success {
		log.Printf("Backfill game data succeeded. Updated %d entities.", numUpdated)
	} else {
		log.Printf("Backfill game data failed after %d attempts. Updated %d entities.", i, numUpdated)
	}
	return success
}

func BackfillDerivedData(ctx Context) {
	if !backfillDerivedGameData(ctx) {
		os.Exit(1)
	}
}
