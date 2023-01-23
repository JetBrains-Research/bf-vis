/** @format */

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector, batch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { CONFIG } from "../config";

import {
  returnMainTreemapHome,
  scopeStatsIn,
  scopeMainTreemapIn,
  selectCurrentStatsData,
  selectCurrentStatsPath,
  selectCurrentVisualizationData,
  selectCurrentVisualizationPath,
  scopeMiniTreemapIn,
  scopeMiniTreemapOut,
  simulationVisualizationData,
  simulationVisualizationPath,
  selectAllFilters,
} from "../reducers/treemapSlice";

import { payloadGenerator } from "../utils/reduxActionPayloadCreator";

import * as tiling from "../d3/tiling";

import Navigator from "./Navigator";
import TreeMap from "./TreeMap";
import RightColumn from "./RightColumn";

function App() {
  const dispatch = useDispatch();

  const currentVisualizationData = useSelector(selectCurrentVisualizationData);
  const currentVisualizationPath = useSelector(selectCurrentVisualizationPath);
  const currentStatsData = useSelector(selectCurrentStatsData);
  const currentStatsPath = useSelector(selectCurrentStatsPath);
  const filters = useSelector(selectAllFilters);

  const currentSimulationModeData = useSelector(simulationVisualizationData);
  const currentSimulationModePath = useSelector(simulationVisualizationPath);

  const reduxNavFunctions = {
    dispatch,
    scopeMiniTreemapIn,
    scopeMiniTreemapOut
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const setURLPath = useCallback(
    (dataPath, statsPath) => {
      if (dataPath) {
        setSearchParams({
          dataPath: dataPath || "",
          statsPath: dataPath,
        });
      } else if (statsPath) {
        setSearchParams({
          dataPath: searchParams.get("dataPath") || "",
          statsPath: statsPath,
        });
      }
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const urlDataPath = searchParams.get("dataPath") || "";
    const urlStatsPath = searchParams.get("statsPath") || "";

    if (urlDataPath && urlDataPath !== currentVisualizationPath) {
      if (urlStatsPath && urlStatsPath !== urlDataPath) {
        batch(() => {
          dispatch(scopeMainTreemapIn(payloadGenerator("path", urlDataPath)));
          dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
        });
      } else {
        if (urlDataPath === ".") {
          dispatch(returnMainTreemapHome());
        }
        dispatch(scopeMainTreemapIn(payloadGenerator("path", urlDataPath)));
      }
    }

    if (
      urlStatsPath &&
      urlStatsPath !== currentStatsPath &&
      urlStatsPath !== urlDataPath
    )
      dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
  }, [
    setURLPath,
    searchParams,
    setSearchParams,
    currentStatsPath,
    currentVisualizationPath,
    dispatch,
  ]);

  return (
    <div className="App container-fluid text-center">
      <div className="row justify-content-evenly">
        <div className="col-2">
          <h1>BFViz</h1>
          <Navigator
            path={currentVisualizationPath}
            filters={filters}
            dispatch={dispatch}
            setPathFunc={setURLPath}></Navigator>
        </div>
        <div className="col-8">
          <TreeMap
            colorDefinitions={CONFIG.general.colors.jetbrains}
            containerId={CONFIG.treemap.ids.treemapContainerId}
            data={currentVisualizationData}
            dataNormalizationFunction={Math.log2}
            dataPath={currentVisualizationPath}
            filters={filters}
            initialHeight={window.innerHeight}
            initialWidth={window.innerWidth * 0.65}
            padding={CONFIG.treemap.layout.overallPadding}
            setPathFunc={setURLPath}
            svgId={CONFIG.treemap.ids.treemapSvgId}
            tilingFunction={tiling.squarify}
            topPadding={CONFIG.treemap.layout.topPadding}
            type="main"></TreeMap>
        </div>
        <div className="col-2">
          <RightColumn
            statsData={currentStatsData}
            simulationPath={currentSimulationModePath}
            simulationData={currentSimulationModeData}
            reduxNavFunctions = {reduxNavFunctions}
          >
            
            </RightColumn>
        </div>
      </div>
    </div>
  );
}

export default App;