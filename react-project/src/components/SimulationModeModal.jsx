/** @format */

import { format } from "../d3/format.tsx";
import * as tiling from "../d3/tiling.tsx";
import React, { useState } from "react";
import { CONFIG } from "../config";
import TreeMap from "./TreeMap";

import { generateBreadcrumb } from "../utils/url.tsx";
import { useTranslation } from "react-i18next";
import { InfoPanel } from "./InfoPanel";
import {
  addAuthorToRemovalList,
  disableSimulationMode,
  enableSimulationMode,
  scopeMiniTreemapIn,
  selectRemovedAuthors,
  undoAuthorRemoval,
} from "../reducers/treemapSlice.js";
import { payloadGenerator } from "../utils/reduxActionPayloadCreator.tsx";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import LegendSimColor from "./LegendSimColor.jsx";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";
import Button from "@jetbrains/ring-ui/dist/button/button";
import experimentIcon from "@jetbrains/icons/experiment-20px";
import Icon from "@jetbrains/ring-ui/dist/icon/icon";
import {
  ControlsHeight,
  ControlsHeightContext,
} from "@jetbrains/ring-ui/dist/global/controls-height";
import List from "@jetbrains/ring-ui/dist/list/list";
import { Input, Size } from "@jetbrains/ring-ui/dist/input/input";
import arrowUpIcon from "@jetbrains/icons/arrow-up";
import archiveIcon from "@jetbrains/icons/archive";
import ButtonSet from "@jetbrains/ring-ui/dist/button-set/button-set";
import { Col, Grid, Row } from "@jetbrains/ring-ui/dist/grid/grid";
import Popup from "@jetbrains/ring-ui/dist/popup/popup.js";
import Dropdown from "@jetbrains/ring-ui/dist/dropdown/dropdown.js";
import Select from "@jetbrains/ring-ui/dist/select/select.js";
import search from "@jetbrains/icons/search";
import searchError from "@jetbrains/icons/search-error";
import settingsIcon from "@jetbrains/icons/settings";
import { zoomIn, zoomOut } from "../d3/zoom.js";
import {
  findSelectItem,
  sortKeySelectData,
  sortingOrderSelectData,
} from "../d3/sort.js";
import SelectPopup from "@jetbrains/ring-ui/dist/select/select__popup.js";

