package internal

import (
	"context"
	"errors"
	"log"
	"os"

	"cloud.google.com/go/datastore"
)

type Context struct {
	Port       string
	ProjectID  string
	LocationID string
	Ctx        context.Context
	Client     *datastore.Client
}

type InitOptions struct {
	InitDatastoreClient bool
	ProjectIdOverride   *string
}

func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return port
}

func InitXiangqi(options InitOptions) (Context, error) {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)

	var ctx Context
	ctx.Port = GetPort()

	if options.ProjectIdOverride != nil {
		ctx.ProjectID = *options.ProjectIdOverride
	} else if projectId, exists := os.LookupEnv("GOOGLE_CLOUD_PROJECT"); exists {
		ctx.ProjectID = projectId
	} else if options.InitDatastoreClient {
		return Context{},
			errors.New("Unable to initialize datastore because environment variable GOOGLE_CLOUD_PROJECT not set.")
	}

	ctx.LocationID = "us-central1"

	ctx.Ctx = context.Background()

	if options.InitDatastoreClient {
		log.Printf("Initializing datastore client with project %s", ctx.ProjectID)
		client, err := datastore.NewClient(ctx.Ctx, ctx.ProjectID)
		if err != nil {
			return Context{}, err
		}
		ctx.Client = client
	}

	return ctx, nil
}
