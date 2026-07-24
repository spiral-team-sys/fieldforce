import { checkNetwork, alertWarning } from '../Core/Utility';
import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';

export const getListExam = async actionResult => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    const access_token = await GetToken();
    await fetch(URLDEFAULT + 'exam/getlist', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: access_token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult('', responseJson);
      })
      .catch(error => {
        actionResult('Lỗi: ' + error, []);
      });
  } catch (e) {
    //console.log("Error: " + e)
  }
};
const uploadTrans = async data => {
  try {
    const access_token = await GetToken();
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: access_token,
    };
    const response = await fetch(URLDEFAULT + 'exam/trans', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });
    // console.log(access_token, "d", data)
    return await response.json();
  } catch (error) {
    return { messenger: 'Lỗi: ' + error, statusId: 404 };
  }
};
export const uploadExam = async (dataExam, actionResult) => {
  let data = {
    ExamId: dataExam[0].ExamId,
    DataExam: JSON.stringify(dataExam),
  };
  try {
    const access_token = await GetToken();
    await fetch(URLDEFAULT + 'exam/save', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: access_token,
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson);
      })
      .catch(error => {
        actionResult('Lỗi: ' + error);
      });
  } catch (error) {
    actionResult('Lỗi: ' + error);
  }
};
export const checkExam = async actionResult => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    const access_token = await GetToken();
    await fetch(URLDEFAULT + 'exam/check', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: access_token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson);
      })
      .catch(error => {
        actionResult('Lỗi: ' + error, []);
      });
  } catch (e) {
    console.log('Error: ' + e);
  }
};
export const EXAM_API = { uploadTrans };
