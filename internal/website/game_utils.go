package website

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func declareGameResult(board *Board) string {
	if board.IsLosing() {
		if board.RedToGo {
			return "/B"
		} else {
			return "/R"
		}
	} else {
		return ""
	}
}

func buildBoardFromTrustedMoves(moves []string) *Board {
	board := MakeInitialBoard()
	for _, moveString := range moves {
		if moveString == "" {
			continue
		}
		move, err := ParseNumericMove(moveString)
		if err != nil {
			log.Fatalf("unknown move: %v", moveString)
		}
		board.Move(move)
	}
	return board
}

func userInGame(userKey *datastore.Key, game *Game) bool {
	return (game.Red != nil && *game.Red == *userKey) || (game.Black != nil && *game.Black == *userKey)
}

func sit(userKey *datastore.Key, game *Game, side string) error {
	if GameHasEnded(game) {
		return errors.New("cannot sit on a finished game")
	} else if side == "red" {
		if game.Red == nil {
			game.Red = userKey
			if game.Black != nil && *game.Black == *userKey {
				game.Black = nil
				game.BlackActivity = nil
			}
		} else {
			return errors.New("red has been taken")
		}
	} else if side == "black" {
		if game.Black == nil {
			game.Black = userKey
			if game.Red != nil && *game.Red == *userKey {
				game.Red = nil
				game.RedActivity = nil
			}
		} else {
			return errors.New("black has been taken")
		}
	} else {
		return errors.New("unknown side to sit")
	}
	return nil
}

func convertToGameInfo(ctx Context, game *Game) *GameInfo {
	gameinfo := GameInfo{
		ID:    game.Key.Name,
		Title: game.Description,
		Moves: game.Moves,
	}
	if game.Red != nil {
		gameinfo.Red = &PlayerInfo{
			ID:   strconv.FormatInt(game.Red.ID, 10),
			Name: getUserName(ctx, game.Red),
		}
	}
	if game.Black != nil {
		gameinfo.Black = &PlayerInfo{
			ID:   strconv.FormatInt(game.Black.ID, 10),
			Name: getUserName(ctx, game.Black),
		}
	}
	return &gameinfo
}

func getGameInfoJs(ctx Context, game *Game) []byte {
	encoded, err := json.Marshal(*convertToGameInfo(ctx, game))
	if err != nil {
		log.Fatalf("Failed to convert gameinfo to json: %v", err)
	}
	return encoded
}

func getGameInfo(ctx Context, w http.ResponseWriter, r *http.Request) {
	SetPlainTextContent(w)
	SetNoCache(w)

	if err := r.ParseForm(); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request form: %v", err), http.StatusBadRequest)
		return
	}

	gid := GetFormValue(r.Form, "gid")
	if gid == nil {
		http.Error(w, "Missing 'gid'.", http.StatusBadRequest)
		return
	}

	game := getGame(ctx, *gid)
	if game == nil {
		http.Error(w, "Bad gid.", http.StatusNotFound)
		return
	}

	w.Write(getGameInfoJs(ctx, game))
}

func getGame(ctx Context, gid string) *Game {
	if len(gid) == 0 {
		return nil
	}
	var game Game
	if err := ctx.Client.Get(ctx.Ctx, datastore.NameKey("Game", gid, nil), &game); err != nil {
		if err == datastore.ErrNoSuchEntity {
			return nil
		} else {
			log.Fatalf("Failed to get game: %v", err)
		}
	}
	return &game
}

func insertGameIfNotExists(ctx Context, game *Game) bool {
	if _, err := ctx.Client.RunInTransaction(ctx.Ctx, func(tx *datastore.Transaction) error {
		if err := tx.Get(game.Key, &Game{}); err != nil {
			if err := StoreGame(tx, game.Key, game); err != nil {
				return err
			} else {
				return nil
			}
		} else {
			return errors.New("Game already exists")
		}
	}); err != nil {
		return false
	} else {
		return true
	}
}

