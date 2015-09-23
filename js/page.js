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

function onGameInfoUpdate(data) {
    if (data == "fail")
        alert("Operation failed");
    else {
        try {
            var newGameInfo = JSON.parse(data);
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

function sitRed() {
    post("/gameinfo", "sid=" + getSid() + "&gid=" + currentGameId + "&sit=red",
            onGameInfoUpdate, onGameInfoUpdateFailure);
}

function sitBlack() {
    post("/gameinfo", "sid=" + getSid() + "&gid=" + currentGameId + "&sit=black",
            onGameInfoUpdate, onGameInfoUpdateFailure);
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
        a.appendChild(document.createTextNode("sit here"));
        document.getElementById("red-player").appendChild(a);
    }
    if (gameInfo.black) {
        document.getElementById("black-player").appendChild(
                document.createTextNode(gameInfo.black.name));
    } else {
        var a = document.createElement("a");
        a.setAttribute("href", "#");
        a.setAttribute("onclick", "sitBlack()");
        a.appendChild(document.createTextNode("sit"));
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
window.setInterval(function() { requestGameInfo(currentGameId); }, 1000);
