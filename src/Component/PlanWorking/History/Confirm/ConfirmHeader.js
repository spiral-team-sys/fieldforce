import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { deviceWidth } from '../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const HEADER_TABS = [
  {
    type: 'SHIFT',
    icon: 'exchange-alt',
    iconType: 'font-awesome-5',
    label: 'Chuyển ca',
  },
  {
    type: 'OFF',
    icon: 'window-close',
    iconType: 'font-awesome-5',
    label: 'Nghỉ Phép',
  },
  { type: 'LATE', icon: 'clock', iconType: 'font-awesome-5', label: 'Đi trễ' },
  {
    type: 'EARLIER',
    icon: 'business-time',
    iconType: 'font-awesome-5',
    label: 'Về sớm',
  },
];

const styles = StyleSheet.create({
  headerView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  headerItem: {
    flex: 1,
    borderRadius: 16,
    margin: 5,
    padding: 10,
    height: deviceWidth / 5.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHeader: { marginBottom: 4 },
  titleHeader: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
});

const ConfirmHeader = React.memo(({ appcolor, onSelectItem, menuSelected }) => (
  <View style={styles.headerView}>
    {HEADER_TABS.map(({ type, icon, iconType, label }) => {
      const isSelected = menuSelected === type;
      return (
        <TouchableOpacity
          key={type}
          onPress={() => onSelectItem(type)}
          activeOpacity={0.8}
          style={[
            styles.headerItem,
            isSelected
              ? {
                backgroundColor: appcolor.primary,
                elevation: 4,
                shadowColor: appcolor.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.35,
                shadowRadius: 5,
              }
              : { backgroundColor: appcolor.surface, elevation: 0 },
          ]}
        >
          <SpiralIcon
            name={icon}
            type={iconType}
            size={20}
            color={isSelected ? appcolor.light : appcolor.dark}
            style={styles.iconHeader}
          />
          <Text
            style={[
              styles.titleHeader,
              { color: isSelected ? appcolor.light : appcolor.dark },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
));

export default ConfirmHeader;
