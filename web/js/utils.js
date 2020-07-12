function parseMoves(moves) {
    var splitMoves = moves.split("/");
    var parsedMoves = [];
    for (var i = 1; i < splitMoves.length; ++i) {
        var move = splitMoves[i];
        if (move == "R" || move == "B" || move == "D")
            break;
        parsedMoves.push(
                [parseInt(move[0], 10), parseInt(move[1], 10),
                parseInt(move[2], 10), parseInt(move[3], 10)]);
    }
    return parsedMoves;
}

function removeAllChildren(id) {
    var elem = document.getElementById(id);
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}

function createLink(id, className, url, onclick, text) {
    var a = document.createElement("a");
    if (id) {
        a.id = id;
    }
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
