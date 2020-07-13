var PIECE_NONE = 0;
var PIECE_K = 1, PIECE_A = 2, PIECE_E = 3, PIECE_H = 4, PIECE_R = 5, PIECE_C = 6, PIECE_P = 7;
var PIECE_BK = 1, PIECE_BA = 2, PIECE_BE = 3, PIECE_BH = 4, PIECE_BR = 5, PIECE_BC = 6, PIECE_BP = 7,
    PIECE_RK = 9, PIECE_RA = 10, PIECE_RE = 11, PIECE_RH = 12, PIECE_RR = 13, PIECE_RC = 14, PIECE_RP = 15;

function isRedPiece(piece) {
    return piece >= 8;
}

/**
 * @constructor
 */
function Move(i1, j1, i2, j2, piece, capture) {
    this.i1 = i1;
    this.j1 = j1;
    this.i2 = i2;
    this.j2 = j2;
    this.piece = piece || PIECE_NONE;
    this.capture = capture || PIECE_NONE;
};

/**
 * @constructor
 */
function Chess() {
    this.reset = reset;
    this.setMoves = setMoves;
    this.move = move;
    this.checkMove = checkMove;
    this.moveHistory = moveHistory;
    this.lastMove = lastMove;
    this.pieceAt = pieceAt;
    this.isRedNext = isRedNext;
    this.numMoves = numMoves;

    var board_ = [];
    var moveHistory_ = [];

    reset();

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

    function pieceAt(i, j) {
        return board_[i][j];
    }

    function isRedNext() {
        return moveHistory_.length % 2 == 0;
    }

    function isDigit(c) {
        return c >= '0' && c <= '9';
    }

    function pieceType(piece) {
        if (piece >= 8)
            return piece - 8;
        else
            return piece;
    }

    function setBoard(fen) {
        var rows = fen.split("/");
        if (rows.length != 10)
            throw "Malformed fen string: " + fen;
        for (var i = 0; i < 10; ++i) {
            var j = 0;
            for (var k = 0; k < rows[i].length; ++k) {
                if (j >= 9)
                    throw "Malformed fen string at row " + i + ": " + fen;
                if (isDigit(rows[i][k]))
                    j += parseInt(rows[i][k], 10);
                else {
                    board_[i][j] = toPiece(rows[i][k]);
                    ++j;
                }
            }
        }
    }

    function moveHistory() {
        var ans = [];
        for (var i = 0; i < moveHistory_.length; ++i) {
            ans.push(moveHistory_[i]);
        }
        return ans;
    }

    function lastMove() {
        return moveHistory_[moveHistory_.length - 1];
    }

    function numMoves() {
        return moveHistory_.length;
    }

    function reset() {
        board_ = [];
        moveHistory_ = [];
        for (var i = 0; i < 10; ++i) {
            board_.push([]);
            for (var j = 0; j < 9; ++j)
                board_[i].push(0);
        }
        setBoard("rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR");
    }

    function setMoves(moves) {
        var oldMoveHistory = moveHistory_;
        reset();

        var same = true;
        var numSameMoves = 0;
        for (var i = 0; i < moves.length; ++i) {
            move(moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
            if (same && oldMoveHistory.length > i
                    && oldMoveHistory[i].i1 == moves[i][0]
                    && oldMoveHistory[i].j1 == moves[i][1]
                    && oldMoveHistory[i].i2 == moves[i][2]
                    && oldMoveHistory[i].j2 == moves[i][3]) {
                ++numSameMoves;
            } else {
                same = false;
            }
        }
        return numSameMoves;
    }

    function isKing(i, j, red) {
        var target;
        if (red)
            target = PIECE_RK;
        else
            target = PIECE_BK;
        return board_[i][j] == target;
    }

    function checkMove(i1, j1, i2, j2) {
        var isRedToGo = isRedNext();

        if (!generateAllMoves(isRedToGo).find(function(m, idx, arr) {
            return m.i1 == i1 && m.j1 == j1 && m.i2 == i2 && m.j2 == j2;
        }))
            return false;

        if (isKing(i2, j2, !isRedToGo))
            return true;

        var suicide = false;
        move(i1, j1, i2, j2);
        if (generateAllMoves(!isRedToGo).find(function(m, idx, arr) {
            return isKing(m.i2, m.j2, isRedToGo);
        }))
            suicide = true;
        unmove();
        return !suicide;
    }

    function move(i1, j1, i2, j2) {
        moveHistory_.push(new Move(i1, j1, i2, j2, board_[i1][j1], board_[i2][j2]));
        board_[i2][j2] = board_[i1][j1];
        board_[i1][j1] = 0;
        return moveHistory_[moveHistory_.length - 1];
    }

    function unmove() {
        var lastMove = moveHistory_.pop();
        board_[lastMove.i1][lastMove.j1] = board_[lastMove.i2][lastMove.j2];
        board_[lastMove.i2][lastMove.j2] = lastMove.capture;
    }

    function inBoard(i, j) {
        return i >= 0 && i < 10 && j >= 0 && j < 9;
    }

    function inPalace(i, j) {
        return j >= 3 && j <= 5 && ((i >= 0 && i <= 2) || (i >= 7 && i <= 9));
    }

    function inRedBase(i) {
        return i > 4;
    }

    var di = [0, 1, 0, -1];
    var dj = [1, 0, -1, 0];
    var ddi = [1, 1, -1, -1];
    var ddj = [1, -1, -1, 1];

    function generateKMoves(i, j) {
        var moves = [];
        for (var r = 0; r < 4; ++r)
            if (inPalace(i + di[r], j + dj[r]))
                moves.push(new Move(i, j, i + di[r], j + dj[r]));
        for (var delta = -1; delta <= 1; delta += 2)
            for (var ii = i + delta; ii >= 0 && ii < 10; ii += delta) {
                if (pieceType(board_[ii][j]) == PIECE_K)
                    moves.push(new Move(i, j, ii, j));
                if (board_[ii][j] != 0)
                    break;
            }
        return moves;
    }

    function generateAMoves(i, j) {
        var moves = [];
        for (var r = 0; r < 4; ++r)
            if (inPalace(i + ddi[r], j + ddj[r]))
                moves.push(new Move(i, j, i + ddi[r], j + ddj[r]));
        return moves;
    }

    function generateREMoves(i, j) {
        var moves = [];
        for (var r = 0; r < 4; ++r) {
            if (inBoard(i + 2 * ddi[r], j + 2 * ddj[r])
                    && board_[i + ddi[r]][j + ddj[r]] == 0
                    && inRedBase(i + ddi[r]))
                moves.push(new Move(i, j, i + 2 * ddi[r], j + 2 * ddj[r]));
        }
        return moves;
    }

    function generateBEMoves(i, j) {
        var moves = [];
        for (var r = 0; r < 4; ++r) {
            if (inBoard(i + 2 * ddi[r], j + 2 * ddj[r])
                    && board_[i + ddi[r]][j + ddj[r]] == 0
                    && !inRedBase(i + ddi[r]))
                moves.push(new Move(i, j, i + 2 * ddi[r], j + 2 * ddj[r]));
        }
        return moves;
    }

    function generateHMoves(i, j) {
        var moves = [];
        [[1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1],
         [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0]].forEach(function(pattern) {
             if (inBoard(i + pattern[0], j + pattern[1]) && board_[i + pattern[2]][j + pattern[3]] == 0)
                 moves.push(new Move(i, j, i + pattern[0], j + pattern[1]));
        });
        return moves;
    }

    function generateRMoves(i, j) {
        var moves = [];
        for (var r = 0; r < 4; ++r) {
            var ii = i + di[r], jj = j + dj[4];
            for (ii = i + di[r], jj = j + dj[r]; inBoard(ii, jj); ii += di[r], jj += dj[r]) {
                moves.push(new Move(i, j, ii, jj));
                if (board_[ii][jj] != 0)
                    break;
            }
        }
        return moves;
    }

    function generateCMoves(i, j) {
        var moves = [];
        for (var r = 0; r < 4; ++r) {
            var ii = i + di[r], jj = j + dj[4];
            var met = false;
            for (ii = i + di[r], jj = j + dj[r]; inBoard(ii, jj); ii += di[r], jj += dj[r]) {
                if (!met && board_[ii][jj] == 0)
                    moves.push(new Move(i, j, ii, jj));
                else if (!met && board_[ii][jj] != 0)
                    met = true;
                else if (met && board_[ii][jj] != 0) {
                    moves.push(new Move(i, j, ii, jj));
                    break;
                }
            }
        }
        return moves;
    }

    function generateRPMoves(i, j) {
        var moves = [];
        if (inRedBase(i))
            moves.push(new Move(i, j, i - 1, j));
        else {
            if (inBoard(i - 1, j))
                moves.push(new Move(i, j, i - 1, j));
            if (inBoard(i, j - 1))
                moves.push(new Move(i, j, i, j - 1));
            if (inBoard(i, j + 1))
                moves.push(new Move(i, j, i, j + 1));
        }
        return moves;
    }

    function generateBPMoves(i, j) {
        var moves = [];
        if (!inRedBase(i))
            moves.push(new Move(i, j, i + 1, j));
        else {
            if (inBoard(i + 1, j))
                moves.push(new Move(i, j, i + 1, j));
            if (inBoard(i, j - 1))
                moves.push(new Move(i, j, i, j - 1));
            if (inBoard(i, j + 1))
                moves.push(new Move(i, j, i, j + 1));
        }
        return moves;
    }

    function generateMoves(i, j, moves) {
        var type = pieceType(board_[i][j]);
        var red = isRedPiece(board_[i][j]);
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
            if (board_[m.i2][m.j2] == 0 || isRedPiece(board_[m.i2][m.j2]) != red)
                moves.push(m);
        });
    }

    function generateAllMoves(isRedToGo) {
        var moves = [];
        for (var i = 0; i < 10; ++i)
            for (var j = 0; j < 9; ++j)
                if (board_[i][j] != 0 && isRedPiece(board_[i][j]) == isRedToGo)
                    generateMoves(i, j, moves);
        return moves;
    }
}
