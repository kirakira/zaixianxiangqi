package website

import (
	"net/http"
	_ "net/http/pprof"
	"os"

	"github.com/felixge/fgprof"
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
		homePage(ctx, w, r)
	})
	http.HandleFunc("/new", func(w http.ResponseWriter, r *http.Request) {
		newPage(ctx, w, r)
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
	if _, profile := os.LookupEnv("ENABLE_WALL_PROFILE"); profile {
		// Run: go tool pprof --http=:6061 http://localhost:8083/debug/fgprof?seconds=10
		http.Handle("/debug/fgprof", fgprof.Handler())
	}
}
