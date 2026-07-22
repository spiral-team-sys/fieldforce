import React, { useState, useEffect, Fragment } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { useSelector } from 'react-redux';
import { deviceHeight, scaleSize } from '../../Themes/AppsStyle';
import { Avatar, Icon } from '@rneui/themed';
import { GetEmployeeDetails } from '../../Controller/EmployeeController';
import { TimingView } from '../../Control/TimingView';
import { EmployeeSOTrend } from './EmployeeSOTrend';
import { LoadingView } from '../../Control/ItemLoading/index';
import { URLDEFAULT } from '../../Core/URLs';

export const ProfileDetail = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [loading, setLoading] = useState(false);
    const { employee } = route.params;
    const [planInfo, setPlan] = useState({});
    const [sellInfo, setSell] = useState({});
    const onLoad = async () => {
        await setLoading(true)
        const result = await GetEmployeeDetails(employee);
        if (result.statusId === 200) {
            const _temp = result.data;
            await setSell(_temp[3] || {})
            await setPlan(_temp[4] || {})
        }
        await setLoading(false)
    }
    useEffect(() => {
        onLoad()
        return () => loading;
    }, [])

    const styles = StyleSheet.create({
        root: { flex: 1, backgroundColor: appcolor.light },
        headerBg: { height: deviceHeight / 7, backgroundColor: appcolor.primary },
        headerContainer: { position: 'absolute', width: '100%', marginTop: deviceHeight / 15, zIndex: 100, alignItems: 'center' },
        closeBtn: { zIndex: 200, position: 'absolute', left: 12, top: 0, backgroundColor: appcolor.light, borderRadius: 100 },
        avatarWrap: { justifyContent: 'center', alignItems: 'center' },
        avatarStyle: { backgroundColor: appcolor.light, shadowColor: appcolor.grey, shadowRadius: 10, shadowOpacity: 0.92, shadowOffset: { width: 0, height: 10 } },
        fullName: { color: appcolor.dark, fontSize: scaleSize(26) },
        scroll: { backgroundColor: appcolor.surface },
        planGroupName: { marginLeft: 12, padding: 7, fontSize: scaleSize(18), color: appcolor.dark, fontWeight: '600' },
        planGroupWrap: { padding: 7, margin: 7, backgroundColor: appcolor.light, borderRadius: 12 },
        planRow: { flexDirection: 'row' },
        planLeft: { alignItems: 'center' },
        planCircle: { justifyContent: 'center', alignItems: 'center', width: 45, height: 45, borderRadius: 120, },
        planLine: { backgroundColor: appcolor.dark, height: 26, width: 7 },
        planRight: { marginLeft: 12, justifyContent: 'space-around', top: 0, backgroundColor: appcolor.light, padding: 7 },
        planShop: { color: appcolor.dark },
        planShift: { color: appcolor.primary, fontWeight: 'bold', fontSize: scaleSize(18) },
        sellWrap: { marginTop: 80, padding: 7, width: '100%' },
        sellTitle: { marginLeft: 12, padding: 7, fontSize: scaleSize(18), color: appcolor.dark, fontWeight: '600' },
        sellRow: { paddingTop: 30, paddingBottom: 30, borderRadius: 12, flexDirection: 'row', backgroundColor: appcolor.light, justifyContent: 'center' },
        sellCol: { flexGrow: 1, alignItems: 'center' },
        sellColQ: { padding: 3, width: 40, alignContent: 'center', alignItems: 'center', borderRadius: 30 },
        sellColA: { padding: 3, borderRadius: 30, width: 40 },
        sellValue: { textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(26) },
        sellLabel: { textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) },
        bottomSpace: { paddingBottom: 100 }
    });

    const PlanUI = (item) => {
        const detail = JSON.parse(item.detail || "[]");
        return (
            <Fragment>
                <Text style={styles.planGroupName}>{item.groupNameVN}</Text>
                <View style={styles.planGroupWrap}>
                    {
                        detail.map((i, index) => {
                            return (
                                <View key={"lpl-" + index} style={styles.planRow}>
                                    <View style={styles.planLeft}>
                                        <View style={[styles.planCircle, { backgroundColor: index === detail.length - 1 ? appcolor.danger : appcolor.surface }]}>
                                            <Text style={{ color: appcolor.dark, fontSize: scaleSize(16) }}>{i.Day}</Text>
                                            <Text style={{ color: appcolor.dark, fontSize: scaleSize(12) }}>{i.Month}</Text>
                                        </View>
                                        <View style={[{ display: index === detail.length - 1 ? 'none' : 'flex' }, styles.planLine]} />
                                    </View>
                                    <View style={styles.planRight}>
                                        <Text numberOfLines={2} style={styles.planShop}>CH: {i.ShopName}</Text>
                                        <Text style={styles.planShift}>Ca làm việc: {i.ShiftType}</Text>
                                        <View style={[{ display: index === detail.length - 1 ? 'none' : 'flex' }, { backgroundColor: appcolor.surface, height: 7, width: '110%', marginLeft: -7 }]} />
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>
            </Fragment>
        )
    }
    const SellUI = (item) => {
        const detail = JSON.parse(item.detail || '[]');
        const current = Array.isArray(detail) ? detail[0] : {};
        return (
            <View style={styles.sellWrap}>
                <TimingView />
                <Text style={styles.sellTitle}>Doanh số tháng {current.Month},{current.Year}</Text>
                <View style={styles.sellRow}>
                    <View style={styles.sellCol}>
                        <View style={styles.sellColQ}>
                            <Icon name="shopping-cart" color={appcolor.primary} size={24} />
                        </View>
                        <Text style={styles.sellValue}>{current.Quantity || "-"}</Text>
                        <Text style={styles.sellLabel}>Số lượng</Text>
                    </View>
                    <View style={styles.sellCol}>
                        <View style={styles.sellColA}>
                            <Icon name="money" color={appcolor.primary} size={24} />
                        </View>
                        <Text style={styles.sellValue}>{current.Amount ? (current.Amount / 1000000).toFixed(2) : "-"} M</Text>
                        <Text style={styles.sellLabel}>Thành tiền</Text>
                    </View>
                    <View style={styles.sellCol}>
                        <View style={styles.sellColQ}>
                            <Icon name="target" color={appcolor.primary} size={24} type='feather' />
                        </View>
                        <Text style={styles.sellValue}>{current.Target || '-'}</Text>
                        <Text style={styles.sellLabel}>{current.TargetName}</Text>
                    </View>
                    <View style={styles.sellCol}>
                        <View style={styles.sellColQ}>
                            <Icon name="percent" color={appcolor.primary} size={24} />
                        </View>
                        <Text style={styles.sellValue}>{current.Percent || 0} %</Text>
                        <Text style={styles.sellLabel}>Đã Đạt</Text>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.root}>
            <View style={styles.headerBg}></View>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Icon name="chevron-left" color={appcolor.dark} size={20} />
                </TouchableOpacity>
                <View style={styles.avatarWrap}>
                    <Avatar
                        size={110}
                        rounded
                        source={{ uri: URLDEFAULT + employee.photo }}
                        title={employee.fisrtName.substring(0, 1)}
                        containerStyle={styles.avatarStyle}
                    />
                    <Text style={styles.fullName}>{employee.fullName}</Text>
                </View>
            </View>
            {loading ? <LoadingView styles={{ marginTop: 100 }} isLoading={loading} title="Cập nhật dữ liệu" /> :
                <ScrollView style={styles.scroll}>
                    {sellInfo.detail && SellUI(sellInfo)}
                    {sellInfo.detail && <EmployeeSOTrend data={sellInfo} />}
                    {planInfo.detail && PlanUI(planInfo)}
                    <View style={styles.bottomSpace} />
                </ScrollView>}
        </View>
    )
}