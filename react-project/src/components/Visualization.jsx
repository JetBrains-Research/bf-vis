/** @format */

import {
  useCallback,
  useDeferredValue,
  useLayoutEffect,
  useState,
} from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { CONFIG } from "../config";

import {
  returnMainTreemapHome,
  returnMiniTreemapHome,
  scopeMainTreemapIn,
  scopeMiniTreemapIn,
  scopeMiniTreemapOut,
  scopeStatsIn,
  selectRegexFilters,
  selectCurrentStatsData,
  selectCurrentStatsPath,
  selectCurrentVisualizationData,
  selectCurrentVisualizationPath,
  simulationVisualizationData,
  simulationVisualizationPath,
  selectColorThresholds,
  selectColorPalette,
  selectTilingFunction,
  selectSortingKey,
  selectSortingOrder,
  setSortingKey,
  setSortingOrder,
  setTilingFunction,
  selectFolderFilter,
} from "../reducers/treemapSlice";

import { payloadGenerator } from "../utils/reduxActionPayloadCreator.tsx";

import * as tiling from "../d3/tiling";
import * as sorting from "../d3/sort";
import * as d3 from "d3";

import Navigator from "./Navigator";
import TreeMap from "./TreeMap";
import RightColumn from "./RightColumn";
import { Col, Grid, Row } from "@jetbrains/ring-ui/dist/grid/grid";
import { createZoom } from "../d3/zoom";

function Visualization() {
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
  const filters = useDeferredValue(useSelector(selectRegexFilters));

  const currentSimulationModeData = useDeferredValue(
    useSelector(simulationVisualizationData)
  );
  const currentSimulationModePath = useDeferredValue(
    useSelector(simulationVisualizationPath)
  );
  const currentColorThresholds = useDeferredValue(
    useSelector(selectColorThresholds)
  );
  const currentColorPalette = useDeferredValue(useSelector(selectColorPalette));
  const currentTilingFunction = useDeferredValue(
    useSelector(selectTilingFunction)
  );
  const currentSortingKey = useDeferredValue(useSelector(selectSortingKey))
  const currentSortingOrder = useDeferredValue(useSelector(selectSortingOrder))
  const currentFolderFilter = useDeferredValue(useSelector(selectFolderFilter));

  const reduxMiniTreemapNavFunctions = {
    dispatch,
    scopeMiniTreemapIn,
    scopeMiniTreemapOut,
    returnMiniTreemapHome,
  };

  const reduxTreemapLayoutFunctions = {
    dispatch,
    setSortingKey,
    setSortingOrder,
    setTilingFunction
  }

  const mainTreemapZoom = createZoom(
    1,
    10,
    window.innerWidth * 0.65,
    window.innerHeight
  );

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
          dispatch(scopeStatsIn(payloadGenerator("path", urlStatsPath)));
        });
      } else {
        if (urlDataPath === ".") {
          batch(() => {
            dispatch(returnMainTreemapHome());
            dispatch(returnMiniTreemapHome());
          });
          dispatch(scopeStatsIn(payloadGenerator("path", ".")));
        }
        batch(() => {
          dispatch(scopeMainTreemapIn(payloadGenerator("path", urlDataPath)));
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
    <Grid>
      <Row>
        <Col
          xs={3}
          sm={3}
          md={2}
          lg={2}>
          <center>
            <h1>BFViz</h1>
            <Navigator
              dispatch={dispatch}
              filters={filters}
              folderFilter={currentFolderFilter}
              path={currentVisualizationPath}
              reduxNavFunctions={reduxMiniTreemapNavFunctions}
              reduxTreemapLayoutFunctions={reduxTreemapLayoutFunctions}
              setPathFunc={setURLPath}
              simulationData={currentSimulationModeData}
              simulationPath={currentSimulationModePath}
              sortingKey={currentSortingKey}
              sortingOrder={currentSortingOrder}
              statsData={currentStatsData}
              tilingFunction={currentTilingFunction}
              zoom={mainTreemapZoom}></Navigator>
          </center>
        </Col>
        <Col
          xs={6}
          sm={6}
          md={8}
          lg={8}>
          <center>
            <TreeMap
              colorDefinitions={CONFIG.general.colors.jetbrains}
              colorPalette={currentColorPalette}
              colorThresholds={currentColorThresholds}
              containerId={CONFIG.treemap.ids.treemapContainerId}
              data={currentVisualizationData}
              dataNormalizationFunction={Math.log2}
              dataPath={currentVisualizationPath}
              folderFilter={currentFolderFilter}
              filters={filters}
              initialHeight={window.innerHeight}
              initialWidth={window.innerWidth * 0.65}
              padding={CONFIG.treemap.layout.overallPadding}
              setPathFunc={setURLPath}
              sortingKey={currentSortingKey}
              sortingOrder={currentSortingOrder}
              svgId={CONFIG.treemap.ids.treemapSvgId}
              tilingFunction={currentTilingFunction}
              topPadding={CONFIG.treemap.layout.topPadding}
              type="main"
              zoom={mainTreemapZoom}></TreeMap>
          </center>
        </Col>
        <Col
          xs={3}
          sm={3}
          md={2}
          lg={2}>
          <RightColumn statsData={currentStatsData}></RightColumn>
        </Col>
      </Row>
    </Grid>
  );
}

export default Visualization;
