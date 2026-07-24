import { URLDEFAULT } from '../Core/URLs';
import { GetToken } from '../Core/Helper';
import { checkNetwork, alertWarning } from '../Core/Utility';
import { masterList } from '../Core/Table';
import { QueryStringSql } from '../Core/SqliteDbContext';

export async function GetHistoryAttendant(attendantDate, actionResult) {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertWarning(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    const token = await GetToken();
    await fetch(URLDEFAULT + 'attendants/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        AttendantDate: attendantDate,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson.data.table, responseJson.data.table1);
      });
  } catch (e) {
    console.log(e);
  }
}
export const MenuHistoryConfirm = async actionResult => {
  const sql = `SELECT * FROM ${masterList.tableName} WHERE listCode='HistoryConfirm'`;
  const { res, err } = await QueryStringSql(sql);
  actionResult(res || []);
};
