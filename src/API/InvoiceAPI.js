import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';
import { toastError } from '../Utils/configToast';

const GetStatusInvoice = async actionResult => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
      },
    };
    const response = await fetch(`${URLDEFAULT}invoice/status`, requestInfo);
    const result = await response.json();
    if (result.statusId == 200) {
      actionResult && actionResult(result.data || []);
    } else {
      toastError('Lỗi dữ liệu', result.messager);
    }
  } catch (error) {
    toastError('Lỗi', error);
  }
};
const CheckFileInvoice = async (data, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(JSON.stringify(data)),
    };
    const response = await fetch(`${URLDEFAULT}invoice/checkfile`, requestInfo);
    const result = await response.json();
    if (result.statusId == 200) {
      const dataResult = result.data || [];
      actionResult && actionResult(dataResult);
      return dataResult;
    } else {
      toastError('Lỗi dữ liệu', result.messager);
      return [];
    }
  } catch (error) {
    toastError('Lỗi', error);
    return [];
  }
};

const UpdateInvoice = async (typeAction, itemUpload, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        typeAction: typeAction,
      },
      body: JSON.stringify(JSON.stringify(itemUpload)),
    };
    const response = await fetch(
      `${URLDEFAULT}upload/invoice/update`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) {
      actionResult && actionResult(true);
    } else {
      toastError('Thông báo', result.messager);
    }
  } catch (e) {
    toastError('Lỗi dữ liệu', `${e}`);
  }
};

export const INVOICE_API = {
  GetStatusInvoice,
  CheckFileInvoice,
  UpdateInvoice,
};
