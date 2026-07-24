import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  UIManager,
  LayoutAnimation,
  StyleSheet,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Icon } from '@rneui/base';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import { GetDataDashboardDetail } from '../../Controller/DashboardController';
import {
  formatNumber,
  groupDataByKey,
  removeVietnameseTones,
} from '../../Core/Helper';
import { deviceHeight, styleDefault } from '../../Themes/AppsStyle';
import _ from 'lodash';
import FormGroup from '../../Content/FormGroup';
import CustomListView from '../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const DATE = new Date();

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const DashboardHomeSellin = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const appStyle = useMemo(() => styleDefault(appcolor), [appcolor]);
  const [data, setData] = useState({ dataDetail: [], dataMain: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [monthFilter, setMonthFilter] = useState({
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });
  const monthFilterRef = useRef(monthFilter);

  const runLayoutAnimation = () => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      return false;
    }
  };

  const loadData = async (filterValue = monthFilterRef.current) => {
    await setRefreshing(true);
    await GetDataDashboardDetail(
      filterValue.month,
      filterValue.year,
      0,
      async mDataDetail => {
        const nextData = mDataDetail.map(item => ({
          ...item,
          isShowView: false,
        }));
        await setData({ dataDetail: nextData, dataMain: nextData });
      },
      'SELLIN',
    );
    setTimeout(async () => {
      await setRefreshing(false);
    }, 100);
  };
  const handleChooseMonth = async () => {
    await SheetManager.hide('sheetYear');
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    runLayoutAnimation();
    await loadData(monthFilterRef.current);
  };
  const onFilterChange = searchInfo => {
    monthFilterRef.current = { ...monthFilterRef.current, ...searchInfo };
    setMonthFilter(monthFilterRef.current);
  };

  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const groupSellByShop = listSell => {
    const { arr } = groupDataByKey({
      arr: listSell,
      key: 'ShopId',
    });
    return arr;
  };
  const contains = (item, query) => {
    const { ShopName, ProductName, ContactName, EmployeeName } = item;
    let SShopName = ShopName?.toLowerCase() || ShopName;
    let SProductName = ProductName?.toLowerCase() || ProductName;
    let SContactName = ContactName?.toLowerCase() || ContactName;
    let SEmployeeName = EmployeeName?.toLowerCase() || EmployeeName;
    return (
      removeVietnameseTones(SShopName)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(SProductName)?.match(
        removeVietnameseTones(query),
      ) ||
      removeVietnameseTones(SContactName)?.match(
        removeVietnameseTones(query),
      ) ||
      removeVietnameseTones(SEmployeeName)?.match(removeVietnameseTones(query))
    );
  };
  const handleSearch = text => {
    runLayoutAnimation();
    let dataFilter = [];
    const formattedQuery = text.toLowerCase();

    data.dataMain.map(it => {
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
    if (formattedQuery === undefined || formattedQuery === '') {
      setData(prev => ({ ...prev, dataDetail: prev.dataMain }));
    } else {
      setData(prev => ({ ...prev, dataDetail: dataFilter }));
    }
  };

  const onShowDetailByDate = (item, index) => {
    runLayoutAnimation();
    const itemKey = item.date || item.sellDate || item.indexMain;
    const isShowView = !item.isShowView;
    setData(prev => ({
      dataDetail: prev.dataDetail.map((dataItem, dataIndex) =>
        (dataItem.date || dataItem.sellDate || dataItem.indexMain) ===
          itemKey || dataIndex === index
          ? { ...dataItem, isShowView }
          : dataItem,
      ),
      dataMain: prev.dataMain.map(dataItem =>
        (dataItem.date || dataItem.sellDate || dataItem.indexMain) === itemKey
          ? { ...dataItem, isShowView }
          : dataItem,
      ),
    }));
  };

  const renderItem = ({ item, index }) => {
    const sellDetails = JSON.parse(item.sellOutDetail || '[]');
    const listSell = groupSellByShop(sellDetails);
    const totalQuantity = sellDetails.reduce(
      (total, sellItem) => total + Number(sellItem.Quantity || 0),
      0,
    );
    const totalValue = sellDetails.reduce(
      (total, sellItem) =>
        total + Number(sellItem.Price || 0) * Number(sellItem.Quantity || 0),
      0,
    );
    const onShowDetail = () => {
      onShowDetailByDate(item, index);
    };
    return (
      <View
        style={[
          styles.dateCard,
          { backgroundColor: appcolor.light, borderColor: appcolor.grayLight },
        ]}
      >
        <Pressable
          onPress={onShowDetail}
          hitSlop={8}
          android_ripple={{ color: appcolor.light }}
          style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
        >
          <View
            style={[styles.dateContent, { backgroundColor: appcolor.light }]}
          >
            <View style={styles.dateHeader}>
              <View style={styles.dateTitleWrap}>
                <View
                  style={[
                    styles.dateIcon,
                    { backgroundColor: appcolor.surface },
                  ]}
                >
                  <SpiralIcon
                    name="calendar-day"
                    type="font-awesome-5"
                    size={13}
                    color={appcolor.primary}
                  />
                </View>
                <View style={styles.flexContent}>
                  <Text
                    numberOfLines={1}
                    style={[styles.dateTitle, { color: appcolor.dark }]}
                  >
                    {item.sellDate}
                  </Text>
                  <Text
                    style={[styles.dateSubTitle, { color: appcolor.greydark }]}
                  >
                    Tuần {item.weekByYear || '--'} | {sellDetails.length} SKU
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.expandIcon,
                  { backgroundColor: appcolor.surface },
                ]}
              >
                <SpiralIcon
                  name={item.isShowView ? 'angle-up' : 'angle-down'}
                  size={16}
                  type="font-awesome-5"
                  color={appcolor.primary}
                />
              </View>
            </View>
            <View style={styles.metricRow}>
              <View
                style={[
                  styles.metricBox,
                  styles.metricQuantity,
                  { backgroundColor: appcolor.surface },
                ]}
              >
                <Text
                  style={[styles.metricLabel, { color: appcolor.greydark }]}
                >
                  Số lượng
                </Text>
                <Text style={[styles.metricValue, { color: appcolor.dark }]}>
                  {formatNumber(totalQuantity, ',')}
                </Text>
              </View>
              <View
                style={[
                  styles.metricBox,
                  styles.metricRevenue,
                  { backgroundColor: appcolor.surface },
                ]}
              >
                <Text
                  style={[styles.metricLabel, { color: appcolor.greydark }]}
                >
                  Doanh số
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[styles.metricValue, { color: appcolor.primary }]}
                >
                  {formatNumber(totalValue, ',')}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
        {item.isShowView && (
          <View
            style={[
              styles.detailListContent,
              { backgroundColor: appcolor.surface },
            ]}
          >
            {listSell.map((itemSell, indexSell) => (
              <React.Fragment
                key={`${itemSell.ShopId || 'shop'}_${itemSell.ProductId || 'product'
                  }_${indexSell}`}
              >
                {renderItemSell({ item: itemSell })}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderItemSell = ({ item }) => {
    return (
      <View style={styles.sellItemWrap}>
        {item.isParent && (
          <View
            style={[styles.shopHeader, { backgroundColor: appcolor.surface }]}
          >
            <SpiralIcon
              name="store"
              type="font-awesome-5"
              size={12}
              color={appcolor.primary}
            />
            <Text
              numberOfLines={1}
              style={[styles.shopName, { color: appcolor.dark }]}
            >
              {item.ShopName}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.productCard,
            {
              backgroundColor: appcolor.light,
              borderColor: appcolor.grayLight,
              borderLeftColor: appcolor.grayLight,
            },
          ]}
        >
          <View style={styles.productMainRow}>
            <View style={styles.productInfo}>
              <Text
                numberOfLines={1}
                style={[styles.productName, { color: appcolor.dark }]}
              >
                {item.ProductName}
              </Text>
              <View style={styles.infoLine}>
                <SpiralIcon
                  name="user-tie"
                  type="font-awesome-5"
                  size={10}
                  color={appcolor.primary}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.infoText, { color: appcolor.dark }]}
                >
                  {item.EmployeeName}
                </Text>
              </View>
              <View style={styles.infoLine}>
                <SpiralIcon
                  name="handshake"
                  type="font-awesome-5"
                  size={10}
                  color={appcolor.primary}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.infoText, { color: appcolor.greydark }]}
                >
                  {item.ContactName}
                </Text>
              </View>
            </View>
            <View style={styles.quantityWrap}>
              <View
                style={[
                  styles.quantityBadge,
                  {
                    backgroundColor: appcolor.surface,
                    borderColor: appcolor.grayLight,
                  },
                ]}
              >
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.quantityText, { color: appcolor.primary }]}
                >
                  {item.Quantity}
                </Text>
              </View>
              <Text style={[styles.quantityUnit, { color: appcolor.greydark }]}>
                PCS
              </Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            {item.Price && (
              <View
                style={[
                  styles.priceChip,
                  { backgroundColor: appcolor.surface },
                ]}
              >
                <Text style={[styles.priceText, { color: appcolor.dark }]}>
                  Giá: {formatNumber(item.Price, ',')}
                </Text>
              </View>
            )}
            {item.PriceNPP && (
              <View
                style={[
                  styles.priceChip,
                  { backgroundColor: appcolor.surface },
                ]}
              >
                <Text style={[styles.priceText, { color: appcolor.dark }]}>
                  NPP: {formatNumber(item.PriceNPP, ',')}
                </Text>
              </View>
            )}
            {item.SalePrice && (
              <View
                style={[
                  styles.saleChip,
                  {
                    backgroundColor: appcolor.surface,
                    borderColor: appcolor.grayLight,
                  },
                ]}
              >
                <Text style={[styles.saleText, { color: appcolor.primary }]}>
                  {item.SalePrice}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={appStyle.contentContainer}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={`Doanh số chi tiết ${monthFilter.monthname} ${monthFilter.yearname}`}
        iconRight="calendar-alt"
        rightFunc={() => SheetManager.show('sheetYear')}
      />
      {!refreshing && (
        <FormGroup
          containerStyle={[
            appStyle.inputContainer,
            styles.searchForm,
            { backgroundColor: appcolor.homebackground },
          ]}
          appcolor={appcolor}
          placeholder={'Tìm kiếm nhân viên'}
          editable
          handleChangeForm={handleSearch}
          iconName="search"
        />
      )}
      {!refreshing && (
        <View style={appStyle.contentContainer}>
          <CustomListView
            data={data.dataDetail}
            extraData={data.dataDetail}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onRefresh={loadData}
            isRefresh={false}
            estimatedItemSize={96}
            ListFooter={
              <View
                style={[styles.listFooter, { backgroundColor: appcolor.light }]}
              />
            }
          />
        </View>
      )}
      {refreshing && (
        <View style={styles.loadingWrap}>
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={refreshing}
            styles={styles.loadingContent}
          />
        </View>
      )}
      {/* <LoadingView isLoading={refreshing} title='Đang cập nhật dữ liệu' styles={{ position: 'absolute', top: deviceHeight / 2.5 }} /> */}
      <ActionSheet
        id="sheetYear"
        containerStyle={StyleSheet.flatten([
          appStyle.sheetContainer,
          { paddingBottom: insets.bottom },
        ])}
      >
        <YearMonthSelected
          option={monthFilter}
          onYearMonth={search => onFilterChange(search)}
          numMonth={4}
        />
        <TouchableOpacity
          onPress={() => handleChooseMonth()}
          style={[appStyle.buttonContainer, styles.applyButton]}
        >
          <Text style={[styles.applyText, { color: appcolor.light }]}>
            Áp dụng
          </Text>
        </TouchableOpacity>
      </ActionSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  dateCard: {
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 2,
  },
  dateContent: {
    padding: 7,
    borderRadius: 7,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  dateIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  flexContent: {
    flex: 1,
  },
  dateTitle: {
    fontWeight: '800',
    fontSize: 14,
  },
  dateSubTitle: {
    fontWeight: '500',
    fontSize: 10,
    marginTop: 1,
  },
  expandIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  metricBox: {
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },
  metricQuantity: {
    flex: 1,
    marginRight: 5,
  },
  metricRevenue: {
    flex: 2,
  },
  metricLabel: {
    fontWeight: '600',
    fontSize: 10,
  },
  metricValue: {
    fontWeight: '900',
    fontSize: 15,
  },
  detailListContent: {
    padding: 6,
  },
  sellItemWrap: {
    marginBottom: 6,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginBottom: 4,
    borderRadius: 6,
  },
  shopName: {
    flex: 1,
    fontWeight: '800',
    fontSize: 12,
    paddingLeft: 6,
  },
  productCard: {
    borderRadius: 7,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 7,
  },
  productMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
    paddingRight: 7,
  },
  productName: {
    fontWeight: '900',
    fontSize: 13,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 11,
    paddingLeft: 5,
  },
  quantityWrap: {
    minWidth: 42,
    alignItems: 'center',
  },
  quantityBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontWeight: '900',
    fontSize: 15,
  },
  quantityUnit: {
    fontWeight: '700',
    fontSize: 9,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  priceChip: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    marginRight: 4,
    marginTop: 3,
  },
  priceText: {
    fontWeight: '700',
    fontSize: 10,
  },
  saleChip: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 4,
    marginTop: 3,
  },
  saleText: {
    fontWeight: '800',
    fontSize: 10,
  },
  listFooter: {
    height: deviceHeight * 0.7,
  },
  searchForm: {
    flex: 0,
    margin: 7,
    marginBottom: 6,
  },
  loadingWrap: {
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: deviceHeight / 2,
  },
  loadingContent: {
    marginTop: 8,
  },
  applyButton: {
    marginBottom: 12,
    marginHorizontal: 12,
  },
  applyText: {
    paddingVertical: 2,
    textAlign: 'center',
    fontWeight: '700',
  },
});
