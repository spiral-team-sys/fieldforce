import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
const LoadingViewAqua = ({ title, isLoading, styles, isHome = false }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  return isLoading ? (
    <View style={[styles, { width: '100%', alignItems: 'center' }]}>
      <View
        style={{ position: 'absolute', alignItems: 'center', marginTop: 8 }}
      >
        <Text style={{ color: appcolor.redgray, fontWeight: '700' }}>{`${
          title || 'Đang tải dữ liệu'
        }`}</Text>
      </View>
      <LottieView
        style={{ width: 100, height: 70, marginTop: 3 }}
        autoPlay
        source={require('../../Themes/lotties/loadingpsv.json')}
      />
    </View>
  ) : null;
};
export default LoadingViewAqua;
