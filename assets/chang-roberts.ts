!function () {
    const width = 970 / 12 * 9, height = 540;
    const duration = 350;
    const ids = [0, 4, 2, 6, 1, 5, 3, 7];
    const nodeRadius = 30;
    const messageFontSize = 18;
    const rectWidth = 4 * nodeRadius;
    const rectHeight = 1.5 * nodeRadius;
    const rectCornerRadius = 4;

    class Point {
        constructor(private x: number, private y: number) { }

        getX(): number {
            return this.x;
        }

        getY(): number {
            return this.y;
        }
    }

    class Scaler {
        constructor(
            public xScale: d3.scale.Linear<number, number>,
            public yScale: d3.scale.Linear<number, number>) { }
    }

    class MessagePositionCalculator {
        constructor(public nodeSize: number) {
            if (nodeSize != 8) {
                throw new Error("nodeSize != 8");
            }
        }

        computeRelativePosition(i: number): Point {
            const dict: { [index: number]: [number, number] } = {
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
        }
    }

    class Node {
        index: number;
        point: Point;
        messagePositioncalculator: MessagePositionCalculator;
        isActive: boolean;
        private status: string;

        constructor(public id: number, public nodeSize: number) {
            this.id = id;
            this.nodeSize = nodeSize;
            this.messagePositioncalculator = new MessagePositionCalculator(nodeSize);
            this.isActive = true;
            this.status = "";
        }

        getX(): number {
            return this.point.getX();
        }

        getY(): number {
            return this.point.getY();
        }

        updateIndexAndPosition(index: number) {
            this.index = index;
            this.updatePosition();
        }

        updatePosition() {
            const theta = -2 * Math.PI / this.nodeSize * this.index;
            // x座標もy座標も [-1,1] で指定すれば良い
            this.point = new Point(-Math.sin(theta), -Math.cos(theta));
        }

        computeMessagePosition(): Point {
            const t = this.messagePositioncalculator.computeRelativePosition(this.index);
            return new Point(this.getX() + t.getX(), this.getY() + t.getY());
        }

        deactivate() {
            this.isActive = false;
        }

        updateStatus(status: string) {
            this.status = status;
        }

        getStatus(): string {
            return this.status;
        }
    }

    class Message {
        nodeIndex: number;

        constructor(public label: string, public data: number) { }
        toString(): string {
            return "<" + this.label + "," + this.data + ">";
        }
    }

    const xScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([width / 2 - height / 2 + 2 * nodeRadius, width / 2 + height / 2 - 2 * nodeRadius]);
    const yScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([0 + 2 * nodeRadius, height - 2 * nodeRadius]);
    const scaler = new Scaler(xScale, yScale);

    let nodes: Node[];
    let messages: Message[];

    const svg = d3.select("#d3")
        .append("svg")
        .attr({ width: width, height: height })
        .classed("center-block", true);

    const svgBackground = svg.append("g");
    const svgNode = svg.append("g");
    const svgNodeStatus = svg.append("g");
    const svgMessage = svg.append("g");

    let svgNodeCircle: d3.selection.Update<Node>;
    let svgNodeText: d3.selection.Update<Node>;
    let svgNodeStatusRect: d3.selection.Update<Node>;
    let svgNodeStatusText: d3.selection.Update<Node>;
    let svgMessageText: d3.selection.Update<Message>;

    // https://material.google.com/style/color.html#
    const colorRed = "#F44336";
    const colorOrange = "#FFC107";
    const colorBlueGrey = "#607D8B";
    const colorWhite = "#FAFAFA";
    const colorBlack = "#212121";

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
        nodes = [];
        for (let i = 0; i < ids.length; i++) {
            const n = ids.length;
            const node = new Node(ids[i], n);
            node.updateIndexAndPosition(i);
            node.updateStatus("leader = undefined");
            nodes.push(node);
        }

        messages = [];
        for (let i = 0; i < ids.length; i++) {
            const message = new Message("candidate", ids[i]);
            message.nodeIndex = i;
            messages.push(message);
        }
    }

    function initializeNodeView() {
        if (Array.isArray(nodes) == false) {
            throw new Error("Array.isArray(nodes) == false");
        }
        if (nodes.length != 8) {
            throw new Error("nodes.length != 8");
        }

        // ノードを表す円を描画
        svgNodeCircle = svgNode.selectAll("circle").data(nodes);
        svgNodeCircle.enter().append("circle");
        svgNodeCircle
            .attr({
                cx: (d, i) => {
                    return scaler.xScale(d.getX());
                },
                cy: (d, i) => {
                    return scaler.yScale(d.getY());
                },
                r: nodeRadius,
                fill: colorRed
            });

        // 円の中にテキストを描画
        // "text-anchor": "middle", dy: "0.35em" と設定すると、ちょうどいい感じになる
        // http://qiita.com/daxanya1/items/734e65a7ca58bbe2a98c
        svgNodeText = svgNode.selectAll("text").data(nodes);
        svgNodeText.enter().append("text");
        svgNodeText
            .attr({
                x: (d, i) => {
                    return scaler.xScale(d.getX());
                },
                y: (d, i) => {
                    return scaler.yScale(d.getY());
                },
                "text-anchor": "middle",
                "font-size": nodeRadius,
                dy: "0.35em",
                fill: colorWhite
            })
            .text((d, i) => { return d.id; });

        /*
        svgNodeStatusRect = svgNodeStatus.selectAll("rect").data(nodes);
        svgNodeStatusRect.enter().append("rect");
        svgNodeStatusRect.attr({
            x: (d, i) => {
                return scaler.xScale(d.getX()) - rectWidth / 2;
            },
            y: (d, i) => {
                return scaler.yScale(d.getY() + 0.2) - rectHeight / 2;
            },
            width: rectWidth,
            height: rectHeight,
            rx: rectCornerRadius,
            ry: rectCornerRadius,
            fill: colorWhite,
            stroke: colorBlack
        });
        */
    }

    function initializeMessageView() {
        if (Array.isArray(messages) == false) {
            throw new Error("Array.isArray(messages) == false");
        }
        if (messages.length != 8) {
            throw new Error("messages.length != 8");
        }

        svgMessageText = svgMessage.selectAll("text").data(messages);
        svgMessageText.enter().append("text");
        svgMessageText
            .attr({
                x: (d, i) => {
                    return scaler.xScale(nodes[d.nodeIndex].computeMessagePosition().getX());
                },
                y: (d, i) => {
                    return scaler.yScale(nodes[d.nodeIndex].computeMessagePosition().getY());
                },
                "text-anchor": "middle",
                "font-size": messageFontSize,
                fill: colorBlack
            })
            .text((d, i) => { return d.toString(); })
    }

    initializeBackground();

    let counter = 0;

    document.getElementById("button-start").onclick = () => {
        counter = 0;
        initializeModel();
        initializeNodeView();
        initializeMessageView();
    }

    document.getElementById("button-gt").onclick = () => {
        counter++;

        for (let i = 0; i < messages.length; i++) {
            messages[i].nodeIndex = (counter + i) % nodes.length;
        }

        svgMessageText.transition()
            .duration(duration)
            .ease("linear")
            .attr({
                x: (d, i) => {
                    return scaler.xScale(nodes[d.nodeIndex].computeMessagePosition().getX());
                },
                y: (d, i) => {
                    return scaler.yScale(nodes[d.nodeIndex].computeMessagePosition().getY());
                },
            });

        let leader = -1;
        for (let i = 0; i < messages.length; i++) {
            if (nodes[messages[i].nodeIndex].id > messages[i].data) {
                nodes[messages[i].nodeIndex].deactivate();
            }
            else if (nodes[messages[i].nodeIndex].id == messages[i].data) {
                leader = messages[i].nodeIndex;
            }
        }

        svgNodeCircle.attr({
            fill: (d, i) => {
                return d.isActive ? colorRed : colorBlueGrey;
            }
        });

        if (leader != -1) {

        }
    };
} ();
