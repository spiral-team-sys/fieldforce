import React, { useEffect, useRef, useState } from "react";
import { LayoutAnimation, Modal, Platform, SafeAreaView, ScrollView, TouchableOpacity, UIManager, View } from "react-native";
import { Icon, Overlay, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { LATITUDE_DELTA, LONGITUDE_DELTA } from "../UtilityBusiness";
import { CheckLocation, removeVietnameseTones } from "../../../Core/Helper";
import { alertNotify } from "../../../Core/Utility";
import { deviceHeight, deviceWidth } from "../../Home";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import Geolocation from '@react-native-community/geolocation';
import { FlashList } from "@shopify/flash-list";
import _ from 'lodash';
import { AttendantController } from "../../../Controller/AttendantController";
import LinearGradient from "react-native-linear-gradient";
import { decode } from "@googlemaps/polyline-codec";
import filter from 'lodash.filter';
import { TextInput } from "react-native";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
export const ItemLocationDefault = ({ dataProvince, itemTrips, ItemInput, quotaData, dateFilter, config }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [modalConfig, setModalConfig] = useState({ currentItem: {}, listPoint: [], visibleModal: false, currentIndex: -1, isEnoughAddress: false, distanceResult: [] })
    const [locationData, setLocationData] = useState({ latStart: 0, longStart: 0, latEnd: 0, longEnd: 0, isHaveLocation: false })

    const loadShop = async () => {
        const locationStart = itemTrips.locationStart || '0,0'
        const locationEnd = itemTrips.locationEnd || '0,0'
        const [latStart, longStart] = locationStart.split(",").map(Number);
        const [latEnd, longEnd] = locationEnd.split(",").map(Number);
        locationData.latStart = latStart
        locationData.longStart = longStart
        locationData.latEnd = latEnd
        locationData.longEnd = longEnd
        locationData.isHaveLocation = ((latStart > 0 && latEnd > 0) ? true : false)
    };

    useEffect(() => {
        const _load = loadShop();
        return () => {
            _load;
        };
    }, []);

    const handleSelectItem = (it, idx) => {
        setModalConfig({ ...modalConfig, visibleModal: true })
    }
    const closeModal = () => {
        setModalConfig({ currentItem: {}, visibleModal: false, currentIndex: -1, listPoint: [] })
    }

    return (
        <View style={{ borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, padding: 8, margin: 4 }}>
            <Text style={{ width: '100%', fontWeight: '600', paddingBottom: 8, fontSize: 14, color: appcolor.dark }}>Vị trí điểm đi,điểm đến</Text>

            <TripInfoCard itemTrips={itemTrips} handleSelectItem={handleSelectItem} appcolor={appcolor} />
            <Modal animationType="slide" visible={modalConfig.visibleModal || false}>
                <ViewMapLocation
                    closeModal={closeModal}
                    dataProvince={dataProvince}
                    itemTrips={itemTrips}
                />
            </Modal>
        </View>
    )
}
const TripInfoCard = ({ itemTrips, handleSelectItem, appcolor }) => {
    return (
        <TouchableOpacity
            key={'ButtonShowMap'}
            onPress={handleSelectItem}
            style={{
                width: '100%',
                borderRadius: 12,
                marginBottom: 12,
                shadowOpacity: 0.2,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 4 },
                shadowRadius: 6,
                borderLeftWidth: 5,
                borderLeftColor: '#4CAF50',
            }}
        >
            <LinearGradient
                colors={['#ffffff', '#E3F2FD']}
                style={{ borderRadius: 12, padding: 16 }}
            >
                {!itemTrips.locationStart && !itemTrips.locationEnd &&
                    <Text key={`itemTripLocation`} style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>
                        chọn điểm đi và điểm đến
                    </Text>
                }
                {itemTrips.locationStart && (
                    <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: appcolor.blue }}>🚀 Điểm đi</Text>
                        {itemTrips.addressFrom && <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>{itemTrips.addressFrom}</Text>}
                        <Text style={{ fontSize: 14, color: appcolor.dark, marginTop: 4 }}>{itemTrips.locationStart}</Text>
                    </View>
                )}
                {itemTrips.locationEnd && (
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: appcolor.alert }}>📍 Điểm đến</Text>
                        {itemTrips.addressTo && <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>{itemTrips.addressTo}</Text>}
                        <Text style={{ fontSize: 14, color: appcolor.dark, marginTop: 4 }}>{itemTrips.locationEnd}</Text>
                    </View>
                )}
                {
                    itemTrips.kmValue &&
                    <View style={{ padding: 4, flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: appcolor.alert }}>Khoảng cách : {(itemTrips.kmValue / 1000).toFixed(0)}km</Text>
                        {/* (itemCost.kmValue / 1000).toFixed(0) || 0 */}
                    </View>
                }
            </LinearGradient>
        </TouchableOpacity>
    );
};

