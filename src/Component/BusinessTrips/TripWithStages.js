import React, { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, View, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { AutoCompleteAddress } from "./AutoCompleteAddress";
import { TYPE } from "./UtilityBusiness";
import { Text } from "react-native";
import { Message } from "../../Core/Helper";
import { SafeAreaView } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from "react-native-maps";
import { AttendantController } from "../../Controller/AttendantController";
import { isDecimal } from "geolib";
import { deviceHeight, isValid } from "../../Core/Utility";
import FormGroup from "../../Content/FormGroup";

const itemDefault = {
    startPosition: null,
    endPosition: null,
    latitudeStart: null,
    longitudeStart: null,
    latitudeEnd: null,
    longitudeEnd: null,
    eatDay: null,
    numberDay: null,
    distance: 0,
    id: null
}
const DETAL_LOCATION = 0.08

export const TripWithStages = ({ itemTrips, ItemInput, }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataShow, setDataShow] = useState([])
    const [numStages, setNumStages] = useState('')
    const [modalConfig, setModalConfig] = useState({ currentItem: {}, visibleModal: false, currentIndex: -1 })

    useEffect(() => {
        const stageList = itemTrips.provinceList
        if (isValid(stageList) && stageList.length > 0) {
            setNumStages(stageList.length?.toString())
            setDataShow(stageList)
        }
        return () => false
    }, [])

    const changeNumStages = (text, typeItem) => {
        if (typeItem == TYPE.TYPE_NUM_STAGES) {
            setNumStages(text)
        }
    }
    const configDataShow = (itemValue) => {
        const currentList = itemTrips.provinceList
        let listArr = []
        for (let i = 0; i < itemValue; i++) {
            const itemById = currentList.filter(it => it.id == i)
            if (itemById.length > 0) {
                listArr.push({ ...itemById[0] })
            } else {
                listArr.push({
                    ...itemDefault,
                    id: i
                })
            }
        }
        itemTrips.provinceList = listArr || []
        setDataShow(listArr)
    }
    const onPress = (typeFilter, itemValue) => {
        if (typeFilter == TYPE.TYPE_NUM_STAGES && numStages != (itemTrips.provinceList?.length || 0)) {
            if (itemValue > 1) {
                if (itemValue > 5) {
                    Message('Chú ý', 'Số chặng đường lớn hơn 5, bạn có chắc muốn tạo ?', () => {
                        configDataShow(itemValue)
                    });
                } else {
                    configDataShow(itemValue)
                }
            }
        }
    }
    const handleSelectItem = (it, idx) => {
        setModalConfig({ currentItem: it, visibleModal: true, currentIndex: idx })
    }
    const closeModal = () => {
        setModalConfig({ currentItem: {}, visibleModal: false, currentIndex: -1 })
    }
    const handleSaveChange = (dataStage) => {
        if (modalConfig.currentIndex !== -1) {
            const newData = [...dataShow]; // Tạo một bản sao mới của mảng
            newData[modalConfig.currentIndex] = dataStage; // Thay thế object thứ 2 bằng object T
            itemTrips.provinceList = newData
            setDataShow(newData);
            closeModal()
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <ItemInput
                // isRequire
                key={`${TYPE.TYPE_NUM_STAGES}`}
                titleName='Số chặng đường'
                placeholder='Tổng số chặng đường phải đi'
                iconName='comment'
                typeFilter={TYPE.TYPE_NUM_STAGES}
                itemValue={numStages.toString()}
                iconRightName={'check'}
                onActionRight={onPress}
                onChangeText={changeNumStages}
                keyboardType={'number-pad'}
            />


            {
                dataShow.length > 1 &&
                <View style={{ flex: 1, margin: 8, borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, padding: 4 }}>
                    {
                        dataShow.map((it, idx) => {
                            return (
                                <View key={'ViewStages_' + it.id} style={{}}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark, padding: 4, width: '80%' }}>Chặng thứ : {it.id + 1}</Text>
                                        {
                                            it.distance > 0 &&
                                            <View style={{ width: '20%', justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>{it.distance}</View>
                                        }
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleSelectItem(it, idx)}
                                        key={'itemStages_' + it.id} style={{ padding: 4, borderRadius: 4, margin: 2, backgroundColor: appcolor.surface, flexDirection: 'row' }}>

                                        <View style={{ width: '100%', borderRadius: 4 }}>
                                            <View style={{ width: '100%', flexDirection: "row", paddingBottom: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.startPosition !== null ? appcolor.dark : appcolor.tomato }}>{it.startPosition !== null ? 'Điểm bắt đầu : ' : 'Chưa có điểm bắt đầu'}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.startPosition}</Text>}</Text>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: "row", paddingBottom: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.endPosition !== null ? appcolor.dark : appcolor.tomato }}>{it.endPosition !== null ? 'Điểm kết thúc : ' : 'Chưa có điểm kết thúc'}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.endPosition}</Text>}</Text>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: "row" }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Thông tin lưu trú : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Đêm lưu trú : {it.numberDay || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ngày ăn : {it.eatDay || 0}</Text>}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                    }
                </View>
            }
            <Modal animationType="slide" visible={modalConfig.visibleModal || false}>
                <ViewCreateStage closeModal={closeModal} modalConfig={modalConfig} handleSaveChange={handleSaveChange} />
            </Modal>
        </View>
    )
}

