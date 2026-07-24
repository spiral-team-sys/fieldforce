import React, { useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@rneui/themed';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { SearchData } from '../../../Control/SearchData/SearchData';
import { ToastError, removeVietnameseTones } from '../../../Core/Helper';
import { DashboardAPI } from '../../../API/DashboardAPI';
import { LoadingView } from '../../../Control/ItemLoading';
import { GroupStatus } from './Control/GroupStatus';
import { ItemView } from './Control/ItemView';
import { ActionFilter } from './Control/ActionFilter';
import { NotifyDisplayReport } from './Views/NotifyDisplayReport';
import moment from 'moment';
import _ from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const StatisticalDisplay = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [itemFilter, setItemFilter] = useState({
    groupName: null,
    search: null,
    newest: false,
    headcount: null,
  });
  const [itemData, setItemData] = useState({});
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const listRef = useRef();
  //
  const LoadData = async () => {
    try {
      setItemFilter({
        groupName: null,
        search: null,
        newest: false,
        headcount: null,
      });
      !isLoading && (await setLoading(true));
      await DashboardAPI.GetSummaryDisplayStatus(async (mData, message) => {
        message && ToastError(message);
        setData(mData);
        setDataMain(mData);
      });
    } catch (e) {
      ToastError(`Lỗi dữ liệu: ${e}`);
    } finally {
      setLoading(false);
    }
  };
  // Handler
  const handlerShowProfile = async item => {
    await dispatch({ type: 'SELECT_SHOP', shopinfo: item });
    await navigation.navigate('profileshops');
  };
  const onBack = () => {
    navigation.goBack();
  };
  const _searchData = (filterList, itemFilter) => {
    let mainDataSearch = _.orderBy(
      filterList,
      ['lastUpdate'],
      [itemFilter.newest ? 'desc' : 'asc'],
    );
    //
    const valueSearch = removeVietnameseTones(itemFilter.search).toLowerCase();
    mainDataSearch = _.filter(
      mainDataSearch,
      e =>
        removeVietnameseTones(e.shopCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.address).toLowerCase().match(valueSearch),
    );
    if (itemFilter.headcount !== null) {
      mainDataSearch = _.filter(
        mainDataSearch,
        e => e.headCountType == itemFilter.headcount,
      );
    }
    if (itemFilter.groupName !== null) {
      mainDataSearch = _.filter(
        mainDataSearch,
        e => e.groupName == itemFilter.groupName,
      );
    }
    return mainDataSearch;
  };
  const onSearchData = text => {
    itemFilter.search = text;
    const listUpdate = _searchData(dataMain, itemFilter);
    setData(listUpdate);
  };
  const handlerChangeGroup = (dataByGroup, valueGroup) => {
    itemFilter.groupName = valueGroup;
    const _dataGroupUpdate = _searchData(dataByGroup, itemFilter);
    setData(_dataGroupUpdate);
    listRef.current.scrollToIndex({ index: 0, animated: true });
  };
  const handlerSortAction = () => {
    SheetManager.show('statistical-setting');
  };
  const handlerFilterData = item => {
    setItemFilter(item);
    const _datafilter = _searchData(dataMain, item);
    setData(_datafilter);
  };
  const handlerDetailReport = item => {
    SheetManager.show('statistical-required-report', { payload: item });
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentMain: { flex: 1 },
    searchStyle: { margin: 8 },
    itemMain: {
      backgroundColor: appcolor.backgroundContent,
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
    },
    loadingView: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 3,
    },
    bottomView: { paddingBottom: 0 },
    titleBottomList: {
      fontSize: 10,
      fontWeight: '500',
      color: appcolor.dark,
      textAlign: 'center',
      padding: 8,
    },
    dateStatusView: {
      minWidth: 100,
      borderRadius: 16,
      paddingVertical: 5,
      paddingHorizontal: 8,
      end: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
    },
    titleDateUpdate: { fontSize: 11, fontWeight: '500', color: appcolor.light },
    actionSheetView: { width: '100%', minHeight: 100, marginBottom: 16 },
    actionBottom: {
      width: '100%',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      marginTop: 5,
    },
    contentRequire: {
      minWidth: 100,
      borderRadius: 16,
      paddingVertical: 5,
      paddingHorizontal: 8,
      marginEnd: 8,
      alignItems: 'center',
      backgroundColor: appcolor.blacklight,
    },
    titleRequired: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.light,
      fontStyle: 'italic',
    },
  });
  if (isLoading)
    return (
      <LoadingView
        isLoading={isLoading}
        title="Đang cập nhật dữ liệu"
        styles={styles.loadingView}
      />
    );
  //
  const renderItem = ({ item, index }) => {
    const onPress = () => handlerShowProfile(item);
    const onNotify = () => handlerDetailReport(item);
    return (
      <TouchableOpacity
        key={`sd-it-${index}`}
        style={styles.itemMain}
        onPress={onPress}
      >
        <ItemView
          isTitle
          iconName="store"
          title={`Cửa hàng: ${item.shopName || ''}`}
        />
        <ItemView
          iconName="map-marker-alt"
          title={`ĐC: ${item.address || ''}`}
        />
        <ItemView iconName="user" title={`${item.updateBy}`} />
        {/* // */}
        <View style={styles.actionBottom}>
          <View
            style={{
              ...styles.dateStatusView,
              backgroundColor: appcolor[item.colorGroup],
            }}
          >
            <Text style={styles.titleDateUpdate}>
              {moment(item.lastUpdate).fromNow()}
            </Text>
          </View>
          <TouchableOpacity style={styles.contentRequire} onPress={onNotify}>
            <Text style={styles.titleRequired}>{`Yêu cầu làm báo cáo`}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={onBack}
        iconRight="cogs"
        rightFunc={handlerSortAction}
      />
      {/* // Content List  */}
      <View style={styles.contentMain}>
        <SearchData
          key="search-statistical-display"
          placeholder="Tìm kiếm cửa hàng"
          containerStyle={styles.searchStyle}
          onSearchData={onSearchData}
        />
        <GroupStatus
          data={dataMain}
          onChange={handlerChangeGroup}
          itemFilter={itemFilter}
        />
        <FlashList
          ref={listRef}
          key="statistical-display-list"
          keyExtractor={(_item, index) => index.toString()}
          data={data}
          estimatedItemSize={100}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadData} />
          }
          ListFooterComponent={
            <View style={styles.bottomView}>
              <Text style={styles.titleBottomList}>Đã xem hết</Text>
            </View>
          }
        />
      </View>
      {/* // */}
      <ActionSheet
        id="statistical-setting"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.actionSheetView}>
          <ActionFilter
            key="action-filter-statistical"
            itemFilter={itemFilter}
            handlerFilterData={handlerFilterData}
          />
        </View>
      </ActionSheet>
      <ActionSheet
        id="statistical-required-report"
        onBeforeShow={setItemData}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.actionSheetView}>
          <NotifyDisplayReport
            key="notify-display-report"
            itemData={itemData}
          />
        </View>
      </ActionSheet>
    </View>
  );
};