const ViewMapLocation = ({ closeModal, dataProvince, itemTrips }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [marker, setMarker] = useState({ "latitude": 0, "latitudeDelta": 0, "longitude": LATITUDE_DELTA, "longitudeDelta": LONGITUDE_DELTA })
    const mapRef = useRef()
    const refRegionList = useRef()
    const refDistrictList = useRef()
    const [typePoint, setTypePoint] = useState('START_POINT')
    const [locationData, setLocationData] = useState({ latStart: 0, longStart: 0, latEnd: 0, longEnd: 0, itemStart: {}, itemEnd: {} })
    const [listDistrict, setListDistrict] = useState([])
    const [itemSelect, setItemSelect] = useState({ provinceSelect: {}, districtSelect: {}, storeSelect: {} })
    const [_mutate, setMutate] = useState(false)
    const [modeOverlay, setModeOverlay] = useState({ visible: false, contentOverlay: '', })
    const [modalConfig, setModalConfig] = useState({ visibleModal: false, distanceResult: [] })
    const [polyline, setPoline] = useState([])
    const [modalStore, setModalStore] = useState({ visibleModal: false, dataStore: [] });
    const [dataItem, setDataItem] = useState({ dataShow: [], dataSelect: {} })

    const handlerRegionChange = (value) => {
        setMarker(value)
    }
    const loadData = () => {
        const locationStart = parseCoordinates(itemTrips.locationStart || '0,0')
        const locationEnd = parseCoordinates(itemTrips.locationEnd || '0,0')

        let dataDistrict = []
        dataProvince.map((it) => {
            const dataByProvince = JSON.parse(it.dataByProvince || '[]')
            dataDistrict = [...dataDistrict, ...dataByProvince]
        })

        const indexStart = dataDistrict.findIndex(it => (it.latitude == locationStart.latitude && it.longitude == locationStart.longitude) || it.address == itemTrips.addressFrom)
        const indexEnd = dataDistrict.findIndex(it => (it.latitude == locationEnd.latitude && it.longitude == locationEnd.longitude) || it.address == itemTrips.addressTo)

        const provinceSelect = dataProvince.filter((it) => it.provinceCode == dataDistrict[typePoint == 'START_POINT' ? indexStart : indexEnd]?.provinceCode)
        const dataDistrictByProvince = JSON.parse(provinceSelect[0]?.dataByProvince || '[]')

        itemSelect.provinceSelect = provinceSelect[0] || {}
        itemSelect.districtSelect = dataDistrict[typePoint == 'START_POINT' ? indexStart : indexEnd] || {}

        locationData.itemStart = { ...dataDistrict[indexStart], latitude: dataDistrict[indexStart]?.latitude || locationStart.latitude, longitude: dataDistrict[indexStart]?.longitude || locationStart.longitude } || {}
        locationData.itemEnd = { ...dataDistrict[indexEnd], latitude: dataDistrict[indexEnd]?.latitude || locationEnd.latitude, longitude: dataDistrict[indexEnd]?.longitude || locationEnd.longitude } || {}

        modalConfig.distanceResult = itemTrips.movingSteps

        const dataDistrictGroup = _.unionBy(dataDistrictByProvince, 'districtCode');
        setListDistrict(dataDistrictGroup || [])
    }

    const loadDataState = async () => {
        if (modalConfig.distanceResult?.length > 0) {
            await AddMarker(modalConfig.distanceResult)
        }
    }

    const parseCoordinates = (coordString) => {
        const [lat, lon] = coordString.split(",").map(Number);
        return { latitude: lat, longitude: lon };
    };

    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        loadData()
        getMyLocation()
        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        loadDataState()
        return () => { isMounted = false }
    }, [modalConfig.distanceResult])

    const decodePolyline = (codePoint) => {
        const arrDecode = decode(codePoint)
        let arrPoint = []
        for (let i = 0; i < (arrDecode?.length || 0); i++) {
            const [lat, lng] = arrDecode[i];
            arrPoint.push(
                { latitude: lat, longitude: lng }
            )
        }
        return arrPoint
    }

    const AddMarker = (dataMaps) => {
        let polygon = []
        for (let i = 0; i < (dataMaps?.length || 0); i++) {
            const itemi = dataMaps[i];
            const dataStepItem = itemi.steps
            for (let j = 0; j < dataStepItem.length; j++) {
                const itemj = dataStepItem[j];
                const codePoint = itemj.polyline?.points || ''
                // 
                if (codePoint.length > 0) {
                    const pointEncode = decodePolyline(codePoint)
                    for (let k = 0; k < pointEncode.length; k++) {
                        const itemk = pointEncode[k];
                        polygon.push({ ...itemk })
                    }
                } else {
                    polygon.push({ latitude: itemj.start_location.lat, longitude: itemj.start_location.lng })
                }
            }
        }
        setPoline(polygon)
    }

    const getMyLocation = async () => {
        await CheckLocation(() => {
            Geolocation.getCurrentPosition((position) => {
                setMarker({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                })
                mapRef?.current.animateToRegion({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                })

                if (Object.keys(locationData.itemStart)?.length > 0 && locationData.itemStart.latitude && locationData.itemStart.longitude) {
                    moveLocation(locationData.itemStart, 'NEW')
                } else if (Object.keys(locationData.itemEnd).length > 0 && locationData.itemEnd.latitude && locationData.itemEnd.longitude) {
                    moveLocation(locationData.itemEnd, 'NEW')
                }
            })
        })
    }

    const handlerSelectTag = async (item, index, key) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        try {
            refRegionList?.current?.scrollToIndex({
                index: index > 4 ? 4 : index,
                animated: true
            });
        } catch (e) {
            console.log(e, 'ScrollToIndex');
        }
        const dataByProvince = JSON.parse(item.dataByProvince || "[]")
        const dataDistrict = _.unionBy(dataByProvince, 'districtCode');


        // console.log(dataByProvince, 'check data');
        // console.log(dataItem, 'dataItemdataItemdataItem');

        let isNullLocation = 0
        let itemProvince = dataByProvince[0]
        if (!item.latitude || !item.longitude) {
            isNullLocation = 1
            await onGetAddress(itemProvince.address || `${itemProvince.district},${itemProvince.province}`)
        }

        let itemByIndex

        if (dataByProvince.length == 1) {
            itemByIndex = dataDistrict[0]
            if (isNullLocation == 1 && Object.keys(dataItem.dataSelect)?.length > 0) {
                itemByIndex.latitude = dataItem.dataSelect.geometry.location.lat
                itemByIndex.longitude = dataItem.dataSelect.geometry.location.lng
            }
            itemSelect.districtSelect = itemByIndex
            if (typePoint == 'START_POINT') {
                locationData.itemStart = itemByIndex
                itemTrips.locationStart = `${itemByIndex?.latitude || 0},${itemByIndex?.longitude || 0} `
                itemTrips.addressFrom = itemByIndex?.address || ''
            } else if (typePoint == 'END_POINT') {
                locationData.itemEnd = itemByIndex
                itemTrips.locationEnd = `${itemByIndex?.latitude || 0},${itemByIndex.longitude || 0} `
                itemTrips.addressTo = itemByIndex?.address || ''
            }
            modalConfig.distanceResult = []
            setPoline([])
        } else if (dataByProvince.length > 0) {
            let indexDistrictP = 0
            let indexDistrict = 0
            if (item.latitude && item.longitude) {
                indexDistrictP = dataByProvince.findIndex((it) => it.latitude == item.latitude && it.longitude == item.longitude)
            } else { indexDistrictP = 0 }
            indexDistrict = dataDistrict.findIndex((it) => it.districtCode == dataByProvince[indexDistrictP]?.districtCode && it.longitude == dataByProvince[indexDistrictP]?.longitude)

            itemByIndex = dataByProvince[indexDistrictP]
            if (isNullLocation == 1 && Object.keys(dataItem.dataSelect)?.length > 0) {
                itemByIndex.latitude = dataItem.dataSelect.geometry.location.lat
                itemByIndex.longitude = dataItem.dataSelect.geometry.location.lng
            }
            itemSelect.districtSelect = dataDistrict[indexDistrict]

            if (typePoint == 'START_POINT') {
                locationData.itemStart = itemByIndex
                itemTrips.locationStart = `${itemByIndex?.latitude || 0},${itemByIndex?.longitude || 0} `
                itemTrips.addressFrom = itemByIndex.address || ''
            } else if (typePoint == 'END_POINT') {
                locationData.itemEnd = itemByIndex
                itemTrips.locationEnd = `${itemByIndex?.latitude || 0},${itemByIndex.longitude || 0} `
                itemTrips.addressTo = itemByIndex.address || ''
            }
        }
        // itemSelect.provinceSelect = item
        if (item.latitude && item.longitude && isNullLocation == 1 && Object.keys(dataItem.dataSelect)?.length > 0) {
            item.latitude = dataItem.dataSelect.geometry.location.lat
            item.longitude = dataItem.dataSelect.geometry.location.lng
        }
        itemSelect.provinceSelect = item

        setListDistrict(dataDistrict)
        if ((item.latitude && item.longitude) || (itemByIndex.latitude && itemByIndex.longitude)) {
            moveLocation(itemByIndex);
        }
    };
    const handlerSelectDistrict = (item, index, key) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        try {
            refDistrictList?.current?.scrollToIndex({
                index: index || 0,
                animated: true
            });
        } catch (e) {
            console.log(e, 'ScrollToIndex');
        }

        const dataByProvince = JSON.parse(itemSelect.provinceSelect?.dataByProvince || "[]")
        const dataByDistrict = dataByProvince.filter((it) => it.districtCode == item.districtCode)
        if (dataByDistrict.length > 1) {
            handlePressDetail(dataByDistrict)
        } else {
            if (itemSelect.districtSelect.address !== item.address) {
                itemSelect.districtSelect = item
                if (typePoint == 'START_POINT') {
                    if (locationData.itemStart.latitude !== item.latitude || locationData.itemStart.longitude !== item.longitude) {
                        locationData.itemStart = item
                        itemTrips.locationStart = `${item.latitude},${item.longitude} `
                        itemTrips.addressFrom = item.address || ''
                        modalConfig.distanceResult = []

                        setPoline([])
                    }
                } else if (typePoint == 'END_POINT') {
                    if (locationData.itemEnd.latitude !== item.latitude || locationData.itemEnd.longitude !== item.longitude) {
                        locationData.itemEnd = item
                        itemTrips.locationEnd = `${item.latitude},${item.longitude} `
                        itemTrips.addressTo = item.address || ''
                        modalConfig.distanceResult = []
                        setPoline([])
                    }
                }
                moveLocation(item);
            }
        }
        setMutate(e => !e)
    };
    const handleSelectStore = async (item) => {
        let isNullLocation = 0

        if (!item.latitude || !item.longitude) {
            isNullLocation = 1
            await onGetAddress(item.address || `${item.district},${item.province}`)
        }
        let itemAddress = item
        if (isNullLocation == 1 && Object.keys(dataItem.dataSelect)?.length > 0) {
            itemAddress.latitude = dataItem.dataSelect.geometry.location.lat
            itemAddress.longitude = dataItem.dataSelect.geometry.location.lng
        }
        itemSelect.districtSelect = itemAddress
        if (typePoint == 'START_POINT') {
            locationData.itemStart = itemAddress
            itemTrips.locationStart = `${itemAddress.latitude},${itemAddress.longitude} `
            itemTrips.addressFrom = itemAddress.address
        } else if (typePoint == 'END_POINT') {
            locationData.itemEnd = itemAddress
            itemTrips.locationEnd = `${itemAddress.latitude},${itemAddress.longitude} `
            itemTrips.addressTo = itemAddress.address
        }
        modalConfig.distanceResult = []
        setPoline([])
        moveLocation(itemAddress);
        closeModalStore()
    }
    const toggleOverlay = () => {
        setModeOverlay({ visible: false, contentOverlay: '' })
    }
    const closeModalStore = () => {
        setModalStore({ visibleModal: false, dataStore: [] })
    }

    const onGetAddress = async (search) => {

        if (search !== null && search.length > 5) {
            await AttendantController.DataLocationFromAddress(search, async (dataLocation) => {
                if (dataLocation !== null && dataLocation.length > 0) {
                    dataItem.dataSelect = dataLocation[0]
                    dataItem.dataShow = dataLocation
                } else {
                    dataItem.dataSelect = {}
                    dataItem.dataShow = []
                }
            })
        }
    }

    /** Handle Show Overlay */
    const handlePressDetail = (dataByDistrict) => {
        setModalStore({ visibleModal: true, dataStore: dataByDistrict })
        setMutate(e => !e)
    }

    const renderItemTag = ({ item, index }) => {
        const onPress = () => {
            handlerSelectTag(item, index);
        };
        return (
            <View key={`ma - ${index} `}>
                <TouchableOpacity
                    onPress={onPress}
                    style={{
                        padding: 8, marginVertical: 4, borderRadius: 20,
                        backgroundColor: appcolor.light, marginHorizontal: 5,
                        shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
                        shadowOpacity: 0.5, elevation: 3,
                        backgroundColor: itemSelect.provinceSelect?.provinceCode == item.provinceCode ? appcolor.primary : appcolor.light
                    }}>
                    <Text style={{ color: itemSelect.provinceSelect?.provinceCode == item.provinceCode ? appcolor.white : appcolor.dark, fontWeight: '500' }}>{item.itemName}</Text>
                </TouchableOpacity>
            </View>
        );
    };
    const moveLocation = async (moveInfo, key) => {
        if (key == 'NEW') {
            await setMarker({
                latitude: moveInfo?.latitude,
                longitude: moveInfo?.longitude,
                latitudeDelta: 0.09,
                longitudeDelta: 0.09,
            })
        }
        await mapRef?.current.animateToRegion({
            latitude: moveInfo?.latitude,
            longitude: moveInfo?.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.09,
        });
    };
    const renderItemDistrict = ({ item, index }) => {
        const onPress = () => {
            handlerSelectDistrict(item, index);
        };
        const dataByProvince = JSON.parse(itemSelect.provinceSelect?.dataByProvince || "[]")
        const dataByDistrict = dataByProvince.filter((it) => it.districtCode == item.districtCode)
        return (
            <TouchableOpacity
                key={`ma - ${index} `}
                onPress={onPress}
                style={{

                    padding: 8, marginVertical: 4, borderRadius: 20,
                    backgroundColor: appcolor.light, marginHorizontal: 5,
                    shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
                    shadowOpacity: 0.5, elevation: 3,
                    backgroundColor: itemSelect.districtSelect?.districtCode == item.districtCode ? appcolor.primary : appcolor.light
                }}>
                <Text style={{ color: itemSelect.districtSelect?.districtCode == item.districtCode ? appcolor.white : appcolor.dark, fontWeight: '500' }}>{item.district}</Text>
                <View style={{ width: 18, height: 18, borderRadius: 20, backgroundColor: appcolor.danger, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -2, end: -8 }}>
                    <Text style={{ fontSize: 9, fontWeight: fontWeightBold, color: appcolor.light }}>{dataByDistrict.length}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const handleSelectButton = (type) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (type == 'START_POINT') {
            const indexProvince = dataProvince.findIndex((it) => it.provinceCode == locationData.itemStart?.provinceCode)
            const dataByProvince = JSON.parse(dataProvince[indexProvince]?.dataByProvince || "[]")
            const dataDistrict = _.unionBy(dataByProvince, 'districtCode');
            itemSelect.districtSelect = Object.keys(locationData.itemStart).length > 0 ? locationData.itemStart : {}
            itemSelect.provinceSelect = Object.keys(locationData.itemStart).length > 0 ? dataProvince[indexProvince] : {}
            Object.keys(locationData.itemStart).length > 0 && locationData.itemStart.latitude && locationData.itemStart.longitude ? moveLocation(locationData.itemStart) : getMyLocation()
            setListDistrict(Object.keys(locationData.itemStart).length > 0 && locationData.itemStart.latitude && locationData.itemStart.longitude ? dataDistrict : [])
        } else if (type == 'END_POINT') {
            const indexProvinceEnd = dataProvince.findIndex((it) => it.provinceCode == locationData.itemEnd?.provinceCode)
            const dataByProvince = JSON.parse(dataProvince[indexProvinceEnd]?.dataByProvince || "[]")
            const dataDistrict = _.unionBy(dataByProvince, 'districtCode');
            itemSelect.districtSelect = Object.keys(locationData.itemEnd).length > 0 ? locationData.itemEnd : {}
            itemSelect.provinceSelect = Object.keys(locationData.itemEnd).length > 0 ? dataProvince[indexProvinceEnd] : {}
            Object.keys(locationData.itemEnd).length > 0 && locationData.itemEnd.latitude && locationData.itemEnd.longitude ? moveLocation(locationData.itemEnd) : getMyLocation()
            setListDistrict(Object.keys(locationData.itemEnd).length > 0 && locationData.itemEnd.latitude && locationData.itemEnd.longitude ? dataDistrict : {})
        }
        setTypePoint(type)
    }

    const checkDistancePoint = async () => {
        if (itemTrips.locationStart && itemTrips.locationEnd) {

            const jsonAddress = {
                locationStart: itemTrips.locationStart,
                locationEnd: itemTrips.locationEnd,
                vehicle: 'DRIVING'
            }
            // await setTimeout(async () => {
            await AttendantController.DataWaysFromLocation(jsonAddress, async (dataLocation) => {
                const distanceResult = dataLocation[0].legs

                const itemDistance = distanceResult[0]
                itemTrips.kmValue = itemDistance.distance?.value || 0

                itemTrips.movingSteps = [...distanceResult]
                modalConfig.distanceResult = [...distanceResult]
                await setMutate(e => !e)
            })
            // }, 500)

        } else {
            alertNotify('Vui lòng nhập đủ vị trí điểm đến trước khi xác nhận')
        }
    }

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: appcolor.light }}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ position: 'absolute', top: 8, start: 8, zIndex: 5 }} onPress={() => closeModal()}>
                    <Icon reverse name='arrow-back' size={21} />
                </TouchableOpacity>
                <View style={{ position: 'absolute', top: 8, end: 8, zIndex: 5 }}>
                    <TouchableOpacity onPress={getMyLocation}>
                        <Icon reverse color={appcolor.info} name='location-arrow' type='font-awesome' size={21} />
                    </TouchableOpacity>
                </View>

                <MapView
                    ref={mapRef}
                    style={{ width: '100%', height: '70%' }}
                    provider={PROVIDER_GOOGLE}
                    showsMyLocationButton={false}
                    showsUserLocation
                    getCurrentPosition
                    zoomEnabled
                    scrollingEnabled
                    onRegionChange={handlerRegionChange}>
                    <Marker draggable pinColor={appcolor.red} coordinate={marker} />
                    {
                        polyline.length > 0 &&
                        <Polyline
                            coordinates={polyline}
                            strokeColor="#7F0000" // fallback for when `strokeColors` is not supported by the map-provider
                            strokeColors={[
                                '#7F0000',
                                '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                                '#B24112',
                                '#E5845C',
                                '#238C23',
                                '#7F0000'
                            ]}
                            strokeWidth={6}
                        />
                    }
                </MapView>
                <View style={{ width: '100%', height: '30%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: appcolor.light, justifyContent: 'space-between' }}>
                    <View style={{}}>
                        <View style={{ flexDirection: 'row', padding: 8, paddingTop: 12, justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => handleSelectButton('START_POINT')}
                                style={{
                                    width: '46%', borderRadius: 8, backgroundColor: typePoint == 'START_POINT' ? appcolor.primary : appcolor.surface,
                                    padding: 8, justifyContent: 'center', alignItems: 'center',
                                    shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
                                    shadowOpacity: 0.5, elevation: 3,
                                }}>
                                <Text style={{ color: appcolor.dark, fontWeight: '500', color: typePoint == 'START_POINT' ? appcolor.white : appcolor.dark }}>{'Điểm đi'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelectButton('END_POINT')}
                                style={{
                                    width: '46%', borderRadius: 8, backgroundColor: typePoint == 'END_POINT' ? appcolor.primary : appcolor.surface,
                                    marginLeft: 8, padding: 8, justifyContent: 'center', alignItems: 'center',
                                    shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
                                    shadowOpacity: 0.5, elevation: 3,
                                }}>
                                <Text style={{ color: appcolor.dark, fontWeight: '500', color: typePoint == 'END_POINT' ? appcolor.white : appcolor.dark }}>{'Điểm đến'}</Text>
                            </TouchableOpacity>
                        </View>
                        {
                            ((typePoint == 'START_POINT' && Object.keys(locationData.itemStart).length > 0) || (typePoint == 'END_POINT' && Object.keys(locationData.itemEnd).length > 0)) ?
                                <View style={{ width: '100%', paddingLeft: 12 }}>
                                    <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.primary, padding: 2 }}>Thông tin : {typePoint == 'START_POINT' ? locationData.itemStart?.shopName : locationData.itemEnd?.shopName}</Text>
                                    <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.dark, padding: 2 }}>Địa chỉ : {typePoint == 'START_POINT' ? locationData.itemStart?.address : locationData.itemEnd?.address}</Text>
                                    <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.dark, padding: 2 }}>Vị trí : {typePoint == 'START_POINT' ? `${locationData.itemStart?.latitude || 0},${locationData.itemStart?.longitude || 0} ` : `${locationData.itemEnd?.latitude},${locationData.itemEnd?.longitude} `}</Text>
                                </View> : <View style={{ justifyContent: 'center', width: '100%', padding: 12, alignItems: 'center' }}>
                                    <Text style={{ fontWeight: '600', fontSize: 20, color: appcolor.primary, padding: 2 }}>Chưa có thông tin</Text>
                                </View>
                        }
                    </View>
                    <TouchableOpacity
                        onPress={() => checkDistancePoint()}
                        style={{
                            zIndex: 1000, right: 0, height: 38, padding: 10, borderRadius: 10,
                            margin: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.tomato,
                            shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.5, elevation: 3,
                        }}
                    >
                        <Text style={{ fontWeight: '800', fontSize: 13, color: appcolor.white }}>Tính quãng đường di chuyển</Text>
                    </TouchableOpacity>
                </View>
                {/* <Overlay
                    isVisible={modeOverlay.visible}
                    overlayStyle={{ backgroundColor: appcolor.light, borderRadius: 16, margin: 4, width: deviceWidth * 0.9, maxHeight: deviceHeight * 0.7 }}
                    onBackdropPress={toggleOverlay}
                    animationType={"fade"}
                >
                    {modeOverlay.contentOverlay}
                </Overlay> */}
                <View style={{ position: 'absolute', top: 70, width: '100%', left: 0, right: 0 }}>
                    <FlashList
                        estimatedItemSize={50}
                        ref={refRegionList}
                        key={`dataregionlist`}
                        keyExtractor={(_item, index) => index.toString()}
                        data={dataProvince?.slice(0, 5)}
                        extraData={[dataProvince, itemSelect]}
                        renderItem={renderItemTag}
                        showsVerticalScrollIndicator={false}
                        // ListFooterComponent={
                        //     <TouchableOpacity onPress={handleShowRegion} style={{ padding: 8, marginVertical: 4, borderRadius: 20, backgroundColor: appcolor.light, marginHorizontal: 5, shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.light }}>
                        //         <Text style={{ color: appcolor.dark, fontWeight: '500', color: appcolor.dark }}>{'Thêm...'}</Text>
                        //     </TouchableOpacity>
                        // }
                        showsHorizontalScrollIndicator={false}
                        horizontal
                    />
                    {
                        listDistrict?.length > 0 &&
                        <FlashList
                            estimatedItemSize={200}
                            ref={refDistrictList}
                            key={`dataDistrictlist`}
                            keyExtractor={(_item, index) => index.toString()}
                            data={listDistrict?.slice(0, 5)}
                            extraData={[listDistrict, itemSelect]}
                            renderItem={renderItemDistrict}
                            showsVerticalScrollIndicator={false}
                            // ListFooterComponent={
                            //     <TouchableOpacity onPress={handleShowRegion} style={{ padding: 8, marginVertical: 4, borderRadius: 20, backgroundColor: appcolor.light, marginHorizontal: 5, shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.light }}>
                            //         <Text style={{ color: appcolor.dark, fontWeight: '500', color: appcolor.dark }}>{'Thêm...'}</Text>
                            //     </TouchableOpacity>
                            // }
                            showsHorizontalScrollIndicator={false}
                            horizontal
                        />
                    }
                </View>
            </View>
            <Modal
                animationType="slide"
                visible={modalStore.visibleModal || false}
                transparent={true}
            >
                <ListShop
                    dataByDistrict={modalStore.dataStore}
                    itemSelect={itemSelect}
                    closeModalStore={closeModalStore}
                    handleSelectStore={handleSelectStore}
                />
            </Modal>
        </SafeAreaView >
    )
}
const ListShop = ({ dataByDistrict, itemSelect, closeModalStore, handleSelectStore }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataDistrict, setDataDistrict] = useState({ dataMain: [], dataMainF: [] })
    const [_mutate, setMutate] = useState(false)
    const [query, setQuery] = useState('');

    const loadData = () => {
        dataDistrict.dataMain = [...dataByDistrict]
        dataDistrict.dataMainF = [...dataByDistrict]
        setMutate(e => !e)
    }
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        loadData()
        return () => { isMounted = false }
    }, [])

    const contains = (shop, query) => {
        const { shopName, address } = shop;
        let Saddress = removeVietnameseTones(address === null ? address : address.toLowerCase())
        let SshopName = removeVietnameseTones(shopName === null ? shopName : shopName.toLowerCase())
        //
        if (SshopName?.includes(query) || Saddress?.includes(query)) {
            return true;
        }
        return false;
    };

    const handleSearch = (text) => {
        const formattedQuery = removeVietnameseTones(text).toLowerCase();
        const filteredData = filter(dataDistrict.dataMainF, shop => { return contains(shop, formattedQuery) })
        dataDistrict.dataMain = filteredData
        setQuery(text)
    };

    const checkSelect = (item) => {
        if ((item.latitude || 0) !== 0 && ((item.longitude || 0) !== 0) && ((itemSelect.districtSelect.latitude == item.latitude && itemSelect.districtSelect.longitude == item.longitude) || (itemSelect.districtSelect.address == item.address))) {
            return true
        } else if (itemSelect.districtSelect.address == item.address && itemSelect.districtSelect.latitude !== 0 && itemSelect.districtSelect.longitude !== 0 && !item.latitude && !item.longitude) {
            return true
        } else return false
    }

    return (
        <TouchableOpacity onPress={() => closeModalStore()} activeOpacity={1} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ height: deviceHeight * 0.7, width: deviceWidth * 0.9, backgroundColor: appcolor.light, borderRadius: 24 }}>
                <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 20, fontWeight: '600', color: appcolor.primary }}>Cửa hàng</Text>
                <TextInput
                    placeholder="Tìm kiếm của hàng..."
                    value={query}
                    // autoFocus
                    onChangeText={handleSearch}
                    placeholderTextColor={appcolor.greydark}
                    style={{
                        width: "95%", height: 50, paddingLeft: 55, marginBottom: 15,
                        borderRadius: 30, opacity: 0.8, marginLeft: 10,
                        color: appcolor.dark, padding: 10, marginTop: 8,
                        backgroundColor: appcolor.homebackground,
                    }}
                />
                <ScrollView style={{ flex: 1, padding: 12 }} >
                    {
                        dataDistrict.dataMain.length > 0 && dataDistrict.dataMain.map((it, idx) => {
                            const isSelect = checkSelect(it)
                            return (
                                <TouchableOpacity
                                    key={it.latitude + ',' + it.longitude + '_' + idx}
                                    activeOpacity={isSelect ? 1 : 0.5}
                                    onPress={isSelect ? null : () => handleSelectStore(it)}
                                    style={{
                                        margin: 4, padding: 12, marginVertical: 8,
                                        backgroundColor: isSelect ? appcolor.primary : appcolor.surface, borderRadius: 8, shadowColor: appcolor.dark,
                                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
                                        shadowRadius: 4, elevation: 3,
                                    }}
                                >
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: isSelect ? appcolor.white : appcolor.primary }}>Cửa hàng: {it.shopName}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: isSelect ? appcolor.white : appcolor.dark }}>Địa chỉ: {it.address}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: isSelect ? appcolor.white : appcolor.dark }}>Vị trí: {it.latitude || (isSelect ? itemSelect.districtSelect.latitude || 0 : 0)}, {it.longitude || (isSelect ? itemSelect.districtSelect.longitude || 0 : 0)}</Text>
                                </TouchableOpacity>
                            )
                        })}
                </ScrollView>
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => closeModalStore()}
                        style={{
                            justifyContent: 'center', alignItems: "center", width: deviceWidth * 0.6,
                            borderRadius: 20, backgroundColor: appcolor.surface, padding: 10,
                        }}
                    >
                        <Text style={{ color: appcolor.dark }}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )
}
