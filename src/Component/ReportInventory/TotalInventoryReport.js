import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import { CheckBox, Icon } from '@rneui/themed';
//import NumberFormat from "react-number-format";
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading';
import { MutipleItemSelected } from '../../Control/MutipleItemSelected';
import {
  getAllCategoryByProduct,
  getAllProductStock,
  getCompetitorByProduct,
  GetListWarehouse,
  uploadTotalInventory,
} from '../../Controller/StockOutController';
import {
  isNotInteger,
  Message,
  MessageAction,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { _competitorId, _competitorName } from '../../Core/URLs';
import { checkNetwork, minWidthTab } from '../../Core/Utility';
import { deviceHeight, deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROVINCE = 'PROVINCE';
const DISTRICT = 'DISTRICT';
const WAREHOUSE = 'WAREHOUSE';
export const TotalInventoryReport = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    dataInventory: [],
    dataMain: [],
    dataProduct: [],
    dataProductF: [],
    dataProductMain: [],
    dataCompetitor: [],
    dataCategory: [],
    isUpload: false,
  });
  const [viewSheet, setViewSheet] = useState({
    uiProvice: [],
    uiDistrict: [],
    uiWarehouse: [],
  });
  const [dataSelect, setDataSelect] = useState({
    itemProvices: {},
    itemDistrict: {},
    itemWarehouse: {},
  });
  const [mode, setMode] = useState(WAREHOUSE);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [searchWarehouse, setSearchWarehouse] = useState();
  // const [dataMain, setDataMain] = useState({ dataWareHouse: [], dataProvince: [], dataDistict: [] })
  const loadData = async () => {
    await setLoadingSheet(true);
    await GetListWarehouse(async dataResult => {
      const listTab = await getAllCategoryByProduct();
      const listProducts = await getAllProductStock();
      const listCompetitor = await getCompetitorByProduct();
      const dataAll = {
        dataInventory: dataResult,
        dataMain: dataResult,
        dataProduct: listProducts,
        dataProductF: listProducts,
        dataCompetitor: listCompetitor,
        dataCategory: listTab,
      };
      await setData(dataAll);
    });
    await setLoadingSheet(false);
  };
  const onSelect = async (item, type, dataAll) => {
    switch (type) {
      case WAREHOUSE:
        if (
          dataSelect.itemWarehouse?.warehouseId !== item.warehouseId ||
          Object.keys(dataSelect.itemWarehouse).length == 0
        ) {
          await setLoading(true);
          const listProducts = await getAllProductStock();
          const isUpload =
            JSON.parse(item.listStock)?.length > 0 &&
            JSON.parse(item.listStock)[0].IsUpload == 1
              ? true
              : false;
          let DataStock = [...listProducts];
          if (JSON.parse(item.listStock)?.length > 0) {
            JSON.parse(item.listStock)?.map(it => {
              const indexProduct = listProducts.findIndex(
                itm => itm.productId == it.ProductId,
              );
              indexProduct !== -1 &&
                (DataStock[indexProduct].HaveBusiness = it.HaveBusiness);
              indexProduct !== -1 && (DataStock[indexProduct].Stock = it.Stock);
            });
          }
          dataSelect.itemWarehouse = item;
          SheetManager.hide('ref_warehouseSheet');
          let dataView = {
            ...data,
            dataProduct: DataStock,
            dataProductF: DataStock,
            dataProductMain: listProducts,
            isUpload: isUpload,
          };
          await setData(dataView);
          await setLoading(false);
        } else {
          SheetManager.hide('ref_warehouseSheet');
        }
        break;
    }
  };

  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const handleShowSheet = async () => {
    SheetManager.show('ref_warehouseSheet');
  };

  const uploadAction = async () => {
    Keyboard.dismiss();
    let dataDone = data.dataProductF.filter(
      it =>
        (it.Stock !== null && it.HaveBusiness !== undefined) ||
        (it.HaveBusiness !== null && it.HaveBusiness !== undefined),
    );
    let dataUpload = [];
    console.log(dataSelect);
    dataDone.map(it => {
      dataUpload.push({
        WarehouseId: dataSelect.itemWarehouse?.warehouseId,
        ProductId: it.productId,
        Stock: it.Stock || null,
        HaveBusiness: it.HaveBusiness,
        type: it.type,
      });
    });
    if (dataUpload.length === 0) {
      ToastError('Bạn chưa nhập thông tin tình trạng kho!');
      return;
    }

    for (let index = 0; index < dataUpload.length; index++) {
      const item = dataUpload[index];
      if (
        (item.Stock == undefined || item.Stock == null) &&
        item.HaveBusiness !== null &&
        item.HaveBusiness !== undefined &&
        item.HaveBusiness == 1 &&
        item.type == _competitorId
      ) {
        const itemError = data.dataProductF.find(
          it => item.ProductId == it.productId && item.type == it.type,
        );
        ToastError(
          `Sản phẩm ${itemError.division} - ${itemError.productName} có kinh doanh nhưng chưa nhập số lượng`,
        );
        return;
      }
    }
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => UploadData(dataUpload),
    );
  };
  const UploadData = async dataUpload => {
    let isNetwork = await checkNetwork(ActionSheet);
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    await uploadTotalInventory(dataUpload, async result => {
      if (result.status == 200 || result.statusId == 200) {
        await setViewSheet({ uiDistrict: [], uiProvice: [], uiWarehouse: [] });
        await setDataSelect({
          itemProvices: {},
          itemDistrict: {},
          itemWarehouse: {},
        });
        await setData({
          dataInventory: [],
          dataMain: [],
          dataProduct: [],
          dataProductF: [],
          dataProductMain: [],
          dataCompetitor: [],
          dataCategory: [],
          isUpload: false,
        });
        await setMode(WAREHOUSE);
        await loadData();
        await ToastSuccess(result.messeger);
      } else ToastError(result.messeger);
    });
  };
  const filterWarehouse = async text => {
    if (text) {
      const newDataShow = data.dataMain.filter(it => {
        const nameWarehouse = it.wareHouseName
          ? it.wareHouseName.toUpperCase()
          : ''.toUpperCase();
        const textSearch = text.toUpperCase();
        if (nameWarehouse.indexOf(textSearch) === -1) {
          const addressWarehouse = it.address
            ? it.address.toUpperCase()
            : ''.toUpperCase();
          return addressWarehouse.indexOf(textSearch) > -1;
        } else {
          return nameWarehouse.indexOf(textSearch) > -1;
        }
        // return > -1
      });
      // console.log(newDataShow, 'newDataShownewDataShow');
      data.dataInventory = newDataShow;
      setSearchWarehouse(text);
    } else {
      data.dataInventory = data.dataMain;
      // setDone(false)
      setSearchWarehouse(text);
    }
  };

  const ViewSheetItem = () => {
    return (
      <ScrollView>
        <View style={{ paddingBottom: 50 }}>
          {data.dataInventory.map((it, idx) => {
            return (
              <TouchableOpacity
                onPress={() => onSelect(it, WAREHOUSE)}
                style={{
                  borderRadius: 5,
                  borderWidth: 0.5,
                  borderColor:
                    dataSelect.itemWarehouse.wareHouseCode == it.wareHouseCode
                      ? appcolor.tomato
                      : appcolor.dark,
                  padding: 5,
                  margin: 3,
                  backgroundColor: appcolor.light,
                }}
                key={'district_' + idx}
              >
                <Text
                  style={{
                    fontSize: scaleSize(14),
                    color:
                      dataSelect.itemWarehouse.wareHouseCode == it.wareHouseCode
                        ? appcolor.tomato
                        : appcolor.dark,
                  }}
                >
                  {idx + 1}. {it.wareHouseName}
                </Text>
                <Text
                  style={{
                    fontSize: scaleSize(12),
                    color:
                      dataSelect.itemWarehouse.wareHouseCode == it.wareHouseCode
                        ? appcolor.tomato
                        : appcolor.dark,
                    fontStyle: 'italic',
                  }}
                >
                  {it.address}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* {(mode == WAREHOUSE && viewSheet.uiWarehouse.length > 0) &&
                        <View style={{ padding: 5 }}>
                            {viewSheet.uiWarehouse}
                        </View>} */}
        </View>
      </ScrollView>
    );
  };
  const openSheet = () => {
    SheetManager.show('actionStock');
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        leftFunc={() => navigation.goBack()}
        rightFunc={
          Object.keys(dataSelect.itemWarehouse).length > 0 &&
          data.isUpload === false
            ? () => uploadAction()
            : null
        }
        iconMiddle="poll-h"
        middleFunc={openSheet}
      />
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => handleShowSheet()}
          style={{
            backgroundColor: appcolor.surface,
            padding: 10,
            flexDirection: 'row',
            margin: 5,
            borderRadius: 5,
            paddingHorizontal: 10,
            borderWidth: 0.5,
            borderColor: appcolor.dark,
            alignItems: 'center',
          }}
        >
          <SpiralIcon
            name={'warehouse'}
            size={20}
            solid={true}
            type="font-awesome-5"
            color={appcolor.dark}
          />
          <View style={{ paddingLeft: 15 }}>
            <Text
              style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}
            >
              {Object.keys(dataSelect?.itemWarehouse)?.length > 0
                ? dataSelect?.itemWarehouse?.wareHouseName
                : 'Kho'}
            </Text>
          </View>
          {loadingSheet && (
            <ActivityIndicator style={{ position: 'absolute', end: 8 }} />
          )}
        </TouchableOpacity>
        {loading && (
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={loading}
            styles={{ marginTop: 8 }}
          />
        )}
        {Object.keys(dataSelect.itemWarehouse).length > 0 && !loading && (
          <ViewContent
            data={data}
            reload={reload}
            loading={loading}
            dataSelect={dataSelect}
          />
        )}
      </View>
      <ActionSheet
        id={'ref_warehouseSheet'}
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ height: deviceHeight / 1.5, padding: 5 }}>
          <View
            style={{
              width: '100%',
              padding: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* <TouchableOpacity onPress={() => mode !== PROVINCE && handleSelectGoBack(mode)} style={{ padding: 10 }}  >
                            {mode !== PROVINCE && <SpiralIcon name={'arrow-left'} size={23} solid={true} type='font-awesome-5' color={appcolor.dark} />}
                        </TouchableOpacity> */}
            <Text
              style={{
                padding: 5,
                fontWeight: '600',
                fontSize: 18,
                color: appcolor.dark,
                textAlign: 'center',
              }}
            >
              {'Danh sách kho'}
            </Text>
            <TouchableOpacity
              onPress={() => SheetManager.hide('ref_warehouseSheet')}
              style={{ padding: 10 }}
            >
              <SpiralIcon
                name={'times'}
                size={23}
                type="font-awesome-5"
                solid={true}
                color={appcolor.dark}
              />
            </TouchableOpacity>
          </View>
          <FormGroup
            containerStyle={{
              backgroundColor: appcolor.light,
              marginBottom: 10,
              width: '95%',
              alignSelf: 'center',
            }}
            inputStyle={{ fontSize: 13, color: appcolor.dark }}
            placeholder="Tìm kiếm kho"
            editable
            // onEndEditing={() => setDone(false)}
            onClearTextAndroid={filterWarehouse}
            iconName="search"
            value={searchWarehouse}
            handleChangeForm={filterWarehouse}
          />
          <ViewSheetItem />
        </View>
      </ActionSheet>
    </View>
  );
};

