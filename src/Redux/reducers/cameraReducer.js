import { ACTION } from "../types";

const initialState = {
    cameraInfo: {},
    cameraReportInfo: {}
};

const cameraReducer = (state = initialState, action) => {
    switch (action.type) {
        case ACTION.SET_CAMERA_INFO:
            return {
                ...state,
                cameraInfo: action.payload,
            };
        case ACTION.CLEAR_CAMERA_INFO:
            return {
                ...state,
                cameraInfo: {},
            };
        case ACTION.SET_CAMERA_REPORT_INFO:
            return {
                ...state,
                cameraReportInfo: action.payload,
            };
        case ACTION.CLEAR_CAMERA_REPORT_INFO:
            return {
                ...state,
                cameraReportInfo: {},
            };
        default:
            return state;
    }
};

export default cameraReducer;
