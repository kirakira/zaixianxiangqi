package internal

import (
	"context"
	"errors"
	"log"
	"os"

	"cloud.google.com/go/datastore"
)

func initDatastore() (Context, error) {
	datastore_project_id := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if datastore_project_id == "" {
		return Context{},
			errors.New("Environment variable GOOGLE_CLOUD_PROJECT not set.")
	}

	ctx := context.Background()
	client, err := datastore.NewClient(ctx, datastore_project_id)
	return Context{
		Ctx:    ctx,
		Client: client,
	}, err
}

func InitXiangqi() (port string, ctx Context, err error) {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)

	port = os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	ctx, err = initDatastore()
	return
}
