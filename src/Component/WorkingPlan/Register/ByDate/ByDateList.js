import React, { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import { removeVietnameseTones } from '../../../../Core/Helper';
import ByDateItem from './ByDateItem';
import _ from 'lodash';

const ByDateList = ({ dataMain = [] }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataPlan, setDataPlan] = useState([]);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const ref = useRef();
  let debounceTimeout;
  //
  const LoadData = () => {
    try {
      search.text = '';
      search.isSearch = false;
      setDataPlan(dataMain);
      handlerScrollToIndex(0);
    } catch (e) {
      console.log('Lỗi dữ liệu: ', e);
    }
  };
  const handlerUpdateList = params => {
    if (params?.type == 'NOTE') {
      const dataUpdate = _.map(dataMain, e => {
        if (e.confirmPlan == 3) {
          return { ...e, note: params.note };
        }
        return e;
      });
      const listUpdate = _searchData(dataUpdate);
      setDataPlan(listUpdate);
    }
  };
  const handlerScrollToIndex = index => {
    ref?.current?.scrollToIndex({ index: index, animated: true });
  };
  const onSearchData = text => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      search.text = text;
      const listUpdate = _searchData(dataMain);
      setDataPlan(listUpdate);
    }, 100);
  };
  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    //
    const searchData = _.filter(
      filterList,
      e =>
        removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.shopCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.address).toLowerCase().match(valueSearch),
    );
    return searchData;
  };
  //
  useEffect(() => {
    const updateList = DeviceEventEmitter.addListener(
      'PLAN_UPDATE_LIST',
      handlerUpdateList,
    );
    const scrollToIndex = DeviceEventEmitter.addListener(
      'SCROLL_TO_INDEX',
      handlerScrollToIndex,
    );
    LoadData();
    return () => {
      updateList.remove();
      scrollToIndex.remove();
    };
  }, [dataMain]);
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
  });
  const renderItem = ({ item, index }) => {
    return <ByDateItem item={item} index={index} />;
  };
  return (
    <View style={styles.mainContainer}>
      <SearchData
        placeholder={`Tìm kiếm ${dataMain.length} cửa hàng`}
        value={search.text}
        onSearchData={onSearchData}
      />
      <CustomListView
        ref={ref}
        data={dataPlan}
        extraData={dataPlan}
        renderItem={renderItem}
      />
    </View>
  );
};

export default ByDateList;
