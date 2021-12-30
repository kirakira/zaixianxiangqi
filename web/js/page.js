/**
 * @constructor
 */
function Game(currentGameId, myUid, gameInfo) {
    var redWatch_;
    var blackWatch_;
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

    function createInviteAILink(enabled) {
        removeAllChildren("invite-ai-container");
        var a = createLink("invite-ai-link", null, "#", function() { inviteAI(); return false; }, "invite Blur");
        document.getElementById("invite-ai-container").appendChild(a);
        if (!enabled) {
          disableLink("invite-ai-link");
        }
    }

    function disableLink(id) {
        var a = document.getElementById(id);
        var parent = a.parentElement;

        var linkText = a.innerText;
        var classList = a.classList;
        parent.removeChild(a);

        var span = document.createElement("span");
        span.classList = classList;
        span.classList.add("disabled-link");
        span.appendChild(document.createTextNode(linkText));

        parent.appendChild(span);
    }

    function sit(side) {
        disableLink(side + "-sit-link");
        post("/gameinfo", "uid=" + myUid + "&sid=" + getSid() + "&gid=" +
                  currentGameId + "&sit=" + side, onGameInfoUpdate,
                  onGameInfoUpdateFailure);
    }

    function inviteAI() {
        disableLink("invite-ai-link");
        post("/invite_ai", "uid=" + myUid + "&sid=" + getSid() + "&gid=" +
                  currentGameId, onGameInfoUpdate,
                  onGameInfoUpdateFailure);
    }

    function createHintYou(dummy) {
        var hintYou = document.createElement("sup");
        hintYou.className = "hint-you";
        if (!dummy) {
            hintYou.appendChild(document.createTextNode("you"));
        } else {
            hintYou.appendChild(document.createTextNode(" "));
        }
        return hintYou;
    }

    function refreshPlayerList() {
        removeAllChildren("red-player");
        removeAllChildren("black-player");
        if (gameInfo.red !== undefined &&
            gameInfo.red !== null) {
            var redPlayerNode = document.getElementById("red-player");
            var nameSpan = document.createElement("span");
            nameSpan.appendChild(createLink(
              "red-player-link", "player-link", "/user/" + gameInfo.red.id, undefined,
              gameInfo.red.name));
            redPlayerNode.appendChild(nameSpan);
            redPlayerNode.appendChild(createHintYou(gameInfo.red.id != myUid));
        } else {
            var a = createLink("red-sit-link", "sit-link", "#", function() { sit("red"); return false; }, "sit here");
            document.getElementById("red-player").appendChild(a);
        }
        if (gameInfo.black !== undefined &&
            gameInfo.black !== null) {
            var blackPlayerNode = document.getElementById("black-player");
            var nameSpan = document.createElement("span");
            nameSpan.appendChild(createLink(
              "black-player-link", "player-link", "/user/" + gameInfo.black.id, undefined,
              gameInfo.black.name));
            blackPlayerNode.appendChild(nameSpan);
            blackPlayerNode.appendChild(createHintYou(gameInfo.black.id != myUid));
        } else {
            var a = createLink("black-sit-link", "sit-link", "#", function() { sit("black"); return false; }, "sit here");
            document.getElementById("black-player").appendChild(a);
        }
    }

    function gameStarted() {
        return gameInfo.red && gameInfo.black;
    }

    function updateStatus() {
        var ws = document.getElementById("waitingStatus");
        var ps = document.getElementById("playingStatus");
        var rw = document.getElementById("redWonStatus");
        var bw = document.getElementById("blackWonStatus");
        ws.style.display = "none";
        ps.style.display = "none";
        rw.style.display = "none";
        bw.style.display = "none";
        if (gameInfo.moves.endsWith("R")) {
            rw.style.display = "inline-block";
            redWatch_.stop();
            blackWatch_.stop();
        } else if (gameInfo.moves.endsWith("B")) {
            bw.style.display = "inline-block";
            redWatch_.stop();
            blackWatch_.stop();
        } else if (!gameStarted()) {
            ws.style.display = "inline-block";
        } else {
            ps.style.display = "inline-block";
            if (board_.isRedNext()) {
                redWatch_.start();
                blackWatch_.stop();
            } else {
                blackWatch_.start();
                redWatch_.stop();
            }
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

        var forkGameDiv = document.getElementById("forkGame");
        removeAllChildren("forkGame");
        forkGame.appendChild(
                createLink("move-history-fork-link", undefined,
                    "/fork/" + currentGameId + "/" +
                    board_.numMovesShown().toString(),
                    undefined, "fork at move " + board_.numMovesShown()));
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
        var ai_invitable = iAmPlaying && (!gameInfo.black || !gameInfo.red);
        createInviteAILink(ai_invitable);
    }

    function initApplication() {
        // init stopwatches
        redWatch_ = new Stopwatch("redStopwatch");
        blackWatch_ = new Stopwatch("blackStopwatch");
        window.setInterval(function() {
            redWatch_.tick();
            blackWatch_.tick();
        }, 60000 / redWatch_.frequency());

        // init the board and game
        board_ = new Board(onPlayerMove);
        refreshGame();

        // start live refresh
        window.setInterval(function() { 
            requestGameInfo(currentGameId); 
        }, 1000);
    }
}

function toggleMenu() {
    var menu_span = document.getElementById("menu-text");
    var menu_content = document.getElementById("menu-content");
    if (menu_content.style.display == "grid") {
      menu_content.style.display = "none";
      menu_span.innerHTML = 'menu <span class="menu-toggle">[+]</span>';
    } else {
      menu_content.style.display = "grid";
      menu_span.innerHTML = 'menu <span class="menu-toggle">[-]</span>';
    }
}

// global: currentGameId, myUid, gameInfo
// Init applicaiton when document is loaded.
document.onreadystatechange = function() {
    if (document.readyState == "interactive" && typeof currentGameId !== "undefined") {
        var game = new Game(currentGameId, myUid, gameInfo);
    }
}
