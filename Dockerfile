#
# Build server
# Use the official Golang image to create a build artifact.
# This is based on Debian and sets the GOPATH to /go.
# https://hub.docker.com/_/golang
FROM golang:1.15 as server_builder
WORKDIR /app
# Retrieve application dependencies.
# This allows the container build to reuse cached dependencies.
COPY go.* ./
RUN go mod download
COPY . ./
# Build the server.
RUN cd cmd/engine_server && CGO_ENABLED=0 GOOS=linux go build -mod=readonly -v -o server

#
# Build game engine.
FROM gcc:10.3 as engine_builder
WORKDIR /app
COPY . ./
# Build engine code.
RUN cd third_party/deep-blur && mkdir -p bin && make o

#
# Build container image.
# Use the official Alpine image for a lean production container.
# https://hub.docker.com/_/alpine
# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM alpine:3
RUN apk add --no-cache ca-certificates libstdc++ libgcc libc6-compat
# Copy the binary to the production image from the builder stages.
COPY --from=server_builder /app/cmd/engine_server/server /server
COPY --from=engine_builder /app/third_party/deep-blur/bin/deep-blur /engine
# Run the web service on container startup.
CMD ["/server"]
