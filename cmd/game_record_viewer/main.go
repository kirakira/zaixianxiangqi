package main

import (
	"fmt"
	"log"
	"os"

	"github.com/kirakira/zaixianxiangqi/internal/blur_bench"
)

func main() {
	args := os.Args
	if len(args) < 2 {
		fmt.Println("Usage: game_record_viewer filename")
		os.Exit(1)
	}

	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)
	blur_bench.PrintRecords(args[1])
}
