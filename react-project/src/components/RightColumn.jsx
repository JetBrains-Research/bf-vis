/** @format */

import React from "react";
import LegendColor from "./LegendColor";
import StatsPane from "./StatsPane";
import LegendSize from "./LegendSize";

function RightColumn(props) {
  const statsData = props.statsData;
  // console.log(`Simulation Viz Path (RightColumn): ${simulationPath}`);

  return (
    <div className="col p-1">
      <LegendColor></LegendColor>
      <LegendSize></LegendSize>      
      <StatsPane data={statsData}></StatsPane>
    </div>
  );
}

export default RightColumn;
