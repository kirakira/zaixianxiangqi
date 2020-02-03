package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"cloud.google.com/go/datastore"
)

const engine_command string = "./engine"

const kXiangqiUrl = "https://zaixianxiangqi.com"
const kGameInfoPath = "/gameinfo"

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

type UidSid struct {
	uid int64
	sid int64
}

func findAIUsers(ctx context.Context, client *datastore.Client) []UidSid {
	q := datastore.NewQuery("User").Filter("ai = ", true).KeysOnly()
	keys, err := client.GetAll(ctx, q, nil)
	if err != nil {
		log.Fatal("Failed to find AI uids: ", err)
	}

	uid_sids := []UidSid{}
	for _, k := range keys {
		uid := k.ID
		sid, success := findSidForUid(ctx, client, uid)
		if success {
			uid_sids = append(uid_sids, UidSid{
				uid: uid, sid: sid,
			})
		}
	}

	return uid_sids
}

type GameToPlay struct {
	uid_sid UidSid
	gid     *datastore.Key
	moves   string
}

func findSidForUid(ctx context.Context, client *datastore.Client, uid int64) (int64, bool) {
	q := datastore.NewQuery("Session").Ancestor(datastore.IDKey("User", uid, nil)).KeysOnly().Limit(1)
	keys, err := client.GetAll(ctx, q, nil)
	if err != nil {
		return 0, false
	}
	for _, key := range keys {
		return key.ID, true
	}
	return 0, false
}

func findGamesToPlay(ctx context.Context, client *datastore.Client, ai_users []UidSid) []GameToPlay {
	var games_to_play []GameToPlay
	for _, uid_sid := range ai_users {
		q := datastore.NewQuery("Game").Filter("nextToMove = ", uid_sid.uid)
		var games []Game
		if _, err := client.GetAll(ctx, q, &games); err != nil {
			log.Fatal("Failed to query for games to play: ", err)
		}
		for _, game := range games {
			games_to_play = append(games_to_play, GameToPlay{
				uid_sid: uid_sid,
				gid:     game.Gid,
				moves:   game.Moves,
			})
		}
	}
	return games_to_play
}

func joinUidSids(a []UidSid, delim string) string {
	as_strings := []string{}
	for _, token := range a {
		as_strings = append(as_strings,
			strconv.FormatInt(token.uid, 10)+":"+strconv.FormatInt(token.sid, 10))
	}
	return strings.Join(as_strings, delim)
}

func extractGids(a []GameToPlay) []string {
	gids := []string{}
	for _, g := range a {
		gids = append(gids, g.gid.Name)
	}
	return gids
}

func extractEngineMove(engine_output string) (Move, bool) {
	lines := strings.Split(engine_output, "\n")
	for i := len(lines) - 1; i >= 0; i-- {
		if strings.HasPrefix(lines[i], "move ") {
			return ParseXboardMove(lines[i][5:])
		}
	}
	return Move{}, false
}

func sendEngineMove(game GameToPlay, move Move) {
	resp, err := http.PostForm(kXiangqiUrl+kGameInfoPath, map[string][]string{
		"uid":   {strconv.FormatInt(game.uid_sid.uid, 10)},
		"sid":   {strconv.FormatInt(game.uid_sid.sid, 10)},
		"gid":   {game.gid.Name},
		"moves": {game.moves + "/" + move.NumericNotation()},
	})
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
	log.Print(fmt.Sprintf("Playing %s...\n", game.gid.Name))
	commands := []string{"xboard", "force", "time 500"}
	for _, move_string := range strings.Split(game.moves, "/") {
		if len(move_string) == 0 {
			continue
		}
		move, success := ParseNumericMove(move_string)
		if !success {
			log.Printf("Failed to parse move %s in game %s\n", move_string, game.gid.Name)
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

func playGames(ctx context.Context, client *datastore.Client, ai_users []UidSid) {
	log.Println("Finding all games waiting for AI's turn..")
	games_to_play := findGamesToPlay(ctx, client, ai_users)
	log.Print(fmt.Sprintf("Found %d games to play: %s.\n",
		len(games_to_play), strings.Join(extractGids(games_to_play), ", ")))

	for _, game := range games_to_play {
		playGame(game)
	}
}

func handlePlay(
	ctx context.Context, client *datastore.Client, ai_users []UidSid,
	w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Request staged.")
	playGames(ctx, client, ai_users)
	fmt.Fprintln(w, "OK.")
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Llongfile)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	datastore_project_id := os.Getenv("DATASTORE_PROJECT_ID")
	if datastore_project_id == "" {
		log.Fatal("Environment variable DATASTORE_PROJECT_ID not set.")
	}

	ctx := context.Background()
	client, err := datastore.NewClient(ctx, datastore_project_id)
	if err != nil {
		log.Fatal("Failed to create Datastore client: ", err)
	}

	log.Println("Finding all AI users..")
	ai_users := findAIUsers(ctx, client)
	log.Println("AI users:", joinUidSids(ai_users, ", "), ".")

	log.Printf("Starting engine server on port %s.\n", port)
	http.HandleFunc("/play", func(w http.ResponseWriter, r *http.Request) {
		handlePlay(ctx, client, ai_users, w, r)
	})
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
