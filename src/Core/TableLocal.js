const photos = {
    tableName: 'photos', tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'BIGINT' },
        { columnName: 'shopCode', dataType: 'VARCHAR(32)' },
        { columnName: 'photoDate', dataType: 'INTEGER' },
        { columnName: 'photoTime', dataType: 'INTEGER' },
        { columnName: 'photoType', dataType: 'VARCHAR(32)' },
        { columnName: 'photoDesc', dataType: 'NVARCHAR(2000)' },
        { columnName: 'photoRef', dataType: 'INTEGER' },
        { columnName: 'dataUpload', dataType: 'INTEGER' },
        { columnName: 'fileUpload', dataType: 'INTEGER' },
        { columnName: 'latitude', dataType: 'DECIMAL' },
        { columnName: 'longitude', dataType: 'DECIMAL' },
        { columnName: 'accuracy', dataType: 'DECIMAL' },
        { columnName: 'gpsAddress', dataType: 'NVARCHAR(500)' },
        { columnName: 'photoPath', dataType: 'VARCHAR(500)' },
        { columnName: 'reportId', dataType: 'INTEGER' },
        { columnName: 'guid', dataType: 'VARCHAR(64)' },
        { columnName: 'sortList', dataType: 'INTEGER' },
        { columnName: 'tag', dataType: 'VARCHAR(32)' },
        { columnName: 'photoFullTime', dataType: 'VARCHAR(250)' },
        { columnName: 'shopLat', dataType: 'DECIMAL' },
        { columnName: 'shopLong', dataType: 'DECIMAL' },
        { columnName: 'timeOT', dataType: 'FLOAT' },
        { columnName: 'noteOT', dataType: 'NVARCHAR(250)' },
        { columnName: 'UNIQUE', dataType: '(shopId,photoTime)' },
    ]
}
const workResults = {
    tableName: 'workResults',
    tableFields: [
        { columnName: 'workId', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'BIGINT' },
        { columnName: 'shopCode', dataType: 'VARCHAR(32)' },
        { columnName: 'shopName', dataType: 'NVARCHAR(250)' },
        { columnName: 'address', dataType: 'NVARCHAR(500)' },
        { columnName: 'imageUrl', dataType: 'VARCHAR(150)' },
        { columnName: 'workDate', dataType: 'INTEGER' },
        { columnName: 'workNote', dataType: 'NVARCHAR(500)' },
        { columnName: 'workTime', dataType: 'BIGINT' },
        { columnName: 'workStatus', dataType: 'INTEGER' },
        { columnName: 'attendantCount', dataType: 'INTEGER' },
        { columnName: 'fsmValue', dataType: 'INTEGER' },
        { columnName: 'guiid', dataType: 'VARCHAR(500)' },
        { columnName: 'shopConfig', dataType: 'NVARCHAR(4000)' }
    ]
}
const sellOut = {
    tableName: 'sellOut',
    tableFields: [
        { columnName: 'sellId', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'reportDate', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'productCode', dataType: 'NVARCHAR(32)' },
        { columnName: 'productName', dataType: 'NVARCHAR(125)' },
        { columnName: 'quantity', dataType: 'INTEGER' },
        { columnName: 'amount', dataType: 'DECIMAL' },
        { columnName: 'price', dataType: 'DECIMAL' },
        { columnName: 'serial', dataType: 'VARCHAR(32)' },
        { columnName: 'IMEI2', dataType: 'VARCHAR(32)' },
        { columnName: 'sellType', dataType: 'INTEGER' },
        { columnName: 'sellComment', dataType: 'NVARCHAR(500)' },
        { columnName: 'customer', dataType: 'NVARCHAR(125)' },
        { columnName: 'address', dataType: 'NVARCHAR(250)' },
        { columnName: 'phone', dataType: 'VARCHAR(32)' },
        { columnName: 'gender', dataType: 'VARCHAR(32)' },
        { columnName: 'age', dataType: 'VARCHAR(32)' },
        { columnName: 'color', dataType: 'VARCHAR(32)' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'division', dataType: 'VARCHAR(128)' },
        { columnName: 'category', dataType: 'VARCHAR(512)' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'subcategory', dataType: 'VARCHAR(128)' },
        { columnName: 'segment', dataType: 'VARCHAR(532)' },
        { columnName: 'subsegment', dataType: 'VARCHAR(532)' },
        { columnName: 'guiId', dataType: 'VARCHAR(32)' },
        { columnName: 'flag', dataType: 'INT' },
        { columnName: 'statusVerify', dataType: 'NVARCHAR(250)' },
        { columnName: 'itemClassify', dataType: 'NVARCHAR(250)' },
        { columnName: 'promotionType', dataType: 'NVARCHAR(500)' },
        { columnName: 'taxCode', dataType: 'NVARCHAR(500)' },
        { columnName: 'email', dataType: 'NVARCHAR(500)' },
        { columnName: 'paymentMethod', dataType: 'NVARCHAR(500)' },
        { columnName: 'deposit', dataType: 'TEXT' },
        { columnName: 'billCode', dataType: 'NVARCHAR(500)' }
    ]
}
const sellOutResult = {
    tableName: 'sellOutResult',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'shopInfo', dataType: 'NVARCHAR(1256)' },
        { columnName: 'soDate', dataType: 'INTEGER' },
        { columnName: 'soNote', dataType: 'NVARCHAR(256)' },
        { columnName: 'noSell', dataType: 'INTEGER DEFAULT(0)' },
        { columnName: 'soDetails', dataType: 'TEXT' },
        { columnName: 'upload', dataType: 'INTEGER  DEFAULT(0)' },
        { columnName: 'UNIQUE', dataType: '(shopId,soDate)' },
    ]
}
const promotion = {
    tableName: 'promotion',
    tableFields: [
        { columnName: 'Id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'promotionId', dataType: 'INTEGER' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'categoryName', dataType: 'VARCHAR(100)' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'competitorName', dataType: 'VARCHAR(100)' },
        { columnName: 'titlePromotion', dataType: 'VARCHAR(250)' },
        { columnName: 'content', dataType: 'VARCHAR(250)' },
        { columnName: 'fromDate', dataType: 'INTEGER' },
        { columnName: 'toDate', dataType: 'INTEGER' },
        { columnName: 'guiId', dataType: 'VARCHAR(32)' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'upload', dataType: 'INTEGER' },
    ]
}
const promotionPrice = {
    tableName: 'promotionPrice',
    tableFields: [
        { columnName: 'Id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'workDate', dataType: 'NVARCHAR(50)' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'retailPrice', dataType: 'FLOAT' },
        { columnName: 'discountPrice', dataType: 'FLOAT' },
        { columnName: 'giftName', dataType: 'VARCHAR(250)' },
        { columnName: 'promotionType', dataType: 'INTEGER' },
        { columnName: 'priceValue', dataType: 'FLOAT' },
        { columnName: 'netPrice', dataType: 'FLOAT' },
        { columnName: 'incentive', dataType: 'FLOAT' },
        { columnName: 'upload', dataType: 'INTEGER' },
    ]
}
const market = {
    tableName: 'market',
    tableFields: [
        { columnName: 'Id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'categoryName', dataType: 'VARCHAR(250)' },
        { columnName: 'optionId', dataType: 'INTEGER' },
        { columnName: 'optionName', dataType: 'VARCHAR(250)' },
        { columnName: 'surveyDisplayId', dataType: 'INTEGER' },
        { columnName: 'surveyDisplayName', dataType: 'VARCHAR(250)' },
        { columnName: 'status', dataType: 'INTEGER' },
        { columnName: 'content', dataType: 'VARCHAR(250)' },
        { columnName: 'trafficId', dataType: 'INTEGER' },
        { columnName: 'noteTraffic', dataType: 'VARCHAR(500)' },
        { columnName: 'guiId', dataType: 'VARCHAR(32)' },
        { columnName: 'upload', dataType: 'INTEGER' },
    ]
}
const displayCompetitor = {
    tableName: 'displayCompetitor',
    tableFields: [
        { columnName: 'displayCompetitorId', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'workDate', dataType: 'NVARCHAR(50)' },
        { columnName: 'divisionId', dataType: 'INTEGER' },
        { columnName: 'division', dataType: 'NVARCHAR(50)' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'categoryName', dataType: 'NVARCHAR(50)' },
        { columnName: 'subCatId', dataType: 'INTEGER' },
        { columnName: 'subCategory', dataType: 'NVARCHAR(150)' },
        { columnName: 'modelName', dataType: 'NVARCHAR(200)' },
        { columnName: 'quantity', dataType: 'INTEGER' },
        { columnName: 'priceValue', dataType: 'FLOAT' },
        { columnName: 'netValue', dataType: 'FLOAT' },
        { columnName: 'fsmValue', dataType: 'FLOAT' },
        { columnName: 'isAddProduct', dataType: 'INTEGER' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'competitorOrderBy', dataType: 'INTEGER' },
        { columnName: 'displayComment', dataType: 'NVARCHAR(500)' }
    ]
}
const display = {
    tableName: 'display',
    tableFields: [
        { columnName: 'displayId', dataType: 'INTEGER' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'quanity', dataType: 'INTEGER' },
        { columnName: 'quanityDisplay', dataType: 'INTEGER' }, // Remove sau khi update app BK
        { columnName: 'quantityStock', dataType: 'INTEGER' },
        { columnName: 'quantitySuggest', dataType: 'INTEGER' },
        { columnName: 'quantityShelves', dataType: 'INTEGER' },
        { columnName: 'price', dataType: 'DECIMAL' },
        { columnName: 'fsmValue', dataType: 'DECIMAL' },
        { columnName: 'displayType', dataType: 'INTEGER' },
        { columnName: 'displayRef', dataType: 'INTEGER' },
        { columnName: 'displayComment', dataType: 'NVARCHAR(500)' },
        { columnName: 'productComment', dataType: 'NVARCHAR(500)' },
        { columnName: 'posmComment', dataType: 'NVARCHAR(500)' },
        { columnName: 'displayArea', dataType: 'NVARCHAR(500)' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'division', dataType: 'NVARCHAR(150)' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'subCategory', dataType: 'NVARCHAR(150)' },
        { columnName: 'subCatId', dataType: 'INTEGER' },
        { columnName: 'tagPOPId', dataType: 'INTEGER' },
        { columnName: 'tagDisplayId', dataType: 'INTEGER' },
        { columnName: 'mockupValue', dataType: 'INTEGER' },
        { columnName: 'modelName', dataType: 'NVARCHAR(500)' },
        { columnName: 'isAddProduct', dataType: 'INTEGER DEFAULT (0)' },
        { columnName: 'categoryNameVN', dataType: 'NVARCHAR(500)' },
        { columnName: 'quantityPOP', dataType: 'INTEGER' },
        { columnName: 'namePOP', dataType: 'NVARCHAR(500)' },
        { columnName: 'OOS', dataType: 'INTEGER' },
        { columnName: 'oldEmployeeId', dataType: 'INTEGER' },
        { columnName: 'oldQuantity', dataType: 'INTEGER' },
        { columnName: 'OldDisplayId', dataType: 'INTEGER' },
        { columnName: 'isChangeValue', dataType: 'INTEGER' },
        { columnName: 'isCheckValue', dataType: 'INTEGER' },
        { columnName: 'PRIMARY', dataType: 'KEY(workId,productId)' },
    ]
}
const displayByShop = {
    tableName: 'displayByShop',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'displayDate', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'displayValue', dataType: 'INTEGER' },
        { columnName: 'displayLast', dataType: 'INTEGER' },
        { columnName: 'priceValue', dataType: 'FLOAT' },
        { columnName: 'priceLast', dataType: 'FLOAT' },
        { columnName: 'netValue', dataType: 'FLOAT' },
        { columnName: 'fsmValue', dataType: 'FLOAT' },
        { columnName: 'popValue', dataType: 'INTEGER' },
        { columnName: 'displayNote', dataType: 'NVARCHAR(250)' },
        { columnName: 'upload', dataType: 'INTEGER DEFAULT (0)' },
        { columnName: 'addMore', dataType: 'BOOLEAN DEFAULT (0)' },
        { columnName: 'UNIQUE', dataType: '(shopId,displayDate,productId)' },
    ]
}
const historyDisplay = {
    tableName: 'historyDisplay',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'displayId', dataType: 'INTEGER' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'workDate', dataType: 'INTEGER' },
        { columnName: 'hDisplay', dataType: 'INTEGER' },
        { columnName: 'hPrice', dataType: 'DECIMAL' },
        { columnName: 'hFsmValue', dataType: 'DECIMAL' },
        { columnName: 'hStock', dataType: 'INTEGER' },
        { columnName: 'hSuggest', dataType: 'INTEGER' },
        { columnName: 'hArea', dataType: 'NVARCHAR(500)' },
        { columnName: 'hMockup', dataType: 'NVARCHAR(500)' },
        { columnName: 'hNoteProduct', dataType: 'NVARCHAR(500)' },
        { columnName: 'hNotePOP', dataType: 'NVARCHAR(500)' },
        { columnName: 'hTagPOPID', dataType: 'INTEGER' },
        { columnName: 'hQuantityPOP', dataType: 'INTEGER' },
        { columnName: 'hNamePOP', dataType: 'NVARCHAR(500)' },
        { columnName: 'hOOS', dataType: 'INTEGER' },
        { columnName: 'employeeId', dataType: 'INTEGER' }
    ]
}
const historyMarket = {
    tableName: 'historyMarket',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'surveyDisplayId', dataType: 'INTEGER' },
        { columnName: 'workDate', dataType: 'INTEGER' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'status', dataType: 'INTEGER' },
        { columnName: 'guiId', dataType: 'NVARCHAR(50)' },
        { columnName: 'note', dataType: 'NVARCHAR(500)' },
        { columnName: 'trafficId', dataType: 'INTEGER' },
        { columnName: 'noteTraffic', dataType: 'VARCHAR(500)' },
    ]
}
const displayAudit = {
    tableName: 'displayAudit',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'displayId', dataType: 'INTEGER' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'itemId', dataType: 'INTEGER' },
        { columnName: 'quanity', dataType: 'INTEGER' },
        { columnName: 'posmValue', dataType: 'NVARCHAR(250)' },
        { columnName: 'displayRef', dataType: 'NVARCHAR(250)' },
        { columnName: 'displaySubCat', dataType: 'NVARCHAR(150)' },
        { columnName: 'displayComment', dataType: 'NVARCHAR(500)' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'kpi1', dataType: 'INTEGER' },
        { columnName: 'kpi2', dataType: 'INTEGER' },
        { columnName: 'kpi3', dataType: 'INTEGER' },
        { columnName: 'kpi4', dataType: 'INTEGER' },
        { columnName: 'kpi4Name', dataType: 'NVARCHAR(90)' },
        { columnName: 'kpi7', dataType: 'INTEGER' },
        { columnName: 'target', dataType: 'INTEGER' },
        { columnName: 'havePack', dataType: 'NVARCHAR(25)' },
        { columnName: 'comment', dataType: 'NVARCHAR(500)' },
        { columnName: 'itemName', dataType: 'NVARCHAR(500)' },
        // {columnName:'PRIMARY',dataType:'KEY(workId)'},
    ]
}
const oos = {
    tableName: 'oos',
    tableFields: [
        { columnName: 'oosId', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'oos', dataType: 'INTEGER' },
        { columnName: 'quantity', dataType: 'INTEGER' },
        { columnName: 'oosFull', dataType: 'INTEGER' },
        { columnName: 'isUploaded', dataType: 'INTEGER' },
        { columnName: 'upload', dataType: 'INTEGER' }
    ]
}
const stockout = {
    tableName: 'stockout',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'quanity', dataType: 'INTEGER' },
        { columnName: 'displayType', dataType: 'INTEGER' },
        { columnName: 'displayRef', dataType: 'INTEGER' },
        { columnName: 'displayComment', dataType: 'NVARCHAR(500)' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'division', dataType: 'NVARCHAR(150)' },
        { columnName: 'subCategory', dataType: 'NVARCHAR(150)' },
        { columnName: 'subCatId', dataType: 'INTEGER' },
        { columnName: 'haveBusiness', dataType: 'INTEGER' },
        { columnName: 'UNIQUE', dataType: '(workId,productId)' },
    ]
}
const marketPriceResult = {
    tableName: 'marketPriceResult',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'priceValue', dataType: 'INTEGER' },
        { columnName: 'netValue', dataType: 'INTEGER' },
        { columnName: 'fsmValue', dataType: 'INTEGER' },
        { columnName: 'isUploaded', dataType: 'INTEGER' }
    ]
}

