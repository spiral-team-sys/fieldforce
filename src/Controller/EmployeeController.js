import { EmployeeAPI } from '../API/EmployeeAPI';
import { Token, GetToken, MessageInfo } from '../Core/Helper';
import { QueryStringSql } from '../Core/SqliteDbContext';
import { masterList } from '../Core/Table';
import { photos } from '../Core/TableLocal';
import { URLDEFAULT, URL_CHANGEPASS, URL_EMPLOYEEINFO } from '../Core/URLs';
import UploadController from './UploadController';

const SaveProfileEmployee = async data => {
  try {
    const token = await Token();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'employee/profileupdate',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) return result.data;
    return result.messager;
  } catch (err) {
    return err;
  }
};

export const CheckProfileEmployee = async () => {
  try {
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
        URLDEFAULT + 'employee/checkprofile',
        requestInfo,
      );
      const result = await response.json();
      if (result.statusId === 200) {
        return await result.data[0];
      } else {
        return { statusId: 500, messager: 'lỗi kết nối' };
      }
    } catch (error) {
      return { statusId: 500, messager: 'lỗi kết nối' };
    }
  } catch (err) {
    return err;
  }
};

export const GetEmployeeManager = async () => {
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
export const GetEmployeeDetails = async data => {
  try {
    const token = await GetToken();
    //console.log(data.employeeId)
    const requestInfo = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        byEmployeeId: data.employeeId,
      },
    };
    const response = await fetch(URLDEFAULT + 'employee/profile', requestInfo);
    if (response.status === 200) {
      return await response.json();
    } else {
      return { statusId: 500, messager: 'lỗi kết nối' };
    }
  } catch (error) {
    return { statusId: 500, messager: 'lỗi kết nối' };
  }
};
const GetEmployeeInfo = async () => {
  try {
    const token = await Token();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'employee/employeeById',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) return result.data;
    return result.messager;
  } catch (err) {
    return err;
  }
};
export const getProfileEmployee = async employeeId => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        id: employeeId,
      },
    };
    const response = await fetch(URL_EMPLOYEEINFO, requestInfo);
    const result = await response.json();
    return result;
  } catch (error) {
    return { statusId: 500, messager: 'lỗi kết nối' };
  }
};
const uploadProfile = async (resProfile, uploadPhoto) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(resProfile),
    };
    const response = await fetch(
      URLDEFAULT + 'employee/update/employeemaintant',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) {
      MessageInfo(result.messager);
      uploadPhoto && UploadController.PostFile();
      return true;
    } else {
      MessageInfo(result.messager);
      return false;
    }
  } catch (err) {
    MessageInfo('Lỗi dữ liệu trong máy');
    return false;
  }
};
export const ChangePass = async passinfo => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        oldpass: passinfo.oldpass,
        newpass: passinfo.newpass,
      },
    };
    // console.log(requestInfo)
    const response = await fetch(URL_CHANGEPASS, requestInfo);
    const result = await response.json();
    return result;
  } catch (error) {
    return { statusId: 500, messager: 'lỗi kết nối' };
  }
};
export const getEmployeeConfig = async actionResult => {
  const sql = `SELECT * FROM ${masterList.tableName}`;
  const { res } = await QueryStringSql(sql);
  actionResult(res);
};
export const sendMailEmployeeResign = async json => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        json: json,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'employee/sendmailresign',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (error) {
    return { statusId: 500, messager: 'lỗi kết nối' };
  }
};
const sendEmployeeResigns = async (
  resProfile,
  uploadPhoto,
  notifyNote,
  group,
  userId,
) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        notifyNote: notifyNote || '',
        group: group,
        userId: userId || 0,
      },
      body: JSON.stringify(resProfile),
    };

    const response = await fetch(
      URLDEFAULT + 'employee/update/employeeresign',
      requestInfo,
    );
    const result = await response.json();

    if (
      result.statusId === 200 ||
      (result.statusId === 500 && result.messager.includes('mail'))
    ) {
      uploadPhoto && (await UploadController.PostFile());
      return result;
    } else {
      return { statusId: 500, messager: 'lỗi kết nối' };
    }
  } catch (err) {
    MessageInfo('Lỗi dữ liệu trong máy');
    return { statusId: 500, messager: 'Lỗi dữ liệu trong máy' };
  }
};
export const getResignInfo = async typeGetResign => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        typeGetResign: typeGetResign || null,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'employee/employeeresigns',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (error) {
    return { statusId: 500, messager: 'lỗi kết nối' };
  }
};
const getPhotoResignByEmployee = async employeeCode => {
  const sql = `SELECT * FROM ${photos.tableName} WHERE guid='${employeeCode}' AND photoType='LEAVE_JOB'`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
//
const GetPhotosProfile = async (workDate, photoType, isUpdate = false) => {
  const sql = `SELECT * FROM ${photos.tableName} 
        WHERE photoDate=${workDate} 
        AND photoType='${photoType}'
       ${isUpdate ? `AND (dataUpload IS NULL OR dataUpload = 0)` : ``}
    `;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const validData_EmployeeInfo = async actionResult => {
  let strError = '';
  await EmployeeAPI.validDataEmployeeInfo(async (info, masterData) => {
    if (masterData !== null && masterData.length > 0) {
      for (let index = 0; index < masterData.length; index++) {
        const item = masterData[index];
        if (info[item.ref_Code] == null || info[item.ref_Code].length == 0)
          strError += `- ${item.itemName}\n`;
      }
      if (strError !== null && strError.length > 0) {
        actionResult(
          info.requiredData == 1 ? 500 : 200,
          `Vui lòng cập nhật đầy đủ các thông tin bắt buộc sau trong mục "Thông tin nhân viên":\n${strError}`,
        );
        return;
      } else {
        actionResult(200, null);
        return;
      }
    }
  });
};

export const getMaternityInfo = async typeGetMaternity => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        typeGetResign: typeGetMaternity || null,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'employee/employeematernity',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (error) {
    return { statusId: 500, messager: 'lỗi kết nối' };
  }
};

const sendEmployeeMaternity = async (
  resProfile,
  uploadPhoto,
  notifyNote,
  group,
  userId,
) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        notifyNote: notifyNote || '',
        group: group,
        userId: userId || 0,
      },
      body: JSON.stringify(resProfile),
    };

    const response = await fetch(
      URLDEFAULT + 'employee/update/employeematernity',
      requestInfo,
    );
    const result = await response.json();
    if (
      result.statusId === 200 ||
      (result.statusId === 500 && result.messager.includes('mail'))
    ) {
      uploadPhoto && (await UploadController.PostFile());
      return result;
    } else {
      return { statusId: 500, messager: 'lỗi kết nối' };
    }
  } catch (err) {
    MessageInfo('Lỗi dữ liệu trong máy');
    return { statusId: 500, messager: 'Lỗi dữ liệu trong máy' };
  }
};

export const Employee = {
  GetEmployeeInfo,
  SaveProfileEmployee,
  getResignInfo,
  uploadProfile,
  sendMailEmployeeResign,
  sendEmployeeResigns,
  getEmployeeConfig,
  getPhotoResignByEmployee,
  GetPhotosProfile,
  validData_EmployeeInfo,
  getMaternityInfo,
  sendEmployeeMaternity,
};
