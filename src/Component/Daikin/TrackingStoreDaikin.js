import React, { useEffect, useState } from 'react';
import { FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { isPhone, ToastError, ToastSuccess } from '../../Core/Helper';
import {
  GetListTrackingStore,
  uploadTrackingStore,
} from '../../Controller/TrackingDetailController';
// //import NumberFormat from "react-number-format";
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import _ from 'lodash';
import {
  deviceHeight,
  deviceWidth,
  minWidthTab,
  removeAccents,
} from '../../Core/Utility';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { RegionMain } from '../../Control/RegionControl/RegionMain';
import { Icon } from '@rneui/themed';
import { LoadingView } from '../../Control/ItemLoading';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const TrackingStoreDaikin = ({ navigation, route }) => {
  const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(
    state => state.GAppState,
  );
  const [data, setData] = useState({ dataListMaster: [], dataGroup: [] });
  const [itemShop, setItemShop] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(0);

  const loadData = async () => {
    await setLoading(true);
    await GetListTrackingStore(
      shopinfo.shopId,
      kpiinfo.id,
      async dataTracking => {
        let day = parseInt(moment(new Date()).format('YYYYMMDD'));
        if (workinfo.workDate !== day) {
          await setStatus(1);
        }

        const groupTab = _.uniqBy(dataTracking?.table1 || [], 'groupId');
        await setData({
          dataListMaster: dataTracking.table1,
          dataGroup: groupTab,
        });
        await setItemShop(dataTracking.table[0]);
      },
    );
    await setLoading(false);
  };

  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const onNumberChanged = (item, text) => {
    if (item.decimalValue == 1) {
      const validator = /^[+-]?\d*(?:[.,]\d*)?$/;
      if (validator.test(text)) {
        text = text.replace(',', '.'); //this is optional
        itemShop[item.ref_Name] = text;
      } else {
        itemShop[item.ref_Name] = text.substring(0, text.length - 1);
      }
    } else {
      let value =
        text !== null && text.length > 0
          ? text.toString().replace(/,/g, '')
          : null;
      let intValue = value === null ? null : parseInt(value);
      if ((intValue > 0 || intValue === 0) && intValue != null) {
        itemShop[item.ref_Name] = intValue;
      } else {
        itemShop[item.ref_Name] = null;
      }
    }
  };

  const onTextChanged = (item, text) => {
    if (item.ref_Name.includes('VN')) {
      const fieldItem = item.ref_Name.replace('VN', '');
      itemShop[fieldItem] = removeAccents(text);
    }
    itemShop[item.ref_Name] = text;
  };
  const onSelectAddress = (item, itemRegion) => {
    itemShop[item.ref_Name] = itemRegion.regionId;
  };
  const onChangePhone = (item, text) => {
    if (text !== null) {
      let textValue = text
        .replace(/\D+/g, '')
        .replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
      if (text?.length == 11)
        textValue = text
          .replace(/\D+/g, '')
          .replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
      (!itemShop[item.ref_Name] || textValue == '' || textValue?.length < 12) &&
        (itemShop[item.ref_Name] = textValue);
    } else {
      itemShop[item.ref_Name] = null;
    }
  };

  const onCloseSheet = (item, dataSelect) => {
    const arrFilter = dataSelect.filter(it => it.isSelect == true);
    if (dataSelect.length > 0) {
      if (arrFilter.length > 0) {
        itemShop[item.ref_Name] = arrFilter[0].Id;
      } else {
        itemShop[item.ref_Name] = 0;
      }
    }
  };

  const uploadData = async () => {
    const checkPhone = isPhone(itemShop.phone);
    if (!checkPhone) {
      ToastError('Số điện thoại sai định dạng');
      return;
    }
    await uploadTrackingStore(shopinfo.shopId, itemShop, async result => {
      if (result.status == 200 || result.statusId == 200) {
        ToastSuccess(result.messeger);
        await loadData();
      } else ToastError(result.messeger);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor }}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN}
        iconMiddle="poll-h"
        iconRight="cloud-upload-alt"
        leftFunc={() => navigation.goBack()}
        rightFunc={status === 1 ? null : () => uploadData()}
      />
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      {data.dataGroup.length > 0 && !loading && (
        <View style={{ flex: 1 }}>
          <Tabs.Container
            pagerProps={{
              scrollEnabled: false,
            }}
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                style={{ margin: 5 }}
                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                indicatorStyle={{ backgroundColor: appcolor.transparent }}
                inactiveColor={appcolor.greylight}
                activeColor={appcolor.info}
                tabStyle={{
                  margin: 5,
                  borderRadius: 30,
                  backgroundColor: appcolor.surface,
                  minWidth: minWidthTab(data.dataGroup),
                  height: 38,
                }}
                scrollEnabled={true}
              />
            )}
            containerStyle={{ backgroundColor: appcolor.surface }}
          >
            {data.dataGroup?.map((it, i) => {
              let dataByGroup = _.filter(data.dataListMaster, item => {
                return item.groupId == it.groupId;
              });
              return (
                <Tabs.Tab
                  key={`itemssv_${i}`}
                  label={it.groupName}
                  name={it.groupName}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: appcolor.light,
                      marginTop: 62,
                      padding: 5,
                      width: deviceWidth,
                    }}
                  >
                    <ViewShopInfo
                      dataByGroup={dataByGroup}
                      onNumberChanged={onNumberChanged}
                      onChangePhone={onChangePhone}
                      onTextChanged={onTextChanged}
                      onSelectAddress={onSelectAddress}
                      itemShop={itemShop}
                      onCloseSheet={onCloseSheet}
                    />
                  </View>
                </Tabs.Tab>
              );
            })}
          </Tabs.Container>
        </View>
      )}
    </View>
  );
};

