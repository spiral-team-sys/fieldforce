import { useSelector } from 'react-redux';
import React, { useEffect, useState, useRef, Fragment } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { DisplayContext } from '../../Controller/DisplayController';
import { checkNetwork, deviceWidth, TODAY } from '../../Core/Utility';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { Badge, Divider, Icon } from '@rneui/themed';
import { scaleSize } from '../../Themes/AppsStyle';
import FormGroup from '../../Content/FormGroup';
import ActionSheet from 'react-native-actions-sheet';
import { getPhotosReport } from '../../Controller/WorkController';
import { isNotInteger, ToastError, ToastSuccess } from '../../Core/Helper';
import { DEFAULT_COLOR } from '../../Core/URLs';
import filter from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRICE_VALUE = 1;
const NET_VALUE = 2;
const FSM_VALUE = 3;
const DISPLAY_VALUE = 4;
export const DisplayCuckoo = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState);
  const _sheet = useRef();
  const [taskDone, setDone] = useState([]);
  const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
  const [groupData, setGroup] = useState([]);
  const [data, setData] = useState([]);
  const [upload, setUpload] = useState(
    workinfo.workDate !== TODAY ? true : false,
  );
  const [refInput, nonSet] = useState({});
  const [count, setCount] = useState(0);
  const [reloadPhoto, setLoadPhoto] = useState(0);
  //search product
  const [product, setListProduct] = useState([]);
  const [query, setQuery] = useState('');
  const [_filterProduct, setFilterProduct] = useState([]);

  const [colorInput, setColorInput] = useState([]);

  //end search product
  const loadData = async () => {
    const res = await DisplayContext.DisplayGroup(workinfo);
    const result = await DisplayContext.DisplayTargetGetList(workinfo);
    if (result.length > 0) {
      await setUpload(result[0].upload === 1 ? true : false);
      await setLoadPhoto(reloadPhoto + 1);
    }
    await setData(result);
    await setGroup(res);
  };
  useEffect(() => {
    loadData();
    return () => false;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      height: '100%',
      width: deviceWidth,
      shadowOpacity: 0.7,
      shadowColor: appcolor.light,
      shadowRadius: 10,
      borderTopLeftRadius: 30,
      backgroundColor: appcolor.light,
      marginTop: 0,
      borderWidth: 0,
      borderTopRightRadius: 30,
      marginLeft: 0,
      marginRight: 0,
    },
    inputContainer: {
      backgroundColor: appcolor.background,
      width: '100%',
      borderRadius: 2,
      borderColor: appcolor.darkslategray,
      borderWidth: 1,
      textAlign: 'right',
      paddingRight: 10,
      color: appcolor.onBackground,
    },
    viewHeaderTab: { backgroundColor: '#004d40', width: '100%', height: '5%' },
    titleSubCategory: { color: DEFAULT_COLOR, fontSize: 16, fontWeight: '700' },
    titleProduct: {
      fontWeight: '500',
      color: 'black',
      fontSize: 14,
      padding: 8,
    },
    inputNumber: {
      backgroundColor: appcolor.light,
      width: '90%',
      padding: 5,
      textAlign: 'center',
      borderColor: appcolor.dark,
      borderWidth: 0.5,
    },
    ViewInput: { width: '30%', margin: 5 },
    styleModal: {
      flex: 1,
      backgroundColor: appcolor.white,
      padding: 16,
      paddingTop: 50,
      overflow: 'hidden',
    },
    modalHeader: {
      padding: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });
  const handerNumberChange = (item, e, type) => {
    // let text = e?.trim();
    // if (text?.includes(','))
    //     text = text?.replace(',', '');
    // if (text?.includes('.'))
    //     text = ''
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
    // console.log(isNotInteger(text), intValue)
    // console.log(intValue, e + "value update");
    // itemEdit.displayValue = intValue;
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
    await loadData();
  };
  const onValidated = async resultValid => {
    const res = await DisplayContext.taskDone(workinfo);
    let isDone = true;
    let uiTask = [];
    await uiTask.push(
      <Text
        key={'dasda'}
        style={{ padding: 12, color: appcolor.dark, fontSize: scaleSize(18) }}
      >
        {upload
          ? 'Báo cáo đã gửi lên hệ thống'
          : 'Bạn chưa hoàn thành các mục màu đỏ bên dưới'}
      </Text>,
    );
    await res.forEach((v, index) => {
      isDone === true && v.countInput < v.totalRow ? (isDone = false) : null;
      uiTask.push(
        <View key={index + '92KK'}>
          <View style={{ padding: 7, flexDirection: 'row' }} key={v.category}>
            <Text
              style={{
                flexGrow: 1,
                textDecorationLine:
                  v.countInput < v.totalRow ? 'line-through' : 'none',
                padding: 3,
                color:
                  v.countInput < v.totalRow ? appcolor.danger : appcolor.dark,
              }}
            >
              {v.categoryName}
            </Text>
            <Text style={{ padding: 3, color: appcolor.dark }}>
              {v.countInput}/{v.totalRow}
            </Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: appcolor.surface,
              width: '100%',
            }}
          />
        </View>,
      );
    });
    //kiem tra du lieu hinh anh
    await uiTask.push(
      <Text
        key={'aaa'}
        style={{ padding: 12, color: appcolor.dark, fontSize: scaleSize(18) }}
      >
        Dữ liệu hình ảnh
      </Text>,
    );
    await reportItem.ImageByList?.forEach(async (item, index) => {
      let photoType = `${item.code}`;
      let lstPhoto =
        (await getPhotosReport(
          kpiinfo.kpiId,
          photoType,
          workinfo.shopId,
          workinfo.workDate,
        )) || [];
      const photoSize = (await lstPhoto.length) || 0;
      if (isDone === true && photoSize < item.numberIMG) {
        //set false neu trang thai dang done
        isDone = false;
      }
      await uiTask.push(
        <View key={index + '-29dkl'}>
          <View style={{ padding: 7, flexDirection: 'row' }}>
            <Text
              style={{
                flexGrow: 1,
                textDecorationLine:
                  item.numberIMG > photoSize ? 'line-through' : 'none',
                padding: 3,
                color:
                  item.numberIMG > photoSize ? appcolor.danger : appcolor.dark,
              }}
            >
              {item.nameVN}
            </Text>
            <Text style={{ padding: 3, color: appcolor.dark }}>
              {photoSize}/{item.numberIMG}
            </Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: appcolor.surface,
              width: '100%',
            }}
          />
        </View>,
      );
    });
    await setDone(uiTask);
    setTimeout(() => {
      return resultValid(isDone);
    }, 200);
  };
  const onSummitReport = async () => {
    await Keyboard.dismiss();
    await onValidated(async res => {
      if ((await res) === false || upload) {
        //chua nhap xong du lieu
        await _sheet.current.show();
      } else {
        //hoan thanh
        if (await checkNetwork()) {
          await DisplayContext.displayUpload(
            { ...workinfo, reportId: kpiinfo.kpiId },
            result => {
              if (result.statusId === 200) {
                loadData();
              }
              ToastSuccess(result.messager);
            },
          );
        } else {
          ToastError('Không có kết nối mạng', 'error', 'top');
        }
      }
    });
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
                      : item.displayValue.toLocaleString('en-US')
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
  const onLoadProduct = async () => {
    const list = await DisplayContext.GetProductMore(workinfo);
    await setListProduct(list);
    await setFilterProduct(list);
  };
  const onSelected = (item, index) => {
    let edit = item;
    edit.addMore = !item.addMore;
    let updatelist = [...product];
    updatelist[index] = edit;
    const _data = updatelist.filter(e => e.addMore === true);
    setCount(_data.length);
    setListProduct(updatelist);
  };
  const onAddMore = async () => {
    if (count > 0) {
      const addlist = product.filter(v => v.addMore === true);
      await DisplayContext.AddMore(addlist);
      await loadData();
    }
    await setListProduct([]);
    await setFilterProduct([]);
    await setCount(0);
    await _sheet.current.hide();
  };
  const rowProduct = (item, index) => {
    return (
      <TouchableOpacity
        onPress={() => onSelected(item, index)}
        key={'hig' + index}
      >
        <View
          key={'rs' + index}
          style={{
            alignItems: 'center',
            padding: 7,
            backgroundColor: item.addMore ? appcolor.primary : appcolor.light,
            flexDirection: 'row',
            marginEnd: 7,
          }}
        >
          <View style={{ flexGrow: 1 }}>
            <Text style={{ color: appcolor.dark, fontSize: scaleSize(16) }}>
              {item.productName}
            </Text>
            <Text
              style={{
                color: appcolor.dark,
                fontSize: scaleSize(12),
                marginBottom: 7,
              }}
            >
              {item.categoryName}
            </Text>
          </View>
          {item.addMore ? (
            <SpiralIcon
              size={30}
              name="playlist-add-check"
              color={appcolor.light}
            />
          ) : null}
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
          }}
        />
      </TouchableOpacity>
    );
  };
  // search area
  const contains = (item, query) => {
    const { productCode, productName, categoryName } = item;
    let SCate =
      categoryName === null ? categoryName : categoryName.toLowerCase();
    let SCode = productCode === null ? productCode : productCode.toLowerCase();
    let SName = productName === null ? productName : productName.toLowerCase();
    if (
      SCate.includes(query) ||
      SCode.includes(query) ||
      SName.includes(query)
    ) {
      return true;
    }
    return false;
  };
  const handleSearch = text => {
    const formattedQuery = text.toLowerCase();
    const filteredData = filter(_filterProduct, item => {
      return contains(item, formattedQuery);
    });
    setQuery(text);
    if (formattedQuery === undefined || formattedQuery === '') {
      setListProduct(product);
    } else setListProduct(filteredData);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled
      keyboardVerticalOffset={-10}
      style={{ flex: 1, backgroundColor: appcolor.transparent }}
    >
      <View style={{ flex: 1, backgroundColor: appcolor.light }}>
        <HeaderCustom
          leftFunc={() => navigation.goBack()}
          rightFunc={onSummitReport}
          iconRight={upload === true ? 'poll' : 'cloud-upload-alt'}
          iconMiddle="search"
          middleFunc={upload === true ? null : () => _sheet.current.show()}
          title={kpiinfo.name}
        />
        <ScrollableTabView
          initialPage={0}
          renderTabBar={() => <ScrollableTabBar />}
          tabBarPosition="bottom"
          tabBarTextStyle={{ paddingBottom: 12, paddingTop: 12 }}
          tabBarUnderlineStyle={{
            backgroundColor: appcolor.light,
            position: 'absolute',
            top: 0,
          }}
          tabBarBackgroundColor={appcolor.primary}
          locked={true}
          tabBarInactiveTextColor={appcolor.dark}
          tabBarActiveTextColor={appcolor.white}
        >
          <View tabLabel="Nhập liệu" style={[styles.mainContainer]}>
            <ScrollableTabView
              tabBarActiveTextColor={appcolor.primary}
              tabBarInactiveTextColor={appcolor.dark}
              tabBarUnderlineStyle={{ backgroundColor: appcolor.primary }}
              initialPage={0}
              renderTabBar={() => <ScrollableTabBar />}
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
                  <View
                    style={{ flex: 1 }}
                    key={index.toString()}
                    tabLabel={g.categoryName + '(' + g.totalRow + ')'}
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
                      initialNumToRender={7}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={renderRow}
                    />
                  </View>
                );
              })}
            </ScrollableTabView>
          </View>
          <View tabLabel="Hình ảnh">
            {!upload ? (
              <PhotoItems
                usedHeader={false}
                navigation={navigation}
                route={{
                  params: { Photos: reportItem.ImageByList || [], Status: 0 },
                }}
              />
            ) : (
              <View>
                <PhotoItems
                  usedHeader={false}
                  navigation={navigation}
                  route={{
                    params: { Photos: reportItem.ImageByList || [], Status: 1 },
                  }}
                />
              </View>
            )}
          </View>
        </ScrollableTabView>
        <ActionSheet
          // headerAlwaysVisible gestureEnabled
          containerStyle={{
            backgroundColor: appcolor.light,
            paddingBottom: insets.bottom,
          }}
          onClose={() => {
            setDone([]);
          }}
          ref={_sheet}
          onOpen={() => onLoadProduct()}
        >
          {taskDone.length > 0 ? (
            <View style={{ height: '95%' }}>
              <ScrollView>
                <View>{taskDone}</View>
              </ScrollView>
              <TouchableOpacity
                style={{
                  width: '100%',
                  position: 'absolute',
                  bottom: 0,
                  padding: 7,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setDone([]);
                  _sheet.current.hide();
                }}
              >
                <Text
                  style={{ color: appcolor.primary, fontSize: scaleSize(18) }}
                >
                  Đã hiểu
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Fragment>
              <FormGroup
                useClearAndroid={false}
                editable={true}
                handleChangeForm={e => handleSearch(e)}
                placeholder="Nhập mã sản phẩm ngoài danh sách"
              />
              <ScrollView style={{ height: '95%' }}>
                <View>
                  {product.map((item, index) => {
                    return rowProduct(item, index);
                  })}
                </View>
              </ScrollView>
              <TouchableOpacity onPress={() => onAddMore()}>
                <View
                  style={{
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: appcolor.primary,
                    padding: 12,
                  }}
                >
                  <Text style={{ color: appcolor.white }}>
                    {count > 0 ? `(${count}) Áp dụng` : `Trở về`}
                  </Text>
                </View>
              </TouchableOpacity>
            </Fragment>
          )}
        </ActionSheet>
      </View>
    </KeyboardAvoidingView>
  );
};
