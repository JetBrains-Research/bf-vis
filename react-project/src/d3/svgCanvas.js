import * as d3 from 'd3';

export function createSVGInContainer(containerId, svgId, height, width) {
    return d3.select(containerId)
        .append("svg")
        .attr("xmlns:xhtml", "http://www.w3.org/1999/xhtml")
        .attr("id", svgId)
        .attr("height", height)
        .attr("width", width);
}

export function clearCanvas(svgId) {
    let svg_element = document.getElementById(svgId);

    if (svg_element) {
        svg_element.parentNode.removeChild(svg_element);
    }
}