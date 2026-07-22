import { ToastError, ToastSuccess } from "../Core/Helper";
import { exeSql, Insert, QueryStringSql, Store, UpdateItem } from "../Core/SqliteDbContext";
import { shopProfile } from "../Core/Table";
import { shopProfileResult } from "../Core/TableLocal";

export async function getLstAccess() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select itemId as id, itemNameVN as name, sp.* FROM shopProfile sp'
        // + ' ORDER BY sortList';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getLstAccessResult(workId) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select itemId as id, itemNameVN as name, spr.*  FROM shopProfileResult as spr WHERE itemId IS NOT NULL'
            + ' AND workId=' + workId
            + ' ORDER BY categoryId,categoryType'
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getLstAccessUpload(workId) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select itemNameVN as name, spr.*  FROM shopProfileResult as spr WHERE itemId IS NOT NULL AND upload = 0'
            + ' AND workId=' + workId
            + ' ORDER BY spr.categoryId,spr.categoryType,spr.shopProfileId'
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getLstCat() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select sp.categoryId as id, sp.categoryName as name FROM shopProfile AS sp GROUP BY sp.categoryId,sp.categoryName'
        // + ' ORDER BY sortList';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}

export async function getLstSubCat(catName) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select sp.shopProfileId as id, sp.categoryType as name, sp.* FROM shopProfile AS sp'
            + " WHERE sp.categoryName='" + catName + "'"
            + ' GROUP BY sp.shopProfileId,sp.categoryType'
        // + ' ORDER BY sortList';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getItemAceess(id, workId) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * FROM shopProfileResult'
            + " WHERE itemId=" + id
            + ' AND workId=' + workId
        const { res, err } = await exeSql(db, sql);
        lst = res;
    })

    return lst
} deleteNoteAccess
export async function deleteItemAceess(item, workId) {
    await Store().then(async db => {
        const sql = 'Delete FROM shopProfileResult'
            + " WHERE shopProfileId='" + item.shopProfileId + "'"
            + " AND categoryId=" + item.categoryId
            + ' AND workId=' + workId;
        return await exeSql(db, sql);
    })
}
export async function deleteNoteAccess(item, note, workId) {
    await Store().then(async db => {
        const sql =
            `UPDATE ${shopProfileResult.tableName}
            SET note = ${note}
            WHERE shopProfileId= ${item.shopProfileId}
            AND categoryId= ${item.categoryId}
            AND workId=${workId}`
        // console.log(sql);
        return await exeSql(db, sql);
    })
}
export async function insertItemAceess(item, workId) {
    await getItemAceess(item.itemId, workId).then(async (itemsHave) => {
        if (itemsHave && itemsHave.length > 0) {
            ToastError(item.categoryName + ': Mục ' + item.categoryType + ' - ' + item.itemNameVN + ' đã báo.')
        }
        else {
            await Insert(shopProfileResult, [item]);
            await ToastSuccess('Đã lưu dữ liệu!')
        }
    })
}
export async function updateItemAceess(ip) {

    await Store().then(async db => {
        let itemUpdate = null
        if (ip.dateValue === 1) {
            itemUpdate = { dateVal: ip.dateVal }
        }
        else if (ip.selectValue === 1) {
            itemUpdate = { selectVal: ip.selectVal }
        }
        else if (ip.yearValue === 1) {
            itemUpdate = { yearVal: ip.yearVal }
        }
        else if (ip.numberValue === 1) {
            itemUpdate = { numberVal: ip.numberVal }
        }
        else if (ip.decimalValue === 1) {
            itemUpdate = { decimalVal: ip.decimalVal }
        }
        else if (ip.textValue === 1) {
            itemUpdate = { textVal: ip.textVal }
        }
        else {
            itemUpdate = { textVal: null }
        }

        await UpdateItem(db, 'shopProfileResult', itemUpdate, { itemId: ip.itemId, workId: ip.workId });
    });
}
export async function updateNoteAceess(ip, note, workinfo) {
    await Store().then(async db => {
        await UpdateItem(db, 'shopProfileResult', { note: note }, { workId: workinfo.workId, categoryType: ip.categoryType, categoryId: ip.categoryId });
    })
}


export async function getListCategoryAccessories() {
    const sql = `SELECT DISTINCT categoryId, categoryName 
                FROM ${shopProfile.tableName}
                ORDER BY categoryId`
    const { res, err } = await QueryStringSql(sql)
    return res || []
}
export async function getListTypeAccessories() {
    const sql = `SELECT distinct shopProfileId, categoryId, categoryName,categoryType
                FROM ${shopProfile.tableName}`
    const { res, err } = await QueryStringSql(sql)
    return res || []
}
export async function getListItemAccessories() {
    const sql = `SELECT *
                FROM ${shopProfile.tableName}`
    const { res, err } = await QueryStringSql(sql)
    return res || []
}

