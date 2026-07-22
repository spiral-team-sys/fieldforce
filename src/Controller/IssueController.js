import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";
import UploadController from "./UploadController";
import { QueryStringSql } from "../Core/SqliteDbContext";
import { taskList } from "../Core/Table";
import { photos } from "../Core/TableLocal";

export async function IssueReportUpload(jsonData, workinfo, guiId, actionResult) {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(JSON.stringify(jsonData))
        }
        const responde = await fetch(URLDEFAULT + "shops/issue/issueUpload", requestInfo)
        const result = await responde.json();
        if (result.statusId === 200) {
            await UploadController.PostFile();
            await QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
            if (guiId !== null) {
                const sql = `UPDATE photos SET dataUpload=1  
                WHERE shopId=${workinfo.shopId} 
                AND photoDate=${workinfo.workDate} 
                AND reportId=${workinfo.reportId}
                AND guid="${guiId}"`
                await QueryStringSql(sql);
            }
            await actionResult(result)
        } else {
            actionResult(result)
        }
    } catch (err) {
        console.log(err)
    }
}
export const GetDataIssueReport = async (dataFilter, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(dataFilter))
        }
        const response = await fetch(URLDEFAULT + `download/reportbyshop`, requestInfo)
        const result = await response.json()
        if (result.statusId == 200) {
            const itemData = result.data[0] || []
            await actionResult(itemData, null)
        } else {
            await actionResult(null, `Lỗi: ${result.messager}`)
        }
    } catch (e) {
        actionResult(null, `Lỗi: ${e}`)
    }
}
export const GetPhotosIssue = async (shopId, workDate, reportId, guid, isUpdate = false) => {
    const sql = `SELECT * FROM ${photos.tableName} 
        WHERE shopId=${shopId} 
        AND reportId=${reportId} 
        AND photoDate=${workDate} 
        AND guid='${guid}'
       ${isUpdate ? `AND (dataUpload IS NULL OR dataUpload = 0)` : ``}
    `
    const { res } = await QueryStringSql(sql);
    return res || []
}