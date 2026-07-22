
import { URLDEFAULT, URL_CONFIRM_ORDERS, URL_INSERT_POPSHOP, URL_UPDATE_ORDER, URL_UPDATE_WAREHOUSE, URL_UPLOADPOP } from "../Core/URLs";
import Moment from 'moment';
import { GetToken, MessageInfo, ToastError, ToastSuccess, Token } from "../Core/Helper";
import { DeleteItem, exeSql, InsertItems, Store, UpdateItem } from "../Core/SqliteDbContext";
import { uploadServer } from "./UploadController";

export async function uploadConfirmPOP(OrderNo, OrderList, resPhotos, finish, errorAct) {

    let access_token = await Token();

    try {

        let itemsPOP = [];
        OrderList.map(OrderInfo => {
            let itemP = {
                "WarehouseId": OrderInfo.WarehouseId,
                "WareHouseCode": OrderInfo.WareHouseCode,
                "WareHouseName": OrderInfo.WareHouseName,
                "TotalPOP": OrderInfo.TotalPOP,
                "QuantityMyHouse": OrderInfo.QuantityMyHouse,
                "Quantity": OrderInfo.Quantity,
                "UserInput": OrderInfo.UserInput,
                "QuantityEdit": OrderInfo.QuantityEdit,
                "QuantityDamaged": OrderInfo.QuantityDamaged,
                "QuantityPickup": OrderInfo.QuantityPickup,
                "POPId": OrderInfo.POPId,
                "POPName": OrderInfo.POPName,
                "GroupName": OrderInfo.GroupName,
                "GroupId": OrderInfo.GroupId,
                "Image": OrderInfo.Image,
                "TypePOP": OrderInfo.TypePOP
            }
            itemsPOP.push(itemP);
        })

        let itemsPhoto = [];
        resPhotos.forEach(photoInfo => {
            let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
            let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
            let dataItem = {
                "photoName": ImgName,
                "latitude": photoInfo.latitude,
                "longitude": photoInfo.longitude,
                "accuracy": 8,
                "reportId": -3,
                "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                "photoType": '' + parseInt(photoInfo.photoType),
                "photoDate": photoInfo.photoDate,
                "photoPath": pathPhoto,
                "photoDesc": photoInfo.photoDesc
                // "guid": photoInfo.guid
            }
            itemsPhoto.push(dataItem);
        });

        let UploadJson = {
            OrderNo: OrderNo,
            Details: JSON.stringify(itemsPOP),
            Photos: JSON.stringify(itemsPhoto)
        }

        await fetch(URL_CONFIRM_ORDERS, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(UploadJson)
        })
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                finish()
                MessageInfo(responseJson[0].messager);

            })
            .catch(error => {
                MessageInfo(JSON.stringify(error));
            });
    }
    catch (error) {
        //console.log(error);
    }
}
export async function updateWarehouse(POPlist, finish, errorAct) {

    let access_token = await Token();


    try {

        let itemsPOP = [];
        POPlist.map(OrderInfo => {
            if (OrderInfo.damagedInWarehouse !== null && OrderInfo.damagedInWarehouse !== 0 && OrderInfo.damagedInWarehouse !== '') {
                let itemP = {
                    "WareHouseId": OrderInfo.wareHouseId,
                    "POPId": OrderInfo.popId,
                    "DamagedValue": OrderInfo.damagedInWarehouse
                }
                itemsPOP.push(itemP);
            }

        })

        let UploadJson = {
            Details: JSON.stringify(itemsPOP),
        }

        await fetch(URL_UPDATE_WAREHOUSE, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(UploadJson)
        })
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                finish()
                MessageInfo(responseJson.messeger)
            })
            .catch(error => {
                MessageInfo(JSON.stringify(error));
            });
    }
    catch (error) {
        //console.log(error);
    }
}
export async function uploadOrderPOP(POPlist, wareHouseId, uuid, Address, finish, errorAct) {

    let access_token = await Token();
    try {

        let itemsPOP = [];
        POPlist.map(OrderInfo => {
            if (OrderInfo.UserInput !== null && OrderInfo.UserInput !== 0 && OrderInfo.UserInput !== '') {
                let itemP = {
                    "WarehouseId": OrderInfo.wareHouseId,
                    "WareHouseCode": OrderInfo.warehouseCode,
                    "WareHouseName": OrderInfo.wareHouseName,
                    "TotalPOP": OrderInfo.totalPOP,
                    "QuantityMyHouse": OrderInfo.quantityMyHouse,
                    "Quantity": OrderInfo.quantity,
                    "UserInput": OrderInfo.UserInput,
                    "QuantityEdit": OrderInfo.UserInput,
                    "QuantityDamaged": null,
                    "QuantityPickup": null,
                    "POPId": OrderInfo.popId,
                    "POPName": OrderInfo.popName,
                    "GroupName": OrderInfo.groupName,
                    "GroupId": OrderInfo.groupId,
                    "Image": OrderInfo.image,
                    "TypePOP": OrderInfo.typePOP
                }
                itemsPOP.push(itemP);
            }

        })

        let UploadJson = {
            WarehouseId: wareHouseId,
            Note: '',
            GUIID: uuid,
            Address: Address,
            Details: JSON.stringify(itemsPOP),
        }

        await fetch(URL_UPLOADPOP, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(UploadJson)
        })
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                MessageInfo(responseJson[0].messager);
                finish()
            })
            .catch(error => {
                MessageInfo(JSON.stringify(error));
            });
    }
    catch (error) {
        errorAct(error)
    }
}
export async function updateOrderPOP(OrderNo, OrderList, finish, errorAct) {

    let access_token = await Token();

    try {

        let itemsPOP = [];
        OrderList.map(OrderInfo => {
            let itemP = {
                "WarehouseId": OrderInfo.WarehouseId,
                "WareHouseCode": OrderInfo.WareHouseCode,
                "WareHouseName": OrderInfo.WareHouseName,
                "TotalPOP": OrderInfo.TotalPOP,
                "QuantityMyHouse": OrderInfo.QuantityMyHouse,
                "Quantity": OrderInfo.Quantity,
                "UserInput": OrderInfo.UserInput,
                "QuantityEdit": OrderInfo.QuantityEdit,
                "QuantityDamaged": OrderInfo.QuantityDamaged,
                "QuantityPickup": OrderInfo.QuantityPickup,
                "POPId": OrderInfo.POPId,
                "POPName": OrderInfo.POPName,
                "GroupName": OrderInfo.GroupName,
                "GroupId": OrderInfo.GroupId,
                "Image": OrderInfo.Image,
                "TypePOP": OrderInfo.TypePOP
            }
            itemsPOP.push(itemP);
        })

        let UploadJson = {
            OrderNo: OrderNo,
            Details: OrderList.length === 0 ? '{}' : JSON.stringify(itemsPOP)
        }

        await fetch(URL_UPDATE_ORDER, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(UploadJson)
        })
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                finish()
                MessageInfo(responseJson[0].messager);

            })
            .catch(error => {
                MessageInfo('Err: ' + JSON.stringify(error));
            });
    }
    catch (error) {
        //console.log(error);
    }
}
export async function getLstInstallPOP(workInfo) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select *'
            + ' FROM installPOP WHERE workId=' + workInfo.workId
            + ' AND shopId=' + workInfo.shopId
        const { res, err } = await exeSql(db, sql);
        lst = res;
    })
    return lst;
}
export async function getInstallPOP(db, workInfo, popId) {
    const sql = 'Select *'
        + ' FROM installPOP WHERE workId=' + workInfo.workId
        + ' AND shopId=' + workInfo.shopId
        + ' AND popId=' + popId
    const { res, err } = await exeSql(db, sql);
    return res;
}
export async function insertInstallPOP(workInfo, popInfo, installQuantity) {

    await Store().then(async db => {
        let lstHave = await getInstallPOP(db, workInfo, popInfo.popId)
        if (lstHave.length > 0) {
            UpdateItem(db, 'installPOP', { installQuantity: installQuantity }, { "workId": workInfo.workId, "shopId": workInfo.shopId, "popId": popInfo.popId });
        }
        else {
            const item = {
                workId: workInfo.workId,
                wareHouseId: popInfo.wareHouseId,
                popId: popInfo.popId,
                popName: popInfo.popName,
                groupName: popInfo.groupName,
                shopId: workInfo.shopId,
                installQuantity: installQuantity,
                upload: 0
            }

            await InsertItems(db, 'installPOP', [item]);
        }
    })
}
export async function insertReasonPOP(workInfo, popInfo, reasonInfo) {
    await Store().then(async db => {
        let lstHave = await getInstallPOP(db, workInfo, popInfo.popId)
        if (lstHave.length > 0) {
            UpdateItem(db, 'installPOP', { reasonId: reasonInfo.Id, reasonName: reasonInfo.name }, { "workId": workInfo.workId, "shopId": workInfo.shopId, "popId": popInfo.popId });
        }
        else {
            const item = {
                workId: workInfo.workId,
                wareHouseId: popInfo.wareHouseId,
                popId: popInfo.popId,
                popName: popInfo.popName,
                groupName: popInfo.groupName,
                shopId: workInfo.shopId,
                reasonId: reasonInfo.Id,
                reasonName: reasonInfo.name,
                upload: 0
            }

            await InsertItems(db, 'installPOP', [item]);
        }
    })
}
export async function uploadPOPSHOP(POPlist, workInfo, finish, errorAct) {

    let access_token = await Token();
    try {

        let itemsPOP = [];
        POPlist.map(OrderInfo => {
            if (OrderInfo.installQuantity !== null && OrderInfo.installQuantity !== 0 && OrderInfo.installQuantity !== '' && OrderInfo.installQuantity !== 'null') {
                let itemP = {
                    "wareHouseId": OrderInfo.wareHouseId,
                    "popId": OrderInfo.popId,
                    "reason": OrderInfo.reasonId,
                    "installValue": OrderInfo.installQuantity
                }
                itemsPOP.push(itemP);
            }
        })

        let UploadJson = {
            ShopId: workInfo.shopId,
            Details: JSON.stringify(itemsPOP),
        }

        await fetch(URL_INSERT_POPSHOP, {
            method: 'post',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
            },
            body: JSON.stringify(UploadJson)
        })
            .then(response => {
                return response.json();
            })
            .then(async responseJson => {
                responseJson.status === 100 && await deleteInstallPOPSHOP(workInfo)
                MessageInfo(responseJson.messeger);
                finish();
            })
            .catch(error => {
                MessageInfo(JSON.stringify(error));
            });
    }
    catch (error) {
        //console.log(error);
    }
}
export async function deleteInstallPOPSHOP(workInfo) {
    await Store().then(async db => {
        DeleteItem(db, 'installPOP', { workId: workInfo.workId });
    });
}

