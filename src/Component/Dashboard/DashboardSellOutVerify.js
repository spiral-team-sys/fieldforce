import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { appcolor } from "../../Themes/AppColor";
import { Divider } from "@rneui/base";
import { useSelector } from "react-redux";

export const DashboardSellOutVerify = ({ sendNavigate, info }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    let viewAll = [];
    const data = info !== null ? JSON.parse(info.chartData) : [];
    if (Array.isArray(data) && data.length > 0) {
        viewAll.push(
            <View key="e92" style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }} >
                <Text style={{ width: '33%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Target
                </Text>
                <Text style={{ width: '33%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Submitted
                </Text>
                <Text style={{ width: '33%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    %
                </Text>
            </View>
        )
        viewAll.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        data.forEach((item, index) => {
            viewAll.push(
                <View key={index.toString()} style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: '33%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 25, color: appcolor.yellow, paddingTop: 5, paddingBottom: 5 }}>{item.Target}</Text>
                    </View>
                    <View style={{ width: '33%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 25, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.Actual}</Text>
                    </View>
                    <View style={{ width: '33%' }}>
                        <Text style={{ fontWeight: '700', fontSize: 25, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.Percent}</Text>
                    </View>
                </View>
            )
        });
    } else {
        viewAll.push(<Text key="s1oi" style={{ width: '100%', textAlign: 'center', fontSize: 15, color: appcolor.danger }}>Chưa có dữ liệu doanh số</Text>)
    }
    const onViewDetail = () => {
        sendNavigate.navigate('dashboardDetail', { detailDashboard: info, listMonth: info.listMonth, titlePage: 'Chi tiết' })
    }

    return (
        <TouchableOpacity onPress={onViewDetail}>
            <View style={{ backgroundColor: appcolor.light, padding: 8, borderRadius: 15, height: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon color={appcolor.info} name="chart-bar" size={23} />
                    <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}> {info !== null ? info.chartName : ''}</Text>
                </View>
                <View style={{ marginTop: 16 }}>
                    {viewAll}
                </View>
            </View >
        </TouchableOpacity>
    )
} 