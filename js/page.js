var lastGameInfo;
var lastUpdateSent = 0;

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

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
    removeAllChildren("red-player");
    removeAllChildren("black-player");
    if (gameInfo.red) {
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
    if (gameInfo.black) {
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
    makeMove(parseInt(move[0]), parseInt(move[1]),
            parseInt(move[2]), parseInt(move[3]));
}

function updateStatus() {
    removeAllChildren("status");
    var se = document.getElementById("status");
    if (!gameStarted()) {
        se.appendChild(document.createTextNode("Waiting for players to join..."));
    } else if (endsWith(gameInfo.moves, "R")) {
        se.appendChild(document.createTextNode("Red won"));
    } else if (endsWith(gameInfo.moves, "B")) {
        se.appendChild(document.createTextNode("Black won"));
    } else {
        if (isRedToGo())
            se.appendChild(document.createTextNode("Red to go"));
        else
            se.appendChild(document.createTextNode("Black to go"));
    }
}

function refreshGame() {
    if (playersChanged(lastGameInfo, gameInfo)) {
        refreshPlayerList();
        redrawBoard();
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
        newGame();
        redrawBoard();
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
    return endsWith(gameInfo.moves, "R") || endsWith(gameInfo.moves, "B");
}

// global: currentGameId, myUid, gameInfo, lastGameInfo
newGame();
redrawBoard();
refreshGame();
window.setInterval(function() { requestGameInfo(currentGameId); }, 1000);
