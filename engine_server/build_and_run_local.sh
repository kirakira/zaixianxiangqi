#!/bin/sh

docker build . -t engine_server && docker run -i -p 8080:8080 engine_server
