import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectAllFilters } from '../reducers/treemapSlice';

import { createSVGInContainer, clearCanvas } from '../d3/svgCanvas';
import { generateTreemapLayoutFromData, drawTreemapFromGeneratedLayout } from '../d3/treemap';


function TreeMap(props) {
    const currentDataPath = props.dataPath;
    const setPathFunc = props.setPathFunc;
    const treemapContainerId = props.containerId;
    const treemapSvgId = props.svgId;
    const initialHeight = props.initialHeight;
    const initialWidth = props.initialWidth;

    const filters = useSelector(selectAllFilters);

    useEffect(() => {

        // set data source
        const data = props.data;

        // Container definition and cleanup
        clearCanvas(treemapSvgId);

        // Create SVG canvas
        const svg = createSVGInContainer(`#${treemapContainerId}`, treemapSvgId, initialHeight, initialWidth);

        // Loading and processing data
        const rootNode = generateTreemapLayoutFromData(data, initialHeight, initialWidth, filters);

        // Drawing the treemap from the generated data
        drawTreemapFromGeneratedLayout(svg, rootNode, setPathFunc);


    }, [props.data,
        setPathFunc,
        currentDataPath,
        filters,
        initialHeight,
        initialWidth,
        treemapContainerId,
        treemapSvgId]
    )

    return (
        <div id={treemapContainerId} className='container-fluid'>
        </div>
    )


}

export default TreeMap;