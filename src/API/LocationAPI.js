import { GetToken } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";

const getLocationAddress = async () => {
}

const getLocationPoint = async (address, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(address)
        }
        const response = await fetch(`${URLDEFAULT}public/geoaddress`, requestInfo)
        const result = await response.json()
        if (await result.statusCode === 200) {
            const content = await JSON.parse(result.content || '[{}]');
            const info = await content?.results[0] || {}
            const resLocation = {
                "address": info.formatted_address || 'Không xác định',
                "location": info.geometry.location || {}
            }
            console.log(resLocation);

            await actionResult(resLocation)
        } else {
            await actionResult({}, "Không xác định")
        }
    } catch (e) {
        await actionResult({}, `Lỗi: ${e}`)
    }
}

export const LocationAPI = { getLocationAddress, getLocationPoint }