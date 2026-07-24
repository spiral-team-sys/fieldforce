import { getIdMaxMessenger } from '../Controller/NotificationController';
import { GetToken } from '../Core/Helper';
import { Insert } from '../Core/SqliteDbContext';
import { messenger } from '../Core/Table';
import { URLDEFAULT } from '../Core/URLs';
import { checkNetwork } from '../Core/Utility';

export const LogDataToServer = async (logType, logValue, logMess) => {
  try {
    const token = await GetToken();
    const data = { logType: logType, logValue: logValue, logMess: logMess };
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(data)),
    };
    const response = await fetch(URLDEFAULT + 'log/logs', requestInfo);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error, 'logToServer');
  }
};
//
const GetInApp = async (InAppId, isViewDetail) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        inAppId: InAppId,
        isViewDetail: isViewDetail || 0,
      },
    };
    const response = await fetch(`${URLDEFAULT}notify/inapp`, requestInfo);
    return await response.json();
  } catch (e) {
    console.log(e);
    return { statusId: 404, messager: "can't conected api", data: [] };
  }
};
const PostLog = async logInfo => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(JSON.stringify(logInfo)),
    };
    const response = await fetch(`${URLDEFAULT}notify/loginapp`, requestInfo);
    return await response.json();
  } catch (e) {
    console.log(e, 'PostLog');
    return { statusId: 404, messager: "can't conected api", data: [] };
  }
};
const RequestReportNotify = async (data, actionResult) => {
  try {
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
    const response = await fetch(
      `${URLDEFAULT}notify/requestreport`,
      requestInfo,
    );
    const result = await response.json();
    actionResult(result);
  } catch (e) {
    actionResult({ statusId: 404, messager: "can't conected api", data: [] });
  }
};
const GetDataNotify = async actionResult => {
  const result = await getIdMaxMessenger();
  const idMax = result?.length > 0 ? result[0]?.max || 0 : 0;
  let isNetwork = await checkNetwork();
  if (!isNetwork) return;
  try {
    let token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        LastId: idMax,
      },
    };
    const response = await fetch(`${URLDEFAULT}notify/byuser`, requestInfo);
    const result = await response.json();
    if (Array.isArray(result) && result.length > 0) {
      await Insert(messenger, result);
    }
    actionResult && (await actionResult(result));
  } catch (error) {
    console.log(error);
    actionResult && actionResult([]);
  }
};
//
const SendNotification = async (data, actionResult) => {
  try {
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
    const response = await fetch(`${URLDEFAULT}notify/send`, requestInfo);
    console.log(response);

    const result = await response.json();
    console.log(result);

    actionResult && actionResult(result);
  } catch (e) {
    actionResult &&
      actionResult({ statusId: 404, messager: "can't conected api", data: [] });
  }
};
//
export const NotificationAPI = {
  GetInApp,
  GetDataNotify,
  PostLog,
  RequestReportNotify,
  SendNotification,
};
