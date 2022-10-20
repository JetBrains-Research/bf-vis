import { createSlice } from "@reduxjs/toolkit";

const defaultState = {
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

const filterSlice = createSlice(
    {
        name: "filter",
        initialState: defaultState,
        reducers: {
            addExclusionExtensionFilter: (state, action) => {
                const newExtensions = action.payload.extensions;

                        if (newExtensions) {
                            state.exclusion.extensions = [...new Set(state.exclusion.extensions.concat(newExtensions))]
                        }
            },
            removeExclusionExtensionFilter: (state, action) => {
                const extensionsToRemove = action.payload.extensions.toString();

                        if (extensionsToRemove) {
                            state.exclusion.extensions = state.exclusion.extensions.filter((element) => !extensionsToRemove.includes(element))
                        }
            },
            addExclusionFileNamePrefixFilter: (state, action) => {
                if ("fileNamePrefixes" in action.payload && Array.isArray(action.payload.extension)) {
                    const fileNamePrefixesToAdd = action.payload.fileNamePrefixes;
                    state.exclusion.fileNamePrefixes = [...new Set(state.exclusion.fileNamePrefixes.concat(fileNamePrefixesToAdd))]
                }
            },
            removeExclusionFileNamePrefixFilter: (state, action) => {
                if ("fileNamePrefixes" in action.payload && Array.isArray(action.payload.extension)) {
                    const fileNamePrefixesToRemove = action.payload.fileNamePrefixes;
                    state.exclusion.fileNamePrefixes = state.exclusion.fileNamePrefixes.filter((element) => fileNamePrefixesToRemove.includes())
                }
            },

        }
    }
)


export const { addExclusionExtensionFilter, removeExclusionExtensionFilter, addExclusionFilenamePrefixesFilter, removeExclusionFilenamePrefixesFilter } = filterSlice.actions;
export const selectAllFilters = (state) => state.filter;
export const selectInclusionFilters = (state) => state.filter.inclusion;
export const selectExclusionFilters = (state) => state.filter.exclusion;
export default filterSlice.reducer;