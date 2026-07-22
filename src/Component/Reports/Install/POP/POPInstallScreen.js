import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { View, Text, StyleSheet, TouchableOpacity, Image, RefreshControl, Alert, DeviceEventEmitter, Modal } from 'react-native'
import { REPORT } from '../../../../API/ReportAPI'
import { fontWeightBold } from '../../../../Themes/AppsStyle'
import { HeaderCustom } from '../../../../Content/HeaderCustom'
import { SearchData } from '../../../../Control/SearchData/SearchData'
import { OptionCameraPOP, removeVietnameseTones, ToastError, ToastSuccess, UUIDGenerator } from '../../../../Core/Helper'
import { alertConfirm } from '../../../../Core/Utility'
import { deviceHeight } from '../../../../Themes/AppsStyle'
import FormGroup from '../../../../Content/FormGroup'
import { removeRawReport, saveJsonData } from '../../../../Controller/ReportController'
import { Icon } from '@rneui/base'
import NativeCamera from '../../../../Control/NativeCamera'
import { dataPhotoReport } from '../../../../Controller/PhotoController'

import { MultipleShowImage } from '../../../../Control/MultipleShowImage'
import { LoadingView } from '../../../../Control/ItemLoading'
import ActionSheet, { SheetManager } from 'react-native-actions-sheet'
import { FlashList } from '@shopify/flash-list'
import FloatActionPOP from '../../../Managers/POP/Controls/FloatActionPOP'
import moment from 'moment'
import _ from 'lodash'
import CustomTab from '../../../../Control/Custom/CustomTab'

