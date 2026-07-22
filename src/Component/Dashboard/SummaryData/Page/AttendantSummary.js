import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { Text } from "@rneui/base";
import { PieChartView } from "../Controls/PieChartView";
import { deviceHeight } from "../../../../Core/Utility";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

export const AttendantSummary = ({ summaryData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataAttendant, setDataAttendant] = useState([])

    const LoadData = async () => {
        await setDataAttendant(summaryData)
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [summaryData])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%' },
        itemMain: { width: '100%' },
        contentMain: { width: '100%', minHeight: 100, backgroundColor: appcolor.light, borderRadius: 8, shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }, shadowOpacity: 0.5, elevation: 3, overflow: 'hidden' },
        titleSummary: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark, fontStyle: 'italic', padding: 8 },
        pagerView: { width: '100%', minHeight: 100 },
        viewDashboard: { width: '100%', flexDirection: 'row', justifyContent: 'center' },
        itemDashboard: { width: '33%', height: deviceHeight / 4.5, alignItems: 'center' },
        titlePageView: { fontSize: 14, color: appcolor.dark, paddingTop: 16, fontWeight: fontWeightBold },
        subTitlePageView: { fontSize: 13, color: appcolor.placeholderText, fontWeight: '600' },
        viewDescription: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8 },
        dotView: { width: 12, height: 12, backgroundColor: appcolor.success, borderRadius: 8, margin: 5 },
        titleDescription: { marginEnd: 8, color: appcolor.dark, fontSize: 12 }
    })
    const renderItem = (item, index) => {
        const dataSummary = JSON.parse(item.JsonData || '[]')
        return (
            <View key={`asi_${index}`} style={styles.itemMain}>
                <Text style={styles.titleSummary}>{item.DashboardName}</Text>
                <View style={styles.contentMain}>
                    <View style={styles.viewDashboard}>
                        {dataSummary !== null && dataSummary.length > 0 && dataSummary.map((it, idx) => {
                            return (
                                <View key={`item.${idx}`} style={styles.itemDashboard}>
                                    <Text style={styles.titlePageView}>{it.PageName}</Text>
                                    <Text style={styles.subTitlePageView}>{`${it.ActualValue}/${it.TargetValue}`}</Text>
                                    <PieChartView itemMain={it} />
                                </View>
                            )
                        })}
                    </View>
                    <View style={styles.viewDescription}>
                        <View style={styles.dotView} />
                        <Text style={styles.titleDescription}>Chấm công</Text>
                        <View style={{ ...styles.dotView, backgroundColor: appcolor.red }} />
                        <Text style={styles.titleDescription}>Lịch làm việc</Text>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            {dataAttendant !== null && dataAttendant.length > 0 && dataAttendant.map((item, index) => {
                return renderItem(item, index)
            })}
        </View>
    )
}