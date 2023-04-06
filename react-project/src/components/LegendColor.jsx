/** @format */

import React from "react";
import { CONFIG } from "../config";
import { generateSvgSquare } from "../d3/legend";
import { InfoPanel } from "./InfoPanel";
import { useTranslation } from "react-i18next";

function LegendColor(props) {
  const { t } = useTranslation();
  const jetbrainsColors = CONFIG.general.colors.jetbrains;
  const scale = [
    {
      color: jetbrainsColors.white,
      label: "OK",
    },
    {
      color: jetbrainsColors.golden,
      label: "Low [3 - 5]",
    },
    {
      color: jetbrainsColors.brightRed,
      label: "Dangerous [0 - 2]",
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
          <p className="small">Red is lower, green is higher</p>
          {scale.map((element) => {
            return (
              <div
                key={element.label}
                className="row justify-content-center align-items-center g-1">
                <div className="col-1">
                  {generateSvgSquare("1.5rem", element.color)}
                </div>
                <div className="col-9">{element.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex="-1"
        id="offcanvasWithBothOptions"
        aria-labelledby="offcanvasWithBothOptionsLabel">
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title"
            id="offcanvasWithBothOptionsLabel">
            Backdrop with scrolling
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <p>
            Try scrolling the rest of the page to see this option in action.
          </p>
        </div>
      </div>
    </>
  );
}

export default LegendColor;
