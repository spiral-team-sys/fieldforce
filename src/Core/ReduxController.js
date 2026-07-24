import { lightMode, darkMode } from '../Themes/AppColor';
import { GetFormNow } from '../Controller/AdhocController';

export const ACTION = {
  SELECT_SHOP: 'SELECT_SHOP',
  SET_SERCURITY: 'SET_LOADED_TOUCH_ID',
  SET_NOTIFY: 'COUNT_NOTIFY',
  SET_USERINFO: 'SET_USERINFO',
  SET_WORKINFO: 'SET_WORKINFO',
  SET_KPIINFO: 'SET_KPIINFO',
  SET_THEME: 'MODE',
  SET_FORMNOW: 'FORMNOW',
  SET_FORMSTATUS: 'FORMSTATUS',
  SET_PERMISSION: 'PERMISSION',
  SET_FILEINFO: 'FILEINFO',
  SET_BUSINESS_TRIPS: 'BUSINESSTRIPS',
  SET_KPI_SUMMARY: 'KPISUMMARY',
  SET_LIST_DATA_STORE: 'LIST_DATA_STORE',
  CLEAR_LIST_DATA_STORE: 'CLEAR_LIST_DATA_STORE',
  // EMPLOYEE_INFO: 'EMPLOYEE_INFO',
  REGION_DATA: 'REGION_DATA',
  // MASTER_DATA: 'MASTER_DATA',
  SEARCH_DATA: 'SEARCH_DATA',
  SELECT_DATA: 'SELECT_DATA',
  IS_EDIT: 'IS_EDIT',
  IS_LOADING: 'IS_LOADING',
  IS_START_DISPLAY: 'IS_START_DISPLAY',
  ACTIVE_CAMERA: 'ACTIVE_CAMERA',
};
const initialState = {
  appcolor: {},
  shopinfo: {},
  userinfo: {},
  countNotify: 0,
  isLoadedTouchID: false,
  workinfo: {},
  kpiinfo: {},
  formstatus: false,
  formdata: {},
  shoplist: [],
  homemenu: [],
  photoinfo: {},
  statusPermission: 0,
  tripResult: {},
  kpiSummary: [],
  listDataStore: [],
  employeeInfo: {},
  searchData: {},
  selectData: {},
  isEdit: false,
  isLoading: false,
  isStartDisplay: false,
  activeCamera: false,
};
export const AppCreateAction = {
  GetFormNow: () => async dispatch => {
    const result = await GetFormNow();
    if (result.length > 0)
      await dispatch({ type: ACTION.SET_FORMNOW, data: result[0] });
  },
  SetLoadedTouchID: boolean => async dispatch => {
    await dispatch({ type: ACTION.SET_SERCURITY, boolean });
  },
  SetNotify: notifyNum => async dispatch => {
    await dispatch({ type: ACTION.SET_NOTIFY, notifyNum });
  },
  SetUserInfo: userinfo => async dispatch => {
    await dispatch({ type: ACTION.SET_USERINFO, userinfo });
  },
  SetShopInfo: shopinfo => async dispatch => {
    await dispatch({ type: ACTION.SELECT_SHOP, shopinfo });
  },
  SetReport: workinfo => async dispatch => {
    await dispatch({ type: ACTION.SET_WORKINFO, workinfo });
  },
  SetKpiInfo: kpiinfo => async dispatch => {
    await dispatch({ type: ACTION.SET_KPIINFO, kpiinfo });
  },
  SetTheme: mode => async dispatch => {
    await dispatch({ type: ACTION.SET_THEME, mode });
  },
  SetFormStatus: status => async dispatch => {
    await dispatch({ type: ACTION.SET_FORMSTATUS, status });
  },
  SetPermission: statusPermission => async dispatch => {
    await dispatch({ type: ACTION.SET_PERMISSION, statusPermission });
  },
  SetPhotoInfo: fileinfo => async dispatch => {
    await dispatch({ type: ACTION.SET_FILEINFO, fileinfo });
  },
  SetBusinesTrips: itemTrips => async dispatch => {
    await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips });
  },
  SetKpiSummary: kpiSummary => async dispatch => {
    await dispatch({ type: ACTION.SET_KPI_SUMMARY, kpiSummary });
  },
  SetListDataStore: listDataStore => async dispatch => {
    await dispatch({ type: ACTION.SET_LIST_DATA_STORE, listDataStore });
  },
  // SET_EmployeeInfo: (info) => async (dispatch) => {
  // 	await dispatch({ type: ACTION.EMPLOYEE_INFO, info });
  // },
  SET_RegionData: data => async dispatch => {
    await dispatch({ type: ACTION.REGION_DATA, data });
  },
  // SET_MasterData: (data) => async (dispatch) => {
  // 	await dispatch({ type: ACTION.MASTER_DATA, data });
  // },
  SET_SearchData: search => async dispatch => {
    await dispatch({ type: ACTION.SEARCH_DATA, search });
  },
  SET_SelectData: select => async dispatch => {
    await dispatch({ type: ACTION.SELECT_DATA, select });
  },
  SET_IsEdit: isEdit => async dispatch => {
    await dispatch({ type: ACTION.IS_EDIT, isEdit });
  },
  SET_IsLoading: isLoading => async dispatch => {
    await dispatch({ type: ACTION.IS_LOADING, isLoading });
  },
  SET_IsStartDisplay: isStartDisplay => async dispatch => {
    await dispatch({ type: ACTION.IS_START_DISPLAY, isStartDisplay });
  },
  SET_ActiveCamera: isStartDisplay => async dispatch => {
    await dispatch({ type: ACTION.ACTIVE_CAMERA, activeCamera });
  },
};
export const reducer = (state, action) => {
  state = state || initialState;
  switch (action.type) {
    case ACTION.SET_FORMSTATUS: {
      return {
        ...state,
        formstatus: action.status,
      };
    }
    case ACTION.SET_THEME: {
      return {
        ...state,
        appcolor: action.mode === true ? darkMode : lightMode,
      };
    }
    case ACTION.SELECT_SHOP: {
      return {
        ...state,
        shopinfo: action.shopinfo,
      };
    }
    case ACTION.SET_NOTIFY: {
      return {
        ...state,
        countNotify: action.notifyNum,
      };
    }
    case ACTION.SET_USERINFO: {
      return {
        ...state,
        userinfo: action.userinfo,
      };
    }
    case ACTION.SET_SERCURITY: {
      return {
        ...state,
        isLoadedTouchID: action.boolean,
      };
    }
    case ACTION.SET_WORKINFO: {
      return {
        ...state,
        workinfo: action.workinfo,
      };
    }
    case ACTION.SET_KPIINFO: {
      return {
        ...state,
        kpiinfo: action.kpiinfo,
      };
    }
    case ACTION.SET_FORMNOW: {
      return {
        ...state,
        formdata: action.data,
        formstatus: true,
      };
    }
    case ACTION.SET_FILEINFO: {
      return {
        ...state,
        photoinfo: action.fileinfo,
      };
    }
    case ACTION.SET_PERMISSION: {
      return {
        ...state,
        statusPermission: action.statusPermission,
      };
    }
    case ACTION.SET_BUSINESS_TRIPS: {
      return {
        ...state,
        tripResult: action.itemTrips,
      };
    }
    case ACTION.SET_KPI_SUMMARY: {
      return {
        ...state,
        kpiSummary: action.kpiSummary,
      };
    }
    case ACTION.SET_LIST_DATA_STORE: {
      console.log(
        Array.isArray(action.listDataStore),
        'Array.isArray(action.listDataStoreArray.isArray(action.listDataStore',
      );
      if (Array.isArray(action.listDataStore)) {
        return {
          ...state,
          listDataStore: action.listDataStore,
        };
      } else {
        console.log('check load');
        const isItemInDataStore = state.listDataStore.some(
          listDataStore => listDataStore.shopId === action.listDataStore.shopId,
        );
        return {
          ...state,
          listDataStore: isItemInDataStore
            ? state.listDataStore.filter(
                dataStoreItem =>
                  dataStoreItem.shopId !== action.listDataStore.shopId,
              )
            : [...state.listDataStore, action.listDataStore],
        };
      }
    }
    case ACTION.CLEAR_LIST_DATA_STORE: {
      return {
        ...state,
        listDataStore: [],
      };
    }
    case ACTION.EMPLOYEE_INFO: {
      return {
        ...state,
        employeeInfo: action.info,
      };
    }
    case ACTION.REGION_DATA: {
      return {
        ...state,
        regionData: action.data,
      };
    }
    // case ACTION.MASTER_DATA: {
    // 	return {
    // 		...state,
    // 		masterData: action.data,
    // 	};
    // }
    case ACTION.SEARCH_DATA: {
      return {
        ...state,
        searchData: action.search,
      };
    }
    case ACTION.SELECT_DATA: {
      return {
        ...state,
        selectData: action.select,
      };
    }
    case ACTION.IS_EDIT: {
      return {
        ...state,
        isEdit: action.isEdit,
      };
    }
    case ACTION.IS_LOADING: {
      return {
        ...state,
        isLoading: action.isLoading,
      };
    }
    case ACTION.IS_START_DISPLAY: {
      return {
        ...state,
        isStartDisplay: action.isStartDisplay,
      };
    }
    case ACTION.ACTIVE_CAMERA: {
      return {
        ...state,
        activeCamera: action.activeCamera,
      };
    }
    default:
      return state;
  }
};
