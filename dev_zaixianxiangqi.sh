#!/bin/sh

# To start datastore emulator, run `gcloud beta emulators datastore start`.
DATASTORE_EMULATOR_HOST=localhost:8081 PORT=8083 go run cmd/zaixianxiangqi/main.go
