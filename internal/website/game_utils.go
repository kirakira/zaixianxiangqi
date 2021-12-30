package website

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
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
	if gameHasEnded(game) {
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
	updateNextToMove(game)
	return nil
}

func updateNextToMove(game *Game) {
	if game.Red == nil || game.Black == nil {
		game.NextToMove = nil
	} else if gameHasEnded(game) {
		game.NextToMove = nil
	} else if len(strings.Split(game.Moves, "/"))%2 == 1 {
		game.NextToMove = game.Red
	} else {
		game.NextToMove = game.Black
	}
}

func gameHasEnded(game *Game) bool {
	return strings.HasSuffix(game.Moves, "R") || strings.HasSuffix(game.Moves, "B")
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
			if _, err := tx.Put(game.Key, game); err != nil {
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

func getRecentGames(ctx Context, user *datastore.Key, count int) []*datastore.Key {
	type GameAndCreation struct {
		gameKey  *datastore.Key
		creation time.Time
	}
	var games []GameAndCreation

	for _, role := range []string{"Red", "Black"} {
		q := datastore.NewQuery("Game").Filter(role+" = ", user).Order("-Creation").Limit(count)
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
