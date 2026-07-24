import React, { Fragment, PureComponent } from 'react';
import {
  View,
  Text,
  AppState,
  RefreshControl,
  ScrollView,
  DeviceEventEmitter,
  Modal,
} from 'react-native';
import { Divider } from '@rneui/themed';
import Moment from 'moment';
import {
  GetEmployeeInfo,
  ManageMessenger,
  saveStore,
  getStore,
  ToastSuccess,
  GetToken,
} from '../../Core/Helper';
import {
  getLstMessengerNotSeen,
  getStoreList,
} from '../../Controller/WorkController';
import { _competitorId, MENU_TYPE } from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import { TODAY } from '../../Core/Utility';
import { MainMenu } from '../../Content/MainMenu';
import { GetMenu, RemoveUser } from '../../Controller/UserController';
import {
  APPDOWNLOAD,
  downloadAll,
} from '../../Controller/DownloadDataController';
import { scaleSize } from '../../Themes/AppsStyle';
import messaging from '@react-native-firebase/messaging';
import {
  checkSeenInApp,
  fetchDataNotify,
} from '../../Controller/NotificationController';
import MessageForm from '../../Content/Message';
import { GetDataDashboard } from '../../Controller/DashboardController';
import { DashboardRouting } from '../../Content/Beko/DashboardRouting';
import { LoadingView } from '../../Control/ItemLoading';
import LoginAka from './LoginAka';
import { WelcomeAka } from './WelcomeAka';
import { deviceWidth } from '../Home';
import { DashboardSellInTF } from '../Dashboard/Tefal/DashboardSellIn';
import { DashBoardTargetTF } from '../Dashboard/Tefal/DashBoardTargetTF';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import base64 from 'react-native-base64';
import DeviceInfo from 'react-native-device-info';
import { NotificationAPI } from '../../API/NotificationAPI';
import { InAppMess } from '../Notification/InAppMess';
import { SHOP_RELOAD_EVENT } from '../Shops/ShopList';
const LASTSYNC = 'LastSyncData';

