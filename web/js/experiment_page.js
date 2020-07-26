/**
 * @constructor
 */
function ExperimentViewer(experimentMetadata, gameRecordsTOC) {
    var gameRecordResponse_ = null;
    var gameInfo_ = null;
    var selectedCell_ = null;
    var selectedGameIndex_ = null;
    var plotlyLoaded_ = false;
    var chartsInited_ = false;
    var numMovesToShowAtRest_ = 0;
    var inCallback_ = false;

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

        for (var i = 0; i < gameRecordsTOC.length; ++i) {
            if (gameRecordsTOC[i].game_id == gameId) {
                selectedGameIndex_ = i;
            }
        }
    }

    function selectGameByIndex(idx) {
        idx = Math.min(gameRecordsTOC.length - 1, idx);
        idx = Math.max(0, idx);
        if (idx < gameRecordsTOC.length) {
            showGame(gameRecordsTOC[idx].game_id);
        }
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

    function controlIsRed(gameRecord) {
        return gameRecord.hasOwnProperty("control_is_red") && gameRecord.control_is_red;
    }

    function initializeTOC() {
        var table = document.getElementById("gameList");
        for (var i = 0; i < gameRecordsTOC.length; i++) {
            var gameRecord = gameRecordsTOC[i];

            var tr = document.createElement("tr");
            {
                var td = document.createElement("td");
                var outcome = 0;
                if (gameRecord.hasOwnProperty("result")) {
                    if (gameRecord.result == 1) {
                        outcome = !controlIsRed(gameRecord) ? 1 : 2;
                    } else if (gameRecord.result == 2) {
                        outcome = controlIsRed(gameRecord) ? 1 : 2;
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
        numMovesToShowAtRest_ = gameInfo_ ? gameInfo_.moves.length : 0;
        updateGameTitle();
        updateStatus();
        refreshCharts();
        updateCurrentMove(board_.numMovesShown(), true);
    }

    function appendCellToRow(row, cell) {
        var td = document.createElement("td");
        td.appendChild(cell);
        row.appendChild(td);
    }

    function updateMoveHistoryControls() {
        removeAllChildren("move-history");
        var div = document.getElementById("move-history");
        var table = document.createElement("table");
        table.id = "moveHistoryControls";
        var row = document.createElement("tr");
        table.appendChild(row);

        if (board_.numMovesShown() > 0) {
            appendCellToRow(row, createLink("move-history-first", undefined, "#", function() {
                updateCurrentMove(0, true);
                return false;
            }, "first"));

            appendCellToRow(row, createLink("move-history-prev", undefined, "#", function() {
                updateCurrentMove(board_.numMovesShown() - 1, true);
                return false;
            }, "prev"));
        } else {
            appendCellToRow(row, document.createTextNode("first"));
            appendCellToRow(row, document.createTextNode("prev"));
        }

        appendCellToRow(row, document.createTextNode("" + board_.numMovesShown() + " / " + board_.numMoves()));

        if (board_.numMovesShown() < board_.numMoves()) {
            appendCellToRow(row, createLink("move-history-next", undefined, "#", function() {
                updateCurrentMove(board_.numMovesShown() + 1, true);
                return false;
            }, "next"));

            appendCellToRow(row, createLink("move-history-last", undefined, "#", function() {
                updateCurrentMove(board_.numMoves(), true);
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
        document.addEventListener("keydown", function (e) {
            if (e.key == "ArrowLeft" || e.key == "h") {
                updateCurrentMove(board_.numMovesShown() - 1, true);
                return false;
            } else if (e.key == "ArrowRight" || e.key == "l") {
                updateCurrentMove(board_.numMovesShown() + 1, true);
                return false;
            } else if (e.key == "PageUp") {
                updateCurrentMove(board_.numMovesShown() - 10, true);
                return false;
            } else if (e.key == "PageDown") {
                updateCurrentMove(board_.numMovesShown() + 10, true);
                return false;
            } else if (e.key == "Home") {
                updateCurrentMove(0, true);
                return false;
            } else if (e.key == "End") {
                updateCurrentMove(board_.numMoves(), true);
                return false;
            } else if (e.key == "ArrowUp" || e.key == "k") {
                selectGameByIndex(selectedGameIndex_ - 1);
                return false;
            } else if (e.key == "ArrowDown" || e.key == "j") {
                selectGameByIndex(selectedGameIndex_ + 1);
                return false;
            }
        });
    }

    function getScoresPlotData(index) {
        var scores = gameRecordResponse_.game_record.scores;
        var x = [0], y =[0];
        for (var i = 0; i < scores.length; ++i) {
            x.push(i + 1);
            y.push(scores[Math.min(scores.length - 1, Math.floor(i / 2) * 2 + index)]);
        }
        return {
            x: x,
            y: y,
            type: "scatter",
            hoverinfo: "y",
        };
    }

    function getScoresYRange() {
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

    function getDepthPlotData(index) {
        var output = gameRecordResponse_.game_record.output;
        var x = [0], y =[0];
        for (var i = 0; i < output.length; ++i) {
            x.push(i + 1);
            y.push(output[Math.min(output.length - 1, Math.floor(i / 2) * 2 + index)].last_complete_depth.depth);
        }
        return {
            x: x,
            y: y,
            type: "scatter",
            hoverinfo: "y",
        };
    }

    function updateCurrentMove(x, updateMoveAtRest) {
        movesToShow = board_.showMove(x);
        if (updateMoveAtRest) {
            numMovesToShowAtRest_ = movesToShow;
        }

        updateMoveHistoryControls();
        updateChartsCurrentMove();
        updatePV();
    }

    function updateChartsCurrentMove() {
        if (chartsInited_ && gameInfo_) {
            var update = {
              'shapes[0].x0': numMovesToShowAtRest_,
              'shapes[0].x1': numMovesToShowAtRest_,
              'shapes[1].x0': board_.numMovesShown(),
              'shapes[1].x1': board_.numMovesShown(),
            };
            ["engineScoreChart", "engineDepthChart"].forEach(function (divId) {
                var div = document.getElementById(divId);
                Plotly.relayout(div, update);
                Plotly.Fx.hover(div, [
                    {curveNumber: 0, pointNumber: board_.numMovesShown(), },
                    {curveNumber: 1, pointNumber: board_.numMovesShown(), },
                ]);
            });
        }
    }

    function onHoverClickScoreChart(x, updateMovesAtRest) {
        if (gameInfo_ && x >= 1 && x <= board_.numMoves()) {
            updateCurrentMove(x, updateMovesAtRest);
        }
    }

    function refreshCharts() {
        if (!plotlyLoaded_ || !gameRecordResponse_) return;
        refreshEngineChart("engineScoreChart", "Engine scores", getScoresPlotData(0), getScoresPlotData(1), getScoresYRange());
        refreshEngineChart("engineDepthChart", "Engine depths", getDepthPlotData(0), getDepthPlotData(1), null);
        chartsInited_ = true;
    }

    function refreshEngineChart(divId, title, redData, blackData, yRange) {
        redData.name = gameInfo_.red.name;
        blackData.name = gameInfo_.black.name;
        if (controlIsRed(gameRecordResponse_.game_record)) {
            data = [blackData, redData];
        } else {
            data = [redData, blackData];
        }

        var layout = {
            title: title,
            showlegend: true,
            legend: {
                bgcolor: 'rgba(0, 0, 0, 0)',
                x: 0,
                xanchor: 'left',
                y: 1,
            },
            margin: {
                l: 20,
                r: 20,
                t: 40,
                b: 40,
            },
            shapes: [
                {
                    type: "line",
                    xref: "x",
                    yref: "paper",
                    x0: board_.numMovesShown(),
                    x1: board_.numMovesShown(),
                    y0: 0,
                    y1: 1,
                    fillcolor: '#121212',
                    opacity: 0.4,
                },
                {
                    type: "line",
                    xref: "x",
                    yref: "paper",
                    x0: board_.numMovesShown(),
                    x1: board_.numMovesShown(),
                    y0: 0,
                    y1: 1,
                    fillcolor: '#d3d3d3',
                    opacity: 0.2,
                    line: {
                        dash: "dot",
                    }
                },
            ],
            hovermode: "x+closest",
        };
        if (yRange) {
            layout.yaxis = { range: yRange };
        };

        if (!chartsInited_) {
          Plotly.newPlot(divId, data, layout, {
              displayModeBar: false,
              responsive: true,
          });
          var div = document.getElementById(divId);
          div.on("plotly_hover", function(data) {
              // Update the state only when we are not already called from the
              // callback to avoid an infinite loop, as this function is called from
              // updateChartsCurrentMove() recursively through the hover event
              // callback.
              if (!inCallback_) {
                  inCallback_ = true;
                  onHoverClickScoreChart(data.points[0].x, false);
                  inCallback_ = false;
              }
          });
          div.on("plotly_click", function(data) {
              onHoverClickScoreChart(data.points[0].x, true);
          });
          div.addEventListener("mouseleave", function(data) {
              // Plotly adds drag cover on click and that triggers mouseleave
              // event even when the mouse is still inside the plot. Ignore the
              // event if that's the case.
              if (data.relatedTarget && !data.relatedTarget.classList.contains("dragcover")) {
                  updateCurrentMove(numMovesToShowAtRest_, false);
              }
          });
        } else {
          Plotly.react(divId, data, layout);
        }
    }

    function updatePV() {
        removeAllChildren("pv");
        if (!gameInfo_ || board_.numMovesShown() == 0) return;

        var gameRecord = gameRecordResponse_.game_record;
        var engineColorBlock = document.getElementById("currentEngineColor");
        if (controlIsRed(gameRecord) && board_.numMovesShown() % 2 == 1) {
            engineColorBlock.classList.remove("engineColorTreatment");
            engineColorBlock.classList.add("engineColorControl");
        } else {
            engineColorBlock.classList.remove("engineColorControl");
            engineColorBlock.classList.add("engineColorTreatment");
        }

        var pv = gameRecord.output[board_.numMovesShown() - 1].last_complete_depth.pv;
        var ul = document.getElementById("pv");
        pv.forEach(function (move) {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(move));
            ul.appendChild(li);
        });
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
