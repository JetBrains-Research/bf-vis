/** @format */

import { React, useState } from "react";
import { CONFIG } from "../config";
import { generateSvgSquare } from "../d3/legend.tsx";
import { InfoPanel } from "./InfoPanel";
import { useTranslation } from "react-i18next";
import { BusFactorControls } from "./BusFactorControls";
import { useDispatch, useSelector } from "react-redux";
import {
  selectColorPalette,
  selectColorThresholds,
  setColors,
} from "../reducers/treemapSlice";
import { PhotoshopPicker } from "react-color";

function LegendColor(props) {
  const dispatch = useDispatch();
  const [displayPalette, setDisplayPalette] = useState(false);
  const [paletteColorIndex, setPaletteColorIndex] = useState(undefined);
  const [paletteColor, setPaletteColor] = useState(undefined);
  const { t } = useTranslation();
  const colorThresholds = useSelector(selectColorThresholds);
  const colorPalette = useSelector(selectColorPalette);
  const jetbrainsColors = CONFIG.general.colors.jetbrains;
  const scale = [
    {
      color: colorPalette[0],
      label: "Not Applicable",
    },
    {
      color: colorPalette[1],
      label: `Dangerous [0-${colorThresholds[0] - 1}]`,
    },
    {
      color: colorPalette[2],
      label: `Low [${colorThresholds[0]}-${colorThresholds[1] - 1}]`,
    },
    {
      color: colorPalette[3],
      label: `OK [${colorThresholds[1]}+]`,
    },
  ];

  const styles = {
    color: {
      width: "36px",
      height: "14px",
      borderRadius: "2px",
    },
    swatch: {
      padding: "5px",
      background: "#fff",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer",
    },
    popover: {
      position: "absolute",
      zIndex: "10",
    },
    cover: {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
  };

  const generateRGBStringFromObject = (rgbObject) => {
    if (rgbObject !== null) {
      if ("r" in rgbObject && "g" in rgbObject && "b" in rgbObject) {
        let rgbString = `rgb(${rgbObject.r},${rgbObject.g},${rgbObject.b})`;
        return rgbString;
      } else throw new Error("rgbObject does not include r, g, or b keys");
    } else throw new Error("empty rgbColor object");
  };
  const handleClick = (index) => {
    setDisplayPalette(!displayPalette);
    setPaletteColorIndex(colorPalette.length - 1 - index);
    setPaletteColor(colorPalette[colorPalette.length - 1 - index]);
  };

  const handleClose = () => {
    setDisplayPalette(false);
    setPaletteColorIndex(undefined);
  };

  const handleChangeComplete = () => {
    console.log(paletteColorIndex);
    console.log(paletteColor);

    let newColorPalette = [...colorPalette];
    if (typeof paletteColor === "object" && typeof paletteColor !== "string") {
      let newPaletteColorRGB = generateRGBStringFromObject(paletteColor);
      console.log(newPaletteColorRGB);
      setPaletteColor(newPaletteColorRGB);
      newColorPalette[paletteColorIndex] = newPaletteColorRGB;
    } else {
      newColorPalette[paletteColorIndex] = paletteColor;
    }
    dispatch(setColors(newColorPalette));
    handleClose();
    updateSliderTrackColors(newColorPalette);
  };

  const updateSliderTrackColors = (colorPalette) => {
    for (let count = 0; count < colorPalette.length - 1; count++) {
      const element = document.querySelector(`.slider-track-${count}`);
      element.style.backGroundColor = colorPalette[count + 1];
    }
  };

  const handleChange = (color, event) => {
    setPaletteColor(color.rgb);
  };

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
          {scale.reverse().map((element, index) => {
            return (
              <div
                key={element.label}
                className="row justify-content-center align-items-center g-1">
                <div
                  className="col-1"
                  onClick={(e) => handleClick(index)}>
                  {generateSvgSquare("1.5rem", element.color)}
                </div>
                <div className="col-9">{element.label}</div>
              </div>
            );
          })}
        </div>
        <BusFactorControls></BusFactorControls>
      </div>
      <div>
        {displayPalette ? (
          <div
            style={styles.popover}
            className="position-absolute top-50 start-50">
            <div
            // style={styles.cover}
            >
              <PhotoshopPicker
                color={paletteColor}
                header={`Pick color for bus factor class`}
                onChange={(color, event) => handleChange(color, event)}
                // onChangeComplete={(color, event) => handleChangeComplete(color, event)}
                onAccept={() => handleChangeComplete()}
                onCancel={() => handleClose()}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default LegendColor;
