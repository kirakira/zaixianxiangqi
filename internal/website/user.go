package website

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"regexp"
	"strconv"

	. "github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/web"
)

func userPage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	re := regexp.MustCompile(`^/user/([-]?\d+)$`)
	reMatches := re.FindStringSubmatch(r.URL.Path)
	if len(reMatches) < 2 {
		http.Error(w, "Missing or malformed user id provided.", http.StatusBadRequest)
		return
	}

	SetNoCache(w)
	uid := reMatches[1]
	userKey := constructKeyFromId("User", uid)
	if userKey == nil {
		http.Error(w, "Bad user id.", http.StatusBadRequest)
		return
	}

	user := getUser(ctx, userKey)
	if user == nil {
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	userSession := getOrCreateUser(ctx, GetFirstCookieOrDefault(r.Cookie("uid")), GetFirstCookieOrDefault(r.Cookie("sid")))
	setUidSidInCookie(w, userSession)

	recentGameKeys := getRecentGames(ctx, userSession.User, nil, 10)

	t := web.GetWebPageTemplate("user.html")
	if err := t.Execute(w, struct {
		UserId      string
		UserName    string
		JsCode      template.JS
		GamesPlayed int
		RecentGames []UserGameSummary
	}{
		UserId:   uid,
		UserName: user.Name,
		JsCode: template.JS(fmt.Sprintf(
			"var myUid = '%s', myName = '%s';",
			strconv.FormatInt(userSession.User.ID, 10), getUserName(ctx, userSession.User))),
		GamesPlayed: len(getAllGamesByUser(ctx, userKey)),
		RecentGames: toUserGameSummaries(userKey, fetchGameSummaries(ctx, recentGameKeys)),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}
