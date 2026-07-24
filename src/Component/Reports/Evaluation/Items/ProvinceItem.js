import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from '@rneui/base';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

/**
 * ProvinceItem - single row in province list (Step 1)
 * Props: name, employeeCount, shopCount, isActive, onPress
 */
const ProvinceItem = ({
  name,
  employeeCount,
  shopCount,
  isActive,
  onPress,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    item: {
      width: '100%',
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.white,
      marginBottom: 6,
    },
    itemActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    name: { fontSize: 12, color: appcolor.dark, fontWeight: fontWeightBold },
    nameActive: { color: appcolor.light },
    count: { fontSize: 11, color: appcolor.placeholderText, marginTop: 2 },
    countActive: { color: appcolor.light },
  });
  return (
    <TouchableOpacity
      style={[styles.item, isActive && styles.itemActive]}
      onPress={onPress}
    >
      <Text style={[styles.name, isActive && styles.nameActive]}>{name}</Text>
      <Text
        style={[styles.count, isActive && styles.countActive]}
      >{`${shopCount} cửa hàng • ${employeeCount} nhân viên`}</Text>
    </TouchableOpacity>
  );
};

export default ProvinceItem;
