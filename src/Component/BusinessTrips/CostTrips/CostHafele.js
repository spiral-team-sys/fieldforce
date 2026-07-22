import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useDispatch, useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { formatNumber } from "../../../Core/Helper";
import { alertWarning, deviceHeight } from "../../../Core/Utility";
import { HeaderBusiness } from "../HeaderBusiness";
import { getBusinesDataSupport, MODE, TYPE } from "../UtilityBusiness";
import _ from 'lodash'
import { ACTION } from "../../../Core/ReduxController";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ScrollView } from "react-native-actions-sheet";
import { SetBusinesTrips } from "../../../Redux/action";

export const CostHafele = ({ onBack, onNext, quotaData }) => {
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
        supportWorkValue: tripResult.supportWork || 0,
        vehicalOtherValue: tripResult.supportVehicalOther || 0
    })

    const LoadData = async () => {
        countByProvince()
    }
    const countByProvince = () => {
        let countNightValue = 0
        for (let index = 0; index < (tripResult.provinceList?.length || 0); index++) {
            const item = tripResult.provinceList[index]
            countNightValue = countNightValue + (item.numberDay * (quotaData.hotelSup || 250000))
        }
        setItemCost({
            ...itemCost,
            // typeKM
            nightRestValue: countNightValue,
        })
    }

    const countSupportKm = (valueInput) => {
        const listCostKM = quotaData.listCostKM || []
        const itemCostSupport = _.filter(listCostKM, (it) => valueInput < it.maxKm && valueInput >= it.minKm)
        itemCost.supportKM = (itemCost.nightRestValue > 0 ? (itemCostSupport[0]?.costOvernight || 0) : (itemCostSupport[0]?.costNonOvernight || 0))
    }

    const handlerItemChangeText = async (text, typeItem) => {
        const valueInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null
        let itemUpdate = {}
        switch (typeItem) {
            case TYPE.TYPE_KM:
                countSupportKm(valueInput)
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
        await checkInputData(async (isSuccess, message) => {
            if (isSuccess) {
                const costResult = await getBusinesDataSupport(itemCost, userinfo.groupType)
                // if (costResult.totalSupport == 0) {
                //     alertWarning(`Chi phí công tác phải lớn hơn 0`)
                //     return
                // }
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

        actionDone(strValid.length == 0, `Vui lòng nhập đầy đủ dữ liệu: \n${strValid}`)
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
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        editable={true}
                        titleName={`Km/chuyến đi (${tripResult.dayValue} Ngày - ${tripResult.nightValue} Đêm)`}
                        placeholder={`Tổng số kilomet di chuyển`}
                        iconName='road'
                        itemValue={valueItem(itemCost.kmValue)}
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
