import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from '@rneui/themed';
import ActionSheet from 'react-native-actions-sheet';
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { REPORT } from "../../../API/ReportAPI";
import { SearchData } from "../../../Control/SearchData/SearchData";
import CustomTab from "../../../Control/Custom/CustomTab";
import { toastError } from "../../../Utils/configToast";
import _ from 'lodash';
import { Message, ToastError, ToastSuccess, isNotInteger, removeVietnameseTones } from "../../../Core/Helper";
import { checkNetwork } from "../../../Core/Utility";
import { checkLockReport } from "../../../Controller/ShopController";
import { deleteDataRaw, itemUploaded, saveJsonData } from "../../../Controller/ReportController";
import { getStockProduct } from "../../../Controller/StockOutController";
import { Text } from "@rneui/base";
import CustomListView from "../../../Control/Custom/CustomListView";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import FormGroup from "../../../Content/FormGroup";
import { LoadingView } from "../../../Control/ItemLoading";

const InventoryReportScreen = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(state => state.GAppState)
    const reportId = kpiinfo.id || kpiinfo.kpiId
    const reportItem = JSON.parse(kpiinfo?.reportItem || '{}')
    const isUseDataLocal = reportItem?.isUseDataLocal == 1
    const [isLoading, setLoading] = useState(false)
    const [isUploaded, setUploaded] = useState(false)
    const [isLockReport, setLockReport] = useState(false)
    const [isDone, setDone] = useState(false)
    const [search, _setItemSearch] = useState({ text: '' })
    const [note, setNote] = useState('')
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [dataGroup, setDataGroup] = useState([])
    const [_mutate, setMutate] = useState(false)
    const ref_bottomSheet = useRef()

    const bindDataReport = async (dataReport = [], itemUpdate = {}) => {
        const groupList = _.unionBy(dataReport, 'GroupName')
        await setUploaded(itemUpdate?.isUploaded == 1)
        await setNote(dataReport[0]?.InventoryComment || dataReport[0]?.displayComment || '')
        setDataMain(dataReport)
        setData(dataReport)
        setDataGroup(groupList)
        await setDone(false)
    }
    const getLocalStockReport = async (itemUpdate = {}) => {
        const dataRaw = JSON.parse(itemUpdate?.jsonData || '[]')
        if (dataRaw.length > 0) {
            return dataRaw
        }
        const dataStock = await getStockProduct(workinfo)
        const dataReport = _.map(dataStock, (item) => ({
            ...item,
            GroupName: item.categoryName,
            GroupId: item.categoryId,
            ProductId: item.productId,
            ProductName: item.productName,
            ProductCode: item.productCode,
            Unit: item.unit || 'SL',
            QuantityValue: item.quanity,
            InventoryComment: item.displayComment || '',
            displayComment: item.displayComment || ''
        }))
        await saveJsonData(shopinfo.shopId, reportId, shopinfo.auditDate, dataReport)
        return dataReport
    }
    const LoadData = async () => {
        await setLoading(true)
        const isCheck = await checkLockReport(shopinfo)
        await setLockReport(isCheck)
        const itemUpdate = await itemUploaded(shopinfo, reportId)

        if (isUseDataLocal) {
            const dataReport = await getLocalStockReport(itemUpdate)
            await bindDataReport(dataReport, itemUpdate)
            if (dataReport.length === 0) {
                toastError('Thông báo', 'Không có dữ liệu local cho báo cáo này')
            }
            await setLoading(false)
            return
        }

        const params = {
            shopId: shopinfo.shopId,
            reportId: reportId
        }

        await REPORT.GetDataReportByShop(params, async (mData, message) => {
            message && toastError('Thông báo', message)
            const dataReport = mData || []
            const itemRaw = await itemUploaded(shopinfo, reportId)
            await bindDataReport(dataReport, itemRaw)
        })
        await setLoading(false)
    }
    const UploadData = async () => {
        const isValid = await validData()
        if (!isValid) {
            return
        }
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await setLoading(true)
            const result = await REPORT.UploadDataRaw(shopinfo, reportId)
            if (result.statusId == 200) {
                await setUploaded(true)
                ToastSuccess(result.messager || 'Gửi dữ liệu thành công', 'Thông báo', 'top')
                await LoadData()
            } else {
                ToastError(result.messager || 'Gửi dữ liệu thất bại', 'Lỗi dữ liệu', 'top')
            }
            await setLoading(false)
        })
    }
    const validData = async () => {
        if (isLockReport) {
            ToastError('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo', 'Thông báo', 'top')
            return false
        }
        if (isUploaded) {
            ToastError('Báo cáo đã gửi dữ liệu', 'Thông báo', 'top')
            return false
        }
        const isNetwork = await checkNetwork()
        if (!isNetwork) {
            ToastError('Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.', 'Thông báo', 'top')
            return false
        }
        if (!Array.isArray(dataMain) || dataMain.length === 0) {
            ToastError('Chưa có dữ liệu để gửi', 'Dữ liệu trống', 'top')
            return false
        }
        const invalidItems = dataMain.filter((item) => {
            const value = item.QuantityValue
            return value !== null && value !== undefined && value !== '' && (isNotInteger(value) || parseInt(value) < 0)
        })
        if (invalidItems.length > 0) {
            ToastError('Số lượng tồn kho không hợp lệ', 'Lỗi dữ liệu', 'top')
            return false
        }
        const itemsUpload = dataMain.filter((item) => item.QuantityValue !== null && item.QuantityValue !== undefined && item.QuantityValue !== '')
        if (itemsUpload.length === 0) {
            ToastError('Vui lòng nhập dữ liệu trước khi gửi dữ liệu lên hệ thống', 'Dữ liệu trống', 'top')
            return false
        }
        await saveJsonData(shopinfo.shopId, reportId, shopinfo.auditDate, dataMain)
        return true
    }
    //
    const onChangeQuantity = async (value, item) => {
        const quantityValue = value !== null && value !== undefined && value !== ''
            ? value.toString().replace(/,/g, '')
            : null
        const nextValue = quantityValue !== null && !isNotInteger(quantityValue) ? parseInt(quantityValue) : quantityValue
        const dataUpdate = _.map(dataMain, (e) => {
            const isCurrentItem = `${e.GroupName || ''}_${e.ProductId || e.ProductCode}` == `${item.GroupName || ''}_${item.ProductId || item.ProductCode}`
            return isCurrentItem ? { ...e, QuantityValue: nextValue } : e
        })
        let dataFilter = dataUpdate
        if (search.text?.length > 0) {
            dataFilter = _searchData(search.text, dataUpdate)
        } else if (isDone) {
            dataFilter = _.filter(dataUpdate, (it) => it.QuantityValue !== null && it.QuantityValue !== undefined && it.QuantityValue !== '')
        }
        await setDataMain(dataUpdate)
        await setData(dataFilter)
        await setDataGroup(_.unionBy(search.text?.length > 0 ? dataUpdate : dataFilter, 'GroupName'))
        await saveJsonData(shopinfo.shopId, reportId, shopinfo.auditDate, dataUpdate)
        setMutate(e => !e)
    }
    const onBack = () => {
        navigation.goBack()
    }
    const onRenewData = () => {
        if (isUploaded || isLockReport) {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể tải lại!', 'Thông báo', 'top')
            ref_bottomSheet.current?.hide()
            return
        }
        Message('Chú ý', 'Bạn có chắc chắn muốn tải lại dữ liệu?',
            async () => {
                await deleteDataRaw(shopinfo.shopId, reportId)
                await setData([])
                await setDataMain([])
                await LoadData()
                ref_bottomSheet.current?.hide()
            })
    }
    const filterDoneData = async () => {
        const done = !isDone
        if (done) {
            const lstData = _.filter(dataMain, (it) => it.QuantityValue !== null && it.QuantityValue !== undefined && it.QuantityValue !== '')
            await setData(lstData)
            await setDataGroup(_.unionBy(lstData, 'GroupName'))
            search.text = ''
        } else {
            await setData(dataMain)
            await setDataGroup(_.unionBy(dataMain, 'GroupName'))
            search.text = ''
        }
        await setDone(done)
        ref_bottomSheet.current?.hide()
    }
    const setClearAll = async () => {
        if (isUploaded || isLockReport) {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!', 'Thông báo', 'top')
            ref_bottomSheet.current?.hide()
            return
        }
        Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
            async () => {
                const dataUpdate = _.map(dataMain, (e) => ({
                    ...e,
                    QuantityValue: null,
                    InventoryComment: '',
                    displayComment: ''
                }))
                await setNote('')
                await setDone(false)
                search.text = ''
                await setDataMain(dataUpdate)
                await setData(dataUpdate)
                await setDataGroup(_.unionBy(dataUpdate, 'GroupName'))
                await saveJsonData(shopinfo.shopId, reportId, shopinfo.auditDate, dataUpdate)
                ref_bottomSheet.current?.hide()
            })
    }
    const openSheet = () => {
        Keyboard.dismiss()
        ref_bottomSheet.current?.show()
    }
    const handleEndChangeNote = async () => {
        if (isUploaded || isLockReport) {
            return
        }
        if (note?.length > 0 && note?.length < 5) {
            ToastError('Vui lòng nhập ghi chú ít nhất 5 ký tự!!', 'Thông báo', 'top')
            setNote('')
            return
        }
        const dataUpdate = _.map(dataMain, (e) => ({
            ...e,
            InventoryComment: note || '',
            displayComment: note || ''
        }))
        await setDataMain(dataUpdate)
        await setData(search.text?.length > 0 ? _searchData(search.text, dataUpdate) : dataUpdate)
        await saveJsonData(shopinfo.shopId, reportId, shopinfo.auditDate, dataUpdate)
        note?.length !== 0 && ToastSuccess('Đã lưu ghi chú.', 'Thông báo', 'top')
    }
    const onSearchData = (text) => {
        search.text = text
        const dataSearch = _searchData(text, dataMain)
        setData(dataSearch)
        setDataGroup(_.unionBy(dataMain, 'GroupName'))
        setDone(false)
    }
    const _searchData = (text = search.text, dataSource = dataMain) => {
        const valueSearch = removeVietnameseTones(text || '').toLowerCase()
        let searchData = _.filter(dataSource, (e) => (
            removeVietnameseTones(e.ProductName || '').toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.ProductCode || '').toLowerCase().match(valueSearch)
        ))
        return searchData
    }
    //
    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        tabContainer: { flex: 1, padding: 8 },
        itemContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        titleName: { color: appcolor.dark, fontSize: 13, fontWeight: fontWeightBold },
        subTitleName: { color: appcolor.placeholderText, fontSize: 12 },
        viewInfo: { width: '70%' },
        viewInput: { width: '30%' },
        inputMain: { marginBottom: 0, borderRadius: 8, backgroundColor: appcolor.light, borderWidth: 1, borderColor: appcolor.grayLight },
        inputView: { fontSize: 12, color: appcolor.dark, textAlign: 'center' },
        inputDisabled: { backgroundColor: appcolor.grayLight },
        noteInput: { backgroundColor: appcolor.grayLight, margin: 8, flex: 1 },
        sheetContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28, width: '100%' },
        sheetTitle: { color: appcolor.dark, fontSize: 18, fontWeight: '700', paddingTop: 4 },
        sheetSubTitle: { color: appcolor.greydark || appcolor.placeholderText, fontSize: 12, paddingTop: 4, paddingBottom: 12 },
        sheetAction: { width: '100%', minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, marginTop: 8, borderRadius: 12, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.light },
        sheetActionDanger: { borderColor: appcolor.danger, backgroundColor: appcolor.light },
        sheetIconView: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.grayLight },
        sheetIconDanger: { backgroundColor: appcolor.surface },
        sheetActionText: { color: appcolor.dark, flex: 1, paddingHorizontal: 12, fontSize: 14, fontWeight: '600' },
        sheetActionTextDanger: { color: appcolor.danger },
        loadingView: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(255,255,255,0.5)' }
    })

    const renderTab = (item) => {
        const dataItem = _.filter(data, (e) => e.GroupName == item.GroupName)
        return (
            <View style={styles.tabContainer}>
                <CustomListView
                    data={dataItem}
                    extraData={[dataItem]}
                    renderItem={renderItem}
                />
            </View>
        )
    }
    const renderItem = ({ item, index }) => {
        const onChangeValue = (value) => { onChangeQuantity(value, item) }
        return (
            <View style={styles.itemContainer}>
                <View style={styles.viewInfo}>
                    <Text style={styles.titleName}>{`${index + 1}. ${item.ProductName}`}</Text>
                    <Text style={styles.subTitleName}>{`Code: ${item.ProductCode}`}</Text>
                    <Text style={styles.subTitleName}>{`Đơn vị: ${item.Unit}`}</Text>
                </View>
                <View style={styles.viewInput}>
                    <FormGroup
                        editable={!isUploaded && !isLockReport}
                        useClearAndroid={false}
                        placeholder={item.Unit}
                        clearButtonMode='never'
                        keyboardType="numeric"
                        value={item.QuantityValue === 0 ? '0' : (item.QuantityValue ? `${item.QuantityValue}` : '')}
                        handleChangeForm={onChangeValue}
                        containerStyle={[styles.inputMain, (isUploaded || isLockReport) && styles.inputDisabled]}
                        inputStyle={styles.inputView}
                    />
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Báo cáo tồn kho'}
                iconMiddle='poll-h'
                iconRight={!isLockReport ? (!isUploaded ? 'cloud-upload-alt' : null) : 'user-lock'}
                middleFunc={openSheet}
                leftFunc={onBack}
                rightFunc={!isLockReport ? (!isUploaded ? UploadData : null) : () => ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')}
            />
            <SearchData
                placeholder='Tìm kiếm sản phẩm'
                onSearchData={onSearchData}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <FormGroup
                    iconName={'comment-alt'}
                    multiline={true}
                    selectTextOnFocus={true}
                    containerStyle={[styles.noteInput, (isUploaded || isLockReport) && styles.inputDisabled]}
                    inputStyle={{ fontSize: 13, color: appcolor.dark }}
                    placeholder='Nhập ghi chú...'
                    editable={!isUploaded && !isLockReport}
                    onEndEditing={handleEndChangeNote}
                    onClearTextAndroid={handleEndChangeNote}
                    handleChangeForm={setNote}
                    value={note || ''}
                />
            </View>
            <LoadingView isLoading={isLoading} styles={styles.loadingView} />
            <CustomTab
                data={dataGroup}
                keyTabName='GroupName'
                dataMain={data}
                renderItem={renderTab}
            />
            <ActionSheet
                ref={ref_bottomSheet}
                headerAlwaysVisible={true}
                defaultOverlayOpacity={0.3}
                indicatorColor={appcolor.primary}
                containerStyle={{ padding: 10 }}
            >
                <View style={styles.sheetContainer}>
                    <Text style={styles.sheetTitle}>Công cụ</Text>
                    <Text style={styles.sheetSubTitle}>Quản lý nhanh dữ liệu tồn kho trong báo cáo này</Text>
                    <TouchableOpacity style={styles.sheetAction} onPress={filterDoneData}>
                        <View style={styles.sheetIconView}>
                            <Icon name={!isDone ? 'checkmark-circle-outline' : 'check-circle'} type={!isDone ? 'ionicon' : ''} size={22} color={!isDone ? appcolor.dark : appcolor.success} />
                        </View>
                        <Text style={styles.sheetActionText}>Sản phẩm đã nhập</Text>
                        <Icon name='chevron-forward' type='ionicon' size={18} color={appcolor.greydark || appcolor.placeholderText} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sheetAction, styles.sheetActionDanger]} onPress={setClearAll}>
                        <View style={[styles.sheetIconView, styles.sheetIconDanger]}>
                            <Icon name={'trash'} type={'ionicon'} size={22} color={appcolor.danger} />
                        </View>
                        <Text style={[styles.sheetActionText, styles.sheetActionTextDanger]}>Xóa dữ liệu đã nhập</Text>
                        <Icon name='chevron-forward' type='ionicon' size={18} color={appcolor.danger} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetAction} onPress={onRenewData}>
                        <View style={styles.sheetIconView}>
                            <Icon name={'refresh'} type={'ionicon'} size={22} color={appcolor.dark} />
                        </View>
                        <Text style={styles.sheetActionText}>Tải lại dữ liệu</Text>
                        <Icon name='chevron-forward' type='ionicon' size={18} color={appcolor.greydark || appcolor.placeholderText} />
                    </TouchableOpacity>
                </View>
            </ActionSheet>
        </View>
    )
}

export default InventoryReportScreen;
