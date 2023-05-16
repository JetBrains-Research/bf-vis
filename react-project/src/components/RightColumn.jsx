/** @format */

import React from "react";
import LegendColor from "./LegendColor";
import StatsPane from "./StatsPane";
import ReactSlider from "react-slider";
import { SliderPicker } from 'react-color';

function RightColumn(props) {
  const statsData = props.statsData;
  // console.log(`Simulation Viz Path (RightColumn): ${simulationPath}`);

  return (
    <div className="col p-1">
      <StatsPane data={statsData}></StatsPane>
      <LegendColor
      summary={"Colors can be picked by clicking on the squares below"}></LegendColor>
    </div>
  );
}

export default RightColumn;
