package main

import (
	"log"
	"os"

	"cloud.google.com/go/datastore"
	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/tools"
)

func main() {
	srcCtx, err := internal.InitXiangqi(internal.InitOptions{InitDatastoreClient: true})
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	dstProject := os.Getenv("DST_GOOGLE_CLOUD_PROJECT")
	if dstProject == "" {
		log.Fatalf(
			"Environment variable DST_GOOGLE_CLOUD_PROJECT not set.")
	}
	dstClient, err := datastore.NewClient(srcCtx.Ctx, dstProject)
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}

	tools.MigrateDB(srcCtx, internal.Context{
		Port:       srcCtx.Port,
		ProjectId:  dstProject,
		LocationId: srcCtx.LocationId,
		Ctx:        srcCtx.Ctx,
		Client:     dstClient,
	})
}
