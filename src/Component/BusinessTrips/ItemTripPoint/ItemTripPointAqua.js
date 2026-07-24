import moment from 'moment';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { AutoCompleteAddress } from '../AutoCompleteAddress';
import { TYPE, provinceByAddress } from '../UtilityBusiness';
import { ItemInput } from '../InputControl/ItemInput';
import { formatNumber } from '../../../Core/Helper';
import { CalendarSelected } from '../../../Control/CalendarSelected';
import { alertWarning } from '../../../Core/Utility';
import LottieView from 'lottie-react-native';
import { WorkingPlanAPI } from '../../../API/WorkingPlanApi';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const ItemTripPointAqua = ({
  item,
  index,
  itemTrips,
  itemPoint,
  typeVehicle,
  config,
  quotaData,
  dateFilter,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_, setMutate] = useState(false);
  const [dataByDate, setDataByDate] = useState({
    dataPlan: dateFilter.dataPlan || [],
    isShowPlan: false,
  });
  const [isReload, setReload] = useState(false);

  const valueItem = value => {
    return value == 0 ? '0' : formatNumber(value, ',');
  };

  const handlerAddressChoose = async (text, typeItem, location) => {
    const { province, district } = provinceByAddress(text);
    if (typeItem == TYPE.PROVINCE_FROM) {
      item.district = district;
      item.provinceName = province;
      item.addressPoint = text;
      item.locationPoint = location;
      item.distance = 0;
      item.distanceText = '';
    }
    setMutate(e => !e);
    // await AddMarker(dataStage)
  };
  const onEditValue = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let text =
      value !== null && value.length > 0
        ? value.toString().replace(/,/g, '')
        : '';
    let intValue = text === '' ? null : parseInt(text);
    item.numberDay = parseInt(intValue || 0);
    // item.maxCostHotel = (quotaData.hotelSup && quotaData.hotelSup > 0 ? quotaData.hotelSup * intValue : 0)
    if (intValue == 0) {
      item.nightRestValue = 0;
    }
    itemTrips.provinceList = [...itemPoint];
    setMutate(e => !e);
  };

  const onEditEatValue = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let text =
      value !== null && value.length > 0
        ? value.toString().replace(/,/g, '')
        : '';
    let intValue = text === '' ? null : parseInt(text);
    item.eatDay = parseInt(intValue || 0);
    // item.maxCostFood = (quotaData.foodSup && quotaData.foodSup > 0 ? quotaData.foodSup * intValue : 0)
    // item.foodCostPoint = (quotaData.foodSup && quotaData.foodSup > 0 ? quotaData.foodSup * intValue : 0)
    itemTrips.provinceList = [...itemPoint];
    setMutate(e => !e);
  };
  const handleSelectDate = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    item.loadCalendar = item.loadCalendar == true ? false : true;

    dataByDate.isShowPlan = false;
    setMutate(e => !e);
  };
  const handlerWorkingDate = async fromValue => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    item.arrivedDay = moment(fromValue).format('YYYYMMDD');
    item.loadCalendar = item.loadCalendar == true ? false : true;
    if (quotaData.isUsePlanSystem == 1) {
      const jsonData = { fromDate: item.arrivedDay, toDate: item.arrivedDay };
      WorkingPlanAPI.getStoreByDate(jsonData, async mData => {
        dataByDate.dataPlan = mData;
        setMutate(e => !e);
      });
      dataByDate.isShowPlan = true;
      // dataByDate.dataPlan = dataStoreTest
    }
    setMutate(e => !e);
  };
  const handlerItemChangeText = async (text, typeItem) => {
    if (typeItem == TYPE.TYPE_NOTE) {
      item.note = text;
      setMutate(e => !e);
    } else {
      const valueInput =
        text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null;
      if (typeItem == TYPE.TYPE_STORE) {
        item.numberStore = valueInput;
        setMutate(e => !e);
        return;
      }
      if (typeItem == TYPE.TYPE_NIGTH_REST) {
        if (valueInput > item.maxCostHotel) {
          alertWarning(
            `Chi phí khách sạn phải nhỏ hơn hoặc bằng định mức hỗ trợ ${item.maxCostHotel}`,
          );
          return;
        }
        item.nightRestValue = valueInput;
        setMutate(e => !e);
      }
      if (typeItem == TYPE.TYPE_LUNCH) {
        setMutate(e => !e);
      }
      if (typeItem == TYPE.TYPE_VEHICAL) {
        if (
          valueInput > item.maxCostVehicle &&
          typeVehicle?.code == 'DRIVING'
        ) {
          alertWarning(
            `Chi phí di chuyển phải nhỏ hơn hoặc bằng định mức hỗ trợ ${item.maxCostVehicle}`,
          );
          return;
        }
        item.vehicalValue = valueInput;
        setMutate(e => !e);
      }
    }
  };
  const handlePressCopy = itemStore => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    item.district = itemStore.district;
    item.provinceName = itemStore.province;
    item.addressPoint = itemStore.address;
    item.locationPoint =
      itemStore.latitude != null && itemStore.latitude != 0
        ? itemStore.latitude + ',' + itemStore.longitude
        : null;
    item.distance = 0;
    item.distanceText = '';
    dataByDate.isShowPlan = false;
    setReload(e => !e);
  };
  const handleSelectPlanData = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dataByDate.isShowPlan = dataByDate.isShowPlan ? false : true;
    setMutate(e => !e);
  };

  return (
    <View
      style={{
        borderRadius: 8,
        borderWidth: 0.6,
        borderColor: appcolor.primary,
        padding: 4,
        margin: 4,
      }}
    >
      <View
        style={{
          borderRadius: 50,
          width: 40,
          height: 40,
          borderWidth: 0.8,
          borderColor: appcolor.primary,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 4,
          right: 8,
          zIndex: 1000,
        }}
      >
        <Text
          style={{ fontWeight: '700', fontSize: 14, color: appcolor.primary }}
        >
          {index + 1}
        </Text>
      </View>

      {/* <View key={'dateBusiness'} style={{ width: '100%', borderRadius: 5, paddingBottom: 8, paddingTop: 50, paddingHorizontal: 8, alignItems: 'center' }}>
                <FormGroup
                    containerStyle={{ width: '100%', borderRadius: 5 }}
                    inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.greylight }}
                    // title={`Ngày đến địa điểm công tác ${item.dayAndNight}`}
                    iconRight='calendar-alt'
                    placeholder={'Ngày đến địa điểm công tác '}
                    value={item.arrivedDay ? moment(item.arrivedDay).format('YYYY/MM/DD') : null}
                    rightFunc={handleSelectDate}
                />
                {item.loadCalendar && <CalendarSelected
                    onChangeData={handlerWorkingDate}
                    isBetween={false}
                    lockOutMonth={config?.isLockOutMonth == 0 ? false : true}
                    minDate={moment(itemTrips.fromDate, 'YYYYMMDD').format('YYYY-MM-DD') || null}
                    maxDate={moment(itemTrips.toDate, 'YYYYMMDD').format('YYYY-MM-DD') || null}
                />}
            </View> */}
      <TouchableOpacity
        onPress={() => handleSelectPlanData()}
        style={{
          width: '80%',
          padding: 8,
          justifyContent: 'center',
          flexDirection: 'row',
          marginVertical: 4,
          marginHorizontal: 8,
          borderRadius: 8,
          shadowOpacity: 0.5,
          elevation: 3,
          backgroundColor: appcolor.info,
          shadowColor: appcolor.dark,
          shadowOffset: { width: 3, height: 0 },
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            textAlign: 'center',
            fontSize: 14,
            color: appcolor.white,
          }}
        >
          {dataByDate.isShowPlan
            ? 'Đóng'
            : 'Mở danh sách shop (' + (dataByDate.dataPlan.length || 0) + ')'}
        </Text>
      </TouchableOpacity>
      {quotaData.isUsePlanSystem == 1 &&
        dataByDate.isShowPlan == true &&
        dataByDate.dataPlan?.length > 0 && (
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {dataByDate.dataPlan.map((it, idx) => {
              return (
                <TouchableOpacity
                  key={`listTrip_${item.arrivedDay}_${idx}`}
                  onPress={() => handlePressCopy(it)}
                  style={{
                    flexDirection: 'row',
                    marginVertical: 4,
                    marginHorizontal: 8,
                    borderRadius: 8,
                    shadowOpacity: 0.5,
                    elevation: 3,
                    backgroundColor: appcolor.surface,
                    shadowColor: appcolor.dark,
                    shadowOffset: { width: 3, height: 0 },
                  }}
                >
                  <View style={{ padding: 8, width: '100%' }}>
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 14,
                        color: appcolor.dark,
                      }}
                    >
                      {it.shopName}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '500',
                        fontSize: 12,
                        color: appcolor.placeholderText,
                      }}
                    >
                      {it.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {/* <TouchableOpacity onPress={() => handleClosePlanSystem()} style={{
                        width: '80%', padding: 8, justifyContent: 'center',
                        flexDirection: 'row', marginVertical: 4, marginHorizontal: 8, borderRadius: 8,
                        shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.info,
                        shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }
                    }}>
                        <Text style={{ fontWeight: '700', textAlign: 'center', fontSize: 14, color: appcolor.white }}>Đóng</Text>
                    </TouchableOpacity> */}
          </View>
        )}
      <View style={{ width: '100%' }}>
        <AutoCompleteAddress
          isRequire
          isReload={isReload}
          titleName="Địa chỉ điểm đến"
          placeholder="Địa chỉ điểm đến"
          iconName="map-marker-alt"
          itemValue={item.addressPoint}
          typeFilter={TYPE.PROVINCE_FROM}
          borderInputColor={
            item.locationPoint != null && item.locationPoint?.length > 0
              ? appcolor.success
              : null
          }
          // searchAction={searchAddress}
          onChooseItem={handlerAddressChoose}
        />
        {item.distance !== null && item.distance > 0 && (
          <View style={{ width: '100%', paddingHorizontal: 8 }}>
            <Text
              style={{
                color: appcolor.success,
                textAlign: 'left',
                fontWeight: '700',
                fontSize: 12,
                paddingBottom: 4,
              }}
            >
              Khoảng cách từ điểm{' '}
              {index == 0
                ? 'Bắt đầu => ' +
                  (itemPoint.length == 1 ? 'Kết thúc' : 'điểm 1')
                : `${index} => điểm ${index + 1}`}{' '}
              : {item.distanceText}{' '}
            </Text>
            <Text
              style={{
                color: appcolor.primary,
                textAlign: 'left',
                fontWeight: '700',
                fontSize: 12,
              }}
            >
              Tổng khoảng cách tạm tính :{' '}
              {Math.round(item.distance / 1000) +
                (item.numberStore || 0) * (quotaData.kmDefault || 5)}{' '}
              km{' '}
            </Text>
          </View>
        )}
      </View>
      <ItemInput
        typeFilter={TYPE.TYPE_STORE}
        keyboardType="numeric"
        isRequire
        titleName={`Số lượng cửa hàng`}
        placeholder={`Tổng số lượng cửa hàng sẽ đi tại điểm đến`}
        iconName="store"
        itemValue={valueItem(item.numberStore)}
        onChangeText={handlerItemChangeText}
      />

      <ItemInput
        // isRequire
        key={`${TYPE.TYPE_NOTE}`}
        titleName="Ghi chú"
        placeholder="Nội dung ghi chú"
        iconName="comment"
        typeFilter={TYPE.TYPE_NOTE}
        itemValue={item.note}
        onChangeText={handlerItemChangeText}
      />

      {/* <Text style={{ width: '100%', paddingHorizontal: 8, color: appcolor.info, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Thông tin lưu trú</Text> */}
      {/* <View key={`ViewPointDay`} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', padding: 5 }}>
                <FormGroup
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    containerStyle={{ width: '45%', borderRadius: 8, marginBottom: 0, padding: 0, backgroundColor: 'transparent' }}
                    inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
                    editable
                    defaultValue={item.numberDay?.toString() || null}
                    placeholder={`Đêm lưu trú`}
                    useClearAndroid={false}
                    handleChangeForm={onEditValue}
                />
                <FormGroup
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    containerStyle={{ width: '45%', borderRadius: 8, marginBottom: 0, padding: 0, marginStart: 8, backgroundColor: 'transparent' }}
                    inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
                    editable
                    defaultValue={item.eatDay?.toString() || null}
                    placeholder={`Ngày ăn`}
                    useClearAndroid={false}
                    handleChangeForm={onEditEatValue}
                />
            </View> */}

      {/* <View key={`ViewPointCost_` + index} style={{ width: '100%', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', padding: 8 }}>
                {
                    ((item.numberDay !== null && item.numberDay >= 0) || (item.eatDay !== null && item.eatDay >= 0)) &&
                    <Text style={{ width: '100%', paddingTop: 8, color: appcolor.info, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Chi phí</Text>
                }
                {
                    item.numberDay !== null && item.numberDay >= 0 &&
                    <ItemInput
                        typeFilter={TYPE.TYPE_NIGTH_REST}
                        keyboardType="numeric"
                        isRequire
                        titleName={`Chi phí khách sạn (${item.numberDay} Đêm)`}
                        placeholder={`Tổng tiền khách sạn / nhà nghỉ`}
                        iconName='hotel'
                        itemValue={valueItem(item.nightRestValue)}
                        onChangeText={handlerItemChangeText}
                    />
                }
                {
                    item.eatDay !== null && item.eatDay >= 0 &&
                    <ItemInput
                        typeFilter={TYPE.TYPE_LUNCH}
                        keyboardType="numeric"
                        isRequire
                        editable={false}
                        titleName={`Chi phí ăn uống (${item.eatDay} Ngày)`}
                        placeholder={`Tổng chi phí ăn uống (${item.eatDay} Ngày)`}
                        iconName='utensils'
                        itemValue={valueItem(item.foodCostPoint)}
                    // onChangeText={handlerItemChangeText}
                    />
                }
                {
                    ((typeVehicle?.code == 'DRIVING' && item.eatDay !== null && item.eatDay >= 0 && item.distance > 0)
                        || (typeVehicle?.code !== 'DRIVING' && item.eatDay !== null && item.eatDay >= 0)) &&
                    <ItemInput
                        typeFilter={TYPE.TYPE_VEHICAL}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí di chuyển'
                        placeholder={`Tổng chi phí di chuyển (${item.eatDay} Ngày)`}
                        iconName='car'
                        itemValue={valueItem(item.vehicalValue)}
                        onChangeText={handlerItemChangeText}
                        editable={typeVehicle?.code == 'DRIVING' ? false : true}
                    />
                }
            </View> */}
    </View>
  );
};
