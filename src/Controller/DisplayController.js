import {
  Store,
  exeSql,
  UpdateItem,
  QueryStringSql,
  Insert,
  exeSqlNoQuery,
} from '../Core/SqliteDbContext';
import {
  _competitorId,
  _competitorName,
  AppNameBuild,
  psvApp,
  URLDEFAULT,
  URL_DOWNLOAD_HISTORY_DISPLAYCOMPETITOR,
} from '../Core/URLs';
import { All_Select } from '../Component/common';
import { GetToken, ToastError, ToastSuccess, Token } from '../Core/Helper';
import Moment from 'moment';
import {
  display,
  displayAudit,
  displayByShop,
  displayCompetitor,
  historyDisplay,
  mobileRaw,
  photos,
  posmByShop,
  surveyDisplayItem,
} from '../Core/TableLocal';
import UploadController, { uploadServer } from './UploadController';
import {
  auditDisplayItems,
  displayTarget,
  masterList,
  products,
} from '../Core/Table';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertRawReport } from './ReportController';
export async function uploadDisplayCompetitor(
  resDisplay,
  resPhotos,
  workinfo,
  finish,
  errorAct,
) {
  let access_token = await Token();
  try {
    let items = [];
    resDisplay.forEach(item => {
      let dataItem = {
        divisionId: item.divisionId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        displayComment: item.displayComment,
      };
      items.push(dataItem);
    });

    let itemsPhoto = [];
    resPhotos.forEach(photoInfo => {
      let ImgName = photoInfo.photoPath.substring(
        photoInfo.photoPath.lastIndexOf('/') + 1,
        photoInfo.photoPath.length,
      );
      let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName;
      let dataItem = {
        shopId: photoInfo.shopId,
        photoName: ImgName,
        latitude: photoInfo.latitude,
        longitude: photoInfo.longitude,
        accuracy: 8,
        reportId: photoInfo.reportId,
        photoTime: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        photoType: '' + photoInfo.photoType,
        photoDate: photoInfo.photoDate,
        photoPath: pathPhoto,
      };
      itemsPhoto.push(dataItem);
    });
    let UploadJson = {
      WorkDate: Moment(new Date()).format('YYYYMMDD'),
      ShopId: workinfo.shopId,
      Details: JSON.stringify(items),
      Photos: JSON.stringify(itemsPhoto),
    };
    await fetch(URLDEFAULT + 'display/uploadcompetitor', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(UploadJson),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        if (responseJson.status == 200) {
          if (responseJson.messeger === 'Đã gửi báo cáo') {
            doneUploadDisplayCompetitor(workinfo);
          }
          finish(responseJson.messeger);
        } else {
          errorAct(responseJson.messeger);
        }
      })
      .catch(error => {
        errorAct(error);
      });
  } catch (error) {
    //console.log(error);
  }
}
export async function getCompetiorByTracking() {
  let lstData = [];
  await Store().then(async db => {
    const sql =
      'select distinct type as value, division as name, 0 as orderBy from products where type = ' +
      _competitorId +
      " and division <> 'null' " +
      (AppNameBuild == psvApp
        ? " union all select 0, 'Đối thủ', 1 order by orderBy"
        : '');
    // const sql = "select distinct type as id, division as name, 0 as orderBy from products where type = " + _competitorId
    //     + " union all select 0, 'Đối thủ', 1 order by orderBy"
    // + " union all select distinct competitorId as id, competitorName as name, orderBy from trackingCompetitor order by orderBy";
    const { res, err } = await exeSql(db, sql);
    lstData = res;
    // res.forEach(i => {
    //     lstData.push(i.label);
    // })
  });
  return lstData;
}
export async function getCategoryByProduct() {
  let lst = [];
  await Store().then(async db => {
    const sql =
      // "select 0 as id, '" + All_Select + "' as name, 0 as type union all "
      ' select distinct categoryId as id, categoryName as name, type from products' +
      "  WHERE productCode not in ('OOS','NOSELL')";
    const { res, err } = await exeSql(db, sql);
    lst = res;
    // res.forEach(i => {
    //     lst.push(i.name);
    // })
  });
  return lst;
}
export async function getSubCatProduct(competitor, categoryName) {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "select 0 as id, '" +
      All_Select +
      "' as name union all" +
      " select distinct subCatId as id, subCategory as name FROM products AS p WHERE productCode not in ('OOS','NOSELL') and category='" +
      categoryName +
      "'" +
      (competitor !== '' ? " AND division='" + competitor + "'" : '');
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function dataDisplayResult(mWORK, competitorName, isInput) {
  let mData = [];

  if (competitorName !== null && competitorName == _competitorName) {
    await Store().then(async db => {
      const sql = 'select * from display where workId = ' + mWORK.workId;
      const { res, err } = await exeSql(db, sql);
      if (res.length < 1) {
        await setDataDisplayResult(mWORK);
      }

      mData = await getDataDisplayResult(mWORK, competitorName, isInput);
    });
  } else {
    await Store().then(async db => {
      const sql =
        'select * from displayCompetitor where workId = ' + mWORK.workId;
      const { res, err } = await exeSql(db, sql);
      if (res.length < 1) {
        await setDataDisplayCompetitor(mWORK);
      }
      mData = await getDataDisplayCompetitorResult(mWORK, isInput);
    });
  }
  return mData;
}
export async function dataDisplayCompetitorByTracking(mWORK, isInput) {
  let mData = [];
  await Store().then(async db => {
    const sql =
      'select * from displayCompetitor where workId = ' + mWORK.workId;
    const { res, err } = await exeSql(db, sql);
    if (res.length < 1) {
      await setDataDisplayCompetitor(mWORK);
    }
    mData = await getDataDisplayCompetitorResult(mWORK, isInput);
  });
  return mData;
}
export async function setDataDisplayResult(mWORK) {
  await Store().then(async db => {
    const sql =
      'insert into display(workId,productId,division,categoryId,subCatId,subCategory,quanity,price,quanityDisplay,quantitySuggest)' +
      ' select ' +
      mWORK.workId +
      ',p.productId,p.division,p.categoryId,p.subCatId,p.subCategory, ifnull(h.quanityStock,null), ifnull(h.rrp,null), ifnull(h.display,null), ifnull(h.quanitySuggest,null)' +
      ' from products as p' +
      ' left join displayHistory as h on p.productId = h.productId and h.shopId = ' +
      mWORK.shopId +
      " where p.productCode not in ('NOSELL','OOS')";
    await exeSql(db, sql);
  });
}
export async function setDataDisplayCompetitor(mWORK) {
  await Store().then(async db => {
    const sql =
      'insert into displayCompetitor(workId,workDate,divisionId,categoryId)' +
      ' select ' +
      mWORK.workId +
      ',' +
      mWORK.workDate +
      ',t.competitorId,t.categoryId' +
      ' from trackingCompetitor as t';
    await exeSql(db, sql);
  });
}
export async function getDataDisplayResult(mWORK, competitorName, isInput) {
  let mData = [];
  await Store().then(async db => {
    const sql =
      'select d.displayId,d.workId,d.productId,d.quanity,d.quanityDisplay,d.quantitySuggest,cast(d.price as varchar(100)) as price,' +
      ' d.displayType,d.displayComment,d.upload,d.division,d.categoryId,d.subCategory,d.subCatId,p.productName' +
      ' from display as d ' +
      ' join products as p on d.productId = p.productId' +
      ' where d.workId = ' +
      mWORK.workId +
      " and d.division = '" +
      competitorName +
      "'" +
      (isInput
        ? ' and (d.quanity is not null or d.price is not null or d.quanityDisplay is not null or d.quantitySuggest is not null)'
        : '') +
      ' order by p.division,p.categoryId,p.subCatId';
    const { res, err } = await exeSql(db, sql);
    mData = res;
  });
  return mData;
}
export async function getDataDisplayCompetitorResult(mWORK, isInput) {
  let mData = [];
  await Store().then(async db => {
    const sql =
      'select d.workId,d.divisionId,d.categoryId,d.quantity,t.competitorName,d.displayComment,d.upload' +
      ' from displayCompetitor as d' +
      ' left join trackingCompetitor as t on d.divisionId = t.competitorId and d.categoryId = t.categoryId' +
      ' where d.workId = ' +
      mWORK.workId +
      (isInput ? ' and d.quantity is not null' : '') +
      ' order by t.orderBy';
    const { res, err } = await exeSql(db, sql);
    mData = res;
  });
  return mData;
}
export async function displayTabData(mWORK, categoryName) {
  let mData = [];
  await Store().then(async db => {
    const sql = `SELECT DISTINCT p.categoryId AS tabId, p.categoryName AS tabName
             FROM display AS d 
             join products as p on d.productId = p.productId
             where d.workId=${mWORK.workId}
             order by p.categoryId`;
    //  (categoryName != null && categoryName != '' && categoryName != All_Select ? " and p.categoryName = '" + categoryName + "'" : "")
    const { res, err } = await exeSql(db, sql);
    mData = res;
  });
  return mData;
}
export async function insertDisplay(display) {
  await Store().then(async db => {
    const sql =
      'update display set quanity = ' +
      display.quanity +
      ', price = ' +
      display.price +
      ' where workId = ' +
      display.workId +
      ' and productId = ' +
      display.productId;
    await exeSql(db, sql);
  });
}
export async function insertDisplayBeko(display) {
  await Store().then(async db => {
    const sql =
      'update display set quanity = ' +
      display.quanity +
      ', price = ' +
      display.price +
      ', quanityDisplay = ' +
      display.quanityDisplay +
      ', quanitySuggest = ' +
      display.quanitySuggest +
      ' where workId = ' +
      display.workId +
      ' and productId = ' +
      display.productId;
    await exeSql(db, sql);
  });
}
export async function insertDisplayCompetitor(display) {
  await Store().then(async db => {
    const sql =
      'update displayCompetitor set quantity = ' +
      display.quantity +
      ' where workId = ' +
      display.workId +
      ' and divisionId = ' +
      display.competitorId +
      ' and categoryId = ' +
      display.categoryId;
    await exeSql(db, sql);
  });
}
export async function getDisplayComment(workId, categoryId, strTable) {
  let mResult = null;
  await Store().then(async db => {
    const sql =
      'select distinct displayComment from ' +
      strTable +
      ' where workId = ' +
      workId +
      ' and categoryId = ' +
      categoryId;
    const { res, err } = await exeSql(db, sql);
    if (res !== null) mResult = res[0].displayComment;
  });
  return mResult;
}
export async function insertNoteDisplay(display, strTable) {
  await Store().then(async db => {
    const sql =
      'update ' +
      strTable +
      " set displayComment = '" +
      display.displayComment +
      "'" +
      ' where workId = ' +
      display.workId +
      ' and categoryId = ' +
      display.categoryId;
    await exeSql(db, sql);
  });
}
export async function clearDisplayData(mWORK, type) {
  let mData = [];
  await Store().then(async db => {
    const sql =
      'update display set quanity = null, price = null where workId = ' +
      mWORK.workId;
    await exeSql(db, sql);
  });
  if (type !== null && (type === 'Panasonic' || type === '')) {
    mData = await getDataDisplayResult(mWORK, _competitorName, false);
  } else {
    mData = await getDataDisplayCompetitorResult(mWORK, false);
  }
  return mData;
}
export async function getDisplayCompetitorUpload(workId) {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select * from displayCompetitor WHERE workId=' +
      workId +
      ' AND quantity != -1';
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });

  return lst;
}
export async function getPhotoUploadByType(
  reportId,
  shopId,
  photoDate,
  photoType,
) {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select * from photos WHERE reportId=' +
      reportId +
      ' AND photoDate=' +
      photoDate +
      ' AND dataUpload = 0' +
      ' AND shopId=' +
      shopId +
      " AND PhotoType like '" +
      photoType +
      "%'";
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });

  return lst;
}
export async function doneUploadDisplayCompetitor(workinfo) {
  await Store().then(async db => {
    UpdateItem(
      db,
      'displayCompetitor',
      { upload: 1 },
      { workId: workinfo.workId },
    );
  });
}
export async function getDisplayBKUpload(workId) {
  let lst = [];
  await Store().then(async db => {
    const sql = `SELECT * 
        FROM Display s 
        where s.workId=${workId} 
         AND (quanityDisplay IS NOT NULL OR quantitySuggest IS NOT NULL OR price IS NOT NULL OR quanity IS NOT NULL) AND (upload IS  NULL OR upload=0)`;
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst || [];
}
const DisplayTargetGetList = async workinfo => {
  let sql = `
    SELECT a.*,p.productCode,p.productName,p.category,p.categoryName,p.subCategory,p.segment
    FROM ${displayByShop.tableName} a 
    LEFT JOIN products p ON p.productId=a.productId
    WHERE a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const DisplayGroup = async workinfo => {
  let sql = `
    INSERT INTO displayByShop(shopId,displayDate,productId,displayLast,priceLast)
    SELECT ${workinfo.shopId},${workinfo.workDate},d.productId,d.displayLast,d.priceLast
    FROM ${displayTarget.tableName} d
    WHERE d.shopId=${workinfo.shopId}
    AND NOT EXISTS(SELECT 1 FROM ${displayByShop.tableName} ds WHERE ds.productId=d.productId AND ds.displayDate=${workinfo.workDate} AND ds.shopId=${workinfo.shopId})`;
  await QueryStringSql(sql);
  //
  sql = `
    SELECT p.category,p.categoryName,COUNT(a.id) as totalRow,SUM(CASE WHEN a.displayValue IS NULL THEN 0 ELSE 1 END) as displayInput
    FROM ${displayByShop.tableName} a 
    LEFT JOIN ${products.tableName} p ON p.productId=a.productId
    WHERE a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    GROUP BY p.category,p.categoryName
    `;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const DTUpdateItem = async item => {
  // console.log(item, "DTUpdateItem")
  let sql = `
    update displayByShop SET displayValue=${item.displayValue}, 
    priceValue=${item.priceValue},popValue=${item.popValue}, 
    fsmValue=${item.fsmValue}, netValue=${item.netValue}
    WHERE id=${item.id}
    `;
  // console.log(sql, 'SQL');
  await QueryStringSql(sql);
};
const GetProductMore = async workinfo => {
  const sql = `SELECT p.productId,p.productCode,p.productName,p.category,p.categoryName,subcategory,segment,false as addMore,${workinfo.shopId} as shopId,${workinfo.workDate} as displayDate,1 AS displayValue
    FROM ${products.tableName} p 
    WHERE NOT EXISTS(SELECT 1 FROM displayByShop d WHERE d.productId=p.productId AND d.shopId=${workinfo.shopId} AND d.displayDate=${workinfo.workDate})`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const AddMore = async addlist => {
  // console.log(addlist, "AddMore")
  await Insert(displayByShop, addlist);
};
const removeAdd = async item => {
  const sql = `DELETE FROM ${displayByShop.tableName} WHERE id=${item.id}`;
  QueryStringSql(sql);
};
const taskDone = async workinfo => {
  let sql = `
    SELECT p.category,("Kiểm tra số lượng "|| p.categoryName) AS categoryName,COUNT(a.id) as totalRow,SUM(CASE WHEN a.displayValue IS NULL THEN 0 ELSE 1 END) as countInput
    FROM displayByShop a 
    LEFT JOIN products p ON p.productId=a.productId
    WHERE a.addMore=0 AND a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    GROUP BY p.category,p.categoryName
    UNION ALL
    SELECT p.category,("Kiểm tra POP "|| p.categoryName) AS categoryName,COUNT(a.id) as totalRow,SUM(CASE WHEN a.popValue IS NULL THEN 0 ELSE 1 END) as countInput
    FROM displayByShop a
    LEFT JOIN products p ON p.productId=a.productId
    WHERE a.addMore=0 AND a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    GROUP BY p.category,p.categoryName
    UNION ALL
    SELECT p.category,("Kiểm tra giá Niêm yết "|| p.categoryName) AS categoryName,COUNT(a.id) as totalRow,SUM(CASE WHEN a.priceValue IS NULL OR (a.priceValue BETWEEN 1 AND 999) OR (a.priceValue % 1000 <> 0) THEN 0 ELSE 1 END) as countInput
    FROM displayByShop a
    LEFT JOIN products p ON p.productId=a.productId
    WHERE a.addMore=0 AND a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    GROUP BY p.category,p.categoryName
    UNION ALL
    SELECT p.category,("Kiểm tra giá Net "|| p.categoryName) AS categoryName,COUNT(a.id) as totalRow,SUM(CASE WHEN a.netValue IS NULL OR (a.netValue BETWEEN 1 AND 999) OR (a.netValue % 1000 <> 0) THEN 0 ELSE 1 END) as countInput
    FROM displayByShop a
    LEFT JOIN products p ON p.productId=a.productId
    WHERE a.addMore=0 AND a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    GROUP BY p.category,p.categoryName
    UNION ALL
    SELECT p.category,("Kiểm tra Tiền thưởng "|| p.categoryName) AS categoryName,COUNT(a.id) as totalRow,SUM(CASE WHEN a.fsmValue IS NULL OR (a.fsmValue BETWEEN 1 AND 999) OR (a.fsmValue % 1000 <> 0) THEN 0 ELSE 1 END) as countInput
    FROM displayByShop a
    LEFT JOIN products p ON p.productId=a.productId
    WHERE a.addMore=0 AND a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    GROUP BY p.category,p.categoryName
    UNION ALL
    SELECT 'addMore','Thêm mới',COUNT(a.id) as totalRow,SUM(CASE WHEN a.displayValue IS NULL OR a.displayValue=0 THEN 0 ELSE 1 END) as countInput
    FROM displayByShop a
    LEFT JOIN products p ON p.productId=a.productId
    WHERE a.addMore=1 AND a.displayDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    `;
  const { res } = await QueryStringSql(sql);
  // console.log(sql, 'res')
  return res || [];
};
const displayUpload = async (workinfo, uploadResult) => {
  // console.log(workinfo, "checkshopid")
  // console.log(uploadResult, "uploadResult")
  let sql = `SELECT * FROM ${displayByShop.tableName} 
    WHERE shopId=${workinfo.shopId} AND displayDate=${workinfo.workDate}`;
  const { res } = await QueryStringSql(sql);
  await UploadController.uploadServer(
    workinfo,
    res || [],
    result => {
      if (result.statusId == 200) {
        sql = `UPDATE ${displayByShop.tableName} SET upload=1 
            WHERE shopId=${workinfo.shopId} AND displayDate=${workinfo.workDate}`;
        QueryStringSql(sql);
        uploadResult(result);
      }
    },
    null,
  );
};
//
// get data displaycompetitor
export async function getListByCompetitorMD(workInfo) {
  let sql = `INSERT INTO displayCompetitor(workId,workDate,divisionId,division,categoryId, categoryName ,subCatId,subCategory,upload)
        SELECT distinct ${workInfo.workId} , ${workInfo.workDate}, p.type,p.division,p.categoryId,p.categoryName,p.subCatId,p.subCategory, 0
        FROM ${products.tableName} AS p 
        WHERE p.type <> ${_competitorId} 
        AND p.productName IS NOT NULL 
        AND p.ProductCode not in ('OOS', 'NOSELL')
        AND NOT EXISTS ( SELECT 1 FROM ${displayCompetitor.tableName} AS d WHERE d.workId = ${workInfo.workId} AND d.categoryId = p.categoryId AND d.subCatId = p.subCatId)
        `;
  await QueryStringSql(sql);

  sql = `SELECT * FROM ${displayCompetitor.tableName} 
        WHERE workId = ${workInfo.workId} AND divisionId <> ${_competitorId}
        ORDER BY divisionId, categoryId, subCatId
    `;
  const { res } = await QueryStringSql(sql);
  // console.log(res, 'res')
  return res || [];
}
export async function getListTrackingCompetitor_MD(workInfo) {
  let sql = `INSERT INTO displayCompetitor(workId,workDate,divisionId,division,categoryId, categoryName ,subCatId,subCategory,upload)
        SELECT distinct ${workInfo.workId} , ${workInfo.workDate}, p.type,p.division,p.categoryId,p.categoryName,p.subCatId,p.subCategory, 0
        FROM ${products.tableName} AS p 
        WHERE p.type <> ${_competitorId} 
        AND p.productName IS NOT NULL 
        AND p.ProductCode not in ('OOS', 'NOSELL')
        AND NOT EXISTS ( SELECT 1 FROM ${displayCompetitor.tableName} AS d WHERE d.workId = ${workInfo.workId} AND d.categoryId = p.categoryId AND d.subCatId = p.subCatId)
        `;
  await QueryStringSql(sql);

  sql = `SELECT * FROM ${displayCompetitor.tableName} 
        WHERE workId = ${workInfo.workId} AND divisionId <> ${_competitorId}
        ORDER BY divisionId, categoryId, subCatId
    `;
  const { res } = await QueryStringSql(sql);
  // console.log(res, 'res')
  return res || [];
}
export async function updateDisplayCompetitor(item, workinfo) {
  let sql = `UPDATE ${displayCompetitor.tableName}
        SET quantity = ${item.quantity}
        WHERE displayCompetitorId = ${item.displayCompetitorId} AND workId = ${workinfo.workId}`;
  QueryStringSql(sql);
}
export async function getListByCompetitor(workinfo) {
  const sql = `SELECT distinct p.marketName AS division,p.type AS divisionId,p.categoryName,p.categoryId,
        d.displayCompetitorId,d.workId,d.workDate,d.quantity,d.upload,d.displayComment, 0 AS totalByCate
        FROM products as p 
        LEFT JOIN displayCompetitor as d ON p.type=d.divisionId AND p.categoryId=d.categoryId 
        AND d.workDate = ${workinfo.workDate} AND d.workId = ${workinfo.workId}
        WHERE p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
        AND p.type<>${_competitorId} 
        ORDER BY p.type,p.categoryId
        `;
  // console.log(sql, 'sql')
  const { res, err } = await QueryStringSql(sql);
  return res || [];
}
// lấy tất cả dữ liệu trưng bày và giá
export async function getAllDisplayProduct(workinfo, detailProduct = null) {
  const isHaveDetail = detailProduct !== null ? 1 : 0;
  let sql = `
    INSERT INTO ${display.tableName}(workId,productId,quanity,price,displayRef,upload,division,categoryId,subCategory,subCatId)
    SELECT ${workinfo.workId} , p.productId, h.hDisplay,h.hPrice,p.category,0,p.division,p.categoryId,p.subCategory, p.subCatId
    FROM ${products.tableName} AS p
    LEFT JOIN ${historyDisplay.tableName} AS h ON p.productId = h.productId AND h.shopId = ${workinfo.shopId}
    WHERE p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL') AND p.report=1
    AND NOT EXISTS ( SELECT 1 FROM ${display.tableName} AS d WHERE d.workId = ${workinfo.workId} AND d.productId = p.productId)
    AND 
    (
        (${isHaveDetail}=1 AND instr('${detailProduct}',p.productId) > 0)
        OR
        (${isHaveDetail}=0)
    )
    `;
  // // console.log(sql)
  await QueryStringSql(sql);
  //
  sql = `SELECT d.*,p.type AS divisionId,p.productName, p.categoryName,p.productCode,p.unit
        FROM ${display.tableName} AS d
        LEFT JOIN ${products.tableName} AS p ON p.productId=d.productId
        WHERE p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
        AND d.workId=${workinfo.workId}
        ORDER BY p.type, p.categoryId, d.subCatId, p.productId`;
  const { res } = await QueryStringSql(sql);

  // console.log(res)
  return res || [];
}
//// lấy dữ liệu trưng bày & giá chỉ của hãng
export async function getDisplayProduct(
  workinfo,
  competitorId = _competitorId,
  lstReport,
  dealerId = 0,
  detailProduct = null,
) {
  const isHaveDetail = detailProduct !== null ? 1 : 0;
  await QueryStringSql(
    `
        INSERT INTO ${
          display.tableName
        }(workId,productId,quanity,price, fsmValue,quantityStock,quantitySuggest,displayArea,displayRef,upload,division,categoryId,subCategory,subCatId,mockupValue,productComment,posmComment,tagPOPId)
        SELECT ${
          workinfo.workId
        } , p.productId, h.hDisplay,h.hPrice,h.hFsmValue,h.hStock,h.hSuggest,h.hArea,p.category,0,p.division,p.categoryId,p.subCategory, p.subCatId,h.hMockup,h.hNoteProduct,h.hNotePOP,h.hTagPOPID
        FROM ${products.tableName} AS p
        LEFT JOIN ${
          historyDisplay.tableName
        } AS h ON p.productId = h.productId AND h.shopId = ${workinfo.shopId}
        WHERE p.type=${competitorId} AND p.report=1
        AND NOT EXISTS ( SELECT 1 FROM ${
          display.tableName
        } AS d WHERE d.workId = ${
      workinfo.workId
    } AND d.productId = p.productId)
        AND 
        (
            (${isHaveDetail}=1 AND instr('${detailProduct}',p.productId) > 0)
            OR
            (${isHaveDetail}=0 AND (${lstReport?.isByDealer || 0} <> 1 OR (${
      lstReport?.isByDealer || 0
    } = 1 AND instr(p.details,${dealerId || 0}) > 0)))
        )`,
  );
  //
  const sqlGet = `SELECT d.*,p.type AS divisionId,p.productName, p.categoryName,p.productCode,p.report,0 as isCheck,0 AS checkValue,d.mockupValue,
    (CASE WHEN (d.price > 0 AND d.price < 10000 ) OR (d.price % 1000 > 0) THEN 1 ELSE 0 END ) as priceError ,
    (CASE WHEN (d.fsmValue >0 AND d.fsmValue < 1000) OR  (d.fsmValue % 1000 > 0) THEN 1 ELSE 0 END) as fsmValueError,
    mp.isColor AS popColor,md.isColor AS displayColor, d.tagPOPId
    FROM ${display.tableName} AS d
    LEFT JOIN ${products.tableName} AS p ON p.productId=d.productId
    LEFT JOIN ${masterList.tableName} AS mp ON mp.listCode='TAG' AND mp.groupId = 1 AND mp.id=d.tagPOPId
    LEFT JOIN ${masterList.tableName} AS md ON md.listCode='TAG' AND md.groupId = 2 AND md.id=d.tagDisplayId
    WHERE p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
    AND p.type=${competitorId} AND d.workId=${workinfo.workId}
    ORDER BY p.categoryId,d.subCatId,p.productId`;
  const { res } = await QueryStringSql(sqlGet);
  // console.log(res.length, 'resresresresresres');
  return res || [];
}
export async function getCateSubmit(workinfo) {
  const sql = `SELECT distinct d.categoryId, p.category, p.categoryName  
        FROM ${display.tableName} d
        LEFT JOIN ${products.tableName} p ON d.categoryId = p.categoryId
        WHERE d.workId = ${workinfo.workId} and (d.quanity is not null OR d.price is not null OR d.fsmValue is not null OR d.quantitySuggest is not null OR d.quantityStock is not null)
        `;
  const { res } = await QueryStringSql(sql);
  // console.log(res)
  return res || [];
}
export async function updateDisplayByHistory(workinfo) {
  let sql = `UPDATE ${display.tableName}
        SET (quanity , price ) 
        = (select h.hDisplay,h.hPrice
        FROM ${historyDisplay.tableName} h
        WHERE ${display.tableName}.productId = h.productId AND h.shopId = ${workinfo.shopId})`;
  QueryStringSql(sql);
}
// đưa tất cả dữ liệu đã nhập về null
export async function clearAllDataDisplay(workinfo, categoryId) {
  // console.log(categoryId);
  let sql = `UPDATE ${display.tableName} 
    SET quanity = null, 
    price = null, 
    quantityStock=null,
    quantitySuggest=null,
    fsmValue=null,
    displayComment = null,
    displayArea=null,
    tagPOPId=null,
    posmComment=null,
    productComment=null
    where workId=${workinfo.workId} 
    ${categoryId ? `AND categoryId = ${categoryId}` : ''}
    `;
  // console.log(sql);
  await QueryStringSql(sql);
}
export async function updateItemDisplay(item, workinfo) {
  let sql = `
    UPDATE display
    SET quanity=${
      item.quanity === 0 ? 0 : item.quanity !== '' ? item.quanity : null
    },
        quantityStock=${
          item.quantityStock === 0
            ? 0
            : item.quantityStock !== ''
            ? item.quantityStock
            : null
        },
        quantitySuggest=${
          item.quantitySuggest === 0
            ? 0
            : item.quantitySuggest !== ''
            ? item.quantitySuggest
            : null
        },
        price=${item.price || null},
        fsmValue=${item.fsmValue || null},
        displayArea=${item.displayArea ? `'${item.displayArea}'` : null},
        tagPOPId=${
          item.tagPOPId === 0 ? 0 : item.tagPOPId !== '' ? item.tagPOPId : null
        },
        displayComment=${
          item.displayComment == null ? null : `'${item.displayComment}'`
        },
        posmComment=${
          item.posmComment == null ? null : `'${item.posmComment}'`
        },
        productComment=${
          item.productComment == null ? null : `'${item.productComment}'`
        }
    WHERE productId = ${item.productId} AND workId = ${workinfo.workId}`;
  await QueryStringSql(sql);
}
//Lấy dữ liệu Tab by category
export async function getlistTabCompetitor(competitorId, isByType = 0) {
  let sql = ``;
  if (isByType === 1) {
    sql = `SELECT DISTINCT type AS divisionId, division,categoryId, categoryName,category as displayRef
        FROM ${products.tableName}
        WHERE ProductCode NOT IN ('OOS','NOSELL') AND report = 1
        ORDER BY type , categoryId`;
  } else {
    sql = `SELECT DISTINCT type AS divisionId, division,categoryId, categoryName,category as displayRef
        FROM ${products.tableName}
        WHERE ProductCode NOT IN ('OOS','NOSELL') AND report = 1
        ${competitorId === _competitorId ? ` AND type = ${competitorId}` : ``}
        ORDER BY type , categoryId`;
  }
  const { res } = await QueryStringSql(sql);
  // console.log(res, sql)
  return res || [];
}
export async function getListTagPOP() {
  let dataPOP = { POP: [], Display: [] };
  let sql1 = `SELECT id,code,name,isColor, groupId, groupName
                FROM ${masterList.tableName}
                WHERE listCode = 'TAG' AND groupId = 1
                ORDER BY id`;
  dataPOP.POP = (await QueryStringSql(sql1)).res;
  let sql2 = `SELECT id, code,name,isColor, groupId, groupName
                FROM ${masterList.tableName}
                WHERE listCode = 'TAG' AND groupId = 2
                ORDER BY id`;
  dataPOP.Display = (await QueryStringSql(sql2)).res;

  // console.log(res, sql)
  return dataPOP || {};
}
export async function uploadDisplayPOP(tagId, tagName, workinfo) {
  let sql = `UPDATE ${display.tableName}
    SET ${tagName} = ${tagId}
    WHERE workId = ${workinfo.workId}
    `;
  await QueryStringSql(sql);
}
export async function getDataDisplaySituation(workInfo) {
  let sql = `SELECT s.*
    FROM ${surveyDisplayItem.tableName} s
     WHERE workId = ${workInfo.workId}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getPhotoDisplaySituation(workInfo) {
  let sql = `SELECT s.*
    FROM ${photos.tableName} s
     WHERE photoDesc = "Display_${workInfo.workId}"`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getPhotoByType(type, guid = null) {
  let sql = `SELECT s.* FROM ${
    photos.tableName
  } s WHERE photoType = '${type}' ${guid !== null ? `AND guid='${guid}'` : ''}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getPhotoByTypeDesc(type, photoDesc) {
  let sql = `SELECT s.*
    FROM ${photos.tableName} s
     WHERE photoType = "${type}" AND photoDesc= "${photoDesc}"`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getPhotoByGuiId(guiId) {
  let sql = `SELECT s.*
    FROM ${photos.tableName} s
     WHERE guid = "${guiId}"`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function updateDisplaySituation(item, workinfo) {
  let sql = `
    UPDATE ${surveyDisplayItem.tableName} 
    SET issueDisplay="${item.issueDisplay}",
        displayItemName="${item.displayItemName}",
        note="${item.note}"
    WHERE id = ${item.id}`;
  await QueryStringSql(sql);
  return true;
}
export const deleteItemDisplaySituation = async item => {
  let sql = `
    DELETE FROM ${surveyDisplayItem.tableName} WHERE id=${item.id}`;
  await QueryStringSql(sql);
  sql = `
    DELETE FROM ${photos.tableName} WHERE guid="${item.guiId}"`;
  await QueryStringSql(sql);
  return true;
};
export const deleteItemPhotoDuplicate = async item => {
  let sql = `
    DELETE FROM ${photos.tableName} WHERE id=${item.id}`;
  await QueryStringSql(sql);
  console.log('deleteItemPhotoDuplicate', sql);
  return true;
};
export const deleteItemPhotoByType = async photoType => {
  let sql = `
    DELETE FROM ${photos.tableName} WHERE photoType LIKE '%${photoType}%'`;
  await QueryStringSql(sql);
  return true;
};
export const deleteItemPhotoByGuiId = async guiId => {
  let sql = `
    DELETE FROM ${photos.tableName} WHERE guid = "${guiId}"`;
  await QueryStringSql(sql);
  return true;
};
export async function insertDisplaySituation(item) {
  await Insert(surveyDisplayItem, [item]);
  return true;
}
export const DataDisplaySituation = async (
  resDisplay,
  workinfo,
  finish,
  error,
) => {
  try {
    await uploadServer(
      workinfo,
      resDisplay,
      async result => {
        ToastSuccess(result.messager);
        if (result.statusId == 200) {
          await Store().then(async db => {
            const sqlData =
              'Update surveyDisplayItem set upload=1 WHERE workId=' +
              workinfo.workId;
            await exeSqlNoQuery(db, sqlData);

            const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`;
            await exeSqlNoQuery(db, sql);
          });
        }
        typeof finish === 'function' && finish();
      },
      result => {
        ToastSuccess(result.messager);
        typeof error === 'function' && error();
      },
    );
  } catch (err) {
    ToastError('Lỗi dữ liệu trong máy');
    typeof error === 'function' && error();
  }
};
//// lấy dữ liệu khảo sát trưng bày
export async function getDataDisplaySurvey(workinfo, displayId) {
  let sql = `
    INSERT INTO ${displayAudit.tableName}(displayId,workId,itemId,itemName,upload)
    SELECT distinct  a.displayId, ${workinfo.workId}, a.refId, a.refName ,0
    FROM ${auditDisplayItems.tableName} AS a
    WHERE a.displayId IN (${displayId}) AND a.shopId=${workinfo.shopId}
    AND NOT EXISTS ( SELECT 1 FROM ${displayAudit.tableName} AS d WHERE d.workId = ${workinfo.workId} AND d.itemId = a.refId  )
    `;
  await QueryStringSql(sql);
  // console.log(sql, 'sql 1');
  sql = `SELECT DISTINCT d.id, d.displayId, d.workId, d.itemId, d.itemName, d.quanity, d.posmValue , a.displayItemId, a.productName,a.groupId,a.groupName, a.kpi1, a.target,d.upload
    FROM ${displayAudit.tableName} d
    LEFT JOIN ${auditDisplayItems.tableName} a on a.refId = d.itemId AND a.shopId=${workinfo.shopId}
    WHERE d.displayId IN (${displayId}) AND d.workId = ${workinfo.workId}
    ORDER BY d.displayId,a.shopId, a.refName ASC,a.groupId DESC`;
  // console.log(sql, 'sql 2');

  const { res } = await QueryStringSql(sql);
  // console.log(res.length)
  return res || [];
}
export async function getTabDisplaySurvey() {
  let sql = `SELECT  DISTINCT groupId, groupName
                FROM ${auditDisplayItems.tableName}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getDisplaySurveyResult(workinfo) {
  const sql = `SELECT * FROM ${displayAudit.tableName} 
    WHERE workId=${workinfo.workId} 
    AND (quanity is not null OR posmValue is not null)
    AND posmValue <> '' `;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function updateDisplaySurvey(item) {
  let sql = `
    UPDATE ${displayAudit.tableName} 
    SET
    quanity = ${item.quanity},
     posmValue="${item.posmValue}"
    WHERE id = ${item.id}`;
  await QueryStringSql(sql);
  return true;
}
export async function getTargetDisplaySurvey(workinfo, displayId) {
  let lst = [];
  const sql = `SELECT d.id, d.displayId, d.workId, d.itemId, d.itemName, d.quanity, d.posmValue , a.displayItemId, a.productName,a.groupId,a.groupName, a.kpi1
    FROM ${auditDisplayItems.tableName} a
    LEFT JOIN ${displayAudit.tableName} d on a.refId = d.itemId AND d.workId = ${workinfo.workId} 
    WHERE d.displayId IN (${displayId}) AND a.target  = 1
    ORDER BY d.displayId,a.shopId, a.refName ASC,a.groupId DESC`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function uploadDisplaySurvey(resDisplay, workinfo, finish, error) {
  try {
    await uploadServer(
      workinfo,
      resDisplay,
      async result => {
        ToastSuccess(result.messager);
        if (result.statusId == 200) {
          await Store().then(async db => {
            const sqlData =
              'Update displayAudit set upload=1 WHERE workId=' +
              workinfo.workId;
            await exeSqlNoQuery(db, sqlData);

            const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`;
            await exeSqlNoQuery(db, sql);
          });
        }
        typeof finish === 'function' && finish();
      },
      result => {
        ToastSuccess(result.messager);
        typeof error === 'function' && error();
      },
    );
  } catch (err) {
    ToastError('Lỗi dữ liệu trong máy');
    typeof error === 'function' && error();
  }
}
export async function getCompetitorHistory(workinfo) {
  try {
    let token = await GetToken();
    const requestinfo = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        shopId: workinfo.shopId,
      },
    };
    const response = await fetch(
      URL_DOWNLOAD_HISTORY_DISPLAYCOMPETITOR,
      requestinfo,
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error, 'fetchGet');
    return null;
  }
}
export async function updateCompetitorHistory(workinfo) {
  const sql = `SELECT * FROM ${displayCompetitor.tableName} a WHERE a.workDate = ${workinfo.workDate} and a.workId = ${workinfo.workId}`;
  const { res } = await QueryStringSql(sql);
  if (res.length === 0) {
    let dataHistoryCompetitor = await getCompetitorHistory(workinfo);
    let workDateString = workinfo.workDate.toString();
    if (dataHistoryCompetitor.statusId == 200) {
      await Store().then(async db => {
        await dataHistoryCompetitor.data.forEach(item => {
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO displayCompetitor(workId,workDate,divisionId, division,categoryId,categoryName,subCatId,subCategory,quantity,priceValue,netValue,fsmValue,modelName,isAddProduct,upload) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [
                workinfo.workId,
                workDateString,
                item.competitorId,
                item.competitorName,
                item.categoryId,
                item.category,
                item.subCateId,
                item.subCategory,
                item.hDisplay,
                item.hPrice,
                item.hNetValue,
                item.hFsmValue,
                item.hModelName,
                item.productId,
                0,
              ],
            );
          }).then(result => {
            // console.log(result, 'check updateCompetitorHistory');
          });
        });
      });
    }
  }
}
//// lấy dữ liệu báo cáo đối thủ
export async function getListCompetitorProduct(workinfo) {
  await updateCompetitorHistory(workinfo);
  let sql = `
    INSERT INTO ${displayCompetitor.tableName}(workId,workDate,divisionId, division,categoryId, categoryName,subCatId,subCategory,modelName,upload, isAddProduct)
    SELECT ${workinfo.workId},${workinfo.workDate},p.type, p.division, p.categoryId,p.categoryName, p.subCatId,p.subCategory,p.productCode, 0,0
    FROM ${products.tableName} AS p
    WHERE p.type<>${_competitorId} AND p.report=1 AND p.productCode IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
    AND NOT EXISTS ( SELECT 1 FROM ${displayCompetitor.tableName} AS d WHERE d.workId = ${workinfo.workId} AND d.modelName = p.productCode)
    `;
  await QueryStringSql(sql);
  // console.log(sql, 'sql 1');
  //
  sql = `SELECT d.* , 
        (CASE WHEN (d.priceValue > 0 AND d.priceValue < 10000 ) OR (d.priceValue % 1000 > 0) THEN 1 ELSE 0 END )as isPriceError ,
        (CASE WHEN (d.fsmValue > 0 AND d.fsmValue < 1000) OR  (d.fsmValue % 1000 > 0) THEN 1 ELSE 0 END)as isFsmValueError ,
        (CASE WHEN (d.netValue > 0 AND d.netValue < 10000) OR  (d.netValue % 1000 > 0) THEN 1 ELSE 0 END)as isNetValue 
        FROM ${displayCompetitor.tableName} AS d
        LEFT JOIN ${products.tableName} as p ON p.productCode = d.modelName
        WHERE d.workId=${workinfo.workId}
        ORDER BY  d.divisionId, d.categoryId, d.subCatId,isAddProduct DESC `;
  // console.log(sql, 'sql 2');
  const { res } = await QueryStringSql(sql);
  // console.log(res)
  return res || [];
}
// Lấy dữ liệu báo cáo đối thủ V2
export const insertListProduct = async workinfo => {
  await updateCompetitorHistory(workinfo);
  let sql = `
        INSERT INTO ${displayCompetitor.tableName}(workId,workDate,divisionId, division,categoryId, categoryName,subCatId,subCategory,modelName,upload, isAddProduct)
        SELECT ${workinfo.workId},${workinfo.workDate},p.type, p.division, p.categoryId,p.categoryName, p.subCatId,p.subCategory,p.productCode, 0,0
        FROM ${products.tableName} AS p
        WHERE p.type<>${_competitorId} AND p.report=1 AND p.productCode IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
        AND NOT EXISTS ( SELECT 1 FROM ${displayCompetitor.tableName} AS d WHERE d.workId = ${workinfo.workId} AND d.modelName = p.productCode)
    `;
  await QueryStringSql(sql);
};

