import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  clearAllDataPOSM,
  getCompetitorByModel,
  getListDisplayByModel,
  getlistTabCompetitor,
  updatePOPDisplayBymodel,
} from '../../../Controller/DisplayController';
//import NumberFormat from "react-number-format";
import {
  groupDataByKey,
  Message,
  ToastError,
  ToastSuccess,
} from '../../../Core/Helper';
import ActionSheet from 'react-native-actions-sheet';
import FormGroup from '../../../Content/FormGroup';
import { Badge, Divider, Icon } from '@rneui/themed';
import { scaleSize } from '../../../Themes/AppsStyle';
import { POSMContext } from '../../../Controller/POSMController';
import { NumPad } from '../../../Control/NumPad';
import { LoadingView } from '../../../Control/ItemLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const InputDisplayByModel = ({
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
    dataCompetitor: [],
    dataTabByCompe: [],
  });
  const [select, setSelect] = useState({
    competitorSelect: _competitorName,
    competitorIdSelect: _competitorId,
  });
  // const [competi]
  const [showProgress, setProgress] = useState(false);
  const [dataTab, setDataTab] = useState([]);
  const [reload, setReload] = useState(0);
  const [isDone, setDone] = useState(false);
  const [_, setMutate] = useState(false);
  const ref_toolsSheet = useRef();
  const tabRef = useRef();
  const competitorRef = useRef();

  const loadData = async () => {
    await setProgress(true);
    const listTab = await getlistTabCompetitor();
    const listProduct = await getListDisplayByModel(workinfo);
    const listCompetitor = await getCompetitorByModel();
    const listTabByCompetitor = listTab.filter(
      it => it.divisionId === _competitorId,
    );
    const { arr } = groupDataByKey({
      arr: listProduct,
      key: 'categoryId',
      keyLayer2: 'subCatId',
    });
    await setDataTab(listTabByCompetitor);
    await setData({
      dataTab: listTab,
      dataTabByCompe: listTabByCompetitor,
      dataShow: arr,
      dataShowF: arr,
      dataCompetitor: listCompetitor,
    });
    setTimeout(async () => {
      await setProgress(false);
    }, 100);
  };

  const loadDataShow = async () => {
    setDataTab(data.dataTabByCompe);
  };
  useEffect(() => {
    loadDataShow();
    return () => false;
  }, [reload]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const filterDoneProduct = async () => {
    if (!isDone) {
      let lstRes = data.dataShow.filter(
        it =>
          (it.quanity !== null && it.quanity >= 0) ||
          (it.price !== null && it.price >= 0) ||
          (it.quantityStock !== null && it.quantityStock >= 0) ||
          (it.displayValue !== null && it.displayValue >= 0),
      );
      data.dataShow = lstRes;
    } else {
      data.dataShow = data.dataShowF;
    }
    await setDone(e => !e);
  };
  const filterProduct = async text => {
    let dataSearch = [];
    if (isDone)
      dataSearch = data.dataShowF.filter(
        it =>
          (it.quanity !== null && it.quanity >= 0) ||
          (it.price !== null && it.price >= 0) ||
          (it.quantityStock !== null && it.quantityStock >= 0) ||
          (it.displayValue !== null && it.displayValue >= 0),
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
          await clearAllDataPOSM(workinfo);
          await reloadView();
          await setDone(false);
          await loadData();
          ref_toolsSheet.current?.hide();
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      ref_toolsSheet.current?.hide();
    }
  };

  const openSheet = () => {
    Keyboard.dismiss();
    ref_toolsSheet.current.show();
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
      height: 60,
      textAlign: 'left',
      borderWidth: 0.4,
      borderRadius: 10,
      borderColor: appcolor.dark,
      backgroundColor: appcolor.light,
    },
    itemStyle: {
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
  // View Item Competitor
  const setCompeSelect = async item => {
    await setSelect({
      competitorSelect: item?.name,
      competitorIdSelect: item?.id,
    });
    await setReload(reload + 1);
  };
  const scrollOnPress = async (item, index) => {
    // data.dataTabByCompe = data.dataTab?.filter(it => it.divisionId === item.id)
    setData({
      ...data,
      dataTabByCompe: data.dataTab?.filter(it => it.divisionId === item.id),
    });
    setCompeSelect(item);
    competitorRef.current.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };
  const RenderItemCompetitor = ({ item, index }) => {
    const onPress = () => {
      scrollOnPress(item, index);
    };
    const widthItem = deviceWidth / 5;
    const colorTitle =
      select.competitorIdSelect === item.id ? appcolor.primary : appcolor.dark;
    const fontWeightTitle =
      select.competitorIdSelect === item.id ? '800' : 'normal';
    return (
      <TouchableOpacity
        key={`DD_${index}`}
        onPress={onPress}
        style={{
          minWidth: widthItem,
          padding: 8,
          backgroundColor: appcolor.surface,
          alignItems: 'center',
          borderRadius: 20,
          margin: 5,
        }}
      >
        <Text
          style={{
            color: colorTitle,
            fontSize: 15,
            fontWeight: fontWeightTitle,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

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
      {data.dataCompetitor.length > 1 && (
        <View
          style={{
            justifyContent: 'center',
            alignSelf: 'center',
            width: '100%',
            paddingBottom: 8,
            backgroundColor: appcolor.light,
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              width: '100%',
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: appcolor.light,
            }}
          >
            <FlatList
              horizontal
              ref={competitorRef}
              style={{ width: '100%' }}
              data={data.dataCompetitor}
              snapToAlignment="start"
              decelerationRate="fast"
              scrollEventThrottle={16}
              renderItem={RenderItemCompetitor}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      )}
      <View style={Styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
          behavior={Platform.OS == 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10}
        >
          {dataTab.length === data.dataTabByCompe.length &&
            dataTab.length > 0 ? (
            <ViewItemTab
              data={data}
              Status={Status}
              dataTab={dataTab}
              appcolor={appcolor}
              Styles={Styles}
              listInput={listInput}
              workinfo={workinfo}
              tabRef={tabRef}
              select={select}
            />
          ) : (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                  textAlign: 'center',
                  padding: 10,
                }}
              >
                Không có sản phẩm
              </Text>
            </View>
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
      <ActionSheet
        ref={ref_toolsSheet}
        defaultOverlayOpacity={0.3}
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
      >
        <View style={Styles.actionSheetStyle}>
          <View style={{ width: '100%' }}>
            <Text style={Styles.titleStyle}>Công cụ</Text>
            <TouchableOpacity
              style={[Styles.buttonSheetStyle, { borderColor: appcolor.dark }]}
              onPress={filterDoneProduct}
            >
              <Text style={[Styles.textSheetStyle, { color: appcolor.dark }]}>
                Sản phẩm đã nhập
              </Text>
              <SpiralIcon
                name={!isDone ? 'checkmark-circle-outline' : 'check-circle'}
                type={!isDone ? 'ionicon' : ''}
                size={23}
                color={!isDone ? appcolor.dark : appcolor.success}
              />
            </TouchableOpacity>
            {/* <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 12 }}> */}
            <TouchableOpacity
              style={[
                Styles.buttonSheetStyle,
                { borderColor: appcolor.danger },
              ]}
              onPress={setClearAll}
            >
              <Text style={[Styles.textSheetStyle, { color: appcolor.danger }]}>
                Xóa dữ liệu đã nhập
              </Text>
              <SpiralIcon
                name={'trash'}
                type={'ionicon'}
                size={23}
                color={appcolor.danger}
              />
            </TouchableOpacity>
            {/* </View> */}
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
const POSMUI = ({ props }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { posmData, itemProduct, onShowPosm } = props;
  return (
    <View style={{ width: '100%', paddingLeft: 7 }}>
      <Text
        style={{ padding: 3, color: appcolor.dark, fontSize: scaleSize(12) }}
      >
        Các loại posm dán trên sản phẩm
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={posmData}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                borderRadius: 40,
                marginEnd: 7,
                backgroundColor:
                  item.posmValue > 0 ? appcolor.surface : appcolor.warning,
              }}
              key={`${itemProduct.productId}ka02${index}`}
            >
              <TouchableOpacity
                onPress={() => onShowPosm(itemProduct)}
                style={{ padding: 12 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Badge status="error" value={item.posmTarget} />

                  <Text
                    style={{
                      marginStart: 3,
                      fontSize: scaleSize(14),
                      fontWeight: 'bold',
                      color: appcolor.dark,
                    }}
                  >
                    {item.posmName}{' '}
                  </Text>
                  {!isNaN(item.posmValue) && item.posmValue !== null && (
                    <Badge status="success" value={item.posmValue} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};
const ViewItemTab = ({
  data,
  dataTab,
  appcolor,
  Styles,
  listInput,
  workinfo,
  tabRef,
  select,
  Status,
}) => {
  const keyExtractor = useCallback(it => it.productId.toString(), []);
  const getItemLayout = (data, index) => ({
    length: 150,
    offset: 150 * index,
    index,
  });
  const ViewItem = () => {
    return dataTab.map(it => {
      let listDataByCate = [];
      listDataByCate = data.dataShow.filter(
        item =>
          item.categoryName === it.categoryName &&
          item.divisionId === select.competitorIdSelect &&
          item.categoryId === it.categoryId,
      );
      const totalRow = listDataByCate.length;
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
              ListFooterComponent={
                <Text style={Styles.footerStyle}>Đã xem hết</Text>
              }
              renderItem={({ item, index }) => (
                <RenderItem
                  item={item}
                  index={index}
                  data={data}
                  Status={Status}
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
  return (
    <Tabs.Container
      ref={tabRef}
      pagerProps={{
        scrollEnabled: false,
      }}
      renderTabBar={props => (
        <MaterialTabBar
          {...props}
          scrollEnabled={true}
          tabStyle={{ minWidth: minWidthTab(data.dataTabByCompe), height: 42 }}
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
  Status,
}) => {
  const insets = useSafeAreaInsets();
  const [itemDisplay, _] = useState(item);
  const [posmByP, setPosmByP] = useState([]);
  const jsonPosm = JSON.parse(
    item?.posmList && item?.posmList !== 'null'
      ? item?.posmList
      : Status !== 1
        ? `[{"posmId": 0,"posmName": "Thêm","productId":${item.productId}}]`
        : `[]`,
  );
  const _sheetPosm = useRef();

  const keyExtractor = useCallback(it => it.id.toString(), []);
  const getItemLayout = (data, index) => ({
    length: 50,
    offset: 50 * index,
    index,
  });
  const onShowPosm = async it => {
    if (it.posmList === null || it.posmList === 'null') {
      // Ngoài guidline
      const outGuid = await POSMContext.PosmInGuid(it.productId);
      await setPosmByP(outGuid);
    } else {
      //in GUID
      const inGuid = JSON.parse(it.posmList);
      await setPosmByP(inGuid);
    }
    _sheetPosm.current.show();
  };

  const handerChangePosm = async (item, e) => {
    let posmUpdate = [...posmByP];
    const index = posmUpdate.findIndex(a => a.posmId === item.posmId);
    let intPosm = e === null || e === '' ? 0 : parseInt(e);
    let posmEdit = {
      ...item,
      posmValue: intPosm,
    };
    posmUpdate[index] = posmEdit;
    //update DB
    const jsonPosm = JSON.stringify(posmUpdate);

    const indexShowF = data.dataShowF.findIndex(
      it =>
        it.productId === itemDisplay.productId &&
        it.workId === itemDisplay.workId,
    );
    const indexShow = data.dataShow.findIndex(
      it =>
        it.productId === itemDisplay.productId &&
        it.workId === itemDisplay.workId,
    );
    data.dataShowF[indexShowF].posmList = jsonPosm;
    data.dataShow[indexShow].posmList = jsonPosm;
    itemDisplay.posmList = jsonPosm;
    await updatePOPDisplayBymodel(itemDisplay, workinfo);
    setPosmByP(posmUpdate);
  };
  const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];
  return (
    <View>
      {keyLayer2 && (
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
          <SpiralIcon
            name="tags"
            type="font-awesome-5"
            size={15}
            color={appcolor.white}
          />
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
      <View
        style={[
          Styles.itemStyle,
          { height: jsonPosm.length !== 0 ? 170 : 100 },
        ]}
      >
        <Text style={Styles.titleStyle}>
          {`${index + 1}. ` + item.productName}
        </Text>
        <Text style={Styles.textItemStyle}>{item.productCode}</Text>
        <View style={{}}>
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
            numColumns={4}
            initialNumToRender={5}
            ListFooterComponent={
              jsonPosm.length !== 0 ? (
                <POSMUI
                  key={item.productCode}
                  props={{
                    posmData: jsonPosm,
                    onShowPosm: onShowPosm,
                    itemProduct: item,
                  }}
                />
              ) : (
                <View />
              )
            }
            keyExtractor={keyExtractor}
          />
        </View>
      </View>
      <ActionSheet
        ref={_sheetPosm}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <ScrollView style={{ padding: 7, marginBottom: 20, flexGrow: 1 }}>
          <FlatList
            data={posmByP}
            renderItem={({ item, index }) => {
              return (
                <Fragment>
                  <View
                    index={`${index}nnma`}
                    style={{
                      padding: 7,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ width: '58%', color: appcolor.dark }}>
                      {item.posmName}
                    </Text>
                    <NumPad
                      containerStyle={{ width: '40%' }}
                      index={index}
                      value={item?.posmValue}
                      item={item}
                      editable={false}
                      upload={itemDisplay.upload !== 1 ? false : true}
                      placeholderText={'Số lượng'}
                      handerNumberChange={handerChangePosm}
                    />
                  </View>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: appcolor.surface,
                      width: '100%',
                    }}
                  />
                </Fragment>
              );
            }}
          />
        </ScrollView>
        <TouchableOpacity
          onPress={() => _sheetPosm.current.hide()}
          style={{ padding: 12, alignItems: 'center', marginBottom: 30 }}
        >
          <Text> Đóng </Text>
        </TouchableOpacity>
      </ActionSheet>
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
    itemInput.displayType == 'priceValue'
      ? item.price || ''
      : itemInput.displayType == 'quantityStock'
        ? item.quantityStock === 0
          ? 0
          : item.quantityStock || ''
        : item.displayValue === 0
          ? 0
          : item.displayValue || '',
  );
  const [_, setmutate] = useState();

  const changeValue = async text => {
    let value =
      text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : '';
    let intValue = value === '' ? null : parseInt(value);
    if (intValue && intValue > 0) {
      item[itemInput.displayType] = intValue;
    } else if (
      (itemInput.displayType === 'quantityStock' ||
        itemInput.displayType === 'displayValue') &&
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
    await updatePOPDisplayBymodel(item, workinfo);

    // if (itemInput.displayType === 'displayValue') {
    // } else {
    //     await updateItemDisplay(item, workinfo)
    // }
  };

  const endInput = async e => {
    let value =
      e.nativeEvent.text !== null && e.nativeEvent.text.length > 0
        ? e.nativeEvent.text.toString().replace(/,/g, '')
        : '';
    let intValue = value === '' ? null : parseInt(value);
    let isError = 0;
    if (intValue < 10000 && itemInput.displayType === 'priceValue') {
      item[itemInput.displayType] = null;
      intValue = null;
      isError = 1;
      setInput(null);
      ToastError('Nhập số tiền không được nhỏ hơn 10.000!', 'Lỗi', 'top');
    } else if (intValue % 1000 > 0 && itemInput.displayType === 'priceValue') {
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
    await updatePOPDisplayBymodel(item, workinfo);

    // if (itemInput.displayType === 'displayValue') {
    // } else {
    //     await updateItemDisplay(item, workinfo)
    // }
  };
  const indexItem =
    listInput.length === 4
      ? 3
      : listInput.length > 4 || listInput.length === 3
        ? 2
        : 1;
  return (
    <View
      style={[
        Styles.itemInputStyle,
        {
          width:
            (indexInput > 2 && indexInput < 5) ||
              listInput.length % 2 !== 0 ||
              itemInput.displayType === 'priceValue'
              ? '33%'
              : '22%',
        },
      ]}
    >
      {indexItem >= indexInput && (
        <Text style={Styles.titleInputStyle}>{itemInput.name}</Text>
      )}
      <NumberFormat
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
                    (itemInput.displayType === 'priceValue' &&
                      item.priceError === 1)
                    ? appcolor.warning
                    : appcolor.light,
              },
            ]}
            keyboardType="numeric"
            placeholder={
              itemInput.displayType === 'priceValue' ? 'Giá' : 'Số lượng'
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
