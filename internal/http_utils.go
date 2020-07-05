package internal

import "net/http"

func ServeStaticFiles() {
	css_fs := http.FileServer(http.Dir("web/css"))
	http.Handle("/css/", http.StripPrefix("/css/", css_fs))
	js_fs := http.FileServer(http.Dir("web/js"))
	http.Handle("/js/", http.StripPrefix("/js/", js_fs))
}
