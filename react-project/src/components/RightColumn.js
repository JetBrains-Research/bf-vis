import React from "react";
import LegendColor from "./LegendColor";
import StatsPane from "./StatsPane";

function RightColumn(props) {

    const data = props.data;

    return (
        <div className='col p-1'>
            <StatsPane data={data}></StatsPane>
            <LegendColor></LegendColor>
        </div>)

}

export default RightColumn;