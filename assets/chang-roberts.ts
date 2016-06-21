!function () {
    class Scaler {
        constructor(
            public xScale: d3.scale.Linear<number, number>,
            public yScale: d3.scale.Linear<number, number>) {
        }
    }

    class Node {
        x: number;
        y: number;

        constructor(public id: number, public nodeSize: number, public scaler: Scaler) {
            this.id = id;
            this.nodeSize = nodeSize;
        }

        computePosition(i: number) {
            const theta = -2 * Math.PI / this.nodeSize * i;
            // x座標もy座標も [-1,1] で指定すれば良い
            this.x = this.scaler.xScale(-Math.sin(theta));
            this.y = this.scaler.yScale(-Math.cos(theta));
        }
    }

    class Message {
        index: number;

        constructor(public text: string) {
            this.text = text;
        }
    }

    const width = 940, height = 540;
    const ids = [0, 4, 2, 6, 1, 5, 3, 7];
    const nodeRadius = 30;
    const messageFontSize = 18;
    const messageTx = -30;
    const messageTy = -30;

    const xScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([width / 2 - height / 2 + nodeRadius, width / 2 + height / 2 - nodeRadius]);
    const yScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([0 + nodeRadius, height - nodeRadius]);
    const scaler = new Scaler(xScale, yScale);

    const nodes: Node[] = [];
    for (let i = 0; i < ids.length; i++) {
        const n = ids.length;
        const node = new Node(ids[i], n, scaler);
        node.computePosition(i);
        nodes.push(node);
    }

    const messages: Message[] = [];
    for (let i = 0; i < ids.length; i++) {
        const message = new Message("<candidate," + ids[i] + ">");
        message.index = i;
        messages.push(message);
    }

    const svg = d3.select(".container")
        .append("svg")
        .attr({ width: width, height: height })
        .classed("center-block", true);

    const svgNode = svg.append("g");
    const svgMessage = svg.append("g");

    // https://material.google.com/style/color.html#
    const colorRed = "#F44336";
    const colorOrange = "#FFC107";
    const colorBlueGrey = "#607D8B";
    const colorWhite = "#FAFAFA";
    const colorBlack = "#212121";

    // 円を描画
    svgNode.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr({
            cx: (d, i) => {
                return d.x;
            },
            cy: (d, i) => {
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
            x: (d, i) => {
                return d.x;
            },
            y: (d, i) => {
                return d.y;
            },
            "text-anchor": "middle",
            "font-size": nodeRadius,
            dy: "0.35em",
            fill: colorWhite
        })
        .text((d, i) => {
            return d.id;
        });

    document.getElementById("button-start").onclick = () => {
        svgMessage.selectAll("text")
            .data(messages)
            .enter()
            .append("text");

        svgMessage.selectAll("text")
            .data(messages)
            .attr({
                x: (d, i) => {
                    return nodes[d.index].x + messageTx;
                },
                y: (d, i) => {
                    return nodes[d.index].y + messageTy;
                },
                "text-anchor": "middle",
                "font-size": nodeRadius,
                fill: colorBlack
            })
            .text((d, i) => { return d.text; })
    }

    let counter = 0;
    document.getElementById("button-gt").onclick = () => {
        counter++;
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].computePosition((counter + i) % nodes.length);
        }
        const duration = 350;
        svgNode.selectAll("circle")
            .data(nodes)
            .transition()
            .duration(duration)
            .ease("linear")
            .attr({
                cx: (d, i) => {
                    return d.x;
                },
                cy: (d, i) => {
                    return d.y;
                },
            });
        svgNode.selectAll("text")
            .data(nodes)
            .transition()
            .duration(duration)
            .ease("linear")
            .attr({
                x: (d, i) => {
                    return d.x;
                },
                y: (d, i) => {
                    return d.y;
                },
            });
    };
} ();
