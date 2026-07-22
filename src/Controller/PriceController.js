import { Store, exeSql, UpdateItem, DeleteItem, InsertItems, QueryStringSql, Insert, DeleteAll } from "../Core/SqliteDbContext"
import { _competitorId, URLDEFAULT } from "../Core/URLs"
import { GetToken, ToastSuccess, Token } from "../Core/Helper";
import { historyMarketPrice, marketPriceResult } from "../Core/TableLocal";
import { products, taskList } from "../Core/Table";
import { uploadServer } from "./UploadController";

// History Market Price
const getHistoryMarketPrice = async (shopId) => {
    let dataHistory = []
    try {
        let access_token = await Token()
        await fetch(URLDEFAULT + "history/marketprice", {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
                "shopId": shopId
            }
        }).then(response => {
            return response.json();
        }).then(responseJson => {
            dataHistory = responseJson
        }).catch(error => {
            console.log("Lỗi: " + error)
        });
    } catch (err) {
        console.log("Lỗi: " + error)
    }
    await insertHistoryMarketPrice(dataHistory);
}
const GetPriceCompetitorDealer = async (workDate) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                "workDate": workDate
            },
        }
        const response = await fetch(URLDEFAULT + 'pricereport/pricecompetitorgetlist', requestInfo)
        const result = await response.json()
        return result;
    } catch (err) {
        console.log(err)
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}
const UploadPriceCompetitorDealer = async (jsonData, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(jsonData))
        }
        const response = await fetch(URLDEFAULT + 'pricereport/pricecompetitorsend', requestInfo)
        const result = await response.json()
        actionResult(result)
    } catch (err) {
        actionResult({ status: 500, messeger: "Lỗi truy cập API" })
    }
}
const insertHistoryMarketPrice = async (lstHistory) => {
    await DeleteAll(historyMarketPrice).then(async del => {
        await Insert(historyMarketPrice, lstHistory);
    })
}
// Market Price
const dataTabMarketPrice = async () => {//lấy danh sách Tab theo thể loại mặt hàng
    const sql = `
    SELECT DISTINCT type AS competitorId, division as competitorName,categoryId, categoryName,category as displayRef
    FROM ${products.tableName}
    WHERE ProductCode NOT IN ('OOS','NOSELL') AND report = 1
    ORDER BY type , categoryId`
    const { res } = await QueryStringSql(sql)
    return res || []
}
const dataCompetitorMarketPrice = async () => {//lấy danh sách tất cả hãng
    const sql = `SELECT DISTINCT p.division as competitorName, p.type as competitorId, 0 as isSelect 
    from ${products.tableName} as p where p.type>0 order by p.type`
    const { res } = await QueryStringSql(sql);
    return res || [];
}
const GetOnlyCompetitor = async () => {//Lấy danh sách đối thủ mà ko có của hãng
    const sql = `SELECT DISTINCT p.division as competitorName, p.type as competitorId, 0 as isSelect 
    from ${products.tableName} as p WHERE p.type>0 AND p.type<>${_competitorId} order by p.type`
    // console.log(sql)
    const { res } = await QueryStringSql(sql);
    // console.log(res)
    return res || [];
}
const getListMarketPrice = async (mWork, competitorId) => {//lấy danh sách sản phẩm từng Id
    let sql = `INSERT INTO ${marketPriceResult.tableName} (workId,productId,isUploaded,priceValue,netValue,fsmValue)
    SELECT ${mWork.workId} as workId,p.productId,0,ifnull(h.priceValue,0),ifnull(h.netValue,0),ifnull(h.fsmValue,0)
    FROM ${products.tableName} AS p
    LEFT JOIN ${historyMarketPrice.tableName} AS h ON p.productId=h.productId AND h.shopId=${mWork.shopId} AND h.workDate=${mWork.workDate}
    WHERE p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
    AND NOT EXISTS (SELECT 1 FROM ${marketPriceResult.tableName} AS m WHERE m.workId=${mWork.workId} AND m.productId=p.productId)`
    await QueryStringSql(sql);
    sql = `SELECT 0 AS indexMain,
        p.productId,p.productName,p.categoryId,p.categoryName,p.subCatId,p.subCategory,p.type AS competitorId,
        m.workId,ifnull(m.id,0) as id,m.priceValue,m.netValue,m.fsmValue,ifnull(m.isUploaded,0) AS isUploaded, null AS groupName
        FROM ${products.tableName} AS p
        LEFT JOIN ${marketPriceResult.tableName} AS m ON p.productId=m.productId AND m.workId=${mWork.workId}
        WHERE p.type=${competitorId}
        ORDER BY p.type, p.categoryId, p.subCatId, p.productId`
    // console.log(sql)
    const { res } = await QueryStringSql(sql);
    let dataResult = []
    await res?.forEach((i, index) => {
        i.indexMain = index
        dataResult.push(i);
    })
    // console.log(dataResult)
    return dataResult || [];
}

