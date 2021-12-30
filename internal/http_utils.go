package internal

import (
	"net/http"
	"time"
)

func ServeStaticFiles() {
	css_fs := http.FileServer(http.Dir("web/css"))
	http.Handle("/css/", http.StripPrefix("/css/", css_fs))
	js_fs := http.FileServer(http.Dir("web/js"))
	http.Handle("/js/", http.StripPrefix("/js/", js_fs))
}

func SetNoCache(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
}

func SetCookie(w http.ResponseWriter, name string, value string) {
	expire := time.Now().AddDate(100, 0, 0)
	cookie := http.Cookie{
		Name:    name,
		Value:   value,
		Path:    "/",
		Expires: expire,
	}
	http.SetCookie(w, &cookie)
}

func SetPlainTextContent(w http.ResponseWriter) {
	w.Header().Add("Content-Type", "text/plain; charset=utf-8")
}

func GetFirstCookieOrDefault(cookie *http.Cookie, err error) string {
	if err != nil || len(cookie.Value) == 0 {
		return ""
	} else {
		return cookie.Value
	}
}
