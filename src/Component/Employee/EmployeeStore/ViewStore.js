import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Image,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { deviceHeight, deviceWidth } from '../../../Themes/AppsStyle';
import { URLDEFAULT } from '../../../Core/URLs';
import { Switch } from 'react-native';
import { Icon } from '@rneui/themed';
import FormGroup from '../../../Content/FormGroup';
import filter from 'lodash';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { MessageInfo } from '../../../Core/Helper';
import { AppCreateAction } from '../../../Core/ReduxController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const ViewStore = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    dataStore: [],
    dataStoreF: [],
    dataEmployee: {},
  });
  const [_, setMutate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCheck, setFilterCheck] = useState(false);
  const [dataFilter, setDataFilter] = useState({ sortBySell: 1, sortByMTD: 0 });

  const dispatch = useDispatch();

  const loadData = async () => {
    const KEYSTORE_REPORT = `D${moment(new Date()).format('YYYYMMDD')}S${route.params?.employeeId
      }R${kpiinfo.id}N${'EMPLOYEESTORE'}`;
    const json = await AsyncStorage.getItem(KEYSTORE_REPORT);
    const storeList = await JSON.parse(json);
    const dataEmployee = route.params.item;

    const dataStore = [...route.params.dataStore];
    if (storeList == null) {
      await AsyncStorage.setItem(KEYSTORE_REPORT, JSON.stringify(dataStore));
      await setData({
        dataStore: dataStore,
        dataStoreF: dataStore,
        dataEmployee: dataEmployee,
      });
    } else {
      let dataMerge = [];
      dataStore.forEach(it => {
        const indexStorage = storeList.findIndex(
          its => its.shopId == it.shopId,
        );
        const itemStorage = storeList[indexStorage] || {};
        dataMerge.push({
          ...it,
          IsChose: itemStorage.IsChose || 0,
        });
      });
      await AsyncStorage.setItem(KEYSTORE_REPORT, JSON.stringify(dataMerge));
      await setData({
        dataStore: dataMerge,
        dataStoreF: dataMerge,
        dataEmployee: dataEmployee,
      });
    }
  };

  const contains = (shop, query) => {
    const { shopName, address, levelName } = shop;
    let Saddress = address === null ? address : address.toLowerCase();
    let SshopName = shopName === null ? shopName : shopName.toLowerCase();
    let SlevelName =
      levelName === null
        ? levelName
        : levelName?.replace(/\s/g, '').toLowerCase();
    if (
      SshopName?.includes(query) ||
      Saddress?.includes(query) ||
      SlevelName?.includes(query)
    ) {
      return true;
    }
    return false;
  };
  const handleSearchStore = text => {
    const formattedQuery = text.toLowerCase();
    const filteredData = filter(data.dataStoreF, shop => {
      return contains(shop, formattedQuery);
    });
    if (formattedQuery === undefined || formattedQuery === '') {
      data.dataStore = data.dataStoreF;
    } else data.dataStore = filteredData;
    setSearch(text);
  };
  const filterCheckStore = () => {
    if (!filterCheck) {
      let lstRes = data.dataStore.filter(it => it.IsChose == 1);
      data.dataStore = lstRes;
    } else {
      data.dataStore = data.dataStoreF;
    }
    setFilterCheck(e => !e);
  };

  const unCheckAllStore = () => {
    data.dataStore.map(it => {
      it.IsChose = 0;
    });
    data.dataStoreF.map(it => {
      it.IsChose = 0;
    });
    const KEYSTORE_REPORT = `D${moment(new Date()).format('YYYYMMDD')}S${route.params?.employeeId
      }R${kpiinfo.id}N${'EMPLOYEESTORE'}`;
    AsyncStorage.removeItem(KEYSTORE_REPORT);
  };

  const handleSelectSetting = () => {
    SheetManager.show('sheetStoreEmployee_' + (route.params.employeeId || 0));
  };
  const handleSort = type => {
    let newStatus = 0;
    let list = [];
    let listF = [];
    switch (type) {
      case 'MTD':
        newStatus = dataFilter.sortByMTD == 2 ? 1 : dataFilter.sortByMTD + 1;

        if (newStatus == 1) {
          list = data.dataStore?.sort(
            (a, b) => (a.TotalMTD || 0) - (b.TotalMTD || 0),
          );
          listF = data.dataStoreF?.sort(
            (a, b) => (a.TotalMTD || 0) - (b.TotalMTD || 0),
          );
        } else {
          list = data.dataStore?.sort(
            (a, b) => (b.TotalMTD || 0) - (a.TotalMTD || 0),
          );
          listF = data.dataStoreF?.sort(
            (a, b) => (b.TotalMTD || 0) - (a.TotalMTD || 0),
          );
        }
        setDataFilter({ sortByMTD: newStatus, sortBySell: 0 });
        break;
      case 'SELL':
        newStatus = dataFilter.sortBySell == 2 ? 1 : dataFilter.sortBySell + 1;
        if (newStatus == 1) {
          list = data.dataStore?.sort(
            (a, b) => (a.TotalLastDate || 0) - (b.TotalLastDate || 0),
          );
          listF = data.dataStoreF?.sort(
            (a, b) => (a.TotalLastDate || 0) - (b.TotalLastDate || 0),
          );
        } else {
          list = data.dataStore?.sort(
            (a, b) => (b.TotalLastDate || 0) - (a.TotalLastDate || 0),
          );
          listF = data.dataStoreF?.sort(
            (a, b) => (b.TotalLastDate || 0) - (a.TotalLastDate || 0),
          );
        }
        setDataFilter({ sortByMTD: 0, sortBySell: newStatus });
        break;
    }
  };

  const handlePressCheck = async item => {
    const value = item.IsChose == 1 ? 0 : 1;
    item.IsChose = value;
    await setMutate(e => !e);
    await saveToStorage();
    dispatch(AppCreateAction.SetListDataStore(item));
  };
  const saveToStorage = async () => {
    const KEYSTORE_REPORT = `D${moment(new Date()).format('YYYYMMDD')}S${route.params.employeeId
      }R${kpiinfo.id}N${'EMPLOYEESTORE'}`;
    await AsyncStorage.setItem(
      KEYSTORE_REPORT,
      JSON.stringify(data.dataStoreF),
    );
  };

  useEffect(() => {
    const _load = loadData();
    return () => _load;
  }, []);

  const renderItem = ({ item, index }) => {
    const onPressCheck = () => {
      handlePressCheck(item);
    };
    const sourceImage =
      item.imageUrl !== null
        ? item.imageUrl?.indexOf('file://') === -1 &&
          item.imageUrl?.indexOf('https://') === -1
          ? URLDEFAULT + item.imageUrl
          : item.imageUrl
        : null;
    return (
      <View
        key={'itemStore_' + index}
        style={{
          padding: 4,
          width: deviceWidth,
          backgroundColor: appcolor.surface,
        }}
      >
        <TouchableOpacity
          onPress={onPressCheck}
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 8,
            marginLeft: 32,
            backgroundColor: appcolor.light,
            borderRadius: 16,
          }}
        >
          <View
            style={{
              left: -16,
              width: (deviceWidth - 16) * 0.25,
              height: (deviceWidth - 16) * 0.25,
              backgroundColor: appcolor.surface,
              padding: 8,
              borderRadius: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: appcolor.light,
              }}
            >
              {sourceImage !== null && (
                <Image
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%', borderRadius: 8 }}
                  source={{ uri: sourceImage }}
                />
              )}
            </View>
          </View>
          <View
            style={{
              width: '70%',
              width: (deviceWidth - 16) * 0.7,
              paddingLeft: 8,
            }}
          >
            <Text
              style={{
                color: appcolor.dark,
                fontWeight: '600',
                fontSize: 16,
                marginBottom: 8,
                paddingRight: 16,
              }}
            >
              {item.shopName}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontWeight: '600', fontSize: 12 }}
            >
              {item.addressVN}
            </Text>
            {item.level !== null && item.level !== undefined && (
              <Text
                style={{
                  color: appcolor.dark,
                  fontWeight: '400',
                  fontSize: 12,
                }}
              >
                {item.levelName}
              </Text>
            )}
            {item.totalLastDate !== null &&
              item.totalLastDate !== undefined && (
                <Text
                  style={{
                    color: appcolor.dark,
                    fontWeight: '400',
                    fontSize: 12,
                  }}
                >
                  {item.totalText}
                </Text>
              )}
            {item.totalMTD !== null && item.totalMTD !== undefined && (
              <Text
                style={{
                  color: appcolor.dark,
                  fontWeight: '400',
                  fontSize: 12,
                }}
              >
                {item.totalMTDText}
              </Text>
            )}
          </View>
          <TouchableOpacity
            disabled={true}
            // onPress={() => handlePressCheck(item)}
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            <SpiralIcon
              style={{ textAlign: 'center' }}
              type="font-awesome-5"
              name={item.IsChose == 1 ? 'check-circle' : 'circle'}
              size={22}
              color={item.IsChose == 1 ? appcolor.success : appcolor.dark}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
      <HeaderCustom
        title={'Danh sách cửa hàng ' + (data.dataEmployee?.fullName || '')}
        iconRight={'cogs'}
        rightFunc={handleSelectSetting}
        leftFunc={() => navigation.goBack()}
      />
      <View style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>
          <FormGroup
            containerStyle={{ backgroundColor: appcolor.homebackground }}
            appcolor={appcolor}
            placeholder={'Tìm kiếm cửa hàng'}
            editable
            value={search}
            handleChangeForm={text => handleSearchStore(text)}
            multiline
            iconName="search"
          />
        </View>
        <FlatList
          key={'listStore'}
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          data={data.dataStore}
          renderItem={renderItem}
        />
      </View>
      <ActionSheet
        containerStyle={{ paddingTop: 16, paddingBottom: insets.bottom }}
        id={'sheetStoreEmployee_' + (route.params.employeeId || 0)}
      >
        <View style={{ height: deviceHeight * 0.6, padding: 8 }}>
          <View style={{ width: '100%' }}>
            <Text
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 18,
                fontWeight: '600',
                color: appcolor.dark,
              }}
            >
              Công cụ lọc
            </Text>
            <TouchableOpacity onPress={filterCheckStore}>
              <View
                style={{
                  backgroundColor: filterCheck
                    ? appcolor.light
                    : appcolor.surface,
                  borderWidth: filterCheck ? 0.5 : 0,
                  borderColor: appcolor.success,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                  marginTop: 8,
                  borderRadius: 5,
                }}
              >
                <SpiralIcon
                  name={'keyboard'}
                  size={18}
                  color={appcolor.success}
                />
                <Text
                  style={{
                    width: '100%',
                    fontSize: 14,
                    fontWeight: '400',
                    color: appcolor.dark,
                    padding: 8,
                  }}
                >
                  Các cửa hàng đã chọn
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={unCheckAllStore}>
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  borderWidth: 0,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                  marginTop: 8,
                  borderRadius: 5,
                }}
              >
                <SpiralIcon
                  name={'keyboard'}
                  size={18}
                  color={appcolor.success}
                />
                <Text
                  style={{
                    width: '100%',
                    fontSize: 14,
                    fontWeight: '400',
                    color: appcolor.dark,
                    padding: 8,
                  }}
                >
                  Bỏ chọn tất cả
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('SELL')}>
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  borderWidth: dataFilter.sortBySell == 1 ? 0.5 : 0,
                  borderColor: appcolor.success,
                  justifyContent: 'space-between',
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                  marginTop: 8,
                  borderRadius: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '70%',
                  }}
                >
                  <SpiralIcon
                    name={'sort'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortBySell == 1
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        dataFilter.sortBySell == 1
                          ? appcolor.success
                          : appcolor.dark,
                      padding: 8,
                    }}
                  >
                    Sắp xếp theo Doanh số
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                  }}
                >
                  <SpiralIcon
                    name={'sort-numeric-up'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortBySell == 1
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('SELL')}>
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  borderWidth: dataFilter.sortBySell == 2 ? 0.5 : 0,
                  borderColor: appcolor.success,
                  justifyContent: 'space-between',
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                  marginTop: 8,
                  borderRadius: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '70%',
                  }}
                >
                  <SpiralIcon
                    name={'sort'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortBySell == 2
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        dataFilter.sortBySell == 2
                          ? appcolor.success
                          : appcolor.dark,
                      padding: 8,
                    }}
                  >
                    Sắp xếp theo Doanh số
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                  }}
                >
                  <SpiralIcon
                    name={'sort-numeric-down'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortBySell == 2
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSort('MTD')}>
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  borderWidth: dataFilter.sortByMTD == 1 ? 0.5 : 0,
                  borderColor: appcolor.success,
                  justifyContent: 'space-between',
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                  marginTop: 8,
                  borderRadius: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '70%',
                  }}
                >
                  <SpiralIcon
                    name={'sort'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortByMTD == 1
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        dataFilter.sortByMTD == 1
                          ? appcolor.success
                          : appcolor.dark,
                      padding: 8,
                    }}
                  >
                    Sắp xếp theo MTD
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                  }}
                >
                  <SpiralIcon
                    name={'sort-numeric-up'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortByMTD == 1
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('MTD')}>
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  borderWidth: dataFilter.sortByMTD == 2 ? 0.5 : 0,
                  borderColor: appcolor.success,
                  justifyContent: 'space-between',
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                  marginTop: 8,
                  borderRadius: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '70%',
                  }}
                >
                  <SpiralIcon
                    name={'sort'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortByMTD == 2
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        dataFilter.sortByMTD == 2
                          ? appcolor.success
                          : appcolor.dark,
                      padding: 8,
                    }}
                  >
                    Sắp xếp theo MTD
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                  }}
                >
                  <SpiralIcon
                    name={'sort-numeric-down'}
                    type={'font-awesome-5'}
                    size={18}
                    color={
                      dataFilter.sortByMTD == 2
                        ? appcolor.success
                        : appcolor.dark
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
