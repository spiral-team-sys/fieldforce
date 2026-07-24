import React, { useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../Themes/AppsStyle';

export const ButtonAction = ({ title, iconName, type, handlerPress }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  //
  const onPressButton = () => {
    handlerPress(type);
  };

  useEffect(() => {
    return () => false;
  }, []);

  const color =
    type == 'CREATE'
      ? appcolor.light
      : type == 'REMOVE_IMAGE'
      ? appcolor.red
      : type == 'CANCEL'
      ? appcolor.primary
      : appcolor.dark;
  const styles = StyleSheet.create({
    mainContainerCreate: {
      flexDirection: 'row',
      justifyContent: 'center',
      minWidth: 80,
      backgroundColor: appcolor.primary,
      marginStart: 8,
      padding: 8,
      borderRadius: 5,
    },
    mainContainerCancel: {
      flexDirection: 'row',
      justifyContent: 'center',
      minWidth: 60,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      marginStart: 8,
      padding: 8,
      borderRadius: 5,
    },
    mainContainerDefault: {
      flexDirection: 'row',
      justifyContent: 'center',
      minWidth: 60,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: color,
      marginStart: 8,
      padding: 8,
      borderRadius: 5,
    },
    titleButton: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: color,
      textAlign: 'center',
    },
    mainButtonAction: { backgroundColor: 'transparent' },
  });

  return (
    <TouchableOpacity style={styles.mainButtonAction} onPress={onPressButton}>
      <View
        style={
          type == 'CREATE'
            ? styles.mainContainerCreate
            : type == 'CANCEL'
            ? styles.mainContainerCancel
            : styles.mainContainerDefault
        }
      >
        {iconName && (
          <SpiralIcon
            type="ionicon"
            name={iconName}
            size={15}
            style={{ marginEnd: 5 }}
            color={color}
          />
        )}
        <Text style={styles.titleButton}>{title || ''}</Text>
      </View>
    </TouchableOpacity>
  );
};
