/** @format */

import { createSlice } from "@reduxjs/toolkit";
import { gitRepoDirData } from "../data/nikolaiData_recalculating";
import * as jp from "jsonpath";
import { calculateBusFactor } from "../utils/BusFactorUtil";

const fullData = gitRepoDirData;
const initialDummyMiniTreeMapData =
  getDummySimulationModeComparisonData(fullData);

// Initial State for this slice
const defaultState = {
  mainTreemap: {
    currentVisualizationData: fullData,
    currentVisualizationPath: fullData.path,
    currentStatsData: fullData,
    currentStatsPath: fullData.path,
    previousPathStack: [],
    ignored: [],
  },
  simulation: {
    miniTreemap: {
      visualizationData: initialDummyMiniTreeMapData,
      visualizationPath: fullData.path,
    },
    isSimulationMode: false,
    removedAuthors: [],
  },
  filters: {
    mode: "exclusion",
    inclusion: {
      extensions: [],
      fileNames: [],
      fileNamePrefixes: [],
    },
    exclusion: {
      extensions: [],
      fileNames: [],
      fileNamePrefixes: [],
    },
  },
};

function getDataWithPathQuery(fullData, pathQuery) {
  let newData = jp.query(fullData, pathQuery);
  let result = calculateBusFactor(newData[0]);

  return result;
}

function getDummySimulationModeComparisonData(currentData) {
  if (currentData.children) {
    for (let count = 0; count < currentData.children.length; count++) {
      if (count % 2 === 0) {
        if ("busFactorStatus" in currentData.children[count])
          currentData.children[count].busFactorStatus["busFactorDelta"] =
            -count;
      }

      if (count % 5 === 0) {
        if ("busFactorStatus" in currentData.children[count])
          currentData.children[count].busFactorStatus["nodeStatus"] = "removed";
      }

      if (count % 3 === 0) {
        if ("busFactorStatus" in currentData.children[count])
          currentData.children[count].busFactorStatus["nodeStatus"] = "added";
      }
    }
  }

  return currentData;
}

function getDataFromCurrentData(currentData, authorsToRemove, filters) {
  let newData = currentData;
  let result = calculateBusFactor(currentData);
}

