import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, processColor } from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';

const BAR_WIDTH = 0.28;
const BAR_SPACE = 0.04;
const GROUP_SPACE = 0.36;

const DashboardCategory = ({ title, data }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataCategory, setDataCategory] = useState([]);

  const LoadData = () => {
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      setDataCategory(Array.isArray(parsedData) ? parsedData : []);
    } catch (error) {
      setDataCategory([]);
    }
  };

  useEffect(() => {
    LoadData();
  }, [data]);

  const chartMeta = useMemo(() => {
    if (!dataCategory.length) {
      return {
        labels: [],
        kpiNames: [],
        title1: '',
        title2: '',
        avgPoint1: [],
        avgPoint2: [],
        rawPoint1: [],
        rawPoint2: [],
        chartData: {},
      };
    }

    const labels = dataCategory.map(item => String(item?.KPIName || ''));
    const kpiNames = dataCategory.map(item => String(item?.KPIName || ''));
    const title1 = String(dataCategory[0]?.Title1 || 'Tieu chi 1');
    const title2 = String(dataCategory[0]?.Title2 || 'Tieu chi 2');
    const avgPoint1 = dataCategory.map(item => Number(item?.AVGPoint1 ?? 0));
    const avgPoint2 = dataCategory.map(item => Number(item?.AVGPoint2 ?? 0));
    const rawPoint1 = dataCategory.map(item => item?.AVGPoint1);
    const rawPoint2 = dataCategory.map(item => item?.AVGPoint2);

    return {
      labels,
      kpiNames,
      title1,
      title2,
      avgPoint1,
      avgPoint2,
      rawPoint1,
      rawPoint2,
      chartData: {
        dataSets: [
          {
            values: avgPoint1,
            label: title1,
            config: {
              color: processColor(appcolor.primary),
              drawValues: true,
              valueTextColor: processColor(appcolor.dark),
              valueTextSize: 9,
              valueFormatter: '#.#',
              barBorderRadius: 6,
            },
          },
          {
            values: avgPoint2,
            label: title2,
            config: {
              color: processColor(appcolor.secondary),
              drawValues: true,
              valueTextColor: processColor(appcolor.dark),
              valueTextSize: 9,
              valueFormatter: '#.#',
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
  }, [appcolor.primary, appcolor.secondary, dataCategory]);

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: appcolor.light },
    card: {
      marginHorizontal: 12,
      marginTop: 12,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.surface,
    },
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
    legendText: { fontSize: 11, color: appcolor.blacklight },
    chart: { height: 250, backgroundColor: '#ffffff' },
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

  const titleCode = str => {
    const m = String(str || '').match(/^([A-Z]{1,4}\d{1,3})/i);
    return m ? m[1].toUpperCase() : String(str || '').split(/\s+/)[0];
  };

  const renderRefTable = () => (
    <View style={s.refTable}>
      <View style={s.refHeader}>
        <Text
          style={[
            s.refHeaderCell,
            { flex: 1, textAlign: 'left', paddingHorizontal: 6 },
          ]}
        >
          Ngành hàng
        </Text>
        <Text style={[s.refHeaderCell, { width: 52 }]}>
          {titleCode(chartMeta.title1)}
        </Text>
        <Text style={[s.refHeaderCell, { width: 52 }]}>
          {titleCode(chartMeta.title2)}
        </Text>
      </View>
      {chartMeta.kpiNames.map((name, i) => (
        <View key={i} style={[s.refRow, i % 2 === 1 && s.refRowAlt]}>
          <Text style={s.refCellName} numberOfLines={2}>
            {name}
          </Text>
          <Text style={s.refCellVal}>
            {chartMeta.avgPoint1[i]?.toFixed(1) ?? '—'}
          </Text>
          <Text style={s.refCellVal}>
            {chartMeta.avgPoint2[i]?.toFixed(1) ?? '—'}
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
            labelRotationAngle: -45,
            yOffset: 5,
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
        <Text style={s.legendText}>{chartMeta.title1 || 'TC1'}</Text>
      </View>
      <View style={s.legendItem}>
        <View style={[s.legendDot, { backgroundColor: appcolor.secondary }]} />
        <Text style={s.legendText}>{chartMeta.title2 || 'TC2'}</Text>
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <View style={s.card}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{title || 'Điểm theo category'}</Text>
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

export default DashboardCategory;
