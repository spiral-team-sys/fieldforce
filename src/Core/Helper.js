import { Alert, Linking, NetInfo, Platform, Dimensions, BackHandler, PermissionsAndroid, processColor, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alertConfirm, alertError, ConvertToInt, TODAY, imageSize } from './Utility';
import DeviceInfo from 'react-native-device-info';
import { check, RESULTS, PERMISSIONS, request, openSettings } from 'react-native-permissions'
import moment from 'moment';
import Share from 'react-native-share';
import { URL_CHECK_IMEI, URLDEFAULT, URL_TIME, AppNameBuild, lgApp, bekoApp, AppStoreURL, toshibaApp, URL_CHECK_IMEI2, DEFAULT_COLOR } from './URLs';
import base64 from 'react-native-base64'
import Toast from 'react-native-toast-message';
// import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs'
import uuid from 'react-native-uuid';
import { checkVersion } from "react-native-check-version";
import { toastSuccess } from '../Utils/configToast';
import CodePush from '@revopush/react-native-code-push';

export function UUIDGenerator() {
    return uuid.v4();
}
export const TOKEN_KEY = AppNameBuild === "lg" ? "lgtoken" : "token"
export const AUTH_SESSION_EXPIRED_EVENT = "AUTH_SESSION_EXPIRED"

let isHandlingUnauthorized = false;

export const logoutExpiredSession = async () => {
    if (isHandlingUnauthorized) return
    isHandlingUnauthorized = true;
    await AsyncStorage.multiRemove([TOKEN_KEY, "EmployeeId", "Employee"]);
    ToastError('Vui lòng đăng nhập lại', 'Phiên đăng nhập đã hết hạn', 'top');
    DeviceEventEmitter.emit(AUTH_SESSION_EXPIRED_EVENT);
    setTimeout(() => {
        isHandlingUnauthorized = false;
    }, 1500);
}

export const requestVersionIOS = async (finish) => {
    let StoreID = AppNameBuild
    if (URLDEFAULT.includes("asm-api")) {
        StoreID = 'lgasm'
    } else if (URLDEFAULT.includes("md-api")) {
        StoreID = 'lgmd'
    }
    const AppStore = `itms-services://?action=download-manifest&url=${AppStoreURL}/${StoreID}/production/manifest.plist`
    try {
        const Appversion = await DeviceInfo.getVersion();
        const requestInfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Cache-Control': 'no-cache'
            }
        }
        const response = await fetch(`${URLDEFAULT}public/appver`, requestInfo)
        const result = await response.json()
        if (result.statusId === 200) {
            if (Appversion !== result.messager) {
                finish(true)
                if (Linking.canOpenURL(AppStore))
                    MessageAcept('Cập nhật phần mềm', `Đã có bản cập nhật phần mềm ${result.messager} bạn phải cập nhật trước khi thực hiện công việc.`,
                        () => {
                            Linking.openURL(AppStore).then(result => {
                                console.log(result)
                            })
                            BackHandler.exitApp();
                        })
                else {
                    alertError("Can't open url")
                }
            } else {
                finish(false)
            }
        } else {
            finish(false)
        }
    } catch (err) {
        // console.log(err)
    }
}

// export const getCodePushKey = () => {
//     const app = Revopush.apps[AppNameBuild]
//     return Platform.OS === 'ios'
//         ? app.deploymentKeys.ios
//         : app.deploymentKeys.android
// }

export const UpdateApp = (result) => {
    try {
        if (Platform.OS === 'ios') {
            requestVersionIOS(result)
        } else {
            checkVersion().then(resver => {
                if (resver.needsUpdate) {
                    result(true)
                    MessageAcept('Cập nhật phần mềm', `Hiện đã có phiên bản cập nhật mới ${resver.version} (${resver.notes || ''}). Bạn phải cập nhật trước khi thực hiện công việc`, () => {
                        Linking.openURL(resver.url);
                        BackHandler.exitApp()
                    })
                } else {
                    result(false)
                }
            });
        }
    } catch (err) {
        console.log(err)
        result(false)
    }
}
export const ToastSuccess = (message, title, pos) => {
    Toast.show({
        type: 'success',
        text1: title || 'Thông báo',
        text2: message,
        position: pos || 'bottom'
    })
}
export const ToastError = (message, title, pos) => {
    Toast.show({
        type: 'error',
        text1: title || 'Thông báo',
        text2: message,
        position: pos || 'bottom'
    })
}
export const defaultSetting = {
    mode: false,
    faceId: false,
    google: false,
    facebook: false,
    exportAttendant: (AppNameBuild === lgApp || AppNameBuild === bekoApp || toshibaApp) ? true : false,
    exportPhotoReport: AppNameBuild === lgApp ? true : false,
    cleanDataPhoto: { 'isOpenClean': false, 'cleanFrom': 1, 'isWeek': false }
}
export const GetUrl = (urlFile) => {
    if (urlFile === undefined || urlFile === null)
        return null
    else if (urlFile.indexOf("file://") > -1)//Local
        return urlFile
    else if (urlFile.indexOf("http") > -1)//Server
        return urlFile
    else return (URLDEFAULT + urlFile)
}
export const getPhotoUri = (PhotoPath) => {
    const rawPath = typeof PhotoPath === 'string' ? PhotoPath.trim() : ''
    if (!rawPath || rawPath.toLowerCase() === 'null' || rawPath.toLowerCase() === 'undefined') return ''
    const isFull = rawPath.indexOf('file://') > -1 || rawPath.indexOf('https://') > -1 || !rawPath.includes('uploaded')
    return isFull ? rawPath : (URLDEFAULT + rawPath)
}

