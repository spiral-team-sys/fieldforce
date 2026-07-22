import moment from "moment"
import React, { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from "react-redux"
import FormGroup from "../../../Content/FormGroup"
import { CalendarSelected } from "../../../Control/CalendarSelected"
import { AttendantController } from "../../../Controller/AttendantController"
import { GetProvinceByShop } from "../../../Controller/BussinessTripController"
import { ACTION } from "../../../Core/ReduxController"
import { alertWarning, deviceHeight, isValid, } from "../../../Core/Utility"
import { HeaderBusiness } from "../HeaderBusiness"
import { MODE, TYPE, provinceByAddress } from "../UtilityBusiness"
import _ from "lodash"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { AutoCompleteAddress } from "../AutoCompleteAddress"
import { TripWithPoint } from "../TripWithPoint"
import { ScrollView } from "react-native-actions-sheet"
import { SetBusinesTrips } from "../../../Redux/action";

export const BoschCreateTripsSR = ({ onCloseCreate, onNextCreate, dateFilter, limitCost, quotaData, tripConfig }) => {
    const { appcolor, tripResult, kpiinfo } = useSelector(state => state.GAppState)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [dataProvince, setDataProvince] = useState([])
    const [dataShow, setDataShow] = useState([])
    const [dataProvinceMain, setDataProvinceMain] = useState([])
    const config = JSON.parse(kpiinfo?.reportItem) || {}

    const typeArrow = { titleHeader: 'Địa điểm công tác', typeBack: 'close', typeForward: 'arrow-forward' }
    const [itemTrips, setItemTrips] = useState({
        loadCalendar: false,
        moneyLimit: tripResult.moneyLimit || dateFilter.moneyLimit,
        provinceFrom: tripResult.provinceFrom || null,
        provinceTo: tripResult.provinceTo || null,
        provinceCodeFrom: tripResult.provinceCodeFrom || null,
        provinceCodeTo: tripResult.provinceCodeTo || null,
        provinceList: tripResult.provinceList || [],
        addressFrom: tripResult.addressFrom || null,
        addressTo: tripResult.addressTo || null,
        locationStart: tripResult.locationStart || null,
        locationEnd: tripResult.locationEnd || null,
        fromDate: tripResult.fromDate || dateFilter.itemDate.fromDate,
        toDate: tripResult.toDate || dateFilter.itemDate.toDate,
        dayValue: tripResult.dayValue || dateFilter.dayValue,
        nightValue: tripResult.nightValue || dateFilter.nightValue,
        dateFilterFrom: tripResult.dateFilterFrom || dateFilter.fromDate,
        dateFilterTo: tripResult.dateFilterTo || dateFilter.toDate,
        dayAndNight: tripResult.dayAndNight || dateFilter.dayAndNight,
        note: tripResult.note || null,
        supportVehical: tripResult.supportVehical || 0,
        mLatitude: dateFilter.mLatitude,
        mLongitude: dateFilter.mLongitude,
        supportVehicalOther: tripResult.supportVehicalOther || 0,
        typeVehicle: tripResult.typeVehicle || null,
        movingSteps: tripResult.movingSteps || null,
        kmValue: tripResult.kmValue || null,
        typeAdvance: tripResult.typeAdvance || null,
        isDayNightEqual: tripResult.isDayNightEqual || 0
    })
    //
    const LoadData = async () => {
        await setLoading(true)
        await GetProvinceByShop(async (mData) => {
            await setDataProvince(mData)
            // await setDataProvinceMain(mData)
            // await settingAddressFrom(mData)
        })
        await setLoading(false)
    }
    //
    const actionNext = async () => {
        if (dateFilter.mode == MODE.CREATE) {
            if (config.dayLock !== undefined && config.dayLock > 0) {
                const monthSelect = moment(itemTrips.fromDate, 'YYYYMMDD').format('MM');
                const dateSelect = moment(itemTrips.fromDate, 'YYYYMMDD').format('DD');

                if (config.dayLock < new Date().getDate() && monthSelect == (new Date().getMonth() + 1) && dateSelect <= config.dayLock) {
                    alertWarning(`Bạn không được đăng kí ngày đi công tác nhỏ hơn ngày ${config.dayLock} của tháng hiện tại!`)
                    return
                }
            }
            if (moment(itemTrips.fromDate, 'YYYYMMDD').format('YYYYMM') < moment().format('YYYYMM') && config.isAllowOldMonth !== 1) {
                alertWarning('Bạn không được đăng kí tháng cũ')
                return
            }
        }

        await checkInputData(async (isSuccess, message) => {
            if (isSuccess) {
                if (itemTrips.isUpdateAdvance == 1) {
                    alertWarning(`${quotaData?.titleList || 'loại tạm ứng'} có thay đổi, kiểm tra lại các chi phí của thông tin chặng đường!`)
                    return
                }
                const tripResultItem = await _.merge(tripResult, itemTrips)
                // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: { ...tripResultItem, provinceList: itemTrips.provinceList, movingSteps: itemTrips.movingSteps, typeAdvance: itemTrips.typeAdvance } })
                await dispatch(SetBusinesTrips({ ...tripResultItem, provinceList: itemTrips.provinceList, movingSteps: itemTrips.movingSteps, typeAdvance: itemTrips.typeAdvance }))
                // await onNextCreate(MODE.CREATE)
                await onNextCreate(dateFilter.mode)
            } else {
                alertWarning(message)
            }
        })
    }
    const checkInputData = (actionDone) => {
        let strValid = ''

        if (dateFilter.mode == MODE.CREATE || dateFilter.mode == MODE.UPDATE) {
            if (tripConfig.maxDay !== null && tripConfig.maxDay !== undefined && tripConfig.maxDay > 0 && itemTrips.dayValue > tripConfig?.maxDay) {
                alertWarning(`Số ngày đi không được lớn hơn số ngày giới hạn: ${itemTrips.dayValue} / ${tripConfig.maxDay}`)
                return
            }
            if (itemTrips.provinceCodeFrom !== null && itemTrips.provinceCodeTo !== null && itemTrips.provinceCodeFrom == itemTrips.provinceCodeTo && tripConfig.isDuplicateProvince == 1) {
                alertWarning(`Nơi đi và nơi đến không được phép trùng nhau!`)
                return
            }
        }
        if (isValid(itemTrips.provinceList) && itemTrips.provinceList?.length > 0) {
            const listPoints = itemTrips.provinceList
            let countNightDay = 0
            let countEatDay = 0
            for (let index = 0; index < listPoints.length; index++) {
                const element = listPoints[index];
                if (element.locationPoint == null || element.locationPoint == '') {
                    strValid += `Chưa nhập vị trí điểm đến thứ ${element.id + 1}, `
                }
                if ((element.numberDay == "" || element.numberDay == null) && element.numberDay !== 0) {
                    strValid += `Chưa nhập số đêm lưu trú điểm ${element.id + 1}, `
                }
                if (element.arrivedDay == null || element.arrivedDay == '' || element.arrivedDay == undefined) {
                    strValid += `Chưa nhập ngày đến điểm thứ ${element.id + 1}, `
                }
                if ((element.eatDay == "" || element.eatDay == null) && element.eatDay !== 0) {
                    strValid += `Chưa nhập số ngày ăn điểm ${element.id + 1}, `
                }
                if (!element.distance || element.distance == 0) {
                    strValid += `Chưa nhập số km di chuyển điểm ${element.id + 1}, `
                }
                if (element.numberDay !== "" && element.numberDay !== null) {
                    countNightDay = countNightDay + element.numberDay
                }
                if (element.eatDay !== "" && element.eatDay !== null) {
                    countEatDay = countEatDay + element.eatDay
                }
            }
            if (countNightDay > itemTrips.nightValue) {
                strValid += `Tổng đêm lưu trú lớn hơn số đêm đi công tác, `
            }
            if (countEatDay > itemTrips.dayValue) {
                strValid += `Tổng ngày ăn lớn hơn số ngày đi công tác, `
            }
            const listType = quotaData?.listType || []
            if (listType.length > 0) {
                if (itemTrips.typeAdvance instanceof Object == false || (itemTrips.typeAdvance instanceof Object == true && Object.keys(itemTrips.typeAdvance).length == 0)) {
                    strValid += `Chưa chọn ${quotaData?.titleList || 'loại tạm ứng'}, `
                }
            }
            if (strValid !== '')
                strValid += 'của Thông tin chặng đường, '
        } else {
            strValid += 'Chưa nhập số điểm đến của chuyến, '
        }

        if (!isValid(itemTrips.addressFrom) || !isValid(itemTrips.locationStart))
            strValid += 'Địa chỉ điểm đi, '
        // if (!isValid(itemTrips.addressTo) || !isValid(itemTrips.locationEnd))
        //     strValid += 'Địa chỉ điểm đến, '
        if (!isValid(itemTrips.note))
            strValid += 'Vui lòng nhập ghi chú '
        //
        actionDone(strValid.length == 0, `Nhập đầy đủ thông tin: ${strValid}`)
    }

    const handlerWorkingDate = async (fromValue, toValue) => {
        if (dateFilter.mode == MODE.UPDATE) {
            if (moment(itemTrips.fromDate.toString()).format('YYYYMM') !== moment(fromValue).format('YYYYMM')) {
                alertWarning('Bạn không được cập nhật ngày qua tháng khác')
                return
            }
        }
        const fromDate = moment(fromValue).format('YYYYMMDD')
        const toDate = moment(toValue).format('YYYYMMDD')
        const betweenDate = moment(toValue).diff(moment(fromValue), 'days')
        const day = betweenDate + 1
        const night = (tripConfig.isDayNightEqual == 1 || itemTrips.isDayNightEqual == 1) ? betweenDate + 1 : betweenDate
        const calculatorDate = `(${day} Ngày ${night} Đêm)`
        await setItemTrips({
            ...itemTrips,
            fromDate: fromDate,
            toDate: toDate,
            dateFilterFrom: moment(fromValue).format('DD/MM/YYYY'),
            dateFilterTo: moment(toValue).format('DD/MM/YYYY'),
            loadCalendar: false,
            dayAndNight: calculatorDate,
            dayValue: day,
            nightValue: night
        })
    }
    const searchAddress = async (typeFilter, textValue) => {
        await setTimeout(async () => {
            await AttendantController.DataLocationFromAddress(textValue, async (dataLocation) => {
                await setDataShow(dataLocation)
            })
        }, 500)
    }
    const onMultipleChoose = (item, typeItem, listItem) => {
        if (typeItem == TYPE.PROVINCE_LIST)
            setItemTrips({ ...itemTrips, provinceList: listItem })
        if (typeItem == TYPE.PROVINCE_FROM)
            setItemTrips({ ...itemTrips, provinceFrom: item.itemName, provinceCodeFrom: item.provinceCode })
        if (typeItem == TYPE.PROVINCE_TO)
            setItemTrips({ ...itemTrips, provinceTo: item.itemName, provinceCodeTo: item.provinceCode })
        if (typeItem == TYPE.TYPE_KM)
            setItemTrips({ ...itemTrips, typeKM: item.itemName, kmValue: item.numberValue })
    }
    const handlerItemChangeText = async (text, typeItem) => {
        if (typeItem == TYPE.PROVINCE_FROM)
            await setItemTrips({ ...itemTrips, addressFrom: text, locationStart: null })
        if (typeItem == TYPE.PROVINCE_TO)
            await setItemTrips({ ...itemTrips, addressTo: text, locationEnd: null })
        if (typeItem == TYPE.TYPE_NOTE)
            await setItemTrips({ ...itemTrips, note: text })
    }
    const handlerAddressChoose = async (text, typeItem, location) => {
        const { province, district } = provinceByAddress(text)
        if (typeItem == TYPE.PROVINCE_FROM) {
            await setItemTrips({ ...itemTrips, addressFrom: text, locationStart: location, provinceFrom: province, districtFrom: district })
        }
        if (typeItem == TYPE.PROVINCE_TO)
            await setItemTrips({ ...itemTrips, addressTo: text, locationEnd: location })
    }
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: deviceHeight, backgroundColor: appcolor.light },
        mainContent: { width: '100%', padding: 8 },
        actionView: { zIndex: 5, padding: 8, position: 'absolute' },
        headerView: { width: '100%', alignSelf: 'center', flexDirection: 'row' },
        headerName: { width: '100%', padding: 8, fontSize: 18, fontWeight: '600', color: appcolor.blacklight, textAlign: 'center' },
        viewDate: { width: '100%', borderRadius: 5, alignItems: 'center' }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderBusiness
                typeArrow={typeArrow}
                onBack={() => onCloseCreate(dateFilter.mode)}
                onForward={actionNext}
            />
            <ScrollView
                style={{ width: '100%', height: deviceHeight, padding: 5 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%', height: '100%' }}
                    extraHeight={deviceHeight / 4}
                    enableOnAndroid >
                    <View key={'dateBusiness'} style={styles.viewDate}>
                        <FormGroup
                            containerStyle={{ width: '100%', padding: 5, borderRadius: 5 }}
                            inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.greylight }}
                            title={`Ngày đi công tác ${itemTrips.dayAndNight}`}
                            iconRight='calendar-alt'
                            value={`${itemTrips.dateFilterFrom} - ${itemTrips.dateFilterTo}`}
                            rightFunc={() => setItemTrips({ ...itemTrips, loadCalendar: !itemTrips.loadCalendar })}
                        />
                        {itemTrips.loadCalendar && <CalendarSelected onChangeData={handlerWorkingDate} lockOutMonth={config?.isLockOutMonth == 0 ? false : true} />}
                    </View>
                    <AutoCompleteAddress
                        isRequire
                        titleName='Địa chỉ điểm đi'
                        placeholder='Địa chỉ bắt đầu xuất phát'
                        iconName='map-marker-alt'
                        itemValue={itemTrips.addressFrom}
                        typeFilter={TYPE.PROVINCE_FROM}
                        searchAction={searchAddress}
                        dataFilter={dataShow}
                        onChooseItem={handlerAddressChoose}
                    />
                    <TripWithPoint
                        config={config}
                        dateFilter={dateFilter}
                        quotaData={quotaData}
                        itemTrips={itemTrips}
                        ItemInput={ItemInput}
                        handlerItemChangeText={handlerItemChangeText}
                    />
                    <ItemInput
                        isRequire
                        key={`${TYPE.TYPE_NOTE}`}
                        titleName='Ghi chú'
                        placeholder='Nội dung đi công tác'
                        iconName='comment'
                        typeFilter={TYPE.TYPE_NOTE}
                        itemValue={itemTrips.note}
                        onChangeText={handlerItemChangeText}
                    />
                    <View style={{ height: deviceHeight / 2 }} />
                </KeyboardAwareScrollView>
            </ScrollView>
        </View>
    )
}
const ItemInput = ({ titleName, iconName, isRequire, onActionRight, iconRightName, typeFilter, itemValue, placeholder, onChangeText, keyboardType = 'default' }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const widthItem = onActionRight !== undefined ? '90%' : '100%'
    const styles = StyleSheet.create({
        mainItem: { flexGrow: 1, padding: 8, marginBottom: 1 },
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
    const androidClearValue = (text) => {
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
                    keyboardType={keyboardType}
                    containerStyle={styles.inputView}
                    editable
                    multiline
                    useClearAndroid={false}
                    value={itemValue}
                    handleChangeForm={handlerChangeValue}
                    onClearTextAndroid={androidClearValue}
                />
                {onActionRight !== undefined &&
                    <TouchableOpacity
                        style={{ width: '10%', padding: 8, marginStart: 5, backgroundColor: appcolor.info, borderRadius: 50 }}
                        onPress={onPress}>
                        <Icon type="font-awesome-5" name={iconRightName ? iconRightName : "search"} size={18} color={appcolor.light} />
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
} 