// Definition of the slice and its reducer function
const treemapSlice = createSlice({
  name: "treemap",
  initialState: defaultState,
  reducers: {
    // not as useful anymore, URL takes precedence, or at least, it should
    returnTreemapHome: (state) => {
      let newData = getDataWithPathQuery(fullData, "$");
      state.mainTreemap.currentVisualizationData = newData;
      state.mainTreemap.currentVisualizationPath = newData.path;
      state.mainTreemap.currentStatsData = newData;
      state.mainTreemap.currentStatsPath = newData.path;
    },
    // click on a file node
    scopeStatsIn: (state, action) => {
      if (
        action.payload &&
        action.payload.path &&
        action.payload.path !== state.mainTreemap.currentStatsPath
      ) {
        const newPath = `${action.payload.path}`;
        const pathQuery = `$..[?(@.path=='${newPath}')]`;
        let newData = getDataWithPathQuery(fullData, pathQuery);
        console.log("scopeStatsIn", newData, pathQuery);
        if (newData) {
          state.mainTreemap.currentStatsPath = newPath;
          state.mainTreemap.currentStatsData = newData;
        } else {
          console.log("scopeStatsIn", "not changed");
        }
      }
    },
    // click on a folder node
    scopeTreemapIn: (state, action) => {
      if (
        action.payload.path &&
        action.payload.path !== state.mainTreemap.currentVisualizationPath
      ) {
        const nextPath = `${action.payload.path}`;
        const pathQuery = `$..[?(@.path=='${nextPath}')]`;
        let newData = getDataWithPathQuery(fullData, pathQuery);
        console.log("scopeTreemapIn", newData, pathQuery);

        if (newData && newData.children) {
          state.mainTreemap.previousPathStack.push(
            state.mainTreemap.currentVisualizationPath
          );
          state.mainTreemap.currentVisualizationPath = nextPath;
          state.mainTreemap.currentVisualizationData = newData;
          state.mainTreemap.currentStatsPath = nextPath;
          state.mainTreemap.currentStatsData = newData;
        }
      }
    },
    // click the back button
    scopeTreemapOut: (state) => {
      const nextPath = state.mainTreemap.previousPathStack.pop();

      if (nextPath) {
        if (nextPath === ".") {
          state.mainTreemap.currentVisualizationData = fullData;
          state.mainTreemap.currentVisualizationPath = fullData.path;
          state.mainTreemap.currentStatsData = fullData;
          state.mainTreemap.currentStatsPath = fullData.path;
        } else {
          const pathQuery = `$..[?(@.path==="${nextPath}")]`;
          let newData = getDataWithPathQuery(fullData, pathQuery);
          console.log("scopeTreemapOut", newData, pathQuery);
          if (newData && newData.children) {
            state.mainTreemap.currentVisualizationPath = nextPath;
            state.mainTreemap.currentVisualizationData = newData;
            state.mainTreemap.currentStatsPath = nextPath;
            state.mainTreemap.currentStatsData = newData;
          }
        }
      }
    },
    addExclusionExtensionsFilter: (state, action) => {
      const newExtensions = action.payload;

      if (Array.isArray(newExtensions) && newExtensions.length > 0) {
        state.filters.exclusion.extensions = [
          ...new Set(state.filters.exclusion.extensions.concat(newExtensions)),
        ];
      }
    },
    removeExclusionExtensionsFilter: (state, action) => {
      const extensionsToRemove = action.payload;

      if (Array.isArray(extensionsToRemove) && extensionsToRemove.length > 0) {
        state.filters.exclusion.extensions =
          state.filters.exclusion.extensions.filter(
            (element) => !extensionsToRemove.includes(element)
          );
      }
    },
    addExclusionFilenamePrefixesFilter: (state, action) => {
      const fileNamePrefixesToAdd = action.payload;

      if (
        Array.isArray(fileNamePrefixesToAdd) &&
        fileNamePrefixesToAdd.length > 0
      ) {
        state.filters.exclusion.fileNamePrefixes = [
          ...new Set(
            state.filters.exclusion.fileNamePrefixes.concat(
              fileNamePrefixesToAdd
            )
          ),
        ];
      }
    },
    removeExclusionFilenamePrefixesFilter: (state, action) => {
      const fileNamePrefixesToRemove = action.payload;

      if (
        Array.isArray(fileNamePrefixesToRemove) &&
        fileNamePrefixesToRemove.length > 0
      ) {
        state.filters.exclusion.fileNamePrefixes =
          state.filters.exclusion.fileNamePrefixes.filter(
            (element) => !fileNamePrefixesToRemove.includes(element)
          );
      }
    },
    addExclusionFilenameFilter: (state, action) => {
      const fileNamesToAdd = action.payload;

      if (Array.isArray(fileNamesToAdd) && fileNamesToAdd.length > 0) {
        state.filters.exclusion.fileNames = [
          ...new Set(state.filters.exclusion.fileNames.concat(fileNamesToAdd)),
        ];
      }
    },
    removeExclusionFilenameFilter: (state, action) => {
      const fileNamesToRemove = action.payload;

      if (Array.isArray(fileNamesToRemove) && fileNamesToRemove.length > 0) {
        state.filters.exclusion.fileNames =
          state.filters.exclusion.fileNames.filter(
            (element) => !fileNamesToRemove.includes(element)
          );
      }
    },
    addInclusionExtensionsFilter: (state, action) => {
      const newExtensions = action.payload;

      if (Array.isArray(newExtensions) && newExtensions.length > 0) {
        state.filters.inclusion.extensions = [
          ...new Set(state.filters.inclusion.extensions.concat(newExtensions)),
        ];
      }
    },
    removeInclusionExtensionsFilter: (state, action) => {
      const extensionsToRemove = action.payload;

      if (Array.isArray(extensionsToRemove) && extensionsToRemove.length > 0) {
        state.filters.inclusion.extensions =
          state.filters.inclusion.extensions.filter(
            (element) => !extensionsToRemove.includes(element)
          );
      }
    },
    addInclusionFilenamePrefixesFilter: (state, action) => {
      const fileNamePrefixesToAdd = action.payload;

      if (
        Array.isArray(fileNamePrefixesToAdd) &&
        fileNamePrefixesToAdd.length > 0
      ) {
        state.filters.inclusion.fileNamePrefixes = [
          ...new Set(
            state.filters.inclusion.fileNamePrefixes.concat(
              fileNamePrefixesToAdd
            )
          ),
        ];
      }
    },
    removeInclusionFilenamePrefixesFilter: (state, action) => {
      const fileNamePrefixesToRemove = action.payload;

      if (
        Array.isArray(fileNamePrefixesToRemove) &&
        fileNamePrefixesToRemove.length > 0
      ) {
        state.filters.inclusion.fileNamePrefixes =
          state.filters.inclusion.fileNamePrefixes.filter(
            (element) => !fileNamePrefixesToRemove.includes(element)
          );
      }
    },
    addInclusionFilenameFilter: (state, action) => {
      const fileNamesToAdd = action.payload;

      if (Array.isArray(fileNamesToAdd) && fileNamesToAdd.length > 0) {
        state.filters.inclusion.fileNames = [
          ...new Set(state.filters.inclusion.fileNames.concat(fileNamesToAdd)),
        ];
      }
    },
    removeInclusionFilenameFilter: (state, action) => {
      const fileNamesToRemove = action.payload;

      if (Array.isArray(fileNamesToRemove) && fileNamesToRemove.length > 0) {
        state.filters.inclusion.fileNames =
          state.filters.inclusion.fileNames.filter(
            (element) => !fileNamesToRemove.includes(element)
          );
      }
    },
    enableSimulationMode: (state) => {
      state.isSimulationMode = true;
    },
    disableSimulationMode: (state) => {
      state.isSimulationMode = false;
    },
    simulateAuthorRemoval: (state, action) => {
      const authors = action.payload;
      state.simulation.removedAuthors = [
        ...new Set(state.removedAuthors.concat(authors)),
      ];

      let currentData = state.mainTreemap.currentVisualizationData;
      const newData = getDummySimulationModeComparisonData(currentData);

      state.simulation.miniTreemap.visualizationData = newData;
    },
    undoAuthorRemoval: (state, action) => {
      const authors = action.payload;
      state.removedAuthors = state.removedAuthors.filter(
        (element) => !authors.includes(element)
      );
    },
  },
});

