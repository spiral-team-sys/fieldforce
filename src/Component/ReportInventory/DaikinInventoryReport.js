import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  View,
  Text,
  TextInput,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { CheckBox, Icon } from '@rneui/themed';
import { getStockoutResult } from '../../Controller/WorkController';
import { checkNetwork, deviceWidth, minWidthTab } from '../../Core/Utility';
import {
  isNotInteger,
  Message,
  MessageAction,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { _competitorId, _competitorName } from '../../Core/URLs';
import { isIphoneX } from '../../Core/is-iphone-x';
import UploadController from '../../Controller/UploadController';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import {
  clearAllDataStock,
  clearStockByCategory,
  getAllCategoryByProduct,
  getCompetitorByProduct,
  getlistTabByCategory,
  getStockProduct,
  updateStockItem,
  updateStockNote,
} from '../../Controller/StockOutController';
import NumberFormat from 'react-number-format';
import FormGroup from '../../Content/FormGroup';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { deviceHeight } from '../Home';
import { LoadingView } from '../../Control/ItemLoading';
import { MutipleItemSelected } from '../../Control/MutipleItemSelected';
import moment from 'moment';

import RNFS from 'react-native-fs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const HEADER_SIZE = Platform.OS == 'android' ? 60 : isIphoneX() ? 90 : 20;

export const DaikinInventoryReport = ({ navigation }) => {
  const [arrTagShow, setArrTagShow] = useState([]);
  const [arrDataShow, setArrDataShow] = useState([]);
  const [arrDataShowF, setArrDataShowF] = useState([]);
  const [dataCompetitor, setDataCompetitor] = useState([]);
  const [competitorName, setCompetitorName] = useState(_competitorName);

  const [showProgress, setProgress] = useState(false);
  const [isDone, setDone] = useState(false);
  const [Status, setStatus] = useState(false);
  const { appcolor, workinfo, kpiinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [isClear, setClear] = useState(0);
  const [search, setSearch] = useState('');
  const tabRef = useRef();
  const [note, setNote] = useState({ noteStock: '' });
  const [dataTabByCompe, setDataTabByCompe] = useState([]);
  const [data, setData] = useState({
    arrDataShow: [],
    arrDataShowF: [],
    dataCompetitor: [],
    arrTagShow: [],
  });
  const [reload, setReload] = useState(0);

  const loadDataShow = async () => {
    setProgress(true);
    let lstRes = await getStockoutResult(workinfo);
    let isUpload = lstRes.length > 0 ? lstRes[0].upload : 0;

    let day = parseInt(moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setStatus(isUpload);
    } else {
      await setStatus(1);
    }

    await setArrDataShowF([]);
    await setArrDataShow([]);
    const lstItemsProgram = await getStockProduct(workinfo);
    const lstTab = await getAllCategoryByProduct();
    const lstCompetitor = await getCompetitorByProduct();
    const dataTab = lstTab.filter(it => it.competitorId == _competitorId);
    noteStock = lstItemsProgram[0]?.displayComment || '';
    await setData({
      arrDataShow: lstItemsProgram,
      arrDataShowF: lstItemsProgram,
      arrTagShow: lstTab,
      dataCompetitor: lstCompetitor,
    });
    await setDataTabByCompe(dataTab);
    await setDataCompetitor(lstCompetitor);
    await setArrTagShow(lstTab);
    await setArrDataShowF(lstItemsProgram);
    await setArrDataShow(lstItemsProgram);
    setTimeout(async () => {
      await setProgress(false);
    }, 100);
  };
  const filterDoneData = async () => {
    let done = !isDone;
    let lstData = arrDataShow.filter(
      it =>
        (it.quanity !== null && it.quanity >= 0) || it.haveBusiness !== null,
    );
    if (done) {
      await setArrDataShow(lstData);
    } else {
      await setArrDataShow(arrDataShowF);
      await setSearch('');
    }
    await setDone(e => !e);
  };
  const filterProduct = async text => {
    if (text) {
      const newDataShow = data.arrDataShowF.filter(it => {
        const nameProduct = it.productName
          ? it.productName.toUpperCase()
          : ''.toUpperCase();
        const textSearch = text.toUpperCase();
        return nameProduct.indexOf(textSearch) > -1;
      });
      data.arrDataShow = newDataShow;
      // setArrDataShow(newDataShow)
      setSearch(text);
    } else {
      data.arrDataShow = data.arrDataShowF;
      // setArrDataShow(arrDataShowF)
      setDone(false);
      setSearch(text);
    }
  };
  const handlerSelectCompetitor = async item => {
    await setProgress(true);
    await setCompetitorName(item.itemName);
    const dataTab = arrTagShow.filter(it => it.competitorId == item.id);
    const dataByCompetitor = await getStockProduct(workinfo, item.id);
    data.arrDataShowF = dataByCompetitor;
    data.arrDataShow = dataByCompetitor;
    await setDataTabByCompe(dataTab);
    // await setArrDataShowF(dataByCompetitor);
    // await setArrDataShow(dataByCompetitor);
    await setProgress(false);
  };
  useEffect(() => {
    setCompetitorName(_competitorName);
    loadDataShow();
    return () => {
      Keyboard?.dismiss();
      false;
    };
  }, []);
  const uploadAction = async () => {
    await Keyboard.dismiss();
    if (Status === 1) {
      ToastError('Báo cáo đã khóa');
      return;
    }
    let resStock = await getStockoutResult(workinfo);
    let itemsUpload = resStock.filter(
      it =>
        (it.quanity !== 'null' && it.quanity !== null) ||
        it.haveBusiness !== null,
    );
    if (itemsUpload.length === 0) {
      ToastError('Vui lòng làm báo cáo');
      return;
    } else {
      for (let i = 0, lenList = itemsUpload.length; i < lenList; i++) {
        const item = itemsUpload[i];
        if (item.division == _competitorName) {
          if (item.haveBusiness == 1 && item.quanity == null) {
            ToastError(
              `Sản phẩm ${item.division} - ${item.productName} có kinh doanh nhưng chưa nhập số lượng`,
            );
            return;
          }
        }
      }
    }
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => UploadData(resStock),
    );
  };
  const UploadData = async resStock => {
    const work = { ...workinfo, reportId: kpiinfo.kpiId };
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    await UploadController.DataStock(
      resStock,
      work,
      async () => {
        await setCompetitorName(_competitorName);
        await loadDataShow();
      },
      async () => { },
    );
  };
  const setClearAll = async () => {
    if (Status !== 1) {
      MessageAction(
        `Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?`,
        async () => {
          await clearAllDataStock(workinfo);
          await setDone(false);
          await loadDataShow();
          SheetManager.hide('actionStock');
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      SheetManager.show('actionStock');
    }
  };
  const handlerClearByCategory = async itemCategory => {
    if (Status !== 1) {
      MessageAction(
        `Bạn có muốn xoá dữ liệu ngành hàng ${itemCategory.categoryName} đã nhập không ?`,
        async () => {
          await clearStockByCategory(workinfo, itemCategory.categoryId);
          await setDone(false);
          await loadDataShow();
          SheetManager.hide('actionStock');
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      SheetManager.show('actionStock');
    }
  };
  const ViewItem = () => {
    let dataByCategoryId = [];
    return arrTagShow.map(it => {
      dataByCategoryId =
        data.arrDataShow?.filter(i => i.categoryName === it.categoryName) || [];
      const totalRow = dataByCategoryId.length || 0;
      const label = `${it.categoryName || ''} (${totalRow})`;
      return dataByCategoryId.length > 0 ? (
        <Tabs.Tab key={it.categoryName} label={label} name={label}>
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
              display: !showProgress ? 'flex' : 'none',
            }}
          >
            <FlatList
              contentContainerStyle={{ paddingBottom: 30 }}
              key={item => item.id}
              keyExtractor={(item, index) => item + index}
              data={data}
              updateCellsBatchingPeriod={20}
              removeClippedSubviews={false}
              windowSize={10}
              renderItem={({ item, index }) => (
                <RenderItemData
                  item={item}
                  details={arrDataShowF}
                  isClear={isClear}
                  totalRow={totalRow}
                  index={index}
                  dataFilter={arrDataShow}
                  appcolor={appcolor}
                  workinfo={workinfo}
                />
              )}
            />
            {/* <KeyboardSpacer topSpacing={Platform.OS === 'android' ? 40 : null} /> */}
          </View>
        </Tabs.Tab>
      ) : null;
    });
  };

  const handleEndChangeNote = async () => {
    if (note.noteStock?.length > 0 && note.noteStock?.length < 5) {
      ToastError('Vui lòng nhập ghi chú ít nhất 5 ký tự!!', 'Thông báo', 'top');
      setNote('');
      return;
    }

    const result = await updateStockNote(note.noteStock, workinfo);
    if (result) {
      note.noteStock?.length !== 0 &&
        ToastSuccess('Đã lưu ghi chú.', 'Thông báo', 'top');
    } else {
      ToastError('Lưu ghi chú lỗi!!', 'Thông báo', 'top');
    }
  };
  const openSheet = () => {
    Keyboard.dismiss();
    SheetManager.show('actionStock');
    // ref_bottomSheet.current.show()
  };

  const reloadView = () => [setReload(reload + 1)];

  const ViewItemStock = () => {
    return (
      // <KeyboardAvoidingView
      //     style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
      //     behavior={Platform.OS === "ios" ? "padding" : null}
      //     keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
      // {
      dataTabByCompe.length > 0 && (
        <InputStockItem
          dataTabByCompe={dataTabByCompe}
          data={data}
          arrDataShow={arrDataShow}
          arrDataShowF={arrDataShowF}
          arrTagShow={arrTagShow}
          showProgress={showProgress}
          Status={Status}
          loadDataShow={loadDataShow}
          reload={reload}
          reloadView={reloadView}
        />
      )
      // }
      // </KeyboardAvoidingView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        leftFunc={() => navigation.goBack()}
        rightFunc={Status !== 1 ? () => uploadAction() : null}
        iconMiddle="poll-h"
        middleFunc={openSheet}
      />
      <View
        style={{
          backgroundColor: appcolor.light,
          width: '100%',
          height: Dimensions.get('window').height - HEADER_SIZE,
        }}
      >
        <FormGroup
          containerStyle={{
            backgroundColor: appcolor.surface,
            margin: 8,
            marginBottom: 0,
            alignSelf: 'center',
          }}
          inputStyle={{ fontSize: 13, color: appcolor.dark }}
          placeholder="Tìm kiếm sản phẩm"
          editable
          onEndEditing={() => setDone(false)}
          onClearTextAndroid={filterProduct}
          iconName="search"
          value={search}
          handleChangeForm={filterProduct}
        />
        <FormGroup
          iconName={'comment-alt'}
          multiline={true}
          selectTextOnFocus={true}
          containerStyle={{
            backgroundColor: appcolor.surface,
            margin: 8,
            marginBottom: 0,
            alignSelf: 'center',
          }}
          inputStyle={{ fontSize: 13, color: appcolor.dark }}
          placeholder="Nhập ghi chú..."
          editable
          onEndEditing={handleEndChangeNote}
          onClearTextAndroid={handleEndChangeNote}
          handleChangeForm={text => (note.noteStock = text)}
          defaultValue={note.noteStock || ''}
        />
        <MutipleItemSelected
          typeItem={'COMPETITOR'}
          containerStyle={{ flexGrow: 0 }}
          dataItems={dataCompetitor}
          defaultValue={competitorName}
          onItemChoose={handlerSelectCompetitor}
        />
        <ViewItemStock />
        {/* {arrTagShow.length > 0 && arrDataShow.length > 0 &&
                    <Tabs.Container
                        ref={tabRef}
                        containerStyle={{ backgroundColor: appcolor.surface }}
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                                indicatorStyle={{ backgroundColor: appcolor.primary }}
                                inactiveColor={appcolor.dark}
                                activeColor={appcolor.dark}
                                tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 42 }}
                                scrollEnabled={true}
                                style={{ backgroundColor: appcolor.light }}
                            />
                        )} >
                        {ViewItem()}
                    </Tabs.Container>
                } */}
      </View>

      {showProgress && (
        <View
          style={{
            position: 'absolute',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: deviceHeight / 2,
          }}
        >
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={showProgress}
            styles={{ marginTop: 8 }}
          />
        </View>
      )}
    </View>
  );
};

const InputStockItem = ({
  data,
  dataTabByCompe,
  arrDataShowF,
  arrDataShow,
  arrTagShow,
  showProgress,
  Status,
  loadDataShow,
  reload,
  reloadView,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [dataTab, setDataTab] = useState([]);
  const tabRef = useRef();
  const [mode, setMode] = useState('TOOLS');
  const [isDone, setDone] = useState(false);
  const [__, setMutate] = useState(false);
  // const [load, setLoad] = useState(0)
  const [isClearByCate, setClearByCate] = useState({
    isClearByCate: 0,
    isClearAll: 0,
    isClear: 0,
  });

  useEffect(() => {
    loadDataTab();
    return () => false;
  }, [dataTabByCompe, reload]);
  const setClearAll = async () => {
    if (Status !== 1) {
      MessageAction(
        `Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?`,
        async () => {
          await clearAllDataStock(workinfo);
          await clearAll();
          await setDone(false);
          await setClearByCate({
            ...isClearByCate,
            isClear: isClearByCate.isClear + 1,
            isClearAll: 1,
          });
          // await loadDataShow()
          SheetManager.hide('actionStock');
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      SheetManager.show('actionStock');
    }
  };
  const clearDataByCate = itemCategory => {
    data.arrDataShow.map(it => {
      if (
        it.categoryId == itemCategory.categoryId &&
        it.divisionId == itemCategory.competitorId
      ) {
        it.quanity = null;
        it.haveBusiness = null;
      }
    });
    data.arrDataShowF.map(it => {
      if (
        it.categoryId == itemCategory.categoryId &&
        it.divisionId == itemCategory.competitorId
      ) {
        it.quanity = null;
        it.haveBusiness = null;
      }
    });
  };
  const clearAll = () => {
    data.arrDataShow.map(it => {
      it.quanity = null;
      it.haveBusiness = null;
    });
    data.arrDataShowF.map(it => {
      it.quanity = null;
      it.haveBusiness = null;
    });
  };
  const handlerClearByCategory = async itemCategory => {
    if (Status !== 1) {
      MessageAction(
        `Bạn có muốn xoá dữ liệu ngành hàng ${itemCategory.categoryName} thuộc hãng ${itemCategory.competitorName} đã nhập không ?`,
        async () => {
          await clearStockByCategory(workinfo, itemCategory);
          await clearDataByCate(itemCategory);
          await setDone(false);
          await setClearByCate({
            ...itemCategory,
            isClearByCate: isClearByCate.isClearByCate + 1,
          });
          // await reloadView()
          // await loadDataShow()
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
    let lstData = data.arrDataShow.filter(
      it =>
        (it.quanity !== null && it.quanity >= 0) || it.haveBusiness !== null,
    );
    if (done) {
      data.arrDataShow = lstData;
      // await setMutate(e => !e)
      // await setArrDataShow(lstData)
    } else {
      data.arrDataShow = arrDataShowF;
      // await setArrDataShow(arrDataShowF)
      // await setSearch('')
    }
    await setDone(e => !e);
  };

  const loadDataTab = async () => {
    setDataTab(dataTabByCompe);
  };

  const ViewItem = () => {
    let dataByCategoryId = [];
    return dataTab.map(it => {
      dataByCategoryId =
        data.arrDataShow?.filter(i => i.categoryName === it.categoryName) || [];
      const totalRow = dataByCategoryId.length || 0;
      const label = `${it.categoryName || ''} (${totalRow})`;
      return (
        <Tabs.Tab key={it.categoryName} label={label} name={label}>
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
              display: !showProgress ? 'flex' : 'none',
            }}
          >
            <ViewListItemStock
              totalRow={totalRow}
              dataByCategoryId={dataByCategoryId}
              it={it}
              isClearByCate={isClearByCate}
            />
            <KeyboardSpacer
              topSpacing={Platform.OS === 'android' ? 40 : null}
            />
          </View>
        </Tabs.Tab>
      );
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {dataTab.length === dataTabByCompe.length && (
        <Tabs.Container
          ref={tabRef}
          containerStyle={{ backgroundColor: appcolor.surface }}
          renderTabBar={props => (
            <MaterialTabBar
              {...props}
              labelStyle={{ fontSize: 14, fontWeight: '600' }}
              indicatorStyle={{ backgroundColor: appcolor.primary }}
              inactiveColor={appcolor.dark}
              activeColor={appcolor.dark}
              tabStyle={{ minWidth: minWidthTab(dataTab), height: 42 }}
              scrollEnabled={true}
              style={{ backgroundColor: appcolor.light }}
            />
          )}
        >
          {ViewItem()}
        </Tabs.Container>
      )}
      <ActionSheet
        id="actionStock"
        gestureEnabled
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ padding: 8, width: '100%' }}>
          {mode == 'TOOLS' && (
            <ToolsAction
              clearAllData={setClearAll}
              clearByCategory={handlerClearByCategory}
              itemInput={filterDoneData}
              dataTab={dataTabByCompe}
              tabRef={tabRef}
              showInputView={isDone}
              isLock={Status}
            />
          )}
        </View>
      </ActionSheet>
    </View>
  );
};
const ViewListItemStock = ({
  totalRow,
  dataByCategoryId,
  it,
  isClearByCate,
}) => {
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const loadView = () => {
    setLoading(true);
    setTimeout(async () => {
      await setProgress(false);
    }, 100);
  };
  useEffect(() => {
    return () => false;
  }, [isClearByCate.isClearByCate]);
  return !loading ? (
    <FlatList
      contentContainerStyle={{ paddingBottom: 30 }}
      key={'listItemStock' + it.categoryName}
      keyExtractor={(item, index) => index.toString()}
      data={dataByCategoryId}
      updateCellsBatchingPeriod={20}
      removeClippedSubviews={false}
      ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
      windowSize={10}
      renderItem={({ item, index }) => (
        <RenderItemData
          item={item}
          totalRow={totalRow}
          index={index}
          isClearByCate={isClearByCate}
          appcolor={appcolor}
          workinfo={workinfo}
        />
      )}
    />
  ) : null;
};

const RenderItemData = ({
  item,
  isClearByCate,
  appcolor,
  workinfo,
  totalRow,
  index,
}) => {
  const [inputDisplay, setInputDisplay] = useState(item.quanity);
  const [haveBusiness, setHaveBusiness] = useState(item.haveBusiness);
  const [countClear, setCountClear] = useState({ countClear: 0 });

  // if ((!inputDisplay && item.quanity) || (!haveBusiness && item.haveBusiness)) {
  //     console.log('check 1');
  //     // setHaveBusiness(item.haveBusiness)
  //     // setInputDisplay(item.quanity)
  // } else if (((!item.quanity && inputDisplay) || (!item.haveBusiness && (haveBusiness == 0 || haveBusiness == 1))) && isClear !== 0) {
  //     console.log('check 2');
  //     setHaveBusiness(item.haveBusiness)
  //     setInputDisplay(item.quanity)
  // } else if (((!item.quanity && inputDisplay == 0) || (!item.haveBusiness && (haveBusiness == 0 || haveBusiness == 1))) && isClear !== 0 && (isClear - countClear > 0)) {
  //     setCountClear(isClear)
  //     console.log('check 3');
  //     setHaveBusiness(null)
  //     setInputDisplay(null);
  // }

  // console.log((item.quanity !== null && item.quanity >= 0 && inputDisplay !== null && inputDisplay >= 0), inputDisplay, item.quanity
  //     , (item.haveBusiness !== null && item.haveBusiness >= 0 && haveBusiness !== null && haveBusiness >= 0), haveBusiness, item.haveBusiness, isClearByCate, item,
  //     isClearByCate, isClearByCate.isClearByCate, countClear, isClearByCate.categoryId === item.categoryId, isClearByCate.competitorId === item.divisionId, 'chekc load 2');

  if (
    ((!item.quanity && inputDisplay !== null && inputDisplay >= 0) ||
      (!item.haveBusiness && haveBusiness !== null && haveBusiness >= 0)) &&
    isClearByCate.isClear !== 0 &&
    isClearByCate.isClear - countClear.countClear > 0 &&
    isClearByCate.isClearAll === 1
  ) {
    countClear.countClear = isClearByCate.isClear;
    setInputDisplay(null);
    setHaveBusiness(null);
  }
  if (
    ((!item.quanity && inputDisplay !== null && inputDisplay >= 0) ||
      (!item.haveBusiness && haveBusiness !== null && haveBusiness >= 0)) &&
    isClearByCate.isClearByCate !== 0 &&
    isClearByCate.isClearByCate - countClear.countClear > 0 &&
    isClearByCate.categoryId === item.categoryId &&
    isClearByCate.competitorId === item.divisionId
  ) {
    countClear.countClear = isClearByCate.isClearByCate;
    setInputDisplay(null);
    setHaveBusiness(null);
  }

  const onCheckedItem = async action => {
    isClearByCate.isClearAll === 1
      ? isClearByCate.isClear - countClear.countClear > 0
        ? (countClear.countClear = isClearByCate.isClear)
        : null
      : isClearByCate.isClearByCate - countClear.countClear > 0
        ? (countClear.countClear = isClearByCate.isClearByCate)
        : null;

    isClearByCate.isClearAll === 1 ? isClearByCate.isClearAll === 0 : null;
    let isChecked = null;
    if (action === 'yes') isChecked = item.haveBusiness == 1 ? null : 1;
    else isChecked = item.haveBusiness == 0 ? null : 0;
    //
    item.haveBusiness = isChecked;
    item.quanity = isChecked === 1 ? item.quanity : null;
    await setHaveBusiness(isChecked);
    await setInputDisplay(null);
    await updateStockItem(item, workinfo);
  };
  const editInputChange = async e => {
    let display =
      e.nativeEvent.text !== null && e.nativeEvent.text.length > 0
        ? e.nativeEvent.text.toString().replace(/,/g, '')
        : null;
    let itemEdit = { ...item };
    itemEdit.quanity =
      display !== '' && display !== undefined && display !== null
        ? parseInt(display)
        : null;
    await updateStockItem(itemEdit, workinfo);
  };
  const changeValueStock = async text => {
    isClearByCate.isClearAll === 1
      ? isClearByCate.isClear - countClear.countClear > 0
        ? (countClear.countClear = isClearByCate.isClear)
        : null
      : isClearByCate.isClearByCate - countClear.countClear > 0
        ? (countClear.countClear = isClearByCate.isClearByCate)
        : null;

    isClearByCate.isClearAll === 1 ? isClearByCate.isClearAll === 0 : null;

    let display =
      text !== null && text.length > 0
        ? text.toString().replace(/,/g, '')
        : null;
    if (isNotInteger(display)) display = '';

    let intValue = display === '' ? null : parseInt(display);
    let itemEdit = { ...item };
    if (intValue || intValue === 0) {
      item.quanity = intValue;
      itemEdit.quanity = intValue;
      await setInputDisplay(intValue);
    } else {
      item.quanity = null;
      itemEdit.quanity = null;
      await setInputDisplay();
    }
    await updateStockItem(itemEdit, workinfo);
  };
  return (
    <View
      key={`stock_${item.productCode}`}
      style={{ width: '100%', alignItems: 'center' }}
    >
      <View
        style={{
          padding: 8,
          width: '100%',
          alignItems: 'center',
          backgroundColor: appcolor.surface,
          marginBottom: 5,
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
          {item.divisionId == _competitorId && haveBusiness === 1 && (
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
                  editable={item.upload === 1 ? false : true}
                  selectTextOnFocus={item.upload === 1 ? false : true}
                  onChangeText={changeValueStock}
                  onEndEditing={editInputChange}
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
            disabled={item.upload === 1}
            containerStyle={{
              padding: 0,
              margin: 3,
              backgroundColor: appcolor.light,
              borderWidth: 0,
            }}
            // title={item.divisionId == _competitorId ? 'Có kinh doanh' : 'Còn hàng'}
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
            disabled={item.upload === 1}
            containerStyle={{
              padding: 0,
              margin: 3,
              backgroundColor: appcolor.light,
              borderWidth: 0,
            }}
            // title={item.divisionId == _competitorId ? 'Không kinh doanh' : 'Hết hàng'}
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
  console.log(dataTab, 'dataTabdataTab');
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
      {!isLock && (
        <RenderButton
          title="Xoá tất cả dữ liệu"
          iconName="trash"
          iconColor={appcolor.red}
          actionPress={onDeleteAll}
        />
      )}
      {!isLock && (
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
