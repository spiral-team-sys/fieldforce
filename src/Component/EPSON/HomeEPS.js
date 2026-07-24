import React, { Fragment, PureComponent } from 'react';
import { View, Text, AppState, RefreshControl, ScrollView } from 'react-native';
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
import {
  _competitorId,
  MENU_TYPE,
  TRAINEEKEY,
  AppNameBuild,
} from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import { TODAY } from '../../Core/Utility';
import Login from '../../Component/Login';
import { MainMenu } from '../../Content/MainMenu';
import { GetMenu, RemoveUser } from '../../Controller/UserController';
import {
  APPDOWNLOAD,
  downloadAll,
} from '../../Controller/DownloadDataController';
import { scaleSize } from '../../Themes/AppsStyle';
import { Welcome } from '../Welcome/WelcomeScreen';
import messaging from '@react-native-firebase/messaging';
import { fetchDataNotify } from '../../Controller/NotificationController';
import MessageForm from '../../Content/Message';
import { DashboardMevn } from '../MEVN/DashboardMevn';
import { GetDataDashboard } from '../../Controller/DashboardController';
import PagerView from 'react-native-pager-view';
import { LoadingView } from '../../Control/ItemLoading/index';
import DeviceInfo from 'react-native-device-info';
import base64 from 'react-native-base64';
import {
  getPhotosNotUploadReport,
  uploadAllDataPhoto,
} from '../../Controller/PhotoController';

class HomeEPS extends PureComponent {
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
      welcome: 1,
      menus: [],
    };
  }

  async componentDidMount() {
    let userinfo = await GetEmployeeInfo();
    await setTimeout(async () => {
      await this.setState({ welcome: 0 });
      if (userinfo.employeeId !== undefined) {
        await this.props.GAppController.SetUserInfo(userinfo);
        await this.setState({ Employee: userinfo });
        // ExpriedDate account
        if (TODAY >= userinfo?.expriedDate) {
          await RemoveUser();
          await this.props.GAppController.SetUserInfo({});
          return;
        } else {
          await this.SyncdataApp();
          await this.uploadFileNotUpload();
        }
      }
    }, 3000);
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage !== null) {
          await this.goHyperlink(remoteMessage?.data || {});
        }
      });
    messaging().onNotificationOpenedApp(async remoteMessage => {
      await this.goHyperlink(remoteMessage?.data || {});
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      await this.goHyperlink(remoteMessage?.data || {});
    });
    messaging().onMessage(async remoteMessage => {
      await fetchDataNotify(e => {
        this.setBadge();
      });
      await this.setState({ notifyInfo: remoteMessage, isShowNotify: true });
    });
    this.subscription = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
  }
  goHyperlink = async info => {
    const hyperLinks = await info.hyperLinks;
    const einfo = this.props.userinfo;
    const deviceId = await DeviceInfo.getUniqueId();
    if (hyperLinks === null) {
      this.props.navigation.navigate('Notification');
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
    } else {
      await this.props.navigation.navigate(hyperLinks);
    }
  };
  async gotoMessage(info) {
    await this.setState({ isShowNotify: false });
    await this.goHyperlink(info);
  }
  componentWillUnmount() {
    try {
      this.subscription.remove();
    } catch (err) {
      console.log(err, 'componentWillUnmount');
    }
  }
  loadChart = async () => {
    await GetDataDashboard(result => {
      if (result.length > 0) {
        const _temp = JSON.parse(result[0]?.chartData || '[]');
        this.setState({ chartdata: _temp });
      } else {
        this.setState({ chartdata: [] });
      }
    });
  };
  uploadFileNotUpload = async () => {
    let arr = await getPhotosNotUploadReport();
    (await arr.length) && (await uploadAllDataPhoto(arr, true, true));
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
    await this.setState({ refreshing: true });
    await downloadAll(async e => {
      await ToastSuccess(e, 'Sync data', 'top');
    });
    await APPDOWNLOAD.downloadMenu();
    //Local load
    const _menu = await GetMenu(0);
    const _shops = await getStoreList('', TODAY);
    await this.props.GAppController.GetFormNow();
    await fetchDataNotify(async () => {
      await this.setBadge();
    });
    await this.setState({ shops: _shops, menus: _menu, refreshing: false });
  };
  render() {
    const { appcolor, userinfo } = this.props;
    const { chartdata } = this.state;
    return (
      <Fragment>
        {this.state.welcome === 1 ? (
          <Welcome />
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
            <LoadingView
              isLoading={this.state.refreshing}
              title="Đang tải dữ liệu"
              styles={{ marginTop: 8 }}
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={() => this.SyncdataApp()}
                />
              }
            >
              <View style={{ flex: 1, flexDirection: 'column', padding: 7 }}>
                {chartdata?.length > 0 && (
                  <PagerView
                    showPageIndicator={true}
                    pageMargin={12}
                    scrollEnabled={true}
                    transitionStyle="curl"
                    style={{ flex: 1, minHeight: 230 }}
                    initialPage={0}
                  >
                    {chartdata.map((v, i) => {
                      return (
                        <View style={{ minHeight: 120 }} key={`page${i}`}>
                          <DashboardMevn data={v} />
                        </View>
                      );
                    })}
                  </PagerView>
                )}
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
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: appcolor.surface,
                      width: '100%',
                    }}
                  />
                  {this.state.menus.length > 0 && (
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
          </View>
        ) : (
          <Login onLoginCallBack={() => this.SyncdataApp()} />
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
export default connect(mapStateToProps, mapDispatchToProps)(HomeEPS);
