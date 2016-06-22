!function () {
    var width = 940, height = 540;
    var duration = 350;
    var ids = [0, 4, 2, 6, 1, 5, 3, 7];
    var nodeRadius = 30;
    var messageFontSize = 18;
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.getX = function () {
            return this.x;
        };
        Point.prototype.getY = function () {
            return this.y;
        };
        return Point;
    }());
    var Scaler = (function () {
        function Scaler(xScale, yScale) {
            this.xScale = xScale;
            this.yScale = yScale;
        }
        return Scaler;
    }());
    var MessagePositionCalculator = (function () {
        function MessagePositionCalculator(nodeSize) {
            this.nodeSize = nodeSize;
            if (nodeSize != 8) {
                throw new Error("nodeSize != 8");
            }
        }
        MessagePositionCalculator.prototype.computeRelativePosition = function (i) {
            var dict = {
                0: [0, -0.2],
                1: [0.45, -0.05],
                2: [0.45, 0],
                3: [0.45, 0.05],
                4: [0, 0.25],
                5: [-0.45, 0.05],
                6: [-0.45, 0],
                7: [-0.45, -0.05]
            };
            return new Point(dict[i][0], dict[i][1]);
        };
        return MessagePositionCalculator;
    }());
    var Node = (function () {
        function Node(id, nodeSize) {
            this.id = id;
            this.nodeSize = nodeSize;
            this.id = id;
            this.nodeSize = nodeSize;
            this.messagePositioncalculator = new MessagePositionCalculator(nodeSize);
        }
        Node.prototype.getX = function () {
            return this.point.getX();
        };
        Node.prototype.getY = function () {
            return this.point.getY();
        };
        Node.prototype.updateIndexAndPosition = function (index) {
            this.index = index;
            this.updatePosition();
        };
        Node.prototype.updatePosition = function () {
            var theta = -2 * Math.PI / this.nodeSize * this.index;
            // x座標もy座標も [-1,1] で指定すれば良い
            this.point = new Point(-Math.sin(theta), -Math.cos(theta));
        };
        Node.prototype.computeMessagePosition = function () {
            var t = this.messagePositioncalculator.computeRelativePosition(this.index);
            return new Point(this.getX() + t.getX(), this.getY() + t.getY());
        };
        return Node;
    }());
    var Message = (function () {
        function Message(text) {
            this.text = text;
        }
        return Message;
    }());
    var xScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([width / 2 - height / 2 + 2 * nodeRadius, width / 2 + height / 2 - 2 * nodeRadius]);
    var yScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([0 + 2 * nodeRadius, height - 2 * nodeRadius]);
    var scaler = new Scaler(xScale, yScale);
    var nodes = [];
    var messages = [];
    var svg = d3.select(".container")
        .append("svg")
        .attr({ width: width, height: height })
        .classed("center-block", true);
    var svgBackground = svg.append("g");
    var svgNode = svg.append("g");
    var svgMessage = svg.append("g");
    // https://material.google.com/style/color.html#
    var colorRed = "#F44336";
    var colorOrange = "#FFC107";
    var colorBlueGrey = "#607D8B";
    var colorWhite = "#FAFAFA";
    var colorBlack = "#212121";
    function initializeBackground() {
        // 背景の円を描画
        svgBackground.append("circle")
            .attr({
            cx: scaler.xScale(0),
            cy: scaler.yScale(0),
            r: scaler.xScale(1) - scaler.xScale(0),
            stroke: colorBlack,
            "stroke-width": 2,
            fill: "none"
        });
    }
    function initializeModel() {
        for (var i = 0; i < ids.length; i++) {
            var n = ids.length;
            var node = new Node(ids[i], n);
            node.updateIndexAndPosition(i);
            nodes.push(node);
        }
        for (var i = 0; i < ids.length; i++) {
            var message = new Message("<candidate," + ids[i] + ">");
            message.index = i;
            messages.push(message);
        }
    }
    function initializeNodeView() {
        // ノードを表す円を描画
        svgNode.selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle");
        svgNode.selectAll("circle")
            .data(nodes)
            .attr({
            cx: function (d, i) {
                return scaler.xScale(d.getX());
            },
            cy: function (d, i) {
                return scaler.yScale(d.getY());
            },
            r: nodeRadius,
            fill: colorRed
        });
        // 円の中にテキストを描画
        // "text-anchor": "middle", dy: "0.35em" と設定すると、ちょうどいい感じになる
        // http://qiita.com/daxanya1/items/734e65a7ca58bbe2a98c
        svgNode.selectAll("text")
            .data(nodes)
            .enter()
            .append("text");
        svgNode.selectAll("text")
            .data(nodes)
            .attr({
            x: function (d, i) {
                return scaler.xScale(d.getX());
            },
            y: function (d, i) {
                return scaler.yScale(d.getY());
            },
            "text-anchor": "middle",
            "font-size": nodeRadius,
            dy: "0.35em",
            fill: colorWhite
        })
            .text(function (d, i) {
            return d.id;
        });
    }
    function initializeMessageView() {
        svgMessage.selectAll("text")
            .data(messages)
            .enter()
            .append("text");
        svgMessage.selectAll("text")
            .data(messages)
            .attr({
            x: function (d, i) {
                return scaler.xScale(nodes[d.index].computeMessagePosition().getX());
            },
            y: function (d, i) {
                return scaler.yScale(nodes[d.index].computeMessagePosition().getY());
            },
            "text-anchor": "middle",
            "font-size": messageFontSize,
            fill: colorBlack
        })
            .text(function (d, i) { return d.text; });
    }
    document.getElementById("button-start").onclick = function () {
        initializeModel();
        initializeNodeView();
        initializeMessageView();
    };
    var counter = 0;
    document.getElementById("button-gt").onclick = function () {
        counter++;
        for (var i = 0; i < messages.length; i++) {
            messages[i].index = (counter + i) % nodes.length;
        }
        svgMessage.selectAll("text")
            .data(messages)
            .transition()
            .duration(duration)
            .ease("linear")
            .attr({
            x: function (d, i) {
                return scaler.xScale(nodes[d.index].computeMessagePosition().getX());
            },
            y: function (d, i) {
                return scaler.yScale(nodes[d.index].computeMessagePosition().getY());
            }
        });
    };
}();
