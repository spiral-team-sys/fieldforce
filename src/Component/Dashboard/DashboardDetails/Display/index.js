import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import { DisplayDetails } from "./DisplayDetails";
import { SheetManager } from 'react-native-actions-sheet'
import { DisplayShareDetails } from "./DisplayShareDetails";
import { FloatActionButton } from "../Controls/FloatActionButton";
import { setDashboardFilter } from "../../../../Redux/action";

export const DashboardDisplayDetails = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const { dashboardFilter } = useSelector(state => state.dashboard)
    const [itemDetails, setItemDetails] = useState({ typeDisplay: null, data: [] })
    const [menu, _setMenu] = useState({ isOpen: false, type: null, isViewProduct: false })
    const [_mutate, setMutate] = useState(false)
    const dispatch = useDispatch()
    console.log('[DashboardDisplayDetails] dashboardFilter:', dashboardFilter)
    //
    const LoadData = async () => {
        await setItemDetails({
            typeDisplay: route?.params?.typeDisplay || null,
            data: route?.params?.data || []
        })
    }
    const onBack = () => {
        navigation.goBack()
    }
    const onShowImage = () => {
        SheetManager.show('detailDashboardPhoto')
    }
    //
    const onActionMenuFAB = async () => {
        switch (menu.type) {
            case 'SORT_GROUP':
                if (!menu.isOpen) {
                    menu.isOpen = false
                    setMutate(e => !e)
                }
                break
            default:
                menu.isOpen = !menu.isOpen
                setMutate(e => !e)
                break
        }
    }
    const handlerChangeFAB = async (type) => {
        switch (type) {
            case "SORT_GROUP":
                onSortData(type)
                break
        }
    }
    const onSortData = async (type) => {
        menu.isOpen = !menu.isOpen
        const value = !menu.isViewProduct
        menu.isViewProduct = value
        setMutate(e => !e)
        //
        const itemFilter = { ...dashboardFilter[`${route?.params?.pageName}`], isViewProduct: value }
        await dispatch(setDashboardFilter({ [`${route?.params?.pageName}`]: itemFilter }))
        await DeviceEventEmitter.emit('RELOAD_DASHBOARD_DETATLS_DISPLAY', itemFilter)
    }
    //
    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        contentMain: { width: '100%', height: '100%', padding: 8 },
        overflowView: { width: '100%', height: '100%', position: 'absolute', zIndex: 1, backgroundColor: appcolor.dark, opacity: 0.65, justifyContent: 'center' },
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title='Chi tiết trưng bày'
                iconRight='images'
                leftFunc={onBack}
                rightFunc={onShowImage}
            />
            {/* // Content Data */}
            <View style={styles.contentMain}>
                {itemDetails.typeDisplay == 'DISPLAYSHARE' ?
                    <DisplayShareDetails key='DISPLAYSHARE_DETAILS' dataDetails={itemDetails.data} />
                    :
                    <DisplayDetails key='DISPLAY_DETAILS' pageName={route?.params?.pageName} masterFilter={route?.params?.dataFilter} />
                }
            </View>

            {menu.isOpen ? <TouchableOpacity style={styles.overflowView} onPress={onActionMenuFAB} /> : <View />}
            <FloatActionButton
                info={menu}
                containerStyle={{ bottom: 8 }}
                showMenu={onActionMenuFAB}
                handlerChange={handlerChangeFAB}
            />
        </View>
    )
}