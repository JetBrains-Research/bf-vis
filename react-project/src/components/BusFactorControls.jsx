/** @format */

import { React, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ReactSlider from "react-slider";
import {
  selectColorPalette,
  selectColorThresholds,
  setColorThresholds,
  setColors,
} from "../reducers/treemapSlice";

export function BusFactorControls(props) {
  const [show, setShow] = useState(false);
  const colorPalette = useSelector(selectColorPalette);
  const colorThresholds = useSelector(selectColorThresholds);
  const dispatch = useDispatch();

  const handleClose = () => {
    setShow(false);
  };

  const handleOpen = () => {
    setShow(true);
  };

  const handleSliderChange = (result, index) => {
    console.log("handleSliderChange", result, index);
    console.log("Thresholds in handle func", colorThresholds);
    let newColorThresholds = Array.from(colorThresholds);

    console.log("newThresholds in handle func", newColorThresholds);
    dispatch(setColorThresholds(result));
  };

  const handleColorChange = (color, index) => {
    let newColors = colorPalette;
    newColors[index] = color;
    dispatch(setColors(newColors));
  };

  return (
    <div className="container mt-2">
      <Button
        variant="primary"
        onClick={() => handleOpen()}>
        Configure TreeMap
      </Button>{" "}
      <Modal
        show={show}
        onHide={handleClose}
        size="large">
        <Modal.Header>
          <Modal.Title>Configure colors and range thresholds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            <div
              className="row mb-5"
              id="slider-row">
              <ReactSlider
                className="horizontal-slider"
                thumbClassName="slider-thumb"
                thumbActiveClassName="slider-thumb-active"
                withTracks={true}
                trackClassName="slider-track m-2"
                value={colorThresholds}
                ariaLabelledby={[
                  "Leftmost thumb",
                  "Middle thumb",
                  "Rightmost thumb",
                ]}
                renderThumb={(props, state) => (
                  <div
                    className="mb-5"
                    {...props}>
                    {state.valueNow}
                  </div>
                )}
                pearling={true}
                minDistance={1}
                min={1}
                max={20}
                onAfterChange={handleSliderChange}
              />
            </div>
            <div className="row">
              <p>
                Choose the colors to paint the tiles with and the values at
                which the colors switchover
              </p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
