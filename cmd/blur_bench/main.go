package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/kirakira/zaixianxiangqi/internal/blur_bench"
)

func main() {
	args := os.Args
	if len(args) < 4 {
		fmt.Println("Usage: blur_bench engine1 engine2 threads [leveldb_directory]")
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

	var leveldbDirectory string
	if len(args) == 5 {
		leveldbDirectory = args[4]
	} else {
		leveldbDirectory = "games_data"
	}

	blur_bench.SelfPlay([2]string{engine1, engine2}, numThreads, leveldbDirectory)
}