export async function getListCompetitorProductV2(workinfo) {
  let sql = `SELECT d.* , 
        (CASE WHEN (d.priceValue > 0 AND d.priceValue < 10000 ) OR (d.priceValue % 1000 > 0) THEN 1 ELSE 0 END )as isPriceError ,
        (CASE WHEN (d.fsmValue > 0 AND d.fsmValue < 1000) OR  (d.fsmValue % 1000 > 0) THEN 1 ELSE 0 END)as isFsmValueError ,
        (CASE WHEN (d.netValue > 0 AND d.netValue < 10000) OR  (d.netValue % 1000 > 0) THEN 1 ELSE 0 END)as isNetValue 
        FROM ${displayCompetitor.tableName} AS d
        LEFT JOIN ${products.tableName} as p ON p.productCode = d.modelName
        WHERE d.workId=${workinfo.workId}
        ORDER BY  d.divisionId, d.categoryId, d.subCatId,isAddProduct DESC `;
  // console.log(sql, 'sql 2');
  const { res } = await QueryStringSql(sql);
  // console.log(res)
  return res || [];
}

export async function getTabCompetitorReport() {
  let sql = `SELECT  DISTINCT divisionId, division
                FROM ${displayCompetitor.tableName}
                WHERE division <> ${_competitorId}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getListCategoryDisplay() {
  let sql = `SELECT  DISTINCT  categoryId,categoryName
                FROM ${products.tableName}`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getListSubCategoryDisplay() {
  let sql = `SELECT  DISTINCT  categoryId,categoryName, subCatId, subCategory
                FROM ${products.tableName}
                ORDER BY categoryId
                `;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getCompetitorReportResult(workinfo) {
  const sql = `SELECT * FROM ${displayCompetitor.tableName} 
    WHERE workId=${workinfo.workId} 
    AND (quantity is not null OR priceValue is not null OR netValue is not null OR fsmValue is not null)`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function addItemDisplayCompetitor(item) {
  const sql = `SELECT * FROM ${displayCompetitor.tableName} 
    WHERE modelName = '${item[0].modelName}' AND divisionId = ${item[0].divisionId} 
    AND categoryId = ${item[0].categoryId} AND workId = ${item[0].workId}`;
  const { res } = await QueryStringSql(sql);
  if (res && res.length > 0) {
    ToastError('Sản phẩm này đã tồn tại!');
    return false;
  } else {
    // console.log(item, 'addItemDisplayCompetitor');
    await Insert(displayCompetitor, item);
    return true;
  }
}
export async function updateItemCompetitor(item, workinfo) {
  let sql = `
    UPDATE ${displayCompetitor.tableName}
    SET quantity=${item.quantity == 0 ? 0 : item.quantity || null},
    priceValue=${item.priceValue == 0 ? 0 : item.priceValue || null},
    fsmValue=${item.fsmValue == 0 ? 0 : item.fsmValue || null},
    netValue=${item.netValue == 0 ? 0 : item.netValue || null}
    WHERE workId = ${workinfo.workId} AND displayCompetitorId=${
    item.displayCompetitorId
  }`;
  await QueryStringSql(sql);
}
export async function clearAllDataCompetitor(workinfo) {
  let sql = `UPDATE ${displayCompetitor.tableName} 
    SET quantity = null, 
    priceValue = null, 
    netValue=null,
    fsmValue=null
    where workId=${workinfo.workId}`;
  await QueryStringSql(sql);
}
export async function deleteItemDisplayCompetitor(workinfo, item) {
  let sql = `DELETE FROM ${displayCompetitor.tableName} 
    WHERE workId=${workinfo.workId} AND displayCompetitorId=${item.displayCompetitorId}`;
  await QueryStringSql(sql);
}
export async function getCompetitorResult(workinfo) {
  const sql = `SELECT * FROM ${displayCompetitor.tableName}
    WHERE workId = ${workinfo.workId} 
    AND (quantity is not null OR priceValue is not null OR fsmValue is not null OR netValue is not null OR isAddProduct is not null)`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function uploadDataCompetitorReport(
  lstDisplay,
  workinfo,
  finish,
  error,
) {
  // console.log(lstDisplay);
  try {
    await uploadServer(
      workinfo,
      lstDisplay,
      async result => {
        ToastSuccess(result.messager);
        if (result.statusId == 200) {
          await Store().then(async db => {
            const sqlData =
              'Update displayCompetitor set upload=1 WHERE workId=' +
              workinfo.workId;
            await exeSqlNoQuery(db, sqlData);

            const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`;
            await exeSqlNoQuery(db, sql);
          });
        }
        typeof finish === 'function' && finish();
      },
      result => {
        ToastSuccess(result.messager);
        typeof error === 'function' && error();
      },
    );
  } catch (err) {
    ToastError('Lỗi dữ liệu trong máy');
    typeof error === 'function' && error();
  }
}
//// lấy dữ liệu trưng bày by model , POP
export async function getListDisplayByModel(workinfo) {
  const sqlPOSM = `
    INSERT INTO ${posmByShop.tableName}(shopId,reportDate,productId,upload,addMore)
    SELECT ${workinfo.shopId} ,${workinfo.workDate}, p.productId,0,0
    FROM ${products.tableName} AS p
    WHERE p.report=1 AND p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
    AND NOT EXISTS ( SELECT 1 FROM ${posmByShop.tableName} AS s WHERE s.shopId = ${workinfo.shopId} AND s.reportDate = ${workinfo.workDate} AND s.productId = p.productId)
    `;
  await QueryStringSql(sqlPOSM);
  // console.log(sql, 'getDisplayProduct');

  const sqlGet = `
    SELECT d.*, p.type AS divisionId,p.productName, p.categoryName,p.productCode,p.report,p.division,p.categoryId,p.subCategory,p.subCatId,
    (CASE WHEN (d.priceValue > 0 AND d.priceValue < 10000 ) OR (d.priceValue % 1000 > 0) THEN 1 ELSE 0 END )as priceError
    FROM ${posmByShop.tableName} d 
    LEFT JOIN ${products.tableName} p ON p.productId = d.productId
    WHERE p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
    AND d.shopId = ${workinfo.shopId} AND d.reportDate = ${workinfo.workDate} AND p.report=1 
    ORDER BY p.type, p.categoryId, p.productId`;
  const { res } = await QueryStringSql(sqlGet);
  // console.log(res, sqlGet);
  // console.log(res)
  return res || [];
}
export const updatePOPDisplayBymodel = async (item, workinfo) => {
  const sql = `
    update ${posmByShop.tableName} 
    SET displayValue=${item.displayValue},
    posmList='${item.posmList}', 
    priceValue = ${item.priceValue},
    quantityStock = ${item.quantityStock}
    WHERE shopId =${workinfo.shopId} AND reportDate=${workinfo.workDate} AND productId = ${item.productId}
    `;
  await QueryStringSql(sql);
};
export const getCompetitorByModel = async competitorId => {
  const sql = `
    Select DISTINCT type as id, marketName as name
            FROM ${
              products.tableName
            } WHERE productCode not in ('OOS', 'NOSELL') 
            ${
              competitorId === _competitorId
                ? ` AND type = ${competitorId}`
                : ``
            }
            ORDER BY type
    `;
  const { res } = await QueryStringSql(sql);
  return res;
};
// đưa tất cả dữ liệu POSM về null
export async function clearAllDataPOSM(workinfo) {
  let sql = `UPDATE ${posmByShop.tableName} 
    SET displayValue = null, 
    posmList = null
    where shopId=${workinfo.shopId} AND reportDate = ${workinfo.workDate}`;
  await QueryStringSql(sql);
}
export async function uploadDataDisplayByModel(
  lstDisplay,
  workinfo,
  finish,
  error,
) {
  // console.log(lstDisplay);
  try {
    await uploadServer(
      workinfo,
      lstDisplay,
      async result => {
        ToastSuccess(result.messager);
        if (result.statusId == 200) {
          await Store().then(async db => {
            const sqlData = `Update ${display.tableName} set upload=1 WHERE workId= ${workinfo.workId}`;
            await exeSqlNoQuery(db, sqlData);
            const sqlPOSM = `Update ${posmByShop.tableName} set upload=1 WHERE shopId=${workinfo.shopId} AND reportDate = ${workinfo.workDate}`;
            await exeSqlNoQuery(db, sqlPOSM);
            const sql = `UPDATE photos SET dataUpload=1
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`;
            await exeSqlNoQuery(db, sql);
          });
        }
        typeof finish === 'function' && finish();
      },
      result => {
        ToastSuccess(result.messager);
        typeof error === 'function' && error();
      },
    );
  } catch (err) {
    ToastError('Lỗi dữ liệu trong máy');
    typeof error === 'function' && error();
  }
}
export const checkPhotoByProduct = async (workinfo, reportId) => {
  const sql = `
            SELECT DISTINCT p.categoryId,p.categoryName,p.category
            FROM display AS d
            LEFT JOIN products AS p ON d.productId=p.productId
            WHERE d.workId=${workinfo.workId} and (ifnull(d.quanity,0) > 0 OR ifnull(d.price,0) > 0)`;
  const { res } = await QueryStringSql(sql);
  return res;
};
export const actualPhoto = async (workinfo, reportId, photoType) => {
  const sql = `
        SELECT count(p.photoType) AS actualPhoto
        FROM photos AS p 
        WHERE p.shopId=${workinfo.shopId} 
        AND p.photoDate=${workinfo.workDate}
        AND p.reportId=${reportId}
        AND p.photoType='${photoType}'
    `;
  const { res } = await QueryStringSql(sql);
  return res[0].actualPhoto || 0;
};
export const isPhotoNoData = async (workinfo, reportId) => {
  const sql = `
        SELECT r.*, 
        (SELECT count(o.photoType) 
            FROM ${photos.tableName} AS o 
            WHERE o.shopId=${workinfo.shopId} 
            AND o.photoDate=${workinfo.workDate} 
            AND o.reportId=${reportId} 
            AND o.photoType like '%'||r.categoryName
        ) AS countPhoto
        FROM (
            SELECT p.categoryId,p.category,p.categoryName,SUM(ifnull(d.quanity,0)) AS totalQuantity,SUM(ifnull(d.price,0)) AS totalPrice
            FROM ${products.tableName} AS p 
            LEFT JOIN ${display.tableName} AS d ON d.productId=p.productId AND d.workId=${workinfo.workId}
            GROUP BY p.categoryId,p.category,p.categoryName
        ) AS r
        WHERE r.totalQuantity=0 and r.totalPrice=0
    `;
  const { res, err } = await QueryStringSql(sql);
  return res;
};
export const isPhotoNoDataByType = async (workinfo, reportId, photoType) => {
  const sql = `
        SELECT * FROM ${photos.tableName} AS o 
        WHERE o.shopId=${workinfo.shopId} 
        AND o.photoDate=${workinfo.workDate} 
        AND o.reportId=${reportId}
        AND o.photoType='${photoType}'
    `;
  const { res } = await QueryStringSql(sql);
  return res;
};
export const getHistoryDisplayByShop = async shopId => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        shopId: shopId,
      },
    };
    const response = await fetch(
      URLDEFAULT + 'display/historybyshop',
      requestInfo,
    );
    const dataResult = await response.json();
    if (dataResult.statusId === 200) {
      return dataResult.data;
    }
  } catch (error) {
    console.log(error);
  }
};
export const deleteHistoryDisplayByShop = async shopId => {
  let sql = `DELETE FROM ${historyDisplay.tableName} WHERE shopId=${shopId}`;
  await QueryStringSql(sql);
  return true;
};
export const getDataHistoryDisplayByShop = async shopId => {
  const sql = `SELECT * FROM ${historyDisplay.tableName} AS o WHERE shopId=${shopId}`;
  const { res } = await QueryStringSql(sql);
  return res;
};
export const checkFormMode = async (data, reportId, shopId, actionResult) => {
  const storedData = await AsyncStorage.getItem(`${shopId}_EDIT`);
  const parseStored = storedData ? JSON.parse(storedData) : null;
};
//
export const DisplayContext = {
  displayUpload,
  DisplayTargetGetList,
  DisplayGroup,
  DTUpdateItem,
  GetProductMore,
  AddMore,
  removeAdd,
  taskDone,
  checkFormMode,
};
