import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, View, DeviceEventEmitter } from "react-native";
import { GetDataDashboardByShop } from '../../Controller/DashboardController';
import { useSelector } from 'react-redux';
import { DashboardSellOut } from '../Dashboard/DashboardSellOut';
import { DashboardSellOutByMonth } from '../Dashboard/DashboardSellOutByMonth';
import { DashboardSellin } from '../Dashboard/DashboardSellin';
import { DashboardDisplay } from '../Dashboard/DashboardDisplay';
import { DashboardInventory } from '../Dashboard/DashboardInventory';
import { DashboardPromotion } from '../Dashboard/DashboardPromotion';
import { DashboardWorkingPlan } from '../Dashboard/DashboardWorkingPlan';
import { LoadingView } from '../../Control/ItemLoading';
import { DashboardDisplayCompetitor } from '../Dashboard/DashBoardDisplayCompetitor';
import { DashboardIssue } from '../Dashboard/DashboardIssue';
import { DashboardOOS } from '../Dashboard/DashboardOOS';
import { DashboardFrequency } from '../Dashboard/DashboardFrequency';
import { DashboardSellInByMonth } from '../Dashboard/DashboardSellInByMonth';
import { DashboardSynthesis } from '../Dashboard/DashboardSynthesis';
import { DashboardInventoryTarget } from '../Dashboard/DashboardInventoryTarget';
import { DashboardDisplayShare } from '../Dashboard/Display/DashboardDisplayShare';
import { DashboardDisplayShareByType } from '../Dashboard/Display/DashboardDisplayShareByType';
import { DashboardListOOS } from '../Dashboard/OOS/DashboardListOOS/DashboardListOOS';
import DashboardSellOutByWeek from '../Dashboard/Teka/DashboardSellOutByWeek';
import DashboardStoreSummary from '../Dashboard/DashboardStoreSummary';
import { deviceHeight } from '../../Core/Utility';
import CustomListView from '../../Control/Custom/CustomListView';

export const ShopProfile = ({ navigation }) => {
    const { shopinfo, appcolor } = useSelector(state => state.GAppState)
    const [dashboardData, setDashboardData] = useState([])
    const [loading, setLoading] = useState(false)
    const LoadData = async () => {
        await setLoading(true)
        await GetDataDashboardByShop(shopinfo.shopId, async (mData) => {
            await setDashboardData(mData)
        })
        await setLoading(false)
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.surface, padding: 8 },
        viewData: { flex: 1, margin: 8, marginTop: 0 }
    })
    useEffect(() => {
        const _updatealldata = DeviceEventEmitter.addListener('loadDataDashboard', () => {
            LoadData()
        })
        LoadData()
        return () => {
            _updatealldata.remove()
        }
    }, [])
    const renderItem = ({ item, index }) => {
        switch (item.pageName) {
            case 'STORE_SUMMARY':
                return <DashboardStoreSummary key={'STORE_SUMMARY' + index} info={item} navigation={navigation} isReload={loading} />
            case 'WORKINGPLAN':
                return <DashboardWorkingPlan key={'WORKINGPLAN_' + index} info={item} sendNavigate={navigation} />
            case 'SELLOUT':
            case 'SELLOUT_HIEND':
                return <DashboardSellOut key={'SELLOUT_' + item.pageName + index} info={item} sendNavigate={navigation} />
            case 'SELLOUT_BYMONTH':
            case 'SELLOUT_HIEND_BYMONTH':
                return <DashboardSellOutByMonth key={'SELLOUT_BYMONTH_' + item.pageName + index} info={item} sendNavigate={navigation} />
            case 'SELLIN':
                return <DashboardSellin key={'SELLIN_' + index} info={item} sendNavigate={navigation} />
            case 'SELLIN_BYMONTH':
                return <DashboardSellInByMonth key={'SELLIN_BYMONTH' + index} info={item} sendNavigate={navigation} />
            case 'DISPLAY':
                return <DashboardDisplay key={'DISPLAY_' + index} info={item} sendNavigate={navigation} />
            case 'INVENTORY':
                return <DashboardInventory key={'INVENTORY_' + index} info={item} sendNavigate={navigation} />
            case 'INVENTORY_TARGET':
                return <DashboardInventoryTarget key={'INVENTORY_TARGET_' + index} info={item} sendNavigate={navigation} />
            case 'PROMOTION':
                return <DashboardPromotion key={'PROMOTION_' + index} info={item} sendNavigate={navigation} />
            case 'ISSUE':
                return <DashboardIssue key={'ISSUE_' + index} info={item} sendNavigate={navigation} />
            case 'DISPLAY_COMPETITOR':
                return <DashboardDisplayCompetitor key={'DASHBOARD_DISPLAY_COMPETITOR_' + index} info={item} sendNavigate={navigation} />
            case 'FREQUENCY':
                return <DashboardFrequency key={'FREQUENCY_' + index} info={item} sendNavigate={navigation} />
            case 'SYNTHESIS_REPORT':
                return <DashboardSynthesis key={'SYNTHESIS_REPORT_' + index} info={item} sendNavigate={navigation} />
            case 'DISPLAY_SHARE':
                return <DashboardDisplayShare key={`DISPLAY_SHARE_${index}`} info={item} navigation={navigation} isReload={loading} />
            case 'DISPLAYSHARE_BYTYPE':
                return <DashboardDisplayShareByType key={`DISPLAYSHARE_BYTYPE_${index}`} info={item} navigation={navigation} />
            case 'OOS_GROUP':
                return <DashboardListOOS key={'OOS_GROUP_' + index} info={item} navigation={navigation} />
            case 'SELLOUT_BYWEEK':
                return <DashboardSellOutByWeek key={'SELLOUT_BYWEEK_' + index} info={item} navigation={navigation} viewHeight={deviceHeight / 2} />
            case 'OOS':
                return <DashboardOOS key={'OOS_' + index} info={item} sendNavigate={navigation} />
        }
    }
    return (
        <View style={styles.mainContainer}>
            <LoadingView title='Đang cập nhật dữ liệu' isLoading={loading} styles={{ zIndex: 1 }} />
            <CustomListView
                data={dashboardData}
                extraData={dashboardData}
                renderItem={renderItem}
                onRefresh={LoadData}
            />
        </View>
    )
}
