package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
)

const engine_command string = "./engine"

func sendEngineCommandsAndClose(stdin io.WriteCloser, commands []string) {
	for _, command := range commands {
		_, err := stdin.Write([]byte(command + "\n"))
		if err != nil {
			log.Printf("Error sending engine command %s: %s\n", command, err)
		}
	}
	err := stdin.Close()
	if err != nil {
		log.Printf("Error closing engine stdin stream: %s\n", err)
	}
}

func callEngine(fen, side_to_move string, writer io.Writer) {
	log.Printf("Invoking engine %s %s", fen, side_to_move)
	cmd := exec.Command(engine_command)
	engine_stdin, _ := cmd.StdinPipe()
	engine_stdout, _ := cmd.StdoutPipe()

	err := cmd.Start()
	if err != nil {
		log.Fatalf("Failed to start engine: %s\n", err)
	}

	sendEngineCommandsAndClose(engine_stdin, []string{"time 500", "go"})
	io.Copy(writer, engine_stdout)

	err = cmd.Wait()
	if err != nil {
		log.Printf("Engine exited with error: %s\n", err)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	request_map := r.URL.Query()
	fen, fen_exists := request_map["fen"]
	turn, turn_exists := request_map["turn"]
	if !fen_exists || len(fen) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "'fen' parameter is required.\n")
		return
	}
	if !turn_exists || len(turn) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "'turn' parameter is required.\n")
		return
	}
	callEngine(fen[0], turn[0], w)
}

func main() {
	http.HandleFunc("/go", handler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting engine server on port %s.\n", port)

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
