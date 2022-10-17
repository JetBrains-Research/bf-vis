import React from 'react';
import { generateSvgSquare } from './LegendSize';

function LegendColor(props) {

    return (
        <div id="legend-size-container" className='row panel mt-2 pt-2 pb-2' >
            <h4>Bus Factor</h4>
            <p className='small'>We map the bus factor to an interpolation of colors ranging from red to green. Red is lower, green is higher</p>
            <div className="row justify-content-center align-items-center g-1">
                <div className="col-1">{generateSvgSquare("1.5rem", "FireBrick")}</div>
                <div className="col-9">Very Low [0-1]</div>
            </div>
            <div className="row justify-content-center align-items-center g-1">
                <div className="col-1">{generateSvgSquare("1.5rem", "Orange")}</div>
                <div className="col-9">Low [2-3]</div>
            </div>
            <div className="row justify-content-center align-items-center g-1">
                <div className="col-1">{generateSvgSquare("1.5rem", "Gold")}</div>
                <div className="col-9">OK [4-6]</div>
            </div>
            <div className="row justify-content-center align-items-center g-1">
                <div className="col-1">{generateSvgSquare("1.5rem", "LimeGreen")}</div>
                <div className="col-9">High [7-10] </div>
            </div>
            <div className="row justify-content-center align-items-center g-1">
                <div className="col-1">{generateSvgSquare("1.5rem", "DarkGreen")}</div>
                <div className="col-9">Very High [10+]</div>
            </div>

        </div>
    )
}

export default LegendColor;