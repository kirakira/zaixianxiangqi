#!/bin/sh

docker build . -t engine_server && docker run -i -p 8080:8080 -e XIANGQI_URL_OVERRIDE="http://localhost:8080" -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/credentials.json -e PORT=8082 -v $GOOGLE_APPLICATION_CREDENTIALS:/tmp/credentials.json:ro  engine_server
