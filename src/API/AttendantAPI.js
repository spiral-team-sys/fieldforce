import { GetToken } from '../Core/Helper';
import { URL_UPLOAD_ATTENDANT, URLDEFAULT } from '../Core/URLs';
import { checkNetwork } from '../Core/Utility';
import { toastError, toastSuccess } from '../Utils/configToast';
import { UpdateAttendantStatus } from '../Controller/PhotoController';
import { storeList } from '../Core/Table';
import { QueryStringSql } from '../Core/SqliteDbContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendantController } from '../Controller/AttendantController';
import RNFS from 'react-native-fs';
import moment from 'moment';

// Get Data Attendance
const GetDataAttendance = async params => {
  try {
    const isConnected = await checkNetwork();
    if (isConnected) {
      const token = await GetToken();
      const requestInfo = {
        method: 'GET',
        headers: {
          Authorization: token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          shopId: params.shopId,
          attendantDate: params.attendantDate,
        },
      };
      const response = await fetch(
        `${URLDEFAULT}attendants/byshop`,
        requestInfo,
      );
      const result = await response.json();
      if (result.statusId == 200) {
        await AsyncStorage.setItem('ATTENDANT', moment().format('HH'));
        await AttendantController.UpdateAttendanceLocal(result.data);
      }
    } else {
      toastError(
        'Lỗi kết nối',
        `Kết nối dữ liệu Wifi/4G không ổn định, Vui lòng kiểm tra lại`,
      );
    }
  } catch (error) {
    toastError('Lỗi dữ liệu', `Lỗi dữ liệu: ${error}`);
  }
};
// Upload Attendance
const UploadAttendance = async (photoInfo, type) => {
  try {
    let token = await GetToken();
    let ImgName = photoInfo.photoPath.substring(
      photoInfo.photoPath.lastIndexOf('/') + 1,
      photoInfo.photoPath.length,
    );
    var ImageAsBase64 = await RNFS.readFile(photoInfo.photoPath, 'base64');

    let dataJson = JSON.stringify({
      ShopId: photoInfo.shopId,
      ShopCode: photoInfo.shopCode,
      PhotoName: ImgName,
      Latitude: photoInfo.latitude,
      Longitude: photoInfo.longitude,
      Accuracy: photoInfo.accuracy,
      ReportId: photoInfo.reportId,
      PhotoTime: `${photoInfo.photoTime}`,
      PhotoType: photoInfo.photoType,
      PhotoDate: photoInfo.photoDate,
      photoDesc: photoInfo.photoDesc,
      guid: photoInfo.guid,
      PhotoData: ImageAsBase64,
      WorkStatus: photoInfo.workStatus,
      DataLocation: photoInfo.dataLocation,
    });
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      toastError(
        'Không có kết nối',
        'Vui lòng kiểm tra lại kết nối mạng sau đó bấm nút refresh trên tấm hình để gửi lại.',
      );
      return false;
    }
    //
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: dataJson,
    };
    const response = await fetch(URL_UPLOAD_ATTENDANT, requestInfo);
    const result = await response.json();
    if (result.status == 100) {
      type == 'TAKE' && toastSuccess(result.messeger);
      await UpdateAttendantStatus(
        photoInfo.shopId,
        photoInfo.photoDate,
        photoInfo.photoType,
      );
      return true;
    } else {
      toastError(
        `Gửi chấm công không thành công. Lỗi ${result.status}: ${result.messeger}`,
      );
      return false;
    }
  } catch (error) {
    toastError('Lỗi chấm công', `${error}`);
    return false;
  }
};
const UploadDataAttendance = async (params, actionResult, errorAction) => {
  try {
    const isConnected = await checkNetwork();
    if (isConnected) {
      const token = await GetToken();
      const requestInfo = {
        method: 'POST',
        headers: {
          Authorization: token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(params)),
      };
      const response = await fetch(
        `${URLDEFAULT}attendants/uploaddata`,
        requestInfo,
      );
      const result = await response.json();
      if (result.statusId == 200) {
        await UpdateAttendantStatus(
          params.shopId,
          params.photoDate,
          params.photoType,
        );
        actionResult && actionResult(result.messager);
      } else {
        errorAction && errorAction('Lỗi chấm công', result.messager);
      }
    } else {
      errorAction &&
        errorAction(
          'Lỗi kết nối',
          `Kết nối dữ liệu Wifi/4G không ổn định, Vui lòng kiểm tra lại`,
        );
    }
  } catch (error) {
    errorAction && errorAction('Lỗi dữ liệu', `Lỗi dữ liệu: ${error}`);
  }
};
//
const validTimeAttendant = async (type, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        typeAttendant: type,
      },
    };
    const response = await fetch(
      `${URLDEFAULT}attendants/validTime`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) await actionResult(result.data[0], null);
    else await actionResult({}, `Lỗi: ${result.messager}`);
  } catch (e) {
    await actionResult({}, `Lỗi: ${e}`);
  }
};
const GetAddressbyGeo = async latlng => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(latlng),
    };
    const response = await fetch(`${URLDEFAULT}public/geolatlng`, requestInfo);
    const result = await response.json();
    if ((await result.statusCode) === 200) {
      const content = await JSON.parse(result.content || '[{}]');
      const info = (await content?.results[0]) || {};
      return info.formatted_address || 'Không xác định';
    } else {
      return 'Không xác định';
    }
  } catch (e) {
    ToastError(e);
    return 'Không xác định';
  }
};
const GetgeoCodeAddress = async address => {
  const token = await GetToken();
  const requestInfo = {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: address,
  };
  const response = await fetch(`${URLDEFAULT}public/geoaddress`, requestInfo);
  const result = await response.json();
  if ((await result.statusCode) === 200) {
    const content = await JSON.parse(result.content || '[{}]');
    const info = (await content?.results[0]) || {};
    return info.formatted_address || 'Không xác định';
  } else {
    return 'Không xác định';
  }
};
const LocationFromAddress = async (address, finish, error) => {
  const token = await GetToken();
  const requestInfo = {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(address),
  };
  const response = await fetch(`${URLDEFAULT}public/geoaddress`, requestInfo);
  const result = await response.json();
  if ((await result.statusCode) === 200) {
    const content = await JSON.parse(result.content || '[{}]');
    const info = (await content?.results[0]) || {};
    const resLocation = {
      address: info.formatted_address || 'Không xác định',
      location: info.geometry.location || {},
    };
    await finish(resLocation);
  } else {
    await error('Không xác định');
  }
};
const DataLocationFromAddress = async (address, finish) => {
  const token = await GetToken();
  const requestInfo = {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(address),
  };
  const response = await fetch(`${URLDEFAULT}public/geoaddress`, requestInfo);
  const result = await response.json();
  if ((await result.statusCode) === 200) {
    const content = await JSON.parse(result.content || '[{}]');
    const lstData = await content?.results;
    await finish(lstData);
  }
};
const DataWaysFromLocation = async (jsonLocation, finish) => {
  const token = await GetToken();
  const requestInfo = {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(jsonLocation)),
  };
  const response = await fetch(
    `${URLDEFAULT}public/distanceaddress`,
    requestInfo,
  );
  const result = await response.json();
  if ((await result.statusCode) === 200) {
    const content = await JSON.parse(result.content || '[{}]');
    const lstData = await content?.routes;
    await finish(lstData);
  }
};
const LocationFromGeoCode = async (latlng, finish, error) => {
  const token = await GetToken();
  const requestInfo = {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: latlng,
  };
  const response = await fetch(`${URLDEFAULT}public/geolatlng`, requestInfo);
  const result = await response.json();
  if ((await result.statusCode) === 200) {
    const content = await JSON.parse(result.content || '[{}]');
    const info = (await content?.results[0]) || {};
    const resLocation = {
      address: info.formatted_address || 'Không xác định',
      location: info.geometry.location || {},
    };
    await finish(resLocation);
  } else {
    await error('Không xác định');
  }
};
const StartStopWork = async info => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(JSON.stringify(info)),
    };
    const response = await fetch(
      URLDEFAULT + 'attendants/starttopwork',
      requestInfo,
    );
    const result = await response.json();
    // console.log(result)
    if (result.statusId === 200) {
      const timeWork = await result.messager;
      let sql = `update ${storeList.tableName} set timeIn=${timeWork},[address]='${info.address}' WHERE shopCode='${info.shopCode}'`;
      // console.log(sql, 'sqlsqlsql')
      await QueryStringSql(sql);
    }
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 500, messager: 'Lỗi Api' };
  }
};
const onlineAttendant = async (shopId, attendantDate) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        shopId: shopId,
        attendantDate: attendantDate,
      },
    };

    const response = await fetch(URLDEFAULT + 'attendants/byshop', requestInfo);
    const result = await response.json();
    if (result.statusId === 200) {
      return result?.data || [];
    } else return [];
  } catch (err) {
    return [];
  }
};

export const ATTENDANT_API = {
  GetDataAttendance,
  UploadAttendance,
  UploadDataAttendance,
  validTimeAttendant,
  LocationFromAddress,
  LocationFromGeoCode,
  StartStopWork,
  GetAddressbyGeo,
  DataWaysFromLocation,
  DataLocationFromAddress,
  GetgeoCodeAddress,
  onlineAttendant,
};
