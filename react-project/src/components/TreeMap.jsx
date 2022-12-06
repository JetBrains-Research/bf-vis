/** @format */

import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { selectAllFilters } from "../reducers/treemapSlice";

import { createSVGInContainer, clearCanvas } from "../d3/svgCanvas";
import {
  generateInitialD3Hierarchy,
  drawTreemapFromGeneratedLayout,
  drawMiniTreemapFromGeneratedLayout,
  applyFilters,
  applyNormalizationToD3Hierarchy,
} from "../d3/treemap";

import { sizeAscending } from "../d3/sort";
import { squarify } from "../d3/tiling";
import * as d3 from "d3";

function TreeMap(props) {
  // assign these consts fallback values if prop is empty or throw errors;
  const currentDataPath = props.dataPath;
  const setPathFunc = props.setPathFunc;
  const treemapContainerId = props.containerId;
  const treemapSvgId = props.svgId;
  const initialHeight = props.initialHeight;
  const initialWidth = props.initialWidth;
  const padding = props.padding;
  const topPadding = props.topPadding;
  const type = props.type;
  const dataNormalizationFunction = props.dataNormalizationFunction
    ? props.dataNormalizationFunction
    : Math.sqrt;
  const tilingFunction = props.tilingFunction ? props.tilingFunction : squarify;

  const filters = useSelector(selectAllFilters);

  useEffect(() => {
    // set data source
    const data = props.data;

    // Container definition and cleanup
    clearCanvas(treemapSvgId);

    // Create treemap layout
    const treemapLayoutGenerator = (treemapData) =>
      d3
        .treemap()
        .size([initialWidth, initialHeight])
        .padding(padding)
        .paddingTop(topPadding)
        .round(false)
        .tile(tilingFunction)(treemapData);

    // Create SVG canvas
    const svg = createSVGInContainer(
      `#${treemapContainerId}`,
      treemapSvgId,
      initialHeight,
      initialWidth
    );

    // Loading and generating initial data
    let rootHierarchyNode = generateInitialD3Hierarchy(data);

    // Apply filters if present
    if (filters) {
      applyFilters(rootHierarchyNode, filters);
    }

    // Apply data normalization if applicable
    if (dataNormalizationFunction) {
      applyNormalizationToD3Hierarchy(
        rootHierarchyNode,
        dataNormalizationFunction
      );
    }

    // Sort the nodes for each level
    rootHierarchyNode.sort(sizeAscending);

    // get a d3.treemap from the d3.hierarchy object
    const treemapLayout = treemapLayoutGenerator(rootHierarchyNode);

    // Drawing the treemap from the generated data
    if (type === "main")
      drawTreemapFromGeneratedLayout(svg, treemapLayout, setPathFunc);
    else if (type === "mini")
      drawMiniTreemapFromGeneratedLayout(svg, treemapLayout);
  }, [
    props.data,
    currentDataPath,
    dataNormalizationFunction,
    filters,
    initialHeight,
    initialWidth,
    padding,
    setPathFunc,
    tilingFunction,
    topPadding,
    treemapContainerId,
    treemapSvgId,
    type,
  ]);

  return (
    <div
      id={treemapContainerId}
      className="container-fluid"></div>
  );
}

export default TreeMap;
