import Moment from "moment";
import Promotion from "../Component/Promotion";
import { ToastError, ToastSuccess, UploadData } from "../Core/Helper";
import { exeSqlNoQuery, Insert, QueryStringSql, Store, UpdateItem } from "../Core/SqliteDbContext";
import { products } from "../Core/Table";
import { promotion, promotionPrice } from "../Core/TableLocal";
import { URL_POST_PROMOTIONUPLOAD, _competitorId } from "../Core/URLs";
import { checkNetwork, ConvertDateFromInt } from "../Core/Utility";
import { uploadServer } from "./UploadController";


export async function PromotionItemUpload(workinfo) {
    const sql = "Select * FROM promotion Where upload<>1 AND workId=" + workinfo.workId;
    return await QueryStringSql(sql);
}

export async function PromotionUpload(res, resPhotos, workinfo) {
    let isNetwork = await checkNetwork();
    var details = [];
    res.forEach(item => {
        details.push(
            {
                "categoryId": item.categoryId,
                "competitorId": item.competitorId,
                "promotionId": item.promotionId,
                "title": item.titlePromotion === 'undefined' ? '' : item.titlePromotion,
                "fromDate": parseInt(item.fromDate),
                "toDate": parseInt(item.toDate),
                "guiId": item.guiId,
                "content": item.content === 'undefined' ? '' : item.content,
            })
    });

    if (!isNetwork) {
        alert("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
        return
    }
    let itemsPhoto = [];
    resPhotos.forEach(photoInfo => {
        let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
        // let pathPhoto = URLDEFAULT + 'uploaded/' + photoInfo.photoDate + '/' + ImgName
        let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
        let dataItem = {
            "shopId": photoInfo.shopId,
            "photoName": ImgName,
            "latitude": photoInfo.latitude,
            "longitude": photoInfo.longitude,
            "accuracy": 8,
            "reportId": photoInfo.reportId,
            "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            "photoType": '' + parseInt(photoInfo.photoType),
            "photoDate": photoInfo.photoDate,
            "photoPath": pathPhoto,
            "guid": photoInfo.guid
        }
        itemsPhoto.push(dataItem);
    });

    var PromotionInfo = JSON.stringify({
        "ShopId": workinfo.shopId,
        "WorkDate": ConvertDateFromInt(workinfo.workDate, 'YYYYMMDD', 'YYYY-MM-DD'),
        "Details": JSON.stringify(details),
        "Photos": JSON.stringify(itemsPhoto)
    });

    var Results = await UploadData(URL_POST_PROMOTIONUPLOAD, PromotionInfo);
    return Results
}

export async function UploadStatePromotion(workinfo) {
    const sql = "Update promotion set upload=1 WHERE WorkId=" + workinfo.workId;
    await QueryStringSql(sql);
}

export async function InsertItemsPromotion(item) {
    await Insert(promotion, [item]);
    return true;
}
export async function updateItemsPromotion(item) {
    const sql =
        `UPDATE ${promotion.tableName}
            SET categoryId=${item.categoryId},
                categoryName="${item.categoryName}",
                competitorId=${item.competitorId},
                competitorName="${item.competitorName}",
                titlePromotion="${item.titlePromotion}",
                content= "${item.content}",
                toDate= ${item.toDate},
                fromDate= ${item.fromDate}
            WHERE Id= ${item.Id} AND workId= ${item.workId} `
    await QueryStringSql(sql)
    // console.log(sql, 'check query')
    return true;

}

export async function getListPromotion(workinfo, isByType = 0) {
    let sql = `
    INSERT INTO ${promotionPrice.tableName}(workId,shopId,workDate,productId,promotionType,upload)
    SELECT ${workinfo.workId},${workinfo.shopId},${workinfo.workDate},p.productId,0,0
    FROM ${products.tableName} AS p
    WHERE ${isByType !== 1 ? ` p.type=${_competitorId} AND ` : ''}
    NOT EXISTS ( SELECT 1 FROM ${promotionPrice.tableName} AS d WHERE d.workId = ${workinfo.workId} AND d.productId = p.productId)
    `
    await QueryStringSql(sql);
    // console.log(sql, 'sql 1');
    //
    sql = `SELECT d.*,p.type AS divisionId, p.division,p.productName, p.categoryName,p.productCode,p.report, p.categoryId,
    (CASE WHEN (d.retailPrice > 0 AND d.retailPrice < 10000 ) OR (d.retailPrice % 1000 > 0) THEN 1 ELSE 0 END )as retailError ,
    (CASE WHEN (d.discountPrice >0 AND d.discountPrice < 10000) OR  (d.discountPrice % 1000 > 0) THEN 1 ELSE 0 END)as discountError 
        FROM ${promotionPrice.tableName} AS d
        LEFT JOIN ${products.tableName} AS p ON p.productId=d.productId
        WHERE p.productName IS NOT NULL AND p.ProductCode not in ('OOS', 'NOSELL')
        AND ${isByType !== 1 ? ` p.type=${_competitorId} AND ` : ''} d.workId=${workinfo.workId}
        ORDER BY p.type, p.categoryId, p.productId`
    // console.log(sql, 'sql 2');
    const { res } = await QueryStringSql(sql);
    return res;
}
export async function updateItemPricePromotion(item) {
    let sql = `
    UPDATE promotionPrice
		SET retailPrice = ${item.retailPrice},
        discountPrice = ${item.discountPrice},
        promotionType = ${item.promotionType},
        giftName ='${item.giftName === 'null' ? '' : item.giftName}'
		WHERE Id = ${item.Id}
    `
    await QueryStringSql(sql);
}

export async function getPromotionResult(workinfo) {
    let sql = ` Select * FROM ${promotionPrice.tableName}
    Where workId=${workinfo.workId}
    AND (retailPrice is not null OR discountPrice is not null OR promotionType is not null)`
    const { res } = await QueryStringSql(sql);
    return res || []
}
export async function clearAllPromotionPrice(workinfo) {
    let sql = `UPDATE ${promotionPrice.tableName} SET retailPrice = null, discountPrice = null, promotionType = 0,giftName="" where workId=${workinfo.workId}`
    await QueryStringSql(sql)
}
export async function clearPromotionPriceByCat(workinfo, itemCategory) {
    let sql = `UPDATE ${promotionPrice.tableName} 
    SET retailPrice = null, discountPrice = null, promotionType = 0,giftName="" 
    where workId=${workinfo.workId} 
    AND productId IN (
        SELECT s.productId
        FROM ${promotionPrice.tableName} AS s
        LEFT JOIN ${products.tableName} AS p ON p.productId=s.productId 
        WHERE s.workId=${workinfo.workId} AND p.categoryId=${itemCategory.categoryId} AND p.type = ${itemCategory.divisionId}
    )`
    await QueryStringSql(sql)
}

export const uploadPromotionPrice = async (resDisplay, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, resDisplay, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update promotionPrice set upload=1 WHERE workId=" + workinfo.workId;
                    await exeSqlNoQuery(db, sqlData);
                });
            }
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

export async function deleteDataPromotion() {
    let sql = `
    DELETE FROM promotionPrice
    `
    await QueryStringSql(sql);
}


