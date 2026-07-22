import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Divider } from "@rneui/base";
import { useSelector } from "react-redux";
import { DataSummary } from "../../../Controller/DashboardController";
import { ColorRand } from "../../../Core/Helper";
import { deviceWidth } from "../../../Core/Utility";
import { IconAnimation } from "../../../Control/IconAnimation/IconAnimation";

export const DashboardSellOutByCateToshiba = ({ navigation, typeDashboard, viewHeight }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataSellOut, setSelloutByCate] = useState([])
    const [isLoading, setLoading] = useState(true)

    const LoadData = async () => {
        await setLoading(true)
        await DataSummary(typeDashboard, async (mData) => {
            await setSelloutByCate([])
            if (mData.length > 0) {
                await setSelloutByCate(mData)
            }
        });
        await setLoading(false)
    }


    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        LoadData()
        return () => { isMounted = false }
    }, [])

    const UIByCate = () => {
        var listCate = [];
        listCate.push(
            <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }} >
                <Text style={{ fontSize: 13, width: '40%', alignItems: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>

                </Text>
                <Text style={{ fontSize: 13, width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Chỉ tiêu
                </Text>
                <Text style={{ fontSize: 13, width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Đã đạt
                </Text>
                <Text style={{ fontSize: 13, width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Tỷ lệ (%)
                </Text>
            </View>
        )
        listCate.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        dataSellOut?.forEach((item, index) => {
            if (index == 0)
                return null
            else {
                listCate.push(
                    <View key={index.toString()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: '40%' }}>
                            <Text style={{ fontSize: 13, color: appcolor.dark, paddingTop: 4, paddingBottom: 4 }}>{item.category}</Text>
                        </View>
                        <View style={{ width: '20%', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '700', fontSize: 13, color: appcolor.tomato, paddingTop: 4, paddingBottom: 4 }}>{item.amountStr}</Text>
                        </View>
                        <View style={{ width: '20%', alignItems: 'center', }}>
                            <Text style={{ fontWeight: '700', fontSize: 13, color: appcolor.second, paddingTop: 4, paddingBottom: 4 }}>{item.actualAmountStr}</Text>
                        </View>
                        <View style={{ width: '20%' }}>
                            <Text style={{ fontWeight: '700', fontSize: 13, color: appcolor.secondary, textAlign: 'center', paddingTop: 4, paddingBottom: 4 }}>{item.actualPercent}</Text>
                        </View>
                    </View>
                )
                listCate.push(<Divider key={"so" + index.toString()} style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
            }
        })
        return listCate;
    }

    const onViewDetail = () => {
        navigation.navigate('dashboardDetail')
    }
    if (isLoading) {
        return <View></View>
    } else {
        return (
            <TouchableOpacity onPress={onViewDetail} style={{ maxHeight: viewHeight - 40, width: deviceWidth - 16, padding: 12, }} >
                <View style={{ flexDirection: 'row', alignItems: "center", width: '100%', justifyContent: "space-between" }}>
                    <Text style={{ color: appcolor.dark, fontSize: 14, marginRight: 5, fontWeight: '600' }}>{dataSellOut?.length > 0 ? dataSellOut[0]?.title : ''}</Text>
                    <TouchableOpacity onPress={isLoading ? null : LoadData} style={{ borderRadius: 30, borderWidth: 0.3, borderColor: appcolor.dark, padding: 2, backgroundColor: appcolor.surface, overflow: 'hidden' }}>
                        <IconAnimation isLoop={isLoading} sourceIcon={require('../../../Themes/lotties/sync_load.json')} />
                    </TouchableOpacity>
                </View>
                <View style={{
                    width: '100%', height: '100%', alignItems: 'center', padding: 4, flexDirection: 'row',
                }}>
                    <View style={{ flexGrow: 1 }}>
                        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                            {UIByCate()}
                        </ScrollView>
                    </View>
                </View >
            </TouchableOpacity >
        )
    }
}




