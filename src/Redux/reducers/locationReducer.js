import { ACTION } from "../types";

const initialState = {
    locationInfo: {},
};

const locationReducer = (state = initialState, action) => {
    switch (action.type) {
        case ACTION.SET_LOCATION_INFO:
            return {
                ...state,
                locationInfo: action.payload,
            };
        case ACTION.CLEAR_LOCATION_INFO:
            return {
                ...state,
                locationInfo: {},
            };
        default:
            return state;
    }
};

export default locationReducer;
