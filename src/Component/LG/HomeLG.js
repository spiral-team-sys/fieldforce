import React, { forwardRef, PureComponent, useEffect, useState } from 'react';
import {
  View,
  AppState,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  LogBox,
  DeviceEventEmitter,
  Modal,
} from 'react-native';
import {
  defaultSetting,
  ManageMessenger,
  GetEmployeeInfo,
  deviceSize,
  ToastSuccess,
  GetToken,
} from '../../Core/Helper';
import {
  getLstMessengerNotSeen,
  getStoreList,
} from '../../Controller/WorkController';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  uploadAllDataPhoto,
  getPhotosNotUploadReport,
} from '../../Controller/PhotoController';
import { LGHeader } from '../../Content/LG/LGHeader';
import { deviceWidth, TODAY } from '../../Core/Utility';
import ShopList, { SHOP_RELOAD_EVENT } from '../Shops/ShopList';
import { APPDOWNLOAD } from '../../Controller/DownloadDataController';
import { connect } from 'react-redux';
import { AppCreateAction } from '../../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { LGHomeDashboard } from './LGHomeDashboard';
import base64 from 'react-native-base64';
import Login from '../Login';
import { downloadAll } from '../../Controller/DownloadDataController';
import {
  GetMenu,
  RemoveUser,
  SetRequestReportAction,
} from '../../Controller/UserController';
import { LGCenterTab } from './LGCenterTab';
import {
  checkSeenInApp,
  fetchDataNotify,
} from '../../Controller/NotificationController';
import { Welcome } from '../Welcome/WelcomeScreen';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import moment from 'moment';
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import DeviceInfo from 'react-native-device-info';
import { InAppMess } from '../Notification/InAppMess';
import { NotificationAPI } from '../../API/NotificationAPI';
import MenuList from '../../Content/Menu/MenuList';
const LASTSYNC = 'LastSyncData';
//PAGE HOME
const HomeTab = forwardRef((props, ref) => {
  const { menus, loading, userinfo, appcolor, navigation, shops } = props;
  const [lsMenu, setMenus] = useState([]);
  const [count, setCount] = useState(1);
  useEffect(() => {
    setMenus(menus);
    return () => loading;
  }, [menus]);
  const countItem = async () => {
    let countItem = count;
    userinfo.employeeId > 0 &&
      'pm'.includes(userinfo.groupType.toLowerCase()) &&
      countItem++;
    userinfo.employeeId > 0 &&
      'sup,leader'.includes(userinfo.groupType.toLowerCase()) &&
      countItem++;
    'asm,pg,mer,leader'.includes(userinfo.groupType.toLowerCase()) &&
      countItem++;
    await setCount(countItem);
  };
  useEffect(() => {
    const _load = countItem();
    return () => _load;
  }, []);
  return (
    <Tabs.Container
      headerContainerStyle={{ backgroundColor: appcolor.primary }}
      renderTabBar={props => (
        <MaterialTabBar
          {...props}
          labelStyle={{
            fontSize: 15,
            color: appcolor.light,
            fontWeight: '600',
          }}
          inactiveColor={appcolor.dark}
          activeColor={appcolor.dark}
          indicatorStyle={{ backgroundColor: appcolor.primary }}
          tabStyle={{ minWidth: deviceWidth / count, height: 42 }}
          scrollEnabled={true}
          style={{
            backgroundColor: appcolor.light,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        />
      )}
      containerStyle={{ backgroundColor: appcolor.surface }}
    >
      {userinfo.employeeId > 0 &&
        'pm'.includes(userinfo.groupType.toLowerCase()) && (
          <Tabs.Tab label="Thông kê" name="Thông kê">
            <View
              style={{
                backgroundColor: appcolor.surface,
                marginTop: 40,
                width: deviceWidth,
              }}
            >
              <LGHomeDashboard navigation={navigation} />
            </View>
          </Tabs.Tab>
        )}
      {userinfo.employeeId > 0 &&
        'sup,leader'.includes(userinfo.groupType.toLowerCase()) && (
          <Tabs.Tab label="Follow Daily" name="Follow Daily">
            <View
              style={{
                backgroundColor: appcolor.surface,
                marginTop: 40,
                width: deviceWidth,
              }}
            >
              <LGHomeDashboard navigation={navigation} />
            </View>
          </Tabs.Tab>
        )}
      {'asm,pg,mer,leader'.includes(userinfo.groupType.toLowerCase()) && (
        <Tabs.Tab label="Hôm nay" name="Hôm nay">
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              width: deviceWidth,
            }}
          >
            <ShopList
              shops={shops}
              header="none"
              navigation={navigation}
              loading={loading}
            />
          </View>
        </Tabs.Tab>
      )}
      {
        <Tabs.Tab label="Chức năng" name="Chức năng">
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              width: deviceWidth,
            }}
          >
            <MenuList menus={lsMenu} navigation={navigation} />
          </View>
        </Tabs.Tab>
      }
    </Tabs.Container>
  );
});
class HomeLG extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
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
      appState: AppState.currentState,
      welcome: 1,
      inAppShow: false,
      messengerId: 0,
    };
  }
  updateIndex = selectedIndex => {
    this.setState({ selectedIndex });
  };
  goHyperlink = async hyperLinks => {
    const einfo = this.props.userinfo;
    const deviceId = await DeviceInfo.getUniqueId();
    if (hyperLinks == undefined || hyperLinks === null) {
      return;
    } else if (
      hyperLinks?.includes('trainee') &&
      hyperLinks?.includes('spiral.com.vn')
    ) {
      const shareKey = {
        LoginID: TRAINEEKEY,
        AccountId: einfo.accountId,
        EmployeeId: einfo.employeeId,
        DeviceID: deviceId,
      };
      const appShare = await base64.encode(JSON.stringify(shareKey));
      const webURL = hyperLinks + appShare;
      await this.props.navigation.navigate('WebView', {
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
      await this.props.navigation.navigate('WebView', {
        link: webURL,
        titlePage: 'Trình duyệt',
      });
    } else if (hyperLinks.includes('http')) {
      await this.props.navigation.navigate('WebView', {
        link: hyperLinks,
        titlePage: 'Trình duyệt',
      });
    } else if (hyperLinks === '')
      await this.props.navigation.navigate('Notification');
    else {
      await this.props.navigation.navigate(hyperLinks);
    }
    await this.setState({ notifyInfo: {} });
  };
  SyncdataApp = async serverSync => {
    await this.setState({ refreshing: true });
    const _hour = parseInt(moment().format('H'));
    if (serverSync === true || _hour < 18) {
      //đồng bồ trên hệ thống truoc 18h || or tự đồng bộ
      // await downloadAll(async (e) => {
      //   await ToastSuccess(e, "Sync data", "top");
      //   await DeviceEventEmitter.emit(SHOP_RELOAD_EVENT, true);
      //   await AsyncStorage.setItem(LASTSYNC, moment().format("YYYYMMDD"))
      // });
      await APPDOWNLOAD.downloadMenu();
    }
    //Local load
    const _menu = await GetMenu(0);
    await this.setState({ menus: _menu });
    const _shops = await getStoreList('', TODAY);
    await this.setState({ shops: _shops, menus: _menu });
    await this.setState({ refreshing: false });
    await this.props.GAppController.GetFormNow();
    await fetchDataNotify(async () => {
      await this.setBadge();
    });
  };
  ThemeDefault = async () => {
    const json = await AsyncStorage.getItem('SETTINGS');
    const settings = (await JSON.parse(json)) || defaultSetting;
    this.props.GAppController.SetTheme(settings.mode);
  };
  messageInApp = async remoteMessage => {
    if (remoteMessage !== null) {
      const type = remoteMessage?.data?.type || null;
      switch (type) {
        case 'InApp':
          const messageId = remoteMessage?.data?.messengerId || 0;
          this.setState({ inAppShow: messageId > 0, messengerId: messageId });
          break;
        default:
          this.setState({ notifyInfo: remoteMessage, isShowNotify: true });
          break;
      }
    }
  };
  async componentDidMount() {
    await this.ThemeDefault();
    let userinfo = await GetEmployeeInfo();
    await setTimeout(async () => {
      await this.setState({ welcome: 0 });
    }, 3000);
    if (userinfo.employeeId !== undefined) {
      await this.props.GAppController.SetUserInfo(userinfo);
      // ExpriedDate accountr
      if (TODAY >= userinfo?.expriedDate) {
        await RemoveUser();
        await this.props.GAppController.SetUserInfo({});
        return;
      } else {
        await this.SyncdataApp(true);
        await this.uploadFileNotUpload();
      }
    }
    this._unsubscribe = this.props.navigation.addListener('focus', res => {
      this.setBadge();
      this.setState({ isShowNotify: false });
    });
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        this.messageInApp(remoteMessage);
        await this.goHyperlink(remoteMessage?.data?.hyperLinks || null);
      });
    messaging().onNotificationOpenedApp(async remoteMessage => {
      this.messageInApp(remoteMessage);
      await this.goHyperlink(remoteMessage?.data?.hyperLinks || 'Notification');
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      this.messageInApp(remoteMessage);
    });
    messaging().onMessage(async remoteMessage => {
      this.messageInApp(remoteMessage);
      fetchDataNotify(e => {
        this.setBadge();
      });
    });
    // await this.getInAppMessage()
    // Check AppState
    this.appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (
          this.state.appState.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          AsyncStorage.getItem(LASTSYNC).then(value => {
            if (value !== null && value !== moment().format('YYYYMMDD')) {
              this.SyncdataApp(true);
            } else {
              console.log('don"t sync');
            }
          });
        }
        this.setState({ appState: nextAppState });
      },
    );
  }
  getInAppMessage = async () => {
    const userinfo = await GetEmployeeInfo();
    if (userinfo.employeeId !== undefined) {
      let messageId = 0;
      const lstInApp = await checkSeenInApp();
      if (lstInApp.length > 0) {
        messageId = lstInApp[0].max;
      }
      const result = await NotificationAPI.GetInApp(messageId);
      if (result.statusId === 200) {
        if ((await result?.data.length) > 0) {
          this.setState({ inAppShow: messageId > 0, messengerId: messageId });
        }
      }
    }
  };
  uploadFileNotUpload = async () => {
    let arr = await getPhotosNotUploadReport();
    (await arr.length) && (await uploadAllDataPhoto(arr, true, true));
  };
  async setBadge() {
    let lstMessenger = await getLstMessengerNotSeen();
    if (Array.isArray(lstMessenger)) {
      this.setState({ badgeNotify: lstMessenger.length });
    }
  }
  componentWillUnmount() {
    this.appStateSubscription?.remove();
    this._unsubscribe();
  }

  render() {
    const { userinfo, appcolor, navigation } = this.props;
    LogBox.ignoreLogs(['VirtualizedLists']);
    return this.state.welcome === 1 ? (
      <Welcome />
    ) : userinfo.employeeId > 0 ? (
      <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
        <LGHeader
          appcolor={appcolor}
          isHome={true}
          navigation={navigation}
          title={userinfo.employeeName}
          countNotify={this.state.badgeNotify}
          iconLeft="bars"
          iconRight="bell"
          leftFunc={() => navigation.openDrawer()}
          rightFunc={() => ManageMessenger(this.props)}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flexGrow: 0.4 }}
          refreshControl={
            <RefreshControl
              titleColor={appcolor.dark}
              tintColor={appcolor.dark}
              title="Đang tải dữ liệu..."
              refreshing={this.state.refreshing}
              onRefresh={() => this.SyncdataApp(true)}
            />
          }
        >
          <View
            style={{
              height: 80 + deviceSize.dwidth / 3,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              zIndex: 3,
            }}
          >
            <LGCenterTab navigation={navigation} />
          </View>
        </ScrollView>
        <View
          style={{
            backgroundColor: appcolor.primary,
            height: 50,
            marginTop: -20,
            zIndex: -1,
          }}
        />
        <View
          style={{
            flexGrow: 10000,
            marginTop: -30,
            borderTopRightRadius: 40,
            borderTopLeftRadius: 30,
            backgroundColor: appcolor.light,
          }}
        >
          <HomeTab
            appcolor={appcolor}
            userinfo={userinfo}
            shops={this.state.shops}
            navigation={navigation}
            loading={this.state.refreshing}
            menus={this.state.menus}
          />
        </View>
        {/* <Modal visible={this.state.inAppShow}>
              <InAppMess props={{
                isViewDetail: 0,
                inAppId: this.state.messengerId,
                close: () => this.setState({ inAppShow: false })
              }} />
            </Modal> */}
      </SafeAreaView>
    ) : (
      <Login onLoginCallBack={() => this.SyncdataApp(true)} />
    );
  }
}
const mapStateToProps = state => {
  return {
    appcolor: state.GAppState.appcolor,
    userinfo: state.GAppState.userinfo,
    homemenu: state.GAppState.homemenu,
    shoplist: state.GAppState.shoplist,
    statusPermission: state.GAppState.statusPermission,
  };
};
const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(HomeLG);
