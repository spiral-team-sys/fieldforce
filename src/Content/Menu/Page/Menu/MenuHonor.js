import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const MenuHonor = ({ item, onPress, appcolor, index }) => {
  const iconColors = [
    appcolor.primary,
    appcolor.secondary,
    appcolor.success,
    appcolor.highlightDate,
    appcolor.danger,
    appcolor.info,
  ];
  const colorIndex = index % iconColors.length;
  const iconColor = iconColors[colorIndex];

  const styles = StyleSheet.create({
    itemContainer: {
      flex: 1,
      minHeight: 118,
      marginHorizontal: 8,
      marginVertical: 8,
      paddingHorizontal: 8,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    iconBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: iconColor,
      opacity: 0.14,
    },
    titleContainer: { marginTop: 12, minHeight: 34, justifyContent: 'center' },
    titleName: {
      fontSize: 13,
      lineHeight: 17,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onPress(item)}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground} />
        <SpiralIcon
          name={item.iconName}
          type={item.iconType || 'font-awesome-5'}
          size={24}
          color={iconColor}
        />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.titleName} numberOfLines={2}>
          {item.menuNameVN}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
