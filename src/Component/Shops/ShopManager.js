import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import FormGroup from '../../Content/FormGroup';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from '@rneui/themed';
import { MapApp } from '../../Control/MapApp';
import { GetShopManager } from '../../Controller/ShopController';
import { fontWeightBold, scaleSize } from '../../Themes/AppsStyle';
import Geolocation from '@react-native-community/geolocation';
import {
  ToastSuccess,
  UUIDGenerator,
  distanceBetween2Points,
  openSettingPermission,
  removeVietnameseTones,
  requestPerrmission,
} from '../../Core/Helper';
import { URLDEFAULT } from '../../Core/URLs';
import moment from 'moment';

import { checkAddWork } from '../../Controller/WorkController';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { downloadDataByShop } from '../../Controller/DownloadDataController';
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { ButtonAction } from './Control/ButtonAction';
import { deviceHeight } from '../../Core/Utility';
import { ActionFilter } from './Control/ActionFilter';
import _ from 'lodash';
import { LoadingView } from '../../Control/ItemLoading';
import { SetReport, SetShopInfo } from '../../Redux/action';
import CustomListView from '../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * isHideDashboard : ẩn xem thông tin thống kê
 * isUpdateInfo : cập nhật thông tin cửa hàng
 * isUseSellOut : thêm số bán (SellOut)
 * isUseInstoreShare : nhập báo cáo instoreShare
 * isShowSummary : Xem tổng SSub
 * isAnotherRoute : làm báo cáo cửa hàng khi không có plan
 * isUsePhotoDisplay : làm báo cáo chụp hình trưng bày
 *
 */

export const TYPE = {
  INSTORE_SHARE: 'INSTORE_SHARE', //Instore Share
  SHOW_DASHBOARD: 'SHOW_DASHBOARD', //Thống kê
  SELLOUT: 'SELLOUT', //Thêm số bán
  SHOW_SUMMARY: 'SHOW_SUMMARY', //Xem tổng
  UPDATE_INFO: 'UPDATE_INFO', //Cập nhật thông tin
  PHOTO_DISPLAY: 'PHOTO_DISPLAY', //Hình trưng bày
  ANOTHER_ROUTE: 'ANOTHER_ROUTE', //Báo cáo
};

