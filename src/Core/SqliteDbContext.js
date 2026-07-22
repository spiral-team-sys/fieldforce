import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    storeList, products, masterList, mobileKPIList, trackingCompetitor, competitor, regions, dealer, trackingDetail,
    promotionList, oosHistory, displayHistory, shopFormat, auditDisplayItems, messenger, stockHistory,
    posm, menulist, shopProfile, displayTarget, taskList, posmGuid, capacity,
    taskListHistory
} from './Table';
import {
    photos, workResults, sellOut, display, displayCompetitor, displayAudit, promotion, market, historyDisplay,
    historyMarket, oos, stockout, marketPriceResult, historyMarketPrice, sellIn,
    trackingDetailResult, shopProfileResult, ShelfPGResult, displayByShop, installPOP, posmResult, posmByShop,
    sellOutResult, trackingDetailHistory, promotionPrice, surveyDisplayItem, trackingSellOut, mobileRaw
} from './TableLocal';
import { openDatabase } from 'react-native-sqlite-storage';
import { AppNameBuild, psvApp } from './URLs';
let SQLite = require('react-native-sqlite-storage');
// SQLite.DEBUG(true);
SQLite.enablePromise(true);
async function getEmplyeeId() {
    var EmployeeId = await AsyncStorage.getItem("EmployeeId");
    return EmployeeId;
}
export const CreateDb = async (EmployeeId) => {
    try {
        const dbName = (AppNameBuild == psvApp ? "pns_" : "data_") + EmployeeId + ".db"
        await openDatabase(dbName, "1.0", "Database", 200000, openCB, errorCB).then(async (db) => {
            await CreateTable(db);
        })
    } catch (err) {
        console.log(err, "create db");
    }
}
async function CreateTable(db) {
    await _createTable(db, sellOutResult)
    await _createTable(db, posmGuid)
    await _createTable(db, posmByShop);
    await _createTable(db, taskList);
    await _createTable(db, menulist);
    await _createTable(db, storeList)
    await _createTable(db, products);
    await _createTable(db, mobileKPIList)
    await _createTable(db, masterList);
    await _createTable(db, regions);
    await _createTable(db, trackingCompetitor);
    await _createTable(db, trackingDetail);
    await _createTable(db, promotionList);
    await _createTable(db, oosHistory);
    await _createTable(db, displayHistory);
    await _createTable(db, stockHistory);
    await _createTable(db, shopFormat);
    await _createTable(db, competitor);
    await _createTable(db, dealer);
    await _createTable(db, posm);
    await _createTable(db, shopProfile);
    await _createTable(db, displayTarget)

    //db local
    await _createTable(db, posmResult);
    await _createTable(db, workResults);
    await _createTable(db, photos);
    await _createTable(db, sellOut);
    await _createTable(db, displayCompetitor);
    await _createTable(db, display);
    await _createTable(db, auditDisplayItems);
    await _createTable(db, displayAudit);
    await _createTable(db, promotion);
    await _createTable(db, market);
    await _createTable(db, messenger);
    await _createTable(db, historyDisplay);
    await _createTable(db, historyMarket);
    await _createTable(db, oos);
    await _createTable(db, stockout);
    await _createTable(db, marketPriceResult);
    await _createTable(db, historyMarketPrice);
    await _createTable(db, sellIn);
    await _createTable(db, trackingDetailResult);
    await _createTable(db, shopProfileResult);
    await _createTable(db, ShelfPGResult);
    await _createTable(db, displayByShop);
    await _createTable(db, installPOP);
    await _createTable(db, trackingDetailHistory);
    await _createTable(db, promotionPrice);
    await _createTable(db, surveyDisplayItem);
    await _createTable(db, trackingSellOut)
    await _createTable(db, capacity);
    await _createTable(db, mobileRaw);
    await _createTable(db, trackingSellOut);
    await _createTable(db, posmGuid);

    await db.close();
}
export async function addColumm() {

}
function errorCB(err) {
    console.log("SQL Error: " + err);
}
function successInfo(value) {
    console.log(value);
}
const errorInfo = (name, err) => {
    console.log(name, err);
}
export async function exeSqlNoQuery(db, sqlStr) {
    try {
        await db.transaction(tx => {
            tx.executeSql(sqlStr);
        });
        return 1
    } catch (err) {
        //console.log("excute no query", err);
        return 0;
    }
}
export const UpGradeDB = async () => {
    const db = await Store();

    await _createTable(db, taskListHistory);

    await AddColum(display, "oldEmployeeId", "INTEGER")
    await AddColum(display, "oldQuantity", "INTEGER")
    await AddColum(display, "OldDisplayId", "INTEGER")
    await AddColum(display, "isChangeValue", "INTEGER")
    await AddColum(display, "isCheckValue", "INTEGER")
    await AddColum(display, "OOS", "INTEGER")

    await AddColum(trackingDetailResult, "oldDisplay", "INTEGER")
    await AddColum(trackingDetailResult, "oldTrackingDisplayId", "INTEGER")
    await AddColum(trackingDetailResult, "oldEmployeeId", "INTEGER")
    await AddColum(trackingDetailResult, "isChangeValue", "INTEGER")
    await AddColum(trackingDetailResult, "isCheckValue", "INTEGER")

    await AddColum(trackingDetailHistory, "oldTrackingDisplayId", "INTEGER")
    await AddColum(trackingDetailHistory, "oldEmployeeId", "INTEGER")

    await AddColum(displayCompetitor, "competitorOrderBy", "INTEGER")

    await AddColum(historyDisplay, "hQuantityPOP", "INTEGER")
    await AddColum(historyDisplay, "hNamePOP", "NVARCHAR(500)")
    await AddColum(historyDisplay, "displayId", "INTEGER")
    await AddColum(historyDisplay, "employeeId", "INTEGER")
    await AddColum(historyDisplay, "hOOS", "INTEGER")

    await AddColum(menulist, "isAnotherRoute", "INTEGER")
    await AddColum(storeList, "openYear", "INTEGER")
    await AddColum(storeList, "newRegionId", "INTEGER")

    await AddColum(sellOut, "deposit", "TEXT")
    await AddColum(sellOut, "billCode", "NVARCHAR(500)")

    await AddColum(menulist, 'groupReport', 'NVARCHAR(64)')
    await AddColum(menulist, 'sortGroup', 'INTEGER')

    await AddColum(taskList, 'workDate', 'INTEGER')
}
export const AddColum = async (table, columnName, columnType) => {
    const sql = "PRAGMA table_info(" + table.tableName + ")"
    const { res } = await QueryStringSql(sql);
    if (Array.isArray(res) && res.length > 0) {
        let exists = await res.filter(item => item.name === columnName);
        if (Array.isArray(exists) && exists.length === 0) {
            const sql = `ALTER TABLE ${table.tableName} ADD ${columnName} ${columnType}`
            // console.log(sql)
            await QueryStringSql(sql);
        }
    }
}

