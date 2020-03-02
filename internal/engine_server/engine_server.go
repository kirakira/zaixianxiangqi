package engine_server

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os/exec"
	"strconv"
	"strings"

	"cloud.google.com/go/compute/metadata"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

const engine_command string = "./engine"

var kXiangqiUrl string = "https://zaixianxiangqi.com"

const kGameInfoPath = "/gameinfo"

func requestWithAuthToken(serviceURL string, req *http.Request) (*http.Response, error) {
	// query the id_token with ?audience as the serviceURL
	tokenURL := fmt.Sprintf("/instance/service-accounts/default/identity?audience=%s", serviceURL)
	idToken, err := metadata.Get(tokenURL)
	if err != nil {
		return nil, fmt.Errorf("metadata.Get: failed to query id_token: %+v", err)
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", idToken))
	return http.DefaultClient.Do(req)
}

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

func callEngine(commands []string, writer io.Writer) {
	cmd := exec.Command(engine_command)
	engine_stdin, _ := cmd.StdinPipe()
	engine_stdout, _ := cmd.StdoutPipe()

	err := cmd.Start()
	if err != nil {
		log.Fatalf("Failed to start engine: %s\n", err)
	}

	sendEngineCommandsAndClose(engine_stdin, commands)
	io.Copy(writer, engine_stdout)

	err = cmd.Wait()
	if err != nil {
		log.Fatalf("Engine exited with error: %s\n", err)
	}
}

func extractEngineMove(engine_output string) (string, bool) {
	lines := strings.Split(engine_output, "\n")
	for i := len(lines) - 1; i >= 0; i-- {
		if strings.HasPrefix(lines[i], "move ") {
			move, err := ParseXboardMove(lines[i][5:])
			if err != nil {
				log.Fatalf("bad move received from engine: %s", err)
			}
			return move.NumericNotation(), true
		} else if strings.HasPrefix(lines[i], "0-1") {
			return "B", true
		} else if strings.HasPrefix(lines[i], "1-0") {
			return "R", true
		}
	}
	return "", false
}

func sendEngineMove(game GameToPlay, move string) {
	req, err := http.NewRequest("POST", *game.CallbackUrl+kGameInfoPath, strings.NewReader(
		url.Values{
			"uid":   {strconv.FormatInt(*game.Uid, 10)},
			"gid":   {*game.Gid},
			"moves": {*game.Moves + "/" + move},
		}.Encode()))
	if err != nil {
		log.Fatal("%v", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := requestWithAuthToken(*game.CallbackUrl, req)
	if err != nil {
		log.Println("Error sending engine move: ", err)
		return
	}
	if resp.StatusCode != http.StatusOK {
		buffer, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read from response: %v", err)
		}
		log.Printf("Request error sending engine move: %s", buffer)
		resp.Body.Close()
		return
	}
	log.Println("Move sent succesfully.")
}

func playGame(game GameToPlay) {
	log.Printf("Playing %s...\n", *game.Gid)
	commands := []string{"xboard", "force", "time 500"}
	for _, move_string := range strings.Split(*game.Moves, "/") {
		if len(move_string) == 0 {
			continue
		}
		move, err := ParseNumericMove(move_string)
		if err != nil {
			log.Printf("Failed to parse move '%s' in game %s\n", move_string, *game.Gid)
			return
		}
		commands = append(commands, move.XboardNotation())
	}
	commands = append(commands, "go")
	commands = append(commands, "quit")

	var buffer bytes.Buffer
	callEngine(commands, &buffer)
	engine_output := buffer.String()
	log.Print(engine_output)

	engine_move, success := extractEngineMove(engine_output)
	if !success {
		log.Println("Failed to extract engine move from engine output.")
		return
	}
	log.Println("Extracted engine move: ", engine_move)

	sendEngineMove(game, engine_move)
}

func HandlePlay(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error read engine server message: %v", err)
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	var m EngineServerRequest
	if err := json.Unmarshal(body, &m); err != nil {
		log.Printf("json.Unmarshal fails on %s: %v", body, err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	decoded, err := base64.StdEncoding.DecodeString(m.Message.Data)
	if err != nil {
		log.Printf("base64 deocde fails on %s: %v", m.Message.Data, err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	var game GameToPlay
	if err := json.Unmarshal(decoded, &game); err != nil {
		log.Printf("json decode GameToPlay fails on %s: %v", decoded, err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	if game.Uid == nil || game.Gid == nil || game.Moves == nil {
		log.Printf("Missing required arguments: decoded %s uid %v gid %v moves %v", decoded,
			game.Uid == nil, game.Gid == nil, game.Moves == nil)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	if game.CallbackUrl == nil {
		game.CallbackUrl = new(string)
		*game.CallbackUrl = kXiangqiUrl
	}

	playGame(game)
}