export const ShopManager = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, searchData } = useSelector(
    state => state.GAppState,
  );
  const [shops, setShops] = useState([]);
  const [list, setList] = useState([]);
  const [myLocation, setCurrent] = useState({ latitude: 0, longitude: 0 });
  const dispath = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isMap, setMap] = useState(true);
  const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const [_mutate, setMutate] = useState(false);
  const [itemFilter, setItemFilter] = useState({
    search: null,
    newest: false,
    headcount: null,
  });
  const dispatch = useDispatch();
  //
  const onLoadShop = async () => {
    await requestMylocation();
    await setLoading(true);
    const result = await GetShopManager();
    if ((await result.statusId) === 200) {
      await setShops(result.data || []);
      await setList(result.data || []);
    }
    await setLoading(false);
  };
  const permissionLocation = async status => {
    switch (status) {
      case RESULTS.BLOCKED:
        await openSettingPermission.settingLocation(
          `Vui lòng truy cập vào ứng dụng trong phần "Cài đặt" để mở quyền sử dụng vị trí`,
        );
        break;
      default:
        await requestPerrmission(
          {
            android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          },
          async status => {
            if (status) {
              await Geolocation.getCurrentPosition(
                async position => {
                  await setCurrent({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  });
                },
                err => {
                  console.log(err, 'location error');
                },
              );
            } else {
              await openSettingPermission.settingLocation(
                `Vui lòng truy cập vào ứng dụng trong phần "Cài đặt" để mở quyền sử dụng vị trí`,
              );
            }
          },
        );
        break;
    }
  };
  const requestMylocation = async () => {
    await check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ).then(async result => {
      if (result == RESULTS.GRANTED) {
        await Geolocation.getCurrentPosition(
          async position => {
            // await console.log(position, "mylocation")
            await setCurrent({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          err => {
            console.log(err, 'location error');
          },
        );
        return;
      }
      await permissionLocation(result);
    });
  };
  const SwithMode = () => {
    setMap(!isMap);
  };
  const ShowProfile = item => {
    dispath({ type: 'SELECT_SHOP', shopinfo: item });
    navigation.navigate('profileshops');
  };
  const UpdateProfile = async item => {
    await navigation.navigate('updatestore', { shopinfo: item });
  };
  const handleSelectReport = async item => {
    await dispath({ type: 'SELECT_SHOP', shopinfo: item });
    await downloadDataByShop(item.shopId, async result => {
      await ToastSuccess(result, 'Đồng bộ dữ liệu', 'top');
    });
    await navigation.navigate('ShopPage', { shopInfo: item });
  };
  const handleSelectTakePhoto = async item => {
    const workTemplate = await {
      shopId: item.shopId || 0,
      shopName: item.shopName,
      shopCode: item.shopCode,
      address: item.address,
      imageUrl: item.imageUrl,
      workDate: parseInt(moment(new Date()).format('YYYYMMDD')),
      workTime: moment(new Date()).format('YYYYMMDDHHmmss'),
      workStatus: 1,
      attendantCount: 2,
      guiid: UUIDGenerator(),
      shopConfig: item.config || '{}',
    };
    const workCurrent = await checkAddWork(workTemplate);
    const dataKpi = JSON.parse(item.dataKPIByDisplay || '[]');
    const listReport = JSON.parse(dataKpi[0].reportItem || '{}');
    await dispatch(SetReport(workCurrent));
    await dispatch(SetShopInfo(item));
    await navigation.navigate(item.pageName || 'photobylist', {
      dataImageList: listReport.ImageByList || [],
      kpiData: dataKpi[0],
      isTakeInOther: true,
    });
  };
  const HandleAddSellOut = async item => {
    const workTemplate = await {
      shopId: item.shopId || 0,
      shopName: item.shopName,
      shopCode: item.shopCode,
      address: item.address,
      imageUrl: item.imageUrl,
      workDate: parseInt(moment(new Date()).format('YYYYMMDD')),
      workTime: moment(new Date()).format('YYYYMMDDHHmmss'),
      workStatus: 1,
      attendantCount: 2,
      guiid: UUIDGenerator(),
      shopConfig: item.config || '{}',
    };
    const workCurrent = await checkAddWork(workTemplate);
    await dispatch(SetReport(workCurrent));
    await dispatch(SetShopInfo(item));
    await navigation.navigate('sellout', { isManageShop: 1 });
  };
  const HandleAddInstoreShare = async item => {
    const workTemplate = await {
      shopId: item.shopId || 0,
      shopName: item.shopName,
      shopCode: item.shopCode,
      address: item.address,
      imageUrl: item.imageUrl,
      workDate: parseInt(moment(new Date()).format('YYYYMMDD')),
      workTime: moment(new Date()).format('YYYYMMDDHHmmss'),
      workStatus: 1,
      attendantCount: 2,
      guiid: UUIDGenerator(),
      shopConfig: item.config || '{}',
    };
    const workCurrent = await checkAddWork(workTemplate);
    await dispatch(SetReport(workCurrent));
    await dispatch(SetShopInfo(item));
    await navigation.navigate('homeinstoreshare', { isManageShop: 1 });
  };
  const handleShowSummary = async item => {
    await dispath({ type: 'SELECT_SHOP', shopinfo: item });
    await navigation.navigate('dashboardsummaryssub', { isManageShop: 1 });
  };
  const handleSearch = text => {
    search.text = text;
    setMutate(e => !e);
    //
    const _datafilter = _searchData(list, itemFilter);
    setShops(_datafilter);
  };
  const onFocusSearch = () => {
    search.isSearch = !search.isSearch;
    setMutate(e => !e);
  };
  const handleOnGoBack = () => {
    if (!isMap) {
      SwithMode();
    } else {
      dispatch(SetReport({}));
      dispatch(SetShopInfo(null));
      navigation.goBack();
    }
  };
  const handlerPressButton = (item, type) => {
    switch (type) {
      case TYPE.INSTORE_SHARE:
        HandleAddInstoreShare(item);
        break;
      case TYPE.SHOW_DASHBOARD:
        ShowProfile(item);
        break;
      case TYPE.SELLOUT:
        HandleAddSellOut(item);
        break;
      case TYPE.SHOW_SUMMARY:
        handleShowSummary(item);
        break;
      case TYPE.UPDATE_INFO:
        UpdateProfile(item);
        break;
      case TYPE.PHOTO_DISPLAY:
        handleSelectTakePhoto(item);
        break;
      case TYPE.ANOTHER_ROUTE:
        handleSelectReport(item);
        break;
    }
  };
  const _searchData = (filterList, itemFilter) => {
    let mainDataSearch = _.orderBy(
      filterList,
      ['sortLevel'],
      [itemFilter.newest ? 'desc' : 'asc'],
    );
    //
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    mainDataSearch = _.filter(
      mainDataSearch,
      e =>
        removeVietnameseTones(e.shopCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.address).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.dealerName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.levelName).toLowerCase().match(valueSearch),
    );
    if (itemFilter.headcount !== null) {
      mainDataSearch = _.filter(
        mainDataSearch,
        e => e.headCountType == itemFilter.headcount,
      );
    }
    mainDataSearch = _.filter(
      mainDataSearch,
      e =>
        (searchData.dealerName == null ||
          e.dealerName?.includes(searchData.dealerName)) &&
        (searchData.areaName == null ||
          e.areaName?.includes(searchData.areaName)) &&
        (searchData.provinceName == null ||
          e.province?.includes(searchData.provinceName)) &&
        (searchData.districtName == null ||
          e.district?.includes(searchData.districtName)),
    );

    return mainDataSearch;
  };
  const handlerFilterData = item => {
    setItemFilter(item);
    const _datafilter = _searchData(list, item);
    setShops(_datafilter);
  };
  const handlerFilterData_ByRegion = () => {
    const _datafilter = _searchData(list, itemFilter);
    setShops(_datafilter);
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    onLoadShop();
    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    handlerFilterData_ByRegion();
    return () => {
      isMounted = false;
    };
  }, [searchData]);
  //
  const styles = StyleSheet.create({
    titleView: {
      color: appcolor.dark,
      padding: 4,
      fontSize: scaleSize(15),
      fontWeight: '500',
    },
    contentView: {
      color: appcolor.blacklight,
      padding: 2,
      fontSize: scaleSize(12),
    },
    searchContainer: {
      width: '82%',
      marginTop: 8,
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
    },
    searchContainerInput: {
      width: '82%',
      marginTop: 8,
      padding: 3,
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
    searchStyle: { fontSize: 13, color: appcolor.primary },
    viewButtonAction: {
      width: 42,
      height: 42,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      alignContent: 'center',
      borderRadius: 50,
      marginStart: 8,
      backgroundColor: appcolor.light,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 3 },
      elevation: 3,
      shadowOpacity: 0.3,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    viewButtonFilter: {
      backgroundColor: appcolor.surface,
      borderWidth: 0,
      borderColor: appcolor.primary,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      marginTop: 8,
      borderRadius: 5,
    },
    textButtonFilter: {
      width: '100%',
      fontSize: 14,
      fontWeight: '400',
      color: appcolor.dark,
      padding: 8,
    },
    viewFilterData: { width: '100%', height: deviceHeight / 2 },
    titleAction: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
    },
    headAction: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingStart: 14,
    },
    loadingView: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 3,
    },
    actionSheetView: { width: '100%', minHeight: deviceHeight / 5 },
  });
  const renderItem = ({ item, index }) => {
    const _distant =
      item.latitude > 0 && myLocation?.latitude > 0
        ? distanceBetween2Points(
            myLocation.latitude,
            myLocation.longitude,
            item.latitude,
            item.longitude,
          ).toLocaleString('vi-VN', '#,##0.##') + ' km'
        : 'Chưa xác định';
    return (
      <View
        key={`qwe_${index}`}
        style={{ backgroundColor: appcolor.light, margin: 5, marginTop: 0 }}
      >
        <View
          style={{
            borderRadius: 8,
            borderWidth: 0.5,
            padding: 3,
            borderColor: appcolor.greylight,
          }}
        >
          <View>
            <Image
              source={
                item.imageUrl
                  ? { uri: URLDEFAULT + item.imageUrl }
                  : require('../../Themes/Images/noimage.png')
              }
              containerStyle={{ width: '90%' }}
              style={{
                borderRadius: 8,
                height: 250,
                width: '100%',
                resizeMode: 'cover',
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: '100%',
                bottom: 0,
                backgroundColor: appcolor.surface,
                opacity: 0.8,
              }}
            >
              <Text style={styles.titleView}>Cửa hàng {item.shopName}</Text>
              <Text style={styles.contentView}>Địa chỉ {item.address}</Text>
              <Text style={styles.contentView}>
                Khoảng cách bạn đến cửa hàng {_distant}
              </Text>
              {item.levelName !== null &&
                item.levelName !== undefined &&
                item.levelName !== '' && (
                  <Text style={styles.contentView}>{item.levelName}</Text>
                )}
              {item.shopFormat !== null &&
                item.shopFormat !== undefined &&
                item.shopFormat !== '' && (
                  <Text style={styles.contentView}>{item.shopFormat}</Text>
                )}
              {item.dealerName && (
                <Text
                  style={styles.contentView}
                >{`Loại hình: ${item.dealerName}`}</Text>
              )}
              {item.supType && (
                <Text style={styles.contentView}>{item.supType}</Text>
              )}
              {item.headCountType && (
                <Text style={styles.contentView}>{item.headCountType}</Text>
              )}
            </View>
          </View>
        </View>
        <View
          style={{ width: '100%', flexDirection: 'row-reverse', marginTop: 5 }}
        >
          <ButtonAction
            key={`qwe_${index}_${item.shopId}`}
            itemStore={item}
            reportItem={reportItem}
            handlerPressButton={handlerPressButton}
            TYPE={TYPE}
          />
        </View>
      </View>
    );
  };
  if (loading)
    return (
      <LoadingView
        isLoading={loading}
        title="Đang cập nhật dữ liệu"
        styles={styles.loadingView}
      />
    );
  if (!isMap)
    return (
      <View style={{ flex: 1, backgroundColor: appcolor.light }}>
        <HeaderCustom
          title={kpiinfo.menuNameVN || 'Cửa hàng phụ trách'}
          iconRight="list"
          leftFunc={handleOnGoBack}
          rightFunc={SwithMode}
        />
        <MapApp navigation={navigation} slist={shops} />
      </View>
    );
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Cửa hàng phụ trách'}
        iconRight="map"
        leftFunc={handleOnGoBack}
        rightFunc={SwithMode}
      />
      <View style={{ width: '100%', height: '88%' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FormGroup
            editable
            placeholder="Tìm kiếm cửa hàng"
            iconName="search"
            defaultValue={search.text}
            iconColor={search.isSearch ? appcolor.light : appcolor.primary}
            useClearAndroid={search.text !== null && search.text.length > 0}
            placeholderColor={
              search.isSearch ? appcolor.surface : appcolor.primary
            }
            containerStyle={
              search.isSearch
                ? styles.searchContainerInput
                : styles.searchContainer
            }
            inputStyle={
              search.isSearch ? styles.searchInputStyle : styles.searchStyle
            }
            handleChangeForm={handleSearch}
            onClearTextAndroid={handleSearch}
            onFocus={onFocusSearch}
            onEndEditing={onFocusSearch}
          />
          <TouchableOpacity
            style={styles.viewButtonAction}
            onPress={() => {
              SheetManager.show('sheetSortStore');
            }}
          >
            <SpiralIcon
              type="ionicon"
              name="funnel"
              size={20}
              color={appcolor.primary}
            />
          </TouchableOpacity>
        </View>
        <CustomListView
          data={shops}
          renderItem={renderItem}
          onRefresh={onLoadShop}
        />
      </View>
      <ActionSheet
        id={'sheetSortStore'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.actionSheetView}>
          <ActionFilter
            reportId={kpiinfo?.reportId}
            key="action-filter-shopmanager"
            itemFilter={itemFilter}
            handlerFilterData={handlerFilterData}
          />
        </View>
      </ActionSheet>
    </View>
  );
};
