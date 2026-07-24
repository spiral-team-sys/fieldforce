import React, { PureComponent } from 'react';
import {
  View,
  Text,
  AppState,
  Dimensions,
  Platform,
  LogBox,
} from 'react-native';
import { Icon, Divider } from '@rneui/themed';
import ChartDaily from '../../Content/ChartDaily';
import MainMenu from '../../Content/MainMenu';
import ChartWeekly from '../../Content/ChartWeeekly';
import ChartMonthly from '../../Content/ChartMonthly';
import {
  fetchGet,
  GetEmployeeInfo,
  MessageInfo,
  ManageMessenger,
  saveStore,
  getStore,
} from '../../Core/Helper';
import {
  getIdMaxMessenger,
  getLstMessengerNotSeen,
  getCategoryPro,
  getStoreList,
} from '../../Controller/WorkController';
import {
  AppNameBuild,
  DEFAULT_COLOR,
  URL_DOWNLOAD_MESSENGER,
  _competitorId,
  URL_GET_SELLOUT_CHART_HMD,
  artApp,
  MENU_TYPE,
  URL_UPLOAD_ATTENDANT,
} from '../Core/URLs';
import Moment from 'moment';
import { InsertItems, Store } from '../../Core/SqliteDbContext';
import { Token } from '../../Core/Helper';
import { isIphoneX } from '../../Core/is-iphone-x';
import messaging from '@react-native-firebase/messaging';
import { object } from 'prop-types';
const delay = ms => new Promise(res => setTimeout(res, ms));
// import DropDownPicker from 'react-native-dropdown-picker';
import MessageForm from '../../Content/Message';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { ChartSellHMD } from '../../Content/ChartSellHMD';
import ActionSheet from 'react-native-actions-sheet';
import { ChartDetail } from '../../Content/ChartDetail';
import {
  uploadAllDataPhoto,
  getPhotosNotUploadReport,
} from '../../Controller/PhotoController';
import { HeaderCustom } from '../../Content/HeaderCustom';
export const deviceHeight = Dimensions.get('window').height;
export const deviceWidth = Dimensions.get('window').width;
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import { TODAY } from '../../Core/Utility';
import Login from './../Login';
import { RemoveUser } from '../../Controller/UserController';

