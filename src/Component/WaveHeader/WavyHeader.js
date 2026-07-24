import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
export default function WavyHeader({ customStyles, flip }) {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  return (
    <View style={customStyles}>
      <View style={{ height: 160 }}></View>
    </View>
  );
}
