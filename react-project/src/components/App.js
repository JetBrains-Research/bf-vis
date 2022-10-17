import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentVisualizationData, selectCurrentVisualizationPath, selectCurrentStatsData, selectFilters } from '../reducers/defaultSlice';
import LeftColumn from './Navigator';
import TreeMap from './Treemap';
import RightColumn from './RightColumn';

function App() {
    const currentVisualizationData = useSelector(selectCurrentVisualizationData);
    const currentVisualizationPath = useSelector(selectCurrentVisualizationPath);
    const currentStatsData = useSelector(selectCurrentStatsData);
    const filters = useSelector(selectFilters);
    const dispatch = useDispatch();

    return (
        <div className="App container-fluid text-center">

            <div className='row justify-content-evenly'>
                <div className='col'>
                    <h1>BFViz</h1>
                    <LeftColumn path={currentVisualizationPath} filters={filters} dispatch={dispatch}></LeftColumn>
                </div>
                <div className='col-md-auto'>
                    <TreeMap data={currentVisualizationData} filters={filters} dispatch={dispatch} />
                </div>
                <div className='col'>
                    <RightColumn data={currentStatsData}></RightColumn>
                </div>
            </div>
        </div>
    );
}

export default App;