export function lowCaseFirst(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}
export const deviceSize = {
    dwidth: Dimensions.get("window").width,
    dheight: Dimensions.get("window").height
}
export const onShareLocalFile = async (dataShare, callback) => {
    try {
        if (Platform.OS === "android") {
            if (Platform.Version < 33) {
                toastSuccess("Đang tiến hành");
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Yêu cầu quyền",
                        message: "Vui lòng cấp quyền truy cập bộ nhớ để tiếp tục",
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED && Platform.OS === "android") {
                    MessageInfo("Lỗi, permission denied");
                    return;
                }
                Share.open(dataShare).then(async (res) => {
                    console.log('res', res);
                    if (res.success) {
                        toastSuccess('Chia sẻ thành công')
                        callback && callback()
                    }
                }).catch((err) => {
                    console.log('err', err);
                });
            }
            else {
                Share.open(dataShare);
            }
        } else {
            Share.open(dataShare).then((res) => {
                console.log('res', res);
                if (res.success) {
                    toastSuccess('Chia sẻ thành công')
                    callback && callback()
                }
            }).catch((err) => {
                console.log('err', err);
            });
        }
    } catch (err) {
        MessageInfo("Lỗi, Ứng dụng chưa được cấp quyền", err);
    }
};
export const getStore = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return value;
        }
    } catch (error) {
        return null
    }
}
export const saveStore = async (key, value) => {
    await AsyncStorage.setItem(key, value);
}
export const removeStore = async (key) => {
    await AsyncStorage.removeItem(key);
}

export const colorList = [DEFAULT_COLOR, '#E74C3C', '#3498DB', '#27AE60', '#F39C12', '#9B59B6', '#2C3E50', '#1ABC9C', '#D35400', '#2980B9', '#8E44AD', '#7F8C8D', '#E67E22', '#C0392B', '#16A085', '#F1C40F', '#34495E', '#9C640C', '#E74C3C'];

