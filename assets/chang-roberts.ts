!function () {
    const width = 940, height = 540;
    const ids = [0, 4, 2, 6, 1, 5, 3, 7];
    const nodeRadius = 30;

    const xScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([width / 2 - height / 2 + nodeRadius, width / 2 + height / 2 - nodeRadius]);
    const yScale = d3.scale
        .linear()
        .domain([-1, 1])
        .range([0 + nodeRadius, height - nodeRadius]);

    function nodePosition(i: number, n: number): [number, number] {
        const theta = -2 * Math.PI / n * i;
        const x = xScale(-Math.sin(theta));
        const y = yScale(-Math.cos(theta));
        return [x, y];
    }

    class Node {
        id: number;
        nodeSize: number;
        x: number;
        y: number;

        constructor(id: number, i: number, nodeSize: number) {
            this.id = id;
            this.nodeSize = nodeSize;
            this.updateIndex(i);
        }

        updateIndex(i: number) {
            [this.x, this.y] = nodePosition(i, this.nodeSize)
        }
    }

    const dataset: Node[] = [];
    for (let i = 0; i < ids.length; i++) {
        const n = ids.length;
        dataset.push(new Node(ids[i], i, n));
    }

    const svg = d3.select(".container")
        .append("svg")
        .attr({ width: width, height: height })
        .classed("center-block", true);

    // https://material.google.com/style/color.html#
    const colorRed = "#F44336";
    const colorOrange = "#FFC107";

    svg.selectAll("circle")
        .data(dataset)
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

    svg.selectAll("text")
        .data(dataset)
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
            fill: "white"
        })
        .text((d, i) => {
            return d.id;
        });

    let counter = 0;
    document.getElementById("button-gt").onclick = () => {
        counter++;
        for (let i = 0; i < dataset.length; i++) {
            dataset[i].updateIndex((counter + i) % dataset.length);
        }
        const duration = 350;
        svg.selectAll("circle")
            .data(dataset)
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
        svg.selectAll("text")
            .data(dataset)
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