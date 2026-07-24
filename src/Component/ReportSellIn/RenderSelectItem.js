import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const RenderSelectItem = ({
  typeView,
  styles,
  selectValue,
  onPress,
  appcolor,
}) => {
  const eventPress = () => {
    onPress(typeView, selectValue);
  };
  return (
    <View
      style={{
        backgroundColor: appcolor.light,
        marginBottom: 5,
        borderRadius: 5,
        padding: 3,
      }}
    >
      <TouchableOpacity onPress={onPress !== undefined ? eventPress : null}>
        <View style={[styles.selectStyle, { flexDirection: 'row' }]}>
          <Text style={{ width: '90%', color: appcolor.dark }}>
            {selectValue}
          </Text>
          <SpiralIcon
            type="font-awesome-5"
            name="chevron-right"
            size={13}
            color={appcolor.dark}
            style={{ paddingHorizontal: 8 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default RenderSelectItem;
