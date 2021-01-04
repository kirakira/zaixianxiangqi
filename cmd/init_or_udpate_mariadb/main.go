package main

import (
	"fmt"
	"os"

	"github.com/kirakira/zaixianxiangqi/internal/blur_bench/mariadb"
)

func main() {
	args := os.Args
	if len(args) < 2 {
		fmt.Println("Usage: init_to_update_mariadb internal/blur_bench/mariadb/schema.sql")
		os.Exit(1)
	}

	err := mariadb.InitOrUpdateDB(args[1])
	if err != nil {
		fmt.Printf("Operation failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("Operation successful.")
}
