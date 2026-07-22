import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

const GetListWareType = async (shopId, reportId, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'shopId': shopId,
                'reportId': reportId
            }
        }
        const response = await fetch(`${URLDEFAULT}oos/warehouse`, requestInfo)
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
const GetListSummary = async (typeSummary, itemFilter, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'typeSummary': typeSummary
            },
            body: JSON.stringify(JSON.stringify(itemFilter))
        }
        const response = await fetch(`${URLDEFAULT}oos/summary`, requestInfo)
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
//
export const OOSAPI = { GetListWareType, GetListSummary }