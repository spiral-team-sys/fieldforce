import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { scaleSize } from '../Themes/AppsStyle';
import SpiralIcon from './Icon/SpiralIcon';

export const NumPad_V2 = React.forwardRef((props, refNumPad) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const {
    item,
    key,
    value,
    index,
    totalRow,
    placeholderText,
    handerNumberChange,
    upload,
    editable,
    containerStyle,
    inputStyle,
    iconSize,
    iconColor,
    iconStyle,
    showIcon = true,
    reloadNum,
  } = props;
  const [refInput, _unSet] = useState({});
  const [_, setMutate] = useState(false);
  useEffect(() => {
    setMutate(e => !e);
    return;
  }, [reloadNum]);
  const downAction = () => {
    const e = !isNaN(value) && value > 0 ? parseInt(value) - 1 : null;
    handerNumberChange !== undefined && handerNumberChange(item, e);
  };
  const upAction = () => {
    const e = value === null || isNaN(value) ? 1 : parseInt(value) + 1;
    handerNumberChange !== undefined && handerNumberChange(item, e);
  };
  const onNumInput = (item, i) => {
    var num = i.length > 0 ? i.toString().replace(/,/g, '') : '';
    const e = isNaN(parseInt(num)) ? null : parseInt(num);
    handerNumberChange !== undefined && handerNumberChange(item, e);
  };
  return (
    <View
      style={{ ...containerStyle, flexDirection: 'row', alignItems: 'center' }}
    >
      {
        showIcon && (
          // <View style={{ alignItems: 'center', backgroundColor: "red" }}>
          <TouchableOpacity
            onPress={downAction}
            disabled={upload}
            style={{ paddingVertical: 3, paddingHorizontal: 5 }}
          >
            <SpiralIcon
              color={iconColor ? iconColor : appcolor.light}
              style={{
                ...iconStyle,
                backgroundColor: appcolor.dark,
                padding: 3,
                width: iconSize ? iconSize + 7 : 25,
                height: iconSize ? iconSize + 7 : 25,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 50,
              }}
              size={iconSize ? iconSize : 13}
              name="minus"
              type="font-awesome-5"
            />
          </TouchableOpacity>
        )
        // </View>
      }
      <View
        style={{
          flexGrow: 1,
          minWidth: 40,
          alignItems: 'center',
          marginHorizontal: 3,
        }}
      >
        <TextInput
          keyboardType="number-pad"
          onChangeText={e => onNumInput(item, e)}
          autoCapitalize="none"
          ref={e => (refInput[index] = e)}
          selectTextOnFocus
          placeholder={placeholderText}
          placeholderTextColor={appcolor.placeholderText}
          editable={editable != undefined ? editable : !upload}
          key={key}
          maxlength={8}
          value={
            value === null || isNaN(value) ? '' : value.toLocaleString('en-US')
          }
          blurOnSubmit={false}
          autoCorrect={false}
          onSubmitEditing={() => {
            totalRow - 1 === index
              ? Keyboard.dismiss()
              : refInput[index + 1]?.focus();
          }}
          // returnKeyType={Platform.OS === 'ios' ? "next" : 'done'}
          style={{
            backgroundColor: upload ? appcolor.lightgray : appcolor.light,
            padding: 8,
            width: '100%',
            borderRadius: 5,
            fontSize: scaleSize(12),
            color: appcolor.dark,
            textAlign: 'center',
            ...inputStyle,
          }}
        />
      </View>
      {
        showIcon && (
          // <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={upAction}
            disabled={upload}
            style={{ paddingVertical: 3, paddingHorizontal: 5 }}
          >
            <SpiralIcon
              name="plus"
              color={iconColor ? iconColor : appcolor.light}
              style={{
                ...iconStyle,
                backgroundColor: appcolor.dark,
                padding: 3,
                width: iconSize ? iconSize + 7 : 25,
                height: iconSize ? iconSize + 7 : 25,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 50,
              }}
              size={iconSize ? iconSize : 13}
              type="font-awesome-5"
            />
          </TouchableOpacity>
        )
        // </View>
      }
    </View>
  );
});
