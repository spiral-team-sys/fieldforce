import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import Svg, { Circle, G } from 'react-native-svg';
import { formatNumber } from '../../../../../Core/Helper';

const SummaryDonutChart = ({
  appcolor,
  segments = [],
  centerLabel = 'Tổng',
}) => {
  const chartSize = 128;
  const strokeWidth = 18;
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = segments.reduce((sum, item) => sum + (item?.value || 0), 0);
  const showSegments =
    total > 0 ? segments.filter(item => (item?.value || 0) > 0) : [];

  const renderMetricValue = value => formatNumber(value || 0, ',') || '0';
  const getPercent = value => {
    if (!total || total <= 0) return 0;
    return Math.max(0, Math.round((value / total) * 100));
  };

  const styles = StyleSheet.create({
    chartWrap: {
      marginTop: 4,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    donutHolder: {
      width: 140,
      height: 140,
      alignItems: 'center',
      justifyContent: 'center',
    },
    donutCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 72,
      minHeight: 72,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: appcolor.surface,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
    },
    donutCenterValue: { fontSize: 18, fontWeight: '800', color: appcolor.dark },
    donutCenterLabel: {
      fontSize: 10,
      color: appcolor.placeholderText || appcolor.dark,
      fontWeight: '700',
      marginTop: 2,
    },
    chartLegend: { flex: 1, marginStart: 12 },
    legendRow: {
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: appcolor.light,
      borderRadius: 14,
    },
    legendInfo: { flexDirection: 'row', alignItems: 'center', maxWidth: '62%' },
    legendDot: { width: 10, height: 10, borderRadius: 10, marginEnd: 6 },
    legendLabel: { fontSize: 12, color: appcolor.dark, fontWeight: '700' },
    legendValue: { fontSize: 12, color: appcolor.dark, fontWeight: '700' },
    legendPercent: {
      fontSize: 11,
      color: appcolor.placeholderText || appcolor.dark,
      fontWeight: '600',
      marginStart: 6,
    },
  });

  let accDash = 0;

  return (
    <View style={styles.chartWrap}>
      <View style={styles.donutHolder}>
        <Svg width={chartSize} height={chartSize}>
          <G rotation={-90} origin={`${chartSize / 2}, ${chartSize / 2}`}>
            <Circle
              cx={chartSize / 2}
              cy={chartSize / 2}
              r={radius}
              stroke={appcolor.grayLight}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {showSegments.map(segment => {
              const value = segment?.value || 0;
              const dash = total > 0 ? (value / total) * circumference : 0;
              const item = (
                <Circle
                  key={segment.key}
                  cx={chartSize / 2}
                  cy={chartSize / 2}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${Math.max(
                    circumference - dash,
                    0,
                  )}`}
                  strokeDashoffset={-accDash}
                />
              );
              accDash += dash;
              return item;
            })}
          </G>
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterValue}>
            {renderMetricValue(total)}
          </Text>
          <Text style={styles.donutCenterLabel}>{centerLabel}</Text>
        </View>
      </View>

      <View style={styles.chartLegend}>
        {segments.map(segment => (
          <View key={`legend-${segment.key}`} style={styles.legendRow}>
            <View style={styles.legendInfo}>
              <View
                style={[styles.legendDot, { backgroundColor: segment.color }]}
              />
              <Text style={styles.legendLabel}>{segment.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.legendValue}>
                {renderMetricValue(segment.value)}
              </Text>
              <Text style={styles.legendPercent}>{`${getPercent(
                segment.value,
              )}%`}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SummaryDonutChart;
