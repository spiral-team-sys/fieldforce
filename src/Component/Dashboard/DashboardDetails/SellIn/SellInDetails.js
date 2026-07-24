import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, Platform, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { DashboardAPI } from '../../../../API/DashboardAPI';
import { ToastError, removeVietnameseTones } from '../../../../Core/Helper';
import { LoadingView } from '../../../../Control/ItemLoading';
import { GroupItemView } from '../Controls/View/GroupItemView';
import FormGroup from '../../../../Content/FormGroup';
import _ from 'lodash';
import { Text } from '@rneui/base';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const SellInDetails = ({ tagView, yearValue, monthValue }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    DeviceEventEmitter.emit('SCROLL_TO_ITEM', 0);
    await setLoading(true);
    const itemFilter = {
      dashboardType: 'SELLIN',
      shopId: shopinfo?.shopId || 0,
      yearValue: yearValue,
      monthValue: monthValue,
      tagView: tagView,
    };
    await DashboardAPI.GetDashboardDetails(
      itemFilter,
      async (mData, messager) => {
        messager && ToastError(messager, 'Lỗi dữ liệu', 'top');
        await setData(mData);
        await setDataMain(mData);
      },
    );
    await setLoading(false);
  };
  const onSearchData = text => {
    search.text = text;
    setMutate(e => !e);
    //
    const _searchValue = removeVietnameseTones(text).toLowerCase();
    const filterList = _.filter(dataMain, e =>
      removeVietnameseTones(e.n1).toLowerCase().match(_searchValue),
    );
    setData(filterList);
  };
  const onFocusSearch = () => {
    search.isSearch = !search.isSearch;
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [yearValue, monthValue, tagView]);
  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, width: '100%', backgroundColor: appcolor.light },
    contentMain: { flex: 1, width: '100%' },
    titleNoData: {
      width: '100%',
      textAlign: 'center',
      color: appcolor.primary,
      fontSize: 14,
      fontWeight: fontWeightBold,
      padding: 8,
    },
    searchContainer: {
      margin: 8,
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
    },
    searchContainerInput: {
      margin: 8,
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.primary,
      borderWidth: 0.5,
    },
    searchInputStyle: {
      fontSize: 14,
      color: appcolor.light,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
    },
    searchStyle: { fontSize: 14, color: appcolor.dark },
  });
  return (
    <View style={styles.mainContainer}>
      <FormGroup
        editable
        placeholder="Tìm kiếm"
        iconName="search"
        defaultValue={search.text}
        iconColor={search.isSearch ? appcolor.light : appcolor.primary}
        useClearAndroid={search.text !== null && search.text.length > 0}
        placeholderColor={search.isSearch ? appcolor.surface : appcolor.primary}
        containerStyle={
          search.isSearch ? styles.searchContainerInput : styles.searchContainer
        }
        inputStyle={
          search.isSearch ? styles.searchInputStyle : styles.searchStyle
        }
        handleChangeForm={onSearchData}
        onClearTextAndroid={onSearchData}
        onFocus={onFocusSearch}
        onEndEditing={onFocusSearch}
      />
      {!isLoading && dataMain == null && (
        <Text
          style={styles.titleNoData}
        >{`Không có dữ liệu Tháng ${monthValue} - ${yearValue}`}</Text>
      )}
      <LoadingView isLoading={isLoading} title="Đang cập nhật dữ liệu" />
      {/* // Content Main */}
      <View style={styles.contentMain}>
        <GroupItemView dataMain={data} reload={LoadData} />
      </View>
    </View>
  );
};