const ViewItemSelect = ({ dataSelect, handlerCloseSheet }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_, setMutate] = useState(false);

  const onSelectItem = item => {
    dataSelect.map(it => it.Id !== item.Id && (it.isSelect = false));
    item.isSelect = item.isSelect ? false : true;
    setMutate(e => !e);
    handlerCloseSheet();
  };

  const renderItemSelect = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelectItem(item)}
        style={{
          padding: 8,
          minHeight: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 50,
          marginBottom: 8,
          backgroundColor: item.isSelect ? appcolor.light : appcolor.surface,
          borderWidth: item.isSelect ? 1 : 0,
          borderColor: appcolor.tomato,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: item.isSelect ? appcolor.tomato : appcolor.dark,
            textAlign: 'center',
          }}
        >
          {item.Name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ padding: 5, paddingBottom: 30 }}>
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        data={dataSelect}
        renderItem={renderItemSelect}
      />
    </View>
  );
};
const RenderItemInput = ({
  item,
  index,
  itemShop,
  showListSelect,
  onNumberChanged,
  onTextChanged,
  onSelectAddress,
  reloadView,
  onChangePhone,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const handlerSelectItem = (itemRegion, type) => {
    if (itemRegion.townCode !== null) {
      onSelectAddress(item, itemRegion);
    }
  };
  const handlerOnChangeText = async text => {
    await onTextChanged(item, text);
    await reloadView();
  };
  const handlerOnChangeNumber = async text => {
    await onNumberChanged(item, text);
    await reloadView();
  };
  const handleChangePhone = async text => {
    await onChangePhone(item, text);
    await reloadView();
  };
  switch (item.ref_Code) {
    case 'number':
      return item.decimalValue == 0 ? (
        <NumberFormat
          key={`n${index}`}
          value={itemShop[item.ref_Name] ? itemShop[item.ref_Name] : ''}
          displayType={'text'}
          thousandSeparator
          renderText={value => (
            <FormGroup
              editable={true}
              key={index}
              returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
              placeholder={item.textValue || 'Số lượng'}
              value={itemShop[item.ref_Name]?.toString() || ''}
              inputStyle={{ textAlign: 'left' }}
              keyboardType="numeric"
              handleChangeForm={handlerOnChangeNumber}
              // onSubmitEditing={() => handlerTextInput(index, MasterList[index + 1] !== undefined ? MasterList[index + 1].ref_Id : 0)}
              returnKeyLabel={Platform.OS === 'ios' ? 'tiếp' : 'tiếp'}
              onClearTextAndroid={handlerOnChangeNumber}
            />
          )}
        />
      ) : (
        <FormGroup
          editable={true}
          key={index}
          returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
          placeholder={item.textValue || 'Số lượng'}
          value={itemShop[item.ref_Name]?.toString() || ''}
          inputStyle={{ textAlign: 'left' }}
          keyboardType="numeric"
          handleChangeForm={handlerOnChangeNumber}
          returnKeyLabel={Platform.OS === 'ios' ? 'tiếp' : 'tiếp'}
          onClearTextAndroid={handlerOnChangeNumber}
        />
      );
    case 'text':
      return (
        <View style={{ minHeight: 10, minWidth: 10 }}>
          <FormGroup
            editable={true}
            key={index}
            placeholder={item.textValue}
            containerStyle={{
              backgroundColor:
                item.upload === 1 ? appcolor.surface : appcolor.light,
              marginBottom: 5,
            }}
            value={itemShop[item.ref_Name] ? itemShop[item.ref_Name] : ''}
            inputStyle={{ textAlign: 'left' }}
            keyboardType="default"
            handleChangeForm={handlerOnChangeText}
            onClearTextAndroid={handlerOnChangeText}
          />
        </View>
      );
    case 'phone':
      return (
        <View style={{ minHeight: 10, minWidth: 10 }}>
          <FormGroup
            key={item.ref_Name}
            value={itemShop[item.ref_Name] ? itemShop[item.ref_Name] : ''}
            onClearTextAndroid={handleChangePhone}
            handleChangeForm={handleChangePhone}
            placeholder={item.textValue}
            keyboardType={'phone-pad'}
            maxLength={item.numberValue}
            editable={true}
          />
        </View>
      );
    case 'selected':
      const itemName = JSON.parse(item.filterList || '[]').find(
        it => it.Id == itemShop[item.ref_Name],
      )?.Name;
      return (
        <View
          style={{
            minHeight: 10,
            minWidth: 10,
            borderRadius: 10,
            backgroundColor: appcolor.surface,
          }}
        >
          <TouchableOpacity
            onPress={() => showListSelect(item)}
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 5,
            }}
          >
            <Text
              style={{
                width: '90%',
                fontSize: 14,
                fontWeight: '400',
                color: appcolor.dark,
                padding: 5,
              }}
            >
              {itemName}
            </Text>
            <SpiralIcon
              type="font-awesome-5"
              color={appcolor.dark}
              containerStyle={{ padding: 10 }}
              style={{ color: appcolor.dark }}
              name={'caret-down'}
              size={18}
            />
          </TouchableOpacity>
        </View>
      );
    case 'address':
      return (
        <View
          key={item.ref_Name + item.code}
          style={{ minHeight: 10, minWidth: 10 }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: appcolor.surface,
              padding: 5,
              marginBottom: 5,
            }}
          >
            <RegionMain
              typeFilter={'ADDRESS_FILTER'}
              isRequire
              regionId={itemShop.regionID}
              titleName="Lựa chọn địa chỉ"
              actionResult={handlerSelectItem}
            />
          </View>
        </View>
      );
    default:
      break;
  }
};

