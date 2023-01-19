/** @format */

import React, { useState } from "react";
import { batch } from "react-redux";
import { CONFIG } from "../config";
import {
  addFilter,
  removeFilter,
  selectAllFilters,
} from "../reducers/treemapSlice";
import FilterWithInput from "./FilterWithInput";
import { generateBreadcrumb } from "../utils/url";

function Navigator(props) {
  const dispatch = props.dispatch;
  const currentPath = props.path;
  const setPathFunc = props.setPathFunc;
  const filterTemplates = CONFIG.filters;
  const [isDotFilterApplied, setIsDotFilterApplied] = useState(false);
  const [isBusFactorRecalcActive, setisBusFactorRecalcActive] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState();

  const handleDotFilterSwitch = (event) => {
    setIsDotFilterApplied(!isDotFilterApplied);

    // if (event.target.checked) {
    //   dispatch(addExclusionFilenamePrefixesFilter(["."]));
    // } else if (!event.target.checked) {
    //   dispatch(removeExclusionFilenamePrefixesFilter(["."]));
    // }
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
      dispatch(
        addFilter(
          filterTemplates[dropdownSelection].extensions
        )
      );
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
          Current Path <i className="bi bi-info-circle-fill"></i>
          <a
            className=""
            data-bs-toggle="collapse"
            data-bs-target="#pathNavCollapsible"
            role="button"
            aria-expanded="true"
            aria-controls="collapseExample">
            <i className="bi bi-plus-circle-fill"></i>
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
          Filters <i className="bi bi-info-circle-fill"></i>
          <a
            className=""
            data-bs-toggle="collapse"
            href=".filtersCollapsible"
            role="button"
            aria-expanded="false"
            aria-controls="collapseExample">
            <i className="bi bi-plus-circle-fill"
            ></i>
          </a>
        </h4>
        <div className="filtersCollapsible collapse show">
          <h6>Bus Factor Recalculation</h6>

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

          <h6>Filter names starting with '.'</h6>
          <input
            className="btn-check"
            type="checkbox"
            role="switch"
            id="dotFilterSwitch"
            checked={isDotFilterApplied}
            onChange={handleDotFilterSwitch}></input>
          <label
            className="btn btn-sm"
            style={{
              backgroundColor: isDotFilterApplied
                ? CONFIG.general.colors.jetbrains.blue
                : CONFIG.general.colors.jetbrains.brightRed,
              color: "white",
            }}
            htmlFor="dotFilterSwitch">
            {isDotFilterApplied ? "On" : "Off"}
          </label>

          <FilterWithInput
            key="Regex"
            filterPropertyType="RegEx"
            addFunction={addFilter}
            removeFunction={removeFilter}
            selector={selectAllFilters}
            dispatch={dispatch}
            addDefaultPrefix="."></FilterWithInput>

          {/* <FilterWithInput
            key="File name"
            filterPropertyType="File name"
            addFunction={addExclusionFilenameFilter}
            removeFunction={removeExclusionFilenameFilter}
            selector={selectExclusionFileNamesFilters}
            dispatch={dispatch}>
            {" "}
          </FilterWithInput>

          <FilterWithInput
            key="File name prefix"
            filterPropertyType="File name prefix"
            addFunction={addExclusionFilenamePrefixesFilter}
            removeFunction={removeExclusionFilenamePrefixesFilter}
            selector={selectExclusionFileNamePrefixFilters}
            dispatch={dispatch}>
            {" "}
          </FilterWithInput> */}

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
    </div>
  );
}

export default Navigator;
