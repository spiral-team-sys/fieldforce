import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon } from '@rneui/themed';
import { Text } from '@rneui/base';
import { FlashList } from '@shopify/flash-list';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import {
  ToastError,
  formatNumber,
  removeVietnameseTones,
} from '../../../../Core/Helper';
import {
  alertConfirm,
  alertNotify,
  deviceHeight,
  deviceWidth,
  minWidthTab,
  optionConfirm,
} from '../../../../Core/Utility';
import { FloatActionField } from '../Control/FloatActionField';
import {
  checkRawReport,
  removeRawReport,
  saveJsonData,
} from '../../../../Controller/ReportController';
import { FloatActionButton } from '../Control/FloatActionButton';
import { HeaderAction } from '../Control/HeaderAction';
import { REPORT } from '../../../../API/ReportAPI';
import { GroupList } from '../Control/GroupList';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import ChooseItem from '../Control/ChooseItem';
import InputItem from '../Control/InputItem';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { _competitorId } from '../../../../Core/URLs';
import { KeyboardAvoidingView } from 'react-native';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import _ from 'lodash';
import { toastError, toastSuccess } from '../../../../Utils/configToast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const DisplayRow = React.memo(
  ({
    item,
    index,
    indexGroupId,
    inputType,
    inputProductId,
    inputIndex,
    menuIsOpenCamera,
    configPage,
    appcolor,
    styles,
    onInputValue,
    onShowAction,
  }) => {
    const onInputPrice = () => onInputValue('PRICE', item, index);
    const onInputDisplay = () => {
      if (configPage.isInputArea) {
        onShowAction(item, index, 'jsonPosition', 'DisplayArea');
      } else {
        onInputValue('DISPLAY', item, index);
      }
    };
    const onCheckArea = () => onInputValue('AREA', item, index);
    const isEditPrice =
      inputType == 'PRICE' && inputProductId == item.ProductId;
    const isEditDisplay =
      inputType == 'DISPLAY' && inputProductId == item.ProductId;
    const priceValue = item.Price || null;
    const displayValue =
      item.Display !== undefined && item.Display !== null && item.Display !== ''
        ? item.Display
        : null;
    const checkAreaValue = item.checkAreaValue || false;
    const iconCheckArea = checkAreaValue ? 'checkbox' : 'square-outline';
    const infoWidth =
      item.isPrice == 1 ? '55%' : item.isCheckArea == 1 ? '70%' : '75%';
    const resultAreaList = (item.DisplayAreaList || [])
      .filter(e => e.ItemQuantity !== null && e.ItemQuantity !== undefined)
      .map(e => `${e.ItemName}: ${e.ItemQuantity}`)
      .join('\n');

    return (
      <View key={`it_${indexGroupId}_${index}`} style={styles.itemMain}>
        <HeaderAction
          key={`headeraction-${index}`}
          isShow={menuIsOpenCamera}
          item={item}
          keyGroup={item[configPage.keyGroupName]}
          keyValue={item.ProductId}
          keyName={item.ProductCode}
        />
        {item.isCheckArea == 1 && (
          <TouchableOpacity
            style={styles.actionCheckArea}
            disabled={!!inputIndex}
            onPress={onCheckArea}
          >
            <SpiralIcon
              type="ionicon"
              name={iconCheckArea}
              size={21}
              color={checkAreaValue ? appcolor.primary : appcolor.greylight}
            />
          </TouchableOpacity>
        )}
        <View style={{ ...styles.infoView, width: infoWidth }}>
          <Text style={styles.titleHead}>{`${index + 1}. ${item.ProductName
            }`}</Text>
          {item.ProductCode && (
            <Text
              style={styles.titleContent}
            >{`Code: ${item.ProductCode}`}</Text>
          )}
          {!menuIsOpenCamera && (
            <View style={styles.contentChooseItem}>
              {resultAreaList !== '' && (
                <Text style={styles.displayAreaText}>{`${resultAreaList || ''
                  }`}</Text>
              )}
              {item.isPosition == 1 &&
                (displayValue || 0) > 0 &&
                !configPage.isInputArea && (
                  <TouchableOpacity
                    style={styles.displayAreaButton}
                    disabled={!!inputIndex}
                    onPress={() =>
                      onShowAction(item, index, 'jsonPosition', 'DisplayArea')
                    }
                  >
                    <SpiralIcon
                      type="ionicon"
                      name="cube"
                      size={18}
                      color={appcolor.placeholderText}
                    />
                    <Text style={styles.displayAreaText}>{`Vị trí: ${item.DisplayArea || ''
                      }`}</Text>
                  </TouchableOpacity>
                )}
              {item.noteNoDisplay == 1 && displayValue == 0 && (
                <TouchableOpacity
                  style={styles.displayAreaButton}
                  disabled={!!inputIndex}
                  onPress={() =>
                    onShowAction(item, index, 'jsonReason', 'NoteProduct')
                  }
                >
                  <SpiralIcon
                    type="ionicon"
                    name="chatbubble"
                    size={18}
                    color={appcolor.placeholderText}
                  />
                  <Text style={styles.displayAreaText}>{`Ghi chú: ${item.NoteProduct || ''
                    }`}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {item.isDisplay == 1 && !menuIsOpenCamera && (
          <TouchableOpacity
            style={{
              ...styles.inputView,
              width: item.isPrice == 1 ? '15%' : '25%',
            }}
            disabled={!!inputIndex}
            onPress={onInputDisplay}
          >
            <Text style={styles.labelInput}>
              {configPage.isInputArea ? 'Tổng vị trí' : 'Số lượng'}
            </Text>
            {displayValue !== null && (
              <Text
                style={{
                  ...styles.valueInput,
                  color: isEditDisplay ? appcolor.danger : appcolor.dark,
                }}
              >
                {displayValue}
              </Text>
            )}
          </TouchableOpacity>
        )}
        {item.isPrice == 1 && !menuIsOpenCamera && (
          <TouchableOpacity style={styles.inputView} onPress={onInputPrice}>
            <Text style={styles.labelInput}>Giá</Text>
            {priceValue !== null && (
              <Text
                style={{
                  ...styles.valueInput,
                  color: isEditPrice ? appcolor.danger : appcolor.dark,
                }}
              >
                {formatNumber(priceValue, ',')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  },
  (prev, next) => {
    return (
      prev.item === next.item &&
      prev.index === next.index &&
      prev.indexGroupId === next.indexGroupId &&
      prev.inputType === next.inputType &&
      prev.inputProductId === next.inputProductId &&
      prev.inputIndex === next.inputIndex &&
      prev.menuIsOpenCamera === next.menuIsOpenCamera &&
      prev.configPage.isInputArea === next.configPage.isInputArea
    );
  },
);

const DisplayUpdateScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo, kpiinfo, isLoading } = useSelector(
    state => state.GAppState,
  );
  const [loading, setLoading] = useState(true);
  const [configPage, setConfigPage] = useState({
    isInputArea: false,
    keyGroup: 'CompetitorId',
    keyGroupName: 'CompetitorName',
    keyTab: 'CategoryId',
    keyTabName: 'CategoryName',
    keySubTabName: 'SubCategoryName',
  });
  const [dataMain, setDataMain] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [data, setData] = useState([]);
  const [dataTab, setDataTab] = useState([]);
  const [search, setSearch] = useState({ text: '', isSearch: false });
  const [input, setInput] = useState({
    type: '',
    keyValue: '',
    item: {},
    index: null,
  });
  const [menu, setMenu] = useState({
    isOpenCamera: false,
    isOpen: false,
    type: null,
    title: null,
  });
  const [indexGroup, setIndexGroup] = useState({ groupId: 0, groupName: null });
  const [indexTab, setIndexTab] = useState({
    index: 0,
    tabId: 0,
    tabName: null,
    subTitle: null,
  });
  const [itemChooseAction, setItemChooseAction] = useState({});
  const [checkClose, setCheckClose] = useState(false);
  const [itemDataChoose, setItemDataChoose] = useState({
    jsonPosition: [],
    jsonReason: [],
  });
  const inputRef = useRef();
  const listRef = useRef();
  const saveTimeoutRef = useRef(null);
  const latestDataRef = useRef(null);
  const dataMainRef = useRef([]);
  const lastScrollTickRef = useRef(0);

  const onBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const persistData = useCallback(
    (nextData, immediate = false) => {
      latestDataRef.current = nextData;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (immediate) {
        saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, nextData);
        return;
      }
      saveTimeoutRef.current = setTimeout(() => {
        if (latestDataRef.current) {
          saveJsonData(
            shopinfo.shopId,
            kpiinfo.id,
            shopinfo.auditDate,
            latestDataRef.current,
          );
        }
        saveTimeoutRef.current = null;
      }, 250);
    },
    [kpiinfo.id, shopinfo.auditDate, shopinfo.shopId],
  );

  const _searchData = useCallback(
    (
      filterList,
      isDataInput = false,
      isDataNonInput = false,
      searchText = search.text,
    ) => {
      const valueSearch = removeVietnameseTones(searchText).toLowerCase();
      const searchData = _.filter(
        filterList,
        e =>
          e.isChooseTag == 1 &&
          (removeVietnameseTones(e.ProductName)
            .toLowerCase()
            .match(valueSearch) ||
            removeVietnameseTones(e.ProductCode)
              .toLowerCase()
              .match(valueSearch) ||
            removeVietnameseTones(e.CategoryName)
              .toLowerCase()
              .match(valueSearch) ||
            removeVietnameseTones(e.CategoryCode)
              .toLowerCase()
              .match(valueSearch) ||
            removeVietnameseTones(e.CompetitorName)
              .toLowerCase()
              .match(valueSearch) ||
            removeVietnameseTones(e.SubCategoryCode)
              .toLowerCase()
              .match(valueSearch) ||
            removeVietnameseTones(e.SubCategoryName)
              .toLowerCase()
              .match(valueSearch)),
      );
      if (isDataInput) {
        return _.filter(
          searchData,
          e =>
            (e.Price !== undefined && e.Price !== null && e.Price !== '') ||
            (e.Display !== undefined &&
              e.Display !== null &&
              e.Display !== '' &&
              e.Display > 0),
        );
      }
      if (isDataNonInput) {
        return _.filter(
          searchData,
          e => e.Display !== null && e.Display == 0 && e.Display !== '',
        );
      }
      return searchData;
    },
    [search.text],
  );

  const LoadData = async () => {
    await setLoading(true);
    const _configPage = JSON.parse(kpiinfo.reportItem || '{}');
    await setConfigPage(_configPage);
    //
    const itemFilter = {
      reportId: kpiinfo.id,
      shopId: shopinfo.shopId,
      typeReport: 'PRODUCT',
    };
    //
    await REPORT.GetDataConfigReport(itemFilter, mData => {
      setItemDataChoose(mData[0] || {});
    });
    await REPORT.GetDataReportByShop(itemFilter, async (mData, message) => {
      message && ToastError(message, 'Lỗi dữ liệu', 'top');
      //
      if (mData == null || mData.length == 0) {
        const options = [{ text: 'Đồng ý', onPress: onBack }];
        optionConfirm(
          'Thông báo',
          'Dữ liệu cập nhật trống, Vui lòng kiểm tra lại các yêu cầu cập nhật',
          options,
        );
      } else {
        const productList = _.filter(mData, e => e.isChooseTag == 1);
        const tabList = _.unionBy(productList, _configPage.keyTab);
        if (productList.length > 0) {
          setIndexGroup({
            groupId: productList[0][_configPage.keyGroup],
            groupName: productList[0][_configPage.keyGroupName],
          });
        }
        if (tabList.length > 0) {
          setIndexTab(prev => ({
            ...prev,
            tabId: tabList[0][_configPage.keyTab],
            tabName: tabList[0][_configPage.keyTabName],
          }));
        }
        //
        await setDataMain(mData);
        await setDataGroup(mData);
        await setData(productList);
        await setDataTab(tabList);
        await setCheckClose(
          tabList?.find(item => item.CompetitorName === 'LG') !== undefined,
        );
      }
    });
    await setLoading(false);
  };
  const UploadData = async () => {
    const { isValid, message } = await onValidData();
    if (!isValid) return;
    //
    alertConfirm(
      'Gửi dữ liệu',
      message ||
      'Sau khi gửi dữ liệu bạn sẽ thoát chế độ "Chỉnh sửa", Bạn có chắc chắn không ?',
      async () => {
        await setLoading(true);
        const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id);
        if (result.statusId == 200) {
          toastSuccess('Thông báo', result.messager);
          await removeRawReport(shopinfo.shopId, kpiinfo.id);
          await LoadData();
        } else {
          toastError('Lỗi dữ liệu', result.messager);
        }
        await setLoading(false);
      },
    );
  };
  const onValidData = async () => {
    const configPage = JSON.parse(kpiinfo.reportItem || '{}');
    const itemData = await checkRawReport(shopinfo.shopId, kpiinfo.id);
    const dataUpload = JSON.parse(itemData.data[0]?.jsonData || '[]');
    const _isData = _.filter(
      dataUpload,
      e =>
        (e.Display || e.Price) !== null ||
        (e.DisplayArea !== null && e.DisplayArea !== ''),
    );
    if (_isData.length === 0) {
      toastError(
        'Dữ liệu trống',
        'Vui lòng nhập dữ liệu đầy đủ trước khi gửi dữ liệu lên hệ thống',
      );
      return false;
    }
    // Check Full Data
    let checkData = {
      displayAreaEmpty: [],
      displayAreaListEmpty: [],
      displayEmpty: [],
      displayNoteEmpty: [],
      displayValues: [],
      displayAreaValues: [],
    };
    if (dataUpload !== null && dataUpload.length > 0) {
      for (let index = 0; index < dataUpload.length; index++) {
        const item = dataUpload[index];
        if (configPage.isInputArea) {
          const dataAreaList = item.DisplayAreaList || [];
          const checkListArea = _.filter(
            dataAreaList,
            e => e.ItemQuantity !== null && e.ItemQuantity !== undefined,
          );
          if (item.Display > 0 && checkListArea.length == 0) {
            if (configPage?.checkByCompetitor) {
              const isIncluded = configPage?.checkByCompetitor
                .split(',')
                .includes(item.CompetitorName);
              if (isIncluded) checkData.displayAreaListEmpty.push(item);
            } else {
              checkData.displayAreaListEmpty.push(item);
            }
          }
          if (item.Display == 0) {
            if (
              item.CompetitorName == 'LG' &&
              (item.NoteProduct || null) == null
            ) {
              checkData.displayNoteEmpty.push(item);
            }
          } else {
            const checkAreaValues = _.filter(
              dataAreaList,
              e => e.ItemQuantity >= 2,
            );
            if (checkAreaValues.length > 0) {
              checkData.displayAreaValues.push(item);
            }
          }
        } else {
          if ((item.Display || null) !== null) {
            if (item.Display > 0) {
              if (
                item.CompetitorName == 'LG' &&
                (item.DisplayArea == null || item.DisplayArea === '')
              ) {
                checkData.displayAreaEmpty.push(item);
              }
              if (item.Display >= 2) {
                checkData.displayValues.push(item);
              }
            } else {
              if (
                item.CompetitorName == 'LG' &&
                (item.NoteProduct || null) == null
              ) {
                checkData.displayNoteEmpty.push(item);
              }
            }
          } else {
            if (item.isCheckFullDisplay) {
              checkData.displayEmpty.push(item);
            }
          }
        }
        //
      }
    }

    // Alert Message Error
    if (configPage.isInputArea) {
      if (checkData.displayAreaListEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayAreaListEmpty);
        alertNotify(`Chưa nhập số lượng theo vị trí :\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayNoteEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayNoteEmpty);
        alertNotify(`Ghi chú sản phẩm không có trưng bày:\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayAreaValues.length > 0) {
        return {
          isValid: true,
          message: `Chú ý: Dữ liệu trưng bày có sản phẩm nhập vị trí lớn hơn 2 sản phẩm.\n\nSau khi gửi dữ liệu bạn sẽ thoát chế độ "Chỉnh sửa", Bạn có muốn gửi dữ liệu không?`,
        };
      }
    } else {
      if (checkData.displayAreaEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayAreaEmpty);
        alertNotify(`Chưa nhập dữ liệu "Vị trí":\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayEmpty);
        alertNotify(`Chưa nhập "Số lượng trưng bày":\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayNoteEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayNoteEmpty);
        alertNotify(`Ghi chú sản phẩm không có trưng bày:\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayValues.length > 0) {
        return {
          isValid: true,
          message: `Dữ liệu trưng bày có sản phẩm trưng bày lớn hơn 2 sản phẩm, Bạn có muốn gửi dữ liệu không?`,
        };
      }
    }
    //
    return { isValid: true, message: null };
  };
  // Handler
  const handlerSearchByGroup = async (item, keyValue, isMultiple) => {
    try {
      setIndexGroup({ groupId: item.keyValue, groupName: item.keyName });
      //
      const listChooseGroup = _.map(dataMain, it => {
        if (item.keyValue == it[keyValue]) return { ...it, isChooseTag: 1 };
        else return isMultiple ? it : { ...it, isChooseTag: 0 };
      });
      //
      const _productByGroup = _searchData(
        listChooseGroup,
        menu.type == 'SORT',
        menu.type == 'SORT_NONE',
      );
      const _tabList = _.unionBy(_productByGroup, configPage.keyTab);
      //
      if (_tabList !== null && _tabList.length > 0) {
        setIndexTab(prev => ({
          ...prev,
          tabId: _tabList[0][configPage.keyTab],
          tabName: _tabList[0][configPage.keyTabName],
        }));
      }
      //
      await setDataTab(_tabList);
      await setDataMain(listChooseGroup);
      await setDataGroup(_productByGroup);
      await setData(
        _productByGroup !== null && _productByGroup.length > 0
          ? _productByGroup
          : listChooseGroup,
      );
      await setCheckClose(
        _tabList?.find(item => item.CompetitorName === 'LG') !== undefined,
      );
    } catch (e) {
      console.log(e);
    }
  };
  const handlerInputValue = useCallback(
    (type, item, index) => {
      switch (type) {
        case 'AREA':
          const updateData = _.map(dataMainRef.current, e => {
            if (e.ProductId === item.ProductId) {
              return { ...e, checkAreaValue: !(e.checkAreaValue || false) };
            }
            return e;
          });
          const listUpdate = _searchData(
            updateData,
            menu.type == 'SORT',
            menu.type == 'SORT_NONE',
          );
          dataMainRef.current = updateData;
          setDataMain(updateData);
          setDataGroup(listUpdate);
          setData(listUpdate);
          persistData(updateData);
          break;
        default:
          try {
            listRef.current.scrollToIndex({ index: index, animated: true });
          } catch (e) {
            console.log('handlerInputValue: ', e);
          }
          //
          setInput({
            type,
            keyValue: type == 'PRICE' ? 'Price' : 'Display',
            item,
            index,
          });
          break;
      }
    },
    [_searchData, menu.type, persistData],
  );

  const handlerEndEditing = () => {
    setInput({ type: '', keyValue: '', item: {}, index: null });
    //
    let index = input.index;
    let data = JSON.parse(itemDataChoose.jsonReason || '[]');
    if (input.type === 'DISPLAY' && input.item.Display > 0) {
      const listPosition = _.filter(
        JSON.parse(itemDataChoose.jsonPosition || '[]'),
        e =>
          e.Ref_Id == input.item.CompetitorId ||
          (input.item.CompetitorId !== _competitorId &&
            e.Ref_Id !== _competitorId),
      );
      data = input.item.Display > 0 ? listPosition : data;
    }
    const _item = {
      ...input.item,
      index,
      data: data,
    };
    // Check Display
    if (input?.item?.noteNoDisplay == 1) {
      if (
        input.type == 'DISPLAY' &&
        input.item.Display == 0 &&
        input.item.Display != ''
      ) {
        SheetManager.show('action-item-sheet', {
          payload: {
            item: { ..._item, keyValue: 'NoteProduct' },
          },
        });
      }
      if (input.type == 'DISPLAY' && input.item.Display == 1) {
        SheetManager.show('action-item-sheet', {
          payload: {
            item: { ..._item, keyValue: 'DisplayArea' },
          },
        });
      }
      if (input.type == 'DISPLAY' && input.item.Display >= 2) {
        alertConfirmQuantity(_item, input, index);
      }
    }
  };
  const handlerChangeFAB = async (type, titleAction) => {
    let optionReset = [
      { text: 'Hủy' },
      { text: 'Xác nhận', onPress: onResetData },
    ];
    const isMenuAction = type == menu.type;
    switch (type) {
      case 'SORT_NONE':
        onSortData(false, type, titleAction);
        break;
      case 'SORT':
        onSortData(true, type, titleAction);
        break;
      case 'DELETE':
        optionReset = [
          { text: 'Hủy' },
          { text: 'Xác nhận', onPress: () => onResetData('ONLY') },
        ];
        optionConfirm(
          titleAction,
          `Dữ liệu ngành hàng ${indexTab.tabName} - ${indexGroup.groupName} sẽ được làm mới sau khi bạn "Xác nhận", Bạn có muốn xóa dữ liệu không ?`,
          optionReset,
        );
        break;
      case 'RESET_DATA':
        optionConfirm(
          titleAction,
          'Dữ liệu sẽ được làm mới sau khi bạn "Xác nhận", Bạn có muốn xóa tất cả dữ liệu không ?',
          optionReset,
        );
        break;
      case 'CAMERA':
        //
        setMenu(prev => ({
          ...prev,
          isOpenCamera: true,
          isOpen: !prev.isOpen,
          type: isMenuAction ? null : type,
          title: isMenuAction ? null : titleAction,
        }));
        break;
    }
  };
  const handlerChangePosition = async itemUpdate => {
    const isDisplayAreaList =
      configPage.isInputArea &&
      itemChooseAction?.item?.keyValue == 'DisplayArea';
    const dataUpdate = _.map(dataMain, e => {
      if (e.ProductId == itemUpdate.ProductId) {
        if (isDisplayAreaList) {
          return {
            ...e,
            Display: itemUpdate.Display,
            NoteProduct: itemUpdate.NoteProduct,
            DisplayAreaList: itemUpdate.data,
          };
        } else {
          return {
            ...e,
            DisplayArea: itemUpdate.DisplayArea,
            NoteProduct: itemUpdate.NoteProduct,
          };
        }
      } else {
        return e;
      }
    });
    const dataInTabUpdate = _.map(data, it => {
      if (it.ProductId == itemUpdate.ProductId) {
        if (isDisplayAreaList) {
          return {
            ...it,
            Display: itemUpdate.Display,
            DisplayAreaList: itemUpdate.data,
            DisplayArea: itemUpdate.DisplayArea,
            NoteProduct: itemUpdate.NoteProduct,
          };
        }
        return {
          ...it,
          DisplayArea: itemUpdate.DisplayArea,
          NoteProduct: itemUpdate.NoteProduct,
        };
      }
      return it;
    });
    //
    await setDataMain(dataUpdate);
    await setData(dataInTabUpdate);
    await persistData(dataUpdate);
    //
    if (isDisplayAreaList && itemUpdate.Display == 0) {
      await SheetManager.hide('action-item-sheet');
      setTimeout(() => {
        onChoosePosition(itemUpdate, 0, 'jsonReason', 'NoteProduct');
      }, 200);
    } else {
      if (!configPage.isInputArea || !isDisplayAreaList) {
        await SheetManager.hide('action-item-sheet');
      }
    }
  };
  // Action
  const alertConfirmQuantity = async (_item, input, index) => {
    Alert.alert(
      'Thông báo',
      'Số lượng trưng bày lớn hơn 1, bạn có muốn tiếp tục lưu?',
      [
        {
          text: 'Không',
          onPress: () => {
            const updatedData = dataMain.map((dataItem, idx) => {
              if (idx === index) {
                return {
                  ...dataItem,
                  Display: null,
                  NoteProduct: null,
                  DisplayArea: null,
                };
              } else {
                return dataItem;
              }
            });
            //
            const dataInTabUpdate = _.map(data, it =>
              it.ProductId == input?.item?.ProductId
                ? { ...it, DisplayArea: null, NoteProduct: null, Display: null }
                : it,
            );
            setDataMain(updatedData);
            setData(dataInTabUpdate);
            persistData(updatedData);
            //
          },
          style: 'cancel',
        },
        {
          text: 'Có',
          onPress: () => {
            SheetManager.show('action-item-sheet', {
              payload: {
                item: { ..._item, keyValue: 'DisplayArea' },
              },
            });
          },
        },
      ],
    );
  };
  const onSearchData = text => {
    setSearch(prev => ({ ...prev, text }));
    const listUpdate = _searchData(
      dataMain,
      menu.type == 'SORT',
      menu.type == 'SORT_NONE',
      text,
    );
    setData(listUpdate);
    setDataGroup(listUpdate);
  };
  const onEditing = async item => {
    const nextInput = { ...input, item };
    await setInput(nextInput);
    //
    if (
      nextInput.type == 'DISPLAY' &&
      nextInput.item.Display == null &&
      nextInput.item.Display !== 0
    ) {
      const updateData = _.map(dataMain, e => {
        if (nextInput.item.ProductId === e.ProductId) {
          return { ...e, Display: null, DisplayArea: null, NoteProduct: null };
        } else {
          return e;
        }
      });
      const dataInTabUpdate = _.map(data, it =>
        it.ProductId == nextInput.item.ProductId
          ? { ...it, DisplayArea: null, NoteProduct: null, Display: null }
          : it,
      );
      await setDataMain(updateData);
      await setData(dataInTabUpdate);
      await persistData(updateData);
    } else {
      const updateData = _.map(dataMain, e =>
        e.ProductId === item.ProductId ? { ...e, ...item } : e,
      );
      const dataInTabUpdate = _.map(data, it =>
        it.ProductId === item.ProductId ? { ...it, ...item } : it,
      );
      setDataMain(updateData);
      setData(dataInTabUpdate);
      await persistData(updateData);
    }
  };
  const onActionMenuFAB = async () => {
    switch (menu.type) {
      case 'SORT_NONE':
        if (!menu.isOpen) {
          await setLoading(true);
          setMenu(prev => ({
            ...prev,
            isOpen: false,
            type: null,
            title: null,
          }));
          //
          const dataUpdate = _searchData(dataMain, false, false);
          const _tabList = _.unionBy(dataUpdate, configPage.keyTab);
          await setDataTab(_tabList);
          await setData(dataUpdate);
          await setDataGroup(dataUpdate);
          await setLoading(false);
        }
        break;
      case 'SORT':
        if (!menu.isOpen) {
          await setLoading(true);
          setMenu(prev => ({
            ...prev,
            isOpen: false,
            type: null,
            title: null,
          }));
          //
          const dataUpdate = _searchData(dataMain, false, false);
          const _tabList = _.unionBy(dataUpdate, configPage.keyTab);
          await setDataTab(_tabList);
          await setData(dataUpdate);
          await setDataGroup(dataUpdate);
          await setLoading(false);
        }
        break;
      case 'CAMERA':
        if (!menu.isOpen) {
          setMenu({
            isOpenCamera: false,
            isOpen: false,
            type: null,
            title: null,
          });
        }
        break;
      default:
        setMenu(prev => ({ ...prev, isOpen: !prev.isOpen }));
        break;
    }
  };
  const onCloseInput = () => {
    setInput({ type: '', keyValue: '', item: {}, index: null });
  };
  const onChoosePosition = useCallback(
    (item, index, keyJson, keyValue) => {
      let listChoose = [];
      if (keyJson == 'jsonPosition') {
        const dataJsonPosition =
          item.DisplayAreaList ||
          JSON.parse(itemDataChoose.jsonPosition || '[]');
        listChoose = _.filter(
          dataJsonPosition,
          e =>
            e.Ref_Id == item.CompetitorId ||
            (item.CompetitorId !== _competitorId && e.Ref_Id !== _competitorId),
        );
      } else {
        listChoose = JSON.parse(itemDataChoose[keyJson] || '[]');
      }
      const params = {
        ...item,
        index,
        data: listChoose,
        keyValue: keyValue,
      };
      SheetManager.show('action-item-sheet', { payload: { item: params } });
    },
    [itemDataChoose.jsonPosition, itemDataChoose],
  );

  const onResetData = async (type = 'ALL') => {
    await onActionMenuFAB();
    //
    const _listReset = _.map(dataMain, e => {
      if (type == 'ONLY') {
        if (
          e[configPage.keyGroup] == indexGroup.groupId &&
          e[configPage.keyTab] == indexTab.tabId
        ) {
          return { ...e, Price: null, Display: null, DisplayArea: null };
        } else {
          return e;
        }
      } else return { ...e, Price: null, Display: null, DisplayArea: null };
    });
    await setDataMain(_listReset);
    await setData(_listReset);
    //
    persistData(_listReset, true);
  };
  const onTabChange = async itemTab => {
    try {
      const _itemDataTab = dataTab[itemTab.index][configPage.keyTab];
      const _itemNameTab = dataTab[itemTab.index][configPage.keyTabName];
      //
      setIndexTab({
        ...indexTab,
        index: itemTab.index,
        tabId: _itemDataTab,
        tabName: _itemNameTab,
      });
      onCloseInput();
    } catch (e) {
      console.log('onTabChange: ', e);
    }
  };
  const onScroll = e => {
    const now = Date.now();
    if (now - lastScrollTickRef.current < 120) {
      return;
    }
    lastScrollTickRef.current = now;
    try {
      let offset = e.nativeEvent.contentOffset.y;
      let index = parseInt(offset / 50);
      //
      const _keyTab = dataTab[indexTab.index][configPage.keyTab];
      const _dataInTab = _.filter(
        data,
        e => e.isChooseTag == 1 && e[configPage.keyTab] == _keyTab,
      );
      //
      index = index > _dataInTab.length ? _dataInTab.length : index;
      if (_dataInTab[index] !== undefined) {
        const _subGroupName = _dataInTab[index][configPage.keySubTabName];
        if (_subGroupName !== indexTab.subTitle)
          setIndexTab({ ...indexTab, subTitle: _subGroupName });
      }
    } catch (e) {
      setIndexTab({ index: 0, subTitle: null });
    }
  };
  const actionChangeNote = item => {
    setInput({ type: 'NOTE', keyValue: 'Note', item, index: 0 });
  };
  const onSortData = async (isDisplay = false, type, titleAction) => {
    await setLoading(true);
    const isMenuAction = type == menu.type;
    setMenu(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      type: isMenuAction ? null : type,
      title: isMenuAction ? null : titleAction,
    }));
    //
    let _listSort = _searchData(dataMain, isDisplay, type == 'SORT_NONE');
    const _tabList = _.unionBy(_listSort, configPage.keyTab);

    await setDataTab(_tabList);
    await setData(_listSort);
    await setDataGroup(_listSort);
    await setLoading(false);
  };
  //
  useEffect(() => {
    dataMainRef.current = dataMain;
  }, [dataMain]);

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (latestDataRef.current) {
        saveJsonData(
          shopinfo.shopId,
          kpiinfo.id,
          shopinfo.auditDate,
          latestDataRef.current,
        );
      }
    };
  }, [kpiinfo.id, shopinfo.auditDate, shopinfo.shopId]);

  // View
  const styles = useMemo(
    () =>
      StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', zIndex: 0 },
        searchContainer: {
          margin: 8,
          padding: Platform.OS == 'android' ? 3 : 5,
          paddingHorizontal: 8,
          borderRadius: 20,
          backgroundColor: appcolor.light,
          borderWidth: 0.5,
          borderColor: appcolor.primary,
        },
        searchContainerInput: {
          margin: 8,
          padding: Platform.OS == 'android' ? 3 : 5,
          paddingHorizontal: 8,
          borderRadius: 20,
          backgroundColor: appcolor.primary,
          borderWidth: 0.5,
        },
        searchInputStyle: {
          fontSize: 13,
          color: appcolor.light,
          fontWeight: '500',
        },
        searchStyle: {
          fontSize: 13,
          color: appcolor.primary,
          fontWeight: '500',
        },
        contentView: { width: '100%', height: '100%' },
        contentMain: {
          width: deviceWidth,
          height: deviceHeight,
          paddingTop: 40,
          zIndex: 1,
        },
        itemMain: {
          width: '100%',
          paddingVertical: 8,
          paddingHorizontal: 4,
          flexDirection: 'row',
          borderBottomWidth: 0.5,
          borderBottomColor: appcolor.grayLight,
          alignItems: 'center',
        },
        titleHead: {
          width: '100%',
          fontSize: 13,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
          paddingLeft: 5,
        },
        titleContent: {
          width: '100%',
          fontSize: 13,
          fontWeight: '500',
          color: appcolor.greylight,
          paddingLeft: 5,
        },
        infoView: { width: '60%' },
        cameraView: { width: '20%', alignItems: 'center', alignSelf: 'center' },
        inputView: {
          width: '25%',
          backgroundColor: appcolor.light,
          marginEnd: 8,
          alignItems: 'center',
          alignSelf: 'center',
        },
        labelInput: {
          fontSize: 12,
          fontWeight: '500',
          color: appcolor.greylight,
          fontStyle: 'italic',
        },
        valueInput: {
          fontSize: 13,
          fontWeight: fontWeightBold,
          color: appcolor.greylight,
          fontStyle: 'italic',
        },
        overflowView: {
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 1,
          backgroundColor: appcolor.dark,
          opacity: 0.65,
          justifyContent: 'center',
        },
        headViewMain: {
          margin: 8,
          borderRadius: 3,
          borderBottomEndRadius: 20,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
        },
        subViewPosition: {
          width: '100%',
          height: '100%',
          backgroundColor: appcolor.primary,
          opacity: 0.1,
          position: 'absolute',
          zIndex: 1,
        },
        titleGroupName: {
          width: '42%',
          padding: 5,
          fontWeight: '700',
          color: appcolor.primary,
          zIndex: 2,
          margin: 8,
          fontSize: 14,
        },
        titleNote: {
          width: '100%',
          padding: 5,
          fontWeight: '500',
          color: appcolor.primary,
          fontSize: 13,
          fontStyle: 'italic',
          paddingHorizontal: 16,
        },
        loadingView: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          start: 0,
          end: 0,
          justifyContent: 'center',
          zIndex: 1000,
        },
        actionCheckArea: { padding: 10, paddingStart: 0, paddingVertical: 3 },
        selectedItem: { backgroundColor: appcolor.primary },
        displayAreaButton: {
          width: '100%',
          flexDirection: 'row',
          borderRadius: 5,
          alignItems: 'center',
          paddingHorizontal: 5,
          paddingTop: 8,
        },
        displayAreaText: {
          width: '95%',
          fontSize: 13,
          fontWeight: '600',
          color: appcolor.greylight,
          paddingStart: 5,
        },
        contentChooseItem: { width: '100%' },
        contentActionItem: { width: '100%' },
      }),
    [appcolor],
  );
  const bottomViewStyle = useMemo(
    () => ({
      paddingBottom: deviceHeight / (input.index !== null ? 1.5 : 2.8),
    }),
    [input.index],
  );
  const flashListExtraData = useMemo(
    () => ({
      inputType: input.type,
      inputProductId: input?.item?.ProductId || null,
      inputIndex: input.index,
      tabLength: dataTab.length,
      menuCamera: menu.isOpenCamera,
    }),
    [
      dataTab.length,
      input.index,
      input?.item?.ProductId,
      input.type,
      menu.isOpenCamera,
    ],
  );

  const dataByTab = useMemo(() => {
    return _.groupBy(
      _.filter(data, e => e.isChooseTag == 1),
      configPage.keyTab,
    );
  }, [configPage.keyTab, data]);

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <DisplayRow
          item={item}
          index={index}
          indexGroupId={indexGroup.groupId}
          inputType={input.type}
          inputProductId={input?.item?.ProductId}
          inputIndex={input.index}
          menuIsOpenCamera={menu.isOpenCamera}
          configPage={configPage}
          appcolor={appcolor}
          styles={styles}
          onInputValue={handlerInputValue}
          onShowAction={onChoosePosition}
        />
      );
    },
    [
      appcolor,
      configPage,
      handlerInputValue,
      indexGroup.groupId,
      input.index,
      input?.item?.ProductId,
      input.type,
      menu.isOpenCamera,
      onChoosePosition,
      styles,
    ],
  );

  if (loading || isLoading)
    return (
      <ActivityIndicator style={styles.loadingView} color={appcolor.primary} />
    );
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Cập nhật trưng bày'}
        leftFunc={onBack}
        iconRight="cloud-upload-alt"
        rightFunc={UploadData}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.mainContainer}>
          <SearchData
            placeholder="Tìm kiếm sản phẩm"
            containerStyle={{ margin: 8 }}
            onSearchData={onSearchData}
          />
          <View style={styles.contentView}>
            <GroupList
              dataMain={dataMain}
              listValue={dataGroup}
              keyValue={configPage.keyGroup}
              keyName={configPage.keyGroupName}
              handlerChange={handlerSearchByGroup}
            />
            {dataTab !== null && dataTab.length > 0 ? (
              <Tabs.Container
                pagerProps={{
                  scrollEnabled: true,
                  keyboardShouldPersistTaps: 'handled',
                }}
                renderTabBar={props => (
                  <MaterialTabBar
                    {...props}
                    scrollEnabled
                    labelStyle={{ fontSize: 14, fontWeight: '700' }}
                    indicatorStyle={{ backgroundColor: appcolor.primary }}
                    inactiveColor={appcolor.greylight}
                    activeColor={appcolor.primary}
                    tabStyle={{
                      backgroundColor: appcolor.light,
                      minWidth: minWidthTab(dataTab),
                      height: 38,
                    }}
                  />
                )}
                onTabChange={onTabChange}
                headerContainerStyle={styles.headerContainerStyle}
              >
                {dataTab.length == 0
                  ? null
                  : dataTab.map((item, index) => {
                    const _dataProduct =
                      dataByTab[item[configPage.keyTab]] || [];
                    const titleHead = `${item[configPage.keyTabName]} (${Array.isArray(_dataProduct) ? _dataProduct.length : 0
                      })`;
                    const isDataView =
                      _dataProduct !== null && _dataProduct.length > 0;
                    const noteValue = item.Note || null;
                    return (
                      <Tabs.Tab
                        key={`tabiis_${index}`}
                        label={titleHead}
                        name={titleHead}
                      >
                        <View style={styles.contentMain}>
                          {isDataView && (
                            <View style={styles.headViewMain}>
                              <View style={styles.subViewPosition} />
                              <Text style={styles.titleGroupName}>
                                {item.SubCategoryName}
                              </Text>
                              <HeaderAction
                                key={`headermain-${index}`}
                                isCapture={false}
                                item={item}
                                keyGroup={indexGroup.groupName}
                                keyValue={item[configPage.keyTab]}
                                keyName={item[configPage.keyTabName]}
                                handlerNote={actionChangeNote}
                              />
                            </View>
                          )}
                          {isDataView && noteValue && (
                            <Text
                              style={styles.titleNote}
                            >{`Ghi chú: ${noteValue}`}</Text>
                          )}
                          <FlashList
                            ref={listRef}
                            key={`${indexGroup.groupId}_${item[configPage.keyTabName]
                              }_${index}`}
                            keyExtractor={(it, _index) =>
                              it.ProductId.toString()
                            }
                            data={_dataProduct}
                            extraData={flashListExtraData}
                            renderItem={renderItem}
                            estimatedItemSize={92}
                            contentContainerStyle={{ paddingHorizontal: 8 }}
                            ListFooterComponent={
                              <View style={bottomViewStyle} />
                            }
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                            onScroll={onScroll}
                          />
                        </View>
                      </Tabs.Tab>
                    );
                  })}
              </Tabs.Container>
            ) : (
              <View />
            )}
            <ActionSheet
              id="action-item-sheet"
              closeOnPressBack={!checkClose || configPage.isInputArea}
              closeOnTouchBackdrop={!checkClose || configPage.isInputArea}
              onBeforeShow={setItemChooseAction}
              containerStyle={{ paddingBottom: insets.bottom }}
            >
              <View style={styles.contentActionItem}>
                {configPage.isInputArea &&
                  itemChooseAction?.item?.keyValue == 'DisplayArea' ? (
                  <InputItem
                    isShow
                    key={`chooseitem-${itemChooseAction.index}`}
                    item={itemChooseAction.item}
                    dataItem={itemChooseAction?.item?.data || []}
                    handlerChange={handlerChangePosition}
                  />
                ) : (
                  <ChooseItem
                    isShow
                    key={`chooseitem-${itemChooseAction.index}`}
                    item={itemChooseAction.item}
                    dataItem={itemChooseAction?.item?.data || []}
                    handlerChange={handlerChangePosition}
                  />
                )}
              </View>
            </ActionSheet>
          </View>
          <FloatActionField
            ref={inputRef}
            type={input.type || ''}
            item={input.item || {}}
            index={input.index || null}
            keyValue={input.keyValue || ''}
            onEditing={onEditing}
            handlerEndEditing={handlerEndEditing}
            bottom={1}
          />
        </View>
      </KeyboardAvoidingView>
      {menu.isOpen ? (
        <TouchableOpacity
          style={styles.overflowView}
          onPress={onActionMenuFAB}
        />
      ) : (
        <View />
      )}
      <FloatActionButton
        visible={input.index == null}
        info={menu}
        groupInfo={indexGroup}
        tabInfo={indexTab}
        containerStyle={{ bottom: 24 }}
        showMenu={onActionMenuFAB}
        handlerChange={handlerChangeFAB}
      />
    </View>
  );
};

export default DisplayUpdateScreen;
