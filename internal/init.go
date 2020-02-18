package internal

import (
	"context"
	"errors"
	"log"
	"os"

	"cloud.google.com/go/datastore"
)

func initDatastore() (Context, error) {
	datastoreProjectId := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if datastoreProjectId == "" {
		return Context{},
			errors.New("Environment variable GOOGLE_CLOUD_PROJECT not set.")
	}

	return InitDatastoreWithProjectId(datastoreProjectId)
}

func InitDatastoreWithProjectId(projectId string) (Context, error) {
	ctx := context.Background()
	client, err := datastore.NewClient(ctx, projectId)
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
