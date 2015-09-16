var gridSize = 50, middleGap = 0;
var PIECE_K = 1, PIECE_A = 2, PIECE_E = 3, PIECE_H = 4, PIECE_R = 5, PIECE_C = 6, PIECE_P = 7;
var PIECE_RK = 1, PIECE_RA = 2, PIECE_RE = 3, PIECE_RH = 4, PIECE_RR = 5, PIECE_RC = 6, PIECE_RP = 7,
    PIECE_BK = 9, PIECE_BA = 10, PIECE_BE = 11, PIECE_BH = 12, PIECE_BR = 13, PIECE_BC = 14, PIECE_BP = 15;
var PIECE_TEXTS = ["", "帥", "仕", "相", "傌", "俥", "炮", "兵",
                   "", "將", "士", "象", "馬", "車", "砲", "卒"];
var board = [];

function getCanvas() {
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

function drawGrid(context) {
    context.beginPath();
    context.lineWidth = "1";
    context.strokeStyle = "grey";
    for (i = 0; i < 9; ++i) {
        context.moveTo(gridSize / 2 + i * gridSize, gridSize / 2);
        context.lineTo(gridSize / 2 + i * gridSize, gridSize / 2 + gridSize * 4);
        if (i == 0 || i == 8)
            context.lineTo(gridSize / 2 + i * gridSize, gridSize / 2 + gridSize * 5 + middleGap);
        else
            context.moveTo(gridSize / 2 + i * gridSize, gridSize / 2 + gridSize * 5 + middleGap);
        context.lineTo(gridSize / 2 + i * gridSize, gridSize / 2 + gridSize * 9 + middleGap);
    }
    for (i = 0; i < 10; ++i) {
        var y = gridSize / 2 + i * gridSize;
        if (i >= 5)
            y += middleGap;
        context.moveTo(gridSize / 2, y);
        context.lineTo(gridSize / 2 + gridSize * 8, y);
    }
    context.stroke();
}

function drawPiece(context, i, j, text, red) {
    var x = getGridX(i, j), y = getGridY(i, j);

    context.lineWidth = "1";

    context.beginPath();
    context.arc(x, y, 23, 0, 2 * Math.PI);
    context.fillStyle = "white";
    context.fill();

    if (red) {
        context.strokeStyle = "red";
        context.fillStyle = "red";
    } else {
        context.strokeStyle = "black";
        context.fillStyle = "black";
    }

    context.beginPath();
    context.arc(x, y, 23, 0, 2 * Math.PI);
    context.stroke();
    context.beginPath();
    context.arc(x, y, 20, 0, 2 * Math.PI);
    context.stroke();

    context.font = "24px Arial";
    context.fillText(text, x - 12, y + 8);
}

function drawPieces(context) {
    for (i = 0; i < 10; ++i) {
        for (j = 0; j < 9; ++j) {
            if (board[i][j] != 0)
                drawPiece(context, i, j, PIECE_TEXTS[board[i][j]], board[i][j] >= 8);
        }
    }
}

function drawBoard() {
    var context = getCanvas().getContext("2d");
    drawGrid(context);
    drawPieces(context);
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
    getCanvas().addEventListener("mousedown", onClick);
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
