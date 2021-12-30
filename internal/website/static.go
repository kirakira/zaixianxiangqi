package website

import (
	"log"
	"os"

	. "github.com/kirakira/zaixianxiangqi/internal"
)

func maybeServeStaticFiles() {
	// Serve static files (CSS & JS) only in local environment. They will be
	// handled by app.yaml in App Engine runtime.
	if _, local := os.LookupEnv("DATASTORE_EMULATOR_HOST"); local {
		log.Printf("Local environment; serving static files.")
		ServeStaticFiles()
	}
}
