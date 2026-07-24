import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { Icon, Button } from '@rneui/themed';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  Polygon,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { isDecimal } from 'geolib';
import { useDispatch, useSelector } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { ShopProfile } from '../../Component/Shops/ShopProfile';
import { scaleSize } from '../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
//import { ACTION } from '../../Core/ReduxController';
const DETAL_LOCATION = 0.005;
export const MapPlan = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { shops } = route.params;
  const dispath = useDispatch();
  const [shoplist, setShops] = useState(shops);
  const [markets, setMarket] = useState([]);
  const [polyline, setPoline] = useState([]);
  const [planPoint, setPlanPoint] = useState({});
  const [currentLocation, setCurrent] = useState(null);
  const mapRef = useRef(null);
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  useEffect(() => {
    // setShops(shops)
    AddMarker();
    requestMylocation();
  }, []);
  const [defaultLocation, setLocationDef] = useState({
    latitude: 10.7880143,
    longitude: 106.6984652,
    latitudeDelta: DETAL_LOCATION,
    longitudeDelta: DETAL_LOCATION,
  });
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
  const moveLocation = moveInfo => {
    // console.log(moveInfo)
    mapRef.current.animateToRegion({
      latitude: moveInfo.latitude,
      longitude: moveInfo.longitude,
      latitudeDelta: DETAL_LOCATION,
      longitudeDelta: DETAL_LOCATION,
    });
  };
  const onClickMarker = shops => {
    dispath({ type: ACTION.SELECT_SHOP, shopinfo: shops });
    SheetManager.show('sheetProfile');
  };
  const AddMarker = () => {
    let mkList = [];
    let polygon = [];
    let _point = {};
    if (shoplist !== null) {
      shoplist?.forEach(mk => {
        if (
          mk.latitude !== null &&
          isDecimal(mk.latitude) &&
          isDecimal(mk.longitude)
        ) {
          if (mk.inPlan == 1) {
            polygon.push({ latitude: mk.latitude, longitude: mk.longitude });
            _point = { latitude: mk.latitude, longitude: mk.longitude };
          }
          mkList.push(
            <Marker
              key={mk.shopCode}
              // onPress={() => onClickMarker(mk)}
              coordinate={{ latitude: mk.latitude, longitude: mk.longitude }}
              pinColor={mk.inPlan ? appcolor.info : appcolor.danger} // any color
              title={mk.shopName}
              description={mk.address}
            ></Marker>,
          );
        }
      });
    }
    setPoline(polygon);
    setMarket(mkList);
    setPlanPoint(_point);
  };
  const selectedStore = item => {
    moveLocation(item);
  };
  const onSeach = () => {
    const param = {
      shoplist,
      callBack: item => selectedStore(item),
    };
    navigation.navigate('searchshop', param);
  };
  const moveToRoute = () => {
    moveLocation(planPoint);
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
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1, marginBottom: 0 }}
        zoomEnabled={true}
        provider={PROVIDER_GOOGLE}
        getCurrentPosition={true}
        ref={mapRef}
        showsUserLocation={true}
        showsMyLocationButton={false}
        scrollingEnabled={true}
        zoomControlEnabled={true}
        initialRegion={defaultLocation}
      >
        {markets}
        {polyline.length > 0 && (
          <Polygon
            coordinates={polyline}
            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
            strokeColors={[
              '#7F0000',
              '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
              '#B24112',
              '#E5845C',
              '#238C23',
              '#7F0000',
            ]}
            strokeWidth={6}
          />
        )}
      </MapView>
      <View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          flex: 1,
          zIndex: 5,
          bottom: 20,
          justifyContent: 'center',
          paddingLeft: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            height: 50,
            width: 50,
            justifyContent: 'center',
            backgroundColor: appcolor.light,
            borderRadius: 40,
            alignSelf: 'center',
          }}
        >
          <SpiralIcon color={appcolor.danger} name="close" size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => moveCurrentLocation()}
          style={{
            height: 50,
            width: 50,
            justifyContent: 'center',
            borderRadius: 40,
            marginEnd: 7,
          }}
        >
          <SpiralIcon
            reverse
            color={appcolor.primary}
            name="location-arrow"
            type="font-awesome"
            size={24}
          />
        </TouchableOpacity>
        {planPoint.latitude !== undefined && (
          <TouchableOpacity
            onPress={() => moveToRoute()}
            style={{
              height: 50,
              width: 50,
              justifyContent: 'center',
              marginEnd: 7,
              borderRadius: 40,
              alignSelf: 'center',
            }}
          >
            <SpiralIcon
              color={appcolor.info}
              reverse
              name="directions"
              size={24}
            />
          </TouchableOpacity>
        )}
      </View>
      <Button
        title="Tìm cửa hàng..."
        onPress={() => onSeach()}
        icon={
          <SpiralIcon
            name="map-marker"
            containerStyle={{ left: 10, position: 'absolute' }}
            color={appcolor.info}
            type="font-awesome"
            size={24}
          />
        }
        type="raise"
        color={appcolor.dark}
        containerStyle={{
          shadowOpacity: 0.7,
          shadowColor: appcolor.dark,
          shadowRadius: 10,
          borderColor: appcolor.dark,
          borderWidth: 0.1,
          top: 50,
          left: 20,
          right: 20,
          borderRadius: 30,
          opacity: 0.8,
          position: 'absolute',
          color: appcolor.dark,
          padding: 7,
          backgroundColor: appcolor.white,
        }}
      />

      <ActionSheet
        gestureEnabled
        id="sheetProfile"
        nestedScrollEnabled={true}
        drawUnderStatusBar
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        headerAlwaysVisible
      >
        <ScrollView style={{ height: '93%' }}>
          <View style={{ padding: 7 }}>
            <Text style={{ color: appcolor.dark, fontSize: scaleSize(14) }}>
              Cửa hàng: {shopinfo?.shopName || ''}
            </Text>
          </View>
          <ShopProfile navigation={navigation} />
        </ScrollView>
      </ActionSheet>
    </View>
  );
};