func updateActivityTime(user *datastore.Key, game *Game) {
	t := time.Now()
	if game.Red != nil && *game.Red == *user {
		game.RedActivity = &t
	}
	if game.Black != nil && *game.Black == *user {
		game.BlackActivity = &t
	}
}

func getAllGamesByUser(ctx Context, user *datastore.Key) []*datastore.Key {
	var games []*datastore.Key
	for _, role := range []string{"Red", "Black"} {
		q := datastore.NewQuery("Game").Filter(role+" = ", user).KeysOnly()
		keys, err := ctx.Client.GetAll(ctx.Ctx, q, nil)
		if err != nil {
			log.Fatalf("Failed to query for recent games: %v", err)
		}
		for _, gameKey := range keys {
			games = append(games, gameKey)
		}
	}
	return games
}

func getRecentGames(ctx Context, user *datastore.Key, status *GameStatus, started *bool, count int) []*datastore.Key {
	type GameAndCreation struct {
		gameKey  *datastore.Key
		creation time.Time
	}
	var games []GameAndCreation

	var userFieldFilter []string
	if user != nil {
		userFieldFilter = []string{"Red", "Black"}
	} else {
		userFieldFilter = []string{""}
	}

	for _, role := range userFieldFilter {
		q := datastore.NewQuery("Game")
		if len(role) > 0 {
			q = q.Filter(role+" = ", user)
		}
		if status != nil {
			q = q.Filter("DerivedData.Status = ", int(*status))
		}
		if started != nil {
			q = q.Filter("DerivedData.Started = ", *started)
		}
		q = q.Order("-DerivedData.LastActivity").Limit(count)
		var retrievedGames []Game
		_, err := ctx.Client.GetAll(ctx.Ctx, q, &retrievedGames)
		if err != nil {
			log.Fatalf("Failed to query for recent games: %v", err)
		}
		for _, game := range retrievedGames {
			games = append(games, GameAndCreation{
				gameKey:  game.Key,
				creation: game.Creation,
			})
		}
	}
	// Sort the games by creation time, since they are pieced together from two sources.
	sort.Slice(games, func(i, j int) bool { return games[i].creation.After(games[j].creation) })
	if len(games) > count {
		games = games[:count]
	}

	var gameKeys []*datastore.Key
	for _, g := range games {
		gameKeys = append(gameKeys, g.gameKey)
	}
	return gameKeys
}

func postGameInfoAPIWrapper(ctx Context, w http.ResponseWriter, r *http.Request, handler func(Context, http.Header, url.Values) (*Game, error)) {
	gameInfoHandler := func(ctx Context, headers http.Header, v url.Values) interface{} {
		game, err := handler(ctx, headers, v)
		var response GameInfoResponse
		if err != nil {
			response.Status = "fail"
			log.Printf("Failed to update game info: %v", err)
		} else {
			response.Status = "success"
		}
		if game != nil {
			response.GameInfo = convertToGameInfo(ctx, game)
		}
		return &response
	}
	postAPIWrapper(ctx, w, r, gameInfoHandler)
}

type GameSummary struct {
	GameId          string
	ActivityTimeAgo string
	Red             *PlayerInfo
	Black           *PlayerInfo
	Moves           int
	Status          string
	NextToMove      *PlayerInfo
}

func toPlayerInfo(userKey *datastore.Key, usersCache []*User, userIdToIndex map[int64]int) *PlayerInfo {
	if userKey == nil {
		return nil
	}
	user := usersCache[userIdToIndex[userKey.ID]]
	var userName string
	if user != nil {
		userName = user.Name
	} else {
		userName = "???"
	}
	return &PlayerInfo{
		ID:   strconv.FormatInt(userKey.ID, 10),
		Name: userName,
	}
}

