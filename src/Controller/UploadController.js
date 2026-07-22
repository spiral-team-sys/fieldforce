import { exeSql, Store, exeSqlNoQuery, QueryStringSql } from "../Core/SqliteDbContext"
import { GetToken, ToastError, ToastSuccess, UUIDGenerator } from '../Core/Helper'
import { URLDEFAULT } from "../Core/URLs";
import { uploadAllDataPhoto } from "./PhotoController";
import { photos, trackingDetailResult } from "../Core/TableLocal";
import { taskList } from "../Core/Table";
import { alertToast } from "../Core/Utility";
import RNFS from 'react-native-fs'
    ;
import { Platform } from "react-native";
const DataPhoto = async (workinfo) => {
    try {
        const sql = `SELECT * FROM photos p 
        WHERE (p.dataUpload IS NULL OR p.dataUpload=0 ) AND shopId=${workinfo.shopId} 
        AND photoDate=${workinfo.workDate} 
        AND reportId=${workinfo.reportId}`
        // console.log(sql)
        const { res } = await QueryStringSql(sql)
        if (await res !== null && await res?.length > 0) {
            await console.log(res)
            let jphoto = [];
            res?.forEach(element => {
                let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
                let fileName = '/uploaded/' + element.photoDate + '/' + ImgName
                jphoto.push({ ...element, photoPath: fileName });
            });
            const info = {
                "shopId": workinfo.shopId,
                "reportDate": workinfo.workDate,
                "reportId": workinfo.reportId,
                "jsonData": "[]",
                "jsonPhoto": JSON.stringify(jphoto)
            }
            // console.log(jphoto, 'check jphoto')
            const token = await GetToken();
            const requestInfo = {
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
                body: JSON.stringify(info)
            }
            const responde = await fetch(URLDEFAULT + "upload/uploadraw", requestInfo)
            const result = await responde.json();
            if (result.statusId === 200) {
                const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`
                await QueryStringSql(sql);
            }
            return await result;
        } else {
            return await { "statusId": 500, "messager": "Không có dữ liệu hình ảnh để gửi" }
        }
    } catch (err) {
        console.log(err)
        return await { "statusId": 500, "messager": "Lỗi kết nối api" }
    }
}
const DataSellout = async (workinfo, finish, error) => {
    try {
        const sql = `
            Select s.*
            FROM sellOut s 
            WHERE s.upload<>1 AND workId=${workinfo.workId}`;
        const { res } = await QueryStringSql(sql)

        await uploadServer(workinfo, res, async (result) => {
            await ToastSuccess(result.messager);
            if (result.statusId === 200) {
                await QueryStringSql(`Update Sellout set upload=1 WHERE WorkId=${workinfo.workId}`);
                const ssql = `UPDATE photos SET dataUpload=1  
                WHERE shopId=${workinfo.shopId} 
                AND photoDate=${workinfo.workDate} 
                AND reportId=${workinfo.reportId}`
                await QueryStringSql(ssql);
            }
            typeof (finish) === 'function' && finish();
        })
    } catch (err) {
        ToastError("Lỗi dữ liệu trong máy");
        typeof (error) === 'function' && error();
    }
}
const DataPromotion = async (workinfo, finish, error) => {
    try {
        let lst = [];
        await Store().then(async db => {
            const sqlSO = "Select * FROM promotion Where upload<>1 AND workId=" + workinfo.workId;
            var { res } = await exeSql(db, sqlSO);
            lst = res;
        });

        await uploadServer(workinfo, lst, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update promotion set upload=1 WHERE workId=" + workinfo.workId;
                    await exeSqlNoQuery(db, sqlData);

                    const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`
                    await exeSqlNoQuery(db, sql);
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
const DataDisplay = async (resDisplay, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, resDisplay, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update display set upload=1 WHERE workId=" + workinfo.workId;
                    await exeSqlNoQuery(db, sqlData);

                    const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`
                    await exeSqlNoQuery(db, sql);
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
const DataShelfPG = async (resShelfPG, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, resShelfPG, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update ShelfPGResult set upload=1 WHERE workId=" + workinfo.workId;
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
const DataAccessories = async (resAccessorie, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, resAccessorie, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update shopProfileResult set upload=1 WHERE workId=" + workinfo.workId;
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
const DataStock = async (resStock, workinfo, finish, error) => {
    try {
        await uploadServer(workinfo, resStock, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update stockout set upload=1 WHERE workId=" + workinfo.workId;
                    await exeSqlNoQuery(db, sqlData);

                    const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`
                    await exeSqlNoQuery(db, sql);
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
const DataReportShare = async (workinfo, finish, error) => {
    try {
        let lst = [];
        await Store().then(async db => {
            const sql = `
            select * from trackingDetailResult 
            WHERE (upload<>1 OR upload IS NULL) AND workId=${workinfo.workId} AND shopId=${workinfo.shopId} 
            AND  trackingId in (${workinfo.totalTrackingId}) AND display != '' AND display != 'null'
            `
            const { res } = await exeSql(db, sql);
            lst = res;
        });

        await uploadServer(workinfo, lst, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = "Update trackingDetailResult set upload=1 WHERE workId=" + workinfo.workId
                        + " AND shopId=" + workinfo.shopId
                        + " AND trackingId in (30,32)"
                    await exeSqlNoQuery(db, sqlData);
                    const sql = `UPDATE photos SET dataUpload=1  
                    WHERE shopId=${workinfo.shopId} 
                    AND photoDate=${workinfo.workDate} 
                    AND reportId=${workinfo.reportId}`
                    await exeSqlNoQuery(db, sql);
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
const DataTrackingCompetitor = async (workinfo, trackingId, finish, error) => {
    try {
        let lst = [];
        await Store().then(async db => {
            const sql = `SELECT * FROM ${trackingDetailResult.tableName} 
                         WHERE workId=${workinfo.workId} 
                         AND trackingId IN (${trackingId}) 
                         AND display IS NOT NULL 
                         AND (upload IS NULL OR upload=0)`
            const { res, err } = await exeSql(db, sql);
            lst = res;
        });
        await uploadServer(workinfo, lst, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = `Update ${trackingDetailResult.tableName} set upload=1 WHERE workId=${workinfo.workId}
                        AND shopId=${workinfo.shopId}
                        AND trackingId in (${trackingId})`
                    await exeSqlNoQuery(db, sqlData)
                    const sql = `UPDATE photos SET dataUpload=1  
                                WHERE shopId=${workinfo.shopId} 
                                AND photoDate=${workinfo.workDate} 
                                AND reportId=${workinfo.reportId}`
                    await exeSqlNoQuery(db, sql);
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
const DataInstoreShare = async (workinfo, trackingId, finish, error) => {
    try {
        let lst = [];
        await Store().then(async db => {
            const sql = `SELECT * FROM ${trackingDetailResult.tableName} 
                         WHERE workId=${workinfo.workId} 
                         AND trackingId IN (${trackingId}) 
                         AND display IS NOT NULL 
                         AND (upload IS NULL OR upload=0)`
            const { res, err } = await exeSql(db, sql);
            lst = res;
        });
        await uploadServer(workinfo, lst, async (result) => {
            ToastSuccess(result.messager);
            if (result.statusId == 200) {
                await Store().then(async db => {
                    const sqlData = `Update ${trackingDetailResult.tableName} set upload=1 WHERE workId=${workinfo.workId}
                        AND shopId=${workinfo.shopId}
                        AND trackingId in (${trackingId})`
                    await exeSqlNoQuery(db, sqlData)
                    const sql = `UPDATE photos SET dataUpload=1  
                                WHERE shopId=${workinfo.shopId} 
                                AND photoDate=${workinfo.workDate} 
                                AND reportId=${workinfo.reportId}`
                    await exeSqlNoQuery(db, sql);
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
export const uploadServer = async (workinfo, dataInput, finishSrv, errorSrv) => {
    try {
        const sql = `
        SELECT * FROM photos p 
        WHERE p.dataUpload=0 AND shopId=${workinfo.shopId} AND (photoDesc<> 'VERIFY' OR photoDesc IS NULL)
        AND photoDate=${workinfo.workDate} 
        AND reportId=${workinfo.reportId}`
        const { res } = await QueryStringSql(sql);

        let jphoto = [];
        res?.forEach(element => {
            let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
            let fileName = '/uploaded/' + element.photoDate + '/' + ImgName
            jphoto.push({ ...element, photoPath: fileName });
        });
        const info = {
            shopId: workinfo.shopId,
            reportDate: workinfo.workDate,
            reportId: workinfo.reportId,
            jsonData: JSON.stringify(dataInput),
            jsonPhoto: JSON.stringify(jphoto)
        }
        const token = await GetToken();
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(info)
        }
        const responde = await fetch(URLDEFAULT + "upload/uploadraw", requestInfo)
        const result = await responde.json();
        if (result.statusId === 200) {
            await QueryStringSql(`UPDATE ${photos.tableName} SET dataUpload=1 WHERE shopId=${workinfo.shopId} AND photoDate=${workinfo.workDate} AND reportId=${workinfo.reportId} AND (photoDesc<> 'VERIFY' OR photoDesc IS NULL)`)
            await QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${workinfo.reportId}`)
            await PostFile();
        }
        return finishSrv(result);
    } catch (error) {
        finishSrv({ "statusId": 500, "messager": "Lỗi kết nối api" });
    }
}
const PostFile = async () => {
    const { res } = await QueryStringSql("SELECT id,shopCode,shopId,photoDate,photoFullTime,photoPath FROM photos WHERE fileUpload=0 OR fileUpload IS NULL");
    for (const photoInfo of (res || [])) {
        await uploadAllDataPhoto([photoInfo], () => { console.log('fileSuccess') }, () => { console.log('fileError') });
    }
}
const uploadFilePDF = async (dataUpload, year, month, fileSuccess, fileError, fileType) => {
    try {
        let arrFilePath = []
        let access_token = await GetToken();
        for (let index = 0; index < dataUpload.length; index++) {
            const item = dataUpload[index];
            const fileExtension = item.name.split('.').pop();
            let destinationPath = item.uri
            if (!await RNFS.exists(destinationPath) && !await RNFS.exists(decodeURIComponent(destinationPath))) {
                destinationPath = `${RNFS.TemporaryDirectoryPath}/${item.name}`;
                await RNFS.copyFile(item.uri, destinationPath)
                const fileExists = await RNFS.exists(destinationPath)
                if (!fileExists) {
                    typeof (fileError) === 'function' && fileError();
                    return
                }
            }
            let FileAsBase64 = await RNFS.readFile(decodeURIComponent(destinationPath), 'base64');
            let dataItem = {
                "FileData": FileAsBase64 + '',
                "FileName": UUIDGenerator() + '.' + fileExtension
            }
            const requestInfo = {
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": access_token,
                    "Year": year,
                    "Month": month,
                    "fileType": fileType || null
                },
                body: JSON.stringify(dataItem)
            }
            const response = await fetch(URLDEFAULT + "upload/uploadfile", requestInfo)
            const result = await response.json();
            if (result.statusId === 200) {
                arrFilePath.push({
                    filePath: result.messager, //result.messager
                    fileUri: item.uri
                })
            } else {
                typeof (fileError) === 'function' && fileError();
                return
            }
        }
        fileSuccess(arrFilePath);
    } catch (error) {
        typeof (fileError) === 'boolean' ? null : alertToast('Xảy ra lỗi khi gửi file : ' + error);
    }
}
export default UploadController = { uploadServer, DataPhoto, PostFile, DataSellout, DataDisplay, DataReportShare, DataTrackingCompetitor, DataStock, DataPromotion, DataAccessories, DataShelfPG, DataInstoreShare, uploadFilePDF }
