import React, { Fragment, PureComponent } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  RefreshControl,
  Linking,
  DeviceEventEmitter,
} from 'react-native';
import { scaleSize } from '../../Themes/AppsStyle';
import { Image, Icon, Button } from '@rneui/themed';
import { checkAddWork, getStoreList } from '../../Controller/WorkController';
import moment from 'moment';
import { connect } from 'react-redux';
import { URLDEFAULT } from '../../Core/URLs';
import { checkNetwork } from '../../Core/Utility';
import LottieView from 'lottie-react-native';
import {
  Message,
  MessageInfo,
  MessageSetting,
  OnTime,
  ToastSuccess,
  ToastError,
  distanceBetween2Points,
  UUIDGenerator,
} from '../../Core/Helper';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  RESULTS,
  PERMISSIONS,
  request,
  openSettings,
} from 'react-native-permissions';
import { AppCreateAction } from '../../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { MapApp } from '../../Control/MapApp';
import { HeaderCustom } from '../../Content/HeaderCustom';
import FormGroup from '../../Content/FormGroup';
import { AttendantController } from '../../Controller/AttendantController';
import { GetStartStopWork } from '../../Controller/ShopController';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
// //import NumberFormat from "react-number-format";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadAll } from '../../Controller/DownloadDataController';
import { deviceHeight, deviceWidth } from '../Home';
import { FlashList } from '@shopify/flash-list';
import { ATTENDANT_API } from '../../API/AttendantAPI';
export const SHOP_RELOAD_EVENT = 'RELOADSHOP';

