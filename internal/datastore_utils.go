package internal

import (
	"context"
	"log"

	"cloud.google.com/go/datastore"
)

func DatastorePutWithRetry(
	client *datastore.Client, ctx context.Context, key *datastore.Key, object interface{}, numRetries int) (*datastore.Key, error) {
	var err error
	for i := 0; i < numRetries; i++ {
		key, err := client.Put(ctx, key, object)
		if err == nil {
			return key, err
		}
		log.Printf("Failed to put entity %s, attempt %d out of %d: %v", key, err, i, numRetries)
	}
	return nil, err
}
