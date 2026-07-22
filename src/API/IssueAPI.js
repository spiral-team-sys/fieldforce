import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

const checkDataReupdate = async (params, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(params)),
        }
        const response = await fetch(URLDEFAULT + "issue/checkdataresend", requestInfo)
        const result = await response.json()
        actionResult(result)
    } catch (e) {
        actionResult({ statusId: 500, data: null, messager: e })
    }
}

const sendReupdateData = async (itemData, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(itemData),
        }
        const response = await fetch(URLDEFAULT + "issue/reupdate", requestInfo)
        const result = await response.json()
        actionResult(result)
    } catch (e) {
        actionResult({ statusId: 500, data: null, messager: e })
    }
}

export const ISSUEAPI = { checkDataReupdate, sendReupdateData }