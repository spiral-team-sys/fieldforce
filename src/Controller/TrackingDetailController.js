import { exeSql, exeSqlNoQuery, Insert, InsertItems, QueryStringSql, Store, UpdateItem } from "../Core/SqliteDbContext"
import { URL_POST_TRACKING_DISPLAY, AppNameBuild, _competitorId, bekoApp, daikinApp, URLDEFAULT } from "../Core/URLs";
import Moment from 'moment';
import { alertError, ConvertDateFromInt } from "../Core/Utility";
import { uploadAllDataPhoto } from "./PhotoController";
import { trackingDetailHistory, trackingDetailResult } from "../Core/TableLocal";
import { uploadServer } from '../Controller/UploadController'
import { trackingDetail } from "../Core/Table";
import { GetToken, ToastError, ToastSuccess } from "../Core/Helper";
export const getListTrackLG = async (trackingId) => {
    let data = []
    await Store().then(async db => {
        let sql = "select * from trackingDetail WHERE trackingId=" + trackingId
            + " order by competitorId"
        const { res, err } = await exeSql(db, sql)
        data = res
    })
    return data
}
export const getLstISLG = async (trackingId) => {
    let data = []
    await Store().then(async db => {
        let sql = "select * from trackingDetail WHERE competitorId <> 62 AND trackingId=" + trackingId
            + " order by competitorId"
        const { res, err } = await exeSql(db, sql)
        data = res
    })
    return data
}
export const getListTrack = async () => {
    let data = []
    await Store().then(async db => {
        const sql = "select * from trackingDetail order by competitorId"
        const { res, err } = await exeSql(db, sql)
        data = res
    })
    return data
}
export const getListTrackRes = async (db, workInfo, item) => {
    let data = []
    await Store().then(async db => {
        const sql = "select * from trackingDetailResult"
            + " WHERE workId=" + workInfo.workId
            + " AND shopId=" + workInfo.shopId
            + " AND itemId=" + item.id
        const { res, err } = await exeSql(db, sql)
        data = res
    })
    return data
}
export async function insertTrackingBK(workInfo, item, display) {
    await Store().then(async db => {
        let lstHave = await getListTrackRes(db, workInfo, item)
        if (lstHave.length > 0) {
            UpdateItem(db, 'trackingDetailResult', { display: display }, { "workId": workInfo.workId, "shopId": workInfo.shopId, "categoryId": item.categoryId, "competitorId": item.competitorId, "trackingId": item.trackingId, "subCatId": item.subCatId, "itemId": item.id });
        }
        else {
            const itemPush = {
                workId: workInfo.workId,
                shopId: workInfo.shopId,
                trackingId: item.trackingId,
                competitorId: item.competitorId,
                categoryId: item.categoryId,
                category_viVN: item.category,
                subCatId: item.subCatId,
                subCategory: item.subCategory,
                refId: item.refId,
                refName: item.refName,
                display: display,
                itemId: item.id,
                upload: 0
            }
            console.log('IIII', itemPush);

            await InsertItems(db, 'trackingDetailResult', [itemPush]);
        }
    })
}
export async function insertTracking(workInfo, item, display) {

    await Store().then(async db => {

        let lstHave = await getListTrackRes(db, workInfo, item)
        if (lstHave.length > 0) {
            let itemI = {
                "workId": workInfo.workId,
                "shopId": workInfo.shopId,
                "categoryId": item.categoryId,
                "competitorId": item.competitorId,
                "trackingId": item.trackingId,
                "subCatId": item.subCatId,
                "itemId": item.id
            }

            UpdateItem(db, 'trackingDetailResult', { display: display }, itemI);
        }
        else {
            const itemPush = {
                workId: workInfo.workId,
                shopId: workInfo.shopId,
                trackingId: item.trackingId,
                itemId: item.id,
                competitorId: item.competitorId,
                categoryId: item.categoryId,
                category_viVN: item.category,
                subCatId: item.subCatId,
                subCategory: item.subCategory,
                refName: item.refName,
                display: display,
                upload: 0
            }


            await Insert(trackingDetailResult, [itemPush]);
        }
    })
}
export async function insertTrackingLG(workInfo, item, display) {

    await Store().then(async db => {

        let lstHave = await getListTrackRes(db, workInfo, item)
        if (lstHave.length > 0) {

            // let itemI = {
            //     "workId": workInfo.workId,
            //     "shopId": workInfo.shopId,
            //     "categoryId": item.categoryId,
            //     "competitorId": item.competitorId,
            //     "trackingId": item.trackingId,
            //     "subCatId": item.subCatId,
            //     "itemId": item.id
            // }

            // UpdateItem(db, 'trackingDetailResult', { display: display }, itemI);
            let sql = `UPDATE trackingDetailResult 
            SET display = ${display}
            WHERE itemId = ${item.id} `
            await QueryStringSql(sql)
        }
        else {

            const itemPush = {
                workId: workInfo.workId,
                shopId: workInfo.shopId,
                trackingId: item.trackingId,
                itemId: item.id,
                competitorId: item.competitorId,
                categoryId: item.categoryId,
                category_viVN: item.category,
                subCatId: item.subCatId,
                subCategory: item.subCategory,
                refName: item.refName,
                display: display,
                upload: 0
            }

            await InsertItems(db, 'trackingDetailResult', [itemPush]);
        }
    })
}
export async function insertPriceISLG(workInfo, item, price) {

    await Store().then(async db => {
        let lstHave = await getListTrackRes(db, workInfo, item)
        if (lstHave.length > 0) {

            // let itemI = {
            //     "workId": workInfo.workId,
            //     "shopId": workInfo.shopId,
            //     "categoryId": item.categoryId,
            //     "competitorId": item.competitorId,
            //     "trackingId": item.trackingId,
            //     "subCatId": item.subCatId,
            //     "itemId": item.id
            // }

            // UpdateItem(db, 'trackingDetailResult', { price: price }, itemI);
            let sql = `UPDATE trackingDetailResult 
            SET price = ${price}
            WHERE itemId = ${item.id} `
            await QueryStringSql(sql)

        }
        else {
            const itemPush = {
                workId: workInfo.workId,
                shopId: workInfo.shopId,
                trackingId: item.trackingId,
                itemId: item.id,
                competitorId: item.competitorId,
                categoryId: item.categoryId,
                category_viVN: item.category,
                subCatId: item.subCatId,
                subCategory: item.subCategory,
                refName: item.refName,
                price: price,
                upload: 0
            }

            await Insert(trackingDetailResult, [itemPush]);
        }
    })
}
export const getTotalTrackRes = async (db, workInfo, item) => {
    let data = []
    await Store().then(async db => {
        const sql = "select * from trackingDetailResult"
            + " WHERE workId=" + workInfo.workId
            + " AND shopId=" + workInfo.shopId
            + " AND itemId=" + item.id
        const { res, err } = await exeSql(db, sql)
        data = res
    })
    return data
}
export async function insertTotalTrackingLG(workInfo, item, display) {
    await Store().then(async db => {
        let lstHave = await getTotalTrackRes(db, workInfo, item)
        if (lstHave.length > 0) {
            let sql = '';
            if (item.isInputText == 1) {
                sql = `UPDATE trackingDetailResult 
                SET textValue = '${display}'
                WHERE itemId = ${item.id} and workId=${workInfo.workId}`
            } else {
                sql = `UPDATE trackingDetailResult 
                SET display = ${display}
                WHERE itemId = ${item.id} and workId=${workInfo.workId}`
            }
            await QueryStringSql(sql)
        } else {
            const itemPush = {
                workId: workInfo.workId,
                shopId: workInfo.shopId,
                trackingId: item.trackingId,
                itemId: item.id,
                competitorId: item.competitorId,
                categoryId: item.categoryId,
                category_viVN: item.category,
                subCatId: item.subCatId,
                subCategory: item.subCategory,
                refName: item.refName,
                display: item.isInputText == 1 ? item.display : display,
                textValue: item.isInputText == 1 ? display : item.textValue,
                upload: 0
            }
            await Insert(trackingDetailResult, [itemPush]);
        }
    })
}
export async function updateNoteTracking(workInfo, note, trackingId = null) {
    if (trackingId) {
        let sql = `UPDATE trackingDetailResult 
        SET note = "${note}"
        WHERE workId=${workInfo.workId} and shopId=${workInfo.shopId} 
        and trackingid in (${trackingId})`
        await QueryStringSql(sql);
    } else {
        await Store().then(async db => {
            UpdateItem(db, 'trackingDetailResult', { note: note }, { "workId": workInfo.workId, "shopId": workInfo.shopId });
        })
    }
}
export const clearDataTrackingCompetitor = async (workInfo, trackingId) => {
    const sql = `UPDATE ${trackingDetailResult.tableName}
        SET display = NULL,
            textValue = NULL,
            note = NULL,
            isChangeValue = 0,
            isCheckValue = 0
        WHERE workId=${workInfo.workId}
        AND shopId=${workInfo.shopId}
        AND trackingId in (${trackingId})
        AND (upload IS NULL OR upload <> 1)`
    await QueryStringSql(sql)
}
export const getAllListTrackRes = async (workInfo) => {
    const sql = `select * from ${trackingDetailResult.tableName}
        WHERE workId=${workInfo.workId}
        AND display IS NOT NULL`
    const { res } = await QueryStringSql(sql);
    return res || []
}
export const getAllListTrackResLG = async (workInfo, trackingId) => {
    const sql = `
        select * from ${trackingDetailResult.tableName}
        WHERE workId=${workInfo.workId}
        AND trackingId=${trackingId}
        AND (display IS NOT NULL OR price IS NOT NULL)
        ORDER BY categoryId`
    const { res } = await QueryStringSql(sql);
    return res || []
}

