var PIECE_K = 1, PIECE_A = 2, PIECE_E = 3, PIECE_H = 4, PIECE_R = 5, PIECE_C = 6, PIECE_P = 7;
var PIECE_BK = 1, PIECE_BA = 2, PIECE_BE = 3, PIECE_BH = 4, PIECE_BR = 5, PIECE_BC = 6, PIECE_BP = 7,
    PIECE_RK = 9, PIECE_RA = 10, PIECE_RE = 11, PIECE_RH = 12, PIECE_RR = 13, PIECE_RC = 14, PIECE_RP = 15;

var board = [];
var moveHistory = [];
var redToGo = true;

var Move = function(i1, j1, i2, j2, capture) {
    this.i1 = i1;
    this.j1 = j1;
    this.i2 = i2;
    this.j2 = j2;
    this.capture = capture || 0;
};

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

function sameSide(piece1, piece2) {
    return isRedPiece(piece1) == isRedPiece(piece2);
}

function oppositeSide(piece1, piece2) {
    return !sameSide(piece1, piece2);
}

function pieceType(piece) {
    if (piece >= 8)
        return piece - 8;
    else
        return piece;
}

function setBoard(fen, redNext) {
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
    redToGo = redNext;
}

function init() {
    board = [];
    for (i = 0; i < 10; ++i) {
        board.push([]);
        for (j = 0; j < 9; ++j)
            board[i].push(0);
    }
    setBoard("rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR", true);
}

function isKing(i, j, red) {
    var target;
    if (red)
        target = PIECE_RK;
    else
        target = PIECE_BK;
    return board[i][j] == target;
}

function checkMove(i1, j1, i2, j2) {
    var movingSide = isRedToGo();

    if (!generateAllMoves().find(function(m, idx, arr) {
        return m.i1 == i1 && m.j1 == j1 && m.i2 == i2 && m.j2 == j2;
    }))
        return false;

    if (isKing(i2, j2, !movingSide))
        return true;

    var suicide = false;
    move(i1, j1, i2, j2);
    if (generateAllMoves().find(function(m, idx, arr) {
        return isKing(m.i2, m.j2, movingSide);
    }))
        suicide = true;
    unmove();
    return !suicide;
}

function move(i1, j1, i2, j2) {
    moveHistory.push(new Move(i1, j1, i2, j2, board[i2][j2]));
    board[i2][j2] = board[i1][j1];
    board[i1][j1] = 0;
    redToGo = !redToGo;
}

function unmove() {
    var lastMove = moveHistory.pop();
    board[lastMove.i1][lastMove.j1] = board[lastMove.i2][lastMove.j2];
    board[lastMove.i2][lastMove.j2] = lastMove.capture;
    redToGo = !redToGo;
}

function isRedToGo() {
    return redToGo;
}

function inBoard(i, j) {
    return i >= 0 && i < 10 && j >= 0 && j < 9;
}

function inPalace(i, j) {
    return j >= 3 && j <= 5 && ((i >= 0 && i <= 2) || (i >= 7 && i <= 9));
}

var di = [0, 1, 0, -1];
var dj = [1, 0, -1, 0];
var ddi = [1, 1, -1, -1];
var ddj = [1, -1, -1, 1];

function generateKMoves(i, j) {
    var moves = [];
    for (r = 0; r < 4; ++r)
        if (inPalace(i + di[r], j + dj[r]))
            moves.push(new Move(i, j, i + di[r], j + dj[r]));
    for (delta = -1; delta <= 1; delta += 2)
        for (ii = i + delta; ii >= 0 && ii < 10; ii += delta) {
            if (pieceType(board[ii][j]) == PIECE_K)
                moves.push(new Move(i, j, ii, j));
            if (board[ii][j] != 0)
                break;
        }
    return moves;
}

function generateAMoves(i, j) {
    var moves = [];
    return moves;
}

function generateREMoves(i, j) {
    var moves = [];
    return moves;
}

function generateBEMoves(i, j) {
    var moves = [];
    return moves;
}

function generateHMoves(i, j) {
    var moves = [];
    return moves;
}

function generateRMoves(i, j) {
    var moves = [];
    return moves;
}

function generateCMoves(i, j) {
    var moves = [];
    return moves;
}

function generateRPMoves(i, j) {
    var moves = [];
    return moves;
}

function generateBPMoves(i, j) {
    var moves = [];
    return moves;
}

function generateMoves(i, j, moves) {
    var type = pieceType(board[i][j]);
    var red = isRedPiece(board[i][j]);
    var unfilteredMoves = [];
    if (type == 1)
        unfilteredMoves = generateKMoves(i, j);
    else if (type == 2)
        unfilteredMoves = generateAMoves(i, j);
    else if (type == 3) {
        if (red)
            unfilteredMoves = generateREMoves(i, j);
        else
            unfilteredMoves = generateBEMoves(i, j);
    }
    else if (type == 4)
        unfilteredMoves = generateHMoves(i, j);
    else if (type == 5)
        unfilteredMoves = generateRMoves(i, j);
    else if (type == 6)
        unfilteredMoves = generateCMoves(i, j);
    else if (type == 7) {
        if (red)
            unfilteredMoves = generateRPMoves(i, j);
        else
            unfilteredMoves = generateBPMoves(i, j);
    }
    unfilteredMoves.forEach(function(m) {
        if (board[m.i2][m.j2] == 0 || isRedPiece(board[m.i2][m.j2]) != red)
            moves.push(m);
    });
}

function generateAllMoves() {
    var moves = [];
    for (i = 0; i < 10; ++i)
        for (j = 0; j < 9; ++j)
            if (board[i][j] != 0 && isRedPiece(board[i][j]) == isRedToGo())
                generateMoves(i, j, moves);
    return moves;
}
