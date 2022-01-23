function parseMoves(moves) {
    var splitMoves = moves.split("/");
    var parsedMoves = [];
    for (var i = 1; i < splitMoves.length; ++i) {
        var move = splitMoves[i];
        if (move == "R" || move == "B" || move == "D")
            break;
        parsedMoves.push(
            [parseInt(move[0], 10), parseInt(move[1], 10),
                parseInt(move[2], 10), parseInt(move[3], 10)
            ]);
    }
    return parsedMoves;
}

function removeAllChildren(id) {
    var elem = document.getElementById(id);
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}

function createLink(id, classList, url, onclick, text) {
    var a = document.createElement("a");
    if (id) {
        a.id = id;
    }
    classList.forEach((c) => {
        a.classList.add(c);
    });
    a.href = url;
    if (onclick) {
        a.onclick = onclick;
    }
    a.appendChild(document.createTextNode(text));
    return a;
}

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

function ajax(method, url, contentType, payload, success, failure) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
                success(xmlhttp.responseText);
            } else {
                failure(xmlhttp.responseText);
            }
        }
    }
    xmlhttp.open(method, url, true);
    if (contentType)
        xmlhttp.setRequestHeader("Content-type", contentType);
    if (payload) {
        xmlhttp.send(payload);
    } else {
        xmlhttp.send();
    }
}

function ajaxGet(url, success, failure) {
    ajax("GET", url, undefined, undefined, success, failure);
}

function ajaxPost(url, payload, success, failure) {
    ajax("POST", url,
        "application/x-www-form-urlencoded; charset=UTF-8", payload,
        success, failure);
}

function enableLink(id, enable) {
    var elem = document.getElementById(id);
    if (enable) {
        elem.classList.remove("disabled");
    } else {
        elem.classList.add("disabled");
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; ++i) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c
            .length);
    }
    return "";
}

function getSid() {
    return getCookie("sid");
}

function setSpanText(id, text) {
    removeAllChildren(id);
    var span = document.getElementById(id);
    span.appendChild(document.createTextNode(text));
}

function getTextWidth(text, font) {
  // re-use canvas object for better performance
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}
