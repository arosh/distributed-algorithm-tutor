var width = 940, height = 540;
var dataset = [11, 25, 45, 30, 33];
var svg = d3.select(".container")
    .append("svg")
    .attr({ width: width, height: height })
    .classed("center-block", true);
// https://material.google.com/style/color.html#
var colorRed = "#F44336";
var colorOrange = "#FFC107";
// svg.selectAll("circle")
//     .data(dataset)
//     .enter()
//     .append("circle")
//     .attr({
//         cx: (d, i) => { return 50 + (i * 100); },
//         cy: height / 2,
//         r: 0,
//         fill: "#F44336"
//     })
//     .transition()
//     .duration(300 /* ms */)
//     .delay((d, i) => {
//         return i * 300;
//     })
//     .ease("ciecle") // http://bl.ocks.org/hunzy/9929724
//     .attr({
//         r: (d, i) => { return d; }
//     });
// svg.selectAll("circle")
//     .data(dataset)
//     .enter()
//     .append("circle")
//     .attr({
//         cx: (d, i) => { return 50 + (i * 100); },
//         cy: height / 2,
//         r: (d, i) => { return d; },
//         fill: redColor
//     })
//     .on("mouseover", function (d, i) {
//         d3.select(this).attr({
//             fill: orangeColor
//         });
//     })
//     .on("mouseout", function (d, i) {
//         d3.select(this).attr({
//             fill: redColor
//         });
//     });
var xScale = d3.scale.linear().domain([0, d3.max(dataset)]).range([0, width]).nice();
svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr({
    x: 0,
    y: function (d, i) { return i * 25; },
    width: 0,
    height: 20,
    fill: colorOrange
})
    .on("mouseover", function () {
    d3.select(this).attr({
        fill: colorRed
    });
})
    .on("mouseout", function () {
    d3.select(this).attr({
        fill: colorOrange
    });
})
    .transition()
    .duration(800)
    .ease("cubic")
    .attr({
    width: function (d, i) { return xScale(d); }
});
