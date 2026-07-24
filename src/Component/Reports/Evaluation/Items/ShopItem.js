import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from '@rneui/base';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

/**
 * ShopItem - single row in shop list (Step 2)
 * Props: name, shopCode, employeeNames, isActive, onPress
 */
const ShopItem = ({ name, shopCode, employeeNames, isActive, onPress }) => {
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
    subName: {
      fontSize: 11,
      color: appcolor.placeholderText,
      fontWeight: '500',
      marginTop: 2,
    },
    subNameActive: { color: appcolor.light },
  });
  return (
    <TouchableOpacity
      style={[styles.item, isActive && styles.itemActive]}
      onPress={onPress}
    >
      <Text
        style={[styles.name, isActive && styles.nameActive]}
        numberOfLines={1}
      >{`${name} (${shopCode})`}</Text>
      {!!employeeNames && (
        <Text
          style={[styles.subName, isActive && styles.subNameActive]}
        >{`Nhân viên: ${employeeNames}`}</Text>
      )}
    </TouchableOpacity>
  );
};

export default ShopItem;
