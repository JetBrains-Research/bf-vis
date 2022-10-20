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

const filterSlice = createSlice({
    name: "filter",
    initialState: defaultState,
    reducers: {
        addExclusionExtensionsFilter: (state, action) => {
            const newExtensions = action.payload;

            if (Array.isArray(newExtensions) && newExtensions.length > 0) {
                state.exclusion.extensions = [...new Set(state.exclusion.extensions.concat(newExtensions))]
            }
        },
        removeExclusionExtensionsFilter: (state, action) => {
            const extensionsToRemove = action.payload;

            if (Array.isArray(extensionsToRemove) && extensionsToRemove.length > 0) {
                state.exclusion.extensions = state.exclusion.extensions.filter((element) => !extensionsToRemove.includes(element))
            }
        },
        addExclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToAdd = action.payload;

            if (Array.isArray(fileNamePrefixesToAdd) && fileNamePrefixesToAdd.length > 0) {
                state.exclusion.fileNamePrefixes = [...new Set(state.exclusion.fileNamePrefixes.concat(fileNamePrefixesToAdd))]
            }
        },
        removeExclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToRemove = action.payload;

            if (Array.isArray(fileNamePrefixesToRemove) && fileNamePrefixesToRemove.length > 0) {
                state.exclusion.fileNamePrefixes = state.exclusion.fileNamePrefixes.filter((element) => fileNamePrefixesToRemove.includes())
            }
        },
    }
});


export const
    {
        addExclusionExtensionsFilter,
        removeExclusionExtensionsFilter,
        addExclusionFilenamePrefixesFilter,
        removeExclusionFilenamePrefixesFilter
    } = filterSlice.actions;
export const selectAllFilters = (state) => state.filter;
export const selectInclusionFilters = (state) => state.filter.inclusion;
export const selectExclusionFilters = (state) => state.filter.exclusion;
export default filterSlice.reducer;