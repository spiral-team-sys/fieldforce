import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, AppState, LogBox } from "react-native";
import { APPDOWNLOAD, downloadAll } from '../../Controller/DownloadDataController';
import Icon from '@react-native-vector-icons/fontawesome6';
import MenuHome from '../../Content/Beko/MenuHome';
import { isExistAddColum, getLstMessengerNotSeen, getStoreList } from '../../Controller/WorkController';
import { GetToken, ToastSuccess } from '../../Core/Helper';
import MessageForm from '../../Content/Message';
import Moment from 'moment';
import LoginBK from '../Beko/LoginBK'
import DashboardHome from '../../Content/Beko/DashboardHome';
import { GetNotificationList, RemoveUser } from '../../Controller/UserController';
import messaging from '@react-native-firebase/messaging';
import { object } from 'prop-types';
import { checkNetwork, TODAY } from '../../Core/Utility';
import { GetMenu } from '../../Controller/UserController';
import DeviceInfo from 'react-native-device-info';
import { getPhotosNotUploadReport, uploadAllDataPhoto } from '../../Controller/PhotoController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useDispatch, useSelector } from 'react-redux';
import { Welcome } from '../Welcome/WelcomeScreen';
import { AppCreateAction } from '../../Core/ReduxController'
import { LoadingView } from '../../Control/ItemLoading';
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import base64 from 'react-native-base64';
const delay = ms => new Promise(res => setTimeout(res, ms));

const HomeBK = ({ navigation }) => {
    LogBox.ignoreAllLogs(false)
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const [menu, setMenu] = useState([])
    const dispatch = useDispatch()
    let messageRef = useRef()
    const [appState, setAppState] = useState(AppState.currentState)
    const [refreshing, setRefreshing] = useState(false)
    const [badgeNotify, setBadgeNotify] = useState(0)
    const [isShowNotify, setIsShowNotify] = useState(false)
    const [notifyInfo, setNotifyInfo] = useState('')
    const [welcome, setWelcome] = useState(1)

    const ConfigData = async () => {
        await setTimeout(async () => {
            await setWelcome(0)
            await configDatabase()
            await congigMessageService();
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
            await setRefreshing(false)
            await ToastSuccess(e, "Đồng bộ dữ liệu", "top")
        });
        //load menu
        const lstMenu = await GetMenu(0)
        await setMenu(lstMenu);
    }
    const congigMessageService = async () => {
        messaging()
            .getInitialNotification()
            .then(async remoteMessage => {
                if (remoteMessage !== undefined && remoteMessage !== object && remoteMessage !== null) {
                    if (remoteMessage.data.hyperLinks !== null) {
                        if (remoteMessage.data.hyperLinks !== "") {
                            getHyperLink(remoteMessage.data.hyperLinks)
                        }
                        else {
                            await this.setNumberMessage()
                            navigation.navigate('Notification', { messengerId: parseInt(remoteMessage.data.messengerId) });
                        }
                    }
                    else {
                        await this.setNumberMessage()
                        navigation.navigate('Notification', { messengerId: parseInt(remoteMessage.data.messengerId) });
                    }
                }
            });

        messaging().onNotificationOpenedApp(async remoteMessage => {
            if (notifyInfo.data.hyperLinks !== null) {
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
            await setIsShowNotify(true)
        });
    }
    const configDatabase = async () => {
        await isExistAddColum('masterList', 'textValue', 'INTEGER')
        await isExistAddColum('masterList', 'decimalValue', 'INTEGER')
        await isExistAddColum('masterList', 'selectValue', 'INTEGER')
        await isExistAddColum('masterList', 'filterList', 'NVARCHAR(512)')
        await isExistAddColum('masterList', 'isRequired', 'INTEGER')
    }
    const setNumberMessage = async () => {
        await GetNotificationList(async () => {
            let lstMessenger = await getLstMessengerNotSeen();
            await delay(500);
            if (Array.isArray(lstMessenger)) {
                setBadgeNotify(lstMessenger.length)
            }
        });
    }
    const gotoMessage = async () => {
        setIsShowNotify(false)
        if (notifyInfo.data.hyperLinks !== null) {
            if (notifyInfo.data.hyperLinks !== "") {
                getHyperLink(notifyInfo.data.hyperLinks)
            }
            else {
                await LoadDataMessenger()
                await navigation.navigate('Notification', { messengerId: parseInt(notifyInfo.data.messengerId) });
            }
        }
        else {
            await LoadDataMessenger()
            await navigation.navigate('Notification', { messengerId: parseInt(notifyInfo.data.messengerId) });
        }
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
            // console.log("App is going background");
        } else if (_backgroundState(appState) && (nextAppState === 'active')) {
            // console.log("App is coming to foreground");
        }
        await setAppState(nextAppState)
    }
    useEffect(() => {
        const subscription = AppState.addEventListener('change', _handleAppStateChange);
        const _config = ConfigData()
        return () => {
            subscription.remove()
            _config
        }
    }, [userinfo])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%' },
        menuView: { width: '95%', height: '50%', alignSelf: 'center', borderRadius: 8, marginTop: 8 },
        titleMenu: { marginStart: 8, width: '50%', fontSize: 15, fontWeight: '700', },
        titleViewUpdate: { width: '100%', textAlign: 'center', padding: 32, fontSize: 15 }
    })
    return (
        welcome === 1 ?
            <Welcome /> :
            userinfo.employeeId > 0 ?
                <View style={{ ...styles.mainContainer, backgroundColor: appcolor.homebackground }}>
                    <HeaderCustom
                        isHome={true}
                        title={userinfo.employeeName}
                        countNotify={badgeNotify}
                        iconLeft='bars'
                        iconRight='bell'
                        leftFunc={() => navigation.openDrawer()}
                        rightFunc={() => navigation.navigate('Notification')}
                    />
                    <View style={{ width: '100%', height: '38%', marginTop: 8, overflow: 'hidden' }} >
                        <LoadingView title=' ' isLoading={refreshing} />
                        <ScrollView
                            contentContainerStyle={{ width: '100%', height: '100%' }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl
                                refreshing={false}
                                onRefresh={() => downloadData()} />} >
                            <DashboardHome refreshDashboard={refreshing} navigation={navigation} />
                        </ScrollView>
                    </View>
                    <View style={{ width: '100%', height: '100%' }}>
                        <View style={{ ...styles.menuView, backgroundColor: appcolor.light }}>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.secondary, padding: 8, borderTopEndRadius: 8, borderTopStartRadius: 8 }}>
                                <Text style={{ ...styles.titleMenu, color: appcolor.light }}>Chức năng</Text>
                                <Icon name='list' size={21} style={{ width: '46%', textAlign: 'right', color: appcolor.light }} />
                            </View>
                            <View style={{ width: '100%', height: '90%', borderRadius: 8 }}>
                                <MenuHome menus={menu} navigation={navigation} />
                            </View>
                        </View>
                    </View>
                    <MessageForm
                        ref={messageRef} appcolor={appcolor}
                        animation={'slideY'} position={'top'} type={'success'} messageHeight={100} callBack={gotoMessage} >
                        {isShowNotify && messageRef?.current?.showMessage(notifyInfo?.notification?.title, notifyInfo?.notification?.body, 5000)}
                    </MessageForm>
                </View >
                :
                <LoginBK onLoginCallBack={downloadData} />
    )
}
export default HomeBK;
