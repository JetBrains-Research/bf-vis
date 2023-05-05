/** @format */

import {format} from "../d3/format.tsx";
import * as tiling from "../d3/tiling.tsx";
import React, {useState} from "react";
import {CONFIG} from "../config";
import TreeMap from "./TreeMap";

import {generateBreadcrumb} from "../utils/url.tsx";
import {useTranslation} from "react-i18next";
import {InfoPanel} from "./InfoPanel";
import {
  addAuthorToRemovalList,
  disableSimulationMode,
  enableSimulationMode,
  scopeMiniTreemapIn,
  selectRemovedAuthors,
  undoAuthorRemoval,
} from "../reducers/treemapSlice.js";
import {payloadGenerator} from "../utils/reduxActionPayloadCreator.tsx";
import {useSelector} from "react-redux";
import {Modal, Table} from "react-bootstrap";
import LegendSimColor from "./LegendSimColor.jsx";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";
import Button from "@jetbrains/ring-ui/dist/button/button";
import experimentIcon from '@jetbrains/icons/experiment-20px';
import Icon from "@jetbrains/ring-ui/dist/icon/icon";
import {ControlsHeight, ControlsHeightContext} from "@jetbrains/ring-ui/dist/global/controls-height";
import List from "@jetbrains/ring-ui/dist/list/list";


function SimulationModeModal(props) {
  const {t, i18n} = useTranslation();
  const formatPercentage = format(",.1%");
  const formatSI = format(".3s");

  const simulationVisualizationData = props.simulationData;
  const simulationVisualizationPath = props.simulationPath;
  const authorsList =
    "users" in simulationVisualizationData
      ? [...simulationVisualizationData.users]
      : undefined;
  const [show, setShow] = useState(false);

  const setTreemapPathOutFunc = (path) => {
    props.reduxNavFunctions.dispatch(
      props.reduxNavFunctions.scopeMiniTreemapOut(
        payloadGenerator("path", path)
      )
    );
  };
  const returnTreeMapHome = () => {
    props.reduxNavFunctions.dispatch(
      props.reduxNavFunctions.scopeMiniTreemapIn(payloadGenerator("path", "."))
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

  const handleAuthorCheckmark = (e, authorScorePair) => {
    let email = authorScorePair.email;
    console.log(email);
    if (!e.target.checked) {
      props.reduxNavFunctions.dispatch(addAuthorToRemovalList([email]));
      props.reduxNavFunctions.dispatch(
        scopeMiniTreemapIn(
          payloadGenerator("path", simulationVisualizationPath)
        )
      );
    } else if (e.target.checked) {
      props.reduxNavFunctions.dispatch(undoAuthorRemoval([email]));
      props.reduxNavFunctions.dispatch(
        scopeMiniTreemapIn(
          payloadGenerator("path", simulationVisualizationPath)
        )
      );
    }
  };

  const handleClose = () => {
    setShow(false);
    props.reduxNavFunctions.dispatch(disableSimulationMode());
  };
  const handleShow = () => {
    setShow(true);
    props.reduxNavFunctions.dispatch(enableSimulationMode());
  };

  return (
    <>
      <Island>
        <Header border>
          Simulation Mode{" "}
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
              Using this mode, we can highlight if the bus factor changes when one or more
              authors leave
            </p>
            <ControlsHeightContext.Provider value={ControlsHeight.L}>
              <Button primary onClick={handleShow}><Icon glyph={experimentIcon}/> Use Simulation Mode</Button>
            </ControlsHeightContext.Provider>
          </div>

        </Content>
      </Island>

      {/* Modal */}
      <Modal
        show={show}
        onHide={handleClose}
        size="fullscreen">
        <Modal.Header closeButton>
          <Modal.Title>Simulate Author Removal</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row">
            <div className="col-8">
              <center>
                <TreeMap
                  colorDefinitions={CONFIG.general.colors.jetbrains}
                  containerId={CONFIG.simulation.ids.treemapContainerId}
                  data={simulationVisualizationData}
                  dataNormalizationFunction={Math.log2}
                  dataPath={simulationVisualizationPath}
                  initialHeight={CONFIG.simulation.layout.height}
                  initialWidth={CONFIG.simulation.layout.width}
                  padding={CONFIG.simulation.layout.overallPadding}
                  svgId={CONFIG.simulation.ids.treemapSvgId}
                  tilingFunction={tiling.squarify}
                  topPadding={CONFIG.simulation.layout.topPadding}
                  type="mini"
                  reduxNavFunctions={props.reduxNavFunctions}></TreeMap>
              </center>
            </div>

            <div className="col-4">
              <nav aria-label="breadcrumb">
                <strong>Path:</strong>
                <ol className="breadcrumb">
                  {simulationVisualizationPath
                    .split("/")
                    .map((pathElement, i) => (
                      <li
                        className={
                          i < simulationVisualizationPath.split("/").length - 1
                            ? "btn btn-link breadcrumb-item p-1"
                            : "btn btn-link breadcrumb-item active p-1"
                        }
                        key={pathElement}
                        onClick={() =>
                          setTreemapPathOutFunc(
                            generateBreadcrumb(i, simulationVisualizationPath)
                          )
                        }>
                        {pathElement}
                      </li>
                    ))}
                </ol>
              </nav>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  onChange={handleSearchTextChange}
                  aria-describedby="input-file-extension"></input>

                <button
                  className="btn btn-dark"
                  type="button"
                  id="button-filter-add">
                  Search
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: CONFIG.general.colors.jetbrains.blue,
                    color: "white",
                  }}
                  id="back"
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
                  }>
                  &uarr; Up
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: CONFIG.general.colors.jetbrains.brightRed,
                    color: "white",
                  }}
                  id="reset"
                  onClick={() => returnTreeMapHome()}>
                  <i className="bi bi-house"></i> Home
                </button>
              </div>

              <List
                maxHeight={600}
                // compact={true}
                shortcuts={true}
                // onChange={(e) => handleAuthorCheckmark(e, authorScorePair)}
                data={
                  authorsList && authorsListContributionPercentage
                    ? authorsListContributionPercentage
                      .filter((element) =>
                        element["email"].includes(nameFilterValue)
                      )
                      .sort((a, b) => b.relativeScore - a.relativeScore)
                      .map((authorScorePair, index) => (
                        {
                          label: authorScorePair.email,
                          details: formatPercentage(authorScorePair.relativeScore),
                          rgItemType: List.ListProps.Type.ITEM,
                          checkbox: !authorScorePair.include,
                        }
                      ))
                    : {}
                }
              />

            </div>
          </div>
          <LegendSimColor></LegendSimColor>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SimulationModeModal;
