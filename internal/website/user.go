package website

import (
	"html/template"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

type RecentGameInfo struct {
	GameId         string
	CreatedTimeAgo string
	Color          string
	Opponent       string
	OpponentUid    string
	Moves          int
	Status         string
}

func fetchRecentGameInfo(ctx Context, user *datastore.Key) []RecentGameInfo {
	var games []RecentGameInfo

	now := time.Now()
	recentGames := getRecentGames(ctx, user, 10)
	for _, gameKey := range recentGames {
		game := getGame(ctx, gameKey.Name)
		if game == nil {
			log.Printf("Unable to read game %v", gameKey)
			continue
		}

		oneSecond, err := time.ParseDuration("1s")
		if err != nil {
			log.Fatalf("can't parse one-second")
		}
		createdAgo := now.Sub(game.Creation).Truncate(oneSecond)

		userSide := ""
		color := ""
		var opponentKey *datastore.Key
		if *game.Red == *user {
			userSide = "R"
			color = "Red"
			opponentKey = game.Black
		} else {
			userSide = "B"
			color = "Black"
			opponentKey = game.Red
		}

		var opponent *User
		if opponentKey != nil {
			opponent = getUser(ctx, opponentKey)
		}

		opponentName := ""
		opponentUid := ""
		if opponent != nil {
			opponentName = opponent.Name
			opponentUid = strconv.FormatInt(opponentKey.ID, 10)
		}

		status := ""
		if gameHasEnded(game) {
			if game.Moves[len(game.Moves)-1:] == userSide {
				status = "Win"
			} else {
				status = "Loss"
			}
		} else if opponent != nil {
			status = "In progress"
		} else {
			status = "Waiting"
		}

		games = append(games, RecentGameInfo{
			GameId:         gameKey.Name,
			CreatedTimeAgo: createdAgo.String() + " ago",
			Color:          color,
			Opponent:       opponentName,
			OpponentUid:    opponentUid,
			Moves:          strings.Count(game.Moves, "/"),
			Status:         status,
		})
	}
	return games
}

func userPage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	re := regexp.MustCompile(`^/user/([-]?\d+)$`)
	re_matches := re.FindStringSubmatch(r.URL.Path)
	if len(re_matches) < 2 {
		http.Error(w, "Missing or malformed user id provided.", http.StatusBadRequest)
		return
	}

	SetNoCache(w)
	userKey := constructKeyFromId("User", re_matches[1])
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

	t := template.Must(template.ParseFiles("web/user.html"))
	if err := t.Execute(w, struct {
		PlayerId    string
		PlayerName  string
		UserName    string
		GamesPlayed int
		RecentGames []RecentGameInfo
	}{
		PlayerId:    strconv.FormatInt(userSession.User.ID, 10),
		PlayerName:  getUserName(ctx, userSession.User),
		UserName:    user.Name,
		GamesPlayed: len(getAllGamesByUser(ctx, userKey)),
		RecentGames: fetchRecentGameInfo(ctx, userKey),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}