const historyMarketPrice = {
    tableName: 'historyMarketPrice',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'workDate', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'priceValue', dataType: 'VARCHAR(500)' },
        { columnName: 'netValue', dataType: 'VARCHAR(500)' },
        { columnName: 'fsmValue', dataType: 'VARCHAR(500)' }
    ]
}

const sellIn = {
    tableName: 'sellIn',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'workDate', dataType: 'INTEGER' },
        { columnName: 'orderNo', dataType: 'VARCHAR(50)' },
        { columnName: 'dealerId', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'quantityValue', dataType: 'INTEGER' },
        { columnName: 'priceValue', dataType: 'INTEGER' },
        { columnName: 'priceNPP', dataType: 'INTEGER' },
        { columnName: 'notes', dataType: 'NVARCHAR(500)' },
        { columnName: 'isUploaded', dataType: 'INTEGER' }
    ]
}

const installPOP = {
    tableName: 'installPOP',
    tableFields: [
        { columnName: 'Id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'wareHouseId', dataType: 'INTEGER' },
        { columnName: 'popId', dataType: 'INTEGER' },
        { columnName: 'popName', dataType: 'VARCHAR(100)' },
        { columnName: 'groupName', dataType: 'VARCHAR(100)' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'reasonId', dataType: 'INTEGER' },
        { columnName: 'reasonName', dataType: 'VARCHAR(100)' },
        { columnName: 'installQuantity', dataType: 'INTEGER' },
        { columnName: 'upload', dataType: 'INTEGER' }
    ]
}

const trackingDetailResult = {
    tableName: 'trackingDetailResult',
    tableFields: [
        { columnName: 'Id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'itemId', dataType: 'INTEGER' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'trackingId', dataType: 'INTEGER' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'category_viVN', dataType: 'VARCHAR(100)' },
        { columnName: 'subCatId', dataType: 'INTEGER' },
        { columnName: 'subCategory', dataType: 'VARCHAR(100)' },
        { columnName: 'refName', dataType: 'VARCHAR(100)' },
        { columnName: 'display', dataType: 'INTEGER' },
        { columnName: 'price', dataType: 'INTEGER' },
        { columnName: 'textValue', dataType: 'NVARCHAR(500)' },
        { columnName: 'yesNo', dataType: 'INTEGER' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'note', dataType: 'NVARCHAR(500)' },
        { columnName: 'refId', dataType: 'INTEGER' },
        { columnName: 'oldDisplay', dataType: 'INTEGER' },
        { columnName: 'oldTrackingDisplayId', dataType: 'INTEGER' },
        { columnName: 'oldEmployeeId', dataType: 'INTEGER' },
        { columnName: 'isChangeValue', dataType: 'INTEGER' },
        { columnName: 'isCheckValue', dataType: 'INTEGER' },
    ]
}

const trackingDetailHistory = {
    tableName: 'trackingDetailHistory',
    tableFields: [
        { columnName: 'Id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'itemId', dataType: 'INTEGER' },
        { columnName: 'workDate', dataType: 'INTEGER' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'display', dataType: 'INTEGER' },
        { columnName: 'price', dataType: 'INTEGER' },
        { columnName: 'oldTrackingDisplayId', dataType: 'INTEGER' },
        { columnName: 'oldEmployeeId', dataType: 'INTEGER' }
    ]
}

const shopProfileResult = {
    tableName: 'shopProfileResult', tableFields: [
        { columnName: 'Id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'shopProfileId', dataType: 'INTEGER' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'competitorName', dataType: 'NVARCHAR(250)' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'categoryName', dataType: 'VARCHAR(250)' },
        { columnName: 'categoryType', dataType: 'NVARCHAR(250)' },
        { columnName: 'itemId', dataType: 'INTEGER' },
        { columnName: 'itemNameVN', dataType: 'NVARCHAR(250)' },
        { columnName: 'textValue', dataType: 'INTEGER' },
        { columnName: 'numberValue', dataType: 'INTEGER' },
        { columnName: 'decimalValue', dataType: 'INTEGER' },
        { columnName: 'dateValue', dataType: 'INTEGER' },
        { columnName: 'yearValue', dataType: 'INTEGER' },
        { columnName: 'selectValue', dataType: 'INTEGER' },
        { columnName: 'functionInput', dataType: 'INTEGER' },

        { columnName: 'textVal', dataType: 'INTEGER' },
        { columnName: 'numberVal', dataType: 'INTEGER' },
        { columnName: 'decimalVal', dataType: 'INTEGER' },
        { columnName: 'dateVal', dataType: 'NVARCHAR(250)' },
        { columnName: 'yearVal', dataType: 'INTEGER' },
        { columnName: 'selectVal', dataType: 'INTEGER' },
        { columnName: 'note', dataType: 'NVARCHAR(500)' },
        { columnName: 'guiId', dataType: 'VARCHAR(32)' },
    ]
}

const ShelfPGResult = {
    tableName: 'ShelfPGResult', tableFields: [
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'upload', dataType: 'INTEGER' },
        { columnName: 'trackingId', dataType: 'INTEGER' },
        { columnName: 'idItem', dataType: 'INTEGER' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'competitorName', dataType: 'NVARCHAR(250)' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'category_viVN', dataType: 'NVARCHAR(250)' },
        { columnName: 'pgvalue', dataType: 'INTEGER' },
        { columnName: 'shelfvalue', dataType: 'INTEGER' },
    ]
}
const posmResult = {
    tableName: 'posmResult', tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'reportDate', dataType: 'INTEGER' },
        { columnName: 'itemId', dataType: 'INTEGER' },
        { columnName: 'posmValue', dataType: 'INTEGER' },
        { columnName: 'posmNote', dataType: 'NVARCHAR(125)' },
        { columnName: 'upload', dataType: 'INTEGER DEFAULT(0)' },
    ]
}
const posmByShop = {
    tableName: 'posmByShop', tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'reportDate', dataType: 'INTEGER' },
        { columnName: 'productId', dataType: 'INTEGER' },
        { columnName: 'displayValue', dataType: 'INTEGER' },
        { columnName: 'quantityStock', dataType: 'INTEGER' },
        { columnName: 'priceValue', dataType: 'DECIMAL' },
        { columnName: 'posmList', dataType: 'NVARCHAR(4000)' },
        { columnName: 'posmNote', dataType: 'NVARCHAR(4000)' },
        { columnName: 'addMore', dataType: 'BOOLEAN DEFAULT (0)' },
        { columnName: 'upload', dataType: 'INTEGER DEFAULT(0)' },
    ]
}

