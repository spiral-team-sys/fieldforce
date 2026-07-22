import React, { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, View, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { TYPE } from "./UtilityBusiness";
import { Text } from "react-native";
import { Message, formatNumber } from "../../Core/Helper";
import { SafeAreaView } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { AttendantController } from "../../Controller/AttendantController";
import { alertNotify, alertWarning, deviceHeight, isValid } from "../../Core/Utility";
import { MutipleItemSelected } from "../../Control/MutipleItemSelected";
import { ItemTripPointView } from "./ItemTripPoint";
import { Icon } from '@rneui/themed';
import { decode } from "@googlemaps/polyline-codec";
import moment from "moment";
import { AppNameBuild, aquaApp } from "../../Core/URLs";
import { CheckBoxLists } from "./InputControl/CheckBoxLists";
import { deletePhoto } from "../../Controller/PhotoController";


const itemDefault = {
    locationPoint: null,
    addressPoint: null,
    eatDay: null,
    numberDay: null,
    distance: 0,
    id: null
}
const DETAL_LOCATION = 0.08

export const TripWithPoint = ({ itemTrips, ItemInput, quotaData, dateFilter, config, dataProvince }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataShow, setDataShow] = useState([])
    const [numPoints, setNumPoints] = useState('')
    const [modalConfig, setModalConfig] = useState({ currentItem: {}, listPoint: [], visibleModal: false, currentIndex: -1, isEnoughAddress: false, distanceResult: [] })
    const [typeSelect, setTypeSelect] = useState({})
    const [dataVehical, setDataVehical] = useState([])
    const [typeVehicle, setTypeVehicle] = useState([])
    const [dataType, setDataType] = useState([])
    const [listTypeCost, setListTypeCost] = useState([])
    const [_mutate, setMutate] = useState(false)

    const loadData = () => {
        console.log(itemTrips.provinceList, 'itemTrips.provinceListitemTrips.provinceList');

        const listType = quotaData?.listType || []
        const listVehicle = quotaData?.listVehicle || []
        const listTypeCost = quotaData?.listTypeCost || []
        setDataType(listType)
        setTypeSelect(itemTrips.typeAdvance || listType[0])
        setListTypeCost(itemTrips.listTypeCost || listTypeCost)
        itemTrips.typeAdvance = itemTrips.typeAdvance || listType[0]

        setDataVehical(listVehicle)
        setTypeVehicle(itemTrips.typeVehicle || (quotaData.typeVehicleChose == 1 ? [listVehicle[0]] : listVehicle[0]))
        itemTrips.typeVehicle = itemTrips.typeVehicle || (quotaData.typeVehicleChose == 1 ? [listVehicle[0]] : listVehicle[0])

        const pointList = itemTrips.provinceList
        if (isValid(pointList) && pointList.length > 0) {
            setNumPoints(pointList.length?.toString())
            setDataShow(pointList)
        }
    }

    useEffect(() => {
        loadData()
        return () => false
    }, [])

    const changeNumPoints = (text, typeItem) => {
        if (typeItem == TYPE.TYPE_NUM_POINTS) {
            setNumPoints(text)
        }
    }
    const configDataShow = (itemValue) => {
        const currentList = itemTrips.provinceList
        let listArr = []
        for (let i = 0; i < itemValue; i++) {
            const itemById = currentList?.filter(it => it.id == i)
            if (itemById?.length > 0) {
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

        if (typeFilter == TYPE.TYPE_NUM_POINTS && numPoints != (itemTrips.provinceList?.length || 0)) {
            if (itemValue > 5) {
                Message('Chú ý', 'Số chặng đường lớn hơn 5, bạn có chắc muốn tạo ?', () => {
                    configDataShow(itemValue)
                });
            } else {
                configDataShow(itemValue)
            }
        }
    }
    const handleSelectItem = (it, idx) => {
        if (itemTrips.locationStart != null && itemTrips.locationStart != '' && (typeVehicle?.code !== undefined || quotaData.isVehicleEmpty == 1)) {
            itemTrips.isUpdateAdvance = 0
            setModalConfig({ ...modalConfig, visibleModal: true, listPoint: dataShow, distanceResult: itemTrips.movingSteps || [] })
        } else if (!typeVehicle?.code && quotaData.isVehicleEmpty !== 1) {
            alertWarning("Vui lòng chọn phương tiện!")
        } else {
            alertWarning("Vui lòng nhập địa chỉ bắt đầu xuất phát!")
        }
    }
    const closeModal = () => {
        setModalConfig({ currentItem: {}, visibleModal: false, currentIndex: -1, listPoint: [] })
    }
    const handleSaveChange = async (dataStage) => {
        const lstHaveAddress = dataShow.filter(it => it.locationPoint !== null && it.locationPoint !== '')
        if (lstHaveAddress.length == dataShow.length) {
            // let dataAddress = [...dataStage]
            let dataAddress = [...dataStage].sort((a, b) => {
                return a.arrivedDay - b.arrivedDay;
            })
            dataAddress.map((it, idx) =>
                it.keyIndex = idx
            )

            const locationEnd = dataAddress.filter(it => it.id == (dataAddress.length - 1))[0].locationPoint
            const dataWayPoint = dataAddress.filter(it => it.id !== (dataAddress.length - 1))
            const locationPoints = dataWayPoint.map(item => item.locationPoint);
            const locationPointString = (dataAddress.length > 1) ? locationPoints.join('|') : null;

            const jsonAddress = {
                locationStart: itemTrips.locationStart,
                locationEnd: locationEnd,
                wayPoint: quotaData.isFirstPointLastPoint == 1 ? null : locationPointString,
                vehicle: typeVehicle?.code || 'DRIVING'
            }

            await setTimeout(async () => {
                await AttendantController.DataWaysFromLocation(jsonAddress, async (dataLocation) => {

                    if (dataLocation !== null && dataLocation.length > 0) {
                        const distanceResult = dataLocation[0].legs
                        let dataWithDistance = []
                        for (let index = 0; index < dataAddress.length; index++) {
                            const item = dataAddress[index];

                            if (quotaData.isFirstPointLastPoint == 1) {
                                if ((dataAddress.length - 1) == index) {
                                    const itemDistance = distanceResult[0].distance
                                    dataWithDistance.push({
                                        ...item,
                                        distance: itemDistance.value,
                                        distanceText: itemDistance.text,
                                        maxCostVehicle: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.maxCostVehicle > 0 ? item.maxCostVehicle : 0)),
                                        vehicalValue: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.vehicalValue > 0 ? item.vehicalValue : 0))
                                    })
                                    dataShow[index].distance = itemDistance.value
                                    dataShow[index].distanceText = itemDistance.text
                                } else {
                                    const itemDistance = distanceResult[0].distance
                                    dataWithDistance.push({
                                        ...item,
                                        distance: null,
                                        distanceText: null,
                                        maxCostVehicle: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.maxCostVehicle > 0 ? item.maxCostVehicle : 0)),
                                        vehicalValue: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.vehicalValue > 0 ? item.vehicalValue : 0))
                                    })
                                    dataShow[index].distance = null
                                    dataShow[index].distanceText = null
                                }
                            } else if (quotaData.isFirstPointLastPoint != 1) {
                                const itemDistance = distanceResult[index].distance
                                dataWithDistance.push({
                                    ...item,
                                    distance: itemDistance.value,
                                    distanceText: itemDistance.text,
                                    maxCostVehicle: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.maxCostVehicle > 0 ? item.maxCostVehicle : 0)),
                                    vehicalValue: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.vehicalValue > 0 ? item.vehicalValue : 0))
                                })
                                dataShow[index].distance = itemDistance.value
                                dataShow[index].distanceText = itemDistance.text
                            }

                            // const itemDistance = distanceResult[index].distance
                            // dataWithDistance.push({
                            //     ...item,
                            //     distance: itemDistance.value,
                            //     distanceText: itemDistance.text,
                            //     maxCostVehicle: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.maxCostVehicle > 0 ? item.maxCostVehicle : 0)),
                            //     vehicalValue: (quotaData?.kmSup && quotaData?.kmSup > 0 && typeVehicle?.code == 'DRIVING' ? Math.round(quotaData?.kmSup * itemDistance.value / 1000) : (item.vehicalValue > 0 ? item.vehicalValue : 0))
                            // })
                            // dataShow[index].distance = itemDistance.value
                            // dataShow[index].distanceText = itemDistance.text
                        }
                        itemTrips.provinceList = [...dataWithDistance]
                        itemTrips.movingSteps = [...distanceResult]
                        modalConfig.listPoint = [...dataWithDistance]
                        modalConfig.distanceResult = [...distanceResult]
                        await setDataShow([...dataWithDistance])
                        // await setModalConfig({ ...modalConfig, listPoint: [...dataWithDistance] })
                    }
                    //     await setDataShow(dataLocation)
                    // else
                    //     alertNotify('Không tìm thấy địa chỉ, vui lòng kiểm tra lại thông tin và tìm kiếm lại')
                })
            }, 500)
        } else {
            alertNotify('Vui lòng nhập đủ vị trí điểm đến trước khi xác nhận')
        }
        if (modalConfig.currentIndex !== -1) {
            const newData = [...dataShow];
            newData[modalConfig.currentIndex] = dataStage;
            itemTrips.provinceList = newData
            setDataShow(newData);
            closeModal()
        }
        return 1
    }
    const handlerSelectItem = async (item, type) => {
        switch (type) {
            case 'LIST_VEHICAL':
                if (quotaData.typeVehicleChose == 1) {
                    let dataSelectVehcle = [...typeVehicle]
                    if (dataSelectVehcle?.some(it => it.code == item.code)) {
                        dataSelectVehcle = dataSelectVehcle.filter(it => it.code != item.code)
                    } else {
                        dataSelectVehcle.push(item)
                    }


                    itemTrips.typeVehicle = ((dataSelectVehcle?.length || 0) > (quotaData.maxMultiVehicle || 2)) ? [item] : dataSelectVehcle
                    console.log(itemTrips.typeVehicle, 'dataSelectVehcledataSelectVehcle');

                    await setTypeVehicle(((dataSelectVehcle?.length || 0) > (quotaData.maxMultiVehicle || 2)) ? [item] : dataSelectVehcle)
                } else {
                    itemTrips.typeVehicle = item.code
                    await setTypeVehicle(item)
                }
                // }
                // setStoreItem({ ...storeItem, warehouseCode: item.wareHouseCode, warehouseName: item.itemName })
                break
            case 'LIST_TYPE':
                if (itemTrips.typeAdvance && itemTrips.typeAdvance?.code !== item.code) {
                    itemTrips.isUpdateAdvance = 1
                }
                itemTrips.typeAdvance = item
                await setTypeSelect(item)
                break

        }
    }
    const clearDataProvinceList = () => {
        itemTrips.provinceList.forEach(it => {
            it.eatDay = 0
            it.numberDay = 0
            it.vehicalValue = 0
            it.foodCostPoint = 0
            it.nightRestValue = 0
        })
    }
    const handleSelectCheckBox = async (itemCheck, indexCheck, value) => {
        // clear data provinceList khi chọn trong check box
        clearDataProvinceList()
        listTypeCost.forEach(it => {
            (it.id == itemCheck.id
                ? (it.isChoose = value ? 1 : 0)
                : (it.isChoose = 0))

        })
        // xoas ảnh khi uncheck
        const photoByType = JSON.parse(itemTrips?.photoByType || '[]') || []
        const listPhotoByType = photoByType.filter(i => i.photoType === 'Workingschedule_' + itemCheck.fieldCost) || []
        for (let i = 0; i < photoByType.length; i++) {
            const it = photoByType[i]
            if (it.id && it.photoType !== 'Workingschedule_' + itemCheck.fieldCost) {
                await deletePhoto(it)
            }
        }
        itemTrips.photoByType = JSON.stringify(listPhotoByType)
        itemTrips.listTypeCost = listTypeCost
        setListTypeCost(listTypeCost)
        setMutate(e => !e)
    }

    return (
        <View style={{ flex: 1 }}>
            {
                listTypeCost.length > 0 &&
                <CheckBoxLists dataCheck={listTypeCost} handleSelectCheckBox={handleSelectCheckBox} itemTrips={itemTrips} guid={dateFilter.guid} />
            }
            <ItemInput
                isRequire
                key={`${TYPE.TYPE_NUM_POINTS}`}
                titleName='Số điểm đến'
                placeholder='Tổng số điểm đến'
                iconName='comment'
                typeFilter={TYPE.TYPE_NUM_POINTS}
                itemValue={numPoints.toString()}
                iconRightName={'check'}
                onActionRight={onPress}
                onChangeText={changeNumPoints}
                keyboardType={'number-pad'}
            />
            {
                dataType.length > 0 &&
                <MutipleItemSelected
                    isRequire={1}
                    typeItem={'LIST_TYPE'}
                    isFilter={dataType.length > 5}
                    titleName={quotaData?.titleList}
                    // iconName={item.iconName}
                    dataItems={dataType}
                    defaultValue={typeSelect?.itemName || null}
                    onItemChoose={handlerSelectItem}
                />
            }
            {
                dataVehical.length > 0 &&
                <MutipleItemSelected
                    isRequire={1}
                    typeItem={'LIST_VEHICAL'}
                    isFilter={dataVehical.length > 5}
                    titleName={'Phương tiện'}
                    // mulipleChoose={quotaData.typeVehicleChose == 1 || false}
                    // iconName={item.iconName}
                    dataItems={dataVehical}
                    isViewMulti={quotaData.typeVehicleChose == 1 || false}
                    maxMultiSelect={quotaData.maxMultiVehicle || 2}
                    defaultValue={quotaData.typeVehicleChose == 1 ? (typeVehicle || []) : typeVehicle.itemName}
                    onItemChoose={handlerSelectItem}
                />
            }

            {
                dataShow.length > 0 &&
                <TouchableOpacity
                    onPress={() => handleSelectItem()}
                    style={{ flex: 1, margin: 8, borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, padding: 4 }}>
                    <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark, padding: 4, width: '80%' }}>Thông tin chặng đường</Text>
                    {
                        dataShow.map((it, idx) => {
                            return (
                                <View key={'ViewPoint_' + it.id} style={{ borderRadius: 8, backgroundColor: appcolor.surface, padding: 4, marginBottom: 4 }}>
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: "center" }}>
                                        <Text style={{ width: (it.addressPoint == null || it.addressPoint == '') ? '100%' : '50%', fontWeight: '600', fontSize: 12, color: (it.addressPoint == null || it.addressPoint == '') ? appcolor.tomato : appcolor.dark, paddingHorizontal: 4 }}>Điểm {it.id + 1} {it.arrivedDay ? `- ${moment(it.arrivedDay, 'YYYYMMDD').format('DD/MM/YYYY')}` : ''} {(it.addressPoint == null || it.addressPoint == '') ? <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.tomato }}>{': chưa có thông tin'}</Text> : ''}</Text>
                                        {
                                            it.distance !== null && it.distance > 0 &&
                                            <View style={{ justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>
                                                {
                                                    aquaApp == AppNameBuild ?
                                                        <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{Math.round(it.distance / 1000) + ((it.numberStore || 0) * (quotaData.kmDefault || 5))}km</Text>
                                                        :
                                                        <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{it.distanceText}</Text>
                                                }
                                                {/* <Text style={{ color: appcolor.primary, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Tổng khoảng cách tạm tính : {Math.round(it.distance / 1000) + ((it.numberStore || 0) * (quotaData.kmDefault || 5))} km </Text> */}
                                            </View>
                                        }
                                    </View>
                                    {
                                        (it.addressPoint !== null && it.addressPoint !== '') &&
                                        <View style={{ width: '100%', borderRadius: 4 }}>
                                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Địa chỉ :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.addressPoint}</Text>}</Text>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Vị trí :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.locationPoint}</Text>}</Text>
                                            </View>
                                            {
                                                (it.note !== undefined && it.note !== null && it.note !== '' && it.note.length > 0) &&
                                                <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, }}>
                                                    <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Ghi chú :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.note}</Text>}</Text>
                                                </View>
                                            }
                                            {
                                                AppNameBuild == aquaApp &&
                                                <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                                    <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Số lượng cửa hàng : {it.numberStore || 0}</Text>
                                                </View>
                                            }
                                            {
                                                AppNameBuild !== aquaApp &&
                                                <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                                    <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Thông tin lưu trú : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Đêm lưu trú : {it.numberDay || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ngày ăn : {it.eatDay || 0}</Text>}</Text>
                                                </View>
                                            }
                                            {
                                                AppNameBuild !== aquaApp &&
                                                <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 4 }}>
                                                    <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Chi phí : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Khách sạn : {formatNumber(it.nightRestValue, ',') || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ăn uống : {it.foodCostPoint || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Di chuyển : {it.vehicalValue || 0}</Text>}</Text>
                                                </View>
                                            }
                                        </View>
                                    }
                                </View>
                            )
                        })
                    }
                </TouchableOpacity>
            }
            <Modal animationType="slide" visible={modalConfig.visibleModal || false} >
                <ViewCreatePoint
                    closeModal={closeModal} itemTrips={itemTrips}
                    modalConfig={modalConfig} handleSaveChange={handleSaveChange}
                    quotaData={quotaData} typeVehicle={typeVehicle}
                    typeSelect={typeSelect} config={config}
                    dateFilter={dateFilter} dataProvince={dataProvince}
                />
            </Modal>
        </View>
    )
}

