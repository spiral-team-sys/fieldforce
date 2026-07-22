import { GetToken } from "../Core/Helper"
import { QueryStringSql } from "../Core/SqliteDbContext"
import { masterList } from "../Core/Table"
import { URLDEFAULT } from "../Core/URLs"

const colorStatus = { OPEN: '#336699', PROGRESS: '#ff6347', COMPLETED: '#2e7d32' }

const TaskStatus = async (actionResult) => {
    const sql = `SELECT *, name AS itemName FROM ${masterList.tableName} WHERE listCode='TaskStatus' ORDER BY id`
    const { res } = await QueryStringSql(sql)
    actionResult(res)
}
const ToDoList = async (workinfo, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                'shopId': workinfo.shopId
            }
        }
        const response = await fetch(URLDEFAULT + 'shops/todolist', requestInfo)
        const result = await response.json()
        const lst = JSON.parse(result.data?.length > 0 && result.data[0].dataTask) || []
        await actionResult(lst)
    } catch (e) {
        console.log(e);
    }
}
const ToDoListAll = async () => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        }
        const response = await fetch(URLDEFAULT + 'shops/todolist', requestInfo)
        const result = await response.json()
        const lst = result.data?.length > 0 && result.data || []
        return lst
    } catch (e) {
        console.log(e);
    }
}
const UploadToDoList = async (workinfo, dataTask) => {
    try {
        const itemUpload = {
            shopId: workinfo.shopId,
            dataTask: JSON.stringify(dataTask)
        }
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemUpload)
        }
        const response = await fetch(URLDEFAULT + 'shops/update/todolist', requestInfo)
        const result = await response.json()
        return result;
    } catch (e) {
        return { messeger: 'Lỗi gửi dữ liệu, Vui lòng thử lại sau' }
    }

}

export const TaskAPI = { TaskStatus, UploadToDoList, ToDoList, ToDoListAll, colorStatus }