function openCB() {
    // console.log("Database OPENED");
}
export async function exeSql(db, sqlStr) {
    // //console.log('excute: ' + sqlStr);
    return await db.executeSql(sqlStr)
        .then((res) => {
            if (res && res[0] && res[0].rows) {
                const queryResult = [];
                const len = res[0].rows.length;
                for (let i = 0; i < len; i++) {
                    queryResult.push(res[0].rows.item(i));
                }
                return { res: queryResult };
            }
            return { res };
        })
        .catch((err) => {
            return { err };
        });
}
export function lCFirst(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}
export async function InsertItems(db, tableName, items) {
    try {
        var format = /[']/;
        let columnsHad = [];
        const sql = "PRAGMA table_info(" + tableName + ")"
        const { res, err } = await exeSql(db, sql);
        res.map(it => it.name !== '' && columnsHad.push(lCFirst(it.name)));
        // console.log('RRR ', columnsHad)

        if (!tableName || !items) throw new Error('Required parameter missing');
        if (typeof tableName !== 'string') throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
        if (!Array.isArray(items)) throw new Error(`Parameter items expects array but ${typeof items}`);
        const sqlStrArr = items.map((item) => {
            const columns = Object.keys(item);
            let sqlStr = columns.reduce((sqlSegment, columnName, index, arr) => (
                `${sqlSegment} ${columnsHad.includes(lCFirst(columnName)) ? columnName : ''} ${index + 1 === arr.length ? ')' : columnsHad.includes(lCFirst(columns[index + 1])) ? ',' : ''}`
            ), `INSERT INTO ${tableName} (`);
            sqlStr += columns.reduce((sqlSegment, columnName, index, arr) => (
                `${sqlSegment} ${columnsHad.includes(lCFirst(columnName)) ?
                    typeof item[columnName] !== 'number' ? `'${(format.test(item[columnName]) ? item[columnName].replaceAll("'", "''") : item[columnName])}'` : item[columnName] : ''} ${index + 1 === arr.length ? ');' : columnsHad.includes(lCFirst(columns[index + 1])) ? ',' : ''}`
            ), ' VALUES (');

            return sqlStr;
        });
        return await db.sqlBatch(sqlStrArr)
            .then((res) => {
                successInfo('insertItemsBatch');
                return { res: res || ['success'] };
            })
            .catch((err) => {
                errorInfo('insertItemsBatch', err);
                return { err };
            });
    } catch (err) {
        return { err };
    }
}
export async function DropTable(db, tableName) {
    try {
        if (!tableName) throw new Error('Required parameter missing');
        return await db.executeSql(`DROP TABLE ${tableName};`)
            .then((res) => {
                successInfo('dropTable');
                return { res };
            })
            .catch((err) => {
                errorInfo('dropTable', err);
                return { err };
            });
    } catch (err) {
        return { err };
    }
}
export async function SelectItemsClause(db, tableName, columns, condition, clause, pagination, perPageNum) {
    try {
        if (!tableName || !columns) throw new Error('Required parameter missing');
        if (typeof tableName !== 'string') throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
        if (!Array.isArray(columns) && columns !== '*') {
            throw new Error(`Parameter columns expects Array or '*' but ${Object.prototype.toString.call(columns)}`);
        }
        let sqlStr;
        if (columns === '*') {
            if (condition && typeof condition === 'object') {
                const conditionKeys = Object.keys(condition);
                sqlStr = conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`
                ), `SELECT * FROM ${tableName} WHERE`);
            } else {
                sqlStr = `SELECT * FROM ${tableName}`;
            }
        } else {
            sqlStr = columns.reduce((sqlSegment, column, index, arr) => (
                `${sqlSegment} ${column} ${index + 1 !== arr.length ? ',' : ''}`
            ), 'SELECT');
            if (condition && typeof condition === 'object') {
                const conditionKeys = Object.keys(condition);
                sqlStr += conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`
                ), ` FROM ${tableName} WHERE`);
            } else {
                sqlStr += ` FROM ${tableName}`;
            }
        }

        if (typeof clause === "string" && clause !== "") {
            sqlStr += clause;
        }

        if (pagination && perPageNum) {
            const limit = pagination * perPageNum;
            const offset = perPageNum * (pagination - 1) > 0 ? perPageNum * (pagination - 1) : 0;
            sqlStr += ` limit ${limit} offset ${offset};`;
        } else {
            sqlStr += ';';
        }

        // alert("sqlStr =",sqlStr);

        // console.log(sqlStr);

        return await db.executeSql(sqlStr)
            .then((res) => {
                if (res && res[0] && res[0].rows) {
                    const queryResult = [];
                    const len = res[0].rows.length;
                    for (let i = 0; i < len; i++) {
                        queryResult.push(res[0].rows.item(i));
                    }
                    return { res: queryResult };
                }
                return { res };
            })
            .catch((err) => {
                return { err };
            });
    } catch (err) {
        return { err };
    }
}
export async function SelectItems(db, tableName, columns, condition, pagination, perPageNum) {
    try {
        if (!tableName || !columns) throw new Error('Required parameter missing');
        if (typeof tableName !== 'string') throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
        if (!Array.isArray(columns) && columns !== '*') {
            throw new Error(`Parameter columns expects Array or '*' but ${Object.prototype.toString.call(columns)}`);
        }
        let sqlStr;
        if (columns === '*') {
            if (condition && typeof condition === 'object') {
                const conditionKeys = Object.keys(condition);
                sqlStr = conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`
                ), `SELECT * FROM ${tableName} WHERE`);
            } else {
                sqlStr = `SELECT * FROM ${tableName}`;
            }
        } else {
            sqlStr = columns.reduce((sqlSegment, column, index, arr) => (
                `${sqlSegment} ${column} ${index + 1 !== arr.length ? ',' : ''}`
            ), 'SELECT');
            if (condition && typeof condition === 'object') {
                const conditionKeys = Object.keys(condition);
                sqlStr += conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`
                ), ` FROM ${tableName} WHERE`);
            } else {
                sqlStr += ` FROM ${tableName}`;
            }
        }
        if (pagination && perPageNum) {
            const limit = pagination * perPageNum;
            const offset = perPageNum * (pagination - 1) > 0 ? perPageNum * (pagination - 1) : 0;
            sqlStr += ` limit ${limit} offset ${offset};`;
        } else {
            sqlStr += ';';
        }

        return await db.executeSql(sqlStr)
            .then((res) => {
                if (res && res[0] && res[0].rows) {
                    const queryResult = [];
                    const len = res[0].rows.length;
                    for (let i = 0; i < len; i++) {
                        queryResult.push(res[0].rows.item(i));
                    }
                    return { res: queryResult };
                }
                return { res };
            })
            .catch((err) => {
                return { err };
            });
    } catch (err) {
        //console.log(err);
        return { err };
    }
}
export async function _createTable(db, tableInfo) {
    try {
        const { tableName, tableFields } = tableInfo;
        const sqlStr = tableFields.reduce((sqlSegment, field, index, arr) => (
            `${sqlSegment} ${field.columnName} ${field.dataType} ${index + 1 === arr.length ? ');' : ','}`
        ), `CREATE TABLE IF NOT EXISTS ${tableName}(`);
        //
        // console.log(sqlStr,'createTable')
        return await db.executeSql(sqlStr)
            .then(() => {

                successInfo('createTable');
                // return { res };
            })
            .catch((err) => {
                errorInfo('errTable', err);
                // return { err };
            });
    } catch (err) {
        //console.log(err)
        return { err };
    }
}
export async function DeleteItem(db, tableName, condition) {
    try {
        if (!tableName) throw new Error('Required parameter missing');
        let sqlStr;
        if (condition && typeof condition === 'object') {
            const conditionKeys = Object.keys(condition);
            sqlStr = conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ';'}`
            ), `DELETE FROM ${tableName} WHERE`);
        } else {
            sqlStr = `DELETE FROM ${tableName};`;
        }
        return await db.executeSql(sqlStr)
            .then((res) => {
                return { res };
            })
            .catch((err) => {
                return { err };
            });
    } catch (err) {
        return { err };
    }
}
export async function createTableNow(db, tableInfo) {
    try {
        const { tableName, tableFields } = tableInfo;
        const sqlStr = tableFields.reduce((sqlSegment, field, index, arr) => (
            `${sqlSegment} ${field.columnName} ${field.dataType} ${index + 1 === arr.length ? ');' : ','}`
        ), `CREATE TABLE IF NOT EXISTS ${tableName}(`);
        //
        return await db.executeSql(sqlStr)
            .then((res) => {
                successInfo('createTable');
                return { res };
            })
            .catch((err) => {
                errorInfo('createTable', err);
                return { err };
            });
    } catch (err) {
        return { err };
    }
}
export async function Store() {
    let dbName = await getEmplyeeId();
    const databaseName = (AppNameBuild == psvApp ? "pns_" : "data_") + dbName + ".db"
    try {
        await openDatabase({ name: databaseName, location: 'default' }).then(db => { SQLite = db; })
    } catch (error) {
        //console.log('database haved opxen:' + error);
    }
    return SQLite
}
export async function UpdateItem(db, tableName, item, condition) {
    try {
        if (!tableName || !item) throw new Error('Required parameter missing');
        if (typeof tableName !== 'string') {
            throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
        }
        if (Object.prototype.toString.call(item) !== '[object Object]') {
            throw new Error(`Parameter item expects object but ${Object.prototype.toString.call(item)}`);
        }
        const columns = Object.keys(item);
        let sqlStr;
        sqlStr = columns.reduce((sqlSegment, columnName, index, arr) => (
            `${sqlSegment} ${columnName}=${typeof item[columnName] !== 'number' ? `'${item[columnName]}'` : item[columnName]} ${index + 1 !== arr.length ? ',' : ''}`
        ), `UPDATE ${tableName} SET`);
        if (condition && typeof condition === 'object') {
            const conditionKeys = Object.keys(condition);
            sqlStr += conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ';'}`
            ), ' WHERE');
        } else sqlStr += ';';
        return await db.executeSql(sqlStr)
            .then((res) => {
                return { res };
            })
            .catch((err) => {
                return { err };
            });
    } catch (err) {
        return { err };
    }
}
//new ver
const QueryBuild = (columns, tableName) => {
    // console.log(tableName,"QueryBuild")
    let parameter = [];
    columns.forEach(p => {
        parameter.push('?');
    })
    let queryString = `INSERT INTO ${tableName}(${columns.toString()})VALUES(${parameter.toString()})`
    return queryString;
}
export const Insert = async (tableInfo, items) => {// Cai thien toc do save
    const db = await Store();

    try {
        if (!Array.isArray(tableInfo.tableFields)) throw new Error(`Parameter items expects array but ${typeof tableInfo}`);
        if (!Array.isArray(items)) throw new Error(`Parameter items expects array but ${typeof items}`);

        let columns = tableInfo.tableFields.map(cols => cols.columnName);

        // Remove Primary Key and Unique Key if present
        columns = columns.filter(col => col !== 'PRIMARY' && col !== 'UNIQUE');

        let stringSql = await QueryBuild(columns, tableInfo.tableName);
        let rowsAffected = 0;

        // Start a single transaction for all inserts
        await db.transaction(async (tx) => {
            const insertPromises = items.map(rowdata => {
                let rowItem = columns.map(colName => rowdata[colName] === undefined ? null : rowdata[colName]);
                return new Promise((resolve, reject) => {
                    tx.executeSql(stringSql, rowItem, (tx, results) => {
                        rowsAffected += results.rowsAffected;
                        resolve(results);
                    }, (error) => {
                        reject(error);
                    });
                });
            });

            // Wait for all inserts to complete
            await Promise.all(insertPromises);
        });
        return rowsAffected;
    } catch (err) {
        console.log(`Error InsertItems: ${err}`);
        errorInfo('Error InsertItems: ' + tableInfo?.tableName, err);
        return { err };
    }
};
export const Insert_noUse = async (tableInfo, items) => {
    const db = await Store();
    await console.log(tableInfo.tableName, 'Start-', Date.now())
    try {
        // if (!tableName || !items) throw new Error('Required parameter missing');
        if (!Array.isArray(tableInfo.tableFields)) throw new Error(`Parameter items expects array but ${typeof tableInfo}`);
        if (!Array.isArray(items)) throw new Error(`Parameter items expects array but ${typeof items}`);
        let columns = await tableInfo.tableFields.map(cols => cols.columnName)
        // Remove Primary Key
        if (columns[columns.length - 1] === 'PRIMARY') {
            columns.pop("PRIMARY");
        }
        //Remove UNIQUE Key
        if (columns[columns.length - 1] === 'UNIQUE')
            columns.pop("UNIQUE");
        // console.log(columns, "column name");
        let stringSql = await QueryBuild(columns, tableInfo.tableName);
        let rowsAffected = 0;
        await items.forEach(rowdata => {
            let rowItem = []
            columns.forEach((colName) => {
                // console.log(rowdata[colName], colName);
                rowItem.push(rowdata[colName] === undefined ? null : rowdata[colName])
            });
            db.transaction((tx) => {
                tx.executeSql(stringSql, rowItem, (tx, results) => {
                    rowsAffected += results.rowsAffected;
                    // console.log(stringSql, rowItem, "roweffect");
                });
            }).catch((err) => {
                console.log(err, `Insert ${tableInfo.tableName || 'khong tim thay bang'}`)
            })
        });
        await console.log(tableInfo.tableName, 'End-', Date.now())
    } catch (err) {
        console.log(`Error InsertItems: ${err}`)
        errorInfo('Error InsertItems: ' + tableInfo?.tableName, err);
        return { err };
    }

}
export const Update = async (tableInfo, items, primaryKey) => {
    const db = await Store();
    try {
        if (!Array.isArray(tableInfo.tableFields)) throw new Error(`Parameter tableFields expects array but ${typeof tableInfo.tableFields}`);
        if (!Array.isArray(items)) throw new Error(`Parameter items expects array but ${typeof items}`);
        if (typeof primaryKey !== 'string') throw new Error(`Parameter primaryKey expects string but ${typeof primaryKey}`);

        let columns = tableInfo.tableFields.map(cols => cols.columnName);

        // Remove Primary and Unique Keys if present
        if (columns[columns.length - 1] === 'PRIMARY') {
            columns.pop();
        }
        if (columns[columns.length - 1] === 'UNIQUE') {
            columns.pop();
        }

        let rowsAffected = 0;

        for (let rowdata of items) {
            let setClause = columns.map(col => `${col} = ?`).join(', ');
            let stringSql = `UPDATE ${tableInfo.tableName} SET ${setClause} WHERE ${primaryKey} = ?`;

            let rowItem = columns.map(colName => rowdata[colName] === undefined ? null : rowdata[colName]);
            rowItem.push(rowdata[primaryKey]);

            try {
                await db.transaction((tx) => {
                    tx.executeSql(stringSql, rowItem, (tx, results) => {
                        rowsAffected += results.rowsAffected;
                    });
                });
            } catch (err) {
                console.log(err, `Update ${tableInfo.tableName || 'unknown table'}`);
            }
        }

        return { rowsAffected };
    } catch (err) {
        console.log(err);
        errorInfo('Error UpdateItems: ' + tableInfo?.tableName, err);
        return { err };
    }
};
export const GetdbId = async () => {
    let dbName = await getEmplyeeId();
    const databaseName = (AppNameBuild == psvApp ? "pns_" : "data_") + dbName + ".db"
    return dbName !== null ? databaseName : "tempdata.db"
}
export const DeleteAll = async (TableInfo) => {
    try {
        const db = await Store()
        return await db.transaction(tx => {
            tx.executeSql(`DELETE FROM ${TableInfo.tableName};`)
            //? console.log(`DELETE FROM ${TableInfo.tableName};`)
        }).then((res) => {
            successInfo('Deleted Success ' + TableInfo.tableName);
            return { res };
        }).catch((err) => {
            errorInfo('Deleted', err);
            return { err };
        });
    } catch (err) {
        errorInfo('Err Deleted ALL ', err);
        return { err };
    }
}
export const Selects = async (tableName, columns, condition, pagination, perPageNum) => {
    const dbName = await GetdbId();
    const db = await openDatabase({ name: dbName });
    try {
        if (!tableName || !columns) throw new Error('Required parameter missing');
        if (typeof tableName !== 'string') throw new Error(`Parameter tableName expects string but ${typeof tableName}`);
        if (!Array.isArray(columns) && columns !== '*') {
            throw new Error(`Parameter columns expects Array or '*' but ${Object.prototype.toString.call(columns)}`);
        }
        let sqlStr;
        if (columns === '*') {
            if (condition && typeof condition === 'object') {
                const conditionKeys = Object.keys(condition);
                sqlStr = conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`
                ), `SELECT * FROM ${tableName} WHERE`);
            } else {
                sqlStr = `SELECT * FROM ${tableName}`;
            }
        } else {
            sqlStr = columns.reduce((sqlSegment, column, index, arr) => (
                `${sqlSegment} ${column} ${index + 1 !== arr.length ? ',' : ''}`
            ), 'SELECT');
            if (condition && typeof condition === 'object') {
                const conditionKeys = Object.keys(condition);
                sqlStr += conditionKeys.reduce((sqlSegment, conditionKey, index, arr) => (
                    `${sqlSegment} ${conditionKey}=${typeof condition[conditionKey] !== 'number' ? `'${condition[conditionKey]}'` : condition[conditionKey]} ${index + 1 !== arr.length ? 'AND' : ''}`
                ), ` FROM ${tableName} WHERE`);
            } else {
                sqlStr += ` FROM ${tableName}`;
            }
        }
        if (pagination && perPageNum) {
            const limit = pagination * perPageNum;
            const offset = perPageNum * (pagination - 1) > 0 ? perPageNum * (pagination - 1) : 0;
            sqlStr += ` limit ${limit} offset ${offset};`;
        } else {
            sqlStr += ';';
        }

        return await db.executeSql(sqlStr)
            .then((res) => {
                if (res && res[0] && res[0].rows) {
                    const queryResult = [];
                    const len = res[0].rows.length;
                    for (let i = 0; i < len; i++) {
                        queryResult.push(res[0].rows.item(i));
                    }
                    return { res: queryResult };
                }
                return { res };
            })
            .catch((err) => {
                return { err };
            });
    } catch (err) {
        console.log(err);
        return { err };
    }
}
export const QueryStringSql = async (sqlStr) => {
    const dbName = await GetdbId();
    const db = await openDatabase({ name: dbName });
    return await db.executeSql(sqlStr)
        .then((res) => {
            if (res && res[0] && res[0].rows) {
                const queryResult = [];
                const len = res[0].rows.length;
                for (let i = 0; i < len; i++) {
                    queryResult.push(res[0].rows.item(i));
                }
                return { res: queryResult };
            }
            return { res };
        })
        .catch((err) => {
            console.log(err, sqlStr, 'error')
            return { err };
        })
}
export const replaceQueryString = (sql, objData, arrKey) => {
    for (let i = 0, lenArr = arrKey.length; i < lenArr; i++) {
        let reg = new RegExp(`@${arrKey[i]}`, "g")
        const value = objData[arrKey[i]]
        sql = sql.replace(reg, value === 0 ? 0 : value || null)
    }
    return sql
}
export const openDatabaseLocal = async (userinfo) => {
    try {
        const databaseName = (AppNameBuild == psvApp ? "pns_" : "data_") + userinfo?.employeeId + ".db"
        const db = await openDatabase({ name: databaseName, location: 'default' });
        return db;
    } catch (error) {
        console.log('Error:', error);
        return null;
    }
};
export const closeDatabase = (db) => {
    db.close()
}
