package main

import (
	"log"
	"os"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/tools"
)

func main() {
	_, srcCtx, err := internal.InitXiangqi()
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	dstProject := os.Getenv("DST_GOOGLE_CLOUD_PROJECT")
	if dstProject == "" {
		log.Fatalf(
			"Environment variable DST_GOOGLE_CLOUD_PROJECT not set.")
	}
	dstCtx, err := internal.InitDatastoreWithProjectId(dstProject)
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	tools.MigrateDB(srcCtx, dstCtx)
}
