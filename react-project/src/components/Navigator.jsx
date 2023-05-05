/** @format */

import React, {useState} from "react";
import {batch} from "react-redux";

import {InfoPanel} from "./InfoPanel";
import {useTranslation} from "react-i18next";

import {CONFIG} from "../config";
import {addFilter, removeAllFilters, removeFilter, selectAllFilters,} from "../reducers/treemapSlice";
import FilterWithInput from "./FilterWithInput";
import SimulationModeModal from "./SimulationModeModal";
import LegendSize from "./LegendSize";
import {generateBreadcrumb} from "../utils/url.tsx";
import ButtonSet from "@jetbrains/ring-ui/dist/button-set/button-set";
import Button from "@jetbrains/ring-ui/dist/button/button";
import arrowUpIcon from '@jetbrains/icons/arrow-up';
import archiveIcon from '@jetbrains/icons/archive';
import Icon from "@jetbrains/ring-ui/dist/icon/icon";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";

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

  const pathIsland = () => {
    return <Island>
      <Header border>
        Current Path{" "}
        <InfoPanel
          divName="currentPathInfoPanel"
          header="What is the current path"
          body={[
            t("currentPath.general"),
            t("currentPath.details"),
          ]}></InfoPanel>
      </Header>
      <Content>
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

        <ButtonSet>
          <Button
            onClick={() =>
              currentPath.split("/").filter((r) => r !== "").length > 1
                ? setPathFunc(currentPath.split("/").slice(0, -1).join("/"))
                : setPathFunc(".")
            }
          ><Icon glyph={arrowUpIcon}/> Up</Button>
          <Button
            onClick={() => setPathFunc(".")}>
            <Icon glyph={archiveIcon}/> Home</Button>
        </ButtonSet>
      </Content>
    </Island>
  }

  const filterIsland = () => {
    return <Island>
      <Header border>
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
      </Header>

      <Content>
        <div className="filtersCollapsible collapse show">

          <FilterWithInput
            key="Regex"
            filterPropertyType="RegEx"
            addFunction={addFilter}
            removeFunction={removeFilter}
            removeAllFunction={removeAllFilters}
            selector={selectAllFilters}
            dispatch={dispatch}
            infoPanelDetails={[t("filters.regex"), t("filters.links")]}></FilterWithInput>

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
      </Content>


    </Island>
  }

  return (
    <>

      {pathIsland()}
      {filterIsland()}



      <SimulationModeModal
        statsData={statsData}
        simulationData={simulationData}
        simulationPath={simulationPath}
        reduxNavFunctions={props.reduxNavFunctions}></SimulationModeModal>

      <LegendSize></LegendSize>
    </>
  );
}

export default Navigator;