export const ColorRand = (index, list) => {
    const dataColor = list || colorList
    if (index === undefined || (index !== undefined && index > dataColor.length - 1)) {
        index = ConvertToInt(Math.random() * dataColor.length || 0)
    }
    index = index % dataColor.length
    return dataColor[index];
}
export const formatCard = (str, k) => {
    str = str
        // Remove the white spaces
        .trim()
        // Replace all the special
        // characters with ""
        .replace(/[^a-zA-Z0-9]/g, "")
        // Transform the string into
        // uppercase characters
        .toUpperCase()
        // Convert the string into array
        .split("");
    let len = str.length;
    for (let i = len; i > 0; i = i - k) {
        if (i != len) {
            // Concatenate the string with "-"
            str[i - 1] = str[i - 1] + "-";
        }
    }

    //  Join the array to make it a string
    return str.join("");
}
export const formatPhone = (dirtyNumber) => {
    if (dirtyNumber.length == 10) {
        return dirtyNumber.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else {
        return dirtyNumber.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '($1) $2-$3');
    }
}
export const isPhone = (phone) => {
    //normalize string and remove all unnecessary characters
    phone = phone?.replace(/\D+/g, '');
    return ((phone.length == 10 || phone.length == 11) && phone.indexOf('0') === 0) ? true : false;
}
export function distanceBetween2Points(la1, lo1, la2, lo2) {
    let R = 6371;
    let dLat = (la2 - la1) * (Math.PI / 180);
    let dLon = (lo2 - lo1) * (Math.PI / 180);
    let la1ToRad = la1 * (Math.PI / 180);
    let la2ToRad = la2 * (Math.PI / 180);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(la1ToRad) * Math.cos(la2ToRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
}
export function requestTimeout(ms, promise, err) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(err('TIMEOUT'))
        }, ms)
        if (promise !== undefined) {
            promise.then(value => {
                clearTimeout(timer)
                resolve(value)
            }).catch(reason => {
                clearTimeout(timer)
                reject(reason)
            })
        } else {
            clearTimeout(timer)
        }
    })
}
const fetchServerTime = async () => {
    var requestInfo = {
        method: 'GET',
        headers: {
            "Content-Type": "text/plain",
        }
    }
    const response = await fetch(URL_TIME, requestInfo)
    if (response.status === 200) {
        return await response.text();
    } else {
        const response2 = await fetch(URL_TIME, requestInfo)
        if (response2.status === 200) {
            return await response2.text();
        } else {
            return null
        }
    }
}
export const CheckTimeServer = async () => {
    const serverTime = await PUBLIC_API.GetTimeServer()
    if (!serverTime) {
        return {
            success: false,
            message:
                "Hiện lượng truy cập quá cao, Anh/chị vui lòng ngưng thao tác và thử lại sau vài phút.",
        }
    }
    //
    const now = moment()
    const online = moment(serverTime, "YYYY-MM-DD HH:mm:ss")

    const sameHour = now.format("YYYY-MM-DD HH") === online.format("YYYY-MM-DD HH")
    const minuteDiff = Math.abs(now.minutes() - online.minutes())

    if (!sameHour || minuteDiff > 4) {
        return {
            success: false,
            message: `Thời gian hiện tại là: ${online.format("YYYY-MM-DD HH:mm")}, ` +
                `Thời gian thiết bị: ${now.format("YYYY-MM-DD HH:mm")}. ` +
                `Bạn vui lòng kiểm tra lại thời gian trong phần cài đặt của máy.`
        }
    }

    return { success: true }
}
export async function OnTime(Okey, Error) {
    const time = await fetchServerTime()
    if (time !== null) {
        const localTime = moment().format("YYYY-MM-DD HH")
        const onlineTime = moment(time, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH")
        const onMinus = parseInt(moment(time, "YYYY-MM-DD HH:mm:ss").format("mm"))
        const offMinus = parseInt(moment().format("mm"))
        const accuracyTime = Math.abs(onMinus - offMinus)
        if (localTime !== onlineTime || accuracyTime > 4) {
            await MessageInfo(`Thời gian hiện tại là :${time}, Thời gian thiết bị ${moment().format("YYYY-MM-DD HH:mm")} Bạn vui lòng kiểm tra lại thời gian trong phần cài đặt của máy.`)
            // Error
            typeof Error === 'function' && Error()
        }
        else {
            await Okey();
        }
    } else {
        await MessageInfo(`Hiện lượng truy cập quá cao, Anh/chị vui lòng ngưng thao tác và thử lại sau vài phút.`)
        typeof Error === 'function' && Error()
    }

}
export async function OnTimeReport(Okey) {
    let timeClick = moment().utc().valueOf();
    let datetimeObj = await fetchTimeHCM();
    let timeSrv = moment(datetimeObj).valueOf();
    let timeLimitFrom = timeSrv - (5 * 60 * 1000);
    let timeLimitTo = timeSrv + (5 * 60 * 1000);
    // //console.log(timeLimitFrom + ' - ' + timeClick + ' - ' + timeLimitTo)
    if (timeLimitFrom <= timeClick && timeClick <= timeLimitTo) {
        Okey();
    }
    else {
        MessageInfo("Vui lòng không gửi dữ liệu ngày cũ.")
    }
}
export function RequestLocation(setStatus) {

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
export function CheckLocation(connected) {
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
        });
}
export function MessageSetting(title, message, finish) {
    Alert.alert(
        title,
        message,
        [
            {
                text: 'Huỷ',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Cài đặt',
                onPress: () => {
                    finish();
                }
            },
        ],
        { cancelable: false },
    );
}
export function OptionProfile(title, message, takecamera, attackFile) {
    Alert.alert(
        title || 'Chức năng',
        message || 'Thêm hình cho profile',
        [
            {
                text: 'Huỷ',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            takecamera && {
                text: 'Chụp hình',
                onPress: () => {
                    takecamera()
                },
            },
            attackFile && {
                text: 'Thư viện hình ảnh',
                onPress: () => {
                    attackFile();
                }
            },
        ],
        { cancelable: false },
    );
}
export function OptionCameraPOP(title, message, takeCamera, viewPhoto) {
    Alert.alert(
        title || 'Chức năng',
        message || 'Chụp ảnh POP',
        [
            {
                text: 'Huỷ',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            takeCamera && {
                text: 'Chụp ảnh',
                onPress: () => {
                    takeCamera();
                }
            },
            viewPhoto && {
                text: 'Xem ảnh',
                onPress: () => {
                    viewPhoto();
                }
            },
        ],
        { cancelable: false },
    )
}

export function Message(title, message, finish, cancel, textYes, textNo) {
    Alert.alert(
        title,
        message,
        [
            {
                text: textNo ? textNo : 'Huỷ',
                onPress: () => typeof cancel === 'function' ? cancel() : console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: textYes ? textYes : 'Đồng ý',
                onPress: () => {
                    finish();
                }
            },
        ],
        { cancelable: false },
    );
}
export function LocationEnabled(connected) {
    DeviceInfo.isLocationEnabled().then(enabled => {
        if (enabled) {
            connected(enabled);
        } else {
            MessageSetting('Chú ý', Platform.OS === 'ios' ? 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị, Privacy -> Location Services-> Location Services(ON)' : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị', () => {
                Platform.OS === 'ios' ? Linking.openURL("App-Prefs:root=Privacy&path=LOCATION") :
                    Linking.openSettings();
            })
        }
    }).catch((e) => {
        ToastError("ERROR: " + e)
    });
}
export function MessageInfo(message) {
    Alert.alert(
        'Thông báo',
        message,
        [
            {
                text: 'Ok',
                onPress: () => {
                    //console.log('')
                }
            },
        ],
        { cancelable: false },
    );
}
export function MessageAcept(title, message, accept) {
    Alert.alert(
        title || 'Thông báo',
        message,
        [
            {
                text: 'Đồng ý',
                onPress: accept
            },
        ],
        { cancelable: false },
    );
}
export function MessageContinue(message, finish) {
    Alert.alert(
        'Thông báo',
        message,
        [
            {
                text: 'Không',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Tiếp tục',
                onPress: () => {
                    finish();
                }
            },
        ],
        { cancelable: false },
    );
}
export function MessageAction(message, finish, text1, text2) {
    Alert.alert(
        'Thông báo',
        message,
        [
            {
                text: text1 || 'Không',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: text2 || 'Đồng ý',
                onPress: () => {
                    finish();
                }
            },
        ],
        { cancelable: false },
    );
}
export function MessageAction2(message, ok, notok, text1, text2) {
    Alert.alert(
        'Thông báo',
        message,
        [
            {
                text: text1 || 'Không',
                onPress: () => notok(),
                style: 'cancel',
            },
            {
                text: text2 || 'Đồng ý',
                onPress: () => {
                    ok();
                }
            },
        ],
        { cancelable: false },
    );
}
export function ManageMessenger(props) {
    props.navigation.navigate('Notification');
}
export function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
export async function isLogin() {
    let access_token = await AsyncStorage.getItem(TOKEN_KEY);
    if (access_token != null && access_token != "0") {
        return "Welcome";
    }
    else {
        return null;
    }
}
export async function Token() {
    var access_token = await AsyncStorage.getItem(TOKEN_KEY);
    return access_token;
}
export const GetToken = async () => {
    var token = await AsyncStorage.getItem(TOKEN_KEY);
    return `Bearer ${token}`
}
export const StringTobase64 = (str) => {
    return base64.encode(unescape(encodeURIComponent(str)));
}
export async function GetAsyncStorage(KEYMAP) {
    var resultvalue = null;
    await AsyncStorage.getItem(KEYMAP).then(value => {
        resultvalue = value;
    })
    return resultvalue;
}
export async function GetEmployeeInfo() {
    try {
        let Employee = await AsyncStorage.getItem("Employee");
        return JSON.parse(Employee || '{}') || {};
    } catch (e) {
        return {}
    }
}
export function countList(arr) {
    return (arr) ? arr.filter(obj => obj !== null).length : 0;
}
export const removeVietnameseTones = (str) => {
    if (!str || typeof str !== 'string') return ""
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    str = str.replace(/\s+/g, "");
    str = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // tránh crash app khi nhập "("
    str = str.trim();
    return str;
}
export const toTitleCaseText = (value = "") => {
    return value
        .toString()
        .toLocaleLowerCase("vi-VN")
        .replace(/(^|[\s\-\/().,])([^\s\-\/().,])/g, (_match, separator, character) => `${separator}${character.toLocaleUpperCase("vi-VN")}`);
}
export async function UploadData(url, data) {
    console.log(data, "s")
    var results = null;
    try {
        let token = await GetToken();
        await fetch(url, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: data,
        }).then((response) => response.json())
            .then((responseJson) => {
                results = responseJson;
            });
    } catch (error) {
        //console.log(error);
    }
    return results;
}
export async function checkIMEI(IMEI, productCode) {
    var data = null;
    let dataBody = {
        "WorkDate": IMEI,
        "Details": productCode
    }
    try {
        let token = await GetToken();
        await fetch(URL_CHECK_IMEI, {
            method: 'POST',
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            }),
            body: JSON.stringify(dataBody)
        }).then((response) => response.json())
            .then((responseJson) => {
                data = responseJson;
            });
    } catch (error) {
        //console.log(error);
    }

    return data;
}
export async function checkIMEI2(IMEI, IMEI2, productCode) {
    var data = null;
    let dataBody = {
        "IMEI": IMEI,
        "IMEI2": IMEI2,
        "ProductCode": productCode
    }
    try {
        let token = await GetToken();
        await fetch(URL_CHECK_IMEI2, {
            method: 'POST',
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
            }),
            body: JSON.stringify(dataBody)
        }).then((response) => response.json())
            .then((responseJson) => {
                data = responseJson;
            });
    } catch (error) {
        //console.log(error);
    }

    return data;
}
export function cleanURL(url) {
    if (!url) return '';
    // Trim leading and trailing spaces
    // url = url.trim();
    // Xử lý mọi giao thức đúng chuẩn: thêm dấu "/" nếu thiếu
    url = url.replace(/(https?:)\/{1,}([^/])/g, '$1//$2');
    // Xử lý nhiều dấu '/' dư thừa (ngoài phần giao thức)
    url = url.replace(/([^:])\/{2,}/g, '$1/');
    url = url.replace(/\\/g, '/');
    return url;
}
export async function fechPost(url) {
    var data = null;
    try {
        let token = await Token();
        await fetch(url, {
            method: 'POST',
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                data = responseJson;
            });
    } catch (error) {
        //console.log(error);
    }
    return data;
}
export async function fetchGet(url) {
    try {
        let token = await GetToken();

        const deviceId = await DeviceInfo.getUniqueId()

        const requestinfo = {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": token,
                "DeviceId": deviceId
            },
        }
        const response = await fetch(url, requestinfo);
        const responseText = await response.text();

        if (response.status === 401) {
            await logoutExpiredSession();
            return { statusId: 401, messager: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', data: [] };
        }

        if (!responseText) {
            return { statusId: response.status, messager: 'Không nhận được dữ liệu từ hệ thống', data: [] };
        }

        const result = JSON.parse(responseText);
        if (Number(result?.statusId) === 401) {
            await logoutExpiredSession();
        }

        return await result;
    } catch (error) {
        return [{ statusId: '404', messager: 'Không thể kết nối tới hệ thống', data: [] }];
    }
}
export async function InternetConnected() {
    let Connected = false;
    if (Platform.OS === "android") {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                Connected = true;
            }
        });
    } else {
        // For iOS devices
        NetInfo.isConnected.addEventListener(
            "connectionChange",
            Connected = handleFirstConnectivityChange
        );
    }
    return Connected;
}
const handleFirstConnectivityChange = isConnected => {
    NetInfo.isConnected.removeEventListener(
        "connectionChange",
        this.handleFirstConnectivityChange
    );
    return isConnected;
};
export const groupDataByKey = ({ arr, key, keyLayer2 = null, keyLayer3 = null, subArrKey = null, subKey = null, func = null, subFunc = null }) => {
    try {
        let lastKey = null, lastKeyLayer2 = null, lastKeyLayer3 = null, lenArr = arr.length,
            lastSubKey = null, anonymous = {}, subAnonymous = {}

        // thêm biến index group
        let groupIndex = 0
        let indexInGroup = 0

        const mapSubArr = (i) => {
            let subArr = arr[i][subArrKey]

            let subGroupIndex = 0
            let subIndexInGroup = 0
            lastSubKey = null

            for (let j = 1, lenSubArr = subArr.length; j < lenSubArr; j++) {
                if ((lastSubKey && subArr[j][subKey] !== lastSubKey) || !lastSubKey) {
                    subArr[j].isSubParent = true
                    lastSubKey = subArr[j][subKey]

                    subGroupIndex++
                    subIndexInGroup = 1
                } else {
                    subArr[j].isSubParent = false
                    subIndexInGroup++
                }

                // thêm index cho sub
                subArr[j].subGroupIndex = subGroupIndex
                subArr[j].subIndexInGroup = subIndexInGroup

                typeof subFunc === "function" && subFunc(subArr[j], subAnonymous, j, lenArr)
            }
        }
        for (let i = 0, lenRetArr = arr.length; i < lenRetArr; i++) {
            if (!lastKey || (lastKey && arr[i][key] !== lastKey)) {
                arr[i].isParent = true
                lastKey = arr[i][key]
                lastKeyLayer2 = null
                lastKeyLayer3 = null

                // tăng group index khi gặp group mới
                groupIndex++
                indexInGroup = 1

                subArrKey && mapSubArr(i)
            } else {
                arr[i].isParent = false
                indexInGroup++
            }

            // thêm index vào item
            arr[i].groupIndex = groupIndex
            arr[i].indexInGroup = indexInGroup

            if (keyLayer2) {
                if (!lastKeyLayer2 || (lastKeyLayer2 && arr[i][keyLayer2] !== lastKeyLayer2 && arr[i][key] === lastKey)) {
                    arr[i][`${arr[i][key]}${arr[i][keyLayer2]}`] = true
                    lastKeyLayer2 = arr[i][keyLayer2]
                    lastKeyLayer3 = null
                } else arr[i][`${arr[i][key]}${arr[i][keyLayer2]}`] = false
            }
            if (keyLayer3) {
                if (!lastKeyLayer3 || (lastKeyLayer3 && arr[i][keyLayer3] !== lastKeyLayer3 && arr[i][keyLayer2] === lastKeyLayer2)) {
                    arr[i][`${arr[i][key]}${arr[i][keyLayer2]}${arr[i][keyLayer3]}`] = true
                    lastKeyLayer3 = arr[i][keyLayer3]
                } else arr[i][`${arr[i][key]}${arr[i][keyLayer2]}${arr[i][keyLayer3]}`] = false
            }
            typeof func === "function" && func(arr[i], anonymous, i, lenArr, arr)
        }
        return { arr, anonymous, subAnonymous }
    } catch (e) {
        //console.log(e)
        return { arr: [], anonymous: {}, subAnonymous: {} }
    }
}
export const confirmAndCall = (phoneNumber) => {
    alertConfirm('Xác nhận', `Bạn có muốn gọi số "${phoneNumber}" không?`, () => { Linking.openURL(`tel:${phoneNumber}`) })
};

