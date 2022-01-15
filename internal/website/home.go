package website

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"

	. "github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/web"
)

func homePage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	userSession := getOrCreateUser(ctx, GetFirstCookieOrDefault(r.Cookie("uid")), GetFirstCookieOrDefault(r.Cookie("sid")))
	SetNoCache(w)
	setUidSidInCookie(w, userSession)

	var inProgress GameStatus = InProgress
	var waiting GameStatus = Waiting
	userKey := userSession.User

	t := web.GetWebPageTemplate("home.html")
	if err := t.Execute(w, struct {
		JsCode        template.JS
		MyRecentGames []UserGameSummary
		WaitingGames  []GameSummary
		StartedGames  []GameSummary
	}{
		JsCode: template.JS(fmt.Sprintf(
			"var myUid = '%s', myName = '%s';",
			strconv.FormatInt(userSession.User.ID, 10), getUserName(ctx, userSession.User))),
		MyRecentGames: toUserGameSummaries(userKey, fetchGameSummaries(ctx, getRecentGames(ctx, userSession.User, &inProgress, 10))),
		WaitingGames:  fetchGameSummaries(ctx, getRecentGames(ctx, nil, &waiting, 10)),
		StartedGames:  fetchGameSummaries(ctx, getRecentGames(ctx, nil, &inProgress, 10)),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}
