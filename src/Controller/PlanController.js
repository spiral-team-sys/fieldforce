import {
  URL_WORKINGPLAN_GETLIST,
  URL_WORKINGPLAN_CHANGE,
  URL_GET_SHIFTTYPE,
  URL_WORKINGPLAN_CHANGESHIFT,
  URL_REGISTERPLAN_GETLIST,
  URL_REGISTERPLAN_LISTWEEK,
  URL_REGISTERPLAN_COPY,
  URL_GET_LISTWEEK,
  URL_WORKINGPLAN_UPLOAD_IMAGE,
  URL_REGISTERPLAN_SAVE,
  URLDEFAULT,
} from '../Core/URLs';
import { checkNetwork, alertError } from '../Core/Utility';
import { Token, GetToken } from '../Core/Helper';
import moment from 'moment';

export async function WORKINGPLAN_GetList(dateSelected, actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URL_WORKINGPLAN_GETLIST, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        PlanDate: dateSelected,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(null, responseJson, responseJson[0].isEdit);
      });
  } catch (error) {
    actionResult(error, [], 0);
  }
}
export async function REGISTERPLAN_GetByWeek(weekByYear, actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URL_REGISTERPLAN_GETLIST, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        WeekByYear: weekByYear,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(null, responseJson);
      });
  } catch (error) {
    actionResult(error, []);
  }
}
export async function REGISTERPLAN_GetCopyPlan(weekByYear, actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'workingplan/list/copyplan', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + access_token,
        WeekByYear: weekByYear,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(null, responseJson);
      });
  } catch (error) {
    actionResult(error, []);
  }
}

export async function V2_REGISTERPLAN_GetByWeek(
  fromDate,
  toDate,
  actionResult,
) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await GetToken();
    await fetch(URLDEFAULT + 'workingplan/planbyweek/v2', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: access_token,
        FromDate: fromDate,
        ToDate: toDate,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(null, responseJson);
      });
  } catch (error) {
    console.log(error);
    actionResult(error, []);
  }
}
export async function V2_REGISTERPLAN_GetCopyPlan(
  fromDate,
  toDate,
  actionResult,
) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await GetToken();
    await fetch(URLDEFAULT + 'workingplan/list/copyplanv2', {
      method: 'GET',
      headers: {
        Authorization: access_token,
        FromDate: fromDate,
        ToDate: toDate,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(null, responseJson || []);
      });
  } catch (error) {
    actionResult(error, []);
  }
}