const ViewCreateStage = ({ closeModal, modalConfig, handleSaveChange }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [markets, setMarket] = useState([]);
    const [polyline, setPoline] = useState([]);
    const mapRef = useRef(null);
    const [defaultLocation, setLocationDef] = useState({
        latitude: 10.7880143,
        longitude: 106.6984652,
        latitudeDelta: DETAL_LOCATION,
        longitudeDelta: DETAL_LOCATION,
    })
    const [itemStage, setItemStage] = useState(modalConfig.currentItem)
    const [_, setMutate] = useState(false)

    const loadDataState = () => {
        AddMarker(itemStage)
    }

    useEffect(() => {
        const _load = loadDataState()
        return () => _load
    }, [])

    const handlerAddressChoose = async (text, typeItem, location) => {
        let dataStage = {}
        if (typeItem == TYPE.PROVINCE_FROM)
            dataStage = { ...itemStage, startPosition: text, locationStart: location }
        // await setItemStage({ ...itemStage, startPosition: text, locationStart: location })
        if (typeItem == TYPE.PROVINCE_TO)
            dataStage = { ...itemStage, endPosition: text, locationEnd: location }
        // await setItemStage({ ...itemStage, endPosition: text, locationEnd: location })

        await setItemStage(dataStage)
        await AddMarker(dataStage)
    }
    const searchAddress = async (typeFilter, textValue) => {
        await setTimeout(async () => {
            await AttendantController.DataLocationFromAddress(textValue, async (dataLocation) => {
                await setDataShow(dataLocation)
            })
        }, 500)
    }

    const AddMarker = (dataState) => {

        let mkList = []
        let polygon = []
        let _point = {}
        if (dataState?.locationStart != null && dataState?.locationStart != undefined) {
            const [latitudeStart, longitudeStart] = dataState.locationStart?.split(',');
            const floatLatitudeStart = parseFloat(latitudeStart)
            const floatLongtitudeStart = parseFloat(longitudeStart)

            if (floatLatitudeStart !== null && isDecimal(floatLatitudeStart) && isDecimal(floatLongtitudeStart)) {
                polygon.push({ latitude: floatLatitudeStart, longitude: floatLongtitudeStart })
                _point = { latitude: floatLatitudeStart, longitude: floatLongtitudeStart }
                mkList.push(<Marker key={'Start'}
                    // onPress={() => onClickMarker(mk)}
                    coordinate={{ latitude: floatLatitudeStart, longitude: floatLongtitudeStart }}
                    pinColor={appcolor.danger} // any color
                    title={dataState.locationStart}
                    description={dataState.startPosition}>
                </Marker>
                )
            }
        }
        if (dataState?.locationEnd !== null && dataState?.locationEnd != undefined) {
            const [latitudeEnd, longitudeEnd] = dataState.locationEnd.split(',');
            const floatLatitudeEnd = parseFloat(latitudeEnd)
            const floatLongtitudeEnd = parseFloat(longitudeEnd)
            if (floatLatitudeEnd !== null && isDecimal(floatLatitudeEnd) && isDecimal(floatLongtitudeEnd)) {
                polygon.push({ latitude: floatLatitudeEnd, longitude: floatLongtitudeEnd })
                _point = { latitude: floatLatitudeEnd, longitude: floatLongtitudeEnd }
                mkList.push(<Marker key={'End'}
                    // onPress={() => onClickMarker(mk)}
                    coordinate={{ latitude: floatLatitudeEnd, longitude: floatLongtitudeEnd }}
                    pinColor={appcolor.danger} // any color
                    title={dataState.locationEnd}
                    description={dataState.endPosition}>
                </Marker>
                )
            }
        }
        setPoline(polygon)
        setMarket(mkList);
    }

    const onEditValue = (value) => {
        itemStage.numberDay = parseInt(value || 0)
        setMutate(e => !e)
    }
    const onEditEatValue = (value) => {
        itemStage.eatDay = parseInt(value || 0)
        setMutate(e => !e)
    }
    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: appcolor.light }}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ width: 80, zIndex: 1000, borderWidth: 0.5, borderColor: appcolor.primary, backgroundColor: appcolor.light, padding: 8, borderRadius: 5, position: 'absolute', end: 12, top: 4 }} onPress={() => closeModal()}>
                    <Text style={{ color: appcolor.primary, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>ĐÓNG</Text>
                </TouchableOpacity>
                <View style={{ width: '100%', justifyContent: "space-between", zIndex: 10, marginTop: 20 }}>
                    <ScrollView >
                        <AutoCompleteAddress
                            isRequire
                            titleName='Địa chỉ điểm đi'
                            placeholder='Địa chỉ bắt đầu xuất phát'
                            iconName='map-marker-alt'
                            itemValue={itemStage.startPosition}
                            typeFilter={TYPE.PROVINCE_FROM}
                            searchAction={searchAddress}
                            onChooseItem={handlerAddressChoose}
                        />
                        <AutoCompleteAddress
                            isRequire
                            titleName='Địa chỉ điểm đến'
                            placeholder='Địa chỉ check in xa nhất của chặng công tác'
                            iconName='map-marker-alt'
                            itemValue={itemStage.endPosition}
                            typeFilter={TYPE.PROVINCE_TO}
                            searchAction={searchAddress}
                            onChooseItem={handlerAddressChoose}
                        />
                        <Text style={{ width: '100%', paddingHorizontal: 8, color: appcolor.info, textAlign: 'left', fontWeight: '700', }}>Thông tin lưu trú</Text>
                        <View key={`ViewStageDay`} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', padding: 5 }}>

                            <FormGroup
                                selectTextOnFocus={true}
                                keyboardType="numeric"
                                containerStyle={{ width: '45%', borderRadius: 8, marginBottom: 0, padding: 0, backgroundColor: 'transparent' }}
                                inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
                                editable
                                defaultValue={itemStage.numberDay?.toString() || null}
                                placeholder={`Lưu trú`}
                                useClearAndroid={false}
                                handleChangeForm={onEditValue}
                            />
                            <FormGroup
                                selectTextOnFocus={true}
                                keyboardType="numeric"
                                containerStyle={{ width: '45%', borderRadius: 8, marginBottom: 0, padding: 0, marginStart: 8, backgroundColor: 'transparent' }}
                                inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
                                editable
                                defaultValue={itemStage.eatDay?.toString() || null}
                                placeholder={`Ngày ăn`}
                                useClearAndroid={false}
                                handleChangeForm={onEditEatValue}
                            />
                        </View>
                        <View style={{ width: '100%', padding: 8, height: deviceHeight * 0.5 }}>
                            <MapView
                                style={{ flex: 1, marginBottom: 0, borderRadius: 8 }}
                                zoomEnabled={true}
                                provider={PROVIDER_GOOGLE}
                                getCurrentPosition={true}
                                ref={mapRef}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                                scrollingEnabled={true}
                                zoomControlEnabled={true}
                                initialRegion={defaultLocation}>
                                {markets}
                                {
                                    polyline.length > 0 &&
                                    <Polygon
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
                        </View>
                        <View style={{ height: 150, width: '100%' }} />
                    </ScrollView>
                    {
                        itemStage.startPosition !== undefined && itemStage.startPosition !== null && itemStage.startPosition !== '' &&
                        <TouchableOpacity onPress={() => handleSaveChange(itemStage)}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, padding: 10, borderRadius: 10, borderColor: appcolor.white, borderWidth: 1, margin: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.tomato }}
                        >
                            <Text style={{ fontWeight: '800', fontSize: 13, color: appcolor.white }}>Xác nhận lưu</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </SafeAreaView>
    )
}