export const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
        if (callNow) func.apply(context, args);
    }
}
export const throttling = (func, delay) => {
    let toThrottle = false
    return function () {
        if (!toThrottle) {
            toThrottle = true
            func.apply(this, arguments)
            setTimeout(() => {
                toThrottle = false
            }, delay);
        }
    }
}
export const isNotInteger = (value) => {
    try {
        value = +value
        return value % 1 !== 0
    } catch (_) { return true }
}
export function isSameDate(date, dateCompe) {
    date = new Date(date), dateCompe = new Date(dateCompe)
    return date.getDate() === dateCompe.getDate() && date.getMonth() === dateCompe.getMonth() && date.getFullYear() === dateCompe.getFullYear();
}


export function isSameDateNew(dateCompe) {
    const date = parseInt(moment().format("YYYYMMDD"))
    const _date = parseInt(moment(dateCompe).format('YYYYMMDD'));
    const hours = +moment().format("HH")
    const _hours = +moment(dateCompe).format("HH")
    return (_date === date && hours === _hours)
}

export const compareTime = (inputTimeStr) => {
    const inputTime = moment(inputTimeStr, "YYYY-MM-DD HH:mm");
    const now = moment(); // thời gian hiện tại

    if (inputTime.isBefore(now)) {
        return 1
    } else {
        return 0
    }
}

