import React from 'react';
import { View } from 'react-native';
import { SPagerView } from 'react-native-pager-view';
import { useSelector } from 'react-redux';
export const GuiLine = () => {
  const { appcolor } = useSelector(state => state.GAppState);
  return (
    <View
      style={{ backgroundColor: appcolor.dark, height: '100%', width: '100%' }}
    >
      <SPagerView
        style={{
          flex: 1,
          height: '100%',
          width: '100%',
          backgroundColor: 'red',
        }}
        initialPage={0}
        showPageIndicator
      >
        <View style={{ backgroundColor: appcolor.dark }} key="1">
          <Text>First page</Text>
        </View>
        <View key="2">
          <Text>Second page</Text>
        </View>
        <View key="3">
          <Text>3 page</Text>
        </View>
        <View key="4">
          <Text>4 page</Text>
        </View>
        <View key="5">
          <Text>5 page</Text>
        </View>
        <View key="6">
          <Text>6 page</Text>
        </View>
      </SPagerView>
    </View>
  );
};
