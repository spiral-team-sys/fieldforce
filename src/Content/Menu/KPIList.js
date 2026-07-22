import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GetPhotosCheckIn } from "../../Controller/PhotoController";
import { GetEmployeeInfo, getStore, saveStore, ToastError, Token } from "../../Core/Helper";
import { AppNameBuild, MENU_KPI, TRAINEEKEY } from "../../Core/URLs";
import { Icon } from "@rneui/themed";
import { updateSettingBy } from "../../Controller/WorkController";
import CustomListView from "../../Control/Custom/CustomListView";
import { GetMenuKPI } from "../../Controller/UserController";
import KPIDefault from "./Page/KPI/KPIDefault";
import DeviceInfo from "react-native-device-info";
import base64 from 'react-native-base64'
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { SetKpiInfo } from "../../Redux/action";
import WebViewScreen from "../../Control/Webview/WebViewScreen";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { fontWeightBold } from "../../Themes/AppsStyle";
import { insets } from "../../Core/Utility";
import SheetKPI from "../Attendance/control/SheetKPI";

const KPIList = ({ }) => {
    const { appcolor, shopinfo, workinfo } = useSelector(state => state.GAppState)
    const [dataMenu, setDataMenu] = useState([])
    const [displayKpi, setDisplayKpi] = useState(0)
    const [traineeURL, setTraineeURL] = useState(null)
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const dispatch = useDispatch()
    //
    const LoadData = async (workSelected) => {
        const listMenu = await GetMenuKPI(1, shopinfo, workSelected || workinfo)
        await setDataMenu(listMenu)
    }
    const onChangeDisplayMenu = async () => {
        await updateSettingBy(4, displayKpi === 1 ? 0 : 1)
        await setDisplayKpi(displayKpi === 0 ? 1 : 0)
        let menukpi = await getStore(MENU_KPI)
        if (menukpi !== undefined) {
            await saveStore(MENU_KPI, displayKpi === 0 ? '1' : '0')
        }
    }
    const validateCheckIn = async () => {
        const valid = await GetPhotosCheckIn(workinfo.shopId, workinfo.workDate, 1)
        return valid;
    }
    const onPressItem = async (item) => {
        await validateCheckIn().then(async valid => {
            if (valid.length === 0 && item.fistTask === 1 && shopinfo?.isAnotherRoute !== 1) {
                ToastError('Vui lòng check in trước khi làm báo cáo.', "Chấm công", "top")
                return
            }
            let token = await Token()
            const employeeInfo = await GetEmployeeInfo()
            const deviceId = await DeviceInfo.getUniqueId()
            if (item.pageName !== null) {
                if (item.pageName.includes('traninee')) {
                    const shareKey = {
                        'LoginID': TRAINEEKEY,
                        'AccountId': employeeInfo.accountId,
                        'EmployeeId': employeeInfo.employeeId,
                        'DeviceId': deviceId,
                    }
                    const appShare = await base64.encode(JSON.stringify(shareKey))
                    SheetManager.show('webview_kpi_sheet', { payload: { url: item.reportItem + appShare, title: item.menuNameVN } })
                } else if (item.reportItem !== null && item.reportItem.includes('https')) {
                    const shareInfo = {
                        employeeId: employeeInfo.employeeId,
                        employeeName: employeeInfo.employeeName,
                        accountId: employeeInfo.accountId,
                        typeId: employeeInfo.typeId,
                        loginName: employeeInfo.loginName,
                        mobile: employeeInfo.mobile,
                        menuId: item.id,
                        deviceId: deviceId,
                        AppId: AppNameBuild,
                        shopId: shopinfo.shopId,
                        token: token
                    }
                    const app_access = await base64.encode(JSON.stringify(shareInfo))
                    SheetManager.show('webview_kpi_sheet', { payload: { url: item.reportItem + app_access, title: item.menuNameVN } })
                } else {
                    dispatch(SetKpiInfo(item))
                    navigation.navigate(item.pageName, { workinfo: workinfo, titlePage: item.name, reportId: item.kpiId })
                }
            } else {
                ToastError('Chức năng chưa được phân quyền')
            }
        })
    }
    const onHideTrainee = () => {
        SheetManager.hide('webview_kpi_sheet')
    }
    //
    useEffect(() => {
        const reload_workload = DeviceEventEmitter.addListener('WORK_LOAD', LoadData)
        LoadData()
        return () => {
            reload_workload.remove()
        }
    }, [isFocused])
    //
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        headerContainer: { width: '100%', backgroundColor: appcolor.primary, flexDirection: 'row', alignItems: 'center' },
        displayMenuButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingLeft: 15 },
        title: { flexShrink: 1, padding: 12, color: appcolor.light, fontSize: 14, fontWeight: fontWeightBold },
        kpiSheetButton: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
        contentContainer: { flex: 1, padding: 8 },
        bottomView: { paddingBottom: Math.max(112, insets().bottom + 80) }
    })
    const componentMap = {

    }
    const renderItem = ({ item, index }) => {
        const onPress = () => onPressItem(item)
        return (
            <SelectedComponent
                item={item}
                index={index}
                onPress={onPress}
                displayKpi={displayKpi}
            />
        )
    }
    const SelectedComponent = componentMap[AppNameBuild] || KPIDefault
    return (
        <View style={styles.mainContainer}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.displayMenuButton} activeOpacity={0.8} onPress={onChangeDisplayMenu}>
                    <Icon type="ionicon" name={displayKpi === 0 ? 'grid-outline' : 'list-outline'} size={24} color={appcolor.light} />
                    <Text numberOfLines={1} style={styles.title}>Báo cáo {moment(workinfo?.workDate, 'YYYYMMDD').format('ddd, DD/MM/YYYY')}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
                <CustomListView
                    key={displayKpi ? 'list' : 'grid'}
                    data={dataMenu}
                    renderItem={renderItem}
                    bottomView={styles.bottomView}
                    numColumns={displayKpi === 0 ? 3 : 1}
                    keyExtractor={(_, index) => index.toString()}
                />
            </View>
            <ActionSheet id="webview_kpi_sheet" onBeforeShow={setTraineeURL} closable={false} closeOnPressBack={false}>
                <WebViewScreen
                    pageName={traineeURL?.pageName}
                    urlPage={traineeURL?.urlPage}
                    onClose={onHideTrainee}
                />
            </ActionSheet>
            <SheetKPI />
        </View>
    )
}

export default KPIList;
