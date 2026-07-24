import React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorRand } from '../../../../Core/Helper';
import { deviceWidth } from '../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const KPIDefault = ({ item, index, onPress, displayKpi }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const minHeight = displayKpi ? 0 : 32;
  const textAlign = displayKpi ? 'left' : 'center';
  const backgroundColor =
    item.taskDone === 1
      ? appcolor.success
      : item.taskDone === 2
      ? appcolor.warning
      : appcolor.danger;

  const styles = StyleSheet.create({
    itemContainer: {
      margin: 4,
      borderRadius: 8,
      shadowColor: appcolor.grey,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      elevation: 3,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
    },
    card: {
      width: deviceWidth / 3.3,
      alignItems: 'center',
      backgroundColor: appcolor.light,
    },
    rowList: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.light,
    },
    iconWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    statusDot: {
      backgroundColor,
      position: 'absolute',
      top: 8,
      right: 8,
      width: 16,
      height: 16,
      borderRadius: 16,
    },
    menuName: {
      minHeight: minHeight,
      fontSize: 12,
      fontWeight: 'bold',
      color: appcolor.dark,
      textAlign: textAlign,
      marginBottom: 2,
      paddingHorizontal: 8,
    },
    menuNameEng: {
      fontSize: 11,
      color: appcolor.greylight,
      textAlign: textAlign,
    },
    textContainer: { flex: 1, justifyContent: 'center' },
    iconList: { marginRight: 16 },
    icon: { width: 50, height: 50, justifyContent: 'center' },
  });
  if (!displayKpi) {
    return (
      <TouchableOpacity
        style={[styles.itemContainer, styles.card]}
        onPress={onPress}
      >
        <View style={styles.iconWrapper}>
          <SpiralIcon
            size={38}
            name={item.iconName}
            type={item.iconType}
            color={ColorRand(index)}
          />
        </View>
        <View style={styles.statusDot} />
        <Text style={styles.menuNameEng}>{item.menuName}</Text>
        <Text style={styles.menuName}>{item.menuNameVN}</Text>
      </TouchableOpacity>
    );
  } else {
    return (
      <TouchableOpacity
        style={[styles.itemContainer, styles.rowList]}
        onPress={onPress}
      >
        <View style={styles.iconList}>
          <SpiralIcon
            style={styles.icon}
            size={38}
            name={item.iconName}
            type={item.iconType}
            color={ColorRand(index)}
          />
        </View>
        <View style={styles.statusDot} />
        <View style={styles.textContainer}>
          <Text style={styles.menuName}>{item.menuNameVN}</Text>
          <Text style={styles.menuNameEng}>{item.menuName}</Text>
        </View>
      </TouchableOpacity>
    );
  }
};

export default KPIDefault;
