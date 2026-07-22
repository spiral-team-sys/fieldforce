import { _competitorId, URL_SELLOUT_DUPLICATE, URL_SELLOUT_DUPLICATE_CONFIRM, URL_SELLOUT_UPDATE_PHONE, URL_SELLOUT_EVIDENT, URL_UPLOAD_EVIDENT, URL_UPLOAD_PHOTOS, URLDEFAULT } from "../Core/URLs";
import { Store, InsertItems, exeSql, SelectItems, UpdateItem, Insert, QueryStringSql, exeSqlNoQuery, DeleteAll } from "../Core/SqliteDbContext";
import { GetToken, MessageInfo, ToastError, ToastSuccess, Token } from "../Core/Helper";
import Moment from "moment";
import { uploadAllDataPhoto } from "./PhotoController";
import { sellOut, trackingSellOut } from "../Core/TableLocal";
import { competitor, products } from "../Core/Table";
import UploadController, { uploadServer } from "./UploadController";
import { getPhotosByGuiId, getPhotosByGuiIdUpload } from "./WorkController";
let RNFS = require('react-native-fs');

export async function uploadEvident(mItem, actionDone, plusImage) {
    let mPhoto = await getPhotoEvident(mItem);
    let firstDateByMonth = mItem.year.toString() + mItem.month.toString() + '01'
    if (mPhoto !== null && mPhoto.length > 0) {
        let countPhotoUpload = mPhoto.length;
        try {
            let access_token = await Token();
            let itemsPhoto = [];
            mPhoto.forEach(photoInfo => {
                let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
                let pathPhoto = '/uploaded/' + Moment(new Date()).format('YYYYMMDD') + '/' + ImgName
                let dataItem = {
                    "shopId": photoInfo.shopId,
                    "photoName": ImgName,
                    "latitude": photoInfo.latitude,
                    "longitude": photoInfo.longitude,
                    "accuracy": photoInfo.accuracy,
                    "reportId": photoInfo.reportId,
                    "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    "photoType": photoInfo.photoType.toString(),
                    "photoDate": firstDateByMonth,
                    "photoPath": pathPhoto
                }
                itemsPhoto.push(dataItem);
            });
            if (itemsPhoto.length < 1) return;

            let dataJSON = { WorkDate: Moment(new Date).format('YYYYMMDD'), Photos: JSON.stringify(itemsPhoto) }

            fetch(URL_UPLOAD_EVIDENT, {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: JSON.stringify(dataJSON)
            }).then(response => {
                return response.json();
            }).then(responseJson => {
                actionDone(responseJson.messeger)
                plusImage(responseJson.status == 200 ? countPhotoUpload : 0)
            })
        } catch (error) {
            actionDone(error)
        }
    } else {
        actionDone("Hình ảnh xác minh số bán đã được gửi hết")
    }
}
export async function uploadPhoto(itemPhoto) {
    let dataPhoto = await getPhotoEvident(itemPhoto);
    if (dataPhoto == null || dataPhoto.length < 1)
        return

    await uploadAllDataPhoto(dataPhoto);
}
export async function getPhotoEvident(mItem) {
    let photoType = mItem.productId !== undefined ? 'EVIDENT_' + mItem.productName : 'EVIDENT_FULL';
    let mPhoto = [];
    await Store().then(async db => {
        const sql = "select * from photos"
            + " where fileUpload = 0 and reportId = 0 and shopId = " + mItem.shopId
            + " and photoType = '" + photoType + "'"
            + " and photoPath not in ('undefined')"
        const { res, err } = await exeSql(db, sql)
        mPhoto = res
    })
    //console.log(mPhoto)
    return mPhoto;
}
export async function insertNosell(mWorkId, IdNosell) {
    await Store().then(async db => {
        const item = {
            workId: mWorkId,
            productId: IdNosell,
            serial: '',
            categoryId: 0,
            categoryName: '',
            segmentId: 0,
            segment: '',
            quantity: 0,
            price: 0,
            sellType: _competitorId,
            sellComment: '',
            custName: '',
            custAddress: '',
            custPhone: '',
            upload: 0
        }
        await InsertItems(db, 'sellOut', [item]);
    })
}
export async function getProductNosell() {
    let nosell;
    await Store().then(async db => {
        let lstProduct = await SelectItems(db, 'products', ["productId"], { productCode: 'NOSELL' });
        if (lstProduct != null) {
            nosell = lstProduct.res[0].productId;
        }
    })
    return nosell;
}
export async function checkProductNosell(workinfo, IdNosell) {
    let nosell;
    await Store().then(async db => {
        const { res, err } = await SelectItems(db, 'sellOut', ["*"], { productId: IdNosell, workId: workinfo.workId });
        if (res != null && res.length > 0 && res[0].productId == IdNosell) {
            nosell = true;
        } else {
            nosell = false;
        }
    })
    return nosell;
}
export async function checkSellout(workinfo) {
    let nosell;
    await Store().then(async db => {
        const { res, err } = await SelectItems(db, 'sellOut', ["*"], { productId: IdNosell, workId: workinfo.workId });
        if (res != null && res.length > 0 && res[0].productId == IdNosell) {
            nosell = true;
        } else {
            nosell = false;
        }
    })
    return nosell;
}
export async function getCompetiorByTracking() {
    let lstData = [];
    await Store().then(async db => {
        const sql = "select 0 as id, '--chọn--' as name, 0 as orderBy union all select distinct type as id, division as name, 0 as orderBy from products where type = " + _competitorId + " and division <> 'null'"
            + " union all select distinct competitorId as id, competitorName as name, orderBy from trackingCompetitor order by orderBy";
        const { res, err } = await exeSql(db, sql);
        res.forEach(items => {
            lstData.push(items);
        })
    });
    //console.log(lstData);

    return lstData;
}
export async function getCategoryByProduct(competitorId) {
    let lstData = [];
    await Store().then(async db => {
        const sql = `select 0 as id, '--chọn--' as name, 0 as type 
        union all 
        select distinct categoryId as id, category as name, type from products 
        WHERE productCode not in ('OOS','NOSELL') ${competitorId != undefined ? ' AND type=' + competitorId : ''}`;
        // console.log(sql, "s")
        const { res, err } = await exeSql(db, sql);
        res?.forEach(items => {
            lstData.push(items);
        })
    });
    return lstData;
}
export async function getSubCategoryByProduct(itemDivision) {
    let lstData = [];
    await Store().then(async db => {
        lstData = await SelectItems(db, 'products', ['DISTINCT subCatId as id', 'subCategory as name', 'categoryId', 'type'], itemDivision);
    });
    return lstData.res;
}
export async function getListProduct(itemDivision) {
    let lstData = [];
    await Store().then(async db => {
        lstData = await SelectItems(db, 'products', ["productId as id,productName as name,type,division,categoryId,categoryName,subCatId,subCategory"], itemDivision);
    });
    return lstData.res;
}
export async function SellOutGetList(workinfo) {
    const sql = `Select s.* FROM ${sellOut.tableName} s Where workId=${workinfo.workId} ORDER BY sellId DESC`
    const { res } = await QueryStringSql(sql);
    return res || [];
}
export async function fetchSellOutDuplicate() {
    let lstData = [];
    try {
        let access_token = await Token();
        await fetch(URL_SELLOUT_DUPLICATE, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                lstData = responseJson;
            })
    } catch (error) {
        //console.log(error);
    }
    return lstData;
}
export async function fetchSellOutEvident() {
    let lstData = [];
    try {
        let access_token = await Token();
        await fetch(URL_SELLOUT_EVIDENT, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                lstData = responseJson;
            })
    } catch (error) {
        //console.log(error);
    }
    return lstData;
}
export async function confirmDuplicate(itemId, isRemove) {
    try {
        let access_token = await Token();
        await fetch(URL_SELLOUT_DUPLICATE_CONFIRM, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
                "ItemId": itemId,
                "IsRemove": isRemove
            }
        }).then((response) => response.json()).then((responseJson) => {
            //console.log(responseJson);
        })
    } catch (error) {
        //console.log(error);
    }
}
export async function updatePhoneNumber(itemId, phoneNumber) {
    //console.log(itemId)
    try {
        let access_token = await Token();
        await fetch(URL_SELLOUT_UPDATE_PHONE, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
                "ItemId": itemId,
                "PhoneNumber": phoneNumber
            }
        }).then((response) => response.json()).then((responseJson) => {
            //console.log(responseJson);
        })
    } catch (error) {
        //console.log(error);
    }
}
export async function doneUploadPhoto(id) {
    await Store().then(async db => {
        const sql = "update photos set fileUpload=1 where id=" + id;
        exeSql(db, sql);
    })
}

