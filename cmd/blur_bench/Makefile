PREFIX=../../internal/blur_bench
PROTO_SOURCES=$(shell find ${PREFIX} -type f -name "*.proto")

.genfiles: ${PROTO_SOURCES}
	mkdir -p ${PREFIX}/genfiles; protoc -I${PREFIX} --go_out=paths=source_relative:${PREFIX}/genfiles ${PROTO_SOURCES}

blur_bench: .genfiles
	go build -mod=readonly -o blur_bench
