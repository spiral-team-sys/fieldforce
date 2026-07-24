import AsyncStorage from '@react-native-async-storage/async-storage';
import { GetToken } from '../Core/Helper';
import { Insert, QueryStringSql } from '../Core/SqliteDbContext';
import { storeList } from '../Core/Table';
import { photos, workResults } from '../Core/TableLocal';
import { URLDEFAULT } from '../Core/URLs';
import { TODAY } from '../Core/Utility';
import { uploadAttendant } from './PhotoController';
import { ATTENDANT_API } from '../API/AttendantAPI';
import moment from 'moment';
import _ from 'lodash';

// Sync data
const SyncFromServer = async workinfo => {
  const result = await ATTENDANT_API.onlineAttendant(
    workinfo.shopId,
    workinfo.workDate,
  );
  await AsyncStorage.setItem('ATTENDANT', moment().format('HH'));
  await result?.forEach(async item => {
    let sql = `
            SELECT * 
            FROM ${photos.tableName} 
            WHERE reportId=1 
            AND shopId=${item.shopId} 
            AND photoDate=${item.photoDate} 
            AND photoType='${item.photoType}'
        `;
    const { res } = await QueryStringSql(sql);
    if (res !== null && res.length > 0) {
      sql = `
                UPDATE ${photos.tableName} 
                SET dataUpload=${item.dataUpload},
                    fileUpload=${item.fileUpload},
                    photoTime=${item.photoTime},
                    photoFullTime='${item.photoFullTime}' 
                WHERE shopId=${item.shopId} 
                AND reportId=1 
                AND photoType='${item.photoType}' 
                AND photoDate=${item.photoDate}
            `;
      await QueryStringSql(sql);
    } else {
      await Insert(photos, [item]);
    }
  });
};
const updateAttendanceItems = async (dataOnline = []) => {
  const errors = [];

  for (const item of dataOnline) {
    try {
      const { res, err: selectError } = await QueryStringSql(`
                SELECT id
                FROM ${photos.tableName}
                WHERE reportId = 1
                  AND shopId = ${item.shopId}
                  AND photoDate = ${item.photoDate}
                  AND photoType = '${item.photoType}'
                ORDER BY id DESC
                LIMIT 1
            `);

      if (selectError) {
        errors.push({ item, error: selectError });
        continue;
      }

      if (res?.length > 0) {
        const { err: updateError } = await QueryStringSql(`
                    UPDATE ${photos.tableName}
                    SET dataUpload = ${item.dataUpload},
                        fileUpload = ${item.fileUpload},
                        photoTime = ${item.photoTime},
                        photoFullTime = '${item.photoFullTime}'
                    WHERE id = ${res[0].id}
                `);

        if (updateError) {
          errors.push({ item, error: updateError });
        }
      } else {
        const insertResult = await Insert(photos, [item]);

        if (insertResult?.err) {
          errors.push({ item, error: insertResult.err });
        }
      }
    } catch (error) {
      errors.push({ item, error });
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

let attendanceUpdateQueue = Promise.resolve();
const UpdateAttendanceLocal = (dataOnline = []) => {
  const updateTask = attendanceUpdateQueue.then(() =>
    updateAttendanceItems(dataOnline),
  );
  attendanceUpdateQueue = updateTask.catch(() => undefined);
  return updateTask;
};
//
const countAttShopNotFinish = async workinfo => {
  const sql = `
        SELECT st.shopId,st.shopCode,st.shopName,
        (SELECT count(DISTINCT p.photoType) FROM ${photos.tableName} AS p WHERE p.reportId=1 AND p.photoDate=${workinfo.workDate} AND p.shopId=st.shopId) as countImage
        FROM ${storeList.tableName} st
        WHERE st.shopCode not in('1','Z') AND st.auditDate=${workinfo.workDate} AND st.shopId<>${workinfo.shopId}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const GetAttendant = async (shopinfo, workDate, actionResult) => {
  const sql = `
        SELECT p.*
        FROM ${photos.tableName} p
        INNER JOIN (
            SELECT photoType, MAX(id) AS selectedId
            FROM ${photos.tableName}
            WHERE reportId=1
              AND shopId=${shopinfo.shopId}
              AND photoDate=${workDate}
            GROUP BY photoType
        ) selected ON selected.selectedId=p.id
        ORDER BY CAST(p.photoType AS INTEGER)
    `;
  const { res } = await QueryStringSql(sql);
  actionResult && actionResult(res);
  return res || [];
};
const CreateTemplateAttendance = (
  workinfo,
  locationInfo,
  photoList = [],
  numberAtt,
  actionResult,
) => {
  var template = [];
  var dataSwiper = [];
  if (workinfo.shopId) {
    const photoByType = new Map(
      photoList.map(photo => [Number(photo.photoType), photo]),
    );
    for (let i = 0; i < numberAtt; i++) {
      const photo = photoByType.get(i);
      if (photo) {
        template.push(photo);
        dataSwiper.push(photo);
      } else {
        template.push({
          reportId: 1,
          shopId: workinfo.shopId,
          shopCode: workinfo.shopCode,
          photoType: i,
          photoDate: workinfo.workDate,
          latitude: locationInfo.latitude || -1,
          longitude: locationInfo.longitude || -1,
          accuracy: locationInfo.accuracy || -1,
          photoTime: null,
          photoPath: '../Themes/lotties/facecico.json',
          dataUpload: 0,
          fileUpload: 0,
        });
        break;
      }
    }
    actionResult && actionResult(template, dataSwiper);
  } else {
    actionResult && actionResult([], []);
  }
};
const GetOTSummary = async (shopId, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        shopId: shopId,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'attendants/otsummary',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) actionResult(result.data);
  } catch (err) {
    console.log(err);
  }
};
const checkErrorAttendant = async currentDate => {
  const sql = `SELECT p.*, w.shopName FROM ${photos.tableName} p
    LEFT JOIN ${workResults.tableName} w ON p.photoDate = w.workDate AND p.shopId = w.shopId
    WHERE p.reportId=1 AND  p.photoDate <= ${currentDate} AND (p.dataUpload <> 1 OR p.dataUpload IS NULL) ORDER BY p.photoDate`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const UploadAttendantError = async () => {
  const currentDay = moment().format('YYYYMMDD');
  const listPhoto = await checkErrorAttendant(currentDay);
  if (listPhoto.length > 0) {
    listPhoto.map(it => {
      uploadAttendant(it, 'UPLOAD');
    });
  }
};
const checkHaveAttendant = async () => {
  const sql = `SELECT p.* FROM ${photos.tableName} p WHERE p.reportId=1 AND photoDate=${TODAY} `;
  const { res } = await QueryStringSql(sql);
  return res?.length > 0 ? true : false;
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
  // console.log(requestInfo);
  const response = await fetch(`${URLDEFAULT}public/geoaddress`, requestInfo);
  const result = await response.json();
  // console.log(result);
  if ((await result.statusCode) === 200) {
    const content = await JSON.parse(result.content || '[{}]');
    const lstData = await content?.results;
    await finish(lstData);
  }
};
const getShopNotFinish = async () => {
  const sql = `
        SELECT st.shopId,st.shopCode,st.shopName,
            CASE WHEN SUM(CASE WHEN p.photoType = '1' THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS hasCheckOut
        FROM ${storeList.tableName} st
        LEFT JOIN ${photos.tableName} p ON p.shopId = st.shopId AND p.reportId = 1 AND p.photoDate = ${TODAY} AND p.photoType = '1'
        WHERE st.shopCode NOT IN ('1','Z')
            AND st.auditDate = ${TODAY}
        GROUP BY st.shopId, st.shopCode, st.shopName
        HAVING hasCheckOut = 0
        ORDER BY st.shopName`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export const AttendantController = {
  GetAttendant,
  SyncFromServer,
  UpdateAttendanceLocal,
  countAttShopNotFinish,
  GetOTSummary,
  UploadAttendantError,
  checkErrorAttendant,
  checkHaveAttendant,
  CreateTemplateAttendance,
  DataWaysFromLocation,
  DataLocationFromAddress,
  getShopNotFinish,
};
