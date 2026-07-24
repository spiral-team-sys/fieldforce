import { ACTION } from '../types';

const initialState = {
  cacheData: [],
};

const cacheReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION.SET_CACHE_DATA:
      return {
        ...state,
        cacheData: action.payload,
      };
    case ACTION.CLEAR_CACHE_DATA:
      return {
        ...state,
        cacheData: [],
      };
    default:
      return state;
  }
};

export default cacheReducer;
