import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const NumberInput = ({
  titleName,
  iconName,
  isRequire,
  typeFilter,
  itemValue,
  placeholder,
  onChangeText,
  keyboardType = 'numeric',
  editable = true,
  isViewInput = true,
  mobileLength = false,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
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
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      marginBottom: 0,
      marginEnd: 16,
    },
    viewItem: {
      fontSize: 16,
      fontWeight: '600',
      color: appcolor.dark,
      margin: 10,
    },
  });
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
            placeholder={placeholder}
            keyboardType={keyboardType}
            containerStyle={styles.inputView}
            editable={editable}
            multiline
            selectTextOnFocus={true}
            useClearAndroid={false}
            value={itemValue?.toString()}
            maxLength={mobileLength ? 10 : 10000}
            handleChangeForm={handlerChangeValue}
          />
        )}
      </View>
    </View>
  );
};

export default NumberInput;
