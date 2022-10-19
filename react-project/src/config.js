export const treemapSvgId = "d3_treemap_svg";
export const treemapContainerId = "treemap-container"
export const legendSvgId = "d3_legend_svg";
export const legendSizeSvgId = "d3_legend_size_svg";
export const LAYOUT_CONSTANTS = {
    treemap: {
        overallPadding: window.innerHeight * 0.01,
        topPadding: window.innerHeight * 0.05,
        height: window.innerHeight,
        width: window.innerWidth * 0.65,
        max_depth: 2,
    },
    legend: {
        height: "100%",
        width: "100%",
    }
}