func fetchGameSummaries(ctx Context, gameKeys []*datastore.Key) []GameSummary {
	oneSecond, err := time.ParseDuration("1s")
	if err != nil {
		log.Fatalf("can't parse one-second")
	}

	now := time.Now()

	games := make([]Game, len(gameKeys))
	if len(gameKeys) > 0 {
		if err := ctx.Client.GetMulti(ctx.Ctx, gameKeys, games); err != nil {
			log.Printf("Unable to fetch game summaries: %v", err)
			return nil
		}
	}

	var userKeys []*datastore.Key
	userIdToIndex := make(map[int64]int)
	for _, game := range games {
		if game.Red != nil {
			_, ok := userIdToIndex[game.Red.ID]
			if !ok {
				userIdToIndex[game.Red.ID] = len(userKeys)
				userKeys = append(userKeys, game.Red)
			}
		}
		if game.Black != nil {
			_, ok := userIdToIndex[game.Black.ID]
			if !ok {
				userIdToIndex[game.Black.ID] = len(userKeys)
				userKeys = append(userKeys, game.Black)
			}
		}
	}
	users := make([]*User, len(userKeys))
	if len(userKeys) > 0 {
		if err := ctx.Client.GetMulti(ctx.Ctx, userKeys, users); err != nil {
			if merr, ok := err.(datastore.MultiError); ok {
				for i, err := range merr {
					if err != nil && err != datastore.ErrNoSuchEntity {
						log.Fatalf("Unable to fetch user %v: %v", userKeys[i], err)
					}
				}
			} else {
				log.Fatalf("Unable to fetch users: %v", err)
			}
		}
	}

	var summaries []GameSummary
	for _, game := range games {
		activityAgo := "n/a"
		if game.DerivedData.LastActivity != nil {
			activityAgo = now.Sub(*game.DerivedData.LastActivity).Truncate(oneSecond).String()
		}

		summaries = append(summaries, GameSummary{
			GameId:          game.Key.Name,
			ActivityTimeAgo: activityAgo + " ago",
			Red:             toPlayerInfo(game.Red, users, userIdToIndex),
			Black:           toPlayerInfo(game.Black, users, userIdToIndex),
			Moves:           strings.Count(game.Moves, "/"),
			Status:          game.DerivedData.Status.String(),
			NextToMove:      toPlayerInfo(game.DerivedData.NextToMove, users, userIdToIndex),
		})
	}
	return summaries
}

type UserGameSummary struct {
	GameId          string
	ActivityTimeAgo string
	Color           string
	Opponent        string
	OpponentUid     string
	Moves           int
	Status          string
	NextToMove      *PlayerInfo
}

func toUserGameSummaries(userKey *datastore.Key, gameSummaries []GameSummary) []UserGameSummary {
	userID := strconv.FormatInt(userKey.ID, 10)

	var userGameSummaries []UserGameSummary
	for _, summary := range gameSummaries {
		var color, opponent, opponentUid string
		if summary.Red != nil && userID == summary.Red.ID {
			color = "Red"
			if summary.Black != nil {
				opponent = summary.Black.Name
				opponentUid = summary.Black.ID
			}
		} else if summary.Black != nil && userID == summary.Black.ID {
			color = "Black"
			if summary.Red != nil {
				opponent = summary.Red.Name
				opponentUid = summary.Red.ID
			}
		}

		status := summary.Status
		if len(color) > 0 && strings.HasSuffix(status, "won") {
			if strings.HasPrefix(status, color) {
				status = "Win"
			} else {
				status = "Loss"
			}
		}

		userGameSummaries = append(userGameSummaries, UserGameSummary{
			GameId:          summary.GameId,
			ActivityTimeAgo: summary.ActivityTimeAgo,
			Color:           color,
			Opponent:        opponent,
			OpponentUid:     opponentUid,
			Moves:           summary.Moves,
			Status:          status,
			NextToMove:      summary.NextToMove,
		})
	}
	return userGameSummaries
}
