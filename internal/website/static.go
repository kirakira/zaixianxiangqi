package website

import (
	"log"
	"os"

	. "github.com/kirakira/zaixianxiangqi/internal"
)

func maybeServeStaticFiles() {
	// Serve static files (CSS & JS) only in local environment. They will be
	// handled by app.yaml in App Engine runtime.
	if _, local := os.LookupEnv("SERVE_STATIC_FILES"); local {
		log.Printf("Serving static files.")
		ServeStaticFiles()
	}
}
