import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { REPORT } from '../../API/ReportAPI';
import { getStoreBySellIn } from '../../Controller/SellInController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import FormGroup from '../../Content/FormGroup';
import { LoadingView } from '../../Control/ItemLoading';
import { removeVietnameseTones, ToastError } from '../../Core/Helper';
import CustomTab from '../../Control/Custom/CustomTab';
import CustomListView from '../../Control/Custom/CustomListView';
import { deviceHeight } from '../../Core/Utility';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SellInShopScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [storeSearchText, setStoreSearchText] = useState('');
  const [dataStore, setDataStore] = useState([]);
  const [dataStoreFilter, setDataStoreFilter] = useState([]);
  const [itemShopChoose, setChooseShop] = useState({
    ShopName: 'Tìm kiếm',
    ShopId: 0,
    FromDate: '',
    ToDate: '',
  });
  const [dataCalendar, setDataCalendar] = useState({
    markedDatesDefault: {
      [moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.yellowdark,
      },
    },
    markingTypeDefault: 'custom',
    markingType: 'custom',
    markedDates: {
      [moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.yellowdark,
      },
    },
    isStartDay: false,
    isEndDay: false,
    startDate: '',
    endDate: '',
  });
  const listReport = JSON.parse(route?.params?.menuitem?.reportItem || '{}');

  useEffect(() => {
    LoadData();
    const reloadData = DeviceEventEmitter.addListener(
      'RELOAD_DATA_SELLIN',
      LoadData,
    );
    return () => reloadData.remove();
  }, []);

  const LoadData = async (dataChoose = itemShopChoose) => {
    setLoading(true);
    const lstStore = await getStoreBySellIn();
    const dataStoreChoose = lstStore.map(item => ({
      ...item,
      isChoose: item.id == dataChoose.ShopId ? 1 : 0,
    }));
    setDataStore(dataStoreChoose);
    setDataStoreFilter(dataStoreChoose);
    const dataFilter = {
      shopId: dataChoose.ShopId || 0,
      fromDate: dataChoose.FromDate || null,
      toDate: dataChoose.ToDate || null,
      reportId: kpiinfo.id,
    };
    await REPORT.GetDataReportByShop_RealTime(
      dataFilter,
      async (mData, message) => {
        message && ToastError(message);
        const itemData = Array.isArray(mData) ? mData[0] : mData;
        const jsonData = JSON.parse(itemData.jsonData || '[]');
        const statusList = handlerBuildStatusList(jsonData);
        setDataMain(statusList);
        setData(statusList);
      },
    );
    setLoading(false);
  };

  const handlerBuildStatusList = jsonData => {
    if (!Array.isArray(jsonData)) return [];
    if (jsonData.length === 0) return [];
    if (jsonData[0]?.dataShop !== undefined) {
      return jsonData.map((status, index) => {
        const dataShop = handlerBuildShopList(status.dataShop || []);
        return {
          ...status,
          statusTabName: `${status.statusName || 'Trạng thái'}`,
          dataShop,
          totalShop: dataShop.length,
          totalOrder: _.sumBy(dataShop, item => item.totalOrder || 0),
          totalRevenue: _.sumBy(dataShop, item => item.totalRevenue || 0),
        };
      });
    }
    const dataShop = handlerBuildShopList(jsonData);
    return [
      {
        statusId: 'ALL',
        statusName: 'Tất cả',
        statusTabName: 'Tất cả',
        dataShop,
        totalShop: dataShop.length,
        totalOrder: _.sumBy(dataShop, item => item.totalOrder || 0),
        totalRevenue: _.sumBy(dataShop, item => item.totalRevenue || 0),
      },
    ];
  };

  const handlerBuildShopList = jsonData => {
    if (!Array.isArray(jsonData)) return [];
    const validData = jsonData.filter(
      item => item && (item.shopId || item.ShopId),
    );
    if (validData.length === 0) return [];
    if (validData[0]?.dataOrders !== undefined) {
      return validData.map(item => {
        const dataOrders = item.dataOrders || [];
        const dataDetail = _.flatMap(
          dataOrders,
          order => order.dataDetail || [],
        );
        return {
          ...item,
          dataOrders,
          dataDetail,
          totalOrder: dataOrders.length,
          totalQuantity: _.sumBy(dataDetail, it =>
            Number(it.quantityValue || 0),
          ),
          totalRevenue:
            _.sumBy(dataOrders, order =>
              Number(order.totalOrderRevenue || 0),
            ) || _.sumBy(dataDetail, it => Number(it.revenue || 0)),
        };
      });
    }
    if (validData[0]?.dataDetail !== undefined) {
      return validData.map(item => ({
        ...item,
        dataDetail: item.dataDetail || [],
        dataOrders: item.dataOrders || [
          {
            orderNo: item.orderNo,
            totalOrderRevenue: _.sumBy(item.dataDetail || [], it =>
              Number(it.revenue || 0),
            ),
            dataDetail: item.dataDetail || [],
          },
        ],
        totalOrder: item.dataOrders?.length || 1,
        totalQuantity: _.sumBy(item.dataDetail || [], it =>
          Number(it.quantityValue || 0),
        ),
        totalRevenue: _.sumBy(item.dataDetail || [], it =>
          Number(it.revenue || 0),
        ),
      }));
    }
    const groupList = _.groupBy(validData, 'shopId');
    return Object.keys(groupList).map(shopId => {
      const firstItem = groupList[shopId][0] || {};
      const dataOrders = _(groupList[shopId])
        .groupBy('orderNo')
        .map((items, orderNo) => ({
          orderNo,
          totalOrderRevenue: _.sumBy(items, it => Number(it.revenue || 0)),
          dataDetail: items,
        }))
        .value();
      return {
        shopId: Number(shopId),
        shopName: firstItem.shopName || 'Cửa hàng',
        shopCode: firstItem.shopCode,
        dealerName: firstItem.dealerName,
        addressName: firstItem.addressName,
        dataOrders,
        dataDetail: groupList[shopId],
        totalOrder: dataOrders.length,
        totalQuantity: _.sumBy(groupList[shopId], it =>
          Number(it.quantityValue || 0),
        ),
        totalRevenue: _.sumBy(groupList[shopId], it => Number(it.revenue || 0)),
      };
    });
  };

  const showFilter = () => {
    SheetManager.show('filtersellshop');
  };

  const downloadDataByShop = async () => {
    const dataSend = {
      ShopName: itemShopChoose.ShopName,
      ShopId: itemShopChoose.ShopId,
      FromDate: dataCalendar.startDate
        ? moment(dataCalendar.startDate).format('YYYYMMDD')
        : '',
      ToDate:
        dataCalendar.startDate && dataCalendar.endDate
          ? moment(dataCalendar.endDate).format('YYYYMMDD')
          : '',
    };
    setChooseShop(dataSend);
    SheetManager.hide('filtersellshop');
    await LoadData(dataSend);
  };

  const handlerChooseStore = item => {
    const isChoose = item.isChoose == 1 ? 0 : 1;
    const dataChange = dataStore.map(it => ({
      ...it,
      isChoose: it.id === item.id ? isChoose : 0,
    }));
    setChooseShop({
      ...itemShopChoose,
      ShopName: isChoose == 1 ? item.name : 'Tìm kiếm',
      ShopId: isChoose == 1 ? item.id : 0,
    });
    setDataStore(dataChange);
  };

  const handlerSelectCalendar = async date => {
    const dateString = date.dateString;
    if (dateString !== null && dateString !== undefined) {
      if (
        dataCalendar.startDate === dateString ||
        dateString < dataCalendar.startDate
      ) {
        setDataCalendar({
          ...dataCalendar,
          markedDates: dataCalendar.markedDatesDefault,
          markingType: dataCalendar.markingTypeDefault,
          isStartDay: false,
          isEndDay: false,
          startDate: '',
          endDate: '',
        });
        return;
      }
      if (!dataCalendar.isStartDay) {
        setDataCalendar({
          ...dataCalendar,
          markedDates: {
            [dateString]: {
              startingDay: true,
              color: appcolor.warning,
              textColor: appcolor.dark,
            },
          },
          markingType: 'period',
          isStartDay: true,
          isEndDay: false,
          startDate: dateString,
          endDate: '',
        });
      } else {
        const markedDates = dataCalendar.markedDates;
        let startDate = moment(dataCalendar.startDate);
        const endDate = moment(dateString);
        const range = endDate.diff(startDate, 'days');
        if (range > 0) {
          for (let i = 1; i <= range; i++) {
            const tempDate = moment(startDate.add(1, 'day')).format(
              'YYYY-MM-DD',
            );
            markedDates[tempDate] =
              i < range
                ? { color: appcolor.warningLight, textColor: appcolor.dark }
                : {
                    endingDay: true,
                    color: appcolor.warning,
                    textColor: appcolor.dark,
                  };
          }
          setDataCalendar({
            ...dataCalendar,
            markedDates,
            markingType: 'period',
            isStartDay: false,
            isEndDay: true,
            startDate: dataCalendar.startDate,
            endDate: moment(dateString).format('YYYY-MM-DD'),
          });
        }
      }
    } else {
      setDataCalendar({
        ...dataCalendar,
        markedDates: dataCalendar.markedDatesDefault,
        markingType: dataCalendar.markingTypeDefault,
        isStartDay: false,
        isEndDay: false,
        startDate: '',
        endDate: '',
      });
    }
  };

  const handlerFilterShopInput = value => {
    setStoreSearchText(value);
    const valueSearch = removeVietnameseTones(value || '').toLowerCase();
    const dataFilter = valueSearch
      ? dataStoreFilter.filter(item =>
          removeVietnameseTones(item.name || '')
            .toLowerCase()
            .includes(valueSearch),
        )
      : dataStoreFilter;
    setDataStore(dataFilter);
  };

  const handlerHasDataShop = () => {
    return _.some(data, item => (item.dataShop || []).length > 0);
  };

  const onOpenDetail = (item, statusInfo) => {
    navigation.navigate('sellinshopdetail', {
      shopInfo: item,
      statusInfo,
      listReport,
      dataFilter: itemShopChoose,
    });
  };

  const onCreateOrder = () => {
    navigation.navigate('createsellinbyshop', { listReport });
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    listContent: { padding: 16, paddingBottom: 120 },
    card: {
      minHeight: 96,
      padding: 16,
      marginBottom: 12,
      borderRadius: 16,
      backgroundColor: appcolor.surface,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    shopInfo: { flex: 1 },
    shopName: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      color: appcolor.dark,
    },
    shopCode: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 2,
    },
    shopMeta: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.greydark,
      marginTop: 4,
    },
    shopAddress: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      color: appcolor.placeholderText,
      marginTop: 4,
    },
    statRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    statChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 9999,
      backgroundColor: appcolor.light,
    },
    statText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.dark,
    },
    emptyText: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '400',
      color: appcolor.placeholderText,
      textAlign: 'center',
      marginTop: 48,
    },
    filterSheet: {
      width: '100%',
      height: deviceHeight,
      padding: 12,
      backgroundColor: appcolor.light,
    },
    filterHeader: {
      width: '100%',
      flexDirection: 'row',
      padding: 12,
      alignItems: 'center',
    },
    filterTitle: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      color: appcolor.dark,
    },
    divider: { borderWidth: 1, borderColor: appcolor.surface, width: '100%' },
    itemShopStyle: {
      width: '100%',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      backgroundColor: appcolor.surface,
    },
    itemShopName: {
      width: '100%',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400',
      color: appcolor.dark,
    },
    storeListContent: { padding: 8, paddingBottom: 120 },
  });

  const renderItemShop = ({ item }) => {
    const onPressItem = () => handlerChooseStore(item);
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPressItem}>
        <View
          style={{
            ...styles.itemShopStyle,
            backgroundColor:
              item.isChoose == 1 ? appcolor.yellowdark : appcolor.surface,
          }}
        >
          <Text style={styles.itemShopName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderShopItem =
    statusInfo =>
    ({ item }) =>
      (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.card}
          onPress={() => onOpenDetail(item, statusInfo)}
        >
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <SpiralIcon
                type="ionicon"
                name="storefront-outline"
                size={20}
                color={appcolor.light}
              />
            </View>
            <View style={styles.shopInfo}>
              <Text style={styles.shopName} numberOfLines={2}>
                {item.shopName}
              </Text>
              {!!item.shopCode && (
                <Text style={styles.shopCode}>{item.shopCode}</Text>
              )}
              {!!item.dealerName && (
                <Text
                  style={styles.shopMeta}
                  numberOfLines={1}
                >{`NPP: ${item.dealerName}`}</Text>
              )}
              {!!item.addressName && (
                <Text style={styles.shopAddress} numberOfLines={2}>
                  {item.addressName}
                </Text>
              )}
            </View>
            <SpiralIcon
              type="ionicon"
              name="chevron-forward"
              size={20}
              color={appcolor.placeholderText}
            />
          </View>
          <View style={styles.statRow}>
            <View style={styles.statChip}>
              <Text style={styles.statText}>{`${
                item.totalOrder || 0
              } đơn hàng`}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statText}>{`${
                item.totalQuantity || 0
              } sản phẩm`}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statText}>{`${(
                item.totalRevenue || 0
              ).toLocaleString()} đ`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );

  const renderTab = item => (
    <CustomListView
      data={item.dataShop || []}
      extraData={item.dataShop || []}
      renderItem={renderShopItem(item)}
      contentContainerStyle={styles.listContent}
      onRefresh={LoadData}
      isRefresh={loading}
      ListEmpty={
        !loading ? (
          <Text style={styles.emptyText}>Không có dữ liệu cửa hàng</Text>
        ) : null
      }
      endView={{ paddingBottom: 100 }}
    />
  );

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={kpiinfo.menuNameVN || 'Sell In theo cửa hàng'}
        iconMiddle="search"
        iconRight="plus"
        middleFunc={showFilter}
        rightFunc={onCreateOrder}
      />
      <LoadingView isLoading={loading} title=" " />
      {handlerHasDataShop() ? (
        <CustomTab
          data={data}
          dataMain={_.flatMap(
            data,
            item =>
              item.dataShop?.map(shop => ({
                ...shop,
                statusTabName: item.statusTabName,
              })) || [],
          )}
          keyTabName="statusTabName"
          renderItem={renderTab}
        />
      ) : (
        !loading && <Text style={styles.emptyText}>Không có dữ liệu</Text>
      )}
      <ActionSheet
        id="filtersellshop"
        initialOffsetFromBottom={1}
        statusBarTranslucent
        drawUnderStatusBar={Platform.OS == 'ios'}
        gestureEnabled
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <SafeAreaView style={styles.filterSheet}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Tìm kiếm cửa hàng</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={downloadDataByShop}>
              <SpiralIcon
                type="font-awesome-5"
                name="search"
                size={20}
                color={appcolor.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <Calendar
            firstDay={1}
            current={moment().format('YYYY-MM-DD')}
            monthFormat="MM - yyyy"
            hideExtraDays
            onPressArrowLeft={subtractMonth => subtractMonth()}
            onPressArrowRight={addMonth => addMonth()}
            theme={{
              backgroundColor: appcolor.light,
              calendarBackground: appcolor.light,
              todayTextColor: appcolor.highlightDate,
              selectedDayTextColor: appcolor.primary,
              dayTextColor: appcolor.dark,
              monthTextColor: appcolor.dark,
            }}
            markingType={dataCalendar.markingType}
            markedDates={dataCalendar.markedDates}
            onDayPress={handlerSelectCalendar}
          />
          <FormGroup
            containerStyle={{ borderWidth: 0.3 }}
            placeholder="Tìm kiếm cửa hàng"
            editable
            iconName="search"
            value={storeSearchText}
            onClearTextAndroid={handlerFilterShopInput}
            handleChangeForm={handlerFilterShopInput}
          />
          <View style={styles.divider} />
          <CustomListView
            data={dataStore}
            extraData={dataStore}
            renderItem={renderItemShop}
            contentContainerStyle={styles.storeListContent}
            ListEmpty={<Text style={styles.emptyText}>Không có dữ liệu</Text>}
          />
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};

export default SellInShopScreen;
