/** @format */

import {createSlice} from "@reduxjs/toolkit";
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
  // const initializedTreeMapData =
  //   initializeBusFactorDeltaProperties(tree);
  return {
    tree: tree,
    mainTreemap: {
      currentStatsPath: tree.path,
      currentVisualizationPath: tree.path,
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
        visualizationData: initializeBusFactorDeltaProperties(tree),
        visualizationPath: tree.path,
      },
      removedAuthors: [],
    },
    filters: [],
  };
}


function goThrough(state, path) {
  if (path === ".") return state

  const parts = path.split('/')
  let node = state
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (i === 0 && part === "") continue
    node = node.children.filter((it) => it.name === part)[0]
  }
  return node
}

function getDataRecalculculated(fullData, pathQuery, developersToRemove) {
  let newData = goThrough(fullData, pathQuery);
  let result = calculateBusFactor(newData, developersToRemove);
  return result;
}

export function initializeBusFactorDeltaProperties(node) {
  if (node == null) throw new Error("Empty data file");

  if (node.children) {
    return {
      ...node,
      children: node.children.map((it) => {
        const result =
          Object.fromEntries(Object.entries(it).filter(e => e[0] !== 'children'))
        if (!result.busFactorStatus) {
          result["busFactorStatus"] = {}
        }
        return result
      })
    }
  }

  return {
    ...node,
    ...(!node.busFactorStatus) && {busFactorStatus: {}},
  }
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
  let newDataRootNodeCopy = {...newDataRootNode};
  newDataRootNodeCopy.busFactorStatus = {
    ...newDataRootNodeCopy.busFactorStatus,
  };
  if (newDataRootNodeCopy.children)
    newDataRootNodeCopy.children = [...newDataRootNodeCopy.children];

  if (oldDataRootNode === null) {
    throw new Error("Old data is null!");
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
  initialState: convertTreeToState(defaultTree),
  reducers: {
    setNewTree: (state, action) => {
      return {...convertTreeToState(action.payload)}
    },
    // not as useful anymore, URL takes precedence, or at least, it should
    returnMainTreemapHome: (state) => {
      const path = state.tree.path
      return {
        ...state,
        mainTreemap: {
          ...state.mainTreemap,
          currentVisualizationPath: path,
          currentStatsPath: path
        }
      }
    },
    returnMiniTreemapHome: (state) => {
      let newData = getDataRecalculculated(
        state.tree,
        ".",
        state.simulation.removedAuthors
      );

      return {
        ...state,
        simulation: {
          ...state.simulation,
          miniTreemap: {
            ...state.simulation.miniTreemap,
            visualizationData: newData,
            visualizationPath: newData.path
          }
        }
      }
    },
    // click on a file node
    scopeStatsIn: (state, action) => {
      if (
        action.payload &&
        action.payload.path &&
        action.payload.path !== state.mainTreemap.currentStatsPath
      ) {
        const newPath = `${action.payload.path}`;
        // TODO: delete?
        let newData = goThrough(state.tree, newPath);
        console.log("scopeStatsIn", newData, newPath);
        if (newData) {
          return {
            ...state,
            mainTreemap: {
              ...state.mainTreemap,
              currentStatsPath: newPath
            }
          }
        }
        console.log("scopeStatsIn", "not changed");
        return state
      }
    },
    // click on a folder node
    scopeMainTreemapIn: (state, action) => {
      if (
        action.payload.path &&
        action.payload.path !== state.mainTreemap.currentVisualizationPath
      ) {
        const nextPath = `${action.payload.path}`;
        let newData = goThrough(state.tree, nextPath);
        console.log("scopeTreemapIn", newData, nextPath);

        if (newData && newData.children) {
          const prevStack = Array.from(state.mainTreemap.previousPathStack)
          prevStack.push(
            state.mainTreemap.currentVisualizationPath
          );
          return {
            ...state,
            mainTreemap: {
              ...state.mainTreemap,
              previousPathStack: prevStack,
              currentVisualizationPath: nextPath,
              currentStatsPath: nextPath
            }
          }
        }
        return state
      }
    },
    // click the back button
    scopeMainTreemapOut: (state) => {
      const newStack = Array.from(state.mainTreemap.previousPathStack)
      const nextPath = newStack.pop();
      const fullData = state.tree

      if (nextPath) {
        let newData = goThrough(fullData, nextPath);
        console.log("scopeTreemapOut", newData, nextPath);
        return {
          ...state,
          mainTreemap: {
            ...state.mainTreemap,
            previousPathStack: newStack,
            currentVisualizationPath: nextPath,
            currentStatsPath: nextPath
          }
        }
      }
    },
    scopeMiniTreemapIn: (state, action) => {
      if (action.payload) {
        const nextPath = `${action.payload.path}`;
        let newData = getDataRecalculculated(
          state.tree,
          nextPath,
          state.simulation.removedAuthors
        );
        let oldData = goThrough(state.tree, nextPath);
        let result = getBusFactorDeltas(oldData, newData);
        console.log(
          "scopeMiniTreemapIn",
          newData,
          nextPath,
          state.simulation.removedAuthors,
          result
        );

        if (newData && newData.children) {
          return {
            ...state,
            simulation: {
              ...state.simulation,
              lastUsedRemovedAuthorsList: state.simulation.removedAuthors,
              miniTreemap: {
                ...state.simulation.miniTreemap,
                visualizationData: result,
                visualizationPath: nextPath
              }
            }
          }
        }
        return {
          ...state,
          simulation: {
            ...state.simulation,
            lastUsedRemovedAuthorsList: state.simulation.removedAuthors
          }
        }
      }
    },
    scopeMiniTreemapOut: (state, action) => {
      const nextPath = action.payload.path;
      let newData = getDataRecalculculated(
        state.tree,
        nextPath,
        state.simulation.removedAuthors
      );
      let oldData = goThrough(state.tree, nextPath);
      let result = getBusFactorDeltas(oldData, newData);
      console.log("scopeTreemapOut", newData, nextPath);
      if (newData && newData.children) {
        return {
          ...state,
          simulation: {
            ...state.simulation,
            miniTreemap: {
              ...state.simulation.miniTreemap,
              visualizationData: result,
              visualizationPath: nextPath
            }
          }
        }
      }
    },
    addFilter: (state, action) => {
      const newFilterExps = action.payload;
      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        return {
          ...state,
          filters: [...new Set(state.filters.concat(newFilterExps))]
        }
      }
    },
    removeFilter: (state, action) => {
      const newFilterExps = action.payload;
      if (Array.isArray(newFilterExps) && newFilterExps.length > 0) {
        return {
          ...state,
          filters: state.filters.filter(
            (element) => !newFilterExps.includes(element)
          )
        }
      }
    },
    removeAllFilters: (state, action) => {
      return {
        ...state,
        filters: []
      }
    },
    enableSimulationMode: (state) => {
      return {
        ...state,
        isSimulationMode: true
      }
    },
    disableSimulationMode: (state) => {
      return {
        ...state,
        isSimulationMode: false
      }
    },
    addAuthorToRemovalList: (state, action) => {
      const authors = action.payload;
      const removedAuthors = state.simulation.removedAuthors
      return {
        ...state,
        simulation: {
          ...state.simulation,
          lastUsedRemovedAuthorsList: removedAuthors,
          removedAuthors: [
            ...new Set(state.simulation.removedAuthors.concat(authors)),
          ]
        }
      }
    },
    undoAuthorRemoval: (state, action) => {
      const authors = action.payload;
      return {
        ...state,
        simulation: {
          ...state.simulation,
          removedAuthors: state.simulation.removedAuthors.filter(
            (element) => !authors.includes(element)
          )
        }
      }
    },
    clearAuthorRemovalList: (state) => {
      const removedAuthors = state.simulation.removedAuthors
      return {
        ...state,
        simulation: {
          ...state.simulation,
          lastUsedRemovedAuthorsList: removedAuthors,
          removedAuthors: []
        }
      }
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
  goThrough(state.treemap.tree, state.treemap.mainTreemap.currentVisualizationPath);
export const selectCurrentVisualizationPath = (state) =>
  state.treemap.mainTreemap.currentVisualizationPath;
export const selectCurrentStatsData = (state) =>
  goThrough(state.treemap.tree, state.treemap.mainTreemap.currentStatsPath);

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
