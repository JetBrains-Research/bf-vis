/** @format */

import { format } from "../d3/format";
import * as tiling from "../d3/tiling";
import { useState } from "react";
import { CONFIG } from "../config";
import TreeMap from "./TreeMap";

function SimulationModeModal(props) {
  const formatPercentage = format(",.1%");
  const formatSI = format(".3s");

  const statsData = props.statsData;
  const authorsList = "users" in statsData ? [...statsData.users] : undefined;
  const simulationVisualizationData = props.simulationVisualizationData;
  const simulationVisualizationPath = props.simulationVisualizationPath;

  let authorsListContributionPercentage = undefined;
  const [nameFilterValue, setNameFilterValue] = useState("");

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
          included: true,
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

  return (
    <div
      id="simulation-mode-container"
      className="row panel-right mt-2 pt-2 pb-2">
      <h4>
        Simulation Mode <i className="bi bi-info-circle-fill"></i>
        <a
          className=""
          data-bs-toggle="collapse"
          href="#simulationModeCollapsible"
          role="button"
          aria-expanded="true"
          aria-controls="simulationModeCollapsible">
          <i className="bi bi-plus-circle-fill"></i>
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
          data-bs-toggle="modal"
          data-bs-target="#exampleModal">
          Configure Simulation
        </button>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5"
                id="exampleModalLabel">
                Simulation Mode Configuration
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"></button>
            </div>
            <div className="modal-body">
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
                  type="mini"></TreeMap>
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
                                  id=""
                                  value="option1"
                                  checked={authorScorePair.included}
                                  onChange={() =>
                                    console.log("authorChecked")
                                  }></input>
                              </div>
                            </td>
                            <td>{authorScorePair["email"]}</td>
                            <td> {formatSI(authorScorePair["authorship"])}</td>
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
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal">
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary">
                Apply configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationModeModal;
