import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { Image, Text } from '@rneui/themed';
import { deviceHeight, fontWeightBold } from '../../../Themes/AppsStyle';
import { URLDEFAULT } from '../../../Core/URLs';
import {
  distanceBetween2Points,
  formatNumber,
  openSettingPermission,
  removeVietnameseTones,
  requestPerrmission,
} from '../../../Core/Helper';
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { FloatActionButton, TypeFAB } from '../../../Control/FAB';
import {
  GetDataWorkingStatus,
  getDataStoreList,
} from '../../../Controller/ShopController';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { ScreenWorkingStatus } from './ScreenWorkingStatus';
import { MapApp } from '../../../Control/MapApp';
import { SetShopInfo } from '../../../Redux/action';
import { LOCATION_INFO } from '../../../Utils/LocationInfo';
import CustomListView from '../../../Control/Custom/CustomListView';
import { SearchData } from '../../../Control/SearchData/SearchData';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import { LoadingView } from '../../../Control/ItemLoading';

const ShopViewContent = React.memo(
  ({
    dataMain,
    isLoadShopList,
    isLoading,
    appcolor,
    renderItem,
    LoadData,
    styles,
  }) => {
    const [searchText, setSearchText] = useState('');

    const dataFiltered = useMemo(() => {
      const valueSearch = removeVietnameseTones(searchText)
        .toLowerCase()
        .trim();
      if (!valueSearch) {
        return dataMain;
      }

      return dataMain.filter(item => item.searchText?.includes(valueSearch));
    }, [dataMain, searchText]);

    const onSearchData = useCallback(text => {
      setSearchText(text);
    }, []);

    return (
      <View style={{ flex: 1 }}>
        <SearchData
          placeholder="Tìm kiếm cửa hàng"
          onSearchData={onSearchData}
        />
        <LoadingView
          isLoading={isLoadShopList}
          title="Đang lấy dữ liệu cửa hàng"
        />
        {isLoading && (
          <ActivityIndicator size="small" color={appcolor.primary} />
        )}

        {dataFiltered && !isLoadShopList && (
          <CustomListView
            data={dataFiltered}
            extraData={dataFiltered}
            renderItem={renderItem}
            onRefresh={LoadData}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </View>
    );
  },
);

export const ScreenShops = ({
  navigation,
  inHome = false,
  isShowHeader = true,
  reloadData: _reloadData = false,
  isDownloadData = false,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [workingStatus, setWorkingStatus] = useState({
    isShow: false,
    start: {},
    end: {},
    isStartAction: false,
    isEndAction: false,
    titleAction: null,
    iconAction: null,
    note: null,
  });
  const [locationInfo, _setLocationInfo] = useState({
    isPermission: true,
    latitude: 0,
    longitude: 0,
    accuracy: 0,
  });
  const [isViewMap, setViewMap] = useState(false);
  const dispatch = useDispatch();
  const [isLoadShopList, setLoadShopList] = useState(false);
  const [loadPermission, setLoadPermission] = useState({
    countLoadPermission: 0,
    maxCountPermisstion: 100,
    statusCurrent: false,
  });
  //
  const LoadData = useCallback(async () => {
    setLoadShopList(true);
    const loc = locationRef.current;
    await GetDataWorkingStatus(mData => {
      const titleAction = !mData.isStartAction
        ? 'Bắt đầu làm việc'
        : !mData.isEndAction
        ? 'Kết thúc làm việc'
        : 'Hoàn thành công việc';

      const iconAction = !mData.isStartAction
        ? 'play'
        : !mData.isEndAction
        ? 'stop'
        : 'checkmark-done';

      const itemWorking = { ...mData, titleAction, iconAction };

      setWorkingStatus(itemWorking);

      if (!inHome && !mData.isStartAction) {
        SheetManager.show('workingstatus');
      }

      if (mData.isStartAction) {
        getDataStoreList(mData => {
          const enriched = mData.map(item => {
            const distance =
              loc.latitude > 0 && item.latitude > 0
                ? distanceBetween2Points(
                    loc.latitude,
                    loc.longitude,
                    item.latitude,
                    item.longitude,
                  )
                : null;

            const searchText = removeVietnameseTones(
              `${item.shopName} ${item.shopCode} ${item.address}`,
            ).toLowerCase();

            return { ...item, distance, searchText };
          });

          setDataMain(enriched);
          setLoadShopList(false);
        });
      } else {
        setLoadShopList(false);
      }
    });
  }, [inHome]);

  // Location
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
          async statusP => {
            locationInfo.isPermission = statusP;
            setMutate(e => !e);
            !statusP &&
              (await openSettingPermission.settingLocation(
                `Vui lòng truy cập vào ứng dụng trong phần "Cài đặt" để mở quyền sử dụng vị trí`,
              ));
            if (statusP) {
              loadPermission.statusCurrent = statusP;
              await getMyLocation();
            }
            return;
          },
        );
        break;
    }
  };
  const getMyLocation = async () => {
    await setLoading(true);
    await check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    )
      .then(async result => {
        // Location Enable
        if (result == RESULTS.GRANTED || loadPermission.statusCurrent == true) {
          LOCATION_INFO.getCurrentLocation(async info => {
            _setLocationInfo(prev => ({
              ...prev,
              latitude: info.latitude,
              longitude: info.longitude,
              accuracy: info.accuracy,
              isPermission: true,
            }));
            // LoadData()
          });
        } else {
          _setLocationInfo(prev => ({ ...prev, isPermission: false }));
          permissionLocation(result);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Ref Location
  const locationRef = useRef(locationInfo);
  useEffect(() => {
    locationRef.current = locationInfo;
  }, [locationInfo]);
  // Effect
  useEffect(() => {
    if (locationInfo.latitude > 0) {
      LoadData();
    }
  }, [locationInfo.latitude, LoadData]);
  // LoadData when reload
  useEffect(() => {
    const _working = DeviceEventEmitter.addListener(
      'RELOAD_WORKING_STATUS',
      LoadData,
    );
    const _reload = DeviceEventEmitter.addListener('RELOADSHOP', LoadData);
    const _focus = navigation.addListener('focus', LoadData);
    LoadData();
    getMyLocation();
    return () => {
      _working.remove();
      _reload.remove();
      _focus();
    };
  }, [isDownloadData, LoadData, navigation]);

  // Handler
  const handlerPressUpdateStatus = useCallback(() => {
    SheetManager.show('workingstatus');
  }, []);
  const onShopPress = useCallback(
    async item => {
      await dispatch(SetShopInfo(item));
      await navigation.navigate('Work', { shopInfo: item });
    },
    [dispatch, navigation],
  );
  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const onShowMaps = useCallback(() => {
    setViewMap(prev => !prev);
  }, []);

  // View
  const styles = useMemo(
    () =>
      StyleSheet.create({
        mainContainer: {
          width: '100%',
          height: '100%',
          backgroundColor: appcolor.light,
        },
        contentMain: { width: '100%', height: '100%' },
        searchContainer: {
          flex: 1,
          height: 40,
          margin: 8,
          padding: 3,
          paddingHorizontal: 8,
          borderRadius: 20,
          backgroundColor: appcolor.light,
          borderWidth: 0.5,
          borderColor: appcolor.primary,
        },
        searchContainerInput: {
          flex: 1,
          height: 40,
          margin: 8,
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
        itemMain: {
          alignItems: 'center',
          flexDirection: 'row',
          padding: 8,
          marginVertical: 4,
          marginHorizontal: 8,
          borderRadius: 8,
          shadowOpacity: 0.5,
          elevation: 3,
          backgroundColor: appcolor.light,
          shadowColor: appcolor.dark,
          shadowOffset: { width: 3, height: 0 },
        },
        imageContainer: { width: 100, height: 100, marginRight: 8 },
        imageStyleMain: { borderRadius: 5, width: '100%', height: '100%' },
        infoMain: { width: '65%' },
        titleHead: {
          fontSize: 15,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
        },
        titleContent: {
          fontSize: 13,
          fontWeight: '500',
          color: appcolor.placeholderText,
        },
        titleContentTime: {
          fontSize: 11,
          fontWeight: '500',
          color: appcolor.placeholderText,
          textAlign: 'right',
          position: 'absolute',
          bottom: 8,
          end: 8,
          fontStyle: 'italic',
        },
        statusView: {
          width: 35,
          height: 35,
          position: 'absolute',
          top: 0,
          left: 0,
        },
        settingView: {
          width: '90%',
          alignItems: 'center',
          padding: 16,
          alignSelf: 'center',
        },
        titleSetting: {
          fontSize: 14,
          fontWeight: '700',
          color: appcolor.primary,
        },
        titleStatusDownload: {
          fontSize: 13,
          fontWeight: fontWeightBold,
          color: appcolor.primary,
          textAlign: 'center',
          padding: 16,
          fontStyle: 'italic',
        },
        fabLayer: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          start: 0,
          end: 0,
          zIndex: 50,
          elevation: 50,
        },
        containerStyle: {
          bottom: isShowHeader ? 24 : 16,
          end: 16,
          zIndex: 51,
          elevation: 51,
        },
        distanceText: {
          width: '60%',
          fontSize: 13,
          fontWeight: '500',
          color: appcolor.danger,
        },
      }),
    [appcolor, isShowHeader],
  );
  const renderItem = useCallback(
    ({ item }) => {
      const photoPath =
        item.imageUrl !== null
          ? item.imageUrl.indexOf('file://') === -1 &&
            item.imageUrl.indexOf('https://') === -1
            ? `${URLDEFAULT}${item.imageUrl}`
            : item.imageUrl
          : '';
      const sourceImage = photoPath
        ? { uri: photoPath }
        : require('../../../Themes/Images/store.png');
      const distance = item.distance;
      const titleDistance = `Khoảng cách: ${
        !distance
          ? 'N/A'
          : parseInt(distance) > 0
          ? formatNumber(parseInt(distance), ',')
          : 0
      } Km`;
      const onPress = () => {
        onShopPress(item);
      };
      return (
        <TouchableOpacity style={styles.itemMain} onPress={onPress}>
          <Image
            source={sourceImage}
            containerStyle={styles.imageContainer}
            style={styles.imageStyleMain}
            resizeMode="cover"
            resizeMethod="resize"
          />
          {/* // Info Store */}
          <View style={styles.infoMain}>
            <Text style={styles.titleHead}>{item.shopName}</Text>
            <Text style={styles.titleContent}>{`Mã CH: ${item.shopCode}`}</Text>
            <Text style={styles.titleContent}>{`Đc: ${item.address}`}</Text>
            <Text style={styles.distanceText}>{titleDistance}</Text>
          </View>
          <Text style={styles.titleContentTime}>{`${moment(
            item.auditDate,
            'YYYYMMDD',
          ).format('ddd, D MMMM')}`}</Text>
          {/* // */}
          {item.finish > 0 && item.finish % 2 === 0 && (
            <LottieView
              style={styles.statusView}
              source={require('../../../Themes/Images/check-mark-success.json')}
              autoPlay
              loop={false}
            />
          )}
        </TouchableOpacity>
      );
    },
    [onShopPress, styles],
  );
  const MapView = () => {
    return (
      <View style={{ flex: 1 }}>
        <MapApp navigation={navigation} slist={dataMain} />
      </View>
    );
  };
  //
  if (isDownloadData)
    return (
      <Text style={styles.titleStatusDownload}>
        Đang cập nhật dữ liệu cửa hàng ...
      </Text>
    );
  return (
    <View style={styles.mainContainer}>
      {isShowHeader && (
        <HeaderCustom
          title={'Danh sách cửa hàng'}
          leftFunc={onBack}
          iconRight={!isViewMap ? 'map' : 'list'}
          rightType="ionicon"
          rightFunc={onShowMaps}
        />
      )}
      <View style={styles.contentMain}>
        {!locationInfo.isPermission ? (
          <TouchableOpacity style={styles.settingView} onPress={getMyLocation}>
            <Text style={styles.titleSetting}>
              Cấp quyền truy cập "Vị trí của thiết bị"
            </Text>
          </TouchableOpacity>
        ) : isViewMap ? (
          <MapView />
        ) : (
          <ShopViewContent
            dataMain={dataMain}
            isLoadShopList={isLoadShopList}
            isLoading={isLoading}
            appcolor={appcolor}
            renderItem={renderItem}
            LoadData={LoadData}
            styles={styles}
          />
        )}
        {/* // Action */}
        <ActionSheet
          id="workingstatus"
          drawUnderStatusBar={Platform.OS == 'ios'}
          closeOnTouchBackdrop={
            workingStatus.isStartAction && workingStatus.isEndAction
          }
          containerStyle={{
            width: '100%',
            height:
              deviceHeight /
              (workingStatus.isStartAction &&
              workingStatus.isEndAction &&
              !workingStatus?.start?.imageUrl
                ? 2.5
                : 1),
            paddingBottom: insets.bottom,
          }}
        >
          <SafeAreaView style={{ width: '100%', height: '100%' }}>
            <ScreenWorkingStatus
              locationInfo={locationInfo}
              workingInfo={workingStatus}
              navigation={navigation}
            />
          </SafeAreaView>
        </ActionSheet>
      </View>
      {workingStatus.isShow && (
        <View pointerEvents="box-none" style={styles.fabLayer}>
          <FloatActionButton
            containerStyle={styles.containerStyle}
            typeAction={TypeFAB.pressItem}
            iconActionName={workingStatus.iconAction || null}
            titleAction={workingStatus.titleAction || null}
            onAction={handlerPressUpdateStatus}
          />
        </View>
      )}
    </View>
  );
};
