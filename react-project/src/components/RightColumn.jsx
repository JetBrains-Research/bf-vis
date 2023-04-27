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
      <StatsPane data={statsData}></StatsPane>
      <LegendColor></LegendColor>
      <LegendSize></LegendSize>      
    </div>
  );
}

export default RightColumn;