export async function V2_SaveItemSellOut(item, isUpdate, actionResult) {
    if (!isUpdate) {
        await Store().then(async db => {
            await InsertItems(db, sellOut.tableName, [item])
            actionResult("Thêm thành công")
        })
    } else {
        await Store().then(async db => {
            await UpdateItem(db, sellOut.tableName, item, { "sellId": item.sellId })
            actionResult("Cập nhật thành công")
        })
    }
}

export async function reportSellOut_SAVE(item) {
    await Store().then(async db => {
        const { res, err } = await exeSql(db, "select * from sellOut where upload=0 and workId=" + item.workId
            + " and productId=" + item.productId
            + " and competitorId=" + item.competitorId
            + " and categoryId=" + item.categoryId
            + " and custName='" + item.custName + "'"
            + " and custPhone='" + item.custPhone + "'"
        )

        if (res.length > 0) {
            await exeSql(db, "update sellOut set quantity=(quantity+" + item.quantity + ")"
                + " where workId=" + item.workId
                + " and productId=" + item.productId
                + " and competitorId=" + item.competitorId
                + " and categoryId=" + item.categoryId
                + " and custName='" + item.custName + "'"
                + " and custPhone='" + item.custPhone + "'"
            )
        } else {
            await InsertItems(db, 'sellOut', [item])
        }
    });
}
export async function reportSellOut_UPDATE(sellId, item) {
    await Store().then(async db => {
        await UpdateItem(db, 'sellOut', item, { "sellId": sellId });
    });
}

