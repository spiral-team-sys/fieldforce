import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@rneui/base";
import LinearGradient from "react-native-linear-gradient";
import { formatNumber } from "../../../../../Core/Helper";
import SummaryDonutChart from "./SummaryDonutChart";

const SummaryModuleCard = ({ appcolor, title, subtitle, centerLabel, accentColors = [], segments = [], rows = [] }) => {
    const renderMetricValue = (value) => formatNumber(value || 0, ',') || '0'
    const headerColors = accentColors.length ? accentColors : [appcolor.primary, appcolor.info || '#1F6FEB']

    const styles = StyleSheet.create({
        card: {
            backgroundColor: appcolor.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: appcolor.grayLight,
            marginVertical: 7,
            overflow: 'hidden',
        },
        header: {
            paddingHorizontal: 16,
            paddingVertical: 14,
        },
        cardTitle: { fontSize: 16, fontWeight: '800', color: appcolor.light },
        cardSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 4, lineHeight: 16 },
        body: { padding: 14 },
        line: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 14,
            backgroundColor: appcolor.light,
        },
        lineLabel: { fontSize: 12, color: appcolor.dark, fontWeight: '600' },
        lineValue: { fontSize: 13, color: appcolor.dark, fontWeight: '800' },
        divider: { height: 1, backgroundColor: appcolor.grayLight, marginVertical: 8 },
        rowGroup: { marginTop: 6 }
    })

    return (
        <View style={styles.card}>
            <LinearGradient
                colors={headerColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.cardTitle}>{title}</Text>
                {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
            </LinearGradient>

            <View style={styles.body}>
                <SummaryDonutChart
                    appcolor={appcolor}
                    segments={segments}
                    centerLabel={centerLabel}
                />
                <View style={styles.rowGroup}>
                    {rows.map((row, index) => (
                        <View key={`row-${title}-${index}`}>
                            {row?.isDivider ? <View style={styles.divider} /> : null}
                            <View style={styles.line}>
                                <Text style={styles.lineLabel}>{row.label}</Text>
                                <Text style={[styles.lineValue, row.valueStyle]}>{renderMetricValue(row.value)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}

export default SummaryModuleCard;
