import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  session: null,
  bands: [],
  selectedBandKey: null,
};

const bandSlice = createSlice({
  name: 'band',
  initialState,
  reducers: {
    setBandSession: (state, action) => {
      state.session = action.payload || null;
    },
    clearBandSessionState: state => {
      state.session = null;
      state.bands = [];
      state.selectedBandKey = null;
    },
    setBandList: (state, action) => {
      state.bands = Array.isArray(action.payload) ? action.payload : [];
      if (!state.selectedBandKey && state.bands.length > 0) {
        state.selectedBandKey = state.bands[0].bandKey;
      }
    },
    setSelectedBandKey: (state, action) => {
      state.selectedBandKey = action.payload || null;
    },
  },
});

export const {
  setBandSession,
  clearBandSessionState,
  setBandList,
  setSelectedBandKey,
} = bandSlice.actions;
export default bandSlice.reducer;