const ViewShopInfo = ({
  dataByGroup,
  itemShop,
  onTextChanged,
  onNumberChanged,
  onChangePhone,
  onSelectAddress,
  onCloseSheet,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [__, setMutate] = useState(false);
  const [dataSelect, setDataSelect] = useState([]);
  const [detailItemSelect, setDetailItemSelect] = useState({});
  const reloadView = () => {
    setMutate(e => !e);
  };

  const showListSelect = async item => {
    let listSelect = JSON.parse(item.filterList) || [];
    listSelect.map(it =>
      it.Id == itemShop[item.ref_Name]
        ? (it.isSelect = true)
        : (it.isSelect = false),
    );
    await setDataSelect(listSelect);
    await setDetailItemSelect(item);
    SheetManager.show('ref_SelectSheet');
  };

  const handlerCloseSheet = async () => {
    await onCloseSheet(detailItemSelect, dataSelect);
    await SheetManager.hide('ref_SelectSheet');
    await reloadView();
  };
  const renderItem = ({ item, index }) => {
    return (
      <View style={{ padding: 5 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: appcolor.dark,
            padding: 5,
          }}
        >
          {item.itemName}
        </Text>
        <RenderItemInput
          item={item}
          index={index}
          itemShop={itemShop}
          showListSelect={showListSelect}
          onNumberChanged={onNumberChanged}
          onTextChanged={onTextChanged}
          onChangePhone={onChangePhone}
          onSelectAddress={onSelectAddress}
          reloadView={reloadView}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={dataByGroup}
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: deviceHeight / 2 }} />}
      />
      {dataSelect.length > 0 ? (
        <ActionSheet
          id={'ref_SelectSheet'}
          gestureEnabled
          containerStyle={{ paddingBottom: insets.bottom }}
        >
          <ViewItemSelect
            dataSelect={dataSelect}
            appcolor={appcolor}
            handlerCloseSheet={handlerCloseSheet}
          />
        </ActionSheet>
      ) : null}
    </View>
  );
};
