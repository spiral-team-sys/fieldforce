import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { POPAPI } from '../../../API/POPAPI';
import {
  debounce,
  removeVietnameseTones,
  ToastError,
} from '../../../Core/Helper';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../Themes/AppsStyle';
import { FlashList } from '@shopify/flash-list';
import { Image, Text } from '@rneui/base';
import { SearchData } from '../../../Control/SearchData/SearchData';
import { LoadingView } from '../../../Control/ItemLoading';
import PlusMinusEdit from './Controls/PlusMinusEdit';
import OrderDetails from './Page/OrderDetails';
import { SheetManager } from 'react-native-actions-sheet';
import { POPController } from './Controller/POPController';
import _ from 'lodash';
import CustomTab from '../../../Control/Custom/CustomTab';

const POPOrderScreen = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [_mutate, setMutate] = useState(false);

  //
  const LoadData = async () => {
    !isLoading && (await setLoading(true));
    const params = route.params?.popMenu || {};
    if (params?.wareHouseId) {
      await POPAPI.GetDataWarehouse(params, (mData, message) => {
        message && ToastError(message, 'Thông báo', 'top');
        setDataMain(mData);
        setData(mData);
      });
    } else {
      ToastError('Không có dữ liệu sản phẩm', params.menuName, 'top');
      onBack();
    }
    await setLoading(false);
  };
  // Handler
  const hanlderUpdateData = dataUpdate => {
    setData(prev => POPController.updateMainData(prev, dataUpdate));
    setDataMain(prev => POPController.updateMainData(prev, dataUpdate));
  };
  const handlerUpdateOrder = itemUpdate => {
    setData(prev => POPController.updateDetailData(prev, itemUpdate));
    setDataMain(prev => POPController.updateDetailData(prev, itemUpdate));
  };
  // Action
  const onSearchData = debounce(async text => {
    search.text = text;
    setMutate(e => !e);
    const searchList = _searchData(dataMain);
    setData(searchList);
  }, 100);
  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    return filterList.map(group => {
      const detailArr = JSON.parse(group.detailData || '[]');
      const filteredDetails = detailArr.filter(e =>
        removeVietnameseTones(e.POPName || '')
          .toLowerCase()
          .includes(valueSearch),
      );
      return {
        ...group,
        detailData: JSON.stringify(filteredDetails),
      };
    });
  };
  const onShowOrder = () => {
    const dataOrder = _.flatMap(dataMain, item => {
      const detailArr = JSON.parse(item.detailData || '[]');
      return _.filter(detailArr, d => (d.UserInput ?? 0) > 0);
    });
    SheetManager.show('order-details-sheet', { payload: dataOrder });
  };
  const onBack = () => {
    navigation.goBack();
  };
  //
  useEffect(() => {
    LoadData();
    const update_data = DeviceEventEmitter.addListener(
      'UPDATE_DATA_ORDER',
      hanlderUpdateData,
    );
    const reload_data = DeviceEventEmitter.addListener(
      'RELOAD_DATA_ITEM_ORDER',
      LoadData,
    );
    return () => {
      update_data.remove();
      reload_data.remove();
    };
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, height: 550 },
    itemContainer: {
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
    imageView: { width: '100%', height: 80 },
    viewImage: { overflow: 'hidden', borderRadius: 8 },
    viewInfo: { paddingVertical: 8 },
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
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      minHeight: 38,
    },
    titleNumberItem: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
    },
    editMain: { padding: 5, backgroundColor: appcolor.placeholderBody },
  });
  const renderTab = (item, index) => {
    const dataDetails = JSON.parse(item.detailData || '[]');
    if (dataDetails == null || dataDetails.length == 0) return <View />;
    return (
      <View key={index} style={styles.itemTab}>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataDetails}
          extraData={[data, dataDetails]}
          renderItem={renderItem}
          estimatedItemSize={deviceWidth}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ paddingBottom: deviceHeight / 1.8 }} />
          }
        />
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const imageURI = item.Image
      ? { uri: item.Image }
      : require('../../../Themes/Images/noimage.png');
    const totalValue = item.UserInput
      ? item.Quantity - item.UserInput
      : item.Quantity;
    const totalMyValue = item.UserInput
      ? item.QuantityMyHouse + item.UserInput
      : item.QuantityMyHouse;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.viewImage}>
          <Image
            source={imageURI}
            style={styles.imageView}
            resizeMode="cover"
            resizeMethod="resize"
          />
        </View>
        <View style={styles.viewInfo}>
          <Text style={styles.titleName}>{`${index + 1}. ${
            item.POPName
          }`}</Text>
          <Text
            style={styles.titleNumberItem}
          >{`Tồn kho tổng: ${totalValue}`}</Text>
          <Text
            style={styles.titleNumberItem}
          >{`Tồn kho cá nhân: ${totalMyValue}`}</Text>
          <PlusMinusEdit
            itemEdit={item}
            keyValue="UserInput"
            onChange={handlerUpdateOrder}
          />
        </View>
      </View>
    );
  };
  if (isLoading)
    return (
      <LoadingView
        isLoading={isLoading}
        title="Đang cập nhật dữ liệu"
        styles={styles.loadingView}
      />
    );
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route.params?.popMenu.menuName}
        iconRight="clipboard-list"
        leftFunc={onBack}
        rightFunc={onShowOrder}
      />
      <View style={styles.contentContainer}>
        <SearchData
          placeholder={`Tìm kiếm sản phẩm`}
          value={search.text}
          onSearchData={onSearchData}
          containerStyle={{ margin: 8 }}
          inputStyle={{ fontSize: 12 }}
        />
        <CustomTab
          data={data}
          dataCountItem={data}
          keySummaryName="detailData"
          keyTabName="groupName"
          renderItem={renderTab}
        />
      </View>
      <OrderDetails />
    </View>
  );
};

export default POPOrderScreen;
