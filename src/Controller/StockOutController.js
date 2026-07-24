import { GetToken, Token } from '../Core/Helper';
import { URLDEFAULT, _competitorId } from '../Core/URLs';
import { checkNetwork, alertError } from '../Core/Utility';
import { exeSql, QueryStringSql, Store } from '../Core/SqliteDbContext';
import { All_Select } from '../Component/common';
import { stockout } from '../Core/TableLocal';
import { products, stockHistory } from '../Core/Table';

export const GetListInventory = async (data, actionResult) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertError(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'stock/getlist', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        ShopId: data.ShopId,
        WorkDate: data.WorkDate,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson.data);
      })
      .catch(error => {
        //console.log("ERROR: " + error);
        actionResult([]);
      });
  } catch (e) {
    //console.log("ERROR: " + e);
  }
};

export const UploadInventoryByEmployee = async (dataUpload, actionResult) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertError(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }

  let access_token = await Token();
  await fetch(URLDEFAULT + 'stock/savebyshop', {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access_token,
    },
    body: JSON.stringify(dataUpload),
  })
    .then(response => {
      return response.json();
    })
    .then(responseJson => {
      if (responseJson.status == 200) {
        actionResult(responseJson.messager);
      } else {
        actionResult(responseJson.messager);
      }
    })
    .catch(error => {
      actionResult('ERROR: ' + error);
    });
};

export const GetListInvetoryReport = async (comSelect, search) => {
  var sql = '';
  sql =
    'Select p.marketName AS division,p.*' +
    " FROM products as p WHERE p.productName IS NOT NULL AND p.productCode not in ('OOS','NOSELL') AND p.type = '" +
    _competitorId +
    "'";
  if (comSelect !== All_Select) {
    sql +=
      comSelect !== null && comSelect !== ''
        ? " AND p.marketName='" + comSelect + "'"
        : '';
  }
  if (search !== '') {
    sql += " AND (productName like ('%" + search + "%')";
    sql += " OR productCode like ('%" + search + "%'))";
  }
  sql += ' ORDER BY type,categoryId,subCatId';
  const { res, err } = await QueryStringSql(sql);
  return res || [];
};

export async function getStockProduct(workinfo, competitorId = _competitorId) {
  let sqlInsert = `
    INSERT INTO ${stockout.tableName}(workId,productId,quanity,upload,division,subCategory,subCatId,haveBusiness)
    SELECT ${workinfo.workId} , p.productId,h.stock,0,p.division,p.subCategory, p.subCatId,h.haveBusiness
    FROM ${products.tableName} AS p
    LEFT JOIN ${stockHistory.tableName} AS h ON p.productId = h.productId AND h.shopId = ${workinfo.shopId}
    WHERE p.report = 1 AND NOT EXISTS (SELECT 1 FROM ${stockout.tableName} AS s WHERE s.workId = ${workinfo.workId} AND s.productId = p.productId)`;
  await QueryStringSql(sqlInsert);
  //
  let sql = `SELECT s.*,p.type AS divisionId,p.productName, p.categoryName,p.productCode, p.categoryId
        FROM ${stockout.tableName} AS s
        LEFT JOIN ${products.tableName} AS p ON p.productId=s.productId AND p.report = 1 
        LEFT JOIN ${stockHistory.tableName} AS h ON h.productId=p.productId AND h.shopId=${workinfo.shopId}
        WHERE p.productName IS NOT NULL AND p.productCode not in ('OOS', 'NOSELL')
        AND p.type=${competitorId} AND s.workId=${workinfo.workId} 
        ORDER BY p.type, p.categoryId, s.subCatId, s.productId`;
  const { res, err } = await QueryStringSql(sql);
  return res || [];
}

export async function updateStockByHistory(workinfo) {
  let sql = `UPDATE ${stockout.tableName}
        SET (quanity) 
        = (SELECT h.stock
        FROM ${stockHistory.tableName} h
        WHERE ${stockout.tableName}.productId = h.productId AND h.shopId = ${workinfo.shopId})`;
  await QueryStringSql(sql);
}

export async function updateStockItem(item, workinfo) {
  let sql = `
    UPDATE ${stockout.tableName}
    SET quanity=${item.quanity} ,haveBusiness=${item.haveBusiness} 
    WHERE productId = ${item.productId} AND workId = ${workinfo.workId}`;
  await QueryStringSql(sql);
}

export async function clearAllDataStock(workinfo) {
  let sql = `UPDATE ${stockout.tableName}
            SET quanity = null,haveBusiness=null
            WHERE workId=${workinfo.workId}`;
  await QueryStringSql(sql);
}
export async function clearStockByCategory(workinfo, itemCategory) {
  const sql = `
        UPDATE ${stockout.tableName}
        SET quanity = null,haveBusiness=null
        WHERE workId=${workinfo.workId}
        AND productId IN (
            SELECT s.productId
            FROM ${stockout.tableName} AS s
            LEFT JOIN ${products.tableName} AS p ON p.productId=s.productId 
            WHERE s.workId=${workinfo.workId} AND p.categoryId=${itemCategory.categoryId} AND p.type = ${itemCategory.competitorId}
        )`;
  await QueryStringSql(sql);
}

export async function getlistTabByCategory(competitorId) {
  let sql = `SELECT DISTINCT categoryId, categoryName
                FROM ${products.tableName}
                WHERE productCode NOT IN ('OOS','NOSELL') AND report = 1
                AND type = ${competitorId}
                ORDER BY categoryId`;
  const { res, err } = await QueryStringSql(sql);
  return res || [];
}

export const getCompetitorByProduct = async () => {
  const sql = `SELECT DISTINCT type AS id, division AS name, division AS itemName
        FROM ${products.tableName} 
        WHERE productCode NOT IN ('OOS','NOSELL')
        AND report=1
        ORDER BY type
    `;
  const { res } = await QueryStringSql(sql);
  return res || [];
};

export async function updateStockNote(note, workinfo) {
  let sql = `
    UPDATE ${stockout.tableName}
    SET displayComment='${note}'
    WHERE workId = ${workinfo.workId}`;
  await QueryStringSql(sql);
  return true;
}
export const GetListWarehouse = async actionResult => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertError(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'stock/listwarehouse', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        actionResult(responseJson.data);
      })
      .catch(error => {
        //console.log("ERROR: " + error);
        actionResult([]);
      });
  } catch (e) {
    //console.log("ERROR: " + e);
  }
};
export async function getAllProductStock() {
  let sql = `SELECT *
    FROM ${products.tableName} AS p
    WHERE p.report = 1 AND p.productName IS NOT NULL AND p.productCode not in ('OOS', 'NOSELL')
    ORDER BY p.type, p.categoryId, p.subCatId, p.productId`;
  const { res, err } = await QueryStringSql(sql);
  return res || [];
}
export async function getAllCategoryByProduct() {
  let sql = `SELECT DISTINCT categoryId, categoryName, type as competitorId, division as competitorName
    FROM ${products.tableName} AS p
    WHERE p.report = 1 AND p.productName IS NOT NULL AND p.productCode not in ('OOS', 'NOSELL')
    ORDER BY p.type, p.categoryId`;
  const { res, err } = await QueryStringSql(sql);
  return res || [];
}
export const uploadTotalInventory = async (dataStock, actionResult) => {
  try {
    // console.log(dataStock);
    let access_token = await Token();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(JSON.stringify(dataStock)),
    };
    const responseJson = await fetch(
      URLDEFAULT + 'stock/uploadwarehouse',
      requestInfo,
    );
    const result = await responseJson.json();
    actionResult(result);
  } catch (e) {
    alertError('Error: ' + e);
  }
};
