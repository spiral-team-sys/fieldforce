import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, processColor } from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';

const BAR_WIDTH = 0.28;
const BAR_SPACE = 0.04;
const GROUP_SPACE = 0.36;

const DashboardArea = ({ title, data }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataArea, setDataArea] = useState([]);

  const LoadData = () => {
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      setDataArea(Array.isArray(parsedData) ? parsedData : []);
    } catch (error) {
      setDataArea([]);
    }
  };

  useEffect(() => {
    LoadData();
  }, [data]);

  const chartMeta = useMemo(() => {
    if (!dataArea.length) {
      return {
        labels: [],
        fullNames: [],
        avgPoints: [],
        avgAreaPoints: [],
        chartData: {},
      };
    }
    const labels = dataArea.map((item, index) => {
      const m = String(item?.GroupName || '').match(/TC(\d+)/);
      return m ? m[0] : `G${index + 1}`;
    });
    const fullNames = dataArea.map(item => String(item?.GroupName || ''));
    const avgPoints = dataArea.map(item => Number(item?.AVGPoint ?? 0));
    const avgAreaPoints = dataArea.map(item => Number(item?.AVGAreaPoint ?? 0));
    const rawPoints = dataArea.map(item => item?.AVGPoint);

    console.log(avgPoints);

    return {
      labels,
      fullNames,
      avgPoints,
      avgAreaPoints,
      rawPoints,
      chartData: {
        dataSets: [
          {
            values: avgPoints,
            label: 'Cá nhân',
            config: {
              color: processColor(appcolor.primary),
              drawValues: true,
              valueTextColor: processColor(appcolor.dark),
              valueTextSize: 9,
              valueFormatter: '#.#',
              highlightColor: processColor(appcolor.primary),
              barBorderRadius: 6,
            },
          },
          {
            values: avgAreaPoints,
            label: 'Khu vực',
            config: {
              color: processColor(appcolor.secondary),
              drawValues: true,
              valueTextColor: processColor(appcolor.dark),
              valueTextSize: 9,
              valueFormatter: '#.#',
              highlightColor: processColor(appcolor.dark),
              barBorderRadius: 6,
            },
          },
        ],
        config: {
          barWidth: BAR_WIDTH,
          group: { fromX: 0, groupSpace: GROUP_SPACE, barSpace: BAR_SPACE },
        },
      },
    };
  }, [appcolor.primary, appcolor.secondary, dataArea]);

  // ── styles ──────────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: appcolor.light },
    card: {
      marginHorizontal: 12,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.surface,
      overflow: 'hidden',
    },
    // header
    sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 14,
      marginBottom: 6,
    },
    legendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
    legendText: { fontSize: 11, color: appcolor.blacklight, maxWidth: 120 },
    // chart
    chart: { height: 200, backgroundColor: '#ffffff' },
    // empty
    emptyWrap: { paddingVertical: 32, alignItems: 'center' },
    emptyText: { fontSize: 13, color: '#9ca3af' },
    // ref table
    refTable: {
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: appcolor.border || '#e2e8f0',
      overflow: 'hidden',
    },
    refHeader: {
      flexDirection: 'row',
      backgroundColor: appcolor.primary,
      paddingVertical: 7,
      paddingHorizontal: 8,
    },
    refHeaderCell: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
    },
    refRow: {
      flexDirection: 'row',
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: appcolor.border || '#f1f5f9',
      alignItems: 'center',
    },
    refRowAlt: { backgroundColor: appcolor.lightgray || '#f8fafc' },
    refCellLabel: {
      width: 36,
      fontSize: 11,
      fontWeight: '700',
      color: appcolor.primary,
      textAlign: 'center',
    },
    refCellName: {
      flex: 1,
      fontSize: 11,
      color: appcolor.dark || '#374151',
      paddingHorizontal: 6,
      fontWeight: fontWeightBold,
    },
    refCellVal: {
      width: 52,
      fontSize: 11,
      color: appcolor.dark || '#374151',
      textAlign: 'center',
    },
  });

  // ── render helpers ───────────────────────────────────────────────────────
  const renderRefTable = () => (
    <View style={s.refTable}>
      <View style={s.refHeader}>
        <Text
          style={[
            s.refHeaderCell,
            { flex: 1, textAlign: 'left', paddingHorizontal: 6 },
          ]}
        >
          Tiêu chí
        </Text>
        <Text style={[s.refHeaderCell, { width: 52 }]}>Cá nhân</Text>
        <Text style={[s.refHeaderCell, { width: 52 }]}>Khu vực</Text>
      </View>
      {chartMeta.labels.map((key, i) => (
        <View key={key} style={[s.refRow, i % 2 === 1 && s.refRowAlt]}>
          <Text style={s.refCellName} numberOfLines={2}>
            {chartMeta.fullNames[i]}
          </Text>
          <Text style={s.refCellVal}>
            {chartMeta.avgPoints[i]?.toFixed(1) ?? '—'}
          </Text>
          <Text style={s.refCellVal}>
            {chartMeta.avgAreaPoints[i]?.toFixed(1) ?? '—'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderChart = () => {
    const chartWidth = Math.max(580, chartMeta.labels.length * 38);

    return (
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        <BarChart
          style={[s.chart, { width: chartWidth }]}
          data={chartMeta.chartData}
          dragEnabled={false}
          scaleXEnabled={false}
          scaleYEnabled={false}
          pinchZoom={false}
          doubleTapToZoomEnabled={false}
          xAxis={{
            valueFormatter: chartMeta.labels,
            granularityEnabled: true,
            granularity: 1,
            labelCount: chartMeta.labels.length,
            axisMinimum: 0,
            axisMaximum: chartMeta.labels.length,
            centerAxisLabels: true,
            position: 'BOTTOM',
            textSize: 9,
            textColor: processColor(appcolor.dark),
            yOffset: 4,
            drawGridLines: true,
            avoidFirstLastClipping: true,
            drawAxisLine: true,
          }}
          yAxis={{
            left: {
              axisMinimum: 0,
              axisMaximum: 5,
              labelCount: 6,
              granularityEnabled: true,
              granularity: 1,
              textSize: 9,
              textColor: processColor(appcolor.dark),
              drawGridLines: false,
              drawAxisLine: true,
            },
            right: { enabled: false },
          }}
          legend={{ enabled: false }}
          drawValueAboveBar={true}
          drawBarShadow={false}
          chartDescription={{ text: '' }}
          animation={{ durationY: 700, easingY: 'EaseOutBack' }}
          fitBars={false}
          extraOffsets={{ left: 0, top: 24, right: 0, bottom: 0 }}
        />
      </ScrollView>
    );
  };

  const renderLegend = () => (
    <View style={s.legendRow}>
      <View style={s.legendItem}>
        <View style={[s.legendDot, { backgroundColor: appcolor.primary }]} />
        <Text style={s.legendText}>Cá nhân</Text>
      </View>
      <View style={s.legendItem}>
        <View style={[s.legendDot, { backgroundColor: appcolor.secondary }]} />
        <Text style={s.legendText}>Khu vực</Text>
      </View>
    </View>
  );

  // ── view ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <View style={s.card}>
        {/* chart section */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{title || 'Đánh giá tiêu chí'}</Text>
        </View>

        {chartMeta.labels.length > 0 && (
          <>
            {renderLegend()}
            {renderChart()}
            {renderRefTable()}
          </>
        )}
      </View>
    </View>
  );
};

export default DashboardArea;
