import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadAllDataPhoto } from '../Controller/PhotoController';
import {
  checkRawReport,
  dataUploaded,
  dataUploaded_Realtime,
} from '../Controller/ReportController';
import { GetToken, throttling } from '../Core/Helper';
import {
  Insert,
  QueryStringSql,
  replaceQueryString,
} from '../Core/SqliteDbContext';
import { taskList } from '../Core/Table';
import { mobileRaw, photos } from '../Core/TableLocal';
import { URLDEFAULT } from '../Core/URLs';
import { TODAY } from '../Core/Utility';
import moment from 'moment';

// For ALL
const GetDataReportByShop = async (dataFilter, actionResult) => {
  const checkSave = await checkRawReport(
    dataFilter.shopId,
    dataFilter.reportId,
  );
  if (!checkSave.isDownload) {
    try {
      const token = await GetToken();
      const requestInfo = {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(JSON.stringify(dataFilter)),
      };

      const response = await fetch(
        URLDEFAULT + `download/reportbyshop`,
        requestInfo,
      );
      const result = await response.json();
      if (result.statusId == 200) {
        if (result.data !== null && result.data.length > 0) {
          const itemData = result.data[0] || [];
          if (JSON.parse(itemData.jsonData || '[]')?.length > 0) {
            await Insert(mobileRaw, [itemData]);
          }
          // LastUdpate
          await AsyncStorage.setItem(
            `lastupdate_${dataFilter.reportId}`,
            moment().format('HH:mm:ss - DD/MM'),
          );
          //
          await actionResult(JSON.parse(itemData.jsonData), null);
        }
      } else {
        await actionResult(null, `Lỗi: ${result.messager}`);
      }
    } catch (e) {
      await actionResult(null, `Lỗi: ${e}`);
    }
  } else {
    await actionResult(JSON.parse(checkSave.data[0]?.jsonData || '[]'), null);
  }
};
const GetDataReportByShop_RealTime = async (dataFilter, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(JSON.stringify(dataFilter)),
    };
    const response = await fetch(
      URLDEFAULT + `download/reportbyshop/realtime`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) {
      await actionResult(result.data, null);
    } else {
      await actionResult(null, `Lỗi: ${result.messager}`);
    }
  } catch (e) {
    await actionResult(null, `Lỗi: ${e}`);
  }
};
const GetDataConfigReport = async (dataFilter, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(JSON.stringify(dataFilter)),
    };
    const response = await fetch(
      URLDEFAULT + `download/reportbyshop/getconfig`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) {
      await actionResult(result.data, null);
    } else {
      await actionResult(null, `Lỗi: ${result.messager}`);
    }
  } catch (e) {
    await actionResult(null, `Lỗi: ${e}`);
  }
};
const WorkingCheckReport = async (shopId, reportId, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        shopId: shopId,
        reportId: reportId,
      },
    };
    const response = await fetch(
      `${URLDEFAULT}download/reportbyshop/checking`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) {
      await actionResult(result.data, null);
    } else {
      await actionResult(null, `Lỗi: ${result.messager}`);
    }
  } catch (e) {
    await actionResult(null, `Lỗi: ${e}`);
  }
};
const UploadDataRaw = async (shopinfo, reportId) => {
  try {
    const data = await dataUploaded(shopinfo, reportId);
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(URLDEFAULT + 'upload/uploadraw', requestInfo);
    const result = await response.json();
    if (result.statusId === 200) {
      let sqlUpdateLoad = `UPDATE ${mobileRaw.tableName} SET isUploaded=1 WHERE shopId=@shopId AND reportDate=@auditDate AND reportId=${reportId}`;
      sqlUpdateLoad = await replaceQueryString(sqlUpdateLoad, shopinfo, [
        'shopId',
        'auditDate',
      ]);
      await QueryStringSql(sqlUpdateLoad);
      await QueryStringSql(
        `UPDATE ${photos.tableName} SET dataUpload=1 WHERE shopId=${shopinfo.shopId} AND reportId=${reportId} AND photoDate=${shopinfo.auditDate}`,
      );
      await QueryStringSql(
        `UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${shopinfo.shopId} and reportId=${reportId}`,
      );
      await UploadFilePhoto();
    }
    return result;
  } catch (e) {
    return { messager: e };
  }
};
const UploadDataRaw_Realtime = async (itemUpload, shopinfo, reportId) => {
  try {
    const data = await dataUploaded_Realtime(itemUpload, shopinfo, reportId);
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(URLDEFAULT + 'upload/uploadraw', requestInfo);
    const result = await response.json();
    if (result.statusId === 200) {
      await QueryStringSql(
        `UPDATE ${photos.tableName} SET dataUpload=1 
                    WHERE shopId=${shopinfo.shopId || itemUpload.shopId} 
                    AND reportId=${reportId} 
                    AND photoDate=${shopinfo.auditDate || TODAY}`,
      );
      await QueryStringSql(
        `UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${
          shopinfo.shopId || itemUpload.shopId
        } and reportId=${reportId}`,
      );
      await UploadFilePhoto();
    }
    return result;
  } catch (e) {
    return { messager: e };
  }
};
const UploadFilePhoto = throttling(async actionResult => {
  const { res } = await QueryStringSql(
    'SELECT id,shopCode,shopId,photoDate,photoFullTime,photoPath FROM photos WHERE fileUpload=0 OR fileUpload IS NULL',
  );
  await res?.forEach(async photoInfo => {
    await uploadAllDataPhoto([photoInfo], actionResult, () => {});
  });
}, 300);
// For Report
const GetDecor = async shopId => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        shopId: shopId,
      },
    };
    const response = await fetch(URLDEFAULT + 'lgdownload/decor', requestInfo);
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const GetDataReportZalo = async (workDate, shopId) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        workDate: workDate,
        shopId: shopId,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'employee/reportzalo',
      requestInfo,
    );
    if (response.status == 204) {
      return {
        statusId: 204,
        messager: 'Không có dữ liệu',
        data: result || [],
      };
    }
    const result = await response.json();
    if (response.status == 200) {
      return {
        statusId: 200,
        messager: 'Tải dữ liệu thành công',
        data: result || [],
      };
    }
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
export const REPORT = {
  GetDataReportByShop,
  GetDataReportByShop_RealTime,
  GetDataConfigReport,
  WorkingCheckReport,
  UploadDataRaw,
  UploadDataRaw_Realtime,
  GetDecor,
  UploadFilePhoto,
  GetDataReportZalo,
};
