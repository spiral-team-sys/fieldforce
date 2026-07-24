import { GetToken, ToastError } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';

const GetPlanByMonth = async (month, year) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        month: month,
        year: year,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/planbymonth',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const GetPlanByWeek = async (fromDate, toDate) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        fromDate: fromDate,
        toDate: toDate,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/planbyweekly',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const uploadPlanbyMonth = async (dataPlan, notifyMessager) => {
  try {
    // console.log("" +JSON.stringify(JSON.stringify(dataPlan)) + "", "dataPlan")
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        notifyMessager: notifyMessager,
      },
      body: JSON.stringify(JSON.stringify(dataPlan)),
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/createPlanmonthly',
      requestInfo,
    );
    const result = await response.json();
    return await result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const uploadPlanbyWeek = async dataPlan => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // 'notifyMessager': notifyMessager
      },
      body: JSON.stringify(dataPlan),
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/createPlanweekly',
      requestInfo,
    );
    const result = await response.json();
    return await result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const GetCalendar = async (year, month) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        month: parseInt(month),
        year: parseInt(year),
      },
    };
    // console.log(requestInfo, "requestInfo")
    const response = await fetch(
      URLDEFAULT + 'workingschedule/calendar',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const GetStorePlan = async (fromDate, toDate) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        fromDate: fromDate,
        toDate: toDate,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingschedule/storeplan',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const GetConfirmPlanWeekly = async (fromDate, toDate) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        FromDate: fromDate,
        ToDate: toDate,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/confirmweekly',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
// OFFICE Plan
const GetTeamPlan = async (year, month, employeeId) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        month: month,
        year: year,
        viewBy: employeeId,
        employeeId: employeeId,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/office/teamplan',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    return { statusId: 404, messager: `Lỗi truy cập API: ${err}`, data: [] };
  }
};
const PlanOfficeByMonth = async (year, month, employeeId) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        month: month,
        year: year,
        viewBy: employeeId,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/office/data',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    return { statusId: 404, messager: `Lỗi truy cập API: ${err}`, data: [] };
  }
};
const PlanOfficeDetailByDay = async (jsonData, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(jsonData)),
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/office/details',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) actionResult(result.data || []);
    else {
      ToastError(result.messager);
      actionResult([]);
    }
  } catch (err) {
    ToastError(`Lỗi truy cập API: ${err}`);
    actionResult([]);
  }
};
const PlanOfficeRegister = async (typeAction, jsonData, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        typeAction: typeAction,
      },
      body: JSON.stringify(JSON.stringify(jsonData)),
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/office/register',
      requestInfo,
    );
    const result = await response.json();
    actionResult(result);
  } catch (err) {
    actionResult({ statusId: 404, messager: 'Lỗi truy cập API', data: [] });
  }
};
// OFFICE Confirm
const GetPlanOfficeConfirm = async (year, month) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        month: month,
        year: year,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/office/dataconfirm',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    return { statusId: 404, messager: `Lỗi truy cập API: ${err}`, data: [] };
  }
};
const OfficeDetailByConfirm = async (jsonData, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(jsonData)),
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/office/detailsconfirm',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) actionResult(result.data || []);
    else {
      ToastError(result.messager);
      actionResult([]);
    }
  } catch (err) {
    ToastError(`Lỗi truy cập API: ${err}`);
    actionResult([]);
  }
};
const ConfirmPlanOffice = async (listEmployees, jsonData, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        listEmployees: listEmployees,
      },
      body: JSON.stringify(JSON.stringify(jsonData)),
    };
    const response = await fetch(
      URLDEFAULT + 'workingplan/office/confirm',
      requestInfo,
    );
    const result = await response.json();
    actionResult(result);
  } catch (err) {
    actionResult({ statusId: 404, messager: 'Lỗi truy cập API', data: [] });
  }
};
const getStoreByDate = async (jsonData, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(jsonData)),
    };

    const response = await fetch(
      URLDEFAULT + 'WorkingSchedule/storeplanbydate',
      requestInfo,
    );
    const result = await response.json();
    // console.log(result, 'resultresultresult');
    if (result.statusId == 200) actionResult(result.data || []);
    else {
      ToastError(result.messager);
      actionResult([]);
    }
  } catch (err) {
    ToastError(`Lỗi truy cập API: ${err}`);
    actionResult([]);
  }
};

export const WorkingPlanAPI = {
  GetPlanByMonth,
  uploadPlanbyMonth,
  GetStorePlan,
  GetCalendar,
  uploadPlanbyWeek,
  GetPlanByWeek,
  GetConfirmPlanWeekly,
  GetTeamPlan,
  PlanOfficeByMonth,
  PlanOfficeDetailByDay,
  PlanOfficeRegister,
  GetPlanOfficeConfirm,
  ConfirmPlanOffice,
  OfficeDetailByConfirm,
  getStoreByDate,
};
