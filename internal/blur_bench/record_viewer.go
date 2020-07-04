package blur_bench

import (
	"io"
	"log"
	"os"

	"github.com/golang/protobuf/proto"
	"kythe.io/kythe/go/util/riegeli"

	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

func PrintRecords(filename string) {
	f, err := os.Open(filename)
	if err != nil {
		log.Fatalf("Failed to open file %s", filename)
	}

	reader := riegeli.NewReader(f)
	for {
		var record GameRecord
		err = reader.NextProto(&record)
		if err != nil {
			if err != io.EOF {
				log.Printf("Error read records %s", err)
			}
			break
		}
		proto.MarshalText(os.Stdout, &record)
	}
}
