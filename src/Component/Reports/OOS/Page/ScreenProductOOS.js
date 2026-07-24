import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import { Text } from '@rneui/themed';
import { REPORT } from '../../../../API/ReportAPI';
import { ToastError, removeVietnameseTones } from '../../../../Core/Helper';
import { GroupListData } from '../../../../Control/GroupListData';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../../Themes/AppsStyle';
import { minWidthTab, optionConfirm } from '../../../../Core/Utility';
import {
  removeRawReport,
  saveJsonData,
} from '../../../../Controller/ReportController';
import { FloatActionButton } from '../Control/FloatActionButton';
import { CameraAction } from '../Control/CameraAction';
import { GroupCheckBox } from '../../../../Control/GroupCheckBox';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import _ from 'lodash';

export const ScreenProductOOS = ({ isActionType }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [configPage, setConfigPage] = useState({
    keyGroup: 'CompetitorId',
    keyGroupName: 'CompetitorName',
    keyTab: 'CategoryId',
    keyTabName: 'CategoryName',
    keySubTabName: 'SubCategoryName',
  });
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [dataTab, setDataTab] = useState([]);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
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
  const [indexGroup, _setIndexGroup] = useState({
    groupId: 0,
    groupName: null,
  });
  const [indexTab, setIndexTab] = useState({
    index: 0,
    tabId: 0,
    tabName: null,
    subTitle: null,
  });
  const [_mutate, setMutate] = useState(false);
  const listRef = useRef();
  //
  const LoadData = async () => {
    await setLoading(true);
    const _configPage = JSON.parse(kpiinfo.reportItem || '{}');
    await setConfigPage(_configPage);
    //
    const itemFilter = { reportId: kpiinfo.id, shopId: shopinfo.shopId };
    await REPORT.GetDataReportByShop(itemFilter, async (mData, message) => {
      message && ToastError(message, 'Lỗi dữ liệu', 'top');
      //
      const groupList = _.unionBy(mData, _configPage.keyGroup);
      const tabList = _.unionBy(mData, _configPage.keyTab);
      const productList = _.filter(mData, e => e.isChooseTag == 1);
      //
      indexGroup.groupId = productList[0][configPage.keyGroup];
      indexGroup.groupName = productList[0][configPage.keyGroupName];
      indexTab.tabId = tabList[0][configPage.keyTab];
      indexTab.tabName = tabList[0][configPage.keyTabName];
      //
      await setDataMain(mData);
      await setData(productList);
      await setDataGroup(groupList);
      await setDataTab(tabList);
    });
    await setLoading(false);
  };
  // Handler
  const onSearchData = text => {
    search.text = text;
    setMutate(e => !e);
    //
    const listUpdate = _searchData(dataMain, menu.type == 'SORT');
    setData(listUpdate);
  };
  const handlerSearchByGroup = async (item, keyValue, isMultiple) => {
    indexGroup.groupId = item.keyValue;
    indexGroup.groupName = item.keyName;
    //
    const listChooseGroup = _.map(dataMain, (it, _idx) => {
      if (item.keyValue == it[keyValue])
        return { ...it, isChooseTag: it.isChooseTag == 1 ? 0 : 1 };
      else return isMultiple ? it : { ...it, isChooseTag: 0 };
    });
    //
    const _productByGroup = _searchData(listChooseGroup, menu.type == 'SORT');
    const _tabList = _.unionBy(_productByGroup, configPage.keyTab);
    await setDataTab([]);
    await setDataTab(_tabList);
    await setDataMain(listChooseGroup);
    await setData(
      _productByGroup !== null && _productByGroup.length > 0
        ? _productByGroup
        : listChooseGroup,
    );
  };
  const handlerInputValue = (itemUpdate, item) => {
    item = itemUpdate;
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, dataMain);
  };
  const closeMenu = () => {
    setMenu(prev => ({ ...prev, isOpen: false }));
  };
  const onActionMenuFAB = () => {
    setMenu(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };
  const handlerChangeFAB = async (type, titleAction) => {
    let optionReset = [
      { text: 'Hủy' },
      { text: 'Xác nhận', onPress: onResetData },
    ];
    const isMenuAction = type == menu.type;
    switch (type) {
      case 'CHECKALL':
        closeMenu();
        onCheckAllOOS();
        break;
      case 'SORT':
        setMenu({
          ...menu,
          isOpen: false,
          type: isMenuAction ? null : type,
          title: isMenuAction ? null : titleAction,
        });
        let _listSort = _searchData(dataMain, !isMenuAction);
        const _tabList = _.unionBy(_listSort, configPage.keyTab);
        setDataTab(_tabList);
        setData(_listSort);
        break;
      case 'DELETE':
        closeMenu();
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
        closeMenu();
        optionConfirm(
          titleAction,
          'Dữ liệu sẽ được làm mới sau khi bạn "Xác nhận", Bạn có muốn xóa tất cả dữ liệu không ?',
          optionReset,
        );
        break;
    }
  };
  // Action
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
    } catch (e) {
      console.log('onTabChange: ', e);
    }
  };
  const onScroll = e => {
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
        if (_subGroupName !== indexTab.title)
          setIndexTab({ ...indexTab, subTitle: _subGroupName });
      }
    } catch (e) {
      setIndexTab({ index: 0, subTitle: null });
    }
  };
  const _searchData = (filterList, isDataInput = false) => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
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
    //
    if (isDataInput) {
      const searchDataInput = _.filter(searchData, e => e.OOS == 1);
      return searchDataInput;
    }
    return searchData;
  };
  const onResetData = async (type = 'ALL') => {
    closeMenu();
    if (type !== 'ONLY') {
      await removeRawReport(shopinfo.shopId, kpiinfo.id);
      await LoadData();
      return;
    }
    //
    const _listReset = _.map(dataMain, e => {
      if (
        e[configPage.keyGroup] == indexGroup.groupId &&
        e[configPage.keyTab] == indexTab.tabId
      ) {
        return { ...e, OOS: null };
      } else return e;
    });
    await setDataMain(_listReset);
    await setData(_listReset);
    //
    saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, _listReset);
  };
  const onCheckAllOOS = async () => {
    closeMenu();
    //
    const _dataUpdate = _.map(dataMain, e => {
      return { ...e, OOS: 0 };
    });
    setDataMain(_dataUpdate);
    setData(_dataUpdate);
    saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, _dataUpdate);
  };
  //
  useEffect(() => {
    LoadData();
  }, []);
  // View
  const styles = StyleSheet.create({
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
    searchStyle: { fontSize: 13, color: appcolor.primary, fontWeight: '500' },
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
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleContent: {
      width: '100%',
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    infoView: { width: '50%' },
    cameraView: { width: '20%', alignItems: 'center', alignSelf: 'center' },
    inputView: { width: '23%', alignItems: 'flex-end', alignSelf: 'center' },
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
    bottomView: {
      paddingBottom: deviceHeight / (input.index !== null ? 1.5 : 2.8),
    },
    overflowView: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      zIndex: 900,
      elevation: 10,
      backgroundColor: appcolor.dark,
      opacity: 0.65,
      justifyContent: 'center',
    },
    actionContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      zIndex: 2000,
      elevation: 50,
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
      margin: 5,
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
      top: 56,
      start: 0,
      end: 0,
      justifyContent: 'center',
      zIndex: 1000,
    },
    actionCheckArea: { padding: 10, paddingStart: 0, paddingVertical: 3 },
  });
  const renderItem = ({ item, index }) => {
    const onChange = update => {
      handlerInputValue(update, item);
    };
    const isOOS = (item.OOS || null) == 1 && item.isHideTakePhoto !== 1;

    return (
      <View key={`it_${indexGroup.groupId}_${index}`} style={styles.itemMain}>
        <View style={styles.infoView}>
          <Text style={styles.titleHead}>{`${index + 1}. ${
            item.ProductName
          }`}</Text>
          <Text style={styles.titleContent}>{`Code: ${item.ProductCode}`}</Text>
        </View>
        <CameraAction
          key={`cameraaction-${index}`}
          enable={isOOS}
          keyGroup={item[configPage.keyGroupName]}
          keyValue={item.ProductId}
          keyName={item.ProductCode}
        />
        <View style={styles.inputView}>
          <GroupCheckBox item={item} keyValue="OOS" onChange={onChange} />
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <SearchData
        placeholder={'Tìm kiếm sản phẩm'}
        onSearchData={onSearchData}
      />
      <View style={styles.contentView}>
        {dataGroup !== null && dataGroup.length > 1 && (
          <GroupListData
            dataMain={dataMain}
            keyValue={configPage.keyGroup}
            keyName={configPage.keyGroupName}
            handlerChange={handlerSearchByGroup}
          />
        )}
        {isLoading && (
          <ActivityIndicator
            style={styles.loadingView}
            color={appcolor.primary}
          />
        )}
        {/* // Content Products */}
        {dataTab !== undefined && dataTab !== null && dataTab.length > 0 && (
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
            {dataTab.map((item, index) => {
              const _dataProduct = _.filter(
                data,
                e =>
                  e.isChooseTag == 1 &&
                  e[configPage.keyTab] == item[configPage.keyTab],
              );
              const titleHead = `${item[configPage.keyTabName]}${
                _dataProduct.length > 0 ? ` (${_dataProduct.length})` : ``
              }`;
              const isDataView =
                _dataProduct !== null && _dataProduct.length > 0;
              const noteValue = item.Note || null;
              return (
                <Tabs.Tab
                  key={`tabioos_${index}`}
                  label={titleHead}
                  name={titleHead}
                >
                  <View style={styles.contentMain}>
                    {isDataView && (
                      <View style={styles.headViewMain}>
                        <View style={styles.subViewPosition} />
                        <Text style={styles.titleGroupName}>
                          {indexTab.subTitle || item.SubCategoryName}
                        </Text>
                      </View>
                    )}
                    {isDataView && noteValue && (
                      <Text
                        style={styles.titleNote}
                      >{`Ghi chú: ${noteValue}`}</Text>
                    )}
                    <FlashList
                      ref={listRef}
                      key={`${indexGroup.groupId}_${
                        item[configPage.keyTabName]
                      }_${index}`}
                      keyExtractor={(it, _index) => it.ProductId.toString()}
                      data={_dataProduct}
                      extraData={[input, _dataProduct, dataTab]}
                      renderItem={renderItem}
                      contentContainerStyle={{ paddingHorizontal: 8 }}
                      estimatedItemSize={100}
                      getItemLayout={(_data, idx) => ({
                        length: _data.length,
                        offset: 100 * idx,
                        idx,
                      })}
                      ListFooterComponent={<View style={styles.bottomView} />}
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
        )}
      </View>
      {/* // FLoat Action View */}
      <View pointerEvents="box-none" style={styles.actionContainer}>
        {menu.isOpen && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.overflowView}
            onPress={onActionMenuFAB}
          />
        )}
        <FloatActionButton
          visible={input.index == null}
          info={menu}
          groupInfo={indexGroup}
          tabInfo={indexTab}
          showMenu={onActionMenuFAB}
          handlerChange={handlerChangeFAB}
          containerStyle={{
            bottom: deviceHeight / (isActionType ? 4.5 : 7),
            zIndex: 1000,
            elevation: 60,
          }}
        />
      </View>
    </View>
  );
};
