import { createAction, createSlice } from "@reduxjs/toolkit";
import { gitRepoDirData } from "../data/nikolaiData";
import * as jp from 'jsonpath';

const fullData = gitRepoDirData;

// Initial State for this slice
const defaultState = {
    currentVisualizationData: fullData,
    currentVisualizationPath: fullData.path,
    currentStatsData: fullData,
    currentStatsPath: fullData.path,
    previousPathStack: [],
}

// Definition of the slice and its reducer function
const treemapSlice = createSlice({
    name: "treemap",
    initialState: defaultState,
    reducers: {
        returnTreemapHome: (state) => {
            state.currentVisualizationData = fullData;
            state.currentVisualizationPath = fullData.path;
            state.currentStatsData = fullData;
            state.currentStatsPath = fullData.path;
        },
        scopeStatsIn: (state, action) => {
            if (action.payload && action.payload.path && action.payload.path !== state.currentStatsPath) {
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
        scopeTreemapIn: (state, action) => {
            if (action.payload.path && action.payload.path !== state.currentVisualizationPath) {
                const nextPath = `${action.payload.path}`;
                const pathQuery = `$..[?(@.path=='${nextPath}')]`;
                let newData = jp.query(fullData, pathQuery);
                console.log(newData, pathQuery);

                if (newData && newData[0] && newData[0].children) {
                    newData = newData[0];
                    state.previousPathStack.push(state.currentVisualizationPath);
                    state.currentVisualizationPath = nextPath;
                    state.currentVisualizationData = newData;
                    state.currentStatsPath = nextPath;
                    state.currentStatsData = newData;
                }
            }
        },
        scopeTreemapOut: (state) => {
            const nextPath = state.previousPathStack.pop();

            if (nextPath) {
                if (nextPath === ".") {
                    state.currentVisualizationData = fullData;
                    state.currentVisualizationPath = fullData.path;
                    state.currentStatsData = fullData;
                    state.currentStatsPath = fullData.path;
                }
                else {
                    const pathQuery = `$..[?(@.path==="${nextPath}")]`;
                    let newData = jp.query(fullData, pathQuery);
                    console.log(newData, pathQuery);
                    if (newData && newData[0] && newData[0].children) {
                        newData = newData[0];
                        state.currentVisualizationPath = nextPath;
                        state.currentVisualizationData = newData;
                        state.currentStatsPath = nextPath;
                        state.currentStatsData = newData;
                    }
                }
            }
        }
    }
})

// Exports
export const { scopeStatsIn, scopeTreemapIn, scopeTreemapOut, returnTreemapHome } = treemapSlice.actions;
export const selectFullData = (state) => state.treemap.fullData;
export const selectCurrentVisualizationData = (state) => state.treemap.currentVisualizationData;
export const selectCurrentVisualizationPath = (state) => state.treemap.currentVisualizationPath;
export const selectCurrentStatsData = (state) => state.treemap.currentStatsData;
export const selectCurrentStatsPath = (state) => state.treemap.currentStatsPath;
export default treemapSlice.reducer;