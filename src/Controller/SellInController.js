import {
  Store,
  exeSql,
  InsertItems,
  DeleteItem,
  UpdateItem,
  QueryStringSql,
  Insert,
} from '../Core/SqliteDbContext';
import { URLDEFAULT, AppNameBuild, _competitorId, psvApp } from '../Core/URLs';
import { GetToken, Token } from '../Core/Helper';
import { checkNetwork } from '../Core/Utility';
import { masterList, products, taskList } from '../Core/Table';
import { getCategoryProduct } from './WorkController';
import { sellIn } from '../Core/TableLocal';

// Config Input
export const getConfigSellIn = async actionResult => {
  await Store().then(async db => {
    const sql =
      'SELECT * FROM ' +
      masterList.tableName +
      " WHERE listCode='SELLIN_CONFIG' ORDER BY orderBy";
    const { res, err } = await exeSql(db, sql);
    actionResult(res);
  });
};
// Get Store
export const getStoreBySellIn = async () => {
  let dataResult = [];
  try {
    let access_token = await GetToken();
    await fetch(URLDEFAULT + 'sellin/storelist', {
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
        dataResult = responseJson.data;
      })
      .catch(error => {
        //console.log("ERROR: " + error);
      });
  } catch (e) {
    //console.log("ERROR: " + e);
  }
  return dataResult;
};
// Create SellIn
export const getListDealer = async () => {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'select dealerId as id,dealerName as name from dealer order by dealerName';
    const { res, err } = await exeSql(db, sql);
    // console.log(res, err);
    lst = res;
  });
  return lst;
};
export const getCompetitorByProduct = async () => {
  let lst = [];
  await Store().then(async db => {
    let sql = `select distinct type as id, division as name from products WHERE productCode not in ('OOS','NOSELL') and type = ${_competitorId} `;
    if (AppNameBuild === psvApp) {
      sql =
        'select competitorId as id, competitorName as name from competitor ';
    }
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
};
export const getCategoryByProduct = async () => {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "select categoryId as id, categoryName as name,type from products WHERE productCode not in ('OOS','NOSELL')" +
      ' and type = ' +
      _competitorId +
      ' group by categoryId,categoryName';
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
};
export const getSubCategoryByProduct = async () => {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "select subCatId as id, subCategory as name,categoryId,type from products WHERE productCode not in ('OOS','NOSELL')" +
      ' and type = ' +
      _competitorId +
      ' group by subCatId,subCategory';
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
};
export const getSegmentByProduct = async () => {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "select segmentId as id, segment as name,subCatId,categoryId,type from products WHERE productCode not in ('OOS','NOSELL')" +
      ' and segmentId>0 and type = ' +
      _competitorId +
      ' group by segmentId,segment';
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
};
export const getSubSegmentByProduct = async () => {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "select subSegmentId as id, subSegment as name, segmentId,subCatId,categoryId,type from products WHERE productCode not in ('OOS','NOSELL')" +
      ' and type = ' +
      _competitorId +
      ' group by subSegmentId,subSegment';
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
};
export const getListProducts = async () => {
  let lst = [];
  await Store().then(async db => {
    const sql = `select productId as id, productName as name, productCode, categoryId, categoryName, subSegmentId,segmentId,subCatId,subCategory,categoryId,type as competitorId,price
        from products 
        WHERE productCode not in ('OOS','NOSELL') and type = ${_competitorId}
        order by categoryId,subCatId,productName
        `;
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
};

export const saveItemSellIn = async (itemSave, resultMessage) => {
  if (itemSave.id) {
    const sql = `UPDATE ${sellIn.tableName}
            SET dealerId=${itemSave.dealerId},
                productId=${itemSave.productId},
                competitorId=${itemSave.competitorId},
                categoryId=${itemSave.categoryId},
                quantityValue=${itemSave.quantityValue},
                notes="${itemSave.notes}"
            WHERE id= ${itemSave.id}`;
    await QueryStringSql(sql);
    // console.log(sql, 'check query')
    resultMessage('Thay đổi thành công');
  } else {
    await Insert(sellIn, [itemSave]);
    resultMessage('Thêm thành công');
  }
};
export const deleteItemSellIn = async idSellIn => {
  await Store().then(async db => {
    await DeleteItem(db, 'sellIn', { id: idSellIn });
  });
};
export const getAllDataConfig = async actionResult => {
  const lstDealer = await getListDealer();
  const lstCompetitor = await getCompetitorByProduct();
  const lstCategory = await getCategoryByProduct();
  const lstSubCategory = await getSubCategoryByProduct();
  const lstSegment = await getSegmentByProduct();
  const lstSubSegment = await getSubSegmentByProduct();
  const lstProducts = await getListProducts();
  actionResult(
    lstDealer,
    lstCompetitor,
    lstCategory,
    lstSubCategory,
    lstSegment,
    lstSubSegment,
    lstProducts,
  );
};
// Get List SellIn
export const getDataSellIn = async mWork => {
  const sql = `SELECT 0 as isChoose,s.*,p.productName,d.dealerName,c.competitorName,p2.categoryName,NULL AS groupName 
    FROM sellIn as s
    left join products as p on s.productId=p.productId
    left join (select distinct categoryId, categoryName from products d where d.productCode not in ('OOS','NOSELL')) as p2 on p2.categoryId = s.categoryId
    left join dealer as d on d.dealerId=s.dealerId
    left join competitor as c on c.competitorId=s.competitorId
    where s.shopId=${mWork.shopId} and s.workDate=${mWork.workDate}
    ORDER BY s.dealerId`;
  // console.log(sql)
  const { res } = await QueryStringSql(sql);
  return res || [];
};
// Upload SellIn
export const dataUploadSellIn = async mWork => {
  let dataUpload = [];
  await Store().then(async db => {
    const sql =
      'select * from sellIn as s where s.shopId=' +
      mWork.shopId +
      ' and s.workDate=' +
      mWork.workDate +
      ' and ifnull(s.isUploaded,0) = 0';
    const { res, err } = await exeSql(db, sql);
    dataUpload = res;
  });
  return dataUpload;
};
export const uploadSellIn = async (mWork, dataSellIn, actionResult) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertError(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  let dataItem = [];
  dataSellIn.forEach(i => {
    let itemSave = {
      OrderNo: i.orderNo,
      DealerId: i.dealerId,
      CompetitorId: i.competitorId,
      CategoryId: i.categoryId,
      ProductId: i.productId,
      Quantity: i.quantityValue,
      PriceNPP: i.priceNPP,
      Price: i.price,
      Note: i.notes,
    };
    dataItem.push(itemSave);
  });
  let dataUpload = {
    ShopId: mWork.shopId,
    WorkDate: mWork.workDate,
    Details: JSON.stringify(dataItem),
  };

  let access_token = await Token();
  await fetch(URLDEFAULT + 'sellin/upload', {
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
        doneUploadSellIn(mWork);
        QueryStringSql(
          `UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${mWork.shopId} and reportId=${mWork.reportId}`,
        );
        actionResult(responseJson.messeger);
      } else {
        actionResult(responseJson.messeger);
      }
    })
    .catch(error => {
      actionResult(error);
    });
};
export const doneUploadSellIn = async mWork => {
  await Store().then(async db => {
    await UpdateItem(
      db,
      'sellIn',
      { isUploaded: 1 },
      { shopId: mWork.shopId, workDate: mWork.workDate },
    );
  });
};
// By Employee
export const uploadSellInByShop = async (dataSellIn, actionResult) => {
  let isNetwork = await checkNetwork();
  if (!isNetwork) {
    alertError(
      'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
    );
    return;
  }
  let dataItem = [
    {
      OrderNo: dataSellIn.orderNo,
      DealerId: dataSellIn.dealerId,
      CompetitorId: dataSellIn.competitorId,
      CategoryId: dataSellIn.categoryId,
      ProductId: dataSellIn.productId,
      Quantity: dataSellIn.quantityValue,
      Price: dataSellIn.priceValue,
      Note: dataSellIn.notes,
    },
  ];
  let dataUpload = {
    ShopId: dataSellIn.shopId,
    WorkDate: dataSellIn.workDate,
    Details: JSON.stringify(dataItem),
  };

  let access_token = await Token();
  await fetch(URLDEFAULT + 'sellin/upload', {
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
        actionResult(responseJson);
      } else {
        actionResult(responseJson);
      }
    })
    .catch(error => {
      actionResult('ERROR: ' + error);
    });
};
export const getSellInByServer = async (data, actionResult) => {
  try {
    let access_token = await Token();
    await fetch(URLDEFAULT + 'sellin/list', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
        ShopId: data.ShopId,
        FromDate: data.FromDate,
        ToDate: data.ToDate,
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
      });
  } catch (e) {
    //console.log("ERROR: " + e);
  }
};

export const getConfirmSellInList = async () => {
  const sql = `SELECT * FROM ${masterList.tableName} WHERE listCode='CONFIRMSELLIN'`;
  const { res } = await QueryStringSql(sql);
  return res;
};
