import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { REPORT } from "../../../API/ReportAPI";
import { toastError } from "../../../Utils/configToast";
import { SearchData } from "../../../Control/SearchData/SearchData";
import CustomListView from "../../../Control/Custom/CustomListView";
import { Text, Image } from "@rneui/base";
import { LoadingView } from "../../../Control/ItemLoading";
import { SetKpiInfo, SetShopInfo } from "../../../Redux/action";
import { checkLinkType } from "../../../Core/Helper";
import { fontWeightBold } from "../../../Themes/AppsStyle";

const ShopPermissionScreen = ({ navigation, route }) => {
    const { menuitem } = route.params || {}
    const { appcolor } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const dispatch = useDispatch()

    const LoadData = async () => {
        setLoading(true)
        const params = { reportId: menuitem.id, typeReport: "SHOP_PERMISSION" }
        await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
            message && toastError('Thông báo', message);
            setData(mData || [])
            setDataMain(mData || [])
        })
        setLoading(false)
    }

    const onSearchData = (text) => {
        if (!text || text.trim() === '') {
            setData(dataMain)
            return
        }
        const keyword = text.trim().toLowerCase()
        const filtered = dataMain.filter(item =>
            item.shopName?.toLowerCase().includes(keyword) ||
            item.shopCode?.toLowerCase().includes(keyword) ||
            item.address?.toLowerCase().includes(keyword) ||
            item.provinceName?.toLowerCase().includes(keyword) ||
            item.districtName?.toLowerCase().includes(keyword)
        )
        setData(filtered)
    }

    const onShopPress = async (item) => {
        await dispatch(SetKpiInfo(menuitem));
        await dispatch(SetShopInfo(item))
        navigation.navigate(menuitem.pageName)
    }

    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { flexDirection: 'row', margin: 8, marginTop: 0, padding: 8, backgroundColor: appcolor.white, borderRadius: 12, borderWidth: 1, borderColor: appcolor.surface, overflow: 'hidden', alignItems: 'center' },
        overview: { width: 100, alignItems: 'center' },
        infoView: { width: '72%' },
        imageStyle: { borderRadius: 100, width: 80, height: 80, resizeMode: 'cover', marginEnd: 8 },
        titleName: { fontSize: 13, color: appcolor.dark, fontWeight: fontWeightBold },
        subTitleName: { fontSize: 12, color: appcolor.greylight },
        loadingView: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(255,255,255,0.5)' }
    })

    const renderItem = ({ item, index }) => {
        const onPress = () => onShopPress(item)
        return (
            <TouchableOpacity key={index} style={styles.itemContainer} onPress={onPress}>
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
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={'Danh sách cửa hàng'}
                leftFunc={onBack}
            />
            <SearchData
                placeholder={'Tìm kiếm cửa hàng'}
                onSearchData={onSearchData}
            />
            <LoadingView isLoading={isLoading} styles={styles.loadingView} />
            <CustomListView
                data={data}
                extraData={data}
                renderItem={renderItem}
                onRefresh={LoadData}
            />
        </View>
    )
}

export default ShopPermissionScreen;