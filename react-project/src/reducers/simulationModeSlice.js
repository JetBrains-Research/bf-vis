import { createSlice } from "@reduxjs/toolkit";

const defaultState = {
    isSimulationMode: false,
    removedAuthors: []
}

const simulationModeSlice = createSlice({
    name: "simulationMode",
    initialState: defaultState,
    reducer: {
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

export const { enableSimulationMode, disableSimulationMode, simulateAuthorRemoval, undoAuthorRemoval } = simulationModeSlice.actions;
export const isSimulationMode = (state) => state.simulation.isSimulationMode;
export const removedAuthors = (state) => state.simulation.removedAuthors;
export default simulationModeSlice.reducer;