const ViewCreatePoint = ({ closeModal, modalConfig, itemTrips, handleSaveChange, typeVehicle, typeSelect, config, quotaData, dateFilter, dataProvince }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [markets, setMarket] = useState([]);
    const [polyline, setPoline] = useState([]);
    const mapRef = useRef(null);
    const [isDisable, setDisable] = useState(false)
    const [defaultLocation, setLocationDef] = useState({
        latitude: 10.7880143,
        longitude: 106.6984652,
        latitudeDelta: DETAL_LOCATION,
        longitudeDelta: DETAL_LOCATION,
    })
    const [itemPoint, setItemPoint] = useState([])
    const [isShowMap, setShowMap] = useState(false)
    const [_, setMutate] = useState(false)

    const loadDataState = async () => {
        await setItemPoint(modalConfig.listPoint)
        if (modalConfig.distanceResult?.length > 0) {
            await AddMarker(modalConfig.distanceResult)
        }
    }

    useEffect(() => {
        const _load = loadDataState()
        return () => _load
    }, [modalConfig.listPoint])


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
        let mkList = []
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
            if (i == (dataMaps.length - 1)) {
                mkList.push(<Marker key={'Point_' + i}
                    // onPress={() => onClickMarker(mk)}
                    coordinate={{ latitude: itemi.start_location.lat, longitude: itemi.start_location.lng }}
                    pinColor={appcolor.danger} // any color
                    title={itemi.start_address}
                // description={dataMaps.startPosition}
                >
                </Marker>)
                mkList.push(<Marker key={'Point_' + i + '_End'}
                    // onPress={() => onClickMarker(mk)}
                    coordinate={{ latitude: itemi.end_location.lat, longitude: itemi.end_location.lng }}
                    pinColor={appcolor.danger} // any color
                    title={itemi.end_address}
                // description={dataMaps.startPosition}
                >
                </Marker>)
            } else {
                mkList.push(<Marker key={'Point_' + i}
                    // onPress={() => onClickMarker(mk)}
                    coordinate={{ latitude: itemi.start_location.lat, longitude: itemi.start_location.lng }}
                    pinColor={appcolor.danger} // any color
                    title={itemi.start_address}
                // description={dataMaps.startPosition}
                >
                </Marker>)
            }

        }

        setPoline(polygon)
        setMarket(mkList);
    }

    const handleCountDistant = async () => {
        await setDisable(true)
        const result = await handleSaveChange(itemPoint)
        await setTimeout(() => {
            setDisable(false)
        }, 2000);
    }

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: appcolor.light }}>
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ width: 80, zIndex: 1000, borderWidth: 0.5, borderColor: appcolor.primary, backgroundColor: appcolor.light, padding: 8, borderRadius: 5, position: 'absolute', end: 12, top: 4 }} onPress={() => closeModal()}>
                    <Text style={{ color: appcolor.primary, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>ĐÓNG</Text>
                </TouchableOpacity>


                <View style={{ width: '100%', justifyContent: "space-between", zIndex: 10, padding: 8, marginTop: 40, display: isShowMap ? 'none' : 'flex' }}>
                    <ScrollView >
                        {
                            itemPoint.map((it, idx) => {
                                return (<ItemTripPointView key={'itemPoint_' + idx} item={it} index={idx} itemPoint={itemPoint} itemTrips={itemTrips} typeVehicle={typeVehicle} typeSelect={typeSelect} config={config} quotaData={quotaData} dateFilter={dateFilter} dataProvince={dataProvince} />)
                            })
                        }
                        <View style={{ height: deviceHeight / 2, width: '100%' }} />
                    </ScrollView>
                </View>
                {
                    isShowMap == true &&
                    <View style={{ width: '100%', padding: 8, borderRadius: 12, height: '90%', borderRadius: 12 }}>
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
                    </View>
                }

                {
                    polyline.length > 0 &&
                    <View style={{
                        position: 'absolute', flexDirection: 'row', flex: 1, right: 50, padding: 4,
                        zIndex: 1000, bottom: 80, justifyContent: 'center', paddingLeft: 12
                    }}>
                        <TouchableOpacity
                            onPress={() => setShowMap(e => !e)}
                            style={{
                                height: 50, width: 50, justifyContent: 'center', backgroundColor: appcolor.light,
                                borderRadius: 40, alignSelf: 'center',
                                shadowColor: appcolor.dark,
                                shadowRadius: 40,
                                shadowOffset: { width: 4, height: 4 },
                                elevation: 4,
                            }}>
                            <Icon
                                color={appcolor.danger}
                                name={isShowMap ? 'close' : 'map'}
                                size={24} />
                        </TouchableOpacity>
                    </View>
                }
                {
                    (typeVehicle?.code == 'DRIVING' || quotaData.isUseGoogleKm == 1) &&
                    <TouchableOpacity onPress={() => handleCountDistant()}
                        disabled={isDisable}
                        style={{ zIndex: 1000, opacity: isDisable ? 0.6 : 1, position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, padding: 10, borderRadius: 10, borderColor: appcolor.white, borderWidth: 1, margin: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.tomato }}
                    >
                        <Text style={{ fontWeight: '800', fontSize: 13, color: appcolor.white }}>Tính quảng đường di chuyển</Text>
                    </TouchableOpacity>
                }
            </View>
        </SafeAreaView>
    )
}
