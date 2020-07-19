/**
 * @constructor
 */
function Board(onMove) {
    this.setState = setState;
    this.resetState = resetState;
    this.showMove = showMove;
    this.isRedNext = isRedNext;
    this.numMoves = numMoves;
    this.numMovesShown = numMovesShown;
    this.getFen = getFen;

    var board_ = new Chess();
    var ui_ = new BoardUI(onSquareSelected);
    var mySide_ = "r";
    var viewOnly_ = true;
    var selection_ = null;
    var numMovesShown_ = 0;

    drawColorIndicators();
    redrawBoard();

    function redrawBoard() {
        for (var i = 0; i < 10; ++i)
            for (var j = 0; j < 9; ++j) {
                if (board_.pieceAt(i, j) != PIECE_NONE) {
                    ui_.drawPieceWithCover(i, j, board_.pieceAt(i, j));
                }
            }
        numMovesShown_ = board_.numMoves();
    }

    function drawColorIndicators() {
        ui_.drawColorIndicator(document.getElementById("redIndicator"), true);
        ui_.drawColorIndicator(document.getElementById("blackIndicator"), false);
    }

    // mySide: "r" or "b"
    // viewOnly: true or false
    // moves: 2d array. moves[i] is [i1, j1, i2, j2].
    function setState(mySide, viewOnly, moves) {
        if (mySide != mySide_) {
            mySide_ = mySide;
            ui_.reset(mySide == "b");
            board_.reset();
            redrawBoard();
            selection_ = null;
        }
        viewOnly_ = viewOnly;

        var oldMoves = board_.moveHistory();
        var numSameMoves = board_.setMoves(moves);

        var numMovesToShow = numMovesShown_;
        // If the user was at the latest move, bring them to the new latest move.
        if (numMovesShown_ == oldMoves.length) numMovesToShow = board_.numMoves();
        numMovesToShow = Math.min(numMovesToShow, board_.numMoves());

        for (; numMovesShown_ > numSameMoves; --numMovesShown_) {
            var i = numMovesShown_ - 1;
            if (i > 0)
                unmakeUIMove(oldMoves[i], oldMoves[i - 1]);
            else
                unmakeUIMove(oldMoves[i], null);
        }
        showMove(numMovesToShow);
    }

    // Similar to setState, but discards current selection and highlights the new
    // last move.
    function resetState(mySide, viewOnly, moves) {
        mySide_ = mySide;
        ui_.reset(mySide == "b");
        board_.reset();
        board_.setMoves(moves);
        redrawBoard();
        selection_ = null;
        numMovesShown_ = board_.numMoves();
        if (board_.numMoves() > 0) {
          var lastMove = board_.lastMove();
          ui_.highlightSquare(lastMove.i1, lastMove.j1);
          ui_.highlightSquare(lastMove.i2, lastMove.j2);
        }
    }

    function showMove(numMovesToShow) {
        numMovesToShow = Math.max(0, numMovesToShow);
        numMovesToShow = Math.min(board_.numMoves(), numMovesToShow);
        if (numMovesToShow == numMovesShown_) return numMovesShown_;

        var moves = board_.moveHistory();
        if (numMovesToShow > numMovesShown_) {
            for (var i = numMovesShown_; i < numMovesToShow; ++i) {
                makeUIMove(moves[i]);
            }
        } else {
            for (var i = numMovesShown_ - 1; i >= numMovesToShow; --i) {
                if (i > 0) {
                    unmakeUIMove(moves[i], moves[i - 1]);
                } else {
                    unmakeUIMove(moves[i], null);
                }
            }
        }

        numMovesShown_ = numMovesToShow;
        return numMovesShown_;
    }

    function isMyPiece(piece) {
        if (piece == PIECE_NONE) return false;
        if (mySide_ == "r") {
            return isRedPiece(piece);
        } else if (mySide_ == "b") {
            return !isRedPiece(piece);
        } else {
            return false;
        }
    }

    function isRedNext() {
        return board_.isRedNext();
    }

    function isMyTurn() {
        var isRedNext = board_.isRedNext();
        return (mySide_ == "r" && isRedNext) || (mySide_ == "b" && !isRedNext);
    }

    function onSquareSelected(i, j) {
        if (viewOnly_) return;
        if (!isMyTurn()) return;
        if (numMovesShown_ != board_.numMoves()) return;

        if (!selection_) {
            if (!isMyPiece(board_.pieceAt(i, j))) return;

            ui_.eraseHighlights();
            selection_ = [i, j];
            ui_.highlightSquare(i, j);
        } else {
            if (board_.checkMove(selection_[0], selection_[1], i, j)) {
                var i1 = selection_[0], j1 = selection_[1], i2 = i, j2 = j;
                makeUIMove(board_.move(i1, j1, i2, j2));
                ++numMovesShown_;
                onMove(i1, j1, i2, j2);
            } else {
                if (isMyPiece(board_.pieceAt(i, j))) {
                    ui_.eraseHighlights();
                    selection_ = [i, j];
                    ui_.highlightSquare(i, j);
                }
            }
        }
    }

    // Will update: ui (including highlights), selection_
    // Will not update: board_, numMovesShown_
    function makeUIMove(move) {
        ui_.erasePiece(move.i1, move.j1);
        if (move.capture) {
            ui_.erasePiece(move.i2, move.j2);
        }
        ui_.drawPieceWithCover(move.i2, move.j2, move.piece);

        ui_.eraseHighlights();
        ui_.highlightSquare(move.i1, move.j1);
        ui_.highlightSquare(move.i2, move.j2);
        selection_ = null;
    }

    // Will update: ui (including highlights), selection_
    // Will not update: board_, numMovesShown_
    function unmakeUIMove(move, previousMove) {
        ui_.drawPieceWithCover(move.i1, move.j1, move.piece);
        ui_.erasePiece(move.i2, move.j2);
        if (move.capture) {
            ui_.drawPieceWithCover(move.i2, move.j2, move.capture);
        }

        ui_.eraseHighlights();
        if (previousMove) {
            ui_.highlightSquare(previousMove.i1, previousMove.j1);
            ui_.highlightSquare(previousMove.i2, previousMove.j2);
        }
        selection_ = null;
    }

    function numMoves() {
        return board_.numMoves();
    }

    function numMovesShown() {
        return numMovesShown_;
    }

    function getFen() {
        var currentMoves = board_.moveHistoryArrayFormat();
        var truncatedMoves = [];
        for (var i = 0; i < numMovesShown_; ++i) {
            truncatedMoves.push(currentMoves[i]);
        }
        board_.setMoves(truncatedMoves);
        var fen = board_.getFen();
        board_.setMoves(currentMoves);
        return fen;
    }
}
