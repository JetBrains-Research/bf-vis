/** @format */

import { useCallback, useDeferredValue, useLayoutEffect } from "react";
import { useDispatch, useSelector, batch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { CONFIG } from "../config";

import {
  returnMainTreemapHome,
  returnMiniTreemapHome,
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

import { payloadGenerator } from "../utils/reduxActionPayloadCreator.tsx";

import * as tiling from "../d3/tiling";

import Navigator from "./Navigator";
import TreeMap from "./TreeMap";
import RightColumn from "./RightColumn";

function App() {
  const dispatch = useDispatch();

  const currentVisualizationData = useDeferredValue(
    useSelector(selectCurrentVisualizationData)
  );
  const currentVisualizationPath = useDeferredValue(
    useSelector(selectCurrentVisualizationPath)
  );
  const currentStatsData = useDeferredValue(
    useSelector(selectCurrentStatsData)
  );
  const currentStatsPath = useDeferredValue(
    useSelector(selectCurrentStatsPath)
  );
  const filters = useDeferredValue(useSelector(selectAllFilters));

  const currentSimulationModeData = useDeferredValue(
    useSelector(simulationVisualizationData)
  );
  const currentSimulationModePath = useDeferredValue(
    useSelector(simulationVisualizationPath)
  );

  const reduxNavFunctions = {
    dispatch,
    scopeMiniTreemapIn,
    scopeMiniTreemapOut,
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

  useLayoutEffect(() => {
    const urlDataPath = searchParams.get("dataPath") || "";
    const urlStatsPath = searchParams.get("statsPath") || "";

    if (urlDataPath && urlDataPath !== currentVisualizationPath) {
      if (urlStatsPath && urlStatsPath !== urlDataPath) {
        batch(() => {
          dispatch(scopeMainTreemapIn(payloadGenerator("path", urlDataPath)));
          dispatch(scopeMiniTreemapIn(payloadGenerator("path", urlDataPath)));
          dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
        });
      } else {
        if (urlDataPath === ".") {
          batch(() => {
            dispatch(returnMainTreemapHome());
            dispatch(returnMiniTreemapHome());  
          })
          dispatch(scopeStatsIn(payloadGenerator("path", ".")));
        }
        batch(() => {
          dispatch(scopeMainTreemapIn(payloadGenerator("path", urlDataPath)));
          dispatch(scopeMiniTreemapIn(payloadGenerator("path", urlDataPath)));
        });
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
            dispatch={dispatch}
            filters={filters}
            path={currentVisualizationPath}
            reduxNavFunctions={reduxNavFunctions}
            setPathFunc={setURLPath}
            simulationPath={currentSimulationModePath}
            simulationData={currentSimulationModeData}
            statsData={currentStatsData}></Navigator>
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
          <RightColumn statsData={currentStatsData}></RightColumn>
        </div>
      </div>
    </div>
  );
}

export default App;