export async function GET_ListWeek(actionResult) {
  try {
    let access_token = await Token();
    await fetch(URL_GET_LISTWEEK, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(null, responseJson);
      });
  } catch (error) {
    actionResult(error, []);
  }
}
export async function REGISTERPLAN_ListWeek(actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URL_REGISTERPLAN_LISTWEEK, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson);
      });
  } catch (error) {
    actionResult([]);
  }
}
export async function REGISTERPLAN_Copy(weekByYear) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URL_REGISTERPLAN_COPY, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        WeekByYear: weekByYear,
      },
    });
  } catch (e) {
    actionResult('' + e);
  }
}
export async function REGISTERPLAN_SavePlan(
  weekByYear,
  PlanChange,
  actionResult,
) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  let itemPlan = [];
  PlanChange.forEach(i => {
    let infoPlan = {
      PlanId: i.planId,
      ShopId: i.shopId,
      WorkDate: i.dateSave,
      ShiftType:
        i.shiftChange !== null && i.shiftChange.length > 0
          ? i.shiftChange
          : i.shiftType,
      Note: i.notes,
    };
    itemPlan.push(infoPlan);
  });

  let uploadJSON = JSON.stringify(itemPlan);
  try {
    let access_token = await Token();
    await fetch(URL_REGISTERPLAN_SAVE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        WeekByYear: weekByYear,
      },
      body: JSON.stringify(uploadJSON),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson.messeger);
      })
      .catch(error => {
        actionResult('' + error);
      });
  } catch (e) {
    actionResult('' + e);
  }
}
export async function PLAN_uploadData(
  lstWorkingPlan,
  actionResult,
  isProgress,
) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  let itemPlan = [];
  lstWorkingPlan.forEach(i => {
    let infoPlan = {
      ShopId: i.shopId,
      PlanDate: i.planDate,
      StatusPlan: i.isWorking,
    };
    itemPlan.push(infoPlan);
  });
  let uploadJSON = JSON.stringify(itemPlan);
  try {
    let access_token = await Token();
    await fetch(URL_WORKINGPLAN_CHANGE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(uploadJSON),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson.messeger);
        isProgress(false);
      })
      .catch(error => {
        actionResult('' + error);
        isProgress(false);
      });
  } catch (e) {
    actionResult('' + e);
    isProgress(false);
  }
}
export async function PLAN_ChangeShift(data, actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  let dataSubmit = {
    ShopId: data.shopId,
    PlanDate: data.dateSave,
    ShiftChange: data.shiftChange || null,
    NoteChangeShift: data.notes || null,
  };

  let dataUpload = {
    isSendNotify: 1,
    dataPlan: JSON.stringify([dataSubmit]),
    contentMessage: data.contentMessage,
  };

  try {
    const access_token = await Token();
    await fetch(URLDEFAULT + 'workingplan/pg/changeshift', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        listEmployees: data.listEmployees || null,
      },
      body: JSON.stringify(dataUpload),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult({
          msg: responseJson.messeger,
          status: responseJson.status,
        });
      })
      .catch(error => {
        actionResult({ msg: 'Error::' + error, status: 403 });
      });
  } catch (e) {
    actionResult({ msg: 'Error: ' + e, status: 400 });
  }
}
export async function PLAN_WorkingLate(data, isLate, actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  let dataSubmit = {
    ShopId: data.shopId,
    PlanDate: data.dateSave,
    IsUpdateLate: isLate ? 1 : 0,
  };
  if (isLate) {
    dataSubmit.TimeLate = data.timeLate || null;
    dataSubmit.NoteLate = data.noteLate || null;
  } else {
    dataSubmit.TimeEarlier = data.timeEarlier || null;
    dataSubmit.NoteEarlier = data.noteEarlier || null;
  }
  let dataUpload = {
    isSendNotify: 1,
    dataPlan: JSON.stringify([dataSubmit]),
    contentMessage: data.contentMessage,
  };

  try {
    const access_token = await Token();
    await fetch(URLDEFAULT + 'workingplan/pg/workinglate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        listEmployees: data.listEmployees || null,
      },
      body: JSON.stringify(dataUpload),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult({
          msg: responseJson.messeger,
          status: responseJson.status,
        });
      })
      .catch(error => {
        actionResult({ msg: '' + error, status: 403 });
      });
  } catch (e) {
    actionResult({ msg: '' + e, status: 400 });
  }
}
export async function PLAN_UploadImage(data, dataImage, actionResult) {
  try {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      alertWarning(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    for (let i = 0, lenImages = dataImage.length; i < lenImages; i++) {
      const dataSubmit = {
        ShopId: data.shopId,
        PhotoDate: data.dateSave,
        PhotoName: dataImage[i].fileName,
        PhotoData: dataImage[i].imageBase64,
        PhotoTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
      const access_token = await Token();
      await fetch(URL_WORKINGPLAN_UPLOAD_IMAGE, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + access_token,
        },
        body: JSON.stringify(dataSubmit),
      })
        .then(response => {
          return response.json();
        })
        .then(responseJson => {
          actionResult({
            msg: responseJson.messeger,
            status: responseJson.status,
          });
        })
        .catch(error => {
          actionResult({ msg: '' + error, status: 403 });
        });
    }
  } catch (e) {
    actionResult({ msg: '' + e, status: 400 });
  }
}
export async function GetListShift(actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URL_GET_SHIFTTYPE, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson);
      });
  } catch (error) {
    alertError(error);
  }
}
// SR
export async function SR_PLAN_ChangeShift(
  lstWorkingPlan,
  actionResult,
  isProgress,
) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  let itemPlan = [];
  lstWorkingPlan.forEach(i => {
    let infoPlan = {
      ShopId: i.shopId,
      PlanDate: i.planDate,
      ShiftChange: i.shiftChange,
      NoteChangeShift: i.notes,
    };
    itemPlan.push(infoPlan);
  });
  let uploadJSON = JSON.stringify(itemPlan);
  try {
    let access_token = await Token();
    await fetch(URL_WORKINGPLAN_CHANGESHIFT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(uploadJSON),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson.messeger);
        isProgress(false);
      })
      .catch(error => {
        actionResult('' + error);
        isProgress(false);
      });
  } catch (e) {
    actionResult('' + e);
    isProgress(false);
  }
}
export async function SR_PLAN_GETLIST(data, actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'workingplan/plansr', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        PlanDate: data.PlanDate,
        Week: data.Week,
        Year: data.Year,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(
          responseJson.table1,
          responseJson.table,
          responseJson.table2 || [],
        );
      });
  } catch (error) {
    actionResult([], []);
  }
}
export const PLANSR_ACTION = async (data, employeeSend) => {
  try {
    const token = await Token();
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        listEmployees: employeeSend,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/sraction',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (e) {}
};
// Sup Confirm
export const GetDataConfirmBySR = async (data, resultAction, errorAction) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'workingplan/confirmsr', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        resultAction(
          responseJson.table1,
          responseJson.table,
          responseJson.table2,
        );
      });
  } catch (error) {
    errorAction(error);
  }
};
export const GetDataConfirmByPG = async (data, resultAction, errorAction) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'workingplan/confirmpg', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        resultAction(
          responseJson.table1,
          responseJson.table,
          responseJson.table2,
        );
      });
  } catch (error) {
    errorAction(error);
  }
};
export const ACTION_CONFIRM_SR = async (
  dataPlan,
  listEmployees,
  resultAction,
) => {
  let jsonBody = JSON.stringify(dataPlan);
  try {
    const token = await Token();
    await fetch(URLDEFAULT + 'workingplan/sr/supconfirm', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        ListEmployees: listEmployees,
      },
      body: JSON.stringify(jsonBody),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        resultAction(responseJson.messeger);
      });
  } catch (error) {
    resultAction('' + error);
  }
};
export const ACTION_CONFIRM_PG = async (
  dataPlan,
  listEmployees,
  resultAction,
) => {
  let jsonBody = JSON.stringify(dataPlan);
  try {
    const token = await Token();
    await fetch(URLDEFAULT + 'workingplan/pg/supconfirm', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        ListEmployees: listEmployees,
      },
      body: JSON.stringify(jsonBody),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        resultAction(responseJson.messeger);
      });
  } catch (error) {
    resultAction(error);
  }
};
// History Confirm
export const GetHistoryConfirm = async (
  typeConfirm,
  childEmployee,
  month,
  year,
  resultAction,
) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'history/confirmplan', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        TypeConfirm: typeConfirm,
        ChildEmployee: childEmployee,
        Month: month,
        Year: year,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        resultAction(
          responseJson.data.table,
          responseJson.data.table1,
          responseJson.data.table2,
        );
      });
  } catch (error) {
    console.log(error);
  }
};
export const GetConfigPlan = async (fromDate, toDate, resultAction) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alert(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        FromDate: fromDate,
        ToDate: toDate,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/configplan',
      requestInfo,
    );
    const result = await response.json();
    resultAction(result.data);
  } catch (error) {
    resultAction({ statusId: 500, messeger: error });
  }
};
