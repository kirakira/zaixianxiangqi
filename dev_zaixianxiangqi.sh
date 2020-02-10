#!/bin/sh

# To start datastore emulator, run `gcloud beta emulators datastore start`.
DATASTORE_EMULATOR_HOST=localhost:8081 go run cmd/zaixianxiangqi/main.go
