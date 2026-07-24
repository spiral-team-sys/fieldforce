import { Text } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../../Content/FormGroup';
import {
  getItemInputType,
  getKeyboardType,
  mergeListInputItems,
  sanitizeItemValue,
} from './ItemHelpers';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

const ItemInputList = ({ item, onUpdateItem }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [listInputs, setListInputs] = useState([]);

  const loadData = () => {
    setListInputs(mergeListInputItems(item));
  };

  const updateItemValue = (data = []) => {
    const payload = data
      .filter(inputItem => {
        const value = inputItem?.Value;
        return (
          value !== null && value !== undefined && `${value}`.trim() !== ''
        );
      })
      .map(inputItem => ({
        ItemId: inputItem.ItemId,
        ItemName: inputItem.ItemName,
        ItemType: inputItem.ItemType,
        Value: `${inputItem.Value ?? ''}`,
      }));

    item.Value = payload.length > 0 ? JSON.stringify(payload) : '';
    onUpdateItem && onUpdateItem(item);
  };

  useEffect(() => {
    loadData();
  }, [item]);

  const onChangeValue = (index, text) => {
    const currentItem = listInputs[index] || {};
    const valueMain = sanitizeItemValue(text, currentItem.ItemType);

    const nextItems = listInputs.map((inputItem, itemIndex) => {
      if (itemIndex !== index) return inputItem;
      return { ...inputItem, Value: valueMain };
    });

    setListInputs(nextItems);
    updateItemValue(nextItems);
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: { paddingBottom: 16, borderRadius: 10 },
    itemContainerError: { borderColor: appcolor.red },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 6,
    },
    inputContainer: { marginBottom: 0 },
    inputStyle: { fontSize: 12, color: appcolor.dark, minHeight: 44 },
  });

  return (
    <View style={styles.mainContainer}>
      {listInputs.map((inputItem, index) => {
        const inputType = getItemInputType(inputItem?.ItemType);
        const inputValue = `${inputItem?.Value || ''}`;
        return (
          <View
            key={`${inputItem.ItemId}_${index}`}
            style={styles.itemContainer}
          >
            <Text style={styles.titleName}>{inputItem.ItemName}</Text>
            <FormGroup
              editable={true}
              useClearAndroid={false}
              keyboardType={getKeyboardType(inputType)}
              placeholder={`Nhập ${inputItem.ItemName.toLowerCase()}`}
              value={inputValue}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputStyle}
              multiline={inputType === 'text'}
              handleChangeForm={text => onChangeValue(index, text)}
            />
          </View>
        );
      })}
    </View>
  );
};

export default ItemInputList;
