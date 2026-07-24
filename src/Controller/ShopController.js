import { QueryStringSql, Update } from '../Core/SqliteDbContext';
import { GetToken, ToastError, ToastSuccess } from '../Core/Helper';
import { URL_GetShops, URLDEFAULT } from '../Core/URLs';
import { masterList, stockHistory, storeList } from '../Core/Table';
import { uploadServer } from './UploadController';
import { photos } from '../Core/TableLocal';
import { alertError, alertNotify } from '../Core/Utility';
import moment from 'moment';
import _ from 'lodash';

export const getDataStoreList = async actionResult => {
  const today = parseInt(moment().format('YYYYMMDD'));
  const sql = `SELECT shopId as id, s.*,
        (SELECT COUNT(DISTINCT p.photoType) FROM ${photos.tableName} p WHERE p.shopId=s.shopId AND p.photoDate=s.auditDate AND p.reportId = 1) as finish
        FROM ${storeList.tableName} AS s 
        WHERE s.shopCode NOT IN ('1','Z') AND s.auditDate=${today}
        ORDER BY s.orderBy`;
  const { res } = await QueryStringSql(sql);
  actionResult(res || []);
};
export const GetDataWorkingStatus = async actionResult => {
  const sql = `SELECT * FROM ${storeList.tableName} WHERE shopCode IN ('1','Z')`;
  const { res } = await QueryStringSql(sql);
  //
  if (res !== null && res.length > 0) {
    const _startInfo = (await _.filter(res, e => e.shopCode == '1'))[0] || {};
    const _endInfo = (await _.filter(res, e => e.shopCode == 'Z'))[0] || {};
    //
    const startAction = (_startInfo.timeIn || 0) !== 0;
    const endAction = (_endInfo.timeIn || 0) !== 0;
    await actionResult({
      start: _startInfo,
      end: _endInfo,
      isStartAction: startAction,
      isEndAction: endAction,
      note: _endInfo.note || null,
      isShow: true,
      isTakePicture: JSON.parse(_startInfo.config || '{}').isTakePicture == 1,
      isDoneShop: JSON.parse(_endInfo.config || '{}').isDoneShop == 1,
    });
  } else {
    await actionResult({
      isStartAction: true,
      isEndAction: true,
      isShow: false,
      isTakePicture: false,
    });
  }
};
//
export async function getStockHistory(workinfo) {
  const sql = `SELECT * FROM ${stockHistory.tableName} WHERE shopId=${workinfo.shopId}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export const GetStartStopWork = async () => {
  const sql = `SELECT * FROM ${storeList.tableName} WHERE shopCode IN('1','Z')`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export async function getStoreListSO(search, date) {
  const sql =
    `SELECT shopId as id,shopName as name,auditDate 
    FROM ${storeList.tableName} st 
    WHERE auditDate=${date}` +
    (search !== '' ? " AND shopName like '%" + search + "%'" : '');
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export const GetShopManager = async () => {
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
      URLDEFAULT + 'shops/storemaintant',
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
export async function uploadProfileShop(shopUpload, workinfo, finish, error) {
  try {
    await uploadServer(
      workinfo,
      shopUpload,
      async result => {
        ToastSuccess(result.messager);
        // if (result.statusId == 200) {
        //     await Store().then(async db => {
        //         const sqlData = "Update displayCompetitor set upload=1 WHERE workId=" + workinfo.workId;
        //         await exeSqlNoQuery(db, sqlData);

        //         const sql = `UPDATE photos SET dataUpload=1
        //         WHERE shopId=${workinfo.shopId}
        //         AND photoDate=${workinfo.workDate}
        //         AND reportId=${workinfo.reportId}`
        //         await exeSqlNoQuery(db, sql);
        //     });
        // }
        typeof finish === 'function' && finish();
      },
      result => {
        ToastSuccess(result.messager);
        typeof error === 'function' && error();
      },
    );
  } catch (err) {
    ToastError('Lỗi dữ liệu trong máy');
    typeof error === 'function' && error();
  }
}
export const GetStoreReport = async actionResult => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/storereport',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId === 200) actionResult(result.data);
    else alertError(result.messeger);
  } catch (e) {
    alertError('Error: ' + e);
  }
};
export const GetDataCreateStore = async actionResult => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/datacreate',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId === 200) actionResult(result.data);
    else alertError(result.messeger);
  } catch (e) {
    alertError('Error: ' + e);
  }
};
export const GetConfigNewStore = async actionResult => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/confignewstore',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId === 200) actionResult(result.data);
    else alertError(result.messeger);
  } catch (e) {
    alertError('Error: ' + e);
  }
};
export const GetStoreInfo = async (shopId, actionResult) => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
        shopId: shopId,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/getstoreinfo',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId === 200) actionResult(result.data);
    else alertError(result.messeger);
  } catch (e) {
    alertError('Error: ' + e);
  }
};
export const GetDataAllRegion = async actionResult => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/regionall',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId === 200) actionResult(result.data);
    else alertError(result.messeger);
  } catch (e) {
    alertError('Error: ' + e);
  }
};
export const CreateItemStore = async (
  dataStore,
  contentMassage,
  actionResult,
) => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        contentMessage: contentMassage,
      },
      body: JSON.stringify(JSON.stringify(dataStore)),
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/createstore',
      requestInfo,
    );
    const result = await responseJson.json();
    actionResult(result);
  } catch (e) {
    alertError('Error: ' + e);
  }
};

