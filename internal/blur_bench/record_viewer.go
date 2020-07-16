package blur_bench

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/syndtr/goleveldb/leveldb"
	"github.com/syndtr/goleveldb/leveldb/util"
	"google.golang.org/protobuf/proto"

	. "github.com/kirakira/zaixianxiangqi/internal"
	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

type stats struct {
	Wins   int
	Losses int
	Draws  int
	Total  int
	Color  string
}

type pageData struct {
	ExperimentMetadata   *ExperimentMetadata
	Stats                *stats
	ExperimentMetadataJs []byte
	TOC                  []byte
}

func getPageData(leveldbDirectory string, metadata *ExperimentMetadata) (*pageData, error) {
	db, err := leveldb.OpenFile(leveldbDirectory, nil)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	stats := stats{}

	iter := db.NewIterator(util.BytesPrefix([]byte(keyPrefixForExperimentGames(metadata.Id))), nil)
	toc := []GameRecord{}
	for iter.Next() {
		var record GameRecord
		err := proto.Unmarshal(iter.Value(), &record)
		if err != nil {
			return nil, err
		}

		record.Moves = nil
		record.Scores = nil

		toc = append(toc, record)

		if (record.Result == GameResult_RED_WON && !record.ControlIsRed) || (record.Result == GameResult_BLACK_WON && record.ControlIsRed) {
			stats.Wins += 1
		} else if (record.Result == GameResult_RED_WON && record.ControlIsRed) || (record.Result == GameResult_BLACK_WON && !record.ControlIsRed) {
			stats.Losses += 1
		} else {
			stats.Draws += 1
		}
	}
	stats.Total = stats.Wins + stats.Draws + stats.Losses

	if stats.Wins > stats.Losses {
		stats.Color = "win"
	} else if stats.Wins < stats.Losses {
		stats.Color = "loss"
	} else {
		stats.Color = "draw"
	}

	sort.Slice(toc, func(i, j int) bool {
		return toc[i].StartTime.AsTime().Before(toc[j].StartTime.AsTime())
	})
	TOCEncoded, err := json.Marshal(toc)
	if err != nil {
		return nil, err
	}

	experimentMetadataEncoded, err := json.Marshal(metadata)
	if err != nil {
		return nil, err
	}

	return &pageData{
		ExperimentMetadata:   metadata,
		Stats:                &stats,
		ExperimentMetadataJs: experimentMetadataEncoded,
		TOC:                  TOCEncoded,
	}, nil
}

type ExperimentLink struct {
	ExperimentId string
	Link         string
}

func getRecentExperimentLinks(leveldbDirectory string) ([]ExperimentLink, error) {
	db, err := leveldb.OpenFile(leveldbDirectory, nil)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	iter := db.NewIterator(util.BytesPrefix([]byte(keyPrefixForExperimentMetadata())), nil)
	var links []ExperimentLink
	for iter.Next() {
		var metadata ExperimentMetadata
		err := proto.Unmarshal(iter.Value(), &metadata)
		if err != nil {
			return nil, err
		}
		links = append(links, ExperimentLink{
			ExperimentId: fmt.Sprintf("%d", metadata.Id),
			Link:         fmt.Sprintf("/experiment/%d", metadata.Id),
		})
	}

	return links, nil
}

