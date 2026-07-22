import { GetToken, Token } from "../Core/Helper"
import { URLDEFAULT } from "../Core/URLs";

export const getDataSuggestTimeSheet = async (data, nameData, code) => {
    try {
        const token = await GetToken()
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLDEFAULT + 'timesheet/attendantissue', requestInfo)
        const result = await response.json()
        return { ...result, 'nameData': nameData, 'code': code }
    } catch (e) {
        return { messeger: "Lỗi kết nối đến hệ thống. Vui lòng thử lại sau!" }
    }
}

export const UpdateSuggestTimeSheet = async (data) => {
    try {
        const token = await GetToken()
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        }
        const response = await fetch(URLDEFAULT + 'timesheet/confirmattendantissue', requestInfo)
        const result = await response.json()
        return result
    } catch (e) {
        return { messeger: "Lỗi kết nối đến hệ thống. Chưa gửi được báo cáo. Vui lòng thử lại sau!" }
    }
}