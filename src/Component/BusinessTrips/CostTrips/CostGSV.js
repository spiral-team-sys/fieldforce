import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
import { SetBusinesTrips } from "../../../Redux/action";

export const CostGSV = ({ onBack, onNext, quotaData }) => {
    const { appcolor, tripResult, userinfo } = useSelector(state => state.GAppState)
    const [typeArrow, setTypeArrow] = useState({
        // titleHeader: `Hạn mức ${formatNumber(tripResult.moneyLimit, ',')} VNĐ`,
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
        supportKM: tripResult.supportKM || 0,
        vehicalValue: tripResult.supportVehical || 0,
        nightRestValue: tripResult.supportNight || 0,
        lunchValue: tripResult.supportLunch || 0,
        dinnerValue: tripResult.supportDinner || 0,
        otherValue: tripResult.supportOther || 0,
        vehicalOtherValue: tripResult.supportVehicalOther || 0
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
                if (costResult.totalSupport == 0) {
                    alertWarning(`Chi phí công tác phải lớn hơn 0`)
                    return
                }
                if (costResult.supportLunch > 0 && costResult.supportLunch < (quotaData.minFoodCost || 100000)) {
                    alertWarning(`Chi phí ăn uống phải lớn hơn ${quotaData.minFoodCost || 100000}`)
                    return
                } else if (costResult.supportLunch > (quotaData.maxFoodCost || 100000000)) {
                    alertWarning(`Chi phí ăn uống phải nhỏ hơn ${quotaData.maxFoodCost || 100000000}`)
                    return
                } else if (costResult.supportNight > 0 && costResult.supportNight < (quotaData.minNightCost || 100000)) {
                    alertWarning(`Chi phí khách sạn phải lớn hơn ${quotaData.minFoodCost || 100000}`)
                    return
                } else if (costResult.supportNight > (quotaData.maxNightCost || 100000000)) {
                    alertWarning(`Chi phí khách sạn phải nhỏ hơn ${quotaData.maxNightCost || 100000000}`)
                    return
                } else if (costResult.supportKM > 0 && costResult.supportKM < (quotaData.minMoveCost || 100000)) {
                    alertWarning(`Chi phí di chuyển phải lớn hơn ${quotaData.minMoveCost || 100000}`)
                    return
                } else if (costResult.supportKM > (quotaData.maxMoveCost || 100000000)) {
                    alertWarning(`Chi phí di chuyển phải nhỏ hơn ${quotaData.maxMoveCost || 100000000}`)
                    return
                } else if (costResult.supportVehical > 0 && costResult.supportVehical < (quotaData.minCarCost || 100000)) {
                    alertWarning(`Chi phí thuê xe phải lớn hơn ${quotaData.minCarCost || 100000}`)
                    return
                } else if (costResult.supportVehical > (quotaData.maxCarCost || 100000000)) {
                    alertWarning(`Chi phí thuê xe phải nhỏ hơn ${quotaData.maxCarCost || 100000000}`)
                    return
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
        let strValid = ''
        // if (!isValid(itemCost.kmValue))
        //     strValid += 'Số kilomet chuyến đi, '
        if (!isValid(itemCost.nightRestValue))
            strValid += 'Chi phí khách sạn, '
        if (!isValid(itemCost.lunchValue))
            strValid += 'Chi phí ăn uống, '
        if (!isValid(itemCost.supportKM))
            strValid += 'Chi phí di chuyển, '
        if (!isValid(itemCost.vehicalValue))
            strValid += 'Chi phí thuê xe, '
        actionDone(strValid.length == 0, `Vui lòng nhập đầy đủ dữ liệu: ${strValid}`)
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
                        titleName={`Chi phí nghỉ qua đêm ${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm`}
                        placeholder={`Tổng tiền khách sạn / nhà nghỉ của chuyến đi`}
                        iconName='hotel'
                        itemValue={valueItem(itemCost.nightRestValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        typeFilter={TYPE.TYPE_LUNCH}
                        keyboardType="numeric"
                        isRequire
                        titleName={`Chi phí ăn uống`}
                        placeholder={`Tổng chi phí ăn uống)`}
                        iconName='utensils'
                        itemValue={valueItem(itemCost.lunchValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        key={TYPE.TYPE_KM}
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí di chuyển (Tàu xe, máy bay,..)'
                        placeholder={`Tổng chi phí di chuyển (Tàu xe, máy bay,..)`}
                        iconName='car'
                        itemValue={valueItem(itemCost.supportKM)}
                        onChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        key={TYPE.TYPE_VEHICAL}
                        typeFilter={TYPE.TYPE_VEHICAL}
                        keyboardType="numeric"
                        isRequire
                        titleName='Chi phí thuê xe'
                        placeholder={`Tổng chi phí thuê xe`}
                        iconName='car'
                        itemValue={valueItem(itemCost.vehicalValue)}
                        onChangeText={handlerItemChangeText}
                    />
                    <View style={{ height: deviceHeight / 2 }} />
                </KeyboardAwareScrollView>
            </ScrollView>

        </View>
    )
}
const ItemInput = ({ titleName, iconName, isRequire, onActionRight, typeFilter, itemValue, placeholder, onChangeText, keyboardType = 'default' }) => {
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
                    editable
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
const PlanBusiness = ({ dataPlan, iconName, titleName, isRequire, isLoading }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const heightView = dataPlan.length > 1 ? (deviceHeight - (deviceHeight / dataPlan.length)) : deviceHeight / 2
    const styles = StyleSheet.create({
        mainContainer: { height: heightView, padding: 8, marginBottom: 1, zIndex: 10 },
        titleHeader: { width: '100%', fontSize: 13, fontWeight: '600', color: appcolor.blacklight, marginStart: 8 },
        titleDate: { color: appcolor.highlightDate, fontSize: 14, fontWeight: '500', padding: 8, width: '75%' },
        titleShop: { color: appcolor.dark, fontSize: 13, fontWeight: '300' }
    })
    const renderItem = ({ item, index }) => {
        return (
            <View key={`sl_item_${index}`} style={{ width: '100%' }}>
                {item.isParent &&
                    <View style={{ width: '100%', flexDirection: 'row', padding: 8 }}>
                        <Text style={styles.titleDate}>{`${item.dateView}`}</Text>
                        <FormGroup
                            editable
                            inputStyle={{ textAlign: 'center', fontSize: 13 }}
                            containerStyle={{ width: '25%', alignSelf: 'center', padding: 3, marginBottom: 0, borderRadius: 5, borderColor: appcolor.grey }}
                            placeholder='Km'
                            useClearAndroid={false}
                        />
                    </View>
                }
                <View style={{ backgroundColor: appcolor.surface, marginBottom: 3, borderRadius: 5, padding: 5, width: '100%' }}>
                    <View style={{ width: '75%', paddingEnd: 3 }}>
                        <Text style={styles.titleShop}>{`${item.shopName}`}</Text>
                        <Text style={styles.titleShop}>{`${item.address}`}</Text>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <View style={{ width: '100%', flexDirection: 'row', marginBottom: 5, alignItems: 'center' }}>
                {iconName && <Icon name={iconName} type="font-awesome-5" size={15} color={appcolor.blacklight} />}
                {titleName &&
                    <Text style={styles.titleHeader}>{`${titleName} `}
                        {isRequire && <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>}
                    </Text>
                }
                {!isLoading && <ActivityIndicator style={{ position: 'absolute', end: 8 }} />}
            </View>
            {isLoading &&
                <FlatList
                    style={{ width: '100%', height: deviceHeight }}
                    key={'planBusiness'}
                    keyExtractor={(_, index) => index.toString()}
                    data={dataPlan}
                    scrollEnabled={false}
                    nestedScrollEnabled
                    renderItem={renderItem}
                />
            }
        </View>
    )
}