export const getAllListTrackUpload = async (workInfo, trackingId) => {
    const sql = `SELECT * from ${trackingDetailResult.tableName}
     WHERE upload = 1  AND workId=${workInfo.workId}
     AND trackingId in (${trackingId})
     `
    const { res } = await QueryStringSql(sql);
    return res || []
}
export const UploadTrackingDisplay = async (workinfo, res, note, finish) => {
    var details = [];
    if (res.length > 0) {
        res.forEach(item => {
            if (AppNameBuild === 'bk') {
                details.push(
                    {
                        "competitorId": item.competitorId,
                        "categoryId": item.refId,
                        "category": item.refName,
                        "display": item.display,
                        "refId": item.refId,
                        "refName": item.refName
                    })
            }
            else {
                details.push(
                    {
                        "competitorId": item.competitorId,
                        "categoryId": item.categoryId,
                        "category": item.category_viVN,
                        "display": item.display,
                        "note": note
                    })
            }
        });
    }
    else {
        details.push(
            {
                "competitorId": _competitorId,
                "categoryId": 0,
                "category": '',
                "display": 0,
                "note": note
            })
        const itemPush = {
            workId: workinfo.workId,
            shopId: workinfo.shopId,
            trackingId: 0,
            competitorId: _competitorId,
            categoryId: 0,
            category_viVN: null,
            subCatId: 0,
            subCategory: null,
            refName: null,
            display: 0,
            note: note,
            upload: 0
        }
        await Insert(trackingDetailResult, [itemPush]);
    }
    await uploadServer(workinfo, details, async (result) => {
        if (result.statusId === 200) {
            await QueryStringSql(`UPDATE ${trackingDetailResult.tableName} SET upload=1 WHERE workId=${workinfo.workId}`)
        }
        await finish(result.messager)
    }, null);
}

