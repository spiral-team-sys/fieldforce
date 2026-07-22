import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

export const DataScoreKPI = async (byShop, month, year, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'byShop': byShop,
                'month': month,
                'year': year

            },
        }
        const response = await fetch(URLDEFAULT + 'kpi/datascore', requestInfo)
        const result = await response.json()
        if (result.statusId == 200)
            actionResult({ messager: null, data: result.data })
        else
            actionResult({ messager: result.messeger || "Lỗi truy cập API", data: [] })
    } catch (err) {
        actionResult({ messager: "Lỗi truy cập API", data: [] })
    }
}
export const DataKPI = async (userId, shopId, workDate, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'UserId': userId,
                'ShopId': shopId,
                'WorkDate': workDate
            },
        }
        const response = await fetch(URLDEFAULT + 'kpi/datakpi', requestInfo)
        const result = await response.json()
        if (result.statusId == 200)
            actionResult({ messager: null, data: result.data })
        else
            actionResult({ messager: result.messeger || "Lỗi truy cập API", data: [] })
    } catch (err) {
        actionResult({ messager: "Lỗi truy cập API", data: [] })
    }
}
export const UploadScoreKPI = async (jsonData, actionResult) => {
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
        const response = await fetch(URLDEFAULT + 'kpi/savescore', requestInfo)
        const result = await response.json()
        actionResult(result)
    } catch (err) {
        actionResult({ status: 500, messeger: "Lỗi truy cập API" })
    }
}
export const DataKPIResult = async (fromDate, toDate, actionResult) => {
    console.log(fromDate, toDate);
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'FromDate': fromDate,
                'ToDate': toDate
            },
        }
        const response = await fetch(URLDEFAULT + 'kpi/datakpiresult', requestInfo)
        const result = await response.json()
        if (result.statusId == 200)
            actionResult({ messager: null, data: result.data })
    } catch (err) {
        actionResult({ messager: "Lỗi truy cập API", data: [] })
    }
}
