#!/bin/sh

docker build . -t engine_server && docker run -i -p 8082:8082 -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/credentials.json -e PORT=8082 -v $GOOGLE_APPLICATION_CREDENTIALS:/tmp/credentials.json:ro  engine_server
