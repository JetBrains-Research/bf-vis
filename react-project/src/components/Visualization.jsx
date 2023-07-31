/** @format */

import React, {useCallback, useDeferredValue, useLayoutEffect,} from "react";
import {batch, useDispatch, useSelector} from "react-redux";
import {useSearchParams} from "react-router-dom";
import {CONFIG} from "../config";

import {
  returnMainTreemapHome,
  returnMiniTreemapHome,
  scopeMainTreemapIn,
  scopeMiniTreemapIn,
  scopeMiniTreemapOut,
  scopeStatsIn,
  selectColorPalette,
  selectColorThresholds,
  selectCurrentStatsData,
  selectCurrentStatsPath,
  selectCurrentVisualizationData,
  selectCurrentVisualizationPath,
  selectFolderFilter,
  selectRegexFilters,
  selectSortingKey,
  selectSortingOrder,
  selectTilingFunction,
  setSortingKey,
  setSortingOrder,
  setTilingFunction,
  simulationVisualizationData,
  simulationVisualizationPath,
} from "../reducers/treemapSlice";

import {payloadGenerator} from "../utils/reduxActionPayloadCreator.tsx";

import Navigator from "./Navigator";
import TreeMap from "./TreeMap";
import RightColumn from "./RightColumn";
import {Col, Grid, Row} from "@jetbrains/ring-ui/dist/grid/grid";
import {createZoom, zoomIn, zoomOut} from "../d3/zoom";
import Island, {Content} from "@jetbrains/ring-ui/dist/island/island";
import search from "@jetbrains/icons/search";
import searchError from "@jetbrains/icons/search-error";
import settingsIcon from "@jetbrains/icons/settings";
import * as d3 from "d3";
import Button from "@jetbrains/ring-ui/dist/button/button";
import Dropdown from "@jetbrains/ring-ui/dist/dropdown/dropdown";
import Popup from "@jetbrains/ring-ui/dist/popup/popup";
import {layoutAlgorithmSelectData, layoutAlgorithmsMap} from "../d3/tiling";
import {findSelectItem, sortKeySelectData, sortingOrderMap, sortingOrderSelectData} from "../d3/sort";
import Select from "@jetbrains/ring-ui/dist/select/select";

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
  const currentSortingKey = useDeferredValue(useSelector(selectSortingKey));
  const currentSortingOrder = useDeferredValue(useSelector(selectSortingOrder));
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
    setTilingFunction,
  };

  const mainTreemapZoom = createZoom(
    1,
    10,
    window.innerWidth * 0.65,
    window.innerHeight
  );

  const simulationModeZoom = createZoom(
    1,
    10,
    CONFIG.simulation.layout.width,
    CONFIG.simulation.layout.height
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

  const handleLayoutAlgorithm = (e) => {
    dispatch(reduxTreemapLayoutFunctions.setTilingFunction(e.key));
  };
  const handleSortingKey = (e) => {
    dispatch(reduxTreemapLayoutFunctions.setSortingKey(e.key));
  };
  const handleSortingOrder = (e) => {
    console.log(e.label);
    dispatch(reduxTreemapLayoutFunctions.setSortingOrder(e.key));
  };


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
              setPathFunc={setURLPath}
              simulationData={currentSimulationModeData}
              simulationPath={currentSimulationModePath}
              simulationZoom={simulationModeZoom}
              sortingKey={currentSortingKey}
              sortingOrder={currentSortingOrder}
              statsData={currentStatsData}
              tilingFunction={currentTilingFunction}
            />
          </center>
        </Col>
        <Col
          xs={6}
          sm={6}
          md={8}
          lg={8}>
          <center style={{position: "relative"}} id={"treeMap"}>
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

            <div style={{
              position: "absolute",
              top: 10,
              right: 25,
              display: "flex",
              flexDirection: "row",
              border: "1px solid black",
              borderRadius: "10px",
              backgroundColor: "white",
              boxShadow: "0 1px 2px black"
            }}>
              <Button
                onClick={() => zoomIn(`#${CONFIG.treemap.ids.treemapSvgId}`, mainTreemapZoom)}
                icon={search}
                title={"Zoom In"}
              />
              <Button
                onClick={() => zoomOut(`#${CONFIG.treemap.ids.treemapSvgId}`, mainTreemapZoom)}
                icon={searchError}
                title={"Zoom Out"}
              />
              <Dropdown
                className="chevron"
                activeClassName="rotated"
                anchor={<Button title="Details" icon={settingsIcon}/>}
              >
                <Popup>
                  <Island>
                    <Content>
                      <div className="d-flex mt-1">
                        <Select
                          onChange={handleLayoutAlgorithm}
                          data={layoutAlgorithmSelectData}
                          selected={findSelectItem(layoutAlgorithmSelectData, currentTilingFunction)}
                          selectedLabel="Layout Algorithm"></Select>
                      </div>
                      <div className="d-flex mt-1">
                        <Select
                          onChange={handleSortingKey}
                          data={sortKeySelectData}
                          selected={findSelectItem(sortKeySelectData, currentSortingKey)}
                          selectedLabel="Sorting Key"></Select>
                      </div>
                      <div className="d-flex mt-1">
                        <Select
                          onChange={handleSortingOrder}
                          data={sortingOrderSelectData}
                          selected={findSelectItem(sortingOrderSelectData, currentSortingOrder)}
                          selectedLabel="Sorting Order"></Select>
                      </div>
                    </Content>
                  </Island>

                </Popup>
              </Dropdown>
            </div>
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
