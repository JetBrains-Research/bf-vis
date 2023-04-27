/** @format */

import React from "react";
import { InfoPanel } from "./InfoPanel";
import { generateSvgSquare } from "../d3/legend.tsx";
import { CONFIG } from "../config";
import { useTranslation } from "react-i18next";


function LegendSize(props) {
  const { t } = useTranslation();

  return (
    <div
      id="legend-size-container"
      className="row panel-right mt-2 pt-2 pb-2">
      <h4>
        Size{" "}
        <InfoPanel
          divName="legendSizeInfoPanel"
          header="How is size determined for the treemap panels"
          body={[t("busFactor.size")]}></InfoPanel>
        <a
          className=""
          data-bs-toggle="collapse"
          data-bs-target="#legendSizeCollapsible"
          role="button"
          aria-expanded="false"
          aria-controls="legendSizeCollapsible">
          <i className="bi bi-plus-circle-fill"></i>
          <i className="bi bi-dash-circle-fill"></i>
        </a>
      </h4>
      <div
        id="legendSizeCollapsible"
        className="collapse hide">
        {/* <p className="small">
          We have a log base 2 scale for size. Sizes are relative to other tiles
          on the same directory-level and represent file/folder size in bytes
        </p> */}
        <div className="row justify-content-start align-items-center g-2 m-2">
          <div className="col">
            {generateSvgSquare(
              "2rem",
              CONFIG.general.colors.jetbrains.black
            )}
          </div>
          <div className="col">10 kB</div>
        </div>
        <div className="row justify-content-start align-items-center g-2 m-2">
          <div className="col">
            {generateSvgSquare(
              "4rem",
              CONFIG.general.colors.jetbrains.black
            )}
          </div>
          <div className="col">100 kB</div>
        </div>
      </div>
    </div>
  );
}

export default LegendSize;
