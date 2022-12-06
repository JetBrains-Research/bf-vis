/** @format */

import React from "react";
import LegendColor from "./LegendColor";
import SimulationModeModal from "./SimulationModeModal";
import StatsPane from "./StatsPane";

function RightColumn(props) {
  const statsData = props.statsData;
  const simulationData = props.simulationData;

  return (
    <div className="col p-1">
      <LegendColor></LegendColor>
      <SimulationModeModal
        statsData={statsData}
        simulationVisualizationData={simulationData}></SimulationModeModal>
      <StatsPane data={statsData}></StatsPane>
    </div>
  );
}

export default RightColumn;
