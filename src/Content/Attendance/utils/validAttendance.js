import { DOWNLOADAPI } from "../../../API/DownloadAPI"
import { menuController } from "../../../Controller/MenuController"
import { GetAsyncStorage, Message, MessageAcept, MessageAction, MessageInfo, saveStore, UUIDGenerator } from "../../../Core/Helper";
import { alertNotify, isNetworkConnection, TODAY } from "../../../Core/Utility";
import { toastError } from "../../../Utils/configToast";
import { getIdMaxOverview } from "../../../Controller/WorkController";
import { DeviceEventEmitter } from "react-native";

import { isValidData, isValidObject } from "../../../Utils/validateData";
import { ATTENDANT_API } from "../../../API/AttendantAPI";
import { SheetManager } from "react-native-actions-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AttendantController } from "../../../Controller/AttendantController";
import moment from "moment";
import _ from 'lodash';
import { getResSellOut } from "../../../Controller/SellOutController";

const ATTENDANT_TYPE = { IN: "IN", OUT: "OUT" }
const byShopConfig = async (navigation, params) => {
    try {
        const { shopinfo, workinfo, isEdit, item } = params
        const PHOTOTYPE = item.photoType % 2 == 0 ? ATTENDANT_TYPE.IN : ATTENDANT_TYPE.OUT
        const config = JSON.parse(shopinfo.config || '{}')

        const {
            checkOnline, // Kiểm tra task list
            isCheckStoreInfo, // kiểm tra thông tin cửa hàng theo danh sách
            shopNotCO, // kiểm tra check out cửa hàng trước chưa
            shopSO, // kiểm tra đã nhập hoặc gửi hết sellout chưa
            overviewIMG, // kiểm tra hình overview có toạ độ chưa
            constraintCOMinute, // ràng thời gian ghé thăm của hàng
            constraintLate, // ràng thời gian đi trễ về sớm
            notNoteLate, // ràng ghi chú/ thông báo đi trễ về sớm
            noteCO, // noteCO > 0 : không cho phép check out bất kể lí do
            shopNote, // shopNote == 1 : bật ghi chú shop
            noteReport, // noteReport == 1 : kiểm tra báo cáo bắt buộc không làm (Nhập lí do),
            ktc, // noteReport == 1 : kiểm tra báo cáo bắt buộc không làm (Nhập lí do),
            todoList, // todoList == 1 : Mở To-Do List,
            lockReport, // lockReport == 1 : Lock report sau khi checkout
            noteKPI, // noteKPI == 1 : note tình trạng cửa hàng (Daikin),
            checkFirstShop, // checkFirstShop == 1 : Kiểm tra check in shop đầu tiên
            checkNumberAtt, // checkNumberAtt == 2 : kiểm tra báo cáo theo số hình check out numberAtt 
            checkEditDisplay, // checkEditDisplay == 1 : kiểm tra có đang ở chế độ Edit không
        } = config

        // Connection
        const isConnected = await isNetworkConnection()
        if (!isConnected) {
            toastError('Lỗi kết nối', 'Vui lòng kiểm tra lại kết nối mạng và thử lại sau.')
            return false
        }
        // Config Datetime
        const datetimeGMT = new Date().toString();
        const isWrongTimezone = !datetimeGMT.includes('GMT+0700');
        if (isWrongTimezone) {
            toastError('Sai múi giờ', 'Vui lòng chỉnh múi giờ ở Việt Nam trong cài đặt của máy');
            return false;
        }
        // Shop Info
        if (isCheckStoreInfo === 1) {
            MessageAction(config.titleCheck || 'Cập nhật dữ liệu cửa hàng', () => navigation.navigate('updatestore'));
            return
        }
        // Task 
        const isValid_TaskList = await valid_Tasklist(navigation, checkOnline)
        if (!isValid_TaskList)
            return false
        // Work
        const isValid_Work = await valid_Work(navigation, { workinfo, shopinfo, item, isEdit, PHOTOTYPE, ...config })
        if (!isValid_Work)
            return false
        //
        return true
    } catch (error) {
        console.log(`${error}`);
        return false;
    }
}
//
const valid_Tasklist = async (navigation, checkOnline = 0) => {
    if (checkOnline == 1)
        await DOWNLOADAPI.downloadTaskList()
    //
    const menuHome = await menuController.getMenu()
    const fistDone = _.filter(menuHome, (e) => e.fistTask === 1 && e.taskDone === 0)
    if (isValidData(fistDone)) {
        const itemDone = fistDone[0] || {}
        MessageAcept("Thông báo", `${itemDone.menuNameVN} ${itemDone.taskAlter}`, () => {
            navigation.navigate(itemDone.pageName, { menuitem: itemDone })
        });
        return false
    }
    return true;
}

