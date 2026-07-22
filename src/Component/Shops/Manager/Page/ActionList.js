import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "@rneui/base";
import { colorDashboardHex, UUIDGenerator } from "../../../../Core/Helper";
import { checkAddWork } from "../../../../Controller/WorkController";
import moment from "moment";
import { SetKpiInfo, SetReport, SetShopInfo } from "../../../../Redux/action";
import CustomListView from "../../../../Control/Custom/CustomListView";

const ActionList = ({ navigation, data, info, onExplainStore }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_mutate, setMutate] = useState(false)
    const dispatch = useDispatch()
    const dataAction = useMemo(() => {
        const listAction = Array.isArray(data) ? [...data] : []
        if (info?.isExplanStore == 1) {
            listAction.push({
                itemCode: 'EXPLAIN_STORE',
                itemName: 'Giải trình',
                isLocalAction: true
            })
        }
        return listAction
    }, [data, info?.isExplanStore])

    // Handler
    const handlerPressItem = async (item) => {

        switch (item.itemCode) {
            case 'EXPLAIN_STORE':
                onExplainStore && onExplainStore(info)
                break
            case 'SHOW_DASHBOARD':
                action_ShowDashboard()
                break
            // case 'INSTORE_SHARE':
            //     await action_Report(item)
            //     break
            // case 'SELLOUT':
            //     await action_Report()
            //     break
            case 'SHOW_SUMMARY':
                action_Summary()
                break
            case 'UPDATE_INFO':
                navigation.navigate(item.pageName ? item.pageName : 'updatestore', { shopinfo: info })
                break
            case 'PHOTO_DISPLAY':
                await action_ReportPicture()
                break
            case 'INSTORE_SHARE':
            case 'SELLOUT':
            default:
                action_Report(item)
                break;
            // case 'ANOTHER_ROUTE':
            //     navigation.navigate('ShopPage', { shopInfo: info })
            //     break
            // case 'REPORT':
            //     break
        }
    }
    // Action
    const action_ShowDashboard = () => {
        dispatch(SetShopInfo(info))
        navigation.navigate("profileshops");
    }
    const action_Report = async (item) => {
        if (item.pageName) {
            const itemMenu = JSON.parse(item?.dataMenu || '[]')[0] || {}
            const params = {
                shopId: info.shopId,
                shopName: info.shopName,
                shopCode: info.shopCode,
                address: info.address,
                imageUrl: info.imageUrl,
                workDate: parseInt(moment().format('YYYYMMDD')),
                workTime: moment().format('YYYYMMDDHHmmss'),
                workStatus: 1,
                attendantCount: 2,
                guiid: UUIDGenerator(),
                shopConfig: info.config || '{}'
            }
            const workResult = await checkAddWork(params);
            await dispatch(SetReport(workResult))
            await dispatch(SetShopInfo(info));
            await dispatch(SetKpiInfo(itemMenu));
            await navigation.navigate(item.pageName, { isManageShop: 1 })
        }
    }
    const action_ReportPicture = async () => {
        const params = {
            shopId: info.shopId,
            shopName: info.shopName,
            shopCode: info.shopCode,
            address: info.address,
            imageUrl: info.imageUrl,
            workDate: parseInt(moment().format('YYYYMMDD')),
            workTime: moment().format('YYYYMMDDHHmmss'),
            workStatus: 1,
            attendantCount: 2,
            guiid: UUIDGenerator(),
            shopConfig: info.config || '{}'
        }
        const workResult = await checkAddWork(params);
        await dispatch(SetReport(workResult))
        await dispatch(SetShopInfo(info));
        //
        // const dataKpi = JSON.parse(item.dataKPIByDisplay || '[]')
        // const listReport = JSON.parse(dataKpi[0].reportItem || '{}')
        // await navigation.navigate(item.pageName || 'photobylist', { dataImageList: listReport.ImageByList || [], kpiData: dataKpi[0], isTakeInOther: true })
    }
    const action_Summary = () => {
        dispatch(SetShopInfo(info));
        navigation.navigate('dashboardsummaryssub', { isManageShop: 1 })
    }
    //
    useEffect(() => {
        setMutate(e => !e)
    }, [info])
    //
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', alignItems: 'flex-end' },
        itemContainer: { minWidth: 80, borderRadius: 16, marginStart: 6, marginTop: 4, padding: 8, paddingHorizontal: 12, alignItems: 'center' },
        titleName: { fontSize: 12, fontWeight: '500', color: appcolor.light, textAlign: 'center' }
    })
    const renderItem = ({ item, index }) => {
        const onPress = () => handlerPressItem(item)
        const backgroundColor = item.itemCode === 'EXPLAIN_STORE'
            ? (appcolor.warning || appcolor.primary)
            : (index == 0 ? appcolor.primary : (colorDashboardHex[index] || appcolor.primary))
        return (
            <TouchableOpacity style={{ ...styles.itemContainer, backgroundColor }} onPress={onPress}>
                <Text numberOfLines={1} style={styles.titleName}>{item.itemName}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <CustomListView
                horizontal
                data={dataAction}
                extraData={dataAction}
                renderItem={renderItem}
                endView={{ paddingEnd: 0 }}
            />
        </View>
    )
}

export default ActionList;
