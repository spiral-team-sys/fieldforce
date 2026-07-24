import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Platform,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { DisplayContext } from '../../../Controller/DisplayController';
import { Badge, Icon } from '@rneui/themed';
import { scaleSize } from '../../../Themes/AppsStyle';
import { isNotInteger, ToastError } from '../../../Core/Helper';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { deviceHeight, deviceWidth, minWidthTab } from '../../../Core/Utility';
import { LoadingView } from '../../../Control/ItemLoading';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const PRICE_VALUE = 1;
const NET_VALUE = 2;
const FSM_VALUE = 3;
const DISPLAY_VALUE = 4;
export const InputDisplay = ({ reload, upload, workinfo }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [refInput, nonSet] = useState({});
  const [colorInput, setColorInput] = useState([]);
  const [groupData, setGroup] = useState([]);
  const [showProgress, setProgress] = useState(false);

  //end search product
  const loadData = async () => {
    await setProgress(true);
    const res = await DisplayContext.DisplayGroup(workinfo);
    const result = await DisplayContext.DisplayTargetGetList(workinfo);
    await setData(result);
    await setGroup(res);
    await setTimeout(async () => {
      await setProgress(false);
    }, 100);
  };
  useEffect(() => {
    loadData();
    // console.log("useEffect")
    return () => false;
  }, []);

  const handerNumberChange = (item, e, type) => {
    let text = e !== null && e.length > 0 ? e.toString().replace(/,/g, '') : '';
    if (isNotInteger(text)) text = '';

    let intValue = text === '' ? null : parseInt(text);
    let itemEdit = {};
    switch (type) {
      case PRICE_VALUE:
        itemEdit = {
          ...item,
          displayValue: item.displayValue,
          priceValue: intValue,
          netValue: item.netValue,
          fsmValue: item.fsmValue,
        };
        break;
      case NET_VALUE:
        itemEdit = {
          ...item,
          displayValue: item.displayValue,
          priceValue: item.priceValue,
          netValue: intValue,
          fsmValue: item.fsmValue,
        };
        break;
      case FSM_VALUE:
        itemEdit = {
          ...item,
          displayValue: item.displayValue,
          priceValue: item.priceValue,
          netValue: item.netValue,
          fsmValue: intValue,
        };
        break;
      case DISPLAY_VALUE:
        itemEdit = {
          ...item,
          displayValue: intValue,
          priceValue: item.priceValue,
          netValue: item.netValue,
          fsmValue: item.fsmValue,
        };
        break;
    }
    DisplayContext.DTUpdateItem(itemEdit);
    const _listUpdate = [...data];
    const index = data.findIndex(v => v.productId === item.productId);
    _listUpdate[index] = itemEdit;
    setData(_listUpdate);
  };
  const checkFormatNumber = async (e, i, type, item) => {
    let mPrice = 0;
    let value = e.nativeEvent.text;
    if (value == '') {
      mPrice = null;
    } else {
      let text =
        value !== null && value.length > 0
          ? value.toString().replace(/,/g, '')
          : 'null';
      mPrice = text === '' ? null : parseInt(text);
    }

    let foundValue = colorInput.filter(
      obj =>
        obj.index === i &&
        obj.type === type &&
        obj.categoryName === item.categoryName,
    );

    if (mPrice % 1000 > 0 || mPrice == null) {
      let textAlert = '';
      let itemEdit = {};
      switch (type) {
        case PRICE_VALUE:
          itemEdit = {
            ...item,
            priceValue: null,
          };
          textAlert = 'Niêm yết';
          break;
        case NET_VALUE:
          itemEdit = {
            ...item,
            netValue: null,
          };
          textAlert = 'Thực bán';
          break;
        case FSM_VALUE:
          itemEdit = {
            ...item,
            fsmValue: null,
          };
          textAlert = 'Tiền thưởng';
          break;
      }
      if (foundValue == '')
        setColorInput(data => [
          ...data,
          { type: type, index: i, categoryName: item.categoryName },
        ]);

      DisplayContext.DTUpdateItem(itemEdit);
      const _listUpdate = [...data];
      const index = data.findIndex(v => v.productId === item.productId);
      _listUpdate[index] = itemEdit;
      setData(_listUpdate);
      if (mPrice == null) {
        ToastError(
          'Sản phẩm thứ ' +
          (i + 1) +
          ' : ' +
          item.productName +
          '\nMục : ' +
          textAlert +
          '\nBạn chưa nhập giá trị!',
          'error',
          'top',
        );
      } else if (mPrice >= 1000) {
        ToastError(
          'Sản phẩm thứ ' +
          (i + 1) +
          ' : ' +
          item.productName +
          '\nMục ' +
          textAlert +
          '\nSố tiền không được lẻ, vui lòng nhập lại!',
          'error',
          'top',
        );
      } else {
        ToastError(
          'Sản phẩm thứ ' +
          (i + 1) +
          ' : ' +
          item.productName +
          '\nMục ' +
          textAlert +
          '\nNhập sai định dạng, vui lòng nhập lại!',
          'error',
          'top',
        );
      }
    } else {
      let foundValue = colorInput.filter(
        obj => obj.index !== i || obj.type !== type,
      );
      setColorInput(foundValue);
    }
  };
  const colorInputError = (index, type, item) => {
    let color = null;
    const dataColor = colorInput.find(
      obj =>
        obj.index === index &&
        obj.type === type &&
        obj.categoryName === item.categoryName,
    );
    if (upload) {
      color = appcolor.lightgray;
    } else {
      if (
        dataColor == undefined ||
        (dataColor.type != type &&
          dataColor.index != index &&
          dataColor.categoryName != item.categoryName)
      ) {
        color = appcolor.light;
      } else {
        color = appcolor.warning;
      }
    }
    return color;
  };

  const removeAdd = async item => {
    await DisplayContext.removeAdd(item);
    const dataFilter = data.filter(it => it.id !== item.id);
    await setData(dataFilter);
  };

  const onCheckChanged = (item, e) => {
    let itemEdit = { ...item };
    itemEdit.popValue = e;
    DisplayContext.DTUpdateItem(itemEdit);
    const _listUpdate = [...data];
    const index = data.findIndex(v => v.productId === item.productId);
    _listUpdate[index] = itemEdit;
    setData(_listUpdate);
  };
  const renderRow = ({ item, index }) => {
    const totalRow = item.totalRow;
    return (
      <View
        key={'dss' + index}
        style={{
          padding: 5,
          borderRadius: 8,
          marginBottom: 7,
          backgroundColor: appcolor.light,
        }}
      >
        <View style={{ padding: 3, flex: 1, flexDirection: 'row' }}>
          <Badge status="warning" value={index + 1} />
          <Text
            style={{
              marginStart: 3,
              fontSize: 14,
              fontWeight: 'bold',
              color: appcolor.dark,
            }}
          >
            {item.productName}
          </Text>
        </View>
        <View style={{ padding: 3, flex: 1, flexDirection: 'row' }}>
          <Text
            style={{
              color: appcolor.dark,
              opacity: 0.8,
              fontSize: 12,
              fontStyle: 'italic',
            }}
          >
            {item.subCategory} {item.segment} {item.subCategories}
          </Text>
        </View>
        <View style={{ width: '100%', alignItems: 'flex-end' }}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexGrow: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ textAlignVertical: 'bottom', color: appcolor.dark }}
                >
                  POP{' '}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    disabled={upload ? true : false}
                    onPress={() => onCheckChanged(item, 1)}
                    style={{ padding: 7, marginEnd: 7 }}
                  >
                    <Text style={{ color: appcolor.dark }}>Đủ</Text>
                    <SpiralIcon
                      size={28}
                      type="font-awesme-5"
                      name={item.popValue === 1 ? 'check-circle' : 'circle'}
                      color={
                        item.popValue === 1 ? appcolor.primary : appcolor.dark
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={upload ? true : false}
                    onPress={() => onCheckChanged(item, 0)}
                    style={{ padding: 7 }}
                  >
                    <Text style={{ color: appcolor.dark }}>Thiếu</Text>
                    <SpiralIcon
                      type="font-awesme-5"
                      size={28}
                      name={item.popValue === 0 ? 'check-circle' : 'circle'}
                      color={
                        item.popValue === 0 ? appcolor.danger : appcolor.dark
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {!upload && (
                <TouchableOpacity
                  onPress={() => removeAdd(item)}
                  style={{
                    padding: 7,
                    display: item.addMore ? 'flex' : 'none',
                    flex: 1,
                  }}
                >
                  <SpiralIcon
                    name="minus-circle"
                    type="font-awesome-5"
                    color={appcolor.danger}
                  />
                </TouchableOpacity>
              )}
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={e => handerNumberChange(item, e, DISPLAY_VALUE)}
                  autoCapitalize="none"
                  ref={e => (refInput[index] = e)}
                  selectTextOnFocus
                  placeholder="Số lượng"
                  placeholderTextColor={appcolor.placeholderText}
                  editable={!upload}
                  key={item.productId}
                  maxlength={8}
                  defaultValue={
                    item.displayValue === null || isNaN(item.displayValue)
                      ? ''
                      : item.displayValue
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    // item.displayValue.toLocaleString("en-US")
                  }
                  blurOnSubmit={false}
                  autoCorrect={false}
                  onSubmitEditing={() => {
                    totalRow - 1 === index
                      ? Keyboard.dismiss()
                      : refInput[index + 1]?.focus();
                  }}
                  returnKeyType={Platform.OS === 'android' ? 'next' : 'done'}
                  style={{
                    backgroundColor: upload
                      ? appcolor.lightgray
                      : appcolor.light,
                    width: '90%',
                    marginTop: 10,
                    padding: 7,
                    borderColor: appcolor.dark,
                    borderWidth: 0.51,
                    fontSize: scaleSize(14),
                    color: appcolor.dark,
                    textAlign: 'right',
                  }}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={e => handerNumberChange(item, e, PRICE_VALUE)}
                  onEndEditing={event =>
                    checkFormatNumber(event, index, PRICE_VALUE, item)
                  }
                  autoCapitalize="none"
                  ref={e => (refInput[index] = e)}
                  selectTextOnFocus
                  placeholder="Giá"
                  placeholderTextColor={appcolor.placeholderText}
                  editable={!upload}
                  key={item.productId}
                  maxlength={8}
                  defaultValue={
                    item.priceValue === null || isNaN(item.priceValue)
                      ? ''
                      : item.priceValue
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    //.toLocaleString("en-US")
                  }
                  blurOnSubmit={false}
                  autoCorrect={false}
                  onSubmitEditing={() => {
                    totalRow - 1 === index
                      ? Keyboard.dismiss()
                      : refInput[index + 1]?.focus();
                  }}
                  returnKeyType={Platform.OS === 'android' ? 'next' : 'done'}
                  style={{
                    //upload ? appcolor.lightgray : appcolor.light,
                    backgroundColor: colorInputError(index, PRICE_VALUE, item),
                    width: '90%',
                    padding: 7,
                    borderColor: appcolor.dark,
                    borderWidth: 0.51,
                    fontSize: scaleSize(14),
                    color: appcolor.dark,
                    textAlign: 'right',
                  }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    color: appcolor.dark,
                    fontSize: 13,
                    marginTop: 5,
                  }}
                >
                  Niêm yết
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={e => handerNumberChange(item, e, NET_VALUE)}
                  onEndEditing={event =>
                    checkFormatNumber(event, index, NET_VALUE, item)
                  }
                  autoCapitalize="none"
                  ref={e => (refInput[index] = e)}
                  selectTextOnFocus
                  placeholder="Giá"
                  placeholderTextColor={appcolor.placeholderText}
                  editable={!upload}
                  key={item.productId}
                  maxlength={8}
                  defaultValue={
                    item.netValue === null || isNaN(item.netValue)
                      ? ''
                      : item.netValue
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    //.toLocaleString("en-US")
                  }
                  blurOnSubmit={false}
                  autoCorrect={false}
                  onSubmitEditing={() => {
                    totalRow - 1 === index
                      ? Keyboard.dismiss()
                      : refInput[index + 1]?.focus();
                  }}
                  returnKeyType={Platform.OS === 'android' ? 'next' : 'done'}
                  style={{
                    //upload ? appcolor.lightgray : appcolor.light,
                    backgroundColor: colorInputError(index, NET_VALUE, item),
                    width: '90%',
                    padding: 7,
                    borderColor: appcolor.dark,
                    borderWidth: 0.51,
                    fontSize: scaleSize(14),
                    color: appcolor.dark,
                    textAlign: 'right',
                  }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    color: appcolor.dark,
                    fontSize: 13,
                    marginTop: 5,
                  }}
                >
                  Thực bán
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={e => handerNumberChange(item, e, FSM_VALUE)}
                  onEndEditing={event =>
                    checkFormatNumber(event, index, FSM_VALUE, item)
                  }
                  autoCapitalize="none"
                  ref={e => (refInput[index] = e)}
                  selectTextOnFocus
                  placeholder="Tiền thưởng"
                  placeholderTextColor={appcolor.placeholderText}
                  editable={!upload}
                  key={item.productId}
                  maxlength={8}
                  defaultValue={
                    item.fsmValue === null || isNaN(item.fsmValue)
                      ? ''
                      : item.fsmValue
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    //.toLocaleString("en-US")
                  }
                  blurOnSubmit={false}
                  autoCorrect={false}
                  onSubmitEditing={() => {
                    totalRow - 1 === index
                      ? Keyboard.dismiss()
                      : refInput[index + 1]?.focus();
                  }}
                  returnKeyType={Platform.OS === 'android' ? 'next' : 'done'}
                  style={{
                    //upload ? appcolor.lightgray : appcolor.light,
                    backgroundColor: colorInputError(index, FSM_VALUE, item),
                    width: '90%',
                    padding: 7,
                    borderColor: appcolor.dark,
                    borderWidth: 0.51,
                    fontSize: scaleSize(14),
                    color: appcolor.dark,
                    textAlign: 'right',
                  }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    color: appcolor.dark,
                    fontSize: 13,
                    marginTop: 5,
                  }}
                >
                  FSM Incentive
                </Text>
              </View>
            </View>
          </View>
          {totalRow > 8 && totalRow - 1 === index && (
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: 20,
                height: 50,
                backgroundColor: appcolor.surface,
              }}
            >
              <Text
                style={{ textAlign: 'center', color: appcolor.placeholderText }}
              >
                Đã xem hết
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return groupData.length > 0 ? (
    <Tabs.Container
      renderTabBar={props => (
        <MaterialTabBar
          {...props}
          scrollEnabled={true}
          tabStyle={{
            minWidth: minWidthTab(groupData),
            height: 42,
          }}
          labelStyle={{ fontSize: 14, fontWeight: '600' }}
          indicatorStyle={{ backgroundColor: appcolor.primary }}
          inactiveColor={appcolor.dark}
          activeColor={appcolor.dark}
          style={{ backgroundColor: appcolor.light }}
        />
      )}
      containerStyle={{ backgroundColor: appcolor.surface }}
    >
      {groupData.map((g, index) => {
        const _temp = data.filter(e => {
          if (e.category === g.category) {
            e.totalRow = g.totalRow;
            return e;
          }
        });
        const list = _temp?.sort((a, b) => b.addMore - a.addMore);
        return (
          <Tabs.Tab
            key={g.categoryName}
            label={g.categoryName}
            name={g.categoryName}
          >
            <View
              key={index.toString()}
              style={{
                backgroundColor: appcolor.light,
                marginTop: 40,
                padding: 6,
                width: deviceWidth,
              }}
            >
              <FlatList
                data={list}
                key="id"
                style={{
                  padding: 7,
                  marginBottom: 7,
                  backgroundColor: appcolor.surface,
                }}
                scrollToOverflowEnabled={true}
                initialNumToRender={5}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderRow}
              />
            </View>
          </Tabs.Tab>
        );
      })}
    </Tabs.Container>
  ) : (
    <View
      style={{
        position: 'absolute',
        alignItems: 'center',
        alignSelf: 'center',
      }}
    >
      <LoadingView
        title={'Đang tải dữ liệu...'}
        isLoading={showProgress}
        styles={{ marginTop: 8 }}
      />
    </View>
  );
};
