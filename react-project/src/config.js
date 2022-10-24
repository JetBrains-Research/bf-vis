export const treemapSvgId = "d3_treemap_svg";
export const treemapContainerId = "treemap-container"
export const legendSvgId = "d3_legend_svg";
export const legendSizeSvgId = "d3_legend_size_svg";
export const CONSTANTS = {
    general: {
        colors: {
            jetbrains: {
                black: "rgb(0,0,0)",
                blue: "rgb(8,124,250)",
                brightBlue: "rgb(7,195,242)",
                brightGreen: "rgb(59,234,98)",
                brightPurple: "rgb(255,69,237)",
                brightRed: "rgb(254,40,87)",
                darkGray: "rgb(125,125,125)",
                darkPurple: "rgb(175,29,245)",
                darkRed: "rgb(221,18,101)",
                golden: "rgb(253,182,13)",
                gray: "rgb(205,205,205)",
                green: "rgb(33,215,137)",
                indigo: "rgb(107,87,255)",
                orange: "rgb(252,128,29)",
                pink: "rgb(255,49,140)",
                yellow: "rgb(252,248,74)",
            }
        }
    },
    treemap: {
        layout: {
            height: window.innerHeight,
            overallPadding: window.innerHeight * 0.01,
            topPadding: window.innerHeight * 0.05,
            width: window.innerWidth * 0.65,
        },
        logic: {
            maxDepth: 2,
            maxBusFactorValue: 10,
        },
        classes: {

        },
    },
    legend: {
        layout: {
            height: "100%",
            width: "100%",
        }
    }
}