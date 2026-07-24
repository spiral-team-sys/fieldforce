import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  LogBox,
  DeviceEventEmitter,
  AppState,
} from 'react-native';
import { GetToken, ToastSuccess } from '../../../Core/Helper';
import {
  getLstMessengerNotSeen,
  getStoreList,
} from '../../../Controller/WorkController';
import messaging from '@react-native-firebase/messaging';
import { object } from 'prop-types';
import {
  uploadAllDataPhoto,
  getPhotosNotUploadReport,
} from '../../../Controller/PhotoController';
import { APPDOWNLOAD } from '../../../Controller/DownloadDataController';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../../Login';
import { downloadAll } from '../../../Controller/DownloadDataController';
import { GetMenu, RemoveUser } from '../../../Controller/UserController';
import { fetchDataNotify } from '../../../Controller/NotificationController';
import { Welcome } from '../../Welcome/WelcomeScreen';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { LoadingView } from '../../../Control/ItemLoading';
import { SummaryHome } from '../../PSV/Home/SummaryHome';
import { MenuHomePSV } from '../../PSV/Home/MenuHomePSV';
import { TODAY } from '../../../Core/Utility';
import DeviceInfo from 'react-native-device-info';
import { AppNameBuild, TRAINEEKEY } from '../../../Core/URLs';
import base64 from 'react-native-base64';
import { useLocationTracker } from '../../../Control/useLocationTracker';
import { GetFormNow, SetUserInfo } from '../../../Redux/action';

function HomePSV(props) {
  const [appState, setAppState] = useState(AppState.currentState);
  const { location, startTracking, stopTracking, tracking } =
    useLocationTracker(100000);
  const { appcolor, userinfo, homemenu, shoplist, statusPermission } =
    useSelector(state => state.GAppState);
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
  const dispatch = useDispatch();

  updateIndex = selectedIndex => {
    setState({ ...state, selectedIndex: selectedIndex });
  };
  goHyperlink = async hyperLinks => {
    const einfo = props.userinfo;
    const deviceId = await DeviceInfo.getUniqueId();
    if (hyperLinks === null) {
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
    dispatch(GetFormNow());
    await fetchDataNotify(async () => {
      await setBadge();
    });
    await setState({
      ...state,
      shops: _shops,
      menus: _menu,
      refreshing: false,
    });
  };
  onFistLoad = async () => {
    startTracking();
    await setTimeout(async () => {
      await setState({ ...state, welcome: 0 });
      if (userinfo?.employeeId > 0) {
        // ExpriedDate account
        if (TODAY >= userinfo?.expriedDate) {
          await RemoveUser();
          dispatch(SetUserInfo({}));
          return;
        } else {
          await SyncdataApp();
          await uploadFileNotUpload();
        }
      }
    }, 3000);
    DeviceEventEmitter.addListener('RELOAD_HOME', async res => {
      await SyncdataApp();
      await uploadFileNotUpload();
    });
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
      if (state.notifyInfo?.data?.hyperLinks !== null) {
        if (state.notifyInfo?.data?.hyperLinks !== '') {
          goHyperlink(state.notifyInfo?.data?.hyperLinks);
        } else {
          props.navigation.navigate('Notification', {
            messengerId: parseInt(state.notifyInfo.data.messengerId),
          });
        }
      } else {
        props.navigation.navigate('Notification', {
          messengerId: parseInt(state.notifyInfo?.data?.messengerId),
        });
      }
    });
    messaging().onMessage(async remoteMessage => {
      await fetchDataNotify(e => {
        setBadge();
      });
      await setState({ notifyInfo: remoteMessage, isShowNotify: true });
    });
  };
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

    onFistLoad();

    // Cleanup khi component unmount
    return () => {
      subscription.remove(); // Xóa sự kiện đã đăng ký
      stopTracking(); // Dừng tracking khi component bị unmount
    };
  }, [appState, userinfo?.employeeId]);

  return state.welcome == 1 ? (
    <Welcome />
  ) : userinfo?.employeeId > 0 ? (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        isHome={true}
        title={userinfo.employeeName}
        countNotify={state.badgeNotify}
        iconLeft="bars"
        iconRight="bell"
        leftFunc={() => props.navigation.openDrawer()}
        rightFunc={() => props.navigation.navigate('Notification')}
      />
      {state.refreshing == true && (
        <LoadingView isLoading={state.refreshing} isHome={true} />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 0.6 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={SyncdataApp} />
        }
      >
        <SummaryHome
          navigation={props.navigation}
          isLoading={state.refreshing}
        />
      </ScrollView>
      {!state.refreshing && (
        <MenuHomePSV navigation={props.navigation} menus={state.menus} />
      )}
    </View>
  ) : (
    <Login onLoginCallBack={() => SyncdataApp()} />
  );
}
export default HomePSV;