export const checkLockReport = async shopinfo => {
  const config = JSON.parse(shopinfo?.config || '{}');
  const sql = `SELECT * FROM ${photos.tableName} where shopId=${shopinfo.shopId} and photoDate=${shopinfo.auditDate} and reportId=1`;
  const { res } = await QueryStringSql(sql);
  return config?.lockReport == 1 && res?.length % config?.numberAtt == 0;
};

export const updateStoreData = async shopinfo => {
  const sql = `UPDATE ${storeList.tableName} 
    SET shopName='${shopinfo.shopName}',
    email=${shopinfo.email ? `'${shopinfo.email}'` : null},
    phone=${shopinfo.phone ? `'${shopinfo.phone}'` : null},
    storeSize= ${shopinfo.storeSize ? `'${shopinfo.storeSize}'` : null},
    contactName=${shopinfo.contactName ? `'${shopinfo.contactName}'` : null},
    address=${shopinfo.address ? `'${shopinfo.address}'` : null},
    numberofFSM=${shopinfo.numberofFSM ? shopinfo.numberofFSM : null},
    openYear=${shopinfo.openYear ? `'${shopinfo.openYear}'` : null},
    dealerName=${shopinfo.dealerName ? `'${shopinfo.dealerName}'` : null},
    newRegionId=${shopinfo.newRegionId ? `${shopinfo.newRegionId}` : null}
    where shopId=${shopinfo.shopId} and auditDate=${shopinfo.auditDate}`;
  await QueryStringSql(sql);
};

export const getMasterNewStore = async actionResult => {
  const sql = `SELECT * FROM ${masterList.tableName} WHERE listCode='NewStore' ORDER BY orderBy`;
  const { res, err } = await QueryStringSql(sql);
  actionResult(res);
};

// Confirm New Store
export const GetListConfirmStore = async actionResult => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/getlistconfirm',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId == 500) {
      alertError(result.messager);
    }
    actionResult(result.data);
  } catch (e) {
    alertError('Error: ' + e);
  }
};
//  Store Lists
export const GetShopLists = async () => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const responseJson = await fetch(URL_GetShops, requestInfo);
    const result = await responseJson.json();
    return result;
  } catch (e) {
    alertError('Error: ' + e);
  }
};
export const ConfirmNewStore = async (data, listEmployees, actionResult) => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        listEmployees: listEmployees,
      },
      body: JSON.stringify(JSON.stringify(data)),
    };
    const responseJson = await fetch(
      URLDEFAULT + 'shops/confirmnewstore',
      requestInfo,
    );
    const result = await responseJson.json();

    if (result.status == 200) {
      alertNotify(result.messeger);
      actionResult();
    } else {
      alertError(result.messeger);
    }
  } catch (e) {
    alertError('Error: ' + e);
  }
};

export const UpdateShopInfo = async shopinfo => {
  const sql = `UPDATE ${storeList.tableName} SET imageUrl='${shopinfo.imageUrl}' WHERE shopId=${shopinfo.shopId}`;
  await QueryStringSql(sql);
};
export const DeleteItemStore = async shopinfo => {
  const sql = `DELETE FROM ${storeList.tableName} 
        WHERE shopId=${shopinfo.shopId} and auditDate=${shopinfo.auditDate}`;
  await QueryStringSql(sql);
};
