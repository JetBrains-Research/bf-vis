/** @format */

import React from "react";

export const generateSvgSquare = (size, color) => {
  if (size && color)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill={color}
        className="bi bi-square-fill"
        viewBox="0 0 16 16">
        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z" />
      </svg>
    );
};

function LegendSize(props) {
  return (
    <div
      id="legend-size-container"
      className="row panel mt-2 pt-2 pb-2">
      <h4>Size</h4>
      <p className="small">
        We have a log base 2 scale for size. Sizes are relative to other tiles
        on the same directory-level
      </p>
      <div className="row justify-content-start align-items-center g-2">
        <div className="col">{generateSvgSquare("2rem", "DarkGreen")}</div>
        <div className="col">10 lines</div>
      </div>
      <div className="row justify-content-start align-items-center g-2">
        <div className="col">{generateSvgSquare("4rem", "DarkGreen")}</div>
        <div className="col">100 lines</div>
      </div>
    </div>
  );
}

export default LegendSize;
