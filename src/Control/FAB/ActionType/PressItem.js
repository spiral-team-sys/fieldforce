import React, { useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import SpiralIcon from '../../Icon/SpiralIcon';

export const PressItem = ({
  onPress,
  title,
  iconName = null,
  isClose = false,
  handlerClose,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);

  useEffect(() => {
    return () => false;
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%', flexDirection: 'row', padding: 8 },
    actionMain: {
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
    },
    actionCloseMain: {
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderEndWidth: 1,
      borderEndColor: appcolor.light,
    },
    titleAction: {
      fontSize: 14,
      color: appcolor.light,
      fontWeight: fontWeightBold,
      marginStart: 8,
    },
  });

  return (
    <View style={styles.mainContainer}>
      {isClose && title && (
        <TouchableOpacity style={styles.actionCloseMain} onPress={handlerClose}>
          <SpiralIcon
            type="ionicon"
            name="close-circle"
            size={21}
            color={appcolor.light}
          />
          <Text style={styles.titleAction}>Đóng</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.actionMain} onPress={onPress}>
        <SpiralIcon
          type="ionicon"
          name={iconName || 'send'}
          size={21}
          color={appcolor.light}
        />
        {title && <Text style={styles.titleAction}>{title}</Text>}
      </TouchableOpacity>
    </View>
  );
};