export async function getResSellOut(workinfo) {
    const sql = `
        SELECT s.*
        FROM ${sellOut.tableName} s 
        Where workId=${workinfo.workId}
        ORDER BY sellId DESC`
    const { res } = await QueryStringSql(sql)
    return res || []
}
export async function getResSellOutWFH(WorkDate) {
    const sql = `Select s.* FROM ${sellOut.tableName} s Where reportDate=${WorkDate} ORDER BY sellId DESC`
    const { res } = await QueryStringSql(db, sql);
    return res || []
}

export async function SellOutSSUpload(WorkDate) {
    const sql = `SELECT s.* FROM ${sellOut.tableName} s
        WHERE (s.upload is null OR s.upload<>1) AND reportDate=${WorkDate}`;
    return await QueryStringSql(sql);
}
const TotalSellOut = async (workinfo) => {
    const sql = `SELECT Sum(quantity) as totalSell FROM ${sellOut.tableName} WHERE productCode!='NOSELL' AND workId=${workinfo.workId}`
    const { res } = await QueryStringSql(sql)
    return res !== null && res.length > 0 ? res[0].totalSell : 0
}
export async function SellOutInsert(item) {
    await Store().then(async db => {
        let sql = `SELECT * FROM ${sellOut.tableName}
             WHERE workId=${item.workId}
             and productId=${item.productId} and category = '${item.category}' and upload<>1 `
        if (item.customer != null && item.customer != 'null' && item.customer !== '')
            sql += ` and customer='${item.customer}' `
        if (item.phone != null && item.phone != 'null' && item.phone !== '')
            sql += ` and phone='${item.phone}' `

        if (item.serial != null && item.serial != 'null' && item.serial !== '') {
            sql += ` and serial='${item.serial}' `
        } else { sql += ` (and serial is null OR serial = '') ` }

        if (item.IMEI2 != null && item.IMEI2 != 'null' && item.IMEI2 !== '') {
            sql += ` and IMEI2='${item.IMEI2}' `
        } else { sql += ` and (IMEI2 is null OR IMEI2 = '') ` }
        const { res } = await exeSql(db, sql)
        if (res !== undefined && res.length > 0) {
            await UpdateItem(db, sellOut.tableName, { "quantity": res[0].quantity + item.quantity }, { "sellId": res[0].sellId })
        } else {
            await Insert(sellOut, [item])
        }
    })
}


