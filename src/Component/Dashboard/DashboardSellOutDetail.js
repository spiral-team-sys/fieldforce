import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  Platform,
  RefreshControl,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { GetDataDashboardDetail } from '../../Controller/DashboardController';
import {
  formatNumber,
  groupDataByKey,
  removeVietnameseTones,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { Badge, Icon } from '@rneui/base';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import { LoadingView } from '../../Control/ItemLoading';
import { deviceHeight } from '../../Core/Utility';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import FormGroup from '../../Content/FormGroup';
import _ from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const DATE = new Date();
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
export const DashboardSellOutDetail = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [refreshing, setRefreshing] = useState(false);
  const [dataDetail, setDataDetail] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  var [filter, setFilter] = useState({
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });

  const [_mutate, setMutate] = useState(false);
  const [listShowPhoto, setListShowPhoto] = useState([]);
  const [isShowImage, setShowImage] = useState(false);
  const [query, setQuery] = useState('');

  const LoadDataDetail = async () => {
    setRefreshing(true);
    await GetDataDashboardDetail(
      filter.month,
      filter.year,
      shopinfo?.shopId || 0,
      async mDataDetail => {
        await setDataDetail([...mDataDetail]);
        await setDataMain([...mDataDetail]);
      },
      route.params?.typeDashboard || 'SELLOUT',
    );
    setRefreshing(false);
  };
  const onFilterChange = searchInfo => {
    filter = { ...filter, ...searchInfo };
    setFilter(filter);
  };
  const handlerChooseMonth = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await LoadDataDetail();
    await SheetManager.hide('sheetYear');
  };
  const onShowDetailByDate = async (item, index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dataDetail[index].isShowView = !item.isShowView;
    setMutate(e => !e);
  };
  const renderItem = ({ item, index }) => {
    const { arr } = groupDataByKey({
      arr: JSON.parse(item.sellOutDetail),
      key: 'ShopId',
    });
    const onShowDetail = () => {
      onShowDetailByDate(item, index);
    };
    return (
      <View key={index.toString()} style={styles.dateSytle}>
        <TouchableOpacity onPress={onShowDetail}>
          <View style={styles.viewTitleSellDate}>
            <SpiralIcon
              name="calendar"
              type="font-awesome-5"
              size={24}
              color={appcolor.dark}
              style={{ paddingStart: 8 }}
            />
            <Text style={styles.titleSellDate}>{item.sellDate}</Text>
            <SpiralIcon
              name={item.isShowView == 1 ? 'angle-up' : 'angle-down'}
              size={18}
              type="font-awesome-5"
              color={appcolor.dark}
              style={{ textAlign: 'right', paddingEnd: 8 }}
            />
          </View>
        </TouchableOpacity>
        {/* Content */}
        {item.isShowView == 1 && (
          <FlatList
            key={'listItem_' + index}
            style={{ width: '100%' }}
            keyExtractor={(_, index) => index.toString()}
            data={arr}
            renderItem={renderItemSellOut}
          />
        )}
      </View>
    );
  };

  const handleShowImage = item => {
    const listPhoto = item.listPhoto || [];
    setListShowPhoto(listPhoto);
    if (listPhoto.length > 0) {
      setShowImage(true);
    } else {
      ToastSuccess(
        'Số bán này không có dữ liệu hình ảnh.',
        'Thông Báo',
        'bottom',
      );
    }
  };

  const renderItemSellOut = ({ item, index }) => {
    return (
      <View style={styles.contentView} key={'item_' + index.toString()}>
        {item.isParent && (
          <View style={styles.viewTitleShop}>
            <SpiralIcon name="store" size={18} color={appcolor.dark} />
            <Text style={styles.titleShop}>{item.ShopName}</Text>
          </View>
        )}
        <View style={styles.viewProduct}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignSelf: 'center',
              backgroundColor: appcolor.success,
              borderRadius: 8,
              marginBottom: 5,
            }}
          >
            <View
              style={{
                width: '10%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                  color: appcolor.white,
                }}
              >
                {item.Quantity}
              </Text>
            </View>
            <View style={styles.itemStyle} key={index}>
              <View style={{ width: '85%', padding: 5, borderRadius: 8 }}>
                {item.ContactName?.length > 0 && (
                  <RenderItemText
                    titleName="Khách hàng: "
                    itemValue={item.ContactName}
                    appcolor={appcolor}
                  />
                )}
                {item.Phone?.length > 0 && (
                  <RenderItemText
                    titleName="SĐT: "
                    itemValue={item.Phone}
                    appcolor={appcolor}
                  />
                )}
                {item.ProductId > 0 && (
                  <RenderItemText
                    titleName="Sản phẩm: "
                    itemValue={item.ProductName}
                    appcolor={appcolor}
                  />
                )}
                {item.CompetitorName !== undefined &&
                  item.CompetitorName?.length > 0 && (
                    <RenderItemText
                      titleName="Hãng: "
                      itemValue={item.CompetitorName}
                      appcolor={appcolor}
                    />
                  )}
                <RenderItemText
                  titleName="Ngành hàng: "
                  itemValue={item.CategoryVN}
                  appcolor={appcolor}
                />
                {item.ProductId > 0 && (
                  <RenderItemText
                    titleName="Giá: "
                    itemValue={`${formatNumber(item.Price, ',')} VNĐ`}
                    appcolor={appcolor}
                  />
                )}
                {item.Incentive > 0 && (
                  <RenderItemText
                    titleName="Incentive: "
                    itemValue={`${formatNumber(item.Incentive, ',')} VNĐ`}
                    appcolor={appcolor}
                  />
                )}
              </View>
              {item.listPhoto?.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleShowImage(item)}
                  style={{
                    width: '15%',
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Badge
                    containerStyle={{ position: 'absolute', top: 10, end: 5 }}
                    textStyle={{
                      color: appcolor.white,
                      fontSize: 11,
                      fontWeight: '500',
                    }}
                    badgeStyle={{
                      minWidth: 20,
                      height: 20,
                      backgroundColor: appcolor.danger,
                      borderRadius: 50,
                    }}
                    value={item.listPhoto?.length || 0}
                  />
                  <SpiralIcon
                    name={'images'}
                    type={'font-awesome-5'}
                    size={22}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };
  useEffect(() => {
    const _load = LoadDataDetail();
    return () => {
      _load;
    };
  }, []);

  const contains = (item, query) => {
    const { ShopName, ProductName, ContactName, Category, EmployeeName } = item;
    let SShopName = ShopName?.toLowerCase() || ShopName;
    let SProductName = ProductName?.toLowerCase() || ProductName;
    let SContactName = ContactName?.toLowerCase() || ContactName;
    let SCategory = Category?.toLowerCase() || Category;
    let SEmployeeName = EmployeeName?.toLowerCase() || EmployeeName;
    return (
      removeVietnameseTones(SShopName)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(SProductName)?.match(
        removeVietnameseTones(query),
      ) ||
      removeVietnameseTones(SContactName)?.match(
        removeVietnameseTones(query),
      ) ||
      removeVietnameseTones(SCategory)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(SEmployeeName)?.match(removeVietnameseTones(query))
    );
  };
  const handleSearch = text => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let dataFilter = [];
    const formattedQuery = text.toLowerCase();
    dataMain.map(it => {
      let dataItemDetail = JSON.parse(it.sellOutDetail || '[]');
      const filteredData = _.filter(dataItemDetail, itemData => {
        return contains(itemData, formattedQuery);
      });
      if (filteredData?.length > 0) {
        dataFilter.push({
          ...it,
          sellOutDetail: JSON.stringify(filteredData),
        });
      }
    });
    setQuery(text);
    if (formattedQuery === undefined || formattedQuery === '') {
      setDataDetail(dataMain);
    } else {
      setDataDetail(dataFilter);
    }
  };

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalStyle: {
      width: '100%',
      height: '100%',
      padding: 32,
      paddingTop: Platform.OS == 'ios' ? 48 : 0,
      backgroundColor: appcolor.light,
    },
    bottomContainer: {
      width: '98%',
      height: 'auto',
      alignSelf: 'center',
      backgroundColor: appcolor.light,
    },
    itemMonthStyle: {
      alignSelf: 'center',
      width: '100%',
      height: 'auto',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      backgroundColor: appcolor.grayLight,
    },
    dateSytle: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 8,
      backgroundColor: appcolor.light,
    },
    viewTitleSellDate: {
      width: '100%',
      backgroundColor: appcolor.grayLight,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      borderRadius: 8,
    },
    viewTitleShop: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    titleMonth: { width: '100%', fontSize: 16, color: appcolor.dark },
    titleSellDate: {
      width: '86%',
      fontSize: 16,
      color: appcolor.dark,
      padding: 8,
      fontWeight: '700',
    },
    titleShop: {
      width: '80%',
      fontSize: 15,
      color: appcolor.dark,
      padding: 8,
      fontWeight: '600',
    },
    contentView: { width: '100%' },
    viewProduct: { width: '95%', alignSelf: 'center' },
    itemStyle: {
      alignSelf: 'center',
      width: '90%',
      height: 'auto',
      flexDirection: 'row',
      borderRadius: 8,
      backgroundColor: appcolor.grayLight,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={`Doanh số chi tiết ${filter.monthname} ${filter.yearname}`}
        iconRight="calendar-alt"
        rightFunc={() => SheetManager.show('sheetYear')}
      />
      <LoadingView
        isLoading={refreshing}
        title="Đang cập nhật dữ liệu"
        styles={{ position: 'absolute', top: deviceHeight / 2.5 }}
      />
      {!refreshing && (
        <FormGroup
          containerStyle={{
            margin: 7,
            backgroundColor: appcolor.homebackground,
          }}
          appcolor={appcolor}
          placeholder={'Tìm kiếm nhân viên'}
          editable
          handleChangeForm={handleSearch}
          iconName="search"
        />
      )}
      {!refreshing && (
        <FlatList
          style={{
            width: '100%',
            height: '100%',
            padding: 8,
            backgroundColor: appcolor.light,
            marginBottom: Platform.OS == 'ios' ? 20 : 0,
          }}
          keyExtractor={(_, index) => index.toString()}
          data={dataDetail}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadDataDetail} />
          }
          ListFooterComponent={
            <View
              style={{
                height: deviceHeight * 0.7,
                backgroundColor: appcolor.light,
              }}
            />
          }
        />
      )}
      <ActionSheet
        id="sheetYear"
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <YearMonthSelected
          option={filter}
          onYearMonth={search => onFilterChange(search)}
          numMonth={4}
        />
        <TouchableOpacity
          onPress={() => handlerChooseMonth()}
          style={{
            marginBottom: 12,
            borderTopWidth: 0.31,
            borderTopColor: appcolor.primary,
          }}
        >
          <Text
            style={{
              padding: 12,
              textAlign: 'center',
              color: appcolor.primary,
            }}
          >
            Áp dụng
          </Text>
        </TouchableOpacity>
      </ActionSheet>
      <Modal
        id={'imageSheet'}
        visible={isShowImage}
        containerStyle={{ flex: 1 }}
      >
        <MultipleShowImage
          key={'ShowItemImage'}
          listItem={listShowPhoto}
          closeShowImage={() => setShowImage(false)}
          indexItem={0}
        />
      </Modal>
    </View>
  );
};
const RenderItemText = ({ titleName, itemValue, appcolor }) => {
  const colorItem = appcolor.dark;
  return (
    <View style={{ width: '100%', height: 'auto', marginBottom: 3 }}>
      <Text style={{ width: '100%', fontSize: 15, color: colorItem }}>
        {titleName}
        {itemValue}
      </Text>
    </View>
  );
};
