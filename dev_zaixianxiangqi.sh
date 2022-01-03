#!/bin/sh

CREDENTIALS_FILE="/Users/menghui/Downloads/zaixianxiangqi-test.json"

if cd web/ && make; then
  cd ..
  # To start datastore emulator, run `gcloud beta emulators datastore start`.
  # DATASTORE_EMULATOR_HOST=localhost:8081 PORT=8083 go run cmd/zaixianxiangqi/main.go
  GOOGLE_CLOUD_PROJECT=zaixianxiangqi-test GOOGLE_APPLICATION_CREDENTIALS=${CREDENTIALS_FILE} PORT=8083 SERVE_STATIC_FILES=1 ENABLE_WALL_PROFILE=1 go run cmd/zaixianxiangqi/main.go
else
  cd ..
fi
