import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GetDataMasterBusiness, GetPlanBusiness } from "../../../Controller/BussinessTripController";
import { formatNumber, groupDataByKey } from "../../../Core/Helper";
import { alertWarning, deviceHeight, isValid } from "../../../Core/Utility";
import { HeaderBusiness } from "../HeaderBusiness";
import { getBusinesDataSupport, MODE, TYPE } from "../UtilityBusiness";
import { ACTION } from "../../../Core/ReduxController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ItemInput } from "../InputControl/ItemInput";
import _ from 'lodash'
import { SetBusinesTrips } from "../../../Redux/action";

export const CostViessmann = ({ onBack, onNext, limitCost }) => {
    const { appcolor, tripResult, userinfo } = useSelector(state => state.GAppState)
    const [typeArrow, _setTypeArrow] = useState({
        titleHeader: `Chi phí`,
        typeBack: 'arrow-back', typeForward: 'playlist-add-check',
        isHighLight: false
    })
    const dispatch = useDispatch()
    const [dataKilomet, setDataKilomet] = useState([])
    const [dataPlan, setDataPlan] = useState([])
    const [itemCost, setItemCost] = useState({
        typeKM: tripResult.typeKM || null,
        kmValue: tripResult.kmValue || 0,
        daysMove: tripResult.daysMove || 0,
        supportKM: limitCost?.isSupportKM > 0 && tripResult.supportKM == undefined ? 400000 : (tripResult.supportKM || 0),
        vehicalValue: limitCost?.isSupportCar > 0 && tripResult.supportVehical == undefined ? ((limitCost?.isSupportCar || tripResult.dayValue) * 250000) : (tripResult.supportVehical || 0),
        nightRestValue: limitCost?.isSupportNight > 0 && tripResult.supportNight == undefined ? ((limitCost?.isSupportNight || tripResult.nightValue) * 300000) : (tripResult.supportNight || 0),
        lunchValue: tripResult.supportLunch || 0,
        dinnerValue: tripResult.supportDinner || 0,
        otherValue: tripResult.supportOther || 0,
        vehicalOtherValue: tripResult.supportVehicalOther || 0,
        totalNumberDay: _.sumBy(tripResult.provinceList, 'numberDay') || 0,
        stayValue: tripResult.supportStay || (_.sumBy(tripResult.provinceList, 'numberDay') || 0) * 400000,
        limitCost: JSON.stringify(limitCost),
        costNote: tripResult.costNote || null
    })

    const LoadData = async () => {
        await GetDataMasterBusiness('WorkingScheduleKM', async (mData) => {
            await setDataKilomet(mData)
        })
        // await LoadPlanBusiness()
    }
    const LoadPlanBusiness = async () => {
        await GetPlanBusiness(tripResult.fromDate, tripResult.toDate, async (mData) => {
            const { arr } = await groupDataByKey({
                arr: mData,
                key: 'auditDate'
            })
            await setDataPlan(arr);
        })
    }
    const handlerItemChangeText = async (text, typeItem) => {
        const valueInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null
        let itemUpdate = {}
        switch (typeItem) {
            case TYPE.TYPE_DAYS_MOVE:
                itemUpdate = { ...itemCost, daysMove: valueInput }
                break
            case TYPE.TYPE_KM:
                itemUpdate = { ...itemCost, supportKM: valueInput }
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
            case TYPE.TYPE_NUMBER_DAY:
                itemUpdate = { ...itemCost, stayValue: valueInput }
                break
            case TYPE.TYPE_COST_NOTE:
                itemUpdate = { ...itemCost, costNote: text }
                break
            default:
                itemUpdate = itemCost
                break
        }
        await setItemCost(itemUpdate)
        // const costResult = await getBusinesDataSupport(itemUpdate)
        // const moneyLimit = tripResult.moneyLimit - costResult.totalSupport
        // await setTypeArrow({
        //     ...typeArrow,
        //     titleHeader: `Hạn mức ${moneyLimit == 0 ? 0 : formatNumber(moneyLimit, ',')} VNĐ`,
        //     isHighLight: moneyLimit < 0
        // })
    }
    const handlerTripResult = async () => {
        await checkInputData(async (isSuccess, message) => {
            if (isSuccess) {
                const costResult = await getBusinesDataSupport(itemCost, userinfo.groupType)
                const limitCostResult = { limitCost: JSON.stringify([limitCost]) }
                //
                const itemTripResult = await _.merge(tripResult, costResult, limitCostResult)
                // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: itemTripResult })
                await dispatch(SetBusinesTrips(itemTripResult))
                await onNext(MODE.COST)
            } else {
                alertWarning(message)
            }
        })
    }
    const checkInputData = (actionDone) => {
        let strValid = ''
        if (!isValid(itemCost.supportKM))
            strValid += 'Chi phí di chuyển, '
        if (!isValid(itemCost.nightRestValue))
            strValid += 'Chi phí khách sạn, '
        if (!isValid(itemCost.vehicalValue))
            strValid += 'Chi phí thuê xe, '
        if (!isValid(itemCost.lunchValue))
            strValid += 'Chi phí ăn trưa, '
        actionDone(strValid.length == 0, `Vui lòng nhập đầy đủ dữ liệu: ${strValid}`)
    }
    const valueItem = (value) => {
        return value == 0 ? '0' : formatNumber(value, ',')
    }
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: deviceHeight, backgroundColor: appcolor.light }
    })
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [])
    return (
        <View style={styles.mainContainer}>
            <HeaderBusiness
                isHighLight={typeArrow.isHighLight}
                typeArrow={typeArrow}
                onBack={() => onBack(MODE.COST)}
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
                    {/* <ItemInput
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        titleName={`Chi phí di chuyển (${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm)`}
                        placeholder={limitCost?.isSupportKM > 0 ? `Tổng tiền di chuyển (${tripResult.dayValue} ngày - Đơn giá: 400,000 VNĐ/Chuyến)\nHạn mức còn lại ${limitCost?.isSupportKM} Chuyến` : `Đã hết hạn mức đăng kí`}
                        iconName='road'
                        itemValue={valueItem(itemCost.supportKM)}
                        onChangeText={handlerItemChangeText}
                        editable={limitCost?.isSupportKM > 0}
                        maxValue={limitCost?.supportKMPrice}
                    /> */}
                    <ItemInput
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        titleName={`Chi phí di chuyển (${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm)`}
                        placeholder={`Đơn giá 200k/Lượt - 800k/Tháng (Khung giá nhập 200k - 400k)`}
                        iconName='road'
                        itemValue={valueItem(itemCost.supportKM)}
                        onChangeText={handlerItemChangeText}
                        maxValue={limitCost?.supportKMPrice}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_NIGTH_REST}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí khách sạn'
                        placeholder={limitCost?.isSupportNight > 0 ? `Tổng tiền khách sạn / nhà nghỉ (Đơn giá: 300,000 VNĐ/Đêm)\nHạn mức còn lại ${limitCost?.isSupportNight} Đêm` : `Đã hết hạn mức đăng kí`}
                        iconName='hotel'
                        itemValue={valueItem(itemCost.nightRestValue)}
                        onChangeText={handlerItemChangeText}
                        editable={limitCost?.isSupportNight > 0}
                        maxValue={limitCost?.supportNightPrice * tripResult.nightValue}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_VEHICAL}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí thuê xe'
                        placeholder={limitCost?.isSupportCar > 0 ? `Chi phí thuê xe (Đơn giá: 250,000 VNĐ/Ngày)\nHạn mức còn lại ${limitCost?.isSupportCar} Ngày` : `Đã hết hạn mức đăng kí`}
                        iconName='car'
                        itemValue={valueItem(itemCost.vehicalValue)}
                        onChangeText={handlerItemChangeText}
                        editable={limitCost?.isSupportCar > 0}
                        maxValue={limitCost?.supportCarPrice * tripResult.dayValue}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_LUNCH}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí ăn trưa'
                        placeholder={`Tổng tiền ăn trưa của chuyến đi`}
                        iconName='utensils'
                        itemValue={valueItem(itemCost.lunchValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_COST_NOTE}
                        titleName='Ghi chú chi phí'
                        placeholder={`Nhập nội dung ghi chú chi phí`}
                        iconName='comment-alt'
                        itemValue={itemCost.costNote}
                        onChangeText={handlerItemChangeText}
                    />
                    <View style={{ height: deviceHeight / 2 }} />
                </KeyboardAwareScrollView>
            </ScrollView>

        </View>
    )
}
