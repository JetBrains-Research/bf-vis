import React from "react";
import LegendColor from "./LegendColor";
import SimulationModeModal from "./SimulationModeModal";
import StatsPane from "./StatsPane";

function RightColumn(props) {

    const data = props.data;

    return (
        <div className='col p-1'>
            <LegendColor></LegendColor>
            <SimulationModeModal data={data}></SimulationModeModal>
            <StatsPane data={data}></StatsPane>
        </div>)

}

export default RightColumn;