package website

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

func isSidValid(ctx Context, uidsid UidSid) bool {
	key := datastore.IDKey("Session", uidsid.Sid, datastore.IDKey("User", uidsid.Uid, nil))
	if err := ctx.Client.Get(ctx.Ctx, key, &Session{}); err != nil {
		if err == datastore.ErrNoSuchEntity {
			log.Printf("Session uid %d sid %d does not exist", uidsid.Uid, uidsid.Sid)
			return false
		} else {
			log.Fatalf("Failed to query for sid: %v", err)
		}
	}
	return true
}

func createSessionForUser(ctx Context, uid int64) int64 {
	session_key, err := ctx.Client.Put(ctx.Ctx, datastore.IncompleteKey("Session",
		datastore.IDKey("User", uid, nil)), &Session{
		Creation: time.Now(),
	})
	if err != nil {
		log.Fatalf("Failed to create session for user %d: %v", uid, err)
	}
	return session_key.ID
}

func pickUserName() string {
	var names = [...]string{"养一狗", "猥男", "清晰知足", "周杰伦", "SlaveMunde", "zhaoweijie13", "啊啊啊", "大了", "巨大了", "求蠢", "求不蠢", "司马", "麻皮大意", "小地雷", "长考一秒", "將五进一", "缩了", "慌了", "窝心傌", "Excited!", "闷声发大财", "王猛日", "Kebe", "死妈达", "单小娟"}
	return names[rand.Intn(len(names))]
}

func createUser(ctx Context) UidSid {
	user_key, err := ctx.Client.Put(ctx.Ctx, datastore.IncompleteKey("User", nil), &User{
		Name: pickUserName(),
	})

	if err != nil {
		log.Fatalf("Failed to create user: %v", err)
	}

	return UidSid{
		Uid: user_key.ID,
		Sid: createSessionForUser(ctx, user_key.ID),
	}
}

func getMostRecentSid(ctx Context, uid int64) int64 {
	q := datastore.NewQuery("Session").Ancestor(datastore.IDKey("User", uid, nil)).Order("-Creation").KeysOnly().Limit(1)
	session_keys, err := ctx.Client.GetAll(ctx.Ctx, q, nil)
	if err != nil {
		log.Fatalf("Failed to query for the most recent sid: %v", err)
	}
	if len(session_keys) == 0 {
		log.Fatalf("User %d does not have a session", uid)
	}
	return session_keys[0].ID
}

func getOrCreateUser(ctx Context, uid, sid string) UidSid {
	var uidsid UidSid
	uidParsed, err := strconv.ParseInt(uid, 10, 64)
	if err != nil {
		uidsid.Uid = 0
	} else {
		uidsid.Uid = uidParsed
	}
	sidParsed, err := strconv.ParseInt(sid, 10, 64)
	if err != nil {
		uidsid.Sid = 0
	} else {
		uidsid.Sid = sidParsed
	}
	if uidParsed != 0 && sidParsed != 0 && isSidValid(ctx, uidsid) {
		log.Printf("Found valid uid %d sid %d", uidParsed, sidParsed)
		return UidSid{
			Uid: uidsid.Uid,
			Sid: getMostRecentSid(ctx, uidsid.Uid),
		}
	} else {
		uidsid = createUser(ctx)
		log.Printf("Invalid uid %d sid %d; created %d %d", uidParsed, sidParsed, uidsid.Uid, uidsid.Sid)
		return uidsid
	}
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

func setUidSidInCookie(w http.ResponseWriter, uidsid UidSid) {
	setCookie(w, "uid", strconv.FormatInt(uidsid.Uid, 10))
	setCookie(w, "sid", strconv.FormatInt(uidsid.Sid, 10))
}

func getRecentGames(ctx Context, uid int64, count int) []string {
	var games []string
	for _, role := range []string{"Red", "Black"} {
		q := datastore.NewQuery("Game").Filter(role+" = ", uid).Order("-Creation").Limit(count).KeysOnly()
		keys, err := ctx.Client.GetAll(ctx.Ctx, q, nil)
		if err != nil {
			log.Fatalf("Failed to query for recent games: %v", err)
		}
		for _, key := range keys {
			games = append(games, key.Name)
		}
	}
	return games
}

func generateRandomString(length int) string {
	alphabet := "abcdefghijkmnpqrstuvwxyz"
	ret := make([]byte, length)
	for i := range ret {
		ret[i] = alphabet[rand.Intn(len(alphabet))]
	}
	return string(ret)
}

func getUserName(ctx Context, uid int64) string {
	var user User
	if err := ctx.Client.Get(ctx.Ctx, datastore.IDKey("User", uid, nil), &user); err != nil {
		return "烫烫烫"
	} else {
		return user.Name
	}
}

func updateActivityTime(uid int64, game *Game) {
	if game.Red == uid {
		game.RedActivity = time.Now()
	}
	if game.Black == uid {
		game.BlackActivity = time.Now()
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

func createGame(ctx Context, uid int64) string {
	var gid string
	username := getUserName(ctx, uid)
	for {
		gid = generateRandomString(6)
		log.Printf("generated random gid: %s", gid)
		game := Game{
			Creation:    time.Now(),
			Description: fmt.Sprintf("%s创建的棋局", username),
			Key:         datastore.NameKey("Game", gid, nil),
		}
		if rand.Intn(2) == 0 {
			game.Red = uid
		} else {
			game.Black = uid
		}
		updateActivityTime(uid, &game)
		if insertGameIfNotExists(ctx, &game) {
			break
		} else {
			log.Printf("createGame race condition detected: trying to insert gid %s", gid)
		}
	}
	return gid
}

func createOrGetRecentGame(ctx Context, uid int64, force_create bool) string {
	var gid string
	if !force_create {
		recentGames := getRecentGames(ctx, uid, 1)
		if len(recentGames) > 0 {
			gid = recentGames[0]
			log.Printf("Recent game: %s", gid)
		}
	}
	if gid == "" {
		gid = createGame(ctx, uid)
		log.Printf("Created game %s for %d", gid, uid)
	}
	return gid
}

func getFirstOrDefault(cookie *http.Cookie, err error) string {
	if err != nil || len(cookie.Value) == 0 {
		return ""
	} else {
		return cookie.Value
	}
}

func mainPage(ctx Context, w http.ResponseWriter, r *http.Request) {
	if r.Method == "" || r.Method == "GET" {
		uidsid := getOrCreateUser(ctx, getFirstOrDefault(r.Cookie("uid")), getFirstOrDefault(r.Cookie("sid")))
		setNoCache(w)
		setUidSidInCookie(w, uidsid)
		gid := createOrGetRecentGame(ctx, uidsid.Uid, false)
		http.Redirect(w, r, "/game/"+gid, http.StatusFound)
	} else {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
	}
}

func RegisterHandlers(ctx Context) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// The "/" pattern matches everything, so we need to check
		// that we're at the root here.
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		mainPage(ctx, w, r)
	})
}
