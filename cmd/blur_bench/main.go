package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/kirakira/zaixianxiangqi/internal/blur_bench"
	"github.com/kirakira/zaixianxiangqi/internal/blur_bench/mariadb"
)

func main() {
	args := os.Args
	if len(args) < 4 {
		fmt.Println("Usage: blur_bench engine1 engine2 threads")
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

	storage, err := mariadb.NewStorage()
	if err != nil {
		log.Printf("Failed to initialize storage: %v", err)
		os.Exit(1)
	}
	blur_bench.SelfPlay([2]string{engine1, engine2}, numThreads, storage)
}
