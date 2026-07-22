import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, FlatList, Platform, StyleSheet } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { useSelector } from "react-redux";
import { DataSummary } from "../../../Controller/DashboardController";
import { deviceHeight, deviceWidth, isFloat } from "../../../Core/Utility";
import { IconAnimation } from "../../../Control/IconAnimation/IconAnimation";
import { SafeAreaView } from "react-native";
import FormGroup from "../../../Content/FormGroup";
import filter from 'lodash.filter';
import { Modal } from "react-native";
import { formatNumber } from "../../../Core/Helper";

export const DashBoardSellStore = ({ navigation, typeDashboard, viewHeight, bgViewItem = null }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataDashboard, setDataDashboard] = useState({ dashboardMain: [] })
    const [isLoading, setLoading] = useState(false)
    const [configSheet, setConfigSheet] = useState({ itemSelect: {}, dataItem: [], visible: false })
    const [_, setMutate] = useState(false)
    //
    const LoadData = () => {
        setLoading(true)
        DataSummary(typeDashboard, (mData) => {
            if (mData.length > 0) {
                dataDashboard.dashboardMain = mData[0]
                setMutate(e => !e)
            }
        });
        setLoading(false)
    }
    const onViewDetail = () => {
        navigation.navigate(dataDashboard.dashboardMain?.pageName || 'dashboardDetail')
    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return

        LoadData()
        return () => { isMounted = false }
    }, [])

    // View 
    const styles = StyleSheet.create({
        viewMain: { flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', width: '100%' },
        titleHeadName: { width: '18%', fontSize: 12, color: appcolor.dark, fontWeight: '500', paddingBottom: 8 },
        titleHeadValue: { width: '25%', fontSize: 12, textAlign: 'center', color: appcolor.dark, paddingBottom: 8, fontStyle: 'italic' },
        viewHeadName: { width: '18%' },
        viewHeadValue: { width: '25%', alignItems: 'center', marginEnd: 5 },
        itemView: { width: '100%', alignItems: 'center', backgroundColor: (bgViewItem || appcolor.surface), borderRadius: 8, overflow: 'hidden' },
        valueView: { fontWeight: '700', fontSize: 11, color: appcolor.dark, paddingVertical: 6 },
        viewPercent: { height: '100%', backgroundColor: appcolor.success, position: 'absolute', top: 0, left: 0, borderRadius: 8, opacity: 0.8 }
    })
    if (isLoading) {
        return <View></View>
    } else {
        return (
            <TouchableOpacity onPress={onViewDetail}
                style={{
                    width: (viewHeight != undefined && viewHeight > 0 ? deviceWidth - 16 : '100%'), backgroundColor: appcolor.light,
                    height: (viewHeight != undefined && viewHeight > 0 ? viewHeight - 40 : ((deviceHeight / 2) * 0.7) - 60)
                }}>

                <View style={{ flexDirection: 'row', alignItems: "center", width: '100%', justifyContent: "space-between", padding: 5, paddingBottom: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="chart-bar" type="font-awesome-5" size={18} color={appcolor.blacklight} style={{ padding: 5 }} />
                        <Text style={{
                            color: appcolor.dark, fontSize: 14, marginRight: 5, fontWeight: '600'
                        }}>{dataDashboard.dashboardMain.title ? dataDashboard.dashboardMain?.title : ''}</Text>
                    </View>
                    <TouchableOpacity onPress={isLoading ? null : LoadData}
                        style={{
                            borderRadius: 30, borderWidth: 0.3, borderColor: appcolor.dark, padding: 2,
                            backgroundColor: appcolor.surface, overflow: 'hidden'
                        }}>
                        <IconAnimation isLoop={isLoading} sourceIcon={require('../../../Themes/lotties/sync_load.json')} />
                    </TouchableOpacity>
                </View>
                <View style={{ width: '100%', height: '100%', paddingTop: 8 }}>
                    <View style={{ flexGrow: 1 }}>
                        <View style={{
                            marginHorizontal: 20,
                            flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 4, borderRadius: 12,
                            backgroundColor: appcolor.light, borderRadius: 10, elevation: 3,
                            shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 2,

                        }}>
                            <Text style={{ fontWeight: '700', fontSize: 16, color: appcolor.dark }}>{dataDashboard.dashboardMain.title1 || 'Tổng cửa hàng'}</Text>
                            <Text style={{ fontWeight: '700', fontSize: 28, color: appcolor.primary, paddingHorizontal: 8 }}>{dataDashboard.dashboardMain.totalStore || '0'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 16 }}>
                            <View style={{ borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderRadius: 8, flex: 1, marginRight: 2 }}>
                                <View style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: appcolor.dark, borderRadius: 10, opacity: 0.7
                                }}></View>
                                <Text style={{ fontWeight: '700', fontSize: 15, color: appcolor.white, paddingTop: 8 }}>{dataDashboard.dashboardMain.title2 || 'Model Trưng bày'}</Text>
                                <Text style={{ fontWeight: '700', fontSize: 24, color: appcolor.success, paddingHorizontal: 8, textShadowColor: appcolor.dark, textShadowOffset: { width: 0, height: 0.4 }, textShadowRadius: 3 }}>{dataDashboard.dashboardMain.totalModel || '0'}</Text>
                            </View>
                            <View style={{ borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderRadius: 8, flex: 1, marginLeft: 2 }}>
                                <View style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: appcolor.dark, borderRadius: 10, opacity: 0.7
                                }}></View>
                                <Text style={{ fontWeight: '700', fontSize: 15, color: appcolor.white, paddingTop: 8 }}>{dataDashboard.dashboardMain.title3 || 'Model Chưa bán'}</Text>
                                <Text style={{ fontWeight: '700', fontSize: 24, color: appcolor.warning, paddingHorizontal: 8, textShadowColor: appcolor.dark, textShadowOffset: { width: 0, height: 0.4 }, textShadowRadius: 3 }}>{(dataDashboard.dashboardMain.totalModel - dataDashboard.dashboardMain.totalSell) || '0'}</Text>
                            </View>
                        </View>
                    </View>
                </View >
            </TouchableOpacity >
        )
    }
}




