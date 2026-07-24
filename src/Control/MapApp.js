import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Icon, Button } from '@rneui/themed';
import { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapView from 'react-native-maps'; // thư viện cũ là react-native-map-clustering
import Geolocation from '@react-native-community/geolocation';
import { useSelector, useDispatch } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { isDecimal } from 'geolib';
import _ from 'lodash';
import { ShopProfile } from '../Component/Shops/ShopProfile';
import { deviceHeight, deviceWidth } from '../Core/Utility';
import { scaleSize } from '../Themes/AppsStyle';
import FormGroup from '../Content/FormGroup';
import { ButtonAction } from '../Component/Employee/Infomation/Control/ButtonAction';
import { removeVietnameseTones } from '../Core/Helper';
import CustomListView from './Custom/CustomListView';
import { SetShopInfo } from '../Redux/action';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DETAL_LOCATION = 0.005;
export const MapApp = ({ navigation, route, slist }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [shoplist, setShops] = useState(slist || route.params.slist);
  const [search, _setSearch] = useState({ text: '', isSearch: false });
  const [markets, setMarket] = useState([]);
  const [currentLocation, setCurrent] = useState(null);
  const [_mutate, setMutate] = useState(false);
  const [provinceShopMain, setProvinceShopMain] = useState();
  const [provinceShop, setProvinceShop] = useState();
  const [provinceShopSearch, setProvinceShopSearch] = useState();
  const [districtShop, setDistrictShop] = useState();
  const [itemSelect, setItemSelect] = useState();
  const [isSelectedItem, setIsSelectedItem] = useState();
  const [defaultLocation, setLocationDef] = useState({
    latitude: 10.7880143,
    longitude: 106.6984652,
    latitudeDelta: DETAL_LOCATION,
    longitudeDelta: DETAL_LOCATION,
  });
  const dispatch = useDispatch();
  const refRegionList = useRef(null);
  const mapRef = useRef(null);
  //
  const loadShop = async () => {
    const dataShopProvince = _.unionBy(shoplist, 'province');
    await AddMarker();
    await setProvinceShop(dataShopProvince);
    await setProvinceShopSearch(dataShopProvince);
    await setProvinceShopMain(dataShopProvince);
  };
  //
  useEffect(() => {
    const _load = loadShop();
    const _request = requestMylocation();
    return () => {
      _load;
      _request;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkSelectedItem = () => {
      const isSelectedItem =
        itemSelect &&
        provinceShopMain
          ?.slice(0, 5)
          .findIndex(item => item.province === itemSelect.province) === -1;
      if (isMounted) {
        setIsSelectedItem(isSelectedItem);
      }
    };

    checkSelectedItem();
    return () => {
      isMounted = false;
    };
  }, [itemSelect, provinceShopMain]);
  // Handler

  const requestMylocation = (successCallback, errorCallback) => {
    Geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const region = {
          latitude: lat,
          longitude: long,
          latitudeDelta: DETAL_LOCATION,
          longitudeDelta: DETAL_LOCATION,
        };
        setCurrent(region);
        successCallback && successCallback(region);
      },
      error => {
        errorCallback && errorCallback(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  };
  const moveLocation = (moveInfo, key) => {
    console.log('moveLocation', moveInfo, key);
    if (key === 'provinceTag') {
      mapRef.current.animateToRegion({
        // latitude: moveInfo?.latitudeDefault,
        // longitude: moveInfo?.longitudeDefault,
        latitude: moveInfo?.latitude,
        longitude: moveInfo?.longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.09,
      });
    } else {
      mapRef.current.animateToRegion({
        latitude: moveInfo?.latitude,
        longitude: moveInfo?.longitude,
        latitudeDelta: DETAL_LOCATION,
        longitudeDelta: DETAL_LOCATION,
      });
    }
  };
  const onClickMarker = shops => {
    dispatch(SetShopInfo(shops));
    SheetManager.show('viewSheetList');
  };
  const AddMarker = () => {
    let mkList = [];
    if (shoplist !== null) {
      shoplist?.forEach(mk => {
        if (
          mk.latitude !== undefined &&
          mk.longitude !== undefined &&
          mk.latitude !== null &&
          mk.longitude !== null &&
          isDecimal(mk.latitude) &&
          isDecimal(mk.longitude)
        ) {
          mkList.push(
            <Marker
              key={mk.shopCode}
              onPress={() => onClickMarker(mk)}
              coordinate={{ latitude: mk.latitude, longitude: mk.longitude }}
              pinColor={appcolor[mk.colorMarker] || 'tomato'}
              title={mk.shopName}
              description={mk.address}
            ></Marker>,
          );
        }
      });
    }

    setMarket(mkList);
  };
  const selectedStore = (item, key) => {
    console.log('item selectedStore', item, key);
    moveLocation(item, key);
  };
  const moveCurrentLocation = () => {
    requestMylocation(
      region => {
        mapRef !== undefined && mapRef.current.animateToRegion(region);
      },
      () => {
        alert(
          'Bạn chưa có toạ độ vui lòng bật tính năng vị trí trong phần cài đặt của máy.',
        );
      },
    );
  };
  const onSearch = () => {
    const param = {
      shoplist,
      provinceShop,
      callBack: item => {
        selectedStore(item);
      },
    };
    navigation.navigate('searchshop', param);
  };
  const onSearchData = text => {
    search.text = text;
    setMutate(e => !e);
    const valueSearch = removeVietnameseTones(text).toLowerCase();
    const listUpdate = _.filter(provinceShopSearch, e => {
      const normalizedProvince = removeVietnameseTones(
        e.province,
      ).toLowerCase();
      const isMatch = normalizedProvince.includes(valueSearch);
      return isMatch;
    });
    if (search.text == '') {
      setProvinceShopMain(provinceShopSearch);
    }

    setProvinceShop(listUpdate);
  };

  const onFocusSearch = () => {
    search.isSearch = !search.isSearch;
    setMutate(e => !e);
  };
  const handleShowRegion = () => {
    SheetManager.show('viewSheetRegion');
  };
  const handleHideRegion = () => {
    // search.text = '';
    // search.isSearch = false;
    setProvinceShopMain(provinceShopMain);
    setProvinceShop(provinceShopMain);
    SheetManager.hide('viewSheetRegion');
  };
  const handlerOpenDetailsDistrict = async (item, key) => {
    selectedStore(item, key);
    const _isOpen = !(item.isOpen || false);
    const listUpdate = _.map(districtShop, e => {
      return item.district == e.district
        ? { ...e, isOpen: _isOpen }
        : { ...e, isOpen: false };
    });
    setDistrictShop(listUpdate);
  };

  const handlerSelectTag = (item, index, key) => {
    try {
      refRegionList?.current?.scrollToIndex({
        index: index > 4 && key === 'provinceTag' ? 4 : index,
        animated: true,
      });
    } catch (e) {
      console.log(e, 'ScrollToIndex');
    }
    setItemSelect(item);
    selectedStore(item, key);
    //
    const _listUpdate = _.map(
      search.text.length > 0 ? provinceShop : provinceShopMain,
      e => {
        return {
          ...e,
          isOpen: item.province == e.province ? !(item.isOpen || false) : false,
        };
      },
    );
    const _listDistrict = _.unionBy(
      _.filter(shoplist, e => e.province == item.province),
      'district',
    );
    //
    setProvinceShopMain(_listUpdate);
    setProvinceShop(_listUpdate);
    setDistrictShop(_listDistrict);
  };
  // View
  const styles = StyleSheet.create({
    viewContainer: { flex: 1 },
    mapview: { flex: 1, marginBottom: 0 },
    mainView: {
      width: '100%',
      paddingHorizontal: 8,
      backgroundColor: appcolor.light,
    },
    itemViewMain: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      backgroundColor: appcolor.light,
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
      borderRadius: 8,
    },
    contentTitle: {
      fontSize: 14,
      fontWeight: Platform.OS == 'android' ? '700' : '600',
      color: appcolor.dark,
    },
    contentSubTitle: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.placeholderText,
    },
    searchContainer: {
      margin: 8,
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
    },
    searchContainerInput: {
      margin: 8,
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.primary,
      borderWidth: 0.5,
    },
    searchInputStyle: {
      fontSize: 14,
      color: appcolor.light,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
    },
    searchStyle: { fontSize: 13, color: appcolor.primary },
    buttonProvince: {
      padding: 8,
      marginVertical: 4,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      marginHorizontal: 5,
    },
    textProvinces: { color: appcolor.dark, fontWeight: '500' },
    moveCurrentLocation: {
      height: 50,
      width: 50,
      backgroundColor: appcolor.white,
      borderRadius: 40,
      position: 'absolute',
      zIndex: 5,
      bottom: 20,
      right: Platform.OS === 'android' ? deviceWidth - 60 : 20,
      justifyContent: 'center',
    },
    onSearchShop: {
      shadowOpacity: 0.7,
      shadowColor: appcolor.dark,
      shadowRadius: 10,
      borderColor: appcolor.dark,
      borderWidth: 0.1,
      top: 20,
      left: 20,
      right: 20,
      borderRadius: 30,
      opacity: 0.8,
      position: 'absolute',
      color: appcolor.dark,
      backgroundColor: appcolor.white,
    },
    iconMarker: { left: 10, position: 'absolute' },
    viewProvinceTag: {
      position: 'absolute',
      top: 70,
      height: '10%',
      left: 8,
      right: 8,
    },
    viewButtonClose: {
      alignSelf: 'center',
      position: 'absolute',
      bottom: Platform.OS == 'android' ? 16 : deviceHeight / 12,
    },
    addressText: {
      color: appcolor.greylight,
      fontSize: scaleSize(12),
      fontWeight: '500',
    },
    shopNameText: {
      color: appcolor.dark,
      fontSize: scaleSize(14),
      fontWeight: '700',
    },
    viewProvinceShop: { height: deviceHeight / 2, width: '100%' },
    titleFilter: {
      padding: 7,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '700',
      color: appcolor.dark,
    },
    scrollView: { width: '100%', height: '100%' },
    viewContainerText: { padding: 8, marginBottom: 8, marginTop: 8 },
  });
  const DistrictShop = ({ item }) => {
    const onPress = () => {
      handlerOpenDetailsDistrict(item, 'district');
    };
    return (
      <View>
        <TouchableOpacity
          style={[
            styles.itemViewMain,
            {
              marginLeft: 20,
              backgroundColor: item.isOpen ? appcolor.primary : appcolor.light,
            },
          ]}
          onPress={onPress}
        >
          <View>
            <Text
              style={[
                styles.contentTitle,
                { color: item.isOpen ? appcolor.light : appcolor.dark },
              ]}
            >
              {item.district}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handlerSelectTag(item, index, 'province');
    };

    return (
      <View key={`it_group_${index}`} style={styles.mainView}>
        <TouchableOpacity style={styles.itemViewMain} onPress={onPress}>
          {item.isOpen && (
            <SpiralIcon
              type="ionicon"
              name="checkmark-circle"
              size={18}
              color={appcolor.primary}
              style={{ marginStart: 8 }}
            />
          )}
          <View>
            <Text style={styles.contentTitle}>{item.province}</Text>
          </View>
        </TouchableOpacity>
        {item.isOpen ? (
          districtShop.map((item, index) => (
            <DistrictShop key={index} item={item} />
          ))
        ) : (
          <View />
        )}
      </View>
    );
  };
  const renderItemTag = ({ item, index }) => {
    const onPress = () => {
      handlerSelectTag(item, index, 'provinceTag');
    };
    return (
      <View key={`ma-${index}`}>
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.buttonProvince,
            {
              backgroundColor: item.isOpen ? appcolor.primary : appcolor.light,
            },
          ]}
        >
          <Text
            style={[
              styles.textProvinces,
              { color: item.isOpen ? appcolor.light : appcolor.dark },
            ]}
          >
            {item.province}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      <MapView
        style={styles.mapview}
        zoomEnabled
        provider={PROVIDER_GOOGLE}
        getCurrentPosition
        ref={mapRef}
        showsUserLocation
        showsMyLocationButton={false}
        scrollingEnabled
        zoomControlEnabled
        zoomTapEnabled
        initialRegion={defaultLocation}
      >
        {markets}
      </MapView>
      <TouchableOpacity
        onPress={moveCurrentLocation}
        style={styles.moveCurrentLocation}
      >
        <SpiralIcon
          color={appcolor.info}
          name="location-arrow"
          type="font-awesome"
          size={24}
        />
      </TouchableOpacity>
      <Button
        title="Tìm cửa hàng..."
        onPress={onSearch}
        icon={
          <SpiralIcon
            name="map-marker"
            containerStyle={styles.iconMarker}
            color={appcolor.info}
            type="font-awesome"
            size={24}
          />
        }
        type="raise"
        color={appcolor.dark}
        containerStyle={styles.onSearchShop}
      />
      <View style={styles.viewProvinceTag}>
        <CustomListView
          ref={refRegionList}
          horizontal
          data={provinceShopMain?.slice(0, 5)}
          renderItem={renderItemTag}
          endView={
            <TouchableOpacity
              onPress={handleShowRegion}
              style={[
                styles.buttonProvince,
                {
                  backgroundColor: isSelectedItem
                    ? appcolor.primary
                    : appcolor.light,
                },
              ]}
            >
              <Text
                style={[
                  styles.textProvinces,
                  { color: isSelectedItem ? appcolor.light : appcolor.dark },
                ]}
              >
                {'Thêm...'}
              </Text>
            </TouchableOpacity>
          }
        />
      </View>
      <ActionSheet
        id="viewSheetList"
        gestureEnabled
        nestedScrollEnabled
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        headerAlwaysVisible
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.viewContainerText}>
            <Text style={styles.shopNameText}>
              Cửa hàng: {shopinfo?.shopName || ''}
            </Text>
            <Text style={styles.addressText}>
              Địa chỉ: {shopinfo?.address || ''}
            </Text>
          </View>
          <ShopProfile navigation={navigation} />
        </ScrollView>
      </ActionSheet>

      <ActionSheet
        id="viewSheetRegion"
        nestedScrollEnabled
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <Text style={styles.titleFilter}>{'Chọn Tỉnh'}</Text>
        <FormGroup
          editable
          placeholder="Tìm kiếm địa chỉ"
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
          handleChangeForm={onSearchData}
          onClearTextAndroid={onSearchData}
          onFocus={onFocusSearch}
          onEndEditing={onFocusSearch}
        />
        <View style={styles.viewProvinceShop}>
          <CustomListView
            ref={refRegionList}
            data={provinceShop}
            renderItem={renderItem}
          />
        </View>
        <View style={styles.viewButtonClose}>
          <ButtonAction
            iconName="close"
            iconSize={24}
            iconColor={appcolor.light}
            backgroundColor={appcolor.blacklight}
            onPress={handleHideRegion}
          />
        </View>
      </ActionSheet>
    </SafeAreaView>
  );
};
