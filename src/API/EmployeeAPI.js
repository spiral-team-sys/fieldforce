import { Platform } from 'react-native';
import { getDeviceInfo, GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';
import { checkNetwork } from '../Core/Utility';
import { toastError } from '../Utils/configToast';

const getDataEmployeeInfo = async actionResult => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    const response = await fetch(
      `${URLDEFAULT}employee/info/data`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) {
      const _employeeInfo = result.data?.table[0] || {};
      const _masterData = result.data?.table1[0] || {};
      const _configPage = result.data?.table2[0] || {};
      await actionResult(_employeeInfo, _masterData, _configPage, null);
    } else {
      await actionResult({}, {}, {}, result.messager);
    }
  } catch (e) {
    actionResult({}, [], `Lỗi: ${e}`);
  }
};
const getDataContactInfo = async actionResult => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    const response = await fetch(
      `${URLDEFAULT}employee/info/contact`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) {
      await actionResult(result.data, null);
    } else {
      await actionResult([], result.messager);
    }
  } catch (e) {
    actionResult({}, [], `Lỗi: ${e}`);
  }
};
const validDataEmployeeInfo = async actionResult => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    const response = await fetch(
      `${URLDEFAULT}employee/info/valid`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) {
      const _employeeInfo = result.data?.table[0] || {};
      const _masterData = result.data?.table1 || [];
      await actionResult(_employeeInfo, _masterData, null);
    } else {
      await actionResult({}, [], result.messager);
    }
  } catch (e) {
    actionResult({}, {}, `Lỗi: ${e}`);
  }
};
const saveDataEmployeeInfo = async (employeeInfo, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(JSON.stringify(employeeInfo)),
    };
    const response = await fetch(
      `${URLDEFAULT}employee/info/save`,
      requestInfo,
    );
    const result = await response.json();
    await actionResult(result.status, result.messeger);
  } catch (e) {
    actionResult(500, `Lỗi: ${e}`);
  }
};
const changePassword = async (itemChange, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        oldpass: itemChange.currentPassword,
        newpass: itemChange.newPassword,
      },
    };
    const response = await fetch(
      `${URLDEFAULT}employee/changepass`,
      requestInfo,
    );
    const result = await response.json();
    await actionResult(result.statusId, result.messager);
  } catch (e) {
    actionResult(500, `Lỗi: ${e}`);
  }
};
const UserAccess = async (deviceId, actionResult) => {
  if (!checkNetwork()) return;
  const deviceInfo = await getDeviceInfo();
  const postInfo = {
    deviceId: deviceId,
    deviceInfo: JSON.stringify(deviceInfo),
    GPSInfo: null,
    platform: Platform.OS,
  };
  try {
    const token = await GetToken();
    // console.log(postInfo, "A")
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(postInfo),
    };
    const response = await fetch(
      `${URLDEFAULT}employee/deviceaccess`,
      requestInfo,
    );
    const result = await response.json();
    await actionResult(result);
  } catch (e) {
    actionResult({ statusId: 404, messager: `Lỗi: ${e}` });
  }
};
const RegistryDevice = async (deviceId, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        deviceId: deviceId,
      },
    };
    const response = await fetch(`${URLDEFAULT}employee/registry`, requestInfo);
    const result = await response.json();
    await actionResult(result);
  } catch (e) {
    actionResult(500, `Lỗi: ${e}`);
  }
};

// YEP - Spiral
const CheckInYEP = async (typeAction, itemUpload, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        typeAction: typeAction,
      },
      body: JSON.stringify(JSON.stringify(itemUpload)),
    };
    const response = await fetch(
      `${URLDEFAULT}employee/checkin/yep`,
      requestInfo,
    );
    const result = await response.json();
    //
    if (result.statusId == 200) {
      actionResult && actionResult(true, result.messager);
    } else if (result.statusId == 401) {
      actionResult && actionResult(false, result.messager);
    } else {
      toastError('Thông báo', `Lỗi dữ liệu: ${result.messager}`);
    }
  } catch (e) {
    toastError('Thông báo', `Lỗi hệ thống: ${e}`);
  }
};

const GetEmployeeManager = async () => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'employee/employeemaintant',
      requestInfo,
    );
    if (response.status === 200) {
      return await response.json();
    } else {
      return { statusId: 500, messager: 'lỗi kết nối' };
    }
  } catch (error) {
    return { statusId: 500, messager: 'lỗi kết nối' };
  }
};

export const EmployeeAPI = {
  RegistryDevice,
  UserAccess,
  getDataEmployeeInfo,
  getDataContactInfo,
  saveDataEmployeeInfo,
  validDataEmployeeInfo,
  changePassword,
  CheckInYEP,
  GetEmployeeManager,
};
