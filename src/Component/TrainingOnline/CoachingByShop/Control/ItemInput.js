import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../../Content/FormGroup';

export const ItemInput = ({
  typeKeyboard = 'default',
  handlerChangeText,
  defaultValue = null,
  isUploaded = false,
  placeholderText = null,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    itemMain: { padding: 8, paddingTop: 0, paddingBottom: 0 },
  });
  return (
    <View style={styles.itemMain}>
      <FormGroup
        editable={!isUploaded}
        keyboardType={typeKeyboard}
        defaultValue={defaultValue}
        placeholder={
          placeholderText || typeKeyboard == 'default'
            ? 'Nhập nội dung'
            : 'Nhập số lượng'
        }
        containerStyle={{ padding: 0 }}
        clearButtonMode="never"
        useClearAndroid={false}
        handleChangeForm={handlerChangeText}
      />
    </View>
  );
};
