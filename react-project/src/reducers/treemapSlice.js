/** @format */

import {createSlice} from "@reduxjs/toolkit";
import * as jp from "jsonpath";
import {calculateBusFactor} from "../utils/BusFactorUtil";

const defaultTree = {
  "name": "PlaceHolder",
  "path": ".",
  "bytes": 1,
  "busFactorStatus": {
    "busFactor": 1
  },
  "users": [
    {
      "email": "place.holder@mail.com",
      "authorship": 0.5
    },],
  "children": [
    {
      "name": "place_holder",
      "path": "/place_holder",
      "bytes": 1,
      "busFactorStatus": {
        "old": true
      }
    },]
}

function convertTreeToState(tree) {
  const initialDummyMiniTreeMapData =
    getDummySimulationModeComparisonData(tree);
  return {
    tree: tree,
    initialDummyMiniTreeMapData: initialDummyMiniTreeMapData,
    mainTreemap: {
      currentStatsData: tree,
      currentStatsPath: tree.path,
      currentVisualizationData: tree,
      currentVisualizationPath: tree.path,
      ignored: [],
      isRecalculationEnabled: false,
      previousPathStack: [],
    },
    simulation: {
      miniTreemap: {
        visualizationData: initialDummyMiniTreeMapData,
        visualizationPath: tree.path,
        previousPathStack: [],
      },
      isSimulationMode: false,
      removedAuthors: [],
    },
    filters: [],
  };
}

function getDataWithPathQuery(fullData, pathQuery) {
  let newData = jp.query(fullData, pathQuery);
  let result = calculateBusFactor(newData[0]);

  return result;
}

function getDummySimulationModeComparisonData(currentData) {
  const children = []
  if (children) {
    for (let count = 0; count < currentData.children.length; count++) {
      const childData = currentData.children[count]
      let busFactorStatus

      if (childData.busFactorStatus) {
        busFactorStatus = childData.busFactorStatus
      }

      if (count % 2 === 0) {
        if ("busFactorStatus" in childData) {
          busFactorStatus = {
            ...busFactorStatus,
            busFactorDelta: -2
          }
        }
      }

      if (count % 5 === 0) {
        if ("busFactorStatus" in childData) {
          busFactorStatus = {
            ...busFactorStatus,
            nodeStatus: "removed"
          }
        }
        busFactorStatus = {
          ...busFactorStatus,
          busFactorDelta: -count
        }
      }

      if (count % 3 === 0) {
        if ("busFactorStatus" in childData) {
          busFactorStatus = {
            ...busFactorStatus,
            nodeStatus: "added"
          }
        }
        busFactorStatus = {
          ...busFactorStatus,
          busFactorDelta: 3
        }
      }
      if ("busFactorStatus" in childData) {
        children.push({
          ...childData,
          busFactorStatus: busFactorStatus
        })
      } else {
        children.push(childData)
      }
    }
  }

  return {
    ...currentData,
    children: children
  };
}

function getDataFromCurrentData(currentData, authorsToRemove, filters) {
  let newData = currentData;
  let result = calculateBusFactor(currentData);
}

// Definition of the slice and its reducer function
const treemapSlice = createSlice({
  name: "treemap",
  initialState: convertTreeToState(defaultTree),
  reducers: {
    setNewTree: (state, action) => {
      return {...convertTreeToState(action.payload)}
    },
    // not as useful anymore, URL takes precedence, or at least, it should
    returnMainTreemapHome: (state) => {
      const fullData = state.tree
      let newData = getDataWithPathQuery(fullData, "$");
      state.mainTreemap.currentVisualizationData = newData;
      state.mainTreemap.currentVisualizationPath = newData.path;
      state.mainTreemap.currentStatsData = newData;
      state.mainTreemap.currentStatsPath = newData.path;
    },
    // click on a file node
    scopeStatsIn: (state, action) => {
      const fullData = state.tree
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
      const fullData = state.tree
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
      const fullData = state.tree
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
      // TODO: problem must be here
      const initialDummyMiniTreeMapData =
        state.initialDummyMiniTreeMapData

      const newState = {
        "simulation" : {
          "miniTreemap" : state.simulation.miniTreemap
        }
      }

      const miniTreemap = newState.simulation.miniTreemap

      if (
        action.payload &&
        action.payload.path &&
        action.payload.path !== miniTreemap.visualizationPath
      ) {
        const nextPath = `${action.payload.path}`;
        const pathQuery = `$..[?(@.path=='${nextPath}')]`;
        let newData = jp.query(initialDummyMiniTreeMapData, pathQuery);
        console.log("scopeTreemapIn", newData, pathQuery);

        if (newData && newData.children) {
          miniTreemap.previousPathStack.push(
            miniTreemap.visualizationPath
          );
          miniTreemap.visualizationData = newData;
          miniTreemap.visualizationPath = nextPath;
        }
      }

      return {
        ...state,
        ...newState
      }
    },
    scopeMiniTreemapOut: (state, action) => {
      // TODO: problem must be here
      const initialDummyMiniTreeMapData =
        state.initialDummyMiniTreeMapData
      const nextPath = state.simulation.miniTreemap.previousPathStack.pop();

      const newState = {
        "simulation" : {
          "miniTreemap" : state.simulation.miniTreemap
        }
      }

      const miniTreemap = newState.simulation.miniTreemap

      if (nextPath) {
        if (nextPath === ".") {
          miniTreemap.visualizationData =
            initialDummyMiniTreeMapData;
          miniTreemap.visualizationPath =
            initialDummyMiniTreeMapData.path;
        } else {
          const pathQuery = `$..[?(@.path==="${nextPath}")]`;
          let newData = getDataWithPathQuery(
            initialDummyMiniTreeMapData,
            pathQuery
          );
          console.log("scopeTreemapOut", newData, pathQuery);
          if (newData && newData.children) {
            miniTreemap.visualizationData = newData;
            miniTreemap.visualizationPath = nextPath;
          }
        }
      }

      return {
        ...state,
        ...newState
      }
    },
    returnMiniTreemapHome: (state, action) => {
    },
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
  setNewTree,
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
