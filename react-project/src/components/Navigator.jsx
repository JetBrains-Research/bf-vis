/** @format */

import * as d3 from "d3";

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
  selectRegexFilters,
  selectExtensionFilters,
  toggleFolderFilter,
} from "../reducers/treemapSlice";
import FilterWithInput from "./FilterWithInput";
import SimulationModeModal from "./SimulationModeModal";
import LegendSize from "./LegendSize";
import { generateBreadcrumb, getFileExtension } from "../utils/url.tsx";
import { Form } from "react-bootstrap";
import ButtonSet from "@jetbrains/ring-ui/dist/button-set/button-set";
import Button from "@jetbrains/ring-ui/dist/button/button";
import arrowUpIcon from "@jetbrains/icons/arrow-up";
import archiveIcon from "@jetbrains/icons/archive";
import search from "@jetbrains/icons/search";
import searchError from "@jetbrains/icons/search-error";
import Icon from "@jetbrains/ring-ui/dist/icon/icon";
import Island from "@jetbrains/ring-ui/dist/island/island";
import Header from "@jetbrains/ring-ui/dist/island/header";
import Content from "@jetbrains/ring-ui/dist/island/content";
import updateIcon from "@jetbrains/icons/update";
import Select from "@jetbrains/ring-ui/dist/select/select";
import Toggle, { Size } from "@jetbrains/ring-ui/dist/toggle/toggle";
import Text from "@jetbrains/ring-ui/dist/text/text";
import { resetZoom } from "../d3/zoom";
import { binary, layoutAlgorithmsMap, squarify } from "../d3/tiling";
import { sortingOrderMap } from "../d3/sort";

function Navigator(props) {
  const dispatch = props.dispatch;
  const currentPath = props.path;
  const folderFilter = props.currentFolderFilter;
  const reduxTreemapLayoutFunctions = props.reduxTreemapLayoutFunctions;
  const setPathFunc = props.setPathFunc;
  const simulationData = props.simulationData;
  const simulationPath = props.simulationPath;
  const simulationZoom = props.simulationZoom;
  const sortingKey = props.sortingKey;
  const sortingOrder = props.sortingOrder;
  const statsData = props.statsData;
  const tilingFunction = props.tilingFunction;
  const zoom = props.zoom;

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

  const handleFilterCheck = (extension, event) => {
    console.log(event.target.checked);

    if (event.target.checked) {
      dispatch(removeExtensionFilter([extension]));
    } else {
      dispatch(addExtensionFilter([extension]));
    }
  };

  const handleLayoutAlgorithm = (e) => {
    dispatch(reduxTreemapLayoutFunctions.setTilingFunction(e.label));
  };
  const handleSortingKey = (e) => {
    dispatch(reduxTreemapLayoutFunctions.setSortingKey(e.key));
  };
  const handleSortingOrder = (e) => {
    console.log(e.label);
    dispatch(reduxTreemapLayoutFunctions.setSortingOrder(e.label));
  };
  const handleFolderFilterToggle = (e) => {
    console.log(e.target.checked);
    dispatch(toggleFolderFilter());
  };

  const zoomIn = () => {
    d3.select("svg g g").transition().call(zoom.scaleBy, 2);
  };

  const zoomOut = () => {
    d3.select("svg g g").transition().call(zoom.scaleBy, 0.5);
  };

  const pathIsland = () => {
    return (
      <Island>
        <Header border>
          Navigation{" "}
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
        </Header>
        <Content>
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
                    <span className="small">{pathElement}</span>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="d-flex mt-1">
              <ButtonSet>
                <Button
                  onClick={() =>
                    currentPath.split("/").filter((r) => r !== "").length > 1
                      ? setPathFunc(
                          currentPath.split("/").slice(0, -1).join("/")
                        )
                      : setPathFunc(".")
                  }>
                  <Icon glyph={arrowUpIcon} /> Up
                </Button>
                <Button
                  primary
                  onClick={() => setPathFunc(".")}>
                  <Icon glyph={archiveIcon} /> Home
                </Button>
              </ButtonSet>
            </div>
            <div className="d-flex mt-1">
              <ButtonSet>
                <Button
                  danger
                  onClick={() => resetZoom(zoom)}>
                  <Icon glyph={search} /> Reset
                </Button>
                <Button onClick={() => zoomIn()}>
                  <Icon glyph={search} /> In
                </Button>
                <Button onClick={() => zoomOut()}>
                  <Icon glyph={searchError} /> Out
                </Button>
              </ButtonSet>
            </div>
            <div className="d-flex mt-1">
              <Select
                inputPlaceholder="Layout Algorithm"
                onChange={handleLayoutAlgorithm}
                data={Object.keys(layoutAlgorithmsMap).map((element, index) => {
                  return {
                    label: element,
                    key: index,
                  };
                })}
                selectedLabel="Layout Algorithm"
                label="Select..."></Select>
            </div>
            <div className="d-flex mt-1">
              <Select
                inputPlaceholder="Sorting Key"
                onChange={handleSortingKey}
                data={[
                  {
                    label: "bus factor",
                    key: "busFactor",
                  },
                  {
                    label: "name",
                    key: "name",
                  },
                  {
                    label: "size",
                    key: "size",
                  },
                ]}
                selectedLabel="Sorting Key"
                label="Select..."></Select>
            </div>
            <div className="d-flex mt-1">
              <Select
                inputPlaceholder="Sorting Order"
                onChange={handleSortingOrder}
                data={Object.keys(sortingOrderMap).map((element, index) => {
                  return {
                    label: element,
                    key: index,
                  };
                })}
                selectedLabel="Sorting Order"
                label="Select..."></Select>
            </div>
          </div>
        </Content>
      </Island>
    );
  };

  const filterIsland = () => {
    return (
      <Island>
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
            <div className="mb-3">
              {/* <h6>Folders</h6> */}
              <Toggle
                size={Size.Size16}
                checked={folderFilter}
                onClick={handleFolderFilterToggle}>
                <Text className="small">Hide non-folder tiles</Text>
              </Toggle>
            </div>
            <FilterWithInput
              key="Regex"
              filterPropertyType="RegEx"
              summary={"Only pattern matches are shown"}
              addFunction={addFilter}
              removeFunction={removeFilter}
              removeAllFunction={removeAllFilters}
              selector={selectRegexFilters}
              dispatch={dispatch}
              infoPanelDetails={[
                t("filters.regex"),
                t("filters.links"),
              ]}></FilterWithInput>

            <h6>Suggested Filters</h6>
            <div
              className="dropdown open filtersCollapsible show row text-start"
              style={{
                maxHeight: "10vh",
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
        </Content>
      </Island>
    );
  };

  return (
    <>
      {addMargin(pathIsland())}
      {addMargin(filterIsland())}
      {addMargin(
        <SimulationModeModal
          reduxNavFunctions={props.reduxNavFunctions}
          simulationData={simulationData}
          simulationPath={simulationPath}
          statsData={statsData}
          sortingKey={sortingKey}
          sortingOrder={sortingOrder}
          tilingFunction={tilingFunction}
          zoom={simulationZoom}></SimulationModeModal>
      )}
      <LegendSize></LegendSize>
    </>
  );
}

export default Navigator;

// TODO: refactor must be a better way
export const addMargin = (elem) => {
  const margin = {
    marginBottom: 20,
  };
  return <div style={margin}>{elem}</div>;
};
