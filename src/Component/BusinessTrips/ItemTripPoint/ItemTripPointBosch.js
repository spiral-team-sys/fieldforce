import moment from "moment";
import React, { useState } from "react";
import { LayoutAnimation, Platform, ScrollView, TouchableOpacity, UIManager, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { AutoCompleteAddress } from "../AutoCompleteAddress";
import { TYPE, provinceByAddress } from "../UtilityBusiness";
import { ItemInput } from "../InputControl/ItemInput";
import { formatNumber } from "../../../Core/Helper";
import { CalendarSelected } from "../../../Control/CalendarSelected";
import { alertWarning } from "../../../Core/Utility";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export const ItemTripPointBosch = ({ item, index, itemTrips, itemPoint, typeVehicle, config, quotaData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_, setMutate] = useState(false)

    const valueItem = (value) => {
        return value == 0 ? '0' : formatNumber(value, ',')
    }

    const handlerAddressChoose = async (text, typeItem, location) => {
        const { province, district } = provinceByAddress(text)
        if (typeItem == TYPE.PROVINCE_FROM) {
            item.district = district
            item.provinceName = province
            item.addressPoint = text
            item.locationPoint = location
        }
        setMutate(e => !e)
    }
    const onEditValue = (value) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : ''
        let intValue = text === '' ? null : parseInt(text);
        item.numberDay = parseInt(intValue || 0)
        item.maxCostHotel = (quotaData.hotelSup && quotaData.hotelSup > 0 ? quotaData.hotelSup * intValue : 0)
        if (intValue == 0) {
            item.nightRestValue = 0
        }
        itemTrips.provinceList = [...itemPoint]
        if (item.distance && item.distance > 0) {
            handleCountMoney('NUMBER_DAY')
        }
        setMutate(e => !e)
    }
    const onEditEatValue = (value) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : ''
        let intValue = text === '' ? null : parseInt(text);
        item.eatDay = parseInt(intValue || 0)
        itemTrips.provinceList = [...itemPoint]
        if (item.distance && item.distance > 0) {
            handleCountMoney('EAT_DAY')
        }
        setMutate(e => !e)
    }
    const handleSelectDate = (value) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        item.loadCalendar = (item.loadCalendar == true ? false : true)
        setMutate(e => !e)
    }
    const handlerWorkingDate = async (fromValue) => {
        const arrivedDayInt = moment(fromValue, 'YYYY-MM-DD')
        if (arrivedDayInt.isBetween(itemTrips.fromDate, itemTrips.toDate, null, '[]')) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            item.arrivedDay = moment(fromValue).format('YYYYMMDD')
            item.loadCalendar = (item.loadCalendar == true ? false : true)
            setMutate(e => !e)
        } else {
            alertWarning(`Ngày đến phải nằm trong khoảng ngày đi và ngày về của chuyến công tác (${moment(itemTrips.fromDate).format('YYYY/MM/DD')}-${moment(itemTrips.toDate).format('YYYY/MM/DD')})`)
        }
    }
    const handlerItemChangeText = async (text, typeItem) => {
        if (typeItem == TYPE.TYPE_NOTE) {
            item.note = text
            setMutate(e => !e)
        } else {
            const valueInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null
            if (typeItem == TYPE.TYPE_NIGTH_REST) {
                item.nightRestValue = valueInput
                setMutate(e => !e)
            }
            if (typeItem == TYPE.TYPE_LUNCH) {
                item.foodCostPoint = valueInput
                setMutate(e => !e)
            }
            if (typeItem == TYPE.TYPE_VEHICAL) {
                item.vehicalValue = valueInput
                setMutate(e => !e)
            }
            if (typeItem == TYPE.TYPE_KM_DISTANCE) {
                item.distanceText = JSON.stringify(valueInput || '')
                item.distance = valueInput
                if ((item.numberDay || item.numberDay == 0) && (item.eatDay || item.eatDay == 0)) {
                    handleCountMoney('DISTANCE')
                }
                setMutate(e => !e)
            }
        }
    }
    const handleCountMoney = (type) => {
        let foodCost = 0
        let moveCost = 0
        let hotelCost = 0
        switch (type) {
            case 'DISTANCE':
                foodCost = countFoodCost()
                moveCost = countMoveCost()
                hotelCost = countHotelCost()
                item.foodCostPoint = foodCost
                item.vehicalValue = moveCost
                item.nightRestValue = hotelCost
                break;
            case 'NUMBER_DAY':
                hotelCost = countHotelCost()
                item.nightRestValue = hotelCost
                break;
            case 'EAT_DAY':
                foodCost = countFoodCost()
                moveCost = countMoveCost()
                item.foodCostPoint = foodCost
                item.vehicalValue = moveCost
                break;
        }
    }

    const countFoodCost = () => {

        let foodCost = 0
        if ((item.distance || 0) == 0) {
            return foodCost
        }
        if (itemTrips.typeAdvance?.code == 'INSIDEPROVINCE') {
            if (item.distance >= quotaData.kmFoodLimit1 && item.distance < quotaData.kmFoodLimit2) {
                foodCost = (quotaData.costFoodInside1 * (item.eatDay || 0))
            } else if (item.distance >= quotaData.kmFoodLimit2) {
                foodCost = (quotaData.costFoodInside2 * (item.eatDay || 0))
            }
        } else if (itemTrips.typeAdvance?.code == 'OUTSIDEPROVINCE') {
            foodCost = (item.eatDay || 0) * (quotaData.costFoodOutside || 240000)
        }
        return foodCost
    }
    const countMoveCost = () => {
        let moveCost = 0
        if ((item.distance || 0) == 0) {
            return moveCost
        }
        if (itemTrips.typeAdvance?.code == 'INSIDEPROVINCE') {
            if (item.distance > quotaData.kmMoveLimit) {
                moveCost = item.distance * quotaData.costMoveInside
            }
        } else if (itemTrips.typeAdvance?.code == 'OUTSIDEPROVINCE') {
            moveCost = (item.eatDay || 0) * (quotaData.costMoveOutside || 250000)
        }
        return moveCost
    }
    const countHotelCost = () => {
        let hotelCost = 0
        if ((item.distance || 0) == 0) {
            return hotelCost
        }
        if (itemTrips.typeAdvance?.code == 'INSIDEPROVINCE') {
            if (item.distance >= quotaData.kmHotelLimit) {
                hotelCost = item.numberDay * quotaData.costHotelSup
            }
        } else if (itemTrips.typeAdvance?.code == 'OUTSIDEPROVINCE') {
            let countProvince = itemTrips.provinceList.length || 1
            if (countProvince >= quotaData.limitPointSupHotel || item.distance > item.kmHotelLimit) {
                hotelCost = item.numberDay * quotaData.costHotelSup
            }
        }
        return hotelCost
    }

    return (
        <View style={{ borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, padding: 4, margin: 4 }}>
            <View style={{ borderRadius: 50, width: 40, height: 40, borderWidth: 0.8, borderColor: appcolor.primary, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 4, right: 8, zIndex: 1000 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.primary }}>{index + 1}</Text>
            </View>
            <AutoCompleteAddress
                isRequire
                titleName='Địa chỉ điểm đến'
                placeholder='Địa chỉ điểm đến'
                iconName='map-marker-alt'
                itemValue={item.addressPoint}
                typeFilter={TYPE.PROVINCE_FROM}
                // searchAction={searchAddress}
                onChooseItem={handlerAddressChoose}
            />
            <View key={'dateBusiness'} style={{ width: '100%', borderRadius: 5, paddingBottom: 8, paddingHorizontal: 8, alignItems: 'center' }}>
                <FormGroup
                    containerStyle={{ width: '100%', padding: 5, borderRadius: 5 }}
                    inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.greylight }}
                    iconRight='calendar-alt'
                    placeholder={'Ngày đến địa điểm công tác '}
                    value={item.arrivedDay ? moment(item.arrivedDay).format('YYYY/MM/DD') : null}
                    rightFunc={handleSelectDate}
                />
                {item.loadCalendar && <CalendarSelected onChangeData={handlerWorkingDate} isBetween={false} lockOutMonth={config?.isLockOutMonth == 0 ? false : true} />}
                <ItemInput
                    isRequire
                    key={`${TYPE.TYPE_NOTE}`}
                    titleName='Ghi chú'
                    placeholder='Nội dung ghi chú'
                    iconName='comment'
                    typeFilter={TYPE.TYPE_NOTE}
                    itemValue={item.note}
                    onChangeText={handlerItemChangeText}
                />
            </View>

            <Text style={{ width: '100%', paddingHorizontal: 8, color: appcolor.info, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Thông tin lưu trú</Text>
            {
                (quotaData.isNeedKm == 1) &&
                <ItemInput
                    typeFilter={TYPE.TYPE_KM_DISTANCE}
                    keyboardType="numeric"
                    isRequire
                    titleName='Số Km di chuyển'
                    placeholder={`Tổng Km di chuyển (${item.eatDay || 0} Ngày)`}
                    iconName='road'
                    itemValue={valueItem(item.distance)}
                    onChangeText={handlerItemChangeText}
                    editable={true}
                />
            }
            <View key={`ViewPointDay`} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', padding: 5 }}>
                <View style={{ width: '50%', alignItems: 'center' }}>
                    <Text style={{ padding: 4, textAlign: "center", color: appcolor.dark, fontWeight: '700', fontSize: 12 }}>Đêm lưu trú</Text>
                    <FormGroup
                        selectTextOnFocus={true}
                        keyboardType="numeric"
                        containerStyle={{ width: '90%', borderRadius: 8, marginBottom: 0, padding: 0, backgroundColor: 'transparent' }}
                        inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
                        editable={item.distance && item.distance > 0 ? true : false}
                        defaultValue={item.numberDay?.toString() || null}
                        placeholder={`Số đêm lưu trú`}
                        useClearAndroid={false}
                        handleChangeForm={onEditValue}
                    />
                </View>
                <View style={{ width: '50%', alignItems: 'center' }}>
                    <Text style={{ padding: 4, textAlign: "center", color: appcolor.dark, fontWeight: '700', fontSize: 12 }}>Ngày ăn</Text>
                    <FormGroup
                        selectTextOnFocus={true}
                        keyboardType="numeric"
                        containerStyle={{ width: '90%', borderRadius: 8, marginBottom: 0, padding: 0, marginStart: 8, backgroundColor: 'transparent' }}
                        inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
                        editable={item.distance && item.distance > 0 ? true : false}
                        defaultValue={item.eatDay?.toString() || null}
                        placeholder={`Số ngày ăn`}
                        useClearAndroid={false}
                        handleChangeForm={onEditEatValue}
                    />
                </View>
            </View>
            {
                quotaData.isHideFeePoint !== 1 && <View key={`ViewPointCost_` + index} style={{ width: '100%', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', padding: 8 }}>
                    {
                        ((item.numberDay !== null && item.numberDay >= 0) || (item.eatDay !== null && item.eatDay >= 0)) &&
                        <Text style={{ width: '100%', paddingTop: 8, color: appcolor.info, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Chi phí</Text>
                    }
                    {
                        item.numberDay !== null && item.numberDay >= 0 &&
                        <ItemInput
                            typeFilter={TYPE.TYPE_NIGTH_REST}
                            keyboardType="numeric"
                            isRequire
                            editable={true}
                            titleName={`Chi phí khách sạn (${item.numberDay} Đêm)`}
                            placeholder={`Tổng tiền khách sạn / nhà nghỉ`}
                            iconName='hotel'
                            itemValue={valueItem(item.nightRestValue)}
                            onChangeText={handlerItemChangeText}
                        />
                    }
                    {
                        item.eatDay !== null && item.eatDay >= 0 &&
                        <ItemInput
                            typeFilter={TYPE.TYPE_LUNCH}
                            keyboardType="numeric"
                            isRequire
                            editable={true}
                            titleName={`Chi phí ăn uống (${item.eatDay} Ngày)`}
                            placeholder={`Tổng chi phí ăn uống (${item.eatDay} Ngày)`}
                            iconName='utensils'
                            itemValue={valueItem(item.foodCostPoint)}
                            onChangeText={handlerItemChangeText}
                        />
                    }
                    {
                        ((typeVehicle?.code == 'DRIVING' && item.eatDay !== null && item.eatDay >= 0 && item.distance > 0)
                            || (typeVehicle?.code !== 'DRIVING' && item.eatDay !== null && item.eatDay >= 0)) &&
                        <ItemInput
                            typeFilter={TYPE.TYPE_VEHICAL}
                            keyboardType="numeric"
                            isRequire
                            titleName='Chi phí di chuyển'
                            placeholder={`Tổng chi phí di chuyển (${item.eatDay} Ngày)`}
                            iconName='car'
                            itemValue={valueItem(item.vehicalValue)}
                            onChangeText={handlerItemChangeText}
                            // editable={typeVehicle?.code == 'DRIVING' ? false : true}
                            editable={true}
                        />
                    }
                </View>
            }
        </View>
    )
}
