import React, { useState, useEffect, useRef, } from 'react';
import { View, FlatList, TouchableOpacity, Text, TextInput, LayoutAnimation, UIManager, Platform, Modal, StyleSheet, ScrollView, Image as RNImage, } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import { deviceWidth, deviceHeight, } from '../../Themes/AppsStyle'
import { SubmitAdhocSurvey, SubmitImageAdhocSurvey, } from '../../Controller/AdhocController';
import { ListItem } from '@rneui/base';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { alertConfirm, alertError, alertNotify, alertWarning, } from '../../Core/Utility'
import { isNotInteger, ToastError, } from '../../Core/Helper'
import FormGroup from '../../Content/FormGroup'
import Swiper from 'react-native-swiper'
import moment from 'moment'
import dvhcvn from '../../Themes/filedata/dvhcvn.json'
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { QueryStringSql } from '../../Core/SqliteDbContext';
import { taskList } from '../../Core/Table';
import DateChoose from '../../Control/DateTime/DateChoose';
import NativeCamera from '../../Control/NativeCamera';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ID_INPUT = 1
const ID_INPUTAREA = 2
const ID_NUMBER = 3
const ID_MULTICHOICE = 4
const ID_CHECKBOX = 5
const ID_DATE = 6
const ID_IMAGE = 7
const ID_CAMERA = 8
const ID_GRIDSELECTION = 9
const ID_GRIDMULTISELECTION = 10
const ID_ADDRESS = 11
const ID_OTHERCHECKBOX = 99

const PROVINCE = 'Tỉnh/Thành phố'
const DISTRICT = 'Quận/Huyện'
const TOWN = 'Xã phường'

