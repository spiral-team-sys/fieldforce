import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/base';
import { SUMMARY_SORT_OPTIONS } from '../Control/summaryMetrics';

const SummarySortedList = ({ appcolor, data = [], sortBy, onChangeSort }) => {
  const sortOptions = [
    { key: SUMMARY_SORT_OPTIONS.EMPLOYEE, label: 'Nhân viên' },
    { key: SUMMARY_SORT_OPTIONS.SHOP, label: 'Shop' },
    { key: SUMMARY_SORT_OPTIONS.PROGRAM, label: 'Trưng bày' },
  ];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: appcolor.surface,
      borderRadius: 12,
      borderWidth: 0.8,
      borderColor: appcolor.grayLight,
      marginVertical: 6,
      padding: 10,
      elevation: 2,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: appcolor.primary,
      marginBottom: 10,
    },
    sortRow: { flexDirection: 'row', marginBottom: 10 },
    sortButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      marginEnd: 8,
      backgroundColor: appcolor.light,
    },
    sortButtonActive: {
      borderColor: appcolor.primary,
      backgroundColor: appcolor.primary,
    },
    sortText: { fontSize: 12, color: appcolor.dark, fontWeight: '600' },
    sortTextActive: { color: appcolor.light },
    itemRow: {
      borderWidth: 0.6,
      borderColor: appcolor.grayLight,
      borderRadius: 10,
      padding: 8,
      marginBottom: 8,
      backgroundColor: appcolor.light,
    },
    line: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    label: {
      fontSize: 11,
      color: appcolor.placeholderText || appcolor.dark,
      fontWeight: '600',
    },
    value: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: '700',
      maxWidth: '72%',
      textAlign: 'right',
    },
    emptyText: {
      fontSize: 12,
      color: appcolor.placeholderText || appcolor.dark,
      textAlign: 'center',
      marginVertical: 10,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Danh sách hiển thị</Text>
      <View style={styles.sortRow}>
        {sortOptions.map(option => {
          const isActive = sortBy === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.sortButton, isActive && styles.sortButtonActive]}
              onPress={() => onChangeSort(option.key)}
            >
              <Text
                style={[styles.sortText, isActive && styles.sortTextActive]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {data.length === 0 ? (
        <Text style={styles.emptyText}>Không có dữ liệu hiển thị</Text>
      ) : (
        data.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.line}>
              <Text style={styles.label}>Nhân viên</Text>
              <Text style={styles.value}>
                {item.employeeCode
                  ? `${item.employeeName} (${item.employeeCode})`
                  : item.employeeName}
              </Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Shop</Text>
              <Text style={styles.value}>
                {item.shopCode
                  ? `${item.shopName} (${item.shopCode})`
                  : item.shopName}
              </Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Trưng bày</Text>
              <Text style={styles.value}>{item.programName}</Text>
            </View>
            {item.status ? (
              <View style={[styles.line, { marginTop: 2 }]}>
                <Text style={styles.label}>Trình hiển thị</Text>
                <Text style={[styles.value, { color: appcolor.primary }]}>
                  {item.status}
                </Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
};

export default SummarySortedList;
