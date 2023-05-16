/** @format */

import React, { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { dispatch } from "d3";
import {
  disableSimulationMode,
  enableSimulationMode,
  selectRemovedAuthors,
  addAuthorToRemovalList,
  undoAuthorRemoval,
} from "../reducers/treemapSlice";
import { useSelector } from "react-redux";
import { Tab, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { InfoPanel } from "./InfoPanel";

function StatsPane(props) {
  const { t, i18n } = useTranslation();
  const formatPercentage = d3.format(",.2%");
  const formatSI = d3.formatPrefix(".1s", 1);

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
              email: authorContributionPair.email.replace(/([@\.])/g, `\n$1`),
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
      dispatch(addAuthorToRemovalList(event.target.props.email));
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }

    if (totalNumOfAuthors) {
      setNumOfAuthors(totalNumOfAuthors);
    }
  }, [nodeBusFactor, totalNumOfAuthors]);

  return (
    <div
      id="details-container"
      className="row panel-right mt-2 pt-2 pb-2">
      <h5>
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
      </h5>
      <div className="col-12 statsPaneCollapsible collapse show">
        <ul className="list-unstyled">
          <li>
            <small className="text-break text-wrap">
              Name: <strong>{nodeData.name}</strong>
            </small>
          </li>
          <li>
            <small className="text-break text-wrap">
              Bus Factor: <strong>{nodeBusFactor}</strong>
            </small>
          </li>
        </ul>

        <h6>Author Contribution</h6>
        {authorsList && topAuthors ? (
          <></>
        ) : (
          <>
            <p>No author info available</p>
          </>
        )}

        <div
          style={{
            maxHeight: "40vh",
            overflowY: "scroll",
            overflowX: "auto",
          }}
          className="row">
          <Table
            striped
            hover
            size="small">
            <thead>
              <tr className="d-flex">
                <th className="px-0 col-2">
                  <small>#</small>
                </th>
                <th className="px-0 col-5 text-end">
                  <small>Email</small>
                </th>
                <th className="px-0 col-5 text-break text-end">
                  <small>Contribution</small>
                </th>
              </tr>
            </thead>
            <tbody>
              {authorsList && topAuthors ? (
                topAuthors.map((authorScorePair, index) => (
                  <tr
                    key={authorScorePair["email"]}
                    className="d-flex">
                    <td className="px-0 col-2">
                      <small>{index + 1}</small>
                    </td>
                    <td className="text-end px-1 col-7">
                      <small>
                        {authorScorePair["email"].split("\n").map((val) => {
                          return (
                            <>
                              <wbr />
                              {val}
                            </>
                          );
                        })}
                      </small>
                    </td>
                    <td className="px-0 col-3">
                      <small>
                        {formatPercentage(authorScorePair["relativeScore"])}
                      </small>
                    </td>
                  </tr>
                ))
              ) : (
                <p className="small fw-bold">N/A</p>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default StatsPane;
