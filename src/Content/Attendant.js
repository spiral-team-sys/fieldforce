import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Text, Platform, TouchableOpacity, DeviceEventEmitter, ScrollView, Modal, Linking } from 'react-native';
import { Icon, Divider, Button } from '@rneui/themed';
import { AppNameBuild, CAMERA_NOTE, GO_OVERVIEW, SYNC_DATA_ATT, SYNC_DATA_CONFIG, URLDEFAULT, URL_UPLOAD_ATTENDANT, officeApp } from './../Core/URLs';
import CacheImage from '../Core/CacheImage';
import { Message, Token, deviceSize, MessageAction, ToastError, MessageAcept, MessageInfo, MessageSetting, RequestLocation, GetAsyncStorage, saveStore } from '../Core/Helper';
import { UpdateAttendantStatus } from '../Controller/PhotoController'
import { checkNetwork, deviceHeight } from "../Core/Utility";
let RNFS = require('react-native-fs');
import { LoadingView } from '../Control/ItemLoading/index'
import { check, RESULTS, PERMISSIONS, request, openSettings } from 'react-native-permissions'
import moment from 'moment';
import Geolocation from '@react-native-community/geolocation';
import { getResSellOut } from '../Controller/SellOutController';
import { getIdMaxOverview } from '../Controller/WorkController';
import { deviceWidth } from '../Component/Home';
import { useDispatch, useSelector } from 'react-redux';
import { ATTENDANT } from '../Core/KEYs';
import { scaleSize } from '../Themes/AppsStyle';
import LottieView from 'lottie-react-native';
import ImageZoom from './ImageZoom';
import { GetMenu, GetMenuKPI } from '../Controller/UserController';
import ActionSheet from 'react-native-actions-sheet';
import DeviceInfo from 'react-native-device-info'
import { AttendantController } from '../Controller/AttendantController';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MultipleShowImage } from '../Control/MultipleShowImage';
import { checkTaskListOnline } from '../Controller/DownloadDataController';
import { Alert } from 'react-native';
import { ATTENDANT_API } from '../API/AttendantAPI';

const CICO = { ci: "IN", co: "OUT" }

