import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  AppState,
  LogBox,
  DeviceEventEmitter,
} from 'react-native';
import {
  APPDOWNLOAD,
  downloadAll,
} from '../../../Controller/DownloadDataController';
import { getStoreList } from '../../../Controller/WorkController';
import { GetToken, ToastSuccess } from '../../../Core/Helper';
import Moment from 'moment';
import {
  GetNotificationList,
  RemoveUser,
} from '../../../Controller/UserController';
import messaging from '@react-native-firebase/messaging';
import { object } from 'prop-types';
import { checkNetwork, deviceHeight, TODAY } from '../../../Core/Utility';
import DeviceInfo from 'react-native-device-info';
import {
  getPhotosNotUploadReport,
  uploadAllDataPhoto,
} from '../../../Controller/PhotoController';
import { useDispatch, useSelector } from 'react-redux';
import { Welcome } from '../../Welcome/WelcomeScreen';
import { AppCreateAction } from '../../../Core/ReduxController';
import { LoadingView } from '../../../Control/ItemLoading';
import { AppNameBuild, TRAINEEKEY } from '../../../Core/URLs';
import base64 from 'react-native-base64';
import { LoginVSM } from './LoginVSM';
import { HeaderVSM } from './HeaderVSM';
import { SummaryVSM } from '../SummaryData/SummaryVSM';
import { MenuHomeVSM } from './MenuHomeVSM';

