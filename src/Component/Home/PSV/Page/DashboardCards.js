import React from 'react';
import {
  processColor,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-charts-wrapper';
import { Icon, Text } from '@rneui/themed';
import _ from 'lodash';
import { PercentView } from '../../../../Control/PercentView';
import { formatNumber } from '../../../../Core/Helper';
import { deviceWidth, scaleSize } from '../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const EmptyDashboard = ({ appcolor }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <SpiralIcon
      name="bar-chart-2"
      type="feather"
      size={26}
      color={appcolor.grayLight}
    />
    <Text
      style={{ fontSize: 12, color: appcolor.placeholderText, marginTop: 8 }}
    >
      Chưa có dữ liệu tổng quan
    </Text>
  </View>
);

export const AttendanceCard = ({ appcolor, data = [], navigation }) => {
  if (!data.length) return <EmptyDashboard appcolor={appcolor} />;
  const item = data[0];
  const targetValue = Number(item.tValue || 0);
  const actualValue = Number(item.aValue || 0);
  const percent =
    targetValue > 0 ? Math.min((actualValue / targetValue) * 100, 100) : 0;
  const statusColor =
    percent < 60
      ? appcolor.danger
      : percent < 80
        ? appcolor.warning
        : appcolor.success;
  const stylesAttendance = StyleSheet.create({
    container: { flex: 1, padding: 14, backgroundColor: appcolor.light },
    header: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.primary,
    },
    titleWrap: { flex: 1, marginHorizontal: 10 },
    title: { fontSize: 14, fontWeight: '800', color: appcolor.dark },
    subtitle: { fontSize: 11, color: appcolor.placeholderText, marginTop: 2 },
    percentBadge: {
      minWidth: 54,
      borderRadius: 16,
      paddingHorizontal: 9,
      paddingVertical: 6,
      alignItems: 'center',
      borderWidth: 1,
      backgroundColor: appcolor.surface,
    },
    percentText: { fontSize: 13, fontWeight: '800' },
    metrics: { flexDirection: 'row', marginTop: 14 },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingHorizontal: 2,
    },
    progressLabel: { fontSize: 12, fontWeight: '700', color: appcolor.dark },
    progressValue: { fontSize: 11, fontWeight: '700' },
    progressBox: { alignItems: 'center', marginTop: 2 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
    },
    footerText: {
      fontSize: 11,
      fontWeight: '600',
      color: appcolor.primary,
      marginRight: 2,
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={stylesAttendance.container}
      onPress={() => navigation.navigate('attendanthistory')}
    >
      <View style={stylesAttendance.header}>
        <View style={stylesAttendance.iconBox}>
          <SpiralIcon
            name="user-check"
            type="feather"
            size={19}
            color={appcolor.white}
          />
        </View>
        <View style={stylesAttendance.titleWrap}>
          <Text numberOfLines={1} style={stylesAttendance.title}>
            {item.dashboardName || 'Chấm công'}
          </Text>
          <Text numberOfLines={1} style={stylesAttendance.subtitle}>
            Theo dõi tiến độ chấm công trong ngày
          </Text>
        </View>
        <View
          style={[stylesAttendance.percentBadge, { borderColor: statusColor }]}
        >
          <Text style={[stylesAttendance.percentText, { color: statusColor }]}>
            {`${percent.toFixed(0)}%`}
          </Text>
        </View>
      </View>
      <View style={stylesAttendance.metrics}>
        <Metric
          appcolor={appcolor}
          iconName="flag"
          label={item.target || 'Mục tiêu'}
          value={targetValue}
          color={appcolor.success}
        />
        <Metric
          appcolor={appcolor}
          iconName="check-circle"
          label={item.actual || 'Thực tế'}
          value={actualValue}
          color={appcolor.info}
          isLast
        />
      </View>
      <View style={stylesAttendance.progressHeader}>
        <Text style={stylesAttendance.progressLabel}>Tiến độ hoàn thành</Text>
        <Text style={[stylesAttendance.progressValue, { color: statusColor }]}>
          {`${formatNumber(actualValue || 0, ',')} / ${formatNumber(
            targetValue || 0,
            ',',
          )}`}
        </Text>
      </View>
      <View style={stylesAttendance.progressBox}>
        <PercentView
          target={targetValue}
          actual={actualValue}
          width={deviceWidth - 104}
        />
      </View>
      <View style={stylesAttendance.footer}>
        <Text style={stylesAttendance.footerText}>Xem lịch sử</Text>
        <SpiralIcon
          name="chevron-right"
          type="feather"
          size={14}
          color={appcolor.primary}
        />
      </View>
    </TouchableOpacity>
  );
};

