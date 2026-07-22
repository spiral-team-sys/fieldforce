import { combineReducers } from '@reduxjs/toolkit';
import appReducer from './appReducer';
import locationReducer from './locationReducer';
import cameraReducer from './cameraReducer';
import cacheReducer from './cacheReducer';
import dashboardReducer from './dashboardReducer';

const rootReducer = combineReducers({
    GAppState: appReducer,
    location: locationReducer,
    camera: cameraReducer,
    cache: cacheReducer,
    dashboard: dashboardReducer
});

export default rootReducer;
