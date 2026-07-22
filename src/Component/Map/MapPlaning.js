import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Text, Platform } from 'react-native';
import { Icon, Button } from '@rneui/themed';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { isDecimal } from 'geolib';
import { useSelector, useDispatch } from 'react-redux';
import ActionSheet from 'react-native-actions-sheet';
import { ShopProfile } from '../Component/Shops/ShopProfile';
import { deviceWidth } from '../Core/Utility';
import { scaleSize } from '../Themes/AppsStyle';
const DETAL_LOCATION = 0.005
export const MapPlaning = ({ navigation, slist }) => {
    const [shoplist, setShops] = useState(slist);
    const [markets, setMarket] = useState([]);
    const [currentLocation, setCurrent] = useState(null);
    const mapRef = useRef(null);
    const sheetRef = useRef();
    const { appcolor, shopinfo } = useSelector(state => state.GAppState);
    const dispath = useDispatch();
    const loadShop = async () => {
        await AddMarker();
    }
    useEffect(() => {
        loadShop();
        requestMylocation();
    }, [])
    const [defaultLocation, setLocationDef] = useState({
        latitude: 10.7880143,
        longitude: 106.6984652,
        latitudeDelta: DETAL_LOCATION,
        longitudeDelta: DETAL_LOCATION,
    })
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
                }
                setCurrent(region)
                successCallback && successCallback(region)
            },
            (error) => {
                errorCallback && errorCallback(error)
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
            }
        );
    }
    const moveLocation = (moveInfo) => {
        mapRef.current.animateToRegion({
            latitude: moveInfo.latitude, longitude: moveInfo.longitude,
            latitudeDelta: DETAL_LOCATION,
            longitudeDelta: DETAL_LOCATION,
        })
    }
    const onClickMarker = (shops) => {
        dispath({ type: "SELECT_SHOP", shopinfo: shops });
        sheetRef.current?.show();
    }
    const AddMarker = () => {
        let mkList = []
        if (shoplist !== null) {
            shoplist?.forEach(mk => {
                if (mk.latitude !== null && isDecimal(mk.latitude) && isDecimal(mk.longitude)) {
                    mkList.push(<Marker key={mk.shopCode}
                        onPress={() => onClickMarker(mk)}
                        coordinate={{ latitude: mk.latitude, longitude: mk.longitude }}
                        pinColor={"tomato"} // any color
                        title={mk.shopName}
                        description={mk.address}>
                    </Marker>
                    )
                }
            });
        }
        setMarket(mkList);
    }
    const selectedStore = (item) => {
        // alert(item.shopName);
        moveLocation(item);
    }
    const moveCurrentLocation = () => {
        requestMylocation(
            (region) => {
                (mapRef !== undefined) && mapRef.current.animateToRegion(region)
            },
            () => {
                alert('Bạn chưa có toạ độ vui lòng bật tính năng vị trí trong phần cài đặt của máy.')
            }
        )
    }
    const onSeach = () => {
        const param = {
            shoplist,
            callBack: (item) => selectedStore(item)
        }
        navigation.navigate("searchshop", param)
    }
    return (
        <View style={{ flex: 1, }} >
            <MapView
                style={{ flex: 1, marginBottom: 0 }}
                zoomEnabled={true}
                provider={PROVIDER_GOOGLE}
                getCurrentPosition={true}
                ref={mapRef}
                showsUserLocation={true}
                showsMyLocationButton={false}
                scrollingEnabled={true}
                initialRegion={defaultLocation}>
                {markets}
            </MapView>
            <TouchableOpacity
                onPress={() => moveCurrentLocation()}
                style={{
                    height: 50, width: 50,
                    backgroundColor: appcolor.white, borderRadius: 40, position: 'absolute',
                    zIndex: 5, bottom: 20, right: Platform.OS === 'android' ? deviceWidth - 60 : 20, justifyContent: 'center'
                }}>
                <Icon
                    color={appcolor.info}
                    name='location-arrow'
                    type='font-awesome'
                    size={24} />
            </TouchableOpacity>
            <Button title="Tìm cửa hàng..."
                onPress={() => onSeach()}
                icon={
                    <Icon name="map-marker" containerStyle={{ left: 10, position: 'absolute' }}
                        color={appcolor.info} type="font-awesome" size={24} />
                } type="raise"
                color={appcolor.dark}
                containerStyle={{
                    shadowOpacity: 0.7, shadowColor: appcolor.dark, shadowRadius: 10,
                    borderColor: appcolor.dark, borderWidth: 0.1,
                    top: 20, left: 20, right: 20, borderRadius: 30, opacity: 0.8,
                    position: 'absolute', color: appcolor.dark,
                    backgroundColor: appcolor.white,
                }} />
            <ActionSheet gestureEnabled
                ref={sheetRef} nestedScrollEnabled={true} drawUnderStatusBar
                containerStyle={{ backgroundColor: appcolor.light }}
                headerAlwaysVisible>
                <ScrollView style={{ height: '93%' }}>
                    <View style={{ padding: 7 }}>
                        <Text style={{ color: appcolor.dark, fontSize: scaleSize(14) }}>Cửa hàng: {shopinfo?.shopName || ''}</Text>
                    </View>
                    <ShopProfile navigation={navigation} />
                </ScrollView>
            </ActionSheet>
        </View>
    );
}