const HomeVSM = ({ navigation }) => {
  LogBox.ignoreAllLogs(false);
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const dispatch = useDispatch();
  const [appState, setAppState] = useState(AppState.currentState);
  const [refreshing, setRefreshing] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState('');
  const [welcome, setWelcome] = useState(1);
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await messaging().registerDeviceForRemoteMessages();
      await congigMessageService();
    }
  };
  const ConfigData = async () => {
    await setTimeout(async () => {
      await setWelcome(0);
      await requestUserPermission();
      // Check Update App
      if (
        userinfo.expriedDate !== undefined &&
        TODAY >= userinfo?.expriedDate
      ) {
        await RemoveUser();
        await dispatch(AppCreateAction.SetUserInfo({}));
        return;
      } else if (userinfo?.employeeId !== undefined) {
        await setNumberMessage();
        navigation.addListener('focus', async res => {
          await setNumberMessage();
        });
        await checkAutoDownloadShop();
        if (await checkNetwork()) await uploadFileNotUpload();
      }
    }, 3000);
  };
  const uploadFileNotUpload = async () => {
    let arr = await getPhotosNotUploadReport();
    if (arr.length > 0) {
      await uploadAllDataPhoto(arr);
    }
  };
  const checkAutoDownloadShop = async () => {
    let Today = parseInt(Moment().format('YYYYMMDD'));
    let lst = await getStoreList('', Today);
    if (await checkNetwork()) {
      lst !== undefined && lst.length === 0 && (await downloadData());
    }
  };
  const downloadData = async () => {
    await setRefreshing(true);
    await APPDOWNLOAD.downloadMenu();
    await downloadAll(async e => {
      await setRefreshing(false);
      await ToastSuccess(e, 'Đồng bộ dữ liệu', 'top');
    });
  };
  const congigMessageService = async () => {
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
              getHyperLink(remoteMessage.data.hyperLinks);
            } else {
              await setNumberMessage();
              navigation.navigate('Notification', {
                messengerId: parseInt(remoteMessage.data.messengerId),
              });
            }
          } else {
            await setNumberMessage();
            navigation.navigate('Notification', {
              messengerId: parseInt(remoteMessage.data.messengerId),
            });
          }
        }
      });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (
        notifyInfo.data.hyperLinks !== null &&
        notifyInfo.data.hyperLinks.length > 0
      ) {
        if (notifyInfo.data.hyperLinks !== '') {
          getHyperLink(notifyInfo.data.hyperLinks);
        } else {
          await setNumberMessage();
          navigation.navigate('Notification', {
            messengerId: parseInt(notifyInfo.data.messengerId),
          });
        }
      } else {
        await setNumberMessage();
        navigation.navigate('Notification', {
          messengerId: parseInt(notifyInfo.data.messengerId),
        });
      }
    });

    messaging().onMessage(async remoteMessage => {
      await setNumberMessage();
      await setNotifyInfo(remoteMessage);
    });
  };
  const setNumberMessage = async () => {
    await GetNotificationList(() => {});
  };
  const getHyperLink = async hyperLinks => {
    const deviceId = await DeviceInfo.getUniqueId();
    if (hyperLinks === null) {
      navigation.navigate('Notification');
    } else if (
      hyperLinks.includes('trainee') &&
      hyperLinks.includes('spiral.com.vn')
    ) {
      const shareKey = {
        LoginID: TRAINEEKEY,
        AccountId: userinfo.accountId,
        EmployeeId: userinfo.employeeId,
        DeviceID: deviceId,
      };
      const appShare = await base64.encode(JSON.stringify(shareKey));
      const webURL = hyperLinks + appShare;
      await navigation.navigate('WebView', {
        link: webURL,
        titlePage: 'Trình duyệt',
      });
    } else if (
      hyperLinks.includes('spiral.com.vn') ||
      hyperLinks.includes('sucbat.com.vn')
    ) {
      const token = await GetToken();
      const shareInfo = {
        employeeId: userinfo.employeeId,
        employeeName: userinfo.employeeName,
        accountId: userinfo.accountId,
        typeId: userinfo.typeId,
        loginName: userinfo.loginName,
        mobile: userinfo.mobile,
        deviceId: deviceId,
        AppId: AppNameBuild,
        token: token,
      };
      const app_access = await base64.encode(JSON.stringify(shareInfo));
      const webURL = hyperLinks + app_access;
      await navigation.navigate('WebView', {
        link: webURL,
        titlePage: 'Trình duyệt',
      });
    } else if (hyperLinks.includes('http')) {
      await navigation.navigate('WebView', {
        link: hyperLinks,
        titlePage: 'Trình duyệt',
      });
    } else {
      await navigation.navigate(hyperLinks);
    }
  };
  const _backgroundState = state => {
    return state.match(/inactive|background/);
  };
  const _handleAppStateChange = async nextAppState => {
    if (_backgroundState(nextAppState)) {
      // console.log("App is going background");
    } else if (_backgroundState(appState) && nextAppState === 'active') {
      // console.log("App is coming to foreground");
    }
    await setAppState(nextAppState);
  };
  const showMenuHome = () => {
    navigation.openDrawer();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );
    const _updatealldata = DeviceEventEmitter.addListener(
      'updatealldata',
      () => {
        downloadData();
      },
    );
    const _configmain = ConfigData();
    return () => {
      subscription.remove();
      _updatealldata.remove();
      _configmain;
    };
  }, [userinfo]);
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    menuView: {
      width: '95%',
      height: '50%',
      alignSelf: 'center',
      borderRadius: 8,
      marginTop: 8,
    },
    mainContent: {
      backgroundColor: appcolor.light,
      width: '100%',
      height: '100%',
      borderTopEndRadius: 30,
      borderTopStartRadius: 30,
      overflow: 'hidden',
    },
    titleMenu: {
      marginStart: 8,
      width: '50%',
      fontSize: 15,
      fontWeight: '700',
    },
    titleViewUpdate: {
      width: '100%',
      textAlign: 'center',
      padding: 32,
      fontSize: 15,
    },
  });
  return welcome === 1 ? (
    <Welcome />
  ) : userinfo.employeeId > 0 ? (
    <View
      style={{ ...styles.mainContainer, backgroundColor: appcolor.primary }}
    >
      {/* Header */}
      <HeaderVSM navigation={navigation} onShowMenu={showMenuHome} />
      {/* Content */}
      <View style={styles.mainContent}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: deviceHeight / 5 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={downloadData} />
          }
        >
          <View style={{ flex: 1 }}>
            <LoadingView
              isLoading={refreshing}
              title="Đang đồng bộ dữ liệu hệ thống"
            />
            <MenuHomeVSM navigation={navigation} isLoading={refreshing} />
            <SummaryVSM navigation={navigation} />
          </View>
        </ScrollView>
      </View>
    </View>
  ) : (
    <LoginVSM onLoginCallBack={downloadData} />
  );
};
export default HomeVSM;