export const formatByTemplate = (number, template = "### ###") => {
    try {
        const totalNumber = template.match(/\#/g)
        if (!number || !template || !totalNumber) {
            return ''
        }
        number = number.toString().match(/[0-9]/g)
        let ret = ''
        const lenInput = Math.min(number.length, totalNumber.length)
        const lenDelimiter = template.length - lenInput
        for (let i = 0, idx = 0, lenArr = number.length + lenDelimiter; i < lenArr; i++) {
            if (number[i] === undefined || (i === lenInput + lenDelimiter)) break;
            if (template[idx] !== "#") {
                number.splice(i, 0, template[idx])
            }
            ret += number[i]
            idx += 1
        }
        return ret
    } catch (e) { return '' }
}


export const formatHtmlToText = (html = '') => {
    try {
        if (typeof html !== 'string' || html.trim() === '') {
            return ''
        }

        const htmlEntityMap = {
            '&nbsp;': ' ',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'"
        }

        const decodeHtmlEntity = (input = '') => input.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => htmlEntityMap[entity] || entity)

        const source = html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')

        const tokens = source.split(/(<[^>]+>)/g).filter(Boolean)
        const listStack = []
        let output = ''

        for (const token of tokens) {
            if (token.startsWith('<')) {
                const tagMatch = token.match(/^<\s*\/?\s*([a-zA-Z0-9]+)/)
                if (!tagMatch) continue

                const tagName = (tagMatch[1] || '').toLowerCase()
                const isClose = /^<\s*\//.test(token)

                if (!isClose) {
                    if (tagName === 'ol') {
                        listStack.push({ type: 'ol', index: 0 })
                    } else if (tagName === 'ul') {
                        listStack.push({ type: 'ul' })
                    } else if (tagName === 'li') {
                        const parentList = listStack.length > 0 ? listStack[listStack.length - 1] : null
                        if (parentList?.type === 'ol') {
                            parentList.index += 1
                            output += `${parentList.index}. `
                        } else {
                            output += '• '
                        }
                    } else if (tagName === 'br') {
                        output += '\n'
                    }
                } else {
                    if (tagName === 'li') {
                        output += '\n'
                    } else if (tagName === 'ol' || tagName === 'ul') {
                        listStack.pop()
                        output += '\n'
                    } else if (tagName === 'p' || tagName === 'div' || /^h[1-6]$/.test(tagName)) {
                        output += '\n'
                    }
                }

                continue
            }

            output += decodeHtmlEntity(token)
        }

        output = output
            .replace(/\r/g, '')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()

        return output
    } catch (e) {
        return ''
    }
}

