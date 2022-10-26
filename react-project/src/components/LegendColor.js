import React from 'react';
import { CONSTANTS } from '../config';
import { generateSvgSquare } from './LegendSize';

function LegendColor(props) {
    const jetbrainsColors = CONSTANTS.general.colors.jetbrains;
    const scale = [
        {
            color: jetbrainsColors.darkRed,
            label: "Very Low [0-2]"
        },
        {
            color: jetbrainsColors.orange,
            label: "Low [3-5]"
        },
        {
            color: jetbrainsColors.yellow,
            label: "OK [6 - 7]"
        },
        {
            color: jetbrainsColors.green,
            label: "Good [8 - 9]"
        },
        {
            color: jetbrainsColors.blue,
            label: "Very Good [10+]"
        },

    ]

    return (
        <div id="legend-size-container" className='row panel-right mt-2 pt-2 pb-2' >
            <h4>Bus Factor</h4>
            <p className='small'>Red is lower, green is higher</p>
            {scale.map(element => {
                return (
                    <div key={element.label} className="row justify-content-center align-items-center g-1">
                        <div className="col-1">{generateSvgSquare("1.5rem", element.color)}</div>
                        <div className="col-9">{element.label}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default LegendColor;