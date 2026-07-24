import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { useSelector } from 'react-redux';
import { _competitorId, _competitorName } from '../../../Core/URLs';
import { deviceHeight, deviceWidth, minWidthTab } from '../../../Core/Utility';
import {
  clearAllDataDisplay,
  getDisplayProduct,
  getlistTabCompetitor,
  updateItemDisplay,
} from '../../../Controller/DisplayController';
import { updateNoteDisplayReport } from '../../../Controller/WorkController';
import {
  groupDataByKey,
  Message,
  ToastError,
  ToastSuccess,
} from '../../../Core/Helper';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import FormGroup from '../../../Content/FormGroup';
import { Icon } from '@rneui/themed';
import { LoadingView } from '../../../Control/ItemLoading';
// import { NumberFormatBase } from "react-number-format";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const InputDisplayStock = ({
  navigation,
  route,
  Status,
  listInput,
  reloadView,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, workinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [data, setData] = useState({
    dataTab: [],
    dataShow: [],
    dataShowF: [],
  });
  const [showProgress, setProgress] = useState(false);
  const [isDone, setDone] = useState(false);
  const [isEmpty, setEmpty] = useState(false);
  const [_, setMutate] = useState(false);
  const tabRef = useRef();

  const loadData = async () => {
    await setProgress(true);
    const listTab = await getlistTabCompetitor(_competitorId);
    const listProduct = await getDisplayProduct(workinfo);
    const { arr } = groupDataByKey({
      arr: listProduct,
      key: 'categoryId',
      keyLayer2: 'subCatId',
    });
    await setData({ dataTab: listTab, dataShow: arr, dataShowF: arr });
    setTimeout(async () => {
      await setProgress(false);
    }, 100);
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const filterDoneProduct = () => {
    if (!isDone) {
      let lstRes = data.dataShow.filter(
        it =>
          (it.quanity !== null && it.quanity >= 0) ||
          (it.price !== null && it.price >= 0) ||
          (it.quantityStock !== null && it.quantityStock >= 0) ||
          (it.quantitySuggest !== null && it.quantitySuggest >= 0) ||
          (it.fsmValue !== null && it.fsmValue >= 0),
      );
      data.dataShow = lstRes;
    } else {
      data.dataShow = data.dataShowF;
    }
    setDone(e => !e);
  };
  const filterEmptyProduct = () => {
    if (!isEmpty) {
      let lstRes = data.dataShow.filter(
        it =>
          it.quanity == null &&
          it.price == null &&
          it.quantityStock == null &&
          it.quantitySuggest == null &&
          it.fsmValue == null,
      );
      data.dataShow = lstRes;
    } else {
      data.dataShow = data.dataShowF;
    }
    setEmpty(e => !e);
  };
  const filterProduct = async text => {
    let dataSearch = [];
    if (isDone)
      dataSearch = data.dataShowF.filter(
        it =>
          (it.quanity !== null && it.quanity >= 0) ||
          (it.price !== null && it.price >= 0) ||
          (it.quantityStock !== null && it.quantityStock >= 0) ||
          (it.quantitySuggest !== null && it.quantitySuggest >= 0) ||
          (it.fsmValue !== null && it.fsmValue >= 0),
      );
    else dataSearch = data.dataShowF;

    if (text !== null && text.length > 0) {
      const mResult = await dataSearch.filter(it => {
        const nameProduct = it.productName
          ? it.productName.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return nameProduct.indexOf(textData) > -1;
      });
      data.dataShow = mResult;
    } else {
      data.dataShow = dataSearch;
    }
    setMutate(e => !e);
  };
  const setClearAll = async () => {
    if (Status !== 1) {
      Message(
        'Chú ý',
        'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
        async () => {
          await clearAllDataDisplay(workinfo);
          await reloadView();
          await setDone(false);
          await loadData();
          SheetManager.hide('ref_toolsSheet');
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      SheetManager.hide('ref_toolsSheet');
    }
  };

  const onUpdateNote = async (note, categoryName) => {
    let itemNote = {
      workId: workinfo.workId,
      displayRef: data.dataTab[tabRef.current.getCurrentIndex()].displayRef,
      displayComment: note || '',
      division: _competitorName,
    };
    data.dataShow.map(it =>
      it.categoryName === categoryName
        ? (it.displayComment = note || '')
        : null,
    );
    data.dataShowF.map(it =>
      it.categoryName === categoryName
        ? (it.displayComment = note || '')
        : null,
    );
    await updateNoteDisplayReport(itemNote);
  };
  const endUpdateNote = async (note, categoryName) => {
    let itemNote = {
      workId: workinfo.workId,
      displayRef: data.dataTab[tabRef.current.getCurrentIndex()].displayRef,
      displayComment: '',
      division: _competitorName,
    };
    if (note?.length > 0 && note?.length < 5) {
      ToastError('Vui lòng nhập ghi chú ít nhất 5 ký tự.', 'Thông báo', 'top');
      data.dataShow.map(it =>
        it.categoryName === categoryName
          ? (it.displayComment = note || '')
          : null,
      );
      data.dataShowF.map(it =>
        it.categoryName === categoryName
          ? (it.displayComment = note || '')
          : null,
      );
      await updateNoteDisplayReport(itemNote);
      return;
    }
    note?.length > 5 && ToastSuccess('Đã lưu ghi chú.', 'Thông báo', 'top');
  };
  const keyExtractor = useCallback(it => it.productId.toString(), []);
  const getItemLayout = (data, index) => ({
    length: 150,
    offset: 150 * index,
    index,
  });
  const ViewItem = () => {
    return data.dataTab.map(it => {
      let listDataByCate = [];
      listDataByCate = data.dataShow.filter(
        item => item.categoryName === it.categoryName,
      );
      const totalRow = listDataByCate.length;
      const onChangeNote = text => {
        onUpdateNote(text, it.categoryName);
      };
      const endChangeNote = event => {
        endUpdateNote(event.nativeEvent.text, it.categoryName);
      };
      return (
        <Tabs.Tab
          key={it.categoryName + `(${totalRow})`}
          label={it.categoryName + `(${totalRow})`}
          name={it.categoryName + `(${totalRow})`}
        >
          <View style={Styles.viewTabStyle}>
            <FlatList
              windowSize={5}
              getItemLayout={getItemLayout}
              removeClippedSubviews={true}
              key={it.categoryId}
              data={listDataByCate}
              initialNumToRender={4}
              keyExtractor={keyExtractor}
              ListHeaderComponent={
                <View
                  style={{
                    backgroundColor: appcolor.surface,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <TextInput
                      editable={Status !== 1 ? true : false}
                      selectTextOnFocus={Status !== 1 ? true : false}
                      multiline={true}
                      autoCorrect={false}
                      onChangeText={onChangeNote}
                      style={Styles.inputNoteStyle}
                      onEndEditing={endChangeNote}
                      placeholderTextColor={appcolor.greydark}
                      defaultValue={listDataByCate[0]?.displayComment || ''}
                      placeholder="Nhập ghi chú"
                    />
                  </View>
                </View>
              }
              ListFooterComponent={
                <Text style={Styles.footerStyle}>Đã xem hết</Text>
              }
              renderItem={({ item, index }) => (
                <RenderItem
                  item={item}
                  index={index}
                  data={data}
                  Styles={Styles}
                  listInput={listInput}
                  appcolor={appcolor}
                  workinfo={workinfo}
                />
              )}
            />
          </View>
        </Tabs.Tab>
      );
    });
  };
  const openSheet = () => {
    Keyboard.dismiss();
    SheetManager.show('ref_toolsSheet');
  };
  const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.surface },
    headerStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    searchStyle: {
      backgroundColor: appcolor.grayLight,
      margin: 8,
      padding: 3,
      paddingEnd: 8,
      width: '80%',
    },
    buttonHeaderStyle: {
      width: '10%',
      height: 38,
      padding: 3,
      backgroundColor: appcolor.grayLight,
      borderRadius: 50,
      marginRight: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressStyle: {
      position: 'absolute',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: deviceHeight / 3,
    },
    actionSheetStyle: { padding: 8, width: '100%', height: '30%' },
    buttonSheetStyle: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      justifyContent: 'space-between',
      borderRadius: 20,
      borderWidth: 0.5,
      marginTop: 12,
    },
    textSheetStyle: { width: '80%', textAlign: 'center' },
    titleStyle: { color: appcolor.dark, fontSize: 16, fontWeight: '600' },
    viewTabStyle: {
      flex: 1,
      backgroundColor: appcolor.surface,
      marginTop: 40,
      padding: 5,
      width: deviceWidth,
      display: !showProgress ? 'flex' : 'none',
    },
    inputNoteStyle: {
      flex: 1,
      padding: 10,
      color: appcolor.dark,
      minHeight: 40,
      maxHeight: 100,
      textAlign: 'left',
      borderWidth: 0.4,
      borderRadius: 10,
      borderColor: appcolor.dark,
      backgroundColor: appcolor.light,
    },
    itemStyle: {
      height: 150,
      backgroundColor: appcolor.light,
      padding: 5,
      margin: 5,
      elevation: 2,
      borderRadius: 10,
    },
    textItemStyle: { color: appcolor.dark, fontSize: 12, fontStyle: 'italic' },
    itemInputStyle: { height: 50, marginEnd: 2 },
    textInputStyle: {
      height: 30,
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: '500',
      textAlign: 'center',
      borderWidth: 0.5,
      borderRadius: 5,
      borderColor: appcolor.greydark,
      padding: 8,
      marginBottom: 2,
    },
    titleInputStyle: { textAlign: 'center', color: appcolor.dark },
    footerStyle: {
      height: deviceHeight / 2,
      textAlign: 'center',
      color: appcolor.dark,
    },
  });

  return (
    <View style={Styles.container}>
      <View style={Styles.headerStyle}>
        <FormGroup
          containerStyle={Styles.searchStyle}
          inputStyle={{ fontSize: 14, color: appcolor.dark }}
          placeholder="Tìm kiếm sản phẩm"
          editable
          iconName="search"
          onClearTextAndroid={filterProduct}
          handleChangeForm={filterProduct}
        />
        <TouchableOpacity onPress={openSheet} style={Styles.buttonHeaderStyle}>
          <SpiralIcon
            name="ellipsis-vertical"
            type="ionicon"
            size={21}
            color={appcolor.dark}
          />
        </TouchableOpacity>
      </View>
      <View style={Styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
          behavior={Platform.OS == 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10}
        >
          {data.dataTab.length > 0 && data.dataShowF.length > 0 && (
            <Tabs.Container
              ref={tabRef}
              renderTabBar={props => (
                <MaterialTabBar
                  {...props}
                  scrollEnabled={true}
                  tabStyle={{ minWidth: minWidthTab(data.dataTab), height: 42 }}
                  labelStyle={{ fontSize: 14, fontWeight: '600' }}
                  indicatorStyle={{ backgroundColor: appcolor.primary }}
                  inactiveColor={appcolor.dark}
                  activeColor={appcolor.dark}
                  style={{ backgroundColor: appcolor.light }}
                />
              )}
              containerStyle={{ backgroundColor: appcolor.surface }}
            >
              {ViewItem()}
            </Tabs.Container>
          )}
        </KeyboardAvoidingView>
      </View>
      {showProgress && (
        <View style={Styles.progressStyle}>
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={showProgress}
            styles={{ marginTop: 8 }}
          />
        </View>
      )}
      <View style={{ width: '100%' }}>
        <ActionSheet
          id={'ref_toolsSheet'}
          defaultOverlayOpacity={0.3}
          containerStyle={{
            backgroundColor: appcolor.light,
            paddingBottom: insets.bottom,
          }}
          closeOnPressBack={true}
          gestureEnabled={true}
          indicatorColor={appcolor.primary}
        >
          <View style={Styles.actionSheetStyle}>
            <View style={{ width: '100%' }}>
              <Text
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: '600',
                  color: appcolor.dark,
                }}
              >
                Công cụ
              </Text>
              <TouchableOpacity onPress={filterDoneProduct}>
                <View
                  style={{
                    backgroundColor: isDone ? appcolor.light : appcolor.surface,
                    borderWidth: isDone ? 0.5 : 0,
                    borderColor: appcolor.success,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 5,
                    marginTop: 8,
                    borderRadius: 5,
                  }}
                >
                  <SpiralIcon
                    name={'keyboard'}
                    size={18}
                    color={appcolor.success}
                  />
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 14,
                      fontWeight: '400',
                      color: appcolor.dark,
                      padding: 8,
                    }}
                  >
                    Xem dữ liệu đã nhập
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={filterEmptyProduct}>
                <View
                  style={{
                    backgroundColor: isEmpty
                      ? appcolor.light
                      : appcolor.surface,
                    borderWidth: isEmpty ? 0.5 : 0,
                    borderColor: appcolor.success,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 5,
                    marginTop: 8,
                    borderRadius: 5,
                  }}
                >
                  <SpiralIcon
                    name={'keyboard'}
                    size={18}
                    color={appcolor.success}
                  />
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 14,
                      fontWeight: '400',
                      color: appcolor.dark,
                      padding: 8,
                    }}
                  >
                    Xem dữ liệu chưa nhập
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={setClearAll}>
                <View
                  style={{
                    backgroundColor: appcolor.surface,
                    borderWidth: 0,
                    borderColor: appcolor.success,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 5,
                    marginTop: 8,
                    borderRadius: 5,
                  }}
                >
                  <SpiralIcon
                    name={'trash'}
                    type={'ionicon'}
                    size={23}
                    color={appcolor.danger}
                  />
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 14,
                      fontWeight: '400',
                      color: appcolor.dark,
                      padding: 8,
                    }}
                  >
                    Xóa dữ liệu đã nhập
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ActionSheet>
      </View>
    </View>
  );
};
const RenderItem = ({
  item,
  index,
  data,
  Styles,
  workinfo,
  listInput,
  appcolor,
}) => {
  const [itemDisplay, _] = useState(item);
  const keyExtractor = useCallback(it => it.id.toString(), []);
  const getItemLayout = (data, index) => ({
    length: 50,
    offset: 50 * index,
    index,
  });
  const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];
  return (
    <View>
      {keyLayer2 && item.subCategory && (
        <View
          style={{
            flex: 1,
            padding: 8,
            marginTop: 5,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: appcolor.greydark,
          }}
        >
          <Text
            style={{
              color: appcolor.white,
              fontSize: 14,
              paddingLeft: 8,
              fontWeight: '600',
            }}
          >
            {item.subCategory}
          </Text>
        </View>
      )}
      <View style={Styles.itemStyle}>
        <Text style={Styles.titleStyle}>
          {`${index + 1}. ` + item.productName}
        </Text>
        <Text style={Styles.textItemStyle}>{item.productCode}</Text>
        <View style={{ width: '100%' }}>
          <FlatList
            data={listInput}
            getItemLayout={getItemLayout}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => (
              <RenderItemInput
                itemInput={item}
                indexInput={index}
                item={itemDisplay}
                Styles={Styles}
                listInput={listInput}
                appcolor={appcolor}
                data={data}
                workinfo={workinfo}
              />
            )}
            style={{ padding: 5 }}
            numColumns={listInput.length > 4 || listInput.length === 3 ? 3 : 2}
            initialNumToRender={5}
            keyExtractor={keyExtractor}
          />
        </View>
      </View>
    </View>
  );
};
const RenderItemInput = ({
  itemInput,
  indexInput,
  item,
  Styles,
  listInput,
  appcolor,
  data,
  workinfo,
}) => {
  const [input, setInput] = useState(
    itemInput.displayType == 'fsmValue'
      ? item.fsmValue || ''
      : itemInput.displayType == 'price'
      ? item.price || ''
      : itemInput.displayType == 'quanity'
      ? item.quanity === 0
        ? 0
        : item.quanity || ''
      : itemInput.displayType == 'quantityStock'
      ? item.quantityStock === 0
        ? 0
        : item.quantityStock || ''
      : item.quantitySuggest === 0
      ? 0
      : item.quantitySuggest || '',
  );
  const [_, setmutate] = useState();

  const changeValue = async text => {
    let value =
      text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : '';
    let intValue = value === '' ? null : parseInt(value);
    if (intValue && intValue > 0) {
      item[itemInput.displayType] = intValue;
    } else if (
      (itemInput.displayType === 'quanity' ||
        itemInput.displayType === 'quantityStock' ||
        itemInput.displayType === 'quantitySuggest') &&
      intValue === 0
    ) {
      item[itemInput.displayType] = 0;
      intValue = 0;
    } else {
      item[itemInput.displayType] = null;
      intValue = null;
    }

    setInput(intValue);

    const indexF = data.dataShowF.findIndex(
      it => it.productId === item.productId && it.workId === item.workId,
    );
    const index = data.dataShow.findIndex(
      it => it.productId === item.productId && it.workId === item.workId,
    );
    data.dataShowF[indexF][itemInput.displayType] = intValue;
    data.dataShow[index][itemInput.displayType] = intValue;
    await updateItemDisplay(item, workinfo);
  };

  const endInput = async e => {
    let value =
      e.nativeEvent.text !== null && e.nativeEvent.text.length > 0
        ? e.nativeEvent.text.toString().replace(/,/g, '')
        : '';
    let intValue = value === '' ? null : parseInt(value);
    let isError = 0;
    if (
      intValue < 1000 &&
      (itemInput.displayType === 'price' ||
        itemInput.displayType === 'fsmValue')
    ) {
      item[itemInput.displayType] = null;
      intValue = null;
      isError = 1;
      setInput(null);
      ToastError('Nhập số tiền không được nhỏ hơn 1000!', 'Lỗi', 'top');
    } else if (
      intValue % 1000 > 0 &&
      (itemInput.displayType === 'price' ||
        itemInput.displayType === 'fsmValue')
    ) {
      item[itemInput.displayType] = null;
      intValue = null;
      isError = 1;
      setInput(null);
      ToastError('Nhập số tiền không được lẻ!', 'lỗi', 'top');
    } else {
      isError = 0;
    }

    const indexF = data.dataShowF.findIndex(
      it => it.productId === item.productId && it.workId === item.workId,
    );
    data.dataShowF[indexF][itemInput.displayType] = intValue;
    if (itemInput.displayType === 'price') {
      data.dataShowF[indexF].priceError = isError;
      item.priceError = isError;
      setmutate(e => !e);
    } else if (itemInput.displayType === 'fsmValue') {
      data.dataShowF[indexF].fsmValueError = isError;
      item.fsmValueError = isError;
      setmutate(e => !e);
    }
    await updateItemDisplay(item, workinfo);
  };
  const indexItem = listInput.length > 4 || listInput.length === 3 ? 2 : 1;
  return (
    <View
      style={[
        Styles.itemInputStyle,
        {
          width:
            (indexInput > 2 && indexInput < 5) || listInput.length % 2 === 0
              ? '49.5%'
              : '33%',
        },
      ]}
    >
      {indexItem >= indexInput && (
        <Text style={Styles.titleInputStyle}>{itemInput.name}</Text>
      )}
      <NumberFormatBase
        value={input === 0 ? 0 : input || ''}
        displayType="text"
        thousandSeparator={true}
        renderText={value => (
          <TextInput
            textAlign={'center'}
            value={value}
            style={[
              Styles.textInputStyle,
              {
                backgroundColor:
                  (itemInput.displayType === 'fsmValue' &&
                    item.fsmValueError === 1) ||
                  (itemInput.displayType === 'price' && item.priceError === 1)
                    ? appcolor.warning
                    : appcolor.light,
              },
            ]}
            keyboardType="numeric"
            placeholder={
              itemInput.displayType === 'fsmValue'
                ? 'Tiền thưởng'
                : itemInput.displayType === 'price'
                ? 'Giá'
                : 'Số lượng'
            }
            placeholderTextColor={appcolor.greydark}
            editable={item.upload !== 1}
            selectTextOnFocus={item.upload !== 1}
            onChangeText={changeValue}
            onEndEditing={endInput}
          />
        )}
      />
      {indexInput > indexItem && (
        <Text style={Styles.titleInputStyle}>{itemInput.name}</Text>
      )}
    </View>
  );
};
