import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/base';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import {
  DEFAULT_SUMMARY_FILTER_SORT,
  SUMMARY_SORT_OPTIONS,
  SUMMARY_STATUS_OPTIONS,
} from '../Control/summaryFilterSort';

const SummaryFilterSortPanel = ({
  appcolor,
  value = DEFAULT_SUMMARY_FILTER_SORT,
  onChange,
  isSheet = false,
}) => {
  const sortOptions = [
    { key: SUMMARY_SORT_OPTIONS.EMPLOYEE, label: 'Nhân viên' },
    { key: SUMMARY_SORT_OPTIONS.SHOP, label: 'Shop' },
    { key: SUMMARY_SORT_OPTIONS.PROGRAM, label: 'Chương trình' },
  ];

  const statusOptions = [
    { key: SUMMARY_STATUS_OPTIONS.ALL, label: 'Tất cả' },
    { key: SUMMARY_STATUS_OPTIONS.PASS, label: 'Pass' },
    { key: SUMMARY_STATUS_OPTIONS.FAIL, label: 'Fail' },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: appcolor.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      marginBottom: isSheet ? 0 : 10,
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerRow: {
      paddingHorizontal: 14,
      marginTop: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    section: { paddingHorizontal: 14, marginTop: 8 },
    title: { fontSize: 15, fontWeight: '800', color: appcolor.primary },
    subtitle: {
      fontSize: 11,
      color: appcolor.placeholderText || appcolor.dark,
      marginTop: 3,
      fontWeight: '600',
    },
    resetText: { fontSize: 11, fontWeight: '700', color: appcolor.primary },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: appcolor.placeholderText || appcolor.dark,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      marginEnd: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
    },
    chipActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    chipText: { fontSize: 11, fontWeight: '700', color: appcolor.dark },
    chipTextActive: { color: appcolor.light },
  });

  const onChangeValue = (key, nextValue) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Bộ lọc dữ liệu</Text>
          <Text style={styles.subtitle}>
            Thu gọn dữ liệu trước khi đọc dashboard
          </Text>
        </View>
        <TouchableOpacity onPress={() => onChange(DEFAULT_SUMMARY_FILTER_SORT)}>
          <Text style={styles.resetText}>Đặt lại</Text>
        </TouchableOpacity>
      </View>
      <SearchData
        placeholder="Tìm nhân viên, shop, chương trình"
        value={value.keyword}
        onSearchData={text => onChangeValue('keyword', text || '')}
        containerStyle={{ marginHorizontal: 14, marginTop: 8, marginBottom: 0 }}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lọc trạng thái</Text>
        <View style={styles.chipRow}>
          {statusOptions.map(item => {
            const isActive = value.status === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onChangeValue('status', item.key)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
        <View style={styles.chipRow}>
          {sortOptions.map(item => {
            const isActive = value.sortBy === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onChangeValue('sortBy', item.key)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default SummaryFilterSortPanel;
