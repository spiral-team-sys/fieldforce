import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { REQUEST_TYPES } from '../StoreRequestUtils';

const RequestTypeTabs = ({ value, onChange }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 8 },
    item: {
      flexGrow: 1,
      minWidth: 96,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    itemActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    text: {
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    textActive: { color: appcolor.light },
  });

  return (
    <View style={styles.container}>
      {REQUEST_TYPES.map(item => {
        const isActive = value === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => onChange(item.value)}
          >
            <Text
              style={[styles.text, isActive && styles.textActive]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RequestTypeTabs;