const getListAllMarketPrice = async (mWork) => {//lấy danh sách sản phẩm từng Id
    let sql = `SELECT 0 AS indexMain,
        p.productId,p.productName,p.categoryId,p.categoryName,p.subCatId,p.subCategory,p.type AS competitorId,
        m.workId,ifnull(m.id,0) as id,m.priceValue,m.netValue,m.fsmValue,ifnull(m.isUploaded,0) AS isUploaded
        FROM ${marketPriceResult.tableName} AS m
        LEFT JOIN ${products.tableName} AS p ON p.productId=m.productId
        WHERE m.workId=${mWork.workId}
        ORDER BY p.type, p.categoryId, p.subCatId, p.productId`
    const { res } = await QueryStringSql(sql);
    let dataResult = []
    await res?.forEach((i, index) => {
        i.indexMain = index
        dataResult.push(i);
    })
    // console.log(dataResult)
    return dataResult || [];
}


const getListPriceCompetitor = async (mWork, isAllCompetitor = false) => {//lấy danh sách sản phẩm đối thủ ngoại trừ hãng
    let sql = `INSERT INTO ${marketPriceResult.tableName} (workId,productId,isUploaded,priceValue,netValue,fsmValue)
    SELECT ${mWork.workId} as workId,p.productId,0,h.priceValue,h.netValue,h.fsmValue
    FROM ${products.tableName} AS p
    LEFT JOIN ${historyMarketPrice.tableName} AS h ON p.productId=h.productId AND h.shopId=${mWork.shopId} AND h.workDate=${mWork.workDate}
    WHERE ${isAllCompetitor ? '1=1' : `p.type<>${_competitorId}`} 
    AND NOT EXISTS (SELECT 1 FROM ${marketPriceResult.tableName} AS m WHERE m.workId=${mWork.workId} AND m.productId=p.productId)`
    await QueryStringSql(sql);
    //
    sql = `SELECT 0 AS indexMain,
        p.productId,p.productName,p.categoryId,p.categoryName,p.subCatId,p.subCategory,p.type AS competitorId,
        m.workId,ifnull(m.id,0) as id,m.priceValue,m.netValue,m.fsmValue,ifnull(m.isUploaded,0) AS isUploaded
        FROM ${marketPriceResult.tableName} AS m
        LEFT JOIN ${products.tableName} AS p ON p.productId=m.productId
        WHERE ${isAllCompetitor ? '1=1' : `p.type<>${_competitorId}`} 
        AND m.workId=${mWork.workId}
        ORDER BY p.type, p.categoryId, p.subCatId, p.productId`
    const { res } = await QueryStringSql(sql);
    let dataResult = []
    await res?.forEach((i, index) => {
        i.indexMain = index
        dataResult.push(i);
    })
    // console.log(dataResult)
    return dataResult || [];
}

