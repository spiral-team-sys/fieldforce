import React, { Fragment, PureComponent } from 'react';
import {
  View,
  Text,
  AppState,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Icon, Divider, ButtonGroup } from '@rneui/themed';
import ActionSheet from 'react-native-actions-sheet';
import Moment from 'moment';
import {
  fetchGet,
  GetEmployeeInfo,
  ManageMessenger,
  saveStore,
  getStore,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import {
  getLstMessengerNotSeen,
  getCategoryPro,
  getStoreList,
} from '../../Controller/WorkController';
import {
  AppNameBuild,
  _competitorId,
  URL_GET_SELLOUT_CHART_HMD,
  MENU_TYPE,
} from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import { TODAY } from '../../Core/Utility';
import Login from '../../Component/Login';
import ChartDaily from '../../Content/ChartDaily';
import { MainMenu } from '../../Content/MainMenu';
import ChartWeekly from '../../Content/ChartWeeekly';
import ChartMonthly from '../../Content/ChartMonthly';
import { ChartDetail } from '../../Content/ChartDetail';
import { ChartSellHMD } from '../../Content/ChartSellHMD';
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
export const deviceHeight = Dimensions.get('window').height;
export const deviceWidth = Dimensions.get('window').width;

class HomePSV extends PureComponent {
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
      chartListFull: [],
      chartList: [],
      activeSlide: 0,
      dataChartHMD: null,
      titlePage: '',
      detailSelect: [],
      pageIndex: null,
      userinfo: null,
      refreshing: false,
      welcome: 1,
      selectedIndex: 0,
    };
    this.updateIndex = this.updateIndex.bind(this);
  }

  async componentDidMount() {
    let userinfo = await GetEmployeeInfo();
    await setTimeout(() => {
      this.setState({ welcome: 0 });
    }, 1500);
    if (userinfo.employeeId !== undefined) {
      await this.props.GAppController.SetUserInfo(userinfo);
      await this.setState({ Employee: userinfo });
      if (TODAY >= userinfo?.expriedDate) {
        // 20201112
        await RemoveUser();
        await this.props.GAppController.SetUserInfo({});
      }
      await this.setBadge();
      await this.loadChartSlide();
      await this.SyncdataApp();
      //load menu
      const _menu = await GetMenu(0);
      _menu && _menu.length === 0 && (await APPDOWNLOAD.downloadMenu());
      await this.setState({ menus: [] });
      await this.setState({ menus: _menu });
    }
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
    this.subscription = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
    await this.loadCategory(_competitorId);
  }
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
    } catch (err) {
      console.log(err, 'componentWillUnmount');
    }
  }
  loadChartSlide = async () => {
    this.setState({ loading: true });
    this.setState({ chartList: [{ pageName: 'Doanh số', id: 66 }] });
    let dataJson = await fetchGet(URL_GET_SELLOUT_CHART_HMD);
    this.setState({ loading: false });
    this.setState({ chartList: [] });
    if (dataJson !== undefined) {
      this.setState({ chartListFull: dataJson });
      this.loadTitleChart();
      try {
        let lstParse = JSON.parse(dataJson[0].chartData);
        let lstTem = [];
        lstParse.map((item, index) => {
          lstTem.push({ ...item, id: index + 1, pageName: item.Type });
        });
        this.setState({ chartList: lstTem });
        this.loadTitleChart();
      } catch (error) {
        console.log('Load data chart false: ', error);
      }
    }
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
      await this.loadChartSlide();
      await this.checkAutoDownloadShop();
    }
    this.setState({ appState: nextAppState });
  };
  async loadCategory(comid) {
    let res = await getCategoryPro(comid);
    if (res != undefined && res.length !== 0) {
      this.setState({ lstCat: res });
    }
  }
  async setBadge() {
    let lstMessenger = await getLstMessengerNotSeen();
    if (Array.isArray(lstMessenger)) {
      this.setState({ badgeNotify: lstMessenger.length });
    }
  }
  DisplayChart(index) {
    if (index == 0) {
      return (
        <ChartDaily
          ref={ref => (this._ChartDaily = ref)}
          category={this.state.selectedCat}
          appcolor={this.props.appcolor}
        />
      );
    } else if (index == 1) {
      return (
        <ChartWeekly
          ref={ref => (this._ChartWeekly = ref)}
          category={this.state.selectedCat}
          appcolor={this.props.appcolor}
        />
      );
    } else
      return (
        <ChartMonthly
          ref={ref => (this._ChartMonth = ref)}
          category={this.state.selectedCat}
          appcolor={this.props.appcolor}
        />
      );
  }
  updateIndex(selectedIndex) {
    this.setState({ selectedIndex });
  }
  showDetailHome = async detail => {
    console.log(detail);
    // if (detail.length === 0) {
    //     ToastError('Chưa có dữ liệu chart.')
    //     return
    // }

    // await this.setState({ detailSelect: detail })
    // this.props.navigation.navigate('ChartDetail', { Detail: detail, titlePage: this.state.titlePage });
  };
  loadTitleChart = () => {
    let title = 'Doanh số ';
    let index = this.state.activeSlide;
    if (AppNameBuild !== 'hmd') {
      if (index === 1) {
        title += 'hằng tuần';
        this._ChartWeekly &&
          this._ChartWeekly.ChartSetup(this.state.selectedCat);
      } else if (index === 2) {
        title += 'hằng tháng';
        this._ChartMonth && this._ChartMonth.ChartSetup(this.state.selectedCat);
      } else {
        title += 'hằng ngày';
        this._ChartDaily && this._ChartDaily.ChartSetup(this.state.selectedCat);
      }
    } else {
      title =
        this.state.chartList.length > 0
          ? this.state.chartListFull[0].chartName +
            ' ' +
            this.state.chartList[index].pageName
          : '';
    }

    this.setState({ titlePage: title });
  };
  loadChart() {
    if (this.state.activeSlide === 0) {
      this._ChartDaily?.ChartSetup(this.state.selectedCat);
    } else if (this.state.activeSlide === 1) {
      this._ChartWeekly?.ChartSetup(this.state.selectedCat);
    } else {
      this._ChartMonth?.ChartSetup(this.state.selectedCat);
    }
  }
  changeDisplayMenu = async () => {
    let menuType = await getStore(MENU_TYPE);
    if (menuType !== undefined) {
      await saveStore(MENU_TYPE, parseInt(menuType) === 0 ? '1' : '0');
      this.setState({ displayMenu: parseInt(menuType) === 0 ? 1 : 0 });
    }
  };
  sliderenderItem = ({ item, index }) => {
    let viewResult = [];
    switch (item.pageName) {
      case 'DAILY':
        viewResult.push(
          <View key={index + '-DAILY'} style={{ flex: 1 }}>
            <ChartDaily
              ref={ref => (this._ChartDaily = ref)}
              category={this.state.selectedCat}
              pageIndex={index}
              appcolor={this.props.appcolor}
            />
          </View>,
        );
        break;
      case 'WEEKLY':
        viewResult.push(
          <View key={`WEEKLY${index}`} style={{ flex: 1 }}>
            <ChartWeekly
              ref={ref => (this._ChartWeekly = ref)}
              category={this.state.selectedCat}
              pageIndex={index}
              appcolor={this.props.appcolor}
            />
          </View>,
        );
        break;
      case 'MONTH':
        viewResult.push(
          <View key={`MONTH${index}`} style={{ flex: 1 }}>
            <ChartMonthly
              ref={ref => (this._ChartMonth = ref)}
              category={this.state.selectedCat}
              pageIndex={index}
              appcolor={this.props.appcolor}
            />
          </View>,
        );
        break;
      default:
        viewResult.push(
          <View key={`dafad${index}`} style={{ flex: 1 }}>
            <ChartSellHMD
              ref={ref => (this._ChartDaily = ref)}
              category={this.state.selectedCat}
              pageIndex={index}
              chartList={this.state.chartList}
              showDetailHome={this.showDetailHome}
              LoadData={this.loadChartSlide}
              loading={this.state.loading}
              pageSelected={this.state.activeSlide}
              appcolor={this.props.appcolor}
            />
          </View>,
        );
        break;
    }
    return (
      <View
        style={{
          backgroundColor: this.props.appcolor.white,
          height:
            Platform.OS === 'android' ? deviceHeight / 2.7 : deviceHeight / 3,
        }}
      >
        {viewResult}
      </View>
    );
  };
  SyncdataApp = async () => {
    await this.setState({ refreshing: true });
    const _menu = await GetMenu(0);
    await APPDOWNLOAD.downloadMenu();
    await this.setState({ menus: [] });
    await this.setState({ menus: _menu });
    await downloadAll(result => {
      this.setState({ refreshing: false });
      ToastSuccess(result, 'SyncData', 'top');
    });
    await fetchDataNotify(async e => {
      await this.setBadge();
    });
    setTimeout(() => {
      this.setState({ refreshing: false });
    }, 60000); //sau 1 phut neu mat ket noi se tat
  };
  render() {
    const groupbutton = ['Daily', 'Weekly', 'Month'];
    const appcolor = this.props.appcolor;
    const Employee = this.props.userinfo;
    return (
      <Fragment>
        {this.state.welcome === 1 ? (
          <Welcome />
        ) : Employee.employeeId !== undefined ? (
          <View style={{ flex: 1, backgroundColor: this.props.appcolor.light }}>
            <HeaderCustom
              isHome={true}
              title={Employee.employeeName}
              countNotify={this.state.badgeNotify}
              iconLeft="bars"
              iconRight="bell"
              leftFunc={() => this.props.navigation.openDrawer()}
              rightFunc={() => ManageMessenger(this.props)}
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  titleColor={this.props.appcolor.dark}
                  tintColor={this.props.appcolor.dark}
                  title="Đang tải dữ liệu..."
                  refreshing={this.state.refreshing}
                  onRefresh={() => this.SyncdataApp()}
                />
              }
            >
              <View style={{ flex: 1, flexDirection: 'column', padding: 7 }}>
                <View style={{ height: 320 }}>
                  <View
                    style={{
                      width: '100%',
                      backgroundColor: this.props.appcolor.light,
                    }}
                  >
                    <View
                      style={{
                        width: '100%',
                        backgroundColor: this.props.appcolor.primary,
                        borderColor: 1,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: this.props.appcolor.light,
                          flexGrow: 1,
                          padding: 12,
                          fontWeight: 'bold',
                          fontSize: scaleSize(22),
                        }}
                      >
                        {this.state.titlePage}
                      </Text>
                      <View
                        style={{
                          backgroundColor: this.props.appcolor.light,
                          borderBottomRightRadius: 10,
                          borderTopRightRadius: 10,
                          width: '80%',
                          height: 10,
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: this.props.appcolor.primary,
                          width: '100%',
                          height: 10,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        width: '100%',
                        height: '75%',
                        borderWidth: 1,
                        borderColor: this.props.appcolor.greylight,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                      }}
                    >
                      {this.DisplayChart(this.state.selectedIndex)}
                      <ButtonGroup
                        containerStyle={{
                          height: 32,
                          borderWidth: 0,
                          backgroundColor: this.props.appcolor.primary,
                        }}
                        textStyle={{ color: this.props.appcolor.light }}
                        selectedButtonStyle={{
                          backgroundColor: this.props.appcolor.light,
                        }}
                        selectedTextStyle={{
                          color: this.props.appcolor.primary,
                          fontWeight: '700',
                        }}
                        onPress={this.updateIndex}
                        selectedIndex={this.state.selectedIndex}
                        buttons={groupbutton}
                      ></ButtonGroup>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    height: '45%',
                    backgroundColor: this.props.appcolor.light,
                  }}
                >
                  <Text
                    style={{
                      color: this.props.appcolor.dark,
                      flexGrow: 1,
                      padding: 12,
                      fontWeight: 'bold',
                      fontSize: scaleSize(22),
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
                  <MainMenu
                    menus={this.state.menus}
                    navigation={this.props.navigation}
                  />
                </View>
              </View>
            </ScrollView>
            <MessageForm
              ref={this.messageRef}
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
            <ActionSheet
              ref={ref => (this._bottomSheet = ref)}
              defaultOverlayOpacity={0.3}
              containerStyle={{
                padding: 0,
                height: Platform.OS === 'android' ? '80%' : null,
              }}
            >
              <ChartDetail Detail={this.state.detailSelect}></ChartDetail>
            </ActionSheet>
          </View>
        ) : (
          <Login onLoginCallBack={async () => await this.SyncdataApp()} />
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
export default connect(mapStateToProps, mapDispatchToProps)(HomePSV);
