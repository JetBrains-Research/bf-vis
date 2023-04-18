/** @format */

import { createSlice } from "@reduxjs/toolkit";
import { gitRepoDirData } from "../data/project_data_recalculating";
import * as jp from "jsonpath";
import { calculateBusFactor } from "../utils/BusFactorUtil";

const fullData = gitRepoDirData;
const initialMiniTreeMapData = initializeBusFactorDeltaProperties(fullData);

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
    isSimulationMode: false,
    lastUsedRemovedAuthorsList: [],
    miniTreemap: {
      previousPathStack: [],
      previousVisualizationData: [],
      visualizationData: initialMiniTreeMapData,
      visualizationPath: fullData.path,
    },
    removedAuthors: [],
  },
  filters: [],
};

function getDataWithPathQuery(fullData, pathQuery, developersToRemove) {
  let newData = jp.query(fullData, pathQuery);
  let result = calculateBusFactor(newData[0], developersToRemove);

  return result;
}

function initializeBusFactorDeltaProperties(dataRootNode) {
  if (dataRootNode == null) throw new Error("Empty data file");

  if (!("busFactorStatus" in dataRootNode)) {
    dataRootNode.busFactorStatus = {};
  }
  Object.defineProperties(dataRootNode.busFactorStatus, {
    nodeStatus: {
      value: "original",
      writable: true,
    },
    delta: {
      value: 0,
      writable: true,
    },
  });
  // dataRootNode.busFactorStatus.nodeStatus = "original";
  // dataRootNode.busFactorStatus.delta = 0;

  if (dataRootNode.children) {
    for (let count = 0; count < dataRootNode.children.length; count++) {
      dataRootNode.children[count] = initializeBusFactorDeltaProperties(
        dataRootNode.children[count]
      );
    }
  }

  return dataRootNode;
}

export function getRecalculatedBusFactorData(baseData, developersToRemove) {
  let newData = calculateBusFactor(baseData, developersToRemove);
  return newData;
}

function getDataFromCurrentData(currentData, developersToRemove, filters) {
  let newData = currentData;
  let result = calculateBusFactor(currentData, developersToRemove);
}

export function getBusFactorDeltas(oldDataRootNode, newDataRootNode) {
  let newDataRootNodeCopy = { ...newDataRootNode };
  newDataRootNodeCopy.busFactorStatus = {
    ...newDataRootNodeCopy.busFactorStatus,
  };
  if (newDataRootNodeCopy.children)
    newDataRootNodeCopy.children = [...newDataRootNodeCopy.children];

  if (oldDataRootNode === null) {
    throw new Error("Old data is null!");
  }

  if (newDataRootNodeCopy === null) {
    throw new Error("New data is null!");
  }

  if (oldDataRootNode.name !== newDataRootNodeCopy.name) {
    throw new Error("Names don't match!");
  }

  if (
    oldDataRootNode.busFactorStatus.busFactor &&
    newDataRootNodeCopy.busFactorStatus.busFactor
  ) {
    let delta =
      newDataRootNodeCopy.busFactorStatus.busFactor -
      oldDataRootNode.busFactorStatus.busFactor;
    // console.log(newDataRootNode.path, newDataRootNode.busFactorStatus);
    newDataRootNodeCopy.busFactorStatus.delta = delta;
    newDataRootNodeCopy.busFactorStatus.nodeStatus =
      oldDataRootNode.busFactorStatus.busFactor + delta <= 0
        ? "lost"
        : oldDataRootNode.busFactorStatus.busFactor + delta < 2
        ? "danger"
        : "ok";

    if (
      oldDataRootNode.children &&
      newDataRootNodeCopy.children &&
      newDataRootNodeCopy.children.length === oldDataRootNode.children.length
    ) {
      for (
        let oldCount = 0;
        oldCount < oldDataRootNode.children.length;
        oldCount++
      ) {
        let newCount = 0;
        let oldPath = oldDataRootNode.children[oldCount].path;

        while (
          oldPath !== newDataRootNodeCopy.children[newCount].path &&
          newCount < newDataRootNodeCopy.children.length
        ) {
          newCount++;
        }

        if (
          !newDataRootNodeCopy.busFactorStatus.old &&
          !newDataRootNodeCopy.busFactorStatus.ignored
        )
          newDataRootNodeCopy.children[oldCount] = getBusFactorDeltas(
            oldDataRootNode.children[oldCount],
            newDataRootNodeCopy.children[oldCount]
          );
      }
    }
  }
  return newDataRootNodeCopy;
}

function getDifference(a1, a2) {
  var a2Set = new Set(a2);
  return a1.filter(function (x) {
    return !a2Set.has(x);
  });
}