const getListUpload_MarketPrice = async (mWork, listConfig = {}) => {
    const sql = `SELECT ${mWork.shopId} AS shopId,${mWork.workDate} AS workDate,m.productId,m.priceValue,m.netValue,m.fsmValue,m.isUploaded
            FROM ${marketPriceResult.tableName} AS m 
            WHERE m.workId=${mWork.workId}
            AND (
            ${listConfig?.priceValue == 1 ? `(m.priceValue IS NULL OR m.priceValue BETWEEN 1 AND 999 OR m.priceValue % 1000 <> 0)` : `m.priceValue IS NOT NULL`} OR
            ${listConfig?.netValue == 1 ? `(m.netValue IS NULL OR m.netValue BETWEEN 1 AND 999 OR m.netValue % 1000 <> 0)` : `m.netValue IS NOT NULL`} OR
            ${listConfig?.fsmValue == 1 ? `(m.fsmValue IS NULL OR m.fsmValue BETWEEN 1 AND 999 OR m.fsmValue % 1000 <> 0) ` : `m.fsmValue IS NOT NULL`}
            )
        `
    const { res } = await QueryStringSql(sql)
    return res
}
const updateItemPrice = async (id, itemUpdate) => {
    const sql = `update ${marketPriceResult.tableName} 
    SET priceValue = ${itemUpdate.priceValue}, 
    netValue = ${itemUpdate.netValue},
    fsmValue = ${itemUpdate.fsmValue} 
    where id = ${id} `
    // console.log(sql);
    await QueryStringSql(sql)
    return 1;
}
const doneReportMarketPrice = async (workId) => {
    await Store().then(async db => {
        await UpdateItem(db, 'marketPriceResult', { isUploaded: 1 }, { "workId": workId })
    })
    return 0;
}
//Check Data
const checkDataUpload = async (workId) => {
    let lstCheck = []
    let result = ''
    await Store().then(async db => {
        const sql = "select * from ("
            + " select 1000 as target, ifnull(m.priceValue,0) as actual, 'Giá niêm yết sản phẩm : '||p.productName||'\nHãng : '||p.division as message"
            + " from marketPriceResult as m"
            + " left join products as p on m.productId=p.productId"
            + " where m.netValue>0 or m.fsmValue>0 and workId=" + workId
            + " union all "
            + " select 1000 as target, ifnull(m.netValue,0) as actual, 'Giá NET sản phẩm : '||p.productName||'\nHãng : '||p.division as message"
            + " from marketPriceResult as m "
            + " left join products as p on m.productId=p.productId"
            + " where m.priceValue>0 or m.fsmValue>0 and workId=" + workId
            + ") as r where r.actual=0"
        const { res, err } = await exeSql(db, sql)
        lstCheck = res
    })
    if (lstCheck.length > 0) {
        lstCheck.forEach(i => {
            result = result + i.message + "\n"
        })
        result = 'Vui lòng nhập tiền (lớn hơn 1000đ): \n' + result
    }
    return result
}
//Upload Server
const uploadMarketPrice = async (workinfo, resultAction) => {
    try {
        const sql = `SELECT * FROM marketPriceResult WHERE workId = ${workinfo.workId}`
        let token = await GetToken()
        const { res } = await QueryStringSql(sql)

        if (res.length > 0) {
            const info = {
                shopId: workinfo.shopId,
                reportDate: workinfo.workDate,
                reportId: workinfo.reportId,
                jsonData: JSON.stringify(res),
                jsonPhoto: '[]'
            }

            await fetch(URLDEFAULT + "upload/uploadraw", {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
                body: JSON.stringify(info)
            }).then(response => {
                return response.json();
            }).then(async responseJson => {
                if (responseJson.statusId == 200) {
                    doneReportMarketPrice(workinfo.workId);
                    await QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
                }
                resultAction(responseJson.messager);
            }).catch(error => {
                resultAction("Lỗi: " + error)
            });
        }
    } catch (err) {
        resultAction("Lỗi: " + err.messager)
    }
}
export {
    // Market Price
    getListAllMarketPrice, GetOnlyCompetitor, dataTabMarketPrice, getListMarketPrice, updateItemPrice, getListUpload_MarketPrice, doneReportMarketPrice, uploadMarketPrice,
    dataCompetitorMarketPrice, checkDataUpload, getHistoryMarketPrice, insertHistoryMarketPrice, getListPriceCompetitor, GetPriceCompetitorDealer, UploadPriceCompetitorDealer
};
