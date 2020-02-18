package tools

import (
	"log"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func ReadModels(ctx Context, root string, results interface{}) {
	q := datastore.NewQuery(root)
	_, err := ctx.Client.GetAll(ctx.Ctx, q, results)
	if err != nil {
		log.Fatalf("Failed to query games: %v", err)
	}
}

func readFromOld(ctx Context) ([]OldUser, []OldSession, []OldGame) {
	var oldUsers []OldUser
	ReadModels(ctx, "User", &oldUsers)
	log.Printf("Found %d old users", len(oldUsers))

	var oldSessions []OldSession
	ReadModels(ctx, "Session", &oldSessions)
	log.Printf("Found %d old sessions", len(oldSessions))

	var oldGames []OldGame
	ReadModels(ctx, "Game", &oldGames)
	log.Printf("Found %d old games", len(oldGames))

	return oldUsers, oldSessions, oldGames
}

func migrateUsers(ctx Context, oldUsers []OldUser) {
	var keys []*datastore.Key
	var values []interface{}
	for _, oldUser := range oldUsers {
		user := UserFromOldUser(&oldUser)
		keys = append(keys, user.Key)
		values = append(values, user)
	}
	batchPut(ctx, keys, values)
}

func migrateSessions(ctx Context, oldSessions []OldSession) {
	var keys []*datastore.Key
	var values []interface{}
	for _, oldSession := range oldSessions {
		session := SessionFromOldSession(&oldSession)
		keys = append(keys, session.Key)
		values = append(values, session)
	}
	batchPut(ctx, keys, values)
}

func migrateGames(ctx Context, oldGames []OldGame) {
	var keys []*datastore.Key
	var values []interface{}
	for _, oldGame := range oldGames {
		game := GameFromOldGame(&oldGame)
		keys = append(keys, game.Key)
		values = append(values, game)
	}
	batchPut(ctx, keys, values)
}

func min(x, y int) int {
	if x < y {
		return x
	}
	return y
}

func batchPut(ctx Context, keys []*datastore.Key, entities []interface{}) {
	maxBatchSize := 500
	cnt := 0
	total := len(keys)
	for len(keys) > 0 {
		batchSize := min(len(keys), maxBatchSize)
		keysThisBatch := keys[:batchSize]
		entitiesThisBatch := entities[:batchSize]
		cnt += batchSize

		log.Printf("Writing a batch of %d entities (%f%%)", batchSize, float64(cnt)*100/float64(total))
		_, err := ctx.Client.PutMulti(ctx.Ctx, keysThisBatch, entitiesThisBatch)
		if err != nil {
			for _, key := range keysThisBatch {
				log.Printf("%v", key)
			}
			log.Fatalf("Failed to put a batch: %v", err)
		}

		keys = keys[batchSize:]
		entities = entities[batchSize:]
	}
}

func MigrateDB(srcCtx, dstCtx Context) {
	oldUsers, oldSessions, oldGames := readFromOld(srcCtx)
	log.Printf("Migrating %d users", len(oldUsers))
	migrateUsers(dstCtx, oldUsers)
	log.Printf("Migrating %d sessions", len(oldSessions))
	migrateSessions(dstCtx, oldSessions)
	log.Printf("Migrating %d games", len(oldGames))
	migrateGames(dstCtx, oldGames)
}
