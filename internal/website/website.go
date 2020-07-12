package website

import (
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/datastore"
	"cloud.google.com/go/pubsub"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

const topicID string = "play-ai-move"
const blurURL string = "https://blur.zaixianxiangqi.com/play"

type UserSession struct {
	User    *datastore.Key
	Session *datastore.Key
}

func isSessionValid(ctx Context, sessionKey *datastore.Key) bool {
	if err := ctx.Client.Get(ctx.Ctx, sessionKey, &Session{}); err != nil {
		if err == datastore.ErrNoSuchEntity {
			return false
		} else {
			log.Fatalf("Failed to query for session: %v", err)
		}
	}
	return true
}

func createSessionForUser(ctx Context, user *datastore.Key) *datastore.Key {
	sessionKey, err := ctx.Client.Put(ctx.Ctx, datastore.IncompleteKey("Session",
		user), &Session{
		Creation: time.Now(),
	})
	if err != nil {
		log.Fatalf("Failed to create session for user %v: %v", user, err)
	}
	return sessionKey
}

func pickUserName() string {
	var names = [...]string{"养一狗", "猥男", "清晰知足", "周杰伦", "SlaveMunde", "zhaoweijie13", "啊啊啊", "大了", "巨大了", "求蠢", "求不蠢", "司马", "麻皮大意", "小地雷", "长考一秒", "將五进一", "缩了", "慌了", "窝心傌", "Excited!", "闷声发大财", "王猛日", "Kebe", "死妈达", "单小娟"}
	return names[rand.Intn(len(names))]
}

func createUser(ctx Context) UserSession {
	userKey, err := ctx.Client.Put(ctx.Ctx, datastore.IncompleteKey("User", nil), &User{
		Name: pickUserName(),
	})

	if err != nil {
		log.Fatalf("Failed to create user: %v", err)
	}

	return UserSession{
		User:    userKey,
		Session: createSessionForUser(ctx, userKey),
	}
}

func getMostRecentSession(ctx Context, user *datastore.Key) *datastore.Key {
	q := datastore.NewQuery("Session").Ancestor(user).Order("-Creation").KeysOnly().Limit(1)
	session_keys, err := ctx.Client.GetAll(ctx.Ctx, q, nil)
	if err != nil {
		log.Fatalf("Failed to query for the most recent sid: %v", err)
	}
	if len(session_keys) == 0 {
		log.Fatalf("User %v does not have a session", user)
	}
	return session_keys[0]
}

func getOrCreateUser(ctx Context, uid, sid string) UserSession {
	uidParsed, err := strconv.ParseInt(uid, 10, 64)
	if err != nil {
		uidParsed = 0
	}
	sidParsed, err := strconv.ParseInt(sid, 10, 64)
	if err != nil {
		sidParsed = 0
	}

	if uidParsed != 0 && sidParsed != 0 {
		userKey := datastore.IDKey("User", uidParsed, nil)
		sessionKey := datastore.IDKey("Session", sidParsed, userKey)
		if isSessionValid(ctx, sessionKey) {
			return UserSession{
				User:    userKey,
				Session: getMostRecentSession(ctx, userKey),
			}
		}
	}
	userSession := createUser(ctx)
	return userSession
}

func setNoCache(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
}

func setCookie(w http.ResponseWriter, name string, value string) {
	expire := time.Now().AddDate(100, 0, 0)
	cookie := http.Cookie{
		Name:    name,
		Value:   value,
		Path:    "/",
		Expires: expire,
	}
	http.SetCookie(w, &cookie)
}

func setUidSidInCookie(w http.ResponseWriter, userSession UserSession) {
	setCookie(w, "uid", strconv.FormatInt(userSession.User.ID, 10))
	setCookie(w, "sid", strconv.FormatInt(userSession.Session.ID, 10))
}

func getRecentGames(ctx Context, user *datastore.Key, count int) []*datastore.Key {
	type GameAndCreation struct {
		gameKey  *datastore.Key
		creation time.Time
	}
	var games []GameAndCreation

	for _, role := range []string{"Red", "Black"} {
		q := datastore.NewQuery("Game").Filter(role+" = ", user).Order("-Creation").Limit(count)
		var retrieved_games []Game
		_, err := ctx.Client.GetAll(ctx.Ctx, q, &retrieved_games)
		if err != nil {
			log.Fatalf("Failed to query for recent games: %v", err)
		}
		for _, game := range retrieved_games {
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

func generateRandomString(length int) string {
	alphabet := "abcdefghijkmnpqrstuvwxyz"
	ret := make([]byte, length)
	for i := range ret {
		ret[i] = alphabet[rand.Intn(len(alphabet))]
	}
	return string(ret)
}

func getUser(ctx Context, userKey *datastore.Key) *User {
	var user User
	if err := ctx.Client.Get(ctx.Ctx, userKey, &user); err != nil {
		return nil
	}
	return &user
}

func getUserName(ctx Context, userKey *datastore.Key) string {
	user := getUser(ctx, userKey)
	if user == nil {
		return "烫烫烫"
	} else {
		return user.Name
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

func createGame(ctx Context, user *datastore.Key) *datastore.Key {
	username := getUserName(ctx, user)
	var gameKey *datastore.Key
	for {
		gid := generateRandomString(6)
		game := Game{
			Creation:    time.Now(),
			Description: fmt.Sprintf("%s创建的棋局", username),
			Key:         datastore.NameKey("Game", gid, nil),
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

func createOrGetRecentGame(ctx Context, user *datastore.Key, force_create bool) *datastore.Key {
	var gameKey *datastore.Key
	if !force_create {
		recentGames := getRecentGames(ctx, user, 1)
		if len(recentGames) > 0 {
			gameKey = recentGames[0]
		}
	}
	if gameKey == nil {
		gameKey = createGame(ctx, user)
	}
	return gameKey
}

func getFirstOrDefault(cookie *http.Cookie, err error) string {
	if err != nil || len(cookie.Value) == 0 {
		return ""
	} else {
		return cookie.Value
	}
}

func mainPage(ctx Context, w http.ResponseWriter, r *http.Request, force_create_new_game bool) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	userSession := getOrCreateUser(ctx, getFirstOrDefault(r.Cookie("uid")), getFirstOrDefault(r.Cookie("sid")))
	setNoCache(w)
	setUidSidInCookie(w, userSession)
	game := createOrGetRecentGame(ctx, userSession.User, force_create_new_game)
	http.Redirect(w, r, "/game/"+game.Name, http.StatusFound)
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

func gamePage(ctx Context, t *template.Template, w http.ResponseWriter, r *http.Request) {
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

	setNoCache(w)
	gid := re_matches[1]
	game := getGame(ctx, gid)
	if game == nil {
		http.Error(w, "bad game id", http.StatusNotFound)
		return
	}

	userSession := getOrCreateUser(ctx, getFirstOrDefault(r.Cookie("uid")), getFirstOrDefault(r.Cookie("sid")))
	setUidSidInCookie(w, userSession)

	if err := t.Execute(w, struct {
		PlayerName string
		JsCode     template.JS
		GameTitle  string
		GameId     string
	}{
		PlayerName: getUserName(ctx, userSession.User),
		JsCode: template.JS(fmt.Sprintf(
			"var currentGameId = '%s', myUid = '%s', gameInfo = JSON.parse('%s');",
			gid, strconv.FormatInt(userSession.User.ID, 10), getGameInfoJs(ctx, game))),
		GameTitle: game.Description,
		GameId:    gid,
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}

func maybeServeStaticFiles() {
	// Serve static files (CSS & JS) only in local environment. They will be
	// handled by app.yaml in App Engine runtime.
	if _, local := os.LookupEnv("DATASTORE_EMULATOR_HOST"); local {
		log.Printf("Local environment; serving static files.")
		ServeStaticFiles()
	}
}

func setPlainTextContent(w http.ResponseWriter) {
	w.Header().Add("Content-Type", "text/plain; charset=utf-8")
}

func getGameInfo(ctx Context, w http.ResponseWriter, r *http.Request) {
	setPlainTextContent(w)
	setNoCache(w)

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

func uidToUserKey(uid string) *datastore.Key {
	uidParsed, err := strconv.ParseInt(uid, 10, 64)
	if err != nil {
		return nil
	}
	return datastore.IDKey("User", uidParsed, nil)
}

func validateSid(ctx Context, uid, sid string) *datastore.Key {
	userKey := uidToUserKey(uid)
	if userKey == nil {
		return nil
	}

	sidParsed, err := strconv.ParseInt(sid, 10, 64)
	if err != nil {
		return nil
	}
	sessionKey := datastore.IDKey("Session", sidParsed, userKey)

	if !isSessionValid(ctx, sessionKey) {
		return nil
	}

	return userKey
}

func isWhiteListedEmail(email string) bool {
	return email == "engine-server@zaixianxiangqi4.iam.gserviceaccount.com"
}

func validatePostRequest(ctx Context, header http.Header, form url.Values) (userKey *datastore.Key, gid *string, err error) {
	uid := GetFormValue(form, "uid")
	if uid == nil {
		return nil, nil, errors.New("Missing uid.")
	}

	sid := GetFormValue(form, "sid")
	if sid == nil {
		auth := GetFormValue(header, "Authorization")
		const bearerPrefix string = "Bearer "
		if auth == nil || !strings.HasPrefix(*auth, bearerPrefix) {
			return nil, nil, errors.New("Missing sid.")
		}
		token := strings.TrimPrefix(*auth, bearerPrefix)

		tokenInfo, err := VerifyIdToken(token)
		if err != nil {
			log.Fatal("Failed to get tokeninfo for %s: %v", token, err)
		}
		if !isWhiteListedEmail(tokenInfo.Email) {
			log.Printf("Access denied to %s", tokenInfo.Email)
			return nil, nil, errors.New("Missing sid.")
		}
		log.Printf("Access granted to %s", tokenInfo.Email)

		userKey = uidToUserKey(*uid)
		if userKey == nil {
			return nil, nil, errors.New("Bad uid.")
		}
	} else {
		userKey = validateSid(ctx, *uid, *sid)
		if userKey == nil {
			return nil, nil, errors.New("Bad uid or sid.")
		}
	}

	gid = GetFormValue(form, "gid")
	if gid == nil {
		return nil, nil, errors.New("Missing gid.")
	}

	return userKey, gid, nil
}

func gameHasEnded(game *Game) bool {
	return strings.HasSuffix(game.Moves, "R") || strings.HasSuffix(game.Moves, "B")
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

func userInGame(userKey *datastore.Key, game *Game) bool {
	return (game.Red != nil && *game.Red == *userKey) || (game.Black != nil && *game.Black == *userKey)
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

func updateGame(ctx Context, header http.Header, form url.Values) (*Game, error) {
	userKey, gid, err := validatePostRequest(ctx, header, form)
	if err != nil {
		return nil, err
	}

	var resolvedGame *Game
	_, err = ctx.Client.RunInTransaction(ctx.Ctx, func(tx *datastore.Transaction) error {
		operated := false
		resolvedGame = nil

		var game Game
		if err := tx.Get(datastore.NameKey("Game", *gid, nil), &game); err != nil {
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
		postAPIWrapper(ctx, w, r, updateGame)
	} else {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
	}
}

func forkGame(ctx Context, user *datastore.Key, parentGame *datastore.Key, forkedMoveCount int, newMoves string, useRed bool) string {
	var gid string
	for {
		gid = generateRandomString(6)
		game := Game{
			Key:         datastore.NameKey("Game", gid, nil),
			Description: fmt.Sprintf("从%s创建的分支棋局", parentGame.Name),
			Moves:       newMoves,
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

	userSession := getOrCreateUser(ctx, getFirstOrDefault(r.Cookie("uid")), getFirstOrDefault(r.Cookie("sid")))
	setNoCache(w)
	setUidSidInCookie(w, userSession)
	setPlainTextContent(w)

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
	board := buildBoardFromTrustedMoves(moveStrings)
	if board.IsLosing() {
		http.Error(w, fmt.Sprintf("the game is already ended at move %d", forkedMoveCount), http.StatusBadRequest)
		return
	}
	newMoves := "/" + strings.Join(moveStrings, "/") + declareGameResult(board)

	var useRed bool
	if game.Red != nil && *game.Red == *userSession.User {
		useRed = true
	} else if game.Black != nil && *game.Black == *userSession.User {
		useRed = false
	} else {
		useRed = rand.Intn(2) == 0
	}

	newGid := forkGame(ctx, userSession.User, game.Key, forkedMoveCount, newMoves, useRed)
	http.Redirect(w, r, "/game/"+newGid, http.StatusFound)
}

func getOrCreateAIUser(ctx Context) *datastore.Key {
	q := datastore.NewQuery("User").Filter("AI = ", true).KeysOnly().Limit(1)
	keys, err := ctx.Client.GetAll(ctx.Ctx, q, nil)
	if err != nil {
		log.Fatalf("Failed to query for AI user: %v", err)
	}
	if len(keys) > 0 {
		return keys[0]
	} else {
		user := User{
			Name: "Blur",
			AI:   true,
		}
		aiKey, err := ctx.Client.Put(ctx.Ctx, datastore.IncompleteKey("User", nil), &user)
		if err != nil {
			log.Fatalf("Failed to create AI user: %v", err)
		}
		return aiKey
	}
}

func newInt64(v int64) *int64 {
	p := new(int64)
	*p = v
	return p
}

func newString(v string) *string {
	s := new(string)
	*s = v
	return s
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

func inviteAI(ctx Context, _ http.Header, form url.Values) (*Game, error) {
	userKey, gid, err := validatePostRequest(ctx, http.Header{}, form)
	if err != nil {
		return nil, err
	}

	aiUser := getOrCreateAIUser(ctx)
	if *aiUser == *userKey {
		return nil, errors.New("bad user id (ai)")
	}

	var resolvedGame *Game
	_, err = ctx.Client.RunInTransaction(ctx.Ctx, func(tx *datastore.Transaction) error {
		resolvedGame = nil

		var game Game
		if err := tx.Get(datastore.NameKey("Game", *gid, nil), &game); err != nil {
			return err
		}
		resolvedGame = new(Game)
		*resolvedGame = game

		if !userInGame(userKey, &game) {
			return errors.New("user not in game")
		}

		if game.Red != nil && game.Black != nil {
			return errors.New("game already started")
		}

		if game.Red == nil {
			sit(aiUser, &game, "red")
		} else {
			sit(aiUser, &game, "black")
		}

		updateActivityTime(userKey, &game)
		updateActivityTime(aiUser, &game)
		if _, err := tx.Put(game.Key, &game); err != nil {
			return err
		}
		*resolvedGame = game
		return nil
	})

	if err != nil {
		return resolvedGame, err
	}

	maybePushAIMove(ctx, resolvedGame)

	return resolvedGame, err
}

func postAPIWrapper(ctx Context, w http.ResponseWriter, r *http.Request, handler func(Context, http.Header, url.Values) (*Game, error)) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	setPlainTextContent(w)
	setNoCache(w)

	if err := r.ParseForm(); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request form: %v", err), http.StatusBadRequest)
		return
	}

	game, err := handler(ctx, r.Header, r.Form)
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

	encoded, err := json.Marshal(response)
	w.Write(encoded)
}

func RegisterHandlers(ctx Context) {
	maybeServeStaticFiles()
	t := template.Must(template.ParseFiles("web/game.html"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// The "/" pattern matches everything, so we need to check
		// that we're at the root here.
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		mainPage(ctx, w, r, false)
	})
	http.HandleFunc("/new", func(w http.ResponseWriter, r *http.Request) {
		mainPage(ctx, w, r, true)
	})
	http.HandleFunc("/game/", func(w http.ResponseWriter, r *http.Request) {
		gamePage(ctx, t, w, r)
	})
	http.HandleFunc("/gameinfo", func(w http.ResponseWriter, r *http.Request) {
		gameInfoAPI(ctx, w, r)
	})
	http.HandleFunc("/fork/", func(w http.ResponseWriter, r *http.Request) {
		forkPage(ctx, w, r)
	})
	http.HandleFunc("/invite_ai", func(w http.ResponseWriter, r *http.Request) {
		postAPIWrapper(ctx, w, r, inviteAI)
	})
	http.HandleFunc("/janitor", func(w http.ResponseWriter, r *http.Request) {
		janitorPage(ctx, w, r)
	})
}
