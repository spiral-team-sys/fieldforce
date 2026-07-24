import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Icon, Text } from '@rneui/themed';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { CheckLocation, formatNumber } from '../../../Core/Helper';
import {
  alertConfirm,
  alertWarning,
  deviceHeight,
  deviceWidth,
  minWidthTab,
} from '../../../Core/Utility';
import {
  actionBackHeader,
  actionNextHeader,
  ACTION_UPLOAD,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  MODE,
} from '../UtilityBusiness';
import Geolocation from '@react-native-community/geolocation';
import {
  GetBusinesTrips,
  GetConfirmTrips,
  UploadBusiness,
} from '../../../Controller/BussinessTripController';
import { NumberFormatView } from '../../../Control/NumberFormatView';
import FormGroup from '../../../Content/FormGroup';
import { CalendarSelected } from '../../../Control/CalendarSelected';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import moment from 'moment';
import _ from 'lodash';
import { CreateNewTrip } from '../CreateTrips/index';
import { CostMenu } from '../CostTrips/CostMenu';
import { TripResult } from '../TripResult';
import { LoadingView } from '../../../Control/ItemLoading/index';
import { ACTION } from '../../../Core/ReduxController';
import { ItemResultView } from '../ItemResultHome';
import { SetBusinesTrips } from '../../../Redux/action';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const HomeBusiness = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState({
    latitude: 0,
    latitudeDelta: 0,
    longitude: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [itemTrips, setItemTrips] = useState({
    fromDate: moment().startOf('month').format('YYYYMMDD'),
    toDate: moment().endOf('month').format('YYYYMMDD'),
  });
  const [filter, setFilter] = useState({
    mode: MODE.HISTORY,
    moneyLimit: 0,
    loadCalendar: false,
    fromDate: moment().startOf('month').format('DD/MM/YYYY'),
    toDate: moment().endOf('month').format('DD/MM/YYYY'),
    fromDateCaculator: moment().startOf('month'),
    toDateCaculator: moment().endOf('month'),
    dayAndNight: '',
    dayValue: 0,
    nightValue: 0,
    mLatitude: 0,
    mLongitude: 0,
    isUpdate: false,
    isPlus: false,
    isLockOutMonth: false,
    isCreateInMonth: true,
  });
  const [dataConfirm, setDataConfirm] = useState([]);
  const [isConfirmTrip, setIsConfirm] = useState(false);
  const [dataTrips, setDataTrips] = useState([]);
  const [dataTripsMain, setDataTripsMain] = useState([]);
  const [tabStatus, setTabStatus] = useState([]);
  const [moneyLimit, setMoneyLimit] = useState(0);
  const [lockResultTrips, setLockResultTrips] = useState(true);
  const [lockCreate, setLockCreate] = useState(false);
  const [lockCreateOld, setLockCreateOld] = useState(false);
  const [isLockOutMonth, setLockOutMonth] = useState(false);
  const [itemDetailView, setItemDetailView] = useState({});
  const [isCreateInMonth, setCreateInMonth] = useState(false);
  const config = JSON.parse(kpiinfo?.reportItem) || {};
  const refMaps = useRef();
  // Handler Setting Data
  const LoadData = async (fromDate, toDate) => {
    await setIsConfirm(false);
    await setLoading(true);
    const fromValue = fromDate || itemTrips.fromDate;
    const toValue = toDate || itemTrips.toDate;
    await setFilter({
      ...filter,
      loadCalendar: false,
      fromDate: moment(fromValue).format('DD/MM/YYYY'),
      toDate: moment(toValue).format('DD/MM/YYYY'),
      fromDateCaculator: moment(fromValue),
      toDateCaculator: moment(toValue),
    });
    await setItemTrips({
      fromDate: moment(fromValue).format('YYYYMMDD'),
      toDate: moment(toValue).format('YYYYMMDD'),
    });
    await GetBusinesTrips(
      moment(fromValue).format('YYYYMMDD'),
      moment(toValue).format('YYYYMMDD'),
      async mData => {
        await setDataTrips(mData);
        await setDataTripsMain(mData);
        await setTabStatus(_.uniqBy(mData, 'status'));
        await setMoneyLimit(mData[0]?.remaining || 0);
        await setLockCreate(mData[0]?.isLockCreate == 1);
        await setLockOutMonth(mData[0]?.isLockOutMonth == 1);
        await setLockResultTrips(mData[0]?.isLockResultTrips == 1);
        await setCreateInMonth(mData[0]?.isCreateInMonth == 1);
      },
    );
    await setLoading(false);
  };
  const LoadDataConfirm = async (fromDate, toDate) => {
    await setIsConfirm(true);
    await setLoading(true);
    const fromValue = fromDate || itemTrips.fromDate;
    const toValue = toDate || itemTrips.toDate;
    await setFilter({
      ...filter,
      loadCalendar: false,
      fromDate: moment(fromValue).format('DD/MM/YYYY'),
      toDate: moment(toValue).format('DD/MM/YYYY'),
      fromDateCaculator: moment(fromValue),
      toDateCaculator: moment(toValue),
    });
    await setItemTrips({
      fromDate: moment(fromValue).format('YYYYMMDD'),
      toDate: moment(toValue).format('YYYYMMDD'),
    });
    await GetConfirmTrips(
      moment(fromValue).format('YYYYMMDD'),
      moment(toValue).format('YYYYMMDD'),
      async mDataConfirm => {
        await setTabStatus(_.uniqBy(mDataConfirm, 'status'));
        await setDataTrips(mDataConfirm);
        await setDataConfirm(mDataConfirm);
        await setLockCreateOld(mDataConfirm[0]?.isLockCreate == 1);
      },
    );
    await setLoading(false);
  };
  const handlerDeleteTrip = item => {
    alertConfirm(
      'Chú ý',
      `Bạn có muốn xoá đăng kí công tác ${item.provinceFromVN} - ${item.provinceToVN
      } Từ ${moment(item.fromDate.toString()).format(
        'DD/MM/YY',
      )} - Đến ${moment(item.toDate.toString()).format('DD/MM/YY')} không ?`,
      async () => {
        await UploadBusiness(ACTION_UPLOAD.DELETE, item, async () => {
          await LoadData(itemTrips.fromDate, itemTrips.toDate);
        });
      },
    );
  };
  const handlerConfirmTrip = (item, type) => {
    const alertTitle = `Bạn có muốn ${type == ACTION_UPLOAD.APPROVED ? 'Xác nhận' : 'Huỷ'
      } ${isConfirmTrip ? 'kết quả công tác' : 'đăng kí công tác'} Từ ${moment(
        item.fromDate.toString(),
      ).format('DD/MM/YY')} - Đến ${moment(item.toDate.toString()).format(
        'DD/MM/YY',
      )} không ?`;
    alertConfirm('Chú ý', alertTitle, async () => {
      await UploadBusiness(type, item, async () => {
        await LoadData(itemTrips.fromDate, itemTrips.toDate);
      });
    });
  };
  // Handler Action
  const handlerRegionChange = value => {
    setMarker(value);
    setFilter({
      ...filter,
      mLatitude: value.latitude,
      mLongitude: value.longitude,
    });
  };
  const getMyLocation = async () => {
    await CheckLocation(() => {
      Geolocation.getCurrentPosition(position => {
        setMarker({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
        setFilter({
          ...filter,
          mLatitude: position.coords.latitude,
          mLongitude: position.coords.longitude,
        });
        refMaps?.current.animateToRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      });
    });
  };
  const showCalendar = () => {
    setFilter({ ...filter, loadCalendar: !filter.loadCalendar });
  };
  const handlerShowTrip = () => {
    SheetManager.show('sheetAction');
    setFilter({
      ...filter,
      mode: filter.mode == MODE.CONFIRM ? MODE.HISTORY : filter.mode,
    });
  };
  const handlerShowConfirm = async () => {
    await setLockOutMonth(isConfirmTrip);
    if (!isConfirmTrip) {
      await setFilter({
        ...filter,
        isLockOutMonth: false,
      });
      !loading && (await LoadDataConfirm());
    } else {
      await setFilter({
        ...filter,
        isLockOutMonth: isLockOutMonth,
      });
      !loading && (await LoadData());
    }
    await setItemTrips({
      fromDate: moment(filter.fromDateCaculator).format('YYYYMMDD'),
      toDate: moment(filter.toDateCaculator).format('YYYYMMDD'),
    });
    SheetManager.show('sheetAction');
  };
  const handlerRegisterTrips = async () => {
    if (!isCreateInMonth) {
      if (
        moment(filter.fromDateCaculator).format('YYYYMM') ==
        moment().format('YYYYMM')
      ) {
        alertWarning('Bạn không được đăng kí tháng hiện tại');
        return;
      }
      if (
        moment(filter.fromDateCaculator).format('YYYYMM') <
        moment().format('YYYYMM')
      ) {
        alertWarning('Bạn không được đăng kí tháng cũ');
        return;
      }
    }
    const betweenDate = moment(filter.toDateCaculator).diff(
      moment(filter.fromDateCaculator),
      'days',
    );
    const calculatorDate = `(${betweenDate + 1} Ngày ${betweenDate} Đêm)`;
    // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: {} })
    await dispatch(SetBusinesTrips({}));
    await setFilter({
      ...filter,
      moneyLimit: moneyLimit,
      mode: MODE.CREATE,
      dayAndNight: calculatorDate,
      dayValue: betweenDate + 1,
      nightValue: betweenDate,
      itemDate: itemTrips,
      isUpdate: false,
      isPlus: false,
      isLockOutMonth: false,
      isCreateInMonth: isCreateInMonth,
    });
  };
  const handlerCreateTrips = async mode => {
    // if (config.checkLimit == 1 && moneyLimit == 0) {
    //     alertWarning('Hạn mức còn lại đã hết bạn sẽ không được đăng kí')
    //     return
    // }
    if (isConfirmTrip) {
      if (
        moment(filter.fromDateCaculator).format('MM') !== moment().format('MM')
      ) {
        alertWarning(
          `Vui lòng thêm chuyến đi trong tháng ${moment().format('MM-YYYY')}`,
        );
        return;
      }
    }
    const betweenDate = moment(filter.toDateCaculator).diff(
      moment(filter.fromDateCaculator),
      'days',
    );
    const calculatorDate = `(${betweenDate + 1} Ngày ${betweenDate} Đêm)`;
    // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: {} })
    await dispatch(SetBusinesTrips({}));
    await setFilter({
      ...filter,
      moneyLimit: moneyLimit,
      mode: MODE.CREATE,
      dayAndNight: calculatorDate,
      dayValue: betweenDate + 1,
      nightValue: betweenDate,
      itemDate: itemTrips,
      isUpdate: false,
      isPlus: true,
      isLockOutMonth: mode == MODE.CONFIRM ? false : isLockOutMonth,
      isCreateInMonth: true,
    });
  };
  const handlerBackCreate = typeArrow => {
    const mode = actionBackHeader(typeArrow);
    setFilter({ ...filter, mode: mode });
  };
  const handlerNextCreate = async typeArrow => {
    if (typeArrow == MODE.CREATE) {
      if (!filter.isCreateInMonth) {
        if (
          moment(filter.fromDateCaculator).format('YYYYMM') ==
          moment().format('YYYYMM')
        ) {
          alertWarning('Bạn không được đăng kí tháng hiện tại');
          return;
        }
        if (
          moment(filter.fromDateCaculator).format('YYYYMM') <
          moment().format('YYYYMM')
        ) {
          alertWarning('Bạn không được đăng kí tháng cũ');
          return;
        }
      }
    }

    if (typeArrow == MODE.RESULT)
      await LoadData(itemTrips.fromDate, itemTrips.toDate);
    if (typeArrow == MODE.PLUS_ACTUAL)
      await LoadDataConfirm(itemTrips.fromDate, itemTrips.toDate);
    const mode = await actionNextHeader(typeArrow);
    if (mode !== undefined)
      await setFilter({ ...filter, mode: mode, loadCalendar: false });
  };
  const handlerEditTrips = async item => {
    const day = item.toDate - item.fromDate + 1;
    const night = item.toDate - item.fromDate;
    const calculatorDate = `(${day} Ngày ${night} Đêm)`;
    const itemEdit = {
      idTrip: item.idTrip,
      loadCalendar: false,
      moneyLimit: item.remaining + item.totalSupport,
      provinceFrom: item.provinceFromVN || null,
      provinceTo: item.provinceToVN || null,
      provinceList: JSON.parse(item.provinceList) || [],
      provinceCodeFrom: item.provinceFromCode || null,
      provinceCodeTo: item.provinceToCode || null,
      addressFrom: item.addressStart || null,
      addressTo: item.addressEnd || null,
      locationStart: item.locationStart || null,
      locationEnd: item.locationEnd || null,
      fromDate: item.fromDate,
      toDate: item.toDate,
      dayValue: day,
      nightValue: night,
      dateFilterFrom: moment(item.fromDate.toString()).format('DD/MM/YYYY'),
      dateFilterTo: moment(item.toDate.toString()).format('DD/MM/YYYY'),
      dayAndNight: calculatorDate,
      note: item.note || null,
      supportKM: item.supportKM,
      supportVehical: item.supportCar,
      supportVehicalOther: item.supportVehicalOther,
      supportNight: item.supportNight,
      supportLunch: item.supportLunch,
      supportDinner: item.supportDinner,
      supportOther: item.supportOther,
      totalNumberDay: _.sumBy(JSON.parse(item.provinceList), 'numberDay') || 0,
      typePeople: item.typePeople || null,
      typeKM: item.typeKM || null,
    };
    // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: itemEdit })
    await dispatch(SetBusinesTrips(itemEdit));
    await setFilter({
      ...filter,
      moneyLimit: moneyLimit,
      mode: MODE.UPDATE,
      dayAndNight: calculatorDate,
      dayValue: day,
      nightValue: night,
      itemDate: itemTrips,
      isUpdate: true,
      isPlus: false,
    });
  };
  //
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    mapsView: { width: '100%', height: '100%' },
    actionView: { position: 'absolute', top: 8, start: 8, zIndex: 5 },
    actionBrefView: { position: 'absolute', top: 8, end: 8, zIndex: 5 },
    sheetView: { width: '100%', height: deviceHeight - 80 },
    titleCreate: {
      width: '100%',
      textAlign: 'center',
      color: appcolor.light,
      padding: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    actionHeader: {
      width: '100%',
      alignItems: 'center',
      padding: 8,
      justifyContent: 'center',
    },
    actionHistory: { width: '100%', padding: 8 },
    buttonAction: { borderRadius: 8, backgroundColor: appcolor.success },
    buttonActionRegister: {
      borderRadius: 8,
      backgroundColor: appcolor.highlightDate,
    },
    limitView: {
      fontSize: 23,
      fontWeight: '800',
      color: appcolor.info,
      alignSelf: 'center',
      paddingBottom: 8,
      fontStyle: 'italic',
    },
    viewDate: { width: '100%', borderRadius: 5, alignItems: 'center' },
    historyViewItem: {
      width: '100%',
      height: deviceHeight / (moneyLimit > 0 ? 1.4 : 1.3),
      alignSelf: 'center',
    },
    itemTrips: {
      width: '100%',
      padding: 3,
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 5,
      marginTop: 5,
    },
    titleView: { fontSize: 14, fontWeight: '600', color: appcolor.dark },
    contentView: { fontSize: 13, fontWeight: '400', color: appcolor.greylight },
    costView: { backgroundColor: appcolor.light, padding: 8 },
    costItemView: { flexDirection: 'row', alignItems: 'center' },
    itemConfirm: {
      width: deviceWidth / 4,
      borderColor: appcolor.blacklight,
      borderWidth: 0.5,
      padding: 8,
      alignItems: 'center',
      borderRadius: 5,
      margin: 5,
    },
  });
  useEffect(() => {
    getMyLocation();
    LoadData();
    return () => loading;
  }, []);
  const renderItem = ({ item, index }) => {
    return (
      <ItemResultView
        key={`HHint_${index}`}
        styles={styles}
        index={index}
        item={item}
        handlerConfirmTrip={handlerConfirmTrip}
        handlerEditTrips={handlerEditTrips}
        handlerDeleteTrip={handlerDeleteTrip}
      />
    );
  };
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={styles.actionView}
        onPress={() => navigation.goBack()}
      >
        <SpiralIcon reverse name="arrow-back" size={21} />
      </TouchableOpacity>
      <View style={styles.actionBrefView}>
        <TouchableOpacity onPress={handlerShowTrip}>
          <SpiralIcon reverse name="briefcase" type="font-awesome" size={21} />
        </TouchableOpacity>
        <TouchableOpacity onPress={getMyLocation}>
          <SpiralIcon
            reverse
            color={appcolor.primary}
            name="location-arrow"
            type="font-awesome"
            size={21}
          />
        </TouchableOpacity>
      </View>
      <MapView
        ref={refMaps}
        style={styles.mapsView}
        provider={PROVIDER_GOOGLE}
        showsMyLocationButton={false}
        showsUserLocation
        getCurrentPosition
        zoomEnabled
        scrollingEnabled
        onRegionChange={handlerRegionChange}
      >
        <Marker draggable pinColor={appcolor.red} coordinate={marker} />
      </MapView>
      <ActionSheet
        id="sheetAction"
        initialOffsetFromBottom={0.6}
        statusBarTranslucent
        gestureEnabled
        keyboardHandlerEnabled={false}
        drawUnderStatusBar={Platform.OS == 'ios'}
        closable={filter.mode == MODE.HISTORY || filter.mode == MODE.CONFIRM}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        {(filter.mode == MODE.HISTORY || filter.mode == MODE.CONFIRM) && (
          <SafeAreaView style={styles.sheetView}>
            <View style={styles.actionHeader}>
              {config.checkLimit == 1 && (
                <Text
                  style={{ fontSize: 13, fontWeight: '600', marginBottom: 3 }}
                >
                  Hạn mức còn lại
                </Text>
              )}
              {config.checkLimit == 1 && (
                <NumberFormatView
                  value={moneyLimit}
                  textStyle={styles.limitView}
                />
              )}
              <View style={{ width: deviceWidth, flexDirection: 'row' }}>
                {!lockCreate && !isConfirmTrip && (
                  <TouchableOpacity
                    style={styles.buttonAction}
                    onPress={handlerRegisterTrips}
                  >
                    <Text style={{ ...styles.titleCreate, minWidth: 100 }}>
                      {'Đăng kí'}
                    </Text>
                  </TouchableOpacity>
                )}
                {!lockCreateOld && isConfirmTrip && (
                  <TouchableOpacity
                    style={styles.buttonActionRegister}
                    onPress={handlerCreateTrips}
                  >
                    <Text style={{ ...styles.titleCreate, minWidth: 100 }}>
                      {'Thêm chuyến đi'}
                    </Text>
                  </TouchableOpacity>
                )}
                {!lockResultTrips && (
                  <TouchableOpacity
                    style={{
                      ...styles.buttonAction,
                      marginStart: 8,
                      backgroundColor: isConfirmTrip
                        ? appcolor.info
                        : appcolor.light,
                      borderWidth: 1,
                      borderColor: appcolor.info,
                    }}
                    onPress={handlerShowConfirm}
                  >
                    <Text
                      style={{
                        ...styles.titleCreate,
                        color: isConfirmTrip ? appcolor.light : appcolor.dark,
                      }}
                    >
                      Kết quả công tác
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.actionHistory}>
              <View style={styles.viewDate}>
                <FormGroup
                  containerStyle={{ width: '100%', padding: 5 }}
                  inputStyle={{
                    fontSize: 14,
                    fontWeight: '400',
                    color: appcolor.greylight,
                  }}
                  title="Ngày đăng kí công tác"
                  iconRight="calendar-alt"
                  value={`${filter.fromDate} - ${filter.toDate}`}
                  rightFunc={showCalendar}
                />
                {filter.loadCalendar && (
                  <CalendarSelected
                    onChangeData={isConfirmTrip ? LoadDataConfirm : LoadData}
                    lockOutMonth={true}
                  />
                )}
              </View>
            </View>
            {loading && <LoadingView isLoading={loading} title=" " />}
            {!loading && tabStatus !== null && tabStatus.length > 0 && (
              <View style={styles.historyViewItem}>
                <Tabs.Container
                  pagerProps={{
                    scrollEnabled: false,
                  }}
                  width={deviceWidth}
                  renderTabBar={props => (
                    <MaterialTabBar
                      {...props}
                      labelStyle={{ fontSize: 12, fontWeight: '600' }}
                      indicatorStyle={{ backgroundColor: appcolor.light }}
                      inactiveColor={appcolor.light}
                      activeColor={appcolor.light}
                      scrollEnabled={true}
                      style={{
                        backgroundColor: appcolor.info,
                        width: deviceWidth,
                      }}
                      tabStyle={{
                        minWidth: minWidthTab(tabStatus),
                        height: 36,
                      }}
                    />
                  )}
                >
                  {tabStatus?.map((item, index) => {
                    const dataTripByStatus = _.filter(dataTrips, {
                      status: item.status,
                    });
                    const headerName = item.status || 'Không có dữ liệu';
                    return (
                      <Tabs.Tab
                        key={`status_${index}`}
                        label={`${headerName} (${dataTripByStatus.length})`}
                        name={`${headerName} (${dataTripByStatus.length})`}
                      >
                        <View
                          style={{ flex: 1, marginTop: 38, width: deviceWidth }}
                        >
                          <FlatList
                            data={dataTripByStatus}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                            keyExtractor={(___, i) => i.toString()}
                            renderItem={renderItem}
                            ListFooterComponent={
                              <View style={{ marginTop: 32 }} />
                            }
                          />
                        </View>
                      </Tabs.Tab>
                    );
                  })}
                </Tabs.Container>
              </View>
            )}
          </SafeAreaView>
        )}
        {(filter.mode == MODE.CREATE || filter.mode == MODE.UPDATE) && (
          <View style={styles.sheetView}>
            <CreateNewTrip
              dateFilter={filter}
              onCloseCreate={handlerBackCreate}
              onNextCreate={handlerNextCreate}
            />
          </View>
        )}
        {filter.mode == MODE.COST && (
          <View style={styles.sheetView}>
            <CostMenu onBack={handlerBackCreate} onNext={handlerNextCreate} />
          </View>
        )}
        {filter.mode == MODE.RESULT && (
          <View style={styles.sheetView}>
            <TripResult
              onBack={handlerBackCreate}
              onNext={handlerNextCreate}
              isUpdate={filter.isUpdate}
              isPlusPlan={filter.isPlus}
            />
          </View>
        )}
      </ActionSheet>
      <ActionSheet
        id="sheetDetails"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View>
          <TripResult detailData={itemDetailView} />
        </View>
      </ActionSheet>
    </View>
  );
};
