import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { deviceWidth } from '../../../../Core/Utility';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const MenuLG = ({ item, onPress, viewHorizontal = false }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    itemMain: {
      width: deviceWidth / 3.3,
      height: deviceWidth / 3.3,
      backgroundColor: appcolor.light,
      margin: 8,
      marginTop: 0,
      borderWidth: 1,
      padding: 8,
      borderRadius: 8,
      borderColor: appcolor.surface,
      shadowColor: appcolor.grey,
      shadowOffset: { width: 1, height: 0 },
      shadowRadius: 8,
      shadowOpacity: 0.3,
      elevation: 3,
      overflow: 'hidden',
    },
    itemContent: { flex: 1, alignItems: 'center' },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 56,
      backgroundColor: appcolor.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconStyle: {
      shadowColor: appcolor.light,
      shadowOpacity: 0.6,
      shadowOffset: { width: 0, height: 3 },
    },
    titleName: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      width: '100%',
      textAlign: 'center',
    },
    subTitleName: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.greylight,
      width: '100%',
      textAlign: 'center',
    },
  });
  console.log(item.menuNameVN, item.iconName, item.iconType);

  return (
    <TouchableOpacity
      style={[
        styles.itemMain,
        viewHorizontal ? { height: deviceWidth / 3.3 - 8 } : {},
      ]}
      onPress={() => onPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={styles.iconContainer}>
          <SpiralIcon
            color={appcolor.primary}
            name={item.iconName}
            type={item.iconType || 'fontawesome'}
            style={styles.iconStyle}
            size={32}
          />
        </View>
        <Text style={styles.titleName} numberOfLines={2}>
          {item.menuNameVN}
        </Text>
        <Text style={styles.subTitleName}>{item.groupReport}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MenuLG;
