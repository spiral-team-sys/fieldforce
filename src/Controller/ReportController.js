import { TODAY } from "../Core/Utility"
import { mobileRaw, photos } from '../Core/TableLocal'
import { Insert, QueryStringSql, Update, replaceQueryString } from '../Core/SqliteDbContext'
import _ from 'lodash';

export const checkRawReport = async (shopId, reportId) => {
    const sql = `SELECT * FROM ${mobileRaw.tableName} WHERE shopId=${shopId} AND reportId=${reportId} AND reportDate=${TODAY}`
    const { res } = await QueryStringSql(sql)
    return {
        isDownload: res !== undefined && res.length > 0,
        data: res
    }
}
export const getDataPhotoByReport = async (reportId, shopId, actionResult) => {
    const sql = `SELECT * FROM ${photos.tableName} WHERE reportId=${reportId} AND shopId=${shopId} AND photoDate=${TODAY}`
    const { res } = await QueryStringSql(sql)
    actionResult && actionResult(res)
    return res
}
export const getDataPhotoByGUID = async (reportId, shopId, guid, actionResult) => {
    const sql = `SELECT * FROM ${photos.tableName} WHERE reportId=${reportId} AND shopId=${shopId} AND photoDate=${TODAY} AND guid='${guid}'`
    const { res } = await QueryStringSql(sql)
    actionResult && actionResult(res || [])
    return res
}

