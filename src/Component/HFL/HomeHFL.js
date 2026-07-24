import React, { Fragment, PureComponent } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  LogBox,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {
  defaultSetting,
  GetEmployeeInfo,
  MessageSetting,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import {
  getLstMessengerNotSeen,
  getStoreList,
} from '../../Controller/WorkController';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import MessageForm from '../../Content/Message';
import {
  uploadAllDataPhoto,
  getPhotosNotUploadReport,
} from '../../Controller/PhotoController';
import { checkNetwork, TODAY } from '../../Core/Utility';
import {
  APPDOWNLOAD,
  downloadAll,
} from '../../Controller/DownloadDataController';
import { connect } from 'react-redux';
import { AppCreateAction } from '../../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { GetMenu, RemoveUser } from '../../Controller/UserController';
import { fetchDataNotify } from '../../Controller/NotificationController';
import { scaleSize } from '../../Themes/AppsStyle';
import { Avatar, Icon, Badge } from '@rneui/themed';
import LottieView from 'lottie-react-native';
import { LocalSignIn } from '../../Control/LocalSignIn';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { Welcome } from '../Welcome/WelcomeScreen';
import { LoadingView } from '../../Control/ItemLoading/index';
import { APPNAME } from '../../Core/URLs';
import LoginHFL from './LoginHFL';
import moment from 'moment';
import { MenuHFL } from './MenuHFL';
import { QuickViewHFL } from './QuickViewHFL';
const versionNumBuild = DeviceInfo.getBuildNumber();
class HomeHFK extends PureComponent {
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
      isSec: 0,
      welcome: 1,
    };
  }
  requestStorage() {
    try {
      request(
        Platform.select({
          android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
        }),
      ).then(res => {
        if (res !== 'granted') {
          MessageSetting(
            'Thông báo',
            Platform.OS === 'ios'
              ? 'Vui lòng cho phép App sử dụng camera, Quyền riêng tư -> camera -> tìm đến App ' +
                  APPNAME +
                  ' -> cho phép (Bật).'
              : 'Vui lòng cho phép sử dụng chụp hình trong phần cài đặt của thiết bị',
            () => {
              Platform.OS === 'ios'
                ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
                : openSettings().catch(() =>
                    console.warn('cannot open settings'),
                  );
            },
          );
        }
      });
    } catch (error) {
      console.log('location set error:', error);
    }
  }
  updateIndex = selectedIndex => {
    this.setState({ selectedIndex });
  };
  checkPermiss = () => {
    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
      .then(result => {
        console.log(result, 'CAMERA');
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log(
              'This feature is not available (on this device / in this context)',
            );
            break;
          case RESULTS.DENIED:
            console.log(
              'The permission has not been requested / is denied but requestable',
            );
            break;
          case RESULTS.LIMITED:
            console.log('The permission is limited: some actions are possible');
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            break;
        }
      })
      .catch(error => {
        console.log(error, 'sss');
      });
  };
  SyncdataApp = async () => {
    const connect = await checkNetwork();
    if (connect) {
      await this.setState({ refreshing: true });
      await APPDOWNLOAD.downloadMenu();
      await downloadAll(async e => {
        await ToastSuccess(e, 'Sync data', 'top');
        const _menu = await GetMenu(0);
        const _shops = await getStoreList('', moment().format('YYYYMMDD'));
        // console.log(_menu)
        await this.setState({ shops: _shops, menus: _menu });
      });
      //Local load
      await setTimeout(() => {
        this.setState({ refreshing: false });
      }, 2000);
      await this.props.GAppController.GetFormNow();
      await fetchDataNotify(async () => {
        await this.setBadge();
      });
    } else {
      ToastError('Chưa có kết nối mạng', 'Internet', 'top');
    }
  };
  ThemeDefault = async () => {
    const json = await AsyncStorage.getItem('SETTINGS');
    const settings = (await JSON.parse(json)) || defaultSetting;
    this.props.GAppController.SetTheme(settings.mode);
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
  async componentDidMount() {
    await this.ThemeDefault();
    await this.requestStorage();
    let userinfo = await GetEmployeeInfo();
    await setTimeout(async () => {
      await this.setState({ welcome: 0 });
      if (userinfo.employeeId !== undefined) {
        await this.setState({ userinfo: userinfo });
        await this.props.GAppController.SetUserInfo(userinfo);
        // ExpriedDate account
        if (TODAY >= userinfo?.expriedDate) {
          await RemoveUser();
          await this.props.GAppController.SetUserInfo({});
          return;
        } else {
          // await LocalSignIn.isSupportID((e) => { this.setState({ isSec: e }) })
          await this.SyncdataApp();
          await this.uploadFileNotUpload();
        }
      }
    }, 3000);

    this._unsubscribe = this.props.navigation.addListener('focus', res => {
      this.setBadge();
      this.setState({ isShowNotify: false });
    });
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage !== null) {
          await this.gotoLink(remoteMessage?.data || {});
        }
      });
    messaging().onNotificationOpenedApp(async remoteMessage => {
      // console.log("onNotificationOpenedApp")
      await this.gotoLink(remoteMessage?.data || {});
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      // console.log(remoteMessage, "setBackgroundMessageHandler")
      await this.gotoLink(remoteMessage?.data || {});
    });
    messaging().onMessage(async remoteMessage => {
      // console.log("onMessage")
      await fetchDataNotify(e => {
        this.setBadge();
      });
      await this.setState({ notifyInfo: remoteMessage, isShowNotify: true });
      // await this.gotoLink(remoteMessage?.data || {})
    });
  }
  uploadFileNotUpload = async () => {
    let arr = await getPhotosNotUploadReport();
    (await arr.length) && (await uploadAllDataPhoto(arr, true, true));
  };
  async setBadge() {
    let lstMessenger = await getLstMessengerNotSeen();
    //? console.log(lstMessenger, "messager")
    if (Array.isArray(lstMessenger)) {
      this.setState({ badgeNotify: lstMessenger.length });
    }
  }
  async gotoMessage(info) {
    await this.setState({ isShowNotify: false });
    await this.gotoLink(info);
  }
  render() {
    const { appcolor, userinfo } = this.props;
    LogBox.ignoreLogs(['VirtualizedLists']);
    return (
      <Fragment>
        {this.state.welcome === 1 ? (
          <Welcome />
        ) : userinfo.employeeId > 0 ? (
          <SafeAreaView style={{ backgroundColor: appcolor.light, flex: 1 }}>
            <LoadingView
              title="Đang đồng bộ dữ liệu..."
              styles={{ zIndex: 100, top: 100 }}
              isLoading={this.state.refreshing}
            />
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 12,
                minHeight: 42,
                marginTop: Platform.OS == 'android' ? 40 : 0,
              }}
            >
              <View style={{ width: 50, justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.openDrawer()}
                >
                  <SpiralIcon
                    name="align-right"
                    color={appcolor.dark}
                    type="feather"
                    size={scaleSize(30)}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flexGrow: 1, justifyContent: 'center' }}>
                <Text
                  style={{
                    fontSize: scaleSize(14),
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  Trang chủ
                </Text>
              </View>
              <View>
                <View
                  style={{
                    width: 50,
                    justifyContent: 'center',
                    marginRight: 12,
                    justifyContent: 'flex-end',
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('Notification')
                    }
                  >
                    <Avatar
                      size={42}
                      rounded
                      icon={{
                        name: 'bell',
                        type: 'feather',
                        color: appcolor.dark,
                      }}
                    />
                    {this.state?.badgeNotify > 0 && (
                      <Badge
                        status="success"
                        value={this.state?.badgeNotify}
                        containerStyle={{
                          position: 'absolute',
                          top: 5,
                          left: 0,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ backgroundColor: appcolor.surface, paddingBottom: 10 }}
              refreshControl={
                <RefreshControl
                  titleColor={appcolor.dark}
                  tintColor={appcolor.dark}
                  title="Đang tải dữ liệu..."
                  refreshing={this.state.refreshing}
                  onRefresh={() => this.SyncdataApp()}
                />
              }
            >
              <View
                style={{
                  height: 250,
                  backgroundColor: appcolor.light,
                  borderBottomLeftRadius: 50,
                  borderBottomRightRadius: 50,
                }}
              >
                <QuickViewHFL navigation={this.props.navigation} />
              </View>

              <Text
                style={{
                  marginLeft: 20,
                  padding: 6,
                  opacity: 0.5,
                  fontSize: scaleSize(12),
                  fontWeight: '700',
                  color: appcolor.dark,
                }}
              >
                Chức năng
              </Text>
              {!this.state.refreshing && (
                <MenuHFL
                  navigation={this.props.navigation}
                  menus={this.state.menus}
                />
              )}
            </ScrollView>
            {/* <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    style={{ backgroundColor: appcolor.light, marginBottom: 80, paddingBottom: 10 }}
                                    refreshControl={<RefreshControl
                                        titleColor={appcolor.dark}
                                        tintColor={appcolor.dark}
                                        title="Đang tải dữ liệu..."
                                        refreshing={this.state.refreshing}
                                        onRefresh={() => this.SyncdataApp()}
                                    />}>
                                    <View style={{ backgroundColor: appcolor.light }}>
                                        <View style={{
                                            flexDirection: 'row', height: deviceHeight * .3,
                                            backgroundColor: appcolor.primary, borderBottomRightRadius: 40, zIndex: 100,
                                            borderBottomLeftRadius: 40, shadowOpacity: 0.8, shadowOffset: { width: 1.4, height: 1 },
                                        }}>
                                            <View style={{ flex: 1, borderBottomRightRadius: 40 }}>

                                            </View>
                                        </View>
                                        <View style={{ minHeight: 180 }}>
                                            <Text style={{ padding: 7, fontWeight: '900', color: appcolor.dark }}>Chức năng</Text>

                                        </View>
                                        <View style={{ backgroundColor: appcolor.light }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontWeight: '900', flexGrow: 1, color: appcolor.dark, padding: 7 }}>Công việc hôm nay</Text>
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ShopList')} style={{ padding: 7 }}>
                                                    <Text style={{ color: appcolor.info, fontStyle: 'italic', textDecorationLine: 'underline' }}>Mở rộng</Text>
                                                </TouchableOpacity>
                                            </View>
                                            {
                                                this.state.shops.length
                                            }
                                            <ShopOneMore shops={this.state.shops || []} {...this.props} />
                                        </View>
                                    </View>
                                </ScrollView> */}
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
            <Modal
              animationType="slide"
              visible={this.state.isSec > 0 ? true : false}
            >
              <View style={{ backgroundColor: appcolor.light, height: '100%' }}>
                <View style={{ height: '40%' }}>
                  <LottieView
                    autoPlay
                    style={{ height: '100%' }}
                    source={require('../../Themes/lotties/security.json')}
                  />
                </View>
                <View style={{ padding: 12 }}>
                  <Text style={{ textAlign: 'center', color: appcolor.dark }}>
                    Xác thực thông tin bảo mật 2 lớp
                  </Text>
                  <TouchableOpacity
                    style={{ padding: 13 }}
                    onPress={() =>
                      LocalSignIn.onAuthenticateID(e => {
                        e === 1 && this.setState({ isSec: -1 });
                      })
                    }
                  >
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                      {this.state.isSec === 1 ? (
                        <LottieView
                          autoPlay
                          style={{ height: 70, width: 70 }}
                          source={require('../../Themes/lotties/faceid.json')}
                        />
                      ) : (
                        <LottieView
                          autoPlay
                          style={{ height: 70, width: 70 }}
                          source={require('../../Themes/lotties/fingerprint.json')}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ padding: 12, alignItems: 'center' }}>
                  <Text
                    style={{ color: appcolor.danger, textAlign: 'center' }}
                  >{`Xác thực ${
                    this.state.isSec === 1 ? ' khuôn mặt' : ' vân tay'
                  } mở khóa ứng dụng`}</Text>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        ) : (
          <LoginHFL onLoginCallBack={() => this.SyncdataApp()} />
        )}
      </Fragment>
    );
  }
}
const mapStateToProps = state => {
  return {
    appcolor: state.GAppState.appcolor,
    userinfo: state.GAppState.userinfo,
    homemenu: state.GAppState.homemenu,
    shoplist: state.GAppState.shoplist,
  };
};
const styles = StyleSheet.create({
  box: {
    height: 250,
    width: '100%',
  },
  boxA: {
    backgroundColor: 'white',
  },
  boxB: {
    backgroundColor: '#D8D8D8',
  },
  header: {
    height: 250,
    width: '100%',
    backgroundColor: 'trasparent',
  },
});

const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(HomeHFK);
