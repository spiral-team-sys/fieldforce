import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import { HeaderCustom } from '../../../../../Content/HeaderCustom';
import { removeVietnameseTones } from '../../../../../Core/Helper';
import { deviceHeight } from '../../../../../Core/Utility';
import { ScreenWareType } from '../../../../Reports/OOS/Page/ScreenWareType';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import CustomListView from '../../../../../Control/Custom/CustomListView';
import _ from 'lodash';

export const ScreenGroup = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = () => {
    const _detailData = route.params.dataDetails || [];
    setDataMain(_detailData);
    setData(_detailData);
  };
  const onBack = () => {
    navigation.goBack();
  };
  // Handler
  const onSearchData = text => {
    search.text = text;
    setMutate(e => !e);
    //
    const listUpdate = _searchData(dataMain);
    setData(listUpdate);
  };
  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    const searchData = _.filter(
      filterList,
      e =>
        removeVietnameseTones(e.ProductName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.ProductCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.GroupList).toLowerCase().match(valueSearch),
    );
    return searchData;
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
    contentMain: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    titleHead: {
      fontSize: 14,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
    },
    titleContent: {
      fontSize: 12,
      color: appcolor.placeholderText,
      fontWeight: '500',
    },
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
    itemMain: { flexDirection: 'row', justifyContent: 'center' },
    headerMain: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 1,
    },
    itemHeaderView: {
      width: '20%',
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      marginHorizontal: 0.5,
    },
    itemView: {
      width: '20%',
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      marginHorizontal: 0.5,
    },
    titleGroup: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      padding: 8,
    },
    titleValue: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
    },
    viewTitlte: { width: '100%', flexDirection: 'row', alignItems: 'center' },
    titleTableView: {
      width: '70%',
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
      fontStyle: 'italic',
    },
    bottomView: { paddingBottom: deviceHeight / 5 },
  });
  const renderHeader = () => {
    const itemHeader = dataMain[0] || {};
    return (
      <View style={styles.headerMain}>
        <View style={styles.itemHeaderView}>
          <Text style={styles.titleGroup}>
            {itemHeader.TitleGroup || 'Group'}
          </Text>
        </View>
        <View style={{ ...styles.itemHeaderView, width: '50%' }}>
          <Text style={styles.titleGroup}>
            {itemHeader.TitleModel || 'Model'}
          </Text>
        </View>
        <View style={{ ...styles.itemHeaderView, width: '30%' }}>
          <Text style={styles.titleGroup}>
            {itemHeader.TitleValue || 'OOSDays'}
          </Text>
        </View>
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const backgroundColor =
      index % 2 == 0 ? appcolor.surface : appcolor.grayLight;
    return (
      <View key={`ism_r-${index}`} style={styles.itemMain}>
        <View
          style={{
            ...styles.itemView,
            width: '20%',
            backgroundColor: backgroundColor,
          }}
        >
          <Text style={styles.titleValue}>{item.GroupList || '-'}</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '50%',
            backgroundColor: backgroundColor,
          }}
        >
          <Text style={styles.titleValue}>{item.ProductName || '-'}</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '30%',
            backgroundColor: backgroundColor,
          }}
        >
          <Text style={styles.titleValue}>{item.OOSDays}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        iconLeft="times"
        title="Sản phẩm hết hàng"
        leftFunc={onBack}
      />
      <View style={styles.contentMain}>
        <ScreenWareType key="waretype-group" />
        <SearchData
          placeholder="Tìm kiếm sản phẩm"
          onSearchData={onSearchData}
        />
        {renderHeader()}
        <CustomListView data={data} extraData={data} renderItem={renderItem} />
      </View>
    </View>
  );
};