const POPInstallScreen = ({ navigation, route }) => {
    const { appcolor, shopinfo, kpiinfo, workinfo } = useSelector(state => state.GAppState)
    const { dataMenu, menu, wareHouse, dataMainLocal, isUploaded } = route.params
    //
    const [data, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [dataGroup, setDataGroup] = useState([])
    const [loading, setLoading] = useState(false)
    const [images, _setImages] = useState({ visible: false, photos: [], index: 0 })
    const [dataFilter, setDataFilter] = useState([])
    const [_mutate, setMutate] = useState(false)
    const [floatAction, _setFloatAction] = useState({ isOpen: false, type: null, title: null })
    const [search, _setSearch] = useState({ text: '', isSearch: false })
    const [focus, _setFocus] = useState({ index: 0, isFocus: false, focusItem: null, type: null })
    const [typeFilter, setTypeFilter] = useState('STATUS')
    const [checkInputType, setCheckInputType] = useState('')
    const [selectedStatusName, setSelectedStatusName] = useState(null)
    const installValueRef = useRef({})
    const changeValueRef = useRef({})
    const listRef = useRef({})
    const [dataInput, _setDataInput] = useState([
        { ItemName: 'Đã thay đổi', ItemId: 1, ItemType: 'MODEL_EDITED' },
        { ItemName: 'Chưa thay đổi', ItemId: 2, ItemType: 'MODEL_NOT_EDITED' },
    ])

    const LoadData = async () => {
        await setLoading(true)
        const merged = await mergeLocalPhotosIntoData(dataMenu)
        setData(merged)
        setDataMain(merged)
        setDataGroup(_.unionBy(merged, 'GroupTabName'))
        await setLoading(false)
    }
    const mergeLocalPhotosIntoData = async (sourceData) => {
        try {
            const updatedData = []
            for (let i = 0; i < (sourceData || []).length; i++) {
                const item = sourceData[i]
                const modelType = `${menu.Id}-${wareHouse.Id}-${item.ProductId}`
                const photosModel = await dataPhotoReport(shopinfo, kpiinfo.id, modelType)
                const mergedPOPList = await Promise.all((item.POPList || []).map(async (p) => {
                    const popType = `${menu.Id}-${wareHouse.Id}-${item.ProductId}-${p.PosmId}`
                    const photosPOP = await dataPhotoReport(shopinfo, kpiinfo.id, popType)
                    return { ...p, ImageList: photosPOP && photosPOP.length > 0 ? photosPOP : [] }
                }))
                updatedData.push({
                    ...item,
                    ImageList: photosModel && photosModel.length > 0 ? photosModel : [],
                    POPList: mergedPOPList,
                })
            }
            const dataUpdateLocal = dataMainLocal.map((e) => {
                if (e.MenuId === menu.Id && e.WareHouseId === wareHouse.Id) {
                    return { ...e, JsonData: JSON.stringify(updatedData) }
                }
                return e
            })
            await saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, dataUpdateLocal)

            return updatedData
        } catch (error) {
            return sourceData
        }
    }
    // #region UPLOAD
    const UploadData = async () => {
        const isValid = await validData()
        if (!isValid)
            return

        alertConfirm('Gửi dữ liệu', 'Sau khi gửi dữ liệu lên hệ thống sẽ không được chỉnh sửa nữa, Bạn có chắc không ?', async () => {
            await setLoading(true)
            const result = await REPORT.UploadDataRaw_Realtime(dataMain, shopinfo, kpiinfo.id)
            ToastSuccess(result.messager, 'Thông báo', 'top')
            if (result.statusId == 200) {
                await removeRawReport(shopinfo.shopId, kpiinfo.id)
                await DeviceEventEmitter.emit('RELOAD_DATA_POP_INSTALL')
                navigation.goBack()
            }
            await setLoading(false)
        })
    }
    const validData = async () => {
        if (isUploaded) {
            return false
        }
        let checkIsVerifyInput = []
        let checkDisplay = []
        for (let i = 0; i < dataMain.length; i++) {
            const itemProduct = dataMain[i]
            const POPList = itemProduct.POPList;
            for (let j = 0; j < POPList.length; j++) {
                const itemPOP = POPList[j]
                if (itemPOP.POPStatus == undefined || itemPOP.POPStatus == null) {
                    if (itemPOP.isVerifyInput == 1) {
                        checkIsVerifyInput.push(` - ${itemPOP.POPName} của sản phẩm ${itemProduct.ProductName}`)
                    } else if (itemProduct.Display > 0) {
                        checkDisplay.push(` - ${itemPOP.POPName} của sản phẩm ${itemProduct.ProductName}`)
                    }
                }
            }
        }
        if (checkIsVerifyInput.length > 0) {
            Alert.alert(`Chọn trạng thái lắp đặt đối với các POP bắt buộc (*) trước khi gửi`, `${checkIsVerifyInput.join('\n')}`)
            return false
        }
        if (checkDisplay.length > 0) {
            Alert.alert(`Chọn trạng thái lắp đặt POP cho sản phẩm có dữ liệu trưng bày > 0 trước khi gửi`, `${checkDisplay.join('\n')}`)
            return false
        }
        // Check Photo
        const dataInstall = _.filter(dataMain, (e) => (e.POPList || []).some(x => x.InstallValue))
        if (dataInstall.length > 0) {
            // Valid Photo 
            let listError = []
            for (let index = 0; index < dataInstall.length; index++) {
                const item = dataInstall[index];
                const imageProduct = (item?.ImageList || []).length || 0
                if (imageProduct < (item.numberIMG || 0)) {
                    listError.push(`- Chưa chụp đủ hình ảnh sản phẩm ${item.ProductName} (${imageProduct}/${item.numberIMG || 0})`)
                }
                for (let index = 0; index < item.POPList.length; index++) {
                    const itemPOP = item.POPList[index];
                    const imagePOP = (itemPOP?.ImageList || []).length || 0
                    if (itemPOP.InstallValue > 0 && imagePOP < (itemPOP.numberIMG || 0)) {
                        listError.push(`- Chưa chụp đủ hình ảnh ${itemPOP.POPName} của sản phẩm ${item.ProductName} (${imagePOP}/${itemPOP.numberIMG || 0})`)
                    }
                }
            }
            if (listError.length > 0) {
                Alert.alert(`Chưa chụp đủ hình ảnh`, `${listError.join('\n')}`)
                return false
            }
        }
        return true
    }
    // #endregion UPLOAD
    // #region HANDLER
    const handlerShowInput = (item, index, tabIndex, itemPOP, type) => {
        listRef.current[tabIndex]?.scrollToIndex({ index: index, animated: true })
        const key = `${item.ProductId}-${itemPOP.PosmId}`
        if (type == 'INSTALL_VALUE') {
            installValueRef.current[key]?.focus()
        } else {
            changeValueRef.current[key]?.focus()
        }
    }
    const handlerChangeFAB = (typeAction) => {
        switch (typeAction) {
            case 'FILTER_STATUS':
                SheetManager.show('filter-sheet', { payload: { type: 'STATUS' } })
                floatAction.isOpen = false
                floatAction.type = typeAction
                floatAction.title = 'Lọc trạng thái'
                setMutate(e => !e)
                break;
            case 'FILTER_INPUT':
                SheetManager.show('filter-sheet', { payload: { type: 'INPUT' } })
                floatAction.isOpen = false
                floatAction.type = typeAction
                floatAction.title = 'Lọc dữ liệu'
                setMutate(e => !e)
                break;
            default:
                break;
        }
    }
    const handlerOptionCamera = (itemProduct, itemPOP, indexPOP, typeModel) => {
        const POPName = typeModel == 'ITEM_POP' ? itemPOP.POPName : itemProduct.ProductName
        const title = typeModel == 'ITEM_POP' ? `cho ${POPName}` : `cho sản phẩm ${POPName}`
        // 
        OptionCameraPOP('Hình ảnh', `Chụp ảnh ${title} hoặc xem ảnh bạn đã chụp trước đó`, () => {
            handlerCamera(itemProduct, itemPOP, indexPOP, 'CAPTURE', typeModel)
        }, () => {
            handlerCamera(itemProduct, itemPOP, indexPOP, 'VIEW_PHOTO', typeModel)
        })
    }
    const handlerCamera = async (itemProduct, itemPOP, indexPOP, typeAction, typeModel) => {
        const photoType = `${menu.Id}-${wareHouse.Id}-${itemProduct.ProductId}${typeModel == 'ITEM_POP' ? `-${itemPOP.PosmId}` : ''}`
        const photoinfo = {
            "shopId": shopinfo.shopId,
            "shopCode": shopinfo.shopCode,
            "reportId": kpiinfo.id,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": photoType,
            "photoDesc": `${menu.Name}-${wareHouse.Name}-${itemProduct.ProductName}`,
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "shopLat": shopinfo.latitude,
            "shopLong": shopinfo.longitude,
            "guid": UUIDGenerator(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        }
        if (typeAction == 'CAPTURE') {
            await NativeCamera.cameraStart(photoinfo, (res) => callBackPhoto(itemProduct, itemPOP, indexPOP, res, typeModel));
        } else {
            await handlerShowImage(itemProduct, itemPOP, typeModel)
        }
    }
    const callBackPhoto = async (itemProduct, itemPOP, indexPOP, result, typeModel) => {
        if (result.statusId == 200) {
            const dataPhoto = await dataPhotoReport(shopinfo, kpiinfo.id, `${menu.Id}-${wareHouse.Id}-${itemProduct.ProductId}${typeModel == 'ITEM_POP' ? `-${itemPOP.PosmId}` : ''}`)
            if (typeModel == 'ITEM_POP') {
                itemPOP.ImageList = dataPhoto
            } else {
                itemProduct.ImageList = dataPhoto
            }
            setMutate(e => !e)
            const dataUpdateLocal = dataMainLocal.map((e) => {
                if (e.MenuId === menu.Id && e.WareHouseId === wareHouse.Id) {
                    return { ...e, JsonData: JSON.stringify(dataMain) }
                }
                return e
            })
            //  
            await saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, dataUpdateLocal)
            await DeviceEventEmitter.emit('RELOAD_DATA_POP_INSTALL')
        }
    }
    const handlerCloseImage = () => {
        images.visible = false
        images.photos = []
        images.index = 0
        setMutate(e => !e)
    }
    const handlerShowImage = async (itemProduct, itemPOP, typeModel) => {
        if (typeModel == 'ITEM_POP') {
            if (itemPOP.ImageList == undefined || itemPOP.ImageList.length == 0) {
                ToastError(`Bạn chưa có ảnh sản phẩm ${itemPOP.POPName} nào`, 'Thông báo', 'top')
                return
            }
        } else {
            if (itemProduct.ImageList == undefined || itemProduct.ImageList.length == 0) {
                ToastError(`Bạn chưa có ảnh sản phẩm ${itemProduct.ProductName} nào`, 'Thông báo', 'top')
                return
            }
        }
        const ImageList = typeModel == 'ITEM_POP' ? itemPOP.ImageList : itemProduct.ImageList
        images.photos = ImageList
        images.index = 0
        images.visible = true
        setMutate(e => !e)
    }
    const handlerVisibleFAB = () => {
        if (!floatAction.isOpen && floatAction.type !== null) {
            search.text = ''
            search.isSearch = false
            floatAction.isOpen = false
            floatAction.type = null
            floatAction.title = null
            setData(dataMain)
            setCheckInputType(null)
            setSelectedStatusName(null)
        } else {
            floatAction.isOpen = !floatAction.isOpen
            floatAction.type = null
            floatAction.title = null
        }
        setMutate(e => !e)
    }
    const handlerStatus = async (itemPOP, itemStatus, tabIndex, index) => {
        const value = itemStatus.isChoose || itemPOP.POPStatus == itemStatus.ItemName ? 0 : 1
        const updateStatusList = itemPOP.StatusList.map((s) => {
            if (s.ItemId == itemStatus.ItemId) {
                return { ...s, isChoose: value }
            }
            return { ...s, isChoose: 0 }
        })
        itemPOP.POPStatus = value == 1 ? itemStatus.ItemName : null
        itemPOP.isEditValue = value == 1 ? itemStatus.isEditValue : 0
        itemPOP.isChangeStatus = value == 1 ? 1 : 0
        itemPOP.StatusList = updateStatusList
        // 
        itemPOP.InstallValue = itemStatus.isEditValue == 1 ? itemPOP.InstallValue : 0
        itemPOP.ChangeValue = itemStatus.isEditValue == 1 ? itemPOP.ChangeValue : 0

        setMutate(e => !e)
        const dataUpdateLocal = dataMainLocal.map((e) => {
            if (e.MenuId === menu.Id && e.WareHouseId === wareHouse.Id) {
                return { ...e, JsonData: JSON.stringify(dataMain) }
            }
            return e
        })
        await saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, dataUpdateLocal)
        listRef.current[tabIndex]?.scrollToIndex({ index: index, animated: true })
        DeviceEventEmitter.emit('RELOAD_DATA_POP_INSTALL')
    }
    const handlerChangeFilter = (item) => {
        const selectedId = item.ItemId
        if (checkInputType === selectedId) {
            setCheckInputType(null)
            setData(dataMain)
            return
        }
        setCheckInputType(selectedId)
        if (item.ItemType != undefined && item.ItemType != '') {
            onFilterInput(item.ItemType)
        } else {
            onFilterStatus(item)
        }
    }
    // #endregion HANDLER
    // #region ACTION
    const goBack = () => {
        navigation.goBack()
    }
    const onSearchData = (text) => {
        const dataSearch = _searchData(text, dataMain, floatAction.type == 'MODEL_EDITED', floatAction.type == 'MODEL_NOT_EDITED', floatAction.type == 'MODEL_STATUS', selectedStatusName)
        search.text = text
        search.isSearch = true
        setData(dataSearch)
        setMutate(e => !e)
    }
    const _searchData = (text, filterData, isModelEdited = false, isModelNotEdited = false, isModelStatus = false, itemStatus = null) => {
        const valueSearch = removeVietnameseTones(text).toLowerCase()
        const dataSearch = _.filter(filterData, (item) => {
            return removeVietnameseTones(item.ProductName.toLowerCase()).includes(valueSearch) ||
                removeVietnameseTones(item.ProductCode.toLowerCase()).includes(valueSearch) ||
                item.POPList.some(x => removeVietnameseTones(x.POPName.toLowerCase()).includes(valueSearch))
        })
        if (isModelEdited) {
            const dataModelEdited = _.filter(dataSearch, (item) => item.POPList.some(x => x.isChangeStatus == 1 || x.isChangeValue == 1))
            return dataModelEdited
        }
        if (isModelNotEdited) {
            const dataModelNotEdited = _.filter(dataSearch, (item) => item.POPList.every(x => x.isChangeStatus !== 1 && x.isChangeValue !== 1))
            return dataModelNotEdited
        }
        if (isModelStatus) {
            const dataModelStatus = dataSearch.map((product) => {
                const filteredPOPList = (product.POPList || []).filter((p) => p.POPStatus === itemStatus)
                return { ...product, POPList: filteredPOPList }
            }).filter((product) => (product.POPList || []).length > 0)
            return dataModelStatus
        }
        return dataSearch
    }
    const onChangeValue = async (itemPOP, text, type) => {
        let value = text ? parseInt(text) : null
        if (itemPOP.QuantityMyHouse == null || itemPOP.QuantityMyHouse == undefined || itemPOP.QuantityMyHouse == 0) {
            ToastError('Không có sản phẩm trong kho', 'Thông báo', 'top')
            return
        } else {
            if (value > itemPOP.QuantityMyHouse) {
                ToastError('Số lượng không được lớn hơn số lượng còn lại trong kho', 'Thông báo', 'top')
                return
            }
        }

        if (type == 'INSTALL_VALUE') {
            itemPOP.InstallValue = value
        } else {
            itemPOP.ChangeValue = value
        }
        itemPOP.isChangeValue = value > 0 ? 1 : 0
        const totalUsed = (itemPOP.InstallValue || 0) + (itemPOP.ChangeValue || 0)
        if (totalUsed > itemPOP.QuantityMyHouse) {
            ToastError('Tổng số lượng lắp đặt và thay thế không được vượt quá số lượng trong kho', 'Thông báo', 'top')
            if (type == 'INSTALL_VALUE') {
                itemPOP.InstallValue = 0
            } else {
                itemPOP.ChangeValue = 0
            }
            setMutate(e => !e)
            return
        }

        setMutate(e => !e)
        const dataUpdateLocal = dataMainLocal.map((e) => {
            if (e.MenuId === menu.Id && e.WareHouseId === wareHouse.Id) {
                return { ...e, JsonData: JSON.stringify(dataMain) }
            }
            return e
        })
        await saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, dataUpdateLocal)
    }
    const onFilterInput = (typeAction) => {
        switch (typeAction) {
            case 'MODEL_EDITED':
                floatAction.type = 'MODEL_EDITED'
                setSelectedStatusName(null)
                const dataInstallSearch = _searchData(search.text, dataMain, true, false, false, null)
                setData(dataInstallSearch)
                break;
            case 'MODEL_NOT_EDITED':
                floatAction.type = 'MODEL_NOT_EDITED'
                setSelectedStatusName(null)
                const dataNotInstallSearch = _searchData(search.text, dataMain, false, true, false, null)
                setData(dataNotInstallSearch)
                break;
            default:
                break;
        }
    }
    const onFilterStatus = (item) => {
        floatAction.type = 'MODEL_STATUS'
        setSelectedStatusName(item.ItemName)
        const updateData = _searchData(search.text, dataMain, false, false, true, item.ItemName)
        setData(updateData)
        setCheckInputType(item.ItemId)
    }
    const onBeforeShowFilter = (item) => {
        setTypeFilter(item)
        setDataFilter(dataMain.map((e) => e?.POPList?.map((p) => p?.StatusList))?.flat()[0] || [])
    }
    const onFocusInput = (item, itemPOP, type) => {
        focus.isFocus = true
        focus.index = `${item.ProductId}-${itemPOP.PosmId}`
        focus.focusItem = itemPOP
        focus.type = type
        setMutate(e => !e)
    }
    const onEndEditingInput = () => {
        focus.isFocus = false
        focus.index = 0
        focus.focusItem = null
        focus.type = null
        DeviceEventEmitter.emit('RELOAD_DATA_POP_INSTALL')
        setMutate(e => !e)
    }
    // #endregion ACTION
    useEffect(() => {
        LoadData()
    }, [dataMenu])
    // #region Styles
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentContainer: { flex: 1, height: 550 },
        itemProductContainer: { flex: 1, },
        itemTab: { flex: 1, backgroundColor: appcolor.light, marginHorizontal: 8, marginTop: 4 },
        titleName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        titlePOP: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark },
        titleInput: { fontSize: 12, fontWeight: '500', color: appcolor.dark },
        hidenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
        emptyData: { flex: 1, alignItems: 'center', marginTop: 8 },
        titleEmptyData: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.greylight },
        buttonCamera: { position: 'absolute', end: 3 },
        loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        buttonStatus: { borderRadius: 20, backgroundColor: appcolor.surface, minWidth: 50, justifyContent: 'center', alignItems: 'center', marginEnd: 8, paddingHorizontal: 16, paddingVertical: 8 },
        buttonInput: { borderRadius: 20, backgroundColor: appcolor.surface, minWidth: 50, justifyContent: 'center', alignItems: 'center', marginEnd: 8, paddingHorizontal: 16, paddingVertical: 8 },
        titleStatus: { fontSize: 12, fontWeight: '500', color: appcolor.dark, textAlign: 'center' },
        itemPOPContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, margin: 4, elevation: 3, shadowOpacity: 0.3, shadowColor: appcolor.grayLight, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
        viewHeaderProduct: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary + '10', borderRadius: 8, padding: 8, paddingVertical: 12, marginVertical: 4 },
        imageProduct: { width: 50, height: 50, borderRadius: 8 },
        contentPOP: { flexDirection: 'column', width: '80%' },
        viewPOPList: { flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginBottom: 4, marginTop: 8 },
        viewValueWareHouse: { position: 'absolute', end: 4, top: 4, backgroundColor: appcolor.primary, width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 28, borderWidth: 1, borderColor: appcolor.surface },
        titleValueWareHouse: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.white },
        titleHeader: { fontSize: 12, fontWeight: '500', color: appcolor.greylight, marginTop: 4, fontStyle: 'italic' },
        viewInputPOP: { flex: 1, flexDirection: 'row', marginVertical: 8 },
        buttonCameraPOP: { backgroundColor: appcolor.surface, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8, borderRadius: 8 },
        viewImagePOP: { width: '20%', marginRight: 4, justifyContent: 'center', alignItems: 'center' },
        viewBadgeImages: { position: 'absolute', top: -4, right: 4, backgroundColor: appcolor.redgray, paddingHorizontal: 4, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderRadius: 16, zIndex: 1 },
        textBadgeImages: { fontSize: 9, fontWeight: '500', color: appcolor.white, textAlign: 'center' },
        actionSheetStyle: { padding: 8, width: '100%', height: '35%', backgroundColor: appcolor.light },
        viewFilter: { height: '100%', width: '100%', backgroundColor: appcolor.light },
        titleFilter: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, marginBottom: 8, },
        itemFilter: { padding: 8, borderWidth: 1, borderColor: appcolor.grayLight, borderRadius: 8, marginVertical: 4 },
        textItemFilter: { fontSize: 12, fontWeight: '500', color: appcolor.dark, textAlign: 'center' },
        overflowView: { width: '100%', height: '100%', position: 'absolute', zIndex: 1, backgroundColor: appcolor.dark, opacity: 0.65, justifyContent: 'center' },
    })
    // #endregion
    // #region View
    const renderItem = (item, index, tabIndex) => {
        const onPressProduct = () => handlerOptionCamera(item, null, index, 'MODEL_POP')
        const isEditItem = item.POPList.some(x => x.isEditValue == 1)
        const numberImages = item.ImageList?.length || 0
        const viewPOPList = (item.POPList?.map((itemPOP, indexPOP) => {
            const onPressPOP = () => handlerOptionCamera(item, itemPOP, indexPOP, 'ITEM_POP')
            const imageURI = itemPOP.Image ? { uri: itemPOP.Image } : require('../../../../Themes/Images/noimage.png')
            const isFocus = focus.isFocus && focus.index == `${item.ProductId}-${itemPOP.PosmId}`
            return (
                <View style={[styles.itemPOPContainer, { borderColor: itemPOP.isVerifyInput == 1 ? appcolor.danger : appcolor.grayLight }]} key={indexPOP}>
                    <View style={styles.viewValueWareHouse}>
                        <Text style={styles.titleValueWareHouse}>{`${itemPOP.QuantityMyHouse || 0}`}</Text>
                    </View>
                    <View style={styles.viewImagePOP}>
                        <Image
                            source={imageURI}
                            style={styles.imageProduct}
                            resizeMode="cover"
                            resizeMethod="resize"
                        />
                        {itemPOP.isEditValue == 1 &&
                            <TouchableOpacity style={styles.buttonCameraPOP} onPress={onPressPOP}>
                                <View style={[styles.viewBadgeImages, { top: 8, right: 8 }]}>
                                    <Text style={styles.textBadgeImages}>{`${itemPOP.ImageList?.length || 0}`}</Text>
                                </View>
                                <Icon name='camera' type='ionicon' size={24} color={appcolor.dark} />
                            </TouchableOpacity>
                        }
                    </View>
                    <View style={styles.contentPOP}>
                        <Text style={[styles.titlePOP, { color: itemPOP.isVerifyInput == 1 ? appcolor.danger : appcolor.dark }]}>{`${itemPOP.isVerifyInput == 1 ? '*' : ''}${itemPOP.POPName}`}</Text>
                        <Text style={styles.titleHeader}>{'Trạng thái POP'}</Text>
                        <View style={styles.viewPOPList}>
                            {(itemPOP.StatusList || [])?.map((itemStatus, indexStatus) => {
                                const isChooseStatus = (itemPOP.POPStatus == itemStatus.ItemName || itemStatus.isChoose == 1)
                                return (
                                    <TouchableOpacity
                                        key={indexStatus}
                                        style={[styles.buttonStatus, { backgroundColor: isChooseStatus ? appcolor.primary : appcolor.surface }]}
                                        onPress={() => handlerStatus(itemPOP, itemStatus, tabIndex, index)}
                                    >
                                        <Text style={[styles.titleStatus, { color: isChooseStatus ? appcolor.light : appcolor.dark }]}>{itemStatus.ItemName}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                        {itemPOP.isEditValue == 1 &&
                            <>
                                <Text style={styles.titleHeader}>{'Số lượng POP'}</Text>
                                <View style={styles.viewInputPOP}>
                                    <TouchableOpacity style={styles.buttonInput} onPress={() => handlerShowInput(item, index, tabIndex, itemPOP, 'INSTALL_VALUE')}>
                                        <Text style={[styles.titleInput, { color: isFocus && focus.type == 'INSTALL_VALUE' ? appcolor.primary : appcolor.dark }]}>{`Lắp mới: ${itemPOP.InstallValue || 0}`}</Text>
                                    </TouchableOpacity>
                                    <FormGroup
                                        inputRefFull={(el) => (installValueRef.current[`${item.ProductId}-${itemPOP.PosmId}`] = el)}
                                        editable
                                        selectTextOnFocus
                                        keyboardType="numeric"
                                        value={`${itemPOP.InstallValue || ''}`}
                                        containerStyle={styles.hidenInput}
                                        handleChangeForm={(text) => onChangeValue(itemPOP, text, 'INSTALL_VALUE')}
                                        onFocus={() => onFocusInput(item, itemPOP, 'INSTALL_VALUE')}
                                        onEndEditing={onEndEditingInput}
                                    />
                                    <TouchableOpacity style={styles.buttonInput} onPress={() => handlerShowInput(item, index, tabIndex, itemPOP, 'CHANGE_VALUE')}>
                                        <Text style={[styles.titleInput, { color: isFocus && focus.type == 'CHANGE_VALUE' ? appcolor.primary : appcolor.dark }]}>{`Lắp thay thế: ${itemPOP.ChangeValue || 0}`}</Text>
                                    </TouchableOpacity>
                                    <FormGroup
                                        inputRefFull={(el) => (changeValueRef.current[`${item.ProductId}-${itemPOP.PosmId}`] = el)}
                                        editable
                                        selectTextOnFocus
                                        keyboardType="numeric"
                                        value={`${itemPOP.ChangeValue || ''}`}
                                        containerStyle={styles.hidenInput}
                                        handleChangeForm={(text) => onChangeValue(itemPOP, text, 'CHANGE_VALUE')}
                                        onFocus={() => onFocusInput(item, itemPOP, 'CHANGE_VALUE')}
                                        onEndEditing={onEndEditingInput}
                                    />
                                </View>
                            </>
                        }
                    </View>
                </View>
            )
        }))
        return (
            <View key={index} style={styles.itemProductContainer}>
                <View style={styles.viewHeaderProduct}>
                    <Text style={styles.titleName}>{`${index + 1}. ${item.ProductName}`}</Text>
                    {isEditItem &&
                        <TouchableOpacity style={styles.buttonCamera} onPress={onPressProduct}>
                            <View style={styles.viewBadgeImages}>
                                <Text style={styles.textBadgeImages}>{`${numberImages}`}</Text>
                            </View>
                            <Icon name='camera' type='ionicon' size={24} color={appcolor.dark} style={{ marginRight: 8 }} />
                        </TouchableOpacity>
                    }
                </View>
                {viewPOPList}
            </View>
        )
    }
    const renderTab = (item, tabIndex) => {
        const dataTab = _.filter(data, (e) => e.GroupTabName == item.GroupTabName)
        if (dataTab == null || dataTab.length == 0)
            return <View />
        return (
            <View key={tabIndex} style={styles.itemTab}>
                <FlashList
                    ref={(el) => (listRef.current[tabIndex] = el)}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={LoadData} />}
                    keyExtractor={(_item, index) => index.toString()}
                    data={dataTab}
                    extraData={[dataTab]}
                    renderItem={({ item, index }) => renderItem(item, index, tabIndex)}
                    estimatedItemSize={10}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    drawDistance={10 * dataTab.length}
                    ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 2 }} />}
                />
            </View>
        )
    }
    const renderItemFilter = ({ item, index }) => {
        const onPress = () => {
            handlerChangeFilter(item, index)
        }
        const backgroundColor = checkInputType == item.ItemId ? appcolor.primary : appcolor.surface
        const color = checkInputType == item.ItemId ? appcolor.light : appcolor.dark
        const isSelected = checkInputType == item.ItemId
        return (
            <TouchableOpacity style={[styles.itemFilter, { backgroundColor: backgroundColor, borderColor: isSelected ? appcolor.primary : appcolor.grayLight }]} key={index} onPress={onPress}>
                <Text style={[styles.textItemFilter, { color: color }]}>{`${item.ItemName} ${item.ItemType != undefined ? '' : 'POP'}`}</Text>
            </TouchableOpacity>
        )
    }
    if (loading) return <LoadingView isLoading={loading} styles={styles.loadingView} />
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={menu.Name}
                subTitle={wareHouse.Name}
                iconRight={isUploaded ? 'check' : 'cloud-upload-alt'}
                rightFunc={UploadData}
                leftFunc={goBack}
            />
            <View style={styles.contentContainer}>
                <SearchData
                    placeholder={`Tìm kiếm sản phẩm`}
                    onSearchData={onSearchData}
                    value={search.text}
                    containerStyle={{ margin: 8 }}
                    inputStyle={{ fontSize: 12 }}
                />
                <CustomTab
                    data={dataGroup}
                    dataCountItem={data}
                    keyTabName='GroupTabName'
                    renderItem={renderTab}
                />
                {dataMain.length == 0 && <View style={styles.emptyData}>
                    <Text style={styles.titleEmptyData}>Không có dữ liệu</Text>
                </View>}
            </View>
            <Modal visible={images.visible}>
                <MultipleShowImage
                    key='showimageprofile'
                    listItem={images.photos || []}
                    indexItem={images.index}
                    closeShowImage={handlerCloseImage}
                />
            </Modal>
            <ActionSheet id='filter-sheet' containerStyle={styles.actionSheetStyle} onBeforeShow={onBeforeShowFilter}>
                <View style={styles.viewFilter}>
                    <Text style={styles.titleFilter}>{`Lọc ${typeFilter.type == 'STATUS' ? 'trạng thái' : 'dữ liệu'}`}</Text>
                    <FlashList
                        keyExtractor={(_item, index) => index.toString()}
                        data={typeFilter.type == 'STATUS' ? dataFilter || [] : dataInput}
                        extraData={[dataFilter, checkInputType, typeFilter, data]}
                        renderItem={renderItemFilter}
                        estimatedItemSize={10}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                    />
                </View>
            </ActionSheet>
            {floatAction.isOpen ? <TouchableOpacity style={styles.overflowView} onPress={handlerVisibleFAB} /> : <View />}
            <FloatActionPOP
                visible={floatAction.isOpen}
                title={floatAction.title}
                type={floatAction.type}
                handlerChange={handlerChangeFAB}
                handlerVisible={handlerVisibleFAB}
            />
        </View>
    )
}

export default POPInstallScreen