export const cleanNumberString = (value = '', delimiter = '') => {
    if (value == null) return '';
    const escapedDelimiter = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.toString().replace(new RegExp(`[\\s${escapedDelimiter}]`, 'g'), '').replace(/\D/g, '');
};

export const formatNumber = (number, delimiter = '', bounce = 3) => {
    if (number === 0) return '0';
    if (!number) return '';
    const cleaned = cleanNumberString(number, delimiter);
    if (!cleaned) return '';
    return cleaned.replace(new RegExp(`\\B(?=(\\d{${bounce}})+(?!\\d))`, 'g'), delimiter);
};
// export const formatNumber = (number, delimiter = ' ', bounce = 3) => {
//     if (number == 0) return '0'
//     if (!number) return ''
//     let reg = new RegExp(`[\s${delimiter}]`, "g")
//     number = number.toString().replace(reg, '').split('')
//     for (let i = number.length - 1, step = 0; i > -1; --i) {
//         if (step === bounce) {
//             number.splice(i + 1, 0, delimiter)
//             step = 0
//         }
//         ++step
//     }
//     return number.join('')
// }
export const getPureNumber = (str) => {
    if (!str) return ""
    return str.match(/[0-9]/g).join('')
}
export const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
}

export const colorDashboard = [
    processColor(DEFAULT_COLOR),
    processColor('#E74C3C'),
    processColor('#3498DB'),
    processColor('#27AE60'),
    processColor('#F39C12'),
    processColor('#9B59B6'),
    processColor('#2C3E50'),
    processColor('#1ABC9C'),
    processColor('#D35400'),
    processColor('#2980B9'),
    processColor('#8E44AD'),
    processColor('#7F8C8D'),
    processColor('#E67E22'),
    processColor('#C0392B'),
    processColor('#16A085'),
    processColor('#F1C40F'),
    processColor('#34495E'),
    processColor('#9C640C'),
    processColor('#E74C3C')
];

export const colorDashboardHex = [
    // DEFAULT_COLOR,
    '#E74C3C',
    '#3498DB',
    '#27AE60',
    '#F39C12',
    '#9B59B6',
    '#2C3E50',
    '#D35400',
    '#2980B9',
    '#8E44AD',
    '#7F8C8D',
    '#E67E22',
    '#C0392B',
    '#16A085',
    '#F1C40F',
    '#34495E',
    '#9C640C',
    '#5D6D7E',
    '#58D68D',
    '#AF7AC5',
    '#F5B041',
    '#45B39D'
];

