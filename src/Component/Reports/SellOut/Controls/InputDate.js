import React from 'react';
import FormGroup from '../../../../Content/FormGroup';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

const InputDate = ({ item }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const styles = StyleSheet.create({
    searchContainer: { marginBottom: 0, backgroundColor: appcolor.light },
    searchStyle: { fontSize: 13, color: appcolor.dark },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    textRequired: { color: appcolor.red, fontWeight: 'bold' },
  });

  return (
    <FormGroup
      editable
      nonBorder
      noneRadius
      useClearAndroid={false}
      title={item.ItemName}
      placeholder={item.TextValue || 'Nhập dữ liệu'}
      containerStyle={styles.searchContainer}
      inputStyle={styles.searchStyle}
    />
  );
};

export default InputDate;
