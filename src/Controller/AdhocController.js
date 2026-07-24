import { Token, GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';

export const GetDataFormNow = async () => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    };
    const response = await fetch(URLDEFAULT + 'download/formnow', requestInfo);
    const result = await response.json();
    console.log(result);

    if (result.statusId === 200) {
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    console.log('Lỗi: ', err);
    return [];
  }
};
export const GetFormStatus = async id => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        formId: id,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'download/formcompleted',
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) {
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    alert(JSON.stringify(err));
    return [];
  }
};
export const GetSpiralForm = async (shopId = 0) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        ShopId: shopId,
      },
    };
    const response = await fetch(URLDEFAULT + 'download/formlist', requestInfo);
    const result = await response.json();
    if (result.statusId === 200) {
      return result.data;
    } else {
      alert(JSON.stringify(result));
    }
    return [];
  } catch (err) {
    return [];
  }
};
export const SubmitAdhocSurvey = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(URLDEFAULT + 'upload/spiralform', requestInfo);
    const result = await response.json();
    return result;
  } catch (e) {
    return { messager: 'Lỗi' };
  }
};
export const SubmitImageAdhocSurvey = async data => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      URLDEFAULT + 'upload/spiralphoto',
      requestInfo,
    );
    const result = await response.json();
    return result;
  } catch (e) {
    return { messager: 'Lỗi' };
  }
};