const countTime = (timeLimit, timeClick, type) => {
    const padZero = (n) => n < 10 ? `0${n}` : `${n}`;

    const diffMs = type === ATTENDANT_TYPE.IN
        ? timeClick - timeLimit
        : timeLimit - timeClick;

    const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

const getPhotoTimeValue = (photoInfo = {}) => {
    const formats = ['YYYYMMDDHHmmss', 'YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD HH:mm:ss', moment.ISO_8601];
    const candidates = [
        photoInfo.photoFullTime,
        photoInfo.PhotoFullTime,
        photoInfo.photoTime,
        photoInfo.PhotoTime,
    ];

    for (const value of candidates) {
        if (value === null || value === undefined) continue;

        const rawValue = `${value}`.trim();
        if (!rawValue || rawValue === 'null' || rawValue === 'undefined') continue;

        if (/^\d{14}$/.test(rawValue)) {
            const timeValue = moment(rawValue, 'YYYYMMDDHHmmss', true).valueOf();
            if (!isNaN(timeValue)) return timeValue;
        }

        if (/^\d{13}$/.test(rawValue)) {
            const timeValue = moment(Number(rawValue)).valueOf();
            if (!isNaN(timeValue)) return timeValue;
        }

        const timeValue = moment(rawValue, formats, true).valueOf();
        if (!isNaN(timeValue)) return timeValue;
    }

    return null;
}

const getCheckInPhotoTimeValue = async (shopinfo, item) => {
    const photoType = Number(item?.photoType || 0);
    const checkInPhotoType = photoType % 2 === 0 ? photoType : photoType - 1;
    const attendantList = shopinfo?.auditDate ? await AttendantController.GetAttendant(shopinfo, shopinfo.auditDate) : [];
    const checkInPhoto = _.find(attendantList, it => Number(it.photoType) === checkInPhotoType) || item;
    return getPhotoTimeValue(checkInPhoto);
}


const valid_Work = async (navigation, params) => {
    const {
        isEdit,
        workinfo,
        shopinfo,
        shopNote,
        ktc = 0,
        constraintLate = 0,
        constraintEarly = 0,
        checkExactTime = 0,
        constraintCOMinute = 0,
        constraintMaxCOMinute = 0,
        checkNumberAtt = 0,
        shopNotCO = 0,
        noteCO = 0,
        noteKPI = 0,
        overviewIMG,
        checkFirstShop = 0,
        notNoteLate = 0,
        noteReport = 0,
        checkEditDisplay = 0,
        item,
        PHOTOTYPE,
        shopSO = 0,
        checkReportEdit = 0
    } = params


    // #region - CHECK IN 
    if (PHOTOTYPE == ATTENDANT_TYPE.IN) {
        if (shopNote == 1) {
            SheetManager.show('note-attendance-sheet', {
                payload: {
                    ...shopinfo,
                    item: item,
                    titleAlert: 'Nhập ghi chú (Nếu có)'
                }
            })
        }
        if (shopNotCO > 0) {
            const lstShop = await AttendantController.countAttShopNotFinish(workinfo)
            const lstHave = await lstShop.filter(item => item.countImage % 2 > 0)
            if (await lstHave?.length > 0) {
                MessageInfo(`Vui lòng thực hiện checkout cửa hàng ${lstHave[0].shopName} sau đó thực hiện tiếp checkin cửa hàng khác.`)
                return false;
            }
        }
    }
    // #endregion

    // #region - OVERVIEW 
    const requireOverview = () => {
        MessageAction('Vui lòng chụp hình tổng quan cửa hàng trước khi chấm công.', async () => {
            DeviceEventEmitter.emit('GO_OVERVIEW')
        });
        return false
    };

    // --- Case 1: Check overview hàng ngày khi vào ca --- 
    if (overviewIMG === 1 && PHOTOTYPE === ATTENDANT_TYPE.IN) {
        const isMissingImageToday = !shopinfo.imageUrl || (shopinfo.imageUrl && !shopinfo.imageUrl.includes(TODAY));
        if (isMissingImageToday) {
            const lstOverview = await getIdMaxOverview(shopinfo.shopId, TODAY);
            if (!isValidData(lstOverview)) {
                requireOverview();
                return false
            }
        }
    }
    // --- Case 2: Check overview khi chưa có hình hoặc toạ độ ---
    if (overviewIMG === 2 && PHOTOTYPE === ATTENDANT_TYPE.IN) {
        const isMissingLocation = shopinfo.latitude == 0 || shopinfo.longitude == 0;
        const isMissingImage = !shopinfo.imageUrl;

        if (isMissingLocation || isMissingImage) {
            const lstOverview = await getIdMaxOverview(shopinfo.shopId, TODAY);
            if (!isValidData(lstOverview)) {
                requireOverview();
                return false
            }
        }
    }
    // #endregion

    // #region - CHECK OUT
    if (PHOTOTYPE == ATTENDANT_TYPE.OUT) {
        if (shopSO > 0) {
            const resSellout = await getResSellOut(workinfo);
            if (resSellout?.length === 0) {
                toastError('Cảnh báo chưa làm báo cáo sellout', 'Vui lòng nhập sellout (Không bán được sản phẩm vui lòng chọn NoSell sau đó gửi lên hệ thống)')
                return false;
            }
            else {
                let lstHave = resSellout.filter(itemSell => itemSell.upload === 0)
                if (lstHave.length > 0) {
                    toastError('Cảnh báo chưa làm báo cáo sellout', 'Bạn có nhập sellout nhưng chưa gửi lên hết, Vui lòng vào lại báo cáo đẩy dữ liệu lên.')
                    return false;
                }
            }
        }
        if (checkEditDisplay == 1) {
            const itemMenuDisplay = await menuController.getItemMenu(shopinfo, 128)
            const isEditStore = await AsyncStorage.getItem(`${shopinfo.shopId}_EDIT`);
            if (isEdit || isEditStore) {
                if (isValidObject(itemMenuDisplay)) {
                    MessageAcept("Thông báo", `Vui lòng thoát chế độ "Chỉnh sửa" trong ${itemMenuDisplay.name} trước khi Checkout`, () => {
                        DeviceEventEmitter.emit('REPORT_TO', itemMenuDisplay)
                    })
                    return false
                }
            }
        }
        if (checkReportEdit == 1) {//kiểm tra chỉnh sửa báo cáo nhưng chưa gửi
            const KeyStore = `${workinfo.shopId || 0}REPORT_EDIT${TODAY}`
            const json = (await GetAsyncStorage(KeyStore) || '[]')
            let dataAsync = JSON.parse(json)
            let strErrReport = ''
            dataAsync.map(it => {
                if (it.isUpdate == 0 && it.isCheck != 1) {
                    it.isCheck = 1
                    strErrReport = strErrReport + `Bạn chưa gửi báo cáo "${it.menuNameVN}"\n`
                }
            })
            if (strErrReport.length > 0) {
                await saveStore(KeyStore, JSON.stringify(dataAsync))
                await MessageInfo(strErrReport + 'lên hệ thống!')
                return
            }
        }
        if (noteKPI == 1) {
            SheetManager.show('note-attendance-sheet', {
                payload: {
                    ...shopinfo,
                    item: item,
                    type: "NoteKPI",
                    titleAlert: 'Tình trạng cửa hàng'
                }
            })
            return false;
        }
        if (workinfo.workStatus == 0 && ktc == 1) {
            SheetManager.show('note-attendance-sheet', {
                payload: {
                    ...shopinfo,
                    item: item,
                    type: "KTC",
                    titleAlert: 'Lí do không thành công'
                }
            })
            return false;
        }

        if (workinfo.workStatus == 1 && (checkNumberAtt !== 1 || (checkNumberAtt == 1 && numberAtt === (e + 1)))) {
            const pendingTask = await menuController.checkTaskDone(shopinfo);
            if (noteReport == 1) {
                if (!pendingTask.isValid) {
                    const strMenu = pendingTask.data.map(it => it.menuNameVN).join(', ')

                    SheetManager.show('note-attendance-sheet', {
                        payload: {
                            ...shopinfo,
                            item: item,
                            type: 'NoteReport',
                            titleAlert: `Lý do không làm báo cáo ${strMenu}`,
                        }
                    })
                    return false;
                }
            } else {
                if (!pendingTask.isValid) {
                    SheetManager.show('kpi-sheet')
                    return false
                }
            }
        }

        if (constraintMaxCOMinute > 0 && PHOTOTYPE === ATTENDANT_TYPE.OUT) {
            const timeCIMili = await getCheckInPhotoTimeValue(shopinfo, item);
            if (!timeCIMili) {
                toastError('Lỗi dữ liệu', 'Không xác định được thời gian CHECK-IN để kiểm tra thời gian ghé thăm.')
                return false;
            }
            let timeClick = moment().valueOf();
            const timeInMiliLimit = timeCIMili + (constraintMaxCOMinute * 60 * 1000);
            if (timeClick > timeInMiliLimit) {
                if (noteCO > 0) {// không cho phép out dù bắt ki lý do gì
                    toastError('Quá thời gian ghé thăm', 'Tổng thời gian ghé thăm trên ' + constraintMaxCOMinute + ' phút.', 'Thông báo', "top")
                    return false;
                } else {
                    Message('Thông báo', 'Tổng thời gian ghé trên ' + constraintMaxCOMinute + ' phút. Vui lòng nhập lý do ở dưới đây sau đó check out.', () => {
                        SheetManager.show('note-attendance-sheet', {
                            payload: {
                                ...shopinfo,
                                item: item,
                                type: "NOTE",
                                titleAlert: 'Ghi chú quá thời gian ghé thăm'
                            }
                        })
                    })
                }
                return false;
            }
        }

        if (constraintCOMinute > 0 && PHOTOTYPE === ATTENDANT_TYPE.OUT) {
            const timeCIMili = await getCheckInPhotoTimeValue(shopinfo, item);
            if (!timeCIMili) {
                toastError('Lỗi dữ liệu', 'Không xác định được thời gian CHECK-IN để kiểm tra thời gian ghé thăm.')
                return false;
            }
            let timeClick = moment().valueOf();
            const timeInMiliLimit = timeCIMili + (constraintCOMinute * 60 * 1000);

            if (timeClick < timeInMiliLimit) {
                if (noteCO > 0) {
                    toastError(`Thời gian ghé thăm`, `Tổng thời gian ghé thăm dưới ${constraintCOMinute} phút.`)
                    return false;
                } else {
                    Message('Thông báo', `Tổng thời gian ghé thăm dưới ${constraintCOMinute} phút. Vui lòng nhập lý do ở dưới đây sau đó CHECK-OUT`, () => {
                        SheetManager.show('note-attendance-sheet', {
                            payload: {
                                ...shopinfo,
                                item: item,
                                type: "NOTE",
                                titleAlert: 'Ghi chú thời gian ghé thăm'
                            }
                        })
                    })
                }
                return false;
            }
        }
    }
    // #endregion

    // #region - LATE / EARLY
    if (constraintLate > 0 || constraintEarly > 0) {
        const timeClick = moment().utc().valueOf();
        const onLateAction = (time = 0) => {
            Message('Thông báo', `Bạn đang CHECK-IN trễ ${time} phút so với thời gian làm việc là ${moment(shopinfo.timeIn).format('HH:mm')}. Vui lòng nhập ghi chú và tiếp tục CHECK-IN.`, () => {
                SheetManager.show('note-attendance-sheet', {
                    payload: {
                        ...shopinfo,
                        item: item,
                        type: "NOTE",
                        titleAlert: 'Chấm công trễ'
                    }
                })
                return false
            });
        }
        const onEarlyAction = (time) => {
            Message('Thông báo', `Bạn đang CHECK-OUT sớm ${time} phút so với thời gian làm việc là ${moment(shopinfo.timeOut).format('HH:mm')}. Vui lòng nhập ghi chú và tiếp tục CHECK-OUT.`,
                () => {
                    SheetManager.show('note-attendance-sheet', {
                        payload: {
                            ...shopinfo,
                            item: item,
                            type: "NOTE",
                            titleAlert: 'Kết thúc làm việc sớm'
                        }
                    })
                    return false
                }
            );
        }
        if (checkFirstShop == 1) {
            let isResultIn = true;
            let isResultOut = true;

            // Validate CHECK IN
            await ATTENDANT_API.validTimeAttendant(ATTENDANT_TYPE.IN, async (itemTime, message) => {
                if (message) {
                    toastError('Lỗi dữ liệu', message);
                    isResultIn = false;
                    return;
                }
                if (itemTime?.isCheckTimeIn === 0) {
                    const validTime = moment(shopinfo.timeIn).add(constraintLate, 'minute');
                    const minutesLate = validTime.diff(moment(), 'minute');
                    if (!isNaN(minutesLate) && minutesLate < 0) {
                        onLateAction(minutesLate * -1)
                        isResultIn = false;
                    }
                }
            });
            if (!isResultIn) return false;

            // Validate CHECK OUT
            await ATTENDANT_API.validTimeAttendant(ATTENDANT_TYPE.OUT, async (itemTime, message) => {
                if (message) {
                    toastError('Lỗi dữ liệu', message);
                    isResultOut = false;
                    return;
                }
                if (itemTime?.isCheckTimeOut === 0) {
                    const validTime = moment(shopinfo.timeOut).subtract(constraintLate, 'minute');
                    const minutesEarly = validTime.diff(moment(), 'minute');
                    if (!isNaN(minutesEarly) && minutesEarly > 0) {
                        onEarlyAction(minutesEarly)
                        isResultOut = false;
                    }
                }
            });
            if (!isResultOut) return false;
        } else {
            // Khi không phải là shop đầu tiên
            if (PHOTOTYPE === ATTENDANT_TYPE.IN) {
                const timeInLimit = moment(shopinfo.timeIn).add(constraintLate, 'minute').utc().valueOf();
                if (timeClick > timeInLimit) {
                    const time = countTime(moment(shopinfo.timeIn).utc().valueOf(), timeClick, ATTENDANT_TYPE.IN);
                    if (notNoteLate === 0 || notNoteLate == 3) {
                        onLateAction(time)
                        return false;
                    } else {
                        alertNotify(`Bạn đang checkIn trễ ${time} phút so với thời gian làm việc ${moment(shopinfo.timeIn).format('HH:mm')}.`);
                        return false;
                    }
                }
            } else if (PHOTOTYPE === ATTENDANT_TYPE.OUT) {
                const timeOutLimit = moment(shopinfo.timeOut).subtract((constraintEarly || constraintLate), 'minute').utc().valueOf();
                let timeOut = shopinfo.timeOut
                let timeOutMili = moment(timeOut).utc().valueOf();
                if ((timeClick < timeOutLimit && checkExactTime != 1) || (checkExactTime == 1 && timeClick < timeOutMili)) {
                    const time = countTime(moment(shopinfo.timeOut).utc().valueOf(), timeClick, ATTENDANT_TYPE.OUT);
                    if (notNoteLate === 0) {
                        onEarlyAction(time)
                        return false;
                    } else {
                        alertNotify(`Bạn đang checkOut sớm ${time} phút so với thời gian làm việc ${moment(shopinfo.timeOut).format('HH:mm')}.`);
                        return false;
                    }
                }
            }
        }
    }
    // #endregion

    return true;
}
//
export const VALID_ATTENDANCE = { byShopConfig } 
