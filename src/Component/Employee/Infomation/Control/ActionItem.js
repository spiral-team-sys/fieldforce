import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const ActionItem = ({
  isMain = false,
  typeAction,
  title,
  iconName,
  onPress,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  //
  const onPressMenu = () => {
    onPress(typeAction, title);
  };
  useEffect(() => {
    return () => false;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 2,
    },
    viewActionMain: {
      width: 42,
      height: 42,
      justifyContent: 'center',
      margin: 5,
      padding: 8,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
      backgroundColor: appcolor.light,
      shadowColor: appcolor.dark,
      elevation: 3,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.2,
      borderRadius: 50,
    },
    viewTitleName: {
      backgroundColor: appcolor.light,
      padding: 8,
      paddingHorizontal: 16,
      borderRadius: 50,
      shadowColor: appcolor.dark,
      elevation: 3,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.2,
    },
    titleName: {
      fontSize: 13,
      color: isMain ? appcolor.red : appcolor.dark,
      fontWeight: fontWeightBold,
    },
  });
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={styles.mainContainer}
      onPress={onPressMenu}
    >
      {title && (
        <View style={styles.viewTitleName}>
          <Text style={styles.titleName}>{title || ''}</Text>
        </View>
      )}
      <View style={styles.viewActionMain}>
        <SpiralIcon
          type="ionicon"
          name={iconName || ''}
          size={18}
          color={isMain && title ? appcolor.red : appcolor.blacklight}
        />
      </View>
    </TouchableOpacity>
  );
};
