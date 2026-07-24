import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom.js';
import FormGroup from '../../Content/FormGroup.js';
import { useDispatch, useSelector } from 'react-redux';
import { Divider, Icon } from '@rneui/themed';
import { filter } from 'lodash';
import { fontWeightBold, scaleSize } from '../../Themes/AppsStyle.js';
import { GetDisplayStatus } from '../../Controller/DashboardController.js';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import moment from 'moment';
import CustomListView from '../../Control/Custom/CustomListView';
import { SearchData } from '../../Control/SearchData/SearchData.js';
import { SetShopInfo } from '../../Redux/action/index.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const contains = (shop, query) => {
  const { shopCode, shopName, address } = shop;
  const Saddress = address?.toLowerCase() ?? null;
  const SshopCode = shopCode?.toLowerCase() ?? null;
  const SshopName = shopName?.toLowerCase() ?? null;
  return !!(
    SshopName?.includes(query) ||
    SshopCode?.includes(query) ||
    Saddress?.includes(query)
  );
};

const sortListByDate = (listToSort, order) => {
  const now = moment();
  const withDays = listToSort.map(item => ({
    item,
    days: now.diff(moment(item.lastUpdate), 'days'),
  }));
  withDays.sort((a, b) =>
    order === 'asc' ? a.days - b.days : b.days - a.days,
  );
  return withDays.map(({ item }) => item);
};

const filterPCShops = shopList =>
  shopList.filter(item => item.headCountType !== 'Non-PC Shop');
const filterNonPCShops = shopList =>
  shopList.filter(item => item.headCountType === 'Non-PC Shop');

