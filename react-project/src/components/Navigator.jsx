/** @format */

import React, { useState, useMemo } from "react";
import { batch, useSelector } from "react-redux";

import { InfoPanel } from "./InfoPanel";
import { useTranslation } from "react-i18next";

import { CONFIG } from "../config";
import {
  addFilter,
  addExtensionFilter,
  removeAllFilters,
  removeExtensionFilter,
  removeFilter,
  selectAllFilters,
  selectExtensionFilters,
} from "../reducers/treemapSlice";
import FilterWithInput from "./FilterWithInput";
import SimulationModeModal from "./SimulationModeModal";
import LegendSize from "./LegendSize";
import { generateBreadcrumb, getFileExtension } from "../utils/url.tsx";
import { Form } from "react-bootstrap";

function Navigator(props) {
  const dispatch = props.dispatch;
  const currentPath = props.path;
  const setPathFunc = props.setPathFunc;
  const simulationData = props.simulationData;
  const simulationPath = props.simulationPath;
  const statsData = props.statsData;

  const filterTemplates = CONFIG.filters;
  const [isDotFilterApplied, setIsDotFilterApplied] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState();
  const { t, i18n } = useTranslation();

  const currentExtensionsList = useMemo(() => {
    if ("children" in simulationData) {
      return Array.from(
        new Set(
          simulationData.children
            .map((item, index) => {
              const extension = getFileExtension(item.name);
              if (extension !== undefined) return extension;
            })
            .filter((ext) => ext !== undefined)
        )
      ).sort();
    } else {
      return [];
    }
  });

  const currentExtensionsFilteredList = useSelector(selectExtensionFilters);

  console.log(currentExtensionsList);

  const handleDotFilterSwitch = (event) => {
    setIsDotFilterApplied(!isDotFilterApplied);

    if (event.target.checked) {
      dispatch(addFilter(CONFIG.commonFilterExpressions.startingWithDot));
    } else if (!event.target.checked) {
      dispatch(removeFilter(CONFIG.commonFilterExpressions.startingWithDot));
    }
  };

  const handleFilterDropdown = (event) => {
    const dropdownSelection = event.target.innerText;
    setCurrentTemplate(dropdownSelection);
    batch(() => {
      dispatch(addFilter(filterTemplates[dropdownSelection].extensions));
    });
  };

  const handleFilterCheck = (extension, event) => {
    console.log(event.target.checked);

    if (event.target.checked) {
      dispatch(addExtensionFilter([extension]))
    }
    else {
      dispatch(removeExtensionFilter([extension]))
    }
  };

  return (
    <div
      className="col p-1"
      id="controls">
      <div className="row pt-2 pb-2 mb-3 panel-left">
        <h5>
          Current Path{" "}
          <InfoPanel
            divName="currentPathInfoPanel"
            header="What is the current path"
            body={[
              t("currentPath.general"),
              t("currentPath.details"),
            ]}></InfoPanel>
          <a
            className=""
            data-bs-toggle="collapse"
            data-bs-target="#pathNavCollapsible"
            role="button"
            aria-expanded="true"
            aria-controls="collapseExample">
            <i className="bi bi-plus-circle-fill"></i>
            <i className="bi bi-dash-circle-fill"></i>
          </a>
        </h5>

        <div
          id="pathNavCollapsible"
          className="collapse show">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              {currentPath.split("/").map((pathElement, i) => (
                <li
                  className={
                    i < currentPath.split("/").length - 1
                      ? "btn btn-link breadcrumb-item p-1"
                      : "btn btn-link breadcrumb-item active p-1"
                  }
                  key={pathElement}
                  onClick={() =>
                    setPathFunc(generateBreadcrumb(i, currentPath))
                  }>
                  {pathElement}
                </li>
              ))}
            </ol>
          </nav>

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
                currentPath.split("/").filter((r) => r !== "").length > 1
                  ? setPathFunc(currentPath.split("/").slice(0, -1).join("/"))
                  : setPathFunc(".")
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
              onClick={() => setPathFunc(".")}>
              <i className="bi bi-house"></i> Home
            </button>
          </div>
        </div>
      </div>

      <div className="row pt-2 pb-2 mb-3 panel-left">
        <h5>
          Filters{" "}
          <InfoPanel
            divName="filtersInfoPanel"
            header="What are filters"
            body={[t("filters.general")]}></InfoPanel>
          <a
            className=""
            data-bs-toggle="collapse"
            href=".filtersCollapsible"
            role="button"
            aria-expanded="true"
            aria-controls="collapseExample">
            <i className="bi bi-plus-circle-fill"></i>
            <i className="bi bi-dash-circle-fill"></i>
          </a>
        </h5>
        <div className="filtersCollapsible collapse show">
          <FilterWithInput
            key="Regex"
            filterPropertyType="RegEx"
            addFunction={addFilter}
            removeFunction={removeFilter}
            removeAllFunction={removeAllFilters}
            selector={selectAllFilters}
            dispatch={dispatch}
            infoPanelDetails={[
              t("filters.regex"),
              t("filters.links"),
            ]}></FilterWithInput>

          <h6>Extensions</h6>
          <div
            className="dropdown open filtersCollapsible show row text-start"
            style={{
              maxHeight: "15vh",
              overflowY: "scroll",
            }}>
            <Form>
              {currentExtensionsList.map((extension, index) => {
                return (
                  <Form.Check key={extension}>
                    <Form.Check.Input
                      id={`${extension}-checkbox`}
                      checked={
                        !currentExtensionsFilteredList.includes(extension)
                      }
                      onChange={(event) =>
                        handleFilterCheck(extension, event)
                      }></Form.Check.Input>
                    <Form.Check.Label>
                      <small>{`.${extension}`}</small>
                    </Form.Check.Label>
                  </Form.Check>
                );
              })}
            </Form>
          </div>
        </div>
      </div>
      <SimulationModeModal
        statsData={statsData}
        simulationData={simulationData}
        simulationPath={simulationPath}
        reduxNavFunctions={props.reduxNavFunctions}></SimulationModeModal>

      <LegendSize></LegendSize>
    </div>
  );
}

export default Navigator;
