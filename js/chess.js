var PIECE_K = 1, PIECE_A = 2, PIECE_E = 3, PIECE_H = 4, PIECE_R = 5, PIECE_C = 6, PIECE_P = 7;
var PIECE_BK = 1, PIECE_BA = 2, PIECE_BE = 3, PIECE_BH = 4, PIECE_BR = 5, PIECE_BC = 6, PIECE_BP = 7,
    PIECE_RK = 9, PIECE_RA = 10, PIECE_RE = 11, PIECE_RH = 12, PIECE_RR = 13, PIECE_RC = 14, PIECE_RP = 15;
var PIECE_TEXTS = ["", "將", "士", "象", "馬", "車", "砲", "卒",
                   "", "帥", "仕", "相", "傌", "俥", "炮", "兵"];
var board = [];

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

function toPosition(i, j) {
    var colNames = "abcdefghi";
    return colNames[j] + (9 - i).toString();
}

function isRedPiece(piece) {
    return piece >= 8;
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

function checkMove(i1, j1, i2, j2) {
    // TODO
    return true;
}

function move(i1, j1, i2, j2) {
    // TODO
    board[i2][j2] = board[i1][j1];
    board[i1][j1] = 0;
}

function isRedNext() {
    // TODO
    return true;
}
