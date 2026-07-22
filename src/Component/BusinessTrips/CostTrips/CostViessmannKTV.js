import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useDispatch, useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { GetDataMasterBusiness, GetPlanBusiness } from "../../../Controller/BussinessTripController";
import { formatNumber, groupDataByKey } from "../../../Core/Helper";
import { alertWarning, deviceHeight, isValid } from "../../../Core/Utility";
import { HeaderBusiness } from "../HeaderBusiness";
import { getBusinesDataSupport, MODE, TYPE } from "../UtilityBusiness";
import _ from 'lodash'
import { ACTION } from "../../../Core/ReduxController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const CostViessmannKTV = ({ onBack, onNext }) => {
    const { appcolor, tripResult, userinfo } = useSelector(state => state.GAppState)
    const [typeArrow, setTypeArrow] = useState({
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
        supportKM: (tripResult.supportKM || (tripResult.dayValue * 200000)),
        vehicalValue: (tripResult.supportVehical || (tripResult.dayValue * 250000)),
        nightRestValue: (tripResult.supportNight || (tripResult.nightValue * 600000)),
        lunchValue: tripResult.supportLunch || 0,
        dinnerValue: tripResult.supportDinner || 0,
        otherValue: tripResult.supportOther || 0,
        vehicalOtherValue: tripResult.supportVehicalOther || 0,
        totalNumberDay: _.sumBy(tripResult.provinceList, 'numberDay') || 0,
        stayValue: tripResult.supportStay || (_.sumBy(tripResult.provinceList, 'numberDay') || 0) * 400000
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
                    <ItemInput
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        titleName={`Chi phí di chuyển (${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm)`}
                        placeholder={`Tổng tiền di chuyển (${tripResult.dayValue} ngày - Đơn giá: 200,000 VNĐ)`}
                        iconName='road'
                        itemValue={valueItem(itemCost.supportKM)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_NIGTH_REST}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí khách sạn'
                        placeholder={`Tổng tiền khách sạn / nhà nghỉ (Đơn giá: 600,000 VNĐ/Đêm)`}
                        iconName='hotel'
                        itemValue={valueItem(itemCost.nightRestValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_VEHICAL}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí thuê xe'
                        placeholder={`Chi phí thuê xe (Đơn giá: 250,000 VNĐ)`}
                        iconName='car'
                        itemValue={valueItem(itemCost.vehicalValue)}
                        onChangeText={handlerItemChangeText}
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
                    selectTextOnFocus={true}
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
