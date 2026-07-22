import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, AppState, LogBox, DeviceEventEmitter, Modal } from "react-native";
import { APPDOWNLOAD, downloadAll } from '../../Controller/DownloadDataController';
import { getStoreList } from '../../Controller/WorkController';
import { GetEmployeeInfo, GetToken, ToastSuccess } from '../../Core/Helper';
import Moment from 'moment';
import messaging from '@react-native-firebase/messaging';
import { object } from 'prop-types';
import DeviceInfo from 'react-native-device-info';
import { getPhotosNotUploadReport, uploadAllDataPhoto } from '../../Controller/PhotoController';
import { useDispatch, useSelector } from 'react-redux';
import { Welcome } from '../Welcome/WelcomeScreen';
import { LoadingView } from '../../Control/ItemLoading';
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import base64 from 'react-native-base64';
import { InAppMess } from '../Notification/InAppMess';
import { checkSeenInApp } from '../../Controller/NotificationController';
import { NotificationAPI } from '../../API/NotificationAPI';
import { TODAY, checkNetwork } from '../../Core/Utility';
import { GetNotificationList, RemoveUser } from '../../Controller/UserController';
import { AppCreateAction } from '../../Core/ReduxController';
import { HeaderSharp } from './HeaderSharp';
import { SafeAreaView } from 'react-native';
import { MenuHomeSharp } from './MenuHomeSharp';
import { SummarySharp } from './SummaryData/SummarySharp';
import LoginSharp from './LoginSharp';
import { useLocationTracker } from '../../Control/useLocationTracker';

