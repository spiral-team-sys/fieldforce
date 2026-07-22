import { GetToken } from "../Core/Helper"
import { URLDEFAULT } from "../Core/URLs"
import { toastError } from "../Utils/configToast"

// Use for report
const GetDataTaxCode = async (taxCode, actionResult) => {
    try {
        const requestInfo = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'taxCode': taxCode
            }
        }
        const response = await fetch(`${URLDEFAULT}public/taxCode`, requestInfo)
        const result = await response.json()
        if (result.statusId == 200) {
            actionResult && actionResult(result.data[0] || {})
        } else {
            const info = await GetTaxCodeFromAPI(taxCode)
            actionResult && actionResult(info.taxInfo, info.message)
        }
    } catch (error) {
        toastError('Lỗi dữ liệu', 'Hệ thống đang quá tải, Vui lòng thử lại sau')
    }
}
const CheckDataTaxCode = async (taxCode) => {
    try {
        const token = await GetToken()
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'taxCode': taxCode
            }
        }
        const response = await fetch(`${URLDEFAULT}public/check/taxCode`, requestInfo)
        const result = await response.json()
        return result.data || []
    } catch (error) {
        toastError('Lỗi dữ liệu', 'Hệ thống đang quá tải, Vui lòng thử lại sau')
    }
}
const UpdateDataTaxCode = async (data) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(data))
        }
        const response = await fetch(`${URLDEFAULT}public/update/taxcode`, requestInfo)
        const result = await response.json()
        return result
    } catch (error) {
        toastError('Lỗi dữ liệu', 'Hệ thống đang quá tải, Vui lòng thử lại sau')
    }
}
const GetTaxCodeFromAPI = async (taxCode) => {
    try {
        const requestInfo = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }
        const response = await fetch(`https://api.vietqr.io/v2/business/${taxCode}`, requestInfo)
        const result = await response.json()
        if (result.code == '00') {
            await UpdateDataTaxCode(result.data)
            return { taxInfo: result.data }
        } else {
            return { taxInfo: {}, message: result.desc }
        }
    } catch (error) {
        toastError('Lỗi dữ liệu', 'Hệ thống đang quá tải, Vui lòng thử lại sau')
    }
}
const GetDataCCCD = async (dataFiles) => {
    try {
        if (dataFiles.length == 0) {
            return { statusId: 404, messager: "Dữ liệu Files không tồn tại" };
        }
        //
        const formData = new FormData();
        dataFiles.forEach((file, index) => {
            formData.append(`files[${index}].file`, {
                uri: file.localUrl,
                type: file.fileType,
                name: file.fileName
            });
            formData.append(`files[${index}].guid`, file.guid);
        });
        formData.append("fileDate", fileDate);
        //
        const token = await GetToken();
        const requestInfo = {
            method: "POST",
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": token
            },
            body: formData
        }
        const response = await fetch(`${URLDEFAULT}public/check/cccd`, requestInfo);
        const result = await response.json();
        return result
    } catch (error) {
        return { statusId: 404, messager: error };
    }
}
//
export const PUBLIC_API = { GetDataTaxCode, CheckDataTaxCode, GetDataCCCD }