import React, { useEffect, useState } from 'react';
import { AppState, LogBox, SafeAreaView, Text } from 'react-native';
import { defaultSetting, GetToken, ToastSuccess } from '../../../Core/Helper';
import {
  getLstMessengerNotSeen,
  getStoreList,
} from '../../../Controller/WorkController';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { object } from 'prop-types';
import {
  uploadAllDataPhoto,
  getPhotosNotUploadReport,
} from '../../../Controller/PhotoController';
import { APPDOWNLOAD } from '../../../Controller/DownloadDataController';
import { useDispatch, useSelector } from 'react-redux';
import { AppCreateAction } from '../../../Core/ReduxController';
import { downloadAll } from '../../../Controller/DownloadDataController';
import { GetMenu, RemoveUser } from '../../../Controller/UserController';
import { fetchDataNotify } from '../../../Controller/NotificationController';
import { Welcome } from '../../Welcome/WelcomeScreen';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { LoadingView } from '../../../Control/ItemLoading';
import { SummaryHome } from '../../Daikin/Home/SummaryHome';
import { MenuHomeDaikin } from '../../Daikin/Home/MenuHomeDaikin';
import { TODAY } from '../../../Core/Utility';
import DeviceInfo from 'react-native-device-info';
import { AppNameBuild, TRAINEEKEY } from '../../../Core/URLs';
import base64 from 'react-native-base64';
import LoginDaikin from '../LoginDaikin';
import { useLocationTracker } from './../../../Control/useLocationTracker';
// import LockDevice from '../../../Content/LockDevice';
function HomeDaikin(props) {
  const { shoplist, homemenu, statusPermission, userinfo, appcolor } =
    useSelector(state => state.GAppState);
  const [appState, setAppState] = useState(AppState.currentState);
  const { startTracking, stopTracking } = useLocationTracker(30000);
  const dispatch = useDispatch();
  const [state, setState] = useState({
    isNewApp: false,
    isMainApp: true,
    isShowNotify: false,
    badgeNotify: 0,
    selectedIndex: 0,
    notifyInfo: '',
    lstCat: [],
    selectedCat: '',
    displayMenu: 0,
    chartListFull: [],
    chartList: [],
    activeSlide: 0,
    dataChartHMD: null,
    titlePage: '',
    detailSelect: [],
    pageIndex: null,
    refreshing: false,
    userinfo: {},
    shops: [],
    menus: [],
    welcome: 1,
  });
  updateIndex = selectedIndex => {
    setState({ ...state, selectedIndex });
  };
  goHyperlink = async hyperLinks => {
    const einfo = props.userinfo;
    const deviceId = await DeviceInfo.getUniqueId();
    if (hyperLinks === null || hyperLinks === 'null') {
      props.navigation.navigate('Notification');
    } else if (
      hyperLinks.includes('trainee') &&
      hyperLinks.includes('spiral.com.vn')
    ) {
      const shareKey = {
        LoginID: TRAINEEKEY,
        AccountId: einfo.accountId,
        EmployeeId: einfo.employeeId,
        DeviceID: deviceId,
      };
      const appShare = await base64.encode(JSON.stringify(shareKey));
      const webURL = hyperLinks + appShare;
      await props.navigation.navigate('WebView', {
        link: webURL,
        titlePage: 'Trình duyệt',
      });
    } else if (
      hyperLinks.includes('spiral.com.vn') ||
      hyperLinks.includes('sucbat.com.vn')
    ) {
      const token = await GetToken();
      const shareInfo = {
        employeeId: einfo.employeeId,
        employeeName: einfo.employeeName,
        accountId: einfo.accountId,
        typeId: einfo.typeId,
        loginName: einfo.loginName,
        mobile: einfo.mobile,
        deviceId: deviceId,
        AppId: AppNameBuild,
        token: token,
      };
      const app_access = await base64.encode(JSON.stringify(shareInfo));
      const webURL = hyperLinks + app_access;
      await props.navigation.navigate('WebView', {
        link: webURL,
        titlePage: 'Trình duyệt',
      });
    } else if (hyperLinks.includes('http')) {
      await props.navigation.navigate('WebView', {
        link: hyperLinks,
        titlePage: 'Trình duyệt',
      });
    } else {
      await props.navigation.navigate(hyperLinks);
    }
  };
  SyncdataApp = async () => {
    await setState({ ...state, refreshing: true });
    await downloadAll(async e => {
      await ToastSuccess(e, 'Sync data', 'top');
    });
    await APPDOWNLOAD.downloadMenu();
    //Local load
    const _menu = await GetMenu(0);
    const _shops = await getStoreList('', TODAY);
    await setState({
      ...state,
      shops: _shops,
      menus: _menu,
      refreshing: false,
    });
    dispatch(AppCreateAction.GetFormNow());
    await fetchDataNotify(async () => {
      await setBadge();
    });
  };
  ThemeDefault = () => {
    AsyncStorage.getItem('SETTINGS').then(result => {
      const setting = JSON.parse(result) || defaultSetting;
      dispatch(AppCreateAction.SetTheme(setting.mode));
    });
  };
  fisrtLoad = async () => {
    await ThemeDefault();
    await setTimeout(async () => {
      await setState({ ...state, welcome: 0 });
      if (userinfo.employeeId !== undefined) {
        startTracking();
        if (TODAY >= userinfo?.expriedDate) {
          await RemoveUser();
          await dispatch(AppCreateAction.SetUserInfo({}));
          return;
        } else {
          await SyncdataApp();
          await uploadFileNotUpload();
        }
      }
    }, 3000);
  };
  useEffect(() => {
    const _fisrtLoad = fisrtLoad();
    _unsubscribe = props.navigation.addListener('focus', res => {
      setBadge();
      setState({ ...state, isShowNotify: false });
    });
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (
          remoteMessage !== undefined &&
          remoteMessage !== object &&
          remoteMessage !== null
        ) {
          if (remoteMessage.data.hyperLinks !== null) {
            if (remoteMessage.data.hyperLinks !== '') {
              goHyperlink(remoteMessage.data.hyperLinks);
            } else {
              props.navigation.navigate('Notification', {
                messengerId: parseInt(remoteMessage.data.messengerId),
              });
            }
          } else {
            props.navigation.navigate('Notification', {
              messengerId: parseInt(remoteMessage.data.messengerId),
            });
          }
        }
      });
    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (state.notifyInfo.data.hyperLinks !== null) {
        if (state.notifyInfo.data.hyperLinks !== '') {
          goHyperlink(state.notifyInfo.data.hyperLinks);
        } else {
          props.navigation.navigate('Notification', {
            messengerId: parseInt(state.notifyInfo.data.messengerId),
          });
        }
      } else {
        props.navigation.navigate('Notification', {
          messengerId: parseInt(state.notifyInfo.data.messengerId),
        });
      }
    });
    messaging().onMessage(async remoteMessage => {
      await fetchDataNotify(e => {
        setBadge();
      });
      await setState({
        ...state,
        notifyInfo: remoteMessage,
        isShowNotify: true,
      });
    });
    return () => {
      _fisrtLoad;
    };
  }, [userinfo]);
  uploadFileNotUpload = async () => {
    let arr = await getPhotosNotUploadReport();
    (await arr.length) && (await uploadAllDataPhoto(arr, true, true));
  };
  setBadge = async () => {
    let lstMessenger = await getLstMessengerNotSeen();
    if (Array.isArray(lstMessenger)) {
      setState({ ...state, badgeNotify: lstMessenger.length });
    }
  };
  gotoMessage = async () => {
    await setState({ ...state, isShowNotify: false });
    if (state.notifyInfo.data.hyperLinks !== null) {
      if ((await state.notifyInfo.data.hyperLinks) !== '') {
        await goHyperlink(state.notifyInfo.data.hyperLinks);
      } else {
        await props.navigation.navigate('Notification', {
          messengerId: parseInt(state.notifyInfo.data.messengerId),
        });
      }
    } else {
      await props.navigation.navigate('Notification', {
        messengerId: parseInt(state.notifyInfo.data.messengerId),
      });
    }
  };
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Khi app chuyển sang foreground
        startTracking();
      } else if (nextAppState === 'background') {
        // Khi app chuyển sang background
        stopTracking();
      }
      setAppState(nextAppState);
    };
    // Thay đổi cú pháp để phù hợp với các phiên bản React Native mới
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    // Cleanup khi component unmount
    return () => {
      subscription.remove(); // Xóa sự kiện đã đăng ký
      stopTracking(); // Dừng tracking khi component bị unmount
    };
  }, [appState]);
  LogBox.ignoreLogs(['VirtualizedLists']);
  return state.welcome == 1 ? (
    <Welcome />
  ) : userinfo?.employeeId > 0 ? (
    <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        isHome={true}
        title={userinfo.employeeName}
        countNotify={state.badgeNotify}
        iconLeft="bars"
        iconRight="bell"
        leftFunc={() => props.navigation.openDrawer()}
        rightFunc={() => props.navigation.navigate('Notification')}
      />
      <LoadingView isLoading={state.refreshing} />

      {!state.refreshing && (
        <MenuHomeDaikin
          onDowload={SyncdataApp}
          ViewHeader={
            <>
              <SummaryHome
                navigation={props.navigation}
                isLoading={state.refreshing}
              />
              <Text
                style={{
                  paddingStart: 5,
                  fontSize: 18,
                  fontWeight: '700',
                  color: appcolor.primary,
                }}
              >
                Chức năng
              </Text>
            </>
          }
          navigation={props.navigation}
          menus={state.menus}
        />
      )}
      {/* <LockDevice userinfo={userinfo} /> */}
    </SafeAreaView>
  ) : (
    <LoginDaikin onLoginCallBack={() => SyncdataApp()} />
  );
}
export default HomeDaikin;
