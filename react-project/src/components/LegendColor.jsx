/** @format */

import React from "react";
import { CONFIG } from "../config";
import { generateSvgSquare } from "../d3/legend.tsx";
import { InfoPanel } from "./InfoPanel";
import { useTranslation } from "react-i18next";
import { BusFactorControls } from "./BusFactorControls";
import { useSelector } from "react-redux";
import { selectColorPalette, selectColorThresholds } from "../reducers/treemapSlice";


function LegendColor(props) {
  const { t } = useTranslation();
  const colorThresholds = useSelector(selectColorThresholds)
  const colorPalette = useSelector(selectColorPalette);
  const jetbrainsColors = CONFIG.general.colors.jetbrains;
  const scale = [
    {
      color: colorPalette[2],
      label: `OK [${colorThresholds[1]}+]`,
    },
    {
      color: colorPalette[1],
      label: `Low [${colorThresholds[0]}-${colorThresholds[1] - 1}]`,
    },
    {
      color: colorPalette[0],
      label: `Dangerous [0-${colorThresholds[0] - 1}]`,
    },
    {
      color: jetbrainsColors.darkGray,
      label: "Not Applicable",
    },
  ];

  return (
    <>
      <div
        id="legend-size-container"
        className="row panel-right mt-2 pt-2 pb-2">
        <h4>
          Bus Factor{" "}
          <InfoPanel
            divName="legendColorInfoPanel"
            header="How are colors determined for the treemap panels"
            body={[t("busFactor.color")]}></InfoPanel>
          <a
            className=""
            data-bs-toggle="collapse"
            data-bs-target="#legendColorCollapsible"
            role="button"
            aria-expanded="true"
            aria-controls="legendColorCollapsible">
            <i className="bi bi-plus-circle-fill"></i>
            <i className="bi bi-dash-circle-fill"></i>
          </a>
        </h4>
        <div
          id="legendColorCollapsible"
          className="collapse show">
          {scale.map((element) => {
            return (
              <div
                key={element.label}
                className="row justify-content-center align-items-center g-1">
                <div className="col-1">
                  { generateSvgSquare("1.5rem", element.color)}
                </div>
                <div className="col-9">{element.label}</div>
              </div>
            );
          })}
        </div>
        <BusFactorControls></BusFactorControls>
      </div>
    </>
  );
}

export default LegendColor;
