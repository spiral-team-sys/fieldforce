import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import {
  actualPhoto,
  checkPhotoByProduct,
  clearAllDataDisplay,
  getDisplayProduct,
  getListTagPOP,
  isPhotoNoData,
  updateItemDisplay,
  uploadDisplayPOP,
} from '../../../Controller/DisplayController';
import { checkLockReport } from '../../../Controller/ShopController';
import {
  getDisplayResult,
  getNoteDisplayReport,
  updateMockupDisplay,
  updateNoteDisplayReport,
} from '../../../Controller/WorkController';
import {
  groupDataByKey,
  Message,
  MessageAction,
  MessageInfo,
  ToastError,
  ToastSuccess,
} from '../../../Core/Helper';
import { _competitorId, _competitorName } from '../../../Core/URLs';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import {
  checkNetwork,
  deviceHeight,
  deviceWidth,
  minWidthTab,
} from '../../../Core/Utility';
import { LoadingView } from '../../../Control/ItemLoading';
//import NumberFormat from "react-number-format";
import _, { debounce } from 'lodash';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import UploadController from '../../../Controller/UploadController';
import {
  getCompetitorByProduct,
  getlistTabByCategory,
} from '../../../Controller/StockOutController';
import { MutipleItemSelected } from '../../../Control/MutipleItemSelected';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const actionMode = {
  NOTE: 'NOTE',
  TOOLS: 'TOOLS',
};
export const DisplayDaikin = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(
    state => state.GAppState,
  );
  const [settings, setSettings] = useState({
    isLockReport: false,
    isUploaded: false,
  });
  const [loading, setLoading] = useState(false);
  const [dataTab, setDataTab] = useState([]);
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [dataCompetitor, setDataCompetitor] = useState([]);
  const [mode, setMode] = useState(null);
  const [itemNote, setItemNote] = useState({});
  const [isShowInput, setShowInput] = useState(false);
  const [headerItem, setHeaderItem] = useState({});
  const [competitorName, setCompetitorName] = useState(_competitorName);
  const tabRef = useRef();
  const config = JSON.parse(kpiinfo?.reportItem) || {};
  const [search, setSearch] = useState({ text: '' });

  const LoadData = async () => {
    await setLoading(true);
    const lockReport = await checkLockReport(shopinfo);
    const lstResults = await getDisplayResult(workinfo);
    await setSettings({
      isLockReport: lockReport,
      isUploaded: lstResults[0]?.upload == 1 || false,
    });

    let day = parseInt(moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setSettings({
        isLockReport: lockReport,
        isUploaded: lstResults[0]?.upload == 1 || false,
      });
    } else {
      await setSettings({
        isLockReport: lockReport,
        isUploaded: true,
      });
    }
    //
    const displayProduct = await getDisplayProduct(workinfo);
    const tabCompetitor = await getlistTabByCategory(_competitorId);
    const lstCompetitor = await getCompetitorByProduct();

    await setDataCompetitor(lstCompetitor);
    await setDataTab(tabCompetitor);
    await setData(displayProduct);
    await setDataMain(displayProduct);
    await setHeaderItem(displayProduct[0] || {});

    await setTimeout(async () => {
      await setShowInput(false);
      await setLoading(false);
    }, 2000);
  };
  const uploadAction = async () => {
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
        'Kết nối mạng',
        'top',
      );
      return;
    }

    const configData = JSON.parse(kpiinfo?.reportItem) || {};
    const dataDisplay = await getDisplayResult(workinfo, kpiinfo.id);
    // const configPhoto = configData.ImageByList || []
    // const isConstraint = configData.isConstraint || 0
    const isPrice = configData.isPrice || 0 == 1;
    // const lstCheckPhoto = await checkPhotoByProduct(workinfo, kpiinfo.id)
    // Check Photo
    // if (isConstraint == 1) {
    //     for (let index = 0; index < lstCheckPhoto.length; index++) {
    //         const item = lstCheckPhoto[index];
    //         const configItem = configPhoto[item.categoryName]
    //         for (let j = 0; j < configItem.length; j++) {
    //             const jItem = configItem[j];
    //             const photoType = `${jItem.code}_${item.categoryName}`
    //             const actual = await actualPhoto(workinfo, kpiinfo.id, photoType)
    //             if (actual < jItem.numberIMG) {
    //                 ToastError(`Chưa chụp đầy đủ hình ${jItem.name} ngành hàng ${item.categoryName} (${actual}/${jItem.numberIMG} tấm)`, 'Hình ảnh', 'top')
    //                 return
    //             }
    //         }
    //     }
    // }
    // Check Report
    if (dataDisplay.length == 0) {
      ToastError(
        `Hoàn thành báo cáo trước khi gửi dữ liệu lên hệ thống`,
        'Dữ liệu báo cáo',
        'top',
      );
      return;
    } else {
      for (let index = 0; index < dataDisplay.length; index++) {
        const item = dataDisplay[index];
        //
        // Check Price when Quantity > 0
        if (isPrice && item.quanity !== null && item.quanity > 0) {
          if (item.price == 'null' || item.price == null) {
            MessageInfo(
              `Giá sản phẩm ${item.productName} ngành hàng ${item.categoryName} hãng ${item.division} chưa nhập`,
              'Giá sản phẩm',
              'top',
            );
            return;
          }
        }
        //
        if (
          item.price !== 'null' &&
          item.price !== null &&
          (item.price < 10000 || item.price % 1000 > 0)
        ) {
          MessageInfo(
            `Giá sản phẩm ${item.productName} ngành hàng ${item.categoryName} hãng ${item.division} sai định dạng`,
            'Giá sản phẩm',
            'top',
          );
          return;
        }
        if (
          (item.quanity == 'null' || item.quanity == null) &&
          item.price !== 'null' &&
          item.price !== null &&
          item.price > 0
        ) {
          MessageInfo(
            `Chưa nhập số lượng ${item.productName} ngành hàng ${item.categoryName} hãng ${item.division}`,
            'Số lượng',
            'top',
          );
          return;
        }
      }
      const lstNoData = await isPhotoNoData(workinfo, kpiinfo.id);
      if (lstNoData.length > 0) {
        for (let index = 0; index < lstNoData.length; index++) {
          const item = lstNoData[index];
          if (item.countPhoto > 0) {
            ToastError(
              `Chưa nhập dữ liệu ngành hàng ${item.categoryName} hãng ${item.division} (Đã chụp hình nhưng chưa nhập dữ liệu)`,
              'Dữ liệu',
              'top',
            );
            return;
          }
        }
      }
    }
    // Upload result
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        await UploadController.DataDisplay(
          dataDisplay,
          { ...workinfo, reportId: kpiinfo.id },
          async () => {
            await LoadData();
          },
        );
      },
    );
  };
  // View Action Sheet
  const middleAction = async () => {
    await setMode(actionMode.TOOLS);
    SheetManager.show('actionDisplay');
  };
  const handlerNoteAction = async item => {
    const dataNote = await getNoteDisplayReport(
      workinfo.workId,
      null,
      item.division,
    );
    const notes = (dataNote.length > 0 && dataNote[0]) || null;
    await setItemNote(notes);
    //
    setMode(actionMode.NOTE);
    SheetManager.show('actionDisplay');
  };
  // handler
  const handlerClearAll = () => {
    MessageAction(
      'Bạn có muốn xoá tất cả dữ liệu đã nhập không ?',
      async () => {
        await clearAllDataDisplay(workinfo, null);
        await LoadData();
        await setShowInput(false);
        SheetManager.hide('actionDisplay');
      },
    );
  };
  const handlerClearByCategory = itemCategory => {
    MessageAction(
      `Bạn có muốn xoá dữ liệu ngành hàng ${itemCategory.categoryName} đã nhập không ?`,
      async () => {
        await clearAllDataDisplay(workinfo, itemCategory.categoryId);
        await LoadData();
        await setShowInput(false);
        SheetManager.hide('actionDisplay');
      },
    );
  };
  const handlerShowItemInput = show => {
    setShowInput(show);
    if (show) {
      const dataInput = _.filter(dataMain, i => {
        return (
          (i.quanity !== null && i.quanity >= 0) ||
          (i.price !== null && i.price >= 0)
        );
      });
      setData(dataInput);
    } else {
      setData(dataMain);
    }
  };
  const handlerSaveNote = note => {
    setItemNote({ ...itemNote, displayComment: note || '' });
  };
  const handlerCloseNote = async note => {
    if (note !== null && note.length > 0 && note.length < 5) {
      ToastError(`Nhập ghi chú tối thiểu 5 kí tự`, 'Thông báo', 'top');
      return;
    }
    const itemSave = {
      workId: workinfo.workId,
      displayRef: null,
      displayComment: note || '',
      division: competitorName,
    };
    await setItemNote({ ...itemNote, displayComment: itemSave.displayComment });
    await updateNoteDisplayReport(itemSave);
    SheetManager.hide('actionDisplay');
  };
  const handlerSelectCompetitor = async item => {
    if (loading) return;
    // Clear Data
    await setDataTab([]);
    await setData([]);
    await setDataMain([]);
    //
    await setLoading(true);
    await setCompetitorName(item.itemName);
    const dataByCompetitor = await getDisplayProduct(workinfo, item.id);
    const tabCompetitor = await getlistTabByCategory(item.id);
    await setHeaderItem(dataByCompetitor[0] || {});
    await setData(dataByCompetitor);
    await setDataMain(dataByCompetitor);
    await setDataTab(tabCompetitor);
    await setLoading(false);
  };
  //
  const filterProduct = debounce(text => {
    if (isShowInput) {
      const dataInput = _.filter(dataMain, i => {
        return (
          (i.quanity !== null && i.quanity >= 0) ||
          (i.price !== null && i.price >= 0)
        );
      });
      if (text !== null && text.length > 0) {
        const filterList = _.filter(dataInput, i => {
          return (
            i.productName.toLowerCase().match(text.toLowerCase()) ||
            i.productCode.toLowerCase().match(text.toLowerCase())
          );
        });
        search.text = text;
        setData(filterList);
      } else {
        search.text = text;
        setData(dataInput);
      }
    } else {
      if (text !== null && text.length > 0) {
        const filterList = _.filter(dataMain, i => {
          return (
            i.productName.toLowerCase().match(text.toLowerCase()) ||
            i.productCode.toLowerCase().match(text.toLowerCase())
          );
        });
        search.text = text;
        setData(filterList);
      } else {
        search.text = text;
        setData(dataMain);
      }
    }
  }, 500);
  const getItemLayout = (data, index) => ({
    length: 50,
    offset: 50 * index,
    index,
  });
  useEffect(() => {
    LoadData();
    return () => loading;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentView: { flex: 1 },
    mainItem: {
      width: '100%',
      marginBottom: 3,
      backgroundColor: appcolor.light,
    },
    titleHeader: {
      fontSize: 15,
      fontWeight: '700',
      fontStyle: 'italic',
      color: appcolor.info,
      marginBottom: 5,
      marginTop: 5,
    },
    titleContent: { fontSize: 14, color: appcolor.dark, fontWeight: '500' },
  });
  const renderItem = ({ item, index }) => {
    const isInputPrice = config.inputPrice || 0 == 1;
    return (
      <View key={`ood_oo_${index}`} style={styles.mainItem}>
        {item.isParent && (
          <Text style={styles.titleHeader}>{item.subCategory}</Text>
        )}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            backgroundColor: appcolor.surface,
            borderRadius: 5,
          }}
        >
          <View style={{ flex: isInputPrice ? 1 : 3, padding: 8 }}>
            <Text style={styles.titleContent}>{`${index + 1}. ${
              item.productName
            }`}</Text>
            <Text
              style={{
                ...styles.titleContent,
                fontSize: 12,
                color: appcolor.greydark,
              }}
            >
              {item.productCode}
            </Text>
          </View>
          <View style={{ flex: 1, padding: 8, flexDirection: 'row' }}>
            <InputQuantity item={item} index={index} />
            {isInputPrice && <InputPrice item={item} index={index} />}
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN}
        iconMiddle="poll-h"
        iconRight={
          !settings.isLockReport
            ? !settings.isUploaded
              ? 'cloud-upload-alt'
              : null
            : 'user-lock'
        }
        rightFunc={
          !settings.isLockReport
            ? !settings.isUploaded
              ? () => uploadAction()
              : null
            : () => {
                ToastSuccess(
                  'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
                );
              }
        }
        middleFunc={middleAction}
        leftFunc={() => navigation.goBack()}
      />
      <FormGroup
        editable
        selectTextOnFocus
        containerStyle={{
          backgroundColor: appcolor.grayLight,
          margin: 8,
          marginBottom: 0,
          alignSelf: 'center',
        }}
        inputStyle={{ fontSize: 13, color: appcolor.dark }}
        placeholder="Tìm kiếm sản phẩm"
        iconName="search"
        defaultValue={search.text || ''}
        onClearTextAndroid={filterProduct}
        handleChangeForm={filterProduct}
      />
      <MutipleItemSelected
        typeItem={'COMPETITOR'}
        containerStyle={{ flexGrow: 0 }}
        dataItems={dataCompetitor}
        defaultValue={competitorName}
        onItemChoose={handlerSelectCompetitor}
      />
      <HeaderItemView
        itemHeader={headerItem}
        competitorName={competitorName}
        handlerNote={handlerNoteAction}
      />
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      <View style={styles.contentView}>
        {dataTab.length > 0 && data.length > 0 && (
          <Tabs.Container
            ref={tabRef}
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                indicatorStyle={{ backgroundColor: appcolor.primary }}
                inactiveColor={appcolor.dark}
                activeColor={appcolor.dark}
                tabStyle={{ minWidth: minWidthTab(dataTab), height: 38 }}
                scrollEnabled={true}
                style={{ backgroundColor: appcolor.light }}
              />
            )}
            containerStyle={{ backgroundColor: appcolor.surface }}
          >
            {dataTab.map((it, i) => {
              let dataItem = data.filter(e => e.categoryId == it.categoryId);
              const { arr } = groupDataByKey({
                arr: dataItem,
                key: 'subCatId',
              });
              const labelItem = `${it.categoryName} (${arr.length || 0})`;
              return arr.length > 0 ? (
                <Tabs.Tab key={`iid-i_${i}`} label={labelItem} name={labelItem}>
                  <View
                    style={{
                      backgroundColor: appcolor.light,
                      marginTop: 40,
                      padding: 6,
                      width: deviceWidth,
                    }}
                  >
                    <FlatList
                      extraData={arr}
                      keyExtractor={(item, __) => item.productId}
                      data={arr}
                      getItemLayout={getItemLayout}
                      removeClippedSubviews={true}
                      initialNumToRender={2}
                      maxToRenderPerBatch={1}
                      updateCellsBatchingPeriod={100}
                      windowSize={7}
                      renderItem={renderItem}
                      showsVerticalScrollIndicator={false}
                      ListFooterComponent={
                        <Text
                          style={{
                            width: '100%',
                            height: deviceHeight / 2.5,
                            textAlign: 'center',
                            color: appcolor.dark,
                            padding: 8,
                          }}
                        >
                          {arr.length > 10 ? 'Đã xem hết' : ''}
                        </Text>
                      }
                    />
                  </View>
                </Tabs.Tab>
              ) : null;
            })}
          </Tabs.Container>
        )}
      </View>
      <ActionSheet
        id="actionDisplay"
        gestureEnabled
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ padding: 8, width: '100%' }}>
          {mode == actionMode.TOOLS && (
            <ToolsAction
              clearAllData={handlerClearAll}
              clearByCategory={handlerClearByCategory}
              itemInput={handlerShowItemInput}
              dataTab={dataTab}
              tabRef={tabRef}
              showInputView={isShowInput}
              isLock={settings.isUploaded}
            />
          )}
          {mode == actionMode.NOTE && (
            <NoteAction
              settings={settings}
              noteValue={itemNote}
              onChangeNote={handlerSaveNote}
              onClose={handlerCloseNote}
            />
          )}
        </View>
      </ActionSheet>
    </View>
  );
};
const InputQuantity = ({ item, index }) => {
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [___, setMutate] = useState(false);
  const changeValue = async text => {
    let display =
      text !== null && text.length > 0
        ? text.toString().replace(/,/g, '')
        : null;
    item.quanity = display !== null ? parseInt(display) : null;
    await updateItemDisplay(item, workinfo);
    setMutate(e => !e);
  };
  return (
    <View key={`ppd_${index}`} style={{ flex: 1, alignSelf: 'center' }}>
      <NumberFormat
        value={item.quanity || ''}
        displayType="text"
        thousandSeparator={true}
        renderText={value => (
          <TextInput
            textAlign={'center'}
            value={value}
            style={{
              fontSize: 13,
              color: appcolor.dark,
              padding: 8,
              backgroundColor: appcolor.light,
              fontWeight: '500',
              textAlign: 'center',
              borderRadius: 5,
            }}
            keyboardType="numeric"
            placeholder="SL"
            placeholderTextColor={appcolor.greydark}
            editable={item.upload == 0}
            selectTextOnFocus
            onChangeText={changeValue}
          />
        )}
      />
    </View>
  );
};
const InputPrice = ({ item, index }) => {
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [_, setMutate] = useState(false);
  const changeValue = text => {
    let price =
      text !== null && text.length > 0
        ? text.toString().replace(/,/g, '')
        : null;
    item.price = parseInt(price);
    setMutate(e => !e);
    updateItemDisplay(item, workinfo);
  };
  const checkValuePrice = async () => {
    const priceValue = parseInt(item.price);
    if (priceValue < 10000) {
      ToastError(
        `Giá sản phẩm ${item.productName} không được nhỏ hơn 10,000 VNĐ`,
        'Thông báo',
        'top',
      );
      item.price = null;
      item.checkValue = 1;
      setMutate(e => !e);
      await updateItemDisplay(item, workinfo);
      return;
    } else if (priceValue % 1000 > 0) {
      ToastError(
        `Giá sản phẩm ${item.productName} không được nhập số lẻ`,
        'Thông báo',
        'top',
      );
      item.price = null;
      item.checkValue = 1;
      setMutate(e => !e);
      await updateItemDisplay(item, workinfo);
      return;
    } else {
      item.checkValue = 0;
      setMutate(e => !e);
    }
  };
  const styles = StyleSheet.create({
    styleInput: {
      fontSize: 13,
      color: appcolor.dark,
      padding: 8,
      fontWeight: '500',
      textAlign: 'center',
      borderRadius: 5,
      backgroundColor: item.checkValue == 0 ? appcolor.light : appcolor.warning,
    },
  });
  return (
    <View
      key={`ppd_${index}`}
      style={{ flex: 2, alignSelf: 'center', marginStart: 5 }}
    >
      <NumberFormat
        value={item.price || ''}
        displayType="text"
        thousandSeparator={true}
        renderText={value => (
          <TextInput
            textAlign={'center'}
            value={value}
            style={styles.styleInput}
            keyboardType="numeric"
            placeholder="Giá"
            placeholderTextColor={appcolor.greydark}
            editable={item.upload == 0}
            selectTextOnFocus
            onChangeText={changeValue}
            onEndEditing={checkValuePrice}
          />
        )}
      />
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
  const itemTab = dataTab[tabRef?.current?.getCurrentIndex() || 0];
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
          <SpiralIcon name={iconName} size={18} color={iconColor} />
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
const NoteAction = ({ noteValue, onChangeNote, onClose, settings }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const onChangeText = text => {
    noteValue.displayComment = text;
    onChangeNote(text);
  };
  const onCloseNote = () => [onClose(noteValue.displayComment)];
  return (
    <View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
      <Text
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 15,
          fontWeight: '600',
          color: appcolor.dark,
          marginBottom: 8,
        }}
      >
        Ghi chú
      </Text>
      <FormGroup
        editable={!settings.isUploaded}
        multiline
        placeholder={'Nhập ghi chú'}
        value={noteValue.displayComment || ''}
        handleChangeForm={onChangeText}
      />
      {!settings.isUploaded && (
        <TouchableOpacity
          style={{
            width: deviceWidth / 3,
            backgroundColor: appcolor.surface,
            marginEnd: 3,
            marginStart: 3,
            borderRadius: 5,
            alignSelf: 'center',
          }}
          key={`close_iim`}
          onPress={onCloseNote}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: appcolor.yellow,
              padding: 8,
              marginStart: 5,
              textAlign: 'center',
            }}
          >
            Xác nhận
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const HeaderItemView = ({ itemHeader, competitorName, handlerNote }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [__, setMutate] = useState(false);
  const onChangeValue = async text => {
    let mockup =
      text !== null && text.length > 0
        ? text.toString().replace(/,/g, '')
        : null;
    itemHeader.mockupValue = mockup;
    setMutate(e => !e);
    await updateMockupDisplay(itemHeader);
  };
  const actionNote = () => {
    handlerNote(itemHeader);
  };
  return (
    <View
      style={{
        width: deviceWidth - 16,
        margin: 3,
        borderRadius: 5,
        alignSelf: 'center',
      }}
    >
      <FormGroup
        keyboardType="numeric"
        containerStyle={{
          padding: 3,
          backgroundColor: appcolor.placeholderBody,
        }}
        inputStyle={{ fontSize: 13 }}
        editable={itemHeader.upload == 0}
        value={`${itemHeader.mockupValue || ''}`}
        title={`Mockup ${competitorName}`}
        placeholder="Nhập số lượng"
        iconRight="comment-alt"
        rightFunc={actionNote}
        handleChangeForm={onChangeValue}
      />
    </View>
  );
};
