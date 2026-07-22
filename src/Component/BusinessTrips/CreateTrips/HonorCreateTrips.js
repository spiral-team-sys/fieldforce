import moment from "moment"
import React, { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from "react-redux"
import FormGroup from "../../../Content/FormGroup"
import { CalendarSelected } from "../../../Control/CalendarSelected"
import { AttendantController } from "../../../Controller/AttendantController"
import { GetProvinceByShop } from "../../../Controller/BussinessTripController"
import { alertNotify, alertWarning, deviceHeight, isValid, } from "../../../Core/Utility"
import { HeaderBusiness } from "../HeaderBusiness"
import { MODE, TYPE } from "../UtilityBusiness"
import _ from "lodash"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { ScrollView } from "react-native-actions-sheet"
import { TripWithPoint } from "../TripWithPoint"
import { AddressByShop } from "../InputControl/AddressByShop"
import { SetBusinesTrips } from "../../../Redux/action";
import { PhotoEvidentTrip } from "../InputControl/PhotoEvidentTrip";

export const HonorCreateTrips = ({ onCloseCreate, onNextCreate, dateFilter, tripConfig, dataTrips, quotaData }) => {
    const { appcolor, tripResult, kpiinfo } = useSelector(state => state.GAppState)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [dataProvince, setDataProvince] = useState([])
    const [dataProvinceMain, setDataProvinceMain] = useState([])
    const config = JSON.parse(kpiinfo?.reportItem) || {}
    const [_mutate, setMutate] = useState(false)
    const [reload, setReload] = useState(false)

    const typeArrow = { titleHeader: 'Địa điểm công tác', typeBack: 'close', typeForward: 'arrow-forward' }
    const [itemTrips, setItemTrips] = useState({
        loadCalendar: false,
        moneyLimit: tripResult?.moneyLimit || dateFilter?.moneyLimit,
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
        daysOld: tripResult.daysOld || tripResult.dayValue,
        nightsOld: tripResult.nightsOld || tripResult.nightValue,
        dateFilterFrom: tripResult.dateFilterFrom || dateFilter.fromDate,
        dateFilterTo: tripResult.dateFilterTo || dateFilter.toDate,
        dayAndNight: tripResult.dayAndNight || dateFilter.dayAndNight,
        note: tripResult.note || null,
        mLatitude: dateFilter.mLatitude,
        mLongitude: dateFilter.mLongitude,
        supportVehicalOther: tripResult.supportVehicalOther || 0,
        supportWorkValue: tripResult.supportWork || 0,
        tripReplace: tripResult.tripReplace || null,
        confirmReplace: tripResult.confirmReplace || 0,
        typeVehicle: tripResult.typeVehicle || null,
        movingSteps: tripResult.movingSteps || null,
        kmValue: tripResult.kmValue || null,
        supportWorkMaint: tripResult.supportWorkMaint || null,
        shopStartName: tripResult.shopStartName || null,
        shopEndName: tripResult.shopEndName || null,
        districtFrom: tripResult.districtFrom || null,
        districtTo: tripResult.districtTo || null,
        districtCodeFrom: tripResult.districtCodeFrom || null,
        districtCodeTo: tripResult.districtCodeTo || null,
        listTypeCost: tripResult.listTypeCost || null,
        evidence: tripResult.evidence || null,
        photoByType: tripResult.photoByType || null,
        isHaveExceed: tripResult.isHaveExceed || 0,
        isActual: tripResult.isActual || 0

    })
    //
    const LoadData = async () => {
        await setLoading(true)
        await GetProvinceByShop(async (mData) => {
            await setDataProvince(mData)
            await setDataProvinceMain(mData)
        })
        await setLoading(false)
    }
    //
    const actionNext = async () => {
        // if (!dateFilter.isCreateInMonth) {
        //     const configItem = JSON.parse(kpiinfo?.reportItem || '{}')
        //     if (moment(itemTrips.fromDate?.toString()).format('YYYYMM') == moment().add('days', configItem?.dayCheck || 0).format('YYYYMM')) {
        //         alertWarning('Bạn không được đăng kí tháng hiện tại')
        //         return
        //     }
        //     if (moment(itemTrips.fromDate?.toString()).format('YYYYMM') < moment().format('YYYYMM')) {
        //         alertWarning('Bạn không được đăng kí tháng cũ')
        //         return
        //     }
        // }

        if (dateFilter.mode == MODE.CREATE && !dateFilter.isUpdate) {
            if (config.dayLock !== undefined && config.dayLock > 0) {
                const monthSelect = moment(itemTrips.fromDate, 'YYYYMMDD').format('MM');
                const dateSelect = moment(itemTrips.fromDate, 'YYYYMMDD').format('DD');

                if (config.dayLock < new Date().getDate() && monthSelect == (new Date().getMonth() + 1) && dateSelect <= config.dayLock) {
                    alertWarning(`Bạn không được đăng kí ngày đi công tác nhỏ hơn ngày ${config.dayLock} của tháng hiện tại!`)
                    return
                }
            }
            if (moment(itemTrips.fromDate).format('YYYYMM') < moment().format('YYYYMM')) {
                alertWarning('Bạn không được đăng kí tháng cũ')
                return
            }
        }
        await checkInputData(async (isSuccess, message) => {
            if (isSuccess) {
                const tripResultItem = await _.merge(tripResult, itemTrips)
                // await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: tripResultItem })
                await dispatch(SetBusinesTrips({ ...tripResultItem, provinceList: itemTrips.provinceList }))
                await onNextCreate(MODE.CREATE)
            } else {
                alertWarning(message)
            }
        })
    }
    const checkInputData = (actionDone) => {
        let strValid = ''
        if (((dateFilter.isEvidentDateChange && (itemTrips.dayValue > itemTrips.daysOld || itemTrips.nightValue > itemTrips.nightsOld)) || itemTrips.isHaveExceed == 1) && itemTrips.isActual) {
            const evidenceParse = JSON.parse(itemTrips.evidence || '[]')
            if (evidenceParse.length == 0) {
                strValid += 'Vui lòng thêm hình ảnh làm bằng chứng cho việc thay đổi ngày đi công tác, '
            }
        }

        if (!isValid(itemTrips.locationStart))
            strValid += 'Vị trí điểm đi, '
        if (!isValid(itemTrips.locationEnd))
            strValid += 'Vị trí điểm đến, '
        // if (!isValid(itemTrips.kmValue))
        //     strValid += 'Tính quãng đường di chuyển, '

        if (isValid(itemTrips.provinceList) && itemTrips.provinceList?.length > 0) {
            const listPoints = itemTrips.provinceList
            const listTypeCost = _.filter(itemTrips.listTypeCost || [], it => it.isChoose == 1)
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
                if (element.numberDay !== "" && element.numberDay !== null && listTypeCost.length == 0) {
                    if ((element.nightRestValue == 0 || element.nightRestValue == null || element.nightRestValue == undefined) && element.numberDay > 0) {
                        strValid += `Chưa nhập chi phí khách sạn điểm ${element.id + 1}, `
                    }
                    countNightDay = countNightDay + element.numberDay
                }
                if (element.eatDay !== "" && element.eatDay !== null) {
                    countEatDay = countEatDay + element.eatDay
                }
            }
            if (countNightDay > itemTrips.nightValue) {
                strValid += `Tổng đêm lưu trú lớn hơn số đêm đi công tác, `
            } else if ((listTypeCost?.length || 0) == 0 && countNightDay !== itemTrips.nightValue) {
                strValid += `Tổng đêm lưu trú phải bằng số đêm đi công tác (${countNightDay}/${itemTrips.nightValue}), `
            }
            if (countEatDay > itemTrips.dayValue) {
                strValid += `Tổng ngày ăn lớn hơn số ngày đi công tác, `
            } else if ((listTypeCost?.length || 0) == 0 && countEatDay != itemTrips.dayValue) {
                strValid += `Tổng ngày ăn phải bằng số ngày đi công tác (${countEatDay}/${itemTrips.dayValue}), `
            }

            if (itemTrips.typeVehicle == 'DRIVING' || quotaData.isUseGoogleKm == 1) {
                if (quotaData.isFirstPointLastPoint == 1) {
                    const itemLast = listPoints?.length > 0 ? listPoints[listPoints?.length - 1] : null
                    if (itemLast.distance == null || itemLast.distance == 0) {
                        strValid += `Chưa bấm tính quảng đường di chuyển, `
                    }
                } else {
                    const checkDistance = listPoints.filter(it => it.distance == null || it.distance == 0)
                    if (checkDistance.length > 0) {
                        strValid += `Chưa bấm tính quảng đường di chuyển, `
                    }
                }
            }
            if (strValid !== '')
                strValid += 'trong mục Thông tin chặng đường, '
        } else {
            strValid += 'Chưa nhập số điểm đến của chuyến, '
        }

        if (!isValid(itemTrips.note))
            strValid += 'Vui lòng nhập ghi chú, '
        if (dateFilter.mode == MODE.CREATE || dateFilter.mode == MODE.UPDATE) {
            if (tripConfig.maxDay !== null && tripConfig.maxDay !== undefined && tripConfig.maxDay > 0 && itemTrips.dayValue > tripConfig?.maxDay) {
                alertWarning(`Số ngày đi không được lớn hơn số ngày giới hạn: ${itemTrips.dayValue} / ${tripConfig.maxDay}`)
                return
            }
        }

        // kiểm tra nếu listTypeCost có chọn chi phí khác mà không có chụp hình ảnh làm bằng chứng thì báo lỗi
        const listTypeCost = _.filter(itemTrips.listTypeCost || [], it => it.isChoose == 1 && it.isNeedEvident == 1)
        if (listTypeCost.length > 0) {
            const photoByType = JSON.parse(itemTrips.photoByType || '[]')
            for (let index = 0; index < listTypeCost.length; index++) {
                const element = listTypeCost[index];
                const checkPhoto = photoByType.filter(i => i.photoType == 'Workingschedule_' + element.fieldCost)
                if (checkPhoto.length == 0) {
                    strValid += `Vui lòng thêm hình ảnh làm bằng chứng cho ${element.itemName}, `
                }
            }
        }

        //
        actionDone(strValid.length == 0, `Vui lòng nhập đầy đủ dữ liệu: ${strValid}`)
    }
    const handlerWorkingDate = async (fromValue, toValue) => {
        const currentMonth = moment(itemTrips.fromDate?.toString(), 'YYYYMMDD').format('YYYYMM')
        if (
            moment(fromValue).format('YYYYMM') !== currentMonth ||
            moment(toValue).format('YYYYMM') !== currentMonth
        ) {
            alertWarning(`Ngày được chọn phải nằm trong tháng ${moment(itemTrips.fromDate?.toString(), 'YYYYMMDD').format('MM/YYYY')}`)
            return
        }

        if (dateFilter.mode == MODE.UPDATE || dateFilter.isUpdate == true) {
            if (moment(itemTrips.fromDate.toString()).format('YYYYMM') !== moment(fromValue).format('YYYYMM')) {
                alertWarning('Bạn không được cập nhật ngày qua tháng khác')
                return
            }
        }

        const fromDate = moment(fromValue).format('YYYYMMDD')
        const toDate = moment(toValue).format('YYYYMMDD')
        const betweenDate = moment(toValue).diff(moment(fromValue), 'days')
        const calculatorDate = `(${betweenDate + 1} Ngày ${betweenDate} Đêm)`
        await setItemTrips({
            ...itemTrips,
            fromDate: fromDate,
            toDate: toDate,
            dateFilterFrom: moment(fromValue).format('DD/MM/YYYY'),
            dateFilterTo: moment(toValue).format('DD/MM/YYYY'),
            loadCalendar: false,
            dayAndNight: calculatorDate,
            dayValue: betweenDate + 1,
            nightValue: betweenDate
        })
    }
    const handlerItemChangeText = async (text, typeItem) => {
        if (typeItem == TYPE.PROVINCE_FROM)
            await setItemTrips({ ...itemTrips, addressFrom: text, locationStart: null })
        if (typeItem == TYPE.PROVINCE_TO)
            await setItemTrips({ ...itemTrips, addressTo: text, locationEnd: null })
        if (typeItem == TYPE.TYPE_NOTE)
            await setItemTrips({ ...itemTrips, note: text })
    }
    const handleSelectItem = async (itemSelect, typeItem) => {
        // await setReload(true)
        switch (typeItem) {
            case TYPE.PROVINCE_FROM:
                itemTrips.provinceFrom = itemSelect.province
                itemTrips.provinceCodeFrom = itemSelect.provinceCode
                itemTrips.addressFrom = itemSelect.addressPoint
                itemTrips.locationStart = itemSelect.locationPoint
                itemTrips.shopStartName = itemSelect.shopName
                itemTrips.districtFrom = itemSelect.district
                itemTrips.districtCodeFrom = itemSelect.districtCode

                itemTrips.addressTo = null
                itemTrips.locationEnd = null
                itemTrips.districtTo = null
                itemTrips.provinceTo = null

                itemTrips.kmValue = null
                itemTrips.kmValueText = null

                await setReload(e => !e)
                break;
            case TYPE.PROVINCE_TO:
                itemTrips.provinceTo = itemSelect.province
                itemTrips.provinceCodeTo = itemSelect.provinceCode
                itemTrips.addressTo = itemSelect.addressPoint
                itemTrips.locationEnd = itemSelect.locationPoint
                itemTrips.shopEndName = itemSelect.shopName
                itemTrips.districtTo = itemSelect.district
                itemTrips.districtCodeTo = itemSelect.districtCode
                await handleSaveChange()
                await setReload(e => !e)
                break
        }
    }
    const handleSaveChange = async () => {
        if (itemTrips.locationStart && itemTrips.locationEnd) {
            const jsonAddress = {
                locationStart: itemTrips.locationStart,
                locationEnd: itemTrips.locationEnd,
                wayPoint: null,
                vehicle: 'DRIVING'
            }
            await setTimeout(async () => {
                await AttendantController.DataWaysFromLocation(jsonAddress, async (dataLocation) => {
                    if (dataLocation !== null && dataLocation.length > 0) {
                        const distanceResult = dataLocation[0].legs
                        const itemDistance = distanceResult[0].distance
                        itemTrips.kmValue = itemDistance.value
                        itemTrips.kmValueText = itemDistance.text
                    }
                    await setMutate(e => !e)
                })
            }, 500)
        } else {
            alertNotify('Vui lòng nhập đủ vị trí điểm đến trước khi xác nhận')
        }
    }
    const handlerAddImage = (photo, type) => {
        let dataPhotoByType = JSON.parse(itemTrips?.evidence || '[]') || []
        if (type === 'add') {
            itemTrips.evidence = JSON.stringify([...dataPhotoByType, photo])
        } else if (type === 'remove') {
            itemTrips.evidence = JSON.stringify(dataPhotoByType.filter(i => i.photoPath !== photo.photoPath))
        } else if (type === 'new') {
            itemTrips.evidence = JSON.stringify(photo)
        }
        setMutate(e => !e)
    }
    useEffect(() => {
        LoadData()
        return () => loading
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
                        {itemTrips.loadCalendar && <CalendarSelected onChangeData={handlerWorkingDate} lockOutMonth={true} fromDate={moment(itemTrips.dateFilterFrom, 'DD/MM/YYYY').format('YYYY-MM-DD')} toDate={moment(itemTrips.dateFilterTo, 'DD/MM/YYYY').format('YYYY-MM-DD')} />}
                    </View>
                    {
                        // (((dateFilter.isEvidentDateChange && ((itemTrips.dayValue > itemTrips.daysOld || itemTrips.nightValue > itemTrips.nightsOld) || JSON.parse(itemTrips.evidence || '[]').length > 0)) || itemTrips.isHaveExceed == 1)) &&
                        dateFilter.isEvidentDateChange && dateFilter.isUpdate &&
                        <PhotoEvidentTrip _guid={dateFilter.guid} itemInput={itemTrips} listPhoto={JSON.parse(itemTrips.evidence || '[]')} reload={reload} photoType={'Workingschedule_Exceed'} handlerAddImage={handlerAddImage} />
                    }

                    <AddressByShop
                        key={`${TYPE.PROVINCE_FROM}_2`}
                        typeItem={TYPE.PROVINCE_FROM}
                        dataProvince={dataProvince}
                        quotaData={quotaData}
                        itemTrips={itemTrips}
                        titleName={'Điểm đi'}
                        placeholder={'Địa chỉ bắt đầu xuất phát'}
                        isUseMainStore={true}
                        handleSelectItem={handleSelectItem}
                    />

                    {
                        itemTrips.locationStart &&
                        <AddressByShop
                            key={`${TYPE.PROVINCE_TO}_2`}
                            typeItem={TYPE.PROVINCE_TO}
                            dataProvince={dataProvince}
                            quotaData={quotaData}
                            itemTrips={itemTrips}
                            titleName={'Điểm đến'}
                            placeholder='Địa chỉ check in xa nhất của chuyến công tác'
                            isUseMainStore={true}
                            reload={reload}
                            handleSelectItem={handleSelectItem}
                        />
                    }
                    <ItemInput
                        typeFilter={TYPE.TYPE_KM}
                        keyboardType="numeric"
                        isRequire
                        editable={false}
                        titleName={`Km/chuyến đi`}
                        placeholder={`Tổng số kilomet di chuyển`}
                        iconName='road'
                        itemValue={itemTrips.kmValueText || (itemTrips.kmValue / 1000).toFixed(2)}
                    />
                    <TripWithPoint
                        config={config}
                        dateFilter={dateFilter}
                        quotaData={quotaData}
                        itemTrips={itemTrips}
                        ItemInput={ItemInput}
                        handlerItemChangeText={handlerItemChangeText}
                        dataProvince={dataProvince}
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

const ItemInput = ({ titleName, iconName, isRequire, onActionRight, typeFilter, itemValue, placeholder, onChangeText, keyboardType = 'default' }) => {
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
