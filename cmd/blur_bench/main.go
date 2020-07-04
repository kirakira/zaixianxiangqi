package main

import (
	"fmt"
	"log"
	"os"
	"path"
	"strconv"
	"time"

	"github.com/kirakira/zaixianxiangqi/internal/blur_bench"
)

func main() {
	args := os.Args
	if len(args) < 4 {
		fmt.Println("Usage: blur_bench engine1 engine2 threads [output_directory]")
		os.Exit(1)
	}

	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)
	numThreads, err := strconv.Atoi(args[3])
	if err != nil {
		fmt.Println("threads must be an integer")
		os.Exit(1)
	}

	engine1 := args[1]
	engine2 := args[2]

	var output_directory string
	if len(args) == 5 {
		output_directory = args[4]
	} else {
		output_directory = ""
	}
	outputFileName := path.Join(output_directory, fmt.Sprintf("%s_%s_%s.rio",
		blur_bench.ExtractEngineName(engine1),
		blur_bench.ExtractEngineName(engine2), time.Now().Format(time.RFC3339)))

	blur_bench.SelfPlay([2]string{engine1, engine2}, numThreads, outputFileName)
}
