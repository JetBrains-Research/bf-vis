/** @format */

import { createSlice } from "@reduxjs/toolkit";
import { gitRepoDirData } from "../data/project_data_recalculating";
import * as jp from "jsonpath";
import { calculateBusFactor } from "../utils/BusFactorUtil";

const fullData = gitRepoDirData;
const initialDummyMiniTreeMapData =
  getDummySimulationModeComparisonData(fullData);

// Initial State for this slice
const defaultState = {
  mainTreemap: {
    currentStatsData: fullData,
    currentStatsPath: fullData.path,
    currentVisualizationData: fullData,
    currentVisualizationPath: fullData.path,
    ignored: [],
    isRecalculationEnabled: false,
    previousPathStack: [],
  },
  simulation: {
    miniTreemap: {
      visualizationData: initialDummyMiniTreeMapData,
      visualizationPath: fullData.path,
      previousPathStack: [],
    },
    isSimulationMode: false,
    removedAuthors: [],
  },
  filters: [],
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
          currentData.children[count].busFactorStatus["busFactorDelta"] = -2;
      }

      if (count % 5 === 0) {
        if ("busFactorStatus" in currentData.children[count])
          currentData.children[count].busFactorStatus["nodeStatus"] = "removed";

        currentData.children[count].busFactorStatus["busFactorDelta"] = -count;
      }

      if (count % 3 === 0) {
        if ("busFactorStatus" in currentData.children[count])
          currentData.children[count].busFactorStatus["nodeStatus"] = "added";
        currentData.children[count].busFactorStatus["busFactorDelta"] = 3;
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
    returnMainTreemapHome: (state) => {
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
    scopeMainTreemapIn: (state, action) => {
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
    scopeMainTreemapOut: (state) => {
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
    scopeMiniTreemapIn: (state, action) => {
      if (
        action.payload &&
        action.payload.path &&
        action.payload.path !== state.simulation.miniTreemap.visualizationPath
      ) {
        const nextPath = `${action.payload.path}`;
        const pathQuery = `$..[?(@.path=='${nextPath}')]`;
        let newData = jp.query(initialDummyMiniTreeMapData, pathQuery);
        console.log("scopeTreemapIn", newData, pathQuery);

        if (newData && newData.children) {
          state.simulation.miniTreemap.previousPathStack.push(
            state.simulation.miniTreemap.visualizationPath
          );
          state.simulation.miniTreemap.visualizationData = newData;
          state.simulation.miniTreemap.visualizationPath = nextPath;
        }
      }
    },
    scopeMiniTreemapOut: (state, action) => {
      const nextPath = state.simulation.miniTreemap.previousPathStack.pop();

      if (nextPath) {
        if (nextPath === ".") {
          state.simulation.miniTreemap.visualizationData =
            initialDummyMiniTreeMapData;
          state.simulation.miniTreemap.visualizationPath =
            initialDummyMiniTreeMapData.path;
        } else {
          const pathQuery = `$..[?(@.path==="${nextPath}")]`;
          let newData = getDataWithPathQuery(
            initialDummyMiniTreeMapData,
            pathQuery
          );
          console.log("scopeTreemapOut", newData, pathQuery);
          if (newData && newData.children) {
            state.simulation.miniTreemap.visualizationData = newData;
            state.simulation.miniTreemap.visualizationPath = nextPath;
          }
        }
      }
    },
    returnMiniTreemapHome: (state, action) => {},
    addFilter: (state, action) => {
      const newFilterExps = action.payload;

      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        state.filters = [
          ...new Set(state.filters.concat(newFilterExps)),
        ];
      }
    },
    removeFilter: (state, action) => {
      const newFilterExps = action.payload;

      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        state.filters =
          state.filters.filter(
            (element) => !newFilterExps.includes(element)
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
  scopeMainTreemapIn,
  scopeMainTreemapOut,
  returnMainTreemapHome,
  // regex filter actions
  addFilter,
  removeFilter,
  // inclusion filter methods
  // Simulation Mode Actions
  enableSimulationMode,
  disableSimulationMode,
  scopeMiniTreemapIn,
  scopeMiniTreemapOut,
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
