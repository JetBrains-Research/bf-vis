/** @format */

import React, {useState} from "react";
import {batch} from "react-redux";

import {InfoPanel} from "./InfoPanel";
import {useTranslation} from "react-i18next";

import {CONFIG} from "../config";
import {addFilter, removeFilter, selectAllFilters,} from "../reducers/treemapSlice";
import FilterWithInput from "./FilterWithInput";
import SimulationModeModal from "./SimulationModeModal";
import { generateBreadcrumb } from "../utils/url.tsx";

function Navigator(props) {
  const dispatch = props.dispatch;
  const currentPath = props.path;
  const setPathFunc = props.setPathFunc;
  const simulationData = props.simulationData;
  const simulationPath = props.simulationPath;
  const statsData = props.statsData;

  const filterTemplates = CONFIG.filters;
  const [isDotFilterApplied, setIsDotFilterApplied] = useState(false);
  const [isBusFactorRecalcActive, setisBusFactorRecalcActive] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState();
  const {t, i18n} = useTranslation();

  const handleDotFilterSwitch = (event) => {
    setIsDotFilterApplied(!isDotFilterApplied);

    if (event.target.checked) {
      dispatch(addFilter(CONFIG.commonFilterExpressions.startingWithDot));
    } else if (!event.target.checked) {
      dispatch(removeFilter(CONFIG.commonFilterExpressions.startingWithDot));
    }
  };

  const handleBusFactorRecalculationSwitch = (event) => {
    setisBusFactorRecalcActive(!isBusFactorRecalcActive);

    if (event.target.checked) {
      // enable recalculation
      // dispatch(addExclusionFilenamePrefixesFilter(['.',]));
    } else if (!event.target.checked) {
      // disable recalculation
      // dispatch(removeExclusionFilenamePrefixesFilter(['.',]));
    }
  };

  const handleFilterDropdown = (event) => {
    const dropdownSelection = event.target.innerText;
    setCurrentTemplate(dropdownSelection);
    batch(() => {
      dispatch(addFilter(filterTemplates[dropdownSelection].extensions));
      // dispatch(
      //   addExclusionFilenameFilter(filterTemplates[dropdownSelection].fileNames)
      // );
      // dispatch(
      //   addExclusionFilenamePrefixesFilter(
      //     filterTemplates[dropdownSelection].fileNamePrefixes
      //   )
      // );
    });
  };

  return (
    <div
      className="col p-1"
      id="controls">
      <div className="row pt-2 pb-2 mb-3 panel-left">
        <h4>
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
        </h4>

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
              &larr; Back
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
              Reset &#x27F3;
            </button>
          </div>
        </div>
      </div>

      <div className="row pt-2 pb-2 mb-3 panel-left">
        <h4>
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
        </h4>
        <div className="filtersCollapsible collapse show">
          <h6>
            Bus Factor Recalculation{" "}
            <InfoPanel
              divName="recalculationInfoPanel"
              header="How and when is bus factor recalculated?"
              body={[t("busFactor.recalculation")]}></InfoPanel>
          </h6>

          <input
            className="btn-check"
            type="checkbox"
            role="switch"
            id="recalculationSwitch"
            checked={isBusFactorRecalcActive}
            onChange={handleBusFactorRecalculationSwitch}></input>
          <label
            className="btn btn-sm"
            style={{
              backgroundColor: isBusFactorRecalcActive
                ? CONFIG.general.colors.jetbrains.blue
                : CONFIG.general.colors.jetbrains.brightRed,
              color: "white",
            }}
            htmlFor="recalculationSwitch">
            {isBusFactorRecalcActive ? "On" : "Off"}
          </label>

          <FilterWithInput
            key="Regex"
            filterPropertyType="RegEx"
            addFunction={addFilter}
            removeFunction={removeFilter}
            selector={selectAllFilters}
            dispatch={dispatch}
            infoPanelDetails={[t("filters.regex")]}></FilterWithInput>

          <h5>Filtering Templates</h5>
          <div className="dropdown open filtersCollapsible collapse show">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="triggerId"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false">
              Filter Templates
            </button>
            <div
              className="dropdown-menu"
              aria-labelledby="triggerId">
              {Object.keys(filterTemplates).map((template) => {
                return (
                  <button
                    className={
                      template === currentTemplate
                        ? "dropdown-item active"
                        : "dropdown-item"
                    }
                    key={template}
                    template={template}
                    onClick={handleFilterDropdown}>
                    {template}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <SimulationModeModal
        statsData={statsData}
        simulationData={simulationData}
        simulationPath={simulationPath}
        reduxNavFunctions={props.reduxNavFunctions}>
        
        </SimulationModeModal>
    </div>
  );
}

export default Navigator;
