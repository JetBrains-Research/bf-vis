import { configureStore } from '@reduxjs/toolkit'
import defaultSlice from './reducers/defaultSlice'
import filterSlice from './reducers/filterSlice'
import treemapSlice from './reducers/treemapSlice'

export const store = configureStore({
    reducer: {
        // default: defaultSlice,
        treemap: treemapSlice,
        filter: filterSlice
    },
    middleware: []
})