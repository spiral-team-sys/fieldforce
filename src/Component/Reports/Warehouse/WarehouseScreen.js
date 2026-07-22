import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon } from '@rneui/themed';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { alertConfirm } from "../../../Core/Utility";
import { REPORT } from "../../../API/ReportAPI";
import { ToastError, ToastSuccess } from "../../../Core/Helper";
import { getDataByReport, removeRawReport } from "../../../Controller/ReportController";
import { LoadingView } from "../../../Control/ItemLoading";
import { ScreenListWarehouse } from "./Page/ScreenListWarehouse";
import { ScreenListResult } from "./Page/ScreenListResult";
import { deviceHeight } from "../../../Themes/AppsStyle";
import _ from 'lodash';
import { toastSuccess } from "../../../Utils/configToast";

const WarehouseScreen = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const [isUploading, setUploading] = useState(false)
    const [_mutate, setMutate] = useState(false)
    //
    const LoadData = async () => {
        const itemFilter = { reportId: kpiinfo.id, shopId: shopinfo.shopId }
        await REPORT.GetDataReportByShop(itemFilter, async (_mData, message) => {
            message && ToastError(message, 'Thông báo', 'top')
            setMutate(e => !e)
        })
    }
    const UploadData = async () => {
        const _valid = await onValidData()
        if (!_valid)
            return
        alertConfirm('Gửi dữ liệu', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await setUploading(true)
            const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id)
            if (result.statusId == 200) {
                toastSuccess('Thông báo', result.messager)
                await removeRawReport(shopinfo.shopId, kpiinfo.id)
                await LoadData()
            } else {
                ToastError(result.messager, 'Lỗi dữ liệu', 'top')
            }
            await setUploading(false)
        })
    }
    // Handler
    const onValidData = async () => {
        const result = await getDataByReport(shopinfo.shopId, kpiinfo.id)
        const _isData = _.filter(result.data, (e) => e.WareType !== undefined && e.WareType !== null)
        // 
        if (_isData == null || _isData.length == 0) {
            ToastError('Vui lòng nhập dữ liệu đầy đủ trước khi gửi dữ liệu lên hệ thống', 'Dữ liệu trống', 'top')
            return false
        }
        return true
    }
    const onBack = () => {
        navigation.goBack()
    }
    const onClosePlus = () => {
        SheetManager.hide('plus-warehouse')
        setMutate(e => !e)
    }
    //
    useEffect(() => {
        let isMounted = true
        if (isMounted) LoadData()
        else return
        return () => {
            isMounted = false
        }
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        contentMain: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        opacityView: { width: '100%', height: '100%', position: 'absolute', zIndex: 2, top: 0, backgroundColor: appcolor.light, opacity: 0.8 },
        loadingView: { width: '100%', height: '90%', justifyContent: 'center', position: 'absolute', zIndex: 3 },
        viewApply: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', position: 'absolute', bottom: 24, backgroundColor: appcolor.red, borderRadius: 50 },
        actionClose: { alignSelf: 'center' }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight='cloud-upload-alt'
                leftFunc={onBack}
                rightFunc={UploadData}
            />
            {/* // Warehouse List */}
            <View style={styles.contentMain}>
                {isUploading && <View style={styles.opacityView} />}
                <LoadingView isLoading={isUploading} title='Đang gửi dữ liệu lên hệ thống' styles={styles.loadingView} />
                <ScreenListResult key={`result-list`} isReload={_mutate} />
            </View>
            {/* // Action Plus */}
            <ActionSheet id="plus-warehouse" drawUnderStatusBar={Platform.OS == 'ios'}>
                <View style={styles.contentWareList}>
                    <ScreenListWarehouse key={`warehoust-list`} isReload={_mutate} />
                </View>
                <TouchableOpacity style={styles.viewApply} onPress={onClosePlus}>
                    <Icon type='ionicon' name='close-outline' color={appcolor.light} size={24} />
                </TouchableOpacity>
            </ActionSheet>
        </View>
    )
}
export default WarehouseScreen;