const Metric = ({
  appcolor,
  iconName,
  label,
  value,
  color,
  isLast = false,
}) => (
  <View
    style={{
      flex: 1,
      minHeight: 74,
      padding: 10,
      borderRadius: 16,
      marginRight: isLast ? 0 : 10,
      backgroundColor: appcolor.surface,
      borderWidth: 1,
      borderColor: color,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
        }}
      >
        <SpiralIcon
          name={iconName}
          type="feather"
          size={14}
          color={appcolor.white}
        />
      </View>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          marginLeft: 8,
          color: appcolor.placeholderText,
          fontSize: 11,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
    <Text
      numberOfLines={1}
      style={{
        color: appcolor.dark,
        fontSize: 22,
        fontWeight: '900',
        marginTop: 8,
      }}
    >
      {formatNumber(value || 0, ',')}
    </Text>
  </View>
);

export const SellOutCard = ({ appcolor, data = {}, navigation }) => {
  if (!Object.keys(data).length) return <EmptyDashboard appcolor={appcolor} />;

  const remaining = Math.max(
    0,
    (data.targetPercent || 0) - (data.actualPercent || 0),
  );
  const chartData = {
    dataSets: [
      {
        values: [{ value: data.actualPercent || 0 }, { value: remaining }],
        config: {
          colors: [
            processColor(appcolor.primary),
            processColor(appcolor.grayLight),
          ],
          valueTextColor: processColor('transparent'),
        },
        label: '',
      },
    ],
  };
  const percent = `${data.percentValue || 0}%`;

  return (
    <TouchableOpacity
      style={styles.fill}
      onPress={() => navigation.navigate(data.pageName || 'dashboardDetail')}
    >
      <View style={{ flex: 1, flexDirection: 'row', padding: 14 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 13, color: appcolor.placeholderText }}>
            Mục tiêu
          </Text>
          <Text
            style={{
              fontSize: scaleSize(25),
              fontWeight: '800',
              color: appcolor.primary,
            }}
          >
            {data.targetValue || 0}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: appcolor.placeholderText,
              marginTop: 12,
            }}
          >
            Thực tế
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: appcolor.info }}
          >
            {`${data.l1 || ''}: ${data.v1 || 0}`}
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: appcolor.info }}
          >
            {`${data.l2 || ''}: ${data.v2 || 0}`}
          </Text>
        </View>
        <View style={{ width: '48%' }}>
          <PieChart
            style={styles.fill}
            chartBackgroundColor={processColor('transparent')}
            chartDescription={{ text: '' }}
            data={chartData}
            legend={{ enabled: false }}
            entryLabelColor={processColor('transparent')}
            styledCenterText={{
              text: percent,
              color: processColor(appcolor.primary),
              size: 18,
            }}
            centerTextRadiusPercent={100}
            holeRadius={72}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const BarChartCard = ({
  appcolor,
  data = [],
  navigation,
  accentColor,
}) => {
  if (!data.length) return <EmptyDashboard appcolor={appcolor} />;

  const pageName = data[0]?.pageName || 'dashboardDetail';
  const chartData = {
    dataSets: [
      {
        values: _.map(data, 'target'),
        label: 'Target',
        config: { drawValues: true, colors: [processColor(appcolor.primary)] },
      },
      {
        values: _.map(data, 'actual'),
        label: 'Actual',
        config: {
          drawValues: true,
          colors: [processColor(accentColor || appcolor.warning)],
        },
      },
      {
        values: _.map(data, 'confirm'),
        label: 'Confirm',
        config: { drawValues: true, colors: [processColor(appcolor.success)] },
      },
    ],
    config: {
      barWidth: 0.3,
      group: { fromX: 0, groupSpace: 0.1, barSpace: 0 },
    },
  };
  const xAxis = {
    valueFormatter: _.map(data, 'xAxis'),
    granularityEnabled: true,
    granularity: 1,
    axisMaximum: data.length,
    axisMinimum: 0,
    centerAxisLabels: true,
    drawGridLines: false,
    position: 'BOTTOM',
    textSize: 9,
  };

  return (
    <TouchableOpacity
      style={styles.fill}
      onPress={() => navigation.navigate(pageName)}
    >
      <BarChart
        style={{ flex: 1, marginHorizontal: 6 }}
        xAxis={xAxis}
        yAxis={{
          left: { drawGridLines: false, enabled: false },
          right: { enabled: false },
        }}
        data={chartData}
        legend={{ enabled: true, textSize: 10, form: 'CIRCLE', formSize: 8 }}
        marker={{ enabled: false }}
        pinchZoom={false}
        doubleTapToZoomEnabled={false}
        chartDescription={{ text: '' }}
      />
    </TouchableOpacity>
  );
};

