import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';

const OTTimeItem = ({ appcolor, disabled, isSelected, item, onSelect }) => {
  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  const handlePress = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.container,
        isSelected && styles.containerActive,
        disabled && styles.containerDisabled,
      ]}
      onPress={handlePress}
    >
      <Text style={[styles.value, isSelected && styles.valueActive]}>
        {item.ref_Code}h
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    container: {
      minWidth: 96,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: appcolor.surface,
      backgroundColor: appcolor.light,
      marginRight: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      justifyContent: 'center',
      position: 'relative',
    },
    containerActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    containerDisabled: {
      opacity: 0.72,
    },
    value: {
      color: appcolor.primary,
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
    },
    valueActive: {
      color: appcolor.light,
    },
    checkIcon: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: appcolor.success,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default memo(OTTimeItem);
