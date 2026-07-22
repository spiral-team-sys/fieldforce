import { Platform } from "react-native";
import { getDeviceInfo } from "../Controller/DownloadDataController";
import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

// Home / Report
const GetDashboardReport = async (params, actionResult) => {
    try {
        console.log(JSON.stringify(params));

        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(JSON.stringify(params))
        }
        const response = await fetch(`${URLDEFAULT}dashboard/report`, requestInfo)
        const result = await response.json();
        console.log(result);

        actionResult(result.data || [], null)
    } catch (e) {
        actionResult(null, `Lỗi dữ liệu: ${e}`)
    }
}
//
const LogUserAccess = async (gspinfo) => {
    try {
        let token = await GetToken();
        const deviceInfo = await getDeviceInfo();
        const datalog = {
            deviceId: deviceInfo.getDeviceId,
            deviceInfo: JSON.stringify(deviceInfo),
            GPSInfo: JSON.stringify(gspinfo),
            platform: Platform.OS,
        }
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(datalog)
        }
        const response = await fetch(URLDEFAULT + 'dashboard/loginapp', requestInfo)
        const result = await response.json();
        return result
        // await console.log(result, "Log")
    } catch (e) {
        actionResult(null, `Lỗi dữ liệu: ${e}`)
    }
}
const GetSummaryDataByShop = async (shopId, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "shopId": shopId
            }
        }
        const response = await fetch(URLDEFAULT + 'dashboard/summary/byshop', requestInfo)
        const result = await response.json();
        actionResult(result.data || [], null)
    } catch (e) {
        actionResult(null, `Lỗi dữ liệu: ${e}`)
    }
}
const GetDashboardDetails = async (itemFilter, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(JSON.stringify(itemFilter))
        }
        const response = await fetch(URLDEFAULT + 'dashboard/detailbytype', requestInfo)
        const result = await response.json();
        actionResult(result.data || [], null)
    } catch (e) {
        actionResult(null, `Lỗi dữ liệu: ${e}`)
    }
}
//
const MaketOverView = async (month, year) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                "month": month,
                "year": year
            },
        }
        const response = await fetch(URLDEFAULT + 'dashboard/maketoverview', requestInfo)
        const result = await response.json()
        return result;
    } catch (err) {
        console.log(err)
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}
const RoutingMonthLy = async (month, year) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                "month": month,
                "year": year
            },
        }
        const response = await fetch(URLDEFAULT + 'dashboard/routingmonth', requestInfo)
        const result = await response.json()
        return result;
    } catch (err) {
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}
const GetShareReport = async (shopId, reportDate) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                "shopId": shopId,
                "reportDate": reportDate
            },
        }
        const response = await fetch(URLDEFAULT + 'dashboard/shareinfo', requestInfo)
        const result = await response.json()
        return result;
    } catch (err) {
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}
const GetSummaryDisplayStatus = async (actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'dashboard/displaystatus', requestInfo)
        const result = await response.json();
        actionResult(result.data || [], null)
    } catch (e) {
        actionResult([], `Lỗi dữ liệu: ${e}`)
    }
}
const GetDataRequiredReport = async (shopId, reportId, actionResult) => {
    try {
        let token = await GetToken();
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
        const response = await fetch(URLDEFAULT + 'dashboard/requiredreport', requestInfo)
        const result = await response.json();
        actionResult(result.data || [], null)
    } catch (e) {
        actionResult([], `Lỗi dữ liệu: ${e}`)
    }
}
const GetListFilter = async (reportId, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'reportId': reportId
            }
        }
        const response = await fetch(`${URLDEFAULT}dashboard/filterdata`, requestInfo)
        const result = await response.json()
        if (result.statusId == 200) {
            await actionResult(result.data, null)
        } else {
            await actionResult([], `Lỗi: ${result.messager}`)
        }
    } catch (e) {
        await actionResult([], `Lỗi: ${e}`)
    }
}
const GetMasterFilter = async (shopId, typeDashboard, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "shopId": shopId,
                "typeDashboard": typeDashboard
            }
        }
        const response = await fetch(`${URLDEFAULT}dashboard/masterfilter`, requestInfo)
        const result = await response.json();
        actionResult(result.data || [])
    } catch (e) {
        actionResult([], `Lỗi dữ liệu: ${e}`)
    }
}
const GetDashboardDisplayShare = async (shopId, filter = {}, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "shopId": shopId
            },
            body: JSON.stringify(JSON.stringify(filter))
        }
        const response = await fetch(`${URLDEFAULT}dashboard/displayShare`, requestInfo)
        const result = await response.json();
        actionResult(result.data || [])
    } catch (e) {
        actionResult([], `Lỗi dữ liệu: ${e}`)
    }
}
const GetDashboardStoreSummary = async (shopId, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "shopId": shopId
            }
        }
        const response = await fetch(`${URLDEFAULT}dashboard/storesummary`, requestInfo)
        const result = await response.json();
        actionResult(result.data || {})
    } catch (e) {
        actionResult({}, `Lỗi dữ liệu: ${e}`)
    }
}
//
export const DashboardAPI = {
    GetMasterFilter, GetDashboardDisplayShare,
    LogUserAccess, MaketOverView, RoutingMonthLy,
    GetDashboardDetails, GetShareReport, GetSummaryDataByShop, GetSummaryDisplayStatus, GetDataRequiredReport, GetListFilter, GetDashboardStoreSummary,
    GetDashboardReport
}