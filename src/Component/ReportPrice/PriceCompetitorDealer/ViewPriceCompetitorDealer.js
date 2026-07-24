import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
//import NumberFormat from "react-number-format";
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Badge, Icon } from '@rneui/themed';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import FormGroup from '../../../Content/FormGroup';
import { minWidthTab } from '../../../Core/Utility';
import { deviceHeight, deviceWidth } from '../../Home';
import {
  Message,
  ToastError,
  groupDataByKey,
  removeVietnameseTones,
} from '../../../Core/Helper';
import { LoadingView } from '../../../Control/ItemLoading';
import filter from 'lodash';
import { DEFAULT_COLOR } from '../../../Core/URLs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const ViewPriceCompetitorDealer = memo(
  ({ navigation, route, data, dataByDealer }) => {
    const insets = useSafeAreaInsets();
    const { appcolor, kpiinfo, workinfo, userinfo } = useSelector(
      state => state.GAppState,
    );
    const [dataView, setDataView] = useState(dataByDealer);
    const [listMaster, setListMaster] = useState({});
    const [showProgress, setProgress] = useState(false);
    const [isDone, setDone] = useState(false);
    const [_, setMutate] = useState(false);
    const ref_toolsSheet = useRef();
    const tabRef = useRef();
    const [listPhotoByCategory, setPhotoByCategory] = useState([]);
    const [search, setSearch] = useState('');
    const [isSelect, setFilterSelect] = useState(false);

    const loadData = async () => {
      await setProgress(true);
      setDataView(dataByDealer);
      setTimeout(async () => {
        await setProgress(false);
      }, 100);
    };

    useEffect(() => {
      const _load = loadData();
      return () => {
        _load;
      };
    }, [dataByDealer.itemSelect]);

    const Styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: appcolor.surface },
      headerStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 5,
      },
      searchStyle: {
        borderColor: appcolor.grayLight,
        borderWidth: 0.5,
        backgroundColor: appcolor.light,
        padding: 3,
        width: '85%',
        marginBottom: 0,
      },
      buttonHeaderStyle: {
        width: '10%',
        height: 38,
        backgroundColor: appcolor.grayLight,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      progressStyle: {
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
      titleStyle: { color: appcolor.dark, fontSize: 14, fontWeight: '600' },
      viewTabStyle: {
        backgroundColor: appcolor.surface,
        marginTop: 42,
        padding: 5,
        width: deviceWidth,
        height: deviceHeight * 0.8,
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
        height:
          dataView.listInput?.length < 4
            ? dataView.listConfig?.isNoteBySKU == 1
              ? dataView.listInput?.length > 1
                ? 190
                : 150
              : 110
            : dataView.listConfig?.isNoteBySKU == 1
              ? dataView.listInput?.length > 1
                ? 230
                : 190
              : 150,
        backgroundColor: appcolor.light,
        justifyContent: 'center',
        padding: 5,
        margin: 5,
        elevation: 2,
        borderRadius: 10,
      },
      textItemStyle: {
        color: appcolor.dark,
        fontSize: 12,
        fontStyle: 'italic',
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
      titleInputStyle: {
        textAlign: 'center',
        color: appcolor.dark,
        fontSize: 12,
      },
      footerStyle: {
        height: deviceHeight / 2,
        textAlign: 'center',
        color: appcolor.dark,
      },
    });

    const keyExtractor = useCallback(it => it.ProductId.toString(), []);
    const getItemLayout = (data, index) => ({
      length:
        dataView.listConfig?.isNoteBySKU == 1
          ? dataView.listInput.length > 1
            ? 210
            : 180
          : 150,
      offset:
        (dataView.listConfig?.isNoteBySKU == 1
          ? dataView.listInput.length > 1
            ? 210
            : 180
          : 150) * index,
      index,
    });
    const ViewItem = () => {
      return dataView.listCompetitor?.map(it => {
        let listDataByCompe = JSON.parse(it.ListProduct || '[]');
        const totalRow = listDataByCompe.length;
        const { arr } = groupDataByKey({
          arr: listDataByCompe,
          key: 'SubCatId',
          keyLayer2: 'SegmentId',
        });
        return (
          <Tabs.Tab
            key={it.CompetitorName + `(${totalRow})`}
            label={it.CompetitorName + `(${totalRow})`}
            name={it.CompetitorName + `(${totalRow})`}
          >
            <View style={Styles.viewTabStyle}>
              {/* <HeaderTab key={'header_' + it.categoryName} listDataByCate={listDataByCate} listPhotoByCategory={listPhotoByCategory} itemTab={it} onUpdateNote={onUpdateNote}
                                endUpdateNote={endUpdateNote} onUpdateShelves={onUpdateShelves} lstReport={lstReport} Status={Status} handlerTakePhotoTemplate={handlerTakePhotoTemplate} takePhoto={takePhoto} showAlbum={showAlbum} /> */}
              <View style={{ flex: 1, minHeight: deviceHeight * 0.5 }}>
                {/* <FlashList
                                    estimatedItemSize={120}
                                    getItemLayout={getItemLayout}
                                    removeClippedSubviews={true}
                                    key={'List_' + it.CompetitorId}
                                    data={arr}
                                    keyExtractor={keyExtractor}
                                    ListFooterComponent={<Text style={Styles.footerStyle} >{arr.length == 0 ? 'Không có sản phẩm' : (arr.length > 5 ? 'Đã xem hết' : '')}</Text>}
                                    renderItem={({ item, index }) =>
                                        <RenderItem item={item} listDataByCompe={arr} index={index} data={data} Styles={Styles}
                                            listInput={dataView.listInput} appcolor={appcolor} workinfo={workinfo}
                                            // Status={Status} 
                                            dataView={dataView} listMaster={listMaster} listConfig={dataView.listConfig} />}
                                /> */}
                <FlatList
                  // estimatedItemSize={120}
                  getItemLayout={getItemLayout}
                  removeClippedSubviews={true}
                  key={'List_' + it.CompetitorId}
                  data={arr}
                  keyExtractor={keyExtractor}
                  ListFooterComponent={
                    <Text style={Styles.footerStyle}>
                      {arr.length == 0
                        ? 'Không có sản phẩm'
                        : arr.length > 5
                          ? 'Đã xem hết'
                          : ''}
                    </Text>
                  }
                  renderItem={({ item, index }) => (
                    <RenderItem
                      item={item}
                      listDataByCompe={arr}
                      index={index}
                      data={data}
                      Styles={Styles}
                      listInput={dataView.listInput}
                      appcolor={appcolor}
                      workinfo={workinfo}
                      // Status={Status}
                      dataView={dataView}
                      listMaster={listMaster}
                      listConfig={dataView.listConfig}
                    />
                  )}
                />
              </View>
            </View>
          </Tabs.Tab>
        );
      });
    };
    const contains = (item, query) => {
      const {
        ProductCode,
        ProductName,
        Category,
        Segment,
        SubCateName,
        SubCategory,
      } = item;
      const queryRemove = removeVietnameseTones(query)?.toLowerCase() || '';
      let SproductCode = ProductCode?.toLowerCase() || ProductCode;
      let SproductName = ProductName?.toLowerCase() || ProductName;
      let Scategory = Category?.toLowerCase() || Category;
      let Ssegment = Segment?.toLowerCase() || Segment;
      let SsubCateName = SubCateName?.toLowerCase() || SubCateName;
      let SsubCategory = SubCategory?.toLowerCase() || SubCategory;
      return (
        removeVietnameseTones(SproductCode)?.match(queryRemove) ||
        removeVietnameseTones(SproductName)?.match(queryRemove) ||
        removeVietnameseTones(Scategory)?.match(queryRemove) ||
        removeVietnameseTones(Ssegment)?.match(queryRemove) ||
        removeVietnameseTones(SsubCateName)?.match(queryRemove) ||
        removeVietnameseTones(SsubCategory)?.match(queryRemove)
      );
    };
    const filterProduct = async text => {
      if (text !== null && text.length > 0) {
        let dataSearch = [];
        const listUpload = dataByDealer.listCompetitorF;
        for (let indexC = 0; indexC < listUpload.length; indexC++) {
          const itemC = listUpload[indexC];
          const listProduct = JSON.parse(itemC.ListProduct || '[]');
          const listHave = filter(listProduct, item => {
            return contains(item, text);
          });
          dataSearch.push({
            ...itemC,
            ListProduct: JSON.stringify(listHave),
          });
        }
        dataByDealer.listCompetitor = dataSearch;
      } else {
        dataByDealer.listCompetitor = dataByDealer.listCompetitorF;
      }
      setSearch(text);
      // setMutate(e => !e)
    };
    const openSheet = () => {
      SheetManager.show('sheetFilter');
    };
    // const filterProduct = async (text) => {
    //     let dataSearch = []
    //     if (isDone)
    //         dataSearch = data.dataShowF.filter(it =>
    //             (it.quanity !== null && it.quanity >= 0) ||
    //             (it.price !== null && it.price >= 0) ||
    //             (it.quantityStock !== null && it.quantityStock >= 0) ||
    //             (it.quantitySuggest !== null && it.quantitySuggest >= 0) ||
    //             (it.fsmValue !== null && it.fsmValue >= 0))
    //     else
    //         dataSearch = data.dataShowF

    //     if (text !== null && text.length > 0) {
    //         const mResult = await dataSearch.filter((it) => {
    //             const nameProduct = it.productName ? it.productName.toUpperCase() : ''.toUpperCase();
    //             const textData = text.toUpperCase();
    //             return nameProduct.indexOf(textData) > -1
    //         })
    //         data.dataShow = mResult;
    //     } else {
    //         data.dataShow = dataSearch;
    //     }
    //     setMutate(e => !e)
    // }
    const containsHave = (item, query) => {
      for (
        let indexL = 0;
        indexL < dataByDealer.listInput?.length || 0;
        indexL++
      ) {
        const itemL = dataByDealer.listInput[indexL];
        if (
          item[itemL.displayType] !== null &&
          item[itemL.displayType] !== undefined &&
          (item[itemL.displayType] > 0 ||
            (item[itemL.displayType] == 0 && itemL.isZero == 1))
        )
          return true;
      }
      for (
        let indexN = 0;
        indexN < dataByDealer.listNote?.length || 0;
        indexN++
      ) {
        const itemN = dataByDealer.listNote[indexN];
        if (
          item[itemN.noteType] !== null &&
          item[itemN.noteType] !== undefined &&
          item[itemN.displayType] !== ''
        )
          return true;
      }
      return false;
    };
    const filterDoneProduct = () => {
      if (!isDone) {
        const dataCompe = [...dataView.listCompetitorF];
        // console.log();
        const arrFilterCompe = [];
        for (let indexC = 0; indexC < dataCompe?.length; indexC++) {
          const itemC = dataCompe[indexC];
          const listProduct = JSON.parse(itemC.ListProduct || '[]');
          const listHave = filter(listProduct, item => {
            return containsHave(item);
          });
          arrFilterCompe.push({
            ...itemC,
            ListProduct: JSON.stringify(listHave),
          });
        }
        dataView.listCompetitor = arrFilterCompe;
      } else {
        dataView.listCompetitor = dataView.listCompetitorF;
      }
      setDone(e => !e);
    };
    const clearData = () => {
      const dataCompe = [...dataView.listCompetitorF];
      // console.log();
      const arrClearCompe = [];
      for (let indexC = 0; indexC < dataCompe?.length; indexC++) {
        const itemC = dataCompe[indexC];
        const listProduct = JSON.parse(itemC.ListProduct || '[]');
        const arrClearProduct = [];
        for (let indexP = 0; indexP < listProduct?.length || 0; indexP++) {
          let itemP = listProduct[indexP];
          for (
            let indexL = 0;
            indexL < dataByDealer.listInput?.length || 0;
            indexL++
          ) {
            const itemL = dataByDealer.listInput[indexL];
            itemP[itemL.displayType] = null;
          }
          for (
            let indexL = 0;
            indexL < dataByDealer.listNote?.length || 0;
            indexL++
          ) {
            const itemN = dataByDealer.listNote[indexL];
            itemP[itemN.noteType] = null;
          }
          arrClearProduct.push(itemP);
        }
        arrClearCompe.push({
          ...itemC,
          ListProduct: JSON.stringify(arrClearProduct),
        });
      }
      dataView.listCompetitor = arrClearCompe;
      dataView.listCompetitorF = arrClearCompe;
    };
    const setClearAll = async () => {
      if (dataView.isUploaded !== 1) {
        Message(
          'Chú ý',
          'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
          async () => {
            await setProgress(true);
            await clearData();
            await setDone(false);
            SheetManager.hide('sheetFilter');
            setTimeout(async () => {
              await setProgress(false);
            }, 100);
          },
        );
      } else {
        ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
        SheetManager.hide('sheetFilter');
      }
    };

    const filterSelect = () => {
      if (!isSelect) {
        const dataCompe = [...dataView.listCompetitorF];
        // console.log();
        const arrFilterCompe = [];
        for (let indexC = 0; indexC < dataCompe?.length; indexC++) {
          const itemC = dataCompe[indexC];
          const listProduct = JSON.parse(itemC.ListProduct || '[]');
          const listHave = filter(listProduct, item => {
            return item.isCheck == 1;
          });
          arrFilterCompe.push({
            ...itemC,
            ListProduct: JSON.stringify(listHave),
          });
        }
        dataView.listCompetitor = arrFilterCompe;
      } else {
        dataView.listCompetitor = dataView.listCompetitorF;
      }
      setFilterSelect(e => !e);
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
            value={search}
            onClearTextAndroid={filterProduct}
            handleChangeForm={filterProduct}
          />
          <TouchableOpacity
            onPress={openSheet}
            style={Styles.buttonHeaderStyle}
          >
            <SpiralIcon
              name="ellipsis-vertical"
              type="ionicon"
              size={21}
              color={appcolor.dark}
            />
          </TouchableOpacity>
        </View>

        <View style={Styles.container}>
          {showProgress && (
            <View style={Styles.progressStyle}>
              <LoadingView
                title={'Đang tải dữ liệu...'}
                isLoading={showProgress}
                styles={{ marginTop: 8 }}
              />
            </View>
          )}
          {dataView.listCompetitor?.length > 0 && !showProgress && (
            <Tabs.Container
              ref={tabRef}
              renderTabBar={props => (
                <MaterialTabBar
                  {...props}
                  scrollEnabled={true}
                  tabStyle={{
                    borderRadius: 8,
                    backgroundColor: appcolor.light,
                    minWidth: minWidthTab(dataView.listCompetitor),
                    height: 38,
                    borderColor: appcolor.grayLight,
                    borderWidth: 1,
                    marginHorizontal: 5,
                  }}
                  labelStyle={{ fontSize: 14, fontWeight: '600' }}
                  indicatorStyle={{ backgroundColor: appcolor.transparent }}
                  inactiveColor={appcolor.dark}
                  activeColor={appcolor.primary}
                  style={{ backgroundColor: appcolor.surface }}
                />
              )}
              headerContainerStyle={{
                backgroundColor: appcolor.transparent,
                shadowColor: appcolor.transparent,
              }}
              containerStyle={{ backgroundColor: appcolor.surface }}
            >
              {ViewItem()}
            </Tabs.Container>
          )}
        </View>

        <ActionSheet
          id={'sheetFilter'}
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
              <TouchableOpacity
                onPress={filterDoneProduct}
                style={{ marginTop: 8 }}
              >
                <View
                  style={{
                    backgroundColor: isDone ? appcolor.light : appcolor.surface,
                    borderWidth: isDone ? 0.5 : 0,
                    borderColor: appcolor.success,
                    width: '100%',
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    padding: 4,
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
              <TouchableOpacity onPress={filterSelect} style={{ marginTop: 8 }}>
                <View
                  style={{
                    backgroundColor: isSelect
                      ? appcolor.light
                      : appcolor.surface,
                    borderWidth: isSelect ? 0.5 : 0,
                    borderColor: appcolor.success,
                    width: '100%',
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    padding: 4,
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
                    Xem dữ liệu đã chọn
                  </Text>
                </View>
              </TouchableOpacity>
              {dataView.isUploaded != 1 && (
                <TouchableOpacity
                  style={{ marginTop: 8 }}
                  onPress={setClearAll}
                >
                  <View
                    style={{
                      backgroundColor: appcolor.surface,
                      borderWidth: 0,
                      height: 50,
                      borderColor: appcolor.success,
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 4,
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
              )}
            </View>
          </View>
        </ActionSheet>
      </View>
    );
  },
);

const RenderItem = ({
  item,
  index,
  data,
  dataView,
  listDataByCompe,
  Styles,
  workinfo,
  listInput,
  appcolor,
  Status,
  lstReport,
  listMaster,
}) => {
  const [itemReport, _] = useState(item);
  const keyExtractor = useCallback(it => it.id.toString(), []);
  const [isCheck, setCheck] = useState(item.isCheck);
  const getItemLayout = (data, index) => ({
    length: 50,
    offset: 50 * index,
    index,
  });
  const handleSelectCheckBox = async () => {
    item.isCheck = item.isCheck === 1 ? 0 : 1;

    let dataProduct = [...listDataByCompe];
    const indexP = dataProduct.findIndex(it => it.ProductId === item.ProductId);
    dataProduct[indexP].isCheck = item.isCheck;
    const index = dataView.listCompetitor.findIndex(
      it => it.CompetitorId == item.Type,
    );
    const indexF = dataView.listCompetitorF.findIndex(
      it => it.CompetitorId === item.Type,
    );
    dataView.listCompetitor[index].ListProduct = JSON.stringify(dataProduct);
    dataView.listCompetitorF[indexF].ListProduct = JSON.stringify(dataProduct);

    await setCheck(item.isCheck);
  };
  const keyLayer2 = item[`${item.SubCatId}${item.SegmentId}`];

  return (
    <View
      key={'itemProduct_' + item.productId + index}
      style={{ width: '100%' }}
    >
      {item.isParent && (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <SpiralIcon
            name="tags"
            type="font-awesome-5"
            color={appcolor.primary}
            style={{ padding: 8 }}
            size={20}
          />
          <Text
            style={{ color: DEFAULT_COLOR, fontSize: 16, fontWeight: '700' }}
          >
            {item.SubCategory}
          </Text>
        </View>
      )}
      {keyLayer2 && item.Segment && (
        <View
          style={{
            flex: 1,
            padding: 8,
            marginTop: 5,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: appcolor.info,
              fontSize: 16,
              paddingLeft: 8,
              fontWeight: '600',
            }}
          >
            {item.Segment}
          </Text>
        </View>
      )}
      <View style={Styles.itemStyle}>
        <TouchableOpacity
          onPress={() => handleSelectCheckBox()}
          style={{
            position: 'absolute',
            top: 16,
            right: 8,
            width: '10%',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <SpiralIcon
            color={isCheck === 1 ? appcolor.success : appcolor.dark}
            size={25}
            name={isCheck === 1 ? 'check-square' : 'square'}
            type="feather"
          />
        </TouchableOpacity>
        <Text style={Styles.titleStyle}>
          {`${index + 1}. ` + item.ProductName}
        </Text>
        <Text style={Styles.textItemStyle}>{item.ProductCode}</Text>
        <View>
          <FlatList
            data={listInput}
            getItemLayout={getItemLayout}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => (
              <RenderItemInput
                itemInput={item}
                indexInput={index}
                item={itemReport}
                Styles={Styles}
                listInput={listInput}
                appcolor={appcolor}
                data={data}
                workinfo={workinfo}
                Status={Status}
                lstReport={lstReport}
                dataView={dataView}
                listDataByCompe={listDataByCompe}
              />
            )}
            style={{ padding: 5 }}
            numColumns={listInput.length > 4 || listInput.length === 3 ? 3 : 2}
            initialNumToRender={5}
            keyExtractor={keyExtractor}
          />
        </View>
        {dataView.listNote.length > 0 && (
          <RenderItemNote
            listNote={dataView.listNote}
            appcolor={appcolor}
            item={itemReport}
            listMaster={listMaster}
            data={data}
            workinfo={workinfo}
            Status={Status}
            listDataByCompe={listDataByCompe}
            dataView={dataView}
          />
        )}
      </View>
    </View>
  );
};
const RenderItemNote = ({
  listNote,
  appcolor,
  item,
  listMaster,
  data,
  workinfo,
  Status,
  listDataByCompe,
  dataView,
}) => {
  const insets = useSafeAreaInsets();
  const [showList, setShowList] = useState({
    isShowList: false,
    dataShow: [],
    noteSelect: {},
  });
  const [_, setMutate] = useState(false);
  const [isSelectOther, setSelectOther] = useState(true);
  const showListSelect = async it => {
    // const listBySelect = listMaster[it.noteType]
    // showList.isShowList = !showList.isShowList
    // showList.dataShow = listBySelect
    // showList.noteSelect = it
    // setMutate(e => !e)
    // await SheetManager.show('productSheet_' + item.productId)
  };
  const selectByList = async it => {
    // const indexF = data.dataShowF.findIndex(itP => itP.productId === item.productId && itP.workId === item.workId)
    // const index = data.dataShow.findIndex(itP => itP.productId === item.productId && itP.workId === item.workId)
    // if (it.id == 100) {
    //     data.dataShowF[indexF][showList.noteSelect?.noteType] = null
    //     data.dataShow[index][showList.noteSelect?.noteType] = null
    //     item[showList.noteSelect?.noteType] = null
    //     await updateItemDisplay(item, workinfo)
    //     await setSelectOther(e => !e)
    // } else {
    //     data.dataShowF[indexF][showList.noteSelect?.noteType] = it.name;
    //     data.dataShow[index][showList.noteSelect?.noteType] = it.name;
    //     item[showList.noteSelect?.noteType] = it.name
    //     await updateItemDisplay(item, workinfo)
    //     await setMutate(e => !e)
    //     await setSelectOther(false)
    // }
  };
  const onChangeNote = async (text, it) => {
    let dataProduct = [...listDataByCompe];
    const indexP = dataProduct.findIndex(it => it.ProductId === item.ProductId);

    dataProduct[indexP][it.noteType] = text;
    const index = dataView.listCompetitor.findIndex(
      it => it.CompetitorId == item.Type,
    );
    const indexF = dataView.listCompetitorF.findIndex(
      it => it.CompetitorId === item.Type,
    );

    dataView.listCompetitor[index].ListProduct = JSON.stringify(dataProduct);
    dataView.listCompetitorF[indexF].ListProduct = JSON.stringify(dataProduct);
    setMutate(e => !e);
  };
  // console.log(listNote,'list?NotelistNote');
  return (
    <View style={{ paddingTop: 2 }}>
      {listNote?.map((it, idx) => {
        return it.typeValue == 'selectText' ? (
          <View key={`${item.productId}_${it.noteType}`}>
            <TouchableOpacity
              key={it.noteType}
              onPress={() =>
                dataView.isUploaded !== 1 ? showListSelect(it) : null
              }
              style={{
                width: '100%',
                marginBottom: 4,
                shadowColor: appcolor.black,
                bottom: 2,
                shadowOffset: { width: 0, height: 1 },
                borderColor: appcolor.grayLight,
                borderWidth: 0.5,
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 35,
                  padding: 3,
                  borderRadius: 4,
                  borderColor: appcolor.grayLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: item[it.noteType]
                      ? appcolor.dark
                      : appcolor.placeholderText,
                  }}
                >
                  {item[it.noteType] || it.name}
                </Text>
                <SpiralIcon
                  type="font-awesome-5"
                  color={appcolor.dark}
                  name={'caret-down'}
                  style={{ paddingHorizontal: 10 }}
                  size={14}
                />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <FormGroup
            key={`${item.paddingLeftroductId}_${it.noteType}`}
            iconName={'comment-alt'}
            multiline={true}
            selectTextOnFocus={true}
            containerStyle={{
              backgroundColor: appcolor.light,
              width: '100%',
              minHeight: 30,
              padding: 3,
              marginTop: 4,
              marginBottom: 0,
              borderColor: appcolor.grayLight,
              borderWidth: 0.5,
            }}
            inputStyle={{
              fontSize: 13,
              color: appcolor.dark,
              borderColor: appcolor.grayLight,
            }}
            placeholder="Nhập ghi chú..."
            editable={dataView.isUploaded == 1 ? false : true}
            onClearTextAndroid={text => onChangeNote(text, it)}
            handleChangeForm={text => onChangeNote(text, it)}
            defaultValue={item[it.noteType] || ''}
          />
        );
      })}
      <ActionSheet
        id={'productSheet_' + item.ProductId}
        defaultOverlayOpacity={0.3}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
      >
        <View style={{ height: deviceHeight / 1.6 }}>
          <ScrollView style={{ marginHorizontal: 10 }}>
            {showList.dataShow?.map((itSelect, idxSelect) => {
              return (
                <TouchableOpacity
                  key={itSelect.id}
                  onPress={() => selectByList(itSelect)}
                  style={{
                    width: '100%',
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        itSelect.name == item[showList.noteSelect?.noteType]
                          ? appcolor.light
                          : appcolor.surface,
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: 35,
                      padding: 3,
                      borderRadius: 4,
                      borderWidth: 0.5,
                      borderColor:
                        itSelect.name == item[showList.noteSelect?.noteType] ||
                          (isSelectOther && itSelect.id == 100)
                          ? appcolor.success
                          : appcolor.grayLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '400',
                        color: appcolor.dark,
                      }}
                    >
                      {itSelect.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {isSelectOther && (
              <FormGroup
                key={'noteOther_' + item.ProductId}
                iconName={'comment-alt'}
                multiline={true}
                selectTextOnFocus={true}
                containerStyle={{
                  backgroundColor: appcolor.light,
                  width: '100%',
                  minHeight: 30,
                  padding: 3,
                  marginTop: 4,
                  marginBottom: 0,
                  borderColor: appcolor.grayLight,
                  borderWidth: 0.5,
                }}
                inputStyle={{
                  fontSize: 13,
                  color: appcolor.dark,
                  borderColor: appcolor.grayLight,
                }}
                placeholder="Nhập ghi chú..."
                editable={item.upload !== 1 ? true : false}
                onClearTextAndroid={() => onChangeNote('')}
                handleChangeForm={text => onChangeNote(text)}
                defaultValue={item[showList.noteSelect?.noteType] || ''}
              />
            )}
          </ScrollView>
        </View>
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
  Status,
  lstReport,
  dataView,
  listDataByCompe,
}) => {
  const [input, setInput] = useState(
    itemInput.isZero == 1
      ? item[itemInput.displayType] == 0
        ? 0
        : item[itemInput.displayType]
      : item[itemInput.displayType],
  );
  const [isError, setIsError] = useState(0);

  const changeValue = async text => {
    let value =
      text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : '';
    let intValue = value === '' ? null : parseInt(value);
    let dataProduct = [...listDataByCompe];
    const indexP = dataProduct.findIndex(it => it.ProductId === item.ProductId);
    if (intValue && intValue > 0) {
      item[itemInput.displayType] = intValue;
      dataProduct[indexP][itemInput.displayType] = intValue;
      // ToastError(`Nhập ${itemInput.name} không được nhỏ hơn`
      //     "Nhập  không được nhỏ hơn " + (itemInput.min || 1000), "Lỗi", "top");
    } else if (itemInput.isZero == 1 && intValue === 0) {
      item[itemInput.displayType] = 0;
      dataProduct[indexP][itemInput.displayType] = 0;
      intValue = 0;
    } else {
      item[itemInput.displayType] = null;
      dataProduct[indexP][itemInput.displayType] = null;
      intValue = null;
    }
    // parseInt(numberInput) < ((lstReport?.minPrice && lstReport?.minPrice !== '') ? lstReport?.minPrice : 1000)
    setInput(intValue);
    const index = dataView.listCompetitor.findIndex(
      it => it.CompetitorId == item.Type,
    );
    const indexF = dataView.listCompetitorF.findIndex(
      it => it.CompetitorId === item.Type,
    );

    dataView.listCompetitor[index].ListProduct = JSON.stringify(dataProduct);
    dataView.listCompetitorF[indexF].ListProduct = JSON.stringify(dataProduct);
  };
  const endInput = async e => {
    let value =
      e.nativeEvent.text !== null && e.nativeEvent.text.length > 0
        ? e.nativeEvent.text.toString().replace(/,/g, '')
        : '';
    let intValue = value === '' ? null : parseInt(value);
    let isError = 0;
    let dataProduct = [...listDataByCompe];
    const indexP = dataProduct.findIndex(it => it.ProductId === item.ProductId);
    if (
      intValue < (itemInput.min && itemInput.min !== '' ? itemInput.min : 1000)
    ) {
      intValue = null;
      isError = 1;
      ToastError(
        `Nhập ${itemInput.name} không được nhỏ hơn ${itemInput.min || 1000}!`,
        'Lỗi',
        'top',
      );
    } else if (
      intValue %
      (itemInput.min && itemInput.min !== '' ? itemInput.min : 1000) >
      0
    ) {
      intValue = null;
      isError = 1;
      ToastError('Nhập số tiền không được lẻ!', 'lỗi', 'top');
    } else if (
      intValue >
      (itemInput.max && itemInput.max !== '' ? itemInput.max : 1000000000)
    ) {
      intValue = null;
      isError = 1;
      ToastError(
        `Nhập ${itemInput.name} không được lớn hơn ${itemInput.max || 1000000000
        }!`,
        'Lỗi',
        'top',
      );
    } else {
      isError = 0;
    }
    item[itemInput.displayType] = intValue;
    dataProduct[indexP][itemInput.displayType] = intValue;
    // itemInput.isError = isError
    setIsError(isError);
    setInput(intValue);
    const index = dataView.listCompetitor.findIndex(
      it => it.CompetitorId == item.Type,
    );
    const indexF = dataView.listCompetitorF.findIndex(
      it => it.CompetitorId === item.Type,
    );

    dataView.listCompetitor[index].ListProduct = JSON.stringify(dataProduct);
    dataView.listCompetitorF[indexF].ListProduct = JSON.stringify(dataProduct);
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
                  isError === 1 ? appcolor.warning : appcolor.light,
              },
            ]}
            keyboardType="numeric"
            placeholder={itemInput.placeholder || 'Số lượng'}
            placeholderTextColor={appcolor.greydark}
            editable={dataView.isUploaded !== 1 ? true : false}
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
