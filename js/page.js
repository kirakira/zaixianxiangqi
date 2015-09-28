(function(app) {

    // globals
    app.page.inGame = inGame;
    app.page.gameStarted = gameStarted;
    app.page.gameEnded = gameEnded;
    app.page.post = post;
    app.page.getSid = getSid;
    app.page.onGameInfoUpdate = onGameInfoUpdate;
    app.page.onGameInfoUpdateFailure = onGameInfoUpdateFailure;

    // init the board and game
    app.chess.newGame();
    app.board.redrawBoard();
    refreshGame();

    // start live refresh
    window.setInterval(function() { 
        requestGameInfo(currentGameId); 
    }, 1000);

    /// Functions

    function ajax(method, url, contentType, payload, success, failure) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status >= 200 && xmlhttp.status <= 299)
                    success(xmlhttp.responseText);
                else if (failure)
                    failure(xmlhttp.responseText);
            }
        }
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
                lastGameInfo = gameInfo;
                gameInfo = newGameInfo;
                refreshGame();
            } catch (err) {
                console.log("Unrecognized server response: " + data);
            }
        }
    }

    function onGameInfoUpdateFailure(data) {
        console.log("Retrieve game info failed");
    }

    function requestGameInfo(gid) {
        get("/gameinfo?gid=" + gid, onGameInfoUpdate, onGameInfoUpdateFailure);
    }

    function playersChanged(oldGameInfo, newGameInfo) {
        if (!oldGameInfo) {
            return true;
        }
        if (newGameInfo) {
            return (!oldGameInfo.black && newGameInfo.black)
                || (!oldGameInfo.red && newGameInfo.red)
                || (oldGameInfo.black && newGameInfo.black && oldGameInfo.black.id != newGameInfo.black.id)
                || (oldGameInfo.red && newGameInfo.red && oldGameInfo.red.id != newGameInfo.red.id);
        }
        return false;
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
        post("/gameinfo", "sid=" + getSid() + "&gid=" + currentGameId + "&sit=" + side,
                onGameInfoUpdate, onGameInfoUpdateFailure);
    }

    function refreshPlayerList() {
        app.board.removeAllChildren("red-player");
        app.board.removeAllChildren("black-player");
        if (gameInfo.red !== undefined &&
            gameInfo.red !== null) {
            document.getElementById("red-player").appendChild(
                    document.createTextNode("Red: " + gameInfo.red.name));
        } else {
            document.getElementById("red-player").appendChild(document.createTextNode("Red: "));
            var a = document.createElement("a");
            a.setAttribute("href", "#");
            a.setAttribute("onclick", "sit('red')");
            a.appendChild(document.createTextNode("sit here"));
            document.getElementById("red-player").appendChild(a);
        }
        if (gameInfo.black !== undefined &&
            gameInfo.black !== null) {
            document.getElementById("black-player").appendChild(
                    document.createTextNode("Black: " + gameInfo.black.name));
        } else {
            document.getElementById("black-player").appendChild(document.createTextNode("Black: "));
            var a = document.createElement("a");
            a.setAttribute("href", "#");
            a.setAttribute("onclick", "sit('black')");
            a.appendChild(document.createTextNode("sit here"));
            document.getElementById("black-player").appendChild(a);
        }
    }

    function playMove(move) {
        if (move == "" || move == "R" || move == "B")
            return;
        app.board.makeMove(
            parseInt(move[0]), parseInt(move[1]), 
            parseInt(move[2]), parseInt(move[3]));
    }

    function updateStatus() {
        app.board.removeAllChildren("status");
        var se = document.getElementById("status");
        if (!gameStarted()) {
            se.appendChild(document.createTextNode("Waiting for players to join..."));
        } else if (gameInfo.moves.endsWith("R")) {
            se.appendChild(document.createTextNode("Red won"));
        } else if (gameInfo.moves.endsWith("B")) {
            se.appendChild(document.createTextNode("Black won"));
        } else {
            if (app.chess.isRedToGo())
                se.appendChild(document.createTextNode("Red to go"));
            else
                se.appendChild(document.createTextNode("Black to go"));
        }
    }

    function refreshGame() {
        if (playersChanged(lastGameInfo, gameInfo)) {
            refreshPlayerList();
            app.board.redrawBoard();
        }

        var replay = false;
        var newMoves = gameInfo.moves.split("/");
        if (!lastGameInfo)
            replay = true;
        else {
            var oldMoves = lastGameInfo.moves.split("/");
            if (oldMoves.length != newMoves.length && oldMoves.length + 1 != newMoves.length
                    && newMoves.length + 1 != oldMoves.length)
                replay = true;
            else {
                for (var i = 0; i < Math.min(oldMoves.length, newMoves.length); ++i)
                    if (oldMoves[i] != newMoves[i])
                        replay = true;
                if (!replay) {
                    if (oldMoves.length + 1 == newMoves.length)
                        playMove(newMoves[newMoves.length - 1]);
                    else if (oldMoves.length == newMoves.length + 1) {
                        if (Date.now() - lastUpdateSent > 3000)
                            replay = true;
                        else
                            gameInfo.moves = lastGameInfo.moves;
                    }
                }
            }
        }
        if (replay) {
            app.chess.newGame();
            app.board.redrawBoard();
            for (var i = 0; i < newMoves.length; ++i)
                playMove(newMoves[i]);
        }

        updateStatus();
    }

    function inGame() {
        return (gameInfo.red && gameInfo.red.id == myUid)
            || (gameInfo.black && gameInfo.black.id == myUid);
    }

    function gameStarted() {
        return gameInfo.red && gameInfo.black;
    }

    function gameEnded() {
        return gameInfo.moves.endsWith("R") || gameInfo.moves.endsWith("B");
    }
})(xiangqi);