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
                state.exclusion.fileNamePrefixes = state.exclusion.fileNamePrefixes.filter((element) => !fileNamePrefixesToRemove.includes(element))
            }
        },
        addExclusionFilenameFilter: (state, action) => {
            const fileNamesToAdd = action.payload;

            if (Array.isArray(fileNamesToAdd) && fileNamesToAdd.length > 0) {
                state.exclusion.fileNames = [...new Set(state.exclusion.fileNames.concat(fileNamesToAdd))]
            }
        },
        removeExclusionFilenameFilter: (state, action) => {
            const fileNamesToRemove = action.payload;

            if (Array.isArray(fileNamesToRemove) && fileNamesToRemove.length > 0) {
                state.exclusion.fileNames = state.exclusion.fileNames.filter((element) => !fileNamesToRemove.includes(element))
            }
        },
        addInclusionExtensionsFilter: (state, action) => {
            const newExtensions = action.payload;

            if (Array.isArray(newExtensions) && newExtensions.length > 0) {
                state.inclusion.extensions = [...new Set(state.inclusion.extensions.concat(newExtensions))]
            }
        },
        removeInclusionExtensionsFilter: (state, action) => {
            const extensionsToRemove = action.payload;

            if (Array.isArray(extensionsToRemove) && extensionsToRemove.length > 0) {
                state.inclusion.extensions = state.inclusion.extensions.filter((element) => !extensionsToRemove.includes(element))
            }
        },
        addInclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToAdd = action.payload;

            if (Array.isArray(fileNamePrefixesToAdd) && fileNamePrefixesToAdd.length > 0) {
                state.inclusion.fileNamePrefixes = [...new Set(state.inclusion.fileNamePrefixes.concat(fileNamePrefixesToAdd))]
            }
        },
        removeInclusionFilenamePrefixesFilter: (state, action) => {
            const fileNamePrefixesToRemove = action.payload;

            if (Array.isArray(fileNamePrefixesToRemove) && fileNamePrefixesToRemove.length > 0) {
                state.inclusion.fileNamePrefixes = state.inclusion.fileNamePrefixes.filter((element) => !fileNamePrefixesToRemove.includes(element))
            }
        },
        addInclusionFilenameFilter: (state, action) => {
            const fileNamesToAdd = action.payload;

            if (Array.isArray(fileNamesToAdd) && fileNamesToAdd.length > 0) {
                state.inclusion.fileNames = [...new Set(state.inclusion.fileNames.concat(fileNamesToAdd))]
            }
        },
        removeInclusionFilenameFilter: (state, action) => {
            const fileNamesToRemove = action.payload;

            if (Array.isArray(fileNamesToRemove) && fileNamesToRemove.length > 0) {
                state.inclusion.fileNames = state.inclusion.fileNames.filter((element) => !fileNamesToRemove.includes(element))
            }
        },
        
    }
});


export const
    {
        // exclusion filter methods
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
        removeInclusionFilenamePrefixesFilter
    } = filterSlice.actions;
export const selectAllFilters = (state) => state.filter;
export const selectInclusionFilters = (state) => state.filter.inclusion;
export const selectExclusionFilters = (state) => state.filter.exclusion;
export const selectExclusionExtensionFilters = (state) => state.filter.exclusion.extensions;
export const selectExclusionFileNamePrefixFilters = (state) => state.filter.exclusion.fileNamePrefixes;
export const selectExclusionFileNamesFilters = (state) => state.filter.exclusion.fileNames;
export const selectInclusionExtensionFilters = (state) => state.filter.inclusion.extensions;
export const selectInclusionFileNamePrefixFilters = (state) => state.filter.inclusion.fileNamePrefixes;
export const selectInclusionFileNamesFilters = (state) => state.filter.inclusion.fileNames;
export default filterSlice.reducer;