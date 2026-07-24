import { useSelector } from 'react-redux';
import React, { useEffect, useState, useRef, Fragment, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  UIManager,
  Platform,
  LayoutAnimation,
} from 'react-native';
import { POSMContext } from '../../Controller/POSMController';
import { Badge, Divider, Icon } from '@rneui/themed';
import { scaleSize } from '../../Themes/AppsStyle';
import ActionSheet from 'react-native-actions-sheet';
import { NumPad } from '../../Control/NumPad';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import { deviceHeight, deviceWidth, minWidthTab } from '../../Core/Utility';
import FormGroup from '../../Content/FormGroup';
import { LoadingView } from '../../Control/ItemLoading';
import { groupDataByKey, Message } from '../../Core/Helper';
import { NumPad_V2 } from '../../Control/NumPad_V2';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const InputPosm = memo(({ upload, reload }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState);
  const tabRef = useRef();
  const ref_toolsSheet = useRef();
  const [dataPOSM, setDataPOSM] = useState({
    dataPOSM: [],
    dataPOSMF: [],
    groupData: [],
  });
  const [showProgress, setProgress] = useState(false);
  const [isDone, setDone] = useState(false);
  const [reloadView, setReloadView] = useState(false);
  const [_, setMutate] = useState(false);
  const [search, setSearch] = useState('');
  //end search product
  const loadData = async () => {
    await setProgress(true);
    const res = await POSMContext.PosmTargetGroup(workinfo);
    const result = await POSMContext.PosmTargetGetList(workinfo);
    const listData = result
      ? result
      : await POSMContext.PosmTargetGetList(workinfo);
    const { arr } = groupDataByKey({
      arr: listData,
      key: 'categoryId',
      keyLayer2: 'subCatId',
    });
    await setDataPOSM({ dataPOSM: arr, dataPOSMF: arr, groupData: res });
    await setProgress(false);
  };

  useEffect(() => {
    loadData();
    return () => false;
  }, [reload]);

  const filterDoneProduct = async () => {
    if (!isDone) {
      let lstRes = dataPOSM.dataPOSM.filter(
        it => it.displayValue !== null && it.displayValue > 0,
      );
      dataPOSM.dataPOSM = lstRes;
    } else {
      dataPOSM.dataPOSM = dataPOSM.dataPOSMF;
    }
    await setDone(e => !e);
    await reloadPOSM(true);
  };
  const reloadPOSM = type => {
    setReloadView(type);
  };
  const filterProduct = async text => {
    let dataSearch = [];
    if (isDone)
      dataSearch = dataPOSM.dataPOSMF.filter(
        it => it.displayValue !== null && it.displayValue >= 0,
      );
    else dataSearch = dataPOSM.dataPOSMF;

    if (text !== null && text.length > 0) {
      const mResult = await dataSearch.filter(it => {
        const nameProduct = it.productName
          ? it.productName.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return nameProduct.indexOf(textData) > -1;
      });
      dataPOSM.dataPOSM = mResult;
    } else {
      dataPOSM.dataPOSM = dataSearch;
    }
    setSearch(text);
    // setMutate(e => !e)
  };

  const clearData = async categoryId => {
    if (categoryId) {
      dataPOSM.dataPOSM.map(it => {
        if (it.categoryId === categoryId) {
          it.displayValue = null;
          it.posmList = null;
          it.posmNote = null;
        }
      });
      dataPOSM.dataPOSMF.map(it => {
        if (it.categoryId === categoryId) {
          it.displayValue = null;
          it.posmList = null;
          it.posmNote = null;
        }
      });
    } else {
      dataPOSM.dataPOSM.map(it => {
        it.displayValue = null;
        it.posmList = null;
        it.posmNote = null;
      });
      dataPOSM.dataPOSMF.map(it => {
        it.displayValue = null;
        it.posmList = null;
        it.posmNote = null;
      });
    }
  };

  const setClearAll = async itemCategory => {
    if (!upload) {
      Message(
        'Chú ý',
        `Bạn có chắc chắn muốn xóa hết dữ liệu ${
          itemCategory ? itemCategory.categoryName : ''
        } đã nhập ?`,
        async () => {
          await POSMContext.PosmClearData(
            workinfo,
            itemCategory?.categoryId || null,
          );
          await setDone(false);
          await clearData(itemCategory?.categoryId || null);
          await reloadPOSM(true);
          ref_toolsSheet.current?.hide();
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      ref_bottomSheet.current?.hide();
    }
  };
  const ButtonClearCate = () => {
    return (
      <TouchableOpacity
        style={[Styles.buttonSheetStyle, { borderColor: appcolor.danger }]}
        onPress={() =>
          setClearAll(dataPOSM.groupData[tabRef.current.getCurrentIndex()])
        }
      >
        <Text
          style={{ color: appcolor.danger, width: '80%', textAlign: 'center' }}
        >
          Xóa dữ liệu{' '}
          {dataPOSM.groupData[tabRef.current.getCurrentIndex()].categoryName} Đã
          nhập
        </Text>
        <SpiralIcon
          name={'trash'}
          type={'ionicon'}
          size={23}
          color={appcolor.danger}
        />
      </TouchableOpacity>
    );
  };

  const ViewItem = () => {
    return dataPOSM.groupData.map((g, index) => {
      const list = dataPOSM.dataPOSM.filter(it => it.category === g.category);
      const dataByTab = list?.sort((a, b) => b.addMore - a.addMore);
      const totalRow = dataByTab.length;
      return (
        <Tabs.Tab
          key={g.categoryName + `(${totalRow})`}
          label={g.categoryName + `(${totalRow})`}
          name={g.categoryName + `(${totalRow})`}
        >
          <View style={Styles.viewTabStyle}>
            <ItemPOSM
              item={g}
              index={index}
              upload={upload}
              dataPOSM={dataPOSM}
              dataByTab={dataByTab}
              Styles={Styles}
              reload={reloadView}
              reloadPOSM={reloadPOSM}
            />
          </View>
        </Tabs.Tab>
      );
    });
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
    viewTabStyle: {
      flex: 1,
      backgroundColor: appcolor.surface,
      marginTop: 40,
      width: deviceWidth,
      display: !showProgress ? 'flex' : 'none',
    },
    flatListTab: {
      padding: 7,
      marginBottom: 7,
      backgroundColor: appcolor.surface,
    },
    scrollSheet: { padding: 7, marginBottom: 20, flexGrow: 1 },
    closeSheet: { padding: 12, alignItems: 'center', marginBottom: 30 },
    itemListSheet: {
      padding: 7,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    textSheet: { width: '58%', color: appcolor.dark },
    inputNumSheet: { width: '40%' },
    viewPOSM: { padding: 7, width: '100%' },
    textPOSMStyle: {
      padding: 3,
      color: appcolor.dark,
      fontSize: scaleSize(12),
    },
    textButtonPOSM: {
      marginStart: 3,
      fontSize: scaleSize(12),
      fontWeight: 'bold',
      color: appcolor.dark,
    },
    viewItemRow: {
      padding: 5,
      borderRadius: 8,
      marginBottom: 7,
      backgroundColor: appcolor.light,
    },
    viewTitleRow: { padding: 3, flex: 1, flexDirection: 'row' },
    modelNameStyle: {
      marginStart: 3,
      fontSize: 14,
      fontWeight: 'bold',
      color: appcolor.dark,
    },
    subCatNameStyle: {
      color: appcolor.dark,
      opacity: 0.8,
      fontSize: 12,
      fontStyle: 'italic',
    },
    viewInputRow: { width: '100%', alignItems: 'flex-end' },
    viewNumPad: {
      flexDirection: 'column',
      minWidth: '35%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewMidleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
    },
    viewFooterRow: {
      width: '100%',
      justifyContent: 'center',
      marginTop: 20,
      height: 50,
      backgroundColor: appcolor.surface,
    },
    actionSheetStyle: { padding: 8, width: '100%', height: '40%' },
    buttonSheetStyle: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      justifyContent: 'space-between',
      borderRadius: 20,
      borderWidth: 0.5,
      marginTop: 5,
    },
    textSheetStyle: { width: '80%', textAlign: 'center' },
    headerItem: {
      flex: 1,
      padding: 8,
      marginTop: 5,
      marginBottom: 3,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.primary,
    },
    headerText: {
      color: appcolor.white,
      fontSize: 14,
      paddingLeft: 8,
      fontWeight: '600',
    },
  });

  const openSheet = () => {
    ref_toolsSheet.current.show();
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
          useClearAndroid={true}
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
      {dataPOSM.groupData.length > 0 &&
        dataPOSM.dataPOSM.length > 0 &&
        !showProgress && (
          <Tabs.Container
            ref={tabRef}
            key={'TapCategory'}
            pagerProps={{ scrollEnabled: false }}
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                indicatorStyle={{
                  backgroundColor: appcolor.primary,
                }}
                inactiveColor={appcolor.dark}
                activeColor={appcolor.dark}
                scrollEnabled={true}
                style={{ backgroundColor: appcolor.light }}
                tabStyle={{
                  minWidth: minWidthTab(dataPOSM.groupData),
                  height: 42,
                }}
              />
            )}
            containerStyle={{ backgroundColor: appcolor.surface }}
          >
            {ViewItem()}
          </Tabs.Container>
        )}
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
          <View style={{ width: '100%', height: 100 }}>
            <Text style={Styles.titleStyle}>Công cụ</Text>
            <TouchableOpacity
              style={[
                Styles.buttonSheetStyle,
                { borderColor: appcolor.dark, marginTop: 12 },
              ]}
              onPress={filterDoneProduct}
            >
              <Text style={[Styles.textSheetStyle, { color: appcolor.dark }]}>
                Sản phẩm đã kiểm tra
              </Text>
              <SpiralIcon
                name={!isDone ? 'checkmark-circle-outline' : 'check-circle'}
                type={!isDone ? 'ionicon' : ''}
                size={23}
                color={!isDone ? appcolor.dark : appcolor.success}
              />
            </TouchableOpacity>
            <ButtonClearCate />
            <TouchableOpacity
              style={[
                Styles.buttonSheetStyle,
                { borderColor: appcolor.danger },
              ]}
              onPress={() => setClearAll()}
            >
              <Text
                style={{
                  color: appcolor.danger,
                  width: '80%',
                  textAlign: 'center',
                }}
              >
                Xóa dữ liệu đã nhập
              </Text>
              <SpiralIcon
                name={'trash'}
                type={'ionicon'}
                size={23}
                color={appcolor.danger}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
});

