import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
const LoadingDefault = ({ title, isLoading, color, styles, colorTitle }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  return isLoading ? (
    <View style={[styles, { alignItems: 'center' }]}>
      <View style={{ justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={color || appcolor.dark} />
      </View>
      <Text
        style={{
          padding: 5,
          color: colorTitle ? colorTitle : appcolor.primary,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {title || 'Đang tải...'}
      </Text>
    </View>
  ) : null;
};
export default LoadingDefault;
