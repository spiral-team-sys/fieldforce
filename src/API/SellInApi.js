import { GetToken, ToastError } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

const DeleleList = async (list) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(list)
        }
        const response = await fetch(URLDEFAULT + 'sellin/delete', requestInfo)
        const result = await response.json()
        return result;
    } catch (err) {
        console.log(err)
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}
const UpdateOrder = async (jsonData) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        }
        const response = await fetch(URLDEFAULT + 'sellin/updateorder', requestInfo)
        const result = await response.json()
        return result;
    } catch (err) {
        console.log(err)
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}
const GetOrderConfirm = async (jsonFilter, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(JSON.stringify(jsonFilter))
        }
        const response = await fetch(URLDEFAULT + 'sellin/getorderconfirm', requestInfo)
        const result = await response.json()
        if (result.statusId == 200)
            actionResult(result?.data || [])
        else
            ToastError(result.messager)
    } catch (err) {
        console.log(err);
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}
export const SellInAPI = { DeleleList, UpdateOrder, GetOrderConfirm }