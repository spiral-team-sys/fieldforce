import React, { useCallback, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { WorkController } from "../../../Controller/WorkController";
import { SetReport } from "../../../Redux/action";
import { SheetManager } from "react-native-actions-sheet"
// Page 
import { ShopProfile } from "../ShopProfile";
import { GO_OVERVIEW } from "../../../Core/URLs";
import CustomTab from "../../../Control/Custom/CustomTab";
import WorkPage from "./Page/WorkPage";
import WorkHistory from "./Page/WorkHistory";
import WorkShopInfo from "./Page/WorkShopInfo";
//
import _ from "lodash";

const WorkScreen = ({ navigation }) => {
    const { appcolor, shopinfo } = useSelector(state => state.GAppState)
    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const dispatch = useDispatch()
    const refTab = useRef(null)
    const dataGroup = [
        { name: "Cửa hàng" },
        { name: "Công việc" },
        { name: "Thống kê" },
        { name: "Lịch sử" }
    ]
    // 
    const LoadData = async () => {
        const workinfo = await WorkController.createWorkTemplate(shopinfo)
        dispatch(SetReport(workinfo))
        onChangeTab(1)
    }
    const onReloadWork = () => {
        onChangeTab(1)
    }
    const onBack = () => {
        navigation.goBack()
    }
    const onShowTaskToday = () => {
        SheetManager.show('kpi-sheet')
    }
    const onChangeTab = useCallback((index) => {
        refTab?.current?.setIndex(index)
        setCurrentTabIndex(index)
    }, [])
    //
    useEffect(() => {
        const goOverviewListener = DeviceEventEmitter.addListener(GO_OVERVIEW, () => { onChangeTab(0) });
        LoadData()
        return () => {
            goOverviewListener.remove();
        };
    }, [])
    //
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.primary },
        contentMain: { flex: 1, backgroundColor: appcolor.light },
        contentPage: { width: '100%', height: '100%' }
    })
    const renderTabContent = (item) => {
        switch (item.name) {
            case "Cửa hàng":
                return <WorkShopInfo navigation={navigation} />
            case "Công việc":
                return <WorkPage navigation={navigation} />
            case "Thống kê":
                return <ShopProfile navigation={navigation} />
            case "Lịch sử":
                return <WorkHistory onSelectedTab={onReloadWork} />
            default:
                return null
        }
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={shopinfo.shopName}
                rightType='ionicon'
                iconRight={currentTabIndex == 1 ? 'list-outline' : null}
                rightFunc={currentTabIndex == 1 && onShowTaskToday}
                leftFunc={onBack}
            />
            <View style={styles.contentMain}>
                <CustomTab
                    tabRef={refTab}
                    keyTabName="name"
                    data={dataGroup}
                    dataMain={[]}
                    scrollEnabled={false}
                    onTabChange={({ index }) => setCurrentTabIndex(index)}
                    renderItem={renderTabContent}
                />
            </View>
        </View>
    )
}
export default WorkScreen;