// Location
export const requestPerrmission = async (permissions, actionResult) => {
    try {
        await request(Platform.select(permissions)).then((result) => { actionResult(result == RESULTS.GRANTED) })
    } catch (e) {
        console.log(e)
    }
}

const settingLocation = (message) => {
    MessageSetting('Quyền truy cập', message, () => {
        Platform.OS === 'ios' ?
            Linking.openURL("App-Prefs:root=Privacy&path=LOCATION") :
            openSettings().catch(() => ToastError('cannot open settings'));;
    })
}
export const typeModeDisplay = () => {
    return {
        VIEW: 0,
        EDIT: 1,
        CANCEL: -1
    }
}
export const openSettingPermission = { settingLocation }

const getPhotoRotation = (photoData, isFrontCamera) => {
    const { width, height } = photoData || {}
    if (Platform.OS === 'android' && width > height) {
        return isFrontCamera ? 270 : 90
    } else {
        return 0
    }
}

export const resizeImage = async (uri, photoData, isFrontCamera) => {
    let rotation = getPhotoRotation(photoData, isFrontCamera);
    const resizedImage = await ImageResizer.createResizedImage(uri, imageSize.width, imageSize.height, 'JPEG', 80, rotation);
    return moveFile(resizedImage.uri)
}
export const moveFile = async (sourcePath) => {
    try {
        // Kiểm tra file nguồn có tồn tại không
        const fileExists = await RNFS.exists(sourcePath);
        const fileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
        if (!fileExists) {
            return;
        }
        // Tạo thư mục đích nếu chưa tồn tại
        const destinationDir = `${RNFS.DocumentDirectoryPath}/${moment().format('YYYYMMDD')}`
        const dirExists = await RNFS.exists(destinationDir);
        if (!dirExists) {
            await RNFS.mkdir(destinationDir);
        }

        // Di chuyển file
        const destinationPath = `${destinationDir}/${fileName}`
        const fileMoveExists = await RNFS.exists(destinationPath);
        if (!fileMoveExists) {
            await RNFS.moveFile(sourcePath, destinationPath);
        } else {
            await RNFS.unlink(sourcePath);
        }
        return destinationPath
    } catch (error) {
        console.error('Lỗi chuyển file:', error);
        return sourcePath
    }
};

export const checkLinkType = (path = null) => {
    if (path !== null && path.length > 0) {
        if (path.startsWith('/data/user/')) {
            return `file://${path}`;
        } else if (path.startsWith('/var/mobile/Containers/Data/Application/')) {
            return `file://${path}`;
        } else if (path.startsWith('/uploaded/')) {
            return `${URLDEFAULT}${path}`;
        }
    }
    return path;
}

export const generatorPath = async (photoData) => {
    const name = photoData.uri.substring(photoData.uri.lastIndexOf('/') + 1, photoData.uri?.length);
    const extension = (Platform.OS === 'android') ? 'file://' : ''
    const path = `${extension}${RNFS.DocumentDirectoryPath ? RNFS.DocumentDirectoryPath : RNFS.LibraryDirectoryPath}/Camera/`;
    const pathFile = `${path}${name}`;
    const base64Data = photoData.base64
    try {
        // Tạo thư mục nếu nó không tồn tại
        const dirExists = await RNFS.exists(path);
        if (!dirExists) {
            await RNFS.mkdir(path);
        }
        await RNFS.writeFile(pathFile, base64Data, 'base64');
        return pathFile
    } catch (error) {
        console.log(error);
        return photoData.uri
    }
}

export const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};
export const updateReportEditDone = async (workinfo) => {
    const KeyStore = `${workinfo.shopId || 0}REPORT_EDIT${TODAY}`
    let json = await GetAsyncStorage(KeyStore) || '[]'
    let dataAsync = JSON.parse(json)
    dataAsync.map(it => {
        if (it.reportId == workinfo.reportId) {
            it.isUpdate = 1
        }
    })
    await saveStore(KeyStore, JSON.stringify(dataAsync))
}
export const updateReportEdit = async (workinfo) => {
    await clearOldReportEdit(workinfo.shopId, TODAY)
    const KeyStore = `${workinfo.shopId || 0}REPORT_EDIT${TODAY}`
    let json = await GetAsyncStorage(KeyStore) || '[]'
    let dataAsync = JSON.parse(json)
    const dataByReport = dataAsync.filter(it => it.reportId == workinfo.reportId)
    if (dataByReport.length == 0) {
        dataAsync.push({
            reportId: workinfo.reportId,
            menuNameVN: workinfo.menuNameVN,
            isUpdate: 0,
            isCheck: 0
        })
        // saveStore
        await saveStore(KeyStore, JSON.stringify(dataAsync))
    } else {
        dataAsync.map(it => {
            if (it.reportId == workinfo.reportId && (it.isUpdate == 1 || it.isCheck == 1)) {
                it.isUpdate = 0
                it.isCheck = 0
            }
        })
        await saveStore(KeyStore, JSON.stringify(dataAsync))
    }
}
export const deleteReportEdit = async (workinfo) => {
    const KeyStore = `${workinfo.shopId || 0}REPORT_EDIT${TODAY}`
    let json = await GetAsyncStorage(KeyStore) || '[]'
    let dataAsync = JSON.parse(json)
    const dataByReport = dataAsync.filter(it => it.reportId !== workinfo.reportId)
    await saveStore(KeyStore, JSON.stringify(dataByReport))
}
export async function clearOldReportEdit(shopId, today) {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const prefix = `${shopId || 0}REPORT_EDIT`;
        const relatedKeys = allKeys.filter(key => key.startsWith(prefix));
        const oldKeys = relatedKeys.filter(key => key !== `${prefix}${today}`);
        if (oldKeys.length > 0) {
            await AsyncStorage.multiRemove(oldKeys);
        }
    } catch (err) {
        console.error("❌ Lỗi khi xoá key cũ:", err);
    }
}

