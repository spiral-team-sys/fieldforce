import React, { useState } from "react";
import { LayoutAnimation, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from '@rneui/themed';
import { formatNumber } from "../../../Core/Helper";
import { CostItemView } from "./CostItemView";
import { useSelector } from "react-redux";
import { deviceWidth } from "../../../Core/Utility";
import moment from "moment";
import { UIManager } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ViewResultSharp = ({ tripResult }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [showStage, setShowStage] = useState()
    const styles = StyleSheet.create({
        contentView: { flexDirection: 'row', backgroundColor: appcolor.surface, padding: 8, margin: 8, borderRadius: 10 },
        titleDateLine: { paddingStart: 8, paddingTop: 8, fontSize: 14, fontWeight: '700', color: appcolor.dark },
        titleBodyLine: { paddingStart: 8, fontSize: 13, fontWeight: '300', color: appcolor.greylight },
        lineView: { width: 1, height: '85%', backgroundColor: appcolor.bluenavylight, alignItems: 'center', alignSelf: 'center', marginEnd: 8 },
        costView: { backgroundColor: appcolor.light, padding: 8, borderRadius: 5, margin: 5 },
        itemCost: { fontSize: 13, fontWeight: '400' }
    })

    const addressTo = tripResult.provinceList[tripResult.provinceList.length - 1]?.addressPoint || ''
    const onPressStage = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowStage(e => !e)
    }

    return (
        <View style={{ width: deviceWidth, padding: 8 }}>
            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} >
                {tripResult.provinceList !== undefined && tripResult.provinceList.length > 0 && tripResult.provinceList.map((item, index) => {
                    return (
                        <Text key={`12qq_${index}`}
                            style={{ ...styles.titleDateLine, color: appcolor.info, fontSize: 15 }}>
                            {`${index > 0 ? '- ' : ''} ${item.provinceName} (${item.numberDay})`}
                        </Text>
                    )
                })}
            </ScrollView> */}
            {tripResult.provinceList !== undefined && tripResult.provinceList.length > 0 &&
                <TouchableOpacity onPress={() => onPressStage()}>
                    <Text key={`NumStage`}
                        style={{ ...styles.titleDateLine, color: appcolor.info, fontSize: 15 }}>
                        {`Tổng số điểm đến : ${tripResult.provinceList.length}`}
                    </Text>
                </TouchableOpacity>
            }
            {/* {showStage == true &&
                <View style={{ margin: 8, borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, padding: 4 }}>
                    {
                        tripResult.provinceList.map((it, idx) => {
                            return (
                                <View key={'ViewStages_' + it.id} style={{}}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark, padding: 4, width: '80%' }}>Chặng thứ : {it.id + 1}</Text>
                                        {
                                            it.distance > 0 &&
                                            <View style={{ width: '20%', justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>{it.distance}</View>
                                        }
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleSelectItem(it, idx)}
                                        key={'itemStages_' + it.id} style={{ padding: 4, borderRadius: 4, margin: 2, backgroundColor: appcolor.surface, flexDirection: 'row' }}>

                                        <View style={{ width: '100%', borderRadius: 4 }}>
                                            <View style={{ width: '100%', flexDirection: "row", paddingBottom: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.startPosition !== null ? appcolor.dark : appcolor.tomato }}>{it.startPosition !== null ? 'Điểm bắt đầu : ' : 'Chưa có điểm bắt đầu'}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.startPosition}</Text>}</Text>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: "row", paddingBottom: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.endPosition !== null ? appcolor.dark : appcolor.tomato }}>{it.endPosition !== null ? 'Điểm kết thúc : ' : 'Chưa có điểm kết thúc'}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.endPosition}</Text>}</Text>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: "row" }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Thông tin lưu trú : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ngày ăn : {it.eatDay || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Lưu trú : {it.numberDay || 0}</Text>}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                    }
                </View>

            } */}

            {showStage == true &&
                <View style={{ margin: 8, borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, padding: 4 }}>

                    {
                        tripResult.provinceList.map((it, idx) => {
                            return (
                                <View key={'ViewPoint_' + it.id} style={{ borderRadius: 8, backgroundColor: appcolor.surface, padding: 4, marginBottom: 4 }}>
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: "center" }}>
                                        <Text style={{ width: (it.addressPoint == null || it.addressPoint == '') ? '100%' : '50%', fontWeight: '600', fontSize: 12, color: (it.addressPoint == null || it.addressPoint == '') ? appcolor.tomato : appcolor.dark, paddingHorizontal: 4 }}>Điểm {it.id + 1}{(it.addressPoint == null || it.addressPoint == '') ? <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.tomato }}>{': chưa có thông tin'}</Text> : ''}</Text>
                                        {
                                            (it.distance !== null && it.distance > 0) &&
                                            <View style={{ justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{it.distanceText}</Text>
                                            </View>
                                        }
                                    </View>
                                    {
                                        (it.addressPoint !== null && it.addressPoint !== '') &&
                                        <View style={{ width: '100%', borderRadius: 4 }}>
                                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Địa chỉ :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.addressPoint}</Text>}</Text>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: it.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Vị trí :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{it.locationPoint}</Text>}</Text>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 4 }}>
                                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Thông tin lưu trú : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Đêm lưu trú : {it.numberDay || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ngày ăn : {it.eatDay || 0}</Text>}</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                            )
                        })
                    }
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
                    <Text style={styles.titleDateLine}>{`${tripResult.addressFrom}`}</Text>
                    <View style={styles.costView}>
                        <Text style={{ ...styles.itemCost, fontSize: 14, fontWeight: '600' }}>
                            {`Tổng chi phí: ${tripResult.totalSupport !== 0 ? formatNumber(tripResult.totalSupport, ',') : 0} VNĐ`}
                        </Text>
                        <View style={{ width: '100%', height: 0.5, backgroundColor: appcolor.greylight, marginTop: 5, marginBottom: 5 }} />

                        {/* <CostItemView title='Phương tiện khác' name={tripResult.supportVehicalOther} iconName='car' /> */}
                        <CostItemView title='Khách sạn' name={tripResult.supportNight} iconName='hotel' />
                        <CostItemView title='Ăn uống' name={tripResult.supportLunch} iconName='utensils' />
                        <CostItemView title='Di chuyển' name={tripResult.totalKM} iconName='car' />
                        {/* {tripResult.kmValue > 0 ?
                            <CostItemView title={`Di chuyển ${tripResult.kmValue}km -`} name={`${tripResult.supportKM}`} iconName='road' /> :
                            <CostItemView title={`Di chuyển`} name={`${tripResult.supportKM}`} iconName='road' />} */}
                        {/* <CostItemView title='Ăn tối' name={tripResult.supportDinner} iconName='utensils' /> */}
                        {/* <CostItemView title='Chi phí khác' name={tripResult.supportOther} iconName='money-bill' /> */}
                        {/* <View style={{ width: '100%', height: 0.5, backgroundColor: appcolor.greylight, marginTop: 5, marginBottom: 8 }} /> */}
                        {/* <Text style={{ ...styles.itemCost, fontSize: 14, fontWeight: '600', color: appcolor.tomato }}>
                            {`Hạn mức còn lại: ${formatNumber(tripResult.moneyLimit - tripResult.totalSupport, ',')} VNĐ`}
                        </Text> */}
                    </View>
                    <View>
                        <Text style={styles.titleDateLine}>{`${tripResult.addressTo || addressTo}`}</Text>
                    </View>
                </View>
            </View>
        </View >
    )
}