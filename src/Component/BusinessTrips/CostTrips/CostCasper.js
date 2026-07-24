import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import {
  GetDataMasterBusiness,
  GetPlanBusiness,
} from '../../../Controller/BussinessTripController';
import { formatNumber } from '../../../Core/Helper';
import { alertWarning, deviceHeight, isValid } from '../../../Core/Utility';
import { HeaderBusiness } from '../HeaderBusiness';
import { getBusinesDataSupport, MODE, TYPE } from '../UtilityBusiness';
import _ from 'lodash';
import { ACTION } from '../../../Core/ReduxController';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MutipleItemSelected } from '../../../Control/MutipleItemSelected';
import { SetBusinesTrips } from '../../../Redux/action';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const CostCasper = ({ onBack, onNext }) => {
  const { appcolor, tripResult, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [typeArrow, setTypeArrow] = useState({
    titleHeader: `Hạn mức ${formatNumber(tripResult.moneyLimit, ',')} VNĐ`,
    typeBack: 'arrow-back',
    typeForward: 'playlist-add-check',
    isHighLight: false,
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [dataKilomet, setDataKilomet] = useState([]);
  const [dataPeople, setDataPeople] = useState([]);
  const [dataPlan, setDataPlan] = useState([]);
  const [itemCost, setItemCost] = useState({
    workingKm: tripResult.workingKm || '[]',
    typeKM: tripResult.typeKM || null,
    numberForTypeKM: tripResult.numberForTypeKM || null,
    typePeople: tripResult.typePeople || null,
    priceForPeople: tripResult.priceForPeople || 0,
    kmValue: tripResult.kmValue || 0,
    supportKM: tripResult.supportKM || 0,
    vehicalOtherValue: tripResult.supportVehicalOther || 0,
    nightRestValue: tripResult.supportNight || 0,
    lunchValue: tripResult.supportLunch || tripResult.dayValue * 150000,
    dinnerValue: tripResult.supportDinner || 0,
  });
  const LoadData = async () => {
    await GetDataMasterBusiness('WorkingScheduleKM', async mData => {
      await setDataKilomet(mData);
    });
    await GetDataMasterBusiness('PeopleInRoom', async mData => {
      await setDataPeople(mData);
    });
    await LoadPlanBusiness();
    await setItemCost(itemCost);
    await handlerMoneyLimit(itemCost);
  };
  const LoadPlanBusiness = async () => {
    if (tripResult.workingKm !== null && tripResult.workingKm !== undefined) {
      await setDataPlan(JSON.parse(tripResult.workingKm));
    } else {
      await setLoading(true);
      await GetPlanBusiness(
        tripResult.fromDate,
        tripResult.toDate,
        async mData => {
          await setDataPlan(mData);
        },
      );
      await setLoading(false);
    }
  };
  const handlerMoneyLimit = async itemUpdate => {
    const costResult = await getBusinesDataSupport(itemUpdate);
    const moneyLimit = tripResult.moneyLimit - costResult.totalSupport;
    await setTypeArrow({
      ...typeArrow,
      titleHeader: `Hạn mức ${moneyLimit == 0 ? 0 : formatNumber(moneyLimit, ',')
        } VNĐ`,
      isHighLight: moneyLimit < 0,
    });
  };
  const handlerItemChangeText = async (text, typeItem) => {
    const valueInput =
      text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null;
    const isInProvince =
      tripResult.provinceCodeFrom == tripResult.provinceCodeTo;

    let itemUpdate = {};
    switch (typeItem) {
      case TYPE.TYPE_KM:
        itemUpdate = {
          ...itemCost,
          supportKM: valueInput,
          vehicalOtherValue: isInProvince ? 0 : itemCost.vehicalOtherValue,
        };
        break;
      case TYPE.TYPE_VEHICAL_OTHER:
        itemUpdate = {
          ...itemCost,
          vehicalOtherValue: valueInput,
          supportKM: isInProvince ? 0 : itemCost.supportKM,
        };
        break;
      case TYPE.TYPE_NIGTH_REST:
        itemUpdate = { ...itemCost, nightRestValue: valueInput };
        break;
      case TYPE.TYPE_LUNCH:
        itemUpdate = { ...itemCost, lunchValue: valueInput };
        break;
      case TYPE.TYPE_DINNER:
        itemUpdate = { ...itemCost, dinnerValue: valueInput };
        break;
      default:
        itemUpdate = itemCost;
        break;
    }
    await setItemCost(itemUpdate);
    await handlerMoneyLimit(itemUpdate);
  };
  const handlerItemChoose = async (item, typeItem) => {
    let itemUpdate = {};
    switch (typeItem) {
      case TYPE.TYPE_KM_DISTANCE:
        itemUpdate = {
          ...itemCost,
          typeKM: item.itemName,
          numberForTypeKM: item.isRequired,
          typePeople: item.id == 1 ? null : itemCost.typePeople,
          nightRestValue: item.id == 1 ? 0 : itemCost.nightRestValue,
        };
        break;
      default:
        itemUpdate = itemCost;
        break;
    }
    await setItemCost(itemUpdate);
  };
  const handlerMasterItem = async item => {
    const restValue = item.numberValue * tripResult.nightValue;
    const itemUpdate = {
      ...itemCost,
      typePeople: item.itemName,
      priceForPeople: item.numberValue,
      nightRestValue: restValue,
    };
    await setItemCost(itemUpdate);
    await handlerMoneyLimit(itemUpdate);
  };
  const handlerPlanBusiness = async (text, index) => {
    const dataUpdate = dataPlan;
    dataUpdate[index].numberKm = text;
    const itemUpdate = { ...itemCost, workingKm: JSON.stringify(dataPlan) };
    await setItemCost(itemUpdate);
    await setDataPlan(dataUpdate);
  };
  const handlerTripResult = async () => {
    await checkInputData(async (isSuccess, message) => {
      if (isSuccess) {
        const costResult = await getBusinesDataSupport(
          itemCost,
          userinfo.groupType,
        );
        if (costResult.totalSupport == 0) {
          alertWarning(`Chi phí công tác phải lớn hơn 0`);
          return;
        }
        const totalCostView = tripResult.moneyLimit - costResult.totalSupport;
        if (totalCostView < 0) {
          alertWarning(`Quá hạn mức vui lòng cân đối lại chi phí`);
          return;
        }
        const itemTripResult = await _.merge(tripResult, costResult);
        // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: itemTripResult })
        await dispatch(SetBusinesTrips(itemTripResult));
        await onNext(MODE.COST);
      } else {
        alertWarning(message);
      }
    });
  };
  const checkInputData = actionDone => {
    let strValid = '';
    if (!isValid(itemCost.supportKM)) strValid += 'Chi phí di chuyển, ';
    if (!isValid(itemCost.nightRestValue)) strValid += 'Chi phí khách sạn, ';
    if (!isValid(itemCost.lunchValue)) strValid += 'Chi phí ăn uống, ';
    if (tripResult.provinceCodeFrom == tripResult.provinceCodeTo) {
      if (!isValid(itemCost.typeKM)) strValid += 'Số kilomet, ';
      if (!isValid(itemCost.typePeople) && itemCost.numberForTypeKM == 1)
        strValid += 'Số người/Phòng, ';
    } else {
      if (!isValid(itemCost.typePeople)) {
        strValid += 'Số người/Phòng, ';
      }
    }
    actionDone(
      strValid.length == 0,
      `Vui lòng nhập đầy đủ dữ liệu: ${strValid}`,
    );
  };
  const valueItem = value => {
    return value == 0 ? '0' : formatNumber(value, ',');
  };
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: deviceHeight,
      backgroundColor: appcolor.light,
    },
  });
  useEffect(() => {
    LoadData();
    return () => false;
  }, []);
  return (
    <View style={styles.mainContainer}>
      <HeaderBusiness
        isHighLight={typeArrow.isHighLight}
        typeArrow={typeArrow}
        onBack={() => onBack(MODE.COST)}
        onForward={handlerTripResult}
      />
      <ScrollView
        style={{ width: '100%', height: deviceHeight }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: '100%', height: '100%' }}
          extraHeight={deviceHeight / 4}
          enableOnAndroid
        >
          {tripResult.provinceCodeFrom == tripResult.provinceCodeTo ? (
            <ItemInput
              checkMaxValue
              key={TYPE.TYPE_KM}
              typeFilter={TYPE.TYPE_KM}
              keyboardType="numeric"
              isRequire
              titleName={`Chi phí di chuyển (Nội tỉnh) (${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm)`}
              placeholder={`Tổng chi phí di chuyển - Hạn mức: 150,000 VNĐ/Ngày`}
              iconName="road"
              maxValue={tripResult.dayValue * 150000}
              itemValue={valueItem(itemCost.supportKM)}
              onChangeText={handlerItemChangeText}
            />
          ) : (
            <ItemInput
              key={TYPE.TYPE_KM}
              typeFilter={TYPE.TYPE_KM}
              keyboardType="numeric"
              isRequire
              titleName={`Chi phí di chuyển (Ngoại tỉnh) (${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm)`}
              placeholder={`Tổng chi phí di chuyển (Xe máy) - Tạm tính`}
              iconName="road"
              itemValue={valueItem(itemCost.supportKM)}
              onChangeText={handlerItemChangeText}
            />
          )}
          <ItemInput
            key={TYPE.TYPE_VEHICAL_OTHER}
            typeFilter={TYPE.TYPE_VEHICAL_OTHER}
            keyboardType="numeric"
            titleName="Phương tiện khác"
            placeholder="Di chuyển bằng phương tiện khác (Tàu,xe khách,máy bay,...)"
            iconName="car"
            itemValue={valueItem(itemCost.vehicalOtherValue)}
            onChangeText={handlerItemChangeText}
          />
          {tripResult.provinceCodeFrom == tripResult.provinceCodeTo && (
            <View>
              <MutipleItemSelected
                iconName="road"
                isRequire
                titleName="Số kilomet"
                typeItem={TYPE.TYPE_KM_DISTANCE}
                dataItems={dataKilomet}
                defaultValue={itemCost.typeKM}
                onItemChoose={handlerItemChoose}
              />
            </View>
          )}
          {((tripResult.provinceCodeFrom == tripResult.provinceCodeTo &&
            itemCost.typeKM == 'Từ 100km') ||
            tripResult.provinceCodeFrom !== tripResult.provinceCodeTo) && (
              <ItemInput
                checkMaxValue
                key={TYPE.TYPE_NIGTH_REST}
                typeFilter={TYPE.TYPE_NIGTH_REST}
                keyboardType="numeric"
                isRequire
                titleName="Chi phí khách sạn"
                placeholder={`Tổng tiền khách sạn - Hạn mức: ${valueItem(
                  itemCost.priceForPeople,
                )} VNĐ/Đêm`}
                iconName="hotel"
                itemValue={valueItem(itemCost.nightRestValue)}
                maxValue={tripResult.nightValue * itemCost.priceForPeople}
                masterValue={itemCost.typePeople}
                masterData={dataPeople}
                masterChoose={handlerMasterItem}
                onChangeText={handlerItemChangeText}
              />
            )}
          <ItemInput
            checkMaxValue
            key={TYPE.TYPE_LUNCH}
            typeFilter={TYPE.TYPE_LUNCH}
            keyboardType="numeric"
            isRequire
            titleName="Chi phí ăn uống"
            placeholder={`Tổng chi phí ăn uống - Hạn mức: 150,000 VNĐ/Ngày`}
            iconName="utensils"
            maxValue={tripResult.dayValue * 150000}
            itemValue={valueItem(itemCost.lunchValue)}
            onChangeText={handlerItemChangeText}
          />
          {/* <PlanBusiness
                            isRequire
                            iconName={'calendar-alt'}
                            titleName={'Kế hoạch công tác'}
                            dataPlan={dataPlan}
                            isLoading={loading}
                            changeItemPlan={handlerPlanBusiness}
                        /> */}
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
  masterData = [],
  masterChoose,
  masterValue = null,
  checkMaxValue = false,
  maxValue = 0,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isError, setIsError] = useState({ value: false, title: null });
  const widthItem = onActionRight !== undefined ? '90%' : '100%';
  const styles = StyleSheet.create({
    mainItem: { padding: 8, marginBottom: 1 },
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
    const textInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : 0;
    if (checkMaxValue) {
      if (textInput > 0 && maxValue > 0 && textInput > maxValue) {
        setIsError({
          value: true,
          title: `Bạn nhập quá hạn mức cho phép: ${formatNumber(
            maxValue,
            ',',
          )} VNĐ`,
        });
        return;
      }
    }
    setIsError({ value: false, title: null });
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
      <Text
        style={{
          ...styles.placeholderHeader,
          color: isError.value ? appcolor.red : appcolor.placeholderText,
        }}
      >{`${isError.value ? isError.title : placeholder} `}</Text>
      {masterData.length > 0 && (
        <MutipleItemSelected
          containerStyle={{ paddingTop: 0 }}
          typeItem={typeFilter}
          defaultValue={masterValue}
          dataItems={masterData}
          onItemChoose={masterChoose}
        />
      )}
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <FormGroup
          selectTextOnFocus
          isSecure
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
const PlanBusiness = ({
  dataPlan,
  iconName,
  titleName,
  isRequire,
  isLoading,
  changeItemPlan,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    mainContainer: { padding: 8, marginBottom: 1, zIndex: 10 },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    titleDate: {
      color: appcolor.highlightDate,
      fontSize: 14,
      fontWeight: '600',
      padding: 8,
      width: '75%',
    },
    titleShop: { color: appcolor.dark, fontSize: 13, fontWeight: '300' },
  });
  const renderItem = (item, index) => {
    const lstShop = JSON.parse(item.planList) || [];
    const onItemChange = text => {
      item.numberKm = text;
      changeItemPlan(text, index);
    };
    return (
      <View key={`sl_item_${index}`} style={{ width: '100%' }}>
        <View style={{ width: '100%', flexDirection: 'row', padding: 8 }}>
          <Text style={styles.titleDate}>{`${item.dateView}`}</Text>
          <FormGroup
            editable
            inputStyle={{ textAlign: 'center', fontSize: 13 }}
            containerStyle={{
              width: '25%',
              alignSelf: 'center',
              padding: 3,
              marginBottom: 0,
              borderRadius: 5,
              borderColor: appcolor.grey,
            }}
            placeholder="Km"
            keyboardType="numeric"
            useClearAndroid={false}
            defaultValue={item.numberKm}
            handleChangeForm={onItemChange}
          />
        </View>
        {lstShop.length > 0 &&
          lstShop.map((it, idx) => {
            return (
              <View
                key={`idx_${idx}`}
                style={{
                  backgroundColor: appcolor.surface,
                  marginBottom: 3,
                  borderRadius: 5,
                  padding: 5,
                  width: '100%',
                }}
              >
                <Text
                  style={styles.titleShop}
                >{`Cửa hàng: ${it.shopName}`}</Text>
              </View>
            );
          })}
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          marginBottom: 5,
          alignItems: 'center',
        }}
      >
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
        {isLoading && (
          <ActivityIndicator style={{ position: 'absolute', end: 8 }} />
        )}
      </View>
      {!isLoading && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ height: deviceHeight }}
        >
          {dataPlan.map((item, index) => {
            return renderItem(item, index);
          })}
        </ScrollView>
      )}
    </View>
  );
};
