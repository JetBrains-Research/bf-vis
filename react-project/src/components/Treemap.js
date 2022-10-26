import React, { useEffect } from 'react';
import { batch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { CONSTANTS, treemapSvgId, treemapContainerId } from '../config';

import { selectAllFilters } from '../reducers/filterSlice';
import { scopeStatsIn, scopeTreemapIn } from '../reducers/treemapSlice';

import { createSVGInContainer, clearCanvas } from '../d3/svgCanvas';
import { generateTreemapLayoutFromData, drawTreemapFromGeneratedLayout } from '../d3/treemap';
import { payloadGenerator } from '../utils/reduxActionPayloadCreator';



function TreeMap(props) {
    const dispatch = props.dispatch;
    const currentDataPath = props.dataPath;
    const currentStatsPath = props.statsPath;
    const filters = useSelector(selectAllFilters);
    const [searchParams, setSearchParams] = useSearchParams();

    const setPath = (dataPath, statsPath) => {
        if (dataPath) {
            setSearchParams({
                "dataPath": dataPath || "",
                "statsPath": dataPath
            })
        }
        else if (statsPath) {
            setSearchParams({
                "dataPath": searchParams.get("dataPath") || "",
                "statsPath": statsPath
            })
        }
    }

    useEffect(() => {

        const urlDataPath = searchParams.get("dataPath") || "";
        const urlStatsPath = searchParams.get("statsPath") || "";

        if (urlDataPath && urlDataPath !== currentDataPath) {

            if (urlStatsPath && urlStatsPath !== currentStatsPath) {
                batch(() => {
                    dispatch(scopeTreemapIn(payloadGenerator("path", urlDataPath)));
                    dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
                })
            }
            else {
                dispatch(scopeTreemapIn(payloadGenerator("path", urlDataPath)));
            }
        }

        // set data source
        const data = props.data;

        // Container definition and cleanup
        clearCanvas(treemapSvgId);

        // Create SVG canvas
        const svg = createSVGInContainer(`#${treemapContainerId}`, treemapSvgId, CONSTANTS.treemap.layout.height, CONSTANTS.treemap.layout.width);

        // Loading and processing data
        const rootNode = generateTreemapLayoutFromData(data, CONSTANTS.treemap.layout.height, CONSTANTS.treemap.layout.width, filters);

        // Drawing the treemap from the generated data
        drawTreemapFromGeneratedLayout(svg, rootNode, setPath);


    }, [props.data, searchParams, setSearchParams, currentDataPath, filters, dispatch]
    )

    return (
        <div id={treemapContainerId} className='container-fluid'>
        </div>
    )


}

export default TreeMap;