
import React, { useState } from "react";
import { LayoutAnimation, Platform, Text, TouchableOpacity, UIManager, View } from "react-native";
import { useSelector } from "react-redux";
import moment from "moment";
import { Icon } from '@rneui/themed';
import LottieView from "lottie-react-native";
import { ScrollView } from "react-native-actions-sheet";
import { deviceWidth } from "../../../Core/Utility";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export const ViewExistsTrip = ({ dataTrips, onTripSelect, itemTrips, itemReplace }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataView, setDataView] = useState({ isShowTrip: false, dataTrips: [] })
    const [tripSelect, setTripSelect] = useState(itemTrips.tripReplace || 0)
    const [dataReplace, setDataReplace] = useState(itemReplace)
    const [_mutate, setMutate] = useState(false)

    const handleShowListTrip = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (dataView.isShowTrip == false) {
            if (dataView.dataTrips && (dataView.dataTrips?.length == 0 || ((moment(itemTrips.fromDate, "YYYYMMDD").month() + 1) !== (moment(dataTrips[0]?.fromDate, "YYYYMMDD").month() + 1)))) {
                const listShow = dataTrips?.filter(it => it.isCanReplace == 1 && ((moment(it.fromDate, "YYYYMMDD").month() + 1) == (moment(itemTrips.fromDate, "YYYYMMDD").month() + 1)) && (itemTrips.idTrip == null || it.idTrip !== itemTrips.idTrip))
                dataView.dataTrips = listShow
            }

            dataView.isShowTrip = true
        } else {
            dataView.isShowTrip = false
        }
        setMutate(e => !e)
    }
    const handlePressTrip = (itemTrip) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dataView.isShowTrip = false
        const itemSelect = itemTrip.idTrip == tripSelect ? null : itemTrip.idTrip
        setTripSelect(itemSelect)
        setDataReplace(itemSelect == null ? {} : itemTrip)
        onTripSelect(itemSelect)
    }
    const handleCloseListTrip = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dataView.isShowTrip = false
        setMutate(e => !e)
    }
    return (
        <View style={{ flex: 1, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ width: '100%', fontWeight: '600', paddingBottom: 8, fontSize: 14, color: appcolor.dark }}>Thay thế chuyến đã có</Text>
            <TouchableOpacity key={'ButtonShowTrip'}
                onPress={() => (itemTrips.confirmReplace === 1 || itemTrips.idTrip) ? null : handleShowListTrip()}
                style={{
                    width: '100%',
                    flexDirection: 'row', borderRadius: 8, padding: 8, marginBottom: 8,
                    shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.surface,
                    shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }
                }}>

                {
                    Object.keys(dataReplace)?.length > 0 ?
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: "space-between", alignItems: 'center' }}>
                            <View style={{ flexDirection: 'column' }}>
                                {
                                    JSON.parse(dataReplace?.provinceList || '[]')?.length > 0 &&

                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon type="font-awesome-5" name={'plane-departure'} size={14} color={appcolor.dark} style={{ width: 30, padding: 4 }} />
                                        <ScrollView
                                            contentContainerStyle={{ padding: 5 }}
                                            style={{ alignSelf: 'center', width: '100%' }}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            nestedScrollEnabled
                                        >
                                            {JSON.parse(dataReplace?.provinceList || '[]').map((itemP, indexP) => {
                                                return (
                                                    <Text key={`iib_${indexP}`} style={{ fontSize: 14, fontWeight: '700', color: appcolor.dark }}>
                                                        {`${indexP > 0 ? ' -' : ''} ${itemP.provinceName} (${itemP.numberDay})`}
                                                    </Text>
                                                )
                                            })}
                                            <View style={{ width: deviceWidth / 3 }}></View>
                                        </ScrollView>
                                    </View>
                                }
                                {
                                    JSON.parse(dataReplace?.provinceList || '[]')?.length == 0 &&
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon type="font-awesome-5" name={'plane-departure'} size={14} color={appcolor.dark} style={{ width: 30, padding: 4 }} />
                                        <Text key={`itemTripName`} style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, paddingBottom: 4 }}>
                                            {`${dataReplace.provinceFromVN} - (${dataReplace.provinceToVN})`}
                                        </Text>
                                    </View>
                                }
                                {
                                    dataReplace?.fromDate &&
                                    <Text key={`itemTripDate`} style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, paddingBottom: 4 }}>
                                        {`Từ ${moment(dataReplace?.fromDate?.toString()).format('DD/MM/YY')} - Đến ${moment(dataReplace.toDate.toString()).format('DD/MM/YY')}`}
                                    </Text>
                                }
                            </View>
                            {
                                (itemTrips.confirmReplace === 1) &&
                                <LottieView
                                    style={{ width: 25, height: 25 }}
                                    source={require('../../../Themes/Images/check-mark-success.json')}
                                    autoPlay
                                    loop={false}
                                />
                            }
                        </View>
                        :
                        <Text key={`itemTripSelect`} style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>
                            chọn chuyến cần thay thế
                        </Text>
                }
            </TouchableOpacity>

            {dataView.isShowTrip == true && dataView.dataTrips?.map((it, idx) => {
                return (
                    <TouchableOpacity key={`CreateChangeTrip_${idx}`} onPress={() => handlePressTrip(it)} style={{
                        flexDirection: 'row', marginVertical: 4, marginHorizontal: 8, borderRadius: 8,
                        shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.surface,
                        borderWidth: tripSelect == it.idTrip ? 0.8 : 0,
                        borderColor: tripSelect == it.idTrip ? appcolor.success : appcolor.transparent,
                        shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }
                    }}>

                        {
                            JSON.parse(it?.provinceList || '[]')?.length > 0 &&
                            <View style={{ padding: 8, width: '100%' }}>
                                <ScrollView
                                    style={{ alignSelf: 'center', width: '100%' }}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    nestedScrollEnabled
                                >
                                    {JSON.parse(it?.provinceList || '[]').map((itemP, indexP) => {
                                        return (
                                            <Text key={`iib_${indexP}`} style={{ fontSize: 14, fontWeight: '700', color: appcolor.dark }}>
                                                {`${indexP > 0 ? ' -' : ''} ${itemP.provinceName} (${itemP.numberDay})`}
                                            </Text>
                                        )
                                    })}
                                </ScrollView>
                                <Text key={`itemTripDate_${idx}`} style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>
                                    {`Từ ${moment(it.fromDate?.toString()).format('DD/MM/YY')} - Đến ${moment(it.toDate?.toString()).format('DD/MM/YY')}`}
                                </Text>
                            </View>
                        }
                        {
                            JSON.parse(it?.provinceList || '[]')?.length == 0 &&
                            <View style={{ padding: 8, width: '100%' }}>
                                <Text key={`itemTripName_${idx}`} style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, paddingBottom: 2 }}>
                                    {`${it.provinceFromVN} - (${it.provinceToVN})`}
                                </Text>
                                <Text key={`itemTripDate_${idx}`} style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>
                                    {`Từ ${moment(it.fromDate?.toString()).format('DD/MM/YY')} - Đến ${moment(it.toDate?.toString()).format('DD/MM/YY')}`}
                                </Text>
                            </View>
                        }
                    </TouchableOpacity>
                )
            })}
            {
                dataView.isShowTrip == true &&
                <TouchableOpacity onPress={() => handleCloseListTrip()} style={{
                    width: '80%', padding: 8, justifyContent: 'center',
                    flexDirection: 'row', marginVertical: 4, marginHorizontal: 8, borderRadius: 8,
                    shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.info,
                    shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }
                }}>
                    <Text style={{ fontWeight: '700', textAlign: 'center', fontSize: 14, color: appcolor.white }}>Đóng</Text>
                </TouchableOpacity>
            }
        </View>
    )
}



