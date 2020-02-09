package internal

import (
	"context"

	"cloud.google.com/go/datastore"
)

type Context struct {
	Ctx    context.Context
	Client *datastore.Client
}
