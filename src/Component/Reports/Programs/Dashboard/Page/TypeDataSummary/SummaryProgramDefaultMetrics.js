import React from "react";
import { Text, View } from "react-native";

const SummaryProgramDefaultMetrics = ({ styles, actualTotal, targetTotal, progressLabel, avgPassPercent, formatNumeric }) => {
    return (
        <>
            <View style={styles.metricGrid}>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Actual Total</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{formatNumeric(actualTotal)}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Target Total</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{formatNumeric(targetTotal)}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Achieve %</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{progressLabel}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Avg Pass %</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>{avgPassPercent}</Text>
                </View>
            </View>
            <Text style={styles.dividerText} numberOfLines={1}>Tong hop theo type hien tai</Text>
        </>
    )
}

export default SummaryProgramDefaultMetrics;
