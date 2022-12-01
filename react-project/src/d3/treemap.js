import * as d3 from 'd3';
import 'd3-transition';
import { pickTextColorBasedOnBgColor } from '../utils/color';
import { CONSTANTS } from '../config';
import uid from './uid';


/*
    This file has all the methods related to the d3 treemap including calculation and rendering
*/

// get max val from data and use it to set the upper limit in color selection
const JETBRAINS_COLORS = CONSTANTS.general.colors.jetbrains;
const MAX_BUS_FACTOR_COLOR_VALUE = CONSTANTS.treemap.logic.maxBusFactorValue;
export const colorSequence = [
    JETBRAINS_COLORS.darkRed,
    JETBRAINS_COLORS.orange,
    JETBRAINS_COLORS.yellow,
    JETBRAINS_COLORS.green,
    JETBRAINS_COLORS.blue
];

export const color = d3.scaleQuantize().domain([0, MAX_BUS_FACTOR_COLOR_VALUE]).range(colorSequence);
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

                if (filters.exclusion.fileNamePrefixes) {
                    if (filters.exclusion.fileNamePrefixes) {
                        filters.exclusion.fileNamePrefixes.forEach((prefix) => {
                            if (d.data.name.startsWith(prefix)) {
                                d.value = 0;
                            }
                        })
                    }
                    if (filters.exclusion.extensions) {
                        if (filters.exclusion.extensions.includes(d.data.extension)) {
                            d.value = 0;
                        }
                    }
                    if (filters.exclusion.fileNames) {
                        filters.exclusion.fileNames.forEach((element) => {
                            if (d.data.name === element) {
                                d.value = 0;
                            }
                        })
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


function addColorsToTreemap(treemap) {
    treemap.eachAfter((d) => {
        const color = chooseRectangleFillColor(d)
        d.bgColor = color;
        d.textColor = pickTextColorBasedOnBgColor(color, JETBRAINS_COLORS.gray, JETBRAINS_COLORS.black);
    })
}


function chooseRectangleFillColor(d) {

    if ("busFactor" in d.data.busFactorStatus) {
        return color(d.data.busFactorStatus.busFactor);
    }

    else return JETBRAINS_COLORS.gray;
}


function chooseRectangleFillColorMiniTreemap(d) {
    if ("busFactor" in d.data.busFactorStatus) {
        
    }
}


function rectangleOnClickHandler(d, setPathFunction) {

    if ("children" in d.data) {
        setPathFunction(d.data.path);
        // dispatch(scopeTreemapIn(payloadGenerator("path", d.data.path)));
    }
    else {
        setPathFunction("", d.data.path);
        // dispatch(scopeStatsIn(payloadGenerator("path", d.data.path)));
    }

}


function rectangleOnMouseOverHandler(d) {

    if (d.depth > 0) {
        const pElement = d3.select(`#p-${d.nodeUid.id}`);
        pElement.classed("text-truncate", false);

        const rects = d3.select(d.nodeUid.href)
        rects.transition().duration(500)
            .ease(d3.easeExpOut)
            .style("stroke-width", "0.3rem");
    }
}


function rectangleOnMouseOutHandler(d) {

    const pElement = d3.select(`p${`#p-${d.nodeUid.id}`}`);
    pElement.classed("text-truncate", true);

    const rects = d3.select(d.nodeUid.href)
    rects.transition().duration(CONSTANTS.treemap.children.rect.transitionDuration)
        .ease(d3.easeElastic)
        .style("stroke-width", "0.1rem");
}


export function generateTreemapLayoutFromData(data, height, width, filters) {

    // Construct nodes and calculate drawing coordinates from filtered data
    let hierarchicalData = d3.hierarchy(data)
        .sum(d => (d.bytes));

    const treemap = (data) => d3.treemap()
        .size([width, height])
        .padding(CONSTANTS.treemap.layout.overallPadding)
        .paddingTop(CONSTANTS.treemap.layout.topPadding)
        .round(false)
        .tile(d3.treemapSquarify)
        (data);

    // Applying filters
    let hierarchyFiltered = applyFilters(hierarchicalData, filters);

    // Applying the log base 2 function to the size
    let hierarchyNormalized = applyNormalizationToD3Hierarchy(hierarchyFiltered, Math.log2);

    // Sort the nodes
    hierarchyNormalized.sort((a, b) => b.size - a.size);

    // Form treemap
    const root = treemap(hierarchyNormalized);

    // Populate dimensions to prevent repeated calculation of the same values
    addDimensionsToTreemap(root)

    // Calculate color of background and text
    addColorsToTreemap(root)

    return root;
}


export function drawMiniTreemapFromGeneratedLayout(svg, root) {
    const node = svg.selectAll("g")
        .data(d3.group(root.descendants().filter(function (d) {
            return (d.depth < CONSTANTS.treemap.logic.maxDepth)
        }), d => d.data.path))
        .join("g")
        .selectAll("g")
        .data(d => d[1])
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    node.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}
bytes: ${formatSI(d.size)}
bus factor: ${("busFactor" in d.data.busFactorStatus) ? d.data.busFactorStatus.busFactor : "?"}
d3-value: ${d.value}`);
    
    // Tiles
    node.filter((d) => d.depth > 0).append("rect")
        .style("rx", CONSTANTS.treemap.children.rect.rx)
        .style("ry", CONSTANTS.treemap.children.rect.ry)
        .attr("width", d => d.tileWidth)
        .transition("firstRender").duration(CONSTANTS.treemap.children.rect.transitionDuration)
        .ease(d3.easeSin)
        .style("fill", (d) => chooseRectangleFillColor(d))
        .style("stroke", JETBRAINS_COLORS.black)
        .attr("id", d => (d.nodeUid = uid("node")).id)
        .attr("height", d => d.tileHeight);
}


export function drawTreemapFromGeneratedLayout(svg, root, setPathFunction) {
    // Start 'painting'
    const node = svg.selectAll("g")
        .data(d3.group(root.descendants().filter(function (d) {
            return (d.depth < CONSTANTS.treemap.logic.maxDepth)
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
        .style("rx", CONSTANTS.treemap.children.rect.rx)
        .style("ry", CONSTANTS.treemap.children.rect.ry)
        .attr("width", d => d.tileWidth)
        .transition("firstRender").duration(CONSTANTS.treemap.children.rect.transitionDuration)
        .ease(d3.easeSin)
        .style("fill", (d) => chooseRectangleFillColor(d))
        .style("stroke", JETBRAINS_COLORS.black)
        .attr("id", d => (d.nodeUid = uid("node")).id)
        .attr("height", d => d.tileHeight);

    node.filter((d) => d.depth === 0).append("rect")
        .style("fill", d => chooseRectangleFillColor(d))
        .style("stroke", JETBRAINS_COLORS.black)
        .style("opacity", CONSTANTS.treemap.children.rect.parentOpacity)
        .style("rx", CONSTANTS.treemap.children.rect.rx)
        .style("ry", CONSTANTS.treemap.children.rect.ry)
        .attr("width", d => d.tileWidth)
        .attr("id", d => (d.nodeUid = uid("node")).id)
        .attr("height", d => d.tileHeight);

    const textBox = node
        .append("foreignObject")
        .attr("width", d => d.tileWidth)
        .attr("height", d => d.tileHeight)
        .on('click', (_e, d) => rectangleOnClickHandler(d, setPathFunction))
        .append("xhtml:div")
        .attr("class", (d) => d.depth > 0 ? CONSTANTS.treemap.classes.rectWrapperChild : CONSTANTS.treemap.classes.rectWrapperParent)
        .on("mouseover", (_e, d) => rectangleOnMouseOverHandler(d))
        .on("mouseout", (_e, d) => rectangleOnMouseOutHandler(d))
        .append("div")

    textBox
        .filter((d) => d.data.children && d.depth > 0)
        .append("xhtml:i")
        .attr("class", CONSTANTS.treemap.classes.folderIcon)
        .style("color", (d) => d.textColor)
        .style("font-size", CONSTANTS.treemap.children.icon.fontSize);

    textBox.append("xhtml:p")
        .text(d => {
            return d.data.name
        })
        .attr("class", "text-truncate")
        .attr("id", (d) => `p-${d.nodeUid.id}`)
        .style("overflow-wrap", "break-word")
        .style("color", (d) => d.textColor)
        .style("font-size", CONSTANTS.treemap.children.p.fontSize)
}