class HomeEPS extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isNewApp: false,
      isMainApp: true,
      isShowNotify: false,
      badgeNotify: 0,
      selectedIndex: 0,
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
    };
    this.updateIndex = this.updateIndex.bind(this);
  }
  updateIndex(selectedIndex) {
    this.setState({ selectedIndex });
  }

  goHyperlink = hyperLinks => {
    let lstNextPage = [
      'WorkingPlanPG',
      'WorkingPlanSR',
      'WorkingPlan',
      'confirmplansr',
      'confirmplanpg',
    ];
    if (lstNextPage.includes(hyperLinks)) {
      this.props.navigation.navigate(hyperLinks);
    } else {
      this.props.navigation.navigate('WebView', {
        link: hyperLinks,
        titlePage: 'browser',
      });
    }
  };
  SyncData = async () => {
    console.log('login success');
  };
  async componentDidMount() {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    this.loadCategory(_competitorId);

    let userinfo = await GetEmployeeInfo();
    if (userinfo.employeeId !== undefined) {
      await this.props.GAppController.SetUserInfo(userinfo);
      await this.setState({ Employee: userinfo });
      // ExpriedDate account
      if (TODAY >= userinfo?.expriedDate) {
        // 20201112
        await RemoveUser();
        await this.props.GAppController.SetUserInfo({});
      }
      await this.setBadge();
      await this.uploadFileNotUpload();
      await this.loadChartSlide();
    }
    this.setBadge();
    this._unsubscribe = this.props.navigation.addListener('focus', res => {
      this.setBadge();
      this.setState({ isShowNotify: false });
    });
    Object.keys(this.props.appcolor).length === 0 &&
      this.props.GAppController.SetTheme({ type: 'MODE', mode: true });
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
              this.goHyperlink(remoteMessage.data.hyperLinks);
            } else {
              this.props.navigation.navigate('Notification', {
                messengerId: parseInt(remoteMessage.data.messengerId),
              });
            }
          } else {
            this.props.navigation.navigate('Notification', {
              messengerId: parseInt(remoteMessage.data.messengerId),
            });
          }
        }
      });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (this.state.notifyInfo.data.hyperLinks !== null) {
        if (this.state.notifyInfo.data.hyperLinks !== '') {
          this.goHyperlink(this.state.notifyInfo.data.hyperLinks);
        } else {
          this.props.navigation.navigate('Notification', {
            messengerId: parseInt(this.state.notifyInfo.data.messengerId),
          });
        }
      } else {
        this.props.navigation.navigate('Notification', {
          messengerId: parseInt(this.state.notifyInfo.data.messengerId),
        });
      }
    });
    messaging().onMessage(async remoteMessage => {
      await this.LoadDataMessenger();
      await this.setState({ notifyInfo: remoteMessage, isShowNotify: true });
    });

    await this.LoadDataMessenger();
    await this.checkAutoDownloadShop();
  }
  uploadFileNotUpload = async () => {
    let arr = await getPhotosNotUploadReport();
    if (arr != undefined && arr.length > 0) {
      uploadAllDataPhoto(arr, true, true);
    }
  };
  loadChartSlide = async () => {
    if (
      AppNameBuild === 'hmd' ||
      AppNameBuild === 'mevn' ||
      AppNameBuild === 'lg'
    ) {
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
    } else {
      this.setState({
        chartList: [
          { pageName: 'DAILY', id: 1 },
          { pageName: 'WEEKLY', id: 2 },
          { pageName: 'MONTH', id: 3 },
        ],
      });
      this.loadTitleChart();
    }
  };
  async checkAutoDownloadShop() {
    await saveStore(MENU_TYPE, '0');
    let Today = parseInt(Moment(new Date()).format('YYYYMMDD'));
    let lst = await getStoreList('', Today);
    // alertPrint(lst)
    if (lst?.length === 0) {
      if (AppNameBuild === 'pns') {
        // this.menuRef.onItemPress({ Id: 1, name: 'Download' })
        this.menuRef.downloadFromServer();
      } else {
        this.menuRef1?.onItemPress({ Id: 1, name: 'Download' });
      }
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
      this.checkAutoDownloadShop();
    }
    this.setState({ appState: nextAppState });
  };
  async loadCategory(comid) {
    //category
    let res = await getCategoryPro(comid);
    if (res != undefined && res.length !== 0) {
      this.setState({ lstCat: res });
    }
  }
  async LoadDataMessenger() {
    var IdMax = 0;
    let lstMax = await getIdMaxMessenger();

    // alertPrint(lstMax)
    if (lstMax !== undefined) {
      if (Array.isArray(lstMax) && lstMax.length > 0) {
        if (lstMax[0].max !== null) {
          IdMax = lstMax[0].max;
        }
      }
    }

    try {
      let token = await Token();
      await fetch(URL_DOWNLOAD_MESSENGER, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          LastId: IdMax,
        },
      })
        .then(response => response.json())
        .then(responseJson => {
          this.insertMessenger(responseJson);
        });
    } catch (error) {
      // alert(error);
    }
  }
  async insertMessenger(lst) {
    if (Array.isArray(lst) && lst.length > 0 && lst !== undefined) {
      await Store().then(async db => {
        try {
          lst.forEach(async element => {
            await InsertItems(db, 'messenger', [
              {
                id: element.id,
                title: element.title,
                body: element.body,
                typeReport: element.typeReport,
                createdDate: element.createdDate,
                seen: 0,
                hyperLinks: element.hyperLinks,
              },
            ]);
          });
        } catch (errorStr) {
          console.log('EEE ' + errorStr);
        }
      });
      await delay(500);
      this.setBadge();
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
  showDetailHome = async detail => {
    if (detail.length === 0) {
      MessageInfo('Chưa có dữ liệu.');
      return;
    }

    await this.setState({ detailSelect: detail });
    this.props.navigation.navigate('ChartDetail', {
      Detail: detail,
      titlePage: this.state.titlePage,
    });
  };
  SliderenderItem = ({ item, index }) => {
    let viewResult = [];
    switch (item.pageName) {
      case 'DAILY':
        viewResult.push(
          <View key={index} style={{ flex: 1 }}>
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
          <View key={index} style={{ flex: 1 }}>
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
          <View key={index} style={{ flex: 1 }}>
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
          <View key={index} style={{ flex: 1 }}>
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
          width: '100%',
          height:
            Platform.OS === 'android'
              ? Dimensions.get('window').height / 2.7
              : Dimensions.get('window').height / 3,
        }}
      >
        {viewResult}
      </View>
    );
  };
  get paginationDot() {
    const { activeSlide } = this.state;
    return (
      <Pagination
        containerStyle={{
          margin: 0,
          maxHeight: 20,
          padding: 0,
          marginTop: 0,
          position: 'absolute',
          bottom: -10,
          width: '100%',
        }}
        dotsLength={
          this.state.chartList.length > 5 ? 5 : this.state.chartList.length
        }
        activeDotIndex={activeSlide}
        dotStyle={{
          width: 20,
          height: 20,
          borderRadius: 10,
          marginHorizontal: 1,
          backgroundColor: DEFAULT_COLOR,
        }}
        dotContainerStyle={{ height: 20, padding: 2 }}
        inactiveDotStyle={{}}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
        tappableDots={true}
        // renderDots={}
      />
    );
  }
  async gotoMessage() {
    this.setState({ isShowNotify: false });
    // this.props.navigation.navigate('Notification');
    // this.props.navigation.navigate('Notification',{messengerId:parseInt(this.state.notifyInfo.data.messengerId)});

    if (this.state.notifyInfo.data.hyperLinks !== null) {
      if (this.state.notifyInfo.data.hyperLinks !== '') {
        this.goHyperlink(this.state.notifyInfo.data.hyperLinks);
      } else {
        this.props.navigation.navigate('Notification', {
          messengerId: parseInt(this.state.notifyInfo.data.messengerId),
        });
      }
    } else {
      this.props.navigation.navigate('Notification', {
        messengerId: parseInt(this.state.notifyInfo.data.messengerId),
      });
    }
  }
  loadChart() {
    if (
      AppNameBuild !== 'hmd' &&
      AppNameBuild !== 'mevn' &&
      AppNameBuild !== 'lg'
    ) {
      if (this.state.activeSlide === 0) {
        this._ChartDaily?.ChartSetup(this.state.selectedCat);
      } else if (this.state.activeSlide === 1) {
        this._ChartWeekly?.ChartSetup(this.state.selectedCat);
      } else {
        this._ChartMonth?.ChartSetup(this.state.selectedCat);
      }
    } else {
      this.loadChartSlide();
    }
  }
  changeDisplayMenu = async () => {
    let menuType = await getStore(MENU_TYPE);
    if (menuType !== undefined) {
      await saveStore(MENU_TYPE, parseInt(menuType) === 0 ? '1' : '0');
      this.setState({ displayMenu: parseInt(menuType) === 0 ? 1 : 0 });
    }
  };
  loadTitleChart = () => {
    let title = 'Doanh số ';
    let index = this.state.activeSlide;
    if (
      AppNameBuild !== 'hmd' &&
      AppNameBuild !== 'mevn' &&
      AppNameBuild !== 'lg'
    ) {
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
  render() {
    const groupbutton = ['Daily', 'Weekly', 'Month'];
    const Employee = this.props.userinfo;
    const iphonex = isIphoneX();
    let isDropCat = false;
    if (this.state.Employee.accountId === 9) {
      isDropCat = true;
    }

    this.props.userinfo?.employeeId !== undefined ? (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: this.props.appcolor.light,
        }}
      >
        <HeaderCustom
          isHome={true}
          title={Employee.employeeName}
          countNotify={this.state.badgeNotify}
          iconLeft="bars"
          iconRight="bell"
          leftFunc={() => this.props.navigation.openDrawer()}
          rightFunc={() => ManageMessenger(this.props)}
        />
        <View style={{ height: '100%', flexDirection: 'column' }}>
          <View style={{ height: '40%', padding: 7, marginBottom: 10 }}>
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
                    padding: 10,
                    color: this.props.appcolor.light,
                    fontSize: 17,
                  }}
                >
                  {this.state.titlePage}
                </Text>
                <View
                  style={{
                    borderColor: this.props.appcolor.light,
                    borderBottomRightRadius: 10,
                    borderTopRightRadius: 10,
                    width: '80%',
                    height: 10,
                    borderWidth: 1,
                  }}
                />
                <View
                  style={{
                    borderColor: this.props.appcolor.primary,
                    width: '100%',
                    height: 10,
                    borderWidth: 1,
                  }}
                />
              </View>
              <SpiralIcon
                name="refresh-circle-outline"
                color={this.props.appcolor.light}
                type="ionicon"
                size={35}
                containerStyle={{
                  height: '14%',
                  position: 'absolute',
                  right: 20,
                  top: 5,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.loadChart();
                }}
              />
              {/* {
                                isDropCat && <DropDownPicker
                                    items={this.state.lstCat}
                                    placeholder='Chọn ngành hàng'
                                    containerStyle={{ height: '16%' }}
                                    style={{ backgroundColor: this.props.appcolor.light, height: 45, borderColor: 'white' }}
                                    itemStyle={{
                                        justifyContent: 'flex-start'
                                    }}
                                    dropDownStyle={{ backgroundColor: this.props.appcolor.light }}
                                    onChangeItem={async item => {
                                        await this.setState({ selectedCat: item.value })
                                        this.loadChart()
                                    }}
                                />
                            } */}
              <View
                style={{
                  height:
                    Platform.OS === 'ios' ? (iphonex ? '85%' : '80%') : '80%',
                  borderWidth: 0.5,
                  borderColor: this.props.appcolor.greylight,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  backgroundColor: this.props.appcolor.light,
                  padding: 0,
                }}
              >
                <Carousel
                  initialNumToRender={this.state.chartList.length}
                  ref={c => {
                    this._carousel = c;
                  }}
                  data={this.state.chartList}
                  slideStyle={{
                    backgroundColor: this.props.appcolor.light,
                    right: 15,
                    height: '95%',
                  }}
                  layout="default"
                  renderItem={this.SliderenderItem}
                  maxToRenderPerBatch={1}
                  sliderWidth={deviceWidth - 2}
                  itemWidth={deviceWidth - 2}
                  initialScrollIndex={0}
                  onSnapToItem={async index => {
                    await this.setState({ activeSlide: index });
                    this.loadTitleChart();
                  }}
                />
                {this.paginationDot}
              </View>
            </View>
          </View>

          <View style={{ height: '40%', padding: 7, top: 0 }}>
            <View
              style={{
                width: '100%',
                borderColor: 2,
                borderRadius: 12,
                backgroundColor: this.props.appcolor.primary,
                // shadowOpacity: 0.7, shadowColor: DEFAULT_COLOR, shadowRadius: 10
              }}
            >
              <Text
                style={{
                  padding: 10,
                  color: this.props.appcolor.white,
                  fontSize: 17,
                }}
              >
                {'Chức năng'}
              </Text>
              <View
                style={{
                  borderColor: this.props.appcolor.light,
                  borderBottomRightRadius: 10,
                  borderTopRightRadius: 10,
                  width: '80%',
                  height: 10,
                }}
              />
              <View
                style={{
                  borderColor: this.props.appcolor.primary,
                  width: '100%',
                  height: 10,
                  borderWidth: 1,
                }}
              />

              <SpiralIcon
                name={
                  this.state.displayMenu === 0 ? 'list-outline' : 'grid-outline'
                }
                color="white"
                type="ionicon"
                size={30}
                containerStyle={{
                  height: '14%',
                  position: 'absolute',
                  right: 20,
                  top: 10,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.changeDisplayMenu();
                }}
              />
              <View
                style={{
                  height: '86%',
                  borderWidth: 0.5,
                  borderColor: this.props.appcolor.greylight,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  backgroundColor: this.props.appcolor.light,
                  padding: 5,
                }}
              >
                <MainMenu
                  ref={ref => (this.menuRef1 = ref)}
                  {...this.props}
                  updateApp={this.state.isNewApp}
                  loadCate={() => this.loadCategory(_competitorId)}
                  menuDisplay={this.state.displayMenu}
                  employee={this.props.userinfo}
                  appcolor={this.props.appcolor}
                />
              </View>
            </View>
          </View>
        </View>
        <MessageForm
          ref={ref => (this.messageRef = ref)}
          animation={'slideY'}
          appcolor={this.props.appcolor}
          position={'top'}
          type={this.props.appcolor.primary}
          messageHeight={100}
          callBack={() => this.gotoMessage()}
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
      <Login onLoginCallBack={() => this.SyncData()} />
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
