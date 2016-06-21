!function () {
    var Scaler = (function () {
        function Scaler(xScale, yScale) {
            this.xScale = xScale;
            this.yScale = yScale;
        }
        return Scaler;
    }());
    var Node = (function () {
        function Node(id, nodeSize, scaler) {
            this.id = id;
            this.nodeSize = nodeSize;
            this.scaler = scaler;
            this.id = id;
            this.nodeSize = nodeSize;
        }
        Node.prototype.computePosition = function (i) {
            var theta = -2 * Math.PI / this.nodeSize * i;
            // x座標もy座標も [-1,1] で指定すれば良い
            this.x = this.scaler.xScale(-Math.sin(theta));
            this.y = this.scaler.yScale(-Math.cos(theta));
        };
        return Node;
    }());
    var Message = (function () {
        function Message(text) {
            this.text = text;
            this.text = text;
        }
        return Message;
    }());
    var width = 940, height = 540;
    var ids = [0, 4, 2, 6, 1, 5, 3, 7];
    var nodeRadius = 30;
    var messageFontSize = 18;
    var messageTx = -30;
    var messageTy = -30;
    var xScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([width / 2 - height / 2 + nodeRadius, width / 2 + height / 2 - nodeRadius]);
    var yScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([0 + nodeRadius, height - nodeRadius]);
    var scaler = new Scaler(xScale, yScale);
    var nodes = [];
    for (var i = 0; i < ids.length; i++) {
        var n = ids.length;
        var node = new Node(ids[i], n, scaler);
        node.computePosition(i);
        nodes.push(node);
    }
    var messages = [];
    for (var i = 0; i < ids.length; i++) {
        var message = new Message("<candidate," + ids[i] + ">");
        message.index = i;
        messages.push(message);
    }
    var svg = d3.select(".container")
        .append("svg")
        .attr({ width: width, height: height })
        .classed("center-block", true);
    var svgNode = svg.append("g");
    var svgMessage = svg.append("g");
    // https://material.google.com/style/color.html#
    var colorRed = "#F44336";
    var colorOrange = "#FFC107";
    var colorBlueGrey = "#607D8B";
    var colorWhite = "#FAFAFA";
    var colorBlack = "#212121";
    // 円を描画
    svgNode.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr({
        cx: function (d, i) {
            return d.x;
        },
        cy: function (d, i) {
            return d.y;
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
        .append("text")
        .attr({
        x: function (d, i) {
            return d.x;
        },
        y: function (d, i) {
            return d.y;
        },
        "text-anchor": "middle",
        "font-size": nodeRadius,
        dy: "0.35em",
        fill: colorWhite
    })
        .text(function (d, i) {
        return d.id;
    });
    document.getElementById("button-start").onclick = function () {
        svgMessage.selectAll("text")
            .data(messages)
            .enter()
            .append("text");
        svgMessage.selectAll("text")
            .data(messages)
            .attr({
            x: function (d, i) {
                return nodes[d.index].x + messageTx;
            },
            y: function (d, i) {
                return nodes[d.index].y + messageTy;
            },
            "text-anchor": "middle",
            "font-size": nodeRadius,
            fill: colorBlack
        })
            .text(function (d, i) { return d.text; });
    };
    var counter = 0;
    document.getElementById("button-gt").onclick = function () {
        counter++;
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].computePosition((counter + i) % nodes.length);
        }
        var duration = 350;
        svgNode.selectAll("circle")
            .data(nodes)
            .transition()
            .duration(duration)
            .ease("linear")
            .attr({
            cx: function (d, i) {
                return d.x;
            },
            cy: function (d, i) {
                return d.y;
            }
        });
        svgNode.selectAll("text")
            .data(nodes)
            .transition()
            .duration(duration)
            .ease("linear")
            .attr({
            x: function (d, i) {
                return d.x;
            },
            y: function (d, i) {
                return d.y;
            }
        });
    };
}();
