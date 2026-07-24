import { URLDEFAULT, URL_WORKING_SCHEDULE } from '../Core/URLs';
import { GetToken, MessageInfo, Token } from '../Core/Helper';
import {
  URL_UPLOAD_WORKING_SCHEDULE,
  URL_WORKINGPLAN_BYDATE,
  URL_REGIONS,
} from '../Core/URLs';
import { alertError } from '../Core/Utility';
import { QueryStringSql } from '../Core/SqliteDbContext';

export async function UploadBussinessTrip(bussinessInfo, finish) {
  let access_token = await Token();
  try {
    let items = [];
    let dataItem = {
      provinceFromCode: bussinessInfo?.provinceFromCode,
      provinceToCode: bussinessInfo?.provinceToCode,
      fromDate: !isNaN(bussinessInfo?.fromDate)
        ? bussinessInfo?.fromDate
        : parseInt(bussinessInfo?.fromDate.replace(/-/gm, '')),
      toDate: !isNaN(bussinessInfo?.toDate)
        ? bussinessInfo?.toDate
        : parseInt(bussinessInfo?.toDate.replace(/-/gm, '')),
      addressStart: bussinessInfo?.fromAddress,
      locationStart: bussinessInfo?.locationFrom,
      addressEnd: bussinessInfo?.toAddress,
      locationEnd: bussinessInfo?.locationTo,
      supportKM: bussinessInfo?.supportMove,
      supportNight: bussinessInfo?.supportHotel,
      supportLunch: bussinessInfo?.supportRestaurant,
      totalSupport: bussinessInfo?.supportTotal,
      workingKm: JSON.stringify(bussinessInfo?.workingplan),
      typeKM: bussinessInfo?.typeKm + '',
      typePeople: bussinessInfo?.typePeople + '',
    };
    items.push(dataItem);
    let UploadJson = { Details: JSON.stringify(items) };

    await fetch(URL_UPLOAD_WORKING_SCHEDULE, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(UploadJson),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.status == 200) {
          MessageInfo(responseJson.messeger);
          finish();
        } else {
          MessageInfo(responseJson.messeger);
        }
      })
      .catch(error => {
        MessageInfo(error);
      });
  } catch (error) {
    console.log(error);
  }
}
export async function getWorkingPlanByDate(fromDate, toDate) {
  let access_token = await GetToken();
  const requestInfo = {
    method: 'GET',
    headers: {
      authorization: access_token,
      fromDate: fromDate,
      toDate: toDate,
    },
  };

  const responseJson = await fetch(URL_WORKINGPLAN_BYDATE, requestInfo);
  const result = await responseJson.json();
  return result.data;
}
export async function GetListRegions() {
  let access_token = await GetToken();
  const requestInfo = {
    method: 'GET',
    headers: {
      authorization: access_token,
    },
  };

  const responseJson = await fetch(URL_REGIONS, requestInfo);
  const result = await responseJson.json();
  return result.data;
}
export async function GetListWorkingSchedule(fromdate, todate) {
  let access_token = await GetToken();
  const requestInfo = {
    method: 'GET',
    headers: {
      authorization: access_token,
      fromdate: fromdate,
      todate: todate,
    },
  };
  const responseJson = await fetch(URL_WORKING_SCHEDULE, requestInfo);
  const result = await responseJson.json();
  if (result.statusId === 200) return result.data;
  else return result.messeger;
}
// V2
export async function GetBusinesTrips(fromdate, todate, actionResult) {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        authorization: access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        fromdate: fromdate,
        todate: todate,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'WorkingSchedule/getlist',
      requestInfo,
    );
    const result = await responseJson.json();

    if (result.statusId === 200) actionResult(result.data);
    else alertError(result.messeger);
  } catch (e) {
    alertError(`${e}`);
  }
}
export async function GetConfirmTrips(fromdate, todate, actionResult) {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        authorization: access_token,
        fromdate: fromdate,
        todate: todate,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'WorkingSchedule/confirmlist',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId === 200) actionResult(result.data);
    else alertError(result.messeger);
  } catch (e) {
    alertError(`${e}`);
  }
}
export async function GetProvinceByShop(actionResult) {
  let access_token = await GetToken();
  const requestInfo = {
    method: 'GET',
    headers: {
      authorization: access_token,
    },
  };
  const responseJson = await fetch(URLDEFAULT + 'shops/province', requestInfo);
  const result = await responseJson.json();
  if (result.statusId === 200) actionResult(result.data);
  else alertError(result.messeger);
}
export async function GetPlanBusiness(fromDate, toDate, actionResult) {
  let access_token = await GetToken();
  const requestInfo = {
    method: 'GET',
    headers: {
      authorization: access_token,
      fromdate: fromDate,
      todate: toDate,
    },
  };
  const responseJson = await fetch(
    URLDEFAULT + 'workingplan/workplanbydate',
    requestInfo,
  );
  const result = await responseJson.json();
  if (result.statusId === 200) actionResult(result.data);
  else alertError('Lỗi kết nối API');
}
export async function GetDataMasterBusiness(listCode, actionResult) {
  const sql = `SELECT name AS itemName, * FROM masterList WHERE listCode='${listCode}' ORDER BY orderBy`;
  const { res } = await QueryStringSql(sql);
  actionResult(res);
}
export async function UploadBusiness(typeAction, itemTrips, actionResult) {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        typeName: typeAction,
      },
      body: JSON.stringify(JSON.stringify(itemTrips)),
    };
    const responseJson = await fetch(
      URLDEFAULT + 'workingschedule/uploadtrips',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.status === 200) actionResult(result);
    else alertError(result.messeger);
  } catch (e) {
    alertError(`Lỗi ${e}`);
  }
}
export const GetAddressByGeo = async (latlng, actionResult) => {
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
    actionResult(
      info.formatted_address || 'Không xác định',
      info.address_components[3]?.long_name || null,
    );
  } else {
    actionResult('Không xác định', null);
  }
};
export const DataAddressByGeo = async (latlng, actionResult) => {
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
  if ((await result.status) === 'OK') {
    const content = await JSON.parse(result.content || '[{}]');
    const info = (await content?.results[0]) || {};
    actionResult(info.formatted_address || 'Không xác định', null);
  } else {
    actionResult('Không xác định', null);
  }
};
export const GetDataTripBills = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'workingschedule/tripbills',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    return err;
  }
};
export const GetDataTripBillsDetail = async detailId => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        detailId: detailId,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingschedule/tripbillsDetail',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) return result.data;
    return result.messager;
  } catch (err) {
    return err;
  }
};
export const UploadTripBill = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'workingschedule/tripbills',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) return result.data;
    return result.messager;
  } catch (err) {
    return err;
  }
};
export const checkLinkInvoice = async (url, year, month, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        fileUrlInfo: url,
        year: year,
        month: month,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'upload/downloadinvoice',
      requestInfo,
    );
    const result = await response.json();
    actionResult(result);
  } catch (err) {
    return err;
  }
};
export const SendInvoice = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'workingschedule/saveinvoice',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    return err;
  }
};
export const SaveNextBill = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'workingschedule/savenextbill',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    return err;
  }
};
// Confirm Business Trips
export const GetDataConfirmBusiness = async (
  fromdate,
  todate,
  actionResult,
) => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: access_token,
        fromDate: fromdate,
        toDate: todate,
      },
    };
    const responseJson = await fetch(
      URLDEFAULT + 'workingschedule/dataconfirm',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.statusId === 200)
      actionResult(result.data.table, result.data.table1);
    else alertError(result.messeger);
  } catch (e) {
    alertError(`${e}`);
  }
};
export const UploadConfirmBusiness = async (dataConfirm, actionResult) => {
  try {
    let access_token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(dataConfirm)),
    };
    const responseJson = await fetch(
      URLDEFAULT + 'workingschedule/confirmtrips',
      requestInfo,
    );
    const result = await responseJson.json();
    if (result.status === 200) actionResult(result);
    else alertError(result.messeger);
  } catch (e) {
    alertError(`Lỗi ${e}`);
  }
};
