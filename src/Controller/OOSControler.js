import {
  exeSql,
  Store,
  DeleteAll,
  Insert,
  QueryStringSql,
} from '../Core/SqliteDbContext';
import { _competitorId, URL_HISTORY_OOS, URL_UPLOAD_OOS } from '../Core/URLs';
import { alertError, alertNotify } from '../Core/Utility';
import { GetToken } from '../Core/Helper';
import { oosHistory, products, taskList } from '../Core/Table';
import { uploadServer } from './UploadController';
import { oos } from '../Core/TableLocal';

export const GetHistoryOOS = async workinfo => {
  let historyList = [];
  try {
    let access_token = await GetToken();
    await fetch(URL_HISTORY_OOS, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: access_token,
        ShopId: workinfo.shopId,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        historyList = responseJson;
      });
  } catch (error) {
    alertError('' + error);
  }
  //
  await DeleteAll(oosHistory).then(async del => {
    await Insert(oosHistory, historyList);
  });
};
export const getDataTabOOS = async (workId, actionResult) => {
  const sql =
    'SELECT DISTINCT p.categoryId AS tabId, p.categoryName AS tabName' +
    ' FROM products AS p' +
    ' LEFT JOIN oos AS o ON p.productId = o.productId AND o.workId=' +
    workId +
    " WHERE p.productCode NOT IN ('OOS','NOSELL') AND p.type=" +
    _competitorId +
    ' ORDER BY p.categoryId';
  const { res } = await QueryStringSql(sql);
  await actionResult(res);
};
export const getDataOOS = async (workinfo, actionResult) => {
  await insertHistoryOOS(workinfo);
  const sql = `SELECT 0 AS mainIndex,o.*,p.productId,p.productName,p.productCode,p.unit,p.categoryId,p.categoryName,p.subCatId,p.subCategory
        FROM ${products.tableName} AS p
        LEFT JOIN ${oos.tableName} AS o ON p.productId = o.productId AND o.workId=${workinfo.workId}
        WHERE p.productCode NOT IN ('OOS','NOSELL') AND p.type=${_competitorId}
        ORDER BY o.oos DESC ,p.productId ASC
    `;
  const { res } = await QueryStringSql(sql);
  await res.map((i, idx) => {
    i.mainIndex = idx;
  });
  await actionResult(
    res,
    res[0].oosFull == 1 ? true : false,
    res[0].isUploaded == 1 ? true : false,
  );
};
export const updateQuantityOOS = async (item, workinfo) => {
  let sql = `
        UPDATE ${oos.tableName}
        SET quantity=${item.quantity}
        WHERE productId = ${item.productId} AND workId = ${workinfo.workId}`;
  await QueryStringSql(sql);
};
export const updateItemOOS = async (oosItem, isChecked) => {
  await Store().then(async db => {
    const updateOOS = `UPDATE ${oos.tableName} 
            SET oos=${isChecked}, quantity=${oosItem.quantity}
            WHERE workId=${oosItem.workId} 
            AND oosId=${oosItem.oosId}`;
    await exeSql(db, updateOOS);
    //
    const updateOOSFull = `update oos set oosFull=0 where workId=${oosItem.workId}`;
    await exeSql(db, updateOOSFull);
  });
};
export const insertItemOOS = async (workId, oosItem, isChecked) => {
  const sql = `INSERT INTO oos (workId,productId,oos)
        VALUES(${workId},${oosItem.productId},${isChecked})`;
  await QueryStringSql(sql);
};
export const insertHistoryOOS = async workinfo => {
  await GetHistoryOOS(workinfo);
  await Store().then(async db => {
    const dataOOS = 'SELECT * FROM oos AS o WHERE o.workId=' + workinfo.workId;
    const { res, err } = await exeSql(db, dataOOS);
    if (res == undefined || res == null || res.length == 0) {
      const sql = `
                INSERT INTO ${oos.tableName} (workId,productId,oos,quantity)
                SELECT ${workinfo.workId},p.productId,o.oos,o.quantity
                FROM ${products.tableName} AS p
                LEFT JOIN ${oosHistory.tableName} AS o ON p.productId=o.productId AND o.shopId=${workinfo.shopId} AND o.workDate=${workinfo.workDate}
                WHERE p.productCode NOT IN ('OOS','NOSELL') AND p.type=${_competitorId}`;
      await exeSql(db, sql);
    }
  });
};
export const setNoneOOS = async (workId, isNone) => {
  await Store().then(async db => {
    const sql = `UPDATE ${oos.tableName} 
            SET oos=${isNone == 1 ? 0 : null},oosFull=${isNone},quantity=null
            WHERE workId=${workId}`;
    await exeSql(db, sql);
  });
};
export const getDataUploadOOS = async workinfo => {
  let oosUpload = [];
  await Store().then(async db => {
    const sql =
      'select * from oos ' +
      ' where ifnull(oosFull,0)=0 and oos is not null' +
      ' and ifnull(isUploaded,0)=0 and workId = ' +
      workinfo.workId;
    const { res, err } = await exeSql(db, sql);
    if (res.length > 0) {
      oosUpload = res;
    } else {
      const checkOOSFull =
        'select * from oos ' +
        ' where ifnull(oosFull,0)=1 and ifnull(isUploaded,0)=0 and workId = ' +
        workinfo.workId;
      const { res, err } = await exeSql(db, checkOOSFull);
      if (res.length > 0) {
        const getoos =
          'select ' +
          workinfo.shopId +
          ' shopId,' +
          workinfo.workDate +
          ' workDate,productId ,0 as oos' +
          " from products where productCode = 'OOS'";
        const { res, err } = await exeSql(db, getoos);
        oosUpload = res;
      }
    }
  });
  let itemUpload = [];
  oosUpload.forEach(item => {
    let itemOOS = {
      ShopId: workinfo.shopId,
      WorkDate: workinfo.workDate,
      ProductId: item.productId,
      OOS: item.oos,
      Quantity: item.quantity,
    };
    itemUpload.push(itemOOS);
  });
  return itemUpload;
};
// Upload Data
export const doneUpload = async workId => {
  const sql = `UPDATE oos SET isUploaded = 1 WHERE workId = ${workId}`;
  await QueryStringSql(sql);
};
// export const actionUploadOOS = async (workinfo, actionResult) => {
//     const itemUpload = await getDataUploadOOS(workinfo)
//     let uploadJSON = {
//         ShopId: workinfo.shopId,
//         WorkDate: workinfo.workDate,
//         oosDetail: JSON.stringify(itemUpload)
//     }
//     try {
//         let access_token = await GetToken();
//         await fetch(URL_UPLOAD_OOS, {
//             method: 'POST',
//             headers: {
//                 "Accept": "application/json",
//                 "Content-Type": "application/json",
//                 "Authorization": access_token
//             },
//             body: JSON.stringify(uploadJSON)
//         }).then(response => {
//             return response.json();
//         }).then(async (responseJson) => {
//             if (responseJson.status == 200) {
//                 QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
//                 await doneUpload(workinfo.workId)
//             }
//             actionResult(responseJson.messeger)
//         }).catch(error => {
//             console.log(error, "OOS LOG ERROR");
//             actionResult(WARNING_CONNECT_SERVER)
//         });
//     } catch (error) {
//         console.log(error, "OOS LOG ERROR");
//         actionResult("Lỗi: " + error)
//     }
// }

export const actionUploadOOS = async (workinfo, actionResult) => {
  const itemUpload = await getDataUploadOOS(workinfo);
  await uploadServer(workinfo, itemUpload, async result => {
    if (result.statusId == 200) {
      await doneUpload(workinfo.workId);
      actionResult(result);
    }
  });
};
