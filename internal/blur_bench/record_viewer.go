package blur_bench

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/syndtr/goleveldb/leveldb"
	"google.golang.org/protobuf/proto"

	. "github.com/kirakira/zaixianxiangqi/internal"
	. "github.com/kirakira/zaixianxiangqi/internal/blur_bench/genfiles"
)

func getTOCJs(recordsFile string) ([]byte, error) {
	db, err := leveldb.OpenFile(recordsFile, nil)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	iter := db.NewIterator(nil, nil)
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
	}

	encoded, err := json.Marshal(toc)
	if err != nil {
		return nil, err
	}
	return encoded, nil
}

func mainPage(recordsFile string, t *template.Template, w http.ResponseWriter, r *http.Request) {
	if !(r.Method == "" || r.Method == "GET") {
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

	tocJs, err := getTOCJs(recordsFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create TOC from records file: %v.", err), http.StatusInternalServerError)
		return
	}

	if err := t.Execute(w, struct {
		JsCode template.JS
	}{
		JsCode: template.JS(fmt.Sprintf(
			"var toc = JSON.parse('%s');", tocJs)),
	}); err != nil {
		log.Fatalf("Failed to execute HTML template: %v", err)
	}
}

func RegisterHandlers(recordsFile string) {
	ServeStaticFiles()
	t := template.Must(template.ParseFiles("web/game_record_viewer.html"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// The "/" pattern matches everything, so we need to check
		// that we're at the root here.
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		mainPage(recordsFile, t, w, r)
	})
}
