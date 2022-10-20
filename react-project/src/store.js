import { configureStore } from '@reduxjs/toolkit'
import filterSlice from './reducers/filterSlice'
import treemapSlice from './reducers/treemapSlice'

export const store = configureStore({
    reducer: {
        treemap: treemapSlice,
        filter: filterSlice
    },
    middleware: []
})