#!/bin/sh

CREDENTIALS_FILE="/home/menghui/Downloads/zaixianxiangqi-test.json" 
docker build . -t engine_server && docker run -i -p 8082:8082 -e GOOGLE_APPLICATION_CREDENTIALS=${CREDENTIALS_FILE} -e PORT=8082 -v $GOOGLE_APPLICATION_CREDENTIALS:${CREDENTIALS_FILE} engine_server
