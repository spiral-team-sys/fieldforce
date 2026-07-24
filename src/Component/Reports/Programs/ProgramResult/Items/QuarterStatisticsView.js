import React, { useEffect, useMemo, useState } from 'react';
import {
  processColor,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/base';
import { PieChart } from 'react-native-charts-wrapper';
import { useSelector } from 'react-redux';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

const QuarterStatisticsView = ({
  programs = [],
  timeMode = 'MONTH',
  pickerMode = timeMode,
  month = 1,
  maxMonth = 1,
  quarter = 1,
  maxQuarter = 1,
  onChangeTimeMode,
  onChangeMonth,
  onChangeQuarter,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [selectedProgramId, setSelectedProgramId] = useState(0);
  const [selectedTypeData, setSelectedTypeData] = useState('');
  const quarterList = Array.from({ length: maxQuarter }).map(
    (_, index) => index + 1,
  );
  const monthList = Array.from({ length: maxMonth }).map(
    (_, index) => index + 1,
  );
  const isMonthMode = timeMode === 'MONTH';
  const isMonthPicker = pickerMode === 'MONTH';
  const timeTitle = isMonthMode ? `tháng ${month}` : `quý ${quarter}`;
  const displayPrograms = useMemo(
    () =>
      programs
        .map(program => ({
          ...program,
          typeData: (program?.typeData || []).filter(type =>
            (type?.statuses || []).some(
              status => Number(status?.TotalShops || 0) > 0,
            ),
          ),
        }))
        .filter(program => program.typeData.length > 0),
    [programs],
  );

  const selectedProgram =
    displayPrograms.find(item => item.programId == selectedProgramId) ||
    displayPrograms[0];
  const selectedType =
    selectedProgram?.typeData?.find(
      item => item.TypeData === selectedTypeData,
    ) || selectedProgram?.typeData?.[0];

  useEffect(() => {
    if (!displayPrograms.some(item => item.programId == selectedProgramId)) {
      setSelectedProgramId(displayPrograms[0]?.programId || 0);
      setSelectedTypeData(displayPrograms[0]?.typeData?.[0]?.TypeData || '');
    }
  }, [displayPrograms, selectedProgramId]);

  const totalShops =
    selectedType?.statuses?.reduce(
      (total, status) => total + Number(status.TotalShops || 0),
      0,
    ) || 0;
  const chartValues = (selectedType?.statuses || []).map(status => ({
    value: Number(status.TotalShops || 0),
    label: status.StatusTitle,
  }));
  const chartColors = (selectedType?.statuses || []).map(status =>
    processColor(appcolor[status.ColorTheme] || appcolor.primary),
  );
  const chartData = {
    dataSets: [
      {
        label: '',
        values: chartValues,
        config: {
          colors: chartColors,
          valueTextSize: 10,
          valueTextColor: processColor(appcolor.dark),
          valueFormatter: '#,###',
          sliceSpace: 2,
          selectionShift: 8,
          yValuePosition: 'OUTSIDE_SLICE',
          valueLineColor: processColor(appcolor.dark),
          valueLinePart1Length: 0.5,
        },
      },
    ],
  };

  const onSelectProgram = program => {
    setSelectedProgramId(program.programId);
    setSelectedTypeData(program.typeData?.[0]?.TypeData || '');
  };

  const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12 },
    summaryCard: {
      marginHorizontal: 16,
      borderRadius: 20,
      padding: 16,
      backgroundColor: appcolor.surface,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    header: { flexDirection: 'row', alignItems: 'center' },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.primary,
      marginRight: 12,
    },
    headerInfo: { flex: 1 },
    title: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '700',
      color: appcolor.dark,
    },
    subtitle: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    timeModeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      padding: 4,
      borderRadius: 16,
      backgroundColor: appcolor.surface,
    },
    timeModeButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeModeText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
      marginLeft: 6,
    },
    quarterContent: {
      paddingHorizontal: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    quarterChip: {
      minWidth: 72,
      minHeight: 44,
      borderRadius: 9999,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      borderWidth: 0.5,
    },
    quarterText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
    },
    programScroll: { maxHeight: 108, flexGrow: 0 },
    programContent: { paddingHorizontal: 16, paddingBottom: 4 },
    programChip: {
      width: 220,
      minHeight: 88,
      borderRadius: 18,
      padding: 14,
      marginRight: 10,
      borderWidth: 0.5,
    },
    programTop: { flexDirection: 'row', alignItems: 'center' },
    programIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
      marginRight: 8,
    },
    programInfo: { flex: 1 },
    programTitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
    },
    programMeta: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 4,
    },
    typeScroll: { height: 52, maxHeight: 52, flexGrow: 0 },
    typeContent: { paddingHorizontal: 16, alignItems: 'center' },
    typeChip: {
      minHeight: 44,
      borderRadius: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
      borderWidth: 0.5,
    },
    typeText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      color: appcolor.dark,
      marginLeft: 8,
    },
    chartCard: {
      minHeight: 390,
      margin: 16,
      marginTop: 8,
      borderRadius: 20,
      padding: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    chartTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color: appcolor.dark,
      textAlign: 'center',
      marginTop: 8,
    },
    chartSubtitle: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      textAlign: 'center',
      marginTop: 2,
    },
    chart: { height: 320, marginTop: 8 },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color: appcolor.dark,
      marginTop: 12,
    },
    emptyText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 4,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryCard}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <SpiralIcon
              type="ionicon"
              name="pie-chart-outline"
              size={21}
              color={appcolor.light}
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Thống kê kết quả</Text>
            <Text
              style={styles.subtitle}
            >{`Tỷ trọng cửa hàng theo từng trạng thái trong ${timeTitle}`}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Thời gian thống kê</Text>
      <View style={styles.timeModeWrap}>
        {[
          { key: 'MONTH', title: 'Tháng', icon: 'calendar-outline' },
          { key: 'QUARTER', title: 'Quý', icon: 'pie-chart-outline' },
        ].map(item => {
          const isSelected = pickerMode === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              onPress={() => onChangeTimeMode(item.key)}
              style={[
                styles.timeModeButton,
                {
                  backgroundColor: isSelected
                    ? appcolor.primary
                    : appcolor.surface,
                },
              ]}
            >
              <SpiralIcon
                type="ionicon"
                name={item.icon}
                size={17}
                color={isSelected ? appcolor.light : appcolor.primary}
              />
              <Text
                style={[
                  styles.timeModeText,
                  { color: isSelected ? appcolor.light : appcolor.dark },
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quarterContent}
      >
        {(isMonthPicker ? monthList : quarterList).map(item => {
          const isSelected = isMonthPicker
            ? timeMode === 'MONTH' && month === item
            : timeMode === 'QUARTER' && quarter === item;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.7}
              onPress={() =>
                isMonthPicker ? onChangeMonth(item) : onChangeQuarter(item)
              }
              style={[
                styles.quarterChip,
                {
                  backgroundColor: isSelected
                    ? appcolor.primary
                    : appcolor.surface,
                  borderColor: isSelected
                    ? appcolor.primary
                    : appcolor.grayLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.quarterText,
                  { color: isSelected ? appcolor.light : appcolor.dark },
                ]}
              >
                {isMonthPicker ? `Tháng ${item}` : `Quý ${item}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {displayPrograms.length === 0 ? (
        <View style={styles.emptyWrap}>
          <SpiralIcon
            type="ionicon"
            name="pie-chart-outline"
            size={36}
            color={appcolor.placeholderText}
          />
          <Text style={styles.emptyTitle}>Không có dữ liệu biểu đồ</Text>
          <Text
            style={styles.emptyText}
          >{`Hệ thống chưa trả về dữ liệu thống kê cho ${timeTitle}`}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Chương trình</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.programScroll}
            contentContainerStyle={styles.programContent}
          >
            {displayPrograms.map((program, programIndex) => {
              const isSelected =
                program.programId == selectedProgram?.programId;
              return (
                <TouchableOpacity
                  key={`${program.programId || 'program'}_${programIndex}`}
                  activeOpacity={0.7}
                  onPress={() => onSelectProgram(program)}
                  style={[
                    styles.programChip,
                    {
                      backgroundColor: isSelected
                        ? appcolor.primary
                        : appcolor.surface,
                      borderColor: isSelected
                        ? appcolor.primary
                        : appcolor.grayLight,
                    },
                  ]}
                >
                  <View style={styles.programTop}>
                    <View style={styles.programIcon}>
                      <SpiralIcon
                        type="ionicon"
                        name="trophy-outline"
                        size={17}
                        color={appcolor.primary}
                      />
                    </View>
                    <View style={styles.programInfo}>
                      <Text
                        style={[
                          styles.programTitle,
                          {
                            color: isSelected ? appcolor.light : appcolor.dark,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {program.title}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.programMeta,
                      {
                        color: isSelected
                          ? appcolor.light
                          : appcolor.placeholderText,
                      },
                    ]}
                  >
                    {`${program.typeData?.length || 0} loại kết quả`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>Loại kết quả</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
            contentContainerStyle={styles.typeContent}
          >
            {(selectedProgram?.typeData || []).map((item, typeIndex) => {
              const isSelected = item.TypeData === selectedType?.TypeData;
              return (
                <TouchableOpacity
                  key={`${item.TypeData || 'type'}_${typeIndex}`}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTypeData(item.TypeData)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: isSelected
                        ? appcolor.primary
                        : appcolor.surface,
                      borderColor: isSelected
                        ? appcolor.primary
                        : appcolor.grayLight,
                    },
                  ]}
                >
                  <SpiralIcon
                    type="ionicon"
                    name={
                      item.TypeData === 'DISPLAY'
                        ? 'images-outline'
                        : 'pie-chart-outline'
                    }
                    size={17}
                    color={isSelected ? appcolor.light : appcolor.primary}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: isSelected ? appcolor.light : appcolor.dark },
                    ]}
                  >
                    {item.Title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{selectedType?.Title}</Text>
            <Text style={styles.chartSubtitle}>Đơn vị: cửa hàng</Text>
            {totalShops > 0 ? (
              <PieChart
                style={styles.chart}
                data={chartData}
                chartBackgroundColor={processColor('transparent')}
                chartDescription={{ text: '' }}
                legend={{
                  enabled: true,
                  textSize: 10,
                  form: 'CIRCLE',
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'BOTTOM',
                  orientation: 'HORIZONTAL',
                  wordWrapEnabled: true,
                  textColor: processColor(appcolor.dark),
                }}
                entryLabelColor={processColor(appcolor.dark)}
                entryLabelTextSize={10}
                drawEntryLabels={false}
                usePercentValues={false}
                rotationEnabled={false}
                holeRadius={52}
                transparentCircleRadius={56}
                styledCenterText={{
                  text: `Tổng ${totalShops}`,
                  color: processColor(appcolor.dark),
                  size: 14,
                }}
                animation={{ durationY: 900 }}
                maxAngle={360}
              />
            ) : (
              <View style={styles.emptyWrap}>
                <SpiralIcon
                  type="ionicon"
                  name="pie-chart-outline"
                  size={36}
                  color={appcolor.placeholderText}
                />
                <Text style={styles.emptyTitle}>Chưa có số liệu</Text>
                <Text style={styles.emptyText}>
                  Chương trình và loại kết quả này đang có tổng bằng 0
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default QuarterStatisticsView;
