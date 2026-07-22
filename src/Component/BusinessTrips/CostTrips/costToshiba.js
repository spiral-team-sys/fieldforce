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

export const CostToshiba = ({ onBack, onNext, limitCost, listProvinceCentral, quotaData }) => {
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
        supportKM: tripResult.supportKM || 0,
        vehicalValue: tripResult.supportVehical || 0,
        nightRestValue: tripResult.supportNight || 0,
        lunchValue: tripResult.supportLunch || 0,
        dinnerValue: tripResult.supportDinner || 0,
        otherValue: tripResult.supportOther || 0,
        vehicalOtherValue: tripResult.supportVehicalOther || 0,
        totalNumberDay: _.sumBy(tripResult.provinceList, 'numberDay') || 0,
        // stayValue: tripResult.supportStay || (_.sumBy(tripResult.provinceList, 'numberDay') || 0) * 400000,
        limitCost: JSON.stringify(limitCost),
        typeVehicle: tripResult.typeVehicle || null,
        isCentralCity: false
    })

    const countByProvince = () => {
        let countNightValue = 0
        let countFoodValue = 0
        let countVehicalValue = 0
        let sumKmValue = 0

        if (tripResult.provinceList != null && tripResult.provinceList != undefined && tripResult.provinceList?.length > 0) {
            for (let index = 0; index < (tripResult.provinceList?.length || 0); index++) {
                const item = tripResult.provinceList[index]
                countNightValue = countNightValue + (item.nightRestValue || 0)
                countFoodValue = countFoodValue + (item.foodCostPoint || 0)
                countVehicalValue = countVehicalValue + (item.vehicalValue || 0)
                sumKmValue = sumKmValue + (item.distance || 0)
            }
        } else {
            countNightValue = tripResult.nightValue * (quotaData.hotelSup || 360000)
            countFoodValue = tripResult.dayValue * (quotaData.foodSup || 220000)
        }

        setItemCost({
            ...itemCost,
            nightRestValue: countNightValue,
            lunchValue: countFoodValue,
            vehicalValue: countVehicalValue,
            kmValue: sumKmValue
            // maxNightValue: countNightValue,
            // maxLunchValue: countFoodValue,
            // maxVehicalValue: Math.round(countVehicalValue)
        })
    }

    const LoadData = async () => {
        await GetDataMasterBusiness('WorkingScheduleKM', async (mData) => {
            await setDataKilomet(mData)
            await countByProvince()
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
                //
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
        let checkCost = false
        let strValid = ''
        if (!isValid(itemCost.vehicalValue))
            strValid += 'Chi phí di chuyển, '
        if (!isValid(itemCost.nightRestValue))
            strValid += 'Chi phí khách sạn, '
        if (!isValid(itemCost.lunchValue))
            strValid += 'Chi phí ăn uống, '
        if (!isValid(itemCost.otherValue))
            strValid += 'Chi phí khác.'
        if (itemCost.lunchValue > itemCost.maxLunchValue) {
            strValid += `Chi phí ăn uống phải nhỏ hơn hoặc bằng định mức hỗ trợ ${itemCost.maxLunchValue},`
            checkCost = true
        }
        if (itemCost.nightRestValue > itemCost.maxNightValue) {
            strValid += `Chi phí khách sạn phải nhỏ hơn hoặc bằng định mức hỗ trợ ${itemCost.maxNightValue},`
            checkCost = true
        }
        if (itemCost.vehicalValue > itemCost.maxVehicalValue && tripResult.typeVehicle == 'DRIVING') {
            strValid += `Chi phí di chuyển phải nhỏ hơn hoặc bằng định mức hỗ trợ ${itemCost.maxVehicalValue}`
            checkCost = true
        }
        actionDone(strValid.length == 0, checkCost == true ? strValid : `Vui lòng nhập đầy đủ dữ liệu: ${strValid}`)
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
                    <ItemInput
                        typeFilter={TYPE.TYPE_NIGTH_REST}
                        keyboardType="numeric"
                        isRequire
                        titleName={`Chi phí khách sạn (${tripResult.nightValue} Đêm)`}
                        placeholder={`Tổng tiền khách sạn / nhà nghỉ`}
                        iconName='hotel'
                        itemValue={valueItem(itemCost.nightRestValue)}
                        onChangeText={handlerItemChangeText}
                        editable={false}
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
                        typeFilter={TYPE.TYPE_VEHICAL}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí di chuyển'
                        placeholder={`Tổng chi phí di chuyển (${tripResult.dayValue} Ngày)`}
                        iconName='car'
                        itemValue={valueItem(itemCost.vehicalValue)}
                        onChangeText={handlerItemChangeText}
                        editable={false}
                    />
                    {/* <ItemInput
                        typeFilter={TYPE.TYPE_OTHER}
                        keyboardType="numeric"
                        titleName='Chi phí khác'
                        isRequire
                        placeholder='Chi phí khác'
                        iconName='money-bill'
                        itemValue={valueItem(itemCost.otherValue)}
                        onChangeText={handlerItemChangeText}
                    /> */}
                    <View style={{ height: deviceHeight / 2 }} />
                </KeyboardAwareScrollView>
            </ScrollView>

        </View>
    )
}
