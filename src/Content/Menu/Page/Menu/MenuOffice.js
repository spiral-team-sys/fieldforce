import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { deviceWidth } from '../../../../Core/Utility';
import { useSelector } from 'react-redux';
import { scaleSize } from '../../../../Themes/AppsStyle';
import { COLOR } from '../../../../Component/OFFICE SPIRAL/Control/UtilityOffice';

const MenuOffice = ({ item, index = 0, onPress }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    itemMain: { width: deviceWidth / 4.4 },
    itemContent: { alignItems: 'center', padding: 8, borderRadius: 8 },
    iconContainer: { padding: 8, minWidth: deviceWidth / 5.2 },
    iconStyle: {
      shadowColor: appcolor.light,
      shadowOpacity: 0.6,
      shadowOffset: { width: 0, height: 3 },
    },
    titleName: {
      color: appcolor.blacklight,
      fontSize: 11,
      fontWeight: '500',
      minHeight: 24,
      textAlign: 'center',
    },
  });
  return (
    <TouchableOpacity style={styles.itemMain} onPress={() => onPress(item)}>
      <View style={styles.itemContent}>
        <View style={styles.iconContainer}>
          <SpiralIcon
            color={COLOR.ColorRand(index)}
            name={item.iconName}
            type={item.iconType}
            size={scaleSize(28)}
          />
        </View>
        <Text style={styles.titleName}>{item.menuNameVN}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MenuOffice;
