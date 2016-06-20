!function () {
    var width = 940, height = 540;
    var ids = [0, 4, 2, 6, 1, 5, 3, 7];
    var nodeRadius = 30;
    var xScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([width / 2 - height / 2 + nodeRadius, width / 2 + height / 2 - nodeRadius]);
    var yScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([0 + nodeRadius, height - nodeRadius]);
    function nodePosition(i, n) {
        var theta = -2 * Math.PI / n * i;
        // x座標もy座標も [-1,1] で指定すれば良い
        var x = xScale(-Math.sin(theta));
        var y = yScale(-Math.cos(theta));
        return [x, y];
    }
    var Node = (function () {
        function Node(id, i, nodeSize) {
            this.id = id;
            this.nodeSize = nodeSize;
            this.updatePosition(i);
        }
        Node.prototype.updatePosition = function (i) {
            _a = nodePosition(i, this.nodeSize), this.x = _a[0], this.y = _a[1];
            var _a;
        };
        return Node;
    }());
    var dataset = [];
    for (var i = 0; i < ids.length; i++) {
        var n = ids.length;
        dataset.push(new Node(ids[i], i, n));
    }
    var svg = d3.select(".container")
        .append("svg")
        .attr({ width: width, height: height })
        .classed("center-block", true);
    // https://material.google.com/style/color.html#
    var colorRed = "#F44336";
    var colorOrange = "#FFC107";
    // 円を描画
    svg.selectAll("circle")
        .data(dataset)
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
    svg.selectAll("text")
        .data(dataset)
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
        fill: "white"
    })
        .text(function (d, i) {
        return d.id;
    });
    var counter = 0;
    document.getElementById("button-gt").onclick = function () {
        counter++;
        for (var i = 0; i < dataset.length; i++) {
            dataset[i].updatePosition((counter + i) % dataset.length);
        }
        var duration = 350;
        svg.selectAll("circle")
            .data(dataset)
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
        svg.selectAll("text")
            .data(dataset)
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
