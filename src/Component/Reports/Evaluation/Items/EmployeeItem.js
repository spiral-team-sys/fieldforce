import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/base';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import moment from 'moment';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const readField = (item, keys = []) => {
  for (let i = 0; i < keys.length; i++) {
    const value = item?.[keys[i]];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
};

const getDisplayScore = value => {
  if (!value) return '--';
  if (typeof value === 'string') return value;
  if (Array.isArray(value))
    return value
      .map(
        e =>
          `${readField(e, [
            'name',
            'criteriaName',
            'categoryName',
          ])}: ${readField(e, ['score', 'value', 'point'])}`,
      )
      .join(' | ');
  if (typeof value === 'object')
    return Object.keys(value)
      .map(key => `${key}: ${value[key]}`)
      .join(' | ');
  return `${value}`;
};

/**
 * EmployeeItem - single PC row used in step 3 list
 * Props: item, index, isSelected, onPress
 */
const EmployeeItem = ({ item, index, isSelected, onPress }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    itemContainer: {
      width: '100%',
      marginBottom: 8,
      padding: 8,
      borderRadius: 8,
      backgroundColor: appcolor.white,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    viewActionPress: { width: '100%' },
    employeeMainInfo: { marginTop: 4 },
    employeeMainInfoText: {
      fontSize: 11,
      color: appcolor.placeholderText,
      marginBottom: 2,
    },
    pcInfoBox: {
      marginTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: appcolor.grayLight,
      paddingTop: 8,
    },
    pcLabel: { fontSize: 11, color: appcolor.placeholderText },
    pcValue: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: '500',
      marginBottom: 4,
    },
    selectedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryCard: {
      marginTop: 6,
      padding: 8,
      backgroundColor: appcolor.surface,
      borderRadius: 8,
    },
    summaryText: { fontSize: 11, color: appcolor.dark, marginBottom: 2 },
  });
  const history = item.history || {};
  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.viewActionPress}
        onPress={() => onPress(item)}
      >
        <View style={styles.selectedRow}>
          <Text style={styles.titleName}>{`${index + 1}. ${item.employeeName
            }`}</Text>
          <SpiralIcon
            type="ionicon"
            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={isSelected ? appcolor.primary : appcolor.placeholderText}
          />
        </View>
        <View style={styles.employeeMainInfo}>
          <Text
            style={styles.employeeMainInfoText}
          >{`Mã NV: ${item.employeeCode}`}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.pcInfoBox}>
        <Text style={styles.pcValue}>{`SĐT: ${item.phone}`}</Text>
        <Text style={styles.pcValue}>{`Kinh nghiệm: ${item.experience}`}</Text>
        <Text style={styles.pcValue}>{`Ngành hàng: ${item.category}`}</Text>
        <Text
          style={styles.pcValue}
        >{`Khu vực: ${item.area} | Tỉnh: ${item.province}`}</Text>
        <Text style={styles.pcValue}>{`SUP: ${item.supName}`}</Text>
      </View>
      {/* <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{`Số lần đánh giá: ${history.count || 0}`}</Text>
                <Text style={styles.summaryText}>{`Lần gần nhất: ${history.date || '--'}`}</Text>
                <Text style={styles.summaryText}>{`Điểm tổng kết: ${history.totalScore || '--'}`}</Text>
                <Text style={styles.summaryText}>{`Điểm tiêu chí: ${getDisplayScore(history.criteriaScore)}`}</Text>
                <Text style={styles.summaryText}>{`Điểm ngành hàng: ${getDisplayScore(history.categoryScore)}`}</Text>
                <Text style={styles.summaryText}>{`Ghi chú: ${history.note || '--'}`}</Text>
                <Text style={styles.summaryText}>{`Việc cần làm: ${history.todo || '--'}`}</Text>
            </View> */}
    </View>
  );
};

export default EmployeeItem;
