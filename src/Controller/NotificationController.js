import { checkNetwork } from '../Core/Utility';
import { Token } from '../Core/Helper';
import { URL_DOWNLOAD_MESSENGER, URL_UPDATE_MESSENGER } from '../Core/URLs';
import {
  createTableNow,
  Insert,
  QueryStringSql,
  Store,
} from '../Core/SqliteDbContext';
import { messenger } from '../Core/Table';

export const fetchDataNotify = async actionResult => {
  const result = await getIdMaxMessenger();
  const idMax = result?.length > 0 ? result[0]?.max || 0 : 0;
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    return;
  }
  try {
    let token = await Token();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        LastId: idMax,
      },
    };
    const response = await fetch(URL_DOWNLOAD_MESSENGER, requestInfo);
    const result = await response.json();
    if (Array.isArray(result) && result.length > 0) {
      await Insert(messenger, result);
    }
    actionResult && (await actionResult(result));
  } catch (error) {
    console.log(error);
  }
};
export const updateNotifyData = async (notifyId, typeSend) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    return;
  }
  try {
    let token = await Token();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        notifyId: notifyId,
        typeSend: typeSend,
      },
    };
    const response = await fetch(URL_UPDATE_MESSENGER, requestInfo);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};
export const getIdMaxMessenger = async () => {
  const sql = 'Select Max(Id) as max FROM messenger';
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export const getDataNotify = async actionResult => {
  const sql = `SELECT * FROM ${messenger.tableName} WHERE typeReport!='Payslip' ORDER BY id DESC`;
  const { res } = await QueryStringSql(sql);
  actionResult && actionResult(res);
  return res || [];
};
export const readNotifyUpdate = async id => {
  const sql = `UPDATE messenger SET seen=1 WHERE id=${id}`;
  await QueryStringSql(sql);
};
export const makeReadAllNotify = async () => {
  const sql = `UPDATE messenger set seen=1`;
  await QueryStringSql(sql);
};
export const checkSeenInApp = async () => {
  const sql = `SELECT MAX(Id) AS max FROM messenger WHERE typeReport='InApp'`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export const getTotalNotification = async actionResult => {
  const sql = `SELECT * FROM ${messenger.tableName} WHERE (seen IS NULL OR seen = 0) AND typeReport is not null AND typeReport not in ('Payslip')`;
  console.log(sql);

  const { res } = await QueryStringSql(sql);
  actionResult && actionResult(res.length || 0);
  return res.length || 0;
};