export const StatisticalDisplay = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [shops, setShops] = useState([]);
  const [list, setList] = useState([]);
  const [listFilter, setListFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ text: '', isSearch: false });
  const [isOverFiveDays, setIsOverFiveDays] = useState(false);
  const [isThreeAndFiveDays, setIsThreeAndFiveDays] = useState(false);
  const [isTodayAndYesterday, setIsTodayAndYesterDay] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [groupvalue, setGroupValue] = useState({});
  const dispatch = useDispatch();

  const onLoadDisplay = async () => {
    setLoading(true);
    const result = await GetDisplayStatus();
    if (result.statusId === 200) {
      setShops(result.data);
      setList(result.data);
      setListFilter(result.data);
      setGroupValue({
        G1: result?.data.filter(a => a.countDays == 1).length,
        G2: result?.data.filter(a => a.countDays == 2).length,
        G3: result?.data.filter(a => a.countDays == 3).length,
      });
    }
    setIsOverFiveDays(false);
    setIsThreeAndFiveDays(false);
    setIsTodayAndYesterDay(false);
    setTimeout(() => setLoading(false), 1000);
  };
  useEffect(() => {
    onLoadDisplay();
  }, []);
  const handleSearch = useCallback(
    text => {
      const formattedQuery = text?.toLowerCase();
      const filteredData = filter(
        list.filter(item => {
          if (isOverFiveDays) {
            return item.countDays === 3;
          } else if (isThreeAndFiveDays) {
            return item.countDays === 2;
          } else if (isTodayAndYesterday) {
            return item.countDays === 1;
          } else {
            return item;
          }
        }),
        shop => {
          return contains(shop, formattedQuery);
        },
      );

      if (formattedQuery === undefined || formattedQuery === '') {
        setShops(list);
      } else setShops(filteredData);
    },
    [list, isOverFiveDays, isThreeAndFiveDays, isTodayAndYesterday],
  );
  const onFocusSearch = () => {
    setSearch(prev => ({ ...prev, isSearch: !prev.isSearch }));
  };
  const sortAsc = useCallback(() => {
    const base =
      isOverFiveDays || isThreeAndFiveDays || isTodayAndYesterday
        ? listFilter
        : list;
    if (selectedIndex === 1) {
      setShops(base);
      setSelectedIndex(0);
    } else {
      setShops(sortListByDate(base, 'asc'));
    }
  }, [
    isOverFiveDays,
    isThreeAndFiveDays,
    isTodayAndYesterday,
    selectedIndex,
    listFilter,
    list,
  ]);

  const sortDesc = useCallback(() => {
    const base =
      isOverFiveDays || isThreeAndFiveDays || isTodayAndYesterday
        ? listFilter
        : list;
    if (selectedIndex === 2) {
      setShops(base);
      setSelectedIndex(0);
    } else {
      setShops(sortListByDate(base, 'desc'));
    }
  }, [
    isOverFiveDays,
    isThreeAndFiveDays,
    isTodayAndYesterday,
    selectedIndex,
    listFilter,
    list,
  ]);

  const sortPC = useCallback(() => {
    const base =
      isOverFiveDays || isThreeAndFiveDays || isTodayAndYesterday
        ? listFilter
        : list;
    if (selectedIndex === 3) {
      setSelectedIndex(0);
      setShops(base);
    } else {
      setShops(filterPCShops(base));
    }
  }, [
    isOverFiveDays,
    isThreeAndFiveDays,
    isTodayAndYesterday,
    selectedIndex,
    listFilter,
    list,
  ]);

  const sortNonPC = useCallback(() => {
    const base =
      isOverFiveDays || isThreeAndFiveDays || isTodayAndYesterday
        ? listFilter
        : list;
    if (selectedIndex === 4) {
      setSelectedIndex(0);
      setShops(base);
    } else {
      setShops(filterNonPCShops(base));
    }
  }, [
    isOverFiveDays,
    isThreeAndFiveDays,
    isTodayAndYesterday,
    selectedIndex,
    listFilter,
    list,
  ]);
  //
  const onShopSummary = useCallback(
    item => {
      dispatch(SetShopInfo(item));
      navigation.navigate('profileshops');
    },
    [dispatch, navigation],
  );

  const selectedFilterDays = days => {
    switch (days) {
      case 3:
        setShops(
          !isOverFiveDays ? list.filter(item => item.countDays === days) : list,
        );
        setListFilter(
          !isOverFiveDays ? list.filter(item => item.countDays === days) : list,
        );
        setIsOverFiveDays(!isOverFiveDays);
        setIsThreeAndFiveDays(false);
        setIsTodayAndYesterDay(false);
        setSelectedIndex(0);
        break;
      case 2:
        setShops(
          !isThreeAndFiveDays
            ? list.filter(item => item.countDays === days)
            : list,
        );
        setListFilter(
          !isThreeAndFiveDays
            ? list.filter(item => item.countDays === days)
            : list,
        );
        setIsThreeAndFiveDays(!isThreeAndFiveDays);
        setIsOverFiveDays(false);
        setIsTodayAndYesterDay(false);
        setSelectedIndex(0);
        break;
      case 1:
        setShops(
          !isTodayAndYesterday
            ? list.filter(item => item.countDays === days)
            : list,
        );
        setListFilter(
          !isTodayAndYesterday
            ? list.filter(item => item.countDays === days)
            : list,
        );
        setIsTodayAndYesterDay(!isTodayAndYesterday);
        setIsOverFiveDays(false);
        setIsThreeAndFiveDays(false);
        setSelectedIndex(0);
        break;
      default:
        break;
    }
    // console.log(moment().format('mm:ss'));
  };
  const handleShowSheet = () => {
    SheetManager.show('viewSheetFilter');
  };
  const handlePress = (index, action) => {
    setSelectedIndex(index);
    action();
  };
  // View
  const styles = useMemo(
    () =>
      StyleSheet.create({
        titleView: {
          color: appcolor.dark,
          padding: 4,
          fontSize: scaleSize(12),
          fontWeight: '500',
          marginRight: 5,
        },
        contentView: {
          color: appcolor.dark,
          padding: 2,
          fontSize: scaleSize(10),
          marginHorizontal: 5,
        },
        searchContainer: { width: '82%' },
        viewButtonAction: {
          width: 42,
          height: 42,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          alignContent: 'center',
          borderRadius: 50,
          marginHorizontal: 4,
          backgroundColor: appcolor.light,
          shadowColor: appcolor.dark,
          shadowOffset: { width: 3, height: 3 },
          elevation: 3,
          shadowOpacity: 0.3,
          borderWidth: 0.5,
          borderColor: appcolor.grayLight,
        },
        viewStore: { flex: 7, marginHorizontal: 15 },
        container: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-end',
        },
        buttonFilter: {
          padding: 12,
          borderRadius: 6,
          marginHorizontal: 4,
          width: '32%',
          justifyContent: 'center',
          alignItems: 'center',
        },
        itemShop: {
          backgroundColor: appcolor.backgroundContent,
          margin: 5,
          borderRadius: 6,
          padding: 5,
        },
        viewTitle: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 3,
        },
        titleName: {
          width: '90%',
          fontSize: 12,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
        },
        contentName: {
          width: '90%',
          fontSize: 11,
          fontWeight: '500',
          color: appcolor.greylight,
        },
        dateStatusView: {
          minWidth: 100,
          borderRadius: 16,
          paddingVertical: 5,
          paddingHorizontal: 8,
          alignSelf: 'flex-end',
          alignItems: 'center',
        },
        dateStatusText: { fontSize: 11 },
        rootContainer: { flex: 1, backgroundColor: appcolor.light },
        innerContainer: { flex: 1 },
        searchRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        },
        sheetContainer: {
          height: '30%',
          width: '100%',
          backgroundColor: appcolor.light,
        },
        sheetTitle: {
          width: '100%',
          textAlign: 'center',
          fontSize: 16,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
        },
        filterRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          paddingHorizontal: 12,
        },
        divider: { height: 0.2, marginBottom: 7 },
        filterBtnTitle: {
          fontWeight: '700',
          fontSize: 14,
          textAlign: 'center',
        },
        filterBtnCount: { fontSize: 12, textAlign: 'center' },
        filterBtnPercent: {
          fontSize: 14,
          fontWeight: '600',
          textAlign: 'center',
        },
        itemFilterTouch: {
          borderRadius: 8,
          overflow: 'hidden',
          margin: 8,
          marginBottom: 0,
          borderWidth: 0.5,
        },
        itemFilterRow: { flexDirection: 'row', padding: 8 },
        itemFilterIcon: { marginHorizontal: 5 },
        itemFilterText: {
          fontSize: 13,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
        },
        itemViewIcon: { width: 24, marginEnd: 5 },
      }),
    [appcolor],
  );
  const ItemFilter = ({ onPress, icon, title, isSelected }) => {
    const colorSelected = isSelected ? appcolor.primary : appcolor.dark;
    const textSelected = isSelected ? appcolor.light : appcolor.dark;
    const backgroundSelected = isSelected ? appcolor.primary : 'transparent';
    return (
      <TouchableOpacity
        style={[styles.itemFilterTouch, { borderColor: colorSelected }]}
        onPress={onPress}
      >
        <View
          style={[
            styles.itemFilterRow,
            { backgroundColor: backgroundSelected },
          ]}
        >
          <SpiralIcon
            style={styles.itemFilterIcon}
            name={icon}
            type={'font-awesome-5'}
            size={16}
            color={textSelected}
          />
          <Text style={[styles.itemFilterText, { color: textSelected }]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const ItemView = ({ iconName, title, isTitle = false }) => {
    if ((title || null) == null) return null;
    return (
      <View style={styles.viewTitle}>
        {iconName && (
          <SpiralIcon
            solid
            type="font-awesome-5"
            name={iconName}
            size={16}
            color={appcolor.primary}
            style={styles.itemViewIcon}
          />
        )}
        {title && (
          <Text style={isTitle ? styles.titleName : styles.contentName}>
            {title}
          </Text>
        )}
      </View>
    );
  };
  const renderItem = useCallback(
    ({ item, index }) => {
      const backgroundColor =
        item.countDays === 3
          ? appcolor.danger
          : item.countDays === 2
            ? appcolor.warning
            : appcolor.green;
      const colorDateStatus =
        item.countDays !== 2 ? appcolor.light : appcolor.dark;
      return (
        <TouchableOpacity
          key={`ss_sd_i${index}`}
          onPress={() => onShopSummary(item)}
          style={styles.itemShop}
        >
          <ItemView
            isTitle
            iconName="store"
            title={`Cửa hàng: ${item.shopName || ''}`}
          />
          <ItemView
            iconName="map-marker-alt"
            title={`ĐC: ${item.address || ''}`}
          />
          <ItemView iconName="user" title={`${item.updateBy}`} />
          <View
            style={[
              styles.dateStatusView,
              { backgroundColor: backgroundColor },
            ]}
          >
            <Text style={[styles.dateStatusText, { color: colorDateStatus }]}>
              {moment(item.lastUpdate).fromNow()}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [appcolor, styles, onShopSummary],
  );
  return (
    <View style={styles.rootContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Thống kê trưng bày'}
        leftFunc={() => navigation.goBack()}
      />
      <View style={styles.innerContainer}>
        <View style={styles.searchRow}>
          <SearchData
            placeholder="Tìm kiếm cửa hàng"
            containerStyle={styles.searchContainer}
            onSearchData={handleSearch}
          />
          <TouchableOpacity
            style={styles.viewButtonAction}
            onPress={handleShowSheet}
          >
            <SpiralIcon
              name={'th-list'}
              type={'font-awesome-5'}
              size={18}
              color={appcolor.primary}
            />
          </TouchableOpacity>
          <ActionSheet
            id="viewSheetFilter"
            gestureEnabled
            nestedScrollEnabled
            drawUnderStatusBar={Platform.OS == 'ios'}
            containerStyle={StyleSheet.flatten([
              styles.sheetContainer,
              { paddingBottom: insets.bottom },
            ])}
            headerAlwaysVisible
          >
            <Text style={styles.sheetTitle}>Lọc theo</Text>
            <ItemFilter
              onPress={() => handlePress(1, sortAsc)}
              icon={'sort-alpha-up-alt'}
              title={'Sắp xếp theo thứ tự A -> Z'}
              isSelected={selectedIndex === 1}
            />
            <ItemFilter
              onPress={() => handlePress(2, sortDesc)}
              icon={'sort-alpha-down-alt'}
              title={'Sắp xếp theo thứ tự Z -> A'}
              isSelected={selectedIndex === 2}
            />
            <ItemFilter
              onPress={() => handlePress(3, sortPC)}
              icon={'user-alt'}
              title={'PC Shop'}
              isSelected={selectedIndex === 3}
            />
            <ItemFilter
              onPress={() => handlePress(4, sortNonPC)}
              icon={'user-alt-slash'}
              title={'Non-PC Shop'}
              isSelected={selectedIndex === 4}
            />
          </ActionSheet>
        </View>

        {!loading && (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.buttonFilter,
                {
                  backgroundColor: isOverFiveDays
                    ? appcolor.light
                    : appcolor.danger,
                  borderBottomWidth: 5,
                  borderColor: appcolor.danger,
                },
              ]}
              onPress={() => {
                selectedFilterDays(3);
              }}
            >
              <Text
                style={[
                  styles.filterBtnTitle,
                  { color: isOverFiveDays ? appcolor.danger : appcolor.light },
                ]}
              >
                {'1 tuần \ntrở lên'}
              </Text>
              <Text
                style={[
                  styles.filterBtnCount,
                  { color: isOverFiveDays ? appcolor.danger : appcolor.light },
                ]}
              >{`(${groupvalue.G3 || 0}/${list?.length}) \nCửa hàng`}</Text>
              <Text
                style={[
                  styles.filterBtnPercent,
                  { color: isOverFiveDays ? appcolor.danger : appcolor.light },
                ]}
              >
                {((groupvalue?.G3 * 100) / list?.length).toFixed(2)} %
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttonFilter,
                {
                  backgroundColor: isThreeAndFiveDays
                    ? appcolor.light
                    : appcolor.warning,
                  borderBottomWidth: 5,
                  borderColor: appcolor.warning,
                },
              ]}
              onPress={() => {
                selectedFilterDays(2);
              }}
            >
              <Text
                style={[
                  styles.filterBtnTitle,
                  {
                    color: isThreeAndFiveDays
                      ? appcolor.warning
                      : appcolor.dark,
                  },
                ]}
              >
                {'Từ 3 đến 6 \nngày'}
              </Text>
              <Text
                style={[
                  styles.filterBtnCount,
                  {
                    color: isThreeAndFiveDays
                      ? appcolor.warning
                      : appcolor.dark,
                  },
                ]}
              >{`(${groupvalue?.G2 || 0}/${list?.length}) \nCửa hàng`}</Text>
              <Text
                style={[
                  styles.filterBtnPercent,
                  {
                    color: isThreeAndFiveDays
                      ? appcolor.warning
                      : appcolor.dark,
                  },
                ]}
              >
                {((groupvalue?.G2 * 100) / list?.length).toFixed(2)} %
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttonFilter,
                {
                  backgroundColor: isTodayAndYesterday
                    ? appcolor.light
                    : appcolor.green,
                  borderBottomWidth: 5,
                  borderColor: appcolor.green,
                },
              ]}
              onPress={() => {
                selectedFilterDays(1);
              }}
            >
              <Text
                style={[
                  styles.filterBtnTitle,
                  {
                    color: isTodayAndYesterday
                      ? appcolor.green
                      : appcolor.light,
                  },
                ]}
              >
                {'Hôm nay\n & qua'}
              </Text>
              <Text
                style={[
                  styles.filterBtnCount,
                  {
                    color: isTodayAndYesterday
                      ? appcolor.green
                      : appcolor.light,
                  },
                ]}
              >{`(${groupvalue?.G1 || 0}/${list?.length}) \nCửa hàng`}</Text>
              <Text
                style={[
                  styles.filterBtnPercent,
                  {
                    color: isTodayAndYesterday
                      ? appcolor.green
                      : appcolor.light,
                  },
                ]}
              >
                {((groupvalue?.G1 * 100) / list?.length).toFixed(2)} %
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Divider style={styles.divider} />
        <CustomListView
          data={shops}
          extraData={shops}
          renderItem={renderItem}
          onRefresh={onLoadDisplay}
          isRefresh={loading}
        />
      </View>
    </View>
  );
};
