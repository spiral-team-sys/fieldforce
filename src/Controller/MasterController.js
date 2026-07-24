import {
  exeSql,
  QueryStringSql,
  SelectItemsClause,
  Store,
} from '../Core/SqliteDbContext';
import { typemodal } from '../Core/KEYs';
import { masterList } from '../Core/Table';

export async function InsertMasterList(db, MasterList) {
  //db= await Store();
  await db.executeSql('DELETE FROM MasterList', []);
  //Insert new
  await MasterList.forEach(Item => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO MasterList(ListCode,Code,Id,Name,Ref_Id,Ref_Code,IsLock,isColor,NumberValue,OrderBy) VALUES(?,?,?,?,?,?,?,?,?,?)',
        [
          Item.ListCode,
          Item.Code,
          Item.Id,
          Item.Name,
          Item.Ref_Id,
          Item.Ref_Code,
          Item.IsLock,
          Item.isColor,
          Item.NumberValue,
          Item.OrderBy,
        ],
      );
    });
  });
}
export async function InsertMobileKPIList(db, MobileKPIList) {
  await db.executeSql('DELETE FROM MobileKPIList', []);
  //Insert new
  await MobileKPIList.forEach(Item => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO MobileKPIList(KPIId,Function,ListCode,Name,isLock,OrderBy,RefId,RefName) VALUES(?,?,?,?,?,?,?,?)',
        [
          Item.KPIId,
          Item.Function,
          Item.ListCode,
          Item.Name,
          Item.isLock,
          Item.OrderBy,
          Item.RefId,
          Item.RefName,
        ],
      );
    }).then(result => {
      //console.log(result);
    });
  });
  return db;
}
export async function getMenuList() {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "SELECT kpiId,function,listCode,name,isLock,orderBy,refId,refName,refCode,0 as upload FROM mobileKPIList WHERE listCode='KPI' ORDER BY orderBy";
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function getRequestPhotos(DisplayId) {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select m.*' +
      " FROM masterList AS m WHERE listCode = 'CAMERA_AUDIT'" +
      ' AND Ref_Id=' +
      DisplayId;

    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function getPhotosDisplayBeko() {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select m.*' + " FROM masterList AS m WHERE listCode = 'CAMERA_DISPLAY'";

    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function getRequestSellout() {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select m.*' +
      " FROM masterList AS m WHERE listCode = 'Sellout'" +
      ' ORDER BY orderBy';

    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function getRequestSelloutSS() {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select m.*' +
      " FROM masterList AS m WHERE listCode = 'SelloutSS'" +
      ' ORDER BY orderBy';

    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function getRequestFilterVerifySO() {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select m.*' +
      " FROM masterList AS m WHERE listCode = 'verifysellout'" +
      ' ORDER BY orderBy, id';

    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export async function getReasonPOP() {
  let lst = [];
  await Store().then(async db => {
    const sql =
      'Select m.*' +
      " FROM masterList AS m WHERE listCode = 'ReasonPOP'" +
      ' ORDER BY id';

    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  return lst;
}
export const getMasterlist = async (ListCode, actionResult) => {
  const sql = `
    SELECT *
    FROM masterList AS m 
    WHERE m.listCode ='${ListCode}' ORDER BY id`;
  const { res } = await QueryStringSql(sql);
  actionResult && actionResult(res);
  return res || [];
};
export async function getListHome() {
  let data = [];
  await Store().then(async db => {
    const sql =
      "select * from masterList where listCode='Home' order by orderBy";
    const { res, err } = await exeSql(db, sql);
    data = res;
  });
  return data;
}

export async function GET_ConfigSellOut(isWorking, actionReulst) {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "SELECT * FROM masterList WHERE listCode='SELLOUT_CONFIG'" +
      (isWorking ? '' : " AND ref_Code <> '" + typemodal.SHOP_MODAL + "'") +
      ' ORDER BY orderBy';
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  actionReulst(lst);
}
export async function GET_RequiredSellOut(actionReulst) {
  let lst = [];
  await Store().then(async db => {
    const sql =
      "SELECT * FROM masterList WHERE listCode='SELLOUT_CONFIG'" +
      ' AND isRequired=1 ' +
      ' ORDER BY orderBy';
    const { res, err } = await exeSql(db, sql);
    lst = res;
  });
  actionReulst(lst);
}
export const GetByListCode = async listCode => {
  const sql = `SELECT * FROM ${masterList.tableName} m WHERE m.ListCode in (${listCode}) ORDER BY groupId,orderBy`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
