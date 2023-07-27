/** @format */

import React, {useCallback, useDeferredValue, useLayoutEffect, useState,} from "react";
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
  simulationVisualizationPath, toggleFolderFilter,
} from "../reducers/treemapSlice";

import {payloadGenerator} from "../utils/reduxActionPayloadCreator.tsx";

import Navigator from "./Navigator";
import TreeMap from "./TreeMap";
import RightColumn from "./RightColumn";
import {Col, Grid, Row} from "@jetbrains/ring-ui/dist/grid/grid";
import {createZoom, resetZoom} from "../d3/zoom";
import Island from "@jetbrains/ring-ui/dist/island/island";
import {Content} from "@jetbrains/ring-ui/dist/island/island";
import search from "@jetbrains/icons/search";
import searchError from "@jetbrains/icons/search-error";
import settingsIcon from "@jetbrains/icons/settings";
import * as d3 from "d3";
import Button from "@jetbrains/ring-ui/dist/button/button";
import Dropdown from "@jetbrains/ring-ui/dist/dropdown/dropdown";
import Popup from "@jetbrains/ring-ui/dist/popup/popup";
import {layoutAlgorithmsMap} from "../d3/tiling";
import {sortingOrderMap} from "../d3/sort";
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

  const zoomIn = () => {
    d3.select("svg g g").transition().call(mainTreemapZoom.scaleBy, 2);
  };

  const zoomOut = () => {
    d3.select("svg g g").transition().call(mainTreemapZoom.scaleBy, 0.5);
  };

  const handleLayoutAlgorithm = (e) => {
    dispatch(reduxTreemapLayoutFunctions.setTilingFunction(e.label));
  };
  const handleSortingKey = (e) => {
    dispatch(reduxTreemapLayoutFunctions.setSortingKey(e.key));
  };
  const handleSortingOrder = (e) => {
    console.log(e.label);
    dispatch(reduxTreemapLayoutFunctions.setSortingOrder(e.label));
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

            <Island style={{
              position: "absolute",
              top: 5,
              right: 20
            }}>
              <Content>
                <Button
                  onClick={() => zoomIn()}
                  icon={search}
                  title={"Zoom In"}
                />
                <Button
                  onClick={() => zoomOut()}
                  icon={searchError}
                  title={"Zoom Out"}
                />
                  <Dropdown
                    className="chevron"
                    activeClassName="rotated"
                    anchor={<Button title="Details" icon={settingsIcon}/>}
                  >
                    {/*TODO: add default value, reset*/}
                    <Popup>
                      <Island>
                        <Content>
                          <Button
                            text
                            danger
                            onClick={() => resetZoom(mainTreemapZoom)}
                            title={"Reset Zoom"}>
                            reset
                          </Button>
                          <div className="d-flex mt-1">
                            <Select
                              inputPlaceholder="Layout Algorithm"
                              onChange={handleLayoutAlgorithm}
                              data={Object.keys(layoutAlgorithmsMap).map((element, index) => {
                                return {
                                  label: element,
                                  key: index,
                                };
                              })}
                              selectedLabel="Layout Algorithm"
                              label="Select..."></Select>
                          </div>
                          <div className="d-flex mt-1">
                            <Select
                              inputPlaceholder="Sorting Key"
                              onChange={handleSortingKey}
                              data={[
                                {
                                  label: "bus factor",
                                  key: "busFactor",
                                },
                                {
                                  label: "name",
                                  key: "name",
                                },
                                {
                                  label: "size",
                                  key: "size",
                                },
                              ]}
                              selectedLabel="Sorting Key"
                              label="Select..."></Select>
                          </div>
                          <div className="d-flex mt-1">
                            <Select
                              inputPlaceholder="Sorting Order"
                              onChange={handleSortingOrder}
                              data={Object.keys(sortingOrderMap).map((element, index) => {
                                return {
                                  label: element,
                                  key: index,
                                };
                              })}
                              selectedLabel="Sorting Order"
                              label="Select..."></Select>
                          </div>
                        </Content>
                      </Island>

                    </Popup>
                  </Dropdown>
              </Content>
            </Island>
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
