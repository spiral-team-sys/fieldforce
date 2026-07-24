import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckBox, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';

export const GroupCheckBox = ({ item, keyValue, onChange }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  // Handler
  const onValueChange_On = () => {
    item[keyValue] = item[keyValue] == 0 ? null : 0;
    onChange(item);
  };
  const onValueChange_Off = () => {
    item[keyValue] = item[keyValue] == 1 ? null : 1;
    onChange(item);
  };
  //
  useEffect(() => {
    return () => false;
  }, [item]);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', alignItems: 'center' },
    viewAction: {},
    checkbox: {
      width: '100%',
      backgroundColor: appcolor.transparent,
      padding: 4,
      margin: 0,
      borderColor: appcolor.transparent,
      textAlign: 'center',
    },
    titleCheckBox: {
      padding: 0,
      margin: 0,
      fontSize: 13,
      color: appcolor.blacklight,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewAction}>
        <CheckBox
          checked={item[keyValue] == 1}
          onPress={onValueChange_Off}
          title="Hết hàng"
          size={21}
          iconType="material-community"
          checkedIcon="checkbox-marked"
          uncheckedIcon="checkbox-blank-outline"
          checkedColor={appcolor.primary}
          uncheckedColor={appcolor.grayLight}
          containerStyle={styles.checkbox}
          textStyle={{
            ...styles.titleCheckBox,
            color: item[keyValue] == 1 ? appcolor.primary : appcolor.blacklight,
          }}
        />
        <CheckBox
          checked={item[keyValue] == 0}
          onPress={onValueChange_On}
          title="Còn hàng"
          size={21}
          iconType="material-community"
          checkedIcon="checkbox-marked"
          uncheckedIcon="checkbox-blank-outline"
          checkedColor={appcolor.greylight}
          uncheckedColor={appcolor.grayLight}
          containerStyle={styles.checkbox}
          textStyle={styles.titleCheckBox}
        />
      </View>
    </View>
  );
};
