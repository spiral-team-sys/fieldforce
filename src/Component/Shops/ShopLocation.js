import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DEFAULT_COLOR } from '../../Core/URLs';
import { useSelector } from 'react-redux';
import { LOCATION_INFO } from '../../Utils/LocationInfo';

const DETAL_LOCATION = 0.005;

const ShopLocation = () => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [regionMylocation, setRegionMylocation] = useState(null);
  const [regionShoplocation, setRegionShoplocation] = useState(null);
  const [isHaveLocationShop, setIsHaveLocationShop] = useState(false);
  const [shopSelected, setShopSelected] = useState({});
  const mapRef = useRef(null);

  const requestMylocation = (successCallback, errorCallback) => {
    LOCATION_INFO.getCurrentLocation(
      info => {
        const region = {
          latitude: info.latitude,
          longitude: info.longitude,
          latitudeDelta: DETAL_LOCATION,
          longitudeDelta: DETAL_LOCATION,
        };

        setRegionMylocation(region);
        successCallback && successCallback(region);
      },
      error => {
        errorCallback && errorCallback(error);
      },
    );
  };

  const handleUserLocationChange = event => {
    const coordinate = event?.nativeEvent?.coordinate;
    if (!coordinate?.latitude || !coordinate?.longitude) {
      return;
    }

    setRegionMylocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: DETAL_LOCATION,
      longitudeDelta: DETAL_LOCATION,
    });
  };

  const onShowMyLocation = () => {
    if (regionMylocation !== null) {
      mapRef.current !== undefined &&
        mapRef.current.animateToRegion(regionMylocation);
      return;
    }

    requestMylocation(
      region => {
        mapRef.current !== undefined && mapRef.current.animateToRegion(region);
      },
      () => {
        Alert.alert(
          'Bạn chưa có toạ độ vui lòng bật tính năng vị trí trong phần cài đặt của máy.',
        );
      },
    );
  };

  const showLocation = () => {
    if (!isHaveLocationShop) {
      mapRef.current !== undefined &&
        regionMylocation !== null &&
        mapRef.current.animateToRegion(regionMylocation, 1.0);
    }
  };

  useEffect(() => {
    requestMylocation();

    const loadShopInfo = async () => {
      if (shopinfo !== null && shopinfo?.latitude !== null) {
        setRegionShoplocation({
          latitude: shopinfo?.latitude,
          longitude: shopinfo?.longitude,
          latitudeDelta: DETAL_LOCATION,
          longitudeDelta: DETAL_LOCATION,
        });
        setIsHaveLocationShop(true);
        setShopSelected(shopinfo);
      }
    };

    loadShopInfo();
  }, [shopinfo]);

  return (
    <View
      style={{ height: '100%', width: '100%', backgroundColor: appcolor.light }}
    >
      <MapView
        ref={mapRef}
        style={{ flex: 1, marginBottom: 0 }}
        zoomEnabled={true}
        provider={PROVIDER_GOOGLE}
        getCurrentPosition={true}
        showsUserLocation={true}
        showsMyLocationButton={false}
        scrollingEnabled={true}
        initialRegion={regionShoplocation}
        onMapReady={showLocation}
        onUserLocationChange={handleUserLocationChange}
      >
        {isHaveLocationShop && (
          <Marker
            key={shopSelected.shopCode}
            coordinate={{
              latitude: shopSelected.latitude,
              longitude: shopSelected.longitude,
            }}
            pinColor={appcolor[shopSelected.colorMarker] || 'tomato'}
            title={shopSelected.shopName}
            description={shopSelected.address}
          />
        )}
      </MapView>
      <TouchableOpacity
        onPress={onShowMyLocation}
        style={{
          backgroundColor: appcolor.white,
          position: 'absolute',
          zIndex: 5,
          top: 8,
          right: 8,
          alignItems: 'flex-end',
          padding: 8,
          borderRadius: 8,
        }}
      >
        <SpiralIcon
          name="locate"
          type="ionicon"
          color={DEFAULT_COLOR}
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ShopLocation;
