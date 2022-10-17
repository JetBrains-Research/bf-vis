import * as d3 from 'd3';

export function createLegend(svg) {
    let keys = ["Very Low", "Low ", "Medium ", "High ", "Very High ", "The Promised Land"];
    let vals = [0, 2, 4, 6, 8, 10]
    let size = 20;
    let color = d3.scaleSequential([0, 10], d3.interpolateRdYlGn);

    svg.selectAll("mydots")
        .data(vals)
        .join("rect")
        .attr("x", 0)
        .attr("y", function (d, i) { return i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color(d) })
        .style("stroke", "black");

    svg.selectAll("mylabels")
        .data(d3.zip(keys, vals))
        .join("text")
        .attr("x", size * 1.2)
        .attr("y", function (d, i) { return i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        // .style("fill", function (d) { return color(d[1]) })
        .style("fill", "black")
        .text(function (d) { return d[1] < 10 ? `${d[0]} (${d[1]}-${d[1] + 1})` : `${d[0]} (${d[1]}+)`  })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}