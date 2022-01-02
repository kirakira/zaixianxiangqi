package website

import (
	"errors"
	"log"
	"net/http"
	"net/url"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func getOrCreateAIUser(ctx Context) *datastore.Key {
	q := datastore.NewQuery("User").Filter("AI = ", true).KeysOnly().Limit(1)
	keys, err := ctx.Client.GetAll(ctx.Ctx, q, nil)
	if err != nil {
		log.Fatalf("Failed to query for AI user: %v", err)
	}
	if len(keys) > 0 {
		return keys[0]
	} else {
		user := User{
			Name: "Blur",
			AI:   true,
		}
		aiKey, err := DatastorePutWithRetry(ctx.Client, ctx.Ctx,
			datastore.IncompleteKey("User", nil), &user, 5)
		if err != nil {
			log.Fatalf("Failed to create AI user: %v", err)
		}
		return aiKey
	}
}

func inviteAI(ctx Context, _ http.Header, form url.Values) (*Game, error) {
	userKey, additionalFields, err := validatePostRequest(ctx, http.Header{}, form, []string{"gid"})
	if err != nil {
		return nil, err
	}
	gid := additionalFields["gid"]

	aiUser := getOrCreateAIUser(ctx)
	if *aiUser == *userKey {
	}

	var resolvedGame *Game
	_, err = ctx.Client.RunInTransaction(ctx.Ctx, func(tx *datastore.Transaction) error {
		resolvedGame = nil

		var game Game
		if err := tx.Get(datastore.NameKey("Game", gid, nil), &game); err != nil {
			return err
		}
		resolvedGame = new(Game)
		*resolvedGame = game

		if !userInGame(userKey, &game) {
			return errors.New("user not in game")
		}

		if game.Red != nil && game.Black != nil {
			return errors.New("game already started")
		}

		if game.Red == nil {
			sit(aiUser, &game, "red")
		} else {
			sit(aiUser, &game, "black")
		}

		updateActivityTime(userKey, &game)
		updateActivityTime(aiUser, &game)
		if _, err := tx.Put(game.Key, &game); err != nil {
			return err
		}
		*resolvedGame = game
		return nil
	})

	if err != nil {
		return resolvedGame, err
	}

	maybePushAIMove(ctx, resolvedGame)

	return resolvedGame, err
}

func handleInviteAI(ctx Context, w http.ResponseWriter, r *http.Request) {
	postGameInfoAPIWrapper(ctx, w, r, inviteAI)
}
