import { Token } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

export const GetListDocument = async (actionResult) => {
    try {
        let token = await Token();
        await fetch(URLDEFAULT + 'document/getlist',
            {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
            })
            .then((response) => { return response.json() })
            .then((responseJson) => {
                actionResult(responseJson.data)
            });
    } catch (error) {
        console.log('Document Errorr:' + error)
    }
}
export const GetDocument = async (docType) => {
    try {
        const token = await Token()
        const requestInfo = {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token,
                'docType': docType

            }
        }
        const response = await fetch(URLDEFAULT + 'document/documentbytype', requestInfo)
        const result = await response.json()

        if (result.statusId === 200) {
            return result?.data || []
        } else {
            alert(JSON.stringify(result))
        }
    } catch (e) {
        console.log(e, 'GetDocument')
    }
}
