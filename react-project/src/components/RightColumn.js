import React from "react";
import StatsPane from "./DetailsPane";

function RightColumn(props) {

    const data = props.data;

    return (
        <div className='col p-1'>
            <StatsPane data={data}></StatsPane>
        </div>)

}

export default RightColumn;