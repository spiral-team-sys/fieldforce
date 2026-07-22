import React, { useCallback, useEffect, useRef, useState } from "react"
import { FlatList, Image, LayoutAnimation, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native"
import { useSelector } from "react-redux"
import { HeaderCustom } from "../../Content/HeaderCustom"
import ActionSheet, { SheetManager } from "react-native-actions-sheet"
import FormGroup from "../../Content/FormGroup"
import { LoadingView } from "../../Control/ItemLoading"
import { getRequestFilterVerifySO } from "../../Controller/MasterController"
import { GetListSelloutVerify, SendAllVerify, SendSelloutVerify } from "../../Controller/SellOutController"
import { formatPhone, groupDataByKey, isPhone, Message, MessageInfo, ToastError, ToastSuccess } from "../../Core/Helper"
import { deviceHeight, deviceWidth } from "../Home"
import { YearMonthSelected } from "../../Control/YearMonthSelected"
import { URLDEFAULT } from "../../Core/URLs"
import { MultipleShowImage } from "../../Control/MultipleShowImage"
import { Badge, Icon } from '@rneui/themed'
import moment from "moment"
import { getPhotosByGuiId, getPhotosByGuiIdUpload } from "../../Controller/WorkController"
import { deletePhoto, InsertPhotosItem } from "../../Controller/PhotoController"
import { launchImageLibrary } from "react-native-image-picker"
import NativeCamera from "../../Control/NativeCamera"
import { checkNetwork } from "../../Core/Utility"
import { IconAnimation } from "../../Control/IconAnimation/IconAnimation"
import RNFS from "react-native-fs"
import { MutipleItemSelected } from "../../Control/MutipleItemSelected"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const VerifySelloutBK = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [data, setData] = useState({ dataSellOut: [], dataShow: [], listMaster: [] })
    const [filterMonth, setFilterMonth] = useState({ "year": new Date().getFullYear(), "yearname": `Năm ${new Date().getFullYear()}`, "month": new Date().getMonth() + 1, "monthname": `Tháng ${new Date().getMonth() + 1}`, "loadYearMonth": false, "jsonFilter": {} })
    const LoadData = async (year, month) => {
        await setLoading(true)
        // const listMaster = await getRequestFilterVerifySO()
        const dataSellOut = await GetListSelloutVerify(month, year)
        if (dataSellOut.statusId == 200) {
            const dataMaster = JSON.parse(dataSellOut.data[0]?.masterList || '[]')

            await setData({ dataSellOut: dataSellOut.data, dataFilter: dataSellOut.data, listMaster: dataMaster })
        } else {
            ToastError(`Lỗi kết nối hệ thống : ${dataSellOut.messager}`, "Lỗi", 'top')
        }
        await setLoading(false)
    }
    useEffect(() => {
        LoadData(filterMonth.year, filterMonth.month)
        return () => false
    }, [])

    const onFilterChange = (search) => {
        if (search.year && search.month) {
            filterMonth.jsonFilter = search
            // setCurrentItem({})
            submitSearch()
        }
    }
    const submitSearch = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (Object.keys(filterMonth.jsonFilter).length > 0) {
            await setFilterMonth({ ...filterMonth.jsonFilter })
            await LoadData(filterMonth.jsonFilter.year, filterMonth.jsonFilter.month)
        } else {
            await setFilterInvoice({ ...filterMonth, loadYearMonth: false })
            await LoadData(filterMonth.year, filterMonth.month)
        }
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.surface },

    })

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Kiểm tra xác thực hoá đơn'}
                iconRight='cloud-upload-alt'
                iconMiddle='search'
                // rightFunc={UploadData}
                middleFunc={() => SheetManager.show('filterMonth')}
                leftFunc={() => navigation.goBack()}
            />
            <LoadingView isLoading={isLoading} title={'Đang cập nhật dữ liệu'} />
            <View style={{ flex: 1 }}>
                {
                    !isLoading && data.listMaster?.length > 0 &&
                    <ViewListItemVerify data={data} styles={styles} navigation={navigation} LoadDataMain={LoadData} filterMonth={filterMonth} />
                }
            </View>
            <ActionSheet
                id={'filterMonth'}
            >
                <View style={{ height: 200 }} >
                    <YearMonthSelected option={filterMonth} onYearMonth={(search) => onFilterChange(search)} numMonth={4} />
                </View>
            </ActionSheet>
        </View>
    )
}

