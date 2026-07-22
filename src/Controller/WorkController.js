import { SelectItems, InsertItems, exeSql, Store, UpdateItem, DeleteItem, exeSqlNoQuery, _createTable, QueryStringSql, Insert } from "../Core/SqliteDbContext"//"../Core/SqliteDbContext";
import { GetToken, ToastError, ToastSuccess, Token, UploadData, UUIDGenerator } from '../Core/Helper';
import { URL_UPLOAD_AUDIT_DISPLAY, URL_UPLOAD_PHOTOS, URL_SAVE_NOTE_ATTENDANT, EMPLOYEE_TYPE_PHOTO, AppNameBuild, epsonApp, hafeleApp, URL_POST_SELLOUTUPLOAD, URL_UPLOAD_STOCK, URL_UPLOAD_DISPLAY, URL_UPLOAD_OOS, URL_UPLOAD_EVIDENT, URL_POST_SELLOUTUPLOAD_DB, URL_UPLOAD_OT_TIME, URLDEFAULT } from '../Core/URLs';
import Moment from 'moment';
import { alertError, alertNotify, ConvertDateFromInt, checkNetwork, alertToast, TODAY } from "../Core/Utility";
import { All_Select, WARNING_CONNECT_SERVER } from "../Component/common";
import { doneUploadPhoto } from './SellOutController';
let RNFS = require('react-native-fs');
import { _competitorId } from '../Core/URLs';
import { display, photos, sellOut, stockout, trackingDetailResult, workResults } from "../Core/TableLocal";
import { UpdateStatusPhotoData, uploadAllDataPhoto } from "./PhotoController";
import { products, taskList } from "../Core/Table";
import { uploadServer } from "./UploadController";
import moment from "moment";

