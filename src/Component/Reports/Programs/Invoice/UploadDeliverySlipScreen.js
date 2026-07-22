import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, DeviceEventEmitter, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { fontWeightBold } from '../../../../Themes/AppsStyle'
import FormGroup from '../../../../Content/FormGroup'
import { Divider, Icon } from '@rneui/base'
import { checkLinkType, formatNumber, removeVietnameseTones } from '../../../../Core/Helper'
import CustomListView from '../../../../Control/Custom/CustomListView'
import ActionSheet, { SheetManager } from 'react-native-actions-sheet'
import { SearchData } from '../../../../Control/SearchData/SearchData'
import { alertConfirm, optionConfirm, TODAY } from '../../../../Core/Utility'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { HeaderCustom } from '../../../../Content/HeaderCustom'
import { deletePhotoByList } from '../../../../Controller/PhotoController'
import NativeCamera from '../../../../Control/NativeCamera'
import ViewPictures from '../../../../Control/Gallary/ViewPictures'
import { Toast, toastConfig, toastError, toastSuccess } from '../../../../Utils/configToast'
import { REPORT } from '../../../../API/ReportAPI'
import { checkNetwork } from '../../../../Core/Utility'
import LoadingDefault from '../../../../Control/ItemLoading/LoadingDefault'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PROGRAM_KEY } from '../../../../Core/KEYs'
import { getDataPhotoByGUID } from '../../../../Controller/ReportController'
import moment from 'moment'
import _ from 'lodash'

