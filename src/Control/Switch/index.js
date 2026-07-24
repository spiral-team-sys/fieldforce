import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../Themes/AppsStyle';

export const SwitchControl = ({ title, item, keyValue, onChange }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [switchValue, setSwitchValue] = useState(false);
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = () => {
    setSwitchValue(item[keyValue] == 1);
  };
  // Handler
  const handlerChangeValue = () => {
    const _switchValue = !switchValue;
    setSwitchValue(_switchValue);
    //
    item[keyValue] = _switchValue ? 1 : 0;
    onChange(item);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [item]);
  const styles = StyleSheet.create({
    actionView: {
      width: deviceWidth / 5,
      height: 28,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: switchValue ? appcolor.primary : appcolor.grey,
      borderRadius: 20,
      backgroundColor: switchValue ? appcolor.primary : appcolor.light,
    },
    circleViewOn: {
      width: 20,
      height: 20,
      borderRadius: 50,
      backgroundColor: appcolor.light,
      position: 'absolute',
      end: 4,
    },
    circleViewOff: {
      width: 20,
      height: 20,
      borderRadius: 50,
      backgroundColor: appcolor.grey,
      position: 'absolute',
      start: 4,
    },
    titleNameOn: {
      fontSize: 10,
      fontWeight: '500',
      color: appcolor.light,
      paddingHorizontal: 8,
      position: 'absolute',
      start: 0,
    },
    titleNameOff: {
      fontSize: 10,
      fontWeight: '500',
      color: appcolor.greylight,
      paddingHorizontal: 8,
      position: 'absolute',
      end: 0,
    },
  });

  return (
    <TouchableOpacity style={styles.actionView} onPress={handlerChangeValue}>
      <View style={switchValue ? styles.circleViewOn : styles.circleViewOff} />
      <Text style={switchValue ? styles.titleNameOn : styles.titleNameOff}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
