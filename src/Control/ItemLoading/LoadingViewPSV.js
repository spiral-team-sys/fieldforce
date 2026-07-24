import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
const LoadingViewPSV = ({ title, isLoading, styles, isHome = false }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [count, setCount] = useState(30);
  useEffect(() => {
    isLoading === false && setCount(30);
    let interval = setTimeout(() => {
      if (count !== 0) setCount(count - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [count]);
  return isLoading ? (
    <View style={[styles, { width: '100%', alignItems: 'center' }]}>
      <View
        style={{ position: 'absolute', alignItems: 'center', marginTop: 8 }}
      >
        {isHome && (
          <Text
            style={{ color: appcolor.redgray, fontWeight: '700' }}
          >{`${count}`}</Text>
        )}
        <Text style={{ color: appcolor.redgray, fontWeight: '700' }}>{`${
          title || 'Đang tải dữ liệu'
        }`}</Text>
      </View>
      <LottieView
        style={{ width: 100, height: 80, marginTop: 3 }}
        autoPlay
        source={require('../../Themes/lotties/loadingpsv.json')}
      />
    </View>
  ) : null;
};
export default LoadingViewPSV;