const ItemPOSM = memo(
  ({
    item,
    indexList,
    upload,
    dataPOSM,
    dataByTab,
    Styles,
    reload,
    reloadPOSM,
  }) => {
    const [dataItem, setDataItem] = useState(dataByTab);
    const loadData = async dataFilter => {
      const _temp = (dataFilter ? dataFilter : dataByTab).filter(e => {
        if (e.category === item.category) {
          e.totalRow = item.totalRow;
          return e;
        }
      });
      const list = _temp?.sort((a, b) => b.addMore - a.addMore);
      setDataItem(list);
      reloadPOSM(false);
    };

    useEffect(() => {
      // reload === true && loadData()
      return () => false;
    }, [reload]);

    const removeAdd = async item => {
      await POSMContext.removeProduct(item);
      const dataFilter = dataPOSM.dataPOSM.filter(it => it.id !== item.id);
      const dataFilterF = dataPOSM.dataPOSMF.filter(it => it.id !== item.id);
      dataPOSM.dataPOSM = dataFilter;
      dataPOSM.dataPOSMF = dataFilterF;
      const list = dataFilter?.sort((a, b) => b.addMore - a.addMore);
      const { arr } = groupDataByKey({
        arr: list,
        key: 'categoryId',
        keyLayer2: 'subCatId',
      });
      setDataItem(arr);
    };

    return (
      <View style={Styles.container}>
        <FlatList
          data={dataItem}
          key={'ListItem_' + indexList}
          style={Styles.flatListTab}
          scrollToOverflowEnabled={true}
          initialNumToRender={7}
          keyExtractor={(_, index) => index.toString()}
          ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
          renderItem={({ item, index }) => (
            <RenderRow
              key={indexList + '_item_' + index}
              indexList={indexList}
              item={item}
              index={index}
              Styles={Styles}
              removeAdd={removeAdd}
              upload={upload}
            />
          )}
        />
      </View>
    );
  },
);
const RenderRow = memo(
  ({ item, index, indexList, Styles, upload, removeAdd }) => {
    const insets = useSafeAreaInsets();
    const { appcolor } = useSelector(state => state.GAppState);
    let jsonPosm = JSON.parse(
      item?.posmList && item?.posmList !== 'null'
        ? item?.posmList
        : `[{"posmId": 0,"posmName": "Thêm","productId":${item.productId}}]`,
    );

    const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];
    const [_, setMutate] = useState(false);
    const _sheetPosm = useRef();
    const [posmByP, setPosmByP] = useState([]);

    const showSheetPosm = async () => {
      let posmGuid = [];
      if (item.posmList === null || item.posmList === 'null') {
        // Ngoài guidline
        posmGuid = await POSMContext.PosmInGuid(item.productId);
      } else {
        //in GUID
        posmGuid = JSON.parse(item.posmList);
      }
      await setPosmByP(posmGuid);
      await _sheetPosm.current.show();
    };

    const handerNumberChange = (item, e, type) => {
      let intValue =
        type == 'displayValue'
          ? e === null || e === ''
            ? null
            : parseInt(e)
          : e == null || e == 'null'
          ? ''
          : e;
      item[type] = intValue;
      POSMContext.PosmUpdate(item);
      setMutate(e => !e);
    };
    const handerChangePosm = (itemPosm, e) => {
      let intPosm = e === null || e === '' ? 0 : parseInt(e);
      itemPosm.posmValue = intPosm;
      const jsonPosmItem = JSON.stringify(posmByP);
      item.posmList = jsonPosmItem;
      POSMContext.PosmUpdate(item);
      setMutate(e => !e);
    };

    return (
      <View key={indexList + '_View_' + index} style={Styles.container}>
        {keyLayer2 && (
          <View style={Styles.headerItem}>
            <SpiralIcon
              name="tags"
              type="font-awesome-5"
              size={15}
              color={appcolor.white}
            />
            <Text style={Styles.headerText}>{item.subCategory}</Text>
          </View>
        )}
        <View key={'dss' + index} style={Styles.viewItemRow}>
          {!upload && (
            <TouchableOpacity
              onPress={() => removeAdd(item)}
              style={{
                width: 50,
                padding: 5,
                display: item.addMore ? 'flex' : 'none',
                flexDirection: 'row',
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
            style={[
              Styles.viewTitleRow,
              {
                justifyContent: 'space-between',
                justifyContent: 'center',
                padding: 5,
              },
            ]}
          >
            <View style={Styles.viewTitleRow}>
              <Badge status="warning" value={index + 1} />
              <Text style={Styles.modelNameStyle}>{item.productName}</Text>
            </View>
          </View>
          {}
          <View style={Styles.viewTitleRow}>
            <FormGroup
              key={indexList + '_Note_' + index}
              containerStyle={{
                padding: 3,
                marginTop: 5,
                backgroundColor: appcolor.light,
                flex: 1,
              }}
              inputStyle={{ fontSize: 13 }}
              multiline
              editable={!upload}
              value={item.posmNote || ''}
              placeholder="Nhập ghi chú"
              iconName={'comment-alt'}
              onClearTextAndroid={e => handerNumberChange(item, e, 'posmNote')}
              handleChangeForm={e => handerNumberChange(item, e, 'posmNote')}
            />
          </View>

          <View style={Styles.viewInputRow}>
            <View style={Styles.viewMidleRow}>
              <View
                style={{
                  flexGrow: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {item.defaultValue > 0 && (
                  <Text style={Styles.textPOSMStyle}>
                    Chỉ tiêu : {item.defaultValue}
                  </Text>
                )}
              </View>
              <View style={Styles.viewNumPad}>
                <NumPad_V2
                  inputStyle={{
                    backgroundColor: appcolor.surface,
                    width: 60,
                    padding: 6,
                  }}
                  index={index}
                  iconSize={14}
                  value={item.displayValue}
                  placeholderText={'SL'}
                  upload={upload}
                  item={item}
                  editable={true}
                  // reloadNum={reloadNum}
                  handerNumberChange={(it, e) =>
                    handerNumberChange(it, e, 'displayValue')
                  }
                />
              </View>
            </View>
            {jsonPosm.length > 0 && (
              <POSMUI
                key={item.productCode}
                props={{
                  posmData: jsonPosm,
                  onShowPosm: showSheetPosm,
                  item: item,
                  Styles: Styles,
                }}
              />
            )}
          </View>
        </View>

        <ActionSheet
          key={'POSMSheet' + index}
          ref={_sheetPosm}
          defaultOverlayOpacity={0.3}
          containerStyle={{
            backgroundColor: appcolor.light,
            paddingBottom: insets.bottom,
          }}
          closeOnPressBack={true}
          gestureEnabled={true}
          indicatorColor={appcolor.primary}
        >
          {posmByP.length > 0 && (
            <ScrollView style={Styles.scrollSheet}>
              <FlatList
                data={posmByP}
                renderItem={({ item, index }) => {
                  return (
                    <Fragment>
                      <View index={`${index}nnma`} style={Styles.itemListSheet}>
                        <Text style={Styles.textSheet}>{item.posmName}</Text>
                        <NumPad_V2
                          inputStyle={{
                            backgroundColor: appcolor.surface,
                            width: 60,
                            padding: 6,
                          }}
                          index={index}
                          iconSize={14}
                          value={item.posmValue}
                          placeholderText={'SL'}
                          upload={upload}
                          item={item}
                          editable={true}
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
          )}
          <TouchableOpacity
            onPress={() => _sheetPosm.current.hide()}
            style={Styles.closeSheet}
          >
            <Text> Đóng </Text>
          </TouchableOpacity>
        </ActionSheet>
      </View>
    );
  },
);
const POSMUI = memo(({ props }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { posmData, item, onShowPosm, Styles } = props;
  useEffect(() => {
    return () => false;
  }, [posmData]);
  return (
    <View style={Styles.viewPOSM}>
      <Text style={Styles.textPOSMStyle}>Các loại posm dán trên sản phẩm</Text>
      <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
        {posmData?.map((v, index) => {
          return (
            <View
              style={{
                borderRadius: 40,
                marginEnd: 5,
                backgroundColor:
                  v.posmValue > 0 ? appcolor.surface : appcolor.warning,
              }}
              key={`${item.productId}ka02${index}`}
            >
              <TouchableOpacity
                disabled={item.displayValue > 0 ? false : true}
                onPress={() => onShowPosm(item)}
                style={{ padding: 8 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Badge status="error" value={v.posmTarget} />
                  <Text style={Styles.textButtonPOSM}>{v.posmName} </Text>
                  {!isNaN(v.posmValue) && v.posmValue !== null && (
                    <Badge status="success" value={v.posmValue} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});
