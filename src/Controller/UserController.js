import { checkNetwork, alertError, alertWarning, TODAY } from '../Core/Utility';
import {
  URLLogin,
  URLLogout,
  URL_DOWNLOAD_MESSENGER,
  URLDEFAULT,
} from '../Core/URLs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateDb, QueryStringSql, Insert } from '../Core/SqliteDbContext';
import {
  GetAsyncStorage,
  GetToken,
  defaultSetting,
  TOKEN_KEY,
  GetEmployeeInfo,
  ToastError,
} from '../Core/Helper';
import {
  getIdMaxMessenger,
  getManagerNotifi,
} from '../Controller/WorkController';
import { menulist, messenger, taskList, taskListHistory } from '../Core/Table';
import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { SERCURITY } from '../Control/LocalSignIn';
import { useDispatch } from 'react-redux';
import { SetUserInfo } from '../Redux/action';

export const onLogin = async (dataLogin, actionResult, errorResult) => {
  try {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      Alert.alert(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataLogin),
    };
    const response = await fetch(URLLogin, requestInfo);
    const result = await response.json();
    // Login success
    if (result.employeeId !== undefined) {
      actionResult(result);
    } else {
      ToastError(result.messeger, 'Thông báo', 'top');
      errorResult(result.messeger);
    }
  } catch (error) {
    alertError('' + error);
    errorResult(error);
  }
};
export const onLogout = async (deviceId, actionResult) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return false;
  }
  try {
    const employeeInfo = await GetEmployeeInfo();
    const token = await GetToken();
    const response = await fetch(URLLogout, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        DeviceId: deviceId,
        userId: employeeInfo.employeeId,
        accountId: employeeInfo.accountId,
      },
    });
    const result = await response.json();
    actionResult && actionResult(result);
    return result;
  } catch (e) {}
};
export function Logout(dispatch) {
  Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất tài khoản này không?', [
    { text: 'Không', onPress: () => null },
    {
      text: 'Có',
      onPress: async () => {
        let deviceId = await DeviceInfo.getUniqueId();
        await onLogout(deviceId).then(async result => {
          if (result.statusId === 200) {
            dispatch(SetUserInfo({}));
            await RemoveUser();
          } else {
            alertError(
              'Lỗi đăng xuất khỏi hệ thống, vui lòng kiểm tra lại mạng',
            );
          }
        });
      },
    },
  ]);
}
export const onSignOut = async dispatch => {
  let deviceId = await DeviceInfo.getUniqueId();
  await onLogout(deviceId).then(async result => {
    if (result.statusId === 200) {
      // dispatch(AppCreateAction.SetUserInfo({}))
      await RemoveUser();
    } else {
      alertError('Lỗi đăng xuất khỏi hệ thống, vui lòng kiểm tra lại mạng');
    }
  });
};
export const SendEmailPass = async (username, email) => {
  const response = await fetch(URLDEFAULT + 'users/resetpass', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      username: username,
      email: email,
    },
  });
  return await response.json();
};
//
export const saveTokenUser = async info => {
  const employee = { ...info, token: null };
  await CreateDb(info.employeeId);
  await AsyncStorage.setItem(TOKEN_KEY, info.token);
  await AsyncStorage.setItem('EmployeeId', info.employeeId.toString());
  await AsyncStorage.setItem('Employee', JSON.stringify(employee));

  const json = await AsyncStorage.getItem('SETTINGS');
  (await json) === null &&
    (await AsyncStorage.setItem('SETTINGS', JSON.stringify(defaultSetting)));
  // await GAppController.SetUserInfo(info);
};
export const saveTokenUserToGapp = async (
  info,
  GAppController,
  isSercurity,
) => {
  const employee = { ...info, token: null };
  await CreateDb(info.employeeId);
  await AsyncStorage.setItem(TOKEN_KEY, info.token);
  await AsyncStorage.setItem('EmployeeId', info.employeeId.toString());
  await AsyncStorage.setItem('Employee', JSON.stringify(employee));
  isSercurity !== undefined &&
    (await AsyncStorage.setItem(SERCURITY.LOCALSECUIRY, isSercurity));
  await GAppController.SetUserInfo(info);

  const json = await AsyncStorage.getItem('SETTINGS');
  (await json) === null &&
    (await AsyncStorage.setItem('SETTINGS', JSON.stringify(defaultSetting)));
};
export const saveInfomationUser = async (info, dispatch, isSercurity) => {
  const employee = { ...info, token: null };
  await CreateDb(info.employeeId);
  await AsyncStorage.setItem(TOKEN_KEY, info.token);
  await AsyncStorage.setItem('EmployeeId', info.employeeId.toString());
  await AsyncStorage.setItem('Employee', JSON.stringify(employee));
  isSercurity !== undefined &&
    (await AsyncStorage.setItem(SERCURITY.LOCALSECUIRY, isSercurity));
  await dispatch(SetUserInfo(employee));
  //
  const json = await AsyncStorage.getItem('SETTINGS');
  (await json) === null &&
    (await AsyncStorage.setItem('SETTINGS', JSON.stringify(defaultSetting)));
};
export const RemoveUser = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem('EmployeeId');
  await AsyncStorage.removeItem('Employee');
  await AsyncStorage.clear();
};
export const getListMenuHome = async () => {
  let lstData = [];
  await GetAsyncStorage('Employee').then(value => {
    lstData = JSON.parse(value).menuItem || [];
    lstData?.sort(function (a, b) {
      return a.OrderBy - b.OrderBy;
    });
  });
  return lstData;
};
export const SetRequestReportAction = async data => {
  const sql = `UPDATE ${taskList.tableName} 
        SET fistTask=1,
            taskDone=0,
            taskAlter='Chưa hoàn thành'
        WHERE shopId=${data.shopId} AND reportId=${data.reportId}`;
  await QueryStringSql(sql);
};
export const GetNotificationList = async actionResult => {
  let jsonMessage = [];
  // const IdMax = await MaxIdNotify();
  var IdMax = 0;
  let lstMax = await getIdMaxMessenger();
  if (lstMax !== undefined) {
    if (Array.isArray(lstMax) && lstMax.length > 0) {
      if (lstMax[0].max !== null) {
        IdMax = lstMax[0].max;
      }
    }
  }
  try {
    let token = await GetToken();
    await fetch(URL_DOWNLOAD_MESSENGER, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        LastId: IdMax,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        jsonMessage = responseJson;
      });
  } catch (error) {
    console.log(error);
  }
  const dataNotify = await getManagerNotifi();
  let notifyNew = [];
  for (let i = 0; i < jsonMessage.length; i++) {
    const item = jsonMessage[i];
    const exists = dataNotify.some(it => it.id === item.id);
    if (!exists) {
      notifyNew.push(item);
    }
  }
  await InsertMessenger(notifyNew);
  actionResult();
};
export const InsertMessenger = async lstMessage => {
  await Insert(messenger, lstMessage);
};
export const GetMenu = async (byShop = 0) => {
  const sql = `SELECT m.*, t.taskDone, t.taskAlter, t.fistTask FROM ${menulist.tableName} m
    LEFT JOIN ${taskList.tableName} t ON t.reportId=m.id
    WHERE m.byShop=${byShop} ORDER BY m.SortList`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export const GetMenuKPI = async (byShop = 0, shopinfo, workinfo) => {
  const workDate = parseInt(workinfo?.workDate || 0);
  const taskTable = workDate && workDate !== TODAY ? taskListHistory : taskList;
  const taskDateCondition =
    taskTable.tableName === taskListHistory.tableName
      ? ` AND t.workDate=${workDate}`
      : '';
  const sql = `SELECT a.*,a.id as kpiId,menuNameVN as name,tableName as refName,pageName as refCode,t.taskDone,t.taskAlter,t.fistTask 
    FROM ${menulist.tableName} a 
    LEFT JOIN ${taskTable.tableName} t ON t.shopId=${shopinfo.shopId} AND t.reportId=a.id${taskDateCondition}
    WHERE byShop=${byShop}
    ORDER BY sortList`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
