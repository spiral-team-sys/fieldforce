import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";


export const UpdateTokenToServer = async (data, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(data))
        }
        const response = await fetch(`${URLDEFAULT}employee/checktoken`, requestInfo)
        const result = await response.json()
        await actionResult(result.status, result.messeger)
    } catch (e) {
        actionResult(500, `Lỗi: ${e}`)
    }
}




