import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../../Content/FormGroup';
import {
  getItemInputType,
  getKeyboardType,
  sanitizeItemValue,
} from './ItemHelpers';

const ItemInput = ({ item, onUpdateItem }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [valueInput, setValueInput] = useState('');

  const inputType = getItemInputType(item?.ItemType);

  const getInitialValue = () => {
    return `${item?.Value || ''}`;
  };

  const onChangeValue = text => {
    const valueMain = sanitizeItemValue(text, inputType);
    item.Value = valueMain;
    setValueInput(valueMain);
    onUpdateItem && onUpdateItem(item);
  };

  useEffect(() => {
    setValueInput(getInitialValue());
  }, [item]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    inputContainer: {
      borderRadius: 8,
      borderColor: valueInput ? appcolor.grayLight : appcolor.red,
      borderWidth: 0.5,
      marginTop: 8,
    },
    inputStyle: { fontSize: 12, color: appcolor.dark },
  });

  return (
    <View style={styles.mainContainer}>
      <FormGroup
        editable={true}
        multiline={inputType === 'text'}
        useClearAndroid={false}
        keyboardType={getKeyboardType(inputType)}
        placeholder={
          item?.DescriptionName ||
          `Nhập ${item?.ItemName?.toLowerCase() || 'thông tin'}`
        }
        value={valueInput}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputStyle}
        handleChangeForm={onChangeValue}
      />
    </View>
  );
};

export default ItemInput;
