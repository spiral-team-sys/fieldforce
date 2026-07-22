import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import { ScreenListProduct } from "./Views/ScreenListProduct";
import { ScreenListStore } from "./Views/ScreenListStore";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { deviceHeight } from "../../../../Themes/AppsStyle";
import { DescriptionStatus } from "./Views/DescriptionStatus";
import { FilterData } from "./Views/FilterData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SET_SearchData } from "../../../../Redux/action";

export const SummaryList = ({ navigation, route }) => {
    const { appcolor, searchData } = useSelector(state => state.GAppState)
    const [itemProduct, setItemProduct] = useState(false)
    const [heightSheet, setHeightSheet] = useState(deviceHeight / 2)
    const dispatch = useDispatch()

    // Handler
    const onRemoveLocalFiter = async () => {
        await dispatch(SET_SearchData({}))
        await AsyncStorage.removeItem('FILTER_OOS')
    }
    const onBack = () => {
        navigation.goBack()
    }
    const handlerSearch = () => {
        SheetManager.show('oos-filter')
    }
    const handlerReLoadData = async () => {
        DeviceEventEmitter.emit('FILTER_DATA_OOS', searchData)
    }
    //
    useEffect(() => {
        const _removeFilter = onRemoveLocalFiter()
        return () => _removeFilter
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1 },
        contentMain: { flex: 1, backgroundColor: appcolor.light },
        sheetMain: { width: '100%', height: heightSheet },
        sheetFilter: { width: '100%', height: deviceHeight / 1.5 }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={route?.params?.titleGroup}
                leftFunc={onBack}
                iconRight='search'
                rightFunc={handlerSearch}
            />
            <View style={styles.contentMain}>
                <DescriptionStatus key={`description-status`} />
                <ScreenListProduct key={`summary-list-products`} itemGroup={route?.params || {}} />
            </View>
            <ActionSheet id="oos-store" onBeforeShow={setItemProduct}>
                <View style={styles.sheetMain}>
                    <ScreenListStore
                        key={`summary-list-store`}
                        navigation={navigation}
                        itemMain={itemProduct}
                        itemGroup={route?.params || {}}
                        callBack={setHeightSheet}
                    />
                </View>
            </ActionSheet>
            <ActionSheet id="oos-filter" onClose={handlerReLoadData} >
                <View style={styles.sheetFilter}>
                    <FilterData isShowRightButton={true} isShowTitle={true} key='filter-data-oos' />
                </View>
            </ActionSheet>
        </View>
    )
}