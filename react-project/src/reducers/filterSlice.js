import { createAction, createSlice } from "@reduxjs/toolkit";

// Action Names
const ADD_EXCLUSION_EXTENSION_FILTER = "FILTER/EXCLUSION/EXTENSION/ADD";
const ADD_EXCLUSION_FILENAME_FILTER = "FILTER/EXCLUSION/FILENAME/ADD";
const ADD_EXCLUSION_FILENAMEPREFIX_FILTER = "FILTER/EXCLUSION/FILENAMEPREFIX/ADD";
const REMOVE_EXCLUSION_EXTENSION_FILTER = "FILTER/EXCLUSION/EXTENSION/REMOVE";
const REMOVE_EXCLUSION_FILENAME_FILTER = "FILTER/EXCLUSION/FILENAME/REMOVE";
const REMOVE_EXCLUSION_FILENAMEPREFIX_FILTER = "FILTER/EXCLUSION/FILENAMEPREFIX/REMOVE";

const ADD_INCLUSION_EXTENSION_FILTER = "FILTER/INCLUSION/EXTENSION/ADD";
const ADD_INCLUSION_FILENAME_FILTER = "FILTER/INCLUSION/FILENAME/ADD";
const ADD_INCLUSION_FILENAMEPREFIX_FILTER = "FILTER/INCLUSION/FILENAMEPREFIX/ADD";
const REMOVE_INCLUSION_EXTENSION_FILTER = "FILTER/INCLUSION/EXTENSION/REMOVE";
const REMOVE_INCLUSION_FILENAME_FILTER = "FILTER/INCLUSION/FILENAME/REMOVE";
const REMOVE_INCLUSION_FILENAMEPREFIX_FILTER = "FILTER/INCLUSION/FILENAMEPREFIX/REMOVE";

const RESET_FILTERS = "RESET_FILTERS";

// Action Creator Helper functions

const payloadGenerator = (propertyName, propertyValue) => {
    return {
        payload: {
            propertyName: propertyValue
        }
    }
}

// Action Creators
const addExclusionExtensionFilter = createAction(ADD_EXCLUSION_EXTENSION_FILTER, (extensions) => payloadGenerator("extension", extensions));

const removeExclusionExtensionFilter = createAction(REMOVE_EXCLUSION_EXTENSION_FILTER, (extensions) => payloadGenerator("extension", extensions));

const addExclusionFilenamePrefixesFilter = createAction(ADD_EXCLUSION_FILENAMEPREFIX_FILTER, (fileNamePrefixes) => payloadGenerator("fileNamePrefixes", fileNamePrefixes));

const removeExclusionFilenamePrefixesFilter = createAction(REMOVE_EXCLUSION_FILENAMEPREFIX_FILTER, (fileNamePrefixes) => payloadGenerator("fileNamePrefixes", fileNamePrefixes))

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
            filter: (state, action) => {
                switch (action.type) {
                    case ADD_INCLUSION_EXTENSION_FILTER:
                        break;
                    case REMOVE_INCLUSION_EXTENSION_FILTER:
                        break;
                    case ADD_INCLUSION_FILENAME_FILTER:
                        break;
                    case REMOVE_INCLUSION_FILENAME_FILTER:
                        break;
                    case ADD_INCLUSION_FILENAMEPREFIX_FILTER:
                        break;
                    case REMOVE_INCLUSION_FILENAMEPREFIX_FILTER:
                        break;

                    case ADD_EXCLUSION_EXTENSION_FILTER: {
                        const newExtensions = action.payload.extensions;

                        if (newExtensions) {
                            state.exclusion.extensions = [...new Set(state.exclusion.extensions.concat(newExtensions))]
                        }

                        break;
                    }
                    case REMOVE_EXCLUSION_EXTENSION_FILTER: {
                        const extensionsToRemove = action.payload.extensions.toString();

                        if (extensionsToRemove) {
                            state.exclusion.extensions = state.exclusion.extensions.filter((element) => !extensionsToRemove.includes(element))
                        }
                        break;
                    }
                    case ADD_EXCLUSION_FILENAME_FILTER:
                        break;
                    case REMOVE_EXCLUSION_FILENAME_FILTER:
                        break;
                    case ADD_EXCLUSION_FILENAMEPREFIX_FILTER: {
                        
                        if ("fileNamePrefixes" in action.payload && Array.isArray(action.payload.extension)) {
                            const fileNamePrefixesToAdd = action.payload.fileNamePrefixes;
                            state.exclusion.fileNamePrefixes = [...new Set(state.exclusion.fileNamePrefixes.concat(fileNamePrefixesToAdd))]
                        }
                        break;
                    }
                    case REMOVE_EXCLUSION_FILENAMEPREFIX_FILTER: {

                        if ("fileNamePrefixes" in action.payload && Array.isArray(action.payload.extension)) {
                            const fileNamePrefixesToRemove = action.payload.fileNamePrefixes;
                            state.exclusion.fileNamePrefixes = state.exclusion.fileNamePrefixes.filter((element) => fileNamePrefixesToRemove.includes())
                        }
                        break;
                    }
                    case RESET_FILTERS:
                        state = defaultState;
                    default:
                        break;
                }
            }
        }
    }
)

export const { filter } = filterSlice.actions;
export { addExclusionExtensionFilter, removeExclusionExtensionFilter, addExclusionFilenamePrefixesFilter, removeExclusionFilenamePrefixesFilter };
export const selectAllFilters = (state) => state.filter;
export const selectInclusionFilters = (state) => state.filter.inclusion;
export const selectExclusionFilters = (state) => state.filter.exclusion;
export default filterSlice.reducer;