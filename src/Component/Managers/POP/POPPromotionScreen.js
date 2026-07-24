import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { FlashList } from '@shopify/flash-list';
import { LoadingView } from '../../../Control/ItemLoading';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../Themes/AppsStyle';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { SearchData } from '../../../Control/SearchData/SearchData';
import { Text, Icon } from '@rneui/base';
import _ from 'lodash';
import { groupDataByKey, removeVietnameseTones } from '../../../Core/Helper';
import ProcessDetails from './Page/ProcessDetails';
import { POPAPI } from '../../../API/POPAPI';
import CustomTab from '../../../Control/Custom/CustomTab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const POPPromotionScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { item } = route.params;
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [itemDetail, setItemDetail] = useState({});
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    await setLoading(true);
    await POPAPI.GetDataProcess('PROMOTION', mData => {
      const groupList = _.unionBy(mData, 'groupName');
      setData(mData);
      setDataMain(mData);
      setGroupData(groupList);
    });
    await setLoading(false);
  };

  const handlerShowDetail = item => {
    SheetManager.show('item-promotion-sheet', { payload: item });
  };

  const onSearchData = text => {
    search.text = text;
    setMutate(e => !e);
    const searchList = _searchData(dataMain);
    setData(searchList);
  };

  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    return _.filter(
      filterList,
      e =>
        removeVietnameseTones(e.shopName || '')
          .toLowerCase()
          .includes(valueSearch) ||
        removeVietnameseTones(e.shopCode || '')
          .toLowerCase()
          .includes(valueSearch),
    );
  };

  const onBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1 },
    searchStyle: { margin: 8 },
    loadingView: {
      backgroundColor: appcolor.light,
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      justifyContent: 'center',
      zIndex: 1,
    },
    itemContent: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      margin: 4,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    contentTab: { flex: 1, width: deviceWidth },
    itemTab: {
      flex: 1,
      backgroundColor: appcolor.light,
      marginHorizontal: 4,
      marginTop: 4,
    },
    titleGroup: {
      fontSize: 14,
      fontWeight: '800',
      color: appcolor.primary,
      paddingHorizontal: 8,
      backgroundColor: appcolor.primary + 10,
      padding: 8,
      textAlign: 'center',
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    subTitleCount: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.greylight,
      fontStyle: 'italic',
      textAlign: 'right',
      marginTop: 4,
    },
    viewTitleShop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    viewDetails: {
      padding: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      margin: 4,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    titleShop: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      textAlign: 'center',
    },
    titleShopCode: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.primary,
      textAlign: 'center',
      marginBottom: 4,
    },
  });

  const renderTab = (item, index) => {
    const dataDetails = _.filter(data, e => e.groupName == item.groupName);
    const { arr } = groupDataByKey({
      arr: dataDetails,
      key: 'dealerName',
    });
    if (arr == null || arr.length == 0) return <View />;
    return (
      <View key={index} style={styles.itemTab}>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={arr}
          extraData={[arr]}
          renderItem={renderItem}
          estimatedItemSize={deviceWidth}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadData} />
          }
          ListFooterComponent={
            <View style={{ paddingBottom: deviceHeight / 5 }} />
          }
        />
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const onPress = () => handlerShowDetail(item);
    const countItem = JSON.parse(item.jsonDetails || '[]').length || 0;
    return (
      <View style={styles.itemContainer}>
        {item.isParent && (
          <Text style={styles.titleGroup}>{item.dealerName}</Text>
        )}
        <TouchableOpacity style={styles.itemContent} onPress={onPress}>
          <View style={styles.viewTitleShop}>
            <SpiralIcon
              type="ionicon"
              name="business"
              size={18}
              color={appcolor.dark}
            />
            <Text style={styles.titleName}>{`${index + 1}. ${
              item.shopName
            }`}</Text>
          </View>
          <Text style={styles.subTitleName}>{`Mã CH: ${item.shopCode}`}</Text>
          <Text style={styles.subTitleName}>{`Đc: ${item.addressName}`}</Text>
          <Text
            style={styles.subTitleCount}
          >{`Tổng ${countItem} sản phẩm`}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading)
    return <LoadingView isLoading={isLoading} styles={styles.loadingView} />;
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title={item.menuName} leftFunc={onBack} />
      <View style={styles.contentContainer}>
        <SearchData
          placeholder="Tìm kiếm cửa hàng"
          containerStyle={styles.searchStyle}
          onSearchData={onSearchData}
        />
        <CustomTab
          data={groupData}
          dataCountItem={data}
          keyTabName="groupName"
          renderItem={renderTab}
        />
      </View>
      <ActionSheet
        id="item-promotion-sheet"
        onBeforeShow={setItemDetail}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <ProcessDetails itemDetail={itemDetail} />
      </ActionSheet>
    </View>
  );
};

export default POPPromotionScreen;
