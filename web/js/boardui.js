/**
 * onSquareSelected(i, j) will be called when user selects square (i, j).
 *
 * @constructor
 */
function BoardUI(onSquareSelected) {
    this.reset = reset;
    this.drawPieceWithCover = drawPieceWithCover;
    this.erasePiece = erasePiece;
    this.drawColorIndicator = drawColorIndicator;
    this.highlightSquare = highlightSquare;
    this.eraseHighlights = eraseHighlights;

    var SVG_NS = "http://www.w3.org/2000/svg";
    var PIECE_TEXTS = ["", "將", "士", "象", "馬", "車", "砲", "卒",
                       "", "帥", "仕", "相", "傌", "俥", "炮", "兵"];
    var gridSize_ = 50, middleGap_ = 0;
    var flippedView_ = false;

    initialize();

    function getSVG() {
        return document.getElementById("board");
    }

    function eraseAllPieces(className) {
        var children = getSVG().getElementsByClassName("piece-element");
        while (children.length > 0)
            getSVG().removeChild(children[0]);
        eraseHighlights();
    }

    function getGridX(i, j) {
        if (flippedView_)
            j = 8 - j;
        return gridSize_ / 2 + j * gridSize_;
    }

    function getGridY(i, j) {
        if (flippedView_)
            i = 9 - i;
        if (j < 5)
            return gridSize_ / 2 + i * gridSize_;
        else
            return gridSize_ / 2 + i * gridSize_ + middleGap_;
    }

    function createLine(x1, y1, x2, y2, c, id) {
        var line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.classList.add(c);
        if (id)
            line.id = id;
        return line;
    }

    function createGridLine(i1, j1, i2, j2, c, id) {
        var x1 = getGridX(i1, j1), y1 = getGridY(i1, j1);
        var x2 = getGridX(i2, j2), y2 = getGridY(i2, j2);
        return createLine(x1, y1, x2, y2, c, id);
    }

    function createPieceCircle(i, j, r, c, id) {
        var x = getGridX(i, j), y = getGridY(i, j);
        var circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", r);
        circle.classList.add(c[i]);
        circle.classList.add("piece-element");
        if (id)
            circle.id = id;
        return circle;
    }

    function createText(i, j, text, c, id) {
        var x = getGridX(i, j), y = getGridY(i, j);
        var t = document.createElementNS(SVG_NS, "text");
        t.style.fontFamily = "Roboto,monospace";
        t.style.fontSize = 24 + "px";
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("alignment-baseline", "central");
        t.setAttribute("dominant-baseline", "middle");
        t.setAttribute("font-weight", "bold");
        t.setAttribute("x", x);
        t.setAttribute("y", y);
        t.appendChild(document.createTextNode(text));
        t.classList.add(c);
        t.classList.add("piece-element");
        t.userSelect = "none";
        if (id)
            t.id = id;
        return t;
    }

    function positionToString(i, j) {
        var colNames = "abcdefghi";
        return colNames[j] + (9 - i).toString();
    }

    function drawPiece(svg, i, j, piece, assignId) {
        if (assignId) {
          erasePieceCoverIfAny(i, j);
        }
        var outerId = undefined;
        if (assignId) {
            outerId = "piece-outer-" + positionToString(i, j);
        }
        var outer = createPieceCircle(i, j, 23, "piece-outer", outerId);
        var innerId = undefined;
        if (assignId) {
            innerId = "piece-inner-" + positionToString(i, j);
        }
        var inner = createPieceCircle(i, j, 20, "piece-inner", innerId);
        var text = PIECE_TEXTS[piece];
        var textId = undefined;
        if (assignId) {
            textId = "piece-text-" + positionToString(i, j);
        }
        var t = createText(i, j, text, "piece-text", textId);
        if (isRedPiece(piece)) {
            outer.setAttribute("stroke", "red");
            inner.style.stroke = "red";
            t.style.fill = "red";
        } else {
            outer.style.stroke = "black";
            inner.style.stroke = "black";
            t.style.fill = "black";
        }
        outer.style.strokeWidth = 2;
        inner.style.strokeWidth = 2;
        outer.style.fill = "white";
        inner.style.fillOpacity = 0;
        insertElementToSVG(svg, outer);
        insertElementToSVG(svg, inner);
        insertElementToSVG(svg, t);
    }

    function drawPieceWithCover(i, j, piece) {
        drawPiece(getSVG(), i, j, piece, true);
        putPieceCover(i, j);
    }

    function drawColorIndicator(svg, isRed) {
        var piece = 1;
        if (isRed) piece += 8;
        drawPiece(svg, 0, 0, piece, false);
    }

    function erasePiece(i, j) {
        erasePieceCoverIfAny(i, j);
        removeElement("piece-text-" + positionToString(i, j));
        removeElement("piece-inner-" + positionToString(i, j));
        removeElement("piece-outer-" + positionToString(i, j));
        putPieceCover(i, j);
    }

    function makeOnClickCallback(i, j) {
        return function() {
            onSquareSelected(i, j);
        };
    }

    function putPieceCover(i, j) {
        var cover = createPieceCircle(i, j, 23, "piece-cover", "piece-cover-" + positionToString(i, j));
        cover.style.strokeWidth = 0;
        cover.style.fillOpacity = 0;
        cover.userSelect = "none";
        cover.onmousedown = makeOnClickCallback(i, j);
        cover.touchend = cover.onmousedown;
        insertElement(cover);
    }

    function erasePieceCoverIfAny(i, j) {
        var id = "piece-cover-" + positionToString(i, j);
        if (document.getElementById(id) != null)
            removeElement(id);
    }

    function insertElement(e) {
        insertElementToSVG(getSVG(), e);
    }

    function insertElementToSVG(svg, e) {
        svg.appendChild(e);
    }

    function removeElement(id) {
        getSVG().removeChild(document.getElementById(id));
    }

    function drawGridLine(i1, j1, i2, j2) {
        var line = createGridLine(i1, j1, i2, j2, "grid", undefined);
        line.style.strokeWidth = 1;
        line.style.stroke = "gray";
        insertElement(line);
    }

    function drawGrid() {
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

    function resetSVG() {
        removeAllChildren("board");
    }

    function initialize() {
        drawGrid();
    }

    function reset(flippedView) {
        if (flippedView_ == flippedView) {
            eraseAllPieces();
        } else {
            flippedView_ = flippedView;
            resetSVG();
            drawGrid();
        }
    }

    function highlightSquare(i, j) {
        var x = getGridX(i, j), y = getGridY(i, j);
        var offset = 23, len = gridSize_ / 6;
        for (var i = -1; i <= 1; i += 2) {
            var line = createLine(x - offset, y + i * offset, x - offset + len, y + i * offset, "highlighter", undefined);
            line.style.strokeWidth = 2;
            line.style.stroke = "blue";
            insertElement(line);
            line = createLine(x + offset - len, y + i * offset, x + offset, y + i * offset, "highlighter", undefined);
            line.style.strokeWidth = 2;
            line.style.stroke = "blue";
            insertElement(line);
        }
        for (var i = -1; i <= 1; i += 2) {
            var line = createLine(x + i * offset, y - offset, x + i * offset, y - offset + len, "highlighter", undefined);
            line.style.strokeWidth = 2;
            line.style.stroke = "blue";
            insertElement(line);
            var line = createLine(x + i * offset, y + offset - len, x + i * offset, y + offset, "highlighter", undefined);
            line.style.strokeWidth = 2;
            line.style.stroke = "blue";
            insertElement(line);
        }
    }

    function eraseHighlights() {
        var children = getSVG().getElementsByClassName("highlighter");
        while (children.length > 0)
            getSVG().removeChild(children[0]);
    }
}