export const UploadTrackingDisplayLG = async (workinfo, res, resPhotos, finish) => {

    await Store().then(async (db) => {
        var details = [];

        res.forEach(item => {
            details.push(
                {
                    "competitorId": item.competitorId,
                    "categoryId": item.itemId,
                    "category": 'TRACKINGID',
                    "display": item.display,
                    "note": item.note
                })

        });

        let itemsPhoto = [];
        resPhotos.forEach(photoInfo => {
            let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
            let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
            let dataItem = {
                "shopId": photoInfo.shopId,
                "photoName": ImgName,
                "latitude": photoInfo.latitude,
                "longitude": photoInfo.longitude,
                "accuracy": 8,
                "reportId": photoInfo.reportId,
                "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                "photoType": photoInfo.photoType,
                "photoDate": photoInfo.photoDate,
                "photoPath": pathPhoto
            }
            itemsPhoto.push(dataItem);
        });

        var TrackingInfo = {
            "ShopId": workinfo.shopId,
            "WorkDate": ConvertDateFromInt(workinfo.workDate, 'YYYYMMDD', 'YYYY-MM-DD'),
            "Details": JSON.stringify(details),
            "Photos": JSON.stringify(itemsPhoto)
        };

        var Results = await UploadSer(URL_POST_TRACKING_DISPLAY, JSON.stringify(TrackingInfo));
        if (Results != null && Results.status == 200) {
            alert('Đã gửi dữ liệu');
            const sql = "Update trackingDetailResult set upload=1 WHERE WorkId=" + workinfo.workId;
            await exeSqlNoQuery(db, sql);
            await uploadAllDataPhoto(resPhotos);
            finish()
        } else {
            alert('Chưa gửi được dữ liệu');
        }
    });
}



