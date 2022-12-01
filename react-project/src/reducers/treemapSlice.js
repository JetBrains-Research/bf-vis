import { createSlice } from "@reduxjs/toolkit";
import { gitRepoDirData } from "../data/nikolaiData_recalculating";
import * as jp from 'jsonpath';
import { calculateBusFactor } from "../utils/BusFactorUtil";


const fullData = gitRepoDirData;

// Initial State for this slice
const defaultState = {
    currentVisualizationData: fullData,
    currentVisualizationPath: fullData.path,
    currentStatsData: fullData,
    currentStatsPath: fullData.path,
    previousPathStack: [],
    ignored: [],
    simulation: {
        isSimulationMode: false,
        removedAuthors: []
    },
    filters: {
        inclusion: {
            extensions: [],
            fileNames: [],
            fileNamePrefixes: []
        },
        exclusion: {
            extensions: [],
            fileNames: [],
            fileNamePrefixes: []
        }
    }
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
        },
        addExclusionExtensionsFilter: (state, action) => {
            const newExtensions = action.payload;

            if (Array.isArray(newExtensions) && newExtensions.length > 0) {
                state.filters.exclusion.extensions = [...new Set(state.filters.exclusion.extensions.concat(newExtensions))]
            }
        },
        removeExclusionExtensionsFilter: (state, action) => {
            const extensionsToRemove = action.payload;

            if (Array.isArray(extensionsToRemove) && extensionsToRemove.length > 0) {
                state.filters.exclusion.extensions = state.filters.exclusion.extensions.filter((element) => !extensionsToRemove.includes(element))
            }
        },
        addExclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToAdd = action.payload;

            if (Array.isArray(fileNamePrefixesToAdd) && fileNamePrefixesToAdd.length > 0) {
                state.filters.exclusion.fileNamePrefixes = [...new Set(state.filters.exclusion.fileNamePrefixes.concat(fileNamePrefixesToAdd))]
            }
        },
        removeExclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToRemove = action.payload;

            if (Array.isArray(fileNamePrefixesToRemove) && fileNamePrefixesToRemove.length > 0) {
                state.filters.exclusion.fileNamePrefixes = state.filters.exclusion.fileNamePrefixes.filter((element) => !fileNamePrefixesToRemove.includes(element))
            }
        },
        addExclusionFilenameFilter: (state, action) => {
            const fileNamesToAdd = action.payload;

            if (Array.isArray(fileNamesToAdd) && fileNamesToAdd.length > 0) {
                state.filters.exclusion.fileNames = [...new Set(state.filters.exclusion.fileNames.concat(fileNamesToAdd))]
            }
        },
        removeExclusionFilenameFilter: (state, action) => {
            const fileNamesToRemove = action.payload;

            if (Array.isArray(fileNamesToRemove) && fileNamesToRemove.length > 0) {
                state.filters.exclusion.fileNames = state.filters.exclusion.fileNames.filter((element) => !fileNamesToRemove.includes(element))
            }
        },
        addInclusionExtensionsFilter: (state, action) => {
            const newExtensions = action.payload;

            if (Array.isArray(newExtensions) && newExtensions.length > 0) {
                state.filters.inclusion.extensions = [...new Set(state.filters.inclusion.extensions.concat(newExtensions))]
            }
        },
        removeInclusionExtensionsFilter: (state, action) => {
            const extensionsToRemove = action.payload;

            if (Array.isArray(extensionsToRemove) && extensionsToRemove.length > 0) {
                state.filters.inclusion.extensions = state.filters.inclusion.extensions.filter((element) => !extensionsToRemove.includes(element))
            }
        },
        addInclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToAdd = action.payload;

            if (Array.isArray(fileNamePrefixesToAdd) && fileNamePrefixesToAdd.length > 0) {
                state.filters.inclusion.fileNamePrefixes = [...new Set(state.filters.inclusion.fileNamePrefixes.concat(fileNamePrefixesToAdd))]
            }
        },
        removeInclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToRemove = action.payload;

            if (Array.isArray(fileNamePrefixesToRemove) && fileNamePrefixesToRemove.length > 0) {
                state.filters.inclusion.fileNamePrefixes = state.filters.inclusion.fileNamePrefixes.filter((element) => !fileNamePrefixesToRemove.includes(element))
            }
        },
        addInclusionFilenameFilter: (state, action) => {
            const fileNamesToAdd = action.payload;

            if (Array.isArray(fileNamesToAdd) && fileNamesToAdd.length > 0) {
                state.filters.inclusion.fileNames = [...new Set(state.filters.inclusion.fileNames.concat(fileNamesToAdd))]
            }
        },
        removeInclusionFilenameFilter: (state, action) => {
            const fileNamesToRemove = action.payload;

            if (Array.isArray(fileNamesToRemove) && fileNamesToRemove.length > 0) {
                state.filters.inclusion.fileNames = state.filters.inclusion.fileNames.filter((element) => !fileNamesToRemove.includes(element))
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
            state.removedAuthors = [...new Set(state.removedAuthors.concat(authors))];
        },
        undoAuthorRemoval: (state, action) => {
            const authors = action.payload
            state.removedAuthors = state.removedAuthors.filter((element) => !authors.includes(element));
        }
    }
})

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
    undoAuthorRemoval
} = treemapSlice.actions;
//treemap data selectors
export const selectFullData = (state) => state.treemap.fullData;
export const selectCurrentVisualizationData = (state) => state.treemap.currentVisualizationData;
export const selectCurrentVisualizationPath = (state) => state.treemap.currentVisualizationPath;
export const selectCurrentStatsData = (state) => state.treemap.currentStatsData;
export const selectCurrentStatsPath = (state) => state.treemap.currentStatsPath;
//filter selectors
export const selectAllFilters = (state) => state.treemap.filters;
export const selectInclusionFilters = (state) => state.treemap.filters.inclusion;
export const selectExclusionFilters = (state) => state.treemap.filters.exclusion;
export const selectExclusionExtensionFilters = (state) => state.treemap.filters.exclusion.extensions;
export const selectExclusionFileNamePrefixFilters = (state) => state.treemap.filters.exclusion.fileNamePrefixes;
export const selectExclusionFileNamesFilters = (state) => state.treemap.filters.exclusion.fileNames;
export const selectInclusionExtensionFilters = (state) => state.treemap.filters.inclusion.extensions;
export const selectInclusionFileNamePrefixFilters = (state) => state.treemap.filters.inclusion.fileNamePrefixes;
export const selectInclusionFileNamesFilters = (state) => state.treemap.filters.inclusion.fileNames;
//simulation mode selectors
export const isSimulationMode = (state) => state.treemap.simulation.isSimulationMode;
export const removedAuthors = (state) => state.treemap.simulation.removedAuthors;
export default treemapSlice.reducer;