// POP V2

export const POPMenuList = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'pop/menu', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            actionResult(result.data)
        } else {
            actionResult(null)
        }
    } catch (e) {
        ToastError("Error: Lỗi kết nối API")
    }
}
export const POPTotalWarehouse = async (warehouseId, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
                "WarehouseId": warehouseId
            }
        }
        const response = await fetch(URLDEFAULT + 'pop/total/warehouse', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            actionResult(result.data)
        } else {
            actionResult(null)
        }
    } catch (e) {
        ToastError("Error: Lỗi kết nối API")
    }
}
export const POPWarningList = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'pop/warninglist', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            actionResult(result.data)
        } else {
            actionResult(null)
        }
    } catch (e) {
        ToastError("Error: Lỗi kết nối API")
    }
}
export const POPFollowOrder = async (actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        }
        const response = await fetch(URLDEFAULT + 'pop/followorder', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            actionResult(result.data)
        } else {
            actionResult(null)
        }
    } catch (e) {
        ToastError("Error: Lỗi kết nối API")
    }
}
export const getPOPByShop = async (shopId, actionResult) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
                "WarehouseId": shopId
            }
        }
        const response = await fetch(URLDEFAULT + 'pop/popbyshop', requestInfo)
        if (response.status === 200) {
            const result = await response.json()
            actionResult(result.data)
        } else {
            actionResult(null)
        }
    } catch (e) {
        ToastError("Error: Lỗi kết nối API")
    }
}
export const UploadPOPOrder = async (itemUpload, finish, error) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(itemUpload)
        }
        const responde = await fetch(URLDEFAULT + "pop/save/order", requestInfo)
        const result = await responde.json();
        if (result.statusId === 200) {
            return finish(result);
        } else {
            return error(result)
        }
    } catch (err) {
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}
export const installPOPByShop = async (itemUpload, finish, error) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(itemUpload)
        }
        const responde = await fetch(URLDEFAULT + "pop/installpop", requestInfo)
        const result = await responde.json();
        if (result.statusId === 200) {
            return finish(result);
        } else {
            return error(result)
        }
    } catch (err) {
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}
export const updatePOP = async (typeUpdate, itemUpload, finish, error) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Authorization": token,
                "Accept": "application/json",
                "Content-Type": "application/json",
                "typeUpdate": typeUpdate
            },
            body: JSON.stringify(itemUpload)
        }
        const responde = await fetch(URLDEFAULT + "pop/update", requestInfo)
        const result = await responde.json();
        if (result.statusId === 200) {
            return finish(result);
        } else {
            return error(result)
        }
    } catch (err) {
        console.log(err);
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}