func mainPage(leveldbDirectory string, t *template.Template, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	links, err := getRecentExperimentLinks(leveldbDirectory)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to load recent experiments: %v.", err), http.StatusInternalServerError)
	}

	if err := t.Execute(w, struct {
		ExperimentList []ExperimentLink
	}{
		ExperimentList: links,
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}

func viewExperimentPage(leveldbDirectory string, t *template.Template, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	re := regexp.MustCompile(`^/experiment/([^/]+)$`)
	reMatches := re.FindStringSubmatch(r.URL.Path)
	if len(reMatches) < 2 {
		http.Error(w, "Not found.", http.StatusNotFound)
		return
	}
	experimentId, err := strconv.ParseInt(reMatches[1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid experiment id.", http.StatusBadRequest)
		return
	}

	metadata, err := readExperimentMetadata(leveldbDirectory, experimentId)
	if err != nil {
		http.Error(w, "Invalid experiment id.", http.StatusBadRequest)
	}

	pageData, err := getPageData(leveldbDirectory, metadata)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to load experiment: %v.", err), http.StatusInternalServerError)
		return
	}

	if err := t.Execute(w, struct {
		ExperimentMetadata *ExperimentMetadata
		Stats              *stats
		JsCode             template.JS
	}{
		ExperimentMetadata: pageData.ExperimentMetadata,
		Stats:              pageData.Stats,
		JsCode: template.JS(fmt.Sprintf(
			"var experimentMetadata = JSON.parse('%s'); var toc = JSON.parse('%s');", pageData.ExperimentMetadataJs, pageData.TOC)),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}

func readProtoRecord(leveldbDirectory string, key []byte, record proto.Message) error {
	db, err := leveldb.OpenFile(leveldbDirectory, nil)
	if err != nil {
		log.Printf("Open DB failed %v", err)
		return err
	}
	defer db.Close()

	value, err := db.Get(key, nil)
	if err != nil {
		log.Printf("Get key failed %v", err)
		return err
	}

	err = proto.Unmarshal(value, record)
	if err != nil {
		log.Printf("Unmarshal failed %v", err)
		return err
	}

	return nil
}

func readGameRecord(leveldbDirectory string, experimentId int64, gameId string) (*GameRecord, error) {
	var record GameRecord
	if err := readProtoRecord(leveldbDirectory, keyForGameRecord(experimentId, gameId), &record); err != nil {
		return nil, err
	}
	return &record, nil
}

func readExperimentMetadata(leveldbDirectory string, experimentId int64) (*ExperimentMetadata, error) {
	var record ExperimentMetadata
	if err := readProtoRecord(leveldbDirectory, []byte(keyForExperimentMetadata(experimentId)), &record); err != nil {
		return nil, err
	}
	return &record, nil
}

func convertToGameRecordResponse(metadata *ExperimentMetadata, gameRecord *GameRecord) *GameRecordResponse {
	var redName, blackName string
	if gameRecord.ControlIsRed {
		redName = metadata.Control.Name
		blackName = metadata.Treatment.Name
	} else {
		redName = metadata.Treatment.Name
		blackName = metadata.Control.Name
	}

	var movePieces []string
	for _, move := range gameRecord.Moves {
		parsedMove, err := ParseXboardMove(move)
		if err != nil {
			log.Fatalf("Failed to parse move %s", move)
		}
		movePieces = append(movePieces, parsedMove.NumericNotation())
	}
	moves := "/" + strings.Join(movePieces, "/")

	if gameRecord.Result == GameResult_RED_WON {
		moves += "/R"
	} else if gameRecord.Result == GameResult_BLACK_WON {
		moves += "/B"
	} else if gameRecord.Result == GameResult_DRAW {
		moves += "/D"
	}

	return &GameRecordResponse{
		GameInfo: &GameInfo{
			ID:    gameRecord.GameId,
			Title: gameRecord.GameId,
			Moves: moves,
			Red: &PlayerInfo{
				Name: redName,
			},
			Black: &PlayerInfo{
				Name: blackName,
			},
		},
		GameRecord: gameRecord,
	}
}

func gameRecordAPI(leveldbDirectory string, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	re := regexp.MustCompile(`^/game_record/([^/]+)/([^/]+)$`)
	reMatches := re.FindStringSubmatch(r.URL.Path)
	if len(reMatches) < 3 {
		http.Error(w, "Not found.", http.StatusNotFound)
		return
	}
	experimentId, err := strconv.ParseInt(reMatches[1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid experiment id.", http.StatusBadRequest)
		return
	}
	gameId := reMatches[2]

	metadata, err := readExperimentMetadata(leveldbDirectory, experimentId)
	if err != nil {
		log.Printf("Failed to read test metadata: %v", err)
		http.Error(w, "Failed to read test metadata.", http.StatusInternalServerError)
		return
	}

	gameRecord, err := readGameRecord(leveldbDirectory, experimentId, gameId)
	if err != nil {
		http.Error(w, "Game not found.", http.StatusNotFound)
		return
	}

	gameRecordResponse := convertToGameRecordResponse(metadata, gameRecord)
	encoded, err := json.Marshal(gameRecordResponse)
	if err != nil {
		log.Fatalf("Failed to convert game record response to json: %v", err)
	}

	w.Write(encoded)
}

func RegisterHandlers(leveldbDirectory string) {
	ServeStaticFiles()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// The "/" pattern matches everything, so we need to check
		// that we're at the root here.
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		t := template.Must(template.ParseFiles("web/game_record_viewer.html"))
		mainPage(leveldbDirectory, t, w, r)
	})
	http.HandleFunc("/experiment/", func(w http.ResponseWriter, r *http.Request) {
		t := template.Must(template.ParseFiles("web/experiment.html"))
		viewExperimentPage(leveldbDirectory, t, w, r)
	})
	http.HandleFunc("/game_record/", func(w http.ResponseWriter, r *http.Request) {
		gameRecordAPI(leveldbDirectory, w, r)
	})
}
