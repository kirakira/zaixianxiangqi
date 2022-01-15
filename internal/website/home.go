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

	myRecentGames := make(chan []UserGameSummary, 1)
	go func() {
		myRecentGames <- toUserGameSummaries(userKey, fetchGameSummaries(ctx, getRecentGames(ctx, userSession.User, &inProgress, 10)))
	}()
	waitingGames := make(chan []GameSummary, 1)
	go func() {
		waitingGames <- fetchGameSummaries(ctx, getRecentGames(ctx, nil, &waiting, 10))
	}()
	startedGames := make(chan []GameSummary, 1)
	go func() {
		startedGames <- fetchGameSummaries(ctx, getRecentGames(ctx, nil, &inProgress, 10))
	}()

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
		MyRecentGames: <-myRecentGames,
		WaitingGames:  <-waitingGames,
		StartedGames:  <-startedGames,
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}
