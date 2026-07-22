import { fetchGet, getDeviceInfo, GetToken } from "../Core/Helper";
import { URLDEFAULT, URL_DOWNLOAD, URL_DOWNLOAD_HISTORY_DISPLAY, URL_DOWNLOAD_HISTORY_MARKET, URL_DOWNLOAD_PRODUCT } from "../Core/URLs";
import { Insert, DeleteAll, UpGradeDB, QueryStringSql } from "../Core/SqliteDbContext";
import { auditDisplayItems, competitor, dealer, displayHistory, displayTarget, masterList, menulist, mobileKPIList, posm, posmGuid, products, promotionList, regions, shopFormat, shopProfile, stockHistory, storeList, taskList, trackingCompetitor, trackingDetail } from '../Core/Table'
import { historyDisplay, historyMarket, trackingDetailHistory } from "../Core/TableLocal";
import DeviceInfo from 'react-native-device-info';
import { Platform } from "react-native";
import { checkNetwork, isNetworkConnection, TODAY } from "../Core/Utility";
import { deleteHistoryDisplayByShop, getHistoryDisplayByShop } from "./DisplayController";
import moment from "moment";
import { ATTENDANT_API } from "../API/AttendantAPI";
import { CountProduct } from "./ProductController";
import { APPCHECK } from "../Utils/Firebase/Messaging/firebaseMessaging";
export const downloadAll = async (actionResult) => {
    const connected = await isNetworkConnection()
    if (connected) {
        try {
            //Upgrade db
            await UpGradeDB();
            await PostDeviceInfo()
            var data = await fetchGet(URL_DOWNLOAD);
            if (data.statusId == 500) {
                await actionResult(data.messager)
                return
            }

            var dataHistoryDisplay = await fetchGet(URL_DOWNLOAD_HISTORY_DISPLAY);
            // var dataHistoryMarket = await fetchGet(URL_DOWNLOAD_HISTORY_MARKET);
            const countProduct = await CountProduct();
            await PostDeviceInfo()
            await Promise.all([data, dataHistoryDisplay, countProduct]).then(async result => {
                await DeleteAll(competitor).then(async () => {
                    await Insert(competitor, data?.competitor || []);
                })
                await DeleteAll(dealer).then(async () => {
                    await Insert(dealer, data?.dealer || []);
                })
                await DeleteAll(displayHistory).then(async () => {
                    await Insert(displayHistory, data?.displayHistory || []);
                })
                await DeleteAll(historyDisplay).then(async () => {
                    await Insert(historyDisplay, dataHistoryDisplay || []);
                })
                await DeleteAll(stockHistory).then(async () => {
                    await Insert(stockHistory, data?.stockHistory || []);
                })
                await DeleteAll(trackingCompetitor).then(async () => {
                    await Insert(trackingCompetitor, data?.trackingCompetitor || []);
                })
                await DeleteAll(promotionList).then(async () => {
                    await Insert(promotionList, data?.promotionList || []);
                })
                await DeleteAll(shopFormat).then(async () => {
                    await Insert(shopFormat, data?.shopFormat || []);
                })
                await DeleteAll(auditDisplayItems).then(async () => {
                    await Insert(auditDisplayItems, data?.auditDisplayItems || []);
                })
                // await DeleteAll(historyMarket).then(async () => {
                //     await Insert(historyMarket, dataHistoryMarket || []);
                // })
                await DeleteAll(posm).then(async () => {
                    // console.log(data?.posm,"S")
                    await Insert(posm, data?.posm || []);
                })
                await DeleteAll(mobileKPIList).then(async () => {
                    await Insert(mobileKPIList, data?.mobileKPIList || []);
                })
                const shops = await data?.storeList || []
                await DeleteAll(storeList).then(async (d) => {
                    // console.log(d, "storeList")
                    await Insert(storeList, shops);
                })
                await DeleteAll(masterList).then(async (d) => {
                    // console.log(d, "masterList")
                    await Insert(masterList, data?.masterList || []);
                })
                if (countProduct !== 0 && countProduct === await data?.products?.length)
                    console.log("no update new product ", countProduct)
                else
                    await DeleteAll(products).then(async (d) => {
                        // console.log(d, "products")
                        await Insert(products, data?.products || []);
                    })
                await DeleteAll(regions).then(async () => {
                    await Insert(regions, data?.regions || []);
                })
                await DeleteAll(trackingDetail).then(async () => {
                    await Insert(trackingDetail, data?.trackingDetail || []);
                })
                await DeleteAll(shopProfile).then(async () => {
                    await Insert(shopProfile, data?.shopProfiles || []);
                })
                await DeleteAll(displayTarget).then(async () => {
                    await Insert(displayTarget, data?.displayTarget || []);
                })
                await DeleteAll(taskList).then(async () => {
                    // console.log(data?.taskList, "taskList")
                    await Insert(taskList, data?.taskList || []);
                })
                await DeleteAll(posmGuid).then(async () => {
                    await Insert(posmGuid, data?.posmGuid || []);
                })
                await DeleteAll(trackingDetailHistory).then(async () => {
                    await Insert(trackingDetailHistory, data?.trackingDetailHistory || []);
                })
                if (await shops.length > 0) {//dong bo hinh cham cong
                    await ATTENDANT_API.onlineAttendant(0, TODAY)
                }
                //hoan thanh
                await actionResult('Đã đồng bộ dữ liệu')
            })
        } catch (err) {
            await actionResult('Lỗi đồng bộ dữ liệu')
        }
    }
}
export const checkTaskListOnline = async () => {
    const connected = await isNetworkConnection()
    if (connected) {
        try {
            const data = await fetchGet(URLDEFAULT + 'download/tasklist')
            await DeleteAll(taskList).then(async () => {
                await Insert(taskList, data?.data || []);
            })
        } catch (err) {
            console.log(err);
        }
    }
}
export const DeleteTaskList = async (TableInfo) => {
    try {
        await QueryStringSql(`DELETE FROM ${TableInfo.tableName} WHERE reportDate IS NULL OR reportDate=${TODAY}`)
    } catch (err) {
        errorInfo('Err Deleted ALL ', err);
        return { err };
    }
}
export const productReload = async (actionResult) => {
    const connected = await checkNetwork()
    if (connected) {
        try {
            //Upgrade db
            await UpGradeDB();
            var listProducts = await fetchGet(URL_DOWNLOAD_PRODUCT);
            await Promise.all([listProducts]).then(async result => {
                await DeleteAll(products).then(async (d) => {
                    await Insert(products, listProducts?.data || []);
                })
                //hoan thanh
                await actionResult('Đã đồng bộ dữ liệu sản phẩm')
            })
        } catch (err) {
            console.log(err, "dong bo");
            await actionResult('Lỗi đồng bộ dữ liệu sản phẩm')
        }
    } else {
        await actionResult('Lỗi kết nối mạng')
    }
}
export const downloadDataByShop = async (shopId, actionResult) => {
    try {
        //Upgrade db
        await deleteHistoryDisplayByShop(shopId)
        var dataHistoryDisplay = await getHistoryDisplayByShop(shopId)
        await Promise.all([dataHistoryDisplay], actionResult).then(async result => {
            await Insert(historyDisplay, dataHistoryDisplay || []);
            //hoan thanh
            await actionResult('Đã đồng bộ dữ liệu')
        })
    } catch (err) {
        console.log(err, "dong bo");
        await actionResult('Lỗi khi đồng bộ dữ liệu')
    }
}
const downloadMenu = async (finish) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Authorization': token
            }
        }
        const response = await fetch(URLDEFAULT + 'download/listMenu', requestInfo);
        const result = await response.json();
        if (result.statusId === 200) {
            await DeleteAll(menulist).then(async (e) => {
                await Insert(menulist, result.data);
            })
            //await finish;
        }
        await finish
    } catch (err) {
        console.log(err, "download menu");
    }
}
const PostDeviceInfo = async () => {
    const _device = await getDeviceInfo();

    const _Id = await DeviceInfo.getUniqueId()
    const data = {
        "deviceInfo": await JSON.stringify(_device),
        "deviceId": _Id,
        "platform": await Platform.OS.toString()
    }
    // console.log(data)
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Authorization': token,
            },
            body: JSON.stringify(data)
        }
        await fetch(URLDEFAULT + 'download/devicelog', requestInfo);
    } catch (err) {
        console.log(err, "PostDeviceInfo")
    }
}

export const APPDOWNLOAD = { downloadMenu }
