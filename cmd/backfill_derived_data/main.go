package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/kirakira/zaixianxiangqi/internal"
	"github.com/kirakira/zaixianxiangqi/internal/tools"
)

// askForConfirmation asks the user for confirmation. A user must type in "yes" or "no" and
// then press enter. It has fuzzy matching, so "y", "Y", "yes", "YES", and "Yes" all count as
// confirmations. If the input is not recognized, it will ask again. The function does not return
// until it gets a valid response from the user.
func askForConfirmation(s string) bool {
	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Printf("%s [y/n]: ", s)

		response, err := reader.ReadString('\n')
		if err != nil {
			log.Fatal(err)
		}

		response = strings.ToLower(strings.TrimSpace(response))

		if response == "y" || response == "yes" {
			return true
		} else if response == "n" || response == "no" {
			return false
		}
	}
}

func main() {
	ctx, err := internal.InitXiangqi(internal.InitOptions{InitDatastoreClient: true})
	if err != nil {
		log.Fatalf("Error during initialization: %v", err)
	}
	if strings.Index(ctx.ProjectID, "test") == -1 {
		if !askForConfirmation(fmt.Sprintf("The project ID '%s' appears to be a production project. Continue?", ctx.ProjectID)) {
			fmt.Println("User abort.")
			return
		}
	}

	tools.BackfillDerivedData(ctx)
}
