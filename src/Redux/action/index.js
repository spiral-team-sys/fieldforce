import { GetDataFormNow } from '../../Controller/AdhocController';
import { ACTION } from '../types';

export const GetFormNow = () => async dispatch => {
  const result = await GetDataFormNow();
  if (result.length > 0)
    await dispatch({ type: ACTION.SET_FORMNOW, data: result[0] });
};

export const SetFormNow = data => ({ type: ACTION.SET_FORMNOW, payload: data });
export const SetLoadedTouchID = boolean => ({
  type: ACTION.SET_SERCURITY,
  payload: boolean,
});
export const SetNotify = notifyNum => ({
  type: ACTION.SET_NOTIFY,
  payload: notifyNum,
});
export const SetUserInfo = userinfo => ({
  type: ACTION.SET_USERINFO,
  payload: userinfo,
});
export const SetShopInfo = shopinfo => ({
  type: ACTION.SELECT_SHOP,
  payload: shopinfo,
});
export const SetReport = workinfo => ({
  type: ACTION.SET_WORKINFO,
  payload: workinfo,
});
export const SetKpiInfo = kpiinfo => ({
  type: ACTION.SET_KPIINFO,
  payload: kpiinfo,
});
export const SetTheme = mode => ({ type: ACTION.SET_THEME, payload: mode });
export const SetFormStatus = status => ({
  type: ACTION.SET_FORMSTATUS,
  payload: status,
});
export const SetPermission = statusPermission => ({
  type: ACTION.SET_PERMISSION,
  payload: statusPermission,
});
export const SetPhotoInfo = fileinfo => ({
  type: ACTION.SET_FILEINFO,
  payload: fileinfo,
});
export const SetBusinesTrips = itemTrips => ({
  type: ACTION.SET_BUSINESS_TRIPS,
  payload: itemTrips,
});
export const SetKpiSummary = kpiSummary => ({
  type: ACTION.SET_KPI_SUMMARY,
  payload: kpiSummary,
});
export const SetListDataStore = listDataStore => ({
  type: ACTION.SET_LIST_DATA_STORE,
  payload: listDataStore,
});
export const SET_EmployeeInfo = info => ({
  type: ACTION.EMPLOYEE_INFO,
  payload: info,
});
export const SET_RegionData = data => ({
  type: ACTION.REGION_DATA,
  payload: data,
});
export const SET_MasterData = data => ({
  type: ACTION.MASTER_DATA,
  payload: data,
});
export const SET_SearchData = search => ({
  type: ACTION.SEARCH_DATA,
  payload: search,
});
export const SET_SelectData = select => ({
  type: ACTION.SELECT_DATA,
  payload: select,
});
export const SET_IsEdit = isEdit => ({ type: ACTION.IS_EDIT, payload: isEdit });
export const SET_IsLoading = isLoading => ({
  type: ACTION.IS_LOADING,
  payload: isLoading,
});
export const SET_IsStartDisplay = isStartDisplay => ({
  type: ACTION.IS_START_DISPLAY,
  payload: isStartDisplay,
});
export const SET_ActiveCamera = activeCamera => ({
  type: ACTION.ACTIVE_CAMERA,
  payload: activeCamera,
});

export const setLocationInfo = info => ({
  type: ACTION.SET_LOCATION_INFO,
  payload: info,
});
export const clearLocationInfo = () => ({ type: ACTION.CLEAR_LOCATION_INFO });
export const setCameraInfo = info => ({
  type: ACTION.SET_CAMERA_INFO,
  payload: info,
});
export const setCameraReportInfo = info => ({
  type: ACTION.SET_CAMERA_REPORT_INFO,
  payload: info,
});
export const clearCameraInfo = () => ({ type: ACTION.CLEAR_CAMERA_INFO });
export const clearCameraReportInfo = () => ({
  type: ACTION.CLEAR_CAMERA_REPORT_INFO,
});

export const setCacheData = () => ({ type: ACTION.SET_CACHE_DATA });
export const clearCacheData = () => ({ type: ACTION.CLEAR_CACHE_DATA });

export const setDashboardFilter = info => ({
  type: ACTION.DASHBOARD_FILTER,
  payload: info,
});
