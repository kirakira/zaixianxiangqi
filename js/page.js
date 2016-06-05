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

function Game(currentGameId, myUid, gameInfo) {
    var board_;
    var ajaxSequence_ = 0;

    initApplication();

    function ajax(method, url, contentType, payload, success, failure) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(packetSequence) {
            return function() {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
                        if (packetSequence >= ajaxSequence_) {
                            success(xmlhttp.responseText);
                        } else {
                            console.log("Dropped an old packet.");
                        }
                    } else if (failure)
                        failure(xmlhttp.responseText);
                }
            };
        }(ajaxSequence_);
        xmlhttp.open(method, url, true);
        if (contentType)
            xmlhttp.setRequestHeader("Content-type", contentType);
        if (payload)
            xmlhttp.send(payload);
        else
            xmlhttp.send();
    }

    function get(url, success, failure) {
        ajax("GET", url, undefined, undefined, success, failure);
    }

    function post(url, payload, success, failure) {
        ++ajaxSequence_;
        ajax("POST", url, "application/x-www-form-urlencoded; charset=UTF-8", payload, success, failure);
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
                    [parseInt(move[0]), parseInt(move[1]), 
                    parseInt(move[2]), parseInt(move[3])]);
        }
        return parsedMoves;
    }

    // move is an array of 4 elements: [i1, j1, i2, j2].
    function moveToString(move) {
        return "" + move[0] + move[1] + move[2] + move[3];
    }


    function onPlayerMove(i1, j1, i2, j2) {
        gameInfo.moves += "/" + moveToString([i1, j1, i2, j2]);
        post("/gameinfo", 
                "sid=" + getSid() +
                "&gid=" + currentGameId +
                "&moves=" + gameInfo.moves,
                onGameInfoUpdate,
                onGameInfoUpdateFailure);
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
        parent.appendChild(document.createTextNode("sitting..."));
        post("/gameinfo", "sid=" + getSid() + "&gid=" + currentGameId + "&sit=" + side,
                onGameInfoUpdate, onGameInfoUpdateFailure);
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
            var a = document.createElement("a");
            a.id = "red-sit-link";
            a.href = "#";
            a.onclick = function() { sit("red"); };
            a.appendChild(document.createTextNode("sit here"));
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
            var a = document.createElement("a");
            a.id = "black-sit-link";
            a.href = "#";
            a.onclick = function() { sit("black"); };
            a.appendChild(document.createTextNode("sit here"));
            document.getElementById("black-player").appendChild(a);
        }
    }

    function gameStarted() {
        return gameInfo.red && gameInfo.black;
    }

    function updateStatus() {
        removeAllChildren("status");
        var se = document.getElementById("status");
        if (!gameStarted()) {
            se.appendChild(document.createTextNode("Waiting for players to join..."));
        } else if (gameInfo.moves.endsWith("R")) {
            se.appendChild(document.createTextNode("Red won"));
        } else if (gameInfo.moves.endsWith("B")) {
            se.appendChild(document.createTextNode("Black won"));
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

    function refreshGame() {
        refreshPlayerList();
        var mySide = "r";
        if (gameInfo.black && gameInfo.black.id == myUid)
            mySide = "b";
        board_.setState(mySide, !gameInProgress(), parseMoves(gameInfo.moves));
        updateStatus();
    }

    function initApplication() {
        // init the board and game
        board_ = new Board(onPlayerMove);
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
