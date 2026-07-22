import { Insert, QueryStringSql } from "../Core/SqliteDbContext";
import { displayTarget, posm, posmGuid, products, taskList } from "../Core/Table";
import { photos, posmByShop, posmResult } from "../Core/TableLocal";
import UploadController from '../Controller/UploadController'
import { ToastSuccess } from "../Core/Helper";
const GetList = async (workinfo) => {
    const sql = `
    SELECT a.itemCode,a.groupName,a.groupId,a.itemName,a.itemNameVN,a.note,v.posmNote,${workinfo.shopId} as shopId,${workinfo.workDate} as reportDate,
    v.upload,v.posmValue,a.id as itemId,0 AS totalRow 
    FROM ${posm.tableName} a 
    LEFT JOIN ${posmResult.tableName} v on v.shopId=${workinfo.shopId} AND v.reportDate=${workinfo.workDate} and v.itemId=a.id
    `
    const { res } = await QueryStringSql(sql);
    return res || []
}
const taskDone = async (workinfo) => {
    sql = `
    SELECT 'Tổng đã lắp' AS groupName,SUM(a.posmValue) as totalInput
    FROM ${posmResult.tableName} a 
    WHERE a.reportDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId} AND a.posmValue>=0
    UNION ALL
    SELECT t.groupName,SUM(a.posmValue) as totalInput
    FROM ${posmResult.tableName} a 
    LEFT JOIN ${posm.tableName} t on t.id=a.itemId
    WHERE a.reportDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId} AND a.posmValue>=0
    GROUP BY t.GroupName
    `
    const { res } = await QueryStringSql(sql);
    return res || []
}
const SaveItem = async (item) => {
    let sql = `SELECT * FROM ${posmResult.tableName} a 
    WHERE a.shopId=${item.shopId} AND a.reportDate=${item.reportDate} AND a.itemId=${item.itemId}`
    const { res } = await QueryStringSql(sql);
    if (res === null || res.length === 0) {
        await Insert(posmResult, [item])
    } else {
        sql = `UPDATE ${posmResult.tableName} SET posmValue=${item.posmValue} WHERE shopId=${item.shopId} AND reportDate=${item.reportDate} AND itemId=${item.itemId}`
        await QueryStringSql(sql);
    }
}
const PosmGroup = async () => {
    const sql = `
    SELECT DISTINCT a.groupName
    FROM ${posm.tableName} a `
    const { res } = await QueryStringSql(sql);
    return res || []
}
const UpdateNote = async (workinfo, note) => {
    const sql = `UPDATE ${posmResult.tableName} SET posmNote='${note}' 
    WHERE shopId=${workinfo.shopId} AND reportDate=${workinfo.workDate}`
    await QueryStringSql(sql)
}
const UploadReport = async (workinfo, uploadResult) => {
    const sql = `SELECT * FROM ${posmResult.tableName} 
    WHERE shopId=${workinfo.shopId} AND reportDate=${workinfo.workDate}`
    let { res } = await QueryStringSql(sql);
    await UploadController.uploadServer(workinfo, res || [], async (result) => {
        if (result.statusId == 200) {
            const sql1 = `UPDATE ${posmResult.tableName} SET upload=1 WHERE shopId=${workinfo.shopId} AND reportDate=${workinfo.workDate}`
            await QueryStringSql(sql1);
            const sql2 = `UPDATE ${taskList.tableName} SET taskDone=1 WHERE shopId=${workinfo.shopId} AND reportId=${workinfo.reportId}`
            await QueryStringSql(sql2);
            //
            await uploadResult(result);
        }
    }, null)
}
// PosmByDislayTaret
const PosmTargetGetList = async (workinfo) => {
    let sql = `
    SELECT a.*,p.productCode,p.productName,p.categoryId,p.category,p.categoryName,p.subCategory,p.segment,p.subCatId, d.defaultValue
    FROM ${posmByShop.tableName} a 
    LEFT JOIN ${products.tableName} p ON p.productId=a.productId
    LEFT JOIN ${displayTarget.tableName} d ON d.shopId=${workinfo.shopId} AND d.productId=a.productId
    WHERE a.reportDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    ORDER BY d.defaultValue DESC,p.categoryId,p.subCatId`
    const { res } = await QueryStringSql(sql);
    return res || [];
}
const PosmTargetGroup = async (workinfo) => {
    let sql = `
    INSERT INTO ${posmByShop.tableName}(shopId,reportDate,productId,displayValue,posmList,upload)
    SELECT ${workinfo.shopId},${workinfo.workDate},d.productId,d.displayLast,d.posmList,0
    FROM ${displayTarget.tableName} d
    WHERE d.shopId=${workinfo.shopId}
    AND NOT EXISTS(SELECT 1 FROM ${posmByShop.tableName} ds WHERE ds.productId=d.productId AND ds.reportDate=${workinfo.workDate} AND ds.shopId=${workinfo.shopId})`
    await QueryStringSql(sql);
    //console.log(sql, 'check sql1');
    //
    sql = `
    SELECT p.categoryId,p.category,p.categoryName,COUNT(a.id) as totalRow,COUNT(CASE WHEN a.displayValue IS NULL THEN 0 ELSE 1 END) as displayInput
    FROM ${posmByShop.tableName} a 
    LEFT JOIN ${products.tableName} p ON p.productId=a.productId
    WHERE a.reportDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId}
    GROUP BY p.category,p.categoryName
    `
    //console.log(sql, 'check sql2');

    const { res } = await QueryStringSql(sql);
    return res || []
}
const PosmUpdate = async (item) => {
    const sql = `
    update ${posmByShop.tableName} SET displayValue=${item.displayValue},posmList='${item.posmList}',posmNote='${(item.posmNote === null || item.posmNote === 'null') ? '' : item.posmNote}'
    WHERE id=${item.id}
    `
    // console.log(sql);
    await QueryStringSql(sql);
}
const GetProductMore = async (workinfo) => {
    const sql = `SELECT p.productId,p.productCode,p.productName,p.category,p.categoryName,subcategory,segment,false as addMore,${workinfo.shopId} as shopId,${workinfo.workDate} as reportDate,1 AS displayValue
    FROM ${products.tableName} p 
    WHERE NOT EXISTS(
        SELECT 1 FROM ${posmByShop.tableName} d 
        WHERE d.productId=p.productId AND d.shopId=${workinfo.shopId} AND d.reportDate=${workinfo.workDate}
    )`
    const { res } = await QueryStringSql(sql);
    return res || []
}
const AddMoreProduct = async (addlist) => {
    // console.log(addlist)
    await Insert(posmByShop, addlist)
}
const ShowResult = async (workinfo) => {
    const sql = `
    SELECT 0 as code, 'Tổng sản phẩm đang kiểm tra ' AS title,COUNT(a.displayValue) as countInput
    FROM ${posmByShop.tableName} a 
    WHERE a.reportDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId} AND a.displayValue IS NOT NULL
    UNION ALL
    SELECT  0 as code,t.category,COUNT(a.displayValue) as totalInput
    FROM ${posmByShop.tableName} a 
    LEFT JOIN ${products.tableName} t on t.productId=a.productId
    WHERE a.reportDate=${workinfo.workDate} AND a.shopId=${workinfo.shopId} AND a.displayValue IS NOT NULL
    GROUP BY t.category
    UNION ALL
    SELECT  1 as code,'Sản phẩm chưa kiểm tra Posm ', COUNT(*) FROM ${posmByShop.tableName} p 
    WHERE (p.posmList IS NULL OR p.posmList = 'null') AND p.displayValue>0 AND p.reportDate=${workinfo.workDate} 
    AND p.shopId=${workinfo.shopId} AND (SELECT count(productId) FROM ${posmGuid.tableName} pg WHERE pg.productId = p.productId) > 0
    UNION ALL
    SELECT  0 as code,'Hình ảnh đã chụp',COUNT(*) 
    FROM ${photos.tableName} p 
    WHERE shopId=${workinfo.shopId} AND p.photoDate=${workinfo.workDate} 
    AND p.reportId=${workinfo.reportId}
    UNION ALL
    SELECT  0 as code,p.photoDesc,COUNT(*) 
    FROM ${photos.tableName} p 
    WHERE shopId=${workinfo.shopId} AND p.photoDate=${workinfo.workDate} 
    AND p.reportId=${workinfo.reportId} AND p.photoDesc IS NOT NULL
    GROUP BY p.photoDesc
    `
    const { res } = await QueryStringSql(sql);
    return res || []
}
const removeProduct = async (item) => {
    const sql = `DELETE FROM ${posmByShop.tableName} WHERE id=${item.id}`
    QueryStringSql(sql);
}
const GetListPosm = async () => {
    const sql = `SELECT p.id as posmId,p.itemName as posmName,p.itemNameVN as posmNameVN ,groupId,groupName
    FROM ${posm.tableName} p `
    const { res } = await QueryStringSql(sql)
    return res || []
}
const PosmOutGuid = async (productId) => {
    const sql = `SELECT p.id as posmId,p.itemName as posmName,p.itemNameVN as posmNameVN ,groupId,groupName,0 AS Guid
    FROM ${posm.tableName} p 
    WHERE NOT EXISTS(SELECT 1 FROM ${posmGuid.tableName} g WHERE g.productId=${productId}
    AND g.posmId=p.id)`
    const { res } = await QueryStringSql(sql)
    return res || []
}
const PosmInGuid = async (productId) => {
    const sql = `SELECT productId,posmId,p.itemNameVN as posmNameVN ,p.itemName as posmName,1 AS Guid
        FROM ${posmGuid.tableName} g
        LEFT JOIN ${posm.tableName} p ON p.id=g.posmId 
        WHERE g.productId=${productId}`
    // console.log(sql, 'check sql');
    const { res } = await QueryStringSql(sql)
    return res || []
}
const PosmNote = async (workinfo, note) => {
    const sql = `UPDATE ${posmByShop.tableName} SET posmNote=${note !== null ? "'" + note + "'" : null}
    WHERE shopId=${workinfo.shopId} AND reportDate=${workinfo.workDate}`
    await QueryStringSql(sql)
    // console.log(sql)
}
const PosmUpload = async (workinfo, uploadResult) => {
    // const sql = `SELECT * FROM ${posmByShop.tableName} 
    // WHERE shopId=${workinfo.shopId} AND reportDate=${workinfo.workDate} AND  (upload IS NULL OR upload<>1)
    // AND displayValue IS NOT NULL`

    const sql = `SELECT pb.* FROM ${posmByShop.tableName} pb
        WHERE pb.shopId= ${workinfo.shopId} AND pb.reportDate=${workinfo.workDate} AND  (upload IS NULL OR upload<>1)  `
    const { res } = await QueryStringSql(sql);

    if (res !== null && res.length > 0) {
        await UploadController.uploadServer(workinfo, res || [], async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                const sql1 = `UPDATE ${posmByShop.tableName} SET upload=1 WHERE shopId=${workinfo.shopId} AND reportDate=${workinfo.workDate}`
                await QueryStringSql(sql1);
                const sql2 = `UPDATE ${taskList.tableName} SET taskDone=1 WHERE shopId=${workinfo.shopId} AND reportId=${workinfo.reportId}`
                await QueryStringSql(sql2);
                //
                await uploadResult(result);
            }
        }, null)
    } else {
        await uploadResult({ "statusId": 500, "messager": "Không có dữ liệu báo cáo" });
    }
}
const PosmClearData = async (workinfo, categoryId) => {

    let sql = `UPDATE ${posmByShop.tableName} 
    SET displayValue = null, 
    posmList = null,
    posmNote = null
    where shopId=${workinfo.shopId} AND reportDate=${workinfo.workDate}
    ${categoryId ? `AND productId in (
        select productId FROM ${products.tableName} WHERE categoryId = ${categoryId}
        )` : ''}
    `
    // console.log(sql);
    await QueryStringSql(sql)
}

export const POSMContext = { PosmClearData, PosmUpload, PosmNote, PosmOutGuid, PosmInGuid, GetListPosm, ShowResult, PosmTargetGroup, PosmTargetGetList, GetProductMore, AddMoreProduct, removeProduct, PosmUpdate, UpdateNote, UploadReport, SaveItem, PosmGroup, GetList, taskDone }
