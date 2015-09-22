var lastGameInfo;

function post(url, payload, success, failure) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status >= 200 && xmlhttp.status <= 299)
                success(xmlhttp.responseText);
            else if (failure)
                failure(xmlhttp.responseText);
        }
    }
    xmlhttp.open("POST", "gameinfo", true);
    xmlhttp.send(payload);
}

function requestGameInfo(gid) {
    post("gameinfo", "gid=" + gid, function(data) {
        lastGameInfo = gameInfo;
        gameInfo = JSON.parse(data);
        refreshGame();
    }, function(data) {
        console.log("Request game info failed");
    });
}

function playersChanged(oldGameInfo, newGameInfo) {
    if (!oldGameInfo)
        return true;
    if (newGameInfo) {
        return (oldGameInfo.black != newGameInfo.black
                || oldGameInfo.red != newGameInfo.red);
    }
    return false;
}

function refreshPlayerList() {
    removeAllChilren("red-player");
    removeAllChildren("black-player");
    if (gameInfo.redPlayer) {
        document.getElementById("red-player").appendChild(
                document.createTextNode(gameInfo.redPlayer));
    } else {
        var a = document.createElement("a");
        a.setAttribute("href", "#");
        a.setAttribute("onclick", "sitRed()");
        document.getElementById("red-player").appendChild(a);
    }
    if (gameInfo.blackPlayer) {
        document.getElementById("black-player").appendChild(
                document.createTextNode(gameInfo.blackPlayer));
    } else {
        var a = document.createElement("a");
        a.setAttribute("href", "#");
        a.setAttribute("onclick", "sitBlack()");
        document.getElementById("black-player").appendChild(a);
    }
}

function refreshGame() {
    if (playersChanged(lastGameInfo, gameInfo))
        refreshPlayerList();
    newGame();
}

// global: currentGameId, gameInfo, lastGameInfo
refreshGame();
window.setTimeInterval(requestGameInfo(currentGameId), 500);
