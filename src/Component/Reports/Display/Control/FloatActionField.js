import React, { forwardRef, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../../Content/FormGroup';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const FloatActionField = forwardRef((props, ref) => {
  const { type, item, keyValue, index, onEditing, handlerEndEditing, bottom } =
    props;
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemUpdate, setItemUdpate] = useState({});
  const [typeAction, setTypeAction] = useState(false);
  //
  // Handler
  const onChangeText = text => {
    const updatedItem = { ...item };
    switch (type) {
      case 'PRICE':
        updatedItem.Price = text;
        break;
      case 'DISPLAY':
        updatedItem.Display = text;
        break;
      case 'NOTE':
        updatedItem.Note = text;
        break;
    }
    onEditing(updatedItem);
  };
  const onEndInput = () => {
    if (type !== null && type.length > 0) {
      setItemUdpate({});
      setTypeAction(null);
      handlerEndEditing();
    }
  };
  //
  useEffect(() => {
    setItemUdpate(item);
    setTypeAction(type);
  }, [item, type]);

  useEffect(() => {
    if (typeAction && typeAction.length > 0 && ref?.current) {
      if (Platform.OS === 'ios') {
        const timer = setTimeout(() => ref.current?.focus(), 200);
        return () => clearTimeout(timer);
      } else {
        ref.current.focus();
      }
    }
  }, [typeAction]);

  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      padding: 8,
      position: 'absolute',
      bottom: bottom || (Platform.OS === 'ios' ? 96 : 72),
      backgroundColor: appcolor.light,
      zIndex: 10000,
    },
    inputContainer: {
      width: '100%',
      padding: 3,
      backgroundColor: appcolor.dark,
    },
    inputStyle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
  });
  return (
    typeAction !== null &&
    typeAction.length > 0 && (
      <View
        key={`${type}_${index}_${itemUpdate.ProductId}`}
        style={styles.mainContainer}
      >
        <FormGroup
          inputRefFull={ref}
          editable
          defaultValue={
            itemUpdate[keyValue] !== undefined && itemUpdate[keyValue] !== null
              ? itemUpdate[keyValue].toString()
              : ''
          }
          placeholder={
            typeAction == 'NOTE'
              ? `Ghi chú`
              : `${itemUpdate?.ProductName || ''}`
          }
          useClearAndroid={false}
          isFocusable
          selectTextOnFocus
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          keyboardType={typeAction == 'NOTE' ? 'default' : 'numeric'}
          blurOnSubmit={false}
          handleChangeForm={onChangeText}
          onEndEditing={onEndInput}
          onSubmitEditing={onEndInput}
        />
      </View>
    )
  );
});
