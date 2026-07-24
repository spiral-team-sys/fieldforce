import React from 'react';
import { View, Text } from 'react-native';

const ItemLate = ({ item, styles, appcolor }) => (
  <View style={{ flex: 1 }}>
    {item.TimeLate !== undefined && (
      <Text style={styles.textItem}>{item.TimeLate}</Text>
    )}
    {item.NoteLate !== undefined && (
      <Text style={styles.textItem}>{item.NoteLate}</Text>
    )}
    {item.ConfirmNoteLate !== undefined && (
      <Text style={[styles.textItem, { color: appcolor.danger }]}>
        {item.ConfirmNoteLate}
      </Text>
    )}
  </View>
);

export default ItemLate;
