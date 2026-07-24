
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { useSelector } from "react-redux";
import { REPORT } from "../../API/ReportAPI";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { getCategoryPromotion, getProductByType } from "../../Controller/ProductController";
import { deleteDataRaw, getDataPhotoByReport, getPhotoRawReport, insertRawReport, itemUploaded, saveJsonData } from "../../Controller/ReportController";
import { MessageAction, ToastError, ToastSuccess, UUIDGenerator, groupDataByKey } from "../../Core/Helper";
import { alertConfirm, deviceWidth, minWidthTab, TODAY } from "../../Core/Utility";
import { useFocusEffect } from "@react-navigation/native";
import { _competitorId, _competitorName } from "../../Core/URLs";
import { LoadingView } from "../../Control/ItemLoading";
import { getSubCatByCateId } from "../../Controller/WorkController";
import { GetByListCode } from "../../Controller/MasterController";
import { ViewByCate } from "./ViewByCate";
import ActionSheet, { ScrollView as ASScrollView, SheetManager } from "react-native-actions-sheet";
import { deviceHeight } from "../Home";
import { Badge, Icon } from '@rneui/base';
//import { NumericFormat } from "react-number-format";
import moment from "moment";
import NativeCamera from "../../Control/NativeCamera";
import { ViewListPhoto } from "./ViewListPhoto";
import { deletePhoto } from "../../Controller/PhotoController";
import FormGroup from "../../Content/FormGroup";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
// config 
// isConstrainImage : kiểm tra số lượng nhập hết theo cate chưa

