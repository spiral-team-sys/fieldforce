import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Divider, Icon } from '@rneui/themed';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import {
  MessageInfo,
  MessageSetting,
  ToastSuccess,
  ToastError,
  distanceBetween2Points,
} from '../../../Core/Helper';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  RESULTS,
  PERMISSIONS,
  request,
  openSettings,
} from 'react-native-permissions';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
//import NumberFormat from "react-number-format";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deviceHeight, deviceWidth } from '../../../Core/Utility';
import { AttendantController } from '../../../Controller/AttendantController';
//import { ACTION } from "../../../Core/ReduxController";
import { URLDEFAULT } from '../../../Core/URLs';
import { getStoreList } from '../../../Controller/WorkController';
import { scaleSize } from '../../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ShopOneMoreToshiba = ({ shops, navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [shoplist, setShopList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myLocation, setMyLocation] = useState({});
  const [isTimeoutLocation, setTimeOutGPS] = useState(false);
  const [dataItemFinish, setDataItemFinish] = useState({
    dataAtt: [],
    dataItem: {},
  });
  const dispatch = useDispatch();
  const _sheetWork = useRef();
  useEffect(() => {
    dispatch({ type: ACTION.SELECT_SHOP, shopinfo: null });
    const _load = LoadData('');
    const _loadcation = getLocationUserFast();
    const _check = CheckLocation();
    return () => {
      return {
        _load,
        _loadcation,
        _check,
      };
    };
  }, [shops]);
  LoadData = async search => {
    const Today = parseInt(moment().format('YYYYMMDD'));
    const lst = await getStoreList(search, Today);
    await setShopList(lst);
  };
  RequestLocation = setStatus => {
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
    } catch (error) {
      // //console.log("location set error:", error);
    }
  };
  CheckLocation = () => {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    )
      .then(result => {
        // console.log(result, "CheckLocation")
        switch (result) {
          case RESULTS.UNAVAILABLE:
            RequestLocation(res => res === true);
            break;
          case RESULTS.DENIED:
            RequestLocation(res => res === true);
            break;
          case RESULTS.GRANTED:
            getLocationUserFast();
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
  };
  getLocationUserFast = async () => {
    await Geolocation.getCurrentPosition(
      async info => {
        await setMyLocation(info.coords);
        await setTimeOutGPS(isTimeoutLocation);
      },
      error => ToastError(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };
  uploadWorkingStatus = async type => {
    let datetimeGMT = new Date() + '';
    if (datetimeGMT.indexOf('GMT+0700') <= -1) {
      await MessageInfo(
        'Sai múi giờ. Vui lòng chỉnh múi giờ ở Việt Nam trong cài đặt của máy',
      );
      return;
    } else {
      const requestInfo = {
        shopCode: type,
        latlong: `${myLocation.latitude},${myLocation.longitude}`,
        address: myLocation.address,
      };
      const result = await AttendantController.StartStopWork(requestInfo);
      if (result.statusId === 200) {
        const mes =
          type === '1'
            ? 'Chúc bạn ngày mới làm việc vui vẻ'
            : 'Hôm nay, bạn đã hoàn thành công việc của mình';
        await ToastSuccess(mes, 'Thông báo', 'top');
        await LoadData('');
      } else await ToastError('Lỗi chưa thực hiện được', 'Error', 'top');
    }
  };
  onItemPress = item => {
    dispatch({ type: ACTION.SELECT_SHOP, shopinfo: item });
    AsyncStorage.getItem('ATTENDANT').then(value => {
      const lastTime =
        value !== undefined && value !== null ? parseInt(value) : 0;
      const currentHour = parseInt(moment().format('HH'));
      if (currentHour - lastTime > 1)
        //Đồng bộ dữ liệu sau 1 tiếng
        AttendantController.SyncFromServer({
          shopId: item.shopId,
          workDate: item.auditDate,
        });
      else {
        console.log("don't sync", value);
      }
    });
    navigation.navigate('ShopPage', { shopInfo: item });
  };
  const onFinishPress = async item => {
    let dataByShop = await AttendantController.GetAttendant(
      item,
      item.auditDate,
    );
    const countTotalTime = await configData(dataByShop);
    await setDataItemFinish({ dataAtt: countTotalTime, dataItem: item });
    await SheetManager.show('SheetHomeAttendant');
  };
  renderItem = ({ item, index }) => {
    const _distant =
      item.latitude > 0 && myLocation?.latitude > 0
        ? distanceBetween2Points(
            myLocation.latitude,
            myLocation.longitude,
            item.latitude,
            item.longitude,
          )
        : null;
    const sourceImage =
      item.imageUrl !== null &&
      item.imageUrl.indexOf('file://') === -1 &&
      !item.imageUrl.includes('http')
        ? URLDEFAULT + item.imageUrl
        : item.imageUrl;
    return index < 3 ? (
      <View
        key={'shoddp-' + index.toString()}
        style={{ borderRadius: 12, paddingBottom: 10 }}
      >
        <TouchableOpacity onPress={() => onItemPress(item)}>
          <View style={{ borderRadius: 20 }}>
            {sourceImage !== null ? (
              <Image
                source={{ uri: sourceImage }}
                style={{
                  borderRadius: 10,
                  height: deviceWidth * 0.55,
                  resizeMode: 'cover',
                }}
                resizeMethod="resize"
              />
            ) : (
              <Image
                source={require('../../../Themes/Images/store.png')}
                style={{
                  borderRadius: 10,
                  height: deviceWidth * 0.55,
                  resizeMode: 'cover',
                }}
                resizeMethod="resize"
              />
            )}
            <View
              style={{
                width: '100%',
                height: deviceWidth * 0.55,
                borderRadius: 20,
                position: 'absolute',
                backgroundColor: 'rgba(97, 96, 101, 0.3)',
                zIndex: 10,
              }}
            />
            <View
              style={{
                width: '70%',
                position: 'absolute',
                top: 60,
                left: 10,
                backgroundColor: appcolor.transparent,
                zIndex: 10000,
              }}
            >
              <Text
                style={{
                  fontSize: scaleSize(26),
                  fontWeight: '700',
                  color: appcolor.white,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: scaleSize(14),
                  fontWeight: '500',
                  color: appcolor.placeholderBody,
                  opacity: 0.8,
                }}
              >
                {'Mã CH : ' + item.shopCode}
              </Text>
            </View>
            {item.finish > 0 && item.finish % 2 === 0 && (
              <TouchableOpacity
                onPress={() => onFinishPress(item)}
                style={{
                  borderRadius: 50,
                  width: '40%',
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(97,96,101,0.6)',
                  zIndex: 10000,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: scaleSize(14),
                    fontWeight: '500',
                    color: appcolor.placeholderBody,
                    textAlign: 'center',
                  }}
                >
                  Hoàn thành
                </Text>
                <LottieView
                  style={{ width: 40, height: 40 }}
                  source={require('../../../Themes/Images/check-mark-success.json')}
                  autoPlay
                  loop={false}
                />
              </TouchableOpacity>
            )}
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: appcolor.transparent,
                width: '90%',
                zIndex: 10000,
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  paddingLeft: 7,
                  color: appcolor.white,
                  fontSize: scaleSize(12),
                  textAlign: 'right',
                }}
              >
                {item.address || ''}
              </Text>
              <View style={{ flexGrow: 1 }}></View>
              <Text
                style={{
                  paddingLeft: 7,
                  textAlign: 'right',
                  color: appcolor.white,
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
          </View>
        </TouchableOpacity>
      </View>
    ) : index === 3 ? (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
        onPress={() => navigation.navigate('ShopList')}
      >
        <SpiralIcon
          raised
          name="arrow-right"
          color={appcolor.primary}
          size={28}
          style={{ alignItems: 'center' }}
        />
        <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 12 }}>
          Nhiều hơn
        </Text>
      </TouchableOpacity>
    ) : null;
  };

  const configData = dataPhoto => {
    let DataGroup = [];
    for (let i = 0; i < dataPhoto.length - 1; i++) {
      let dataAtt = [];
      if ((i + 1) % 2 == 1 && dataPhoto[i + 1].photoFullTime != null) {
        dataAtt.push(
          {
            ...dataPhoto[i],
            titleImage:
              dataPhoto[i].photoType % 2 == 1 ? 'Check IN' : 'Check OUT',
          },
          {
            ...dataPhoto[i + 1],
            titleImage:
              dataPhoto[i].photoType % 2 == 1 ? 'Check IN' : 'Check OUT',
          },
        );
        const duration = moment.duration(
          moment(dataPhoto[i + 1].photoFullTime).diff(
            moment(dataPhoto[i].photoFullTime),
          ),
        );
        DataGroup.push({
          photoId: dataPhoto[i].id,
          totalTime: moment.utc(duration.asMilliseconds()).format('HH:mm:ss'),
          dataAtt: dataAtt,
        });
      }
    }
    return DataGroup;
  };
  const RenderItemAtt = ({ itemCheck, indexCheck }) => {
    const listPhoto = itemCheck.dataAtt;
    const shop = (
      <View key={indexCheck.toString()} style={{ padding: 5 }}>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: appcolor.primary, textAlign: 'center' }}>
            Tổng
          </Text>
          <Text
            style={{
              color: appcolor.primary,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {itemCheck.totalTime}
          </Text>
        </View>
        <FlatList
          data={listPhoto}
          horizontal
          keyExtractor={item => item.photoFullTime}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => {
            return (
              <View style={{ height: '100%', padding: 4 }}>
                <Image
                  style={{
                    width: deviceWidth / 2 - 20,
                    height: deviceWidth / 2 - 20,
                    borderRadius: 25,
                    backgroundColor: appcolor.surface,
                  }}
                  source={{ uri: URLDEFAULT + item.photoPath }}
                  // onPress={() => handlerShowImage(listPhoto, index)}
                  PlaceholderContent={<ActivityIndicator />}
                />
                <Text
                  style={{
                    color: appcolor.onBackground,
                    textAlign: 'center',
                    paddingTop: 10,
                  }}
                >
                  {item.photoFullTime}
                </Text>
                <Text style={{ color: appcolor.primary, textAlign: 'center' }}>
                  {item.titleImage}
                </Text>
              </View>
            );
          }}
        />
      </View>
    );
    return <View style={{ width: deviceWidth }}>{shop}</View>;
  };

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: appcolor.light,
        paddingHorizontal: 8,
      }}
    >
      <FlatList
        scrollEnabled={false}
        keyExtractor={(_, index) => index.toString()}
        data={userinfo.employeeId === undefined ? [] : shoplist}
        refreshControl={
          <RefreshControl
            title="Cập nhật cửa hàng..."
            refreshing={loading}
            titleColor={appcolor.primary}
            onRefresh={() => LoadData('')}
          />
        }
        renderItem={renderItem}
      />
      <ActionSheet
        id={'SheetHomeAttendant'}
        headerAlwaysVisible={true}
        defaultOverlayOpacity={0.1}
        gestureEnabled={false}
        // indicatorColor={appcolor.dark}
        containerStyle={{
          backgroundColor: appcolor.light,
          alignSelf: 'center',
          padding: 8,
          height: deviceHeight / 1.4,
          paddingBottom: insets.bottom,
        }}
      >
        <ScrollView>
          {dataItemFinish.dataAtt.map((item, index) => {
            return (
              <RenderItemAtt key={index} itemCheck={item} indexCheck={index} />
            );
          })}
        </ScrollView>
        {/* <FlatList data={dataItemFinish.dataAtt}
                    renderItem={renderItemAtt}
                    keyExtractor={useCallback((_, index) => index.toString(), [])}
                /> */}
      </ActionSheet>
    </View>
  );
};
export default ShopOneMoreToshiba;
