/**
 * @constructor
 */
function ExperimentViewer(experimentMetadata, gameRecordsTOC) {
    var gameRecordResponse_ = null;
    var gameInfo_ = null;
    var selectedCell_ = null;
    var plotlyLoaded_ = false;
    var chartsInited_ = false;

    this.initApplication = initApplication;
    this.plotlyLoaded = plotlyLoaded;

    function onPlayerMove(i1, j1, i2, j2) {
      // This function should never be called as the board is always in read-only mode.
    }

    function updateGameTitle() {
        removeAllChildren("gameTitle");
        var titleDiv = document.getElementById("gameTitle");
        var h3 = document.createElement("h3");
        h3.appendChild(document.createTextNode(gameInfo_ ? gameInfo_.title : ""));
        titleDiv.appendChild(h3);
    }

    function updateStatus() {
        var ps = document.getElementById("playingStatus");
        var rw = document.getElementById("redWonStatus");
        var bw = document.getElementById("blackWonStatus");
        var ds = document.getElementById("drawStatus");
        ps.style.display = "none";
        rw.style.display = "none";
        bw.style.display = "none";
        ds.style.display = "none";
        if (gameInfo_ ) {
            if (gameInfo_.moves.endsWith("R")) {
                rw.style.display = "inline-block";
            } else if (gameInfo_.moves.endsWith("B")) {
                bw.style.display = "inline-block";
            } else if (gameInfo_.moves.endsWith("D")) {
                ds.style.display = "inline-block";
            } else {
                ps.style.display = "inline-block";
            }
        }
    }

    function ajax(method, url, contentType, payload, success, failure) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
                    success(xmlhttp.responseText);
                } else if (failure) {
                    failure(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.open(method, url, true);
        if (contentType) {
            xmlhttp.setRequestHeader("Content-type", contentType);
        }
        if (payload) {
            xmlhttp.send(payload);
        } else {
            xmlhttp.send();
        }
    }

    function get(url, success, failure) {
        ajax("GET", url, undefined, undefined, success, failure);
    }

    function post(url, payload, success, failure) {
        ajax("POST", url,
                "application/x-www-form-urlencoded; charset=UTF-8", payload, success, failure);
    }

    function endPointFor(path) {
        return encodeURI(path);
    }

    function onGameRecordResponse(gameId, data) {
        gameRecordResponse_ = JSON.parse(data);
        gameInfo_ = gameRecordResponse_.game_info;
        updateSelectedGame(gameId);
        refreshPage();
    }

    function updateSelectedGame(gameId) {
        if (selectedCell_) {
            selectedCell_.classList.remove("selectedGame");
        }
        var td = document.getElementById("game-record-" + gameId);
        td.classList.remove("pendingSelection");
        td.classList.add("selectedGame");
        selectedCell_ = td;
        window.location.hash = "#" + gameId;
    }

    function showGame(gameId) {
        var td = document.getElementById("game-record-" + gameId);
        if (td) {
            td.classList.add("pendingSelection");
            requestGameInfo(gameId);
        } else {
            alert("Game " + gameId + " does not exist.");
        }
    }

    function requestGameInfo(gameId) {
        get(endPointFor("/game_record/" + experimentMetadata.id + "/" + gameId), function(data) {
            onGameRecordResponse(gameId, data);
        }, function(gameId, content) {
            var td = document.getElementById("game-record-" + gameId);
            if (td) {
                td.classList.remove("pendingSelection");
            }
            alert("Failed to retrieve game record");
        });
    }

    function initializeTOC() {
        var table = document.getElementById("gameList");
        for (var i = 0; i < gameRecordsTOC.length; i++) {
            var gameRecord = gameRecordsTOC[i];
            var controlIsRed = gameRecord.hasOwnProperty("control_is_red")
                                && gameRecord.control_is_red;

            var tr = document.createElement("tr");
            {
                var td = document.createElement("td");
                var outcome = 0;
                if (gameRecord.hasOwnProperty("result")) {
                    if (gameRecord.result == 1) {
                        outcome = !controlIsRed ? 1 : 2;
                    } else if (gameRecord.result == 2) {
                        outcome = controlIsRed ? 1 : 2;
                    }
                }
                if (outcome == 0) {
                    td.appendChild(document.createTextNode("D"));
                    td.classList.add("draw");
                } else if (outcome == 1) {
                    td.appendChild(document.createTextNode("W"));
                    td.classList.add("win");
                } else {
                    td.appendChild(document.createTextNode("L"));
                    td.classList.add("loss");
                }
                tr.appendChild(td);
            }

            {
                var td = document.createElement("td");
                td.appendChild(document.createTextNode(gameRecord.game_id));
                td.onclick = function(gameRecordCopy) {
                      return function() { showGame(gameRecordCopy.game_id); };
                    }(gameRecord);
                td.id = "game-record-" + gameRecord.game_id;
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
    }

    function refreshPlayerList() {
        removeAllChildren("red-player");
        var redPlayerNode = document.getElementById("red-player");
        var nameSpan = document.createElement("span");
        if (gameInfo_) {
          nameSpan.appendChild(document.createTextNode(gameInfo_.red.name));
        }
        redPlayerNode.appendChild(nameSpan);

        removeAllChildren("black-player");
        var blackPlayerNode = document.getElementById("black-player");
        var nameSpan = document.createElement("span");
        if (gameInfo_) {
          nameSpan.appendChild(document.createTextNode(gameInfo_.black.name));
        }
        blackPlayerNode.appendChild(nameSpan);
    }

    function refreshPage() {
        refreshPlayerList();
        board_.resetState("r", true, parseMoves(gameInfo_ ? gameInfo_.moves : ""));
        updateGameTitle();
        updateStatus();
        refreshMoveHistoryControls();
        refreshCharts();
    }

    function appendCellToRow(row, cell) {
        var td = document.createElement("td");
        td.appendChild(cell);
        row.appendChild(td);
    }

    function refreshMoveHistoryControls() {
        removeAllChildren("move-history");
        var div = document.getElementById("move-history");
        var table = document.createElement("table");
        table.id = "moveHistoryControls";
        var row = document.createElement("tr");
        table.appendChild(row);

        if (board_.numMovesShown() > 0) {
            appendCellToRow(row, createLink("move-history-first", undefined, "#", function() {
                board_.showMove(0);
                refreshMoveHistoryControls();
                return false;
            }, "first"));

            appendCellToRow(row, createLink("move-history-prev", undefined, "#", function() {
                board_.showMove(board_.numMovesShown() - 1);
                refreshMoveHistoryControls();
                return false;
            }, "prev"));
        } else {
            appendCellToRow(row, document.createTextNode("first"));
            appendCellToRow(row, document.createTextNode("prev"));
        }

        appendCellToRow(row, document.createTextNode("" + board_.numMovesShown() + " / " + board_.numMoves()));

        if (board_.numMovesShown() < board_.numMoves()) {
            appendCellToRow(row, createLink("move-history-next", undefined, "#", function() {
                board_.showMove(board_.numMovesShown() + 1);
                refreshMoveHistoryControls();
                return false;
            }, "next"));

            appendCellToRow(row, createLink("move-history-last", undefined, "#", function() {
                board_.showMove(board_.numMoves());
                refreshMoveHistoryControls();
                return false;
            }, "last"));
        } else {
            appendCellToRow(row, document.createTextNode("next"));
            appendCellToRow(row, document.createTextNode("last"));
        }

        div.appendChild(table);

        var fen = document.getElementById("fen");
        removeAllChildren("fen");
        fen.appendChild(document.createTextNode(board_.getFen()));
    }

    function initApplication() {
        // init the board and game
        board_ = new Board(onPlayerMove);
        initializeTOC();
        refreshPage();
        if (window.location.hash) {
            showGame(window.location.hash.substring(1));
        } else if (gameRecordsTOC.length > 0) {
            showGame(gameRecordsTOC[0].game_id);
        }
    }

    function getScoresData(index) {
        var scores = gameRecordResponse_.game_record.scores;
        var x = [], y =[];
        for (var i = index; i < scores.length; i += 2) {
            x.push(i + 1);
            y.push(scores[i]);
        }
        return {
            x: x,
            y: y,
            type: "scatter",
        };
    }

    function getCustomYRange() {
        var scores = gameRecordResponse_.game_record.scores;
        var y = [];
        for (var i = 0; i < scores.length; ++i) {
            y.push(scores[i]);
        }
        if (y.length <= 2 || Math.abs(y[y.length - 1]) < 400) {
            return null;
        }
        var slice = y.slice(0, y.length - 2);
        return [Math.min(...slice), Math.max(...slice)];
    }

    function refreshCharts() {
        if (!plotlyLoaded_ || !gameRecordResponse_) return;

        var redData = getScoresData(0), blackData = getScoresData(1);
        redData.name = gameInfo_.red.name;
        blackData.name = gameInfo_.black.name;

        var layout = {
            showlegend: true,
            legend: {
                bgcolor: 'rgba(0, 0, 0, 0)',
                x: 0,
                xanchor: 'left',
                y: 1,
            },
        };
        var yRange = getCustomYRange(); 
        if (yRange) {
            layout.yaxis = { range: yRange };
        };

        if (!chartsInited_) {
          chartsInited_ = true;
          Plotly.newPlot("engineScoreChart", [redData, blackData], layout);
        } else {
          Plotly.react("engineScoreChart", [redData, blackData], layout);
        }
    }

    function plotlyLoaded() {
        plotlyLoaded_ = true;
        refreshCharts();
    }
}

var recordViewer = new ExperimentViewer(experimentMetadata, toc);

document.onreadystatechange = function() {
    if (document.readyState == "interactive") {
        recordViewer.initApplication();
    }
};

window.onload = function() {
    recordViewer.plotlyLoaded();
};
