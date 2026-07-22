import { applyMiddleware, combineReducers, compose, createStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import * as ReduxController from './ReduxController';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(history, initialState) {
    const reducers = {
        // GAppState: ReduxController.reducer
    };
    const middleware = [
        thunk,
    ];
    const rootReducer = combineReducers({
        ...reducers,
    });
    return createStore(
        rootReducer,
        initialState,
        composeEnhancers(applyMiddleware(...middleware))
    );
}
