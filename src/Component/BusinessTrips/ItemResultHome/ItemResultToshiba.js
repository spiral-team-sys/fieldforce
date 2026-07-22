import moment from "moment";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { NumberFormatView } from "../../../Control/NumberFormatView";
import { formatNumber } from "../../../Core/Helper";
import { AppNameBuild, casperApp } from "../../../Core/URLs";
import { alertWarning, deviceHeight, deviceWidth } from "../../../Core/Utility";
import { ACTION_UPLOAD, provinceByAddress } from "../UtilityBusiness";
import { ModalNotify } from "../../../Control/ModalNotify";

export const ItemResultToshiba = ({ item, index, handlerDeleteTrip, handlerConfirmTrip, handlerEditTrips, handlerUploadDocument, handlerReConfirmTrip, styles }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isVisible, setVisible] = useState(false)
    const [messager, setMessager] = useState('')

    const listProvinceWork = JSON.parse(item?.provinceList || '[]')
    const provincePlan = `${item.provinceFromVN} - ${item.provinceToVN}`
    const datePlan = `Từ ${moment(item.fromDate.toString()).format('DD/MM/YY')} - Đến ${moment(item.toDate.toString()).format('DD/MM/YY')}`

    const daysMove = `Ngày di chuyển ${item.days || 0} Ngày - Thành tiền ${formatNumber(item.days * 250000, ',')} VNĐ`
    const supportKM = `Chi phí di chuyển ${item.supportKM > 0 ? formatNumber(item.supportKM, ',') : 0} VNĐ`
    const supportVehicalOther = `Chi phí di chuyển khác ${item.supportVehicalOther > 0 ? formatNumber(item.supportVehicalOther, ',') : 0} VNĐ`
    const supportNight = `Nghỉ qua đêm ${item.supportNight > 0 ? formatNumber(item.supportNight, ',') : 0} VNĐ`
    const supportLunch = `Ăn uống ${item.supportLunch > 0 ? formatNumber(item.supportLunch || 0, ',') : 0} VNĐ`
    const supportDinner = `Ăn tối ${item.supportDinner > 0 ? formatNumber(item.supportDinner || 0, ',') : 0} VNĐ`
    const supportOther = `Chi phí khác ${item.supportOther > 0 ? formatNumber(item.supportOther || 0, ',') : 0} VNĐ`
    const supportCar = `Chi phí di chuyển ${item.supportCar > 0 ? formatNumber(item.supportCar || 0, ',') : 0} VNĐ`
    const onChangeText = (text) => {
        item.confirmNote = text
    }
    const onDeleteItem = () => {
        if (item.isNotePlan == 1) {
            if (item.confirmNote == null || item.confirmNote.length < 5) {
                alertWarning(`Vui lòng nhập lí do hủy chuyến ${provincePlan} ${datePlan}`)
                return
            }
        }
        handlerDeleteTrip(item)
    }
    const onEditItem = () => {
        handlerEditTrips(item)
    }
    const onConfirmTrips = () => {
        handlerConfirmTrip(item, ACTION_UPLOAD.APPROVED)
    }
    const onUploadDocument = () => {
        handlerUploadDocument(item)
    }
    const onReConfirm = () => {
        handlerReConfirmTrip(item)
    }

    const handleVisibleModal = async (visible) => {
        await setVisible(visible)
    }
    const onPressStage = async () => {
        let pointUI = []

        for (let index = 0; index < listProvinceWork.length; index++) {
            const element = listProvinceWork[index];
            pointUI.push(
                <View key={'ViewPoint_' + element.id} style={{ borderRadius: 8, backgroundColor: appcolor.surface, padding: 4, marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: "center" }}>
                        <Text style={{ width: (element.addressPoint == null || element.addressPoint == '') ? '100%' : '50%', fontWeight: '600', fontSize: 12, color: (element.addressPoint == null || element.addressPoint == '') ? appcolor.tomato : appcolor.dark, paddingHorizontal: 4 }}>Điểm {element.id + 1}</Text>
                        {
                            (element.distance !== null && element.distance > 0) &&
                            <View style={{ justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{element.distanceText}</Text>
                            </View>
                        }
                    </View>
                    {
                        (element.addressPoint !== null && element.addressPoint !== '') &&
                        <View style={{ width: '100%', borderRadius: 4 }}>
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Địa chỉ :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.addressPoint}</Text>}</Text>
                            </View>
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Vị trí :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.locationPoint}</Text>}</Text>
                            </View>
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Thông tin lưu trú : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Đêm lưu trú : {element.numberDay || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ngày ăn : {element.eatDay || 0}</Text>}</Text>
                            </View>
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Chi phí : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Khách sạn : {formatNumber(element.nightRestValue, ',') || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ăn uống : {element.foodCostPoint || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Di chuyển : {element.vehicalValue || 0}</Text>}</Text>
                            </View>
                        </View>
                    }
                </View>
            )
        }
        await setMessager(<View style={{ height: deviceHeight * 0.3, width: deviceWidth * 0.8 }}>
            <ScrollView style={{ flex: 1 }} >
                {pointUI}
            </ScrollView>
        </View>)
        await handleVisibleModal(true)
    }
    return (
        <View key={`int_${index}`} style={{ width: '100%', paddingStart: 5, paddingEnd: 5, alignSelf: 'center' }}>
            <View style={styles.itemTrips}>
                {
                    item.isUsePoint == 1 && listProvinceWork.length > 0 ?
                        <View >
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                                <TouchableOpacity onPress={() => onPressStage()} style={{ padding: 4, backgroundColor: appcolor.light, borderRadius: 8 }}>
                                    <Text key={`NumPoint`}
                                        style={{ ...styles.titleDateLine, color: appcolor.info, fontSize: 15 }}>
                                        {`Tổng số điểm đến : ${listProvinceWork.length}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                contentContainerStyle={{ padding: 5 }}
                                style={{ alignSelf: 'center', width: '100%' }}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                nestedScrollEnabled
                            >
                                <Text key={`iib_${index}`} style={styles.titleView}>
                                    {(provinceByAddress(item.addressStart)).province || ''} -
                                </Text>
                                {listProvinceWork.map((item, index) => {
                                    return (
                                        <Text key={`iib_${index}`} style={styles.titleView}>
                                            {`${index > 0 ? ' -' : ''} ${item.provinceName} (${item.numberDay})`}
                                        </Text>
                                    )
                                })}
                            </ScrollView>
                            {/* <ItemView styleView={{ ...styles.titleView, width: '92%' }} value={provincePlan} iconName='plane-departure' /> */}
                        </View>
                        :
                        (listProvinceWork.length > 0 ?
                            <ScrollView
                                contentContainerStyle={{ padding: 5 }}
                                style={{ alignSelf: 'center', width: '100%' }}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                nestedScrollEnabled
                            >
                                {listProvinceWork.map((item, index) => {
                                    return (
                                        <Text key={`iib_${index}`} style={styles.titleView}>
                                            {`${index > 0 ? ' -' : ''} ${item.provinceName} (${item.numberDay})`}
                                        </Text>
                                    )
                                })}
                            </ScrollView>
                            :
                            <ItemView styleView={{ ...styles.titleView, width: '92%' }} value={provincePlan} iconName='plane-departure' />
                        )
                }

                <ItemView styleView={{ ...styles.contentView }} value={datePlan} iconName='calendar-alt' />
                {item.days !== null && item.days > 0 && <ItemView styleView={styles.contentView} value={daysMove} iconName='road' />}
                {item.supportKM !== null && item.supportKM > 0 && <ItemView styleView={styles.contentView} value={supportKM} iconName='road' />}
                <ItemView styleView={styles.contentView} value={supportNight} iconName='hotel' />
                <ItemView styleView={styles.contentView} value={supportLunch} iconName='utensils' />
                <ItemView styleView={styles.contentView} value={supportCar} iconName='car' />
                {item.supportVehicalOther !== null && item.supportVehicalOther > 0 && <ItemView styleView={styles.contentView} value={supportVehicalOther} iconName='road' />}
                {item.supportDinner !== null && item.supportDinner > 0 && <ItemView styleView={styles.contentView} value={supportDinner} iconName='utensils' />}
                {/* {item.supportOther !== null && item.supportOther > 0 && <ItemView styleView={styles.contentView} value={supportOther} iconName='money-bill' />} */}
                {item.note !== null && <ItemView styleView={styles.contentView} value={`Ghi chú: ${item.note}`} iconName='comment-alt' />}
                <Text style={{ fontSize: 14, fontWeight: '500', textAlign: 'right', end: 3, color: appcolor.primary }} >
                    Tổng chi phí: {<NumberFormatView value={item.totalSupport} />}
                </Text>
            </View>
            {item.isNotePlan == 1 &&
                <FormGroup
                    editable
                    placeholder='Nhập lí do (Nếu có)'
                    inputStyle={{ padding: 3, fontSize: 13 }}
                    defaultValue={item.confirmPlan}
                    title='Ghi chú'
                    handleChangeForm={onChangeText}
                />
            }
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', paddingEnd: 8 }}>
                {item.isDocument == 1 &&
                    <View style={{ flexDirection: 'row' }}>
                        <ActionPress
                            title='Chứng từ'
                            type={ACTION_UPLOAD.DOCUMENT}
                            colorAction={appcolor.bluesky}
                            itemAction={item}
                            onPress={onUploadDocument} />
                    </View>
                }
                <View style={{ flexDirection: 'row', end: 0 }}>
                    {item.isConfirm == 1 &&
                        <ActionPress
                            title='Xác nhận'
                            type={ACTION_UPLOAD.APPROVED}
                            colorAction={appcolor.success}
                            itemAction={item}
                            onPress={onConfirmTrips}
                        />
                    }
                    {item.isUpdate == 1 &&
                        <ActionPress
                            title='Cập nhật'
                            type={ACTION_UPLOAD.UPDATE}
                            colorAction={appcolor.yellow}
                            itemAction={item}
                            onPress={onEditItem} />
                    }
                    {item.isDelete == 1 &&
                        <ActionPress
                            title='Xoá'
                            type={ACTION_UPLOAD.DELETE}
                            colorAction={appcolor.red}
                            itemAction={item}
                            onPress={onDeleteItem} />
                    }
                    {item.isReConfirm == 1 &&
                        <ActionPress
                            title='Xác nhận lại'
                            type={ACTION_UPLOAD.RECONFIRM}
                            colorAction={appcolor.tomato}
                            itemAction={item}
                            onPress={onReConfirm} />
                    }
                </View>
            </View>
            {isVisible &&
                <ModalNotify messager={messager} visible={isVisible} titleConfirm={'Đóng'} handleVisibleModal={handleVisibleModal} />
            }
        </View>
    )
}

const ItemView = ({ value, iconName, styleView }) => {
    const appcolor = useSelector((state) => state.GAppState)
    return (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
            <Icon type="font-awesome-5" name={iconName} size={14} color={appcolor.dark} style={{ width: 30, padding: 5 }} />
            <Text style={styleView}>
                {value}
            </Text>
        </View>
    )
}
const ActionPress = ({ type, title, onPress, colorAction, itemAction }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const actionItem = () => {
        onPress(itemAction, type)
    }
    return (
        <TouchableOpacity style={{ margin: 3, padding: 8, backgroundColor: colorAction, borderRadius: 3 }} onPress={actionItem}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: appcolor.light }}>{title}</Text>
        </TouchableOpacity>
    )
}