class HomeAka extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isNewApp: false,
      isMainApp: true,
      isShowNotify: false,
      badgeNotify: 0,
      Employee: {},
      notifyInfo: '',
      lstCat: [],
      selectedCat: '',
      displayMenu: 0,
      appState: AppState.currentState,
      chartdata: [],
      activeSlide: 0,
      titlePage: '',
      detailSelect: [],
      pageIndex: null,
      userinfo: null,
      refreshing: false,
      inAppShow: false,
      welcome: 1,
    };
  }
  goHyperlink = async hyperLinks => {
    const einfo = this.props.userinfo;
    const deviceId = await DeviceInfo.getUniqueId();
    // console.log(hyperLinks, "goHyperlink")
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

  async componentDidMount() {
    let userinfo = await GetEmployeeInfo();
    await setTimeout(async () => {
      await this.setState({ welcome: 0 });
      if (userinfo.employeeId !== undefined) {
        await this.props.GAppController.SetUserInfo(userinfo);
        await this.setState({ Employee: userinfo });
        if (TODAY >= userinfo?.expriedDate) {
          // 20201112
          await RemoveUser();
          await this.props.GAppController.SetUserInfo({});
        } else {
          await this.setBadge();
          await this.loadChart();
          await this.SyncdataApp();
          // const tok=await GetToken()
          // console.log(tok)
          //load menu
          const _menu = await GetMenu(0);
          _menu && _menu.length === 0 && (await APPDOWNLOAD.downloadMenu());
          await this.setState({ menus: [] });
          await this.setState({ menus: _menu });
        }
      }
    }, 3000);

    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        console.log(remoteMessage, 'getInitialNotificationget1');
        this.messageInApp(remoteMessage);
        await this.goHyperlink(remoteMessage?.data?.hyperLinks || null);
      });
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log(remoteMessage, 'getInitialNotificationget2');
      this.messageInApp(remoteMessage);
      await this.goHyperlink(remoteMessage?.data?.hyperLinks || 'Notification');
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log(remoteMessage, 'getInitialNotificationget3');
      this.messageInApp(remoteMessage);
    });
    messaging().onMessage(remoteMessage => {
      console.log(remoteMessage, 'getInitialNotificationget4');
      // this.messageInApp(remoteMessage)
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

    // messaging().getInitialNotification().then(async remoteMessage => {
    //     if (remoteMessage !== null) {
    //         await this.gotoLink(remoteMessage?.data || {})
    //     }
    // })
    // messaging().onNotificationOpenedApp(async remoteMessage => {
    //     // console.log("onNotificationOpenedApp")
    //     await this.gotoLink(remoteMessage?.data || {})
    // });
    // messaging().setBackgroundMessageHandler(async remoteMessage => {
    //     // console.log(remoteMessage, "setBackgroundMessageHandler")
    //     await this.gotoLink(remoteMessage?.data || {})

    // });
    // messaging().onMessage(async remoteMessage => {
    //     // console.log("onMessage")
    //     await fetchDataNotify(e => { this.setBadge(); })
    //     await this.setState({ notifyInfo: remoteMessage, isShowNotify: true })
    //     // await this.gotoLink(remoteMessage?.data || {})
    // });
    this.subscription = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
    this.updatealldata = DeviceEventEmitter.addListener('updatealldata', () => {
      this.SyncdataApp();
    });
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
  gotoLink = info => {
    if (info.hyperLinks === undefined || info.hyperLinks === null) {
      this.props.navigation.navigate('Notification');
    } else if (info.hyperLinks.includes('http')) {
      this.props.navigation.navigate('WebView', {
        link: hyperLinks,
        titlePage: 'Trình duyệt',
      });
    } else {
      this.props.navigation.navigate(info.hyperLinks);
    }
  };
  async gotoMessage(info) {
    await this.setState({ isShowNotify: false });
    await this.gotoLink(info);
  }
  componentWillUnmount() {
    try {
      this.subscription.remove();
      this.updatealldata.remove();
    } catch (err) {
      console.log(err, 'componentWillUnmount');
    }
  }
  loadChart = async () => {
    await GetDataDashboard(result => {
      //console.log(result, "GetDataDashboard")
      if (result.length > 0) {
        this.setState({ chartdata: result || [] });
      } else {
        this.setState({ chartdata: [] });
      }
    });
  };
  async checkAutoDownloadShop() {
    await saveStore(MENU_TYPE, '0');
    let Today = parseInt(Moment(new Date()).format('YYYYMMDD'));
    let lst = await getStoreList('', Today);
    if (lst?.length === 0) {
      this.menuRef1?.onItemPress({ Id: 1, name: 'Download' });
    }
  }
  _backgroundState(state) {
    return state.match(/inactive|background/);
  }
  _handleAppStateChange = async nextAppState => {
    let isload = false;
    if (this._backgroundState(nextAppState)) {
    } else if (
      this._backgroundState(this.state.appState) &&
      nextAppState === 'active' &&
      isload === false
    ) {
      isload = true;
      await this.setBadge();
      await this.setState({ isShowNotify: false });
      await this.loadChart();
      await this.checkAutoDownloadShop();
    }
    this.setState({ appState: nextAppState });
  };
  async setBadge() {
    let lstMessenger = await getLstMessengerNotSeen();
    if (Array.isArray(lstMessenger)) {
      this.setState({ badgeNotify: lstMessenger.length });
    }
  }
  changeDisplayMenu = async () => {
    let menuType = await getStore(MENU_TYPE);
    if (menuType !== undefined) {
      await saveStore(MENU_TYPE, parseInt(menuType) === 0 ? '1' : '0');
      this.setState({ displayMenu: parseInt(menuType) === 0 ? 1 : 0 });
    }
  };
  SyncdataApp = async () => {
    await this.setState({ refreshing: true });
    await this.loadChart();

    const _menu = await GetMenu(0);
    await APPDOWNLOAD.downloadMenu();
    await this.setState({ menus: [] });
    await this.setState({ menus: _menu });
    await downloadAll(async result => {
      this.setState({ refreshing: false });
      ToastSuccess(result, 'SyncData', 'top');
      await DeviceEventEmitter.emit(SHOP_RELOAD_EVENT, true);
      await AsyncStorage.setItem(LASTSYNC, moment().format('YYYYMMDD'));
    });
    await fetchDataNotify(async e => {
      await this.setBadge();
    });
    setTimeout(() => {
      this.setState({ refreshing: false });
    }, 60000); //sau 1 phut neu mat ket noi se tat
  };
  messageInApp = async remoteMessage => {
    console.log(
      remoteMessage,
      'getInitialNotificationgetInitialNotificationgetInitialNotification',
    );
    if (remoteMessage !== null) {
      const type = remoteMessage?.data?.type || null;
      if (type !== null && type == 'InApp') {
        const messageId = remoteMessage?.data?.messengerId || 0;
        this.setState({ inAppShow: messageId > 0, messengerId: messageId });
      } else {
        this.setState({ notifyInfo: remoteMessage, isShowNotify: true });
      }
    }
  };
  render() {
    const { appcolor, userinfo } = this.props;
    const { chartdata } = this.state;
    return (
      <Fragment>
        {this.state.welcome === 1 ? (
          <WelcomeAka />
        ) : userinfo.employeeId !== undefined ? (
          <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <HeaderCustom
              isHome={true}
              title={userinfo.employeeName}
              countNotify={this.state.badgeNotify}
              iconLeft="bars"
              iconRight="bell"
              leftFunc={() => this.props.navigation.openDrawer()}
              rightFunc={() => ManageMessenger(this.props)}
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={() => this.SyncdataApp()}
                />
              }
            >
              <View style={{ flex: 1 }}>
                <LoadingView
                  isLoading={this.state.refreshing}
                  title="Đang đồng bộ dữ liệu"
                />
                <View style={{ height: 240, paddingEnd: 0 }}>
                  {chartdata.length > 0 && (
                    <ScrollView
                      // showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled
                      pagingEnabled
                      contentContainerStyle={{
                        width: chartdata.length * deviceWidth,
                      }}
                      horizontal
                    >
                      {chartdata.map(it => {
                        if (it.pageName == 'ROUTING') {
                          return (
                            <View
                              key={`db_Routing`}
                              style={{
                                width: deviceWidth,
                                backgroundColor: appcolor.surface,
                                borderRadius: 10,
                                marginBottom: 10,
                                overflow: 'hidden',
                                padding: 4,
                              }}
                            >
                              <DashboardRouting
                                navigation={this.props.navigation}
                                data={JSON.parse(it.chartData)[0] || {}}
                              />
                            </View>
                          );
                        } else if (it.pageName == 'SELLIN') {
                          return (
                            <View
                              key={`db_Sellin`}
                              style={{
                                width: deviceWidth,
                                backgroundColor: appcolor.surface,
                                borderRadius: 35,
                                marginBottom: 10,
                                overflow: 'hidden',
                                padding: 4,
                              }}
                            >
                              <DashboardSellInTF
                                navigation={this.props.navigation}
                                typeDashboard={it.pageName}
                              />
                            </View>
                          );
                        } else if (
                          it.pageName !== 'SELLIN' &&
                          it.pageName !== 'ROUTING'
                        ) {
                          return (
                            <View
                              key={'Dashboard_' + it.pageName}
                              style={{
                                width: deviceWidth,
                                backgroundColor: appcolor.light,
                                borderRadius: 35,
                                marginBottom: 10,
                                overflow: 'hidden',
                                padding: 10,
                                margin: 4,
                              }}
                            >
                              <DashBoardTargetTF
                                navigation={this.props.navigation}
                                typeDashboard={it.pageName}
                              />
                            </View>
                          );
                        } else return null;
                      })}
                    </ScrollView>
                  )}
                </View>
                <View style={{ flexGrow: 1, backgroundColor: appcolor.light }}>
                  <Text
                    style={{
                      color: appcolor.dark,
                      flexGrow: 1,
                      padding: 12,
                      fontWeight: '700',
                      fontSize: scaleSize(20),
                    }}
                  >
                    Chức năng
                  </Text>
                  {!this.state.refreshing && (
                    <MainMenu
                      menus={this.state.menus}
                      navigation={this.props.navigation}
                    />
                  )}
                </View>
              </View>
            </ScrollView>
            <MessageForm
              ref={ref => (this.messageRef = ref)}
              animation={'slideY'}
              position={'top'}
              type={'info'}
              appcolor={this.props.appcolor}
              navigation={this.props.navigation}
              data={this.state.notifyInfo?.data || {}}
              messageHeight={100}
            >
              {this.state.isShowNotify &&
                this.messageRef?.showMessage(
                  this.state.notifyInfo?.notification?.title,
                  this.state.notifyInfo?.notification?.body,
                  7000,
                )}
            </MessageForm>
            <Modal visible={this.state.inAppShow}>
              <InAppMess
                props={{
                  isViewDetail: 0,
                  inAppId: this.state.messengerId,
                  close: () => this.setState({ inAppShow: false }),
                }}
              />
            </Modal>
          </View>
        ) : (
          <LoginAka
            {...this.props}
            onLoginCallBack={() => this.SyncdataApp()}
          />
        )}
      </Fragment>
    );
  }
}
function mapStateToProps(state) {
  return {
    userinfo: state.GAppState.userinfo,
    appcolor: state.GAppState.appcolor,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeAka);
