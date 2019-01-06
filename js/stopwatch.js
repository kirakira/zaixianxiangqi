/**
 * @constructor
 */
function Stopwatch(watchId) {
    this.start = start;
    this.stop = stop;
    this.tick = tick;
    this.frequency = frequency;

    var SVG_NS = "http://www.w3.org/2000/svg";
    var FREQUENCY = 250;
    var RADIUS = 20;
    var active_ = false;
    var tick_ = 0;

    drawWatch();

    function getSVG() {
        return document.getElementById(watchId);
    }

    function drawWatch() {
        var neckLength = 6;
        var buttonLength = 4;
        var buttonWidth = 6;
        var circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", 0);
        circle.setAttribute("cy", 0);
        circle.setAttribute("r", RADIUS);
        circle.style.stroke = "black";
        circle.style.strokeWidth = 2;
        circle.style.fillOpacity = 0;
        getSVG().appendChild(circle);
        var neck = document.createElementNS(SVG_NS, "line");
        neck.setAttribute("x1", 0);
        neck.setAttribute("y1", -RADIUS);
        neck.setAttribute("x2", 0);
        neck.setAttribute("y2", -RADIUS - neckLength);
        neck.style.strokeWidth = 4;
        neck.style.stroke = "black";
        getSVG().appendChild(neck);
        var button = document.createElementNS(SVG_NS, "rect");
        button.setAttribute("x", -3);
        button.setAttribute("y", -RADIUS - neckLength - buttonLength);
        button.setAttribute("width", buttonWidth);
        button.setAttribute("height", buttonLength);
        button.style.strokeWidth = 0.5;
        button.style.stroke = "black";
        button.style.fillOpacity = 0;
        getSVG().appendChild(button);
        var neckCircle = document.createElementNS(SVG_NS, "circle");
        neckCircle.setAttribute("cx", 0);
        neckCircle.setAttribute("cy", -RADIUS - neckLength - buttonLength / 2);
        neckCircle.setAttribute("r", neckLength);
        neckCircle.style.stroke = "black";
        neckCircle.style.strokeWidth = 1;
        neckCircle.style.fillOpacity = 0;
        getSVG().appendChild(neckCircle);
        for (var x = -buttonWidth / 2; x <= buttonWidth / 2; x += 1) {
            var texture = document.createElementNS(SVG_NS, "line");
            texture.setAttribute("x1", x);
            texture.setAttribute("y1", -RADIUS - neckLength - buttonLength);
            texture.setAttribute("x2", x);
            texture.setAttribute("y2", -RADIUS - neckLength);
            texture.style.strokeWidth = 0.2;
            texture.style.stroke = "black";
            getSVG().appendChild(texture);
        }
        for (var i = 0; i < 12; ++i) {
            var scale = document.createElementNS(SVG_NS, "line");
            var angle = i / 12 * 2 * Math.PI;
            var r1 = RADIUS, r2 = 0.7 * RADIUS;
            scale.setAttribute("x1", r1 * Math.sin(angle));
            scale.setAttribute("y1", -r1 * Math.cos(angle));
            scale.setAttribute("x2", r2 * Math.sin(angle));
            scale.setAttribute("y2", -r2 * Math.cos(angle));
            scale.style.strokeWidth = 1;
            scale.style.stroke = "black";
            getSVG().appendChild(scale);
        }
        for (var i = 0; i < 60; ++i) {
            var scale = document.createElementNS(SVG_NS, "line");
            var angle = i / 60 * 2 * Math.PI;
            var r1 = RADIUS, r2 = 0.85 * RADIUS;
            scale.setAttribute("x1", r1 * Math.sin(angle));
            scale.setAttribute("y1", -r1 * Math.cos(angle));
            scale.setAttribute("x2", r2 * Math.sin(angle));
            scale.setAttribute("y2", -r2 * Math.cos(angle));
            scale.style.strokeWidth = 0.5;
            scale.style.stroke = "black";
            getSVG().appendChild(scale);
        }
        var hand = document.createElementNS(SVG_NS, "line");
        hand.id = getHandId();
        hand.setAttribute("x1", 0);
        hand.setAttribute("y1", 0);
        hand.setAttribute("x2", 0);
        hand.setAttribute("y2", -RADIUS * 0.8);
        hand.style.strokeWidth = 1;
        hand.style.stroke = "black";
        getSVG().appendChild(hand);

        hide();
    }

    function start() {
        if (active_) return;
        active_ = true;
        tick_ = 0;
        tick();
        show();
    }

    function stop() {
        active_ = false;
        hide();
    }

    function show() {
        getSVG().style.visibility = "visible";
    }

    function hide() {
        getSVG().style.visibility = "hidden";
    }

    function getHandId() {
        return watchId + "Hand";
    }

    function tick() {
        if (!active_) return;

        var hand = document.getElementById(getHandId());
        var r = 0.8 * RADIUS;
        var theta = tick_ / FREQUENCY * 2 * Math.PI;
        hand.setAttribute("x2", r * Math.sin(theta));
        hand.setAttribute("y2", -r * Math.cos(theta));

        ++tick_;
        tick_ = tick_ % FREQUENCY;
    }

    function frequency() {
        return FREQUENCY;
    }
}
