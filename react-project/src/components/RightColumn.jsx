/** @format */

import React from "react";
import { simulationVisualizationPath } from "../reducers/treemapSlice";
import LegendColor from "./LegendColor";
import SimulationModeModal from "./SimulationModeModal";
import StatsPane from "./StatsPane";

function RightColumn(props) {
  const statsData = props.statsData;
  const simulationData = props.simulationData;
  const simulationPath = props.simulationPath;
  // console.log(`Simulation Viz Path (RightColumn): ${simulationPath}`);

  return (
    <div className="col p-1">
      <LegendColor></LegendColor>
      <SimulationModeModal
        statsData={statsData}
        simulationData={simulationData}
        simulationPath={simulationPath}
        reduxNavFunctions={props.reduxNavFunctions}></SimulationModeModal>
      <StatsPane data={statsData}></StatsPane>
    </div>
  );
}

export default RightColumn;