const UploadDeliverySlipScreen = ({ navigation, route }) => {
    const { data, dataSend } = route?.params || {}
    const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const [dataModal, setDataModal] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [config, setConfig] = useState({})
    const [_mutate, setMutate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [dataPhoto, setDataPhoto] = useState([])
    const [photo, _setPhoto] = useState({ visible: false, data: [], index: 0 })
    const [deleteMode, setDeleteMode] = useState({ isDelete: false, dataDelete: [] })
    const [summaryData, setSummaryData] = useState({ totalQuantity: 0, totalAmount: 0, productCount: 0 })
    const insets = useSafeAreaInsets()

    const LoadData = async () => {
        await setConfig(JSON.parse(kpiinfo.reportItem || '{}'))
        const defaultModelList = JSON.parse(data?.modelList || '[]')
        const storageKey = `${PROGRAM_KEY.DELIVERY_SLIP}_${data?.shopId || shopinfo.shopId}_${TODAY}_${data?.programId}`
        const savedModelList = await AsyncStorage.getItem(storageKey)
        const modelList = savedModelList ? JSON.parse(savedModelList) : defaultModelList

        await setDataModal(modelList)
        await setDataMain(modelList)
        await LoadDataPhoto()
        await handlerSummaryData()
    }
    const LoadDataPhoto = async () => {
        await getDataPhotoByGUID(kpiinfo.id, data?.shopId || shopinfo.shopId, data.guid, setDataPhoto)
    }

    const UploadData = async () => {
        const isValid = validData()
        if (!isValid) return

        const isNetwork = await checkNetwork()
        if (!isNetwork) {
            toastError('Kết nối mạng', 'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.')
            return
        }

        alertConfirm('Xác nhận', 'Bạn có chắc chắn muốn gửi phiếu xuất không?', async () => {
            await setLoading(true)
            const submitData = {
                ...data,
                modelList: JSON.stringify(dataMain),
                amount: summaryData.totalAmount,
                totalQuantity: summaryData.totalQuantity
            }
            const result = await REPORT.UploadDataRaw_Realtime(submitData, data || shopinfo, kpiinfo.id)
            if (result.statusId == 200) {
                toastSuccess('Thông báo', result.messager || 'Gửi phiếu xuất thành công')
                await AsyncStorage.removeItem(`${PROGRAM_KEY.DELIVERY_SLIP}_${data?.shopId || shopinfo.shopId}_${TODAY}_${data?.programId}`)
                // 
                const mapDataVerify = JSON.parse(data.verifyList || '[]').map(item => {
                    if (item.id === 2) {
                        return { ...item, isDone: 1 }
                    }
                    return item
                })
                const dataUpdate = { ...data, verifyList: JSON.stringify(mapDataVerify) }
                DeviceEventEmitter.emit('UPDATE_LOCKED_DELIVERY_SLIP', { ...dataUpdate, isDoneDelivery: 1 }, dataSend)
                onBack()
            } else {
                toastError('Thông báo', result.messager || 'Có lỗi xảy ra')
            }
            await setLoading(false)
        })
    }
    const validData = () => {
        const photoList = dataPhoto.filter(it => it.photoType === `DELIVERY_SLIP_${data?.programId}`)
        const selectedProducts = dataMain.filter(it => it.isSelected)
        if (selectedProducts.length === 0) {
            toastError('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm')
            return false
        }
        for (const item of selectedProducts) {
            if ((item.Price || 0) <= 0) {
                toastError('Thông báo', `Sản phẩm "${item.ProductName}" có giá bằng 0, vui lòng kiểm tra lại`)
                return false
            }
            if (!item.Quantity || item.Quantity < 1) {
                toastError('Thông báo', `Vui lòng nhập số lượng cho sản phẩm "${item.ProductName}"`)
                return false
            }
        }
        if (photoList.length === 0) {
            toastError('Thông báo', 'Vui lòng chụp hình ảnh phiếu xuất')
            return false
        }
        return true
    }
    // Handler
    const handlerSummaryData = () => {
        const totalAmount = _.sumBy(dataMain, (e) => {
            if (e.isSelected) {
                return (e.Price || 0) * (e.Quantity || 0)
            }
            return 0
        })
        const totalQuantity = _.sumBy(dataMain, (e) => {
            if (e.isSelected) {
                return (e.Quantity || 0)
            }
            return 0
        })
        const productCount = _.countBy(dataMain, (e) => e.isSelected)

        setSummaryData({
            totalQuantity,
            totalAmount,
            productCount: productCount.true || 0
        })
    }
    const handlerShowImage = (photoItem, index) => {
        if (deleteMode.isDelete) {
            handlerSelectPhoto(photoItem)
        } else {
            photo.visible = true
            photo.data = dataPhoto
            photo.index = index
        }
        setMutate(e => !e)
    }
    const handlerCloseImage = () => {
        photo.visible = false
        photo.data = []
        photo.index = 0
        setMutate(e => !e)
    }
    const handlerSelectPhoto = async (photoItem) => {
        photoItem.isDelete = !photoItem.isDelete
        const dataDelete = dataPhoto.filter(it => it.isDelete)
        setDeleteMode({ isDelete: dataDelete.length > 0, dataDelete })
    }
    const handlerButtonCamera = () => {
        if (deleteMode.isDelete) {
            alertConfirm('Xóa hình ảnh', `Bạn có chắc chắn muốn xóa ${deleteMode.dataDelete.length} hình ảnh không ?`, async () => {
                await deletePhotoByList(deleteMode.dataDelete)
                await LoadDataPhoto()
                setDeleteMode({ isDelete: false, dataDelete: [] })
            }, async () => {
                setDeleteMode({ isDelete: false, dataDelete: [] })
                await LoadDataPhoto()
            })
        } else {
            optionConfirm("Hình ảnh", "Bạn có thể chụp ảnh hoặc chọn ảnh từ thư viện để thêm vào phiếu xuất", [
                { text: 'Huỷ', onPress: () => { }, style: 'cancel' },
                { text: 'Chụp hình', onPress: () => { handlerImage('CAMERA') }, style: 'default' },
                { text: 'Thư viện', onPress: () => { handlerImage('LIBRARY') }, style: 'default' }
            ])
        }
    }
    const handlerImage = async (type) => {
        const templateInfo = {
            shopId: data.shopId || shopinfo.shopId,
            shopCode: data.shopCode || shopinfo.shopCode,
            latitude: data.latitude || shopinfo.latitude,
            longitude: data.longitude || shopinfo.longitude,
            reportId: kpiinfo.id,
            photoDate: TODAY,
            photoTime: new Date().getTime(),
            photoType: `DELIVERY_SLIP_${data?.programId}`,
            photoDesc: data?.programName || 'Chụp hình phiếu xuất',
            dataUpload: 0,
            fileUpload: 0,
            photoPath: null,
            guid: data.guid,
            photoFullTime: moment().format("YYYY-MM-DD HH:mm:ss")
        }
        if (type === 'CAMERA') {
            await NativeCamera.cameraStart(templateInfo, async (result) => {
                if (result?.statusId === 200) {
                    await LoadDataPhoto()
                } else {
                    result.messager && toastError('Máy ảnh', result.messager)
                }
            })
        } else {
            await NativeCamera.imageGalleryLaunch(templateInfo, async (result) => {
                if (result?.statusId === 200) {
                    await LoadDataPhoto()
                } else {
                    result.messager && toastError('Thư viện', result.messager)
                }
            })
        }
    }
    // Actions
    const saveDataToStorage = async (dataUpdate) => {
        handlerSummaryData()
        await AsyncStorage.setItem(`${PROGRAM_KEY.DELIVERY_SLIP}_${data?.shopId || shopinfo.shopId}_${TODAY}_${data?.programId}`, JSON.stringify(dataUpdate || {}))
    }
    const onChangeQuantityForProduct = async (item, text) => {
        const newQuantity = parseInt(text) || 0
        const oldQuantity = item.Quantity || 0

        if (config.maxAmount) {
            const otherProductsAmount = summaryData.totalAmount - (item.Price || 0) * oldQuantity
            const newItemAmount = (item.Price || 0) * newQuantity
            const newTotalAmount = otherProductsAmount + newItemAmount

            if (newTotalAmount > config.maxAmount) {
                const remainingAmount = config.maxAmount - otherProductsAmount
                const maxQuantityAllowed = Math.floor(remainingAmount / (item.Price || 1))

                toastError('Thông báo', `Thành tiền không được vượt quá ${formatNumber(config.maxAmount, ',')} VNĐ.\nSố lượng tối đa: ${maxQuantityAllowed}`)
                return
            }
        }

        item.Quantity = newQuantity
        item.isSelected = newQuantity > 0
        setMutate(e => !e)
        await saveDataToStorage(dataMain)
    }
    const onSelectModel = async (item) => {
        if (item.isSelected || false) {
            item.isSelected = false
            item.Quantity = 0
            setMutate(e => !e)
            await saveDataToStorage(dataMain)
            return
        }

        if (config.maxAmount) {
            const newAmount = summaryData.totalAmount + (item.Price || 0) * 1
            if (newAmount > config.maxAmount) {
                toastError('Thông báo', `Không thể thêm sản phẩm. Thành tiền sẽ vượt quá ${formatNumber(config.maxAmount, ',')} VNĐ`)
                return
            }
        }

        item.isSelected = true
        item.Quantity = 1
        setMutate(e => !e)
        await saveDataToStorage(dataMain)
    }
    const onRemoveModel = async (item) => {
        item.isSelected = false
        item.Quantity = 0
        setMutate(e => !e)
        await saveDataToStorage(dataMain)
    }
    const onShowModelList = () => {
        SheetManager.show('list-model-sheet')
    }
    const onCloseModelList = async () => {
        SheetManager.hide('list-model-sheet')
    }
    const onSearchData = (text) => {
        const valueSearch = removeVietnameseTones(text).toLowerCase()
        if (!valueSearch) {
            setDataModal(dataMain)
            return
        }
        const dataSearch = _.filter(dataMain, product => {
            return removeVietnameseTones(product.ProductName).toLowerCase().includes(valueSearch) ||
                removeVietnameseTones(product.ProductCode).toLowerCase().includes(valueSearch)
        })
        setDataModal(dataSearch)
    }
    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [data])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentContainer: { flex: 1, backgroundColor: appcolor.light, padding: 12 },
        sectionTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, fontStyle: 'italic', marginTop: 8, marginBottom: 8 },
        selectButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, backgroundColor: appcolor.surface, marginBottom: 8 },
        selectButtonText: { fontSize: 13, color: appcolor.dark },
        selectedContainer: { marginTop: 8 },
        selectedItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: appcolor.light, padding: 12, borderRadius: 8, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: appcolor.grayLight },
        selectedItemInfo: { flex: 1 },
        selectedItemName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        selectedItemPrice: { fontSize: 12, color: appcolor.placeholderText },
        removeButton: { padding: 4 },
        modalContent: { backgroundColor: appcolor.light, borderTopLeftRadius: 16, borderTopRightRadius: 16, width: '100%', },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: appcolor.grayLight, },
        modalTitle: { fontSize: 16, fontWeight: fontWeightBold, color: appcolor.dark },
        modalDoneButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: appcolor.primary, borderRadius: 6 },
        modalDoneText: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.light },
        productItem: { flexDirection: 'row', alignItems: 'center', padding: 8, marginTop: 8, borderBottomWidth: 1, borderBottomColor: appcolor.grayLight, },
        checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: appcolor.grayLight, marginRight: 12, alignItems: 'center', justifyContent: 'center', },
        checkboxSelected: { backgroundColor: appcolor.primary, borderColor: appcolor.primary, },
        productInfo: { flex: 1 },
        productName: { fontSize: 13, color: appcolor.dark, fontWeight: fontWeightBold },
        productPrice: { fontSize: 11, color: appcolor.placeholderText },
        amountContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, backgroundColor: appcolor.surface, borderRadius: 8, marginTop: 8, },
        amountLabel: { fontSize: 13, color: appcolor.placeholderText },
        amountValue: { fontSize: 16, fontWeight: fontWeightBold, color: appcolor.primary },
        summaryContainer: { padding: 8, backgroundColor: appcolor.surface, borderRadius: 8 },
        summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
        summaryLabel: { fontSize: 12, color: appcolor.placeholderText },
        summaryValue: { fontSize: 12, color: appcolor.dark },
        number: { fontSize: 11, color: appcolor.dark, textAlign: 'center', fontWeight: fontWeightBold },
        viewNumber: { flexDirection: 'row', alignItems: 'center', },
        quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
        quantityLabel: { fontSize: 11, color: appcolor.placeholderText, marginRight: 8, textAlign: 'center' },
        itemAmount: { fontSize: 12, color: appcolor.success, marginLeft: 8, fontWeight: fontWeightBold, textAlign: 'center' },
        containerListProducts: { height: '100%', width: '100%', padding: 8, paddingTop: 0 },
        photoSection: { marginTop: 16 },
        photoRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: appcolor.grayLight, borderRadius: 8, padding: 8, marginTop: 8, height: 102 },
        captureCardHorizontal: { alignItems: 'center', justifyContent: 'center' },
        captureIconWrap: { width: 86, height: 86, borderRadius: 86, backgroundColor: appcolor.grayLight, alignItems: 'center', justifyContent: 'center', marginEnd: 16 },
        photoItem: { marginRight: 8, borderRadius: 86, overflow: 'hidden', backgroundColor: appcolor.surface },
        photoImage: { width: 86, height: 86, borderRadius: 86 },
        badgeText: { color: appcolor.light, fontSize: 11, fontWeight: fontWeightBold, textAlign: 'center' },
        badgeContainer: { position: 'absolute', top: 0, right: 0, backgroundColor: appcolor.red, borderRadius: 28, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
        deleteContainer: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.black, opacity: 0.8, zIndex: 1000 },
        loadingView: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: appcolor.light, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        productContentContainer: { paddingHorizontal: 12, paddingVertical: 8, flex: 1 }
    })
    const renderProductItem = ({ item }) => {
        const itemTotal = (item.Price || 0) * (parseInt(item.Quantity) || 0)
        const onPress = () => onSelectModel(item)
        const onChangeQuantity = (text) => onChangeQuantityForProduct(item, text)
        return (
            <TouchableOpacity style={styles.productItem} onPress={onPress}>
                <Icon name={item.isSelected ? 'check-box' : 'check-box-outline-blank'} size={24} color={appcolor.primary} style={{ marginEnd: 8 }} />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.ProductName}</Text>
                    <Text style={styles.productPrice}>{formatNumber(item.Price || 0, ',')} VNĐ</Text>
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>SL:</Text>
                        <FormGroup
                            selectTextOnFocus
                            isFocusable
                            containerStyle={{ width: 100, height: 30, alignItems: 'center' }}
                            keyboardType="numeric"
                            editable={true}
                            placeholder="Số lượng"
                            placeholderTextColor={appcolor.placeholderText}
                            inputStyle={{ textAlign: 'center', fontSize: 11, fontWeight: fontWeightBold, color: appcolor.dark }}
                            handleChangeForm={onChangeQuantity}
                            useClearAndroid={false}
                            value={formatNumber(item.Quantity, ',')}
                        />
                        <Text style={styles.itemAmount}>= {formatNumber(itemTotal, ',')} VNĐ</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    const renderSelectedProduct = ({ item, index }) => {
        const itemTotal = (item.Price || 0) * (parseInt(item.Quantity) || 0)
        const onRemove = () => onRemoveModel(item)
        const onChangeQuantity = (text) => onChangeQuantityForProduct(item, text)
        return (
            <View key={index} style={styles.selectedItem}>
                <View style={styles.selectedItemInfo}>
                    <View style={styles.viewNumber}>
                        <Text style={styles.number}>{index + 1}.</Text>
                        <Text style={styles.selectedItemName} numberOfLines={1}>{item.ProductName}</Text>
                    </View>
                    <Text style={styles.selectedItemPrice}>{formatNumber(item.Price || 0, ',')} VNĐ/sp</Text>
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>SL:</Text>
                        <FormGroup
                            selectTextOnFocus
                            isFocusable
                            containerStyle={{ width: 100, height: 30, alignItems: 'center' }}
                            keyboardType="numeric"
                            editable={true}
                            placeholder="Số lượng"
                            placeholderTextColor={appcolor.placeholderText}
                            inputStyle={{ textAlign: 'center', fontSize: 11, fontWeight: fontWeightBold, color: appcolor.dark }}
                            handleChangeForm={onChangeQuantity}
                            useClearAndroid={false}
                            value={formatNumber(item.Quantity, ',')}
                        />
                        <Text style={styles.itemAmount}>= {formatNumber(itemTotal, ',')} VNĐ</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                    <Icon name="close-circle" type="ionicon" size={22} color={appcolor.danger} />
                </TouchableOpacity>
            </View>
        )
    }
    const renderPhotoItem = ({ item, index }) => {
        const onPress = () => handlerShowImage(item, index)
        const onLongPress = () => handlerSelectPhoto(item)
        return (
            <TouchableOpacity key={index} onLongPress={onLongPress} onPress={onPress} activeOpacity={0.8} style={styles.photoItem}>
                {item.isDelete && (
                    <View style={styles.deleteContainer}>
                        <Icon name='checkmark-circle' type='ionicon' size={24} color={appcolor.primary} />
                    </View>
                )}
                <Image source={{ uri: checkLinkType(item.photoPath) }} style={styles.photoImage} />
            </TouchableOpacity>
        )
    }
    const renderItemSummary = (isVisible = false) => {
        if (!isVisible) return null
        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Số lượng sản phẩm:</Text>
                    <Text style={styles.summaryValue}>{summaryData.productCount} sản phẩm</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tổng số lượng:</Text>
                    <Text style={styles.summaryValue}>{summaryData.totalQuantity}</Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: appcolor.grayLight }]}>
                    <Text style={[styles.summaryLabel, { fontWeight: fontWeightBold, color: appcolor.dark }]}>Tổng thành tiền:</Text>
                    <Text style={styles.amountValue}>{formatNumber(summaryData.totalAmount, ',')} VNĐ</Text>
                </View>
            </View>
        )
    }

    if (loading) {
        return <LoadingDefault isLoading={loading} title={'Đang gửi phiếu xuất...'} styles={styles.loadingView} />
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={data?.programName || 'Phiếu xuất'}
                subTitle={data.shopName || ''}
                leftFunc={onBack}
                iconRight={'cloud-upload-alt'}
                rightFunc={UploadData}
            />
            <CustomListView
                data={dataMain?.filter(it => it.isSelected)}
                ListHeader={
                    <View>
                        <Text style={styles.sectionTitle}>Chọn sản phẩm</Text>
                        <TouchableOpacity style={styles.selectButton} onPress={onShowModelList}>
                            <Text style={styles.selectButtonText}>
                                {summaryData.productCount > 0 ? `Đã chọn ${summaryData.productCount} sản phẩm` : 'Nhấn để chọn sản phẩm'}
                            </Text>
                            <Icon name="chevron-down" type="feather" size={20} color={appcolor.placeholderText} />
                        </TouchableOpacity>
                        {renderItemSummary(summaryData.productCount > 0)}
                    </View>
                }
                renderItem={renderSelectedProduct}
                ListFooter={
                    <View style={{ paddingBottom: 32 }}>
                        <View style={styles.photoSection}>
                            <Text style={styles.sectionTitle}>Hình ảnh phiếu xuất</Text>
                            <View style={styles.photoRow}>
                                <TouchableOpacity style={styles.captureCardHorizontal} onPress={handlerButtonCamera}>
                                    <View style={styles.captureIconWrap}>
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>{deleteMode.isDelete ? deleteMode.dataDelete.length : (dataPhoto?.length || 0)}</Text>
                                        </View>
                                        <Icon name={deleteMode.isDelete ? 'trash' : 'camera'} type={'ionicon'} size={32} color={appcolor.primary} />
                                    </View>
                                </TouchableOpacity>
                                {/* Exception: use ScrollView for this horizontal photo strip because FlashList horizontal can fail to measure height in this layout */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ alignItems: 'center', paddingRight: 4 }}
                                    style={{ flex: 1, height: 86 }}
                                >
                                    {dataPhoto.map((item, index) => renderPhotoItem({ item, index }))}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                }
                containerStyle={styles.productContentContainer}
            />

            <ActionSheet
                id="list-model-sheet"
                containerStyle={{ backgroundColor: appcolor.light, }}
                statusBarTranslucent={false}
                drawUnderStatusBar
                safeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
                onBeforeClose={handlerSummaryData}
                onBeforeShow={handlerSummaryData}
            >
                <SafeAreaView edges={['top']} style={[styles.modalContent, { paddingTop: insets.top }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Danh sách sản phẩm</Text>
                        <TouchableOpacity style={styles.modalDoneButton} onPress={onCloseModelList}>
                            <Text style={styles.modalDoneText}>Xong</Text>
                        </TouchableOpacity>
                    </View>
                    <SearchData
                        placeholder="Tìm kiếm sản phẩm"
                        onSearchData={onSearchData}
                    />
                    <View style={styles.containerListProducts}>
                        {renderItemSummary(true)}
                        <CustomListView
                            data={dataModal}
                            renderItem={renderProductItem}
                        />
                    </View>
                    <Toast config={toastConfig} />
                </SafeAreaView>
            </ActionSheet>

            <ViewPictures
                visible={photo.visible}
                images={photo.data}
                initialIndex={photo.index}
                onSwipeDown={handlerCloseImage}
            />
        </View>
    )
}

export default UploadDeliverySlipScreen
