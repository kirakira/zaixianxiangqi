package website

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func forkGame(ctx Context, user *datastore.Key, parentGame *datastore.Key, initialState *string, forkedMoveCount int, newMoves string, useRed bool) string {
	var gid string
	for {
		gid = generateRandomString(6)
		game := Game{
			Key:          datastore.NameKey("Game", gid, nil),
			Description:  fmt.Sprintf("从%s创建的分支棋局", parentGame.Name),
			InitialState: initialState,
			Moves:        newMoves,
			GameFork: &GameFork{
				ParentGame:      parentGame,
				ForkedMoveCount: forkedMoveCount,
			},
		}
		if useRed {
			game.Red = user
		} else {
			game.Black = user
		}
		updateActivityTime(user, &game)
		if insertGameIfNotExists(ctx, &game) {
			break
		} else {
			log.Printf("forkGame race condition detected: trying to insert gid %s", gid)
		}
	}
	return gid
}

func forkPage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	re := regexp.MustCompile(`^/fork/([^/]+)/([^/]+)$`)
	re_matches := re.FindStringSubmatch(r.URL.Path)
	if len(re_matches) < 3 {
		http.Error(w, "Not found.", http.StatusNotFound)
		return
	}

	gid := re_matches[1]
	game := getGame(ctx, gid)
	if game == nil {
		http.Error(w, "bad game id", http.StatusNotFound)
		return
	}
	forkedMoveCountString := re_matches[2]
	forkedMoveCount, err := strconv.Atoi(forkedMoveCountString)
	if err != nil {
		http.Error(w, "bad move count", http.StatusBadRequest)
		return
	}

	userSession := getOrCreateUser(ctx, GetFirstCookieOrDefault(r.Cookie("uid")), GetFirstCookieOrDefault(r.Cookie("sid")))
	SetNoCache(w)
	setUidSidInCookie(w, userSession)
	SetPlainTextContent(w)

	var moveStrings []string
	for _, moveString := range strings.Split(game.Moves, "/") {
		_, err := ParseNumericMove(moveString)
		if err != nil {
			continue
		}
		moveStrings = append(moveStrings, moveString)
	}
	if forkedMoveCount < 0 || forkedMoveCount > len(moveStrings) {
		http.Error(w, "move count out of range", http.StatusBadRequest)
		return
	}

	moveStrings = moveStrings[0:forkedMoveCount]
	board := buildBoardFromTrustedMoves(moveStrings, game.InitialState)
	if board.IsLosing() {
		http.Error(w, fmt.Sprintf("the game is already ended at move %d", forkedMoveCount), http.StatusBadRequest)
		return
	}
	for i := 0; i < len(moveStrings); i++ {
		moveStrings[i] = "/" + moveStrings[i]
	}
	newMoves := strings.Join(moveStrings, "") + declareGameResult(board)

	var useRed bool
	if game.Red != nil && *game.Red == *userSession.User {
		useRed = true
	} else if game.Black != nil && *game.Black == *userSession.User {
		useRed = false
	} else {
		useRed = rand.Intn(2) == 0
	}

	newGid := forkGame(ctx, userSession.User, game.Key, game.InitialState, forkedMoveCount, newMoves, useRed)
	http.Redirect(w, r, "/game/"+newGid, http.StatusFound)
}