const surveyDisplayItem = {
    tableName: 'surveyDisplayItem', tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'reportDate', dataType: 'INTEGER' },
        { columnName: 'issueDisplay', dataType: 'NVARCHAR(250)' },
        { columnName: 'displayItemName', dataType: 'NVARCHAR(250)' },
        { columnName: 'note', dataType: 'NVARCHAR(250)' },
        { columnName: 'guiId', dataType: 'VARCHAR(32)' },
        { columnName: 'upload', dataType: 'INTEGER DEFAULT(0)' },
    ]
}
const trackingSellOut = {
    tableName: 'trackingSellOut', tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'workId', dataType: 'INTEGER' },
        { columnName: 'workdate', dataType: 'INTEGER' },
        { columnName: 'competitorId', dataType: 'INTEGER' },
        { columnName: 'competitorName', dataType: 'NVARCHAR(250)' },
        { columnName: 'categoryId', dataType: 'INTEGER' },
        { columnName: 'categoryName', dataType: 'NVARCHAR(250)' },
        { columnName: 'quantity', dataType: 'INTEGER' },
        { columnName: 'amount', dataType: 'DECIMAL' },
        { columnName: 'upload', dataType: 'INTEGER DEFAULT(0)' },
    ]
}
const mobileRaw = {
    tableName: 'mobileRaw',
    tableFields: [
        { columnName: 'id', dataType: 'INTEGER PRIMARY KEY' },
        { columnName: 'shopId', dataType: 'INTEGER' },
        { columnName: 'reportId', dataType: 'INTEGER' },
        { columnName: 'reportDate', dataType: 'INTEGER' },
        { columnName: 'jsonData', dataType: 'TEXT' },
        { columnName: 'jsonPhoto', dataType: 'TEXT' },
        { columnName: 'isUploaded', dataType: 'INTEGER' }
    ]
}
export { trackingSellOut, surveyDisplayItem, posmByShop, sellOutResult, displayByShop, posmResult, trackingDetailResult, trackingDetailHistory, photos, workResults, sellOut, display, displayCompetitor, displayAudit, promotion, promotionPrice, market, historyDisplay, historyMarket, oos, stockout, marketPriceResult, historyMarketPrice, sellIn, installPOP, shopProfileResult, ShelfPGResult, mobileRaw }
