import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from '@rneui/base';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import moment from 'moment';

/**
 * StepSummaryCard - progress overview showing all 4 steps' current state
 * Props: stepItems, currentStep, filter, selectedPC, workDate, coVisitName, selectedCriteria
 */
const StepSummaryCard = ({
  stepItems = [],
  currentStep,
  filter,
  selectedPC = [],
  workDate,
  coVisitName,
  selectedCriteria = [],
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    stepSummaryCard: {
      width: '100%',
      marginBottom: 6,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.white,
      paddingHorizontal: 8,
      paddingVertical: 8,
      marginTop: 6,
    },
    stepSummaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    stepSummaryTitle: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    stepSummaryProgressText: {
      fontSize: 10,
      color: appcolor.primary,
      fontWeight: '700',
    },
    stepSummaryProgressTrack: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      backgroundColor: appcolor.grayLight,
      overflow: 'hidden',
      marginBottom: 6,
    },
    stepSummaryProgressFill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: appcolor.primary,
    },
    stepSummaryQuickList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    stepSummaryQuickItem: {
      width: '49%',
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.white,
      paddingHorizontal: 7,
      paddingVertical: 6,
      marginBottom: 5,
    },
    stepSummaryQuickItemActive: {
      borderColor: appcolor.primary,
      backgroundColor: appcolor.surface,
    },
    stepSummaryQuickItemDone: { borderColor: appcolor.blacklight },
    stepSummaryQuickTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepSummaryStepIndex: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      textAlign: 'center',
      textAlignVertical: 'center',
      lineHeight: 14,
      fontSize: 9,
      color: appcolor.placeholderText,
      fontWeight: '700',
    },
    stepSummaryStepIndexActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
      color: appcolor.light,
    },
    stepSummaryStepIndexDone: {
      backgroundColor: appcolor.blacklight,
      borderColor: appcolor.blacklight,
      color: appcolor.light,
    },
    stepSummaryStatusText: {
      fontSize: 9,
      color: appcolor.placeholderText,
      fontWeight: '700',
    },
    stepSummaryStatusTextActive: { color: appcolor.primary },
    stepSummaryStatusTextDone: { color: appcolor.blacklight },
    stepSummaryLabel: {
      fontSize: 10,
      color: appcolor.placeholderText,
      marginTop: 3,
    },
    stepSummaryValue: {
      fontSize: 11,
      color: appcolor.dark,
      fontWeight: '600',
      marginTop: 1,
    },
    stepSummaryMeta: {
      fontSize: 10,
      color: appcolor.placeholderText,
      marginTop: 1,
    },
  });

  const doneSteps = Math.min(Math.max(currentStep - 1, 0), stepItems.length);
  const progressWidth = `${(doneSteps / stepItems.length) * 100}%`;
  const rows = [
    {
      step: 1,
      label: 'Khu vực',
      value:
        filter.area === 'ALL'
          ? 'Chưa chọn'
          : filter.province === 'ALL'
          ? filter.area
          : `${filter.area} • ${filter.province}`,
    },
    {
      step: 2,
      label: 'Cửa hàng',
      value: filter.shop === 'ALL' ? 'Chưa chọn' : filter.shop,
    },
    {
      step: 3,
      label: 'Nhân viên',
      value: `${selectedPC.length} PC`,
    },
    {
      step: 4,
      label: 'Lịch đánh giá',
      value: workDate ? moment(workDate).format('DD/MM') : 'Chưa chọn',
      meta: coVisitName.trim()
        ? `Co-visit: ${coVisitName.trim()}`
        : `${selectedCriteria.length} tiêu chí`,
    },
  ];

  return (
    <View style={styles.stepSummaryCard}>
      <View style={styles.stepSummaryHeader}>
        <Text style={styles.stepSummaryTitle}>Thông tin đã chọn</Text>
        <Text
          style={styles.stepSummaryProgressText}
        >{`${doneSteps}/${stepItems.length} bước`}</Text>
      </View>
      <View style={styles.stepSummaryProgressTrack}>
        <View
          style={[styles.stepSummaryProgressFill, { width: progressWidth }]}
        />
      </View>
      <View style={styles.stepSummaryQuickList}>
        {rows.map(row => {
          const isDone = currentStep > row.step;
          const isCurrent = currentStep === row.step;
          const statusText = isDone ? 'Xong' : isCurrent ? 'Đang chọn' : 'Chờ';
          return (
            <View
              key={row.step}
              style={[
                styles.stepSummaryQuickItem,
                isDone && styles.stepSummaryQuickItemDone,
                isCurrent && styles.stepSummaryQuickItemActive,
              ]}
            >
              <View style={styles.stepSummaryQuickTop}>
                <Text
                  style={[
                    styles.stepSummaryStepIndex,
                    isDone && styles.stepSummaryStepIndexDone,
                    isCurrent && styles.stepSummaryStepIndexActive,
                  ]}
                >
                  {row.step}
                </Text>
                <Text
                  style={[
                    styles.stepSummaryStatusText,
                    isDone && styles.stepSummaryStatusTextDone,
                    isCurrent && styles.stepSummaryStatusTextActive,
                  ]}
                >
                  {statusText}
                </Text>
              </View>
              <Text style={styles.stepSummaryLabel}>{row.label}</Text>
              <Text style={styles.stepSummaryValue} numberOfLines={1}>
                {row.value}
              </Text>
              {!!row.meta && (
                <Text style={styles.stepSummaryMeta} numberOfLines={1}>
                  {row.meta}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default StepSummaryCard;
