import { configureStore } from '@reduxjs/toolkit'
import filterSlice from './reducers/filterSlice'
import treemapSlice from './reducers/treemapSlice'
import simulationModeSlice from './reducers/simulationModeSlice'

export const store = configureStore({
    reducer: {
        treemap: treemapSlice,
        filter: filterSlice,
        simulation:  simulationModeSlice
    },
    middleware: []
})