const ViewContent = ({ data, reload, loading, dataSelect }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [search, setSearch] = useState('');
  const [competitorName, setCompetitorName] = useState(_competitorName);
  const [dataTabByCompe, setDataTabByCompe] = useState([]);
  const [isDone, setDone] = useState(false);
  const tabRef = useRef();
  const [__, setMutate] = useState(false);

  const handlerSelectCompetitor = async item => {
    await setCompetitorName(item.itemName);
    const dataTab = data.dataCategory.filter(it => it.competitorId == item.id);
    // const dataByCompetitor = data.dataProductF.filter(it => it.type == item.id)
    // data.dataProduct = dataByCompetitor
    // console.log(dataTab);
    await setDataTabByCompe(dataTab);
  };

  const loadCurrentTab = async () => {
    const dataTab = data.dataCategory.filter(
      it => it.competitorId == _competitorId,
    );
    await setDataTabByCompe(dataTab);
  };

  useEffect(() => {
    loadCurrentTab();
    return () => false;
  }, [reload]);
  const filterProduct = async text => {
    if (text) {
      const newDataShow = data.dataProductF.filter(it => {
        const nameProduct = it.productName
          ? it.productName.toUpperCase()
          : ''.toUpperCase();
        const textSearch = text.toUpperCase();
        return nameProduct.indexOf(textSearch) > -1;
      });
      data.dataProduct = newDataShow;
      setSearch(text);
    } else {
      data.dataProduct = data.dataProductF;
      // setDone(false)
      setSearch(text);
    }
  };
  const ViewItemStock = () => {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {dataTabByCompe.length > 0 && (
          <InputStockItem
            data={data}
            tabRef={tabRef}
            loading={loading}
            dataTabByCompe={dataTabByCompe}
          />
        )}
      </KeyboardAvoidingView>
    );
  };
  const setClearAll = async () => {
    if (!data.isUpload) {
      MessageAction(
        `Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?`,
        async () => {
          data.dataProduct.map(it => {
            it.Stock = null;
            it.HaveBusiness = null;
          });
          data.dataProductF.map(it => {
            it.Stock = null;
            it.HaveBusiness = null;
          });
          await setMutate(e => !e);
          SheetManager.hide('actionStock');
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      // SheetManager.show('actionStock')
    }
  };
  const handlerClearByCategory = async itemCategory => {
    if (!data.isUpload) {
      MessageAction(
        `Bạn có muốn xoá dữ liệu ngành hàng ${itemCategory.categoryName} thuộc hãng ${itemCategory.competitorName} đã nhập không ?`,
        async () => {
          data.dataProduct.map(it => {
            if (
              it.categoryId == itemCategory.categoryId &&
              it.type == itemCategory.competitorId
            ) {
              it.Stock = null;
              it.HaveBusiness = null;
            }
          });
          data.dataProductF.map(it => {
            if (
              it.categoryId == itemCategory.categoryId &&
              it.type == itemCategory.competitorId
            ) {
              it.Stock = null;
              it.HaveBusiness = null;
            }
          });
          await setMutate(e => !e);
          SheetManager.hide('actionStock');
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      SheetManager.show('actionStock');
    }
  };
  const filterDoneData = async () => {
    let done = !isDone;
    let lstData = data.dataProduct.filter(
      it =>
        (it.Stock !== null && it.Stock !== undefined && it.Stock >= 0) ||
        (it.HaveBusiness !== null && it.HaveBusiness !== undefined),
    );
    if (done) {
      data.dataProduct = lstData || [];
    } else {
      data.dataProduct = data.dataProductF;
    }
    await setDone(e => !e);
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 5,
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <FormGroup
          containerStyle={{
            backgroundColor: appcolor.light,
            marginBottom: 0,
            width: '95%',
            alignSelf: 'center',
          }}
          inputStyle={{ fontSize: 13, color: appcolor.dark }}
          placeholder="Tìm kiếm sản phẩm"
          editable
          // onEndEditing={() => setDone(false)}
          onClearTextAndroid={filterProduct}
          iconName="search"
          value={search}
          handleChangeForm={filterProduct}
        />
      </View>
      <MutipleItemSelected
        typeItem={'COMPETITOR'}
        containerStyle={{ flexGrow: 0 }}
        dataItems={data.dataCompetitor}
        defaultValue={competitorName}
        onItemChoose={handlerSelectCompetitor}
      />
      <ViewItemStock />
      <ActionSheet
        id="actionStock"
        gestureEnabled
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ padding: 8, width: '100%' }}>
          <ToolsAction
            clearAllData={setClearAll}
            clearByCategory={handlerClearByCategory}
            itemInput={filterDoneData}
            dataTab={dataTabByCompe}
            tabRef={tabRef}
            showInputView={isDone}
            isLock={
              Object.keys(dataSelect.itemWarehouse).length > 0 &&
              data.isUpload === false
            }
          />
        </View>
      </ActionSheet>
    </View>
  );
};

const InputStockItem = ({ data, dataTabByCompe, tabRef }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataTab, setDataTab] = useState([]);

  const loadDataShow = async () => {
    setDataTab(dataTabByCompe);
  };
  useEffect(() => {
    loadDataShow();
    return () => false;
  }, [dataTabByCompe]);

  const ViewItem = () => {
    let dataByCategoryId = [];
    return dataTab.map((it, indexCate) => {
      dataByCategoryId =
        data.dataProduct?.filter(
          i => i.categoryName === it.categoryName && i.type === it.competitorId,
        ) || [];
      const totalRow = dataByCategoryId.length || 0;
      const label = `${it.categoryName || ''} (${totalRow})`;
      return dataByCategoryId.length > 0 ? (
        <Tabs.Tab key={it.categoryName} label={label} name={label}>
          {/* <View style={{ backgroundColor: appcolor.red, marginTop: 40, padding: 6, width: deviceWidth, height: deviceHeight }}> */}
          <View
            key={it.categoryName + indexCate}
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
              display: 'flex',
            }}
          >
            <FlatList
              contentContainerStyle={{ paddingBottom: 30 }}
              key={item => item.id}
              keyExtractor={(item, index) => item + index}
              data={dataByCategoryId}
              updateCellsBatchingPeriod={20}
              removeClippedSubviews={false}
              windowSize={10}
              renderItem={({ item, index }) => (
                <RenderItemData
                  item={item}
                  totalRow={totalRow}
                  index={index}
                  appcolor={appcolor}
                  isUpload={data.isUpload}
                />
              )}
            />
            {/* <KeyboardSpacer topSpacing={Platform.OS === 'android' ? 40 : null} /> */}
          </View>
        </Tabs.Tab>
      ) : null;
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {dataTab.length === dataTabByCompe.length && (
        <Tabs.Container
          ref={tabRef}
          key={'TapCategory'}
          renderTabBar={props => (
            <MaterialTabBar
              {...props}
              labelStyle={{ fontSize: 14, fontWeight: '600' }}
              indicatorStyle={{ backgroundColor: appcolor.dark }}
              inactiveColor={appcolor.dark}
              activeColor={appcolor.dark}
              scrollEnabled={true}
              style={{ backgroundColor: appcolor.light }}
              tabStyle={{ minWidth: minWidthTab(dataTab), height: 38 }}
            />
          )}
          containerStyle={{
            backgroundColor: appcolor.surface,
            height: deviceHeight,
          }}
        >
          {ViewItem()}
        </Tabs.Container>
      )}
    </View>
  );
};

