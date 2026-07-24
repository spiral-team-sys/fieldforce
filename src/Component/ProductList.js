import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Avatar, Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../Content/FormGroup';
import { HeaderCustom } from '../Content/HeaderCustom';
import { LoadingView } from '../Control/ItemLoading';
import { productReload } from '../Controller/DownloadDataController';
import { getAllProduct } from '../Controller/ProductController';
import { getCompetitorByProduct } from '../Controller/StockOutController';
import { colorList, formatNumber, ToastSuccess } from '../Core/Helper';
import { _competitorId, _competitorName } from '../Core/URLs';
import { deviceHeight, removeDuplicate } from '../Core/Utility';
import { deviceWidth } from '../Themes/AppsStyle';
import CustomListView from '../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../Control/Icon/SpiralIcon';

export const ProductList = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [rootProduct, setRootProduct] = useState([]);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [details, setDetail] = useState([]);
  const loadData = async () => {
    !refreshing && (await setRefreshing(true));
    const listProduct = await getAllProduct();
    var listCompetitor = await getCompetitorByProduct();
    listCompetitor = await listCompetitor.map((item, index) => {
      item.listProduct = listProduct.filter(a => a.division == item.itemName);
      item.totalSize = item?.listProduct?.length || 0;
      item.groupData = removeDuplicate(item.listProduct, 'categoryId');
      return item;
    });
    await setData(listCompetitor);
    await setTimeout(async () => await setRefreshing(false), 100);
  };
  useEffect(() => {
    const _load = loadData();
    return () => _load;
  }, []);

  const reloadProduct = async () => {
    await setRefreshing(true);
    await productReload(async e => {
      await loadData();
      await ToastSuccess(e, 'Đồng bộ sản phẩm', 'top');
    });
  };
  const renderGroup = ({ item, index }) => {
    const onShowItem = product => {
      setDetail(product);
      setRootProduct(product);
      SheetManager.show('sheetProduct');
    };
    return (
      <View
        key={`${index}09ll`}
        style={{
          flex: 1,
          marginLeft: 3,
          marginBottom: 3,
          alignItems: 'center',
          padding: 12,
        }}
      >
        <TouchableOpacity onPress={() => onShowItem(item?.products)}>
          <Avatar
            containerStyle={{ backgroundColor: colorList[index] }}
            titleStyle={{ fontSize: 28, fontWeight: '600' }}
            rounded
            size="large"
            title={item?.products?.length || 0}
          />
          <Text
            style={{
              textAlign: 'center',
              color: appcolor.dark,
              fontSize: 14,
              fontWeight: '500',
              paddingTop: 5,
            }}
          >
            {item.categoryName || 'N/A'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const renderItemProduct = ({ item, index }) => {
    return (
      <View
        key={`divistion_item_${index}`}
        style={{
          backgroundColor: appcolor.light,
          flex: 1,
          flexDirection: 'row',
          marginBottom: 3,
          paddingBottom: 5,
          alignItems: 'center',
          borderBottomWidth: 0.5,
          borderBottomColor: appcolor.grayLight,
        }}
      >
        <Text
          style={{
            flex: 1.5,
            fontSize: 14,
            fontWeight: '400',
            color: appcolor.dark,
            textAlign: 'center',
          }}
        >{`${index + 1}. `}</Text>
        <View
          style={{
            flex: 6,
            backgroundColor: appcolor.light,
            flexDirection: 'column',
          }}
        >
          <Text
            style={{ fontSize: 15, fontWeight: '600', color: appcolor.dark }}
          >{`${item.productName}`}</Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '400',
              color: appcolor.greydark,
            }}
          >{`${item.productCode}`}</Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '400',
              color: appcolor.greydark,
            }}
          >{`${item.subCategory || ''} ${item.segment || ''}`}</Text>
        </View>
        <Text
          style={{
            flex: 2.5,
            fontSize: 14,
            fontWeight: '500',
            color: appcolor.dark,
            textAlign: 'center',
          }}
        >
          {`${formatNumber(item.price, ',') || 0}`}
        </Text>
      </View>
    );
  };
  const filterProduct = async text => {
    if (text !== null && text.length > 0) {
      const newDataShow = rootProduct.filter(item => {
        const nameProduct = `${item.productName} ${item.productCode} ${item?.subCategory || ''
          } ${item?.segment || ''}`.toLowerCase();
        const textSearch = text.toLowerCase();
        return nameProduct.includes(textSearch);
      });
      setDetail(newDataShow);
      setSearch(text);
    } else {
      setDetail(rootProduct);
      setSearch('');
    }
  };
  const renderItemCompetitor = ({ item, index }) => {
    var groupData = item.groupData;
    groupData = groupData.map(a => {
      a.products = item.listProduct.filter(p => p.categoryId === a.categoryId);
      return a;
    });
    return (
      <View key={`${index}amal`}>
        <View
          style={{
            padding: 8,
            flexDirection: 'row',
            backgroundColor: appcolor.light,
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              color: appcolor.dark,
              fontSize: 16,
              marginHorizontal: 5,
            }}
          >
            {(item.name || 'ProductName').toUpperCase()}
          </Text>
          <Text style={{ fontSize: 10, color: appcolor.dark }}>
            {item?.listProduct?.length || 0}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: appcolor.light,
            marginStart: 8,
            marginEnd: 8,
            borderRadius: 10,
            marginTop: 7,
          }}
        >
          <FlatList
            numColumns={3}
            keyExtractor={(_, index) => index.toString()}
            data={groupData}
            renderItem={renderGroup}
          />
        </View>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={`Danh sách sản phẩm`}
      />
      <LoadingView
        title={'Đang cập nhật dữ liệu sản phẩm'}
        isLoading={refreshing}
        styles={{ marginTop: 8 }}
      />
      <FlatList
        key={'headerproduct'}
        keyExtractor={(_, index) => index.toString()}
        data={data}
        renderItem={renderItemCompetitor}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={reloadProduct} />
        }
      />
      <ActionSheet
        id="sheetProduct"
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <SafeAreaView style={{ width: deviceWidth, height: deviceHeight }}>
          <FormGroup
            containerStyle={{
              backgroundColor: appcolor.light,
              margin: 7,
              alignSelf: 'center',
            }}
            inputStyle={{ fontSize: 14, color: appcolor.dark }}
            placeholder="Tìm kiếm sản phẩm"
            editable
            iconName="search"
            value={search}
            onClearTextAndroid={filterProduct}
            handleChangeForm={filterProduct}
            useClearAndroid
          />
          <CustomListView
            data={details}
            extraData={details}
            renderItem={renderItemProduct}
          />
          <TouchableOpacity
            onPress={() => SheetManager.hide('sheetProduct')}
            style={{
              position: 'absolute',
              bottom: deviceHeight / 12,
              alignSelf: 'center',
            }}
          >
            <SpiralIcon
              name="close"
              color={appcolor.danger}
              reverse
              size={24}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};