const HomeSharp = ({ navigation }) => {
    const { startTracking, stopTracking } = useLocationTracker(30000);
    LogBox.ignoreAllLogs(false)
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const dispatch = useDispatch()
    const [appState, setAppState] = useState(AppState.currentState)
    const [refreshing, setRefreshing] = useState(false)
    const [notifyInfo, setNotifyInfo] = useState('')
    const [welcome, setWelcome] = useState(1)
    const [inAppInfo, setInAppInfo] = useState({ inAppShow: false, messengerId: 0 })

    const ConfigData = async () => {
        startTracking()
        await setTimeout(async () => {
            await setWelcome(0)
            await congigMessageService();
            // await getInAppMessage()
            // Check Update App
            if (userinfo.expriedDate !== undefined && TODAY >= userinfo?.expriedDate) {
                await RemoveUser();
                await dispatch(AppCreateAction.SetUserInfo({}));
                return
            } else if (userinfo?.employeeId !== undefined) {
                await setNumberMessage();
                navigation.addListener('focus', async (res) => {
                    await setNumberMessage();
                });
                await checkAutoDownloadShop();
                if (await checkNetwork())
                    await uploadFileNotUpload();
            }
        }, 3000)
    }
    const getInAppMessage = async () => {
        const userinfo = await GetEmployeeInfo()
        if (userinfo.employeeId !== undefined) {
            let messageId = 0
            const lstInApp = await checkSeenInApp()

            if (lstInApp.length > 0) {
                messageId = lstInApp[0].max
            }
            const result = await NotificationAPI.GetInApp(messageId, 0)
            if (result.statusId === 200) {
                const dataConfig = JSON.parse(result.data[0]?.config || '[]')
                if (await result?.data.length > 0 && dataConfig.length > 0) {
                    setInAppInfo({ inAppShow: messageId > 0, messengerId: messageId })
                }
            }
        }
    }
    const uploadFileNotUpload = async () => {
        let arr = await getPhotosNotUploadReport();
        if (arr.length > 0) {
            await uploadAllDataPhoto(arr)
        }
    }
    const checkAutoDownloadShop = async () => {
        let Today = parseInt(Moment().format('YYYYMMDD'));
        let lst = await getStoreList('', Today);
        if (await checkNetwork()) {
            lst !== undefined && lst.length === 0 && await downloadData()
        }
    }
    const downloadData = async () => {
        await setRefreshing(true)
        await APPDOWNLOAD.downloadMenu();
        await downloadAll(async (e) => {
            await ToastSuccess(e, "Đồng bộ dữ liệu", "top")
            await setRefreshing(false)
        });
    }
    const congigMessageService = async () => {
        messaging().getInitialNotification()
            .then(async remoteMessage => {
                if (remoteMessage !== undefined && remoteMessage !== object && remoteMessage !== null) {
                    if (remoteMessage.data.hyperLinks !== null) {
                        if (remoteMessage.data.hyperLinks !== "") {
                            getHyperLink(remoteMessage.data.hyperLinks)
                        }
                        else {
                            await setNumberMessage()
                            navigation.navigate('Notification', { messengerId: parseInt(remoteMessage.data.messengerId) });
                        }
                    }
                    else {
                        await setNumberMessage()
                        navigation.navigate('Notification', { messengerId: parseInt(remoteMessage.data.messengerId) });
                    }
                }
            });

        messaging().onNotificationOpenedApp(async remoteMessage => {
            if (notifyInfo.data.hyperLinks !== null && notifyInfo.data.hyperLinks.length > 0) {
                if (notifyInfo.data.hyperLinks !== "") {
                    getHyperLink(notifyInfo.data.hyperLinks)
                } else {
                    await setNumberMessage()
                    navigation.navigate('Notification', { messengerId: parseInt(notifyInfo.data.messengerId) });
                }
            }
            else {
                await setNumberMessage()
                navigation.navigate('Notification', { messengerId: parseInt(notifyInfo.data.messengerId) });
            }
        });

        messaging().onMessage(async remoteMessage => {
            await setNumberMessage()
            await setNotifyInfo(remoteMessage)
        });
    }
    const setNumberMessage = async () => {
        await GetNotificationList(() => { })
    }
    const getHyperLink = async (hyperLinks) => {
        const deviceId = await DeviceInfo.getUniqueId();
        if (hyperLinks === null) {
            navigation.navigate("Notification")
        }
        else if (hyperLinks.includes("trainee") && hyperLinks.includes("spiral.com.vn")) {
            const shareKey = {
                "LoginID": TRAINEEKEY,
                "AccountId": userinfo.accountId,
                "EmployeeId": userinfo.employeeId,
                "DeviceID": deviceId
            }
            const appShare = await base64.encode(JSON.stringify(shareKey));
            const webURL = hyperLinks + appShare
            await navigation.navigate('WebView', { link: webURL, titlePage: 'Trình duyệt' });
        } else if (hyperLinks.includes("spiral.com.vn") || hyperLinks.includes("sucbat.com.vn")) {
            const token = await GetToken()
            const shareInfo = {
                employeeId: userinfo.employeeId,
                employeeName: userinfo.employeeName,
                accountId: userinfo.accountId,
                typeId: userinfo.typeId,
                loginName: userinfo.loginName,
                mobile: userinfo.mobile,
                deviceId: deviceId,
                AppId: AppNameBuild,
                "token": token
            }
            const app_access = await base64.encode(JSON.stringify(shareInfo));
            const webURL = hyperLinks + app_access;
            await navigation.navigate('WebView', { link: webURL, titlePage: 'Trình duyệt' });
        } else if (hyperLinks.includes("http")) {
            await navigation.navigate('WebView', { link: hyperLinks, titlePage: 'Trình duyệt' });
        } else {
            await navigation.navigate(hyperLinks);
        }
    }
    const _backgroundState = (state) => {
        return state.match(/inactive|background/);
    }
    const _handleAppStateChange = async (nextAppState) => {
        if (_backgroundState(nextAppState)) {
            startTracking();
            // console.log("App is going background");
        } else if (_backgroundState(appState) && (nextAppState === 'active')) {
            stopTracking();
            // console.log("App is coming to foreground");
        }
        await setAppState(nextAppState)
    }
    const showMenuHome = () => {
        navigation.openDrawer()
    }
    useEffect(() => {
        const _updatealldata = DeviceEventEmitter.addListener('updatealldata', () => { downloadData() })
        const _configmain = ConfigData()
        return () => {
            _updatealldata.remove()
            _configmain
        }
    }, [userinfo])
    useEffect(() => {
        const subscription = AppState.addEventListener('change', _handleAppStateChange);
        return () => { subscription.remove() }
    }, [appState])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%' },
        menuView: { width: '95%', height: '50%', alignSelf: 'center', borderRadius: 8, marginTop: 8 },
        mainContent: { backgroundColor: appcolor.light, width: '100%', height: '100%', borderTopEndRadius: 30, borderTopStartRadius: 30, overflow: 'hidden' },
        titleMenu: { marginStart: 8, width: '50%', fontSize: 15, fontWeight: '700', },
        titleViewUpdate: { width: '100%', textAlign: 'center', padding: 32, fontSize: 15 }
    })
    return (
        welcome === 1 ?
            <Welcome /> :
            userinfo.employeeId > 0 ?
                < SafeAreaView style={{ ...styles.mainContainer, backgroundColor: appcolor.light }}>
                    <View style={{ flex: 1.2 / 10 }}>
                        {/* <View style={{ flex: 3 / 10, backgroundColor: appcolor.transparent }}> */}
                        <HeaderSharp navigation={navigation} onShowMenu={showMenuHome} />
                        {/* </View> */}

                    </View>
                    <View style={{ flex: 8.8 / 10, backgroundColor: appcolor.transparent, }}>
                        {
                            !refreshing &&
                            <ScrollView showsVerticalScrollIndicator={false}
                                refreshControl={<RefreshControl refreshing={false} onRefresh={downloadData} />}
                            >
                                {/* MenuHomeSharp */}
                                <MenuHomeSharp navigation={navigation} isLoading={refreshing} downloadData={downloadData} />
                                {/* SummarySharp */}
                                <SummarySharp navigation={navigation} />
                            </ScrollView>
                        }
                        {refreshing && <LoadingView isLoading={refreshing} title=' ' />}
                    </View>
                    {/* <Modal visible={inAppInfo.inAppShow}>
                        <InAppMess props={{
                            isViewDetail: 0,
                            inAppId: inAppInfo.messengerId,
                            close: () => setInAppInfo({ ...inAppInfo, inAppShow: false })
                        }} />
                    </Modal> */}
                </SafeAreaView >
                :
                <LoginSharp onLoginCallBack={downloadData} />
    )
}
export default HomeSharp;
