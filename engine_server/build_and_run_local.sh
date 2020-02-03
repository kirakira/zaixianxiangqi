#!/bin/sh

docker build . -t engine_server && docker run -i -p 8080:8080 -e DATASTORE_PROJECT_ID=${PROJECT_ID} -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/credentials.json -v $GOOGLE_APPLICATION_CREDENTIALS:/tmp/credentials.json:ro  engine_server