export const GetWorkHistory = async (shopinfo) => {
    const sql = `SELECT * FROM ${workResults.tableName} WHERE shopId=${shopinfo.shopId} ORDER BY workDate DESC`
    const { res } = await QueryStringSql(sql)
    return await res || []
}
export async function uploadOOSData(mWORK, lstUploadOOS, finish, errorAct) {
    let itemUpload = [];
    lstUploadOOS.forEach(item => {
        let itemOOS = {
            "ShopId": mWORK.shopId,
            "WorkDate": mWORK.workDate,
            "ProductId": item.productId,
            "OOS": item.oos
        }
        itemUpload.push(itemOOS);
    });

    let uploadJSON = {
        ShopId: mWORK.shopId,
        WorkDate: mWORK.workDate,
        oosDetail: JSON.stringify(itemUpload)
    }

    //console.log(itemUpload)
    try {
        let access_token = await Token();
        await fetch(URL_UPLOAD_OOS, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token
            },
            body: JSON.stringify(uploadJSON)
        }).then(response => {
            return response.json();
        }).then(responseJson => {
            //console.log(responseJson)
            if (responseJson.status == 200) {
                alertNotify(responseJson.messeger);
                finish();
            }

            errorAct();
        }).catch(error => {
            errorAct();
            alertError(WARNING_CONNECT_SERVER);
        });
    } catch (error) {
        errorAct();
        alertError("" + error);
    }
}
export async function uploadDisplayData(resDisplay, resPhotos, workinfo, finish, errorAct) {
    let access_token = await Token();
    try {
        let items = [];
        resDisplay.forEach(item => {
            let dataItem = {
                "productId": item.productId,
                "quantity": item.quanityDisplay !== "" ? item.quanityDisplay : 0,
                "quanityStock": item.quanity !== "" ? item.quanity : 0,
                "quanitySuggest": item.quanitySuggest !== "" ? item.quanitySuggest : 0,
                "price": item.price !== "" ? item.price : 0,
                "displayType": null,
                "displayComment": item.displayComment,
            }
            items.push(dataItem);
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
                "accuracy": 0,
                "reportId": photoInfo.reportId,
                "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                "photoType": '' + photoInfo.photoType,
                "photoDate": photoInfo.photoDate,
                "photoPath": pathPhoto
            }
            itemsPhoto.push(dataItem);
        });

        let UploadJson = { WorkDate: Moment(new Date).format('YYYYMMDD'), ShopId: workinfo.shopId, Details: JSON.stringify(items), Photos: JSON.stringify(itemsPhoto) }
        await fetch(URL_UPLOAD_DISPLAY, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(UploadJson)
        }).then(response => {
            return response.json();
        }).then(responseJson => {
            if (responseJson.status == 200) {
                if (responseJson.messeger === "Đã gửi báo cáo") {
                    updateStatusDisplay(workinfo);
                    QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
                }
                finish(responseJson.messeger);
            }
            else {
                errorAct(responseJson.messeger)
            }
        }).catch(error => {
            errorAct(error)
        });
    }
    catch (error) {
        errorAct(error)
    }
}
export async function uploadStockoutData(stockData, workinfo, finish) {
    let token = await GetToken();
    try {
        let items = [];
        stockData.forEach(item => {
            let dataItem = {
                "productId": item.productId,
                "quantity": item.quanity,
                "noteStock": item.displayComment
            }
            items.push(dataItem);
        });
        let UploadJson = { WorkDate: Moment(new Date).format('YYYYMMDD'), ShopId: workinfo.shopId, Details: JSON.stringify(items) }
        const response =
            await fetch(URL_UPLOAD_STOCK, {
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
                body: JSON.stringify(UploadJson)
            });
        const result = await response.json();
        // console.log(result)
        if (result.statusId === 200) {
            await updateStatusStock(workinfo);
            await QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
        }
        await finish(result)
    } catch (err) {
        finish({ statusId: 404, messeger: "Lỗi kết nối dữ liệu với hệ thống" })
    }
}
export async function getCategoryPro(comId) {
    let lst = [];

    await Store().then(async db => {
        const sql = "select categoryName  as label,categoryId as value from products"
            + " where type = " + comId
            + " GROUP BY categoryId"
        const { res, err } = await exeSql(db, sql)
        lst = res
    })

    return lst;
}
export async function uploadSelloutWFH(resupload, workinfo, finish, errorAct) {
    var details = [];

    resupload.forEach(item => {
        details.push(
            {
                "ProductId": item.productId,
                "CompetitorId": item.competitorId,
                "CategoryId": item.categoryId,
                "ProductCode": item.productCode,
                "Quantity": item.quantity,
                "Price": 0,
                "CustName": item.custName || item.custName,
                "CustPhone": item.custPhone || item.custPhone,
                "CustAddress": item.custAddress || item.custAddress,
                "IMEI1": item.serial || item.serial,
                "note": item.sellComment || item.sellComment,
                "Gender": item.gender || item.gender,
                "Age": item.age || item.age,
                "Color": item.color || item.color,
                "guiId": item.guiId,
                "ProductName": item.productName,
                "ShopId": item.shopId
            })
    });

    var SellInfo = {
        "SellDate": ConvertDateFromInt(workinfo.workDate, 'YYYYMMDD', 'YYYY-MM-DD'),
        "Details": JSON.stringify(details)
    };

    var Results = await UploadData(URL_POST_SELLOUTUPLOAD_DB, JSON.stringify(SellInfo));
    if (Results != null && Results.status == 200) {
        alertToast('Gửi dữ liệu thành công');
        await Store().then(async (db) => {
            const sql = "Update Sellout set upload=1 WHERE auditDate=" + workinfo.workDate;
            await exeSqlNoQuery(db, sql);
            await QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
        });
        finish();
    } else {
        errorAct()
        alertError('Chưa gửi được dữ liệu SS');
    }
}
export async function uploadSelloutData(resupload, workinfo, finish, errorAct) {
    var details = [];
    let resPhotos = await getAllPhotosUploaded(0, workinfo.shopId, workinfo.workDate) || [];

    resupload.forEach(item => {
        details.push(
            {
                "ShopId": item.shopId,
                "ProductId": item.productId,
                "ProductName": item.productName,
                "CompetitorId": item.competitorId,
                "CategoryId": item.categoryId,
                "ProductCode": item.productCode,
                "Quantity": item.quantity,
                "Price": item.price || 0,
                "CustName": item?.custName || null,
                "CustPhone": item?.custPhone || null,
                "CustAddress": item?.custAddress || null,
                "IMEI1": item?.serial || null,
                "note": item?.sellComment || null,
                "Gender": item?.gender || null,
                "Age": item?.age || null,
                "Color": item?.color || null,
                "guiId": item?.guiId || null

            })
    });

    let itemsPhoto = [];
    resPhotos.forEach(photoInfo => {
        let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
        // let pathPhoto = URLDEFAULT + 'uploaded/' + photoInfo.photoDate + '/' + ImgName
        let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
        let dataItem = {
            "shopId": photoInfo.shopId,
            "photoName": ImgName,
            "latitude": photoInfo.latitude,
            "longitude": photoInfo.longitude,
            "accuracy": photoInfo.accuracy || -1,
            "reportId": photoInfo.reportId,
            "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            "photoType": `${photoInfo.photoType}`,
            "photoDate": photoInfo.photoDate,
            "photoPath": pathPhoto,
            "guid": photoInfo.guid
        }
        itemsPhoto.push(dataItem);
    });

    var SellInfo = {
        "ShopId": workinfo.shopId,
        "SellDate": ConvertDateFromInt(workinfo.workDate, 'YYYYMMDD', 'YYYY-MM-DD'),
        "Details": JSON.stringify(details),
        "Photos": JSON.stringify(itemsPhoto)
    };

    var Results = await UploadData(URL_POST_SELLOUTUPLOAD, JSON.stringify(SellInfo));
    if (Results != null && Results.status == 200) {
        alertToast('Gửi dữ liệu thành công');
        await Store().then(async (db) => {
            const sql = "Update Sellout set upload=1 WHERE WorkId=" + workinfo.workId;
            await exeSqlNoQuery(db, sql);
            await uploadAllDataPhoto(resPhotos);
            resPhotos.map(async itemR => {
                await UpdateStatusPhotoData(itemR.id)
            })

            QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
        });
        finish();
    } else {
        errorAct()
        alertError('Chưa gửi được dữ liệu');
    }
}
export async function uploadCMND(actionDone) {
    let mPhoto = await getPhotoCMND();
    if (mPhoto !== null && mPhoto.length > 0) {
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
                    "photoDate": photoInfo.photoDate,
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
            })
        } catch (error) {
            actionDone(error)
        }
    } else {
        actionDone("Hình ảnh đã được gửi hết")
    }
}
export async function uploadFileCMND() {
    let dataPhoto = await getPhotoCMND();
    if (dataPhoto == null || dataPhoto.length < 1)
        return
    try {
        let access_token = await Token();
        dataPhoto.forEach(async photoInfo => {
            let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
            if (ImgName === 'undefined') return
            var ImageAsBase64 = await RNFS.readFile(photoInfo.photoPath, 'base64');
            let dataItem = {
                "shopCode": photoInfo.shopCode,
                "PhotoName": ImgName,
                "PhotoTime": photoInfo.photoTime.toString(),
                "PhotoData": ImageAsBase64,
                "photoDate": photoInfo.photoDate
            }
            await fetch(URL_UPLOAD_PHOTOS, {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token,
                },
                body: JSON.stringify(dataItem)
            }).then(response => {
                return response.json();
            }).then(responseJson => {
                if (responseJson.status == 100) {
                    doneUploadPhoto(photoInfo.id)
                }
                else {
                    alertError('Vui lòng vào album để up lại hình, Lỗi: ' + responseJson.messeger);
                }
            })
        });
    } catch (error) {
        alertError('Vui lòng vào album để up lại hình, Lỗi: ' + error);
    }
}
export async function getPhotoCMND() {
    let mPhoto = [];
    await Store().then(async db => {
        const sql = "select * from photos"
            + " where fileUpload = 0 and reportId = 0 and shopId = 0"
            + " and photoType like 'CMND_%'"
            + " and photoPath not in ('undefined')"
        const { res, err } = await exeSql(db, sql)
        mPhoto = res
    })
    return mPhoto;
}
export async function saveNoteAttendant(shopId, workdate, note, actionResult, isProgress) {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
        alertWarning("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
        return;
    }
    let itemNote = {
        "ShopId": shopId,
        "WorkDate": workdate,
        "Note": note
    }
    try {
        let access_token = await Token();
        await fetch(URL_SAVE_NOTE_ATTENDANT, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token
            },
            body: JSON.stringify(itemNote)
        }).then(response => {
            return response.json();
        }).then(responseJson => {
            if (responseJson.status === 200) {
                actionResult(responseJson.messeger);
            } else {
                actionResult(responseJson.title)
            }
            isProgress(false);
        }).catch(error => {
            actionResult('' + error);
            isProgress(false);
        })
    } catch (e) {
        actionResult('' + e);
        isProgress(false);
    }
}
export async function uploadTimeOT(shopId, workdate, OTTime, note, actionResult) {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
        alertWarning("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
        return;
    }
    let itemNote = {
        "ShopId": shopId,
        "WorkDate": workdate,
        "Note": note,
        "OTTime": OTTime
    }
    try {
        let access_token = await Token();
        await fetch(URL_UPLOAD_OT_TIME, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token
            },
            body: JSON.stringify(itemNote)
        }).then(response => {
            return response.json();
        }).then(responseJson => {
            actionResult(responseJson);
        }).catch(error => {
            actionResult({ "status": 100, "messeger": "Không kết nối được với hệ thống" });
        })
    } catch (e) {
        actionResult({ "status": 100, "messeger": "Lỗi" + e });
    }
}
export async function NewWork(db, workitem) {
    let res = await GetWorkInfo(db, workitem.shopId, workitem.workDate);
    if (res == null || res.length == 0) {
        await Insert(workResults, [workitem]);
        res = await GetWorkInfo(db, workitem.shopId, workitem.workDate);
    }
    return res[0];
}
export async function checkAddWork(workitem) {
    let lst = [];
    let lstWork = await GetLstWorkInfo(workitem.shopId, workitem.workDate);
    lst = lstWork;
    if (lst.length == 0) {
        await Store().then(async db => {
            await InsertItems(db, 'workResults', [workitem]);
        });
        let lstwork = await GetLstWorkInfo(workitem.shopId, workitem.workDate);
        lst = lstwork;
    }
    return lst[0];
}
export async function GetLstWorkInfo(shopId, workDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'SELECT * FROM workResults WHERE shopId=' + shopId + ' AND workDate=' + workDate
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function MarketGetList(workinfo) {
    const sql = `Select * FROM market Where workId=${workinfo.workId} ORDER BY Id DESC`;
    const { res } = await QueryStringSql(sql);
    return await res || []
}
export async function PromotionGetList(workinfo) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * FROM promotion Where workId=' + workinfo.workId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function SellOutUpload(workinfo) {
    const sql = `
        Select s.* FROM ${sellOut.tableName} s
    WHERE(s.upload IS NULL OR s.upload = 0) AND workId = ${workinfo.workId} `
    return await QueryStringSql(sql);
}
export async function GetSelloutBy(id, workId) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * FROM sellOut WHERE competitorId=' + id + ' AND workId=' + workId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function CheckIMEISellout(IMEI, columnName) {
    let lst = [];
    await Store().then(async db => {
        let sql = ''
        if (columnName == 'IMEI2') {
            sql = "Select * FROM sellOut WHERE IMEI2='" + IMEI + "' COLLATE NOCASE";
        } else {
            sql = "Select * FROM sellOut WHERE serial='" + IMEI + "' COLLATE NOCASE";
        }
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function Check2IMEISellout(IMEI, IMEI2, productId, sellId, checkDuplicate = 0) {
    let lst = [];
    await Store().then(async db => {
        let sql = ''
        // sql = "Select * FROM sellOut WHERE IMEI2='" + IMEI + "' AND serial='" + IMEI2 + "' AND productId =  COLLATE NOCASE";
        sql = `SELECT * FROM sellOut 
            WHERE IMEI2='${IMEI2}' COLLATE NOCASE 
            AND serial='${IMEI}' COLLATE NOCASE
            AND productId=${productId} 
            ${sellId !== undefined && sellId > 0 ? ('AND sellId<>' + sellId) : ''}
        `
        let result = await exeSql(db, sql);

        if (checkDuplicate == 1 && result.res?.length == 0) {
            sql = `SELECT * FROM sellOut 
                WHERE (IMEI2='${IMEI2}' COLLATE NOCASE 
                OR serial='${IMEI}' COLLATE NOCASE)
                AND productId=${productId} 
                ${sellId !== undefined && sellId > 0 ? ('AND sellId<>' + sellId) : ''}
            `
            result = await exeSql(db, sql);
            console.log(result.res, 'res2res2res2');
            lst = result.res;
        } else {
            lst = result.res;
        }
    });
    return lst;
}
export async function PromotionUpload(db, workinfo) {
    const sql = "Select * FROM promotion Where upload<>1 AND workId=" + workinfo.workId;
    return await exeSql(db, sql);
}
export async function MarketUpload(workinfo) {
    const sql = `Select * FROM market Where upload<>1 AND workId=${workinfo.workId}`;
    const { res } = await QueryStringSql(sql);
    return res || []
}
export async function getDisplayCompetitorResult(workinfo, categoryId) {
    const sql = `SELECT *
        FROM displayCompetitor
             Where workId = ${workinfo.workId} 
             ${categoryId > 0 ? ' AND categoryId=' + categoryId : ''} `;
    const { res } = await QueryStringSql(sql);
    return res || [];
}
export async function getStatusCompetitorResult(workinfo) {
    const sql = `SELECT * FROM displayCompetitor WHERE workId = ${workinfo.workId} `;
    const { res } = await QueryStringSql(sql)
    return res || []
}
export async function getIdMaxMessenger() {
    const { res } = await QueryStringSql(`Select Max(Id) as max FROM messenger`)
    return res || []
}
export async function MaxIdNotify() {
    const sql = 'SELECT MAX(Id) as max FROM messenger';
    const { res } = await QueryStringSql(sql);
    return res !== null && res.length > 0 ? res[0].max : 0;
}
export async function getIdMaxPhotos(photoDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE photoType NOT IN ('CMND_BEFORE','CMND_AFTER','LEAVE_JOB') AND id in ("
            + "Select Max(id) FROM photos WHERE dataUpload=0 AND fileUpload=0 AND photoDate=" + photoDate + ")";
        // alert(sql)
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getIdPhotoCMND(photoDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE photoType IN ('CMND_BEFORE','CMND_AFTER') AND id in ("
            + "Select Max(id) FROM photos WHERE dataUpload=0 AND fileUpload=0 AND photoDate=" + photoDate + ")";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getIdMaxOverview(shopId, today) {
    try {
        const sql = `SELECT * FROM photos 
            WHERE id in (Select Max(id) FROM photos WHERE reportId = -1 AND photoType = '-1' AND  shopId = ${shopId} AND photoDate = ${today})`
        const { res } = await QueryStringSql(sql)
        return res || []
    } catch (eer) {
        console.log(shopId, "getIdMaxOverview")
        return []
    }
}
export async function getIdMaxImage(photoDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE photoType NOT IN ('CMND_BEFORE','CMND_AFTER') AND id in ("
            + 'Select Max(id) FROM photos WHERE photoDate=' + photoDate + " AND photoType='" + EMPLOYEE_TYPE_PHOTO + "')";
        // alert(sql)
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getLstMessenger() {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select *  FROM messenger WHERE typeReport!='Payslip' ORDER BY id DESC";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getLstMessengerPayslip() {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * FROM messenger WHERE typeReport='Payslip' ORDER BY id DESC";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function updateMessenger(id) {
    await Store().then(async db => {
        UpdateItem(db, 'messenger', { seen: 1 }, { "id": id });
    });
}
export const getLstMessengerNotSeen = async () => {
    const sql = "Select * FROM messenger WHERE (seen IS NULL OR seen = 0)  AND typeReport is not null AND typeReport not in ('Payslip')";
    let { res } = await QueryStringSql(sql);
    return await res;
}
export async function getManagerNotifi() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * FROM messenger';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getStoreList(search = '', date, actionResult) {
    let sql = `SELECT shopId as id, shopName as title, st.*,
        (SELECT COUNT(*) FROM photos p WHERE p.shopId = st.shopId AND p.photoDate = st.auditDate AND p.reportId = 1) as finish
        FROM storelist as st
        WHERE st.shopCode NOT IN('1', 'Z') AND st.auditDate = ${date} `
    if (search !== '')
        sql += ` AND(st.shopName like '%${search}%' OR st.shopCode like '%${search}%')`
    sql += ` ORDER BY orderBy`
    const { res } = await QueryStringSql(sql);
    actionResult && actionResult(res)
    return res || []
}
export async function isExistAddColum(tableName, columnName, columnType) {
    let isHave = false;
    let lstCol = [];
    await Store().then(async db => {
        const sql = "PRAGMA table_info(" + tableName + ")"
        const { res, err } = await exeSql(db, sql);
        lstCol = res;
    });

    if (Array.isArray(lstCol) && lstCol.length > 0) {
        let lstHave = lstCol.filter(item => item.name === columnName);

        if (Array.isArray(lstHave) && lstHave.length === 0) {
            addColumToTable(tableName, columnName, columnType)
        }
    }

}

export async function createAuditDisplayItemNew() {
    await Store().then(async db => {
        // await _createTable(db, auditDisplayItems); //old
        // await _createTable(db, installPOP);
        await _createTable(db, trackingDetailResult);
    });
}

export async function changeTypeColum(tableName, columnName, columnType) {
    await Store().then(async db => {
        const sql = "ALTER TABLE " + tableName
            + " ALTER COLUMN " + columnName + " " + columnType + " ;"
        const { res, err } = await exeSql(db, sql);
        // alertPrint(sql)
    });

}
export async function addTableSettingApp() {
    await Store().then(async db => {
        try {
            const sql = 'CREATE TABLE IF NOT EXISTS settingapp (id INTEGER PRIMARY KEY, name NVARCHAR(200), nameVN NVARCHAR(200),status INTEGER);'
            var { res } = await exeSql(db, sql);

            const sqlGet = 'SELECT * FROM settingapp'
            var { res } = await exeSql(db, sqlGet)
            if (res === undefined) {
                await InsertItems(db, 'settingapp', [{ id: 3, name: 'sort list MENU', nameVN: 'hiển thị danh sách Menu', status: 0 }]);
                await InsertItems(db, 'settingapp', [{ id: 4, name: 'sort list KPI', nameVN: 'hiển thị danh sách KPI', status: 0 }]);
            }

        }
        catch (errorstr) {
            // alertPrint(errorstr) 
        }
    });
}
export async function updateSetting(id) {
    await Store().then(async db => {
        let sql = 'Update settingapp set status= case when status = 1 then 0 else 1 end where id=' + id
        await exeSql(db, sql);
    });
}
export async function updateSettingBy(id, status) {
    await Store().then(async db => {
        let sql = 'Update settingapp set status=' + status
            + ' where id=' + id;
        await exeSql(db, sql);
    });
}
export async function getSettingApp() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * '
            + ' FROM settingapp'
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function addColumToTable(tableName, columnName, columnType) {
    await Store().then(async db => {
        const sql = "ALTER TABLE " + tableName + " ADD " + columnName + " " + columnType + " NULL";
        const { res, err } = await exeSql(db, sql);
    });
}
export async function getUploadDisplayCompetitorResult(workinfo) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * '
            + ' FROM displayCompetitor'
            + ' Where workId=' + workinfo.workId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getCategory() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select Distinct categoryid as id, categoryName as name, competitorName as division'
            + ' FROM trackingCompetitor GROUP BY categoryid';
        // + (divisioninfo === null ? '':(divisioninfo.id === 0 ? '':(" Where competitorId="+divisioninfo.id)));
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function GetCometitorTracking() {
    const sql = `SELECT DISTINCT competitorId as id, competitorName as name,categoryId as categoryId,1 isAdd FROM trackingCompetitor`
    const { res } = await QueryStringSql(sql);
    return res || [];
}
export async function getCompetitorItemRes(workId, divisionId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayCompetitor WHERE workId=" + workId
            + ' AND divisionId=' + divisionId
        // alert(sql)
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
//test
export async function getCompetitorByCate(workId, divisionId, categoryId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayCompetitor WHERE workId=" + workId
            + ' AND divisionId=' + divisionId
            + " AND categoryId=" + categoryId
        // alert(sql)
        const { res, err } = await exeSql(db, sql);

        lst = res;
    });

    return lst;
}
export async function insertManyCompetitorResult(item) {

    await Store().then(async db => {
        await InsertItems(db, 'displayCompetitor', [item]);
    });
}
export async function insertCompetitorResult(item) {

    await Store().then(async db => {
        await getCompetitorItemRes(item.workId, item.divisionId, item.categoryId !== null ? item.categoryId : null).then(async lstHave => {
            if ((lstHave).length > 0) {
                await UpdateItem(db, 'displayCompetitor', { quantity: item.quantity }, { "workId": item.workId, "divisionId": item.divisionId });
            }
            else {
                await InsertItems(db, 'displayCompetitor', [item]);
            }
        })
    });
}
export async function insertCompetitorByCateResult(item) {
    await Store().then(async db => {
        await getCompetitorByCate(item.workId, item.divisionId, item.categoryId).then(async lstHave => {
            if ((lstHave).length > 0) {
                await UpdateItem(db, 'displayCompetitor', { quantity: item.quantity }, { "workId": item.workId, "divisionId": item.divisionId, "categoryId": item.categoryId });
            }
            else {
                await InsertItems(db, 'displayCompetitor', [item]);
            }
        })
    });
}
export async function deleteCompetitorResult(displayCompetitor) {
    await Store().then(async db => {
        DeleteItem(db, 'displayCompetitor', { displayCompetitorId: displayCompetitor.displayCompetitorId });
    });
}
export async function deleteAllCompetitorResult(workId) {
    await Store().then(async db => {
        DeleteItem(db, 'displayCompetitor', { workId: workId });
    });
}
export async function updateCompetitorResult(idItem, displayCompetitor) {
    await Store().then(async db => {
        UpdateItem(db, 'displayCompetitor', displayCompetitor, { "displayCompetitorId": idItem });
    });
}
export async function updateStatusCompetitorResult(workinfo) {
    await Store().then(async db => {
        UpdateItem(db, 'displayCompetitor', { upload: 1 }, { "workId": workinfo.workId });
    });
}
export async function insertDisplayResult(display, type) {

    await Store().then(async db => {
        await getDisplayItemRes(display.workId, display.displayId, display.itemId).then(async lstHave => {
            if ((lstHave).length > 0) {

                switch (type) {
                    case 1:
                        await UpdateItem(db, 'displayAudit', { kpi1: display.kpi1 }, { "workId": display.workId, "displayId": display.displayId, "itemId": display.itemId, "displayRef": display.displayRef });
                        break
                    case 2:
                        await UpdateItem(db, 'displayAudit', { kpi2: display.kpi2 }, { "workId": display.workId, "displayId": display.displayId, "itemId": display.itemId, "displayRef": display.displayRef });
                        break
                    case 3:
                        await UpdateItem(db, 'displayAudit', { kpi3: display.kpi3, kpi2: display.kpi2 }, { "workId": display.workId, "displayId": display.displayId, "itemId": display.itemId, "displayRef": display.displayRef });
                        break
                        break
                    case 7:
                        await UpdateItem(db, 'displayAudit', { kpi7: display.kpi7 }, { "workId": display.workId, "displayId": display.displayId, "itemId": display.itemId, "displayRef": display.displayRef });
                        break
                    default:
                        await InsertItems(db, 'displayAudit', [display]);
                        break
                }

            }
            else {
                await InsertItems(db, 'displayAudit', [display]);
            }
        })
    });
}

export async function insertDisplayHPResult(display) {
    await Store().then(async db => {
        await getDisplayItemRes(display.workId, display.displayId, display.itemId).then(async lstHave => {
            if ((lstHave).length > 0) {
                await UpdateItem(db, 'displayAudit', { quanity: display.quanity }, { "workId": display.workId, "displayId": display.displayId, "itemId": display.itemId });
            }
            else {
                await InsertItems(db, 'displayAudit', [display]);
            }
        })
    });
}
// export async function updateAuditDisplayResult(display) {
//     await Store().then(async db => {
//         await UpdateItem(db, 'displayAudit', { havePack: display.havePack }, { "workId": display.workId, "displayId": display.displayId});
//     });
// }
export async function insertDisplay(info) {
    await Store().then(async db => {
        await getDisplayRes(info.workId, info.productId).then(async lstHave => {

            if ((lstHave).length > 0) {
                await UpdateItem(db, display.tableName, { quanity: info.quanity }, { "workId": info.workId, "productId": info.productId });
            }
            else {
                await Insert(display, [info]);
            }
        })
    });
}
export async function insertPriceOfDisplay(display) {

    await Store().then(async db => {
        await getDisplayRes(display.workId, display.productId).then(async lstHave => {
            if ((lstHave).length > 0) {
                await UpdateItem(db, 'display', { price: display.price }, { "workId": display.workId, "productId": display.productId });
            }
            else {
                await InsertItems(db, 'display', [display]);
            }
        })
    });
}
export async function insertStockout(stock) {
    const isExist = await getStockRes(stock.workId, stock.productId);
    if (isExist.length > 0) {
        const sql = `UPDATE ${stockout.tableName} SET quanity = ${stock.quanity} WHERE workId = ${stock.workId} AND productId = ${stock.productId} `
        // console.log(sql, "UPDATEStockout")
        await QueryStringSql(sql);
    }
    else {
        await Insert(stockout, [stock]);
    }
}
export async function updateNoteStock(stock) {
    await Store().then(async db => {
        UpdateItem(db, 'stockout', { displayComment: stock.displayComment }, { "workId": stock.workId });
    });
}
export async function insertPrice(display) {
    await Store().then(async db => {
        await getDisplayRes(display.workId, display.productId).then(async lstHave => {
            if ((lstHave).length > 0) {
                // alert(1)
                await UpdateItem(db, 'display', { price: display.price }, { "workId": display.workId, "productId": display.productId });
            }
            else {
                // alert(0)
                await InsertItems(db, 'display', [display]);
            }
        })
    });
}
export async function updateDisplayHPResult(display) {
    await Store().then(async db => {
        UpdateItem(db, 'displayAudit', { displayComment: display.displayComment }, { "workId": display.workId, "displayId": display.displayId, displayRef: display.displayRef, displaySubCat: display.displaySubCat });
    });
}
export async function updateDisplayResult(display) {
    await Store().then(async db => {
        UpdateItem(db, 'displayAudit', { displayComment: display.displayComment }, { "workId": display.workId, "displayId": display.displayId, displayRef: display.displayRef });
    });
}
export async function getNoteDisplayReport(workid, category, division) {
    const sql = `SELECT * FROM ${display.tableName} 
            WHERE workId = ${workid} 
            ${category !== null ? `AND displayRef = '${category}'` : ''} 
            AND division = '${division}'
        `
    const { res } = await QueryStringSql(sql);
    return res;
}
export async function updateNoteDisplay(display) {
    await Store().then(async db => {
        UpdateItem(db, 'display', { displayComment: display.displayComment }, { "workId": display.workId, subCategory: display.subCategory, displayRef: display.displayRef, division: display.division });
    });
}
export async function updateNoteDisplayReport(itemDisplay) {
    const sql = `UPDATE ${display.tableName} 
        SET displayComment = '${itemDisplay.displayComment}'
        WHERE workId = ${itemDisplay.workId}
        AND division = '${itemDisplay.division}'
        ${itemDisplay.displayRef !== null ? `AND displayRef='${itemDisplay.displayRef}'` : ''} `
    await QueryStringSql(sql)
}
export async function updateShelveDisplayReport(itemDisplay) {
    const sql = `UPDATE ${display.tableName} 
        SET quantityShelves = '${itemDisplay.quantityShelves}'
        WHERE workId = ${itemDisplay.workId}
        AND division = '${itemDisplay.division}'
        ${itemDisplay.displayRef !== null ? `AND displayRef='${itemDisplay.displayRef}'` : ''} `
    await QueryStringSql(sql)
}
export async function updateNoteDisplayMEVN(display) {
    await Store().then(async db => {
        UpdateItem(db, 'display', { displayComment: display.displayComment }, { "workId": display.workId, subCategory: display.subCategory, displayRef: display.displayRef, division: display.division });
    });
}
export async function updateNoteByCategory(display) {
    //console.log(display)
    await Store().then(async db => {
        UpdateItem(db, 'display', { displayComment: display.displayComment }, { "workId": display.workId, categoryId: display.categoryId, division: display.division });
    });
}
export async function getDisplayUpload(workId) {
    let lst = [];
    await Store().then(async db => {
        const sql = `SELECT * FROM Display s where s.workId = ${workId} AND s.quanity IS NOT NULL AND s.quanity <> -1 AND s.quanity != 'null'`
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getStockUpload(workId) {
    const sql = `Select * FROM stockout WHERE workId = ${workId} AND quanity != -1`;
    const { res } = await QueryStringSql(sql)
    return res || [];
}
export async function deleteAllDisplayResult(workId) {
    await Store().then(async db => {
        DeleteItem(db, 'display', { workId: workId });
    });
}
export async function deleteAllStockResult(workId) {
    await Store().then(async db => {
        DeleteItem(db, 'stockout', { workId: workId });
    });
}
export async function getDisplayProgramResult(workId, ProgramId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            + ' AND quanity != -1'
            + ' AND displayId=' + ProgramId;

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getAuditDisplayResult(workId, ProgramId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            + ' AND displayId=' + ProgramId
            + ' ORDER BY id DESC'

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getAuditDisplayYESResult(workId, ProgramId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            // + " AND displayRef != 'ISSUE'" 
            + ' AND displayId=' + ProgramId
            + ' AND kpi3=' + 1
            + ' ORDER BY id DESC'

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function deleteAuditDisplayResult(workId, ProgramId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Delete from displayAudit WHERE workId=" + workId
            + ' AND displayId=' + ProgramId

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function deleteNoChangeRes(workId, ProgramId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Delete from displayAudit WHERE workId=" + workId
            + ' AND displayId=' + ProgramId
            + ' AND itemId=-1'
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getAllAuditResult(workId, lstId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select displayId from displayAudit WHERE workId=" + workId
            + ' AND displayId IN(' + lstId + ')'
            + ' AND upload=1'
            + ' GROUP BY displayId'
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function existAuditDisplayResult(workId, ProgramId, itemId, displayRef) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            + " AND displayRef='" + displayRef + "'"
            + ' AND displayId=' + ProgramId
            + ' AND itemId=' + itemId

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function existAddAuDisRes(workId, ProgramId, itemId, displayRef) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            + " AND displayRef IN ('PRODUCT','POSM')"
            + ' AND displayId=' + ProgramId
            + ' AND target = -1'

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function existNoChangeItem(workId, ProgramId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            + ' AND displayId=' + ProgramId
            + ' AND itemId=-1'
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function existAuditResItem(workId, ProgramId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            + ' AND displayId=' + ProgramId
            + ' AND kpi3 != -1'
            + ' AND itemId != -1'
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function existAuditData(displayId, itemName, refName) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select *'
            + ' FROM auditDisplayItem WHERE displayId=' + displayId
            + " AND itemName='" + itemName + "'"
            + " AND refName='" + refName + "'"
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getStockRes(workId, productId) {
    sql = `SELECT * FROM ${stockout.tableName} WHERE workId = ${workId} AND productId = ${productId} `
    const { res } = await QueryStringSql(sql);
    return res || []
}
export async function getDisplayRes(workId, productId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from display WHERE workId=" + workId
            + ' AND productId=' + productId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getDisplayItemRes(workId, ProgramId, ItemId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from displayAudit WHERE workId=" + workId
            + ' AND itemId=' + ItemId
            + ' AND displayId=' + ProgramId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function updateAuditDisplayResult(workinfo, displayId) {
    await Store().then(async db => {
        UpdateItem(db, 'displayAudit', { upload: 1 }, { "workId": workinfo.workId, "displayId": displayId });
    });
}
export async function updateHavePack(workinfo, displayId, havePack, comment) {
    await Store().then(async db => {
        UpdateItem(db, 'displayAudit', { havePack: havePack, comment: comment }, { "workId": workinfo.workId, "displayId": displayId });
    });
}
export async function updateNoteCommon(workinfo, displayId, comment) {
    await Store().then(async db => {
        UpdateItem(db, 'displayAudit', { comment: comment }, { "workId": workinfo.workId, "displayId": displayId });
    });
}
export async function updateStatusDisplay(workinfo) {
    await Store().then(async db => {
        UpdateItem(db, 'display', { upload: 1 }, { "workId": workinfo.workId });
    });
}
export async function updateStatusStock(workinfo) {
    await Store().then(async db => {
        UpdateItem(db, 'stockout', { upload: 1 }, { "workId": workinfo.workId });
    });
}
export async function GetWorkInfo(db, shopId, workDate) {
    const condition = await { shopId: shopId, workDate: workDate }
    const { res, err } = await SelectItems(db, 'workResults', '*', condition);
    return res;
}
export async function GetWorkInfoBy(shopId, workDate) {
    let lst = [];
    await Store().then(async db => {
        const condition = await { shopId: shopId, workDate: workDate }
        const { res, err } = await SelectItems(db, 'workResults', '*', condition);
        lst = res;
    });
    return lst;
}
export async function getSubCategoriesList() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select Distinct subCatId as id, subCategory as name FROM products AS p WHERE type=109 ORDER BY categoryId';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getSubCatProduct(competitor, categoryName) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select Distinct subCatId as id, subCategory as name FROM products AS p WHERE productCode not in ('OOS','NOSELL') and category='" + categoryName + "'"
            + (competitor !== '' ? " AND division='" + competitor + "'" : '');
        +"' ORDER BY categoryId";
        // alert(sql)
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getSubCatByCateId(competitor, categoryId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select Distinct subCatId as id, subCategory as name FROM products AS p WHERE productCode not in ('OOS','NOSELL') and categoryId='" + categoryId + "'"
            + (competitor !== '' ? " AND division='" + competitor + "'" : '');
        +"' ORDER BY categoryId";
        // alert(sql)
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getSubCatProductLG(competitor, categoryName) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select Distinct subCatId as id, subCategory as name FROM products AS p WHERE productCode not in ('OOS','NOSELL') and category='" + categoryName + "'"
            + (competitor !== '' ? " AND marketName='" + competitor + "'" : '');
        +"' ORDER BY categoryId";
        // alert(sql)
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getSubCategoriesAudit(categorySelect) {
    let lst = [];
    await Store().then(async db => {
        const sql =
            'Select * FROM masterList'
        // + " WHERE listCode = 'Audit'"
        // + (categorySelect !== '' ? " AND name='" + categorySelect + "'" : '');

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getProductList() {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * , productId as id, productName as name FROM products AS p WHERE productCode not in ('OOS','NOSELL') and type=109 ORDER BY categoryId,subCatId";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getAllProductList(search) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * , productId as id, productName as name FROM products AS p WHERE productCode not in ('OOS','NOSELL')"
            + (search !== '' ? " AND productName like '%" + search + "%'" : "");
        + " ORDER BY categoryId,subCatId";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getPOSM(search) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select id, itemName as name FROM posm AS p"
            + (search !== '' ? " WHERE itemName like '%" + search + "%'" : "");
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getDisplayHistory(workinfo) {
    // alert(workinfo.shopId)
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * '
            + ' FROM historyDisplay'
            + ' Where shopId=' + workinfo.shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getMarketHistory(workinfo) {
    // alert(workinfo.shopId)
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * '
            + ' FROM historyMarket'
            + ' Where shopId=' + workinfo.shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}

export async function getMarketResult(workinfo) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * FROM market Where workId=' + workinfo.workId + " ORDER BY Id DESC";
        const { res, err } = await exeSql(db, sql);
        // alert(sql)
        lst = res
    });

    return lst;
}
export async function getDisplayResult(workinfo, reportId = 0, isNeedShelve = 0) {
    let lst = [];
    await Store().then(async db => {
        const sql = `
            SELECT d.*, p.productName, p.categoryName,
        (SELECT count(o.photoType) FROM photos AS o WHERE o.shopId = ${workinfo.shopId} AND o.photoDate = ${workinfo.workDate} AND o.reportId = ${reportId} AND o.photoType like '"%"||r.categoryName') AS actualPhoto
            FROM display AS d 
            LEFT JOIN products AS p ON d.productId = p.productId
            WHERE d.workId = ${workinfo.workId}
    AND(
        d.quanity is not null OR 
                d.price is not null OR 
                d.fsmValue is not null OR 
                d.quantitySuggest is not null OR 
                d.quantityStock is not null OR 
                d.displayArea is not null OR
                d.mockupValue is not null OR
                d.tagPOPId is not null OR
                (${isNeedShelve} = 1 AND d.quantityShelves is not null)
    )
        `
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}

export async function getStockoutResult(workinfo) {
    let lst = [];
    await Store().then(async db => {
        // const sql = 'Select * '
        //     + ' FROM stockout as'
        //     + ' Where workId=' + workinfo.workId
        //     + " AND (quanity is not null OR haveBusiness is not null)";
        const sql = `
            SELECT s.*, p.productName, p.division
            FROM ${stockout.tableName} AS s 
            LEFT JOIN ${products.tableName} AS p ON s.productId = p.productId
            WHERE s.workId = ${workinfo.workId}
    AND(s.quanity IS NOT NULL OR s.haveBusiness IS NOT NULL)
        `
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getProgramDisplay(shopId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select displayId as id,displayNameVN as name,fieldSetting,visit,isPhotos FROM auditDisplayItem"
            + " WHERE shopId=" + shopId
            + " GROUP BY displayId";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getProgramDisplayHPI() {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select displayId as id,displayNameVN as name,fieldSetting,visit,isPhotos FROM auditDisplayItem"
            + " GROUP BY displayId";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getCategoryAudit(displayId) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select Distinct refId as id, refName as name'
            + ' FROM auditDisplayItem WHERE displayId=' + displayId + ' GROUP BY refName';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getOOSHistoryFromServer(oosList) {
    await Store().then(async db => {
        DeleteItem(db, 'oosHistory');
        await InsertItems(db, 'oosHistory', oosList);
    })
}
export async function setDataOOS(workinfo, categoryName, keyFilter, oosSelected) {
    let lstOOS = [];
    await Store().then(async db => {
        const sql = "select * from oos where workId = " + workinfo.workId;
        const { res, err } = await exeSql(db, sql);
        if (res.length < 1) {
            await insertOOSList(db, workinfo);
        }
        lstOOS = await OOSGetList(db, workinfo, categoryName, keyFilter, oosSelected);
    })
    return lstOOS;
}

export async function OOSGetList(db, workinfo, categoryName, keyFilter, oosSelected) {
    let lstOOS = [];
    const sql = 'select o.*,p.productId,p.productName,p.productCode,p.unit,p.categoryId,p.categoryName,p.subCatId,p.subCategory'
        + ' from oos as o'
        + ' join products as p on p.productId = o.productId and o.workId = ' + workinfo.workId
        + ' where 1=1 '
        + (categoryName != null && categoryName != 'Tất cả' ? " and p.categoryName = '" + categoryName + "'" : "")
        + (keyFilter != null ? " and p.productName like '%" + keyFilter + "%'" : "")
        + (keyFilter != null ? " or p.productCode like '%" + keyFilter + "%'" : "")
        + (oosSelected ? ' and o.oos is not null ' : '')
        + ' order by p.categoryId,p.subCatId,p.productId';
    const { res, err } = await exeSql(db, sql);
    lstOOS = res;
    return lstOOS;
}

export async function insertOOSList(db, workinfo) {
    const sql = "insert into oos (workId,productId,oos)"
        + " select " + workinfo.workId + ", p.productId, o.oos from products as p"
        + " left join oosHistory as o on p.productId = o.productId and o.shopId = " + workinfo.shopId + " and o.workDate = " + workinfo.workDate
        + " where p.productCode not in ('OOS','NOSELL') and p.type=" + _competitorId;
    await exeSql(db, sql);
}
export async function updateOOSItem(oosItem, isChecked) {
    await Store().then(async db => {
        const updateOOS = "update oos set oos = " + isChecked + " where workId = " + oosItem.workId + " and oosId = " + oosItem.oosId;
        await exeSql(db, updateOOS);
        const updateOOSFull = "update oos set oosFull = 0 where workId = " + oosItem.workId;
        await exeSql(db, updateOOSFull);
    });
}
export async function OOS_setUploadDone(workId) {
    await Store().then(async db => {
        const sql = "update oos set isUploaded = 1 where workId = " + workId;
        await exeSql(db, sql);
    });
}
export async function setFullOOS(workId, isFullOOS) {
    await Store().then(async db => {
        const sql = "update oos set" + (isFullOOS == 1 ? " oos = " + isFullOOS : " oos = null") + ", oosFull = " + isFullOOS + " where workId = " + workId;
        await exeSql(db, sql);
    });
}

export async function getUploadOOS(workinfo) {
    let oosUpload = [];
    await Store().then(async db => {
        const sql = "select * from oos "
            + " where ifnull(oosFull,0)=0 and oos is not null"
            + " and ifnull(isUploaded,0)=0 and workId = " + workinfo.workId;
        const { res, err } = await exeSql(db, sql);
        if (res.length > 0) {
            oosUpload = res;
        } else {
            const checkOOSFull = "select * from oos "
                + " where ifnull(oosFull,0)=1 and ifnull(isUploaded,0)=0 and workId = " + workinfo.workId;
            const { res, err } = await exeSql(db, checkOOSFull);
            if (res.length > 0) {
                const getoos = "select " + workinfo.shopId + " shopId," + workinfo.workDate + " workDate,productId ,0 as oos"
                    + " from products where productCode = 'OOS'";
                const { res, err } = await exeSql(db, getoos);
                oosUpload = res;
            }
        }
    });
    return oosUpload;
}

export async function getListCategory() {
    let lstData = [];
    await Store().then(async db => {
        const sql = "select 'Tất cả' as label, 'Tất cả' as value union all"
            + " select distinct categoryName as label, categoryName as value from products"
            + " where type = " + _competitorId;
        const { res, err } = await exeSql(db, sql);
        res.forEach(items => {
            lstData.push(items.value);
        })
    });
    return lstData;
}

export async function getCompetitorProduct(appcolor) {
    let lst = [];
    await Store().then(async db => {
        const sql = `
            SELECT DISTINCT type AS id, division AS name
            FROM ${products.tableName} 
            WHERE productCode NOT IN('OOS', 'NOSELL')
            ORDER BY type
        `
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export const getCompetitorProductBy = async (type, isByType) => {

    let sql = `Select DISTINCT type as id, division as name, division as itemName
    FROM ${products.tableName} WHERE type = ${type}
    AND productCode NOT IN('OOS', 'NOSELL')  ORDER BY type`
    if (AppNameBuild === 'lg' || isByType === 1) {
        sql = `Select DISTINCT type as id, marketName as name, division as itemName
            FROM products WHERE productCode not in ('OOS', 'NOSELL') 
            ORDER BY type`;
    }
    const { res, err } = await QueryStringSql(sql)
    return res || []
}

export async function getCategoryProduct(competitor) {
    let lst = [];
    if (AppNameBuild === epsonApp) {
        await Store().then(async db => {
            const sql = 'Select Distinct categoryId as id, category as name'
                + " FROM products" + " WHERE productCode not in ('OOS','NOSELL')"
                + (competitor !== '' ? " AND division='" + competitor + "'" : '')
                + " GROUP BY categoryId"
            const { res, err } = await exeSql(db, sql);
            lst = res;
        });
    }
    else if (AppNameBuild === hafeleApp) {
        await Store().then(async db => {
            const sql = 'Select Distinct categoryId as id, category as name'
                + " FROM products" + " WHERE productCode not in ('OOS','NOSELL')"
                + (competitor !== '' ? " AND division='" + competitor + "'" : '')
                + " GROUP BY categoryId"
            const { res, err } = await exeSql(db, sql);
            lst = res;
        });
    }
    else {
        await Store().then(async db => {
            const sql = 'Select Distinct categoryId as id, category as name'
                + " FROM products" + " WHERE productCode not in ('OOS','NOSELL')"
                + (competitor !== '' ? " AND division='" + competitor + "'" : '')
                + " GROUP BY categoryId"
            const { res, err } = await exeSql(db, sql);
            lst = res;
        });
    }

    return lst;
}
export async function getCategoryProductLG(competitor) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select Distinct categoryId as id, category as name'
            + " FROM products" + " WHERE productCode not in ('OOS','NOSELL')"
            + (competitor !== '' ? " AND marketName='" + competitor + "'" : '')
            + " GROUP BY categoryId"
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getCategoryByProduct() {
    let lst = [];
    await Store().then(async db => {
        const sql = "select distinct categoryId as id, category as name, type from products WHERE productCode not in ('OOS','NOSELL')";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}

export async function getSurveyCTSS(groupId) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select Distinct refId as id, refName as name'
            + " FROM masterList WHERE listCode = 'CTSS'"
            + (groupId !== 0 ? " AND groupId =" + groupId : '');
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getGroupSurveyCTSS() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select Distinct groupId as id, groupName as name'
            + " FROM masterList WHERE listCode = 'CTSS' GROUP BY groupId,groupName";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getQuestionSurveyCTSS(groupName) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select Distinct ref_Id as id, ref_Name as name'
            + " FROM masterList WHERE listCode = 'CTSS' AND groupName='" + groupName + "' GROUP BY ref_Id,ref_Name";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getItemsSurveyCTSS(groupName) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select *'
            + " FROM masterList WHERE listCode = 'CTSS' AND groupName='" + groupName + "' ORDER BY ref_Id";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getAllProduct() {

    let lst = [];
    await Store().then(async db => {
        var sql = '';
        sql = "Select p.* FROM products as p WHERE productName IS NOT NULL AND productCode not in ('OOS','NOSELL')"
        sql += ' ORDER BY type,categoryId,subCatId';

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getItemsProduct(comSelect, categorySelect, subCategorySelect) {

    let lst = [];
    await Store().then(async db => {
        var sql = '';
        sql = "Select productId,categoryId, productName,unit,productCode,catID, category, category as categoryName, marketName, division, [type], subCategory,subCatId,productLine,errorPrice,price,orderBy,segmentId,segment,SubSegmentId,SubSegment,report,isCheck,marketName"
            + " FROM products as p WHERE productName IS NOT NULL AND productCode not in ('OOS','NOSELL')"
        if (comSelect !== All_Select) {
            sql += (comSelect !== null && comSelect !== '' ? " AND p.division='" + comSelect + "'" : '')
        }

        if (AppNameBuild === 'mevn') {
            sql += " AND type=" + _competitorId;
        }

        if (comSelect === All_Select && _competitorId !== 0 && AppNameBuild !== 'mevn') {
            sql += " AND type=" + _competitorId;
        }

        if (categorySelect !== All_Select) {
            sql += (categorySelect !== null && categorySelect !== '' ? " AND p.category='" + categorySelect + "'" : '')
        }
        if (subCategorySelect !== All_Select) {
            sql += (subCategorySelect !== null && subCategorySelect !== '' ? " AND p.subCategory='" + subCategorySelect + "'" : '')
        }

        sql += ' ORDER BY type,categoryId,subCatId';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getItemsProductLG(comSelect, categorySelect, subCategorySelect) {

    let lst = [];
    await Store().then(async db => {
        var sql = '';
        sql = "Select p.*, p.category as categoryName,p.marketName AS division"
            + " FROM products as p WHERE p.productName IS NOT NULL AND p.productCode not in ('OOS','NOSELL')"


        if (comSelect !== All_Select) {
            sql += (comSelect !== null && comSelect !== '' ? " AND p.marketName='" + comSelect + "'" : '')
        }

        if (categorySelect !== All_Select) {
            sql += (categorySelect !== null && categorySelect !== '' ? " AND p.category='" + categorySelect + "'" : '')
        }
        if (subCategorySelect !== All_Select) {
            sql += (subCategorySelect !== null && subCategorySelect !== '' ? " AND p.subCategory='" + subCategorySelect + "'" : '')
        }

        sql += ' ORDER BY type,categoryId,subCatId';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getProductDisplay(comSelect) {

    let lst = [];
    await Store().then(async db => {
        var sql = '';
        sql = "Select productId,categoryId, productName,unit,productCode,catID, category, category as categoryName, marketName,marketName AS division, [type], subCategory,subCatId,productLine,errorPrice,price,orderBy,segmentId,segment,SubSegmentId,SubSegment,report,isCheck"
            + " FROM products as p WHERE productName IS NOT NULL AND productCode not in ('OOS','NOSELL')"


        if (comSelect !== All_Select) {
            sql += (comSelect !== null && comSelect !== '' ? " AND p.marketName='" + comSelect + "'" : '')
        }

        sql += ' ORDER BY type,categoryId,subCatId';

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getProductDisplayReport(comSelect, search) {

    let lst = [];
    await Store().then(async db => {
        var sql = '';
        sql = "Select p.marketName AS division,p.*"
            + " FROM products as p WHERE p.productName IS NOT NULL AND p.productCode not in ('OOS','NOSELL')"

        if (comSelect !== All_Select) {
            sql += (comSelect !== null && comSelect !== '' ? " AND p.marketName='" + comSelect + "'" : '')
        }

        if (search !== '') {
            sql += " AND (productName like ('%" + search + "%')"
            sql += " OR productCode like ('%" + search + "%'))"
        }

        sql += ' ORDER BY type,categoryId,subCatId';
        const { res, err } = await exeSql(db, sql);
        // console.log(res, "getProductDisplayReport")
        lst = res;
    });
    return lst;
}

export async function getAllProductDisplayReport(workinfo) {

    let lst = [];
    await Store().then(async db => {
        var sql = `SELECT p.marketName AS division, p.type, p.productName, p.subCategory, p.productCode, p.categoryId,
        p.category, p.subCatId, p.productId, d.workId, d.displayComment, d.upload, p.categoryName, d.quanity, d.price
        FROM products as p 
        LEFT JOIN display as d ON d.workId = ${workinfo.workId} AND p.productId = d.productId
        WHERE p.productName IS NOT NULL AND p.productCode not in ('OOS', 'NOSELL')
        ORDER BY p.type, p.categoryId, p.subCatId`
        const { res, err } = await exeSql(db, sql);

        lst = res;
    });
    return lst;
}
export async function getItemsProgramDisplay(DisplayId, categorySelect, subCategorySelect) {
    let lst = [];
    await Store().then(async db => {
        const sql =
            'Select di.*,ma.code FROM auditDisplayItem as di'
            + ' LEFT JOIN masterList as ma ON ma.Id = di.RefId'
            + " WHERE ma.listCode = 'Audit'"
            + ' AND displayId=' + DisplayId
            + (categorySelect !== '' ? " AND refName='" + categorySelect + "'" : '')
            + (subCategorySelect !== '' ? " AND ma.code='" + subCategorySelect + "'" : '')
            + ' ORDER BY refId,id';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getItemsAuditDisplayMitsu(DisplayId, search, refName) {
    let lst = [];
    await Store().then(async db => {
        const sql =
            'Select di.* FROM auditDisplayItem as di'
            + ' WHERE displayId=' + DisplayId
            + (refName !== '' ? " AND refName='" + refName + "'" : '')
            + (search !== '' ? " AND itemName like '%" + search + "%'" : "");
        + ' ORDER BY refId,id';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getItemsAuditDisplay(DisplayId, search, refName, shopId) {
    let lst = [];
    await Store().then(async db => {
        const sql =
            'Select di.* FROM auditDisplayItem as di'
            + ' WHERE displayId=' + DisplayId
            + ' AND shopId=' + shopId
            + (refName !== '' ? " AND refName='" + refName + "'" : '')
            + (search !== '' ? " AND itemName like '%" + search + "%'" : "");
        + ' ORDER BY refId,id';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function checkItemsAuditDisplay(DisplayId, workId) {
    let lst = [];
    await Store().then(async db => {
        const sql =
            'Select di.* FROM auditDisplayItem as di'
            + ' WHERE di.displayId=' + DisplayId
            + " AND di.refName IN ('PRODUCT','POSM')"
            + ' AND di.id NOT IN (SELECT itemId FROM displayAudit WHERE workId=' + workId
            + " AND displayRef = 'PRODUCT'"
            + ' AND kpi3 IN (0,1)'
            + " AND itemId = CASE WHEN kpi3 = 1 AND displayRef = 'PRODUCT' AND kpi2 NOT NULL AND kpi2 != '' AND LENGTH(kpi2) = di.kpi3 THEN itemId WHEN kpi3 = 0 AND displayRef = 'PRODUCT' THEN itemId END"
            + ')'
            + ' AND di.id NOT IN (SELECT itemId FROM displayAudit WHERE workId=' + workId
            + " AND displayRef = 'POSM'"
            + ' AND kpi3 IN (0,1)'
            + " AND itemId = CASE WHEN kpi3 = 1 AND displayRef = 'POSM' AND kpi2 NOT NULL AND kpi2 != '' AND kpi2 > 0 THEN itemId WHEN kpi3 = 0 AND displayRef = 'POSM' THEN itemId END"
            + ')'
            + ' GROUP BY di.id'

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function checkResAuditDisplay(DisplayId, workId) {
    let lst = [];
    await Store().then(async db => {
        const sql =
            'Select da.*,di.id FROM displayAudit as da'
            + ' LEFT JOIN auditDisplayItem as di ON di.id = da.itemId'
            + ' WHERE da.displayId=' + DisplayId
            + ' AND da.workId=' + workId
            + ' AND da.target=-1'
            + " AND da.displayRef IN ('PRODUCT','POSM','ISSUE')"
            + ' AND da.itemId NOT IN (SELECT itemId FROM displayAudit WHERE workId=' + workId
            + " AND displayRef = 'PRODUCT'"
            + " AND itemId = CASE WHEN kpi3 = 1 AND kpi2 NOT NULL AND kpi2 != '' THEN itemId WHEN kpi3 = 1 THEN 0 END"
            + ')'
            + ' AND da.itemId NOT IN (SELECT itemId FROM displayAudit WHERE workId=' + workId
            + " AND displayRef = 'POSM'"
            + " AND itemId = CASE WHEN kpi3 = 1 AND kpi2 NOT NULL AND kpi2 != '' AND kpi2 > 0 THEN itemId WHEN kpi3 = 1 THEN 0 END"
            + ')'
            + ' AND da.itemId NOT IN (SELECT itemId FROM displayAudit WHERE workId=' + workId
            + " AND displayRef = 'ISSUE'"
            + " AND itemId = CASE WHEN kpi3 = 1 AND kpi2 NOT NULL AND kpi2 != '' THEN itemId WHEN kpi3 = 1 THEN 0 END"
            + ')'
            + ' GROUP BY da.itemId,da.id'

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getGroupAudit(DisplayId) {
    let lst = [];
    await Store().then(async db => {
        const sql =
            'Select di.* FROM auditDisplayItem as di'
            + ' WHERE displayId=' + DisplayId
            + ' ORDER BY refName DESC';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getPhotosKTVUpload(shopId, photoDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE photoType='KTV'"
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export const getPhotosReport = async (reportId, photoType, shopId, photoDate) => {
    const sql = `
    Select *, 0 as selected 
    FROM photos WHERE reportId = ${reportId} 
    AND photoType LIKE '%${photoType}%'
    AND photoDate = ${photoDate}
    AND shopId = ${shopId} `
    //console.log(sql, 'sql')
    const { res } = await QueryStringSql(sql)
    return res || []
}
export const getPhotosReportByCate = async (reportId, photoType, shopId, photoDate) => {
    const sql = `
    Select *, 0 as selected 
    FROM photos WHERE reportId = ${reportId} 
    AND photoType like '%${photoType}%'
    AND photoDate = ${photoDate}
    AND shopId = ${shopId} `
    // console.log(sql, 'sql')
    const { res } = await QueryStringSql(sql)
    return res || []
}
export async function getPhotosReportByPhototype(photoType, shopId, photoDate) {
    const sql = `
    SELECT * FROM ${photos.tableName} 
    WHERE photoType like '%${photoType}%'
    AND photoDate = ${photoDate}
    AND shopId = ${shopId} `
    const { res } = await QueryStringSql(sql)
    return res || []
}
export async function getPhotosReportByGuiId(reportId, guiId, shopId, photoDate) {
    let lst = [];
    // console.log(guiId, "guiId")

    await Store().then(async db => {
        const sql = "Select * from photos WHERE reportId=" + reportId
            + " AND guid='" + guiId + "'"
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        // alertPrint(sql)
        lst = res;
    });
    // console.log(lst, "lstlst")

    return lst;
}
export async function getPhotosPOP(photoDate, photoType) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE"
            + " photoType='" + photoType + "'"
            + " AND photoDate=" + photoDate
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosByGuiId(guiId, shopId) {
    let lst = [];
    await Store().then(async db => {
        const sql = `Select * from photos WHERE guid='${guiId}' AND shopId='${shopId}' AND (photoDesc IS NULL OR photoDesc <> 'VERIFY') `
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosByGuiIdUpload(guiId, shopId) {
    let lst = [];
    await Store().then(async db => {
        const sql = `Select * from photos WHERE guid='${guiId}' AND shopId=${shopId} AND photoDesc = 'VERIFY' AND (dataUpload IS NULL OR dataUpload <> 1) `
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosByLstGuiId(LstGuiId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE guid IN (" + LstGuiId + ") AND dataUpload = 0";
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getPhotosAllAuditDisplay(reportId, shopId, photoDate, photoType) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE reportId=" + reportId
            + " AND photoType='" + photoType + "'"
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosUpload(reportId, shopId, photoDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosUploaded(reportId, shopId, photoDate, photoType) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + " AND dataUpload = 0"
            + " AND photoType like '" + photoType + "%'"
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosAuditUploaded(reportId, shopId, photoDate, photoType) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + " AND fileUpload = 0"
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosAuditPack(reportId, shopId, photoDate, DisplayId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "SELECT * from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId
            + " AND (photoType LIKE '" + "Audit_" + DisplayId + '_PRODUCT_' + "%' OR photoType LIKE '" + "Audit_" + DisplayId + "_POSM_" + "%')"

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getPhotosAuditPackBy(reportId, shopId, photoDate, photoType) {
    let lst = [];
    await Store().then(async db => {
        const sql = "SELECT * from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId
            + " AND photoType = '" + photoType + "'"

        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function deleteItemPhotosAudit(reportId, shopId, photoDate, photoType) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Delete from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId
            + " AND photoType ='" + photoType + "'"
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function deletePhotosAuditUploaded(reportId, shopId, photoDate, DisplayId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Delete from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId
            + " AND photoType LIKE '" + "Audit_" + DisplayId + "_%'"
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}

export async function getAllPhotos(reportId, shopId, photoDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}

export async function getPhotoByCategory(reportId, shopId, photoDate, CategoryName) {
    let lst = [];
    await Store().then(async db => {
        const sql = `Select * from photos WHERE reportId = ${reportId}
                    AND photoDate = ${photoDate}
                    AND shopId = ${shopId}
                    AND photoType like '%${CategoryName}%'
                    `
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}

export async function getAllPhotosUpload(reportId, shopId, photoDate) {
    let lst = [];
    await Store().then(async db => {
        const sql = "Select * from photos WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + " AND dataUpload = 0"
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getAllPhotosUploaded(reportId, shopId, photoDate) {
    const sql = `SELECT * FROM photos 
        WHERE reportId=${reportId}
        AND photoDate=${photoDate} AND dataUpload= 0 AND shopId=${shopId}`;
    const { res } = await QueryStringSql(sql);
    return res || [];
}
export async function updateStatusFileUploaded(reportId, shopId, photoDate, photoType) {
    let lst = [];
    await Store().then(async db => {
        const sql = "UPDATE photos Set"
            + " fileUpload = 1"
            + " WHERE reportId=" + reportId
            + " AND photoDate=" + photoDate
            + " AND photoType like '" + photoType + "%'"
            + ' AND shopId=' + shopId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function updateIdStatusFileUploaded(photoId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "UPDATE photos Set fileUpload = 1 WHERE id=" + photoId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function uploadDataDisplayCompe(lstDisplay, workinfo, finish, error) {
    // console.log(lstDisplay);
    try {
        let itemUpload = [];
        await lstDisplay.forEach(item => {
            let dataItem = {
                "divisionId": item.divisionId,
                "categoryId": item.categoryId,
                "categoryName": item.categoryName,
                "subCatId": item.subCatId || null,
                "subCategory": item.subCategory || null,
                "modelName": item.modelName,
                "quantity": item.quantity !== 'null' ? item.quantity : null
            }
            itemUpload.push(dataItem);
        });
        await uploadServer(workinfo, itemUpload, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update displayCompetitor set upload=1 WHERE workId=" + workinfo.workId;
                    await exeSqlNoQuery(db, sqlData);

                    const sql = `UPDATE photos SET dataUpload = 1  
                    WHERE shopId = ${workinfo.shopId} 
                    AND photoDate = ${workinfo.workDate} 
                    AND reportId = ${workinfo.reportId} `
                    await exeSqlNoQuery(db, sql);
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
export async function uploadDisplayCompetitor(lstDisplay, workinfo) {
    let token = await GetToken();
    try {
        let items = [];
        lstDisplay.forEach(item => {
            let dataItem = {
                "divisionId": item.divisionId,
                "categoryId": item.categoryId,
                "categoryName": item.categoryName,
                "subCatId": item.subCatId || null,
                "subCategory": item.subCategory || null,
                "modelName": item.modelName,
                "quantity": item.quantity !== 'null' ? item.quantity : null
            }
            items.push(dataItem);
        });
        const info = {
            shopId: workinfo.shopId,
            reportDate: workinfo.workDate,
            reportId: workinfo.reportId,
            jsonData: JSON.stringify(items),
            jsonPhoto: '[]'
        }
        // let UploadJson = { ShopId: workinfo.shopId, WorkDate: Moment(new Date).format('YYYY-MM-DD'), Details: JSON.stringify(items) }
        await fetch(URLDEFAULT + "upload/uploadraw", {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(info)
        })
            .then(response => {
                return response.json();
            })
            .then(async responseJson => {
                if (responseJson.statusId == 200) {
                    ToastSuccess(responseJson.messager);
                    await QueryStringSql(`UPDATE ${taskList.tableName} set taskDone = 1 WHERE shopId = ${workinfo.shopId} and reportId = ${workinfo.reportId} `)
                    return true;
                }
                else {
                    ToastError(responseJson.messager);
                    return false;
                }
            })
            .catch(error => {
                return false;
            });
    }
    catch (error) {
        console.log(error, 'display competitor error');
    }
}
export async function GetCTSSHistory(url, auditdate, shopid, ok) {
    let access_token = await Token();
    var data = null;
    try {
        let jsonObj = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + access_token,
            "shopid": shopid,
            "auditdate": auditdate
        }

        await fetch(url, {
            method: 'GET',
            headers: jsonObj
        })
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                data = responseJson;
            })
            .catch(error => {
                //console.log(error)
            });
    }
    catch (error) {
        //console.log(error);
    }

    return data
}
export async function uploadAuditDisplay(DisplayId, lstDisplay, lstPhotos, workinfo) {
    let access_token = await Token();
    try {
        let items = [];
        lstDisplay.forEach(item => {
            let dataItem = {
                "displayId": item.displayId,
                "itemId": item.itemId,
                "quanity": item.quanity,
                "displayRef": item.displayRef,
                "displayComment": item.displayComment
            }
            items.push(dataItem);
        });

        let itemsPhoto = [];
        lstPhotos.forEach(photoInfo => {
            let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
            // let pathPhoto = URLDEFAULT + 'uploaded/' + photoInfo.photoDate + '/' + ImgName
            let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
            let dataItem = {
                "shopId": photoInfo.shopId,
                "photoName": ImgName,
                "latitude": photoInfo.latitude,
                "longitude": photoInfo.longitude,
                "accuracy": 8,
                "reportId": photoInfo.reportId,
                "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                "photoType": '' + photoInfo.photoType,
                "photoDate": photoInfo.photoDate,
                "photoPath": pathPhoto
            }
            itemsPhoto.push(dataItem);
        });

        let UploadJson = { DisplayId: DisplayId, ShopId: workinfo.shopId, WorkDate: Moment(new Date).format('YYYY-MM-DD'), Details: JSON.stringify(items), Photos: JSON.stringify(itemsPhoto) }

        await fetch(URL_UPLOAD_AUDIT_DISPLAY, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(UploadJson)
        })
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                if (responseJson.status == 200) {
                    alert(responseJson.messeger);
                    return true;
                }
                else {
                    alert(responseJson.messeger);
                    return false;
                }
            })
            .catch(error => {
                return false;
            });
    }
    catch (error) {
        //console.log(error);
    }
}

export async function saveData_SellOut(modelSellOut) {
    await Insert(sellOut, [modelSellOut])
}

export async function updateData_SellOut(modelSellOut, sellId) {
    await Store().then(db => {
        UpdateItem(db, 'sellOut', modelSellOut, { "sellId": sellId });
    });
}

export async function updateNoteAttendant(text, workId) {
    const sql = `update workResults set workNote = '${text}' where workId = ${workId} `
    const { res } = await QueryStringSql(sql);
}
export async function getNoteAttendant(workId) {
    const sql = `select * from workResults where workId = ${workId} `
    const { res } = await QueryStringSql(sql)
    return res !== null && res.length > 0 ? res[0].workNote : null

}
export async function updateWorkStatus(workId, value) {
    const sql = `update workResults set workStatus = ${value} where workId = ${workId} `
    await QueryStringSql(sql);
}
export async function updateMockupDisplay(item) {
    const sql = `UPDATE ${display.tableName} 
        SET mockupValue = ${item.mockupValue}
        WHERE workId = ${item.workId}
        AND division = '${item.division}'`
    await QueryStringSql(sql)
}

//
const createWorkTemplate = async (shopinfo) => {
    const workTemplate = {
        shopId: shopinfo.shopId || 0,
        shopName: shopinfo.shopName,
        shopCode: shopinfo.shopCode,
        address: shopinfo.address,
        imageUrl: shopinfo.imageUrl,
        workDate: shopinfo.auditDate,
        workTime: moment(new Date()).format('YYYYMMDDHHmmss'),
        workStatus: 1,
        attendantCount: 2,
        guiid: UUIDGenerator(),
        shopConfig: shopinfo.config || '{}'
    }
    const workCurrent = await checkAddWork(workTemplate);
    return workCurrent
}

export const WorkController = { createWorkTemplate }