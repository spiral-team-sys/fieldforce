import { GetToken, ToastError } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";
import { alertError } from "../Core/Utility";

const GetDataMenu = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(`${URLDEFAULT}pop/menu`, requestInfo)
        const result = await response.json()
        if (result.statusId === 200) {
            actionResult(result.data)
        } else {
            actionResult([], result.messager)
        }
    } catch (error) {
        actionResult([], `Lỗi kết nối API: ${error}`)
    }
}
const GetDataWarehouse = async (filter, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
                "WarehouseId": filter.wareHouseId
            },
            body: JSON.stringify(JSON.stringify(filter))
        }
        const response = await fetch(`${URLDEFAULT}pop/warehouseItem`, requestInfo)
        const result = await response.json()
        if (result.statusId === 200) {
            actionResult(result.data)
        } else {
            actionResult([], result.messager)
        }
    } catch (error) {
        actionResult([], `Lỗi kết nối API: ${error}`)
    }
}
const GetDataFollow = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(`${URLDEFAULT}pop/follow`, requestInfo)
        const result = await response.json()
        if (result.statusId === 200) {
            actionResult(result.data)
        } else {
            ToastError(`Lỗi: ${result.messager}`, 'Thông báo', 'top')
            actionResult([])
        }
    } catch (e) {
        ToastError(`Lỗi: ${e}`, 'Lỗi dữ liệu', 'top')
        actionResult([])
    }
}
const GetDataProcess = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(`${URLDEFAULT}pop/process`, requestInfo)
        const result = await response.json()
        if (result.statusId === 200) {
            actionResult(result.data)
        } else {
            ToastError(`Lỗi: ${result.messager}`, 'Thông báo', 'top')
            actionResult([])
        }
    } catch (e) {
        ToastError(`Lỗi: ${e}`, 'Lỗi dữ liệu', 'top')
        actionResult([])
    }
}
const UpdatePOP = async (params, actionResult, errorResult) => {
    try {
        const { typeUpdate, itemUpload } = params
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json",
                "typeUpdate": typeUpdate
            },
            body: JSON.stringify(itemUpload)
        }
        const responde = await fetch(`${URLDEFAULT}pop/update`, requestInfo)
        const result = await responde.json();
        if (result.statusId === 200) {
            actionResult(result.messager)
        } else {
            errorResult && errorResult(result.messager)
            ToastError(result.messager)
        }
    } catch (error) {
        const messageError = `Lỗi cập nhật: ${error}`
        errorResult && errorResult(messageError)
        ToastError(messageError)
    }
}
const UploadDataOrder = async (itemUpload, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(JSON.stringify(itemUpload))
        }
        const responde = await fetch(`${URLDEFAULT}pop/save/order`, requestInfo)
        const result = await responde.json();
        if (result.statusId === 200) {
            actionResult(result.messager)
        } else {
            alertError(result.messager)
        }
    } catch (error) {
        alertError(`Lỗi cập nhật: ${error}`)
    }
}
//
export const POPKey = {
    UPDATEWARE: 'UPDATEWARE',
    UPDATEORDER: 'UPDATEORDER',
    REJECT: 'REJECT',
    CONFIRM: 'CONFIRM'
}
export const POPAPI = { GetDataMenu, GetDataWarehouse, GetDataFollow, GetDataProcess, UpdatePOP, UploadDataOrder }