export const getListCatProduct = async () => {
    const sql = `SELECT DISTINCT categoryId, categoryName
    FROM ${products.tableName}
    WHERE ProductCode NOT IN ('OOS','NOSELL') AND report = 1`
    const { res } = await QueryStringSql(sql)
    return res || []
}
export const getListCompetitor = async () => {
    const sql = `SELECT *
    FROM ${competitor.tableName}`
    const { res } = await QueryStringSql(sql)
    return res || []
}
export const getDataCompetitor = async (workinfo) => {
    const sql = `
        INSERT INTO ${trackingSellOut.tableName}(shopId,workId,workDate,competitorId,competitorName,categoryId,categoryName,upload)
        SELECT DISTINCT ${workinfo.shopId},${workinfo.workId},${workinfo.workDate},c.competitorId,c.competitorName,p.categoryId,p.categoryName,0
        FROM (
            SELECT DISTINCT p.categoryId ,p.categoryName
            FROM ${products.tableName} AS p
            WHERE p.productCode NOT IN ("NOSELL","OOS")
        ) AS p
        LEFT JOIN ${competitor.tableName} AS c ON c.refId like "%"||p.categoryId||"%"
        WHERE NOT EXISTS (
            SELECT 1 FROM ${trackingSellOut.tableName} AS t 
            WHERE t.workId=${workinfo.workId} AND t.shopId=${workinfo.shopId}
            AND t.competitorId=c.competitorId AND t.categoryId=p.categoryId
        )
        ORDER BY p.categoryId,c.sortList
    `
    await QueryStringSql(sql);
    //
    const sqlGet = `
    SELECT t.*,
    (CASE WHEN (t.amount >0 AND t.amount < 1000) OR  (t.amount % 1000 > 0) THEN 1 ELSE 0 END) as amountValueError 
    FROM ${trackingSellOut.tableName} t
    WHERE t.shopId = ${workinfo.shopId} AND t.workId = ${workinfo.workId} AND t.workDate = ${workinfo.workDate}
    `
    const { res } = await QueryStringSql(sqlGet);
    return res || [];
}

export const updateItemTrackingSellOut = async (item) => {
    sql = `UPDATE ${trackingSellOut.tableName} 
    SET quantity = ${item.quantity}, 
    amount = ${item.amount}
    where id = ${item.id}`
    await QueryStringSql(sql)
}

export const clearDataTrackingSellOut = async (workinfo) => {
    sql = `UPDATE ${trackingSellOut.tableName} 
    SET quantity = null, 
    amount = null
    where shopId = ${workinfo.shopId} AND workId = ${workinfo.workId} AND workDate = ${workinfo.workDate}`
    await QueryStringSql(sql)
}
export const getTrackingSellOutResult = async (workinfo) => {
    sql = `SELECT * FROM ${trackingSellOut.tableName}
    where shopId = ${workinfo.shopId} AND workId = ${workinfo.workId} AND workDate = ${workinfo.workDate} 
    AND  (quantity is not null OR amount is not null )`
    const { res } = await QueryStringSql(sql);
    return res || [];
}
export const uploadTrackingSellOut = async (lstRes, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, lstRes, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = `UPDATE ${trackingSellOut.tableName} set upload=1 WHERE shopId = ${workinfo.shopId} AND workId = ${workinfo.workId} AND workDate = ${workinfo.workDate} `
                    await exeSqlNoQuery(db, sqlData);
                });
            }
            typeof (finish) === 'function' && finish();
        }, (result) => {
            ToastError(result.messager);
            typeof (error) === 'function' && error();
        })
    } catch (err) {
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}

