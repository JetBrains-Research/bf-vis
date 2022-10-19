import React from "react";
import StatsPane from "./StatsPane";

function RightColumn(props) {

    const data = props.data;

    return (
        <div className='col p-1'>
            <StatsPane data={data}></StatsPane>
        </div>)

}

export default RightColumn;