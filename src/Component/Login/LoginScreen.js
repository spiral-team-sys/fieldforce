import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppNameBuild, DEFAULT_LIGHT_COLOR, URL_PRIVACY, aquaApp, cuckooApp, dsmHvnApp, honorApp, lgApp, officeApp, psvApp, signifyApp } from "../../Core/URLs";
import LoginLG from "./Page/LoginLG";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import WebViewScreen from "../../Control/Webview/WebViewScreen";
import { checkNetwork } from "../../Core/Utility";
import { FIREBASE } from "../../Utils/Firebase/Messaging/firebaseMessaging";
import { toastError } from "../../Utils/configToast";
import DeviceInfo from "react-native-device-info";
import { onLogin, saveInfomationUser } from "../../Controller/UserController";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import LoginHonor from "./Page/LoginHonor";
import LoginCuckoo from "./Page/LoginCuckoo";
import { LocalSignIn, SERCURITY } from "../../Control/LocalSignIn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginOffice from "./Page/LoginOffice";
import LoginSignify from "./Page/LoginSignify";
import LoginAqua from "./Page/LoginAqua";
import LoginDSMHVN from "./Page/LoginDSMHVN";
import LoginPSV from "./Page/LoginPSV";

const LoginScreen = ({ navigation }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [privacyURL, setPrivacyURL] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const [isSecLocal, setIsSecLocal] = useState(0)
    const dispatch = useDispatch()
    //
    const handlerLogin = async (username, password) => {
        const isValid = await validData(username, password)
        if (!isValid) return
        // 
        await setLoading(true)
        const params = {
            "username": username,
            "client_time": moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            "password": password,
            'DeviceToken': await FIREBASE.getFCMToken(),
            "Platform": Platform.OS,
            "IMEI": await DeviceInfo.getUniqueId(),
            "AppId": await DeviceInfo.getBuildId(),
            "versionid": await DeviceInfo.getBuildNumber()
        };
        await onLogin(params, async (info) => {
            await saveInfomationUser(info, dispatch, JSON.stringify(params))
            await setLoading(false)
            await navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
        }, (error) => {
            console.log(error, 'error');
            setLoading(false)
        })
    }
    const validData = async (username, password) => {
        const isConnected = await checkNetwork()
        if (isConnected) {
            const token = await FIREBASE.getFCMToken();
            if (token === null || token.length < 10) {
                toastError("token", 'Chưa lấy được mã xác thực thiết bị');
            }
            if (username == null || username.length == 0) {
                toastError("Tên đăng nhập", 'Bạn chưa nhập tên đăng nhập!');
                return false
            }
            if (password === null || password.length < 1) {
                toastError("Mật khẩu", 'Mật khẩu không được để trống!');
                return false
            }
        } else {
            toastError('Mất kết nối', "Vui lòng kiểm tra kết nối mạng");
            return false
        }
        return true
    }
    // 
    const onFogetPassword = (username) => {
        navigation.navigate('ForgotPassword', { username })
    }
    const onShowPrivacy = () => {
        let url = null
        switch (AppNameBuild) {
            case lgApp:
                url = 'https://lg-e.spiral.com.vn/privacy.html?'
                break
            default:
                url = URL_PRIVACY
        }
        SheetManager.show('privacy_info_sheet', { payload: url })
    }
    const onHidePrivacy = () => {
        SheetManager.hide('privacy_info_sheet')
    }
    const SignInTouchID = async () => {
        const localsec = await AsyncStorage.getItem(SERCURITY.LOCALSECUIRY) || "{}";
        let requestInfo = JSON.parse(localsec || {});
        if (requestInfo.username !== undefined && requestInfo.password !== undefined) {
            handlerLogin(requestInfo.username, requestInfo.password)
        } else {
            toastError("Chưa xác thực tài khoản trên thiết bị này", "Lỗi", "top")
        }
    }
    const Authenticate = async () => {
        await LocalSignIn.isSupportID((e) => {
            setIsSecLocal(e)
        });
    };
    //
    useEffect(() => {
        Authenticate()
    }, [])
    //
    const styles = StyleSheet.create({
        mainContainer: { flex: 1 },
        sheetContainer: { flex: 1, backgroundColor: appcolor.dark },
        backgroundContainer: { flex: 1 }
    })
    const componentMap = {
        [lgApp]: LoginLG,
        [honorApp]: LoginHonor,
        [psvApp]: LoginPSV,
        [cuckooApp]: LoginCuckoo,
        [officeApp]: LoginOffice,
        [signifyApp]: LoginSignify,
        [aquaApp]: LoginAqua,
        [signifyApp]: LoginSignify,
        [dsmHvnApp]: LoginDSMHVN
    }
    const layoutGradientMap = {
        [honorApp]: [appcolor.primary, DEFAULT_LIGHT_COLOR]
    }
    const LoginComponent = componentMap[AppNameBuild];
    const useLayoutGradient = layoutGradientMap[AppNameBuild] || [appcolor.light, appcolor.light]
    return (
        <LinearGradient colors={useLayoutGradient} style={styles.backgroundContainer}>
            <View style={styles.mainContainer}>
                <LoginComponent
                    key={AppNameBuild}
                    navigation={navigation}
                    isLoading={isLoading}
                    onShowPrivacy={onShowPrivacy}
                    onLogin={handlerLogin}
                    onFogetPassword={onFogetPassword}
                    SignInTouchID={SignInTouchID}
                    isSecLocal={isSecLocal}
                />
                <ActionSheet id="privacy_info_sheet"
                    drawUnderStatusBar
                    statusBarTranslucent={false}
                    safeAreaInsets={{ top: Platform.OS == 'ios' ? 56 : 0, bottom: Platform.OS == 'ios' ? 20 : 0, left: 0, right: 0 }}
                    onBeforeShow={setPrivacyURL}
                    containerStyle={styles.sheetContainer}>
                    <WebViewScreen
                        isConfirmExits={false}
                        pageName="Điều khoản & chính sách"
                        urlPage={privacyURL}
                        onClose={onHidePrivacy}
                    />
                </ActionSheet>
            </View>
        </LinearGradient>
    )
}
export default LoginScreen;
