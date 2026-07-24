import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
//import NumberFormat from "react-number-format";
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import {
  addItemDisplayCompetitor,
  clearAllDataCompetitor,
  deleteItemDisplayCompetitor,
  getListCategoryDisplay,
  getListCompetitorProduct,
  getListSubCategoryDisplay,
  getTabCompetitorReport,
  updateItemCompetitor,
} from '../../../Controller/DisplayController';
import {
  groupDataByKey,
  Message,
  ToastError,
  ToastSuccess,
} from '../../../Core/Helper';
import {
  deviceHeight,
  minWidthTab,
  removeAccents,
} from '../../../Core/Utility';
import { Icon } from '@rneui/themed';
import ActionSheet from 'react-native-actions-sheet';
import { LoadingView } from '../../../Control/ItemLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let itemAddProduct = {
  categoryId: 0,
  categoryName: '',
  displayComment: null,
  division: '',
  divisionId: 0,
  fsmValue: null,
  isAddProduct: 1,
  isFsmValueError: 0,
  isNetValue: 0,
  isPriceError: 0,
  modelName: '',
  netValue: null,
  priceValue: null,
  quantity: null,
  subCatId: 0,
  subCategory: '',
  upload: 0,
  workDate: '',
  workId: 0,
};

export const InputCompetitorReport = ({
  navigation,
  route,
  Status,
  reloadView,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, workinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [isDone, setDone] = useState(false);
  const [isFilterAdd, setFilterAdd] = useState();
  const [_, setMutate] = useState(false);
  const [data, setData] = useState({
    dataShow: [],
    dataShowF: [],
    dataTab: [],
    dataCategory: [],
    dataSubCategory: [],
  });
  const [showProgress, setProgress] = useState(false);
  const tabRef = useRef();
  const ref_toolsSheet = useRef();
  const ref_addProduct = useRef();

  const listInput = [
    { id: 1, name: 'Trưng bày', displayType: 'quantity' },
    { id: 2, name: 'thực bán', displayType: 'netValue' },
    { id: 3, name: 'Niêm yết', displayType: 'priceValue' },
    { id: 4, name: 'FSM Incentive', displayType: 'fsmValue' },
  ];

  const loadData = async () => {
    await setProgress(true);
    await loadDataInput();
    setTimeout(async () => {
      await setProgress(false);
    }, 100);
  };
  const loadDataInput = async () => {
    const listProduct = await getListCompetitorProduct(workinfo);
    const listCompetitor = await getTabCompetitorReport();
    const listCategory = await getListCategoryDisplay();
    const listSubCategory = await getListSubCategoryDisplay(workinfo);
    const { arr } = groupDataByKey({
      arr: listProduct,
      key: 'divisionId',
      keyLayer2: 'categoryId',
    });
    await setData({
      dataShow: arr,
      dataShowF: arr,
      dataTab: listCompetitor,
      dataCategory: listCategory,
      dataSubCategory: listSubCategory,
    });
  };
  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const keyExtractor = useCallback(it => it.displayCompetitorId.toString(), []);
  const getItemLayout = (data, index) => ({
    length: 150,
    offset: 150 * index,
    index,
  });
  const ViewItem = () => {
    const [reload, setReload] = useState(0);
    const deleteItem = async item => {
      await deleteItemDisplayCompetitor(workinfo, item);
      setReload(reload + 1);
    };

    return data.dataTab.map(it => {
      let listDataByCompetitor = [];
      listDataByCompetitor = data.dataShow.filter(
        item => item.divisionId === it.divisionId,
      );
      const totalRow = listDataByCompetitor.length;
      return (
        <Tabs.Tab
          key={it.division + `(${totalRow})`}
          label={it.division + `(${totalRow})`}
          name={it.division + `(${totalRow})`}
        >
          {/* <View style={{ flex: 1, backgroundColor: appcolor.surface, marginTop: 40, padding: 5, width: deviceWidth }}> */}
          <Tabs.FlatList
            windowSize={5}
            getItemLayout={getItemLayout}
            removeClippedSubviews={true}
            key={it.categoryId}
            data={listDataByCompetitor}
            contentContainerStyle={Styles.viewTabStyle}
            initialNumToRender={4}
            keyExtractor={keyExtractor}
            ListHeaderComponent={
              Status !== 1 ? (
                <AddProduct
                  appcolor={appcolor}
                  loadDataInput={loadDataInput}
                  itemCompetitor={it}
                  Styles={Styles}
                  listInput={listInput}
                  workinfo={workinfo}
                  data={data}
                />
              ) : (
                <View />
              )
            }
            ListFooterComponent={
              <Text style={Styles.footerStyle}>Đã xem hết</Text>
            }
            renderItem={({ item, index }) => (
              <RenderItem
                item={item}
                index={index}
                data={data}
                deleteItem={deleteItem}
                listInput={listInput}
                Styles={Styles}
                appcolor={appcolor}
                ref_addProduct={ref_addProduct}
                workinfo={workinfo}
              />
            )}
          />
          {/* </View> */}
        </Tabs.Tab>
      );
    });
  };
  const openSheet = type => {
    Keyboard.dismiss();

    ref_toolsSheet.current.show();
  };
  const filterAddProduct = async () => {
    let dataSearch = [];
    if (isDone)
      dataSearch = data.dataShowF.filter(
        it =>
          (it.quantity !== null && it.quantity >= 0) ||
          (it.priceValue !== null && it.priceValue >= 0) ||
          (it.netValue !== null && it.netValue >= 0) ||
          (it.fsmValue !== null && it.fsmValue >= 0),
      );
    else dataSearch = data.dataShowF;
    if (!isFilterAdd) {
      let lstRes = dataSearch.filter(it => it.isAddProduct === 1);
      data.dataShow = lstRes;
    } else {
      data.dataShow = data.dataShowF;
    }
    await setFilterAdd(e => !e);
  };
  const filterDoneProduct = async () => {
    if (!isDone) {
      let lstRes = data.dataShow.filter(
        it =>
          (it.quantity !== null && it.quantity >= 0) ||
          (it.priceValue !== null && it.priceValue >= 0) ||
          (it.netValue !== null && it.netValue >= 0) ||
          (it.fsmValue !== null && it.fsmValue >= 0),
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
          (it.quantity !== null && it.quantity >= 0) ||
          (it.priceValue !== null && it.priceValue >= 0) ||
          (it.netValue !== null && it.netValue >= 0) ||
          (it.fsmValue !== null && it.fsmValue >= 0),
      );
    else dataSearch = data.dataShowF;

    if (text !== null && text.length > 0) {
      const mResult = await dataSearch.filter(it => {
        const nameProduct = it.modelName
          ? it.modelName.toUpperCase()
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
          await clearAllDataCompetitor(workinfo);
          await reloadView();
          await setDone(false);
          // await loadData()
          ref_toolsSheet.current?.hide();
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      ref_toolsSheet.current?.hide();
    }
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
    actionSheetStyle: { padding: 8, width: '100%', height: '35%' },
    actionSheetAddStyle: { padding: 8, width: '100%' },
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
    titleStyle: {
      color: appcolor.dark,
      fontSize: 16,
      padding: 4,
      fontWeight: '600',
    },
    viewTabStyle: {
      backgroundColor: appcolor.surface,
      marginTop: 10,
      padding: 5,
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
      height: 140,
      backgroundColor: appcolor.light,
      padding: 5,
      margin: 5,
      elevation: 2,
      borderRadius: 10,
    },
    textItemStyle: { color: appcolor.dark, fontSize: 12, fontStyle: 'italic' },
    titleGroupCategory: {
      color: appcolor.white,
      fontSize: 18,
      paddingLeft: 16,
      fontWeight: '600',
    },
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
    footerStyle: { height: deviceHeight / 2, textAlign: 'center' },
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
              onPress={filterAddProduct}
            >
              <Text style={[Styles.textSheetStyle, { color: appcolor.dark }]}>
                Sản phẩm đã thêm
              </Text>
              <SpiralIcon
                name={
                  !isFilterAdd ? 'checkmark-circle-outline' : 'check-circle'
                }
                type={!isFilterAdd ? 'ionicon' : ''}
                size={23}
                color={!isFilterAdd ? appcolor.dark : appcolor.success}
              />
            </TouchableOpacity>
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

const AddProduct = ({
  appcolor,
  Styles,
  workinfo,
  loadDataInput,
  itemCompetitor,
  data,
  listInput,
}) => {
  const [productItem, setProductItem] = useState({ ...itemAddProduct });
  const [_, setMutate] = useState(false);

  const onSelectCategory = itemCategory => {
    setProductItem({
      ...productItem,
      categoryId:
        productItem.categoryId === itemCategory.categoryId
          ? 0
          : itemCategory.categoryId,
      categoryName:
        productItem.categoryName === itemCategory.categoryName
          ? ''
          : itemCategory.categoryName,
      subCatId: 0,
      subCategory: '',
    });
  };

  const onChangeText = text => {
    setProductItem({
      ...productItem,
      modelName: text,
    });
  };
  const renderCategory = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={{
          marginEnd: 5,
          padding: 8,
          minWidth: 50,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor:
            productItem.categoryId === item.categoryId
              ? appcolor.primary
              : appcolor.surface,
          borderColor: appcolor.greydark,
          borderWidth: 0.2,
          borderRadius: 50,
        }}
        onPress={() => onSelectCategory(item)}
      >
        <Text
          style={{
            color:
              productItem.categoryId === item.categoryId
                ? appcolor.white
                : appcolor.dark,
          }}
        >
          {item.categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  const saveProduct = async () => {
    if (productItem.modelName === '') {
      ToastError('Bạn chưa điền tên sản phẩm!', 'Lỗi', 'top');
      return;
    } else if (productItem.categoryId === 0) {
      ToastError('Bạn chưa chọn ngành hàng!', 'Lỗi', 'top');
      return;
    } else if (productItem.subCatId === 0) {
      ToastError('Bạn chưa chọn ngành hàng nhỏ!', 'Lỗi', 'top');
      return;
    }
    let value = removeAccents(
      productItem.modelName.replace(/ /g, '').toUpperCase(),
    );
    let itemsUpload = [
      {
        categoryId: productItem.categoryId,
        categoryName: productItem.categoryName,
        subCatId: productItem.subCatId,
        subCategory: productItem.subCategory,
        displayComment: null,
        division: itemCompetitor.division,
        divisionId: itemCompetitor.divisionId,
        fsmValue: productItem.fsmValue,
        isAddProduct: 1,
        modelName: value,
        netValue: productItem.netValue,
        priceValue: productItem.priceValue,
        quantity: productItem.quantity || 1,
        workDate: workinfo.workDate.toString(),
        workId: workinfo.workId,
      },
    ];
    Message('Chú ý', 'Bạn có chắc chắn muốn lưu sản phẩm?', async () =>
      uploadProduct(itemsUpload),
    );
  };
  const uploadProduct = async itemsUpload => {
    const result = await addItemDisplayCompetitor(itemsUpload);
    if (result) {
      await setProductItem({ ...itemAddProduct });
      await loadDataInput();
      await setMutate(e => !e);
      await ToastSuccess('Đã lưu sản phẩm!', 'thông báo', 'top');
    }
  };
  const keyExtractor = useCallback(it => it.id.toString(), []);
  const getItemLayout = (data, index) => ({
    length: 50,
    offset: 50 * index,
    index,
  });
  const viewCategory = () => {
    const dataSubCat = data.dataSubCategory.filter(
      it => it.categoryId === productItem.categoryId,
    );
    return (
      <View>
        <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
          <Text
            style={{
              width: '30%',
              color: appcolor.dark,
              justifyContent: 'center',
              padding: 8,
            }}
          >
            Ngành hàng :
          </Text>
          <View style={{ width: '70%' }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={data.dataCategory}
              renderItem={renderCategory}
            />
          </View>
        </View>
        {productItem.categoryId !== 0 && (
          <ViewSubCategory
            dataSubCat={dataSubCat}
            productItem={productItem}
            appcolor={appcolor}
          />
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: appcolor.light,
        borderRadius: 10,
        borderColor: appcolor.greydark,
        borderWidth: 0.2,
      }}
    >
      <View style={{ paddingTop: 10, margin: 10 }}>
        <TextInput
          editable={true}
          selectTextOnFocus={true}
          autoCorrect={false}
          onChangeText={onChangeText}
          style={{
            padding: 10,
            color: appcolor.dark,
            height: 40,
            textAlign: 'left',
            borderWidth: 0.4,
            borderRadius: 10,
            borderColor: appcolor.dark,
            backgroundColor: appcolor.light,
          }}
          placeholderTextColor={appcolor.greydark}
          defaultValue={productItem.modelName}
          placeholder="Nhập tên sản phẩm"
        />
      </View>

      <View style={{ marginTop: 10 }}>
        <FlatList
          ListHeaderComponent={viewCategory}
          data={listInput}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          renderItem={({ item, index }) => (
            <RenderItemInput
              itemInput={item}
              indexInput={index}
              item={productItem}
              listInput={listInput}
              Styles={Styles}
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
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            borderRadius: 50,
            backgroundColor: appcolor.primary,
            borderColor: appcolor.greydark,
            borderWidth: 0.2,
            flex: 1,
            padding: 8,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 5,
          }}
          onPress={saveProduct}
        >
          <Text style={[Styles.textSheetStyle, { color: appcolor.white }]}>
            Thêm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ViewSubCategory = ({ dataSubCat, productItem, appcolor }) => {
  const [_, setMutate] = useState(false);
  const onSelectSubCategory = itemCategory => {
    productItem.subCatId =
      productItem.subCatId === itemCategory.subCatId
        ? 0
        : itemCategory.subCatId;
    productItem.subCategory =
      productItem.subCategory === itemCategory.subCategory
        ? ''
        : itemCategory.subCategory;
    setMutate(e => !e);
  };
  const renderSubCategory = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={{
          marginEnd: 5,
          padding: 8,
          minWidth: 50,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor:
            productItem.subCatId === item.subCatId
              ? appcolor.primary
              : appcolor.surface,
          borderColor: appcolor.greydark,
          borderWidth: 0.2,
          borderRadius: 50,
        }}
        onPress={() => onSelectSubCategory(item)}
      >
        <Text
          style={{
            color:
              productItem.subCatId === item.subCatId
                ? appcolor.white
                : appcolor.dark,
          }}
        >
          {item.subCategory}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
      <Text
        style={{
          width: '40%',
          color: appcolor.dark,
          justifyContent: 'center',
          padding: 8,
        }}
      >
        Ngành hàng nhỏ :
      </Text>
      <View style={{ width: '60%' }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dataSubCat}
          renderItem={renderSubCategory}
        />
      </View>
    </View>
  );
};

const RenderItem = ({
  item,
  index,
  data,
  workinfo,
  deleteItem,
  Styles,
  listInput,
  appcolor,
}) => {
  const [itemDisplay, _] = useState(item);
  const onClickButton = async () => {
    const dataDelete = data.dataShow.filter(
      it => it.displayCompetitorId !== item.displayCompetitorId,
    );
    const { arr } = groupDataByKey({
      arr: dataDelete,
      key: 'divisionId',
      keyLayer2: 'categoryId',
    });
    data.dataShow = arr;
    data.dataShowF = arr;
    await deleteItem(item);
  };
  const keyLayer2 = item[`${item.divisionId}${item.categoryId}`];
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
            {item.categoryName}
          </Text>
        </View>
      )}
      <View style={Styles.itemStyle}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={Styles.titleStyle}>
            {`${index + 1}. ` + item.modelName}
          </Text>
          {item.isAddProduct == 1 && item.upload !== 1 && (
            <SpiralIcon
              name="minus-circle"
              type="font-awesome-5"
              size={25}
              onPress={onClickButton}
              color={appcolor.danger}
              style={{ marginEnd: 10 }}
            />
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {listInput.map((it, id) => {
            return (
              <RenderItemInput
                key={it.id + itemDisplay.displayCompetitorId}
                itemInput={it}
                indexInput={id}
                item={itemDisplay}
                listInput={listInput}
                Styles={Styles}
                appcolor={appcolor}
                data={data}
                workinfo={workinfo}
              />
            );
          })}
          {/* <FlatList
                    data={listInput}
                    getItemLayout={getItemLayout}
                    removeClippedSubviews={true}
                    renderItem={({ item, index }) => <RenderItemInput itemInput={item} indexInput={index} item={itemDisplay} listInput={listInput} Styles={Styles} appcolor={appcolor} data={data} workinfo={workinfo} />}
                    style={{ padding: 5 }}
                    numColumns={(listInput.length > 4 || listInput.length === 3) ? 3 : 2}
                    initialNumToRender={5}
                    keyExtractor={keyExtractor}
                /> */}
        </View>
      </View>
    </View>
  );
};
const RenderItemInput = ({
  itemInput,
  indexInput,
  item,
  listInput,
  Styles,
  appcolor,
  data,
  workinfo,
}) => {
  const [input, setInput] = useState(
    itemInput.displayType == 'fsmValue'
      ? item.fsmValue === 0
        ? 0
        : item.fsmValue || ''
      : itemInput.displayType == 'priceValue'
      ? item.priceValue === 0
        ? 0
        : item.priceValue || ''
      : itemInput.displayType == 'netValue'
      ? item.netValue === 0
        ? 0
        : item.netValue || ''
      : item.quantity === 0
      ? 0
      : item.quantity || '',
  );
  const [_, setmutate] = useState();

  const changeValue = async text => {
    let value =
      text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : '';
    let intValue = value === '' ? null : parseInt(value);
    if (intValue && intValue > 0) {
      item[itemInput.displayType] = intValue;
    } else if (itemInput.displayType === 'quantity' && intValue === 0) {
      item[itemInput.displayType] = 0;
      intValue = 0;
    } else {
      item[itemInput.displayType] = null;
      intValue = null;
    }

    setInput(intValue);

    if (item.displayCompetitorId) {
      const indexF = data.dataShowF.findIndex(
        it => it.displayCompetitorId === item.displayCompetitorId,
      );
      const index = data.dataShow.findIndex(
        it => it.displayCompetitorId === item.displayCompetitorId,
      );
      data.dataShowF[indexF][itemInput.displayType] = intValue;
      data.dataShow[index][itemInput.displayType] = intValue;
      await updateItemCompetitor(item, workinfo);
    }
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
      (itemInput.displayType === 'priceValue' ||
        itemInput.displayType === 'netValue' ||
        itemInput.displayType === 'fsmValue')
    ) {
      item[itemInput.displayType] = null;
      intValue = null;
      isError = 1;
      setInput(null);
      ToastError('Nhập số tiền không được nhỏ hơn 1000!', 'Lỗi', 'top');
    } else if (
      intValue % 1000 > 0 &&
      (itemInput.displayType === 'priceValue' ||
        itemInput.displayType === 'netValue' ||
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
      it => it.displayCompetitorId === item.displayCompetitorId,
    );
    item.displayCompetitorId
      ? (data.dataShowF[indexF][itemInput.displayType] = intValue)
      : null;
    if (itemInput.displayType === 'priceValue') {
      item.displayCompetitorId
        ? (data.dataShowF[indexF].isPriceError = isError)
        : null;
      item.isPriceError = isError;
      setmutate(e => !e);
    } else if (itemInput.displayType === 'fsmValue') {
      item.displayCompetitorId
        ? (data.dataShowF[indexF].isFsmValueError = isError)
        : null;
      item.isFsmValueError = isError;
      setmutate(e => !e);
    } else if (itemInput.displayType === 'netValue') {
      item.displayCompetitorId
        ? (data.dataShowF[indexF].isNetValue = isError)
        : null;
      item.isNetValue = isError;
      setmutate(e => !e);
    }
    if (item.displayCompetitorId) {
      await updateItemCompetitor(item, workinfo);
    }
  };
  const indexItem = listInput.length > 4 || listInput.length === 3 ? 2 : 1;
  return (
    <View
      style={[
        Styles.itemInputStyle,
        {
          width:
            (indexInput > 2 && indexInput < 5) || listInput.length % 2 === 0
              ? '49.3%'
              : '32.6%',
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
                    item.isFsmValueError === 1) ||
                  (itemInput.displayType === 'netValue' &&
                    item.isNetValue === 1) ||
                  (itemInput.displayType === 'priceValue' &&
                    item.isPriceError === 1)
                    ? appcolor.warning
                    : appcolor.light,
              },
            ]}
            keyboardType="numeric"
            placeholder={
              itemInput.displayType === 'fsmValue'
                ? 'Tiền thưởng'
                : itemInput.displayType === 'priceValue'
                ? 'Giá'
                : itemInput.displayType === 'netValue'
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
