import React from "react";
import { Text, View } from "react-native";

const SummaryProgramDeliveryMetrics = ({ styles, actualTotal, targetTotal, progressLabel, avgPassPercent, formatNumeric }) => {
    return (
        <>
            <View style={styles.metricGrid}>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Actual Delivery</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{formatNumeric(actualTotal)}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Target Delivery</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{formatNumeric(targetTotal)}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Delivery %</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{progressLabel}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Delivery Pass %</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{avgPassPercent}</Text>
                </View>
            </View>
            <Text style={styles.dividerText} numberOfLines={1}>Tong hop rieng cho DELIVERY</Text>
        </>
    )
}

export default SummaryProgramDeliveryMetrics;
