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

func createGameDescription(username string, handicaps *string) string {
	if handicaps == nil {
		return fmt.Sprintf("%s创建的棋局", username)
	} else {
		return fmt.Sprintf("%s创建的残疾棋局", username)
	}
}

func setInitialState(game *Game, handicaps *string) error {
	if handicaps == nil {
		return nil
	}

	config, found := HandicapConfigs[*handicaps]
	if !found {
		return fmt.Errorf("Invalid handicap mode %s", *handicaps)
	}

	game.InitialState = &config.Fen
	return nil
}

func createGame(ctx Context, user *datastore.Key, handicaps *string) *datastore.Key {
	username := getUserName(ctx, user)
	var gameKey *datastore.Key
	for {
		gid := generateRandomString(6)
		game := Game{
			Creation:    time.Now(),
			Description: createGameDescription(username, handicaps),
			Key:         datastore.NameKey("Game", gid, nil),
		}
		if err := setInitialState(&game, handicaps); err != nil {
			return nil
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
		PlayerId        string
		PlayerName      string
		JsCode          template.JS
		HandicapConfigs map[string]HandicapConfig
	}{
		PlayerId:   strconv.FormatInt(userSession.User.ID, 10),
		PlayerName: playerName,
		JsCode: template.JS(fmt.Sprintf(
			"var myUid = '%s', myName = '%s';",
			strconv.FormatInt(userSession.User.ID, 10), playerName)),
		HandicapConfigs: HandicapConfigs,
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}

func postNewGamePage(ctx Context, w http.ResponseWriter, r *http.Request, userSession UserSession) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request form: %v", err), http.StatusBadRequest)
		return
	}

	mode := GetFormValue(r.Form, "game_mode")
	if mode != nil && *mode == "standard" {
		gameKey := createGame(ctx, userSession.User, nil)
		http.Redirect(w, r, "/game/"+gameKey.Name, http.StatusFound)
	} else if mode != nil && *mode == "handicapped" {
		handicaps := GetFormValue(r.Form, "handicaps")
		if handicaps == nil {
			http.Error(w, fmt.Sprintf("Invalid handicap mode"), http.StatusBadRequest)
		} else {
			gameKey := createGame(ctx, userSession.User, handicaps)
			if gameKey != nil {
				http.Redirect(w, r, "/game/"+gameKey.Name, http.StatusFound)
			} else {
				http.Error(w, fmt.Sprintf("Invalid handicap mode"), http.StatusBadRequest)
			}
		}
	} else {
		http.Error(w, fmt.Sprintf("Invalid game mode"), http.StatusBadRequest)
	}
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
