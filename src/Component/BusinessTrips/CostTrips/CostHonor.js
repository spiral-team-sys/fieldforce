import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useDispatch, useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { formatNumber } from "../../../Core/Helper";
import { alertWarning, deviceHeight, isValid } from "../../../Core/Utility";
import { HeaderBusiness } from "../HeaderBusiness";
import { getBusinesDataSupport, MODE, TYPE } from "../UtilityBusiness";
import _ from 'lodash'
import { ACTION } from "../../../Core/ReduxController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ScrollView } from "react-native-actions-sheet";
import moment from "moment";
import { SetBusinesTrips } from "../../../Redux/action";

export const CostHonor = ({ onBack, onNext, quotaData, limitCostSupport, limitCostSupportTotal, dateFilter }) => {
    const { appcolor, tripResult, userinfo } = useSelector(state => state.GAppState)
    const [typeArrow, setTypeArrow] = useState({
        titleHeader: `Chi phí`,
        typeBack: 'arrow-back', typeForward: 'playlist-add-check',
        isHighLight: false
    })
    const dispatch = useDispatch()
    const [itemCost, setItemCost] = useState({
        typeKM: tripResult.typeKM || null,
        kmValue: tripResult.kmValue || 0,
        supportKM: tripResult.supportKM || 0,
        vehicalValue: tripResult.supportVehical || 0,
        nightRestValue: tripResult.supportNight || 0,
        lunchValue: tripResult.supportLunch || 0,
        dinnerValue: tripResult.supportDinner || 0,
        otherValue: tripResult.supportOther || 0,
        supportWorkValue: tripResult.supportWork || 0,
        vehicalOtherValue: tripResult.supportVehicalOther || 0,
        totalCostsTrip: tripResult.totalCostsTrip || 0,
        countUpdate: tripResult.countUpdate || 0
    })
    const listTypeCost = _.find(tripResult.listTypeCost, it => it.isChoose == 1) || {}

    const LoadData = async () => {
        countByProvince()
    }
    const countByProvince = () => {
        let countNightValue = 0
        let countFoodValue = 0
        let countVehicalValueOther = 0
        let countSupportKm = 0

        let countNightDay = 0
        let countEatDay = 0

        let sumKmValue = itemCost.kmValue || 0

        const listChoose = _.filter(tripResult.listTypeCost, it => it.isChoose == 1 && (it.code == 'onlyWorkCosts' || it.code == 'onlyOtherCosts'))
        if (listChoose.length == 0) {
            if (tripResult.provinceList != null && tripResult.provinceList != undefined && tripResult.provinceList?.length > 0) {
                for (let index = 0; index < (tripResult.provinceList?.length || 0); index++) {
                    const item = tripResult.provinceList[index]
                    countNightValue = countNightValue + (item.nightRestValue || 0)
                    countFoodValue = countFoodValue + (item.foodCostPoint || 0)
                    countVehicalValueOther = countVehicalValueOther + (item.vehicalValue || 0)
                    // sumKmValue = sumKmValue + (item.distance || 0)

                    countNightDay = countNightDay + item.numberDay
                    countEatDay = countEatDay + item.eatDay

                }
            } else {
                countNightValue = tripResult.nightValue * (quotaData.hotelSup || 360000)
                countFoodValue = tripResult.dayValue * (quotaData.foodSup || 220000)
            }

            tripResult.nightValue = countNightDay
            tripResult.dayValue = countEatDay

            const distanceCheck = quotaData.distanceCheck
            const kmValue = (sumKmValue / 1000).toFixed(0) || 0
            const result = distanceCheck.find(item => kmValue >= item.minKm && kmValue <= item.maxKm);
            countSupportKm = result?.valueCost || 0
        }

        setItemCost({
            ...itemCost,
            nightRestValue: countNightValue,
            lunchValue: countFoodValue,
            supportKM: countSupportKm,
            vehicalOtherValue: countVehicalValueOther,
            kmValue: sumKmValue
        })
    }

    const handlerItemChangeText = async (text, typeItem) => {
        const valueInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null
        let itemUpdate = {}
        switch (typeItem) {
            case TYPE.TYPE_KM:
                itemUpdate = { ...itemCost, kmValue: valueInput }
                break
            case TYPE.TYPE_VEHICAL:
                itemUpdate = { ...itemCost, vehicalValue: valueInput }
                break
            case TYPE.TYPE_VEHICAL_OTHER:
                itemUpdate = { ...itemCost, vehicalOtherValue: valueInput }
                break
            case TYPE.TYPE_NIGTH_REST:
                itemUpdate = { ...itemCost, nightRestValue: valueInput }
                break
            case TYPE.TYPE_LUNCH:
                itemUpdate = { ...itemCost, lunchValue: valueInput }
                break
            case TYPE.TYPE_DINNER:
                itemUpdate = { ...itemCost, dinnerValue: valueInput }
                break
            case TYPE.TYPE_OTHER:
                itemUpdate = { ...itemCost, otherValue: valueInput }
                break
            case TYPE.TYPE_SUPPORT_WORK:
                itemUpdate = { ...itemCost, supportWorkValue: valueInput }
                break
            default:
                itemUpdate = itemCost
                break
        }
        await setItemCost(itemUpdate)
    }
    const handlerTripResult = async () => {
        await checkInputData(async (isSuccess, message, alertNotify) => {
            if (isSuccess) {
                const costResult = await getBusinesDataSupport(itemCost, userinfo.groupType)
                if (costResult.totalSupport == 0) {
                    alertWarning(`Chi phí công tác phải lớn hơn 0`)
                    return
                }

                const tripConfig = JSON.parse(dateFilter.tripConfig || '{}')
                let alertDate = ''
                if (((tripConfig.maxDayConstrant || 0) > 0) && ((tripConfig.maxDayInMonth || 0) > 0) && listTypeCost.code !== 'onlyWorkCosts') {
                    const totalDayMonth = ((dateFilter.totalDayMonth || 0) - (dateFilter.isUpdate ? (tripResult.daysOld || 0) : 0))
                    const dayValue = tripResult.dayValue || 0

                    if (tripConfig.maxDayConstrant == 2 && (totalDayMonth + dayValue) > tripConfig.maxDayInMonth) {
                        alertDate = `Tổng số ngày lớn hơn ${tripConfig.maxDayInMonth} (${totalDayMonth + dayValue}/${tripConfig.maxDayInMonth})\n`
                        // alertWarning(`Tổng số ngày lớn hơn ${tripConfig.maxDayInMonth} (${totalDayMonth + dayValue}/${tripConfig.maxDayInMonth})\n Bạn phải đảm bảo đã có email duyệt của Quản lý cấp 2 & phải upload hình ảnh email duyệt khi upload chứng từ.`)
                    }
                    if (tripConfig.maxDayConstrant == 1 && (totalDayMonth + dayValue) > tripConfig.maxDayInMonth) {
                        alertWarning(`Tổng số ngày đăng kí công tác phải nhỏ hơn hoặc bằng ${tripConfig.maxDayInMonth} ngày (${totalDayMonth + dayValue}/${tripConfig.maxDayInMonth})`)
                        return
                    }
                }

                if (alertNotify.length > 0 || alertDate.length > 0) {
                    alertWarning(alertNotify + alertDate + `Bạn phải đảm bảo đã có email duyệt của Quản lý cấp 2 & phải upload hình ảnh email duyệt khi upload chứng từ.`)
                }

                const itemTripResult = await _.merge(tripResult, costResult)
                // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: itemTripResult })
                await dispatch(SetBusinesTrips(itemTripResult))
                await onNext(MODE.COST)
            } else {
                alertWarning(message)
            }
        })
    }
    const checkInputData = (actionDone) => {
        let strAlertWorkValue = ''
        const evidenceParse = JSON.parse(tripResult.evidence || '[]')
        const tripConfig = JSON.parse(dateFilter.tripConfig || '{}')
        if (tripConfig.maxUpdate > 0 && dateFilter.isUpdate) {
            if (tripConfig.maxUpdate == itemCost.countUpdate) {
                actionDone(false, tripConfig.notifyAlert || `Giới hạn số lần cập nhật (${itemCost.countUpdate}/${tripConfig.maxUpdate})`)
                return
            } else if (tripConfig.maxUpdate > itemCost.countUpdate && dateFilter.isEvidentDateChange) {
                const priceVehicalOtherValue = itemCost.vehicalOtherValue || 0
                const priceKm = itemCost.supportKM || 0
                const priceLunch = itemCost.lunchValue || 0
                const priceNightHotel = itemCost.nightRestValue || 0
                const priceOther = itemCost.otherValue || 0
                const priceSupportWork = itemCost.supportWorkValue || 0
                // totalCostsTrip
                const totalCostValue = priceKm + priceLunch + priceNightHotel + priceVehicalOtherValue + priceOther + priceSupportWork

                if (totalCostValue > itemCost.totalCostsTrip) {

                    // if (!dateFilter.isEvidentDateChange) {
                    //     actionDone(false, `Chi phí lớn hơn chi phí đăng kí trước đó (${totalCostValue}/${itemCost.totalCostsTrip})`)
                    //     return
                    // } else {
                    if (evidenceParse.length == 0) {
                        actionDone(false, `Vui lòng thêm hình ảnh làm bằng chứng cho chi phí lớn hơn chi phí đăng kí trước đó (${totalCostValue}/${itemCost.totalCostsTrip})`)
                        return
                    } else {
                        strAlertWorkValue += `Tổng chi phí lớn hơn chi phí đăng kí trước đó (${totalCostValue}/${itemCost.totalCostsTrip}),\n`
                    }
                    // }
                }
            }
        }

        let strValid = ''
        if (!isValid(itemCost.vehicalOtherValue))
            strValid += 'Chi phí di chuyển, '

        if (!isValid(itemCost.lunchValue))
            strValid += 'Chi phí ăn uống, '

        if (itemCost.nightRestValue > itemCost.maxNightValue) {
            strValid += `Chi phí khách sạn phải nhỏ hơn hoặc bằng định mức hỗ trợ ${itemCost.maxNightValue},\n`
        }
        const tripMonth = moment(tripResult.fromDate, 'YYYYMMDD').month() + 1
        const limitCostMonth = _.filter(limitCostSupport, (itemlimit) => itemlimit.Month == tripMonth)[0] || null
        const limitCostTotalMonth = _.filter(limitCostSupportTotal, (itemlimit) => itemlimit.Month == tripMonth)[0] || null

        if (limitCostMonth) {
            const limitByWork = (dateFilter.isUpdate ? (limitCostMonth.CostLimit + (tripResult.supportWorkMaint || 0)) : limitCostMonth.CostLimit)
            const limitByWorkMain = limitByWork > limitCostMonth.MaxCostSupportWork ? limitCostMonth.MaxCostSupportWork : limitByWork
            if (itemCost.supportWorkValue > 0 && itemCost.supportWorkValue > limitByWorkMain) {
                if (dateFilter.isEvidentDateChange) {
                    if (evidenceParse.length == 0) {
                        strValid += `Vui lòng thêm hình ảnh làm bằng chứng cho chi phí tiếp khách đang lớn hơn định mức hỗ trợ (${formatNumber(itemCost.supportWorkValue, ',')}/${formatNumber(limitByWorkMain, ',') || 0}),\n`
                    } else {
                        strAlertWorkValue += `Tổng chi phí tiếp khách đang lớn hơn định mức hỗ trợ (${formatNumber(itemCost.supportWorkValue, ',')}/${formatNumber(limitByWorkMain, ',') || 0}),\n`
                    }
                }
                if (!dateFilter.isEvidentDateChange) {
                    strValid += `Chi phí tiếp khách phải nhỏ hơn hoặc bằng định mức hỗ trợ (${formatNumber(itemCost.supportWorkValue, ',')}/${formatNumber(limitByWorkMain, ',') || 0}),\n`
                }
            }
        }

        if (limitCostTotalMonth && limitCostMonth) {
            const limitByTotal = (dateFilter.isUpdate ? (limitCostTotalMonth.CostLimit + ((tripResult.totalCostsTrip - tripResult.supportWorkMaint) || 0)) : limitCostTotalMonth.CostLimit)
            const limitByTotalMain = limitByTotal > limitCostMonth.MaxCostSupport ? limitCostMonth.MaxCostSupport : limitByTotal
            const costResult = getBusinesDataSupport(itemCost, userinfo.groupType)
            const totalCostValue = costResult.totalSupport || 0
            if ((totalCostValue - costResult.supportWork) > limitByTotalMain) {
                if (dateFilter.isEvidentDateChange) {
                    if (evidenceParse.length == 0) {
                        strValid += `Vui lòng thêm hình ảnh làm bằng chứng cho chi phí công tác đang lớn hơn định mức hỗ trợ (${formatNumber(totalCostValue - costResult.supportWork, ',')}/${formatNumber(limitByTotalMain, ',') || 0}),\n`
                    } else {
                        strAlertWorkValue += `Tổng chi phí công tác đang lớn hơn định mức hỗ trợ (${formatNumber(totalCostValue - costResult.supportWork, ',')}/${formatNumber(limitByTotalMain, ',') || 0}),\n`
                        // alertWarning(strAlertWorkValue + `Tổng chi phí công tác đang lớn hơn định mức hỗ trợ (${formatNumber(totalCostValue - costResult.supportWork, ',')}/${formatNumber(limitByTotal, ',') || 0}),\n`)
                    }
                } else {
                    strValid += `Tổng chi phí công tác phải nhỏ hơn hoặc bằng định mức hỗ trợ (${formatNumber(totalCostValue - costResult.supportWork, ',')}/${formatNumber(limitByTotalMain, ',') || 0}),\n`
                }
            }
        }
        // CostLimit
        actionDone(strValid.length == 0, `Vui lòng nhập đầy đủ dữ liệu: \n${strValid}`, strAlertWorkValue)
    }
    const valueItem = (value) => {
        return value == 0 ? '0' : formatNumber(value, ',')
    }
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: deviceHeight, backgroundColor: appcolor.light }
    })
    useEffect(() => {
        LoadData()
        return () => false
    }, [])
    const handlerOnBack = () => {
        tripResult.supportWork = itemCost.supportWorkValue
        tripResult.supportOther = itemCost.otherValue
        onBack(MODE.COST)
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderBusiness
                isHighLight={typeArrow.isHighLight}
                typeArrow={typeArrow}
                onBack={() => handlerOnBack()}
                onForward={handlerTripResult}
            />
            <ScrollView
                style={{ width: '100%', height: deviceHeight }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%', height: '100%' }}
                    extraHeight={deviceHeight / 4}
                    enableOnAndroid >
                    <ItemInput
                        typeFilter={TYPE.TYPE_VEHICAL}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí di chuyển'
                        placeholder={`Tổng chi phí di chuyển (${tripResult.dayValue} Ngày)`}
                        iconName='car'
                        itemValue={valueItem(itemCost.vehicalOtherValue)}
                        onChangeText={handlerItemChangeText}
                        editable={false}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        editable={false}
                        titleName={`Km/chuyến đi (${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm)`}
                        placeholder={`Tổng số kilomet di chuyển`}
                        iconName='road'
                        itemValue={(itemCost.kmValue / 1000).toFixed(2)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        editable={false}
                        titleName={`Chi phí di chuyển theo KM`}
                        placeholder={`Tổng tiền di chuyển theo KM`}
                        iconName='road'
                        itemValue={valueItem(itemCost.supportKM)}
                        onChangeText={handlerItemChangeText}
                    />

                    <ItemInput
                        typeFilter={TYPE.TYPE_LUNCH}
                        keyboardType="numeric"
                        isRequire
                        editable={false}
                        titleName={`Chi phí ăn uống (${tripResult.dayValue} Ngày)`}
                        placeholder={`Tổng chi phí ăn uống (${tripResult.dayValue} Ngày)`}
                        iconName='utensils'
                        itemValue={valueItem(itemCost.lunchValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_NIGTH_REST}
                        keyboardType="numeric"
                        // isRequire
                        editable={false}
                        titleName={`Chi phí khách sạn (${tripResult.nightValue} Đêm)`}
                        placeholder={`Tổng tiền khách sạn / nhà nghỉ`}
                        iconName='hotel'
                        itemValue={valueItem(itemCost.nightRestValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_SUPPORT_WORK}
                        keyboardType="numeric"
                        titleName='Chi phí tiếp khách'
                        placeholder='Chi phí tiếp khách'
                        iconName='money-bill'
                        editable={Object.keys(listTypeCost).length > 0 ? (listTypeCost.code == 'onlyWorkCosts' ? true : false) : true}
                        itemValue={valueItem(itemCost.supportWorkValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_OTHER}
                        keyboardType="numeric"
                        titleName='Chi phí khác'
                        placeholder='Chi phí hoa tươi'
                        iconName='money-bill'
                        editable={Object.keys(listTypeCost).length > 0 ? (listTypeCost.code == 'onlyOtherCosts' ? true : false) : true}
                        itemValue={valueItem(itemCost.otherValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <View style={{ height: deviceHeight / 2 }} />
                </KeyboardAwareScrollView>
            </ScrollView>
        </View>
    )
}

const ItemInput = ({ titleName, iconName, isRequire, onActionRight, typeFilter, itemValue, placeholder, onChangeText, keyboardType = 'default', editable = true }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const widthItem = onActionRight !== undefined ? '90%' : '100%'
    const styles = StyleSheet.create({
        mainItem: { padding: 8, marginBottom: 1 },
        titleHeader: { width: '100%', fontSize: 13, fontWeight: '600', color: appcolor.blacklight, marginStart: 8 },
        placeholderHeader: { width: '100%', fontSize: 13, fontWeight: '300', color: appcolor.placeholderText, marginStart: 8, marginBottom: 8, fontStyle: 'italic' },
        inputView: { width: widthItem, backgroundColor: appcolor.surface, borderRadius: 5, marginBottom: 0 }
    })
    const onPress = () => {
        onActionRight(typeFilter, itemValue)
    }
    const handlerChangeValue = (text) => {
        itemValue = text
        onChangeText !== undefined && onChangeText(text, typeFilter)
    }
    return (
        <View style={styles.mainItem}>
            <View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
                {iconName && <Icon name={iconName} type="font-awesome-5" size={15} color={appcolor.blacklight} />}
                {titleName &&
                    <Text style={styles.titleHeader}>{`${titleName} `}
                        {isRequire && <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>}
                    </Text>
                }
            </View>
            <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                <FormGroup
                    isSecure
                    keyboardType={keyboardType}
                    containerStyle={styles.inputView}
                    editable={editable}
                    multiline
                    useClearAndroid={false}
                    value={itemValue}
                    handleChangeForm={handlerChangeValue}
                />
                {onActionRight !== undefined &&
                    <TouchableOpacity
                        style={{ width: '10%', padding: 8, marginStart: 5, backgroundColor: appcolor.info, borderRadius: 50 }}
                        onPress={onPress}>
                        <Icon type="font-awesome-5" name="search" size={18} color={appcolor.light} />
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}
