import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { CalendarSelected } from '../../../Control/CalendarSelected';
import { AttendantController } from '../../../Controller/AttendantController';
import {
  GetBusinesTrips,
  GetProvinceByShop,
} from '../../../Controller/BussinessTripController';
import { ACTION } from '../../../Core/ReduxController';
import { alertWarning, deviceHeight, isValid } from '../../../Core/Utility';
import { HeaderBusiness } from '../HeaderBusiness';
import {
  MODE,
  TYPE,
  checkDateExists,
  provinceByAddress,
} from '../UtilityBusiness';
import _ from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-native-actions-sheet';
import { TripWithPointLG } from '../TripWithPointLG';
import { ListDateTrip } from '../InputControl/ListDateTrip';
import { SetBusinesTrips } from '../../../Redux/action';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const LGCreateTrips = ({
  onCloseCreate,
  onNextCreate,
  dateFilter,
  quotaData,
}) => {
  const { appcolor, tripResult, kpiinfo } = useSelector(
    state => state.GAppState,
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [dataProvince, setDataProvince] = useState([]);
  const [dataProvinceMain, setDataProvinceMain] = useState([]);
  const [dataShow, setDataShow] = useState([]);
  const config = JSON.parse(kpiinfo?.reportItem) || {};
  const [dataByMonth, setDataByMonth] = useState([]);
  const [reloadDate, setReloadDate] = useState(false);

  const typeArrow = {
    titleHeader: 'Địa điểm công tác',
    typeBack: 'close',
    typeForward: 'arrow-forward',
  };
  const [itemTrips, setItemTrips] = useState({
    loadCalendar: false,
    moneyLimit: tripResult.moneyLimit || dateFilter.moneyLimit,
    provinceFrom: tripResult.provinceFrom || null,
    provinceTo: tripResult.provinceTo || null,
    provinceCodeFrom: tripResult.provinceCodeFrom || null,
    provinceCodeTo: tripResult.provinceCodeTo || null,
    provinceList: tripResult.provinceList || [],
    addressFrom: tripResult.addressFrom || null,
    addressTo: tripResult.addressTo || null,
    locationStart: tripResult.locationStart || null,
    locationEnd: tripResult.locationEnd || null,
    fromDate: tripResult.fromDate || dateFilter.itemDate.fromDate,
    toDate: tripResult.toDate || dateFilter.itemDate.toDate,
    dayValue: tripResult.dayValue || dateFilter.dayValue,
    nightValue: tripResult.nightValue || dateFilter.nightValue,
    dateFilterFrom: tripResult.dateFilterFrom || dateFilter.fromDate,
    dateFilterTo: tripResult.dateFilterTo || dateFilter.toDate,
    dayAndNight: tripResult.dayAndNight || dateFilter.dayAndNight,
    note: tripResult.note || null,
    supportVehical: tripResult.supportVehical || 0,
    mLatitude: dateFilter.mLatitude,
    mLongitude: dateFilter.mLongitude,
    supportVehicalOther: tripResult.supportVehicalOther || 0,
    typeVehicle: tripResult.typeVehicle || null,
    movingSteps: tripResult.movingSteps || null,
    kmValue: tripResult.kmValue || null,
    isViewByList: tripResult.isViewByList || 0,
    listDate: tripResult.listDate || null,
    typeKM: tripResult.typeKM,
  });
  //
  const LoadData = async () => {
    await setLoading(true);
    await GetProvinceByShop(async mData => {
      await setDataProvince(mData);
      await setDataProvinceMain(mData);
    });
    if (config.isCheckDoubleDate == 1) {
      const firstDateMonth = moment().startOf('month').format('YYYYMMDD');
      const lastDateMonth = moment().endOf('month').format('YYYYMMDD');
      await GetBusinesTrips(firstDateMonth, lastDateMonth, async mData => {
        await setDataByMonth(mData);
      });
    }
    await setLoading(false);
  };
  //
  const actionNext = async () => {
    if (config.isCheckDoubleDate == 1) {
      const result = checkDate();
      if (result) {
        alertWarning(`Bạn đăng kí ngày đi công tác bị trùng!`);
        return;
      } else {
        await checkCondition();
      }
    } else {
      await checkCondition();
    }
  };

  const checkCondition = async () => {
    if (dateFilter.mode == MODE.CREATE && !dateFilter.isUpdate) {
      if (config.dayLock !== undefined && config.dayLock > 0) {
        const monthSelect = moment(itemTrips.fromDate, 'YYYYMMDD').format('MM');
        const dateSelect = moment(itemTrips.fromDate, 'YYYYMMDD').format('DD');

        if (
          config.dayLock < new Date().getDate() &&
          monthSelect == new Date().getMonth() + 1 &&
          dateSelect <= config.dayLock
        ) {
          alertWarning(
            `Bạn không được đăng kí ngày đi công tác nhỏ hơn ngày ${config.dayLock} của tháng hiện tại!`,
          );
          return;
        }
      }
      if (
        moment(itemTrips.fromDate, 'YYYYMMDD').format('YYYYMM') <
        moment().format('YYYYMM')
      ) {
        alertWarning('Bạn không được đăng kí tháng cũ');
        return;
      }
    }
    await checkInputData(async (isSuccess, message) => {
      if (isSuccess) {
        const tripResultItem = await _.merge(tripResult, itemTrips);
        // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: { ...tripResultItem, provinceList: itemTrips.provinceList, movingSteps: itemTrips.movingSteps } })
        await dispatch(
          SetBusinesTrips({
            ...tripResultItem,
            provinceList: itemTrips.provinceList,
            movingSteps: itemTrips.movingSteps,
          }),
        );
        await onNextCreate(dateFilter.mode);
      } else {
        alertWarning(message);
      }
    });
  };

  const checkDate = () => {
    const result = checkDateExists(
      itemTrips.fromDate,
      itemTrips.toDate,
      dataByMonth,
    );
    return result;
  };

  const checkInputData = actionDone => {
    let strValid = '';

    if (itemTrips.typeKM != 2) {
      if (
        isValid(itemTrips.provinceList) &&
        itemTrips.provinceList?.length > 0
      ) {
        const listPoints = itemTrips.provinceList;
        for (let index = 0; index < listPoints.length; index++) {
          const element = listPoints[index];
          if (
            element.workDate == null ||
            element.workDate == '' ||
            element.workDate == undefined
          ) {
            strValid += `Chưa nhập ngày đến điểm thứ ${element.id + 1}, `;
          }
          if (
            itemTrips.typeKM == 1 &&
            (element.provinceTo == null ||
              element.provinceTo == '' ||
              element.provinceTo == undefined)
          ) {
            strValid += `Chưa nhập tỉnh đến điểm thứ ${element.id + 1}, `;
          }
          if (
            itemTrips.typeKM == 3 &&
            (element.shopVisit == null ||
              element.shopVisit == '' ||
              element.shopVisit == undefined)
          ) {
            strValid += `Chưa nhập cửa hàng đến điểm thứ ${element.id + 1}, `;
          }
        }
      } else {
        strValid += 'Chưa nhập số điểm đến của chuyến, ';
      }
    }

    if (!isValid(itemTrips.listDate) && itemTrips.typeKM == 2) {
      strValid += 'Bạn chưa chọn ngày đi, ';
    }
    if (!isValid(itemTrips.addressFrom))
      strValid += 'Địa chỉ bắt đầu xuất phát, ';
    if (!isValid(itemTrips.addressTo) && itemTrips.typeKM != 1)
      strValid += 'Địa chỉ kết thúc chuyến đi, ';
    //
    actionDone(strValid.length == 0, `Nhập đầy đủ thông tin: ${strValid}`);
  };
  const handlerWorkingDate = async (fromValue, toValue, month) => {
    if (dateFilter.mode == MODE.UPDATE) {
      if (
        moment(itemTrips.fromDate.toString()).format('YYYYMM') !==
        moment(fromValue).format('YYYYMM')
      ) {
        alertWarning('Bạn không được cập nhật ngày qua tháng khác');
        return;
      }
    }

    const fromDate = moment(fromValue).format('YYYYMMDD');
    const toDate = moment(toValue).format('YYYYMMDD');
    const betweenDate = moment(toValue).diff(moment(fromValue), 'days');
    const calculatorDate = `(${betweenDate + 1} Ngày ${betweenDate} Đêm)`;
    dateFilter.month = month;
    await setItemTrips({
      ...itemTrips,
      fromDate: fromDate,
      toDate: toDate,
      dateFilterFrom: moment(fromValue).format('DD/MM/YYYY'),
      dateFilterTo: moment(toValue).format('DD/MM/YYYY'),
      loadCalendar: false,
      dayAndNight: calculatorDate,
      listDate: null,
      // dayValue: betweenDate + 1,
      // nightValue: betweenDate
    });

    await setReloadDate(e => !e);
  };
  const searchAddress = async (typeFilter, textValue) => {
    await setTimeout(async () => {
      await AttendantController.DataLocationFromAddress(
        textValue,
        async dataLocation => {
          await setDataShow(dataLocation);
        },
      );
    }, 500);
  };
  const onMultipleChoose = (item, typeItem, listItem) => {
    if (typeItem == TYPE.PROVINCE_LIST)
      setItemTrips({ ...itemTrips, provinceList: listItem });
    if (typeItem == TYPE.PROVINCE_FROM)
      setItemTrips({
        ...itemTrips,
        provinceFrom: item.itemName,
        provinceCodeFrom: item.provinceCode,
      });
    if (typeItem == TYPE.PROVINCE_TO)
      setItemTrips({
        ...itemTrips,
        provinceTo: item.itemName,
        provinceCodeTo: item.provinceCode,
      });
    if (typeItem == TYPE.TYPE_KM)
      setItemTrips({
        ...itemTrips,
        typeKM: item.itemName,
        kmValue: item.numberValue,
      });
  };
  const handlerItemChangeText = async (text, typeItem) => {
    let valueInput = 0;
    if (typeItem == TYPE.PROVINCE_FROM)
      await setItemTrips({
        ...itemTrips,
        addressFrom: text,
        provinceFrom: text,
        locationStart: null,
      });
    if (typeItem == TYPE.PROVINCE_TO)
      await setItemTrips({
        ...itemTrips,
        addressTo: text,
        provinceTo: text,
        locationEnd: null,
      });
    if (typeItem == TYPE.TYPE_NOTE)
      await setItemTrips({ ...itemTrips, note: text });
    if (typeItem == TYPE.TYPE_LUNCH) {
      valueInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null;
      await setItemTrips({ ...itemTrips, dayValue: valueInput });
    }
    if (typeItem == TYPE.TYPE_NIGTH_REST) {
      valueInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null;
      await setItemTrips({ ...itemTrips, nightValue: valueInput });
    }
  };
  const handlerAddressChoose = async (text, typeItem, location) => {
    const { province, district } = provinceByAddress(text);
    if (typeItem == TYPE.PROVINCE_FROM) {
      await setItemTrips({
        ...itemTrips,
        addressFrom: text,
        locationStart: location,
        provinceFrom: province,
        districtFrom: district,
      });
    }
    if (typeItem == TYPE.PROVINCE_TO)
      await setItemTrips({
        ...itemTrips,
        addressTo: text,
        locationEnd: location,
      });
  };
  const handlerShowCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItemTrips({ ...itemTrips, loadCalendar: !itemTrips.loadCalendar });
  };
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: deviceHeight,
      backgroundColor: appcolor.light,
    },
    mainContent: { width: '100%', padding: 8 },
    actionView: { zIndex: 5, padding: 8, position: 'absolute' },
    headerView: { width: '100%', alignSelf: 'center', flexDirection: 'row' },
    headerName: {
      width: '100%',
      padding: 8,
      fontSize: 18,
      fontWeight: '600',
      color: appcolor.blacklight,
      textAlign: 'center',
    },
    viewDate: {
      width: '100%',
      borderRadius: 5,
      alignItems: 'center',
      padding: 4,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <HeaderBusiness
        typeArrow={typeArrow}
        onBack={() => onCloseCreate(dateFilter.mode)}
        onForward={actionNext}
      />
      <ScrollView
        style={{ width: '100%', height: deviceHeight, padding: 5 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: '100%', height: '100%' }}
          extraHeight={deviceHeight / 4}
          enableOnAndroid
        >
          <View key={'dateBusiness'} style={styles.viewDate}>
            <FormGroup
              containerStyle={{ width: '100%', padding: 5, borderRadius: 5 }}
              inputStyle={{
                fontSize: 14,
                fontWeight: '400',
                color: appcolor.greylight,
              }}
              title={`Ngày đi công tác ${itemTrips.dayAndNight}`}
              iconRight="calendar-alt"
              value={`${itemTrips.dateFilterFrom} - ${itemTrips.dateFilterTo}`}
              rightFunc={() => handlerShowCalendar()}
            />
            {itemTrips.loadCalendar && (
              <CalendarSelected
                onChangeData={handlerWorkingDate}
                month={dateFilter.month}
                lockOutMonth={config?.isLockOutMonth == 0 ? false : true}
              />
            )}
          </View>
          {itemTrips.typeKM == 2 && (
            <View key={'listDateBusiness'} style={styles.viewDate}>
              <ListDateTrip
                itemTrips={itemTrips}
                itemValue={itemTrips.listDate}
                typeItem={'listDate'}
                reloadDate={reloadDate}
              />
            </View>
          )}

          <ItemInput
            key={`${TYPE.TYPE_LUNCH}`}
            titleName="Số ngày đi"
            placeholder="Số ngày bạn đi trong chuyến công tác"
            iconName="comment"
            keyboardType="numeric"
            typeFilter={TYPE.TYPE_LUNCH}
            itemValue={itemTrips.dayValue?.toString() || '0'}
            onChangeText={handlerItemChangeText}
          />
          <ItemInput
            key={`${TYPE.TYPE_NIGTH_REST}`}
            titleName="Số đêm"
            placeholder="số đêm ngủ lại trong chuyến đi công tác"
            iconName="comment"
            keyboardType="number-pad"
            typeFilter={TYPE.TYPE_NIGTH_REST}
            itemValue={itemTrips.nightValue?.toString() || '0'}
            onChangeText={handlerItemChangeText}
          />
          {/* <AutoCompleteAddress
                        isRequire
                        titleName='Địa chỉ điểm đi'
                        placeholder='Địa chỉ bắt đầu xuất phát'
                        iconName='map-marker-alt'
                        itemValue={itemTrips.addressFrom}
                        typeFilter={TYPE.PROVINCE_FROM}
                        searchAction={searchAddress}
                        dataFilter={dataShow}
                        onChooseItem={handlerAddressChoose}
                    /> */}
          <ItemInput
            isRequire
            key={`${TYPE.PROVINCE_FROM}`}
            titleName="Địa chỉ điểm đi"
            placeholder="Địa chỉ bắt đầu xuất phát"
            iconName="map-marker-alt"
            typeFilter={TYPE.PROVINCE_FROM}
            itemValue={itemTrips.addressFrom}
            onChangeText={handlerItemChangeText}
          />
          {itemTrips.typeKM != 1 && (
            <ItemInput
              isRequire
              key={`${TYPE.PROVINCE_TO}`}
              titleName="Địa chỉ điểm kết thúc"
              placeholder="Địa chỉ kết thúc chuyến đi"
              iconName="map-marker-alt"
              typeFilter={TYPE.PROVINCE_TO}
              itemValue={itemTrips.addressTo}
              onChangeText={handlerItemChangeText}
            />
          )}
          {(itemTrips.isViewByList == 1 ||
            itemTrips.provinceList.length > 0) && (
              <TripWithPointLG
                config={config}
                quotaData={quotaData}
                itemTrips={itemTrips}
                ItemInput={ItemInput}
                handlerItemChangeText={handlerItemChangeText}
                dataProvince={dataProvince}
              />
            )}
          <ItemInput
            key={`${TYPE.TYPE_NOTE}`}
            titleName="Ghi chú"
            placeholder="Nội dung đi công tác"
            iconName="comment"
            typeFilter={TYPE.TYPE_NOTE}
            itemValue={itemTrips.note}
            onChangeText={handlerItemChangeText}
          />
          <View style={{ height: deviceHeight / 2 }} />
        </KeyboardAwareScrollView>
      </ScrollView>
    </View>
  );
};
const ItemInput = ({
  titleName,
  iconName,
  isRequire,
  onActionRight,
  iconRightName,
  typeFilter,
  itemValue,
  placeholder,
  onChangeText,
  keyboardType = 'default',
  editable = true,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const widthItem = onActionRight !== undefined ? '90%' : '100%';
  const styles = StyleSheet.create({
    mainItem: { flexGrow: 1, padding: 8, marginBottom: 1 },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    inputView: {
      width: widthItem,
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      marginBottom: 0,
    },
  });
  const onPress = () => {
    onActionRight(typeFilter, itemValue);
  };
  const handlerChangeValue = text => {
    itemValue = text;
    onChangeText !== undefined && onChangeText(text, typeFilter);
  };
  const androidClearValue = text => {
    itemValue = text;
    onChangeText !== undefined && onChangeText(text, typeFilter);
  };
  return (
    <View style={styles.mainItem}>
      <View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
        {iconName && (
          <SpiralIcon
            name={iconName}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
        )}
        {titleName && (
          <Text style={styles.titleHeader}>
            {`${titleName} `}
            {isRequire && (
              <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
            )}
          </Text>
        )}
      </View>
      <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <FormGroup
          keyboardType={keyboardType}
          containerStyle={styles.inputView}
          editable={editable}
          multiline
          useClearAndroid={false}
          value={itemValue}
          handleChangeForm={handlerChangeValue}
          onClearTextAndroid={androidClearValue}
        />
        {onActionRight !== undefined && (
          <TouchableOpacity
            style={{
              width: '10%',
              padding: 8,
              marginStart: 5,
              backgroundColor: appcolor.info,
              borderRadius: 50,
            }}
            onPress={onPress}
          >
            <SpiralIcon
              type="font-awesome-5"
              name={iconRightName ? iconRightName : 'search'}
              size={18}
              color={appcolor.light}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
