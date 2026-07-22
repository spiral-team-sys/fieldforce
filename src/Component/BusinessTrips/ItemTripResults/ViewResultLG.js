import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { formatNumber } from "../../../Core/Helper";
import { CostItemView } from "./CostItemView";
import { useSelector } from "react-redux";
import { deviceHeight, deviceWidth } from "../../../Core/Utility";
import moment from "moment";
import { TouchableOpacity } from "react-native";
import { ModalNotify } from "../../../Control/ModalNotify";

export const ViewResultLG = ({ tripResult }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [showStage, setShowStage] = useState()
    const [isVisible, setVisible] = useState(false)
    const [messager, setMessager] = useState('')
    const listProvinceWork = tripResult?.provinceList || []
    const provincePlan = `${tripResult?.provinceFromVN} - ${tripResult?.provinceToVN}`
    const addressTo = tripResult.typeKM == 1 ? (listProvinceWork[listProvinceWork.length - 1]?.addressPoint || listProvinceWork[listProvinceWork.length - 1]?.provinceTo || listProvinceWork[listProvinceWork.length - 1]?.shopVisit || '') : tripResult.addressTo
    const addressFrom = tripResult.addressFrom

    const styles = StyleSheet.create({
        contentView: { flexDirection: 'row', backgroundColor: appcolor.surface, padding: 8, margin: 8, borderRadius: 10 },
        titleDateLine: { paddingStart: 8, paddingTop: 8, fontSize: 14, fontWeight: '700', color: appcolor.dark },
        titleBodyLine: { paddingStart: 8, fontSize: 13, fontWeight: '300', color: appcolor.greylight },
        lineView: { width: 1, height: '85%', backgroundColor: appcolor.bluenavylight, alignItems: 'center', alignSelf: 'center', marginEnd: 8 },
        costView: { backgroundColor: appcolor.light, padding: 8, borderRadius: 5, margin: 5 },
        itemCost: { fontSize: 13, fontWeight: '400' }
    })

    const onPressStage = async () => {
        let pointUI = []
        for (let index = 0; index < listProvinceWork.length; index++) {
            const element = listProvinceWork[index];
            pointUI.push(
                <View key={`ViewPoint_${element.workDate}_${element.provinceTo}_${element.addressPoint}`} style={{ borderRadius: 8, backgroundColor: appcolor.surface, padding: 4, marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: "center" }}>
                        {element.id !== null && element.id >= 0 && <Text style={{ width: (element.addressPoint == null || element.addressPoint == '') ? '100%' : '50%', fontWeight: '600', fontSize: 12, color: (element.addressPoint == null || element.addressPoint == '') ? appcolor.tomato : appcolor.dark, paddingHorizontal: 4 }}>Điểm {element.id + 1}</Text>}
                        {element.workDate && <Text style={{ width: '100%', fontWeight: '600', fontSize: 12, color: appcolor.tomato, paddingHorizontal: 4 }}>Ngày đi {element.workDate}</Text>}
                        {
                            (element.distance !== null && element.distance > 0) &&
                            <View style={{ justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{element.distanceText}</Text>
                            </View>
                        }
                    </View>
                    <View style={{ width: '100%', borderRadius: 4 }}>
                        {
                            (element.addressPoint != null || element.shopVisit != null) &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Địa chỉ : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.addressPoint || element.shopVisit}</Text>}</Text>
                            </View>
                        }
                        {
                            (element.provinceTo != null) &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Tỉnh đến : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.provinceTo}</Text>}</Text>
                            </View>
                        }
                        {
                            ((element.amountHotel != null && element.amountHotel >= 0) ||
                                (element.amountAllowance != null && element.amountAllowance >= 0) ||
                                (element.amountTransport != null && element.amountTransport >= 0)) &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 2 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Chi phí : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Khách sạn : {formatNumber(element.amountHotel, ',') || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Phụ cấp : {element.amountAllowance || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Di chuyển : {element.amountTransport || 0}</Text>}</Text>
                            </View>
                        }
                        {
                            (element.remark !== null && element.remark !== '') &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.tomato }}>Ghi chú : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.remark}</Text>}</Text>
                            </View>
                        }
                    </View>
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
    const handleVisibleModal = async (visible) => {
        await setVisible(visible)
    }

    return (
        <View style={{ width: deviceWidth, padding: 8 }}>
            {
                listProvinceWork.length > 0 &&
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                    <TouchableOpacity onPress={() => onPressStage()} style={{ padding: 4, backgroundColor: appcolor.surface, borderRadius: 8 }}>
                        <Text key={`NumPoint`}
                            style={{ color: appcolor.info, fontSize: 15 }}>
                            {`Xem các điểm đến : ${listProvinceWork.length}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            }
            <View style={styles.contentView}>
                <Text style={{ paddingTop: 8, fontSize: 13, fontWeight: '500', color: appcolor.tomato, position: 'absolute', marginStart: 12, alignSelf: 'center' }}>
                    {`${tripResult.dayValue}N ${tripResult.nightValue}Đ`}
                </Text>
                <View style={{ width: deviceWidth / 8, alignItems: 'center', marginEnd: 8 }}>
                    <Text style={styles.titleDateLine}>{`${moment(tripResult.dateFilterFrom, 'DD/MM/YYYY').format('DD MMM')}`}</Text>
                    <Text style={{ ...styles.titleDateLine, position: 'absolute', bottom: 14 }}>{`${moment(tripResult.dateFilterTo, 'DD/MM/YYYY').format('DD MMM')}`}</Text>
                </View>
                <View style={styles.lineView}>
                    <View style={{ width: 10, height: 10, borderRadius: 50, borderWidth: 0.5, borderColor: appcolor.info, backgroundColor: appcolor.light }} />
                    <View style={{ width: 10, height: 10, borderRadius: 50, backgroundColor: appcolor.info, bottom: 0, position: 'absolute' }} />
                </View>
                <View style={{ width: deviceWidth / 1.4 }}>
                    <Text style={styles.titleDateLine}>{`${tripResult.addressFrom || addressFrom}`}</Text>
                    <View style={styles.costView}>
                        <Text style={{ ...styles.itemCost, fontSize: 14, fontWeight: '600' }}>
                            {`Tổng chi phí: ${tripResult.totalSupport !== 0 ? formatNumber(tripResult.totalSupport, ',') : 0} VNĐ`}
                        </Text>
                        <View style={{ width: '100%', height: 0.5, backgroundColor: appcolor.greylight, marginTop: 5, marginBottom: 5 }} />
                        <View style={{ width: '100%', height: 0.5, padding: 8 }} />
                        <CostItemView title={`Số KM di chuyển`} name={`${tripResult.kmValue}`} unitTitle={'KM'} iconName='road' />
                        <CostItemView title={`Khách sạn`} name={`${tripResult.supportNight}`} iconName='hotel' />
                        <CostItemView title={`Di chuyển`} name={`${tripResult.supportKM}`} iconName='road' />
                        <CostItemView title={`Phụ cấp`} name={`${tripResult.supportWork}`} iconName='money-bill' />
                        <View style={{ width: '100%', height: 0.5, padding: 8 }} />
                    </View>
                    <View>
                        <Text style={styles.titleDateLine}>{`${addressTo}`}</Text>
                    </View>
                </View>
            </View>
            {isVisible &&
                <ModalNotify titleNotify={'Thông tin'} messager={messager} visible={isVisible} titleConfirm={'Đóng'} handleVisibleModal={handleVisibleModal} />
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