const NoSell = async (workinfo, onFinish) => {
    const sql = `
    INSERT INTO ${sellOut.tableName}(workId,reportDate,shopId,productId,productCode,productName,division,quantity,upload)
    SELECT ${workinfo.workId},${workinfo.workDate},${workinfo.shopId},productId,productCode,productName, division,0,0
    FROM ${products.tableName} p 
    WHERE p.productCode='NOSELL'`
    await QueryStringSql(sql)
    await onFinish({ statusId: 200, messeger: 'Đã lưu' })
}
export const GetListSelloutVerify = async (month, year) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Authorization': token,
                "month": month,
                "year": year
            },
        }
        const response = await fetch(URLDEFAULT + 'sellouts/listselloutverify', requestInfo)
        const result = await response.json()
        if (result.data) {
            return result
        } else {
            MessageInfo('Có lỗi xảy ra khi lấy dữ liệu!')
            return null
        }

    } catch (err) {
        return err;
    }
}
export const SendSelloutVerify = async (itemUpload, listPhoto, type, noteCancel) => {
    try {
        const token = await GetToken();
        let jphoto = [];
        listPhoto?.forEach(element => {
            let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
            let fileName = '/uploaded/' + element.photoDate + '/' + ImgName
            jphoto.push({ ...element, photoPath: fileName });
        });
        const info = {
            detailId: itemUpload.detailId,
            imeiStatus: itemUpload.imeiStatus,
            serial: itemUpload.serial,
            note: type == 'submit' ? itemUpload.note : noteCancel,
            jsonPhoto: JSON.stringify(jphoto),
            customer: itemUpload.customer || '',
            address: itemUpload.address || '',
            phone: itemUpload.phone || '',
            typeSend: type,
            itemClassify: itemUpload.itemClassify,
            statusVerify: itemUpload.statusVerify,
            promotionType: itemUpload.promotionType,
        }
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Authorization': token,
            },
            body: JSON.stringify(JSON.stringify(info))
        }
        const response = await fetch(URLDEFAULT + 'sellouts/senditemselloutverify', requestInfo)
        const result = await response.json()
        return result
    } catch (err) {
        return err;
    }
}
export const SendAllVerify = async (itemUpload, listPhoto, type, noteCancel, actionResult) => {
    const res = await getPhotosByGuiIdUpload(itemUpload.guiId, itemUpload.shopId)
    if (type == 'submit') {
        if (itemUpload.status == 4 && res.length == 0) {
            const result = await SendSelloutVerify(itemUpload, listPhoto, type, noteCancel)
            actionResult(result)
            return
        } else {
            for (let index = 0; index < res.length; index++) {
                const element = res[index];
                await uploadAllDataPhoto([element], async () => {
                    if (index == (res.length - 1)) {
                        const result = await SendSelloutVerify(itemUpload, listPhoto, type, noteCancel)
                        const sql = `UPDATE photos SET dataUpload=1  
                            WHERE guid='${itemUpload.guiId}' 
                            AND shopId=${itemUpload.shopId} 
                            AND photoDesc = 'VERIFY' 
                            AND (dataUpload IS NULL OR dataUpload <> 1)
                        `
                        QueryStringSql(sql);
                        actionResult(result)
                        return
                    }
                }, async () => {
                    actionResult({ "messeger": "Xảy ra lỗi khi gửi hình!", "status": 500 })
                    return
                });
            }
        }
    } else {
        const result = await SendSelloutVerify(itemUpload, listPhoto, type, noteCancel)
        actionResult(result)
        return
    }
}
export const getInstoreShareByShop = async (dataFilter) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Authorization': token,
            },
            body: JSON.stringify(JSON.stringify(dataFilter))
        }
        const response = await fetch(URLDEFAULT + 'sellouts/getinstoreshare', requestInfo)
        const result = await response.json()
        if (result.data) {
            return result
        } else {
            MessageInfo('Có lỗi xảy ra khi lấy dữ liệu!')
            return null
        }

    } catch (err) {
        return err;
    }
}
export const sendInstoreShareByShop = async (itemUpload, actionResult) => {
    try {
        const token = await GetToken();

        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Authorization': token,
            },
            body: JSON.stringify(JSON.stringify(itemUpload))
        }
        const response = await fetch(URLDEFAULT + 'sellouts/sendinstoreshare', requestInfo)
        const result = await response.json()
        actionResult(result)
    } catch (err) {
        actionResult(err);
    }
}
export const SELLOUTContext = { NoSell, TotalSellOut }
