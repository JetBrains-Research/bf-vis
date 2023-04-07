/** @format */

import React, { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { dispatch } from "d3";
import {
  disableSimulationMode,
  enableSimulationMode,
  removedAuthors,
  simulateAuthorRemoval,
  undoAuthorRemoval,
} from "../reducers/treemapSlice";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { InfoPanel } from "./InfoPanel";

function StatsPane(props) {
  const { t, i18n } = useTranslation();
  const formatPercentage = d3.format(",.1%");
  const formatSI = d3.format(".3s");

  const isFirstRender = useRef(true);
  const [numOfAuthors, setNumOfAuthors] = useState(0);
  const [inSimulationMode, setSimulationMode] = useState(false);

  const nodeData = props.data;
  const nodeBusFactor = useMemo(
    () =>
      "busFactor" in nodeData.busFactorStatus
        ? nodeData.busFactorStatus.busFactor
        : nodeData.busFactorStatus.old
        ? "N/A (marked 'old')"
        : nodeData.busFactorStatus.ignored
        ? "N/A (file in ignore list)"
        : "N/A (reason unknown)",
    [nodeData]
  );

  const authorsList = useMemo(
    () =>
      "users" in nodeData
        ? [...nodeData.users].sort((a, b) => b.authorship - a.authorship)
        : undefined,
    [nodeData]
  );

  const totalNumOfAuthors = useMemo(
    () => (authorsList ? authorsList.length : 0),
    [authorsList]
  );

  const cumulativeAuthorship = useMemo(
    () =>
      authorsList
        ? authorsList
            .map((element) => element.authorship)
            .reduce((prevValue, currentValue) => prevValue + currentValue, 0)
        : null,
    [authorsList]
  );

  const authorsListContributionPercentage = useMemo(
    () =>
      authorsList
        ? authorsList.map((authorContributionPair) => {
            return {
              email: authorContributionPair.email,
              authorship: authorContributionPair.authorship,
              relativeScore:
                authorContributionPair.authorship / cumulativeAuthorship,
            };
          })
        : null,
    [authorsList, cumulativeAuthorship]
  );

  const topAuthors = useMemo(
    () =>
      authorsList
        ? authorsListContributionPercentage.slice(0, numOfAuthors)
        : null,
    [authorsList, authorsListContributionPercentage, numOfAuthors]
  );

  const handleSimulationModeSwitch = (event) => {
    setSimulationMode(!inSimulationMode);

    if (inSimulationMode) {
      dispatch(enableSimulationMode());
    }

    if (!inSimulationMode) {
      dispatch(disableSimulationMode());
    }
  };

  const handleAuthorRemovalSwitch = (event) => {
    if (event.target.checked) {
      dispatch(undoAuthorRemoval(event.target.props.email));
    } else {
      dispatch(simulateAuthorRemoval(event.target.props.email));
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    if (nodeBusFactor && nodeBusFactor > 0) {
      setNumOfAuthors(nodeBusFactor);
    } else if (totalNumOfAuthors) {
      setNumOfAuthors(totalNumOfAuthors);
    }
  }, [nodeBusFactor, totalNumOfAuthors]);

  return (
    <div
      id="details-container"
      className="row panel-right mt-2 pt-2 pb-2">
      <h4>
        Stats{" "}
        <InfoPanel
          divName="statsInfoPanel"
          header="What are these stats and how are the calculated?"
          body={[t("stats")]}></InfoPanel>
        <a
          className=""
          data-bs-toggle="collapse"
          href=".statsPaneCollapsible"
          role="button"
          aria-expanded="true"
          aria-controls="statsPaneCollapsible">
          <i className="bi bi-plus-circle-fill"></i>
          <i className="bi bi-dash-circle-fill"></i>
        </a>
      </h4>
      <div className="col-12 statsPaneCollapsible collapse show">
        <h5>Name</h5>
        <p>
          {}
          {nodeData.name}
        </p>

        <h5>Bus Factor</h5>
        <p>{nodeBusFactor}</p>

        <h5>Author Contribution</h5>
        {authorsList && topAuthors ? (
          <>
            <label
              htmlFor="authorNumberSelecter"
              className="form-label">
              Showing top {numOfAuthors}
              {" of "}
              {totalNumOfAuthors}
            </label>
            <input
              type="range"
              className="form-range"
              value={numOfAuthors}
              onChange={(e) => setNumOfAuthors(e.target.value)}
              min={0}
              max={totalNumOfAuthors}
              id="authorNumberSelecter"></input>
          </>
        ) : (
          <>
            <p>No author info available</p>
          </>
        )}

        <div
          className="list-group list-group-flush"
          style={{
            maxHeight: "25vh",
            maxWidth: "15vw",
            overflowY: "scroll",
          }}>
          {authorsList && topAuthors ? (
            topAuthors.map((authorScorePair) => (
              <div
                className="list-group-item"
                key={authorScorePair["email"]}>
                <p className="small text-break text-wrap">
                  {authorScorePair["email"]}
                </p>
                <h6 className="small">
                  {formatPercentage(authorScorePair["relativeScore"])}
                </h6>
                <span className="small">
                  ({formatSI(authorScorePair["authorship"])})
                </span>
              </div>
            ))
          ) : (
            <p className="small fw-bold">N/A</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsPane;
