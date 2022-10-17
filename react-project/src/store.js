import { configureStore } from '@reduxjs/toolkit'
import defaultSlice from './reducers/defaultSlice'

export const store = configureStore({
    reducer: {
        default: defaultSlice
    }
})