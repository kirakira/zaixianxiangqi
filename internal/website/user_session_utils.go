package website

import (
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/datastore"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

type UserSession struct {
	User    *datastore.Key
	Session *datastore.Key
}

func pickUserName() string {
	var names = [...]string{"养一狗", "猥男", "清晰知足", "周杰伦", "SlaveMunde", "zhaoweijie13", "啊啊啊", "大了", "巨大了", "求蠢", "求不蠢", "司马", "麻皮大意", "小地雷", "长考一秒", "將五进一", "缩了", "慌了", "窝心傌", "Excited!", "闷声发大财", "王猛日", "Kebe", "死妈达", "单小娟"}
	return names[rand.Intn(len(names))]
}

func createUser(ctx Context) UserSession {
	userKey, err := DatastorePutWithRetry(ctx.Client, ctx.Ctx, datastore.IncompleteKey("User", nil),
		&User{
			Name: pickUserName(),
		}, 5)

	if err != nil {
		log.Fatalf("Failed to create user: %v", err)
	}
	log.Printf("Created user %v", userKey)

	return UserSession{
		User:    userKey,
		Session: createSessionForUser(ctx, userKey),
	}
}

func constructKeyFromId(kind string, id string) *datastore.Key {
	parsed, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return nil
	}
	return datastore.IDKey(kind, parsed, nil)
}

func getOrCreateUser(ctx Context, uid, sid string) UserSession {
	userKey := constructKeyFromId("User", uid)
	sessionKey := constructKeyFromId("Session", sid)

	if userKey != nil && sessionKey != nil {
		sessionKey.Parent = userKey
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
	sessionKey, err := DatastorePutWithRetry(ctx.Client, ctx.Ctx, datastore.IncompleteKey("Session",
		user), &Session{
		Creation: time.Now(),
	}, 5)
	if err != nil {
		log.Fatalf("Failed to create session for user %v: %v", user, err)
	}
	return sessionKey
}

func setUidSidInCookie(w http.ResponseWriter, userSession UserSession) {
	SetCookie(w, "uid", strconv.FormatInt(userSession.User.ID, 10))
	SetCookie(w, "sid", strconv.FormatInt(userSession.Session.ID, 10))
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
