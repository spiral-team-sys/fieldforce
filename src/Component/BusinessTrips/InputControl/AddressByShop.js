
import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, LayoutAnimation, ScrollView, Text, TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";
import { useSelector } from "react-redux";
import _ from 'lodash'
import { Modal } from "react-native";
import { removeVietnameseTones } from "../../../Core/Helper";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import { deviceHeight, deviceWidth } from "../../Home";
import { AttendantController } from "../../../Controller/AttendantController";
import { Icon } from '@rneui/themed';
import { TYPE } from "../UtilityBusiness";

export const AddressByShop = ({ itemTrips, titleName, placeholder, isRequire, dataProvince, quotaData, isUseMainStore = false, handleSelectItem, typeItem, reload }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [listProvinceData, setListProvinceData] = useState({ dataMain: dataProvince || [], isShowProvince: false })
    const refRegionList = useRef()
    const refDistrictList = useRef()
    const [itemSelect, setItemSelect] = useState({ provinceSelect: {}, districtSelect: {}, storeSelect: {} })
    const [listDistrict, setListDistrict] = useState()
    const [modalStore, setModalStore] = useState({ visibleModal: false, dataStore: [] });
    const [dataItem, setDataItem] = useState({ dataShow: [], dataSelect: {} })
    const [_mutate, setMutate] = useState(false)
    const [itemLocation, setItemLocation] = useState({})

    const handleSelectProviceData = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        listProvinceData.isShowProvince = listProvinceData.isShowProvince ? false : true
        setMutate(e => !e)
    }

    const renderItemTag = ({ item, index }) => {
        const onPress = () => {
            handlerSelectTag(item, index);
        };
        if (isUseMainStore && item.isMainStore !== 1) return <View key={`ma - ${index} `} />
        return (
            <View key={`ma - ${index} `}>
                <TouchableOpacity
                    onPress={onPress}
                    style={{
                        padding: 8, marginVertical: 4, borderRadius: 20, minWidth: 100,
                        backgroundColor: appcolor.light, marginHorizontal: 5, justifyContent: 'center', alignItems: 'center',
                        shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
                        shadowOpacity: 0.5, elevation: 3,
                        backgroundColor: itemSelect.provinceSelect?.provinceCode == item.provinceCode ? appcolor.primary : appcolor.light
                    }}>
                    <Text style={{ color: itemSelect.provinceSelect?.provinceCode == item.provinceCode ? appcolor.white : appcolor.dark, fontWeight: '500' }}>{item.itemName}</Text>
                </TouchableOpacity>
            </View>
        );
    };
    const handlerSelectTag = async (itemP, indexP, key) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        try {
            refRegionList?.current?.scrollToIndex({
                index: indexP > 4 ? 4 : indexP,
                animated: true
            });
        } catch (e) {
            console.log(e, 'ScrollToIndex');
        }
        const dataByProvince = JSON.parse(itemP.dataByProvince || "[]")
        let dataDistrict = _.unionBy(dataByProvince, 'districtCode');

        if (isUseMainStore) {
            dataDistrict = dataDistrict.filter(i => i.IsMainStore === 1);
        }

        itemSelect.provinceSelect = itemP
        setListDistrict(dataDistrict)
    };
    const renderItemDistrict = ({ item, index }) => {
        const onPress = () => {
            handlerSelectDistrict(item, index);
        };
        const dataByProvince = JSON.parse(itemSelect.provinceSelect?.dataByProvince || "[]")
        const dataByDistrict = _.filter(dataByProvince, (it) => it.districtCode == item.districtCode && ((isUseMainStore && it.IsMainStore == 1) || !isUseMainStore))
        return (
            <View style={{ padding: 8 }}>
                <TouchableOpacity
                    key={`dis - ${index}`}
                    onPress={onPress}
                    style={{
                        padding: 8, borderRadius: 20,
                        backgroundColor: appcolor.light, justifyContent: 'center', alignItems: 'center',
                        shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
                        shadowOpacity: 0.5, elevation: 3, maxWidth: 200,
                        backgroundColor: itemSelect.districtSelect?.districtCode == item.districtCode ? appcolor.primary : appcolor.light
                    }}>
                    <Text style={{ color: itemSelect.districtSelect?.districtCode == item.districtCode ? appcolor.white : appcolor.dark, fontWeight: '500' }}>{item.district}</Text>
                    <View style={{ width: 18, height: 18, borderRadius: 20, backgroundColor: appcolor.danger, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -4, end: 0 }}>
                        <Text style={{ fontSize: 9, fontWeight: fontWeightBold, color: appcolor.light }}>{dataByDistrict.length}</Text>
                    </View>
                </TouchableOpacity>
            </View>

        );
    };
    const handlerSelectDistrict = async (itemD, indexD, key) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        try {
            refDistrictList?.current?.scrollToIndex({
                index: indexD || 0,
                animated: true
            });
        } catch (e) {
            console.log(e, 'ScrollToIndex');
        }

        const dataByProvince = JSON.parse(itemSelect.provinceSelect?.dataByProvince || "[]")
        const dataByDistrict = dataByProvince.filter((it) => it.districtCode == itemD.districtCode)
        if (dataByDistrict.length > 1) {
            handlePressDetail(dataByDistrict)
        } else {
            handleSelectStore(itemD)
        }
        setMutate(e => !e)
    };
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
    const handleSelectStore = async (itemD) => {

        itemSelect.districtSelect = itemD
        let isNullLocation = 0

        if (!itemD.latitude || !itemD.longitude) {
            isNullLocation = 1
            await onGetAddress(itemD.address || `${itemD.district},${itemD.province}`)
        }

        itemLocation.shopName = itemD.shopName
        itemLocation.addressPoint = itemD.address || `${itemD.district},${itemD.province}`
        itemLocation.distance = 0
        itemLocation.province = itemD.province
        itemLocation.provinceCode = itemD.provinceCode
        itemLocation.district = itemD.district
        itemLocation.districtCode = itemD.districtCode
        itemLocation.distanceText = null

        if (isNullLocation == 1 && Object.keys(dataItem.dataSelect)?.length > 0) {
            itemLocation.locationPoint = `${dataItem.dataSelect.geometry.location.lat || 0},${dataItem.dataSelect.geometry.location.lng || 0}`
        } else {
            itemLocation.locationPoint = `${itemD?.latitude || 0},${itemD?.longitude || 0}`
        }
        await modalStore.visibleModal == true && await closeModalStore()
        await handleSelectProviceData()
        await handleSelectItem(itemLocation, typeItem)
        await setMutate(e => !e)
    }
    const handlePressDetail = (dataByDistrict) => {
        setModalStore({ visibleModal: true, dataStore: dataByDistrict })
        setMutate(e => !e)
    }
    const closeModalStore = () => {
        setModalStore({ visibleModal: false, dataStore: [] })
    }

    const loadDataProvince = async () => {
        switch (typeItem) {
            case TYPE.PROVINCE_FROM:
                itemLocation.shopName = itemTrips.shopStartName
                itemLocation.addressPoint = itemTrips.addressFrom || ((itemTrips.districtFrom || itemTrips.provinceFrom) ? `${itemTrips.districtFrom},${itemTrips.provinceFrom}` : null)
                itemLocation.province = itemTrips.provinceFrom
                itemLocation.provinceCode = itemTrips.provinceCodeFrom
                itemLocation.district = itemTrips.districtFrom
                itemLocation.districtCode = itemTrips.districtCodeFrom
                itemLocation.locationPoint = itemTrips.locationStart
                break;
            case TYPE.PROVINCE_TO:
                itemLocation.shopName = itemTrips.shopEndName
                itemLocation.addressPoint = itemTrips.addressTo || ((itemTrips.districtTo || itemTrips.provinceTo) ? `${itemTrips.districtTo},${itemTrips.provinceTo}` : null)
                itemLocation.province = itemTrips.provinceTo
                itemLocation.provinceCode = itemTrips.provinceCodeTo
                itemLocation.district = itemTrips.districtTo
                itemLocation.districtCode = itemTrips.districtCodeTo
                itemLocation.locationPoint = itemTrips.locationEnd
                break;
            default:
                itemLocation.shopName = itemTrips.shopName
                itemLocation.addressPoint = itemTrips.addressPoint || ((itemTrips.district || itemTrips.province) ? `${itemTrips.district},${itemTrips.province}` : null)
                itemLocation.province = itemTrips.province
                itemLocation.provinceCode = itemTrips.provinceCode
                itemLocation.district = itemTrips.district
                itemLocation.districtCode = itemTrips.districtCode
                itemLocation.locationPoint = itemTrips.locationPoint
                break;
        }

        await setListProvinceData({ dataMain: dataProvince || [], isShowProvince: false })
    }

    useEffect(() => {
        loadDataProvince()
        return
    }, [dataProvince, reload])

    return (
        <View key={`${typeItem}_ViewItem`} style={{ width: '100%' }}>
            {titleName &&
                <View style={{ width: '100%', flexDirection: 'row', padding: 8 }}>
                    <Icon name={'map-marker-alt'} type="font-awesome-5" size={15} color={appcolor.blacklight} />
                    <Text style={{ width: '100%', fontSize: 13, fontWeight: '700', color: appcolor.blacklight, marginStart: 8 }}>{`${titleName} `}
                        {isRequire && <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>}
                    </Text>
                </View>
            }
            {
                placeholder && <Text style={{ width: '100%', fontSize: 13, fontWeight: '300', color: appcolor.placeholderText, marginStart: 4, marginBottom: 4, fontStyle: 'italic' }}>{`${placeholder} `}</Text>
            }
            <View style={{ width: '100%', backgroundColor: appcolor.transparent }}>
                <TouchableOpacity key={`${typeItem}_button`} onPress={() => handleSelectProviceData()} style={{
                    width: isUseMainStore ? '96%' : '80%', padding: 8, justifyContent: 'center',
                    flexDirection: 'row', marginVertical: 4, marginHorizontal: 8, borderRadius: 8,
                    shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.info,
                    shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }
                }}>
                    <Text style={{ fontWeight: '700', textAlign: 'center', fontSize: 14, color: appcolor.white }}>{listProvinceData.isShowProvince ? 'Đóng' : 'Mở danh sách'}</Text>
                </TouchableOpacity>
                {
                    listProvinceData.isShowProvince == true && listProvinceData.dataMain?.length > 0 &&
                    <View style={{ width: '100%' }}>
                        <FlatList
                            ref={refRegionList}
                            key={`dataregionlist`}
                            keyExtractor={(_item, index) => _item.provinceCode + index.toString()}
                            data={dataProvince}
                            renderItem={renderItemTag}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            horizontal
                        />
                        {
                            listDistrict?.length > 0 &&
                            <FlatList
                                ref={refDistrictList}
                                key={`dataDistrictlist`}
                                keyExtractor={(_item, index) => _item.provinceCode + _item.districtCode}
                                data={listDistrict}
                                renderItem={renderItemDistrict}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                horizontal
                            />
                        }
                    </View>
                }
                {
                    itemLocation.addressPoint &&
                    <View
                        key={itemLocation.locationPoint}
                        style={{
                            margin: 4, padding: 12, marginVertical: 8,
                            backgroundColor: appcolor.surface, borderRadius: 8, shadowColor: appcolor.dark,
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
                        }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: appcolor.primary }}>Cửa hàng: {itemLocation.shopName}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '500', color: appcolor.dark }}>Địa chỉ: {itemLocation.addressPoint}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '500', color: appcolor.dark }}>Vị trí: {itemLocation.locationPoint}</Text>
                    </View>
                }
            </View>
            <Modal
                animationType="slide"
                visible={modalStore.visibleModal || false}
                transparent={true}
            >
                <ListShop
                    key={`ListShop_Modal_${typeItem}`}
                    dataByDistrict={modalStore.dataStore || []}
                    itemSelect={itemSelect}
                    typeItem={typeItem}
                    isUseMainStore={isUseMainStore}
                    closeModalStore={closeModalStore}
                    handleSelectStore={handleSelectStore}
                />
            </Modal>

        </View>
    )


}
const ListShop = ({ dataByDistrict, itemSelect, typeItem, isUseMainStore, closeModalStore, handleSelectStore }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataDistrict, setDataDistrict] = useState({ dataMain: [], dataMainF: [] })
    const [_mutate, setMutate] = useState(false)
    const [query, setQuery] = useState('');

    const loadData = () => {
        dataDistrict.dataMain = dataByDistrict.length > 0 ? [...dataByDistrict] : []
        dataDistrict.dataMainF = dataByDistrict.length > 0 ? [...dataByDistrict] : []
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
        const filteredData = _.filter(dataDistrict.dataMainF, shop => { return contains(shop, formattedQuery) })
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
        <TouchableOpacity onPress={() => closeModalStore()} activeOpacity={1} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', }}>
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
                <ScrollView key={`ListShopModal_${typeItem}`} style={{ flex: 1, padding: 12 }} >
                    {
                        dataDistrict.dataMain.length > 0 && dataDistrict.dataMain.map((it, idx) => {
                            const isSelect = checkSelect(it)
                            if (isUseMainStore == true && it.IsMainStore !== 1) return <View key={it.latitude + ',' + it.longitude + '_' + idx}></View>
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
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: isSelect ? appcolor.white : appcolor.dark }}>Vị trí: {it.latitude || (isSelect ? itemSelect.districtSelect?.latitude || 0 : 0)}, {it.longitude || (isSelect ? itemSelect.districtSelect.longitude || 0 : 0)}</Text>
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






