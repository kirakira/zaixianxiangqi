var SVG_NS = "http://www.w3.org/2000/svg";
var gridSize = 50, middleGap = 0;
var PIECE_K = 1, PIECE_A = 2, PIECE_E = 3, PIECE_H = 4, PIECE_R = 5, PIECE_C = 6, PIECE_P = 7;
var PIECE_BK = 1, PIECE_BA = 2, PIECE_BE = 3, PIECE_BH = 4, PIECE_BR = 5, PIECE_BC = 6, PIECE_BP = 7,
    PIECE_RK = 9, PIECE_RA = 10, PIECE_RE = 11, PIECE_RH = 12, PIECE_RR = 13, PIECE_RC = 14, PIECE_RP = 15;
var PIECE_TEXTS = ["", "將", "士", "象", "馬", "車", "砲", "卒",
                   "", "帥", "仕", "相", "傌", "俥", "炮", "兵"];
var board = [];

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

function createLine(i1, j1, i2, j2, c, id) {
    var x1 = getGridX(i1, j1), y1 = getGridY(i1, j1);
    var x2 = getGridX(i2, j2), y2 = getGridY(i2, j2);
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

function toPosition(i, j) {
    var colNames = "abcdefghi";
    return colNames[j] + (9 - i).toString();
}

function isRed(piece) {
    return piece >= 8;
}

function drawPiece(i, j, piece) {
    var outer = createCircle(i, j, 23, "piece-outer", "piece-outer-" + toPosition(i, j));
    var inner = createCircle(i, j, 20, "piece-inner", "piece-inner-" + toPosition(i, j));
    var t = createText(i, j, PIECE_TEXTS[piece], "piece-text", "piece-text-" + toPosition(i, j));
    if (isRed(piece)) {
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
    var cover = createCircle(i, j, 23, "piece-cover", "piece-cover-" + toPosition(i, j));
    cover.setAttribute("stroke-width", "0");
    cover.setAttribute("fill-opacity", "0");
    cover.setAttribute("onmousedown", "pieceClicked(" + i.toString() + ", " + j.toString() + ")");
    insertElement(cover);
}

function erasePiece(i, j, piece) {
    removeElement("piece-cover-" + toPosition(i, j));
    removeElement("piece-text-" + toPosition(i, j));
    removeElement("piece-inner-" + toPosition(i, j));
    removeElement("piece-outer-" + toPosition(i, j));
}

function insertElement(e) {
    getSVG().appendChild(e);
}

function removeElement(id) {
    getSVG().removeChild(document.getElementById(id));
}

function drawGridLine(i1, j1, i2, j2) {
    var line = createLine(i1, j1, i2, j2, "grid");
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
}

function drawPieces() {
    for (i = 0; i < 10; ++i)
        for (j = 0; j < 9; ++j)
            if (board[i][j] != 0)
                drawPiece(i, j, board[i][j]);
}

function drawBoard() {
    drawGrid();
    drawPieces();
}

function pieceClicked(i, j) {
    alert(i + "eee" + j);
}

function toPiece(c) {
    var isLower = (c == c.toLowerCase());
    c = c.toLowerCase();
    var ans = 0;
    if (c == "k")
        ans = 1;
    else if (c == "a")
        ans = 2;
    else if (c == "e")
        ans = 3;
    else if (c == "h")
        ans = 4;
    else if (c == "r")
        ans = 5;
    else if (c == "c")
        ans = 6;
    else if (c == "p")
        ans = 7;
    if (!isLower)
        ans += 8;
    return ans;
}

function isDigit(c) {
    return c >= '0' && c <= '9';
}

function setBoard(fen) {
    var rows = fen.split("/");
    if (rows.length != 10)
        throw "Malformed fen string: " + fen;
    for (i = 0; i < 10; ++i) {
        var j = 0;
        for (k = 0; k < rows[i].length; ++k) {
            if (j >= 9)
                throw "Malformed fen string at row " + i + ": " + fen;
            if (isDigit(rows[i][k]))
                j += parseInt(rows[i][k]);
            else {
                board[i][j] = toPiece(rows[i][k]);
                ++j;
            }
        }
    }
}

function init() {
    board = [];
    for (i = 0; i < 10; ++i) {
        board.push([]);
        for (j = 0; j < 9; ++j)
            board[i].push(0);
    }
    setBoard("rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR");
}

init();
drawBoard();
