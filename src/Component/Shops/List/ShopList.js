import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SearchData } from "../../../Control/SearchData/SearchData";
import CustomListView from "../../../Control/Custom/CustomListView";
import { Image, Text } from "@rneui/base";
import { deviceHeight, fontWeightBold } from "../../../Themes/AppsStyle";
import { checkLinkType, distanceBetween2Points, formatNumber, removeVietnameseTones } from "../../../Core/Helper";
import { LOCATION_INFO } from "../../../Utils/LocationInfo";
import { SetShopInfo } from "../../../Redux/action";
import moment from "moment";
import 'moment/locale/vi'

const ShopList = ({ navigation, data }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataShop, setDataShop] = useState([])
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 })
    const dispatch = useDispatch()

    const LoadData = async () => {
        LOCATION_INFO.getCurrentLocation(setLocation)
        setDataShop(data)
    }

    const handlerRefreshData = () => {
        DeviceEventEmitter.emit('REDOWNLOAD_DATA')
        DeviceEventEmitter.emit('RELOAD_DATA_SHOP')
    }

    const handlerPressShop = async (item) => {
        dispatch(SetShopInfo(item))
        navigation.navigate('Work', { shopInfo: item });
    }

    const onSearchData = (text) => {
        const valueSearch = removeVietnameseTones(text || '').toLowerCase()
        if (!valueSearch) {
            setDataShop(data)
            return
        }

        const listUpdate = (data || []).filter((item) => (
            removeVietnameseTones(item?.shopName || '').toLowerCase().match(valueSearch) ||
            removeVietnameseTones(item?.shopCode || '').toLowerCase().match(valueSearch) ||
            removeVietnameseTones(item?.address || '').toLowerCase().match(valueSearch)
        ))
        setDataShop(listUpdate)
    }

    useEffect(() => {
        LoadData()
    }, [data])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light, padding: 8, paddingTop: 0 },
        contentMain: { flex: 1, marginTop: 4 },
        itemMain: {
            flex: 1, backgroundColor: appcolor.light, margin: 8, marginTop: 0, flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 8, borderRadius: 8, borderColor: appcolor.surface,
            shadowColor: appcolor.grey, shadowOffset: { width: 1, height: 0 }, shadowRadius: 3, shadowOpacity: 0.3, elevation: 3
        },
        overview: { width: 100, alignItems: 'center' },
        infoView: { width: '72%' },
        imageStyle: { borderRadius: 100, width: 80, height: 80, resizeMode: 'cover', marginEnd: 8 },
        titleName: { fontSize: 13, color: appcolor.dark, fontWeight: fontWeightBold },
        subTitleName: { fontSize: 12, color: appcolor.greylight },
        subTitleDistance: { fontSize: 12, color: appcolor.redgray },
        subTitleTime: { fontSize: 12, color: appcolor.greylight, position: 'absolute', end: 8, bottom: 0, fontStyle: 'italic' },
        bottomView: { paddingBottom: 64 }
    })

    const renderItem = ({ item, index }) => {
        const onPress = () => handlerPressShop(item)
        const distanceStore = item.latitude > 0 && location?.latitude > 0 ? distanceBetween2Points(location.latitude, location.longitude, item.latitude, item.longitude) : 0
        return (
            <TouchableOpacity key={index} style={styles.itemMain} onPress={onPress}>
                <View style={styles.overview}>
                    <Image
                        source={!item.imageUrl ? require('../../../Themes/Images/store.png') : { uri: checkLinkType(item.imageUrl) }}
                        style={styles.imageStyle}
                        resizeMethod="resize"
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.infoView}>
                    <Text style={styles.titleName}>{item.shopName}</Text>
                    <Text style={styles.subTitleName}>{`ShopCode: ${item.shopCode}`}</Text>
                    <Text style={styles.subTitleName}>{`Địa chỉ: ${item.address}`}</Text>
                    <Text style={styles.subTitleDistance}>{`Khoảng cách ~ ${formatNumber(parseInt(distanceStore), ',')} km`}</Text>
                    <Text style={styles.subTitleTime}>{moment(item.auditDate, "YYYYMMDD").format('dddd D MMMM')}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <SearchData
                placeholder='Tìm kiếm cửa hàng'
                onSearchData={onSearchData}
            />
            <View style={styles.contentMain}>
                <CustomListView
                    data={dataShop}
                    extraData={[dataShop]}
                    renderItem={renderItem}
                    onRefresh={handlerRefreshData}
                    bottomView={styles.bottomView}
                />
            </View>
        </View>
    )
}

export default ShopList;