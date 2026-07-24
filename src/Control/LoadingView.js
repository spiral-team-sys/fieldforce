import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
const LoadingView = ({ title, isLoading, styles }) => {
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
    <View style={[styles, { alignItems: 'center' }]}>
      <View
        style={{
          position: 'absolute',
          justifyContent: 'center',
          height: 120,
          width: 120,
        }}
      >
        <LottieView
          autoPlay
          style={{ height: '100%' }}
          source={require('../Themes/lotties/loading.json')}
        />
        <Text
          style={{
            color: appcolor.white,
            position: 'absolute',
            fontWeight: 'bold',
            textAlign: 'center',
            width: '100%',
            fontSize: 32,
          }}
        >
          {count}
        </Text>
      </View>
      <Text style={{ padding: 5, color: appcolor.primary, fontWeight: '700' }}>
        {title || 'Đang tải...'}
      </Text>
    </View>
  ) : null;
};
export default LoadingView;
