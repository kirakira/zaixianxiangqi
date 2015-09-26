var SVG_NS = "http://www.w3.org/2000/svg";
var PIECE_TEXTS = ["", "將", "士", "象", "馬", "車", "砲", "卒",
                   "", "帥", "仕", "相", "傌", "俥", "炮", "兵"];
var gridSize = 50, middleGap = 0;
var selected = false, select_i, select_j;

function getSVG() {
    return document.getElementById("board");
}

function getGridX(i, j) {
    return gridSize / 2 + j * gridSize;
}

function getGridY(i, j) {
    if (j < 5)
        return gridSize / 2 + i * gridSize;
    else
        return gridSize / 2 + i * gridSize + middleGap;
}

function createLine(x1, y1, x2, y2, c, id) {
    var line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", x1.toString());
    line.setAttribute("y1", y1.toString());
    line.setAttribute("x2", x2.toString());
    line.setAttribute("y2", y2.toString());
    line.setAttribute("class", c);
    if (id)
        line.setAttribute("id", id);
    return line;
}


function createGridLine(i1, j1, i2, j2, c, id) {
    var x1 = getGridX(i1, j1), y1 = getGridY(i1, j1);
    var x2 = getGridX(i2, j2), y2 = getGridY(i2, j2);
    return createLine(x1, y1, x2, y2, c, id);
}

function createCircle(i, j, r, c, id) {
    var x = getGridX(i, j), y = getGridY(i, j);
    var circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("r", r.toString());
    circle.setAttribute("class", c.toString());
    if (id)
        circle.setAttribute("id", id);
    return circle;
}

function createText(i, j, text, c, id) {
    var x = getGridX(i, j) - 12, y = getGridY(i, j) + 7;
    var t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("font-size", "24");
    t.setAttribute("x", x.toString());
    t.setAttribute("y", y.toString());
    t.appendChild(document.createTextNode(text));
    t.setAttribute("class", c.toString());
    if (id)
        t.setAttribute("id", id);
    return t;
}

function drawPiece(i, j, piece) {
    erasePieceCoverIfAny(i, j);
    var outer = createCircle(i, j, 23, "piece-outer", "piece-outer-" + toPosition(i, j));
    var inner = createCircle(i, j, 20, "piece-inner", "piece-inner-" + toPosition(i, j));
    var t = createText(i, j, PIECE_TEXTS[piece], "piece-text", "piece-text-" + toPosition(i, j));
    if (isRedPiece(piece)) {
        outer.setAttribute("stroke", "red");
        inner.setAttribute("stroke", "red");
        t.setAttribute("fill", "red");
    } else {
        outer.setAttribute("stroke", "black");
        inner.setAttribute("stroke", "black");
        t.setAttribute("fill", "black");
    }
    outer.setAttribute("stroke-width", "2");
    inner.setAttribute("stroke-width", "2");
    outer.setAttribute("fill", "white");
    inner.setAttribute("fill-opacity", "0");
    insertElement(outer);
    insertElement(inner);
    insertElement(t);
    putPieceCover(i, j);
}

function erasePiece(i, j) {
    erasePieceCoverIfAny(i, j);
    removeElement("piece-text-" + toPosition(i, j));
    removeElement("piece-inner-" + toPosition(i, j));
    removeElement("piece-outer-" + toPosition(i, j));
    putPieceCover(i, j);
}

function putPieceCover(i, j) {
    var cover = createCircle(i, j, 23, "piece-cover", "piece-cover-" + toPosition(i, j));
    cover.setAttribute("stroke-width", "0");
    cover.setAttribute("fill-opacity", "0");
    cover.setAttribute("onmousedown", "pieceClicked(" + i.toString() + ", " + j.toString() + ")");
    cover.setAttribute("touchend", "pieceClicked(" + i.toString() + ", " + j.toString() + ")");
    insertElement(cover);
}

function erasePieceCoverIfAny(i, j) {
    var id = "piece-cover-" + toPosition(i, j);
    if (document.getElementById(id) != null)
        removeElement(id);
}

function insertElement(e) {
    getSVG().appendChild(e);
}

function removeElement(id) {
    getSVG().removeChild(document.getElementById(id));
}

function drawGridLine(i1, j1, i2, j2) {
    var line = createGridLine(i1, j1, i2, j2, "grid");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke", "gray");
    insertElement(line);
}

function drawGrid() {
    var svg = getSVG();
    for (i = 0; i < 9; ++i) {
        drawGridLine(0, i, 4, i);
        if (i == 0 || i == 8)
            drawGridLine(4, i, 5, i);
        drawGridLine(5, i, 9, i);
    }
    for (i = 0; i < 10; ++i)
        drawGridLine(i, 0, i, 8);
    drawGridLine(0, 3, 2, 5);
    drawGridLine(0, 5, 2, 3);
    drawGridLine(7, 3, 9, 5);
    drawGridLine(9, 3, 7, 5);
    for (i = 0; i < 10; ++i)
        for (j = 0; j < 9; ++j)
            putPieceCover(i, j);
}

function drawPieces() {
    for (i = 0; i < 10; ++i)
        for (j = 0; j < 9; ++j)
            if (board[i][j] != 0)
                drawPiece(i, j, board[i][j]);
}

function removeAllChildren(id) {
    var elem = document.getElementById(id);
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}

function resetSVG() {
    removeAllChildren("board");
}

function redrawBoard() {
    resetSVG();
    drawGrid();
    drawPieces();
}

function putHighlight(i, j) {
    var x = getGridX(i, j), y = getGridY(i, j);
    var offset = 23, len = gridSize / 6;
    for (i = -1; i <= 1; i += 2) {
        var line = createLine(x - offset, y + i * offset, x - offset + len, y + i * offset, "highlighter");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke", "blue");
        insertElement(line);
        line = createLine(x + offset - len, y + i * offset, x + offset, y + i * offset, "highlighter");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke", "blue");
        insertElement(line);
    }
    for (i = -1; i <= 1; i += 2) {
        var line = createLine(x + i * offset, y - offset, x + i * offset, y - offset + len, "highlighter");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke", "blue");
        insertElement(line);
        var line = createLine(x + i * offset, y + offset - len, x + i * offset, y + offset, "highlighter");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke", "blue");
        insertElement(line);
    }
}

function eraseHighlights() {
    var children = getSVG().getElementsByClassName("highlighter");
    while (children.length > 0)
        getSVG().removeChild(children[0]);
}

function makeMove(i1, j1, i2, j2) {
    selected = false;
    if (board[i2][j2] != 0)
        erasePiece(i2, j2);
    drawPiece(i2, j2, board[i1][j1]);
    erasePiece(i1, j1);
    move(i1, j1, i2, j2);
    eraseHighlights();
    putHighlight(i1, j1);
    putHighlight(i2, j2);
}

function amIRed() {
    // TODO
    return isRedToGo();
}

function pieceClicked(i, j) {
    if (board[i][j] != 0 && isRedPiece(board[i][j]) == isRedToGo() && amIRed() == isRedToGo()) {
        selected = true;
        select_i = i;
        select_j = j;
        eraseHighlights();
        putHighlight(i, j);
    } else if (selected && checkMove(select_i, select_j, i, j)) {
        makeMove(select_i, select_j, i, j);
        // then send move to server..
    }
}
