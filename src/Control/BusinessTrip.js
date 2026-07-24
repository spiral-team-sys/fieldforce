import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon, Button } from '@rneui/themed';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { isDecimal } from 'geolib';
import { useSelector } from 'react-redux';
import SpiralIcon from './Icon/SpiralIcon';
const DETAL_LOCATION = 0.005;
export const BusinessTrip = ({ navigation, startAction, labelAction }) => {
  const [markets, setMarket] = useState([]);
  const [currentLocation, setCurrent] = useState(null);
  const mapRef = useRef(null);
  const appcolor = useSelector(state => state.GAppState.appcolor);

  useEffect(() => {
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
      async position => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const region = {
          latitude: lat,
          longitude: long,
          latitudeDelta: DETAL_LOCATION,
          longitudeDelta: DETAL_LOCATION,
        };
        setCurrent(region);
        moveLocation(position.coords);
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
    mapRef.current.animateToRegion({
      latitude: moveInfo.latitude,
      longitude: moveInfo.longitude,
      latitudeDelta: DETAL_LOCATION,
      longitudeDelta: DETAL_LOCATION,
    });
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
        initialRegion={defaultLocation}
      >
        {markets}
      </MapView>
      <TouchableOpacity
        onPress={() => moveCurrentLocation()}
        style={{
          height: 50,
          width: 50,
          backgroundColor: appcolor.white,
          borderRadius: 40,
          position: 'absolute',
          zIndex: 5,
          bottom: 40,
          right: 20,
          justifyContent: 'center',
        }}
      >
        <SpiralIcon
          color={appcolor.info}
          name="location-arrow"
          type="font-awesome"
          size={24}
        />
      </TouchableOpacity>
      <Button
        title={labelAction + 'tại vị trí này'}
        buttonStyle={{ backgroundColor: appcolor.green }}
        titleStyle={{ color: appcolor.white, fontWeight: '700' }}
        onPress={() => startAction(currentLocation)}
        icon={
          <SpiralIcon
            name="map-marker"
            containerStyle={{ left: 10, position: 'absolute' }}
            color={appcolor.light}
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
          top: 40,
          left: 20,
          right: 20,
          borderRadius: 30,
          opacity: 1,
          position: 'absolute',
          color: appcolor.dark,
          backgroundColor: appcolor.white,
        }}
      />
    </View>
  );
};
