function removeAllChildren(id) {
    var elem = document.getElementById(id);
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}

/**
 * onSquareSelected(i, j) will be called when user selects square (i, j).
 *
 * @constructor
 */
function BoardUI(onSquareSelected) {
    this.reset = reset;
    this.drawPiece = drawPiece;
    this.erasePiece = erasePiece;
    this.highlightSquare = highlightSquare;
    this.eraseHighlights = eraseHighlights;

    var SVG_NS = "http://www.w3.org/2000/svg";
    var PIECE_TEXTS = ["", "將", "士", "象", "馬", "車", "砲", "卒",
                       "", "帥", "仕", "相", "傌", "俥", "炮", "兵"];
    var PIECE_SPECIAL_TEXTS = ["", "將", "士", "象", "🐴", "車", "砲", "卒",
                               "", "帥", "仕", "相", "🦄", "俥", "炮", "兵"];
    var gridSize_ = 50, middleGap_ = 0;
    var flippedView_ = false;

    reset(false);

    function getSVG() {
        return document.getElementById("board");
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
        line.setAttribute("class", c);
        if (id)
            line.id = id;
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
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", r);
        circle.setAttribute("class", c);
        if (id)
            circle.id = id;
        return circle;
    }

    function createText(i, j, text, c, id) {
        var x = getGridX(i, j) - 12, y = getGridY(i, j) + 7.5;
        var t = document.createElementNS(SVG_NS, "text");
        t.style.fontFamily = "Roboto,monospace";
        t.style.fontSize = 24;
        t.setAttribute("x", x);
        t.setAttribute("y", y);
        t.appendChild(document.createTextNode(text));
        t.setAttribute("class", c);
        if (id)
            t.id = id;
        return t;
    }

    function positionToString(i, j) {
        var colNames = "abcdefghi";
        return colNames[j] + (9 - i).toString();
    }

    function drawPiece(i, j, piece, useSpecialText) {
        erasePieceCoverIfAny(i, j);
        var outer = createCircle(i, j, 23, "piece-outer", "piece-outer-" + positionToString(i, j));
        var inner = createCircle(i, j, 20, "piece-inner", "piece-inner-" + positionToString(i, j));
        var text = useSpecialText? PIECE_SPECIAL_TEXTS[piece] : PIECE_TEXTS[piece];
        var t = createText(i, j, text, "piece-text", "piece-text-" + positionToString(i, j));
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
        insertElement(outer);
        insertElement(inner);
        insertElement(t);
        putPieceCover(i, j);
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
        var cover = createCircle(i, j, 23, "piece-cover", "piece-cover-" + positionToString(i, j));
        cover.style.strokeWidth = 0;
        cover.style.fillOpacity = 0;
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
        getSVG().appendChild(e);
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

    function resetSVG() {
        removeAllChildren("board");
    }

    function reset(flippedView) {
        flippedView_ = flippedView;
        resetSVG();
        drawGrid();
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
