import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Slider } from '@rneui/themed';

const SliderView = ({
  titleName,
  iconName,
  isRequire,
  typeFilter,
  itemValue,
  placeholder,
  onChangeText,
  maxLength,
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
      width: '30%',
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
    itemValue = text;
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
      <Slider
        step={1}
        orientation="horizontal"
        //
        style={{ width: '80%', alignSelf: 'center' }}
        thumbStyle={{ height: 20, width: 20 }}
        thumbTintColor={appcolor.dark}
        thumbTouchSize={{ width: 20, height: 20 }}
        trackStyle={{ height: 5, borderRadius: 20 }}
        //
        maximumTrackTintColor={appcolor.grayLight}
        minimumTrackTintColor={appcolor.redgray}
        maximumValue={maxLength}
        minimumValue={0}
        //
        value={itemValue}
        onSlidingComplete={handlerChangeValue}
      />
    </View>
  );
};

export default SliderView;
