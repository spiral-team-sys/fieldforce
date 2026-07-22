import { GetToken } from "../Core/Helper";
import { QueryStringSql } from "../Core/SqliteDbContext";
import { photos } from "../Core/TableLocal";
import { URLDEFAULT } from "../Core/URLs";
import { alertWarning } from "../Core/Utility";
import { REPORT } from "./ReportAPI";

const GetManagerOT = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch(`${URLDEFAULT}workingplan/managerot/getdata`, requestInfo)
        const result = await response.json()
        if (result.statusId == 200)
            actionResult(result.data)
        else
            actionResult([])
    } catch (error) {
        alertWarning(`Lỗi: ${error}`)
        actionResult([])
    }
}
const SaveManagerOT = async (itemUpload, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemUpload)
        }
        const response = await fetch(`${URLDEFAULT}workingplan/managerot/save`, requestInfo)
        const result = await response.json()
        actionResult(result)
        // Upload File
        if (result.statusId == 200) {
            await QueryStringSql(`UPDATE ${photos.tableName} SET dataUpload=1 WHERE shopId=${itemUpload.shopId} AND reportId=${itemUpload.reportId} AND photoDate=${itemUpload.photoDate}`)
            await REPORT.UploadFilePhoto()
        }
    } catch (error) {
        actionResult({ statusId: 500, data: [], messager: `Lỗi: ${error}` })
    }
}
const CheckDataManagerOT = async (jsonData, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(jsonData))
        }
        const response = await fetch(`${URLDEFAULT}workingplan/managerot/checkdetails`, requestInfo)
        const result = await response.json()
        actionResult(result)
    } catch (error) {
        actionResult({ statusId: 500, data: [], messager: `Lỗi: ${error}` })
    }
}

export const OVERTIMEAPI = { GetManagerOT, SaveManagerOT, CheckDataManagerOT }