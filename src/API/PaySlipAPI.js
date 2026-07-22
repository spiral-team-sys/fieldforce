import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

const GetPayslip = async () => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }
        const response = await fetch(URLDEFAULT + 'employee/listpayslip', requestInfo)
        const result = await response.json()
        return result;
    } catch (e) {
        return { messager: "Lỗi kết nối hệ thống", statusId: 500 }
    }
}
export const PayslipAPI = { GetPayslip }