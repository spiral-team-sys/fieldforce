import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SheetManager } from 'react-native-actions-sheet';
import { OOSAPI } from '../../../../../API/OOSAPI';
import { ToastError, removeVietnameseTones } from '../../../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { ItemProduct } from '../Items/ItemProduct';
import { deviceHeight, minWidthTab } from '../../../../../Core/Utility';
import { LoadingView } from '../../../../../Control/ItemLoading';
import { GroupListData } from '../../../../../Control/GroupListData';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import { deviceWidth } from '../../../../../Themes/AppsStyle';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import _ from 'lodash';

export const ScreenListProduct = ({ itemGroup }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [data, setData] = useState([]);
  const [dataTab, setDataTab] = useState([]);
  const [search, _setItemSearch] = useState({
    text: '',
    tagName: null,
    isSearch: false,
  });
  const [_mutate, setMutate] = useState(false);
  // Size Item
  const [estimatedSize, setEstimatedSize] = useState(0);
  const totalHeight = useRef(0);
  const itemCount = useRef(0);
  const listRef = useRef(null);
  //
  const LoadData = async () => {
    await setLoading(true);
    await OOSAPI.GetListSummary(
      'PRODUCT',
      itemGroup || {},
      async (mData, message) => {
        message && ToastError(message);
        const tabList = _.unionBy(mData, 'tabName');
        await setDataTab(tabList);
        await setData(mData);
        await setDataMain(mData);
        await setDataGroup(mData);
      },
    );
    await setLoading(false);
  };
  const FilterData = async filterObject => {
    await setLoading(true);
    await OOSAPI.GetListSummary(
      'PRODUCT',
      { ...filterObject, ...itemGroup },
      async (mData, message) => {
        message && ToastError(message);
        const tabList = _.unionBy(mData, 'tabName');
        await setDataTab([]);
        await setDataTab(tabList);
        await setData(mData);
        await setDataMain(mData);
        await setDataGroup(mData);
      },
    );
    await setLoading(false);
  };
  // Handler
  const handleItemLayout = event => {
    const { height } = event.nativeEvent.layout;
    totalHeight.current += parseInt(height);
    itemCount.current += 1;
    setEstimatedSize(totalHeight.current / itemCount.current);
  };
  const handlerShowStore = item => {
    SheetManager.show('oos-store', { payload: item });
  };
  const _searchData = filterList => {
    let dataSearchMain = _.filter(filterList, e => e.isChooseTag == 1);
    if (dataSearchMain == null || dataSearchMain.length == 0)
      dataSearchMain = filterList;
    //
    dataSearchMain = _.filter(
      dataSearchMain,
      e => e.highlightDescription == search.tagName || search.tagName == null,
    );
    //
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    const searchData = _.filter(
      dataSearchMain,
      e =>
        removeVietnameseTones(e.productName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.productCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.groupName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.tabName).toLowerCase().match(valueSearch),
    );
    return searchData;
  };
  const onSearchData = async text => {
    search.text = text;
    setMutate(e => !e);
    //
    const listUpdate = _searchData(dataMain);
    const _groupByTag = _.filter(
      listUpdate,
      e => e.highlightDescription == search.tagName || search.tagName == null,
    );
    const _tabList = _.unionBy(listUpdate, 'tabName');
    await setDataTab([]);
    await setDataTab(_tabList);
    setData(listUpdate);
    setDataGroup(_groupByTag);
  };
  const handlerSearchByGroup = async (item, keyValue, isMultiple) => {
    search.text = null;
    const listChooseGroup = _.map(dataGroup, (it, _idx) => {
      if (item.keyValue == it[keyValue])
        return { ...it, isChooseTag: it.isChooseTag == 1 ? 0 : 1 };
      else return isMultiple ? it : { ...it, isChooseTag: 0 };
    });
    //
    const _productByGroup = _searchData(listChooseGroup);
    const _dataShow =
      _productByGroup !== null && _productByGroup.length > 0
        ? _productByGroup
        : listChooseGroup;
    const _tabList = _.unionBy(_dataShow, 'tabName');
    await setDataTab([]);
    await setDataTab(_tabList);
    await setDataGroup(listChooseGroup);
    await setData(_dataShow);
  };
  const handlerSortByTag = value => {
    search.tagName = value;
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    onSearchData(search.text);
  }, [search.tagName]);
  useEffect(() => {
    if (itemCount.current > 0) {
      setEstimatedSize(totalHeight.current / itemCount.current);
    }
  }, [itemCount.current]);
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    const _filterData = DeviceEventEmitter.addListener(
      'FILTER_DATA_OOS',
      FilterData,
    );
    const _sortByTag = DeviceEventEmitter.addListener(
      'SORT_TAG_OOS',
      handlerSortByTag,
    );
    LoadData();
    return () => {
      isMounted = false;
      _filterData.remove();
      _sortByTag.remove();
    };
  }, []);

  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    bottomView: { paddingBottom: 16 },
    opacityView: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 2,
      top: 0,
      backgroundColor: appcolor.light,
      opacity: 0.8,
    },
    loadingView: {
      width: '100%',
      height: '80%',
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 3,
    },
    contentMain: { width: deviceWidth, paddingTop: 40, zIndex: 1 },
    searchContainer: { marginHorizontal: 8, marginVertical: 0 },
  });
  const renderItem = ({ item, index }) => {
    return (
      <ItemProduct
        item={item}
        index={index}
        onLayout={handleItemLayout}
        onPress={handlerShowStore}
      />
    );
  };
  return (
    <View style={styles.mainContainer}>
      <SearchData
        placeholder="Tìm kiếm sản phẩm"
        iconName="search"
        value={search.text}
        onSearchData={onSearchData}
        containerStyle={styles.searchContainer}
      />
      {isLoading && <View style={styles.opacityView} />}
      <LoadingView
        isLoading={isLoading}
        title="Đang cập nhật dữ liệu"
        styles={styles.loadingView}
      />
      <GroupListData
        dataMain={dataGroup}
        keyValue={'groupName'}
        keyName={'groupName'}
        handlerChange={handlerSearchByGroup}
      />
      {dataTab !== null && dataTab.length > 0 && (
        <Tabs.Container
          pagerProps={{
            scrollEnabled: true,
            keyboardShouldPersistTaps: 'handled',
          }}
          renderTabBar={props => (
            <MaterialTabBar
              {...props}
              scrollEnabled
              labelStyle={{ fontSize: 13, fontWeight: '700' }}
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
          headerContainerStyle={styles.headerContainerStyle}
        >
          {dataTab.map((item, index) => {
            const _dataProduct = _.filter(data, e => e.tabName == item.tabName);
            const titleHead = `${item.tabName}${
              _dataProduct.length > 0 ? ` (${_dataProduct.length})` : ``
            }`;
            return (
              <Tabs.Tab
                key={`tabisum_${index}`}
                label={titleHead}
                name={titleHead}
              >
                <View style={styles.contentMain}>
                  <FlashList
                    ref={listRef}
                    key={`${item.tabName}_${index}`}
                    keyExtractor={(it, _index) => it.productId.toString()}
                    data={_dataProduct}
                    extraData={[_dataProduct, dataTab]}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    estimatedItemSize={100}
                    getItemLayout={(_data, idx) => ({
                      length: _data.length,
                      offset: 100 * idx,
                      idx,
                    })}
                    ListFooterComponent={<View style={styles.bottomView} />}
                    refreshControl={
                      <RefreshControl refreshing={false} onRefresh={LoadData} />
                    }
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  />
                </View>
              </Tabs.Tab>
            );
          })}
        </Tabs.Container>
      )}
    </View>
  );
};
