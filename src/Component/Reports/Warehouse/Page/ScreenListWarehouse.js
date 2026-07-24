import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@rneui/themed';
import { debounce, removeVietnameseTones } from '../../../../Core/Helper';
import { GroupListData } from '../../../../Control/GroupListData';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import { minWidthTab } from '../../../../Core/Utility';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../../Themes/AppsStyle';
import {
  getDataByReport,
  saveJsonData,
} from '../../../../Controller/ReportController';
import { ItemWarehouse } from '../Items/ItemWarehouse';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import _ from 'lodash';

export const ScreenListWarehouse = ({ isReload }) => {
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [configPage, setConfigPage] = useState({});
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
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
  const [menu, _setMenu] = useState({
    isOpenCamera: false,
    isOpen: false,
    type: null,
    title: null,
  });
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [dataTab, setDataTab] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const listRef = useRef();
  //
  const LoadData = async () => {
    await setLoading(true);
    const _configPage = JSON.parse(kpiinfo.reportItem || '{}');
    await setConfigPage(_configPage);
    //
    const result = await getDataByReport(shopinfo.shopId, kpiinfo.id);
    if (result.data !== null && result.data.length > 0) {
      const groupList = _.unionBy(result.data, _configPage.keyGroup);
      const tabList = _.unionBy(result.data, _configPage.keyTab);
      let warehouseList = _.filter(result.data, e => e.isChooseTag == 1);
      if (warehouseList == null || warehouseList.length == 0)
        warehouseList = result.data;
      //
      indexGroup.groupId = warehouseList[0][configPage.keyGroup];
      indexGroup.groupName = warehouseList[0][configPage.keyGroupName];
      indexTab.tabId = tabList[0][configPage.keyTab];
      indexTab.tabName = tabList[0][configPage.keyTabName];
      //
      await setDataMain(result.data);
      await setData(warehouseList);
      await setDataGroup(groupList);
      await setDataTab(tabList);
    }
    await setLoading(false);
  };
  // Handler
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
    const _dataByGroup = _searchData(listChooseGroup, menu.type == 'SORT');
    const _tabList = _.unionBy(_dataByGroup, configPage.keyTab);
    await setDataTab([]);
    await setDataTab(_tabList);
    await setDataMain(listChooseGroup);
    await setData(
      _dataByGroup !== null && _dataByGroup.length > 0
        ? _dataByGroup
        : listChooseGroup,
    );
  };
  const handlerChangeType = (itemUpdate, item) => {
    item = itemUpdate;
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, dataMain);
  };
  // Action
  const onTabChange = itemTab => {
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
      const _dataInTab = _.filter(data, e => e[configPage.keyTab] == _keyTab);
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
  const onSearchData = debounce(text => {
    search.text = text;
    setMutate(e => !e);
    //
    const listUpdate = _searchData(dataMain);
    const _tabList = _.unionBy(listUpdate, configPage.keyTab);
    setDataTab([]);
    setDataTab(_tabList);
    setData(listUpdate);
  }, 200);
  const onFocusSearch = () => {
    search.isSearch = !search.isSearch;
    setMutate(e => !e);
  };
  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    const filterByTag = _.filter(filterList, e => e.isChooseTag == 1);
    //
    const searchData = _.filter(
      filterByTag !== null && filterByTag.length > 0 ? filterByTag : filterList,
      e =>
        removeVietnameseTones(e.WareHouseName)
          .toLowerCase()
          .match(valueSearch) ||
        removeVietnameseTones(e.WareHouseCode)
          .toLowerCase()
          .match(valueSearch) ||
        removeVietnameseTones(e.Address).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.DealerCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.DealerName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.ProvinceName)
          .toLowerCase()
          .match(valueSearch) ||
        removeVietnameseTones(e.DistrictName)
          .toLowerCase()
          .match(valueSearch) ||
        removeVietnameseTones(e.TownName).toLowerCase().match(valueSearch),
    );
    return searchData;
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [isReload]);
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
    contentMain: { width: deviceWidth, flex: 1, paddingTop: 40, zIndex: 1 },
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
    bottomView: { paddingBottom: deviceHeight / 4 },
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
      top: 56,
      start: 0,
      end: 0,
      justifyContent: 'center',
      zIndex: 1000,
    },
    actionCheckArea: { padding: 10, paddingStart: 0, paddingVertical: 3 },
  });
  const renderItem = ({ item, index }) => {
    const onChange = itemUpdate => {
      handlerChangeType(itemUpdate, item);
    };
    return (
      <ItemWarehouse
        key={`islw-${indexGroup.groupId}_${index}`}
        item={item}
        index={index}
        onChange={onChange}
      />
    );
  };
  return (
    <View style={styles.mainContainer}>
      <SearchData placeholder="Tìm kiếm kho" onSearchData={onSearchData} />
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
        {/* // Content Warehouse */}
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
              const _dataWarehouse = _.filter(
                data,
                e => e[configPage.keyTab] == item[configPage.keyTab],
              );
              const titleHead = `${item[configPage.keyTabName]}${
                _dataWarehouse.length > 0 ? ` (${_dataWarehouse.length})` : ``
              }`;
              const isDataView =
                _dataWarehouse !== null &&
                _dataWarehouse.length > 0 &&
                item.DistrictName;
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
                          {indexTab.subTitle || item.DistrictName}
                        </Text>
                      </View>
                    )}
                    <FlashList
                      ref={listRef}
                      key={`${indexGroup.groupId}_${
                        item[configPage.keyTabName]
                      }_${index}`}
                      keyExtractor={(it, _index) => it.WareHouseId.toString()}
                      data={_dataWarehouse}
                      extraData={[_dataWarehouse, dataTab]}
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
                      onScroll={onScroll}
                    />
                  </View>
                </Tabs.Tab>
              );
            })}
          </Tabs.Container>
        )}
      </View>
    </View>
  );
};
