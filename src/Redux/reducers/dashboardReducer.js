import { ACTION } from '../types';

const initialState = {
  dashboardFilter: {},
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION.DASHBOARD_FILTER:
      return {
        ...state,
        dashboardFilter: action.payload,
      };
    default:
      return state;
  }
};

export default dashboardReducer;
