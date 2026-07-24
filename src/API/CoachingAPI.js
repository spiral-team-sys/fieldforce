import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';

const UploadDataByEmployee = async (
  shopId,
  reportId,
  dataUpload,
  actionResult,
) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        shopId: shopId,
        reportId: reportId,
      },
      body: JSON.stringify(JSON.stringify(dataUpload)),
    };
    const response = await fetch(
      URLDEFAULT + 'training/upload/fieldcoaching',
      requestInfo,
    );
    const result = await response.json();
    if (result.status == 200) actionResult(result.messeger);
  } catch (e) {
    actionResult(`Lỗi: ${e}`);
  }
};
export const COACHING = { UploadDataByEmployee };
