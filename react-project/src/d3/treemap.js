import * as d3 from 'd3';
import 'd3-transition';
import { pickTextColorBasedOnBgColor } from '../utils/color';
import { LAYOUT_CONSTANTS } from '../config';
import uid from './uid';
import { scopeIn, stats } from '../reducers/defaultSlice';

/*
    This file has all the methods related to the d3 treemap including calculation and rendering
*/

// get max val from data and use it to set the upper limit in color selection
export const color = d3.scaleSequential([0, 10], d3.interpolateRdYlGn)
export const formatSI = d3.format(".2s")

export function normalizeD3DataValues(node) {

    if (node.children) {
        node.children.forEach(element => {
            normalizeD3DataValues(element);
        });
    }

    if (node.value >= 0) {
        node.size = node.value;
        node.value = Math.sqrt(node.value);
    }

    return node;
}


function applyNormalizationToD3Hierarchy(hierarchy, normFunction) {
    if (hierarchy) {
        hierarchy.eachAfter(d => {
            if (d.depth <= 1) {
                d.size = d.value;

                if (d.depth === 1)
                    if (d.size > 0) {
                        d.value = normFunction(d.value);
                    }

                if (d.depth === 0) {
                    d.value = d.children.map(e => e.value).reduce((prevValue, currentValue) => prevValue + currentValue);
                }
            }
        })
    }
    return hierarchy;
}


function applyFilters(hierarchy, filters) {
    if (hierarchy) {
        hierarchy.eachAfter(d => {
            if (filters) {

                if (filters.exclude) {
                    if (filters.exclude.fileNamePrefix) {
                        filters.exclude.fileNamePrefix.forEach((prefix) => {
                            if (d.data.name.startsWith(prefix)) {
                                d.value = 0;
                            }
                        })
                    }
                    if (filters.exclude.extensions) {
                        if (filters.exclude.extensions.includes(d.data.extension)) {
                            d.value = 0;
                        }
                    }
                }
            }
        })
    }
    return hierarchy;
}


function addDimensionsToTreemap(treemap) {
    treemap.eachAfter((d) => {
        d.tileHeight = d.y1 - d.y0;
        d.tileWidth = d.x1 - d.x0;
    })

    return treemap;
}


export function generateTreemapLayoutFromData(data, height, width, filters) {

    // Construct nodes and calculate drawing coordinates from filtered data
    let hierarchicalData = d3.hierarchy(data)
        .sum(d => (d.bytes));

    const treemap = (data) => d3.treemap()
        .size([width, height])
        .padding(LAYOUT_CONSTANTS.treemap.overallPadding)
        .paddingTop(LAYOUT_CONSTANTS.treemap.topPadding)
        .round(false)
        .tile(d3.treemapSquarify)
        (data);

    // Applying filters
    let hiearchyFiltered = applyFilters(hierarchicalData, filters);

    // Applying the log base 2 function to the size
    let hierarchyNormalized = applyNormalizationToD3Hierarchy(hiearchyFiltered, Math.log2);
    hierarchyNormalized.sort((a, b) => b.size - a.size);
    const root = treemap(hierarchyNormalized);
    const rootDimensioned = addDimensionsToTreemap(root)

    return rootDimensioned;
}


export function drawTreemapFromGeneratedLayout(svg, root, dispatch) {
    // Start 'painting'
    const node = svg.selectAll("g")
        .data(d3.group(root.descendants().filter(function (d) {
            return (d.depth < LAYOUT_CONSTANTS.treemap.max_depth)
        }), d => d.data.path))
        .join("g")
        .selectAll("g")
        .data(d => d[1])
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Tooltip
    node.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}
        bytes: ${formatSI(d.size)}
        bus factor: ${("busFactor" in d.data.busFactorStatus) ? d.data.busFactorStatus.busFactor : "?"}
        d3-value: ${d.value}`);

    // Tiles
    node.filter((d) => d.depth > 0).append("rect")
        .style("rx", 5)
        .style("ry", 5)
        .attr("width", d => d.tileWidth)
        .transition("firstRender").duration(500)
        .ease(d3.easeSin)
        .style("fill", d => {
            if ("busFactor" in d.data.busFactorStatus) {
                d.color = color(d.data.busFactorStatus.busFactor)
            }
            else d.color = "rgb(200,200,200)";
            return d.color;
        })
        .style("stroke", "#7D7D7D")
        .attr("id", d => (d.nodeUid = uid("node")).id)
        .attr("height", d => d.tileHeight);

    node.filter((d) => d.depth === 0).append("rect")
        .style("fill", d => {
            if ("busFactor" in d.data.busFactorStatus) {
                d.color = color(d.data.busFactorStatus.busFactor)
            }
            else d.color = "rgb(200,200,200)";
            return d.color;
        })
        .style("stroke", "black")
        .style("rx", 5)
        .style("ry", 5)
        .attr("width", d => d.tileWidth)
        .attr("id", d => (d.nodeUid = uid("node")).id)
        .attr("height", d => d.tileHeight);

    const textBox = node
        .append("foreignObject")
        .attr("width", d => d.tileWidth)
        .attr("height", d => d.tileHeight)
        .on('click', (e, d) => {
            const payload = {
                path: d.data.path
            }
            if ("children" in d.data) {
                dispatch(scopeIn(payload));
            }
            else {
                dispatch(stats(payload))
            }
        })
        .append("xhtml:div")
        .attr("class", (d) => d.depth > 0 ? "row p-0 m-0 align-items-center fw-semibold h-100" : "row px-1 fw-semibold")
        .on("mouseover", (e, d) => {
            if (d.depth > 0) {
                const pElement = d3.select(`#p-${d.nodeUid.id}`);
                pElement.classed("text-truncate", false);

                const rects = d3.select(d.nodeUid.href)
                rects.transition().duration(500)
                    .ease(d3.easeExpOut)
                    .style("stroke-width", "0.3rem")
                    .style("stroke", "#7D7D7D");
            }
        })
        .on("mouseout", (e, d) => {
            const pElement = d3.select(`p${`#p-${d.nodeUid.id}`}`);
            pElement.classed("text-truncate", true);

            const rects = d3.select(d.nodeUid.href)
            rects.transition().duration(500)
                .ease(d3.easeElastic)
                .style("stroke-width", null);
        })
        .append("div")

    textBox
        .filter((d) => d.data.children && d.depth > 0)
        .append("xhtml:i")
        .attr("class", "bi bi-folder2")
        .style("color", (d) => pickTextColorBasedOnBgColor(d.color, "#CDCDCD", "#343434"))
        .style("font-size", "1.5em");

    textBox.append("xhtml:p")
        .text(d => {
            return d.data.name
        })
        .attr("class", "text-truncate")
        .attr("id", (d) => `p-${d.nodeUid.id}`)
        .style("overflow-wrap", "break-word")
        .style("color", (d) => pickTextColorBasedOnBgColor(d.color, "#CDCDCD", "#343434"))
        .style("font-size", "0.8rem")
}