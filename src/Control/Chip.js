import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { scaleSize } from '../Themes/AppsStyle';

export const Chip = ({
  ChipStyle,
  ContainderStyle,
  iconName,
  iconSize,
  iconColor,
  title,
  onChipPress,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  return (
    <TouchableOpacity style={ChipStyle} onPress={onChipPress}>
      <View style={[ContainderStyle]}>
        {iconName !== undefined && (
          <SpiralIcon
            type="font-awesome-5"
            containerStyle={{ padding: 7 }}
            name={iconName}
            size={iconSize || 12}
            color={iconColor}
          />
        )}
        <Text
          style={{
            fontSize: scaleSize(12),
            alignSelf: 'center',
            color: appcolor.dark,
          }}
        >
          {title || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
