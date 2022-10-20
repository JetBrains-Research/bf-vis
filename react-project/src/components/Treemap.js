import React, { useEffect, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { LAYOUT_CONSTANTS, treemapSvgId, treemapContainerId } from '../config';

import { selectAllFilters } from '../reducers/filterSlice';

import { createSVGInContainer, clearCanvas } from '../d3/svgCanvas';
import { generateTreemapLayoutFromData, drawTreemapFromGeneratedLayout } from '../d3/treemap';
import { scopeTreemapIn } from '../reducers/treemapSlice';
import { payloadGenerator } from '../utils/reduxActionPayloadCreator';

function TreeMap(props) {
    const dispatch = props.dispatch;
    const filters = useSelector(selectAllFilters);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const path = searchParams.get("path") || "";

        if (path && path !== props.data.path) {
            dispatch(scopeTreemapIn(payloadGenerator("path", path)));
        }
    }, [searchParams, props.data.path])

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

    }, [props.data, filters, dispatch, searchParams]
    )

    useEffect(() => {
        setSearchParams({
            "path": props.data.path,
        })
    }, [setSearchParams, props.data.path])

    return (
        <div id={treemapContainerId} className='container-fluid'>
        </div>
    )


}

export default TreeMap;