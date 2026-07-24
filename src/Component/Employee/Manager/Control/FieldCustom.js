import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../../Content/FormGroup';

export const FieldCustom = ({
  keyItem,
  title,
  value,
  placeholder,
  isWarning,
  titleWarning,
  onInput,
  valueLength = 1000,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const handlerInputChange = text => {
    onInput(keyItem, text);
  };
  const styles = StyleSheet.create({
    inputStyle: {
      borderWidth: 0.5,
      borderRadius: 5,
      borderColor: appcolor.grayLight,
    },
    containerStyle: {
      backgroundColor: appcolor.transparent,
      padding: 8,
      paddingBottom: 0,
      marginBottom: 0,
    },
  });
  return (
    <View style={{ width: '100%' }}>
      <FormGroup
        key={`id_${keyItem}`}
        editable
        nonBorder
        useClearAndroid={false}
        maxLength={valueLength}
        title={title}
        defaultValue={value}
        placeholder={placeholder}
        isWarning={isWarning}
        titleWarning={titleWarning}
        inputStyle={styles.inputStyle}
        containerStyle={styles.containerStyle}
        handleChangeForm={handlerInputChange}
      />
    </View>
  );
};
