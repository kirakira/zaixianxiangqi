package engine_server

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"cloud.google.com/go/compute/metadata"
	. "github.com/kirakira/zaixianxiangqi/internal"
)

const engine_command string = "./engine"

var kXiangqiUrl string = getXiangqiUrl()

const kGameInfoPath = "/gameinfo"

func getXiangqiUrl() string {
	url, found := os.LookupEnv("XIANGQI_URL_OVERRIDE")
	if found {
		return url
	}
	const kDefaultXiangqiUrl = "https://zaixianxiangqi.com"
	return kDefaultXiangqiUrl
}

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

type GameToPlay struct {
	uid          int64
	gid          string
	moves        string
	callback_url string
}

func extractEngineMove(engine_output string) (Move, bool) {
	lines := strings.Split(engine_output, "\n")
	for i := len(lines) - 1; i >= 0; i-- {
		if strings.HasPrefix(lines[i], "move ") {
			move, err := ParseXboardMove(lines[i][5:])
			if err != nil {
				log.Fatalf("bad move received from engine: %s", err)
			}
			return move, true
		}
	}
	return Move{}, false
}

func sendEngineMove(game GameToPlay, move Move) {
	req, err := http.NewRequest("POST", game.callback_url+kGameInfoPath, strings.NewReader(
		url.Values{
			"uid":   {strconv.FormatInt(game.uid, 10)},
			"gid":   {game.gid},
			"moves": {game.moves + "/" + move.NumericNotation()},
		}.Encode()))
	if err != nil {
		log.Fatal("%v", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := requestWithAuthToken(game.callback_url, req)
	if err != nil {
		log.Println("Error sending engine move: ", err)
		return
	}
	if resp.StatusCode != http.StatusOK {
		var buffer bytes.Buffer
		buffer.ReadFrom(resp.Body)
		log.Println("Request error sending engine move: ", buffer.String())
		resp.Body.Close()
		return
	}
	log.Println("Move sent succesfully.")
}

func playGame(game GameToPlay) {
	log.Print(fmt.Sprintf("Playing %s...\n", game.gid))
	commands := []string{"xboard", "force", "time 500"}
	for _, move_string := range strings.Split(game.moves, "/") {
		if len(move_string) == 0 {
			continue
		}
		move, err := ParseNumericMove(move_string)
		if err != nil {
			log.Printf("Failed to parse move %s in game %s\n", move_string, game.gid)
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
	log.Println("Extracted engine move: ", engine_move.NumericNotation())

	sendEngineMove(game, engine_move)
}

func HandlePlay(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseForm(); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request form: %v", err), http.StatusBadRequest)
		return
	}

	uid := GetFormValue(r.Form, "uid")
	gid := GetFormValue(r.Form, "gid")
	moves := GetFormValue(r.Form, "moves")
	if uid == nil || gid == nil || moves == nil {
		http.Error(w, "Missing required parameters", http.StatusBadRequest)
		return
	}

	uidParsed, err := strconv.ParseInt(*uid, 10, 64)
	if err != nil {
		http.Error(w, "Bad uid", http.StatusBadRequest)
		return
	}

	callback_url := GetFormValue(r.Form, "callback_url")
	if callback_url == nil {
		callback_url = new(string)
		*callback_url = kXiangqiUrl
	}

	playGame(GameToPlay{
		uid:          uidParsed,
		gid:          *gid,
		moves:        *moves,
		callback_url: *callback_url,
	})
	fmt.Fprintln(w, "OK.")
}