// Definition of the slice and its reducer function
const treemapSlice = createSlice({
  name: "treemap",
  initialState: defaultState,
  reducers: {
    // not as useful anymore, URL takes precedence, or at least, it should
    returnMainTreemapHome: (state) => {
      let newData = getDataWithPathQuery(fullData, "$", []);
      state.mainTreemap.currentVisualizationData = newData;
      state.mainTreemap.currentVisualizationPath = newData.path;
      state.mainTreemap.currentStatsData = newData;
      state.mainTreemap.currentStatsPath = newData.path;
    },
    returnMiniTreemapHome: (state) => {
      let newData = getDataWithPathQuery(
        fullData,
        "$",
        state.simulation.removedAuthors
      );
      state.simulation.miniTreemap.visualizationData = newData;
      state.simulation.miniTreemap.visualizationPath = newData.path;
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
        let newData = getDataWithPathQuery(fullData, pathQuery, []);
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
        let newData = getDataWithPathQuery(fullData, pathQuery, []);
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
          let newData = getDataWithPathQuery(fullData, pathQuery, []);
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
      if (action.payload) {
        const nextPath = `${action.payload.path}`;
        const pathQuery =
          nextPath === "." ? "$" : `$..[?(@.path=='${nextPath}')]`;
        let newData = getDataWithPathQuery(
          initialMiniTreeMapData,
          pathQuery,
          state.simulation.removedAuthors
        );
        let oldData = jp.query(initialMiniTreeMapData, pathQuery);
        oldData = oldData[0];
        let result = getBusFactorDeltas(oldData, newData);
        state.simulation.lastUsedRemovedAuthorsList =
          state.simulation.removedAuthors;
        console.log(
          "scopeMiniTreemapIn",
          newData,
          pathQuery,
          state.simulation.removedAuthors,
          result
        );

        if (newData && newData.children) {
          state.simulation.miniTreemap.visualizationData = result;
          state.simulation.miniTreemap.visualizationPath = nextPath;
        }
      }
    },
    scopeMiniTreemapOut: (state, action) => {
      const nextPath = action.payload.path;

      // const pathQuery = `$..[?(@.path==="${nextPath}")]`;
      const pathQuery =
        nextPath === "." ? "$" : `$..[?(@.path=='${nextPath}')]`;

      let newData = getDataWithPathQuery(
        initialMiniTreeMapData,
        pathQuery,
        state.simulation.removedAuthors
      );
      let oldData = jp.query(initialMiniTreeMapData, pathQuery);
      oldData = oldData[0];
      let result = getBusFactorDeltas(oldData, newData);
      console.log("scopeTreemapOut", newData, pathQuery);
      if (newData && newData.children) {
        state.simulation.miniTreemap.visualizationData = result;
        state.simulation.miniTreemap.visualizationPath = nextPath;
      }
    },
    addFilter: (state, action) => {
      const newFilterExps = action.payload;

      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        state.filters = [...new Set(state.filters.concat(newFilterExps))];
      }
    },
    removeFilter: (state, action) => {
      const newFilterExps = action.payload;

      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        state.filters = state.filters.filter(
          (element) => !newFilterExps.includes(element)
        );
      }
    },
    removeAllFilters: (state, action) => {
      state.filters = [];
    },
    enableSimulationMode: (state) => {
      state.isSimulationMode = true;
    },
    disableSimulationMode: (state) => {
      state.isSimulationMode = false;
    },
    addAuthorToRemovalList: (state, action) => {
      const authors = action.payload;
      state.simulation.lastUsedRemovedAuthorsList = selectRemovedAuthors;
      state.simulation.removedAuthors = [
        ...new Set(state.simulation.removedAuthors.concat(authors)),
      ];

      // let currentData = state.mainTreemap.currentVisualizationData;
      // const newData = getDummySimulationModeComparisonData(currentData);
      // state.simulation.miniTreemap.visualizationData = newData;
    },
    undoAuthorRemoval: (state, action) => {
      const authors = action.payload;
      state.simulation.removedAuthors = state.simulation.removedAuthors.filter(
        (element) => !authors.includes(element)
      );
    },
    clearAuthorRemovalList: (state) => {
      state.simulation.lastUsedRemovedAuthorsList = selectRemovedAuthors;
      state.simulation.removedAuthors = [];
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
  removeAllFilters,
  // inclusion filter methods
  // Simulation Mode Actions
  enableSimulationMode,
  disableSimulationMode,
  returnMiniTreemapHome,
  scopeMiniTreemapIn,
  scopeMiniTreemapOut,
  addAuthorToRemovalList,
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
export const selectRemovedAuthors = (state) =>
  state.treemap.simulation.removedAuthors;
export default treemapSlice.reducer;
