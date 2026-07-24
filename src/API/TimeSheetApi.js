import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';
const GetPGTimeSheet = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'timesheet/pgtimesheet',
      requestInfo,
    );
    const result = await response.json();
    // console.log(result)
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const GetConfirmDay = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        employeeId: data.employeeId,
        workDate: data.workDate,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'timesheet/getconfirmday',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const GetMasterListData = async () => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(
      URLDEFAULT + 'timesheet/getmasterlist',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const PostConfirmDay = async confirm => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirm),
    };
    const response = await fetch(
      URLDEFAULT + 'timesheet/confirmday',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const PostCheckTimeSheet = async confirm => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirm),
    };
    const response = await fetch(
      URLDEFAULT + 'timesheet/checktimesheet',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};
const ReportTimeSheet = async reportDate => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        reportDate: reportDate,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'attendants/reporttimesheet',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return { statusId: 404, messager: 'Lỗi truy cập API', data: [] };
  }
};

export const TimeSheetAPI = {
  ReportTimeSheet,
  GetPGTimeSheet,
  GetConfirmDay,
  GetMasterListData,
  PostConfirmDay,
  PostCheckTimeSheet,
};