class ShopList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      shops: this.props.shops !== undefined ? this.props.shops : [],
      shopsF: this.props.shops !== undefined ? this.props.shops : [],
      search: '',
      isTimeoutLocation: false,
      startWorkDate: null,
      endWorkDate: null,
      mapmode: false,
      myLocation: {},
      startInfo: {},
      stopInfo: {},
      isVerifyLocation: false,
      shopCode: null,
      addressCurrent: '',
      loading: false,
      isDownload: false,
      stopNote: '',
    };
  }
  updateSearch = search => {
    this.setState({ search: search });
    this.LoadData(search);
    this.forceUpdate();
  };
  async componentDidMount() {
    await this.getLocationUserFast();
    await this.props.GAppController.SetShopInfo(null);
    await this.LoadData('');
    await this.props.navigation.addListener('focus', async res => {
      await this.props.GAppController.SetShopInfo(null);
      await this.LoadData('');
    });
    DeviceEventEmitter.addListener(SHOP_RELOAD_EVENT, async () => {
      await this.LoadData('');
      await this.props.GAppController.SetShopInfo(null);
      await ToastSuccess('Đồng bộ cửa hàng thành công');
    });
    await this.CheckLocation();
  }
  componentWillUnmount() {
    this.props.GAppController.SetReport({});
    this.props.navigation?.removeListener();
    DeviceEventEmitter.removeAllListeners();
  }
  LoadData = async search => {
    const result = await GetStartStopWork();
    const Today = parseInt(moment().format('YYYYMMDD'));
    const lst = await getStoreList(search, Today);
    const _start = (await result?.filter(a => a.shopCode === '1')) || {};
    const _stop = (await result?.filter(a => a.shopCode === 'Z')) || {};
    await this.setState({
      startInfo: _start.length > 0 ? _start[0] : {},
      stopInfo: _stop.length > 0 ? _stop[0] : {},
    });
    await this.setState({
      shops: lst,
      shopsF: search ? this.state.shopsF : lst,
    });
  };
  RequestLocation(setStatus) {
    try {
      request(
        Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        }),
      ).then(res => {
        if (res === RESULTS.GRANTED) {
          setStatus(true);
        } else {
          setStatus(false);
        }
      });
    } catch (error) {}
  }
  CheckLocation() {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    )
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            this.RequestLocation(res => res === true);
            break;
          case RESULTS.DENIED:
            this.RequestLocation(res => res === true);
            break;
          case RESULTS.GRANTED:
            this.RequestLocation(res => res === true);
            this.getLocationUserFast();
            break;
          case RESULTS.BLOCKED:
            MessageSetting(
              'Chú ý',
              Platform.OS === 'ios'
                ? 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị, Privacy -> Location Services-> Location Services(ON)'
                : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị',
              () => {
                Platform.OS === 'ios'
                  ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
                  : openSettings().catch(() =>
                      ToastError('cannot open settings'),
                    );
              },
            );
            break;
        }
      })
      .catch(error => {
        // alert(error+'')
      });
  }
  reloadShop = () => {
    let shopTem = this.state.shops;
    this.setState({ shops: shopTem });
  };
  async getLocationUserFast() {
    await Geolocation.getCurrentPosition(
      async info => {
        await this.setState({
          myLocation: info.coords,
          isTimeoutLocation: false,
        });
      },
      error => ToastError(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      //   {timeout: 20000},
    );
  }
  uploadWorkingStatus = async type => {
    const current = this.state.myLocation;
    let datetimeGMT = new Date() + '';
    if (datetimeGMT.indexOf('GMT+0700') <= -1) {
      await MessageInfo(
        'Sai múi giờ. Vui lòng chỉnh múi giờ ở Việt Nam trong cài đặt của máy',
      );
      return;
    } else {
      const requestInfo = {
        shopCode: type,
        latlong: `${current.latitude},${current.longitude}`,
        address: this.state.addressCurrent,
        note: this.state.stopNote || null,
      };
      const result = await ATTENDANT_API.StartStopWork(requestInfo);
      if (result.statusId === 200) {
        const mes =
          type === '1'
            ? 'Chúc bạn ngày mới làm việc vui vẻ'
            : 'Hôm nay, bạn đã hoàn thành công việc của mình';
        await ToastSuccess(mes, 'Thông báo', 'top');
        await this.LoadData('');
      } else await ToastError('Lỗi chưa thực hiện được', 'Error', 'top');
    }
  };
  startAction = async shopCode => {
    const myLocation = this.state.myLocation;
    if (
      myLocation.latitude === undefined ||
      myLocation.longitude === undefined
    ) {
      await this.CheckLocation();
      await ToastError('Chưa lấy đuọc vị trí, vui lòng thử lại sau vài giây');
      return;
    }
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      MessageInfo(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
        'Internet',
        'top',
      );
      return;
    }

    await OnTime(async () => {
      const stopConfig = JSON.parse(this.state.stopInfo.config || '{}');
      if (shopCode == 'Z' && (stopConfig?.isNoteStop || 0) == 1) {
        const checkAttendant = await AttendantController.checkHaveAttendant();
        if (checkAttendant !== true) {
          await SheetManager.hide('sheetStartStop');
          await SheetManager.show('noteSheetStop');
        } else {
          Message(
            'Thông báo',
            shopCode === '1'
              ? 'Bạn có muốn bắt đầu ngày làm việc không?'
              : 'Bạn có muốn kết thúc ngày làm việc không?',
            () => {
              this.uploadWorkingStatus(shopCode);
            },
          );
        }
      } else {
        Message(
          'Thông báo',
          shopCode === '1'
            ? 'Bạn có muốn bắt đầu ngày làm việc không?'
            : 'Bạn có muốn kết thúc ngày làm việc không?',
          () => {
            this.uploadWorkingStatus(shopCode);
          },
        );
      }
    });
  };
  async onItemPress(item) {
    if (this.props.loading || false) return;
    // const workinfo = await this.createWorkResult(item)
    await this.props.GAppController.SetShopInfo(item);
    // await this.props.GAppController.SetReport(workinfo)
    await AsyncStorage.getItem('ATTENDANT').then(value => {
      const lastTime =
        value !== undefined && value !== null ? parseInt(value) : 0;
      const currentHour = parseInt(moment().format('HH'));
      if (currentHour - lastTime > 1)
        //Đồng bộ dữ liệu sau 1 tiếng
        AttendantController.SyncFromServer({
          shopId: item.shopId,
          workDate: item.auditDate,
        });
    });
    await this.props.navigation.navigate('ShopPage', { shopInfo: item });
  }
  createWorkResult = async shopinfo => {
    const workTemplate = await {
      shopId: shopinfo.shopId || 0,
      shopName: shopinfo.shopName,
      shopCode: shopinfo.shopCode,
      address: shopinfo.address,
      imageUrl: shopinfo.imageUrl,
      workDate: shopinfo.auditDate,
      workTime: moment(new Date()).format('YYYYMMDDHHmmss'),
      workStatus: 1, // TC
      attendantCount: 2,
      guiid: UUIDGenerator(),
    };
    const workCurrent = await checkAddWork(workTemplate);
    await this.props.GAppController.SetReport(workCurrent);
    return workCurrent;
  };
  renderItem = ({ item, index }) => {
    const { myLocation } = this.state;
    const _distant =
      item.latitude > 0 && myLocation?.latitude > 0
        ? distanceBetween2Points(
            myLocation.latitude,
            myLocation.longitude,
            item.latitude,
            item.longitude,
          )
        : null;
    const appcolor = this.props.appcolor;
    const sourceImage =
      item.imageUrl !== null &&
      (item.imageUrl.indexOf('file://') === -1 &&
      item.imageUrl.indexOf('https://') === -1
        ? URLDEFAULT + item.imageUrl
        : item.imageUrl);
    return item.shopCode === '1' ? (
      this.StartUI()
    ) : (
      <View
        key={'shoddp-' + index.toString()}
        style={{
          backgroundColor: appcolor.light,
          marginLeft: 7,
          marginRight: 7,
          marginBottom: 7,
          borderRadius: 12,
          padding: 7,
        }}
      >
        <TouchableOpacity onPress={() => this.onItemPress(item)}>
          <View style={{ flexDirection: 'row' }}>
            {!sourceImage ? (
              <Image
                source={require('../../Themes/Images/store.png')}
                containerStyle={{ width: '30%' }}
                style={{
                  borderRadius: 10,
                  width: 100,
                  height: 100,
                  resizeMode: 'cover',
                }}
                resizeMethod="resize"
              />
            ) : (
              <Image
                source={{ uri: sourceImage }}
                containerStyle={{ width: '30%' }}
                style={{
                  borderRadius: 10,
                  width: 100,
                  height: 100,
                  resizeMode: 'cover',
                }}
                resizeMethod="resize"
              />
            )}
            <View style={{ width: '70%' }}>
              <Text
                style={{ paddingLeft: 7, fontSize: 14, color: appcolor.dark }}
              >
                {item.title}
              </Text>
              {item.shopCode !== '1' && item.shopCode !== 'Z' && (
                <Text style={{ paddingLeft: 7, color: appcolor.dark }}>
                  {'Mã CH:' + item.shopCode}
                </Text>
              )}
              <Text
                numberOfLines={2}
                style={{
                  paddingLeft: 7,
                  color: appcolor.dark,
                  fontSize: scaleSize(12),
                }}
              >
                {item.address || ''}
              </Text>
              <View style={{ flexGrow: 1 }}></View>
              <Text
                style={{
                  paddingLeft: 7,
                  textAlign: 'right',
                  color: appcolor.dark,
                  fontSize: scaleSize(12),
                }}
              >
                {moment(item.auditDate, 'YYYYMMDD').format('dddd D MMMM')}
              </Text>
              <NumberFormat
                key={item.shopId + '-fe'}
                displayType="text"
                prefix={'KM'}
                thousandSeparator={true}
                format="####"
                value={_distant}
                renderText={value => (
                  <Text style={{ color: appcolor.danger, textAlign: 'right' }}>
                    {_distant !== null
                      ? 'Khoảng cách ~ ' + value + ' Km'
                      : 'Chưa xác định được khoảng cách'}
                  </Text>
                )}
              />
            </View>
            {item.finish > 0 && item.finish % 2 === 0 && (
              <LottieView
                style={{
                  width: 40,
                  height: 40,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                source={require('../../Themes/Images/check-mark-success.json')}
                autoPlay
                loop={false}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  StartUI = () => {
    const myLocation = this.state.myLocation; //{ latitude: 10.7789241, longitude: 106.6880843 }//
    myLocation.latitude !== undefined &&
      ATTENDANT_API.GetAddressbyGeo(
        `${myLocation.latitude},${myLocation.longitude}`,
      ).then(address => {
        this.setState({ addressCurrent: address });
      });
    const appcolor = this.props.appcolor;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: appcolor.surface,
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => this.startAction('1')}
        >
          <View
            style={{
              flex: 2 / 10,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 7,
            }}
          >
            <Text
              style={{
                fontSize: scaleSize(18),
                textAlign: 'center',
                color: appcolor.dark,
              }}
            >
              Nhấn "Start" để bắt đầu thực hiện công việc
            </Text>
          </View>
          <View style={{ flex: 4 / 10, justifyContent: 'center' }}>
            <LottieView
              autoPlay
              style={{ height: '100%' }}
              source={require('../../Themes/lotties/call.json')}
            />
            <Text
              style={{
                color: appcolor.white,
                position: 'absolute',
                fontWeight: 'bold',
                textAlign: 'center',
                width: '100%',
                fontSize: scaleSize(24),
              }}
            >
              Start
            </Text>
          </View>
          <View style={{ flex: 4 / 10 }}>
            <Text
              style={{
                fontSize: scaleSize(16),
                fontWeight: 'bold',
                color: appcolor.dark,
                textAlign: 'center',
              }}
            >
              Hôm nay {moment().format('LLLL')}
            </Text>
            <View style={{ padding: 6, paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontSize: scaleSize(18),
                  fontWeight: 'bold',
                  color: appcolor.dark,
                }}
              >
                Thông tin
              </Text>
              <Text style={{ color: appcolor.dark }}>
                Ví trí hiện tại: {this.state.addressCurrent}
              </Text>
              <Text style={{ color: appcolor.dark }}>
                Tọa độ lat:{myLocation.latitude}, long: {myLocation.longitude}
              </Text>
              <Text></Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  SwithMode = () => {
    this.setState({ mapmode: !this.state.mapmode });
  };
  onRefreshShopList = async () => {
    let isLoad = true;
    this.setState({ isDownload: true });
    await downloadAll(result => {
      ToastSuccess(result, 'Thông báo', 'top');
      isLoad = false;
      this.setState({ isDownload: false });
    });
    if (isLoad == false) {
      this.LoadData('');
    }
  };
  onShowStop = async () => {
    this.state.isDownload !== true &&
      (await Geolocation.getCurrentPosition(
        async info => {
          SheetManager.show('sheetStartStop');
          await this.setState({
            myLocation: info.coords,
            isTimeoutLocation: false,
          });
          if (this.state.stopInfo.timeIn !== undefined) {
            const myLocation = await this.state.myLocation; // { latitude: 10.785663760556734, longitude: 106.69472435719977 }//
            myLocation.latitude !== undefined &&
              (await ATTENDANT_API.GetAddressbyGeo(
                `${myLocation.latitude},${myLocation.longitude}`,
              ).then(address => {
                this.setState({ addressCurrent: address });
              }));
          }
        },
        error => ToastError(error.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        //   {timeout: 20000},
      ));
  };
  actionPress = () => {
    this.setState({ stopNote: '' });
    SheetManager.hide('noteSheetStop');
  };
  handleSendStop = async () => {
    if (this.state.stopNote?.length == 0) {
      MessageInfo('Bạn chưa nhập lí do không check In/Out cửa hàng');
      return;
    }
    if (this.state.stopNote?.length < 5) {
      MessageInfo('Nhập lí do ít nhất 5 kí tự');
      return;
    }
    Message('Thông báo', 'Bạn có muốn kết thúc ngày làm việc không?', () => {
      this.uploadWorkingStatus('Z');
      SheetManager.hide('noteSheetStop');
    });
  };
  render() {
    const { startInfo, stopInfo } = this.state;
    const { appcolor, userinfo } = this.props;
    return startInfo.timeIn !== undefined && startInfo.timeIn === 0 ? (
      this.StartUI()
    ) : (
      <View
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: appcolor.surface,
        }}
      >
        {this.props.header === 'none' ? null : (
          <HeaderCustom
            title={'Danh sách cửa hàng'}
            iconRight={!this.state.mapmode ? 'map' : 'list'}
            leftFunc={() => this.props.navigation.goBack()}
            rightFunc={() => this.SwithMode()}
          />
        )}
        {!this.state.mapmode ? (
          <View
            style={{
              width: '100%',
              paddingTop: 10,
              height:
                this.props.header === 'none' && this.state.shops?.length < 8
                  ? '100%'
                  : this.props.header === 'none'
                  ? '96%'
                  : '86%',
            }}
          >
            <View
              style={{
                display: this.state.shopsF?.length > 7 ? 'flex' : 'none',
              }}
            >
              <FormGroup
                containerStyle={{
                  marginLeft: 7,
                  marginRight: 7,
                  backgroundColor: appcolor.homebackground,
                }}
                appcolor={appcolor}
                placeholder={'Tìm kiếm cửa hàng'}
                editable
                handleChangeForm={text => this.updateSearch(text)}
                multiline
                iconName="search"
              />
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                  height: 0.2,
                  marginBottom: 7,
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: appcolor.surface,
                marginTop: 10,
              }}
            >
              {(userinfo.employeeId !== undefined ||
                this.state.shops?.length > 0) && (
                <FlashList
                  keyExtractor={(_, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  data={
                    userinfo.employeeId === undefined ? [] : this.state.shops
                  }
                  refreshControl={
                    <RefreshControl
                      title="Cập nhật cửa hàng..."
                      refreshing={this.state.loading}
                      titleColor={appcolor.primary}
                      onRefresh={() => this.onRefreshShopList()}
                    />
                  }
                  estimatedItemSize={118}
                  ListHeaderComponent={
                    userinfo.employeeId === undefined ||
                    this.state.shops?.length == 0 ? (
                      <View
                        style={{
                          padding: 10,
                          height: 100,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: '500',
                            fontSize: 14,
                            color: appcolor.dark,
                          }}
                        >
                          Chưa có danh sách cửa hàng
                        </Text>
                      </View>
                    ) : (
                      <View></View>
                    )
                  }
                  renderItem={this.renderItem}
                />
              )}
            </View>
          </View>
        ) : (
          <MapApp
            navigation={this.props.navigation}
            slist={this.state?.shops || []}
          />
        )}
        {!this.state.mapmode &&
          (startInfo.timeIn !== undefined || stopInfo.timeIn !== undefined) && (
            <TouchableOpacity
              onPress={this.onShowStop}
              style={{
                opacity: 1,
                position: 'absolute',
                zIndex: 202,
                left: 0,
                bottom: 0,
              }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  height: 110,
                  width: 110,
                }}
              >
                <LottieView
                  style={{ height: '100%' }}
                  autoPlay
                  source={require('../../Themes/lotties/stopwork.json')}
                />
                <SpiralIcon name="stop" color={appcolor.white} size={36} />
              </View>
            </TouchableOpacity>
          )}

        <ActionSheet
          id={'sheetStartStop'}
          drawUnderStatusBar
          containerStyle={{ backgroundColor: appcolor.surface, padding: 12 }}
        >
          <View style={{ height: '96%' }}>
            <View style={{ padding: 12, backgroundColor: appcolor.light }}>
              <Text
                style={{
                  fontSize: scaleSize(18),
                  fontWeight: 'bold',
                  color: appcolor.dark,
                  textAlign: 'center',
                }}
              >
                Hôm nay {moment().format('LLLL')}
              </Text>
              <View style={{ padding: 12 }}>
                <Text
                  style={{
                    fontSize: scaleSize(18),
                    fontWeight: 'bold',
                    color: appcolor.dark,
                  }}
                >
                  Thông tin điểm bắt đầu
                </Text>
                <Text style={{ color: appcolor.dark }}>
                  Thời gian{' '}
                  {moment(startInfo?.timeIn, 'YYYYMMDDHHmmss').format(
                    'HH:mm dddd DD MMMM',
                  )}{' '}
                </Text>
                <Text style={{ color: appcolor.dark }}>
                  Ví trí: {startInfo?.address || 'Không xác định'}
                </Text>
              </View>
            </View>
            {stopInfo.timeIn === 0 ? (
              <Fragment>
                <View
                  style={{
                    width: '100%',
                    padding: 7,
                    display: stopInfo.timeIn === undefined ? 'none' : 'flex',
                  }}
                >
                  <Text
                    style={{
                      fontSize: scaleSize(18),
                      textAlign: 'center',
                      color: appcolor.dark,
                    }}
                  >
                    Nhấn "End" để kết thúc ngày làm việc
                  </Text>
                </View>
                <View
                  style={{
                    padding: 12,
                    backgroundColor: appcolor.light,
                    display: stopInfo.timeIn === undefined ? 'none' : 'flex',
                  }}
                >
                  <TouchableOpacity onPress={() => this.startAction('Z')}>
                    <View style={{ justifyContent: 'center', height: '70%' }}>
                      <LottieView
                        autoPlay
                        style={{ height: '100%' }}
                        source={require('../../Themes/lotties/stopwork.json')}
                      />
                      <Text
                        style={{
                          color: appcolor.white,
                          position: 'absolute',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          width: '100%',
                          fontSize: scaleSize(34),
                        }}
                      >
                        End
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={{ marginTop: -80 }}>
                    <View style={{ padding: 12 }}>
                      <Text
                        style={{
                          fontSize: scaleSize(18),
                          fontWeight: 'bold',
                          color: appcolor.dark,
                        }}
                      >
                        Thông tin
                      </Text>
                      <Text style={{ color: appcolor.dark }}>
                        Ví trí hiện tại: {this.state.addressCurrent}
                      </Text>
                      <Text style={{ color: appcolor.dark }}>
                        Tọa độ lat:{this.state.myLocation.latitude}, long:{' '}
                        {this.state.myLocation.longitude}
                      </Text>
                    </View>
                  </View>
                </View>
              </Fragment>
            ) : (
              <View style={{ padding: 12, backgroundColor: appcolor.light }}>
                <View style={{ padding: 12 }}>
                  <Text
                    style={{
                      fontSize: scaleSize(18),
                      fontWeight: 'bold',
                      color: appcolor.dark,
                    }}
                  >
                    Thông tin điểm kết thúc ngày làm việc
                  </Text>
                  <Text style={{ color: appcolor.dark }}>
                    Thời gian{' '}
                    {moment(stopInfo?.timeIn, 'YYYYMMDDHHmmss').format(
                      'HH:mm dddd DD MMMM',
                    )}{' '}
                  </Text>
                  <Text style={{ color: appcolor.dark }}>
                    Ví trí: {stopInfo?.address || 'Không xác định'}
                  </Text>
                </View>
              </View>
            )}
            <View
              style={{
                width: '100%',
                padding: 12,
                alignItems: 'center',
                position: 'absolute',
                bottom: 0,
              }}
            >
              <TouchableOpacity
                onPress={() => SheetManager.hide('sheetStartStop')}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: appcolor.surface,
                    marginBottom: 7,
                    width: '100%',
                  }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    color: appcolor.dark,
                    fontSize: scaleSize(18),
                    marginTop: 12,
                  }}
                >
                  Trở về
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ActionSheet>

        <ActionSheet
          id={'noteSheetStop'}
          defaultOverlayOpacity={0.3}
          // onClose={handlerClose}
          gestureEnabled={false}
          containerStyle={{ backgroundColor: appcolor.light }}
        >
          <View
            style={{
              width: '100%',
              height: deviceHeight * 0.45,
              alignContent: 'center',
            }}
          >
            <View
              key="noteview"
              style={{
                width: deviceWidth,
                height: deviceHeight / 3,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  marginLeft: 12,
                  padding: 7,
                  fontSize: scaleSize(18),
                  fontWeight: 'bold',
                  color: appcolor.primary,
                }}
              >
                {'Nhập lí do chưa check In/Out Shop'}
              </Text>
              <FormGroup
                title={'Nhập lý do'}
                handleChangeForm={text => this.setState({ stopNote: text })}
                defaultValue={this.state.stopNote}
                editable
                inputStyle={{ minHeight: 120 }}
                numberOfLines={3}
                multiline={true}
                onClearTextAndroid={() => this.setState({ stopNote: '' })}
                placeholder="Nhập ghi chú ở đây"
              />
              <View
                style={{
                  flexDirection: 'row',
                  padding: 7,
                  backgroundColor: appcolor.light,
                  alignSelf: 'center',
                  bottom: 10,
                }}
              >
                <Button
                  type="outline"
                  title="Huỷ"
                  buttonStyle={{
                    borderColor: appcolor.primary,
                    backgroundColor: appcolor.light,
                  }}
                  titleStyle={{
                    color: appcolor.primary,
                    fontSize: 15,
                    fontWeight: '500',
                  }}
                  containerStyle={{
                    borderColor: appcolor.transparent,
                    width: '48%',
                    marginRight: 7,
                  }}
                  onPress={this.actionPress}
                />
                <Button
                  title="Xác nhận"
                  titleStyle={{ fontSize: 15, fontWeight: '500' }}
                  buttonStyle={{
                    borderColor: appcolor.primary,
                    backgroundColor: appcolor.primary,
                  }}
                  containerStyle={{ width: '48%' }}
                  onPress={this.handleSendStop}
                />
              </View>
            </View>
          </View>
        </ActionSheet>
      </View>
    );
  }
}
const mapStateToProps = state => {
  return {
    GAppState: state.GAppState,
    appcolor: state.GAppState.appcolor,
    workinfo: state.GAppState.workinfo,
    userinfo: state.GAppState.userinfo,
  };
};
const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(ShopList);
