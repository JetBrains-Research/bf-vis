import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectFilters } from '../reducers/defaultSlice';
import { createSVGInContainer, clearCanvas } from '../d3/svgCanvas';
import { generateTreemapLayoutFromData, drawTreemapFromGeneratedLayout } from '../d3/treemap';
import { LAYOUT_CONSTANTS, treemapSvgId, treemapContainerId } from '../config';

function TreeMap(props) {
    const dispatch = props.dispatch;
    const filters = useSelector(selectFilters);
    
    useEffect(() => {

        // set data source
        const data = props.data;

        // Container definition and cleanup
        clearCanvas(treemapSvgId);

        // Create SVG canvas
        const svg = createSVGInContainer(`#${treemapContainerId}`, treemapSvgId, LAYOUT_CONSTANTS.treemap.height, LAYOUT_CONSTANTS.treemap.width);

        // Loading and processing data
        const rootNode = generateTreemapLayoutFromData(data, LAYOUT_CONSTANTS.treemap.height, LAYOUT_CONSTANTS.treemap.width, filters);

        // Drawing the treemap from the generated data
        drawTreemapFromGeneratedLayout(svg, rootNode, dispatch, filters);

    }, [props.data, filters, dispatch]
    )

    return (
        <div id={treemapContainerId} className='container-fluid'>
        </div>
    )
}

export default TreeMap;