export const getDeviceInfo = async () => {
    const safeCall = async (deviceFn, fallback = null) => {
        try {
            const value = await deviceFn();
            return value ?? fallback;
        } catch (_) {
            return fallback;
        }
    };
    const toISOStringSafe = (value) => {
        if (value === null || value === undefined) return null;
        const parsed = moment(value);
        return parsed.isValid() ? parsed.toISOString() : null;
    };

    const batteryLevel = await safeCall(() => DeviceInfo.getBatteryLevel(), null);
    const firstInstallTime = await safeCall(() => DeviceInfo.getFirstInstallTime(), null);
    const lastUpdateTime = await safeCall(() => DeviceInfo.getLastUpdateTime(), null);

    const metadata = await CodePush.getUpdateMetadata();
    const patchVersion = metadata?.label ?? 'Store';

    return {
        getApiLevel: await safeCall(() => DeviceInfo.getApiLevel(), null),
        getAndroidId: await safeCall(() => DeviceInfo.getAndroidId(), 'unknown'),
        getApplicationName: await safeCall(() => DeviceInfo.getApplicationName(), 'unknown'),
        getBatteryLevel: typeof batteryLevel === 'number' ? `${Math.round(batteryLevel * 100)}%` : 'unknown',
        getBrand: await safeCall(() => DeviceInfo.getBrand(), 'unknown'),
        getBuildNumber: await safeCall(() => DeviceInfo.getBuildNumber(), 'unknown'),
        getBundleId: await safeCall(() => DeviceInfo.getBundleId(), 'unknown'),
        isCameraPresent: await safeCall(() => DeviceInfo.isCameraPresent(), false),
        getCarrier: await safeCall(() => DeviceInfo.getCarrier(), 'unknown'),
        getDeviceId: await safeCall(() => DeviceInfo.getUniqueId(), 'unknown'),
        getDeviceType: await safeCall(() => DeviceInfo.getDeviceType(), 'unknown'),
        getDeviceName: await safeCall(() => DeviceInfo.getDeviceName(), 'unknown'),
        getFirstInstallTime: toISOStringSafe(firstInstallTime),
        getLastUpdateTime: toISOStringSafe(lastUpdateTime),
        getManufacturer: await safeCall(() => DeviceInfo.getManufacturer(), 'unknown'),
        getModel: await safeCall(() => DeviceInfo.getModel(), 'unknown'),
        getPhoneNumber: await safeCall(() => DeviceInfo.getPhoneNumber(), 'unknown'),
        getSystemName: await safeCall(() => DeviceInfo.getSystemName(), 'unknown'),
        getSystemVersion: await safeCall(() => DeviceInfo.getSystemVersion(), 'unknown'),
        getVersion: await safeCall(() => DeviceInfo.getVersion(), 'unknown'),
        patchVersion: await safeCall(() => patchVersion, 'unknown'),
        isAirplaneMode: await safeCall(() => DeviceInfo.isAirplaneMode(), false),
        isLocationEnabled: await safeCall(() => DeviceInfo.isLocationEnabled(), false),
        getSerialNumber: await safeCall(() => DeviceInfo.getSerialNumber(), 'unknown'),
        getAvailableLocationProviders: await safeCall(() => DeviceInfo.getAvailableLocationProviders(), {}),
        getFreeDiskStorage: await safeCall(() => DeviceInfo.getFreeDiskStorage(), null),
        getIpAddress: await safeCall(() => DeviceInfo.getIpAddress(), '0.0.0.0'),
        getInstallerPackageName: await safeCall(() => DeviceInfo.getInstallerPackageName(), 'unknown'),
        getMaxMemory: await safeCall(() => DeviceInfo.getMaxMemory(), null),
        getTotalDiskCapacity: await safeCall(() => DeviceInfo.getTotalDiskCapacity(), null),
        getTotalMemory: await safeCall(() => DeviceInfo.getTotalMemory(), null),
        getUsedMemory: await safeCall(() => DeviceInfo.getUsedMemory(), null),
        isLandscape: await safeCall(() => DeviceInfo.isLandscape(), false),
        isEmulator: await safeCall(() => DeviceInfo.isEmulator(), false),
        getPowerState: await safeCall(() => DeviceInfo.getPowerState(), null),
        isBatteryCharging: await safeCall(() => DeviceInfo.isBatteryCharging(), false),
        getUserAgent: await safeCall(() => DeviceInfo.getUserAgent(), 'unknown'),
        isHeadphonesConnected: await safeCall(() => DeviceInfo.isHeadphonesConnected(), false),
    };
} 
