import {createSlice} from "@reduxjs/toolkit";
import {gitRepoDirData} from "../data/nikolaiData_recalculating";
import * as jp from 'jsonpath';
import {calculateBusFactor} from "../utils/BusFactorUtil";


const fullData = gitRepoDirData;

// Initial State for this slice
const defaultState = {
    currentVisualizationData: fullData,
    currentVisualizationPath: fullData.path,
    currentStatsData: fullData,
    currentStatsPath: fullData.path,
    previousPathStack: [],
    ignored: []
}

function getData(fullData, pathQuery) {
    let newData = jp.query(fullData, pathQuery);
    let result = calculateBusFactor(newData[0]);
    
    return result;
}

// Definition of the slice and its reducer function
const treemapSlice = createSlice({
    name: "treemap",
    initialState: defaultState,
    reducers: {
        // not as useful anymore, URL takes precedence, or at least, it should
        returnTreemapHome: (state) => {
            let newData = getData(fullData, '$')
            state.currentVisualizationData = newData;
            state.currentVisualizationPath = newData.path;
            state.currentStatsData = newData;
            state.currentStatsPath = newData.path;
        },
        // click on a file node
        scopeStatsIn: (state, action) => {
            if (action.payload && action.payload.path && action.payload.path !== state.currentStatsPath) {
                const newPath = `${action.payload.path}`;
                const pathQuery = `$..[?(@.path=='${newPath}')]`;
                let newData = getData(fullData, pathQuery);
                console.log("scopeStatsIn", newData, pathQuery);
                if (newData) {
                    state.currentStatsPath = newPath;
                    state.currentStatsData = newData;
                } else {
                    console.log("scopeStatsIn", "not changed")
                }
            }
        },
        // click on a folder node
        scopeTreemapIn: (state, action) => {
            if (action.payload.path && action.payload.path !== state.currentVisualizationPath) {
                const nextPath = `${action.payload.path}`;
                const pathQuery = `$..[?(@.path=='${nextPath}')]`;
                let newData = getData(fullData, pathQuery);
                console.log("scopeTreemapIn", newData, pathQuery);

                if (newData && newData.children) {
                    state.previousPathStack.push(state.currentVisualizationPath);
                    state.currentVisualizationPath = nextPath;
                    state.currentVisualizationData = newData;
                    state.currentStatsPath = nextPath;
                    state.currentStatsData = newData;
                }
            }
        },
        // click the back button
        scopeTreemapOut: (state) => {
            const nextPath = state.previousPathStack.pop();

            if (nextPath) {
                if (nextPath === ".") {
                    state.currentVisualizationData = fullData;
                    state.currentVisualizationPath = fullData.path;
                    state.currentStatsData = fullData;
                    state.currentStatsPath = fullData.path;
                } else {
                    const pathQuery = `$..[?(@.path==="${nextPath}")]`;
                    let newData = getData(fullData, pathQuery);
                    console.log("scopeTreemapOut", newData, pathQuery);
                    if (newData && newData.children) {
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
export const {scopeStatsIn, scopeTreemapIn, scopeTreemapOut, returnTreemapHome} = treemapSlice.actions;
export const selectFullData = (state) => state.treemap.fullData;
export const selectCurrentVisualizationData = (state) => state.treemap.currentVisualizationData;
export const selectCurrentVisualizationPath = (state) => state.treemap.currentVisualizationPath;
export const selectCurrentStatsData = (state) => state.treemap.currentStatsData;
export const selectCurrentStatsPath = (state) => state.treemap.currentStatsPath;
export default treemapSlice.reducer;