// Exports
export const {
  // Treemap Navigation actions
  scopeStatsIn,
  scopeTreemapIn,
  scopeTreemapOut,
  returnTreemapHome,
  // exclusion filter actions
  addExclusionExtensionsFilter,
  removeExclusionExtensionsFilter,
  addExclusionFilenamePrefixesFilter,
  removeExclusionFilenamePrefixesFilter,
  addExclusionFilenameFilter,
  removeExclusionFilenameFilter,
  // inclusion filter methods
  addInclusionExtensionsFilter,
  removeInclusionExtensionsFilter,
  addInclusionFilenameFilter,
  removeInclusionFilenameFilter,
  addInclusionFilenamePrefixesFilter,
  removeInclusionFilenamePrefixesFilter,
  // Simulation Mode Actions
  enableSimulationMode,
  disableSimulationMode,
  simulateAuthorRemoval,
  undoAuthorRemoval,
} = treemapSlice.actions;
//treemap data selectors
export const selectFullData = (state) => state.treemap.mainTreemap.fullData;
export const selectCurrentVisualizationData = (state) =>
  state.treemap.mainTreemap.currentVisualizationData;
export const selectCurrentVisualizationPath = (state) =>
  state.treemap.mainTreemap.currentVisualizationPath;
export const selectCurrentStatsData = (state) =>
  state.treemap.mainTreemap.currentStatsData;
export const selectCurrentStatsPath = (state) =>
  state.treemap.mainTreemap.currentStatsPath;
//filter selectors
export const selectAllFilters = (state) => state.treemap.filters;
export const selectInclusionFilters = (state) =>
  state.treemap.filters.inclusion;
export const selectExclusionFilters = (state) =>
  state.treemap.filters.exclusion;
export const selectExclusionExtensionFilters = (state) =>
  state.treemap.filters.exclusion.extensions;
export const selectExclusionFileNamePrefixFilters = (state) =>
  state.treemap.filters.exclusion.fileNamePrefixes;
export const selectExclusionFileNamesFilters = (state) =>
  state.treemap.filters.exclusion.fileNames;
export const selectInclusionExtensionFilters = (state) =>
  state.treemap.filters.inclusion.extensions;
export const selectInclusionFileNamePrefixFilters = (state) =>
  state.treemap.filters.inclusion.fileNamePrefixes;
export const selectInclusionFileNamesFilters = (state) =>
  state.treemap.filters.inclusion.fileNames;
//simulation mode selectors
export const isSimulationMode = (state) =>
  state.treemap.simulation.isSimulationMode;
export const simulationVisualizationData = (state) =>
  state.treemap.simulation.miniTreemap.visualizationData;
export const simulationVisualizationPath = (state) =>
  state.treemap.simulation.miniTreemap.visualizationPath;
export const removedAuthors = (state) =>
  state.treemap.simulation.removedAuthors;
export default treemapSlice.reducer;
