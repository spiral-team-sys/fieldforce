import React, { } from "react";
import { Text, View, TouchableOpacity, ScrollView, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Divider } from "@rneui/base";
import { useSelector } from "react-redux";

export const DashboardSellOutCategory = ({ info, sendNavigate }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    let viewAll = [];
    const data = info !== null ? JSON.parse(info.chartData) : [];
    if (Array.isArray(data) && data.length > 0) {
        viewAll.push(
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
        viewAll.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        data.forEach((item, index) => {
            viewAll.push(
                <View key={index.toString()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: '40%' }}>
                        <Text style={{ fontSize: 13, color: appcolor.dark, paddingTop: 5, paddingBottom: 5 }}>{item.Unit}</Text>
                    </View>
                    <View style={{ width: '20%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.Target}</Text>
                    </View>
                    <View style={{ width: '20%', alignItems: 'center', }}>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: appcolor.second, paddingTop: 5, paddingBottom: 5 }}>{item.Actual}</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.Percent}</Text>
                    </View>
                </View>
            )
            viewAll.push(<Divider key={"so" + index.toString()} style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        });
    } else {
        viewAll.push(<Text key="s1oi" style={{ width: '100%', textAlign: 'center', fontSize: 15, color: appcolor.danger }}>Chưa có dữ liệu doanh số</Text>)
    }
    const onViewDetail = () => {
        sendNavigate.navigate('dashboardDetail', { detailDashboard: info, listMonth: info.listMonth, titlePage: 'Chi tiết' })
    }
    return (
        <View style={{ flex: 1, padding: 8 }}>
            <TouchableOpacity style={{ backgroundColor: appcolor.light, padding: 8, borderRadius: 10, marginBottom: 8 }} onPress={onViewDetail}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon color={appcolor.info} name="chart-bar" size={23} />
                    <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}> {info !== null ? info.chartName : ''}</Text>
                </View>
            </TouchableOpacity >
            <View style={{ flex: 1, marginTop: 5, zIndex: 1000, }}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} >
                    {viewAll}
                </ScrollView>
            </View>
        </View >

    )
} 