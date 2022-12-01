import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CONSTANTS, treemapSvgId, treemapContainerId } from '../config';

import { selectAllFilters } from '../reducers/treemapSlice';

import { createSVGInContainer, clearCanvas } from '../d3/svgCanvas';
import { generateTreemapLayoutFromData, drawTreemapFromGeneratedLayout } from '../d3/treemap';



function TreeMap(props) {
    const currentDataPath = props.dataPath;
    const setPathFunc = props.setPathFunc;
    const filters = useSelector(selectAllFilters);

    useEffect(() => {

        // set data source
        const data = props.data;

        // Container definition and cleanup
        clearCanvas(treemapSvgId);

        // Create SVG canvas
        const svg = createSVGInContainer(`#${treemapContainerId}`, treemapSvgId, CONSTANTS.treemap.layout.height, CONSTANTS.treemap.layout.width);

        // Loading and processing data
        const rootNode = generateTreemapLayoutFromData(data, CONSTANTS.treemap.layout.height, CONSTANTS.treemap.layout.width, filters);

        // Drawing the treemap from the generated data
        drawTreemapFromGeneratedLayout(svg, rootNode, setPathFunc);


    }, [props.data, setPathFunc, currentDataPath, filters]
    )

    return (
        <div id={treemapContainerId} className='container-fluid'>
        </div>
    )


}

export default TreeMap;