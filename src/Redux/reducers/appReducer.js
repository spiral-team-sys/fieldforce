import { darkMode, lightMode } from '../../Themes/AppColor';
import { ACTION } from '../types';

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

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION.SET_FORMSTATUS:
      return {
        ...state,
        formstatus: action.payload,
      };
    case ACTION.SET_THEME:
      return {
        ...state,
        appcolor: action.payload ? darkMode : lightMode,
      };
    case ACTION.SELECT_SHOP:
      return {
        ...state,
        shopinfo: action.payload,
      };
    case ACTION.SET_NOTIFY:
      return {
        ...state,
        countNotify: action.payload,
      };
    case ACTION.SET_USERINFO:
      return {
        ...state,
        userinfo: action.payload,
      };
    case ACTION.SET_SERCURITY:
      return {
        ...state,
        isLoadedTouchID: action.payload,
      };
    case ACTION.SET_WORKINFO:
      return {
        ...state,
        workinfo: action.payload,
      };
    case ACTION.SET_KPIINFO:
      return {
        ...state,
        kpiinfo: action.payload,
      };
    case ACTION.SET_FORMNOW:
      return {
        ...state,
        formdata: action.payload,
        formstatus: true,
      };
    case ACTION.SET_FILEINFO:
      return {
        ...state,
        photoinfo: action.payload,
      };
    case ACTION.SET_PERMISSION:
      return {
        ...state,
        statusPermission: action.payload,
      };
    case ACTION.SET_BUSINESS_TRIPS:
      return {
        ...state,
        tripResult: action.payload,
      };
    case ACTION.SET_KPI_SUMMARY:
      return {
        ...state,
        kpiSummary: action.payload,
      };
    case ACTION.SET_LIST_DATA_STORE:
      if (Array.isArray(action.payload)) {
        return {
          ...state,
          listDataStore: action.payload,
        };
      } else {
        const isItemInDataStore = state.listDataStore.some(
          item => item.shopId === action.payload.shopId,
        );
        return {
          ...state,
          listDataStore: isItemInDataStore
            ? state.listDataStore.filter(
                item => item.shopId !== action.payload.shopId,
              )
            : [...state.listDataStore, action.payload],
        };
      }
    case ACTION.EMPLOYEE_INFO:
      return {
        ...state,
        employeeInfo: action.payload,
      };
    case ACTION.REGION_DATA:
      return {
        ...state,
        regionData: action.payload,
      };
    case ACTION.MASTER_DATA:
      return {
        ...state,
        masterData: action.payload,
      };
    case ACTION.SEARCH_DATA:
      return {
        ...state,
        searchData: action.payload,
      };
    case ACTION.SELECT_DATA:
      return {
        ...state,
        selectData: action.payload,
      };
    case ACTION.IS_EDIT:
      return {
        ...state,
        isEdit: action.payload,
      };
    case ACTION.IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ACTION.IS_START_DISPLAY:
      return {
        ...state,
        isStartDisplay: action.payload,
      };
    case ACTION.ACTIVE_CAMERA:
      return {
        ...state,
        activeCamera: action.payload,
      };
    default:
      return state;
  }
};
export default appReducer;
