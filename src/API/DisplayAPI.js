import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';

const GetDataDisplayByShop = async (dataFilter, actionResult) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        shopId: dataFilter.shopId,
        reportId: dataFilter.reportId,
        formMode: dataFilter.formMode,
        typeReport: dataFilter.typeReport,
      },
    };
    const response = await fetch(URLDEFAULT + `display/byshop`, requestInfo);
    const result = await response.json();
    if (response.status == 200) {
      await actionResult(result, null);
    } else {
      await actionResult(null, `Lỗi: ${result.messager}`);
    }
  } catch (e) {
    await actionResult(null, `Lỗi: ${e}`);
  }
};

export const DISPLAY = { GetDataDisplayByShop };
