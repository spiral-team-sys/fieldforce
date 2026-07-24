import { GetToken, ToastError, ToastSuccess, Token } from '../Core/Helper';
import {
  URL_GET_ATTENDANT,
  URL_TIME,
  URL_UPLOAD_ATTENDANT,
  URL_UPLOAD_PHOTODATA,
  URL_UPLOAD_PHOTOS,
} from '../Core/URLs';
import {
  SelectItems,
  SelectItemsClause,
  Store,
  _createTable,
  _saveOrUpdate,
  UpdateItem,
  exeSql,
  Insert,
  DeleteAll,
  QueryStringSql,
} from './../Core/SqliteDbContext';
let RNFS = require('react-native-fs');
import { storeList } from '../Core/Table';
import { mobileRaw, photos } from '../Core/TableLocal';
import { checkNetwork, alertToast, TODAY } from '../Core/Utility';
import { updateIdStatusFileUploaded } from './WorkController';
import _ from 'lodash';

export async function GetPhotosByType(shopId, workDate, photoType) {
  const sql = `SELECT * FROM  ${photos.tableName} WHERE shopId=${shopId} AND photoDate=${workDate} AND photoType='${photoType}'`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function GetPhotosByTypeGuid(shopId, workDate, photoType) {
  const sql = `SELECT photoPath,guid,photoType,photoDate,id
        FROM ${photos.tableName} 
        WHERE shopId=${shopId} AND photoDate=${workDate} 
        AND photoType='${photoType}'
    `;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function GetPhotosByReportId(shopId, workDate, reportId) {
  const sql = `SELECT * FROM ${photos.tableName} WHERE shopId=${shopId} AND reportId=${reportId} AND photoDate=${workDate}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function GetPhotosEvident(shopId, workDate, reportId) {
  let lst = [];
  await Store().then(async db => {
    const sql = `SELECT id,dataUpload,fileUpload,photoPath,photoDesc
            FROM photos p 
            WHERE shopId=${shopId} 
            AND photoDate=${workDate} 
            AND reportId=${reportId}`;
    const { res } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export const GetPhotosList = async (shopId, workDate, reportId) => {
  const sql = `SELECT * FROM ${photos.tableName} WHERE shopId=${shopId} AND photoDate=${workDate} AND reportId=${reportId} GROUP BY photoType`;
  // console.log(sql, "GetPhotosList")
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export async function getLstShopNotAtt(photoDate) {
  const sql = `SELECT st.shopName,(
        SELECT COUNT(id) FROM ${photos.tableName} p
        WHERE p.reportId=1 AND p.photoDate=${photoDate}
        AND p.shopId=st.shopId AND p.photoType in('0','1') as count
        FROM ${storeList.tableName} WHERE st.auditdate=${photoDate} AND shopCode NOT IN('1','Z')`;
  const { res, err } = await QueryStringSql(sql);
  return res || [];
}
export async function GetPhotosCheckIn(shopId, workDate, reportId) {
  let lst = [];
  await Store().then(async db => {
    const { res, err } = await SelectItemsClause(
      db,
      'photos',
      '*',
      { shopId: shopId, photoDate: workDate, reportId: reportId, photoType: 0 },
      'GROUP BY photoType',
    );
    lst = res;
  });
  return lst;
}
export async function GetPhotosINOUT(shopId, workDate, reportId) {
  let lst = [];
  await Store().then(async db => {
    const { res, err } = await SelectItemsClause(
      db,
      'photos',
      '*',
      { shopId: shopId, photoDate: workDate, reportId: reportId },
      'GROUP BY photoType',
    );
    lst = res;
  });
  return lst;
}
export async function GetShopINOUT(workDate) {
  const sql = `SELECT st.shopId,count(*) as count
        FROM ${storeList.tableName} st
        LEFT JOIN ${photos.tableName} AS p ON st.shopId=p.shopId AND st.auditDate=p.photoDate
        WHERE p.reportId = 1
        AND p.photoType='1'
        AND p.photoDate=${workDate}
        GROUP BY st.shopId`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function UpdatePhotosStatus(
  photoTime,
  shopId,
  workDate,
  photoType,
) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'photos',
      { dataUpload: 1, fileUpload: 1, photoTime: photoTime },
      { shopId: shopId, photoDate: workDate, photoType: photoType },
    );
    result = true;
  });
  return result;
}
export async function UpdateTimeOT(
  timeOT,
  noteOT,
  shopId,
  workDate,
  photoType,
) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'photos',
      { timeOT: timeOT, noteOT: noteOT },
      { shopId: shopId, photoDate: workDate, photoType: photoType },
    );
    //console.log(res, 'res')
    result = true;
  });
  return result;
}
export async function GetTimeOT(shopId, workDate, photoType) {
  let lst = [];
  await Store().then(async db => {
    let sql =
      'SELECT * FROM photos' +
      ' WHERE reportId = 1' +
      " AND photoType ='" +
      0 +
      "'" +
      ' AND photoDate =' +
      workDate +
      ' AND shopId =' +
      shopId;
    //console.log(sql)
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function UpdateLocationStoreList(latitude, longitude, shopId) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'storeList',
      { latitude: latitude, longitude: longitude },
      { shopId: shopId },
    );
    result = true;
  });

  return result;
}
export async function UpdateAttendantStatus(shopId, workDate, photoType) {
  const sql = ` UPDATE ${photos.tableName} 
        SET dataUpload=1,fileUpload=1 
        WHERE shopId=${shopId} AND photoDate=${workDate} AND photoType='${photoType}'
    `;
  await QueryStringSql(sql);
}
export async function UpdatePhotosDataStatus(shopId, workDate, photoType) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'photos',
      { dataUpload: 1 },
      { shopId: shopId, photoDate: workDate, photoType: photoType },
    );
    result = true;
  });
  return result;
}
export async function UpdateStatusPhotoData(id) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'photos',
      { dataUpload: 1 },
      { id: id },
    );
    result = true;
  });
  return result;
}
export async function UpdateStatusPhotoFile(id) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'photos',
      { fileUpload: 1 },
      { id: id },
    );
    result = true;
  });
  return result;
}
export async function UpdateUrlPhotosShop(
  shopId,
  urlImage,
  latitude,
  longitude,
) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'storeList',
      { imageUrl: urlImage, latitude: latitude, longitude: longitude },
      { shopId: shopId },
    );
    result = true;
  });
  return result;
}
export async function UpdatePhotosFileStatus(shopId, workDate, photoType) {
  let result = false;
  await Store().then(async db => {
    const { res, err } = await UpdateItem(
      db,
      'photos',
      { fileUpload: 1 },
      { shopId: shopId, photoDate: workDate, photoType: photoType },
    );
    result = true;
  });
  return result;
}
export async function InsertPhotosItem(photoInfo) {
  await Insert(photos, [photoInfo]);
  return true;
}
export async function UpdatePhotosEditItem(photoInfo) {
  const sql = `UPDATE ${photos.tableName}
            SET photoPath='${photoInfo.photoPath}',
                guid='${photoInfo.guid}'
            WHERE id= ${photoInfo.id}`;
  await QueryStringSql(sql);
  // console.log(sql, photoInfo, 'check query')
}
export async function reloadShopList(data) {
  await DeleteAll(storeList).then(async () => {
    // console.log(data,"storeList")
    await Insert(storeList, data);
  });
  return true;
}
export async function GetAttendant(db, shopinfo) {
  const { res, err } = await SelectItems(db, 'photos', '*', {
    ShopId: shopinfo.ShopId,
    PhotoDate: shopinfo.AuditDate,
  });
  if (!Array.isArray(res)) {
    return res;
  } else {
    const attenttemp = [{}, {}];
    return attenttemp;
  }
}
export async function fetchGetAttendant(shopId, photoDate) {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        shopid: shopId,
        photodate: photoDate,
      },
    };
    const response = await fetch(URL_GET_ATTENDANT, requestInfo);
    const result = await response.json();
    return result || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function uploadAttendant(photoInfo, type) {
  let access_token = await GetToken();
  try {
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
      PhotoTime: photoInfo.photoTime + '',
      PhotoType: photoInfo.photoType,
      PhotoDate: photoInfo.photoDate,
      photoDesc: photoInfo.photoDesc,
      guid: photoInfo.guid,
      PhotoData: ImageAsBase64,
      WorkStatus: photoInfo.workStatus,
      DataLocation: photoInfo.dataLocation,
      ShopName: photoInfo.shopName,
    });
    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      ToastError(
        'Không có kết nối. Vui lòng kiểm tra lại kết nối mạng sau đó bấm nút refresh trên tấm hình để gửi lại.',
      );
      return false;
    }
    // console.log(dataJson)
    await fetch(URL_UPLOAD_ATTENDANT, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: access_token,
      },
      body: dataJson,
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.status == 100) {
          UpdateAttendantStatus(
            photoInfo.shopId,
            photoInfo.photoDate,
            photoInfo.photoType,
          );
          type == 'TAKE' && ToastSuccess(responseJson.messeger);
          return true;
        } else {
          // alert(responseJson.messeger+responseJson.status);
          type == 'TAKE' &&
            ToastError(
              'Gửi chấm công không thành công. Vui lòng bấm nút refresh trên tấm hình để gửi lại. Lỗi: ' +
                responseJson.messeger +
                responseJson.status,
            );
          return false;
        }
      })
      .catch(error => {
        ToastError(error);
        return false;
      });
  } catch (error) {
    ToastError(error);
  }
}
export async function uploadAllDataPhoto(dataPhoto, fileSuccess, fileError) {
  try {
    let access_token = await GetToken();
    for (const photoInfo of dataPhoto || []) {
      let ImgName = photoInfo.photoPath.substring(
        photoInfo.photoPath.lastIndexOf('/') + 1,
        photoInfo.photoPath.length,
      );
      if (await RNFS.exists(photoInfo.photoPath)) {
        let ImageAsBase64 = await RNFS.readFile(photoInfo.photoPath, 'base64');
        let dataItem = {
          PhotoName: ImgName,
          ShopCode: photoInfo.shopCode,
          PhotoDate: photoInfo.photoDate,
          PhotoTime: photoInfo.photoFullTime,
          PhotoData: ImageAsBase64 + '',
          Tag: photoInfo.tag,
        };
        const response = await fetch(URL_UPLOAD_PHOTOS, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: access_token,
          },
          body: JSON.stringify(dataItem),
        });
        const result = await response.json();
        if (result.status === 100) {
          typeof fileSuccess === 'boolean' ? null : alertToast(result.messeger);
          await updateIdStatusFileUploaded(photoInfo.id);
          typeof fileSuccess === 'function' && fileSuccess();
        } else {
          typeof fileError === 'boolean'
            ? null
            : alertToast(
                'Vui lòng vào album để up lại hình, Lỗi: ' + result.messeger,
              );
          typeof fileError === 'function' && fileError();
        }
      } else {
        typeof fileError === 'function' && fileError();
      }
    }
  } catch (error) {
    typeof fileError === 'boolean'
      ? null
      : alertToast('Vui lòng vào album để up lại hình, Lỗi: ' + error);
  }
}
export async function uploadPhotoData(photoInfo) {
  let token = await GetToken();
  try {
    let ImgName = photoInfo.photoPath.substring(
      photoInfo.photoPath.lastIndexOf('/') + 1,
      photoInfo.photoPath.length,
    );
    let dataJson = JSON.stringify({
      ShopId: photoInfo.shopId,
      PhotoName: ImgName,
      Latitude: photoInfo.latitude,
      Longitude: photoInfo.longitude,
      Accuracy: photoInfo.accuracy || 8,
      ReportType: photoInfo.reportId,
      PhotoTime: '' + photoInfo.photoTime,
      PhotoType: photoInfo.photoType,
      PhotoDate: photoInfo.photoDate,
      PhotoDesc: photoInfo.photoDesc || 'Overview',
      Guid: photoInfo.guid || 'x',
      Tag: 'x',
      GpsAddress: 'x',
      WorkStatus: photoInfo.workStatus,
      DataLocation: photoInfo.dataLocation,
    });

    return await fetch(URL_UPLOAD_PHOTODATA, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: dataJson,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.status == 200) {
          if (responseJson.messeger === 'Đã lưu') {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      })
      .catch(error => {
        return false;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
}
export async function getPhotosNotUploadReport(
  reportId = 0,
  photoType,
  shopId,
  photoDate,
) {
  const sql = `Select * from photos WHERE fileUpload<>1 ${
    reportId >= 0 ? `and reportId=${reportId}` : ''
  }`;
  console.log(sql);

  const { res } = await QueryStringSql(sql);
  return res || [];
}
export const deletePhoto = async item => {
  const sql = `DELETE FROM ${photos.tableName} where id=${item.id}`;
  await QueryStringSql(sql);
};
export const deletePhotoByList = async lstDel => {
  const del = await lstDel.map(v => {
    return v.id;
  });
  const sql = `DELETE FROM ${photos.tableName} where id IN(${del?.toString()})`;
  await QueryStringSql(sql);
};
export const deletePhotoByPath = async photoPath => {
  if (!photoPath) return;
  const sql = `DELETE FROM ${photos.tableName} where photoPath='${photoPath}'`;
  await QueryStringSql(sql);
};
export const deleteOldPhotosByReport = async (
  shopId,
  reportId,
  photoDate = TODAY,
) => {
  const sql = `DELETE FROM ${photos.tableName} 
        WHERE shopId=${shopId || 0} 
        AND reportId=${reportId} 
        AND photoDate<${photoDate}`;
  await QueryStringSql(sql);
};
export const deletePhotoByGuid = async Guid => {
  const sql = `DELETE FROM ${photos.tableName} where guid = '${Guid}'`;
  await QueryStringSql(sql);
};
export const getAllPhotosLocal = async orderBy => {
  const sql = `SELECT w.shopName,w.shopCode as wShopCode, w.address, p.*,
    p.shopId as imageId, w.address as titleView, w.shopName as nameView, w.shopCode as codeView, p.photoFullTime as timeView,p.fileUpload,p.dataUpload
    FROM photos p
    LEFT JOIN workResults w ON p.shopId = w.shopId AND w.workDate = p.photoDate
    WHERE p.photoPath IS NOT NULL ORDER BY ${orderBy} desc`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export const getPhotosDeleteByDate = async photoDate => {
  const sql = `SELECT p.*
    FROM photos p
    WHERE p.photoDate < ${photoDate} and dataUpload = 1 and fileUpload = 1 `;
  const { res } = await QueryStringSql(sql);
  if (res !== null && res?.length > 0) {
    res.map(async it => {
      const sql = `DELETE FROM ${photos.tableName} where photoPath='${it.photoPath}' AND shopId = ${it.shopId}`;
      await QueryStringSql(sql);
      RNFS.exists(it.photoPath).then(exists => {
        if (exists) {
          RNFS.unlink(it.photoPath).then(() => console.log('FILE DELETED'));
        }
      });
    });
  }
  return res || [];
};
//
export const dataPhotoReport = async (shopinfo, reportId, type = null) => {
  const sql = `SELECT * FROM ${photos.tableName} AS p 
    WHERE p.shopId=${shopinfo.shopId} AND p.photoDate=${
    shopinfo.auditDate
  } AND p.reportId=${reportId}
    ${type == null ? '' : `AND p.photoType='${type}'`}
    ORDER BY p.photoType,p.id DESC
    `;
  const { res } = await QueryStringSql(sql);
  return res;
};

// và lazy-load list ảnh khi user bấm xem.
export const photoCountMapByReport = async (shopinfo, reportId) => {
  const sql = `SELECT p.photoType, COUNT(*) as count
    FROM ${photos.tableName} AS p
    WHERE p.shopId=${shopinfo.shopId} AND p.photoDate=${shopinfo.auditDate} AND p.reportId=${reportId}
    GROUP BY p.photoType
    `;
  const { res } = await QueryStringSql(sql);
  const rows = Array.isArray(res) ? res : [];
  const map = {};
  rows.forEach(r => {
    map[r.photoType] = Number(r.count) || 0;
  });
  return map;
};
export const oldDataPhotoByType = async (shopinfo, reportId, type = null) => {
  const sql = `SELECT * FROM ${photos.tableName} AS p 
    WHERE p.shopId=${shopinfo.shopId} AND p.photoDate<${
    shopinfo.auditDate
  } AND p.reportId=${reportId}
    ${type == null ? '' : `AND p.photoType='${type}'`}
    ORDER BY p.photoType,p.id DESC
    `;
  const { res } = await QueryStringSql(sql);
  return res || [];
};

export const updatePhotoReportZalo = async (
  shopId,
  reportId,
  data,
  reportDate = null,
) => {
  const reportDateClause = reportDate ? ` AND reportDate=${reportDate}` : '';
  const checkSql = `SELECT COUNT(*) AS count FROM ${mobileRaw.tableName} WHERE shopId=${shopId} AND reportId=${reportId}${reportDateClause}`;
  const { res } = await QueryStringSql(checkSql);

  const isExist = res && res.length > 0 && res[0].count > 0;

  let sql;
  if (isExist) {
    sql = `UPDATE ${mobileRaw.tableName} 
               SET jsonPhoto='${JSON.stringify(data)}' 
               WHERE shopId=${shopId} AND reportId=${reportId}${reportDateClause}`;
  } else if (reportDate) {
    sql = `INSERT INTO ${
      mobileRaw.tableName
    } (shopId, reportId, reportDate, jsonPhoto)
               VALUES (${shopId}, ${reportId}, ${reportDate}, '${JSON.stringify(
      data,
    )}')`;
  } else {
    sql = `INSERT INTO ${mobileRaw.tableName} (shopId, reportId, jsonPhoto) 
               VALUES (${shopId}, ${reportId}, '${JSON.stringify(data)}')`;
  }
  await QueryStringSql(sql);
};

export const getPhotoReportZalo = async (
  shopId,
  reportId,
  reportDate = null,
) => {
  const reportDateClause = reportDate ? ` AND reportDate=${reportDate}` : '';
  const sql = `SELECT * FROM ${mobileRaw.tableName} AS m WHERE m.shopId=${shopId} AND reportId=${reportId}${reportDateClause}`;
  const { res } = await QueryStringSql(sql);
  return res;
};

export const clearPhotoReportZalo = async (
  shopId,
  reportId,
  actionResult,
  reportDate = null,
) => {
  const reportDateClause = reportDate ? ` AND reportDate=${reportDate}` : '';
  const sql = `DELETE FROM ${mobileRaw.tableName} AS m WHERE m.shopId=${shopId} AND reportId=${reportId}${reportDateClause}`;
  const { res } = await QueryStringSql(sql);
  actionResult && actionResult(res);
  return res;
};

// Multiple Data
export const getDataPhotos = async (
  shopId,
  photoDate,
  photoType,
  reportId,
  guid,
  isUpload = false,
  actionResult,
) => {
  const sql = `SELECT * FROM ${photos.tableName} AS p 
        WHERE p.shopId=${shopId} AND p.photoDate=${photoDate}
        ${photoType ? ` AND p.photoType='${photoType}'` : ``}
        ${reportId ? ` AND p.reportId=${reportId}` : ``}
        ${guid ? ` AND p.guid='${guid}'` : ``}
        ${isUpload ? ` AND (p.dataUpload IS NULL OR p.dataUpload=0)` : ``}
    `;
  let dataResult = [];
  const { res } = await QueryStringSql(sql);
  if (isUpload) {
    const dataPhotoUpload = _.map(res, e => {
      let imageName = e.photoPath.slice(
        e.photoPath.lastIndexOf('/', e.photoPath.length) + 1,
      );
      let fileName = `/uploaded/${e.photoDate}/${imageName}`;
      return { ...e, photoPath: fileName };
    });
    dataResult = dataPhotoUpload;
  } else {
    dataResult = res;
  }
  actionResult && actionResult(dataResult);
  return dataResult;
};

export const updateImageUrl = async (photoType, imageUrl = null) => {
  const sql = `UPDATE ${storeList.tableName} 
                 SET imageUrl = '${imageUrl}'
                 WHERE shopCode = '${photoType === 'START' ? '1' : 'Z'}'`;
  await QueryStringSql(sql);
};