const RenderItemData = ({
  item,
  isClear,
  appcolor,
  totalRow,
  index,
  isUpload,
}) => {
  const [inputDisplay, setInputDisplay] = useState(item.Stock);
  const [haveBusiness, setHaveBusiness] = useState(item.HaveBusiness);
  const [countClear, setCountClear] = useState(0);

  if (!inputDisplay && item.Stock) {
    setInputDisplay(item.Stock);
  } else if (!item.Stock && inputDisplay && isClear !== 0) {
    setInputDisplay(item.Stock);
  } else if (
    !item.Stock &&
    isClear !== 0 &&
    inputDisplay == 0 &&
    isClear - countClear > 0
  ) {
    setInputDisplay(null);
  }
  const onCheckedItem = async action => {
    let isChecked = null;
    if (action === 'yes') isChecked = item.HaveBusiness == 1 ? null : 1;
    else isChecked = item.HaveBusiness == 0 ? null : 0;
    //
    item.HaveBusiness = isChecked;
    item.Stock = isChecked === 1 ? item.Stock : null;
    await setHaveBusiness(isChecked);
    await setInputDisplay(null);
  };
  // const editInputChange = async (e) => {
  //     let display = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString().replace(/,/g, '') : null;
  //     let itemEdit = { ...item }
  //     itemEdit.quanity = (display !== '' && display !== undefined && display !== null) ? parseInt(display) : null
  //     // await updateStockItem(itemEdit, workinfo)
  // }
  const changeValueStock = async text => {
    let display =
      text !== null && text.length > 0
        ? text.toString().replace(/,/g, '')
        : null;

    let intValue = display === null ? null : parseInt(display);
    let itemEdit = { ...item };

    if (intValue || intValue === 0) {
      item.Stock = intValue;
      itemEdit.Stock = intValue;
      await setInputDisplay(intValue);
    } else {
      item.Stock = null;
      itemEdit.Stock = null;
      await setInputDisplay();
    }
  };
  return (
    <View key={`stock_${item.productCode}`} style={{ width: '100%' }}>
      <View
        style={{
          padding: 5,
          width: '100%',
          alignItems: 'center',
          backgroundColor: appcolor.surface,
          marginBottom: 3,
          borderRadius: 8,
        }}
      >
        <View
          style={{
            width: '100%',
            padding: 5,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ width: '70%' }}>
            <Text
              style={{
                fontSize: 13,
                color: appcolor.dark,
                fontWeight: '600',
                textAlign: 'left',
              }}
            >
              {index + 1}. {item.productName}
            </Text>
            <Text
              style={{ fontSize: 11, color: appcolor.dark, textAlign: 'left' }}
            >
              {item.productCode}
            </Text>
          </View>
          {item.type == _competitorId && haveBusiness === 1 && (
            <NumberFormat
              value={inputDisplay === 0 ? 0 : inputDisplay || ''}
              displayType="text"
              thousandSeparator={true}
              renderText={value => (
                <TextInput
                  style={{
                    padding: 8,
                    fontSize: 12,
                    color: appcolor.dark,
                    backgroundColor: appcolor.light,
                    fontWeight: '500',
                    width: '30%',
                    textAlign: 'center',
                    borderRadius: 5,
                    borderWidth: 0.3,
                    borderColor: appcolor.greylight,
                  }}
                  value={value}
                  keyboardType={'numeric'}
                  placeholder={'Số lượng'}
                  placeholderTextColor={appcolor.greydark}
                  editable={!isUpload}
                  selectTextOnFocus={!isUpload}
                  onChangeText={changeValueStock}
                  // onEndEditing={editInputChange}
                />
              )}
            />
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            backgroundColor: appcolor.light,
            borderRadius: 5,
          }}
        >
          <CheckBox
            checkedColor={appcolor.success}
            disabled={isUpload}
            containerStyle={{
              padding: 0,
              margin: 3,
              backgroundColor: appcolor.light,
              borderWidth: 0,
            }}
            // title={item.type == _competitorId ? 'Có kinh doanh' : 'Còn hàng'}
            title={'Có kinh doanh'}
            textStyle={{
              padding: 0,
              margin: 0,
              fontSize: 13,
              color: appcolor.greylight,
              fontWeight: '500',
            }}
            checked={haveBusiness === 1}
            onPress={() => onCheckedItem('yes')}
          />
          <CheckBox
            checkedColor={appcolor.red}
            disabled={isUpload}
            containerStyle={{
              padding: 0,
              margin: 3,
              backgroundColor: appcolor.light,
              borderWidth: 0,
            }}
            // title={item.type == _competitorId ? 'Không kinh doanh' : 'Hết hàng'}
            title={'Không kinh doanh'}
            textStyle={{
              padding: 0,
              margin: 0,
              fontSize: 13,
              color: appcolor.greylight,
              fontWeight: '500',
            }}
            checked={haveBusiness === 0}
            onPress={() => onCheckedItem('no')}
          />
        </View>
      </View>
      {index === totalRow - 1 && index > 10 && (
        <View>
          <Text
            style={{
              width: '100%',
              height: 40,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            {'Đã xem hết'}
          </Text>
        </View>
      )}
    </View>
  );
};
const ToolsAction = ({
  clearAllData,
  clearByCategory,
  itemInput,
  tabRef,
  dataTab,
  showInputView = false,
  isLock = false,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isShowInput, setShowInput] = useState(showInputView);
  const itemTab =
    tabRef?.current !== null ? dataTab[tabRef?.current.getCurrentIndex()] : {};
  //
  const onShow = () => {
    const isShow = !isShowInput;
    itemInput(isShow);
    setShowInput(isShow);
  };
  const onDeleteAll = () => {
    clearAllData();
  };
  const onDeleteByCategory = () => {
    clearByCategory(itemTab);
  };
  //
  const RenderButton = ({
    title,
    iconName,
    iconColor,
    actionPress,
    isShowInput = false,
  }) => {
    const styleView = {
      backgroundColor: isShowInput ? appcolor.light : appcolor.surface,
      borderWidth: isShowInput ? 0.5 : 0,
      borderColor: appcolor.success,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      marginTop: 8,
      borderRadius: 5,
    };
    return (
      <TouchableOpacity onPress={actionPress}>
        <View style={styleView}>
          <SpiralIcon
            type="font-awesome-5"
            name={iconName}
            size={18}
            color={iconColor}
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
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
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
      <RenderButton
        title="Xem dữ liệu đã nhập"
        iconName="keyboard"
        iconColor={appcolor.success}
        isShowInput={isShowInput}
        actionPress={onShow}
      />
      {isLock && (
        <RenderButton
          title="Xoá tất cả dữ liệu"
          iconName="trash"
          iconColor={appcolor.red}
          actionPress={onDeleteAll}
        />
      )}
      {isLock && (
        <RenderButton
          title={`Xoá dữ liệu ngành hàng ${itemTab.categoryName || ''}`}
          iconName="trash"
          iconColor={appcolor.red}
          actionPress={onDeleteByCategory}
        />
      )}
    </View>
  );
};
