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

	. "github.com/kirakira/zaixianxiangqi/internal"
	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
	"github.com/kirakira/zaixianxiangqi/web"
)

type stats struct {
	Wins   int
	Losses int
	Draws  int
	Total  int
	Color  string
}

const IndexPagePath = "/experiments"

type pageData struct {
	ExperimentMetadata   *ExperimentMetadata
	Stats                *stats
	ExperimentMetadataJs []byte
	TOC                  []byte
}

func getPageData(storage Storage, metadata *ExperimentMetadata) (*pageData, error) {
	games, err := storage.ReadGamesForExperiment(metadata.Id)
	if err != nil {
		return nil, err
	}

	stats := stats{}
	toc := []GameRecord{}
	for _, record := range games {
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

func getRecentExperimentLinks(storage Storage) ([]ExperimentLink, error) {
	experiments, err := storage.GetRecentExperiments(20)
	if err != nil {
		return nil, err
	}

	var links []ExperimentLink
	for _, exp := range experiments {
		links = append(links, ExperimentLink{
			ExperimentId: fmt.Sprintf("%d", exp.Id),
			Link:         fmt.Sprintf("/experiment/%d", exp.Id),
		})
	}

	return links, nil
}

func indexPage(storage Storage, t *template.Template, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	links, err := getRecentExperimentLinks(storage)
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

func viewExperimentPage(storage Storage, t *template.Template, w http.ResponseWriter, r *http.Request) {
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

	metadata, err := storage.ReadExperimentMetadata(experimentId)
	if err != nil {
		http.Error(w, "Invalid experiment id.", http.StatusBadRequest)
		return
	}

	pageData, err := getPageData(storage, metadata)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to load experiment: %v.", err), http.StatusInternalServerError)
		return
	}

	if err := t.Execute(w, struct {
		IndexPageLink      string
		ExperimentMetadata *ExperimentMetadata
		Stats              *stats
		JsCode             template.JS
	}{
		IndexPageLink:      IndexPagePath,
		ExperimentMetadata: pageData.ExperimentMetadata,
		Stats:              pageData.Stats,
		JsCode: template.JS(fmt.Sprintf(
			"var experimentMetadata = JSON.parse('%s'); var toc = JSON.parse('%s');", pageData.ExperimentMetadataJs, pageData.TOC)),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
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

func gameRecordAPI(storage Storage, w http.ResponseWriter, r *http.Request) {
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

	metadata, err := storage.ReadExperimentMetadata(experimentId)
	if err != nil {
		log.Printf("Failed to read test metadata: %v", err)
		http.Error(w, "Failed to read test metadata.", http.StatusInternalServerError)
		return
	}

	gameRecord, err := storage.ReadGameRecord(experimentId, gameId)
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

func RegisterHandlers(storage Storage) {
	ServeStaticFiles()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// The "/" pattern matches everything, so we need to check
		// that we're at the root here.
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		t := web.GetWebPageTemplate("game_record_viewer.html")
		indexPage(storage, t, w, r)
	})
	http.HandleFunc(IndexPagePath, func(w http.ResponseWriter, r *http.Request) {
		t := web.GetWebPageTemplate("game_record_viewer.html")
		indexPage(storage, t, w, r)
	})
	http.HandleFunc("/experiment/", func(w http.ResponseWriter, r *http.Request) {
		t := web.GetWebPageTemplate("experiment.html")
		viewExperimentPage(storage, t, w, r)
	})
	http.HandleFunc("/game_record/", func(w http.ResponseWriter, r *http.Request) {
		gameRecordAPI(storage, w, r)
	})
}
