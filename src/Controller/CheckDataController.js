import { Store, exeSql } from '../Core/SqliteDbContext';
import { _competitorName } from '../Core/URLs';

export async function checkImageDisplay(mWORK) {
  let mResult = '';
  await Store().then(async db => {
    const sql =
      "select 4 as target, COUNT(*) as actual, 'Vui lòng chụp đầy đủ hình ảnh của " +
      _competitorName +
      " ('||COUNT(*)||'/4)' as alertMessage" +
      ' from photos where shopId = ' +
      mWORK.shopId +
      ' and photoDate = ' +
      mWORK.workDate +
      " and photoType like 'DISPLAY_" +
      _competitorName +
      "_%'";
    const { res, err } = await exeSql(db, sql);
    if (res !== null && res !== undefined) {
      if (res[0].actual < res[0].target) {
        mResult = res[0].alertMessage;
      }
    } else {
      mResult = 'Vui lòng chụp đầy đủ 4 tấm hình ' + _competitorName;
    }
  });
  return mResult;
}
export function checkDoneReport(mWORK, reportId) {
  let resultDone = 0;
  switch (reportId) {
    case 1: // SellOut
      resultDone = doneSelloutReport(mWORK);
      break;
    case 3: // Display
      break;
    case 4: // OOS
      break;
  }
}
export function doneSelloutReport(mWORK) {
  let isUploaded = 0;
  Store().then(async db => {
    const sql =
      'select distinct ifnull(upload,0) as upload from sellOut where workId = ' +
      mWORK.workId;
    const { res, err } = await this.exeSql(db, sql);
    isUploaded = res[0].upload;
  });
  return isUploaded;
}

// Beko
export async function checkImageBeko(shopId, photoDate) {
  let mResult = '';
  await Store().then(async db => {
    const sql =
      'SELECT m.numberValue AS [target],' +
      '(SELECT COUNT(*) FROM photos AS p WHERE p.shopId=' +
      shopId +
      ' AND p.photoDate=' +
      photoDate +
      " AND p.photoType like '333_'||m.code) AS actual,m.name" +
      ' FROM masterList AS m ' +
      " WHERE listCode = 'CAMERA_DISPLAY'";
    const { res, err } = await exeSql(db, sql);
    if (res !== null && res !== undefined) {
      res.map(item => {
        if (item.actual < item.target) {
          mResult += item.name + ',';
        }
      });
    }
  });
  return mResult;
}
