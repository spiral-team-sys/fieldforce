import React, { useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import { REPORT } from "../../../../API/ReportAPI";
import { toastError, toastSuccess } from "../../../../Utils/configToast";
import CustomListView from "../../../../Control/Custom/CustomListView";
import { ButtonGroup, Text } from "@rneui/base";
import { deviceHeight, fontWeightBold } from "../../../../Themes/AppsStyle";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchData } from "../../../../Control/SearchData/SearchData";
import ItemChoose from "./Items/ItemChoose";
import ItemInput from "./Items/ItemInput";
import { alertConfirm, alertWarning } from "../../../../Core/Utility";
import { deleteDataRaw, getDataPhotoByGUID, removeRawReport, saveJsonData } from "../../../../Controller/ReportController";
import { Message, MessageAction, MessageAction2, removeVietnameseTones, UUIDGenerator } from "../../../../Core/Helper";
import { PUBLIC_API } from "../../../../API/PublicAPI";
import ItemScanID from "./Items/ItemScanID";
import ItemCapture from "./Items/ItemCapture";
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from 'lodash';

const RegisterProgramScreen = ({ navigation, route }) => {
    const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(true)
    const [isChecking, setChecking] = useState(false)
    const [isUpload, setUpload] = useState(false)
    const [dataRegister, setDataRegister] = useState({})
    const [itemChoose, setItemChoose] = useState({ type: null, title: null, data: [], dataMain: [] })
    const [_mutate, setMutate] = useState(false)
    const config = JSON.parse(kpiinfo.reportItem || '[]')
    const programs = route?.params || {}
    //
    const LoadData = async () => {
        !isLoading && await setLoading(true)
        const params = {
            shopId: shopinfo.shopId,
            reportId: kpiinfo.id
        }
        // 
        let guidRegister = await AsyncStorage.getItem(`GUID_REGISTER_${programs.id}`)
        if (guidRegister == null || guidRegister.length < 10) {
            guidRegister = UUIDGenerator()
            await AsyncStorage.setItem(`GUID_REGISTER_${programs.id}`, guidRegister)
        }
        // 
        await REPORT.GetDataReportByShop(params, async (mData, message) => {
            message && toastError('Thông báo', message)
            const itemRegister = {
                ...mData[0] || {},
                isAllowGallery: programs.isAllowGallery == 1,
                GuidRegister: guidRegister,
                FromDate: programs.fromDate,
                ToDate: programs.toDate,
                ProgramId: programs.id,
                ProgramName: programs.programName,
                ItemProgram: {
                    ProgramTypeName: programs.programTypeName,
                    ProgramName: programs.programName,
                    AwardName: programs.awardName,
                    AwardTypeName: programs.awardTypeName,
                    TargetAmount: programs.targetAmount,
                    FromDate: programs.fromDate,
                    ToDate: programs.toDate
                }
            }
            await handlerSaveItem(itemRegister)
            await setDataRegister(itemRegister)
        })
        await setLoading(false)
    }
    const UploadData = async () => {
        const isValid = await validData()
        if (!isValid)
            return
        // Upload Data
        await setUpload(true)
        alertConfirm('Thông báo', 'Bạn có muốn gửi thông tin đăng kí chương trình trên không?', async () => {
            await handlerSaveItem(dataRegister)
            const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id)
            if (result.statusId == 200) {
                toastSuccess('Thông báo', result.messager)
                await removeRawReport(shopinfo.shopId, kpiinfo.id)
                await AsyncStorage.removeItem(`GUID_REGISTER_${dataRegister.ProgramId}`)
                DeviceEventEmitter.emit('RELOAD_DATA_PROGRAMS')
                onBack()
            } else {
                toastError('Lỗi dữ liệu', result.messager)
            }
        })
        await setUpload(false)
    }
    const validData = async () => {
        let strError = ''
        let dataValid = []
        // Data Input
        if (programs.isInputTax == 1) {
            if (dataRegister.isTaxCode) {
                dataValid = [
                    { keyValue: 'ProgramName', keyName: 'Gói chương trình' },
                    { keyValue: 'FromDate', keyName: 'Từ ngày' },
                    { keyValue: 'ToDate', keyName: 'Đến ngày' },
                    { keyValue: 'DealerName', keyName: 'Nhà phân phối' },
                    { keyValue: 'MST', keyName: 'Mã số thuế' },
                    { keyValue: 'CompanyName', keyName: 'Tên cửa hàng pháp lý' },
                    { keyValue: 'AddressCompany', keyName: 'Địa chỉ cửa hàng pháp lý' },
                    { keyValue: 'RepresentativeName', keyName: 'Người đại diện' },
                ]
            } else {
                dataValid = [
                    { keyValue: 'ProgramName', keyName: 'Gói chương trình' },
                    { keyValue: 'FromDate', keyName: 'Từ ngày' },
                    { keyValue: 'ToDate', keyName: 'Đến ngày' },
                    { keyValue: 'DealerName', keyName: 'Nhà phân phối' },
                    { keyValue: 'CCCDInfo', keyName: 'Căn cước công dân' },
                    { keyValue: 'Note', keyName: 'Ghi chú' }
                ]
            }
        } else {
            dataValid = [
                { keyValue: 'ProgramName', keyName: 'Gói chương trình' },
                { keyValue: 'FromDate', keyName: 'Từ ngày' },
                { keyValue: 'ToDate', keyName: 'Đến ngày' },
                { keyValue: 'DealerName', keyName: 'Nhà phân phối' }
            ]
        }
        //
        for (let index = 0; index < dataValid.length; index++) {
            const { keyValue, keyName } = dataValid[index];
            if (keyValue == 'CCCDInfo') {
                if (Object.keys(dataRegister[keyValue] || {}).length == 0)
                    strError += ` - ${keyName}\n`
            } else {
                if (dataRegister[keyValue] == null || dataRegister[keyValue] == undefined || dataRegister[keyValue] == '')
                    strError += ` - ${keyName}\n`
            }
        }
        // Photo
        const photos = await getDataPhotoByGUID(kpiinfo.id, shopinfo.shopId, dataRegister.GuidRegister)
        if (photos.length < (config?.totalPicture || 0)) {
            strError += ` - Hình ảnh thỏa thuận cửa hàng (${photos.length}/${(config?.totalPicture || 0)})`
        }
        //
        if (strError.length > 0) {
            alertWarning(`Chưa nhập đầy đủ thông tin bắt buộc sau:\n${strError}`)
            return false
        }
        return true
    }
    // Handlers
    const handlerSaveItem = async (dataUpdate) => {
        await saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, [dataUpdate])
    }
    const handlerSearchTaxCode = async (value) => {
        if (value) {
            await setChecking(true)
            const checkData = await PUBLIC_API.CheckDataTaxCode(value)
            if (checkData.length > 0) {
                const shops = _.map(checkData, (e) => { return `${e.shopName} - ${e.dealerName} - ${e.employeeName}` }).join('\n')
                MessageAction2(`Thông tin mã số thuế đã được đăng kí cho:\n${shops}.Bạn có muốn đăng ký không?`,
                    async () => {
                        await PUBLIC_API.GetDataTaxCode(value, async (info, message) => {
                            message && toastError('Thông báo', message)
                            if (Object.keys(info).length > 0) {
                                dataRegister.MST = info.id
                                dataRegister.CompanyName = info.name
                                dataRegister.AddressCompany = info.address
                                dataRegister.RepresentativeName = info.representativeName
                                setMutate(e => !e)
                            } else {
                                dataRegister.CompanyName = null
                                dataRegister.AddressCompany = null
                                dataRegister.RepresentativeName = null
                                setMutate(e => !e)
                            }
                            await handlerSaveItem(dataRegister)
                        })
                    },
                    async () => {
                        dataRegister.MST = null
                        dataRegister.CompanyName = null
                        dataRegister.AddressCompany = null
                        dataRegister.RepresentativeName = null
                        setMutate(e => !e)
                        await handlerSaveItem(dataRegister)
                    },
                    'Không',
                    'Đồng ý'
                )
            } else {
                await PUBLIC_API.GetDataTaxCode(value, async (info, message) => {
                    message && toastError('Thông báo', message)
                    if (Object.keys(info).length > 0) {
                        dataRegister.MST = info.id
                        dataRegister.CompanyName = info.name
                        dataRegister.AddressCompany = info.address
                        dataRegister.RepresentativeName = info.representativeName
                        setMutate(e => !e)
                    } else {
                        dataRegister.CompanyName = null
                        dataRegister.AddressCompany = null
                        dataRegister.RepresentativeName = null
                        setMutate(e => !e)
                    }
                    await handlerSaveItem(dataRegister)
                })
            }
            await setChecking(false)
        } else {
            toastError('Thông báo', 'Dữ liệu mã số thuế không được để trống')
        }
    }
    // Actions 
    const onSearchData = async (text) => {
        const dataFilter = await _searchData(text, itemChoose.dataMain)
        itemChoose.data = dataFilter
        setMutate(e => !e)
    }
    const _searchData = (text, filterList) => {
        const valueSearch = removeVietnameseTones(text).toLowerCase()
        let searchData = _.filter(filterList, (e) => (
            removeVietnameseTones(e?.DealerName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e?.ProgramName).toLowerCase().match(valueSearch)
        ))
        return searchData
    }
    const onCloseSheet = () => {
        SheetManager.hide('choose-item-sheet')
    }
    const onChooseValue = async (type, item) => {
        switch (type) {
            case 'DEALER':
                dataRegister.DealerId = item.DealerId
                dataRegister.DealerName = item.DealerName
                dataRegister.ItemDealer = item
                break
            case 'PROGRAM':
                dataRegister.ProgramId = item.Id
                dataRegister.ProgramName = item.ProgramName
                dataRegister.ItemProgram = item
                break
        }
        setMutate(e => !e)
        SheetManager.hide('choose-item-sheet')
        await handlerSaveItem(dataRegister)
    }
    const onChangeGroup = async (index) => {
        dataRegister.isTaxCode = (index == 0)
        // Clear form
        dataRegister.MST = null
        dataRegister.CompanyName = null
        dataRegister.AddressCompany = null
        dataRegister.RepresentativeName = null
        dataRegister.CCCDInfo = {}
        setMutate(e => !e)
        await handlerSaveItem(dataRegister)
    }
    const onBack = () => {
        navigation.goBack()
    }
    const onClearData = async () => {
        Message('Chú ý', 'Bạn có chắc chắn muốn tải lại dữ liệu?',
            async () => {
                await deleteDataRaw(shopinfo.shopId, kpiinfo.id)
                await LoadData()
            })
    }
    //
    useEffect(() => {
        const update_item = DeviceEventEmitter.addListener('UPDATE_ITEM_PROGRAM', handlerSaveItem)
        LoadData()
        return () => {
            update_item.remove()
        }
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentContainer: { flex: 1, padding: 16, paddingTop: 8 },
        infomationView: { margin: 8, height: 250, backgroundColor: appcolor.surface, borderRadius: 12 },
        titleName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        subTitleName: { fontSize: 12, fontWeight: '500', color: appcolor.placeholderText },
        titleButtonName: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.placeholderText },
        sheetContainer: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { flex: 1, padding: 8, margin: 8, marginBottom: 0, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, elevation: 3, shadowOpacity: 0.3, shadowColor: appcolor.grayLight, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
        actionClose: { width: '50%', backgroundColor: appcolor.second, borderRadius: 32, marginHorizontal: 16, marginTop: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', padding: 8 },
        viewActionRegister: { position: 'absolute', bottom: 28, start: 0, end: 0, alignItems: 'center' },
        actionRegister: { width: '90%', backgroundColor: appcolor.second, borderRadius: 32, marginTop: 8, alignItems: 'center', alignSelf: 'center', padding: 12 },
        loadingView: { justifyContent: 'center', position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 },
        titleGroup: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.primary, textAlign: 'center' },
        viewGroup: { padding: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, marginVertical: 8 },
        selectedButtonStyle: { borderRadius: 6, backgroundColor: appcolor.light, borderWidth: 1, borderColor: appcolor.grayLight },
        contentButtonGroup: { height: 32, borderWidth: 0, backgroundColor: appcolor.surface, borderRadius: 6, overflow: 'hidden' }
    })
    const renderItemChoose = ({ item, index }) => {
        if (itemChoose.type == 'DEALER') {
            const onPress = () => onChooseValue('DEALER', item)
            return (
                <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
                    <Text style={styles.titleName}>{`${index + 1}. ${item.DealerName}`}</Text>
                    <Text style={styles.subTitleName}>{`Code: ${item.DealerCode}`}</Text>
                    <Text style={styles.subTitleName}>{`ĐC: ${item.AddressDealer}`}</Text>
                </TouchableOpacity>
            )
        }
        if (itemChoose.type == 'PROGRAM') {
            const onPress = () => onChooseValue('PROGRAM', item)
            return (
                <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
                    <Text style={styles.titleName}>{`${index + 1}. ${item.ProgramName}`}</Text>
                    <Text style={styles.subTitleName}>{`${item.DescriptionInfo}`}</Text>
                </TouchableOpacity>
            )
        }
        return null
    }
    if (isLoading)
        return <ActivityIndicator color={appcolor.primary} style={styles.loadingView} />
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || `Đăng kí chương trình`}
                middleType='ionicon'
                iconMiddle='refresh'
                middleFunc={onClearData}
                leftFunc={onBack}
            />
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.titleGroup}>{'Thông tin chương trình'}</Text>
                <ItemChoose
                    isEdit={dataRegister?.ProgramName?.length == 0}
                    dataRegister={dataRegister}
                    type='PROGRAM'
                    keyValue='ProgramName'
                    data={dataRegister.Programs || []}
                />
                <Text style={styles.titleGroup}>{'Thông tin cửa hàng tham gia'}</Text>
                <View style={styles.viewGroup}>
                    <ItemChoose
                        isEdit={(dataRegister?.DealerList || []).length > 1}
                        dataRegister={dataRegister}
                        type='DEALER'
                        keyValue='DealerName'
                        title='Nhà phân phối'
                        data={dataRegister.DealerList || []} />
                    {programs.isInputTax == 1 &&
                        <View>
                            <ButtonGroup
                                buttons={['Mã số thuế', 'CCCD']}
                                selectedIndex={dataRegister.isTaxCode ? 0 : 1}
                                activeOpacity={0}
                                selectedButtonStyle={styles.selectedButtonStyle}
                                innerBorderStyle={{ width: 0 }}
                                containerStyle={styles.contentButtonGroup}
                                textStyle={styles.titleButtonName}
                                selectedTextStyle={[styles.titleButtonName, { color: appcolor.dark }]}
                                onPress={onChangeGroup}
                            />
                            {dataRegister.isTaxCode ?
                                <View style={{ paddingHorizontal: 8 }}>
                                    <ItemInput
                                        isSeachData
                                        isChecking={isChecking}
                                        dataRegister={dataRegister}
                                        keyValue='MST'
                                        titleSearch='Tra cứu'
                                        onSearch={handlerSearchTaxCode}
                                    />
                                    <ItemInput
                                        editable={false}
                                        dataRegister={dataRegister}
                                        keyValue='CompanyName'
                                        title='Tên cửa hàng pháp lý' />
                                    <ItemInput
                                        editable={false}
                                        dataRegister={dataRegister}
                                        keyValue='AddressCompany'
                                        title='Địa chỉ cửa hàng pháp lý' />
                                    <ItemInput
                                        dataRegister={dataRegister}
                                        keyValue='RepresentativeName'
                                        title='Người đại diện' />
                                </View>
                                :
                                <View style={{ paddingHorizontal: 8 }}>
                                    <ItemScanID
                                        navigation={navigation}
                                        enabled={dataRegister.isTaxCode == false}
                                        dataRegister={dataRegister}
                                        keyValue='CCCDInfo'
                                    />
                                    <ItemInput
                                        dataRegister={dataRegister}
                                        keyValue='Note'
                                        title='Ghi chú' />
                                </View>
                            }
                        </View>
                    }
                </View>
                <Text style={styles.titleGroup}>{'Thỏa thuận của cửa hàng'}</Text>
                <View style={styles.viewGroup}>
                    <ItemCapture
                        dataRegister={dataRegister}
                    />
                </View>
                <View style={{ height: deviceHeight / 2.6 }} />
            </ScrollView>
            <View style={styles.viewActionRegister}>
                <TouchableOpacity style={styles.actionRegister} onPress={UploadData} disabled={isUpload}>
                    {isUpload ?
                        <ActivityIndicator color={appcolor.light} />
                        :
                        <Text style={[styles.titleName, { color: appcolor.light }]}>Đăng kí tham gia</Text>
                    }
                </TouchableOpacity>
            </View>
            <ActionSheet id="choose-item-sheet"
                drawUnderStatusBar
                statusBarTranslucent={false}
                safeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
                onBeforeShow={setItemChoose}
                containerStyle={styles.sheetContainer}>
                <SafeAreaView style={{ width: '100%', height: '100%', paddingTop: Platform.OS == 'ios' ? 42 : 0, paddingBottom: Platform.OS == 'ios' ? 32 : 0 }}>
                    <SearchData
                        placeholder={`Tìm kiếm ${itemChoose.title?.toLowerCase() || ''}`}
                        onSearchData={onSearchData}
                    />
                    <CustomListView
                        data={itemChoose.data}
                        extraData={itemChoose.data}
                        renderItem={renderItemChoose}
                        bottomView={{ paddingBottom: 16 }}
                    />
                    <TouchableOpacity style={styles.actionClose} onPress={onCloseSheet}>
                        <Text style={[styles.titleName, { color: appcolor.light }]}>Đóng</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </ActionSheet>
        </View>
    )
}

export default RegisterProgramScreen;
