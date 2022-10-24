import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { scopeTreemapIn, selectCurrentStatsData, selectCurrentVisualizationData, selectCurrentVisualizationPath } from '../reducers/treemapSlice';
import { selectExclusionFilters } from '../reducers/filterSlice';

import LeftColumn from './Navigator';
import TreeMap from './Treemap';
import RightColumn from './RightColumn';
import { payloadGenerator } from '../utils/reduxActionPayloadCreator';


function App() {
    const dispatch = useDispatch();

    const currentVisualizationData = useSelector(selectCurrentVisualizationData);
    const currentVisualizationPath = useSelector(selectCurrentVisualizationPath);
    const currentStatsData = useSelector(selectCurrentStatsData);
    const filters = useSelector(selectExclusionFilters);

    const [searchParams, setSearchParams] = useSearchParams();

    // useEffect(() => {
    //     const path = searchParams.get("path") || "";

    //     if (path && path !== currentVisualizationPath) {
    //         dispatch(scopeTreemapIn(payloadGenerator("path", path)));
    //     }

    // }, [searchParams, setSearchParams, currentVisualizationPath, dispatch])


    return (
        <div className="App container-fluid text-center">

            <div className='row justify-content-evenly'>
                <div className='col'>
                    <h1>BFViz</h1>
                    <LeftColumn path={currentVisualizationPath} filters={filters} dispatch={dispatch}></LeftColumn>
                </div>
                <div className='col-md-auto'>
                    <TreeMap data={currentVisualizationData} filters={filters} dispatch={dispatch} ></TreeMap>
                </div>
                <div className='col'>
                    <RightColumn data={currentStatsData}></RightColumn>
                </div>
            </div>
        </div>
    );
}

export default App;