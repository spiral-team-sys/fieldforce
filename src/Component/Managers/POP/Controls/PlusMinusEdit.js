import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import FormGroup from '../../../../Content/FormGroup';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { ToastError } from '../../../../Core/Helper';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const PlusMinusEdit = ({
  title = null,
  itemEdit,
  keyValue,
  onChange,
  isDelete = false,
  isEditable = true,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);
  const inputRef = useRef();
  const isValue =
    itemEdit[keyValue] !== undefined && itemEdit[keyValue] !== null;
  //
  const handlerOpenEdit = () => {
    inputRef.current?.focus();
  };
  // Action
  const onEditNumber = text => {
    const value = text !== null ? parseInt(text) : null;
    if (value > itemEdit.Quantity) {
      ToastError(
        `Số lượng đặt hàng không được lớn hơn số lượng kho tổng!!`,
        'Thông báo',
        'top',
      );
      itemEdit[keyValue] = null;
    } else {
      itemEdit[keyValue] = value;
    }
    setMutate(e => !e);
    onChange && onChange(itemEdit);
  };
  const onMinusValue = () => {
    const value = (itemEdit[keyValue] || 0) - 1;
    onEditNumber(value);
  };
  const onPlusValue = () => {
    const value = (itemEdit[keyValue] || 0) + 1;
    onEditNumber(value);
  };
  const onDeleteItem = () => {
    onEditNumber(0);
  };
  //
  useEffect(() => {
    return () => false;
  }, [itemEdit]);
  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    titleHead: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
    },
    headContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    contentContainer: {
      width: '75%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignSelf: 'center',
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      paddingHorizontal: 8,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
    iconDeteleStyle: { width: '20%', marginHorizontal: 4 },
    iconStyle: { marginHorizontal: 4 },
    viewInput: { minWidth: '30%', alignItems: 'center', paddingVertical: 8 },
    titleName: {
      fontSize: 13,
      fontWeight: isValue ? fontWeightBold : '500',
      color: isValue ? appcolor.dark : appcolor.grey,
    },
    titleNumberItem: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
    },
  });
  if (!isEditable)
    return (
      <Text style={styles.titleNumberItem}>{`${title}: ${itemEdit[keyValue] || 0
        }`}</Text>
    );
  if (itemEdit.Quantity == 0) return <View />;
  return (
    <View style={styles.mainContainer}>
      {title && <Text style={styles.titleHead}>{title}</Text>}
      <View style={styles.headContainer}>
        <View style={styles.contentContainer}>
          <SpiralIcon
            type="ionicon"
            name="remove"
            size={24}
            color={appcolor.dark}
            containerStyle={styles.iconStyle}
            onPress={onMinusValue}
          />
          <TouchableOpacity style={styles.viewInput} onPress={handlerOpenEdit}>
            <Text style={styles.titleName}>
              {isValue ? itemEdit[keyValue] : `Số lượng`}
            </Text>
          </TouchableOpacity>
          <SpiralIcon
            type="ionicon"
            name="add"
            size={24}
            color={appcolor.dark}
            containerStyle={styles.iconStyle}
            onPress={onPlusValue}
          />
        </View>
        {isDelete && (
          <SpiralIcon
            type="ionicon"
            name="trash"
            size={24}
            color={appcolor.redgray}
            containerStyle={styles.iconDeteleStyle}
            onPress={onDeleteItem}
          />
        )}
      </View>
      <FormGroup
        inputRefFull={inputRef}
        editable
        selectTextOnFocus
        isFocusable
        keyboardType="numeric"
        value={`${isValue ? itemEdit[keyValue] : ''}`}
        containerStyle={styles.hiddenInput}
        handleChangeForm={onEditNumber}
      />
    </View>
  );
};

export default PlusMinusEdit;
