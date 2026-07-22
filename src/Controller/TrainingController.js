import { exeSql, exeSqlNoQuery, QueryStringSql, Store, UpdateItem } from "../Core/SqliteDbContext"
import { GetToken, ToastError, Token } from "../Core/Helper"
import { URL_UPLOAD_PHOTOS, URLDEFAULT } from "../Core/URLs";
import { uploadAllDataPhoto } from "./PhotoController";
import { taskList } from "../Core/Table";
let RNFS = require('react-native-fs');

export const getListImageAudit = async () => {
    let data = []
    await Store().then(async db => {
        const sql = "select 0 as Id,'' as code,'Tất cả' AS name union all select Id,code,name from masterList where listCode = 'CameraAudit' order by Id"
        const { res, err } = await exeSql(db, sql)
        data = res
    })
    return data
}
export const getPhotoAudit = async (workInfo) => {
    let data = []
    await Store().then(async db => {
        const sql = "select * from photos where shopId = " + workInfo.shopId + " and photoDate=" + workInfo.workDate
        const { res, err } = await exeSql(db, sql)
        data = res
    })
    return data
}
export const updateFSMValue = async (workInfo, value) => {
    await Store().then(async db => {
        // await UpdateItem(db, 'workResults', { fsmValue: value }, { workId: workInfo.workId })
        exeSql(db, `UPDATE workResults SET fsmValue=${value} WHERE workId=${workInfo.workId}`)
    })
}
export const dataPhotoUpload = async (workInfo) => {
    let dataResult = []
    await Store().then(async db => {
        const sql = "select p.* from masterList as m"
            + " left join photos as p on p.photoType=m.code "
            + " where p.dataUpload=0 and p.shopId=" + workInfo.shopId + " and p.photoDate=" + workInfo.workDate + " and m.listCode='CameraAudit'"
        const { res, err } = await exeSql(db, sql)
        dataResult = res == undefined ? [] : res
    })

    return dataResult
}

// Check Data
export const dataPhotoTrainingCheck = async (workInfo) => {
    let dataResult = []
    await Store().then(async db => {
        const sql = "select p.* from masterList as m"
            + " left join photos as p on p.photoType=m.code "
            + " where p.shopId=" + workInfo.shopId + " and p.photoDate=" + workInfo.workDate + " and m.listCode='CameraAudit'"
        const { res, err } = await exeSql(db, sql)
        dataResult = res == undefined ? [] : res
    })

    return dataResult
}
export const checkTakePhotoTraining = async (workinfo) => {
    let strResult = ''
    let dataResult = await dataPhotoTrainingCheck(workinfo);
    if (dataResult.length == 0) {
        strResult = "Vui lòng chụp tối thiểu 1 tấm hình Đào tạo cửa hàng trước khi làm bài kiểm tra"
    } else {
        strResult = '';
    }
    return strResult;
}

// Upload Data
export const UploadPhotoTraining = async (workInfo) => {
    const dataPhoto = await dataPhotoUpload(workInfo);
    if (dataPhoto.length < 1) {
        return
    }
    await uploadAllDataPhoto(dataPhoto)
}
export const UploadDataTraining = async (workInfo, actionResult) => {
    const dataPhoto = await dataPhotoUpload(workInfo);
    let photoUpload = [];

    if (dataPhoto.length < 1) {
        actionResult("Đã gửi hết dữ liệu")
        return
    }
    try {
        let access_token = await Token();
        await dataPhoto.forEach(async photoInfo => {
            let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
            let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
            let dataItem = {
                "ShopId": workInfo.shopId,
                "PhotoDate": photoInfo.photoDate,
                "PhotoPath": pathPhoto,
                "PhotoType": photoInfo.photoType,
                "PhotoTime": photoInfo.photoFullTime,
                "Latitude": photoInfo.latitude,
                "Longitude": photoInfo.longitude,
                "Accuracy": photoInfo.accuracy,
                "Guiid": workInfo.guiid,
                "ReportId": workInfo.reportId
            }
            photoUpload.push(dataItem)
        })
        const itemUpload = {
            "FSMValue": workInfo.fsmValue || 0,
            "dataPhoto": JSON.stringify(photoUpload)
        }
        await fetch(URLDEFAULT + 'training/uploaddata', {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(itemUpload)
        }).then(response => {
            return response.json();
        }).then(responseJson => {
            if (responseJson.status == 200) {
                doneUploadPhotoTraining(workInfo)
                QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workInfo.shopId} and reportId=${workInfo.reportId}`)
                actionResult(responseJson.messeger)
            } else {
                actionResult(responseJson.messeger)
            }
        })

    } catch (error) {
        actionResult('Error: ' + error);
    }
}
// Done Upload
export async function doneUploadFile(photoId) {
    let lst = [];
    await Store().then(async db => {
        const sql = "UPDATE photos Set fileUpload = 1 WHERE id=" + photoId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function doneUploadPhotoTraining(workinfo) {
    let lst = [];
    await Store().then(async db => {
        const sql = "UPDATE photos Set dataUpload = 1 WHERE shopId=" + workinfo.shopId + " and photoDate =" + workinfo.photoDate;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getListTraining(actionResult) {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'training/getlist', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            actionResult(result.data)
        } else {
            actionResult(null)
        }
    } catch (error) {
        ToastError(error)
    }
}