export const TargetCard = ({ appcolor, data = [], navigation }) => {
  if (!data.length) return <EmptyDashboard appcolor={appcolor} />;

  const chartName = data[0]?.chartName || 'Target';
  const pageName = data[0]?.pageName;
  const stylesTarget = StyleSheet.create({
    container: {
      zIndex: 10,
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerIcon: {
      width: 22,
      height: 22,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.primary,
    },
    headerTitle: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.dark,
      marginLeft: 6,
    },
    headerCount: {
      fontSize: 10,
      fontWeight: '600',
      color: appcolor.placeholderText,
    },
    list: { flex: 1, paddingHorizontal: 6 },
    listContent: { paddingBottom: 10 },
    tableHead: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    headName: {
      flex: 1,
      fontSize: 10,
      fontWeight: '700',
      color: appcolor.placeholderText,
    },
    headValue: {
      width: deviceWidth / 3,
      fontSize: 10,
      fontWeight: '700',
      color: appcolor.placeholderText,
      textAlign: 'right',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 36,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    itemMain: { flex: 1, paddingRight: 8 },
    itemName: { fontSize: 12, fontWeight: '700', color: appcolor.dark },
    itemValue: {
      width: deviceWidth / 3,
      fontSize: 14,
      fontWeight: '800',
      color: appcolor.dark,
      textAlign: 'right',
    },
  });

  return (
    <View style={stylesTarget.container}>
      <TouchableOpacity
        style={stylesTarget.header}
        disabled={!pageName || !navigation}
        onPress={() => navigation?.navigate(pageName)}
      >
        <View style={stylesTarget.headerLeft}>
          <View style={stylesTarget.headerIcon}>
            <SpiralIcon
              name="bullseye"
              type="font-awesome-5"
              color={appcolor.light}
              size={14}
            />
          </View>
          <Text numberOfLines={1} style={stylesTarget.headerTitle}>
            {chartName}
          </Text>
        </View>
        <Text style={stylesTarget.headerCount}>{`${data.length} mục`}</Text>
      </TouchableOpacity>
      <View style={stylesTarget.list}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={stylesTarget.listContent}
        >
          <View style={stylesTarget.tableHead}>
            <Text style={stylesTarget.headName}>Chỉ tiêu</Text>
            <Text style={stylesTarget.headValue}>Giá trị</Text>
          </View>
          {data.map((item, index) => (
            <View key={`idx_tt_${index}`} style={stylesTarget.item}>
              <View style={stylesTarget.itemMain}>
                <Text numberOfLines={1} style={stylesTarget.itemName}>
                  {item.unit || '-'}
                </Text>
              </View>
              <Text numberOfLines={1} style={stylesTarget.itemValue}>
                {formatNumber(item.target || 0, ',')}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export const SSubCard = ({ appcolor, data = [] }) => {
  if (!data.length) return <EmptyDashboard appcolor={appcolor} />;
  const header = data[0];

  return (
    <ScrollView nestedScrollEnabled contentContainerStyle={{ padding: 12 }}>
      <View style={styles.tableRow}>
        {[
          header.label,
          header.label1,
          header.label2,
          header.label3,
          header.label4,
        ].map((label, index) => (
          <Text
            key={`head_${index}`}
            style={[styles.tableHead, { color: appcolor.placeholderText }]}
          >
            {label}
          </Text>
        ))}
      </View>
      {data.map((item, index) => (
        <View
          key={`ssub_${index}`}
          style={[
            styles.tableRow,
            { backgroundColor: index % 2 ? appcolor.surface : appcolor.light },
          ]}
        >
          <Text style={[styles.tableValue, { color: appcolor.dark }]}>
            {item.rTime}
          </Text>
          <Text style={[styles.tableValue, { color: appcolor.warning }]}>
            {item.dk}
          </Text>
          <Text style={[styles.tableValue, { color: appcolor.info }]}>
            {item.si}
          </Text>
          <Text style={[styles.tableValue, { color: appcolor.danger }]}>
            {item.so}
          </Text>
          <Text style={[styles.tableValue, { color: appcolor.success }]}>
            {item.ck}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  tableHead: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600' },
  tableValue: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700' },
});
