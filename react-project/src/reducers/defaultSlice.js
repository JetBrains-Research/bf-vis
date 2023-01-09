/** @format */

import { createSlice } from "@reduxjs/toolkit";
import { gitRepoDirData } from "../data/nikolaiData";
import * as jp from "jsonpath";

const fullData = gitRepoDirData;
const defaultSlice = createSlice({
  name: "static",
  initialState: {
    currentVisualizationData: fullData,
    currentVisualizationPath: fullData.path,
    currentStatsData: fullData,
    currentStatsPath: fullData.path,
    previousPathStack: [],
    filters: {
      include: {
        extensions: [],
        fileNames: [],
        fileNamePrefix: [],
      },
      exclude: {
        extensions: [],
        fileNames: [],
        fileNamePrefix: [],
      },
    },
  },
  reducers: {
    stats: (state, action) => {
      if (
        action.payload &&
        action.payload.path &&
        action.payload.path !== state.c
      ) {
        const newPath = `${action.payload.path}`;
        const pathQuery = `$..[?(@.path=='${newPath}')]`;
        let newData = jp.query(fullData, pathQuery);
        console.log(newData, pathQuery);
        if (newData && newData[0]) {
          newData = newData[0];
          state.currentStatsPath = newPath;
          state.currentStatsData = newData;
        }
      }
    },
    scopeIn: (state, action) => {
      const newPath = `${action.payload.path}`;

      if (newPath && state.currentVisualizationPath !== newPath) {
        const pathQuery = `$..[?(@.path=='${newPath}')]`;
        let newData = jp.query(fullData, pathQuery);
        console.log(newData, pathQuery);

        if (newData && newData[0] && newData[0].children) {
          newData = newData[0];
          state.previousPathStack.push(state.currentVisualizationPath);
          state.currentVisualizationPath = newPath;
          state.currentVisualizationData = newData;
          state.currentStatsPath = newPath;
          state.currentStatsData = newData;
        }
      }
    },
    scopeOut: (state) => {
      const newPath = state.previousPathStack.pop();
      if (newPath) {
        if (newPath === ".") {
          state.currentVisualizationData = fullData;
          state.currentVisualizationPath = fullData.path;
          state.currentStatsData = fullData;
          state.currentStatsPath = fullData.path;
        } else {
          const pathQuery = `$..[?(@.path==="${newPath}")]`;
          let newData = jp.query(fullData, pathQuery);
          console.log(newData, pathQuery);
          if (newData && newData[0] && newData[0].children) {
            newData = newData[0];
            state.currentVisualizationPath = newPath;
            state.currentVisualizationData = newData;
            state.currentStatsPath = newPath;
            state.currentStatsData = newData;
          }
        }
      }
    },
    addExtensionExcludeFilter: (state, action) => {
      const newFilter = action.payload.filters;

      if (newFilter) {
        if (newFilter.exclude) {
          const exclude = newFilter.exclude;
          if (exclude.extensions) {
            state.filters.exclude.extensions = [
              ...new Set(
                state.filters.exclude.extensions.concat(exclude.extensions)
              ),
            ];
          }
        }
      }
    },
    addFileNamePrefixExcludeFilter: (state, action) => {
      const newFilter = action.payload.filters;

      if (newFilter) {
        if (newFilter.exclude) {
          const exclude = newFilter.exclude;
          if (exclude.fileNamePrefix) {
            state.filters.exclude.fileNamePrefix = [
              ...new Set(
                state.filters.exclude.fileNamePrefix.concat(
                  exclude.fileNamePrefix
                )
              ),
            ];
          }
        }
      }
    },
    removeFileNamePrefixExcludeFilter: (state, action) => {
      const filterToBeRemoved = action.payload.filters;

      if (filterToBeRemoved) {
        if (filterToBeRemoved.exclude) {
          const excludeToBeRemoved = filterToBeRemoved.exclude;
          if (excludeToBeRemoved.fileNamePrefix) {
            state.filters.exclude.fileNamePrefix =
              state.filters.exclude.fileNamePrefix.filter(
                (element) =>
                  !excludeToBeRemoved.fileNamePrefix.includes(element)
              );
          }
        }
      }
    },
    removeExtensionExcludeFilter: (state, action) => {
      const filterToBeRemoved = action.payload.filters;

      if (filterToBeRemoved) {
        if (filterToBeRemoved.exclude) {
          const excludeToBeRemoved = filterToBeRemoved.exclude;
          if (excludeToBeRemoved.extensions) {
            state.filters.exclude.extensions =
              state.filters.exclude.extensions.filter(
                (element) => !excludeToBeRemoved.extensions.includes(element)
              );
          }
        }
      }
    },
    clearFilters: (state) => {
      state.filters = {
        include: {
          extensions: [],
          fileNames: [],
          fileNamePrefix: [],
        },
        exclude: {
          extensions: [],
          fileNames: [],
          fileNamePrefix: [],
        },
      };
    },
    reset: (state) => {
      state.currentVisualizationData = fullData;
      state.currentVisualizationPath = fullData.path;
      state.currentVisualizationData = fullData;
      state.currentVisualizationPath = fullData.path;
      state.previousPathStack = [];
      state.filters = {
        include: {
          extensions: [],
          fileNames: [],
          fileNamePrefix: [],
        },
        exclude: {
          extensions: [],
          fileNames: [],
          fileNamePrefix: [],
        },
      };
    },
  },
});

export const {
  scopeIn,
  scopeOut,
  reset,
  addExtensionExcludeFilter,
  removeExtensionExcludeFilter,
  addFileNamePrefixExcludeFilter,
  removeFileNamePrefixExcludeFilter,
  stats,
} = defaultSlice.actions;
export const selectFullData = (state) => state.default.fullData;
export const selectCurrentVisualizationData = (state) =>
  state.default.currentVisualizationData;
export const selectCurrentVisualizationPath = (state) =>
  state.default.currentVisualizationPath;
export const selectCurrentStatsData = (state) => state.default.currentStatsData;
export const selectCurrentStatsPath = (state) => state.default.currentStatsPath;
export const selectFilters = (state) => state.default.filters;
export default defaultSlice.reducer;
