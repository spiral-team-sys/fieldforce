
import { GetToken, ToastError, ToastSuccess } from "../Core/Helper";
import { URLDEFAULT } from "../Core/URLs";
import { uploadServer } from "./UploadController";

const GetListAudit = async (shopId, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "shopId": shopId
            }
        }
        const response = await fetch(URLDEFAULT + "download/audititem", requestInfo)
        const result = await response.json()
        if (result.statusId === 200)
            actionResult(result.data)
    } catch (err) {
        console.log(err)
    }
}
const UploadTaskList = async (listTask, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, listTask, async (result) => {
            ToastSuccess(result.messager);
            typeof (finish) === 'function' && finish();
        }, (result) => {
            ToastSuccess(result.messager);
            typeof (error) === 'function' && error();
        })
    } catch (err) {
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}
export const AuditAPI = { GetListAudit, UploadTaskList }



