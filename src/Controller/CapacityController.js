
import { ToastError, ToastSuccess } from "../Core/Helper";
import { QueryStringSql, UpdateItem } from "../Core/SqliteDbContext";
import { capacity } from "../Core/Table";
import { _competitorId } from "../Core/URLs";
import { uploadServer } from "./UploadController";

export const uploadItemCapacity = async (itemCapacity, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, itemCapacity, async (result) => {
            await QueryStringSql(`update ${capacity.tableName} set isUploaded=1 where shopId=${itemCapacity.shopId} and workDate=${itemCapacity.workDate}`)
            ToastSuccess(result.messager);
            typeof (finish) === 'function' && finish();
        }, (result) => {
            ToastError(result.messager);
            typeof (error) === 'function' && error();
        })
    } catch (err) {
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}

export const UpdateItemCapacity = async (item) => {
    const sql = `INSERT INTO ${capacity.tableName} (shopId,workDate) 
        SELECT ${item.shopId},${item.workDate} 
        WHERE NOT EXISTS (SELECT 1 FROM ${capacity.tableName} WHERE shopId=${item.shopId} and workDate=${item.workDate})    
    `
    await QueryStringSql(sql);

    await QueryStringSql(
        `update ${capacity.tableName} 
        set capacityValue=${item.capacityValue}, note='${item.noteValue}' 
        where shopId=${item.shopId} and workDate=${item.workDate}`
    )
}

export const GetItemCapacity = async (item, actionResult) => {
    const { res } = await QueryStringSql(`SELECT * FROM ${capacity.tableName} WHERE shopId=${item.shopId} and workDate=${item.workDate}`)
    actionResult(res[0] || {})
}