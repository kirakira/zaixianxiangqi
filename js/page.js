// Define String.endsWith for Safari in order to comply with ECMA6
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
          position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

/**
 * @constructor
 */
function Game(currentGameId, myUid, gameInfo) {
    var board_;
    // Updates with sequence number <= LWM have been resolved.
    var ajaxSequenceLWM_ = 0;
    // The latest update sent has sequence number == HWM.
    var ajaxSequenceHWM_ = 0;
    // The list of pending sequence numbers.
    var pendingSequences_ = [];

    initApplication();

    function addPendingRequest() {
        ++ajaxSequenceHWM_;
        pendingSequences_.push(ajaxSequenceHWM_);
        return ajaxSequenceHWM_;
    }

    function resolveRequest(sequence) {
        var index = pendingSequences_.indexOf(sequence);
        if (index != -1) {
            pendingSequences_.splice(index, 1);
            for (var i = ajaxSequenceLWM_ + 1; i <= ajaxSequenceHWM_; ++i) {
                index = pendingSequences_.indexOf(i);
                if (index == -1) {
                    ajaxSequenceLWM_ = i;
                } else {
                    break;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    // sequence: the result from this request will represent the state of this
    // sequence number.
    function ajax(method, url, sequence, contentType, payload, success, failure) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                requestResolved = resolveRequest(sequence);
                if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
                    if (requestResolved || ajaxSequenceHWM_ == sequence) {
                        success(xmlhttp.responseText);
                    } else {
                        console.log("Dropped response from an old request.");
                    }
                } else if (failure)
                    failure(xmlhttp.responseText);
            }
        };
        xmlhttp.open(method, url, true);
        if (contentType)
            xmlhttp.setRequestHeader("Content-type", contentType);
        if (payload)
            xmlhttp.send(payload);
        else
            xmlhttp.send();
    }

    function get(url, success, failure) {
        ajax("GET", url, ajaxSequenceLWM_, undefined, undefined, success, failure);
    }

    function post(url, payload, success, failure) {
        ajax("POST", url, addPendingRequest(),
                "application/x-www-form-urlencoded; charset=UTF-8", payload, success, failure);
    }

    function onGameInfoUpdate(data) {
        if (data == "fail")
            alert("Operation failed");
        else {
            try {
                var newGameInfo = JSON.parse(data);
                if (newGameInfo.gameinfo) {
                    if (newGameInfo.status !== "success")
                        console.log("last update failed");
                    newGameInfo = newGameInfo.gameinfo
                }
                gameInfo = newGameInfo;
                refreshGame();
            } catch (err) {
                console.log("Unrecognized server response: " + data);
            }
        }
    }

    function parseMoves(moves) {
        var splitMoves = moves.split("/");
        var parsedMoves = [];
        for (var i = 1; i < splitMoves.length; ++i) {
            var move = splitMoves[i];
            if (move == "R" || move == "B")
                break;
            parsedMoves.push(
                    [parseInt(move[0], 10), parseInt(move[1], 10),
                    parseInt(move[2], 10), parseInt(move[3], 10)]);
        }
        return parsedMoves;
    }

    // move is an array of 4 elements: [i1, j1, i2, j2].
    function moveToString(move) {
        return "" + move[0] + move[1] + move[2] + move[3];
    }


    function onPlayerMove(i1, j1, i2, j2) {
        gameInfo.moves += "/" + moveToString([i1, j1, i2, j2]);
        updateStatus();
        post("/gameinfo", 
                "uid=" + myUid +
                "&sid=" + getSid() +
                "&gid=" + currentGameId +
                "&moves=" + gameInfo.moves,
                onGameInfoUpdate,
                onGameInfoUpdateFailure);
        refreshMoveHistoryControls();
    }

    function onGameInfoUpdateFailure(data) {
        console.log("Retrieve game info failed");
    }

    function requestGameInfo(gid) {
        get("/gameinfo?gid=" + gid, onGameInfoUpdate, onGameInfoUpdateFailure);
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; ++i) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    function getSid() {
        return getCookie("sid");
    }

    function sit(side) {
        var parent = document.getElementById(side + "-player");
        var a = document.getElementById(side + "-sit-link");
        parent.removeChild(a);
        parent.appendChild(document.createTextNode("sitting down..."));
        post("/gameinfo", "uid=" + myUid + "&sid=" + getSid() + "&gid=" +
                currentGameId + "&sit=" + side, onGameInfoUpdate,
                onGameInfoUpdateFailure);
    }

    function createLink(id, className, url, onclick, text) {
        var a = document.createElement("a");
        a.id = id;
        if (className) {
            a.className = className;
        }
        a.href = url;
        if (onclick) {
            a.onclick = onclick;
        }
        a.appendChild(document.createTextNode(text));
        return a;
    }

    function refreshPlayerList() {
        removeAllChildren("red-player");
        removeAllChildren("black-player");
        if (gameInfo.red !== undefined &&
            gameInfo.red !== null) {
            var hintYou = "";
            if (gameInfo.red.id == myUid) {
                hintYou = " (you)";
            }
            document.getElementById("red-player").appendChild(
                    document.createTextNode("Red: " + gameInfo.red.name + hintYou));
        } else {
            document.getElementById("red-player").appendChild(document.createTextNode("Red: "));
            var a = createLink("red-sit-link", undefined, "#", function() { sit("red"); return false; }, "sit here");
            document.getElementById("red-player").appendChild(a);
        }
        if (gameInfo.black !== undefined &&
            gameInfo.black !== null) {
            var hintYou = "";
            if (gameInfo.black.id == myUid) {
                hintYou = " (you)";
            }
            document.getElementById("black-player").appendChild(
                    document.createTextNode("Black: " + gameInfo.black.name + hintYou));
        } else {
            document.getElementById("black-player").appendChild(document.createTextNode("Black: "));
            var a = createLink("black-sit-link", undefined, "#", function() { sit("black"); return false; }, "sit here");
            document.getElementById("black-player").appendChild(a);
        }
    }

    function gameStarted() {
        return gameInfo.red && gameInfo.black;
    }

    function updateStatus() {
        removeAllChildren("status");
        var se = document.getElementById("status");
        if (gameInfo.moves.endsWith("R")) {
            se.appendChild(document.createTextNode("Red won"));
        } else if (gameInfo.moves.endsWith("B")) {
            se.appendChild(document.createTextNode("Black won"));
        } else if (!gameStarted()) {
            se.appendChild(document.createTextNode("Waiting for players to join..."));
        } else {
            if (board_.isRedNext())
                se.appendChild(document.createTextNode("Red to go"));
            else
                se.appendChild(document.createTextNode("Black to go"));
        }
    }

    function gameInProgress() {
        return gameStarted() && !gameInfo.moves.endsWith("R") && !gameInfo.moves.endsWith("B");
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

        var innerDiv = document.createElement("div");
        innerDiv.id = "moveHistoryFork";
        innerDiv.appendChild(
                createLink("move-history-fork-link", undefined,
                    "/fork/" + currentGameId + "/" +
                    board_.numMovesShown().toString(),
                    undefined, "fork"));
        innerDiv.appendChild(document.createTextNode(" this game from here"));
        div.appendChild(innerDiv);
    }

    function refreshGame() {
        refreshPlayerList();
        var mySide = "r";
        if (gameInfo.black && gameInfo.black.id == myUid)
            mySide = "b";
        var iAmPlaying =
            (gameInfo.black && gameInfo.black.id == myUid) ||
                (gameInfo.red && gameInfo.red.id == myUid);
        board_.setState(mySide, !gameInProgress() || !iAmPlaying, parseMoves(gameInfo.moves));
        updateStatus();
        refreshMoveHistoryControls();
    }

    function initApplication() {
        // init the board and game
        board_ = new Board(onPlayerMove, false /* enableSpecialText */);
        refreshGame();

        // start live refresh
        window.setInterval(function() { 
            requestGameInfo(currentGameId); 
        }, 1000);
    }
}

// global: currentGameId, myUid, gameInfo
// Init applicaiton when document is loaded.
document.onreadystatechange = function() {
    if (document.readyState == "interactive") {
        var game = new Game(currentGameId, myUid, gameInfo);
    }
}