function SimulationModeModal(props) {
  const { t, i18n } = useTranslation();
  const formatPercentage = format(",.1%");

  const simulationVisualizationData = props.simulationData;
  const simulationVisualizationPath = props.simulationPath;
  const sortingKey = props.sortingKey;
  const sortingOrder = props.sortingOrder;
  const tilingFunction = props.tilingFunction;
  const zoom = props.zoom;
  const reduxMiniTreemapFunctions = props.reduxMiniTreemapFunctions;

  const authorsList =
    "users" in simulationVisualizationData
      ? [...simulationVisualizationData.users]
      : undefined;
  const [show, setShow] = useState(false);

  const setTreemapPathOutFunc = (path) => {
    reduxMiniTreemapFunctions.dispatch(
      reduxMiniTreemapFunctions.scopeMiniTreemapOut(
        payloadGenerator("path", path)
      )
    );
  };
  const returnTreeMapHome = () => {
    reduxMiniTreemapFunctions.dispatch(
      reduxMiniTreemapFunctions.scopeMiniTreemapIn(
        payloadGenerator("path", ".")
      )
    );
  };

  let authorsListContributionPercentage = undefined;
  const [nameFilterValue, setNameFilterValue] = useState("");
  const removedAuthorsList = useSelector(selectRemovedAuthors);

  if (authorsList) {
    authorsList.sort((a, b) => b.authorship - a.authorship);
    let cumulativeAuthorship = authorsList
      .map((element) => element.authorship)
      .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

    authorsListContributionPercentage = authorsList.map(
      (authorContributionPair) => {
        return {
          email: authorContributionPair.email,
          authorship: authorContributionPair.authorship,
          relativeScore:
            authorContributionPair.authorship / cumulativeAuthorship,
          included: !removedAuthorsList.includes(authorContributionPair.email),
        };
      }
    );
  }

  const handleSearchTextChange = (event) => {
    if (event.target.value) {
      let filterValue = String(event.target.value).trim();
      if (filterValue.length > 1) {
        setNameFilterValue(filterValue);
      } else {
        setNameFilterValue("");
      }
    } else {
      setNameFilterValue("");
    }
  };

  const handleAuthorCheckmark = (authorEmail) => {
    if (!removedAuthorsList.includes(authorEmail)) {
      reduxMiniTreemapFunctions.dispatch(addAuthorToRemovalList([authorEmail]));
      reduxMiniTreemapFunctions.dispatch(
        scopeMiniTreemapIn(
          payloadGenerator("path", simulationVisualizationPath)
        )
      );
    } else {
      reduxMiniTreemapFunctions.dispatch(undoAuthorRemoval([authorEmail]));
      reduxMiniTreemapFunctions.dispatch(
        scopeMiniTreemapIn(
          payloadGenerator("path", simulationVisualizationPath)
        )
      );
    }
  };

  const handleClose = () => {
    setShow(false);
    reduxMiniTreemapFunctions.dispatch(disableSimulationMode());
  };
  const handleShow = () => {
    setShow(true);
    reduxMiniTreemapFunctions.dispatch(enableSimulationMode());
  };

  const handleLayoutAlgorithm = (e) => {
    reduxMiniTreemapFunctions.dispatch(
      reduxMiniTreemapFunctions.setSimTilingFunction(e.key)
    );
  };
  const handleSortingKey = (e) => {
    reduxMiniTreemapFunctions.dispatch(
      reduxMiniTreemapFunctions.setSimSortingKey(e.key)
    );
  };
  const handleSortingOrder = (e) => {
    console.log(e.label);
    reduxMiniTreemapFunctions.dispatch(
      reduxMiniTreemapFunctions.setSimSortingOrder(e.key)
    );
  };

  return (
    <>
      <Island>
        <Header border>
          Simulation{" "}
          <InfoPanel
            divName="simInfoPanel"
            header="How does the simulation mode work?"
            body={[
              t("simMode.general"),
              t("simMode.detail"),
              t("simMode.links"),
            ]}></InfoPanel>
          <a
            className=""
            data-bs-toggle="collapse"
            href="#simulationModeCollapsible"
            role="button"
            aria-expanded="true"
            aria-controls="simulationModeCollapsible">
            <i className="bi bi-plus-circle-fill"></i>
            <i className="bi bi-dash-circle-fill"></i>
          </a>
        </Header>
        <Content>
          <div
            id="simulationModeCollapsible"
            className="collapse show">
            <p className="small">
              Using this mode, we can highlight if the bus factor changes when
              one or more authors leave
            </p>
            <ControlsHeightContext.Provider value={ControlsHeight.L}>
              <Button
                primary
                onClick={handleShow}>
                <Icon glyph={experimentIcon} /> Use Simulation Mode
              </Button>
            </ControlsHeightContext.Provider>
          </div>
        </Content>
      </Island>

      {/* Modal */}
      <Modal
        className="onTopLevel0"
        show={show}
        onHide={handleClose}
        size="fullscreen">
        <Modal.Header closeButton>
          <Modal.Title>Simulate Author Removal</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Grid>
            <Row>
              <Col
                xs={9}
                sm={9}
                md={9}
                lg={9}>
                <center
                  style={{ position: "relative" }}
                  id={"simTreeMap"}>
                  <TreeMap
                    colorDefinitions={CONFIG.general.colors.jetbrains}
                    containerId={CONFIG.simulation.ids.treemapContainerId}
                    data={simulationVisualizationData}
                    dataNormalizationFunction={Math.log2}
                    dataPath={simulationVisualizationPath}
                    initialHeight={CONFIG.simulation.layout.height}
                    initialWidth={CONFIG.simulation.layout.width}
                    padding={CONFIG.simulation.layout.overallPadding}
                    sortingKey={sortingKey}
                    sortingOrder={sortingOrder}
                    svgId={CONFIG.simulation.ids.treemapSvgId}
                    tilingFunction={tilingFunction}
                    topPadding={CONFIG.simulation.layout.topPadding}
                    type="mini"
                    reduxNavFunctions={reduxMiniTreemapFunctions}
                    zoom={zoom}></TreeMap>

                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 25,
                      display: "flex",
                      flexDirection: "row",
                      border: "1px solid black",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      boxShadow: "0 1px 2px black",
                    }}>
                    <Button
                      onClick={() =>
                        simulationVisualizationPath
                          .split("/")
                          .filter((r) => r !== "").length > 1
                          ? setTreemapPathOutFunc(
                              simulationVisualizationPath
                                .split("/")
                                .slice(0, -1)
                                .join("/")
                            )
                          : setTreemapPathOutFunc(".")
                      }
                      icon={arrowUpIcon}
                      title={"Navigate to Parent Directory"}>
                      {" "}
                      Up{" "}
                    </Button>
                    <Button
                      onClick={() => returnTreeMapHome()}
                      icon={archiveIcon}
                      title={"Home"}>
                      {" "}
                      Home
                    </Button>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: "1em",
                      right: "2.5em",
                      display: "flex",
                      flexDirection: "row",
                      border: "1px solid black",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      boxShadow: "0 1px 2px black",
                    }}>
                    <Button
                      onClick={() =>
                        zoomIn(`#${CONFIG.simulation.ids.treemapSvgId}`, zoom)
                      }
                      icon={search}
                      title={"Zoom In"}
                    />
                    <Button
                      onClick={() =>
                        zoomOut(`#${CONFIG.simulation.ids.treemapSvgId}`, zoom)
                      }
                      icon={searchError}
                      title={"Zoom Out"}
                    />
                    <Dropdown
                      className="chevron"
                      activeClassName="rotated"
                      anchor={
                        <Button
                          title="Details"
                          icon={settingsIcon}
                        />
                      }>
                      <Popup className="onTopLevel1">
                        <Island>
                          <Content>
                            <div className="d-flex mt-1">
                              <Select
                                onChange={handleLayoutAlgorithm}
                                data={tiling.layoutAlgorithmSelectData}
                                selected={findSelectItem(
                                  tiling.layoutAlgorithmSelectData,
                                  tilingFunction
                                )}
                                selectedLabel="Layout Algorithm"
                                ringPopupTarget="mini-treemap-select-algo-target"
                                maxHeight={
                                  tiling.layoutAlgorithmSelectData.length * 2 +
                                  "em"
                                }></Select>
                            </div>
                            <div
                              className="onTopLevel2"
                              data-portaltarget="mini-treemap-select-algo-target"></div>
                            <div className="d-flex mt-1">
                              <Select
                                onChange={handleSortingKey}
                                data={sortKeySelectData}
                                selected={findSelectItem(
                                  sortKeySelectData,
                                  sortingKey
                                )}
                                selectedLabel="Sorting Key"
                                ringPopupTarget="mini-treemap-select-sortkey-target"
                                maxHeight={
                                  sortKeySelectData.length * 2 + "em"
                                }></Select>
                            </div>
                            <div
                              className="onTopLevel2 menu-overflow"
                              data-portaltarget="mini-treemap-select-sortkey-target"></div>
                            <div className="d-flex mt-1">
                              <Select
                                className=""
                                onChange={handleSortingOrder}
                                data={sortingOrderSelectData}
                                selected={findSelectItem(
                                  sortingOrderSelectData,
                                  sortingOrder
                                )}
                                selectedLabel="Sorting Order"
                                ringPopupTarget="mini-treemap-select-sortorder-target"
                                maxHeight="10em"></Select>
                            </div>
                            <div
                              className="onTopLevel2 menu-overflow"
                              data-portaltarget="mini-treemap-select-sortorder-target"></div>
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
                md={3}
                lg={3}>
                <div style={{ marginBottom: 20 }}>
                  <nav aria-label="breadcrumb">
                    <center>
                      <strong>Current Path</strong>
                    </center>
                    <ol className="breadcrumb">
                      {simulationVisualizationPath
                        .split("/")
                        .map((pathElement, i) => (
                          <li
                            className={
                              i <
                              simulationVisualizationPath.split("/").length - 1
                                ? "btn btn-link breadcrumb-item p-1"
                                : "btn btn-link breadcrumb-item active p-1"
                            }
                            key={pathElement}
                            onClick={() =>
                              setTreemapPathOutFunc(
                                generateBreadcrumb(
                                  i,
                                  simulationVisualizationPath
                                )
                              )
                            }>
                            {pathElement}
                          </li>
                        ))}
                    </ol>
                  </nav>
                </div>

                {/*TODO: add same width for input and list*/}
                <center>
                  <strong>Authors List</strong>
                  <Input
                    placeholder="Search for authors' git emails..."
                    onChange={handleSearchTextChange}
                    size={Size.M}></Input>
                </center>
                <List
                  maxHeight={CONFIG.simulation.layout.height * 0.75}
                  shortcuts={true}
                  onSelect={(item, e) => {
                    handleAuthorCheckmark(item.label);
                  }}
                  data={
                    authorsList && authorsListContributionPercentage
                      ? authorsListContributionPercentage
                          .filter((element) =>
                            element["email"].includes(nameFilterValue)
                          )
                          .sort((a, b) => b.relativeScore - a.relativeScore)
                          .map((authorScorePair, index) => ({
                            label: authorScorePair.email,
                            details: formatPercentage(
                              authorScorePair.relativeScore
                            ),
                            rgItemType: List.ListProps.Type.ITEM,
                            checkbox: !removedAuthorsList.includes(
                              authorScorePair.email
                            ),
                          }))
                      : []
                  }
                />
              </Col>
            </Row>
          </Grid>

          <LegendSimColor></LegendSimColor>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SimulationModeModal;
