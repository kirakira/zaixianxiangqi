package website

import (
	"net/http"

	. "github.com/kirakira/zaixianxiangqi/internal"
)

func RegisterHandlers(ctx Context) {
	maybeServeStaticFiles()
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
	http.HandleFunc("/user/", func(w http.ResponseWriter, r *http.Request) {
		userPage(ctx, w, r)
	})
	http.HandleFunc("/game/", func(w http.ResponseWriter, r *http.Request) {
		gamePage(ctx, w, r)
	})
	http.HandleFunc("/gameinfo", func(w http.ResponseWriter, r *http.Request) {
		gameInfoAPI(ctx, w, r)
	})
	http.HandleFunc("/fork/", func(w http.ResponseWriter, r *http.Request) {
		forkPage(ctx, w, r)
	})
	http.HandleFunc("/invite_ai", func(w http.ResponseWriter, r *http.Request) {
		handleInviteAI(ctx, w, r)
	})
	http.HandleFunc("/update_profile", func(w http.ResponseWriter, r *http.Request) {
		handleUpdateProfile(ctx, w, r)
	})
	http.HandleFunc("/janitor", func(w http.ResponseWriter, r *http.Request) {
		janitorPage(ctx, w, r)
	})
}
