package website

import (
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/web"
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

func newGameOptionsPage(ctx Context, w http.ResponseWriter, r *http.Request, userSession UserSession) {
	playerName := getUserName(ctx, userSession.User)

	t := web.GetWebPageTemplate("new.html")
	if err := t.Execute(w, struct {
		PlayerId   string
		PlayerName string
		JsCode     template.JS
	}{
		PlayerId:   strconv.FormatInt(userSession.User.ID, 10),
		PlayerName: playerName,
		JsCode: template.JS(fmt.Sprintf(
			"var myUid = '%s', myName = '%s';",
			strconv.FormatInt(userSession.User.ID, 10), playerName)),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}

func postNewGamePage(ctx Context, w http.ResponseWriter, r *http.Request, userSession UserSession) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request form: %v", err), http.StatusBadRequest)
		return
	}

	log.Printf("%v", r.Form)

	game := createGame(ctx, userSession.User)
	http.Redirect(w, r, "/game/"+game.Name, http.StatusFound)
}

func newPage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET" || r.Method == "POST") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	SetNoCache(w)
	userSession := getOrCreateUser(ctx, GetFirstCookieOrDefault(r.Cookie("uid")), GetFirstCookieOrDefault(r.Cookie("sid")))
	setUidSidInCookie(w, userSession)

	if r.Method == "" || r.Method == "GET" {
		newGameOptionsPage(ctx, w, r, userSession)
	} else {
		postNewGamePage(ctx, w, r, userSession)
	}
}
