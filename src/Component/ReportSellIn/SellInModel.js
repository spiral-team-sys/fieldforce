import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Text,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { getConfigSellIn } from '../../Controller/SellInController';
import FormGroup from '../../Content/FormGroup';
// //import NumberFormat from "react-number-format";
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import Swiper from 'react-native-swiper';

const TYPE_SELLIN = {
  DEALER: 'I1',
  COMPETITOR: 'I2',
  CATEGORY: 'I3',
  SUB_CATEGORY: 'I4',
  SEGMENT: 'I5',
  SUB_SEGMENT: 'I6',
  PRODUCTS: 'I7',
  QUANTITY: 'I8',
  PRICE: 'I9',
  NOTE: 'I10',
};
const SellInModel = ({ actionClose, dataListInput }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const workinfo = useSelector(state => state.GAppState.workinfo);
  const refInputs = useRef([]);
  const swiperRef = useRef([]);
  const [pageNum, setPageNext] = useState(0);
  const [typeModal, setTypeModal] = useState(null);
  const [pageList, setPageList] = useState([]);
  const [dataConfig, setDataConfig] = useState([]);
  const [dataModal, setDataModal] = useState({
    dataSelect: [],
    dataFilter: [],
    visible: false,
    titleModal: null,
    type: null,
  });
  const [itemSellIn, setItemSellIn] = useState({
    shopId: workinfo.shopId,
    workDate: workinfo.workDate,
    orderNo: `HD${workinfo.workDate}`,
    quantityValue: null,
    priceValue: null,
    dealerId: 0,
    dealerName: '',
    productId: 0,
    productName: '',
    competitorId: 0,
    competitorName: '',
    categoryId: 0,
    categoryName: '',
    subCategoryId: 0,
    subCategoryName: '',
    segmentId: 0,
    segmentName: '',
    subSegmentId: 0,
    subSegmentName: '',
    note: '',
  });

  const LoadData = async () => {
    await getConfigSellIn(async mConfig => {
      await setDataConfig(mConfig);
    });
  };
  useEffect(() => {
    LoadData();
  }, [itemSellIn]);
  const itemValue = item => {
    switch (item.code) {
      case TYPE_SELLIN.DEALER:
        return itemSellIn.dealerName;
      case TYPE_SELLIN.COMPETITOR:
        return itemSellIn.competitorName;
      case TYPE_SELLIN.CATEGORY:
        return itemSellIn.categoryName;
      case TYPE_SELLIN.SUB_CATEGORY:
        return itemSellIn.subCategoryName;
      case TYPE_SELLIN.SEGMENT:
        return itemSellIn.segmentName;
      case TYPE_SELLIN.SUB_SEGMENT:
        return itemSellIn.subSegmentName;
      case TYPE_SELLIN.PRODUCTS:
        return itemSellIn.productName;
      case TYPE_SELLIN.QUANTITY:
        return itemSellIn.quantityValue;
      case TYPE_SELLIN.PRICE:
        return itemSellIn.priceValue;
      case TYPE_SELLIN.NOTE:
        return itemSellIn.note;
    }
  };
  const ListItemValue = item => {
    switch (item.code) {
      case TYPE_SELLIN.DEALER:
        return dataListInput.dealerList;
      case TYPE_SELLIN.COMPETITOR:
        return dataListInput.competitorList;
      case TYPE_SELLIN.CATEGORY:
        const lstCategory = dataListInput.categoryList.filter(
          i =>
            itemSellIn.competitorId == 0 || i.type == itemSellIn.competitorId,
        );
        return lstCategory;
      case TYPE_SELLIN.SUB_CATEGORY:
        const lstSubCategory = dataListInput.subCategoryList.filter(
          i =>
            (itemSellIn.competitorId == 0 ||
              i.type == itemSellIn.competitorId) &&
            (itemSellIn.categoryId == 0 ||
              i.categoryId == itemSellIn.categoryId),
        );
        return lstSubCategory;
      case TYPE_SELLIN.SEGMENT:
        const lstSegmentList = dataListInput.segmentList.filter(
          i =>
            (itemSellIn.competitorId == 0 ||
              i.type == itemSellIn.competitorId) &&
            (itemSellIn.categoryId == 0 ||
              i.categoryId == itemSellIn.categoryId) &&
            (itemSellIn.subCategoryId == 0 ||
              i.subCatId == itemSellIn.subCategoryId),
        );
        return lstSegmentList;
      case TYPE_SELLIN.SUB_SEGMENT:
        const lstSubSegmentList = dataListInput.subSegmentList.filter(
          i =>
            (itemSellIn.competitorId == 0 ||
              i.type == itemSellIn.competitorId) &&
            (itemSellIn.categoryId == 0 ||
              i.categoryId == itemSellIn.categoryId) &&
            (itemSellIn.subCategoryId == 0 ||
              i.subCatId == itemSellIn.subCategoryId) &&
            (itemSellIn.segmentId == 0 || i.segmentId == itemSellIn.segmentId),
        );
        return lstSubSegmentList;
      case TYPE_SELLIN.PRODUCTS:
        const lstProducts = dataListInput.productsList.filter(
          i =>
            (itemSellIn.competitorId == 0 ||
              i.competitorId == itemSellIn.competitorId) &&
            (itemSellIn.categoryId == 0 ||
              i.categoryId == itemSellIn.categoryId) &&
            (itemSellIn.subCategoryId == 0 ||
              i.subCatId == itemSellIn.subCategoryId) &&
            (itemSellIn.segmentId == 0 ||
              i.segmentId == itemSellIn.segmentId) &&
            (itemSellIn.subSegmentId == 0 ||
              i.subSegmentId == itemSellIn.subSegmentId),
        );
        return lstProducts;
    }
  };
  const handlerTextChange = (index, text) => {
    //console.log(index, 'check edit')
  };
  const handlerSubmitEditing = (idx, isNextHidden) => {
    const next = refInputs.current[idx + 1];
    if (next) isNextHidden === 1 ? Keyboard.dismiss() : next.focus();
    else Keyboard.dismiss();
  };
  const showModalSelect = async item => {
    Keyboard.dismiss();
    let lstData = [];
    switch (item.code) {
      case TYPE_SELLIN.DEALER:
        lstData = dataListInput.dealerList;
        break;
      case TYPE_SELLIN.COMPETITOR:
        lstData = dataListInput.competitorList;
        break;
      case TYPE_SELLIN.CATEGORY:
        lstData = dataListInput.categoryList;
        break;
      case TYPE_SELLIN.SUB_CATEGORY:
        lstData = dataListInput.subCategoryList;
        break;
      case TYPE_SELLIN.SEGMENT:
        lstData = dataListInput.segmentList;
        break;
      case TYPE_SELLIN.SUB_SEGMENT:
        lstData = dataListInput.subSegmentList;
        break;
      case TYPE_SELLIN.PRODUCTS:
        lstData = dataListInput.productsList;
        break;
    }
    const indexPage = pageList.filter(a => a[item.code])[0]?.[item.code] || 0;
    await setTypeModal(item.code);
    await nextStep(indexPage, item.code);
  };
  const nextStep = async (indexPage, typeModal) => {
    await setPageNext(indexPage);
    await setDataModal({ visible: true, type: typeModal });
  };
  // Modal Action
  const handlerChooseItem = async (item, index, value, type) => {
    switch (type) {
      case TYPE_SELLIN.DEALER:
        await setItemSellIn({
          ...itemSellIn,
          dealerId: item.id,
          dealerName: value,
        });
        break;
      case TYPE_SELLIN.COMPETITOR:
        await setItemSellIn({
          ...itemSellIn,
          competitorId: item.id,
          competitorName: value,
        });
        break;
      case TYPE_SELLIN.CATEGORY:
        await setItemSellIn({
          ...itemSellIn,
          categoryId: item.id,
          categoryName: value,
        });
        break;
      case TYPE_SELLIN.SUB_CATEGORY:
        await setItemSellIn({
          ...itemSellIn,
          subCategoryId: item.id,
          subCategoryName: value,
        });
        break;
      case TYPE_SELLIN.SEGMENT:
        await setItemSellIn({
          ...itemSellIn,
          segmentId: item.id,
          segmentName: value,
        });
        break;
      case TYPE_SELLIN.SUB_SEGMENT:
        await setItemSellIn({
          ...itemSellIn,
          subSegmentId: item.id,
          subSegmentName: value,
        });
        break;
      case TYPE_SELLIN.PRODUCTS:
        await setItemSellIn({
          ...itemSellIn,
          productId: item.id,
          productName: value,
        });
        break;
    }
    if (type == TYPE_SELLIN.PRODUCTS) {
      await setPageList([]);
      await setDataModal({ ...dataModal, visible: false });
    } else {
      await nextStep(pageNum + 1, type);
    }
  };
  const handlerSearchModal = async text => {
    if (text.length > 0) {
      let lstFilter = dataModal.dataFilter.filter(i =>
        i.name.toLowerCase().match(text.toLowerCase()),
      );
      await setDataModal({ ...dataModal, dataSelect: lstFilter });
    } else {
      await setDataModal({ ...dataModal, dataSelect: dataModal.dataFilter });
    }
  };
  const handlerClearItem = (item, index, type) => {};
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light, padding: 8 },
    mainInput: { flex: 1 },
    filterStyle: { marginStart: 8, marginEnd: 8 },
  });
  const RenderItemInput = () => {
    return dataConfig?.map(i => {
      const titleName = i.name + (i.isRequired == 1 ? '*' : '');
      switch (i.ref_Code) {
        case 'selected':
          return (
            <View
              key={i.code}
              style={{ backgroundColor: appcolor.lightgray, padding: 1 }}
            >
              <TouchableOpacity
                style={{ width: '100%' }}
                onPress={() => showModalSelect(i)}
              >
                <FormGroup
                  title={i.name}
                  iconRight="caret-down"
                  iconRightStyle={{ color: appcolor.primary }}
                  placeholder={i.ref_Name}
                  rightFunc={() => showModalSelect(i)}
                  value={itemValue(i)}
                  useClearAndroid={false}
                />
              </TouchableOpacity>
            </View>
          );
        case 'number':
        case 'decimal':
          return (
            <NumberFormat
              key={i.code}
              disabled={true}
              displayType={'text'}
              thousandSeparator
              value={itemValue(i)}
              renderText={value => (
                <FormGroup
                  editable={i.ref_Id === 1 ? true : false}
                  key={i.code}
                  inputRef={ref => (refInputs.current[index] = ref)}
                  returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
                  placeholder={i.ref_Name}
                  title={i.name}
                  inputStyle={{ textAlign: 'right' }}
                  keyboardType="numeric"
                  value={value}
                  handleChangeForm={text => handlerTextChange(i, text)}
                  onSubmitEditing={() =>
                    handlerSubmitEditing(
                      i,
                      dataConfig[i + 1] !== undefined
                        ? dataConfig[i + 1].ref_Id
                        : 0,
                    )
                  }
                  returnKeyLabel={Platform.OS === 'ios' ? 'tiếp' : 'tiếp'}
                />
              )}
            />
          );
        default:
          return (
            <FormGroup
              key={i.code}
              title={titleName}
              placeholder={i.ref_Name}
              editable={i.ref_Id === 1 ? true : false}
              value={itemValue(i)}
            />
          );
      }
    });
  };
  const RenderSwiperItem = () => {
    let UIItemView = [];
    dataConfig.map((item, index) => {
      switch (item.code) {
        case TYPE_SELLIN.DEALER:
          pageList.push({ [item.code]: index });
          UIItemView.push(
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 21,
                    padding: 8,
                    fontWeight: '700',
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setDataModal({ ...dataModal, visible: false })}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="times"
                    size={25}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              </View>
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm ...'}
                editable
                handleChangeForm={handlerSearchModal}
                multiline
                iconName="search"
              />
              <FlatList
                style={{ flex: 1, padding: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={ListItemValue(item)}
                renderItem={({ item, index }) =>
                  renderItemModal(item, index, TYPE_SELLIN.DEALER)
                }
                removeClippedSubviews={true}
              />
            </View>,
          );
          break;
        case TYPE_SELLIN.COMPETITOR:
          pageList.push({ [item.code]: index });
          UIItemView.push(
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 21,
                    padding: 8,
                    fontWeight: '700',
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setDataModal({ ...dataModal, visible: false })}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="times"
                    size={25}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              </View>
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm ...'}
                editable
                handleChangeForm={handlerSearchModal}
                multiline
                iconName="search"
              />
              <FlatList
                style={{ flex: 1, padding: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={ListItemValue(item)}
                renderItem={({ item, index }) =>
                  renderItemModal(item, index, TYPE_SELLIN.COMPETITOR)
                }
                removeClippedSubviews={true}
              />
            </View>,
          );
          break;
        case TYPE_SELLIN.CATEGORY:
          pageList.push({ [item.code]: index });
          UIItemView.push(
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 21,
                    padding: 8,
                    fontWeight: '700',
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setDataModal({ ...dataModal, visible: false })}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="times"
                    size={25}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              </View>
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm ...'}
                editable
                handleChangeForm={handlerSearchModal}
                multiline
                iconName="search"
              />
              <FlatList
                style={{ flex: 1, padding: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={ListItemValue(item)}
                renderItem={({ item, index }) =>
                  renderItemModal(item, index, TYPE_SELLIN.CATEGORY)
                }
                removeClippedSubviews={true}
              />
            </View>,
          );
          break;
        case TYPE_SELLIN.SUB_CATEGORY:
          pageList.push({ [item.code]: index });
          UIItemView.push(
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 21,
                    padding: 8,
                    fontWeight: '700',
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setDataModal({ ...dataModal, visible: false })}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="times"
                    size={25}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              </View>
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm ...'}
                editable
                handleChangeForm={handlerSearchModal}
                multiline
                iconName="search"
              />
              <FlatList
                style={{ flex: 1, padding: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={ListItemValue(item)}
                renderItem={({ item, index }) =>
                  renderItemModal(item, index, TYPE_SELLIN.SUB_CATEGORY)
                }
                removeClippedSubviews={true}
              />
            </View>,
          );
          break;
        case TYPE_SELLIN.SEGMENT:
          pageList.push({ [item.code]: index });
          UIItemView.push(
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 21,
                    padding: 8,
                    fontWeight: '700',
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setDataModal({ ...dataModal, visible: false })}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="times"
                    size={25}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              </View>
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm ...'}
                editable
                handleChangeForm={handlerSearchModal}
                multiline
                iconName="search"
              />
              <FlatList
                style={{ flex: 1, padding: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={ListItemValue(item)}
                renderItem={({ item, index }) =>
                  renderItemModal(item, index, TYPE_SELLIN.SEGMENT)
                }
                removeClippedSubviews={true}
              />
            </View>,
          );
          break;
        case TYPE_SELLIN.SUB_SEGMENT:
          pageList.push({ [item.code]: index });
          UIItemView.push(
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 21,
                    padding: 8,
                    fontWeight: '700',
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setDataModal({ ...dataModal, visible: false })}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="times"
                    size={25}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              </View>
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm ...'}
                editable
                handleChangeForm={handlerSearchModal}
                multiline
                iconName="search"
              />
              <FlatList
                style={{ flex: 1, padding: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={ListItemValue(item)}
                renderItem={({ item, index }) =>
                  renderItemModal(item, index, TYPE_SELLIN.SUB_SEGMENT)
                }
                removeClippedSubviews={true}
              />
            </View>,
          );
          break;
        case TYPE_SELLIN.PRODUCTS:
          pageList.push({ [item.code]: index });
          UIItemView.push(
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 21,
                    padding: 8,
                    fontWeight: '700',
                    color: appcolor.dark,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setDataModal({ ...dataModal, visible: false })}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="times"
                    size={25}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              </View>
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm ...'}
                editable
                handleChangeForm={handlerSearchModal}
                multiline
                iconName="search"
              />
              <FlatList
                style={{ flex: 1, padding: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={ListItemValue(item)}
                renderItem={({ item, index }) =>
                  renderItemModal(item, index, TYPE_SELLIN.PRODUCTS)
                }
                removeClippedSubviews={true}
              />
            </View>,
          );
          break;
      }
    });
    return UIItemView;
  };
  const renderItemModal = (item, index, typeModal) => {
    const value = item.name;
    const chooseItem = () => {
      handlerChooseItem(item, index, value, typeModal);
    };
    const clearItem = () => {
      handlerClearItem(item, index, dataModal.type);
    };
    return (
      <View key={index} style={styles.itemModal}>
        <TouchableOpacity style={{ flex: 8, padding: 12 }} onPress={chooseItem}>
          <Text
            style={{
              width: '80%',
              fontSize: 15,
              fontWeight: '500',
              color: appcolor.dark,
            }}
          >
            {index + 1}. {value}
          </Text>
        </TouchableOpacity>
        {item.isSelect == 1 && (
          <TouchableOpacity
            style={{ padding: 12, alignItems: 'center' }}
            onPress={clearItem}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="backspace"
              size={18}
              color={appcolor.dark}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.mainInput}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
          enabled
          keyboardVerticalOffset={60}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <RenderItemInput />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <Modal animationType="slide" visible={dataModal.visible}>
        <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
          <Swiper
            ref={swiperRef}
            index={pageNum}
            loop={false}
            dotStyle={{ backgroundColor: appcolor.grayLight }}
            onIndexChanged={setPageNext}
          >
            {RenderSwiperItem()}
          </Swiper>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
export default SellInModel;
