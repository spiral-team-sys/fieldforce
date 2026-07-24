import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/themed';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import { removeVietnameseTones } from '../../../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import _ from 'lodash';

export const ShopPermission = ({ data, info, callIndex }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [dataShop, setDataShop] = useState([]);
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    await setDataMain(data);
    await setDataShop(data);
  };
  // Handler
  const onItemChoose = item => {
    item.shopId = item.ShopId;
    item.shopCode = item.ShopCode;
    item.shopName = item.ShopName;
    //
    const objectUpdate = { item, type: 'SHOP' };
    DeviceEventEmitter.emit('UPDATE_REQUEST_INFO', objectUpdate);
    callIndex(1);
    setMutate(e => !e);
  };
  const handlerSearchInfo = text => {
    const valueSearch = removeVietnameseTones(text).toLowerCase();
    const lstFilter = _.filter(dataMain, e => {
      return (
        removeVietnameseTones(e.ShopCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.ShopName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.Address).toLowerCase().match(valueSearch)
      );
    });
    setDataShop(lstFilter);
  };
  //
  useEffect(() => {
    const _loadShop = LoadData();
    return () => _loadShop;
  }, [data]);

  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    inputStyle: { fontSize: 12, color: appcolor.homebackground },
    contentItem: { flex: 1 },
    itemContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 5,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    titleMain: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.blacklight,
      padding: 5,
      paddingHorizontal: 0,
    },
    subTitleMain: { fontSize: 11, fontWeight: '500', color: appcolor.gray },
    viewIconSelected: { padding: 8, paddingStart: 0, justifyContent: 'center' },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      onItemChoose(item);
    };
    const isChoose = info.shopId == item.ShopId;
    const colorChoose = isChoose ? appcolor.success : appcolor.grey;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.viewIconSelected}>
          <SpiralIcon
            type="ionicon"
            name={isChoose ? 'checkmark-circle' : 'add-circle-outline'}
            size={24}
            color={colorChoose}
          />
        </View>
        <View style={{ width: '90%' }}>
          <TouchableOpacity onPress={onPress}>
            <Text style={styles.titleMain}>{`${index + 1}. ${
              item.ShopName
            }`}</Text>
            <Text
              style={styles.subTitleMain}
            >{`Mã cửa hàng: ${item.ShopCode}`}</Text>
            <Text
              style={styles.subTitleMain}
            >{`Địa chỉ: ${item.Address}`}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <SearchData
        placeholder="Tìm kiếm cửa hàng"
        iconName="store"
        onSearchData={handlerSearchInfo}
        inputStyle={styles.inputStyle}
      />
      <View style={styles.contentItem}>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataShop}
          extraData={[dataShop]}
          renderItem={renderItem}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ paddingBottom: 32 }} />}
        />
      </View>
    </View>
  );
};
