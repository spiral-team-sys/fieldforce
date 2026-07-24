import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Divider, Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

const MenuAqua = ({ item, index = 0, onPress }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const styles = StyleSheet.create({
    itemMain: { alignItems: 'center', backgroundColor: appcolor.light },
    itemContent: {
      width: '100%',
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: appcolor.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleText: {
      flex: 1,
      marginStart: 12,
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    divider: { borderColor: appcolor.surface, width: '95%', height: 0.5 },
  });

  return (
    <TouchableOpacity style={styles.itemMain} onPress={() => onPress(item)}>
      <View style={styles.itemContent}>
        <View style={styles.iconCircle}>
          <SpiralIcon
            type={item.iconType || 'font-awesome'}
            name={item.iconName}
            size={18}
            color={appcolor.light}
          />
        </View>
        <Text style={styles.titleText}>{item.menuNameVN}</Text>
      </View>
      <Divider style={styles.divider} />
    </TouchableOpacity>
  );
};

export default MenuAqua;
