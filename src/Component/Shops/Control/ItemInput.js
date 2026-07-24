import React, { forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon } from '@rneui/themed';
import FormGroup from '../../../Content/FormGroup';

const ItemInput = forwardRef((props, _ref) => {
  const {
    titleName,
    iconName,
    isRequire,
    onActionRight,
    typeFilter,
    itemValue,
    placeholder,
    onChangeText,
    keyboardType = 'default',
    editable = true,
    isViewInput = true,
    mobileLength = false,
  } = props;
  const { appcolor } = useSelector(state => state.GAppState);
  const widthItem = onActionRight !== undefined ? '86%' : '100%';
  const styles = StyleSheet.create({
    mainItem: { flexGrow: 1, padding: 8, marginBottom: 1 },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    inputView: {
      width: widthItem,
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      marginBottom: 0,
    },
  });
  const onPress = () => {
    onActionRight(typeFilter, itemValue);
  };
  const handlerChangeValue = text => {
    onChangeText !== undefined && onChangeText(text, typeFilter);
  };
  return (
    <View style={styles.mainItem}>
      <View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
        {iconName && (
          <SpiralIcon
            name={iconName}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
        )}
        {titleName && (
          <Text style={styles.titleHeader}>
            {`${titleName} `}
            {isRequire && (
              <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
            )}
          </Text>
        )}
      </View>
      {placeholder && (
        <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
      )}
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        {isViewInput && (
          <FormGroup
            keyboardType={keyboardType}
            containerStyle={styles.inputView}
            editable={editable}
            multiline
            selectTextOnFocus={true}
            useClearAndroid={false}
            value={itemValue}
            maxLength={mobileLength ? 10 : 10000}
            handleChangeForm={handlerChangeValue}
          />
        )}
        {onActionRight !== undefined && (
          <TouchableOpacity
            style={{
              width: '10%',
              padding: 10,
              marginStart: 10,
              backgroundColor: appcolor.info,
              borderRadius: 50,
            }}
            onPress={onPress}
          >
            <SpiralIcon
              type="font-awesome-5"
              name="search"
              size={18}
              color={appcolor.light}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
export default ItemInput;
