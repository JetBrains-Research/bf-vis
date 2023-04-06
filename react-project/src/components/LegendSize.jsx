/** @format */

import React from "react";
import { generateSvgSquare } from "../d3/legend";
import { CONFIG } from "../config";

function LegendSize(props) {
  return (
    <div
      id="legend-size-container"
      className="row panel-right mt-2 pt-2 pb-2">
      <h4>Size</h4>
      <p className="small">
        We have a log base 2 scale for size. Sizes are relative to other tiles
        on the same directory-level and represent file/folder size in bytes
      </p>
      <div className="row justify-content-start align-items-center g-2">
        <div className="col">{generateSvgSquare("2rem", CONFIG.general.colors.jetbrains.darkGray)}</div>
        <div className="col">10 lines</div>
      </div>
      <div className="row justify-content-start align-items-center g-2">
        <div className="col">{generateSvgSquare("4rem", CONFIG.general.colors.jetbrains.darkGray)}</div>
        <div className="col">100 lines</div>
      </div>
    </div>
  );
}

export default LegendSize;
