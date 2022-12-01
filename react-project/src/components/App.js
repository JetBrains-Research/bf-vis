import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { returnTreemapHome, scopeStatsIn, scopeTreemapIn, selectCurrentStatsData, selectCurrentStatsPath, selectCurrentVisualizationData, selectCurrentVisualizationPath } from '../reducers/treemapSlice';

import { selectExclusionFilters } from '../reducers/filterSlice';
import { payloadGenerator } from '../utils/reduxActionPayloadCreator';

import Navigator from './Navigator';
import TreeMap from './Treemap';
import RightColumn from './RightColumn';


function App() {
    const dispatch = useDispatch();

    const currentVisualizationData = useSelector(selectCurrentVisualizationData);
    const currentVisualizationPath = useSelector(selectCurrentVisualizationPath);
    const currentStatsData = useSelector(selectCurrentStatsData);
    const currentStatsPath = useSelector(selectCurrentStatsPath);
    const filters = useSelector(selectExclusionFilters);
    const [searchParams, setSearchParams] = useSearchParams();

    const setURLPath = useCallback((dataPath, statsPath) => {
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
    }, [searchParams, setSearchParams]);

    useEffect(() => {

        const urlDataPath = searchParams.get("dataPath") || "";
        const urlStatsPath = searchParams.get("statsPath") || "";

        if (urlDataPath && urlDataPath !== currentVisualizationPath) {

            if (urlStatsPath && urlStatsPath !== urlDataPath) {
                batch(() => {
                    dispatch(scopeTreemapIn(payloadGenerator("path", urlDataPath)));
                    dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
                })
            }
            else {
                if (urlDataPath === ".") {
                    dispatch(returnTreemapHome())
                }
                dispatch(scopeTreemapIn(payloadGenerator("path", urlDataPath)));
            }
        }

        if (urlStatsPath && urlStatsPath !== currentStatsPath && urlStatsPath !== urlDataPath)
            dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));

    }, [setURLPath, searchParams, setSearchParams, currentStatsPath, currentVisualizationPath, dispatch])

    return (
        <div className="App container-fluid text-center">

            <div className='row justify-content-evenly'>
                <div className='col'>
                    <h1>BFViz</h1>
                    <Navigator path={currentVisualizationPath} filters={filters} dispatch={dispatch} setPathFunc={setURLPath}></Navigator>
                </div>
                <div className='col-md-auto'>
                    <TreeMap data={currentVisualizationData} dataPath={currentVisualizationPath} setPathFunc={setURLPath} filters={filters}></TreeMap>
                </div>
                <div className='col'>
                    <RightColumn data={currentStatsData}></RightColumn>
                </div>
            </div>
        </div>
    );
}

export default App;