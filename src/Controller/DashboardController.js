import { fetchGet, GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

export const GetDataDashboard = async (actionResult) => {
    try {
        const dataResult = await fetchGet(URLDEFAULT + 'dashboard/getdata');
        actionResult(dataResult.data || [])
    } catch (e) {
        console.log(e);
    }
}
export const GetDataDashboardBySup = async (actionResult) => {
    try {
        const dataResult = await fetchGet(URLDEFAULT + 'dashboard/getdata/bysup');
        actionResult(dataResult.data)
    } catch (e) {
        //console.log(e);
    }
}
export const GetDisplayStatus = async () => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'dashboard/displaystatus', requestInfo)
        if (response.status === 200) {
            return await response.json()
        } else {
            return { statusId: 500, messager: "lỗi kết nối" }
        }
    } catch (error) {
        return { statusId: 500, messager: "lỗi kết nối" }
    }
}

export const LGPLanbyWeekly = async (data) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLDEFAULT + 'dashboard/lgplanbyplan', requestInfo)
        if (response.status === 200) {
            return await response.json()
        } else {
            return { statusId: 500, messager: "lỗi kết nối" }
        }
    } catch (error) {
        return { statusId: 500, messager: "lỗi kết nối" }
    }
}
export const GetDailySummary = async () => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'dashboard/dailysummary', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            return await result.data;
        } else {
            return { statusId: 500, messager: "lỗi kết nối" }
        }
    } catch (error) {
        return { statusId: 500, messager: "lỗi kết nối" }
    }
}
export const LGSummaryTop = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'dashboard/lgsummarytop', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            actionResult && actionResult(result.data || [])
            return result
        } else {
            actionResult && actionResult([], 'Lỗi kết nối')
            return { statusId: 500, messager: "lỗi kết nối" }
        }
    } catch (error) {
        actionResult && actionResult([], `Lỗi: ${error}`)
        return { statusId: 500, messager: "lỗi kết nối" }
    }
}
export const GetDataDashboardDetail = async (month, year, shopId = 0, actionResult, dashboardType = '') => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "Month": month,
                "Year": year,
                "ShopId": shopId,
                "DashboardType": dashboardType

            },
        }
        const response = await fetch(URLDEFAULT + 'dashboard/detail/bymonth', requestInfo)
        const result = await response.json();
        await actionResult(result?.data || []);
    } catch (error) {
        console.log(error)
    }
}
export const GetDataProgressReport = async (month, year, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "Month": month,
                "Year": year
            },
        }
        const response = await fetch(URLDEFAULT + 'dashboard/progressreport', requestInfo)
        const result = await response.json();
        await actionResult(result.data.table, result.data.table1)
    } catch (error) {
        console.log('Progress Errorr:' + error)
    }
}
export const GetDataProgressAttendant = async (month, year, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "Month": month,
                "Year": year
            },
        }
        const response = await fetch(URLDEFAULT + 'dashboard/progressattendant', requestInfo)
        const result = await response.json();
        await actionResult(result.data.table)
    } catch (error) {
        console.log('Progress Errorr Attendant:' + error)
    }
}
// By Shop
export const GetDataDashboardByShop = async (shopId, actionResult) => {
    try {
        let token = await GetToken();
        await fetch(URLDEFAULT + 'dashboard/getdata',
            {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": token,
                    "ShopId": shopId
                }
            })
            .then((response) => {
                return response.json()
            })
            .then((responseJson) => {
                actionResult(responseJson.data)
            });
    } catch (error) {
        console.log(error)
    }
}
export const GetDataIncentive = async (jsonCalendar, actionResult) => {
    try {
        let token = await GetToken();
        await fetch(URLDEFAULT + 'dashboard/incentive',
            {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(jsonCalendar)
            })
            .then((response) => { return response.json() })
            .then((responseJson) => {
                actionResult(responseJson.data)
            });
    } catch (error) {
        console.log(error)
    }
}

// Manager Plan
export const GetDataManagerPlan = async (fromDate, toDate, actionResult) => {
    try {
        let token = await GetToken();
        await fetch(URLDEFAULT + 'workingplan/managerplan',
            {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": token,
                    "FromDate": fromDate,
                    "ToDate": toDate
                }
            })
            .then((response) => { return response.json() })
            .then((responseJson) => {
                actionResult(responseJson.data.table, responseJson.data.table1)
            });
    } catch (e) {
        console.log('Error:' + e);
    }
}
export const GetDashboardMevn = async () => {

}

export const DataSummary = async (type, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
                "typeDashboard": type
            }
        }
        const response = await fetch(URLDEFAULT + 'dashboard/summary', requestInfo)
        const dataResult = await response.json()
        if (response.status === 200) {
            actionResult(dataResult.data)
        }
    } catch (error) {
        console.log(error);
    }
}

export const DataDetailSummarySSub = async (jsonData, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(JSON.stringify(jsonData))
        }
        const response = await fetch(URLDEFAULT + 'dashboard/summaryssub', requestInfo)
        const result = await response.json();
        await actionResult(result)
    } catch (error) {
        console.log(error)
    }
}
export const DataDashboardByType = async (jsonData, actionResult) => {
    try {
        let token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(JSON.stringify(jsonData))
        }
        const response = await fetch(URLDEFAULT + 'dashboard/dashboardbytype', requestInfo)
        const result = await response.json();
        await actionResult(result)
    } catch (error) {
        console.log(error)
    }
}
