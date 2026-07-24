import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';

const GetDataShopManager = async actionResult => {
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
    const response = await fetch(
      `${URLDEFAULT}shops/storemaintant`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId == 200) actionResult && actionResult(result.data);
    else actionResult && actionResult([], result.messager);
  } catch (e) {
    actionResult && actionResult([], `Lỗi dữ liệu: ${e}`);
  }
};

const GetDataMasterStore = async actionResult => {
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
    const response = await fetch(
      `${URLDEFAULT}shops/confignewstore`,
      requestInfo,
    );
    const result = await response.json();
    if (result.statusId === 200) actionResult && actionResult(result.data);
    else actionResult && actionResult([], result.messager);
  } catch (e) {
    actionResult && actionResult([], `Lỗi dữ liệu: ${e}`);
  }
};

export const SHOPAPI = { GetDataShopManager, GetDataMasterStore };
