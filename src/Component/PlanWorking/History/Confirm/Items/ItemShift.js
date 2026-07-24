import React from 'react';
import { View, Text } from 'react-native';

const ItemShift = ({ item, styles, appcolor }) => (
  <View style={{ flex: 1 }}>
    {item.LastChangeName !== undefined && (
      <Text style={styles.textItem}>{item.LastChangeName}</Text>
    )}
    {item.NoteShift !== undefined && (
      <Text style={styles.textItem}>{item.NoteShift}</Text>
    )}
    {item.ConfirmNote !== undefined && (
      <Text style={[styles.textItem, { color: appcolor.danger }]}>
        {item.ConfirmNote}
      </Text>
    )}
  </View>
);

export default ItemShift;