const Attendant = ({ navigation }) => {
    const { userinfo, shopinfo, workinfo, appcolor, isEdit } = useSelector(state => state.GAppState);
    const dispatch = useDispatch();

    const [photoInfoClick, setPhotoInfoClick] = useState(null);
    const [noteAttType, setNoteAttType] = useState(null);
    const [noteAttContent, setNoteAttContent] = useState(null);
    const [isNoteAttendant, setIsNoteAttendant] = useState(false);
    const [AttendantCI, setAttendantCI] = useState(null);
    const [showProgress, setShowProgress] = useState(false);
    const [menuList, setMenuList] = useState([]);
    const [pendingTask, setPendingTask] = useState(0);
    const [PhotoInfo, setPhotoInfo] = useState(null);
    const [isPermissLocation, setIsPermissLocation] = useState(false);
    const [isLocationStatus, setIsLocationStatus] = useState(true);
    const [latitudePo, setLatitudePo] = useState(0);
    const [longitudePo, setLongitudePo] = useState(0);
    const [accuracyPo, setAccuracyPo] = useState(0);
    const [mocked, setMocked] = useState(false);
    const [timestamp, setTimestamp] = useState(0);
    const [constraintReport, setConstraintReport] = useState(0);
    const [constraintLate, setConstraintLate] = useState(0);
    const [constraintCOMinute, setConstraintCOMinute] = useState(0);
    const [overviewIMG, setOverviewIMG] = useState(0);
    const [numberAtt, setNumberAtt] = useState(2);
    const [shopNotCO, setShopNotCO] = useState(0);
    const [shopSO, setShopSO] = useState(0);
    const [noteCO, setNoteCO] = useState(0);
    const [shopNote, setShopNote] = useState(0);
    const [noteReport, setNoteReport] = useState(0);
    const [ktc, setKtc] = useState(0);
    const [notNoteLate, setNotNoteLate] = useState(0);
    const [noteKPI, setNoteKPI] = useState(0);
    const [checkFirstShop, setCheckFirstShop] = useState(0);
    const [checkNumberAtt, setCheckNumberAtt] = useState(0);
    const [typeView, setTypeView] = useState(0);
    const [viewImage, setViewImage] = useState(false);
    const [attendantList, setAttendantList] = useState(null);
    const [swiperList, setSwiperList] = useState(null);
    const [imageIndex, setImageIndex] = useState(0);
    const [checkEditDisplay, setCheckEditDisplay] = useState(0);
    const [isCheckStoreInfo, setCheckStoreInfo] = useState(0);
    const [checkReportEdit, setCheckReportEdit] = useState(0);
    const [checkExactTime, setCheckExactTime] = useState(0);
    const [constraintMaxCOMinute, setConstraintMaxCOMinute] = useState(0)
    const [constraintEarly, setConstraintEarly] = useState(0)

    const scrollViewRef = useRef(null);
    const _sheetAlter = useRef(null);

    const loadData = async () => {
        const workDate = workinfo.workDate || shopinfo.auditDate;
        if (shopinfo !== undefined) {
            await setShowProgress(true);
            const data = await AttendantController.GetAttendant(shopinfo, workDate);
            await CreateTemplate(data);
            await setTimeout(async () => {
                await setShowProgress(false);
            }, 1000);
        }
    };

    const CreateTemplate = async (photoList = []) => {
        var _tem = [];
        var dataSwiper = [];
        if (workinfo.shopId !== undefined) {
            for (let i = 0; i < numberAtt; i++) {
                if (photoList !== undefined && photoList.length > i) {
                    _tem.push(photoList[i]);
                    dataSwiper.push(photoList[i]);
                } else {
                    _tem.push({
                        reportId: 1,
                        shopId: workinfo.shopId,
                        shopCode: workinfo.shopCode,
                        photoType: i,
                        photoDate: workinfo.workDate,
                        latitude: latitudePo || -1,
                        longitude: longitudePo || -1,
                        accuracy: accuracyPo || -1,
                        photoTime: null,
                        photoPath: "../Themes/lotties/facecico.json",
                        dataUpload: 0,
                        fileUpload: 0
                    });
                    break;
                }
            }
        }
        setAttendantList(_tem);
        setSwiperList(dataSwiper);
    };

    const getLocationUserFast = () => {
        const { latitude, longitude, accuracy } = info.coords;
        Geolocation.getCurrentPosition(
            info => {
                const latitude = latitude;
                const longitude = longitude;
                const accuracy = accuracy;
                const mocked = info.mocked;
                const timestamp = info.timestamp;
                setLatitudePo(latitude);
                setLongitudePo(longitude);
                setAccuracyPo(accuracy);
                setTimestamp(timestamp);
                setMocked(mocked);

                if (mocked) {
                    MessageInfo('Chú ý, Bạn đang sử dụng phần mềm tìm cách thay đổi vị trí của bạn, điều này là không được phép trong việc chấm công.');
                    return;
                }
            },
            (error) => console.log(error.message)
        );
    };

    useEffect(() => {
        if (shopinfo !== undefined && workinfo !== undefined) {
            loadForm();
            const unSyncData = DeviceEventEmitter.addListener(SYNC_DATA_ATT, async () => {
                await loadData(false);
            });
            const unSyncConfig = DeviceEventEmitter.addListener(SYNC_DATA_CONFIG, async () => {
                await loadForm();
            })
            const unCameraNote = DeviceEventEmitter.addListener(CAMERA_NOTE, async (note) => {
                startCameraAttendant(note);
            });

            return () => {
                setAttendantList([]);
                setSwiperList([]);
                unSyncData.remove();
                unSyncConfig.remove();
                unCameraNote.remove();
            };
        }
    }, [workinfo]);

    const checkWritePermission = async () => {
        const json = await AsyncStorage.getItem("SETTINGS");
        const setting = await JSON.parse(json) || defaultSetting;
        if (setting.exportAttendant === true) {
            request(
                Platform.select({
                    android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                    ios: PERMISSIONS.IOS.PHOTO_LIBRARY
                })
            ).then(res => {
                if (res == "granted") {
                } else if (res === 'denied') {
                    Alert.alert("Thông báo, Bạn đã từ chối cấp quyền truy cập bộ nhớ!!");
                }
            });
        }
    };

    const loadForm = async () => {
        await CheckLocation(() => {
            setIsPermissLocation(true);
        });
        await checkWritePermission();
        await SetupConfig();
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối");
            return;
        }
        await loadData(true);
    };

    const SetupConfig = async () => {
        let configInfo = shopinfo?.config || '{}';
        const config = JSON.parse(configInfo);

        setConstraintReport(config?.constraintReport || 0);
        setConstraintLate(config?.constraintLate || 0);
        setConstraintCOMinute(config?.constraintCOMinute || 0);
        setOverviewIMG(config?.overviewIMG || 0);
        setShopNotCO(config?.shopNotCO || 0);
        setShopSO(config?.shopSO || 0);
        setNumberAtt(config?.numberAtt || 2);
        setNoteCO(config?.noteCO || 0);
        setShopNote(config?.shopNote || 0);
        setNoteReport(config?.noteReport || 0);
        setKtc(config?.ktc || 0);
        setNotNoteLate(config?.notNoteLate || 0);
        setNoteKPI(config?.noteKPI || 0);
        setCheckFirstShop(config?.checkFirstShop || 0);
        setCheckNumberAtt(config?.checkNumberAtt || 0);
        setCheckEditDisplay(config?.checkEditDisplay || 0);
        setCheckStoreInfo(config?.isCheckStoreInfo || 0);
        setCheckReportEdit(config?.checkReportEdit || 0);
        setCheckExactTime(config?.checkExactTime || 0);
        setConstraintMaxCOMinute(config?.constraintMaxCOMinute || 0);
        setConstraintEarly(config?.constraintEarly || 0);
    };

    const uploadAgain = async (e, photoInfo) => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            await MessageInfo('Không có kết nối. Vui lòng kiểm tra lại kết nối mạng sau đó bấm nút refresh trên tấm hình để gửi lại.');
            return;
        }
        await setShowProgress(true);
        await uploadAgainAttendant(photoInfo);
    };

    const uploadAgainAttendant = async (photoInfo) => {
        let access_token = await Token();
        try {
            let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
            var ImageAsBase64 = await RNFS.readFile(photoInfo.photoPath, 'base64');

            let dataJson = JSON.stringify({
                "ShopId": photoInfo.shopId,
                "ShopCode": photoInfo.shopCode,
                "PhotoName": ImgName,
                "Latitude": photoInfo.latitude,
                "Longitude": photoInfo.longitude,
                "Accuracy": photoInfo?.accuracy || -1,
                "ReportId": photoInfo.reportId,
                "PhotoTime": photoInfo.photoTime,
                "PhotoType": '' + parseInt(photoInfo.photoType),
                "PhotoDate": photoInfo.photoDate,
                "PhotoData": ImageAsBase64,
                "WorkStatus": workinfo.workStatus,
                "ShopName": shopinfo.shopName
            })
            await fetch(URL_UPLOAD_ATTENDANT, {
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token,
                },
                body: dataJson
            })
                .then(response => {
                    return response.json();
                })
                .then(responseJson => {
                    if (responseJson.status == 100) {
                        let isUpdate = UpdateAttendantStatus(photoInfo.shopId, photoInfo.photoDate, photoInfo.photoType);
                        if (isUpdate) {
                            Alert.alert(responseJson.messeger);
                            loadForm()
                        }
                    }
                    else {
                        setShowProgress(false);
                        MessageInfo('Gửi chấm công không thành công. Vui lòng tắt app chạy ngầm/đa nhiệm vào lại rồi ấn vòng xoay để gửi lại. Lỗi: ' + responseJson.messeger + responseJson.status);
                    }
                })
                .catch(error => {
                    setShowProgress(false);
                    MessageInfo('Gửi chấm công không thành công. Vui lòng tắt app chạy ngầm/đa nhiệm vào lại rồi ấn vòng xoay để gửi lại, lỗi: ' + error);
                });
        }
        catch (error) {
            setShowProgress(false);
            MessageInfo('Gửi chấm công không thành công. Vui lòng tắt app chạy ngầm/đa nhiệm vào lại rồi ấn vòng xoay để gửi lại.Lỗi: ' + error);
        }
    };

    const startCameraAttendant = async (notesave) => {
        const config = JSON.parse(shopinfo.config || '{}')
        const cameraConfig = JSON.parse(shopinfo.cameraConfig || '{}')

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        let itemInfo = {
            ...photoInfoClick,
            photoDesc: notesave,
            shopLat: shopinfo.latitude,
            shopLong: shopinfo.longitude,
            latitudePo: latitudePo,
            longitudePo: longitudePo,
            accuracyPo: accuracyPo,
            mocked: mocked,
            timestamp: timestamp,
            shopName: shopinfo.shopName,
            shopinfo: shopinfo,
            lengthJson: cameraConfig?.lengthJson || 0
        }
        if (photoInfoClick !== null) {
            if ((config?.locationTracking || 0) == 1)
                navigation.navigate('locationtracking', itemInfo);
            else
                navigation.navigate('Camera', itemInfo);
        }
    }

    const RequestLocation = (setStatus) => {
        try {
            request(
                Platform.select({
                    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                })
            ).then(res => {
                if (res == "granted") {
                    setStatus(true)
                }
                else {
                    setStatus(false)
                }
            });
        } catch (error) {
            // //console.log("location set error:", error);
        }
    }

    const CheckLocation = (connected) => {
        check(Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then((result) => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        RequestLocation((res) => res === true && connected())
                        break;
                    case RESULTS.DENIED:
                        RequestLocation((res) => res === true && connected())
                        break;
                    case RESULTS.GRANTED:
                        getLocationUserFast()
                        connected();
                        break;
                    case RESULTS.BLOCKED:
                        MessageSetting('Chú ý', Platform.OS === 'ios' ? 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị, Privacy -> Location Services-> Location Services(ON)' : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị', () => {
                            Platform.OS === 'ios' ? Linking.openURL("App-Prefs:root=Privacy&path=LOCATION") :
                                openSettings().catch(() => console.warn('cannot open settings'));;
                        })
                        break;
                }
            })
            .catch((error) => {
                Alert.alert(error + '')
            });
    }

    const checkAcceptToCheckOut = async () => {
        const menulist = await GetMenuKPI(1, shopinfo);
        if (menulist.length > 0) {
            const pTask = await menulist.filter(v => v.taskDone === 0)
            const _tem = await menulist?.sort((a, b) => a.taskDone > b.taskDone)
            setMenuList(_tem);
            if (pTask === null || pTask.length === 0)
                return true
            else {
                return false
            }
        } else return true
    }

    countTime = async (timeLimit, timeClick, type) => {

        function padZero(n) {
            return n < 10 ? '0' + n : n;
        }

        let diffMs = type === 'IN'
            ? timeClick - timeLimit
            : timeLimit - timeClick;

        // đảm bảo không âm
        diffMs = Math.abs(diffMs);

        let totalSeconds = Math.floor(diffMs / 1000);

        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;

        // HH:mm:ss
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }

    const startCamera = async (e, photoInfo) => {
        await getLocationUserFast()
        const PHOTOTYPE = e % 2 === 0 ? CICO.ci : CICO.co
        const config = JSON.parse(shopinfo?.config || '{}')
        const cameraConfig = JSON.parse(shopinfo?.cameraConfig || '{}')
        // Check report Online
        if (config.checkOnline == 1)
            await checkTaskListOnline()
        //
        const menuHome = await GetMenu(0)
        const _fistDone = await menuHome.filter(m => m.fistTask === 1 && m.taskDone === 0)
        if (_fistDone.length > 0) {
            await MessageAcept("Thông báo", `${_fistDone[0].menuNameVN} ${_fistDone[0].taskAlter}`, () => {
                navigation.navigate(_fistDone[0].pageName, { menuitem: _fistDone[0] })
            });
            return;
        }

        setPhotoInfoClick(photoInfo)

        //kiem tra nhap sellout khi checkout
        if (shopSO > 0 && PHOTOTYPE === CICO.co) {
            let resSellout = await getResSellOut(workinfo);
            if (resSellout?.length === 0) {
                ToastError('Vui lòng nhập sellout (Không bán được sản phẩm vui lòng chọn NoSell sau đó gửi lên hệ thống)')
                return
            }
            else {
                let lstHave = resSellout.filter(itemSell => itemSell.upload === 0)
                if (lstHave.length > 0) {
                    ToastError('Bạn có nhập sellout nhưng chưa gửi lên hết, Vui lòng vào lại báo cáo đẩy dữ liệu lên.')
                    return
                }
            }
        }

        //kiểm tra chỉnh sửa báo cáo nhưng chưa gửi
        if (checkReportEdit == 1 && PHOTOTYPE === CICO.co) {
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

        if (isCheckStoreInfo === 1) {
            MessageAction(config.titleCheck || 'Cập nhật dữ liệu cửa hàng', () => this.props.navigation.navigate('updatestore'));
            return
        }

        // check checkOut orther shop
        if (shopNotCO > 0 && PHOTOTYPE === CICO.ci) {
            const lstShop = await AttendantController.countAttShopNotFinish(workinfo);
            const lstHave = await lstShop.filter(item => item.countImage % 2 > 0)//Chia du tuc la chup hinh dang le
            if (await lstHave?.length > 0) {
                await MessageInfo('Vui lòng thực hiện checkout cửa hàng ' + lstHave[0].shopName + ' sau đó thực hiện tiếp checkin cửa hàng khác.')
                return
            }
        }
        // check turn off Edit mode
        if (checkEditDisplay == 1 && PHOTOTYPE === CICO.co) {
            let lstMenu = [];
            lstMenu = await GetMenuKPI(1, shopinfo);
            const itemFilter = lstMenu.filter(item => item.id === 128)
            const isEditStore = await AsyncStorage.getItem(`${shopinfo.shopId}_EDIT`);
            if (isEdit || isEditStore) {
                if (itemFilter.length > 0) {
                    MessageAcept("Thông báo", `Vui lòng thoát chế độ "Chỉnh sửa" trong ${itemFilter[0].name} trước khi Checkout`, () => {
                        dispatch({ type: 'SET_KPI_INFO', payload: itemFilter[0] });
                        navigation.navigate(`${itemFilter[0].pageName}`, { workinfo: workinfo, titlePage: itemFilter[0].name, reportId: itemFilter[0].kpiId })
                    })
                    return
                }
            }
        }

        if (PHOTOTYPE === CICO.co && workinfo.workStatus == 1 && (checkNumberAtt !== 1 || (checkNumberAtt == 1 && numberAtt === (e + 1)))) {
            const pendingTask = await checkAcceptToCheckOut();
            if (noteReport === 1) {
                if (pendingTask === false) {
                    let str = ''
                    menuList.map(it => it.taskDone === 0 && (str += `${str === '' ? it.menuNameVN : (', ' + it.menuNameVN)}`))
                    dispatch({ type: 'NOTE_ATTENDANT', payload: { type: ATTENDANT.NOTEREPORT, content: "Lý do không làm báo cáo " + str } });
                    return
                }
            } else {
                if (pendingTask === false) {
                    await _sheetAlter.current.show()
                    return
                }
            }
        }

        if (PHOTOTYPE === CICO.co && workinfo.workStatus == 0 && ktc == 1) {
            // noteAttendant(ATTENDANT.KTC, "Lí do không thành công")
            return
        }
        if (PHOTOTYPE === CICO.co && noteKPI == 1) {
            // noteAttendant(ATTENDANT.NOTEKPI, "Tình trạng cửa hàng")
            return
        }
        if (constraintCOMinute > 0 && PHOTOTYPE === CICO.co) {
            let timeInMiliLimit = 0
            let photoTimeIn = attendantList[0].photoTime // 2021-11-04 09 35 26
            let timeConvert = moment(photoTimeIn, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss')
            let timeCIMili = moment(timeConvert).utc().valueOf();
            let timeClick = moment().utc().valueOf();
            timeInMiliLimit = timeCIMili + (constraintCOMinute * 60 * 1000);
            if (timeClick < timeInMiliLimit) {
                if (noteCO > 0) {// không cho phép out dù bắt ki lý do gì
                    ToastError('Tổng thời gian ghé thăm dưới ' + constraintCOMinute + ' phút.', 'Thông báo', "top")
                } else {
                    Message('Thông báo', 'Tổng thời gian ghé thăm dưới ' + constraintCOMinute + ' phút. Vui lòng nhập lý do ở dưới đây sau đó check out.', () => {
                        setNoteAttType(1)
                        // noteAttendant(ATTENDANT.NOTE, "Ghi chú thời gian ghé thăm")
                    })
                }
                return;
            }
        }

        if (constraintMaxCOMinute > 0 && PHOTOTYPE === CICO.co) {
            let timeInMiliLimit = 0
            let photoTimeIn = attendantList[0].photoTime // 2021-11-04 09 35 26
            let timeConvert = moment(photoTimeIn, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss')
            let timeCIMili = moment(timeConvert).utc().valueOf();
            let timeClick = moment().utc().valueOf();
            timeInMiliLimit = timeCIMili + (constraintMaxCOMinute * 60 * 1000);

            if (timeClick > timeInMiliLimit) {
                if (noteCO > 0) {// không cho phép out dù bắt ki lý do gì
                    ToastError('Tổng thời gian ghé thăm trên ' + constraintMaxCOMinute + ' phút.', 'Thông báo', "top")
                } else {
                    Message('Thông báo', 'Tổng thời gian ghé trên ' + constraintMaxCOMinute + ' phút. Vui lòng nhập lý do ở dưới đây sau đó check out.', () => {
                        setNoteAttType(1)
                        // noteAttendant(ATTENDANT.NOTE, "Ghi chú thời gian ghé thăm")
                    })
                }
                return;
            }
        }

        if (constraintLate > 0 || constraintEarly > 0) {
            if (checkFirstShop == 1) {
                let isResultIn = true
                let isResultOut = true
                // CHECKIN Trễ
                await ATTENDANT_API.validTimeAttendant('IN', async (itemTime, message) => {
                    message && ToastError(message, 'Lỗi dữ liệu', 'top')
                    //
                    if (itemTime.isCheckTimeIn == 0) {
                        const defaultTime = moment()
                        const validTime = moment(shopinfo.timeIn).add('minute', constraintLate)
                        const minuteBetween = validTime.diff(defaultTime, 'minute')
                        if (minuteBetween < 0) {
                            Message('Thông báo', `Bạn đang "CHECK IN" trễ ${minuteBetween * -1} phút so với thời gian làm việc là ${moment(shopinfo.timeIn).format('HH:mm')}. Vui lòng nhập ghi chú và tiếp tục Check In.`, () => {
                                setNoteAttType(0)
                                // noteAttendant(ATTENDANT.NOTE, "Nhập lý do CHECK IN trễ")
                            })
                            isResultIn = false
                        }
                    }
                })
                if (!isResultIn)
                    return
                // CHECKOUT Sớm
                await ATTENDANT_API.validTimeAttendant('OUT', async (itemTime, message) => {
                    message && ToastError(message, 'Lỗi dữ liệu', 'top')
                    // 
                    if (itemTime.isCheckTimeOut == 0) {
                        const defaultTime = moment()
                        const validTime = moment(shopinfo.timeOut).add('minute', -constraintLate)
                        const minuteBetween = defaultTime.diff(validTime, 'minute')
                        if (minuteBetween < 0) {
                            Message('Thông báo', `Bạn đang "CHECK OUT" sớm ${minuteBetween * -1} phút so với thời gian làm việc là ${moment(shopinfo.timeOut).format('HH:mm')}. Vui lòng nhập ghi chú và tiếp tục chấm công`, () => {
                                setNoteAttType(1)
                                // noteAttendant(ATTENDANT.NOTE, "Nhập lý do checkout sớm")
                            })
                            isResultOut = false
                        }
                    }
                })
                if (!isResultOut) return
            } else {
                let timeClick = moment().utc().valueOf();
                if (PHOTOTYPE === CICO.ci && e === 0 && constraintLate > 0) {
                    let timeIn = shopinfo.timeIn
                    let timeInMili = moment(timeIn).utc().valueOf();
                    let timeInMiliLimit = timeInMili + (constraintLate * 60 * 1000);
                    if (timeClick > timeInMiliLimit) {
                        let time = await countTime(timeInMili, timeClick, 'IN')
                        if (notNoteLate === 0 || notNoteLate == 3) {
                            Message('Thông báo', 'Bạn đang checkIn trễ ' + time + ' so với thời gian làm việc là ' + moment(timeIn).format('HH:mm') + '. Vui lòng nhập ghi chú ở dưới đây sau đó check in.', () => {
                                setNoteAttType(0)
                                // noteAttendant(ATTENDANT.NOTE, "Nhập lý do checkIn trễ")
                            })
                            return;
                        } else {
                            await MessageInfo('Bạn đang checkIn trễ ' + time + ' so với thời gian làm việc ' + moment(timeIn).format('HH:mm') + '.')
                        }
                    }
                }
                else if (PHOTOTYPE === CICO.co && numberAtt === (e + 1)) {
                    let timeOut = shopinfo.timeOut
                    let timeOutMili = moment(timeOut).utc().valueOf();
                    let timeOutMiliLimit = timeOutMili - ((constraintEarly || constraintLate) * 60 * 1000);
                    if ((timeClick < timeOutMiliLimit && checkExactTime != 1) || (checkExactTime == 1 && timeClick < timeOutMili)) {
                        let time = await countTime(timeOutMili, timeClick, 'OUT')
                        if (notNoteLate === 0) {
                            Message('Thông báo', 'Bạn đang checkOut sớm ' + time + ' so vơi thời gian làm việc là ' + moment(timeOut).format('HH:mm') + '. Vui lòng nhập ghi chú lý do ở dưới đây sau đó check out.', () => {
                                setNoteAttType(1);
                                // noteAttendant(ATTENDANT.NOTE, "Nhập lý do checkout sớm");
                            })
                            return
                        } else {
                            await MessageInfo('Bạn đang checkOut sớm ' + time + ' so vơi thời gian làm việc là ' + moment(timeOut).format('HH:mm') + '.')
                        }
                    }
                }
            }
        }

        if (shopNote === 1 && PHOTOTYPE === CICO.ci) {
            noteAttendant(ATTENDANT.SHOPNOTE, "Nhập ghi chú (Nếu có)")
            return
        }

        const deviceId = await DeviceInfo.getUniqueId()
        let itemPhotoInfo = {
            ...photoInfo,
            shopLat: shopinfo.latitude,
            shopLong: shopinfo.longitude,
            latitudePo: latitudePo,
            longitudePo: longitudePo,
            accuracyPo: accuracyPo,
            guiId: deviceId,
            mocked: mocked,
            timestamp: timestamp,
            shopinfo: shopinfo,
            lengthJson: cameraConfig?.lengthJson || 0
        }
        if (photoInfo.photoTime === null && isPermissLocation === true) {
            if ((config?.locationTracking || 0) == 1)
                navigation.navigate('locationtracking', itemPhotoInfo);
            else
                navigation.navigate('Camera', itemPhotoInfo);
        } else {
            ToastError('Vui lòng kiểm tra lại quyền truy cập vị trí của thiết bị')
        }
    }

    const renderItem = ({ item, index }) => {
        const onPress = () => {
            const _currentDate = parseInt(moment().format("YYYYMMDD"))
            if (workinfo.workDate === _currentDate) {
                startCamera(item.photoType, item)
            } else
                ToastError("Bạn không được chấm công ngày cũ")
        }
        return (
            <View key={"Asd" + index} style={{ width: deviceSize.dwidth / 1.8, marginEnd: 7, backgroundColor: appcolor.surface }}>
                <TouchableOpacity
                    onPress={onPress} style={{ flex: 1 }}>
                    <View style={{ width: '100%' }}>
                        {
                            (item.photoTime < 100) ?
                                <View style={{ backgroundColor: appcolor.light, width: '99%', height: '99%', alignSelf: 'center' }}>
                                    <LottieView autoPlay style={{ height: '100%' }}
                                        source={require("../Themes/lotties/facecico.json")} />
                                </View>
                                :
                                <View style={{ width: '100%', height: '100%' }}>
                                    <TouchableOpacity onPress={() => { setViewImage(true); setImageIndex(index) }}>
                                        <CacheImage ref={ref => _refImage = ref} resizeMode={'cover'} source={{
                                            uri: item.photoPath !== null && (item.photoPath.indexOf('file://') > -1 || item.photoPath.indexOf('https://') > -1 ? item.photoPath : URLDEFAULT + item.photoPath)
                                        }} />
                                        <Icon
                                            color={(item.fileUpload == 1 && item.dataUpload == 1) ? appcolor.success :
                                                ((item.fileUpload == 1 && item.dataUpload == 0) ? appcolor.warning :
                                                    ((item.fileUpload == 0 && item.dataUpload == 1) ? appcolor.tomato :
                                                        appcolor.greydark))}
                                            containerStyle={{ position: 'absolute', top: 10, right: 10 }}
                                            name="check-circle" size={30} type="font-awesome-5"
                                            activeOpacity={0.7}
                                        />
                                    </TouchableOpacity>
                                    {item.dataUpload === 0 &&
                                        <TouchableOpacity onPress={(e) => uploadAgain(e, item)}
                                            style={{ width: '100%', height: '100%', position: 'absolute', justifyContent: 'center' }}>
                                            <Icon
                                                color={appcolor.danger}
                                                name='autorenew'
                                                size={70}
                                                activeOpacity={0.7}
                                            />
                                        </TouchableOpacity>
                                    }
                                </View>
                        }
                    </View>
                    <Text style={{
                        position: 'absolute',
                        width: '100%', textAlign: 'center', padding: 5,
                        fontSize: 14, fontWeight: "600", color: appcolor.primary
                    }}>{(item.photoType % 2 == 0 ? `CheckIn` : 'Check out')}</Text>
                    {item?.photoTime > 0 &&
                        <Text style={{
                            position: 'absolute', marginTop: '80%', textAlign: 'center', width: '100%', backgroundColor: appcolor.light,
                            fontSize: scaleSize(10), fontWeight: "600", color: appcolor.dark, padding: 2
                        }}>
                            {moment(item.photoTime, 'YYYYMMDDHHmmss').format('HH:mm:ss dddd DD/MM')}
                        </Text>
                    }
                </TouchableOpacity>
            </View >
        )
    }

    return (
        <View keyboardShouldPersistTaps='handled'
            style={{
                height: deviceWidth / 1.8, width: '100%', padding: 7,
                backgroundColor: appcolor.light, alignItems: 'center'
            }}>
            <ScrollView
                ref={scrollViewRef}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                showsHorizontalScrollIndicator={false}
                horizontal>
                {
                    attendantList !== null && attendantList.length > 0 ?
                        attendantList?.map((item, index) => {
                            return (renderItem({ item, index }));
                        })
                        : <View>
                            <Text style={{ color: appcolor.danger, fontWeight: 'bold', padding: 3 }}>Ngày {moment(workinfo.workDate, "YYYYMMDD").format("dddd D MMMM YYYY")} bạn không chấm công</Text>
                        </View>
                }
            </ScrollView>
            <LoadingView styles={{ top: -50 }} isLoading={showProgress} />
            <Modal visible={viewImage}>
                <MultipleShowImage key={'ShowItemImage'} listItem={swiperList} closeShowImage={() => setViewImage(false)} indexItem={imageIndex} />
            </Modal>
            <ActionSheet containerStyle={{ backgroundColor: appcolor.surface }} ref={_sheetAlter}>
                <View style={{ width: '100%', height: deviceHeight / 1.5 }}>
                    <View style={{ padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontSize: scaleSize(12), color: appcolor.dark }}>Công việc phải hoàn thành</Text>
                    </View>
                    <ScrollView style={{ height: deviceHeight * 0.5 }}>
                        <FlatList
                            data={menuList}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={{ width: '100%', padding: 12 }} key={index + "jha"}>
                                        <Text style={{
                                            fontWeight: '700',
                                            fontSize: scaleSize(15), color: appcolor.dark
                                        }}>{item.menuNameVN}</Text>
                                        <Text style={{
                                            color: item.taskDone === 1 ? appcolor.success : item.taskDone === 2 ?
                                                appcolor.warning : appcolor.danger, textAlign: 'right', fontSize: scaleSize(12), fontStyle: 'italic'
                                        }}>{item.taskDone === 1 ? 'Đã hoàn thành' : item.taskAlter || ''}</Text>
                                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
                                    </View>
                                );
                            }}
                        />
                    </ScrollView>
                </View>
            </ActionSheet>
        </View>
    );
};

export default Attendant;
