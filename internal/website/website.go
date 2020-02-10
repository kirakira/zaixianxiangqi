package website

import (
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

type UserSession struct {
	User    *datastore.Key
	Session *datastore.Key
}

func isSessionValid(ctx Context, sessionKey *datastore.Key) bool {
	if err := ctx.Client.Get(ctx.Ctx, sessionKey, &Session{}); err != nil {
		if err == datastore.ErrNoSuchEntity {
			log.Printf("Session key %v", sessionKey)
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
	log.Printf("Invalid uid %d sid %d; created %v", uidParsed, sidParsed, userSession)
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

func getUserName(ctx Context, userKey *datastore.Key) string {
	var user User
	if err := ctx.Client.Get(ctx.Ctx, userKey, &user); err != nil {
		return "烫烫烫"
	} else {
		return user.Name
	}
}

func updateActivityTime(user *datastore.Key, game *Game) {
	t := time.Now()
	if game.Red == user {
		game.RedActivity = &t
	}
	if game.Black == user {
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
		log.Printf("%s created game %s", user, gameKey.Name)
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

type PlayerInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GameInfo struct {
	ID    string      `json:"id"`
	Moves string      `json:"moves"`
	Red   *PlayerInfo `json:"red",omitempty`
	Black *PlayerInfo `json:"black,omitempty"`
}

func convertToGameInfo(ctx Context, game *Game) GameInfo {
	gameinfo := GameInfo{
		ID:    game.Key.Name,
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
	return gameinfo
}

func getGameInfoJs(ctx Context, game *Game) []byte {
	encoded, err := json.Marshal(convertToGameInfo(ctx, game))
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
		css_fs := http.FileServer(http.Dir("web/css"))
		http.Handle("/css/", http.StripPrefix("/css/", css_fs))
		js_fs := http.FileServer(http.Dir("web/js"))
		http.Handle("/js/", http.StripPrefix("/js/", js_fs))
	}
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
}
