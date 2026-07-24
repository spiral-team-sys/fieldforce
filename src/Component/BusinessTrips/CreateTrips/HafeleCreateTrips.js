import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { CalendarSelected } from '../../../Control/CalendarSelected';
import { MutipleItemSelected } from '../../../Control/MutipleItemSelected';
import { AttendantController } from '../../../Controller/AttendantController';
import { GetProvinceByShop } from '../../../Controller/BussinessTripController';
import { ACTION } from '../../../Core/ReduxController';
import { alertWarning, deviceHeight, isValid } from '../../../Core/Utility';
import { HeaderBusiness } from '../HeaderBusiness';
import { MODE, TYPE, provinceByAddress } from '../UtilityBusiness';
import _ from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-native-actions-sheet';
import { SetBusinesTrips } from '../../../Redux/action';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const HafeleCreateTrips = ({
  onCloseCreate,
  onNextCreate,
  dateFilter,
  tripConfig,
  dataTrips,
  quotaData,
}) => {
  const { appcolor, tripResult, kpiinfo } = useSelector(
    state => state.GAppState,
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [dataProvince, setDataProvince] = useState([]);
  const [dataShow, setDataShow] = useState([]);
  const [dataProvinceMain, setDataProvinceMain] = useState([]);
  const config = JSON.parse(kpiinfo?.reportItem) || {};

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
    mLatitude: dateFilter.mLatitude,
    mLongitude: dateFilter.mLongitude,
    supportVehicalOther: tripResult.supportVehicalOther || 0,
    supportWorkValue: tripResult.supportWork || 0,
    tripReplace: tripResult.tripReplace || null,
    confirmReplace: tripResult.confirmReplace || 0,
    typeVehicle: tripResult.typeVehicle || null,
    movingSteps: tripResult.movingSteps || null,
    kmValue: tripResult.kmValue || null,
    supportWorkMaint: tripResult.supportWorkMaint || null,
  });
  //
  const LoadData = async () => {
    await setLoading(true);
    await GetProvinceByShop(async mData => {
      await setDataProvince(mData);
      await setDataProvinceMain(mData);
      // await settingAddressFrom(mData)
    });
    await setLoading(false);
  };
  //
  const actionNext = async () => {
    if (dateFilter.mode == MODE.CREATE) {
      if (
        moment(itemTrips.fromDate).format('YYYYMM') < moment().format('YYYYMM')
      ) {
        alertWarning('Bạn không được đăng kí tháng cũ');
        return;
      }
    }
    await checkInputData(async (isSuccess, message) => {
      if (isSuccess) {
        const tripResultItem = await _.merge(tripResult, itemTrips);
        // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: tripResultItem })
        await dispatch(SetBusinesTrips(tripResultItem));
        await onNextCreate(MODE.CREATE);
      } else {
        alertWarning(message);
      }
    });
  };
  const checkInputData = actionDone => {
    let strValid = '';
    if (!isValid(itemTrips.provinceFrom)) strValid += 'Tỉnh đi, ';

    let countNightDay = 0;
    if (
      !isValid(itemTrips.provinceList) ||
      itemTrips.provinceList?.length == 0
    ) {
      strValid += 'Danh sách tỉnh đi, ';
    } else {
      const lstProvince = itemTrips.provinceList;

      for (let index = 0; index < lstProvince.length; index++) {
        const element = lstProvince[index];
        if (element.numberDay == '' && element.numberDay !== 0) {
          strValid += `Chưa nhập lưu trú ${element.itemName}, `;
        }
        if (element.numberDay !== '') {
          countNightDay = countNightDay + element.numberDay;
        }
      }
      if (countNightDay > itemTrips.nightValue) {
        strValid += `Tổng đêm lưu trú lớn hơn số đêm đi công tác, `;
      }
    }

    if (!isValid(itemTrips.note)) strValid += 'Vui lòng nhập ghi chú, ';
    if (dateFilter.mode == MODE.CREATE || dateFilter.mode == MODE.UPDATE) {
      if (
        tripConfig.maxDay !== null &&
        tripConfig.maxDay !== undefined &&
        tripConfig.maxDay > 0 &&
        itemTrips.dayValue > tripConfig?.maxDay
      ) {
        alertWarning(
          `Số ngày đi không được lớn hơn số ngày giới hạn: ${itemTrips.dayValue} / ${tripConfig.maxDay}`,
        );
        return;
      }
      if (
        tripConfig?.maxNumberNight !== null &&
        tripConfig?.maxNumberNight !== undefined &&
        tripConfig?.maxNumberNight > 0 &&
        countNightDay > tripConfig?.maxNumberNight
      ) {
        alertWarning(
          `Số đêm ở lại không được lớn hơn số đêm giới hạn: ${countNightDay} / ${tripConfig?.maxNumberNight}`,
        );
        return;
      }
    }

    //
    actionDone(
      strValid.length == 0,
      `Vui lòng nhập đầy đủ dữ liệu: ${strValid}`,
    );
  };
  const handlerWorkingDate = async (fromValue, toValue) => {
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
    await setItemTrips({
      ...itemTrips,
      fromDate: fromDate,
      toDate: toDate,
      dateFilterFrom: moment(fromValue).format('DD/MM/YYYY'),
      dateFilterTo: moment(toValue).format('DD/MM/YYYY'),
      loadCalendar: false,
      dayAndNight: calculatorDate,
      dayValue: betweenDate + 1,
      nightValue: betweenDate,
    });
  };
  const searchAddress = async (typeFilter, textValue) => {
    // if (!isValid(textValue) || textValue.length < 10) {
    //     alertWarning(`Để tìm kiếm chính xác hơn vui lòng nhập đầy đủ dữ liệu bao gồm (Số nhà, Tên đường, Quận/Huyện, Thành phố)`)
    //     return
    // }
    // const addressValue = typeFilter == TYPE.PROVINCE_FROM ? `${textValue}, ${itemTrips.provinceFrom}` : `${textValue}, ${itemTrips.provinceTo}`
    // await AttendantAPI.LocationFromAddress(addressValue, async (dataLocation) => {
    //     const locationValue = `${dataLocation.location.lat},${dataLocation.location.lng}`
    //     if (typeFilter == TYPE.PROVINCE_FROM)
    //         await setItemTrips({
    //             ...itemTrips,
    //             addressFrom: dataLocation.address,
    //             locationStart: locationValue
    //         })
    //     if (typeFilter == TYPE.PROVINCE_TO)
    //         await setItemTrips({
    //             ...itemTrips,
    //             addressTo: dataLocation.address,
    //             locationEnd: locationValue
    //         })
    // }, () => alertError('Không tìm thấy địa chỉ, vui lòng kiểm tra và thử lại'))

    await setTimeout(async () => {
      await AttendantController.DataLocationFromAddress(
        textValue,
        async dataLocation => {
          await setDataShow(dataLocation);
        },
      );
    }, 500);
  };
  // isUseProvinceLocation
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
    if (typeItem == TYPE.PROVINCE_FROM)
      await setItemTrips({
        ...itemTrips,
        addressFrom: text,
        locationStart: null,
      });
    if (typeItem == TYPE.PROVINCE_TO)
      await setItemTrips({ ...itemTrips, addressTo: text, locationEnd: null });
    if (typeItem == TYPE.TYPE_NOTE)
      await setItemTrips({ ...itemTrips, note: text });
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
  const handlerTripSelect = async itemTripSelect => {
    itemTrips.tripReplace = JSON.stringify(itemTripSelect);
  };
  useEffect(() => {
    LoadData();
    return () => loading;
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
    viewDate: { width: '100%', borderRadius: 5, alignItems: 'center' },
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
              rightFunc={() =>
                setItemTrips({
                  ...itemTrips,
                  loadCalendar: !itemTrips.loadCalendar,
                })
              }
            />
            {itemTrips.loadCalendar && (
              <CalendarSelected
                onChangeData={handlerWorkingDate}
                lockOutMonth={true}
              />
            )}
          </View>
          <MutipleItemSelected
            key={`${TYPE.PROVINCE_FROM}_1`}
            isRequire
            isFilter
            typeItem={TYPE.PROVINCE_FROM}
            titleName="Tỉnh đi"
            iconName={'plane-departure'}
            defaultValue={itemTrips.provinceFrom}
            dataItems={dataProvince}
            onItemChoose={onMultipleChoose}
          />
          <MutipleItemSelected
            key={`${TYPE.PROVINCE_LIST}_2`}
            isUseEatDay={false}
            isRequire
            isFilter
            typeItem={TYPE.PROVINCE_LIST}
            titleName="Chọn tỉnh"
            placeholder={'Tỉnh đi và tỉnh đến'}
            iconName={'plane-departure'}
            defaultValueMulti={itemTrips.provinceList}
            mulipleChoose={true}
            dataItems={dataProvince}
            onItemChoose={onMultipleChoose}
          />

          <ItemInput
            isRequire
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
  typeFilter,
  itemValue,
  placeholder,
  onChangeText,
  keyboardType = 'default',
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
          editable
          multiline
          useClearAndroid={false}
          value={itemValue}
          handleChangeForm={handlerChangeValue}
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
              name="search"
              size={18}
              color={appcolor.light}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