//// edit form tracking
export const getListCategoryTracking = async (trackingId) => {
    const sql = `SELECT DISTINCT categoryId, category FROM ${trackingDetail.tableName} WHERE TrackingId IN (${trackingId}) ORDER BY categoryId`
    const { res } = await QueryStringSql(sql)
    return res || []
}
export const getListDataTracking = async (workInfo, trackingId) => {
    const queryInsert = `INSERT INTO ${trackingDetailResult.tableName} (workId,shopId,trackingId,itemId,competitorId,display,price,categoryId,category_viVN,subCatId,subCategory,oldDisplay,oldTrackingDisplayId,oldEmployeeId)
        SELECT ${workInfo.workId},${workInfo.shopId},t.trackingid,t.id,t.competitorId,h.display,h.price,t.categoryId,ifnull(t.category_viVN, t.category), t.subCatId,t.subCategory,h.display,h.oldTrackingDisplayId,h.oldEmployeeId
        FROM ${trackingDetail.tableName} AS t 
        LEFT JOIN ${trackingDetailHistory.tableName} AS h ON h.shopId=${workInfo.shopId} AND h.itemId=t.id
        WHERE t.trackingid in (${trackingId})
        AND NOT EXISTS (SELECT 1 FROM ${trackingDetailResult.tableName} AS r WHERE r.workId=${workInfo.workId} AND r.itemId=t.id)
    `
    await QueryStringSql(queryInsert)
    //
    const sql = `SELECT t.* ,s.display, s.price, s.upload, s.note, s.isChangeValue, s.isCheckValue,
                ifnull(s.oldDisplay,h.display) AS oldDisplay,
                ifnull(s.oldTrackingDisplayId,h.oldTrackingDisplayId) AS oldTrackingDisplayId,
                ifnull(s.oldEmployeeId,h.oldEmployeeId) AS oldEmployeeId,
                ifnull(s.textValue,'') AS textValue, ifnull(t.textValue,0) AS isInputText
                FROM ${trackingDetailResult.tableName} as s
                LEFT JOIN ${trackingDetail.tableName} as t ON s.itemId = t.id AND t.trackingId in(${trackingId}) 
                LEFT JOIN ${trackingDetailHistory.tableName} AS h ON h.shopId=${workInfo.shopId} AND h.itemId=s.itemId
                WHERE s.workId = ${workInfo.workId} AND s.shopId = ${workInfo.shopId} AND s.trackingId in(${trackingId}) 
                ORDER BY t.categoryId,${AppNameBuild !== daikinApp && `${AppNameBuild === bekoApp ? 't.competitorId, t.subCatId' : 't.subCatId, t.competitorId'}`},t.orderBy
            `
    const { res } = await QueryStringSql(sql)
    return res || []
}

