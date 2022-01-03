package website

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"regexp"
	"strconv"

	. "github.com/kirakira/zaixianxiangqi/internal"
)

func gamePage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	re := regexp.MustCompile(`^/game/([^/]+)$`)
	re_matches := re.FindStringSubmatch(r.URL.Path)
	if len(re_matches) < 2 {
		http.Error(w, "Not found.", http.StatusNotFound)
		return
	}

	SetNoCache(w)
	gid := re_matches[1]
	game := getGame(ctx, gid)
	if game == nil {
		http.Error(w, "bad game id", http.StatusNotFound)
		return
	}

	userSession := getOrCreateUser(ctx, GetFirstCookieOrDefault(r.Cookie("uid")), GetFirstCookieOrDefault(r.Cookie("sid")))
	setUidSidInCookie(w, userSession)
	playerName := getUserName(ctx, userSession.User)

	t := template.Must(template.ParseFiles("web/game.html"))
	if err := t.Execute(w, struct {
		PlayerId   string
		PlayerName string
		JsCode     template.JS
		GameTitle  string
		GameId     string
	}{
		PlayerId:   strconv.FormatInt(userSession.User.ID, 10),
		PlayerName: playerName,
		JsCode: template.JS(fmt.Sprintf(
			"var currentGameId = '%s', myUid = '%s', myName = '%s', gameInfo = JSON.parse('%s');",
			gid, strconv.FormatInt(userSession.User.ID, 10), playerName, getGameInfoJs(ctx, game))),
		GameTitle: game.Description,
		GameId:    gid,
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}
