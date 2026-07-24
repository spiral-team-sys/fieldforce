import React, { useEffect, useState } from 'react';
import { style, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { MutipleItemSelected } from '../../Control/MutipleItemSelected';
import { GetProvinceByShop } from '../../Controller/BussinessTripController';
import { GetStoreReport } from '../../Controller/ShopController';
import { ToastError } from '../../Core/Helper';
import { alertConfirm } from '../../Core/Utility';
import {
  GetItemCapacity,
  UpdateItemCapacity,
  uploadItemCapacity,
} from '../../Controller/CapacityController';
import { LoadingView } from '../../Control/ItemLoading';
import moment from 'moment';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const TYPE = {
  PROVINCE: 'Province',
  STORE: 'Store',
  CAPACITY: 'CapacityValue',
  NOTE: 'Note',
};
export const CapacityReport = ({ navigation, route }) => {
  const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(
    state => state.GAppState,
  );
  const [loading, setLoading] = useState(false);
  const [dataProvince, setDataProvince] = useState({ view: [], main: [] });
  const [dataStore, setDataStore] = useState({ view: [], main: [] });
  const [itemCapacity, setItemCapacity] = useState({
    workDate: workinfo.workDate,
    provinceCode: 0,
    provinceName: null,
    shopId: shopinfo.shopId || 0,
    shopName: shopinfo.shopName || null,
    capacityValue: null,
    noteValue: null,
    type: (shopinfo?.shopId || 0) > 0 ? 'DAILY' : 'MONTHLY',
    isUploaded: 0,
  });

  const LoadData = async () => {
    await setLoading(true);
    await GetProvinceByShop(async mData => {
      await setDataProvince({ view: mData, main: mData });
    });
    await GetStoreReport(async mData => {
      await setDataStore({ view: mData, main: mData });
    });
    await GetItemCapacity(workinfo, async item => {
      let day = parseInt(moment(new Date()).format('YYYYMMDD'));
      await setItemCapacity({
        ...itemCapacity,
        capacityValue: item.capacityValue,
        noteValue: item.note,
        isUploaded: workinfo.workDate === day ? item.isUploaded : 1,
      });
    });
    await setLoading(false);
  };
  const uploadData = async () => {
    if (itemCapacity.capacityValue == null) {
      ToastError('Bạn chưa nhập số Capacity');
      return;
    }
    alertConfirm(
      'Gửi báo cáo',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        await setLoading(true);
        await uploadItemCapacity(
          itemCapacity,
          { ...workinfo, reportId: kpiinfo.id },
          async () => {
            await LoadData();
          },
        );
      },
    );
  };
  const handlerSelectItem = async (item, type) => {
    switch (type) {
      case TYPE.PROVINCE:
        await setItemCapacity({
          ...itemCapacity,
          provinceCode: item.provinceCode,
          provinceName: item.provinceName,
        });
        const filterStore = dataStore.main.filter(
          i => i.provinceCode == item.provinceCode,
        );
        await setDataStore({ ...dataStore, view: filterStore });
        break;
      case TYPE.STORE:
        await setItemCapacity({
          ...itemCapacity,
          shopId: item.shopId,
          shopName: item.shopName,
        });
        break;
    }
  };
  const handlerItemChangeText = async (text, typeItem) => {
    if (typeItem == TYPE.CAPACITY) {
      await setItemCapacity({ ...itemCapacity, capacityValue: parseInt(text) });
      await UpdateItemCapacity({
        ...itemCapacity,
        capacityValue: parseInt(text),
      });
    }
    if (typeItem == TYPE.NOTE) {
      await setItemCapacity({ ...itemCapacity, noteValue: text });
      await UpdateItemCapacity({ ...itemCapacity, noteValue: text });
    }
  };
  useEffect(() => {
    LoadData();
    return () => false;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentView: { backgroundColor: appcolor.light },
  });
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route?.params?.menuitem?.menuNameVN || kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        leftFunc={() => navigation.goBack()}
        rightFunc={itemCapacity.isUploaded == 1 ? null : uploadData}
      />
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      {(shopinfo?.shopId || 0) == 0 && (
        <View style={{ width: '100%' }}>
          <MutipleItemSelected
            typeItem={TYPE.PROVINCE}
            containerStyle={{ flexGrow: 0 }}
            isFilter={dataProvince.main.length > 5}
            isRequire
            titleName="Tỉnh / Thành phố"
            iconName="map-marker-alt"
            dataItems={dataProvince.view}
            defaultValue={itemCapacity.provinceName}
            onItemChoose={handlerSelectItem}
          />
          <MutipleItemSelected
            typeItem={TYPE.STORE}
            containerStyle={{ flexGrow: 0 }}
            isFilter={dataStore.main.length > 3}
            isRequire
            titleName="Danh sách cửa hàng"
            iconName="store"
            dataItems={dataStore.view}
            defaultValue={itemCapacity.shopName}
            onItemChoose={handlerSelectItem}
          />
        </View>
      )}
      <View style={styles.contentView}>
        <ItemInput
          isEditable={itemCapacity.isUploaded !== 1}
          keyboardType="numeric"
          isRequire
          titleName="Số Capacity"
          iconName="keyboard"
          itemValue={(itemCapacity.capacityValue || '').toString()}
          typeFilter={TYPE.CAPACITY}
          onChangeText={handlerItemChangeText}
        />
        <ItemInput
          isEditable={itemCapacity.isUploaded !== 1}
          isRequire
          titleName="Ghi chú"
          iconName="keyboard"
          itemValue={itemCapacity.noteValue}
          typeFilter={TYPE.NOTE}
          onChangeText={handlerItemChangeText}
        />
      </View>
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
  isEditable = true,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
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
      {placeholder && (
        <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
      )}
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <FormGroup
          keyboardType={keyboardType}
          containerStyle={styles.inputView}
          editable={isEditable}
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
