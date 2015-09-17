var SVG_NS = "http://www.w3.org/2000/svg";
var gridSize = 50, middleGap = 0;
var PIECE_K = 1, PIECE_A = 2, PIECE_E = 3, PIECE_H = 4, PIECE_R = 5, PIECE_C = 6, PIECE_P = 7;
var PIECE_RK = 1, PIECE_RA = 2, PIECE_RE = 3, PIECE_RH = 4, PIECE_RR = 5, PIECE_RC = 6, PIECE_RP = 7,
    PIECE_BK = 9, PIECE_BA = 10, PIECE_BE = 11, PIECE_BH = 12, PIECE_BR = 13, PIECE_BC = 14, PIECE_BP = 15;
var PIECE_TEXTS = ["", "帥", "仕", "相", "傌", "俥", "炮", "兵",
                   "", "將", "士", "象", "馬", "車", "砲", "卒"];
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
    var x = getGridX(i, j) - 10, y = getGridY(i, j) + 5;
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

function drawPiece(i, j, text, red) {
    var outer = createCircle(i, j, 23, "piece-outer", "piece-outer-" + toPosition(i, j));
    var inner = createCircle(i, j, 20, "piece-inner", "piece-inner-" + toPosition(i, j));
    var t = createText(i, j, text, "piece-text", "piece-text-" + toPosition(i, j));
    if (red) {
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
}

function insertElement(e) {
    getSVG().appendChild(e);
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

function drawBoard() {
    drawGrid();
    drawPiece(1, 1, "哈", true);
}

function pieceClicked(i, j) {
    alert(i + "eee" + j);
}

function distance(x1, y1, x2, y2) {
    var dx = x1 - x2, dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function onClick(evt) {
    evt = evt || window.event;
    var button = evt.which || evt.button;
    if (button == 1) {
        // left button
        var canvas = getCanvas();
        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;
        var found = false;
        for (i = 0; !found && i < 10; ++i)
            for (j = 0; !found && j < 9; ++j) {
                var gridX = getGridX(i, j), gridY = getGridY(i, j);
                if (distance(x, y, gridX, gridY) <= 23) {
                    found = true;
                    if (board[i][j] != 0)
                        pieceClicked(i, j);
                }
            }
    }
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
