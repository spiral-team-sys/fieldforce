import { Icon, Text } from '@rneui/base';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import SpiralIcon from '../../../../../../Control/Icon/SpiralIcon';

const ScoringHeader = ({ styles, appcolor, item, onClose }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={onClose}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <SpiralIcon
        type="ionicon"
        name="chevron-back"
        size={22}
        color={appcolor.dark}
      />
    </TouchableOpacity>
    <View style={styles.headerLeft}>
      <Text style={styles.headerName} numberOfLines={1}>
        {item?.employeeName || 'Đánh giá'}
      </Text>
      {item?.employeeCode ? (
        <Text style={styles.headerCode}>· {item.employeeCode}</Text>
      ) : null}
    </View>
  </View>
);

export default ScoringHeader;