export const FieldCoachingFSMReport = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [data, setData] = useState({ dataTab: [], dataMain: [], listMaster: [], listProduct: [] })
    const [loading, setLoading] = useState(false)
    const [isUploaded, setUploaded] = useState(false)
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
    const tabRef = useRef()
    const [_, setMutate] = useState(false)
    const lstReport = JSON.parse(kpiinfo?.reportItem || '{}')
    const [listPhoto, setListPhoto] = useState({ listPhotoArr: [] })
    const [contentSelect, setContentSelect] = useState({ itemSelect: {}, contentTraining: '', dataSelect: {}, indexContent: 0, listPByContent: [] })
    const [dataByContent, setDataByContent] = useState([])
    const [dataModal, setDataModal] = useState({ isVisible: false, dataPhotoBySubCate: [] })
    const [dataSelectValue, setDataSelectValue] = useState({ listByItem: [], itemSelect: {} })

    const loadData = async () => {
        setLoading(true)
        await REPORT.GetDataReportByShop(dataFilter, async (mData, mesager) => {
            const listMaster = await GetByListCode(`'ContentTraining'`)
            const products = await getProductByType(_competitorId);
            const { arr } = await groupDataByKey({
                arr: products,
                key: 'category',
                keyLayer2: 'subCategory',
                keyLayer3: 'segment'
            })
            const dataByContentMain = mData.filter(it => it.id == 0)

            if (mData !== null && mData.length > 0) {
                setData({ dataTab: mData, dataMain: mData, listMaster: listMaster, listProduct: arr })
                setDataByContent(dataByContentMain)
            } else {
                const lstTabData = await getCategoryPromotion(workinfo)
                let listSubCate = []
                for (let i = 0; i < lstTabData.length; i++) {
                    const item = lstTabData[i]
                    const lstSubCategory = await getSubCatByCateId(_competitorName, item.id);
                    listSubCate.push({
                        ...item,
                        listSubCate: JSON.stringify(lstSubCategory)
                    })
                }
                const dataInsert = {
                    shopId: dataFilter.shopId,
                    reportDate: workinfo.workDate,
                    jsonData: JSON.stringify(listSubCate || []),
                    jsonPhoto: '[]',
                    isUploaded: 0
                }
                await insertRawReport(dataInsert, dataFilter.reportId)
                setContentSelect({ itemSelect: {}, contentTraining: '', dataSelect: {}, indexContent: 0, listPByContent: [] })
                setData({ dataTab: listSubCate, dataMain: listSubCate, listMaster: listMaster, listProduct: arr })
                setDataByContent(dataByContentMain)
            }
        })
        const itemUpdate = await itemUploaded(shopinfo, kpiinfo.id)
        setUploaded(itemUpdate.isUploaded == 1)
        await countNumPhoto()
        setLoading(false)
    }

    useEffect(() => {
        loadData()
        return () => false
    }, [])

    useFocusEffect(
        useCallback(() => {
            countNumPhoto()
            return () => false;
        }, [])
    );

    const countNumPhoto = async () => {
        let dataPhoto = []
        dataPhoto = await getPhotoRawReport(dataFilter)
        if (dataPhoto?.length > 0) {
            (listPhoto.listPhotoArr?.length !== dataPhoto?.length && (listPhoto.listPhotoArr = dataPhoto))
        } else {
            dataPhoto = await getDataPhotoByReport(kpiinfo.id, shopinfo.shopId);
            (listPhoto.listPhotoArr?.length !== dataPhoto?.length && (listPhoto.listPhotoArr = dataPhoto))
        }
        if (contentSelect.itemSelect?.name != undefined && contentSelect.itemSelect?.name?.length > 0 && contentSelect.itemSelect?.ref_Code !== 'PRODUCT') {
            contentSelect.listPByContent = dataPhoto.filter(it => it.photoType?.includes('FSM_REPORT_0_' + contentSelect.itemSelect?.ref_Name))
        }
        await setMutate(e => !e)
    }
    const uploadData = async () => {
        const checkData = await validationData()
        if (checkData) {
            alertConfirm('Thông báo', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
                const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id)
                if (result.statusId === 200) {
                    await loadData()
                    await ToastSuccess(`Đã gửi dữ liệu lên hệ thống`, "Thông báo", "top")
                } else {
                    await ToastError(`Xảy ra lỗi khi gửi dữ liệu lên hệ thống!`, "Thông báo", "top")
                }
            })
        }
    }

    const checkByMasterList = () => {
        for (let indexMaster = 0; indexMaster < data.listMaster.length; indexMaster++) {
            const itemMaster = data.listMaster[indexMaster];
            if (itemMaster.isRequired == 1) {
                if (itemMaster.ref_Code == 'PRODUCT') {
                    let countTotal = 0
                    for (let index = 0; index < data.dataMain.length; index++) {
                        const itemMain = data.dataMain[index];
                        const listSubCate = JSON.parse(itemMain.listSubCate || '[]')
                        for (let indexS = 0; indexS < listSubCate.length; indexS++) {
                            const itemS = listSubCate[indexS]
                            const productList = JSON.parse(itemS.productList || '[]')

                            if (itemS.quantityFSM > 0) {
                                countTotal = countTotal + itemS.quantityFSM
                            }

                            if (itemS.contentTraining !== undefined && itemS.contentTraining !== null && itemS.contentTraining?.length > 0 && (itemS.quantityFSM == undefined || itemS.quantityFSM == null)) {
                                ToastError(`Ngành hàng ${itemS.name} bạn chưa điền số lượng FSM!`, 'Thông báo', 'top')
                                return false
                            }
                            if (itemS.productList !== undefined && itemS.productList !== null && productList?.length > 0 && (itemS.quantityFSM == undefined || itemS.quantityFSM == null || itemS.quantityFSM == 0)) {
                                ToastError(`Ngành hàng ${itemS.name} bạn chưa điền số lượng FSM!`, 'Thông báo', 'top')
                                return false
                            }
                            if (lstReport.isConstrainImage == 1 && lstReport.image > 0 && lstReport.imageBySubCate == 1 && itemS.quantityFSM !== undefined && itemS.quantityFSM !== null && itemS.quantityFSM > 0) {
                                let imageFilter = listPhoto.listPhotoArr.filter(it => it.photoType == 'FSM_REPORT_' + itemMain.id + '_' + itemS.id)
                                if (imageFilter.length < lstReport.image) {
                                    ToastError(`Ngành hàng ${itemS.name} bạn phải chụp tối thiểu ${lstReport.image} tấm hình!(${imageFilter.length}/${(lstReport.image !== undefined && lstReport.image > 0) ? lstReport.image : 1})`, 'Thông báo', 'top')
                                    return false
                                }
                            }
                        }
                    }
                    if (countTotal == 0) {
                        ToastError(`Nội dung ${itemMaster.name} chưa nhập thông tin!`, 'Thông báo', 'top')
                        return false
                    }
                } else if (itemMaster.ref_Code == 'CONTENT') {
                    const indexContent = data.dataMain.findIndex(itM => itM.id === 0 && itM.name == itemMaster.name)
                    const dataMainContent = data.dataMain[indexContent]
                    if (indexContent == -1) {
                        ToastError(`Nội dung ${itemMaster.name} chưa nhập thông tin!`, 'Thông báo', 'top')
                        return false
                    }
                    let imageFilter = listPhoto.listPhotoArr.filter(it => it.photoType?.includes(dataMainContent.photoType))
                    const filterList = JSON.parse(dataMainContent.filterList || '[]')
                    if (filterList != null && filterList?.length > 0) {
                        const filterListM = JSON.parse(itemMaster.filterList || '[]')

                        for (let indexF = 0; indexF < filterListM.length; indexF++) {
                            const itemFMaster = filterListM[indexF]
                            const itemFMain = filterList[indexF]
                            const imageFilterById = imageFilter.filter(it => it.photoType?.includes(dataMainContent.photoType + `_${itemFMaster.id}`))

                            if (itemFMain.itemValue !== undefined && itemFMain.itemValue !== null && itemFMain.itemValue > 0 && imageFilterById.length < (itemFMaster.imageLimit || 0) && itemFMaster.constraintImage == 1) {
                                ToastError(`Nội dung ${itemFMaster.itemName} bạn phải chụp tối thiểu ${itemFMaster.imageLimit} tấm hình!(${imageFilterById.length}/${(itemFMaster.imageLimit !== undefined && itemFMaster.imageLimit > 0) ? itemFMaster.imageLimit : 1})`, 'Thông báo', 'top')
                                return false
                            }
                        }
                    } else if (lstReport.isConstrainImage == 1 && lstReport.image > 0 && dataMainContent.quantityFSM !== undefined && dataMainContent.quantityFSM !== null) {
                        if (imageFilter.length < lstReport.image) {
                            ToastError(`Nội dung ${dataMainContent.name} bạn phải chụp tối thiểu ${lstReport.image} tấm hình!(${imageFilter.length}/${(lstReport.image !== undefined && lstReport.image > 0) ? lstReport.image : 1})`, 'Thông báo', 'top')
                            return false
                        }
                    }
                } else {
                    const indexContent = data.dataMain.findIndex(itM => itM.name === itemMaster.name)
                    if (indexContent == -1) {
                        ToastError(`Nội dung ${itemMaster.name} chưa nhập thông tin!`, 'Thông báo', 'top')
                        return false
                    }
                    const itemMain = data.dataMain[indexContent];
                    if (itemMain.filterList != null && itemMain.filterList?.length > 0) {
                        const filterList = JSON.parse(itemMain.filterList || '[]')
                        const filterListM = JSON.parse(itemMaster.filterList || '[]')

                        let countValueList = 0
                        let countValueGift = 0
                        for (let indexF = 0; indexF < filterListM.length; indexF++) {
                            const itemFMaster = filterListM[indexF]
                            const itemFMain = filterList[indexF]
                            if ((itemFMaster.isRequired == 1) && (itemFMain.itemValue == undefined || itemFMain.itemValue == null || (itemFMain.itemValue == 0 && itemFMaster.isZero !== 1))) {
                                ToastError(`Nội dung ${itemFMaster.itemName} bạn chưa nhập giá trị.`, 'Thông báo', 'top')
                                return false
                            }
                            if (itemFMain.itemValue !== undefined && itemFMain.itemValue !== null && (itemFMain.itemValue > 0 || (itemFMain.itemValue == 0 && itemFMaster.isZero == 1))) {
                                countValueGift = countValueGift + 1
                                countValueList = countValueList + itemFMain.itemValue
                            }
                        }
                        if (countValueGift < 2 && countValueList > 0) {
                            const names = filterList.reduce((acc, item) => {
                                if (item.isRequired !== 1) {
                                    acc.push(item.itemName);
                                }
                                return acc;
                            }, []).join('/');
                            ToastError(`Nội dung ${names} bạn chưa nhập giá trị.`, 'Thông báo', 'top')
                            return false
                        }
                        if (countValueList > 0) {
                            const resultCheckValue = checkValueOtherItem(itemMain)
                            if (!resultCheckValue) {
                                return false
                            }
                        }
                    } else {
                        if (itemMain.quantityFSM !== undefined && itemMain.quantityFSM !== null && itemMain.quantityFSM > 0) {
                            const resultCheckValue = checkValueOtherItem(itemMain)
                            if (!resultCheckValue) {
                                return false
                            }
                        }
                    }
                    if (lstReport.isConstrainImage == 1 && lstReport.image > 0) {
                        let imageFilter = listPhoto.listPhotoArr.filter(it => it.photoType?.includes(itemMain.photoType))
                        const filterListMain = JSON.parse(itemMain.filterList || '[]')

                        if (filterListMain != null && filterListMain.length > 0) {
                            for (let indexF = 0; indexF < filterListMain.length; indexF++) {
                                const itemF = filterListMain[indexF]
                                const imageFilterById = imageFilter.filter(it => it.photoType?.includes(itemMain.photoType + `_${itemF.id}`))
                                if (itemF.itemValue !== undefined && itemF.itemValue !== null && itemF.itemValue > 0 && imageFilterById.length < (itemF.imageLimit || 0)) {
                                    ToastError(`Nội dung ${itemF.itemName} bạn phải chụp tối thiểu ${itemF.imageLimit} tấm hình!(${imageFilterById.length}/${(itemF.imageLimit !== undefined && itemF.imageLimit > 0) ? itemF.imageLimit : 1})`, 'Thông báo', 'top')
                                    return false
                                }
                            }
                        } else if (itemMain.quantityFSM !== undefined && itemMain.quantityFSM !== null && itemMain.quantityFSM > 0) {
                            if (imageFilter.length < lstReport.image) {
                                ToastError(`Nội dung ${itemMain.name} bạn phải chụp tối thiểu ${lstReport.image} tấm hình!(${imageFilter.length}/${(lstReport.image !== undefined && lstReport.image > 0) ? lstReport.image : 1})`, 'Thông báo', 'top')
                                return false
                            }
                        }
                    }
                }
            }
        }
        return true
    }

    const validationData = async () => {
        let countQuantity = 0
        for (let index = 0; index < data.dataMain.length; index++) {
            const itemMain = data.dataMain[index];
            if (itemMain.id == 0) {
                const listFilter = JSON.parse(itemMain.filterList || '[]')
                if (listFilter.length > 0) {
                    for (let indexF = 0; indexF < listFilter.length; indexF++) {
                        const itemF = listFilter[indexF]
                        if (itemF.itemValue !== undefined && itemF.itemValue > 0) {
                            countQuantity = countQuantity + itemF.itemValue
                        }
                    }
                } else {
                    countQuantity = countQuantity + itemMain.quantityFSM
                }
            }
            const listSubCate = JSON.parse(itemMain.listSubCate || '[]')
            for (let indexS = 0; indexS < listSubCate.length; indexS++) {
                const itemS = listSubCate[indexS]
                if (itemS.quantityFSM !== undefined && itemS.quantityFSM > 0) {
                    countQuantity = countQuantity + itemS.quantityFSM
                }
            }
        }
        if (countQuantity == 0) {
            ToastError(`Bạn chưa điền thông tin cho bất kì nội dung nào!`, 'Thông báo', 'top')
            return false
        }

        const resultCheck = checkByMasterList()
        if (!resultCheck) {
            return resultCheck
        }

        for (let index = 0; index < data.dataMain.length; index++) {
            const itemMain = data.dataMain[index];
            const listSubCate = JSON.parse(itemMain.listSubCate || '[]')
            if (itemMain.id !== 0) {
                for (let indexS = 0; indexS < listSubCate.length; indexS++) {
                    const itemS = listSubCate[indexS]
                    const productList = JSON.parse(itemS.productList || '[]')


                    if (itemS.quantityFSM == 0) {
                        ToastError(`Ngành hàng ${itemS.name} số lượng học viên không được bằng 0!`, 'Thông báo', 'top')
                        return false
                    }

                    if (itemS.contentTraining !== undefined && itemS.contentTraining !== null && itemS.contentTraining?.length > 0 &&
                        itemS.productList !== null && productList?.length > 0 &&
                        (itemS.quantityFSM == undefined || itemS.quantityFSM == null)) {
                        ToastError(`Ngành hàng ${itemS.name} bạn chưa điền số lượng FSM!`, 'Thông báo', 'top')
                        return false
                    }
                    if (itemS.productList !== undefined && itemS.productList !== null && productList?.length > 0 && (itemS.quantityFSM == undefined || itemS.quantityFSM == null || itemS.quantityFSM == 0)) {
                        ToastError(`Ngành hàng ${itemS.name} bạn chưa điền số lượng FSM!`, 'Thông báo', 'top')
                        return false
                    }
                    if (lstReport.isConstrainImage == 1 && lstReport.image > 0 && lstReport.imageBySubCate == 1 && itemS.quantityFSM !== undefined && itemS.quantityFSM !== null && itemS.quantityFSM > 0) {
                        let imageFilter = listPhoto.listPhotoArr.filter(it => it.photoType == 'FSM_REPORT_' + itemMain.id + '_' + itemS.id)
                        if (imageFilter.length < lstReport.image) {
                            ToastError(`Ngành hàng ${itemS.name} bạn phải chụp tối thiểu ${lstReport.image} tấm hình!(${imageFilter.length}/${(lstReport.image !== undefined && lstReport.image > 0) ? lstReport.image : 1})`, 'Thông báo', 'top')
                            return false
                        }
                    }
                }
            } else if (itemMain.id == 0) {
                const itemMaster = data.listMaster.filter(it => it.ref_Code == itemMain.ref_Code)[0]
                if (itemMain.ref_Code == 'CONTENT' && itemMaster) {
                    const indexContent = data.dataMain.findIndex(itM => itM.id === 0 && itM.name == itemMaster.name)
                    if (indexContent == -1) {
                        ToastError(`Nội dung ${itemMaster.name} chưa nhập thông tin!`, 'Thông báo', 'top')
                        return false
                    }
                    const dataMainContent = data.dataMain[indexContent]
                    const filterList = JSON.parse(dataMainContent.filterList || '[]')
                    let imageFilter = listPhoto.listPhotoArr.filter(it => it.photoType?.includes(dataMainContent.photoType))

                    if (filterList != null && filterList?.length > 0) {
                        const filterListM = JSON.parse(itemMaster.filterList || '[]')

                        for (let indexF = 0; indexF < filterListM.length; indexF++) {
                            const itemFMaster = filterListM[indexF]
                            const itemFMain = filterList[indexF]
                            const imageFilterById = imageFilter.filter(it => it.photoType?.includes(dataMainContent.photoType + `_${itemFMaster.id}`))

                            if (itemFMain.itemValue == 0) {
                                ToastError(`Nội dung ${itemFMaster.itemName} không được bằng 0`, 'Thông báo', 'top')
                                return false
                            }

                            if (itemFMain.itemValue !== undefined && itemFMain.itemValue !== null && itemFMain.itemValue > 0 && imageFilterById.length < (itemFMaster.imageLimit || 0) && itemFMaster.constraintImage == 1) {
                                ToastError(`Nội dung ${itemFMaster.itemName} bạn phải chụp tối thiểu ${itemFMaster.imageLimit} tấm hình!(${imageFilterById.length}/${(itemFMaster.imageLimit !== undefined && itemFMaster.imageLimit > 0) ? itemFMaster.imageLimit : 1})`, 'Thông báo', 'top')
                                return false
                            }
                        }
                    } else if (lstReport.isConstrainImage == 1 && lstReport.image > 0 && dataMainContent.quantityFSM !== undefined && dataMainContent.quantityFSM !== null) {
                        if (imageFilter.length < lstReport.image) {
                            ToastError(`Nội dung ${dataMainContent.name} bạn phải chụp tối thiểu ${lstReport.image} tấm hình!(${imageFilter.length}/${(lstReport.image !== undefined && lstReport.image > 0) ? lstReport.image : 1})`, 'Thông báo', 'top')
                            return false
                        }
                    }
                }
            }
        }

        if (lstReport.image !== undefined && lstReport.image > 0 && listPhoto.listPhotoArr.length < ((lstReport.image !== undefined) ? lstReport.image : 1)) {
            ToastError(`bạn phải chụp tối thiểu ${(lstReport.image !== undefined) ? lstReport.image : 1} tấm hình! (${listPhoto.listPhotoArr.length}/${(lstReport.image !== undefined && lstReport.image > 0) ? lstReport.image : 1})`, 'Thông báo', 'top')
            return false
        }
        return true
    }
    const checkValueOtherItem = (itemMain) => {
        let countValue = 0
        for (let index = 0; index < data.dataMain.length; index++) {
            const itemMainF = data.dataMain[index];
            if (itemMainF.ref_Code !== 'GIFT') {
                if (itemMainF.id == 0) {
                    const listFilter = JSON.parse(itemMainF.filterList || '[]')
                    if (listFilter.length > 0) {
                        for (let indexF = 0; indexF < listFilter.length; indexF++) {
                            const itemF = listFilter[indexF]
                            if (itemF.itemValue !== undefined && itemF.itemValue > 0) {
                                countValue = countValue + itemF.itemValue
                            }
                        }
                    } else {
                        countValue = countValue + itemMainF.quantityFSM
                    }
                }
                const listSubCate = JSON.parse(itemMainF.listSubCate || '[]')
                for (let indexS = 0; indexS < listSubCate.length; indexS++) {
                    const itemS = listSubCate[indexS]
                    if (itemS.quantityFSM !== undefined && itemS.quantityFSM > 0) {
                        countValue = countValue + itemS.quantityFSM
                    }
                }
            }
        }
        if (countValue == 0) {
            ToastError(`Bạn đã nhập nội dung ${itemMain.name} nhưng chưa nhập các nội dung khác!`, 'Thông báo', 'top')
            return false
        }
        return true
    }
    const handleSelectResult = () => {
        navigation.navigate("trainingresult", { titlePage: 'Bài kiểm tra và kết quả đào tạo' })
    }
    const handleSelectContent = (itemSelect) => {
        const indexContent = dataByContent.findIndex(itM => itM.id === 0 && itM.contentTraining == itemSelect.name)
        const indexDataM = data.dataMain.findIndex(itM => itM.id === 0 && itM.contentTraining == itemSelect.name)
        const filterList = itemSelect.filterList != null ?
            ((data.dataMain[indexDataM]?.filterList != null && JSON.parse(data.dataMain[indexDataM]?.filterList || '[]')?.length > 0) ? data.dataMain[indexDataM].filterList : itemSelect.filterList) : null

        contentSelect.filterList = filterList?.length > 0 ? (JSON.parse(dataByContent[indexContent]?.filterList || '[]')?.length > 0 ? dataByContent[indexContent].filterList : filterList) : null
        contentSelect.itemSelect = itemSelect
        contentSelect.contentTraining = itemSelect.name
        contentSelect.dataSelect = dataByContent[indexContent] || {}
        contentSelect.indexContent = indexContent
        contentSelect.listPByContent = listPhoto.listPhotoArr.filter(it => it.photoType?.includes('FSM_REPORT_0_' + itemSelect?.ref_Name))
        contentSelect.isRequired = itemSelect.isRequired
        contentSelect.ref_Code = itemSelect.ref_Code

        openSheet('hide', 'SheetMain')
        setMutate(e => !e)
    }
    const showListSelect = () => {
        openSheet('show', 'SheetMain')
    }

    const handleChangeQuantity = async (text, item) => {
        let quanity = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        const index = data.dataMain.findIndex(itM => itM.id === 0 && itM.contentTraining == contentSelect.itemSelect?.name)
        const filterList = JSON.parse(contentSelect.filterList || '[]')
        if (index !== -1) {
            const indexContent = dataByContent.findIndex(itM => itM.id === 0 && itM.contentTraining == contentSelect.itemSelect?.name)
            if (filterList != null && filterList?.length > 0) {
                const indexItemM = filterList.findIndex(itM => itM.id === item.id)
                filterList[indexItemM].itemValue = (quanity == null ? null : parseInt(quanity))
                contentSelect.filterList = JSON.stringify(filterList)
                data.dataMain[index].filterList = JSON.stringify(filterList)
            } else {
                data.dataMain[index].quantityFSM = (quanity == null ? null : parseInt(quanity))
                contentSelect.dataSelect.quantityFSM = (quanity == null ? null : parseInt(quanity))
                dataByContent[indexContent].quantityFSM = (quanity == null ? null : parseInt(quanity))
            }
            await setMutate(e => !e)
            await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        } else {
            if (filterList.length > 0 && item != null) {
                const indexItemM = filterList.findIndex(itM => itM.id === item.id)
                filterList[indexItemM].itemValue = (quanity == null ? null : parseInt(quanity))
                contentSelect.filterList = JSON.stringify(filterList)
            }
            const itemChange = {
                id: 0,
                name: contentSelect.itemSelect?.name || '',
                photoType: 'FSM_REPORT_0_' + contentSelect.itemSelect?.ref_Name,
                contentTraining: contentSelect.itemSelect?.name || '',
                quantityFSM: contentSelect.filterList != null && JSON.parse(contentSelect.filterList || '[]')?.length > 0 ? null : (quanity == null ? null : parseInt(quanity)),
                filterList: contentSelect.filterList,
                isRequired: contentSelect.isRequired,
                ref_Code: contentSelect.ref_Code

            }
            data.dataMain = [{ ...itemChange }, ...data.dataMain]
            contentSelect.dataSelect = itemChange
            const dataContent = [{ ...itemChange }, ...dataByContent]
            await setDataByContent(dataContent)
            await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        }
    }
    const handleChangeText = async (text, item) => {
        const filterList = JSON.parse(contentSelect.filterList || '[]')
        if (filterList != null && filterList?.length > 0) {
            const indexItemM = filterList.findIndex(itM => itM.id === item.id)
            filterList[indexItemM].textValue = text == '' ? null : text
            contentSelect.filterList = JSON.stringify(filterList)
        }
        await insertDataToRaw()
        await setMutate(e => !e)
    }

    const takePhoto = async (itemId) => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": 'FSM_REPORT_0_' + contentSelect.itemSelect.ref_Name + (itemId != undefined ? `_${itemId}` : ''),
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "shopLat": null,
            "shopLong": null,
            "guid": UUIDGenerator(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.cameraStart(photoinfo, countNumPhoto);
    }
    const chosesPhoto = async (itemId) => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": 'FSM_REPORT_0_' + contentSelect.itemSelect.ref_Name + (itemId != undefined ? `_${itemId}` : ''),
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "shopLat": null,
            "shopLong": null,
            "guid": UUIDGenerator(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.imageGalleryLaunch(photoinfo, countNumPhoto);
    }
    const handleShowPhoto = (itemId) => {
        if (itemId != undefined) {
            const listFilter = contentSelect.listPByContent.filter(it => it.photoType?.includes('FSM_REPORT_0_' + contentSelect.itemSelect.ref_Name + (itemId != undefined ? `_${itemId}` : '')))
            setDataModal({ isVisible: true, dataPhotoBySubCate: listFilter })
        } else {
            setDataModal({ isVisible: true, dataPhotoBySubCate: contentSelect.listPByContent })
        }
    }
    const handleVisibleImage = async () => {
        await setDataModal({ isVisible: false, dataPhotoBySubCate: [] })
    }
    const handleDeletePhoto = (item) => {
        deletePhoto(item)
        const listFilter = contentSelect.listPByContent.filter(it => it.id !== item.id)
        const listFilterMain = listPhoto.listPhotoArr.filter(it => it.id !== item.id)
        contentSelect.listPByContent = listFilter
        listPhoto.listPhotoArr = listFilterMain
        const listFilterByType = contentSelect.listPByContent.filter(it => it.photoType?.includes(item.photoType))
        setDataModal({ ...dataModal, dataPhotoBySubCate: listFilterByType })
    }
    const HeaderView = ({ }) => {
        return (
            <View style={{ flexDirection: 'row', height: 45, width: deviceWidth, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => null} style={{ height: 40, width: isUploaded ? '48%' : '38%', padding: 3 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, backgroundColor: appcolor.light }} >
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>Thông tin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectResult()} style={{ height: 40, width: isUploaded ? '48%' : '38%', padding: 3 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, backgroundColor: appcolor.surface }} >
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>Bài kiểm tra</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    const ViewItem = () => {
        return (
            data.dataTab.map((it, idx) => {
                const listEmp = JSON.parse(data.dataMain[idx]?.listEmployees || '[]')
                return (it.id != 0 && it.id != null) &&
                    <Tabs.Tab key={`id_${idx}`} label={`${it.name} ${listEmp.length > 0 ? '(' + listEmp.length + ')' : ''}`} name={`${it.name} ${listEmp.length > 0 ? '(' + listEmp.length + ')' : ''}`} >
                        <View style={{ flex: 1, backgroundColor: appcolor.surface, marginTop: 50, width: deviceWidth }}>
                            <ViewByCate key={idx} itemTab={it} indexTab={idx} data={data} dataFilter={dataFilter} countNumPhoto={countNumPhoto} listPhoto={listPhoto} listPhotoMain={listPhoto.listPhotoArr} isUploaded={isUploaded} contentSelect={contentSelect} />
                        </View>
                    </Tabs.Tab>
            })
        )
    }

    const handleReloadData = () => {
        MessageAction(`Sau khi tải lại sẽ mất hết dữ liệu đã nhập, bạn có muốn tiếp tục?`, () => {
            deleteDataRaw(shopinfo.shopId, kpiinfo.id)
            loadData()
            setMutate(e => !e)
            openSheet('hide', 'bottomSheetView')
        })
    }
    const handleShowSheetSelect = async (item, type) => {
        const listByItem = await GetByListCode(`'${item.refCode}'`)
        if (type == 'SELECT') {
            const dataByItem = { listByItem: listByItem, itemSelect: item }
            openSheet('show', 'SheetBySelect', dataByItem)
        } else if (type == 'GROUP') {
            const { arr } = await groupDataByKey({
                arr: listByItem,
                key: 'groupId'
            })
            const dataByGroup = { listByItem: arr, itemSelect: item }
            openSheet('show', 'SheetByGroup', dataByGroup)
        }
    }
    const handleSelectItem = async (item) => {
        const dataMain = JSON.parse(contentSelect.filterList || '[]')
        dataMain.map(it => {
            if (it.id == dataSelectValue.itemSelect.id) {
                const selectValueParse = it.selectValue ? JSON.parse(it.selectValue) : null
                it.selectValue = ((!selectValueParse || selectValueParse?.id != item.id) ? JSON.stringify(item) : null)
            }
        })
        contentSelect.filterList = JSON.stringify(dataMain)
        await setDataSelectValue({ listByItem: [], itemSelect: {} })
        await insertDataToRaw()
        await setMutate(e => !e)
        await openSheet('hide', 'SheetBySelect')
    }
    const handlePressItem = async (item) => {
        const dataMain = JSON.parse(contentSelect.filterList || '[]')
        let dataItemGroup = JSON.parse(dataSelectValue.itemSelect.groupValue || '[]')
        const exists = dataItemGroup.some(it => it.id === item.id && it.name === item.name);
        if (exists) {
            dataItemGroup = dataItemGroup.filter(it => it.id != item.id)
        } else {
            dataItemGroup.push(item)
        }
        let itemData = {}
        dataMain.map((it) => {
            if (it.id == dataSelectValue.itemSelect.id) {
                itemData = it
                it.groupValue = dataItemGroup.length > 0 ? JSON.stringify(dataItemGroup) : null
            }
        })
        contentSelect.filterList = JSON.stringify(dataMain)
        dataSelectValue.itemSelect = itemData
        await insertDataToRaw()
        await setMutate(e => !e)
    }
    const onChangeNoteGroup = async (text, item) => {
        const dataMain = JSON.parse(contentSelect.filterList || '[]')
        let dataItemGroup = JSON.parse(dataSelectValue.itemSelect.groupValue || '[]')
        const exists = dataItemGroup.some(it => it.id === item.id && it.name === item.name);
        if (exists) {
            dataItemGroup.map(it => {
                if (it.id == item.id) {
                    it.textValue = text
                }
            })
        } else {
            dataItemGroup.push({
                ...item, textValue: text
            })
        }

        const indexData = dataMain.findIndex(itM => itM.id == dataSelectValue.itemSelect.id)
        dataMain[indexData].groupValue = dataItemGroup.length > 0 ? JSON.stringify(dataItemGroup) : null
        let itemData = dataMain[indexData]

        contentSelect.filterList = JSON.stringify(dataMain)
        dataSelectValue.itemSelect = itemData

        await insertDataToRaw()
        await setMutate(e => !e)
    }
    const insertDataToRaw = async () => {
        const existsMain = data.dataMain.some(it => it.contentTraining === contentSelect.contentTraining);
        const itemChange = {
            id: 0,
            name: contentSelect.itemSelect?.name || '',
            photoType: 'FSM_REPORT_0_' + contentSelect.itemSelect?.ref_Name,
            contentTraining: contentSelect.itemSelect?.name || '',
            quantityFSM: contentSelect.filterList != null && JSON.parse(contentSelect.filterList || '[]')?.length > 0 ? null : (contentSelect.dataSelect?.quantityFSM ?? null),
            filterList: contentSelect.filterList,
            isRequired: contentSelect.isRequired,
            ref_Code: contentSelect.ref_Code
        }

        if (existsMain) {
            const indexMain = data.dataMain.findIndex(itM => itM.contentTraining == contentSelect.contentTraining)
            data.dataMain[indexMain] = itemChange
        } else {
            data.dataMain = [{ ...itemChange }, ...data.dataMain]
        }
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
    }
    const openSheet = (value, type, payload) => {
        SheetManager[value](type, { payload: payload })
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                leftFunc={() => navigation.goBack()}
                iconRight='cloud-upload-alt'
                rightFunc={isUploaded ? null : uploadData}
                iconMiddle='poll-h'
                middleFunc={!isUploaded ? () => openSheet('show', 'bottomSheetView') : null}
            />
            <View style={{ flex: 1 }}>
                <HeaderView />
                {loading && <LoadingView title={'Đang tải dữ liệu...'} isLoading={loading} styles={{ marginTop: 8 }} />}
                <View key={'SelectContent'} style={{ paddingHorizontal: 10 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, padding: 8 }}>Nội dung</Text>
                    <TouchableOpacity onPress={() => showListSelect()} style={{
                        width: '100%', marginBottom: 4, shadowColor: appcolor.black, bottom: 2,
                        shadowOffset: { width: 0, height: 1 }, borderColor: appcolor.grayLight, borderWidth: 0.5,
                        shadowOpacity: 0.2, shadowRadius: 5, elevation: 2
                    }}>
                        <View style={{ backgroundColor: appcolor.surface, width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35, padding: 3, borderRadius: 4, borderColor: appcolor.grayLight }}>
                            <Text style={{ fontSize: 12, fontWeight: '400', color: contentSelect.contentTraining ? appcolor.dark : appcolor.placeholderText }}>{contentSelect.contentTraining || 'Nội dung Đào tạo'}</Text>
                            <SpiralIcon type="font-awesome-5" color={appcolor.dark} name={"caret-down"} style={{ paddingHorizontal: 10 }} size={14} />
                        </View>
                    </TouchableOpacity>
                </View>
                {
                    !loading && contentSelect.itemSelect?.name != undefined && contentSelect.itemSelect?.name?.length > 0 &&
                    <KeyboardAvoidingView
                        style={{ flex: 1, flexDirection: 'column', marginTop: 5, paddingTop: 5, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: appcolor.surface }}
                        behavior={Platform.OS == "ios" ? "padding" : null}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                        {
                            (data.dataTab?.length > 0 && contentSelect.itemSelect?.ref_Code == 'PRODUCT') &&
                            <Tabs.Container
                                ref={tabRef}
                                renderTabBar={(props) => (
                                    <MaterialTabBar
                                        {...props}
                                        scrollEnabled={true}
                                        tabStyle={{ borderRadius: 8, backgroundColor: appcolor.light, minWidth: minWidthTab(data.dataTab), height: 38, marginTop: 5, borderColor: appcolor.grayLight, borderWidth: 1, marginHorizontal: 5 }}
                                        labelStyle={{ fontSize: 14, fontWeight: "600" }}
                                        indicatorStyle={{ backgroundColor: appcolor.transparent }}
                                        inactiveColor={appcolor.dark}
                                        activeColor={appcolor.primary}
                                        style={{ backgroundColor: appcolor.surface }}
                                    />
                                )}
                                headerContainerStyle={{ backgroundColor: appcolor.transparent, shadowColor: appcolor.transparent }}
                                containerStyle={{ backgroundColor: appcolor.surface }}
                            >
                                {ViewItem()}
                            </Tabs.Container>
                        }
                        {(data.dataTab?.length > 0 && contentSelect.itemSelect?.ref_Code !== 'PRODUCT') &&
                            <ScrollView showsVerticalScrollIndicator={false} style={{ marginHorizontal: 4, marginTop: 10 }}>
                                {
                                    contentSelect.filterList !== null && JSON.parse(contentSelect.filterList || '[]').map(it => {

                                        const totalImage = contentSelect.listPByContent.filter(itP => itP.photoType?.includes('FSM_REPORT_0_' + contentSelect.itemSelect.ref_Name + (it.id != undefined ? `_${it.id}` : '')))
                                        return (
                                            <View key={'FSMByContent' + it.id} style={{ backgroundColor: appcolor.light, borderRadius: 10, margin: 8, padding: 8, marginBottom: 5 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                    <View style={{ height: 40, width: '48%', flexDirection: 'row', padding: 3, justifyContent: 'flex-end' }}>
                                                        {
                                                            !isUploaded &&
                                                            <TouchableOpacity onPress={() => takePhoto(it.id)} style={{ flexDirection: 'row', width: '48%', padding: 3, marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                                <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                                            </TouchableOpacity>
                                                        }
                                                        {
                                                            !isUploaded &&
                                                            <TouchableOpacity onPress={() => chosesPhoto(it.id)} style={{ flexDirection: 'row', width: '48%', padding: 3, marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                                <SpiralIcon name='attach-outline' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                                            </TouchableOpacity>
                                                        }
                                                        <TouchableOpacity onPress={() => handleShowPhoto(it.id)} style={{ flexDirection: 'row', width: '48%', padding: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                            <View style={{ flex: 1 }}>
                                                                <Badge badgeStyle={{ position: 'absolute', top: 0, right: 5, }} value={totalImage?.length || 0} />
                                                                <SpiralIcon name='images' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.dark, padding: 8, paddingHorizontal: 16 }}>{it.itemName || 'Nhập số lượng học viên'}</Text>
                                                {
                                                    it.isUseGroup == 1 &&
                                                    <View key={'GroupByItem_' + it.id} style={{ paddingBottom: 8 }}>
                                                        {/* <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, padding: 8 }}>{it.refName}</Text> */}
                                                        <TouchableOpacity
                                                            onPress={() => handleShowSheetSelect(it, 'GROUP')}
                                                            style={{
                                                                width: '100%', marginBottom: 4, shadowColor: appcolor.black, bottom: 2,
                                                                shadowOffset: { width: 0, height: 1 }, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                                                shadowOpacity: 0.2, shadowRadius: 5, elevation: 2
                                                            }}>
                                                            <View style={{ backgroundColor: appcolor.surface, width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35, padding: 3, borderRadius: 4, borderColor: appcolor.grayLight }}>
                                                                {/* <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark }}>{it.selectValue?.name || `Chọn ${it.refName}`}</Text> */}
                                                                <Text style={{ paddingHorizontal: 4, fontSize: 12, fontWeight: '400', color: appcolor.dark, width: '80%' }}>{JSON.parse(it.groupValue || '[]')?.length > 0 ? JSON.parse(it.groupValue || '[]')?.map((it, idx) => { return (idx == 0 ? '' : '\n') + it.name }) : `Chọn ${it.refName}`}</Text>
                                                                <SpiralIcon type="font-awesome-5" color={appcolor.dark} name={"caret-down"} style={{ paddingHorizontal: 10 }} size={14} />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                }

                                                {
                                                    it.isUseSelect == 1 &&
                                                    <View key={'SelectByItem_' + it.id} style={{ paddingBottom: 8 }}>
                                                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, padding: 8 }}>{it.refName}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => handleShowSheetSelect(it, 'SELECT')}
                                                            style={{
                                                                width: '100%', marginBottom: 4, shadowColor: appcolor.black, bottom: 2,
                                                                shadowOffset: { width: 0, height: 1 }, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                                                shadowOpacity: 0.2, shadowRadius: 5, elevation: 2
                                                            }}>
                                                            <View style={{ backgroundColor: appcolor.surface, width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35, padding: 3, borderRadius: 4, borderColor: appcolor.grayLight }}>
                                                                <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark }}>{it.selectValue ? JSON.parse(it.selectValue || '{ }')?.name : `Chọn ${it.refName}`}</Text>
                                                                <SpiralIcon type="font-awesome-5" color={appcolor.dark} name={"caret-down"} style={{ paddingHorizontal: 10 }} size={14} />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                }
                                                {
                                                    it.isUseGroup != 1 &&
                                                    <NumericFormat
                                                        value={it.itemValue == 0 ? '0' : (it.itemValue || 'SL')}
                                                        displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
                                                        renderText={value =>
                                                            <TextInput
                                                                value={value}
                                                                style={{ fontSize: 13, padding: 8, width: '100%', backgroundColor: appcolor.surface, borderRadius: 5, color: appcolor.dark }}
                                                                keyboardType='numeric'
                                                                placeholder={'SL'}
                                                                placeholderTextColor={appcolor.greydark}
                                                                editable={!isUploaded}
                                                                onChangeText={(text) => handleChangeQuantity(text, it)}
                                                            />
                                                        }
                                                    />
                                                }
                                                {
                                                    it.isUseText == 1 &&
                                                    <FormGroup
                                                        key={'TextByItem_' + it.id}
                                                        iconName={'comment-alt'}
                                                        multiline={true} selectTextOnFocus={true}
                                                        containerStyle={{
                                                            backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3,
                                                            marginTop: 4, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                                        }}
                                                        inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                                                        placeholder='Nhập ghi chú...'
                                                        editable={!isUploaded}
                                                        onClearTextAndroid={() => handleChangeText('', it)}
                                                        handleChangeForm={(text) => handleChangeText(text, it)}
                                                        defaultValue={it.textValue}
                                                    />
                                                }
                                            </View>
                                        )
                                    })
                                }
                                {
                                    (contentSelect.filterList == null || JSON.parse(contentSelect.filterList || '[]')?.length == 0) &&
                                    <View key={'FSMByContent'} style={{ backgroundColor: appcolor.light, borderRadius: 10, margin: 8, padding: 8, marginBottom: 5 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <View style={{ height: 40, width: '48%', flexDirection: 'row', padding: 3, justifyContent: 'flex-end' }}>
                                                {
                                                    !isUploaded &&
                                                    <TouchableOpacity onPress={() => takePhoto()} style={{ flexDirection: 'row', width: '48%', padding: 3, marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                        <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                                    </TouchableOpacity>
                                                }
                                                {
                                                    !isUploaded &&
                                                    <TouchableOpacity onPress={() => chosesPhoto()} style={{ flexDirection: 'row', width: '48%', padding: 3, marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                        <SpiralIcon name='attach-outline' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                                    </TouchableOpacity>
                                                }
                                                <TouchableOpacity onPress={() => handleShowPhoto()} style={{ flexDirection: 'row', width: '48%', padding: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Badge badgeStyle={{ position: 'absolute', top: 0, right: 5, }} value={contentSelect.listPByContent?.length || 0} />
                                                        <SpiralIcon name='images' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, padding: 8, paddingHorizontal: 16 }}>{contentSelect.itemSelect?.textValue || 'Nhập số lượng học viên'}</Text>
                                        <NumericFormat
                                            value={contentSelect.dataSelect?.quantityFSM || 0}
                                            displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
                                            renderText={value =>
                                                <TextInput
                                                    value={value}
                                                    style={{ fontSize: 13, padding: 8, width: '100%', backgroundColor: appcolor.surface, borderRadius: 5, color: appcolor.dark }}
                                                    keyboardType='numeric'
                                                    placeholder={'SL'}
                                                    placeholderTextColor={appcolor.greydark}
                                                    editable={!isUploaded}
                                                    onChangeText={(text) => handleChangeQuantity(text)}
                                                />
                                            }
                                        />
                                    </View>
                                }
                                <View style={{ height: deviceHeight / 3 }} />
                            </ScrollView>
                        }
                    </KeyboardAvoidingView>
                }
            </View>
            <Modal
                key={'ModalImage'}
                visible={dataModal.isVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={{ flex: 1 }}>
                    <ViewListPhoto listPhoto={dataModal.dataPhotoBySubCate} handleVisible={handleVisibleImage} isUploaded={isUploaded} handleDeletePhoto={handleDeletePhoto} />
                </View>
            </Modal>
            <ActionSheet
                id={'SheetMain'}
                keyboardHandlerEnabled={false}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light, paddingBottom: insets.bottom }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >
                {
                    <View key={'sheetByContent'} style={{ height: deviceHeight / 1.6 }}>
                        <ScrollView nestedScrollEnabled style={{ marginHorizontal: 10, marginTop: 10 }}>
                            {
                                data.listMaster?.map((itSelect, idxSelect) => {
                                    return (
                                        <TouchableOpacity key={itSelect.id} onPress={() => handleSelectContent(itSelect)} style={{
                                            width: '100%', marginBottom: 4,
                                        }}>
                                            <View style={{
                                                backgroundColor: itSelect.id == contentSelect.itemSelect?.id ? appcolor.light : appcolor.surface,
                                                width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35,
                                                padding: 3, borderRadius: 4, borderWidth: 0.5,
                                                borderColor: (itSelect.id == contentSelect.itemSelect?.id) ? appcolor.success : appcolor.grayLight
                                            }}>
                                                <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark, paddingHorizontal: 8 }}>{itSelect.name}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                }
            </ActionSheet >
            <ActionSheet
                id={'SheetBySelect'}
                keyboardHandlerEnabled={false}
                onBeforeShow={setDataSelectValue}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light, paddingBottom: insets.bottom }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >
                <View key={'ViewSheetBySelete'} style={{ height: deviceHeight / 1.6 }}>
                    <ScrollView nestedScrollEnabled style={{ marginHorizontal: 10, marginTop: 10 }}>
                        {
                            dataSelectValue.listByItem?.map((itSelect, idxSelect) => {
                                const dataValue = dataSelectValue.itemSelect.selectValue ? JSON.parse(dataSelectValue.itemSelect.selectValue || '{}') : null
                                return (
                                    <TouchableOpacity key={itSelect.id} onPress={() => !isUploaded ? handleSelectItem(itSelect) : null} style={{
                                        width: '100%', marginBottom: 4,
                                    }}>
                                        <View style={{
                                            backgroundColor: itSelect.id == dataValue?.id ? appcolor.light : appcolor.surface,
                                            width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35,
                                            padding: 3, borderRadius: 4, borderWidth: 0.5,
                                            borderColor: (itSelect.id == dataValue?.id) ? appcolor.success : appcolor.grayLight
                                        }}>
                                            <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark, paddingHorizontal: 8 }}>{itSelect.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>

            </ActionSheet >
            <ActionSheet
                id={'SheetByGroup'}
                keyboardHandlerEnabled={false}
                onBeforeShow={setDataSelectValue}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light, paddingBottom: insets.bottom }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >
                <View key={'ViewByGroup'} >
                    <ASScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ marginHorizontal: 8, marginTop: 10, padding: 4 }}>
                        {
                            dataSelectValue.listByItem?.map((itSelect, idxSelect) => {
                                // dataSelectValue.
                                const listGroup = JSON.parse(dataSelectValue.itemSelect.groupValue || '[]')
                                const exists = listGroup.some(item => item.id === itSelect.id && item.name === itSelect.name);
                                let textValue = exists ? listGroup.filter((it) => it.id == itSelect.id)[0].textValue : ''
                                return (
                                    <React.Fragment key={`group_${idxSelect}`}>
                                        {itSelect.isParent && itSelect.groupName !== undefined &&
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 5, marginVertical: 8 }}>
                                                <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: appcolor.primary }}> {itSelect.groupName}</Text>
                                            </View>
                                        }
                                        <View key={itSelect.id} style={{
                                            width: '100%',
                                            padding: 12, marginTop: 4, backgroundColor: appcolor.surface,
                                            borderRadius: 8, shadowColor: appcolor.black, bottom: 2,
                                            shadowOffset: { width: 1, height: 1 }, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                            shadowOpacity: 0.2, shadowRadius: 5, elevation: 2
                                        }}>

                                            <Text style={{ fontSize: 14, fontWeight: '500', color: appcolor.dark, padding: 8 }}>{itSelect.name}</Text>
                                            <FormGroup
                                                key={'NoteSelect_' + itSelect.id}
                                                iconName={'comment-alt'}
                                                multiline={true} selectTextOnFocus={true}
                                                containerStyle={{
                                                    backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3,
                                                    marginTop: 4, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                                }}
                                                inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                                                placeholder='Nhập ghi chú...'
                                                editable={!isUploaded}
                                                onClearTextAndroid={() => onChangeNoteGroup('', itSelect)}
                                                handleChangeForm={(text) => onChangeNoteGroup(text, itSelect)}
                                                defaultValue={textValue}
                                            />
                                            <TouchableOpacity
                                                onPress={() => !isUploaded ? handlePressItem(itSelect) : null}
                                                style={{ position: 'absolute', top: 10, right: 20, borderRadius: 50, justifyContent: 'center', alignItems: "center" }}>
                                                {exists && <LottieView
                                                    style={{ width: 32, height: 32 }}
                                                    source={require('../../Themes/Images/check-mark-success.json')}
                                                    autoPlay
                                                    loop={false}
                                                />}
                                                {!exists && <SpiralIcon name={'check-circle'} type={'font-awesome-5'} size={30} color={appcolor.greydark} />}
                                            </TouchableOpacity>

                                        </View>
                                    </React.Fragment>
                                )
                            })
                        }

                        <View style={{ height: deviceHeight / 3 }} />
                    </ASScrollView>
                </View>
            </ActionSheet >
            <ViewSheet appcolor={appcolor} handleReloadData={handleReloadData} isLoading={loading} />
        </View >
    )
}
const ViewSheet = ({ appcolor, handleReloadData, isLoading }) => {
    const insets = useSafeAreaInsets()
    return (
        <ActionSheet
            id={'bottomSheetView'}
            gestureEnabled={true}
            containerStyle={{ padding: 10, paddingBottom: insets.bottom }}
            indicatorColor={appcolor.bluesky}
        >
            <ToolAction
                isLoading={isLoading}
                handleReloadData={handleReloadData}
            />
        </ActionSheet>
    )
}
const ToolAction = ({ handleReloadData, isLoading }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const onReloadData = () => {
        handleReloadData()
    }
    const RenderButton = ({ title, iconName, iconColor, iconType = null, actionPress, isShowInput = false }) => {
        const styleView = {
            paddingLeft: 10,
            backgroundColor: isShowInput ? appcolor.light : appcolor.surface,
            borderWidth: isShowInput ? 0.5 : 0,
            borderColor: appcolor.success,
            width: '100%', flexDirection: 'row', alignItems: 'center',
            padding: 5, marginTop: 8, borderRadius: 5
        }
        return (
            <TouchableOpacity onPress={() => isLoading ? null : actionPress()}>
                <View style={styleView}>
                    <SpiralIcon name={iconName} type={iconType == null ? 'font-awesome-5' : iconType} size={18} color={iconColor} />
                    <Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }}>{title}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
            <Text style={{ width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '600', color: appcolor.dark }}>Công cụ</Text>
            <RenderButton
                title={`Tải lại dữ liệu`}
                iconName='sync-alt'
                iconColor={appcolor.primary}
                actionPress={onReloadData} />
        </View>
    )
}
