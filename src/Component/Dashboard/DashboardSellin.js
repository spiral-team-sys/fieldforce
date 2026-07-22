import React, { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { Divider } from "@rneui/base";
import { useSelector } from "react-redux";
import { DashboardDetailSellin } from "./DashboardDetailSellin";
import { Modal } from "react-native";

export const DashboardSellin = ({ info }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [viewDetail, setViewDetail] = useState(false)
    let viewAll = [];
    const data = info !== null ? JSON.parse(info.chartData) : [];
    if (Array.isArray(data) && data.length > 0) {
        viewAll.push(
            <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }} >
                <Text style={{ width: '20%', alignItems: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>

                </Text>
                <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Chỉ tiêu
                </Text>
                <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Đã đạt
                </Text>
                <Text style={{ width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Tỷ lệ (%)
                </Text>
            </View>
        )
        viewAll.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        data.forEach((item, index) => {
            viewAll.push(
                <View key={index.toString()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontSize: 15, color: appcolor.dark, paddingTop: 5, paddingBottom: 5 }}>{item.RTime}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.Target}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'center', }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.second, paddingTop: 5, paddingBottom: 5 }}>{item.Actual}</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.Percent}</Text>
                    </View>
                </View>
            )
            viewAll.push(<Divider key={"so" + index.toString()} style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        });
    } else {
        viewAll.push(<Text key="s1oi" style={{ width: '100%', textAlign: 'center', fontSize: 15, color: appcolor.danger }}>Chưa có dữ liệu doanh số</Text>)
    }
    return (
        <TouchableOpacity onPress={() => setViewDetail(e => !e)}>
            <View style={{ backgroundColor: appcolor.surface, padding: 8, borderRadius: 10, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon color={appcolor.info} name="chart-bar" size={23} />
                    <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}> {info !== null ? info.chartName : ''}</Text>
                </View>
                <View style={{ marginTop: 16 }}>
                    {viewAll}
                </View>
            </View >
            <Modal visible={viewDetail}>
                <DashboardDetailSellin title={info.chartName} dataSellIn={JSON.parse(info.detailData)} onClose={() => setViewDetail(false)} />
            </Modal>
        </TouchableOpacity >
    )
}