export const updateCheckValueTracking = async (workInfo, item) => {
    const sql = `UPDATE ${trackingDetailResult.tableName}
        SET isChangeValue=${item.isChangeValue || 0},
            isCheckValue=${item.isCheckValue || 0},
            display=${item.display === null || item.display === undefined ? 'null' : item.display}
        WHERE itemId=${item.id} AND workId=${workInfo.workId} AND shopId=${workInfo.shopId}`
    await QueryStringSql(sql)
}

//// Survey Result
export const insertSurveyResult = async (workInfo, item, textValue) => {
    await Store().then(async db => {
        let lstHave = await getTotalTrackRes(db, workInfo, item)
        if (lstHave?.length > 0) {
            let sql = `UPDATE trackingDetailResult 
            SET textValue = '${textValue}'
            WHERE itemId = ${item.id} and workId=${workInfo.workId}`
            await QueryStringSql(sql)
        }
        else {
            const itemPush = {
                workId: workInfo.workId,
                shopId: workInfo.shopId,
                trackingId: item.trackingId,
                itemId: item.id,
                competitorId: item.competitorId,
                categoryId: item.categoryId,
                category_viVN: item.category,
                subCatId: item.subCatId,
                subCategory: item.subCategory,
                refName: item.refName,
                textValue: textValue,
                upload: 0
            }
            await Insert(trackingDetailResult, [itemPush]);
        }
    })
}

export const dataSurveyResult = async (dataUpload, workinfo, trackingId, finish, error) => {
    try {
        await uploadServer(workinfo, dataUpload, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = `Update ${trackingDetailResult.tableName} set upload=1 WHERE workId=${workinfo.workId}
                    AND shopId=${workinfo.shopId}
                    AND trackingId in (${trackingId})`
                    await exeSqlNoQuery(db, sqlData);
                });
            }
            typeof (finish) === 'function' && finish();
        }, (result) => {
            ToastSuccess(result.messager);
            typeof (error) === 'function' && error();
        })
    } catch (err) {
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}

//// Edit form TrackingDislayMEVN

export const getListItemDisplayMEVN = async (workInfo, trackingId) => {
    const sql = `SELECT t.* , s.display, s.price
                FROM ${trackingDetail.tableName} as t
                LEFT JOIN ${trackingDetailResult.tableName} as s ON s.workId = ${workInfo.workId} AND s.shopId = ${workInfo.shopId} AND s.itemId = t.id
                WHERE t.trackingId in (${trackingId})`
    // console.log(sql);
    const { res } = await QueryStringSql(sql)
    return res || []
}
export const getlistCompetitor = async () => {
    const sql = `SELECT DISTINCT competitorId as idCom, competitorName as name
                FROM ${trackingDetail.tableName}
                ORDER BY competitorId`
    // console.log(sql);
    const { res } = await QueryStringSql(sql)
    return res || []
}

export const cleatData = async (workId) => {
    let sql = `UPDATE ${trackingDetailResult.tableName} SET display = null where workId = ${workId} `
    await QueryStringSql(sql)
}

export const updateItemSurvey = async (item) => {
    const sql = `UPDATE ${trackingDetailResult.tableName} SET textValue='${item.textValue}' WHERE workId=${item.workId} AND itemId=${item.itemId}`
    await QueryStringSql(sql)
}

export const GetListTrackingStore = async (shopId, reportId, actionResult) => {

    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "shopId": shopId,
                "reportId": reportId
            }
        }
        const response = await fetch(URLDEFAULT + "shops/trackingstore", requestInfo)
        const result = await response.json()

        if (result.statusId === 200)
            actionResult(result.data)
    } catch (err) {
        console.log(err)
    }
}

export const uploadTrackingStore = async (shopId, dataStore, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "shopId": shopId
            },
            body: JSON.stringify(JSON.stringify(dataStore))
        }
        const responseJson = await fetch(URLDEFAULT + 'shops/update/trackingstore', requestInfo);
        const result = await responseJson.json();
        actionResult(result)
    } catch (e) {
        alertError('Error: ' + e)
    }

}
