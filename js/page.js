var lastGameInfo;

function ajax(method, url, payload, success, failure) {
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
    if (payload)
        xmlhttp.send(payload);
    else
        xmlhttp.send();
}

function get(url, success, failure) {
    ajax("GET", url, undefined, success, failure);
}

function post(url, payload, success, failure) {
    ajax("POST", url, payload, success, failure);
}

function requestGameInfo(gid) {
    get("/gameinfo?gid=" + gid, function(data) {
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
    removeAllChildren("red-player");
    removeAllChildren("black-player");
    if (gameInfo.red) {
        document.getElementById("red-player").appendChild(
                document.createTextNode(gameInfo.red.name));
    } else {
        var a = document.createElement("a");
        a.setAttribute("href", "#");
        a.setAttribute("onclick", "sitRed()");
        document.getElementById("red-player").appendChild(a);
    }
    if (gameInfo.black) {
        document.getElementById("black-player").appendChild(
                document.createTextNode(gameInfo.black.name));
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
window.setInterval(requestGameInfo(currentGameId), 500);