export const insertRawReport = async (data, reportId) => {
    const sql = `
        INSERT INTO ${mobileRaw.tableName} (shopId,reportId,reportDate,jsonData,jsonPhoto,isUploaded)
        SELECT ${data.shopId},${reportId},${data.reportDate},'${data.jsonData}','${data.jsonPhoto}',${data.isUploaded}
        WHERE NOT EXISTS (
            SELECT 1 FROM ${mobileRaw.tableName} 
            WHERE shopId=${data.shopId} 
            AND reportId=${reportId} 
            AND reportDate=${data.reportDate}
        )`
    await QueryStringSql(sql)
}
export const saveJsonData = async (shopId, reportId, reportDate, data) => {
    const sql = `SELECT * FROM ${mobileRaw.tableName} WHERE shopId=${shopId} AND reportId=${reportId} AND reportDate=${reportDate}`
    const { res } = await QueryStringSql(sql)
    if (res !== null && res.length > 0) {
        const updateList = _.map(res, (e) => { return { ...e, jsonData: JSON.stringify(data) } })
        const countRow = await Update(mobileRaw, updateList, 'id')
        console.log('Count', countRow);

    } else {
        const items = [{
            shopId: shopId,
            reportId: reportId,
            reportDate: reportDate,
            jsonData: JSON.stringify(data)
        }]
        await Insert(mobileRaw, items);
    }
}
export const saveJsonPhoto = async (shopId, reportId, reportDate, photo) => {
    const sql = `UPDATE ${mobileRaw.tableName} 
        SET jsonPhoto='${JSON.stringify(photo)}'
        WHERE shopId=${shopId} AND reportId=${reportId} AND reportDate=${reportDate}`
    await QueryStringSql(sql)
}
export const itemUploaded = async (shopinfo, reportId) => {
    let sql = `SELECT * FROM ${mobileRaw.tableName} WHERE shopId=@shopId AND reportDate=@auditDate AND reportId=${reportId}`
    sql = await replaceQueryString(sql, shopinfo, ["shopId", "auditDate"])
    const { res } = await QueryStringSql(sql)
    return res[0] || {}
}
export const getDataByReport = async (shopId, reportId) => {
    const sql = `SELECT * FROM ${mobileRaw.tableName} WHERE shopId=${shopId} AND reportId=${reportId} AND reportDate=${TODAY}`
    const { res } = await QueryStringSql(sql)
    let arrData = []
    if (res !== null && res.length > 0) {
        res.map(it => {
            JSON.parse(it.jsonData).map(item => {
                arrData.push(item)
            })
        })
    }
    return { data: arrData }
}
//
export const dataUploaded = async (shopinfo, reportId) => {
    // Data Input
    let sql = `SELECT * FROM ${mobileRaw.tableName} WHERE shopId=@shopId AND reportDate=@auditDate AND reportId=${reportId}`
    sql = await replaceQueryString(sql, shopinfo, ["shopId", "auditDate"])
    const itemData = await QueryStringSql(sql)
    let dataUpload = itemData.res[0] || {}
    console.log(dataUpload.jsonData);

    // Data Photo
    let sqlPhoto = `SELECT * FROM ${photos.tableName} WHERE shopId=@shopId AND photoDate=@auditDate AND reportId=${reportId}`
    sqlPhoto = await replaceQueryString(sqlPhoto, shopinfo, ["shopId", "auditDate"])
    const itemPhoto = await QueryStringSql(sqlPhoto)
    let jsonPhoto = itemPhoto.res || []
    for (let i = 0, lenData = jsonPhoto.length; i < lenData; i++) {
        let imageName = jsonPhoto[i].photoPath.slice(jsonPhoto[i].photoPath.lastIndexOf('/', jsonPhoto[i].photoPath.length) + 1)
        let fileName = '/uploaded/' + jsonPhoto[i].photoDate + '/' + imageName
        jsonPhoto[i].photoPath = fileName
    }
    dataUpload.jsonPhoto = JSON.stringify(jsonPhoto)
    return dataUpload
}
export const dataUploaded_Realtime = async (itemUpload, shopinfo, reportId) => {
    const shopId = shopinfo.shopId === 0 ? 0 : (shopinfo.shopId || itemUpload.shopId)
    let dataUpload = {
        shopId,
        reportId: reportId,
        reportDate: shopinfo.auditDate || TODAY,
        jsonData: null,
        jsonPhoto: null
    }
    // Data Input 
    dataUpload.jsonData = JSON.stringify(itemUpload || {})
    // Data Photo
    let sqlPhoto = `SELECT * FROM ${photos.tableName} WHERE shopId=@shopId AND photoDate=@auditDate AND reportId=${reportId} AND (dataUpload IS NULL OR dataUpload=0)`
    sqlPhoto = await replaceQueryString(sqlPhoto,
        {
            ...shopinfo,
            shopId,
            auditDate: shopinfo.auditDate || TODAY
        },
        ["shopId", "auditDate"]
    )
    const itemPhoto = await QueryStringSql(sqlPhoto)
    let jsonPhoto = itemPhoto.res || []
    for (let i = 0, lenData = jsonPhoto.length; i < lenData; i++) {
        let imageName = jsonPhoto[i].photoPath.slice(jsonPhoto[i].photoPath.lastIndexOf('/', jsonPhoto[i].photoPath.length) + 1)
        let fileName = '/uploaded/' + jsonPhoto[i].photoDate + '/' + imageName
        jsonPhoto[i].photoPath = fileName
    }
    dataUpload.jsonPhoto = JSON.stringify(jsonPhoto)
    return dataUpload
}
//
export const getPhotoByReport = async (shopinfo, reportId) => {
    let sqlPhoto = `SELECT * FROM ${photos.tableName} WHERE shopId=@shopId AND photoDate=@auditDate AND reportId=${reportId} AND (dataUpload <> 1 OR dataUpload IS NULL)`
    sqlPhoto = await replaceQueryString(sqlPhoto, shopinfo, ["shopId", "auditDate"])
    const itemPhoto = await QueryStringSql(sqlPhoto)
    let jsonPhoto = itemPhoto.res || []
    for (let i = 0, lenData = jsonPhoto.length; i < lenData; i++) {
        jsonPhoto[i].photoPath = jsonPhoto[i].photoPath.slice(jsonPhoto[i].photoPath.lastIndexOf('/', jsonPhoto[i].photoPath.length) + 1)
    }
    return jsonPhoto
}
export const checkDoneAttendant = async (shopinfo) => {
    const sql = `SELECT * FROM ${photos.tableName} WHERE shopId=${shopinfo.shopId} AND photoDate=${TODAY} AND reportId=1`
    const { res } = await QueryStringSql(sql)
    return res.length > 0 && res.length % 2 == 0
}
export const deleteDataRaw = async (shopId, reportId) => {
    const today = TODAY
    const sql = `DELETE FROM ${mobileRaw.tableName}
    WHERE shopId = ${shopId} AND reportId = ${reportId} AND reportDate = ${today} AND (isUploaded = 0 OR isUploaded IS NULL)`
    await QueryStringSql(sql);
}
export const getAllRawReport = async (shopId, reportId) => {
    const sql = `SELECT * FROM ${mobileRaw.tableName} WHERE shopId=${shopId} AND reportId=${reportId}`
    const { res } = await QueryStringSql(sql)
    let arrData = []

    res.map(it => {
        JSON.parse(it.jsonData).map(item => {
            arrData.push(item)
        })
    })
    return {
        data: arrData
    }
}
export const getPhotoRawReport = async (dataFilter) => {
    const sql = `SELECT * FROM ${mobileRaw.tableName} WHERE shopId=${dataFilter.shopId} AND reportId=${dataFilter.reportId} AND reportDate=${TODAY}`
    const { res } = await QueryStringSql(sql)
    let arrPhoto = JSON.parse(res[0]?.jsonPhoto || "[]")
    return arrPhoto
}
//
export const removeRawReport = async (shopId, reportId) => {
    const sql = `DELETE FROM ${mobileRaw.tableName} WHERE shopId=${shopId} AND reportId=${reportId} AND reportDate=${TODAY}`
    await QueryStringSql(sql)
}