const ViewListItemVerify = ({ data, styles, navigation, LoadDataMain, filterMonth }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [listItemByTab, setListItemByTab] = useState([])
    const [listItemByTabF, setListItemByTabF] = useState([])
    const [listTab, setListTab] = useState([])
    const [listHistory, setListHistory] = useState([])
    const [dataPhoto, setDataPhoto] = useState({ listPhoto: [], indexImage: 0, mode: 'ITEM' })
    const [visible, setVisible] = useState(false)
    const [currentInfo, setCurrentInfo] = useState({ currentItem: {}, indexItem: 0 })
    const [_, setMutate] = useState(false)
    const [currentTab, setCurrentTab] = useState({})
    const [search, setSearch] = useState('')
    const tabRef = useRef()
    const [isSendData, setSendData] = useState(false)


    const loadData = async () => {
        await loadTab()
        const dataByTab = data.dataSellOut.filter(it => it.status === currentTab.id)
        const { arr } = groupDataByKey({
            arr: dataByTab,
            key: 'shopId',
            keyLayer2: 'sellDate'
        })
        await setListItemByTab(arr)
        await setListItemByTabF(arr)
    }
    const loadTab = () => {
        const listTab = []
        data.listMaster?.forEach(it => {
            const itemRow = data.dataSellOut.filter(item => item.status == it.id).length
            listTab.push({ ...it, totalRow: itemRow })
        })
        const itemTab = (currentTab.id || currentTab?.id == 0) ? currentTab : listTab[0]
        setCurrentTab(itemTab)
        setListTab(listTab)
    }

    useEffect(() => {
        loadData()
        return () => false
    }, [currentTab, data])

    const handleShowHistory = async (item, index) => {
        const list = JSON.parse(item.listResult || '[]')
        if (list.length > 0) {
            await setListHistory(JSON.parse(item.listResult || '[]'))
            await SheetManager.show('historyVerify')
        }
    }
    const handleShowNoteCancel = async (item, index) => {
        await setCurrentInfo({ currentItem: item, indexItem: index })
        await SheetManager.show('CancelBill')
    }

    const handleSelectImage = async (listPhotoItem, indexImage) => {
        setDataPhoto({ listPhoto: listPhotoItem, indexImage: indexImage, mode: 'ITEM' })
        setVisible(true)
    }

    const handleSelectImageVerify = async (listPhoto, indexImage) => {
        await SheetManager.hide('historyVerify')
        await setDataPhoto({ listPhoto: listPhoto, indexImage: indexImage, mode: 'HISTORY' })
        await setVisible(true)
    }
    const handleSelectImageEdit = async (listPhoto, indexImage) => {
        await SheetManager.hide('takePhotoSheet')
        await setDataPhoto({ listPhoto: listPhoto, indexImage: indexImage, mode: 'EDIT' })
        await setVisible(true)
    }
    const handleDeletePhoto = async (listPhoto, itemPhoto) => {
        deletePhoto(itemPhoto)
        const listAfterDelete = listPhoto.filter(it => it.photoPath !== itemPhoto.photoPath)
        const indexItemF = data.dataFilter.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        data.dataFilter[indexItemF].listPhoto = JSON.stringify(listAfterDelete)
        await setMutate(e => !e)

    }
    const handleCloseImage = async () => {
        setVisible(false)
        if (dataPhoto.mode === 'HISTORY') {
            await SheetManager.show('historyVerify')
        } else if (dataPhoto.mode === 'EDIT') {
            await SheetManager.show('takePhotoSheet')
        }
    }

    const handleShowTakePhoto = async (item, index) => {
        await setCurrentInfo({ currentItem: item, indexItem: index })
        await SheetManager.show('takePhotoSheet')
    }

    const scrollOnPress = async (item, index) => {
        tabRef.current.scrollToIndex({
            animated: true,
            index: index,
            viewPosition: 0.5
        })
    }

    const handleChangeTab = (item, index) => {
        scrollOnPress(item, index)
        setSearch('')
        setCurrentTab(item)
    }

    const handleSendItem = (type, noteCancel) => {
        const listPhoto = JSON.parse(currentInfo.currentItem.listPhoto || '[]')
        const listPhotoF = listPhoto.filter(it => it.isPhotoSystem !== 1)
        const listEdit = JSON.parse(currentInfo.currentItem.listMasterEdit || '[]')
        const itemConfig = JSON.parse(currentInfo.currentItem.config || '[]')
        if (type == 'submit') {
            if (((currentInfo.currentItem.status !== 4 && listPhotoF.length == 0) || (currentInfo.currentItem?.status == 4 && listPhoto.length == 0)) && currentInfo.currentItem?.isLockCheckImage !== 1) {
                MessageInfo('Bạn phải chụp hình hoá đơn trước khi gửi!')
                return
            }
            if ((currentInfo.currentItem.status !== 4 && listPhotoF.length < currentInfo.currentItem.numPhoto) || (currentInfo.currentItem?.status == 4 && listPhoto.length < currentInfo?.currentItem?.numPhoto)) {
                MessageInfo(`Số lượng hình ảnh phải tối thiểu : ${currentInfo.currentItem.numPhoto} hình!!`)
                return
            }
            for (let index = 0; index < listEdit.length; index++) {
                const element = listEdit[index];
                if (element.ref_Name === 'serial' && (element?.isRequired === 1 || element.isRequired === 3) && (currentInfo.currentItem?.serial === null || currentInfo?.currentItem?.serial === '')) {
                    MessageInfo(`Số Seri không được để trống`)
                    return;
                }
                if (element.ref_Name === 'serial' && (element?.isRequired !== 2 && element.isRequired !== 3) && currentInfo.currentItem?.serial !== null && currentInfo?.currentItem?.serial !== "" && currentInfo?.currentItem?.serial?.length !== element.numberValue) {
                    MessageInfo(`Số Seri chưa đúng định dạng, Seri phải đủ ${element.numberValue} kí tự`)
                    return;
                }
                if (element.ref_Name === 'serial' && currentInfo?.currentItem?.serial !== null && currentInfo.currentItem.serial !== "") {
                    if (itemConfig?.serialOnlyNumber == 1 && currentInfo?.currentItem?.serial.match(/^[a-zA-Z]+$/)) {
                        MessageInfo(`Số Seri chỉ chứa số và không chứa kí tự hoặc kí tự đặc biệt!`)
                        return;
                    }
                }
                if (element.ref_Name === 'itemClassify' && element.isRequired === 1 && (currentInfo?.currentItem?.itemClassify === null || currentInfo?.currentItem?.itemClassify === '' || currentInfo?.currentItem?.itemClassify === 'null')) {
                    MessageInfo(`Bạn chưa chọn loại hàng hoá`)
                    return;
                }
                if (element.ref_Name === 'statusVerify' && element.isRequired === 1 && (currentInfo?.currentItem?.statusVerify === null || currentInfo?.currentItem?.statusVerify === '' || currentInfo?.currentItem?.statusVerify === 'null')) {
                    MessageInfo(`Bạn chưa chọn Trạng thái hàng hoá`)
                    return;
                }

                if (element.ref_Name === 'customer' && element.isRequired === 1
                    && (currentInfo.currentItem?.customer == null || currentInfo.currentItem?.customer == '' || currentInfo.currentItem?.customer?.length < element.numberValue)) {
                    if (currentInfo.currentItem?.customer?.length < element.numberValue) {
                        MessageInfo(`Tên khách hàng ngắn, nhập ít nhất ${element.numberValue} ký tự`)
                        return;
                    }
                }
                if (element.ref_Name === 'phone' && element.isRequired === 1 && (currentInfo.currentItem?.phone === null || currentInfo.currentItem?.phone === '') && element.isRequired === 1) {
                    MessageInfo(`Số điện thoại không được để trống`)
                    return;
                }
                if (currentInfo.currentItem?.phone !== null && currentInfo.currentItem?.phone !== '') {
                    const checkPhone = isPhone(currentInfo.currentItem?.phone)
                    if (!checkPhone) {
                        MessageInfo(`Số điện thoại không đúng định dạng`)
                        return
                    }
                }
            }
        } else {
            if (noteCancel == undefined || noteCancel == null || noteCancel == '') {
                MessageInfo(`Bạn phải nhập ghi chú trước khi huỷ hoá đơn!`)
                return;
            }
            if (noteCancel?.length < 5) {
                MessageInfo(`Ghi chú phải lớn hơn 5 ký tự!`)
                return;
            }
        }


        Message('Chú ý', `Bạn có chắc chắn muốn ${type == 'submit' ? 'gửi lại' : 'huỷ'} hoá đơn?`,
            async () => {
                await setSendData(true)
                const isNetwork = await checkNetwork();
                if (!isNetwork) {
                    await MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.", 'Kết nối mạng', 'top');
                    await setSendData(false)
                    return
                }
                await SendAllVerify(currentInfo.currentItem, listPhoto, type, noteCancel, async (result) => {

                    if (result.status === 200) {
                        if (type == 'submit') {
                            if (currentInfo.currentItem.status !== 4) {
                                await handleChangeStatus(2)
                            } else {
                                if (currentInfo.currentItem.serial !== null && currentInfo.currentItem.serial !== undefined && currentInfo.currentItem.serial !== '') {
                                    await handleChangeStatus(0)
                                } else {
                                    await handleChangeStatus(1)
                                }
                            }
                            await SheetManager.hide('takePhotoSheet')
                        } else if (type == 'cancel') {
                            await handleChangeStatus(-2)
                            await SheetManager.hide('CancelBill')
                        }
                        await loadData()
                        await MessageInfo(result.messeger)
                        await setSendData(false)
                        // await setIsSend(true)
                    } else {
                        await MessageInfo(result.messeger)
                        await setSendData(false)
                    }
                })
            })
    }
    const handleChangeStatus = (statusInfo) => {
        const indexItem = data.dataSellOut.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        const indexItemF = data.dataFilter.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        const indexItemByTab = listItemByTab.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        const indexItemByTabF = listItemByTabF.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        if (statusInfo == 2 || statusInfo == -2) {
            data.dataSellOut[indexItem].status = statusInfo
            data.dataSellOut[indexItem].isShowSend = 0
            data.dataSellOut[indexItem].isEditInfo = 0

            data.dataFilter[indexItemF].status = statusInfo
            data.dataFilter[indexItemF].isShowSend = 0
            data.dataFilter[indexItemF].isEditInfo = 0

            listItemByTab[indexItemByTab].status = statusInfo
            listItemByTab[indexItemByTab].isShowSend = 0
            listItemByTab[indexItemByTab].isEditInfo = 0

            listItemByTabF[indexItemByTabF].status = statusInfo
            listItemByTabF[indexItemByTabF].isShowSend = 0
            listItemByTabF[indexItemByTabF].isEditInfo = 0
        } else {
            data.dataSellOut[indexItem].isEditInfo = statusInfo
            data.dataFilter[indexItemF].isEditInfo = statusInfo
            listItemByTab[indexItemByTab].isEditInfo = statusInfo
            listItemByTabF[indexItemByTabF].isEditInfo = statusInfo
        }
        const listSystemPhoto = JSON.parse(data.dataSellOut[indexItem].listPhoto || '[]')
        if (listSystemPhoto.length > 0) {
            listSystemPhoto.map(it => {
                let ImgName = it.photoPath.substring(it.photoPath.lastIndexOf('/') + 1, it.photoPath.length);
                let fileName = '/uploaded/' + it.photoDate + '/' + ImgName
                it.photoPath = fileName
                it.isSystemPhoto = 1
            })
            data.dataSellOut[indexItem].listPhoto = JSON.stringify(listSystemPhoto)
            data.dataFilter[indexItemF].listPhoto = JSON.stringify(listSystemPhoto)
            listItemByTab[indexItemByTab].listPhoto = JSON.stringify(listSystemPhoto)
            listItemByTabF[indexItemByTabF].listPhoto = JSON.stringify(listSystemPhoto)
        }
    }

    const renderItem = ({ item, index }) => {
        const onSelectHistory = () => {
            handleShowHistory(item, index)
        }
        const onSelectCancel = () => {
            handleShowNoteCancel(item, index)
        }

        const keyLayer2 = item[`${item.sellDate}${item.shopId}`];
        return (
            <View key={'ItemSell_' + index} style={{ paddingHorizontal: 8 }}>
                {
                    item.isParent &&
                    <View style={{ padding: 8 }}>
                        <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.tomato }}>{item.shopName}</Text>
                    </View>
                }
                {
                    keyLayer2 &&
                    <View style={{ padding: 6, backgroundColor: appcolor.greydark, borderRadius: 6, marginBottom: 5 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.white }}>{item.sellDate}</Text>
                    </View>
                }
                <View style={{ backgroundColor: appcolor.success, paddingTop: 2, borderRadius: 8, flexDirection: 'row', minHeight: 120, marginBottom: 5 }}>
                    <View style={{ borderLeftWidth: 0.5, borderBottomWidth: 0.5, borderColor: appcolor.greylight, backgroundColor: appcolor.light, width: '85%', padding: 8, borderBottomLeftRadius: 8, borderTopLeftRadius: 8, justifyContent: 'center' }}>
                        {(item.shopName != null && item.shopName != 'null' && item.shopName != undefined && item.shopName != '') && <Text style={{ fontWeight: '800', fontSize: 12, color: appcolor.dark }}>{`Cửa hàng : `}{item.shopName}</Text>}
                        {(item.sellDate != null && item.sellDate != 'null' && item.sellDate != undefined && item.sellDate != '') && <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Ngày bán : `}{item.sellDate}</Text>}
                        {(item.productName != null && item.productName != 'null' && item.productName != undefined && item.productName != '') && <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Sản phẩm : `}{item.productName}</Text>}
                        {(item.quantity != null && item.quantity != 'null' && item.quantity != undefined && item.quantity != '') && <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Số lượng : `}{item.quantity}</Text>}
                        {(item.serial != null && item.serial != 'null' && item.serial != undefined && item.serial != '') && <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Số serial : `}{item.serial}</Text>}
                        {(item.customer != null && item.customer != 'null' && item.customer != undefined && item.customer != '') && <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Khách hàng : `}{item.customer}</Text>}
                        {(item.phone != null && item.phone != 'null' && item.phone != undefined && item.phone != '') && <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Số điện thoại : `}{item.phone}</Text>}
                        {(item.address != null && item.address != 'null' && item.address != undefined && item.address != '') && <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Địa chỉ : `}{item.address}</Text>}
                        {(item.dealineNote != null && item.dealineNote != 'null' && item.dealineNote != undefined && item.dealineNote != '') && <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.danger }}>{`Admin ghi chú : `}{item.dealineNote}</Text>}
                        {(item.confirmedNote != null && item.confirmedNote != 'null' && item.confirmedNote != undefined && item.confirmedNote != '') && <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.danger }}>{`Lí do từ chối : `}{item.confirmedNote}</Text>}
                        <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{`Hình đã chụp : `}{JSON.parse(item.listPhoto).length}</Text>
                        <View style={{}}>
                            <ShowPhotoItem itemSell={item} listPhoto={JSON.parse(item.listPhoto)} handleSelectImage={handleSelectImage} handleDeletePhoto={handleDeletePhoto} isSendData={isSendData} />
                        </View>
                        {
                            item.dealine && <View style={{ flexDirection: 'row', padding: 3 }}>
                                <Icon color={appcolor.red} name={'clock'} type={'font-awesome-5'} size={14} />
                                <Text style={{ fontSize: 12, color: appcolor.red, fontWeight: '600', paddingLeft: 5 }} >Thời hạn : {moment(item.dealine).format('YYYY-MM-DD')}{item.isEndDeadline === 1 && ` -> ${item.endTitle}`}</Text>
                            </View>
                        }
                    </View>
                    <View style={{ justifyContent: 'space-between', width: '15%', }}>
                        {/* <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontWeight: '400', fontSize: 16, color: appcolor.white }}>{item.quantity}</Text>
                        </View> */}
                        {
                            item.isShowCancel == 1 &&
                            <TouchableOpacity key={'CancelBill'} onPress={onSelectCancel} style={{ backgroundColor: appcolor.light, borderTopRightRadius: 8, borderBottomRightRadius: 8, flex: 1, marginRight: 3, marginBottom: 2, marginTop: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon
                                    color={appcolor.danger}
                                    name={'trash-alt'}
                                    type={'font-awesome-5'}
                                    size={20}
                                />
                            </TouchableOpacity>
                        }
                        {
                            item.isHideHistory !== 1 &&
                            <TouchableOpacity key={'showHistory'} onPress={onSelectHistory} style={{ backgroundColor: appcolor.light, borderTopRightRadius: 8, borderBottomRightRadius: 8, flex: 1, marginRight: 3, marginBottom: 2, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon
                                    color={appcolor.primary}
                                    name={'history'}
                                    type={'font-awesome-5'}
                                    size={20}
                                />
                                <Badge
                                    containerStyle={{ position: 'absolute', top: 4, end: 4, }}
                                    textStyle={{ color: appcolor.white, fontSize: 9, fontWeight: '500' }}
                                    badgeStyle={{ minWidth: 16, height: 16, backgroundColor: appcolor.danger, borderRadius: 50 }}
                                    value={JSON.parse(item.listResult || '[]').length}
                                />
                            </TouchableOpacity>
                        }
                        <TouchableOpacity key={'takePictureBTT'}
                            onPress={() => handleShowTakePhoto(item, index)}
                            style={{ backgroundColor: appcolor.light, borderTopRightRadius: 8, borderBottomRightRadius: 8, flex: 1, marginRight: 3, marginBottom: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon
                                color={appcolor.primary}
                                name={'edit'}
                                type={'font-awesome-5'}
                                size={20}
                            />
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        )
    }

    const takePhoto = async () => {

        const photoinfo = {
            "shopId": currentInfo.currentItem.shopId,
            "shopCode": currentInfo.currentItem.shopCode,
            "reportId": 5,
            "photoDate": moment(new Date()).format("YYYYMMDD"),
            "photoTime": new Date().getTime(),
            "photoType": "SELLOUT_INVOICE",
            "photoDesc": 'VERIFY',
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "guid": currentInfo.currentItem.guiId,
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        }
        await NativeCamera.cameraStart(photoinfo, loadListPhoto);

    };

    const loadListPhoto = async () => {
        const listPhoto = await getPhotosByGuiIdUpload(currentInfo.currentItem.guiId, currentInfo.currentItem.shopId)
        const indexItemF = data.dataFilter.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        data.dataFilter[indexItemF].listPhoto = JSON.stringify([...JSON.parse(data.dataFilter[indexItemF].listPhotoBackup || '[]'), ...listPhoto])

        // const indexItem = data.dataSellOut.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        // const indexItemByTab = listItemByTab.findIndex(it => it.detailId == currentInfo.currentItem.detailId)
        // data.dataSellOut[indexItem].listPhoto = JSON.stringify([...JSON.parse(data.dataSellOut[indexItem]?.listPhoto || '[]'), ...listPhoto])
        // listItemByTab[indexItemByTab].listPhoto = JSON.stringify([...JSON.parse(listItemByTab[indexItemByTab]?.listPhoto || '[]'), ...listPhoto])
        await setMutate(e => !e)
        // SheetManager.show('takePhotoSheet')
    }


    const uploadFilePhoto = async () => {
        let photoinfo = {};
        let options = {
            mediaType: 'photo', quality: 1, includeBase64: true, selectionLimit: 10
        };
        await launchImageLibrary(options, async (response) => {
            if (!response.didCancel) {
                let { assets } = await response || []
                if (assets !== undefined) {
                    await assets?.forEach(async res => {
                        let timePhotoInsert = await new Date().getTime() + (Math.floor(Math.random() * 112) + 1)
                        const newImageUrl = await NativeCamera.resizeImage(await res.uri)
                        photoinfo = {
                            shopId: currentInfo.currentItem.shopId,
                            shopCode: currentInfo.currentItem.shopCode,
                            reportId: 5,
                            photoPath: newImageUrl?.uri || res.uri,
                            photoDate: moment(new Date()).format("YYYYMMDD"),
                            photoType: "SELLOUT_INVOICE",
                            photoDesc: 'VERIFY',
                            photoTime: timePhotoInsert,
                            fileUpload: 0,
                            dataUpload: 0,
                            guid: currentInfo.currentItem.guiId,
                            photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
                        }

                        await InsertPhotosItem(photoinfo);
                        await loadListPhoto()
                    });
                }
            }
        });
    }

    const handlerSearch = async (text) => {
        if (text.length > 0) {
            let filterList = listItemByTabF.filter(i => i.productName?.toLowerCase().match(text.toLowerCase()))
            setListItemByTab(filterList)
            setSearch(text)
        } else {
            setListItemByTab(listItemByTabF)
            setSearch('')
        }
    }

    const handlerAddPhoto = (type) => {
        if (currentInfo.currentItem.isEditInfo == 2 || currentInfo.currentItem.isEditInfo == 3) {
            if (type === 'TAKEPHOTO') {
                takePhoto()
            } else if (type === 'UPLOADFILE') {
                uploadFilePhoto()
            }
        }
    }

    return (
        <View style={styles.mainContainer}>
            {
                listTab?.length > 1 &&
                <View style={{ width: deviceWidth, flexDirection: 'row', justifyContent: 'space-between', justifyContent: 'center', paddingVertical: 10 }}>
                    <FlatList
                        key={'listTab'}
                        showsHorizontalScrollIndicator={false}
                        ref={tabRef}
                        style={{ flex: 1, marginHorizontal: 10, paddingTop: 4 }}
                        horizontal
                        data={listTab}

                        renderItem={({ item, index }) => {

                            return (
                                <TouchableOpacity
                                    key={item.id} style={{ justifyContent: 'center', alignItems: 'center', padding: 6, marginRight: 13, borderRadius: 6, backgroundColor: currentTab.id == item.id ? appcolor.primary : appcolor.light }}
                                    onPress={() => handleChangeTab(item, index)}
                                >
                                    <Badge
                                        containerStyle={{ position: 'absolute', top: 0, end: -10, }}
                                        textStyle={{ color: appcolor.white, fontSize: 10, fontWeight: '500' }}
                                        badgeStyle={{ minWidth: 15, height: 15, backgroundColor: appcolor.danger, borderRadius: 50 }}
                                        value={item.totalRow}
                                    />
                                    <Text style={{ fontWeight: '500', fontSize: 14, color: currentTab.id == item.id ? appcolor.white : appcolor.dark }}>{item.name}</Text>
                                </TouchableOpacity>
                            )
                        }}
                    />
                </View>
            }
            <FormGroup
                containerStyle={{ backgroundColor: appcolor.grayLight, margin: 5, alignSelf: 'center' }}
                inputStyle={{ fontSize: 13, color: appcolor.dark, }}
                placeholder='Tìm kiếm' editable
                iconName='search'
                value={search}
                handleChangeForm={handlerSearch}
            />

            {
                listItemByTab.length > 0 && currentTab.id !== undefined &&
                <FlatList
                    showsVerticalScrollIndicator={false}
                    key={'listItem'}
                    keyExtractor={(_, index) => index.toString()}
                    data={listItemByTab}
                    refreshControl={<RefreshControl
                        refreshing={false}
                        onRefresh={() => LoadDataMain(filterMonth.year, filterMonth.month)}
                    />}
                    renderItem={renderItem}
                    ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
                />
            }
            <ActionSheet
                id={'historyVerify'}
                gestureEnabled
                // style={{ backgroundColor: appcolor.light }}
                containerStyle={{ backgroundColor: appcolor.light }}
            >
                <View style={{ height: deviceHeight - 200, backgroundColor: appcolor.light }} >
                    <ViewHistoryVerify listHistory={listHistory} handleSelectImageVerify={handleSelectImageVerify} />
                </View>
            </ActionSheet>
            <ActionSheet
                id={'CancelBill'}
                gestureEnabled
                // style={{ backgroundColor: appcolor.light }}
                containerStyle={{ backgroundColor: appcolor.light }}
            >
                <View style={{ height: 300, backgroundColor: appcolor.light }} >
                    <ViewCancelNote data={data} itemInfo={currentInfo} handleSendItem={handleSendItem} />
                </View>
            </ActionSheet>

            <ActionSheet
                gestureEnabled={false}
                closeOnTouchBackdrop={isSendData == false ? true : false}
                id={'takePhotoSheet'}
                containerStyle={{ backgroundColor: appcolor.light }}
            >
                <View style={{ height: deviceHeight * 0.6, padding: 10, backgroundColor: appcolor.light }} >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                        <TouchableOpacity
                            onPress={() => isSendData == false ? SheetManager.hide('takePhotoSheet') : null}
                            style={{ height: 30, width: 100, borderRadius: 6, borderWidth: 0.8, borderColor: appcolor.danger, opacity: isSendData ? 0.5 : 1, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={{ fontWeight: '500', fontSize: 14, color: 'red', textAlign: 'center' }}>Đóng</Text>
                        </TouchableOpacity>
                        {
                            (currentInfo.currentItem.isEditInfo == 2 || currentInfo.currentItem.isEditInfo == 3) && isSendData == false &&
                            <View style={{ width: '50%', flexDirection: 'row', justifyContent: 'flex-end', }}>
                                <TouchableOpacity
                                    style={{ padding: 5, width: 50, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 10, backgroundColor: appcolor.primary, marginRight: 5 }}
                                    onPress={() => handlerAddPhoto('TAKEPHOTO')}>
                                    <Icon color={appcolor.white} name='camera' type='ionicon' size={18} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ padding: 5, width: 50, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 10, backgroundColor: appcolor.primary, }}
                                    onPress={() => handlerAddPhoto('UPLOADFILE')}
                                >
                                    <Icon color={appcolor.white} name='attach' type='ionicon' size={18} />
                                </TouchableOpacity>
                            </View>
                        }
                    </View>

                    <View style={{}}>
                        <ShowPhotoItem itemSell={currentInfo?.currentItem} listPhoto={JSON.parse(currentInfo?.currentItem?.listPhoto || '[]')} handleSelectImage={handleSelectImageEdit} handleDeletePhoto={handleDeletePhoto} type={'EDIT'} isSendData={isSendData} />
                    </View>
                    <View>
                        <ViewInputSellout data={data} itemInfo={currentInfo} handleSendItem={handleSendItem} isSendData={isSendData} />
                    </View>
                </View>
            </ActionSheet>
            <Modal
                id={'imageSheet'}
                visible={visible}
                containerStyle={{ flex: 1 }}
            >
                <MultipleShowImage key={'ShowItemImage'} listItem={dataPhoto.listPhoto} closeShowImage={() => handleCloseImage()} indexItem={dataPhoto.indexImage} />
            </Modal>
        </View >
    )
}
const ViewCancelNote = ({ data, itemInfo, handleSendItem }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_, setMutate] = useState(false)
    const [noteCancel, setNoteCancel] = useState(null)

    const handleChangeNote = (text) => {
        setNoteCancel(text)
    }

    const onCancelItem = () => {
        handleSendItem('cancel', noteCancel)
    }

    return (
        <View style={{ padding: 5 }}>
            <FormGroup
                title={'Ghi chú huỷ hoá đơn'}
                key={'CancelBill_' + itemInfo.indexItem}
                value={noteCancel}
                editable
                handleChangeForm={text => handleChangeNote(text)}
                onClearTextAndroid={() => handleChangeNote(null)}
                keyboardType={'default'}
                placeholder={'Nhập ghi chú ở đây'}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 6, paddingTop: 2 }}>
                <TouchableOpacity onPress={onCancelItem} style={{ padding: 10, borderRadius: 5, backgroundColor: appcolor.tomato, justifyContent: 'center', alignItems: 'center' }} >
                    <Text style={{ fontSize: 14, color: appcolor.white, fontWeight: '600' }} >Huỷ hoá đơn</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}
const ViewInputSellout = ({ data, itemInfo, handleSendItem, isSendData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [listEdit, setListEdit] = useState(JSON.parse(itemInfo.currentItem.listMasterEdit || '[]'))
    const itemConfig = JSON.parse(itemInfo.currentItem.config || '[]')
    const [_, setMutate] = useState(false)
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        isSending !== isSendData && setIsSending(isSendData)
        return () => false
    }, [isSendData])

    const handleOnChangeInput = (itemM, text) => {
        if (itemInfo.currentItem.isEditInfo !== 0) {
            if (itemM.ref_Name === 'serial') {
                if (itemConfig?.serialOnlyNumber == 1 && (itemInfo.currentItem.isEditInfo == 1 || itemInfo.currentItem.isEditInfo == 3)) {
                    if (text !== null) {
                        let textValue = text.replace(/\D/g, "")
                        itemInfo.currentItem[itemM.ref_Name] = textValue
                    } else {
                        itemInfo.currentItem[itemM.ref_Name] = null
                    }
                }
            } else if (itemM.ref_Code === 'phone') {
                if (text !== null) {
                    let textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
                    if (text?.length == 11)
                        textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');

                    (!itemInfo.currentItem[itemM.ref_Name] || textValue == '' || textValue?.length < 12) && (itemInfo.currentItem[itemM.ref_Name] = textValue)
                } else {
                    itemInfo.currentItem[itemM.ref_Name] = null
                }
            } else {
                itemInfo.currentItem[itemM.ref_Name] = text
            }
            setMutate(e => !e)
        }
    }
    const onSendItem = () => {
        if (itemInfo.currentItem.isEditInfo !== 0) {
            handleSendItem('submit')
        }
    }
    const onCancelItem = () => {
        if (itemInfo.currentItem.isEditInfo !== 0) {
            handleSendItem('cancel')
        }
    }
    const handlerSelectItem = (itemSelect, typeItem) => {
        itemInfo.currentItem[typeItem] = itemSelect.itemName
        // setSellItem({ ...sellItem, [typeItem]: itemSelect.itemName })
        setMutate(e => !e)
    }
    const displayItem = () => {
        return (
            listEdit?.map((itemM, index) => {
                switch (itemM.ref_Code) {
                    case "template":
                        return <FormGroup
                            title={itemM.nameVN}
                            key={index + '_' + itemM.ref_Name}
                            value={itemConfig.serialOnlyNumber == 1 ? (itemInfo.currentItem[itemM.ref_Name]?.replace(/\D/g, "") || '') : (itemInfo.currentItem[itemM.ref_Name] || '')}
                            handleChangeForm={text => handleOnChangeInput(itemM, text)}
                            onClearTextAndroid={() => handleOnChangeInput(itemM, null)}
                            keyboardType={itemConfig.serialOnlyNumber ? 'numeric' : 'default'}
                            placeholder={itemM.textValue}
                            maxLength={itemM.numberValue}
                            editable={itemM.ref_Id === 1 ? false : true} />
                    case "phone":
                        return <FormGroup title={itemM.nameVN}
                            key={itemM.ref_Name}
                            value={formatPhone(itemInfo.currentItem[itemM.ref_Name] || '')}
                            onClearTextAndroid={() => handleOnChangeInput(itemM, null)}
                            handleChangeForm={text => handleOnChangeInput(itemM, text)}
                            placeholder={itemM.textValue}
                            keyboardType={'phone-pad'}
                            maxLength={itemM.numberValue}
                            editable={itemM.ref_Id === 1 ? false : true} />
                    case "text":
                        return <FormGroup
                            title={itemM.nameVN}
                            key={index + '_' + itemM.ref_Name}
                            value={itemInfo.currentItem[itemM.ref_Name] || ''}
                            handleChangeForm={text => handleOnChangeInput(itemM, text)}
                            onClearTextAndroid={() => handleOnChangeInput(itemM, null)}
                            keyboardType={'default'}
                            editable={itemM.ref_Id === 1 ? false : true}
                            placeholder={'Nhập ' + itemM.nameVN + ' ở đây'}
                        />
                    case 'itemSelected':
                        const data = JSON.parse(itemM.filterList || '[]')
                        return < MutipleItemSelected
                            key={'itemSelected_' + index}
                            isRequire={itemM.isRequired == 1}
                            typeItem={itemM.ref_Name}
                            // isUploaded={itemM.ref_Id === 1 ? true : false}
                            isFilter={data.length > 5}
                            titleName={itemM.name}
                            dataItems={data}
                            defaultValue={itemInfo.currentItem[itemM.ref_Name] || ''}
                            onItemChoose={handlerSelectItem}
                        />


                }
            })
        )
    }

    return (
        <View key={'EditSellout_' + itemInfo.indexItem} style={{ paddingVertical: 10 }}>
            <ScrollView style={{ minHeight: deviceHeight * 0.1, maxHeight: deviceHeight * 0.32 }}>
                {displayItem()}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 6, paddingTop: 2 }}>
                {/* {
                    itemInfo.currentItem.isShowCancel == 1 &&
                    <TouchableOpacity onPress={onCancelItem} style={{ padding: 10, borderRadius: 5, backgroundColor: appcolor.danger, width: 60, justifyContent: 'center', alignItems: 'center', marginRight: 5 }} >
                        <Text style={{ fontSize: 14, color: appcolor.white, fontWeight: '600' }} >Huỷ</Text>
                    </TouchableOpacity>
                } */}
                {isSending == true &&
                    // <TouchableOpacity onPress={isSendData ?} style={styles.actionSync}>
                    <View style={{ flexDirection: 'row', padding: 3 }}>
                        <IconAnimation isLoop={isSending} sourceIcon={require('../../Themes/lotties/sync_load.json')} />
                        <Text style={{ fontWeight: '500', fontSize: 14, color: appcolor.dark, padding: 3 }}>Đang gửi ...</Text>
                    </View>
                    // </TouchableOpacity>
                }
                {
                    itemInfo.currentItem.isShowSend == 1 && !isSending &&
                    <TouchableOpacity onPress={onSendItem} style={{ padding: 10, borderRadius: 5, backgroundColor: appcolor.primary, width: 60, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{ fontSize: 14, color: appcolor.white, fontWeight: '600', textAlign: 'center' }} >Gửi</Text>
                    </TouchableOpacity>
                }

            </View>
        </View>
    )
}
const ShowPhotoItem = ({ itemSell, listPhoto, handleSelectImage, handleDeletePhoto, type, isSendData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isSending, setSending] = useState(false)

    useEffect(() => {
        isSending !== isSendData && setSending(isSendData)
        // getPhotosByGuiIdUpload(itemUpload.guiId, itemUpload.shopId)
        return () => false
    }, [isSendData])
    const renderItem = ({ item, index }) => {
        const onSelectImage = () => {
            handleSelectImage(listPhoto, index)
        }
        const onDeletePhoto = () => {
            handleDeletePhoto(listPhoto, item)
        }
        return (
            <View style={{ marginRight: 5, }}>
                <TouchableOpacity key={'photo_' + index} onPress={() => onSelectImage()} style={{ width: deviceWidth / 5.5, height: deviceWidth / 5.5, backgroundColor: appcolor.grey, margin: 2, borderRadius: 12, justifyContent: 'center', alignItems: "center" }}  >
                    <Image source={{ uri: item.photoPath.includes('uploaded') ? (URLDEFAULT + item.photoPath) : (item.photoPath || '') }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                </TouchableOpacity>
                {
                    item?.isPhotoSystem !== 1 && (itemSell?.isEditInfo === 2 || itemSell?.isEditInfo === 3) && <TouchableOpacity
                        style={{ width: 16, height: 16, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 5, right: 5, borderRadius: 10, backgroundColor: appcolor.danger }}
                        onPress={() => isSending == false ? onDeletePhoto() : null}>
                        <Icon color={appcolor.white} name='times' type='font-awesome-5' size={14} />
                    </TouchableOpacity>
                }

            </View>
        )
    }
    return (
        <View style={{}}>
            <FlatList
                showsHorizontalScrollIndicator={false}
                key={'listPhotoItem'}
                horizontal
                keyExtractor={(_, index) => index.toString()}
                data={listPhoto}
                renderItem={renderItem}
            />
        </View>
    )
}
const ViewHistoryVerify = ({ listHistory, handleSelectImageVerify }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataResult, setDataResult] = useState([])
    const loadData = () => {
        listHistory.length > 0 && setDataResult(listHistory)
    }
    useEffect(() => {
        loadData()
        return () => false
    }, [])
    const RenderItemHistory = ({ item, index }) => {
        const itemSellOut = JSON.parse(item.dataInput || '[]')[0]
        const dataPhoto = JSON.parse(item.dataPhoto || '[]')
        return (
            <View style={{ padding: 5, backgroundColor: appcolor.surface, borderRadius: 10, marginBottom: 5 }}>
                <View style={{ padding: 5, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>{`Ngày bán : `}{itemSellOut.sellDate}</Text>
                    <Text style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}>{`Số serial : `}{itemSellOut.imei1}</Text>
                    <Text style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}>{`Số lượng : `}{itemSellOut.quantity}</Text>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.danger }}>{`Lí do : `}{itemSellOut.confirmedNote}</Text>
                    <Text style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}>{`Cập nhật lúc : `}{moment(item.createdDate).format("YYYY-MM-DD HH:mm")}</Text>
                </View>
                <View style={{}}>
                    <ShowPhotoItem listPhoto={dataPhoto} handleSelectImage={handleSelectImageVerify} />
                </View>
            </View>
        )
    }
    return (
        <View style={{ padding: 5, flex: 1, borderTopLeftRadius: 10, borderTopRightRadius: 10, }}>
            <ScrollView scrollEnabled >
                {
                    dataResult.map((item, index) => {
                        return (
                            <RenderItemHistory key={'itemVerify' + index} item={item} index={index} />
                        )
                    })
                }
                <View style={{ height: deviceHeight / 3 }} />
            </ScrollView>
        </View>
    )
}
