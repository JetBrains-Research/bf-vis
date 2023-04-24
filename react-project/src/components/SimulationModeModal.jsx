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
  addAuthorToRemovalList, disableSimulationMode, enableSimulationMode,
  scopeMiniTreemapIn,
  selectRemovedAuthors,
  undoAuthorRemoval,
} from "../reducers/treemapSlice.js";
import {payloadGenerator} from "../utils/reduxActionPayloadCreator.tsx";
import {useSelector} from "react-redux";
import {Modal} from "react-bootstrap";
import {dispatch} from "d3";

function SimulationModeModal(props) {
  const {t, i18n} = useTranslation();
  const formatPercentage = format(",.1%");
  const formatSI = format(".3s");

  const simulationVisualizationData = props.simulationData;
  const simulationVisualizationPath = props.simulationPath;
  const authorsList = "users" in simulationVisualizationData ? [...simulationVisualizationData.users] : undefined;
  const [show, setShow] = useState(false);

  const setTreemapPathOutFunc = (path) => {
    props.reduxNavFunctions.dispatch(
      props.reduxNavFunctions.scopeMiniTreemapOut(payloadGenerator('path', path))
    );
  };
  const returnTreeMapHome = () => {
    props.reduxNavFunctions.dispatch(
      props.reduxNavFunctions.scopeMiniTreemapIn(payloadGenerator('path', "."))
    );
  }


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
    console.log("close called")
    setShow(false)
    props.reduxNavFunctions.dispatch(
      disableSimulationMode()
    )
  };
  const handleShow = () => {
    console.log("show called")
    setShow(true);
    props.reduxNavFunctions.dispatch(
      enableSimulationMode()
    )
  }

  return (
    <div
      id="simulation-mode-container"
      className="row panel-right mt-2 pt-2 pb-2">
      <h4>
        Simulation Mode
        <InfoPanel
          divName="simInfoPanel"
          header="How does the simulation mode work?"
          body={[t("simMode.general"), t("simMode.detail")]}></InfoPanel>
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
      </h4>
      <div
        id="simulationModeCollapsible"
        className="collapse show">
        <p className="small">
          Using this mode, we can highlight if the bus factor changes if a
          certain author leaves
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleShow}
        >
          Configure Simulation
        </button>
      </div>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Simulation Mode Configuration
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div>
            <div className="col-auto">
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

              <center>
                <h6>Path</h6>
              </center>

              <nav aria-label="breadcrumb">
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
                            generateBreadcrumb(i, simulationVisualizationPath)
                          )
                        }>
                        {pathElement}
                      </li>
                    ))}
                </ol>
              </nav>

              <center>
                <div
                  className="btn-group"
                  role="group">
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
                      backgroundColor:
                      CONFIG.general.colors.jetbrains.brightRed,
                      color: "white",
                    }}
                    id="reset"
                    onClick={() => returnTreeMapHome()}>
                    <i className="bi bi-house"></i> Home
                  </button>
                </div>
              </center>
            </div>

            <div className="col-auto">
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
              </div>
            </div>

            <div
              style={{
                maxHeight: "30vh",
                overflowY: "scroll",
              }}>
              <table className="table table-striped">
                <thead>
                <tr>
                  <th>#</th>
                  <th>Included?</th>
                  <th>Email</th>
                  <th>Authorship</th>
                  <th>Relative Contribution (to current location)</th>
                </tr>
                </thead>
                <tbody>
                {authorsList && authorsListContributionPercentage
                  ? authorsListContributionPercentage
                    .filter((element) =>
                      element["email"].includes(nameFilterValue)
                    )
                    .map((authorScorePair, index) => (
                      <tr key={authorScorePair["email"]}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={authorScorePair.email}
                              checked={authorScorePair.included}
                              onChange={(e) =>
                                handleAuthorCheckmark(e, authorScorePair)
                              }></input>
                          </div>
                        </td>
                        <td>{authorScorePair["email"]}</td>
                        <td>
                          {" "}
                          {formatSI(authorScorePair["authorship"])}
                        </td>
                        <td>
                          {formatPercentage(
                            authorScorePair["relativeScore"]
                          )}
                        </td>
                      </tr>
                    ))
                  : null}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SimulationModeModal;
