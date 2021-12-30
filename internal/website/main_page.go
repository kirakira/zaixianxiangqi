package website

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func createGame(ctx Context, user *datastore.Key) *datastore.Key {
	username := getUserName(ctx, user)
	var gameKey *datastore.Key
	for {
		gid := generateRandomString(6)
		game := Game{
			Creation:    time.Now(),
			Description: fmt.Sprintf("%s创建的棋局", username),
			Key:         datastore.NameKey("Game", gid, nil),
		}
		if rand.Intn(2) == 0 {
			game.Red = user
		} else {
			game.Black = user
		}
		updateActivityTime(user, &game)
		if insertGameIfNotExists(ctx, &game) {
			gameKey = game.Key
			break
		} else {
			log.Printf("createGame race condition detected: trying to insert gid %s", gid)
		}
	}
	return gameKey
}

func createOrGetRecentGame(ctx Context, user *datastore.Key, force_create bool) *datastore.Key {
	var gameKey *datastore.Key
	if !force_create {
		recentGames := getRecentGames(ctx, user, 1)
		if len(recentGames) > 0 {
			gameKey = recentGames[0]
		}
	}
	if gameKey == nil {
		gameKey = createGame(ctx, user)
	}
	return gameKey
}

func mainPage(ctx Context, w http.ResponseWriter, r *http.Request, force_create_new_game bool) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	userSession := getOrCreateUser(ctx, GetFirstCookieOrDefault(r.Cookie("uid")), GetFirstCookieOrDefault(r.Cookie("sid")))
	SetNoCache(w)
	setUidSidInCookie(w, userSession)
	game := createOrGetRecentGame(ctx, userSession.User, force_create_new_game)
	http.Redirect(w, r, "/game/"+game.Name, http.StatusFound)
}
