import { QueryStringSql } from "../Core/SqliteDbContext";
import { menulist, taskList } from "../Core/Table";
import { isValid } from "../Core/Utility";
import { isValidData } from "../Utils/validateData";

const getMenu = async (byShop = 0, actionResult) => {
    const sql = `SELECT a.*,t.taskDone,t.taskAlter,t.fistTask 
        FROM ${menulist.tableName} a
        LEFT JOIN ${taskList.tableName} t ON t.reportId=a.id
        WHERE a.byShop=${byShop} 
        ORDER BY a.sortGroup, a.sortList`
    const { res } = await QueryStringSql(sql);
    actionResult && actionResult(res)
    return res || [];
}
const getMenuKPI = async (byShop = 0, shopinfo, actionResult) => {
    const sql = `SELECT a.*,a.id as kpiId,menuNameVN as name,tableName as refName,pageName as refCode,t.taskDone,t.taskAlter,t.fistTask 
        FROM ${menulist.tableName} a 
        LEFT JOIN ${taskList.tableName} t ON t.shopId=${shopinfo.shopId} AND t.reportId=a.id
        WHERE byShop=${byShop} 
        ORDER BY a.sortGroup, a.sortList`
    const { res } = await QueryStringSql(sql)
    actionResult && actionResult(res)
    return res || [];
}
const getItemMenu = async (shopinfo, reportId, actionResult) => {
    const sql = `SELECT a.*,a.id as kpiId,menuNameVN as name,tableName as refName,pageName as refCode,t.taskDone,t.taskAlter,t.fistTask 
        FROM ${menulist.tableName} a 
        LEFT JOIN ${taskList.tableName} t ON t.shopId=${shopinfo.shopId} AND t.reportId=a.id
        WHERE a.id=${reportId}
        ORDER BY a.sortGroup, a.sortList`
    const { res } = await QueryStringSql(sql)
    actionResult && actionResult(res[0] || {})
    return res[0] || {}
}
const checkTaskDone = async (shopinfo) => {
    const menulist = await getMenuKPI(1, shopinfo);
    if (isValidData(menulist)) {
        const taskDone = await menulist.filter(v => v.taskDone === 0)
        return { isValid: !isValidData(taskDone), data: taskDone }
    }
    return { isValid: true, data: [] }
}
export const menuController = { getMenu, getMenuKPI, getItemMenu, checkTaskDone }