export const AdhocDetail = ({ navigation, route, }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [dataGroup, set_] = useState({})
    const [idQuesContainer, set__] = useState({})
    const [currentBS, set___] = useState({})
    const [paginator, set____] = useState({})
    const [imageGroup, set_____] = useState({})
    const [overlayLayer, set______] = useState({})
    const [dataModalAddress, set_______] = useState({
        dataProvince: JSON.parse(JSON.stringify(dvhcvn?.data || [])),
        dataDistrict: [],
        dataTown: [],

        dataProvincePrototype: JSON.parse(JSON.stringify(dvhcvn?.data || [])),
        dataDistrictPrototype: [],
        dataTownPrototype: [],
    })
    const [visibleModal, setVisibleModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [visibleModalAddress, setVisibleModalAddress] = useState(false)
    const [_, setMutate] = useState(false)
    const swiper = useRef(null)

    const loadData = async () => {
        try {
            let { formData, isSubmitted, webUrl, } = route?.params || {}
            formData = JSON.parse(formData)
            let countRequired = {}
            for (let i = 0, lenData = formData.length; i < lenData; ++i) {
                const isDone = (formData[i].max !== null || formData[i].min !== null) ? false : !formData[i].required
                const anwserItem = formData[i]?.anwserItem || []
                const anwserType = anwserItem?.[0]?.anwserType || 0
                formData[i].isDone = isDone
                dataGroup[formData[i].questionId] = formData[i]
                idQuesContainer[formData[i].questionId] = {
                    curQuesId: formData[i]?.questionId || -1,
                    prevQuesId: formData[i - 1]?.questionId || -1,
                    nextQuesId: formData[i + 1]?.questionId || -1,
                }
                if (isDone) {
                    countRequired[formData[i].questionId] = true
                }
                // * Map Image
                if (isSubmitted && (anwserType === ID_IMAGE || anwserType === ID_CAMERA)) {
                    if (imageGroup[formData[i].questionId] === undefined) {
                        imageGroup[formData[i].questionId] = []
                    }

                    let listAnsweredImage = []
                    try {
                        listAnsweredImage = JSON.parse(anwserItem?.[0]?.anwserValue || '[]')
                    } catch (e) { listAnsweredImage = [] }

                    for (let j = 0; j < listAnsweredImage?.length; ++j) {
                        imageGroup[formData[i].questionId].push({
                            url: webUrl + listAnsweredImage[j],
                            fileName: '',
                            fileBase64: '',
                        })
                    }
                }
            }

            const firstQuesIndex = 0
            assignCurrentBS(formData[firstQuesIndex]?.questionId || -1)
            currentBS.lenData = formData.length
            currentBS.semanticIndex = firstQuesIndex
            currentBS.isFinaleDone = countRequired
            paginator[formData[firstQuesIndex]?.questionId] = firstQuesIndex
            setMutate(e => !e)
            setIsSubmitted(isSubmitted)
        } catch (e) { }
    }
    useEffect(() => {
        loadData();
    }, [])
    const onShowSubmitButton = () => {
        // * Check Other Answer Checkbox
        if (!checkInputOtherCheckbox()) {
            alertWarning("Vui lòng điền thông tin khác!")
            return
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        overlayLayer.visibleSubmitBtn = true
        overlayLayer.overlay = true
        setMutate(e => !e)
    }
    const onSubmitAnswer = () => {
        overlayLayer.overlay = false;
        setMutate(e => !e)
        //
        alertConfirm("Thông Báo", "Bạn có chắc chắn muốn gửi báo cáo?", async () => {
            setIsUploading(true)
            try {
                const dataSubmit = []
                let { shopinfo, publicKey, } = route?.params || {}
                const mainData = Object.values(dataGroup)
                for (let i = 0, lenMainData = mainData?.length; i < lenMainData; ++i) {
                    const { anwserItem, questionId, } = mainData[i]
                    if (paginator[questionId] === undefined && (anwserItem?.[0]?.anwserType === ID_MULTICHOICE || anwserItem?.[0]?.anwserType === ID_CHECKBOX)) {
                        for (let i = 0, lenAnswerItem = anwserItem.length; i < lenAnswerItem; i++) {
                            anwserItem[i].anwserValue = ""
                        }
                    }
                    dataSubmit.push(mainData[i])
                }
                const data = {
                    shopId: shopinfo?.shopId || 0,
                    publicKey: publicKey || "",
                    formDate: +moment().format("YYYYMMDD"),
                    spiralData: JSON.stringify(dataSubmit),
                }
                const result = await SubmitAdhocSurvey(data)
                const imageData = Object.values(imageGroup)
                for (const images of imageData) {
                    for (let i = 0, lenImages = images.length; i < lenImages; i++) {
                        const dataImage = {
                            fileName: images[i].fileName,
                            shopCode: shopinfo?.shopCode || 0,
                            fileBase64: images[i].fileBase64,
                            photoDate: +moment().format("YYYYMMDD"),
                        }
                        await SubmitImageAdhocSurvey(dataImage)
                    }
                }
                if (result.statusId === 200) {
                    overlayLayer.visibleSubmitBtn = false
                    QueryStringSql(`UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${shopinfo?.shopId || 0} and reportId=${kpiinfo.kpiId}`)
                    setIsSubmitted(true)
                    alertNotify(result.messager)
                } else {
                    alertError("Thất bại! " + result.messager)
                }
            } catch (e) { }
            setIsUploading(false)
        })
    }
    const assignCurrentBS = (questionId) => {
        currentBS.questionId = questionId
        currentBS.itemParent = dataGroup?.[questionId] || {}
        overlayLayer.visibleSubmitBtn = false
    }
    const assignStepBS = ({ itemParent, nextItemParent, prevStep, nextStep }) => {
        nextItemParent.prevStepId = prevStep
        itemParent.nextStepId = nextStep
        overlayLayer.visibleSubmitBtn = false
    }
    const onPrevQuestion = () => {
        try {
            const { itemParent, } = currentBS
            const currentIdx = currentBS.semanticIndex || 0
            const prevId = itemParent?.prevStepId ?? idQuesContainer?.[itemParent?.questionId]?.prevQuesId
            if (prevId === undefined || prevId === -1) return
            const curQuesId = idQuesContainer?.[prevId]?.curQuesId ?? prevId
            assignCurrentBS(curQuesId)
            currentBS.semanticIndex = paginator?.[curQuesId] ?? (currentIdx - 1)
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMutate(e => !e)
        } catch (err) { }
    }
    const onNextQuestion = () => {
        try {
            const { itemParent, } = currentBS
            let { nextStepId, questionId, } = itemParent
            // * Check Other Answer Checkbox
            if (!checkInputOtherCheckbox()) {
                alertWarning("Vui lòng điền thông tin khác!")
                return
            }
            if (nextStepId === undefined) {
                nextStepId = idQuesContainer[questionId].nextQuesId
                dataGroup[nextStepId].prevStepId = questionId
                itemParent.nextStepId = nextStepId
            }
            const { curQuesId, } = idQuesContainer[nextStepId]
            assignCurrentBS(curQuesId)
            currentBS.semanticIndex += 1
            paginator[curQuesId] = currentBS.semanticIndex
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMutate(e => !e)
        } catch (err) { }
    }
    const onJumpToQuestion = (questionId, semanticIndex) => {
        try {
            const { curQuesId, } = idQuesContainer[questionId]
            assignCurrentBS(curQuesId)
            currentBS.semanticIndex = semanticIndex
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMutate(e => !e)
        } catch (err) { }
    }
    const onPressCheckbox = (itemChild, indexChild, isSingleSelect) => {
        try {
            const { itemParent, } = currentBS
            const { required, prevAnswerIndex, anwserItem, questionId, } = itemParent
            const { anwserValue, } = itemChild
            const isSelected = anwserValue === "true"
            if (isSingleSelect) {
                itemChild.anwserValue = required ? "true" : isSelected ? "false" : "true"
                // * Mark last checked index
                itemParent.prevAnswerIndex = indexChild
                if (prevAnswerIndex !== undefined && prevAnswerIndex !== indexChild) {
                    anwserItem[prevAnswerIndex].anwserValue = "false"
                }
                // * Check Other
                const indexOther = prevAnswerIndex === undefined ? indexChild : prevAnswerIndex
                if (itemChild.id !== ID_OTHERCHECKBOX || isSelected) {
                    itemParent.showInputOther = false
                    anwserItem[indexOther].ortherValue = ''
                } else if (!isSelected) {
                    itemParent.showInputOther = true
                }
            } else {
                if (itemParent.countCheckedbox === undefined) {
                    itemParent.countCheckedbox = 1
                } else {
                    itemParent.countCheckedbox += isSelected ? -1 : 1
                }
                itemChild.anwserValue = isSelected ? "false" : "true"
                if (required && isSelected && itemParent.countCheckedbox === 0) {
                    itemParent.countCheckedbox = 1
                    itemChild.anwserValue = "true"
                } else {
                    // * Check Other
                    if (itemChild.id === ID_OTHERCHECKBOX) {
                        if (!isSelected) {
                            itemParent.showInputOther = true
                        } else {
                            itemParent.showInputOther = false
                            itemChild.ortherValue = ''
                        }
                    }
                }
            }
            // * Index Other
            if (itemChild.id === ID_OTHERCHECKBOX) {
                itemParent.indexOtherCheckbox = indexChild
            }
            onSequelAction({
                itemParent, itemChild,
                prevStep: questionId, isDone: true
            })
            setMutate(e => !e)
        } catch (e) { }
    }
    const onChangeOtherCheckbox = (value, itemChild) => {
        try {
            itemChild.ortherValue = value.trim()
            setMutate(e => !e)
        } catch (e) { }
    }
    const onPressTest = (itemChild) => { // * Test Question Type = 9 || 10
        const { itemParent, } = currentBS
        const { questionId, } = itemParent
        itemChild.anwserValue = "true"
        onSequelAction({
            itemParent, itemChild,
            prevStep: questionId, isDone: true
        })
        setMutate(e => !e)
    }
    const onChangeInput = (value, itemChild, isNumber) => {
        try {
            if (isNumber === true && isNotInteger(value)) return
            if (isNumber === true) value = value.trim()
            const { itemParent, } = currentBS
            const { required, questionId, min, max, } = itemParent
            itemChild.anwserValue = value
            let isDone =
                min !== null && min !== undefined && isNumber && +value < min ? false : // * Min
                    max !== null && max !== undefined && isNumber && +value > max ? false : // * Max
                        required === false ? true :
                            value !== ""
            if (isNumber && max !== null && max !== undefined && +value > max) {
                ToastError(`Giá trị không được lớn hơn ${max}`, "Thông báo", "top")
                itemChild.anwserValue = max
                isDone = true
            }
            if (isNumber && min !== null && min !== undefined && +value < min) {
                ToastError(`Giá trị không được nhỏ hơn ${min}`, "Thông báo", "top")
                itemChild.anwserValue = min
                isDone = true
            }

            onSequelAction({
                itemParent,
                itemChild,
                prevStep: questionId,
                isDone: isDone,
            })
            setMutate(e => !e)
        } catch (e) { }
    }
    const onDayPress = (date) => {
        try {
            date = moment(date).format('yyyy-MM-DD')
            const { itemParent, itemChild, } = currentBS
            const { questionId, min, max, } = itemParent
            if (min !== null && min !== undefined && moment(date).isBefore(moment(min))) {
                itemChild.anwserValue = min
                currentBS.selectedDate = min
                setMutate(e => !e)
                return
            }
            if (max !== null && max !== undefined && moment(date).isAfter(moment(max))) {
                itemChild.anwserValue = max
                currentBS.selectedDate = max
                setMutate(e => !e)
                return
            }
            itemChild.anwserValue = date
            currentBS.selectedDate = date
            onSequelAction({
                itemParent, itemChild, prevStep: questionId,
                isDone: true,
            })
            setMutate(e => !e)
        } catch (e) { }
    }
    const onClearDate = () => {
        try {
            const { itemChild, } = currentBS
            itemChild.anwserValue = ""
            setMutate(e => !e)
            setVisibleModal(false)
        } catch (e) { }
    }
    const handleDisplayModal = (itemChild, type) => {
        const { itemParent } = currentBS
        switch (type) {
            case "DATE":
                const { required } = itemParent
                currentBS.showClearDate = required ? false : true
                currentBS.selectedDate = itemChild.anwserValue ? itemChild.anwserValue : new Date()
                break;
            case "IMAGE_SELECT":
                currentBS.showGalleryImagePicker = true
                break;
            case "CAMERA_SELECT":
                currentBS.showGalleryImagePicker = false
                break;
        }
        currentBS.itemChild = itemChild
        currentBS.type = type
        setVisibleModal(true)
    }
    const cameraLaunch = () => {
        try {
            const options = { mediaType: 'photo', cameraType: 'front', includeBase64: true, selectionLimit: 1, maxHeight: 1336, maxWidth: 1336 };
            let { shopinfo } = route?.params || {}
            let photoinfo = {
                shopId: shopinfo?.shopId || 0,
                reportId: kpiinfo?.kpiId || 0,
                photoDate: +moment().format("YYYYMMDD"),
                photoType: 'ADHOC',
            }
            NativeCamera.cameraStart(photoinfo, (result) => {
                const asset = result?.data?.[0]
                if (asset?.uri) onAfterTakeImage(asset)
            }, options)
            setVisibleModal(false)
        } catch (e) { }
    }
    const imageGalleryLaunch = () => {
        try {
            const options = { mediaType: 'photo', includeBase64: true, selectionLimit: 1, maxHeight: 1336, maxWidth: 1336 };
            let { shopinfo } = route?.params || {}
            let photoinfo = {
                shopId: shopinfo?.shopId || 0,
                reportId: kpiinfo?.kpiId || 0,
                photoDate: +moment().format("YYYYMMDD"),
                photoType: 'ADHOC',
            }
            NativeCamera.imageGalleryLaunch(photoinfo, (result) => {
                const asset = result?.data?.[0]
                if (asset?.uri) onAfterTakeImage(asset)
            }, options)
            setVisibleModal(false)
        } catch (e) { }
    }
    const checkInputOtherCheckbox = () => {
        try {
            const { itemParent } = currentBS
            const { anwserItem, indexOtherCheckbox, } = itemParent
            if (anwserItem?.[indexOtherCheckbox]?.anwserValue === "true" &&
                (anwserItem?.[indexOtherCheckbox]?.ortherValue === "" ||
                    anwserItem?.[indexOtherCheckbox]?.ortherValue === null ||
                    anwserItem?.[indexOtherCheckbox]?.ortherValue === undefined)) {
                return false
            }
            return true
        } catch (e) { }
    }
    const onAfterTakeImage = (res) => {
        try {
            const { itemParent, itemChild, } = currentBS
            const { questionId, } = itemParent
            const assetUri = res?.uri || ""
            if (!assetUri) return

            let safeFileName = `${res?.fileName || `image_${Date.now()}.jpg`}`
            let pathToImage = `/uploaded/${+moment().format("YYYYMMDD")}/${safeFileName}`

            let anwserValueArr = []
            try { anwserValueArr = JSON.parse(itemChild?.anwserValue || "[]") } catch (e) { anwserValueArr = [] }
            anwserValueArr.push(pathToImage)
            itemChild.anwserValue = JSON.stringify(anwserValueArr)

            let isDone = true
            if (imageGroup?.[questionId] === undefined) imageGroup[questionId] = []
            imageGroup[questionId] = [...imageGroup[questionId], { url: assetUri, fileName: safeFileName, fileBase64: res?.base64 || "", }]
            if (imageGroup[questionId]?.length > (data.max || 1)) {
                isDone = false
            } else if (imageGroup[questionId]?.length < (data.min || 1)) {
                isDone = false
            }
            onSequelAction({
                itemParent,
                itemChild,
                prevStep: questionId,
                isDone: isDone
            })
            setMutate(e => !e)
        } catch (e) { }
    }
    const onRemoveImage = (indexImage) => {
        try {
            const { itemParent, itemChild, } = currentBS
            const { required, questionId, } = itemParent
            let anwserValueArr = []
            try { anwserValueArr = JSON.parse(itemChild?.anwserValue || "[]") } catch (e) { anwserValueArr = [] }
            anwserValueArr.splice(indexImage, 1)
            itemChild.anwserValue = JSON.stringify(anwserValueArr)

            if (imageGroup?.[questionId] === undefined) imageGroup[questionId] = []
            imageGroup[questionId] = imageGroup[questionId].filter((_, idx) => idx !== indexImage)

            let isDone = required ? anwserValueArr.length > 0 : true
            if (imageGroup[questionId]?.length > data.max) {
                isDone = false
            } else if (imageGroup[questionId]?.length < data.min) {
                isDone = false
            }
            onSequelAction({
                itemParent,
                itemChild,
                prevStep: questionId,
                isDone: isDone,
            })
            setMutate(e => !e)
        } catch (e) { }
    }
    const onSelectAddress = (dropdownItem, indexAnswer) => {
        try {
            const { itemParent, currentItemChildAddress, } = currentBS
            const { required, questionId, anwserItem, } = itemParent
            anwserItem[indexAnswer].anwserValue = dropdownItem?.name
            const isDone = required ? !!anwserItem[0]?.anwserValue && !!anwserItem[1]?.anwserValue && !!anwserItem[2]?.anwserValue && !!anwserItem[3]?.anwserValue : true
            switch (indexAnswer) {
                case 1:
                    const level2s = dropdownItem?.level2s || []
                    dataModalAddress.dataDistrict = JSON.parse(JSON.stringify(level2s))
                    dataModalAddress.dataDistrictPrototype = JSON.parse(JSON.stringify(level2s))
                    anwserItem[2].anwserValue = ''
                    anwserItem[3].anwserValue = ''
                    onSwipe(indexAnswer)
                    break;
                case 2:
                    const level3s = dropdownItem?.level3s || []
                    dataModalAddress.dataTown = JSON.parse(JSON.stringify(level3s))
                    dataModalAddress.dataTownPrototype = JSON.parse(JSON.stringify(level3s))
                    anwserItem[3].anwserValue = ''
                    onSwipe(indexAnswer)
                    break;
                case 3:
                    onOpenModalAddress(false)
                    break;
            }
            onSequelAction({
                itemParent, prevStep: questionId,
                itemChild: currentItemChildAddress,
                isDone: isDone,
            })
            setMutate(e => !e)
        } catch (e) { }
    }
    const onChangeInputAddress = (value, itemChild) => {
        try {
            const { itemParent, } = currentBS
            const { required, questionId, anwserItem, } = itemParent
            itemChild.anwserValue = value
            const isDone = required ? !!anwserItem[0]?.anwserValue && !!anwserItem[1]?.anwserValue && !!anwserItem[2]?.anwserValue && !!anwserItem[3]?.anwserValue : true
            onSequelAction({
                itemParent, itemChild, prevStep: questionId,
                isDone: isDone,
            })
            setMutate(e => !e)
        } catch (e) { }
    }
    const onSequelAction = ({ itemParent, itemChild, prevStep, isDone }) => {
        try {
            const { questionId } = itemParent
            let { nextStep } = itemChild
            // * Handle Step
            if (nextStep === -1) {
                const { nextQuesId } = idQuesContainer[prevStep]
                nextStep = nextQuesId
            }
            if (dataGroup[nextStep] !== undefined) {
                const nextItemParent = dataGroup[nextStep]
                assignStepBS({ itemParent, nextItemParent, prevStep, nextStep })
            }
            // * Is Done
            itemParent.isDone = isDone
            if (isDone) {
                paginator[itemParent.indexRow] = currentBS.semanticIndex
            }
            // * Is Finish Imediately
            const isFinishImediately = nextStep === 9999 && isDone ? true : nextStep === -1 && isDone ? itemParent.indexRow === currentBS.lenData : false
            itemParent.isFinishImediately = isFinishImediately
            // * Is Finale Done
            if (isFinishImediately) {
                delete currentBS.isFinaleDone[questionId]
            } else if (isDone) {
                currentBS.isFinaleDone[questionId] = true
            }
            const isJumpStep = nextStep !== -1 && nextStep !== 9999 && itemParent.indexRow !== currentBS.lenData
            // * Reassign Pagination
            if (isFinishImediately || isJumpStep) {
                const keyPaginator = Object.keys(paginator)
                for (let i = 0, lenKey = keyPaginator.length; i < lenKey; ++i) {
                    if (+keyPaginator[i] > questionId) {
                        delete paginator[keyPaginator[i]]
                    }
                }
            }
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch (e) { }
    }
    const onSwipe = (index, type) => {
        swiper.current?.scrollBy(index)
    }
    const onIndexModalAddressChanged = (index) => {
        switch (index) {
            case 0:
                dataModalAddress.dataProvince = JSON.parse(JSON.stringify(dataModalAddress.dataProvincePrototype))
                dataModalAddress.searchProvince = ''
                break;
            case 1:
                dataModalAddress.dataDistrict = JSON.parse(JSON.stringify(dataModalAddress.dataDistrictPrototype))
                dataModalAddress.searchDistrict = ''
                break;
            case 2:
                dataModalAddress.dataTown = JSON.parse(JSON.stringify(dataModalAddress.dataTownPrototype))
                dataModalAddress.searchTown = ''
                break;
        }
        dataModalAddress.search = ""
        setMutate(e => !e)
    }
    const onFilterModalAddress = (value, keyValue, arrayFilter) => {
        try {
            let filterList = []
            const cloneList = dataModalAddress?.[arrayFilter + 'Prototype'] || []
            if (value) {
                filterList = cloneList?.filter(e => {
                    const nameFilter = e.name ? e.name.toUpperCase() : ''.toUpperCase();
                    return nameFilter.indexOf(value.toUpperCase()) > -1
                })
            } else {
                filterList = cloneList
            }
            dataModalAddress[arrayFilter] = filterList
            dataModalAddress[keyValue] = value
            setMutate(e => !e)
        } catch (e) { }
    }
    const onOpenModalAddress = (boolean, indexScrollSwipe, itemChild) => {
        currentBS.currentItemChildAddress = itemChild
        setMutate(e => !e)
        setVisibleModalAddress(boolean)
        setTimeout(() => {
            swiper.current?.scrollBy(indexScrollSwipe)
        }, 500)
    }
    const styles = StyleSheet.create({
        modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", },
        modalHeader: {
            width: deviceWidth / 1.2, padding: 10, backgroundColor: appcolor.light,
            borderTopRightRadius: 10, borderTopLeftRadius: 10, borderColor: appcolor.grey, borderWidth: 2,
            borderBottomColor: appcolor.light, borderBottomWidth: 0,
        },
        modalFooter: {
            padding: 10, right: 0, width: deviceWidth / 1.2, backgroundColor: appcolor.light,
            borderBottomRightRadius: 10, borderBottomLeftRadius: 10, borderColor: appcolor.grey, borderWidth: 2,
            borderTopColor: appcolor.light, borderTopWidth: 0,
        },
        modalContent: {
            alignItems: "flex-start", width: deviceWidth / 1.2, backgroundColor: appcolor.light,
            borderLeftColor: appcolor.grey, borderLeftWidth: 2,
            borderRightColor: appcolor.grey, borderRightWidth: 2,
        },
    })
    const data = dataGroup?.[currentBS.questionId] || {}
    const isFirstItem = currentBS.itemParent?.indexRow === 1
    const isLastItem = currentBS.itemParent?.indexRow === currentBS.lenData
    const isDone = currentBS.itemParent?.isDone
    const isFinaleDone = Object.keys(currentBS?.isFinaleDone || {}).length === currentBS.lenData
    const isFinishImediately = data.isFinishImediately
    const isRequired = data.required
    const visibleNextButton = !isLastItem && isDone && !isFinishImediately
    const visibleCompleteButton = (isFinishImediately || isFinaleDone) && !isSubmitted && (isLastItem || isFinishImediately)
    const primaryColor = appcolor.primary
    const secondaryColor = appcolor.secondary
    let processStatus = isFinishImediately ? "100%" : `${((((currentBS.itemParent?.indexRow || 1) - 1) / (currentBS.lenData - 1)) * 100) | 0}%`
    processStatus = processStatus === "0%" ? '1%' : processStatus
    return (
        <View style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }}>
            <HeaderCustom
                leftFunc={() => navigation.goBack()}
                title={route?.params?.title || "Adhoc"}
                iconRight={overlayLayer.visibleSubmitBtn === true && visibleCompleteButton ? 'cloud-upload-alt' : null}
                rightFunc={() => onSubmitAnswer()} />
            <View style={{ width: '100%', height: '100%', backgroundColor: overlayLayer.overlay ? "#222" : appcolor.bluelight, }}>
                {overlayLayer.overlay && (
                    <TouchableOpacity onPress={() => { overlayLayer.overlay = false; setMutate(e => !e) }} style={{ position: 'absolute', top: 0, left: 0, width: deviceWidth, height: deviceHeight, opacity: 0, zIndex: 10000000, }} />
                )}
                {overlayLayer.overlay && (
                    <View style={{ position: 'absolute', top: '50%', width: deviceWidth, }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 30, marginRight: 30, }}>
                            <Text style={{ color: appcolor.white, fontSize: 20, textAlign: 'center', }}>Bạn đã hoàn thành bảng khảo sát, bấm vào biểu tượng bên phải để gửi báo cáo</Text>
                        </View>
                    </View>
                )}
                <View style={{ opacity: overlayLayer.overlay ? 0 : 1, height: deviceHeight, backgroundColor: primaryColor, marginTop: 0, borderWidth: 0, marginLeft: 0, marginRight: 0, width: deviceWidth, }}>
                    {dataGroup?.[currentBS.questionId] !== undefined && (
                        <View style={{ width: '100%', height: deviceHeight * 0.7, alignItems: 'center', }}>
                            <View style={{ width: '95%', height: '100%', backgroundColor: appcolor.light, justifyContent: 'space-between', borderColor: primaryColor, borderWidth: 1, marginTop: 20, borderRadius: 10, overflow: 'hidden', }}>
                                <ScrollView>
                                    <View style={{ height: '100%', }}>
                                        <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', }}>
                                            <View style={{ width: '15%', backgroundColor: secondaryColor, alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 5, }}>
                                                <Text style={{ color: appcolor.dark, fontWeight: '700', }}>{processStatus}</Text>
                                            </View>
                                            <View style={{ width: '80%', }}>
                                                <View style={{ width: '100%', height: 10, borderColor: secondaryColor, borderWidth: 1, borderRadius: 10, overflow: 'hidden', }}>
                                                    <View style={{ width: processStatus, height: 10, backgroundColor: secondaryColor, }} />
                                                </View>
                                            </View>
                                        </View>
                                        <View>
                                            <Text style={{ color: appcolor.dark, fontSize: 17, fontWeight: '700', padding: 10, }}>
                                                {`${currentBS.semanticIndex + 1}/ ${data.questionName}?`} {isRequired && <Text style={{ color: appcolor.warning, fontSize: 20, fontWeight: '700', }}>*</Text>}
                                            </Text>
                                            {isRequired && (
                                                <Text style={{ color: appcolor.warning, fontSize: 15, fontWeight: '700', paddingLeft: 19, marginBottom: 10, }}>* Bắt buộc</Text>
                                            )}
                                            {data.min !== null && data.min !== undefined && (
                                                <Text style={{ color: appcolor.tomato, fontSize: 15, fontWeight: '700', paddingLeft: 19, marginBottom: 10, }}>* Tối thiểu: {data.min}</Text>
                                            )}
                                            {data.max !== null && data.max !== undefined && (
                                                <Text style={{ color: appcolor.tomato, fontSize: 15, fontWeight: '700', paddingLeft: 19, marginBottom: 10, }}>* Tối đa: {data.max}</Text>
                                            )}
                                            <View style={{ width: '100%', alignItems: 'center', }}>
                                                <View style={{ height: 1, width: '85%', borderColor: appcolor.dark, borderRadius: 1, borderWidth: 1.5, backgroundColor: appcolor.dark, opacity: 0.5, }} />
                                            </View>
                                            <ScrollView style={{ padding: 10, marginTop: 5, }}>
                                                <FlatList key="id" data={data.anwserItem || []}
                                                    scrollEnabled={true}
                                                    nestedScrollEnabled={true}
                                                    keyExtractor={(_, indexChild) => indexChild.toString()}
                                                    style={{ paddingLeft: 10, paddingRight: 10, marginTop: 5, maxHeight: deviceHeight / 3 }}
                                                    renderItem={(itemKid) => {
                                                        const itemChild = itemKid.item
                                                        const indexChild = itemKid.index
                                                        if (itemChild.id === 100) return // * Add New
                                                        switch (itemChild.anwserType) {
                                                            case ID_INPUT: return (
                                                                <AnswerInput itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} onChangeInput={onChangeInput} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_INPUTAREA: return (
                                                                <AnswerInputArea itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} onChangeInput={onChangeInput} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_NUMBER: return (
                                                                <AnswerNumber itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} onChangeInput={onChangeInput} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_MULTICHOICE: return (
                                                                <AnswerMultiChoice itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} data={data} onPressCheckbox={onPressCheckbox} onChangeOtherCheckbox={onChangeOtherCheckbox} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_CHECKBOX: return (
                                                                <AnswerCheckbox itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} data={data} onPressCheckbox={onPressCheckbox} onChangeOtherCheckbox={onChangeOtherCheckbox} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_DATE: return (
                                                                <AnswerDate itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} handleDisplayModal={handleDisplayModal} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_IMAGE: return (
                                                                <AnswerImage itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} handleDisplayModal={handleDisplayModal} onRemoveImage={onRemoveImage} imageGroup={imageGroup} questionId={currentBS.questionId} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_CAMERA: return (
                                                                <AnswerCamera itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} handleDisplayModal={handleDisplayModal} onRemoveImage={onRemoveImage} imageGroup={imageGroup} questionId={currentBS.questionId} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_GRIDSELECTION: return (
                                                                <AnswerGridSelection itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} onPressTest={onPressTest} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_GRIDMULTISELECTION: return (
                                                                <AnswerGridMultiSelection itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} onPressTest={onPressTest} isSubmitted={isSubmitted} />
                                                            )
                                                            case ID_ADDRESS: return (
                                                                <AnswerAddress itemChild={itemChild} indexChild={indexChild} appcolor={appcolor} onChangeInputAddress={onChangeInputAddress} isSubmitted={isSubmitted} onOpenModalAddress={onOpenModalAddress} />
                                                            )
                                                        }
                                                    }} />
                                            </ScrollView>
                                        </View>
                                    </View>
                                </ScrollView>
                                <View style={{ height: (!isFirstItem || (visibleNextButton) || visibleCompleteButton) ? 50 : 0, }}>
                                    <View style={{ width: '100%', backgroundColor: 'gray', height: 0.5, }} />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                        {!isFirstItem && (
                                            <TouchableOpacity onPress={onPrevQuestion} style={{ width: visibleNextButton || visibleCompleteButton ? '50%' : '100%', height: 50, justifyContent: 'center', }} disabled={isFirstItem}>
                                                <Text style={{ color: appcolor.dark, textAlign: 'center', fontSize: 18, }}>Quay lại</Text>
                                            </TouchableOpacity>
                                        )}
                                        {visibleNextButton && (
                                            <TouchableOpacity onPress={onNextQuestion} style={{ width: !isFirstItem ? '50%' : '100%', height: 50, justifyContent: 'center', }} disabled={isLastItem || !isDone}>
                                                <Text style={{ color: appcolor.dark, textAlign: 'center', fontSize: 18, }}>Tiếp tục</Text>
                                            </TouchableOpacity>
                                        )}
                                        {visibleCompleteButton && (
                                            <TouchableOpacity onPress={onShowSubmitButton} style={{ width: isFirstItem ? '100%' : '50%', height: 50, justifyContent: 'center', }}>
                                                <Text style={{ color: appcolor.highlightDate, textAlign: 'center', fontSize: 18, }}>Hoàn thành</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={{ height: deviceHeight * 0.2, justifyContent: 'center', width: '100%', }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', }}>
                            <RenderPaginations paginator={paginator} onJumpToQuestion={onJumpToQuestion} currentBS={currentBS} appcolor={appcolor} />
                        </View>
                    </View>
                </View>
            </View>
            <Modal visible={visibleModalAddress} animationType="slide" transparent={currentBS.type === "IMAGE_SELECT" || currentBS.type === "CAMERA_SELECT"}>
                <SafeAreaView style={{ backgroundColor: appcolor.light, flex: 1, height: deviceHeight, padding: 10, overflow: 'hidden', }}>
                    <Swiper ref={swiper} loop={false} showsPagination={false} onIndexChanged={onIndexModalAddressChanged}>
                        <View key={1} style={{ flex: 1, backgroundColor: appcolor.light, padding: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                <TouchableOpacity onPress={() => onOpenModalAddress(false)} style={{ padding: 15, }}>
                                    <Icon name="times" size={20} color={appcolor.dark} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.dark }}>{PROVINCE}</Text>
                                <TouchableOpacity onPress={() => onSwipe(1)} style={{ padding: 15, }}>
                                    <Icon name="chevron-right" size={20} color={appcolor.dark} />
                                </TouchableOpacity>
                            </View>
                            <FormGroup iconName="search" editable={true} value={dataModalAddress?.searchProvince || ''} placeholder="Tìm kiếm..." handleChangeForm={(e) => onFilterModalAddress(e, 'searchProvince', 'dataProvince')} />
                            <FlatList data={dataModalAddress?.dataProvince || []}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    const indexAnswer = 1
                                    const answerAddressItem = currentBS?.itemParent?.anwserItem?.[indexAnswer] || {}
                                    const isSelected = answerAddressItem?.anwserValue === item.name
                                    return (
                                        <View key={index} style={{ margin: 5, }}>
                                            <TouchableOpacity disabled={false} onPress={() => onSelectAddress(item, indexAnswer)} style={{ backgroundColor: isSelected ? appcolor.darklight : 'transparent', flexDirection: 'row', alignItems: 'center', padding: 10, }}>
                                                <Icon name="map-marker-alt" size={16} color={appcolor.dark} />
                                                <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{item.name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }} />
                        </View>
                        <View key={2} style={{ flex: 1, backgroundColor: appcolor.light, padding: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                <TouchableOpacity onPress={() => onSwipe(-1)} style={{ padding: 15, }}>
                                    <Icon name="chevron-left" size={20} color={appcolor.dark} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.dark }}>{DISTRICT}</Text>
                                <TouchableOpacity onPress={() => onSwipe(1)} style={{ padding: 15, }}>
                                    <Icon name="chevron-right" size={20} color={appcolor.dark} />
                                </TouchableOpacity>
                            </View>
                            <FormGroup iconName="search" editable={true} value={dataModalAddress?.searchDistrict || ''} placeholder="Tìm kiếm..." handleChangeForm={(e) => onFilterModalAddress(e, 'searchDistrict', 'dataDistrict')} stateName="search" />
                            <FlatList data={dataModalAddress?.dataDistrict || []}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    const indexAnswer = 2
                                    const answerAddressItem = currentBS?.itemParent?.anwserItem?.[indexAnswer] || {}
                                    const isSelected = answerAddressItem?.anwserValue === item.name
                                    return (
                                        <View key={index} style={{ margin: 5, }}>
                                            <TouchableOpacity disabled={false} onPress={() => onSelectAddress(item, indexAnswer)} style={{ backgroundColor: isSelected ? appcolor.darklight : 'transparent', flexDirection: 'row', alignItems: 'center', padding: 10, }}>
                                                <Icon name="map-pin" size={16} color={appcolor.dark} />
                                                <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{item.name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }} />
                        </View>
                        <View key={3} style={{ flex: 1, backgroundColor: appcolor.light, padding: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                <TouchableOpacity onPress={() => onSwipe(-1)} style={{ padding: 15, }}>
                                    <Icon name="chevron-left" size={20} color={appcolor.dark} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.dark }}>{TOWN}</Text>
                                <TouchableOpacity onPress={() => onOpenModalAddress(false)} style={{ padding: 15, }}>
                                    <Icon name="times" size={20} color={appcolor.dark} />
                                </TouchableOpacity>
                            </View>
                            <FormGroup iconName="search" editable={true} value={dataModalAddress?.searchTown || ''} placeholder="Tìm kiếm..." handleChangeForm={(e) => onFilterModalAddress(e, 'searchTown', 'dataTown')} stateName="search" />
                            <FlatList data={dataModalAddress?.dataTown || []}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    const indexAnswer = 3
                                    const answerAddressItem = currentBS?.itemParent?.anwserItem?.[indexAnswer] || {}
                                    const isSelected = answerAddressItem?.anwserValue === item.name
                                    return (
                                        <View key={index} style={{ margin: 5, }}>
                                            <TouchableOpacity disabled={false} onPress={() => onSelectAddress(item, indexAnswer)} style={{ backgroundColor: isSelected ? appcolor.darklight : 'transparent', flexDirection: 'row', alignItems: 'center', padding: 10, }}>
                                                <Icon name="compass" size={16} color={appcolor.dark} />
                                                <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{item.name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }} />
                        </View>
                    </Swiper>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={visibleModal}
                animationType="slide"
                transparent={currentBS.type === "IMAGE_SELECT" || currentBS.type === "CAMERA_SELECT"}
                statusBarTranslucent
            >
                <SafeAreaView style={{ backgroundColor: appcolor.light, flex: 1, height: deviceHeight, padding: 10, overflow: 'hidden', }}>
                    {currentBS.type === "DATE" ? (
                        <RenderCalendarListBS currentBS={currentBS} setVisibleModal={setVisibleModal} onDayPress={onDayPress} onClearDate={onClearDate} deviceHeight={deviceHeight} appcolor={appcolor} />
                    ) : (
                        <RenderAvatarSelectBS currentBS={currentBS} styles={styles} cameraLaunch={cameraLaunch} appcolor={appcolor} imageGalleryLaunch={imageGalleryLaunch} setVisibleModal={setVisibleModal} />
                    )}
                </SafeAreaView>
            </Modal>
        </View >
    )
}
const AnswerInput = ({ itemChild, appcolor, onChangeInput, isSubmitted, }) => {
    const handleChange = (value) => {
        onChangeInput(value, itemChild)
    }
    return (
        <View style={{ borderWidth: 1, borderColor: appcolor.dark, borderRadius: 5, }}>
            <TextInput editable={!isSubmitted} value={itemChild.anwserValue} onChangeText={handleChange} style={{ color: appcolor.dark, height: 40, fontSize: 16, paddingLeft: 10, }} returnKeyType="done"
                placeholder="Nhập câu trả lời..." placeholderTextColor={appcolor.grey} />
        </View>
    )
}
const AnswerInputArea = ({ itemChild, appcolor, onChangeInput, isSubmitted, }) => {
    const handleChange = (value) => {
        onChangeInput(value, itemChild)
    }
    return (
        <View style={{ borderWidth: 1, borderColor: appcolor.dark, borderRadius: 5, }}>
            <TextInput editable={!isSubmitted} value={itemChild.anwserValue} onChangeText={handleChange} style={{ color: appcolor.dark, padding: 100, fontSize: 16, paddingLeft: 10, paddingTop: 10, }} multiline={true} returnKeyType="done"
                placeholder="Nhập câu trả lời..." placeholderTextColor={appcolor.grey} />
        </View>
    )
}
const AnswerNumber = ({ itemChild, appcolor, onChangeInput, isSubmitted, }) => {
    const handleChange = (value) => {
        onChangeInput(value, itemChild, true)
    }
    return (
        <View style={{ borderWidth: 1, borderColor: appcolor.dark, borderRadius: 5, }}>
            <TextInput editable={!isSubmitted} value={itemChild.anwserValue} onChangeText={handleChange} style={{ color: appcolor.dark, height: 40, fontSize: 16, paddingLeft: 10, paddingRight: 10, textAlign: 'right', }} keyboardType="numeric" returnKeyType="done"
                placeholder="Nhập câu trả lời..." placeholderTextColor={appcolor.grey} />
        </View>
    )
}
const AnswerMultiChoice = ({ itemChild, indexChild, data, appcolor, onPressCheckbox, onChangeOtherCheckbox, isSubmitted, }) => {
    const handlePress = () => {
        onPressCheckbox(itemChild, indexChild, false)
    }
    const handleChangeOther = (value) => {
        onChangeOtherCheckbox(value, itemChild)
    }
    return (
        <View style={{ marginBottom: 5, marginTop: 5, }}>
            <TouchableOpacity disabled={isSubmitted} onPress={handlePress} style={{ flexDirection: 'row', alignItems: 'center', }}>
                <ListItem.CheckBox disabled={isSubmitted} onPress={handlePress} checked={itemChild.anwserValue === "true"} checkedColor={appcolor.dark} uncheckedColor={appcolor.dark} />
                <Text style={{ color: appcolor.dark, marginLeft: 5, fontSize: 16, }}>{itemChild.anwserName}</Text>
            </TouchableOpacity>
            {data.showInputOther && itemChild.id === ID_OTHERCHECKBOX && (
                <TextInput value={itemChild.ortherValue} placeholder="Other..." placeholderTextColor={appcolor.dark} onChangeText={handleChangeOther}
                    style={{ width: '100%', height: 40, marginTop: 10, paddingLeft: 10, color: appcolor.dark, borderRadius: 5, borderColor: appcolor.dark, borderWidth: 1, }} />
            )}
        </View>
    )
}
const AnswerCheckbox = ({ itemChild, indexChild, data, appcolor, onPressCheckbox, onChangeOtherCheckbox, isSubmitted, }) => {
    const handlePress = () => {
        onPressCheckbox(itemChild, indexChild, true)
    }
    const handleChangeOther = (value) => {
        onChangeOtherCheckbox(value, itemChild)
    }
    return (
        <View style={{ marginBottom: 5, marginTop: 5, }}>
            <TouchableOpacity disabled={isSubmitted} onPress={handlePress} style={{ flexDirection: 'row', alignItems: 'center', }}>
                <ListItem.CheckBox disabled={isSubmitted} onPress={handlePress} checked={itemChild.anwserValue === "true"} checkedColor={appcolor.dark} uncheckedColor={appcolor.dark} />
                <Text style={{ color: appcolor.dark, marginLeft: 5, fontSize: 16, }}>{itemChild.anwserName}</Text>
            </TouchableOpacity>
            {data.showInputOther && itemChild.id === ID_OTHERCHECKBOX && (
                <TextInput value={itemChild.ortherValue} placeholder="Other..." placeholderTextColor={appcolor.dark} onChangeText={handleChangeOther}
                    style={{ width: '100%', height: 40, marginTop: 10, paddingLeft: 10, color: appcolor.dark, borderRadius: 5, borderColor: appcolor.dark, borderWidth: 1, }} />
            )}
        </View>
    )
}
const AnswerDate = ({ itemChild, appcolor, handleDisplayModal, isSubmitted, }) => {
    const handlePress = () => {
        handleDisplayModal(itemChild, "DATE")
    }
    return (
        <TouchableOpacity disabled={isSubmitted} onPress={handlePress} style={{ padding: 5, flexDirection: 'row', alignItems: 'center', borderColor: appcolor.dark, borderWidth: 1, borderRadius: 5, height: 40, paddingLeft: 20, marginBottom: 10, }}>
            <Icon name="calendar" size={20} color={appcolor.dark} />
            <Text style={{ color: appcolor.dark, fontSize: 16, marginLeft: 10, }}>{itemChild.anwserValue !== "" ? itemChild.anwserValue : "Chọn ngày"}</Text>
        </TouchableOpacity>
    )
}
const AnswerImage = ({ itemChild, appcolor, handleDisplayModal, onRemoveImage, imageGroup, questionId, isSubmitted, }) => {
    try {
        const handlePress = () => {
            handleDisplayModal(itemChild, "IMAGE_SELECT")
        }
        return (
            <View style={{ width: '100%', }}>
                <TouchableOpacity disabled={isSubmitted} onPress={handlePress} style={{ padding: 5, flexDirection: 'row', alignItems: 'center', borderColor: appcolor.dark, borderWidth: 1, borderRadius: 5, height: 40, paddingLeft: 20, marginBottom: 10, }}>
                    <Icon name="file-upload" size={20} color={appcolor.dark} />
                    <Text style={{ color: appcolor.dark, fontSize: 18, marginLeft: 10, }}>Thêm hình ảnh</Text>
                </TouchableOpacity>
                <ScrollView>
                    <FlatList
                        data={imageGroup[questionId] || []} key="images"
                        numColumns={2}
                        scrollEnabled={false}
                        nestedScrollEnabled={false}
                        keyExtractor={(_, index) => index.toString()}
                        style={{ alignItems: 'center', }}
                        renderItem={({ item, index }) => {
                            return (
                                <View key={index} style={{ margin: 5, }}>
                                    {!isSubmitted && (
                                        <TouchableOpacity disabled={isSubmitted} onPress={() => onRemoveImage(index)} style={{ position: 'absolute', top: 5, right: 5, zIndex: 2000, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 50, backgroundColor: appcolor.primary }}>
                                            <Icon name="times" size={20} color={appcolor.white} />
                                        </TouchableOpacity>
                                    )}
                                    <RNImage
                                        source={{ uri: item.url, }}
                                        style={[{ flex: 1, width: 150, height: 150, resizeMode: 'cover' }]}
                                    />
                                </View>
                            )
                        }} />
                </ScrollView>
            </View>
        )
    } catch (e) { }
}
const AnswerCamera = ({ itemChild, appcolor, handleDisplayModal, onRemoveImage, imageGroup, questionId, isSubmitted, }) => {
    try {
        const handlePress = () => {
            handleDisplayModal(itemChild, "CAMERA_SELECT")
        }
        return (
            <View style={{ width: '100%', }}>
                <TouchableOpacity disabled={isSubmitted} onPress={handlePress} style={{ padding: 5, flexDirection: 'row', alignItems: 'center', borderColor: appcolor.dark, borderWidth: 1, borderRadius: 5, height: 40, paddingLeft: 20, marginBottom: 10, }}>
                    <Icon name="file-upload" size={20} color={appcolor.dark} />
                    <Text style={{ color: appcolor.dark, fontSize: 18, marginLeft: 10, }}>Thêm hình ảnh</Text>
                </TouchableOpacity>
                <ScrollView>
                    <FlatList data={imageGroup[questionId] || []} key="images" numColumns={3}
                        scrollEnabled={false}
                        nestedScrollEnabled={false}
                        keyExtractor={(_, index) => index.toString()}
                        style={{ alignItems: 'center', }}
                        renderItem={({ item, index }) => {
                            return (
                                <View key={index} style={{ margin: 5, }}>
                                    {!isSubmitted && (
                                        <TouchableOpacity disabled={isSubmitted} onPress={() => onRemoveImage(index)} style={{ position: 'absolute', top: 5, right: 5, zIndex: 2000, }}>
                                            <Icon name="times" size={20} color={appcolor.dark} />
                                        </TouchableOpacity>
                                    )}
                                    <RNImage
                                        source={{ uri: item.url, }}
                                        style={[{ flex: 1, width: 100, height: 100, resizeMode: 'cover' }]}
                                    />
                                </View>
                            )
                        }} />
                </ScrollView>
            </View>
        )
    } catch (e) { }
}
const AnswerGridSelection = ({ itemChild, onPressTest, isSubmitted, }) => {
    const handlePress = () => {
        onPressTest(itemChild)
    }
    return (
        <View>
            <ListItem.CheckBox checked={itemChild.anwserValue === "true"} disabled={isSubmitted} onPress={handlePress} />
        </View>
    )
}
const AnswerGridMultiSelection = ({ itemChild, onPressTest, isSubmitted, }) => {
    const handlePress = () => {
        onPressTest(itemChild)
    }
    return (
        <View>
            <ListItem.CheckBox checked={itemChild.anwserValue === "true"} disabled={isSubmitted} onPress={handlePress} />
        </View>
    )
}
const AnswerAddress = ({ itemChild, isSubmitted, onChangeInputAddress, appcolor, onOpenModalAddress, }) => {
    const handleChange = (value) => {
        onChangeInputAddress(value, itemChild)
    }
    return (
        <View style={{ backgroundColor: appcolor.light }}>
            {itemChild?.id === 1 ? (
                <View style={{ borderWidth: 1, borderColor: appcolor.dark, borderRadius: 5, marginBottom: 10, }}>
                    <TextInput editable={!isSubmitted} value={itemChild.anwserValue} onChangeText={handleChange} style={{ color: appcolor.dark, height: 40, fontSize: 16, paddingLeft: 10, }} returnKeyType="done"
                        placeholder="Nhập câu trả lời..." placeholderTextColor={appcolor.grey} />
                </View>
            ) : itemChild?.id === 2 ? (
                <TouchableOpacity disabled={isSubmitted} onPress={() => onOpenModalAddress(true, 0, itemChild)} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 10, }}>
                    <Icon name="map-marker-alt" size={16} color={appcolor.dark} />
                    <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{!!itemChild.anwserValue ? itemChild.anwserValue : PROVINCE}</Text>
                </TouchableOpacity>
            ) : itemChild?.id === 3 ? (
                <TouchableOpacity disabled={isSubmitted} onPress={() => onOpenModalAddress(true, 1, itemChild)} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 10, }}>
                    <Icon name="map-pin" size={16} color={appcolor.dark} />
                    <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{!!itemChild.anwserValue ? itemChild.anwserValue : DISTRICT}</Text>
                </TouchableOpacity>
            ) : itemChild?.id === 4 && (
                <TouchableOpacity disabled={isSubmitted} onPress={() => onOpenModalAddress(true, 2, itemChild)} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 10, }}>
                    <Icon name="compass" size={16} color={appcolor.dark} />
                    <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{!!itemChild.anwserValue ? itemChild.anwserValue : TOWN}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}
const RenderCalendarListBS = ({ deviceHeight, appcolor, currentBS, setVisibleModal, onDayPress, onClearDate, }) => {
    try {
        return (
            <SafeAreaView style={{ flex: 1, height: deviceHeight, padding: 10, overflow: 'hidden', backgroundColor: appcolor.light }}>
                <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                    <Text style={{ color: appcolor.dark, fontSize: 20, fontWeight: '700', }}>Chọn ngày</Text>
                    <TouchableOpacity onPress={() => setVisibleModal(false)}>
                        <Icon name="times" size={25} color={appcolor.dark} />
                    </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', }}>
                    <DateChoose
                        onChooseDate={onDayPress}
                    />
                    {currentBS.showClearDate && (
                        <TouchableOpacity onPress={onClearDate}>
                            <Text style={{ color: appcolor.dark, textAlign: 'center', fontSize: 16, }}>Bỏ chọn</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        )
    } catch (e) { }
}
const RenderAvatarSelectBS = ({ styles, cameraLaunch, currentBS, appcolor, imageGalleryLaunch, setVisibleModal, }) => {
    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: appcolor.dark, paddingLeft: 5, }}>Chọn hình ảnh</Text>
            </View>
            <View style={styles.modalContent}>
                <View style={{ width: '100%', paddingLeft: 5, }}>
                    <TouchableOpacity style={{ padding: 15 }} onPress={cameraLaunch}>
                        <Text style={{ color: appcolor.dark, fontSize: 16, }}>Chụp hình...</Text>
                    </TouchableOpacity>
                    {currentBS.showGalleryImagePicker && (
                        <TouchableOpacity style={{ padding: 15 }} onPress={imageGalleryLaunch}>
                            <Text style={{ color: appcolor.dark, fontSize: 16, }}>Chọn hình từ thư viện...</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => setVisibleModal(false)}>
                    <Text style={{ color: appcolor.dark, textAlign: 'right', marginRight: 10, fontSize: 18, fontWeight: '600' }}>Huỷ</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
const RenderPaginations = ({ paginator, currentBS, appcolor, onJumpToQuestion, }) => {
    try {
        let cell = []
        const paginators = Object.entries(paginator)
        paginators.forEach(([key, value], idx) => {
            const isFocusing = currentBS.semanticIndex === idx
            const isOutOfBound = currentBS.semanticIndex >= 3 && currentBS.semanticIndex < paginators.length - 1
            if ((idx < 3 || (paginators.length > 3 && idx === paginators.length - 1))) {
                cell.push(
                    <TouchableOpacity disabled={false} onPress={() => onJumpToQuestion(key, value)} key={idx} style={{ backgroundColor: isFocusing ? appcolor.tomato : appcolor.light, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', margin: 5, borderRadius: 50, }}>
                        <Text style={{ color: isFocusing ? appcolor.light : appcolor.dark, }}>{value + 1}</Text>
                    </TouchableOpacity>
                )
            }
            if (idx === 3 && idx < paginators.length - 1) {
                cell.push(
                    <View key={idx} style={{ backgroundColor: isOutOfBound ? appcolor.tomato : appcolor.light, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', margin: 5, borderRadius: 50, }}>
                        <Text style={{ color: appcolor.dark }} >...</Text>
                    </View>
                )
            }
        })
        return cell
    } catch (e) { }
}