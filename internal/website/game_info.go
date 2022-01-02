package website

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"

	"cloud.google.com/go/datastore"
	"cloud.google.com/go/pubsub"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func makeMove(game *Game, redSide bool, newMovesString string) error {
	oldMoves := strings.Split(game.Moves, "/")
	newMoves := strings.Split(newMovesString, "/")
	if len(newMoves) != len(oldMoves)+1 {
		return errors.New("new moves is not based on old moves")
	}
	for i := 0; i < len(oldMoves); i++ {
		if newMoves[i] != oldMoves[i] {
			return errors.New("new moves diverged from old moves")
		}
	}

	if gameHasEnded(game) {
		return errors.New("game has ended")
	}
	b := buildBoardFromTrustedMoves(oldMoves)
	newMoveString := newMoves[len(newMoves)-1]
	if newMoveString == "R" || newMoveString == "B" {
		// Resignation.
		if (redSide && newMoveString == "R") || (!redSide && newMoveString == "B") {
			return errors.New("user cannot declare result for the opponent")
		}
	} else {
		newMove, err := ParseNumericMove(newMoveString)
		if err != nil {
			return errors.New(fmt.Sprintf("malformed move: %s", newMoveString))
		}
		if redSide != b.RedToGo {
			return errors.New(fmt.Sprintf("player is not in move: expected red %v actual red %v", b.RedToGo, redSide))
		}
		if !b.CheckedMove(newMove) {
			return errors.New(fmt.Sprintf("invalid move: %s", newMoveString))
		}
		newMovesString += declareGameResult(b)
	}

	game.Moves = newMovesString
	updateNextToMove(game)
	return nil
}

func newString(v string) *string {
	s := new(string)
	*s = v
	return s
}

func newInt64(v int64) *int64 {
	p := new(int64)
	*p = v
	return p
}

func maybePushAIMove(ctx Context, game *Game) {
	if game.NextToMove == nil {
		return
	}
	nextMoveUser := getUser(ctx, game.NextToMove)
	if !nextMoveUser.AI {
		return
	}

	client, err := pubsub.NewClient(ctx.Ctx, ctx.ProjectID)
	if err != nil {
		log.Fatalf("Failed to create pubsub client: %v", err)
	}

	gameToPlay := GameToPlay{
		Uid:   newInt64(nextMoveUser.Key.ID),
		Gid:   newString(game.Key.Name),
		Moves: newString(game.Moves),
		// CallbackUrl: newString("https://20200301t161432-dot-zaixianxiangqi4.appspot.com"),
	}
	jsonEncoded, err := json.Marshal(gameToPlay)
	if err != nil {
		log.Fatal("Failed to json encode GameToPlay: %v", err)
	}

	t := client.Topic(topicID)
	result := t.Publish(ctx.Ctx, &pubsub.Message{
		Data: []byte(jsonEncoded),
	})

	// Block until the result is returned and a server-generated
	// ID is returned for the published message.
	id, err := result.Get(ctx.Ctx)
	if err != nil {
		log.Printf("Failed to get result from Publish: %v", err)
		return
	}
	log.Printf("Published play-ai-move message; msg ID: %v\n", id)
}

func updateGame(ctx Context, header http.Header, form url.Values) (*Game, error) {
	userKey, additionalFields, err := validatePostRequest(ctx, header, form, []string{"gid"})
	if err != nil {
		return nil, err
	}
	gid := additionalFields["gid"]

	var resolvedGame *Game
	_, err = ctx.Client.RunInTransaction(ctx.Ctx, func(tx *datastore.Transaction) error {
		operated := false
		resolvedGame = nil

		var game Game
		if err := tx.Get(datastore.NameKey("Game", gid, nil), &game); err != nil {
			return err
		}
		resolvedGame = new(Game)
		*resolvedGame = game

		if seat := GetFormValue(form, "sit"); seat != nil {
			operated = true
			if err := sit(userKey, &game, *seat); err != nil {
				return err
			}
		}
		if moves := GetFormValue(form, "moves"); moves != nil {
			operated = true
			if !userInGame(userKey, &game) {
				return errors.New("User not in game")
			}
			if game.Red == nil || game.Black == nil {
				return errors.New("Game not started")
			}
			redSide := true
			if *userKey == *game.Black {
				redSide = false
			}
			if err := makeMove(&game, redSide, *moves); err != nil {
				return err
			}
		}

		if !operated {
			return errors.New("No operation specified")
		} else {
			updateActivityTime(userKey, &game)
			if _, err := tx.Put(game.Key, &game); err != nil {
				return err
			}
			*resolvedGame = game
			return nil
		}
	})

	if err != nil {
		return resolvedGame, err
	}

	maybePushAIMove(ctx, resolvedGame)

	return resolvedGame, err
}

func gameInfoAPI(ctx Context, w http.ResponseWriter, r *http.Request) {
	if r.Method == "" || r.Method == "GET" {
		getGameInfo(ctx, w, r)
		return
	} else if r.Method == "POST" {
		postGameInfoAPIWrapper(ctx, w, r, updateGame)
	} else {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
	}
}
