import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { deviceWidth } from '../Core/Utility';
import { scaleSize } from '../Themes/AppsStyle';

export const PercentView = ({ actual, target, width }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const percent = target > 0 ? (actual / target) * 100 : 0;
  const value = percent > 100 ? 100 : percent;
  const colorRank =
    value < 60
      ? appcolor.danger
      : value < 80
      ? appcolor.warning
      : appcolor.success;

  return (
    <View style={{ width: width || deviceWidth * 0.9, padding: 8 }}>
      <View
        style={{
          height: 28,
          backgroundColor: appcolor.grayLight,
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: appcolor.black,
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <LinearGradient
          colors={[colorRank, appcolor.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: `${value}%`,
            height: '100%',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <Text
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontSize: scaleSize(14),
            fontWeight: '600',
            color: value > 70 ? appcolor.white : appcolor.red,
          }}
        >
          {value.toFixed(2)} %
        </Text>
      </View>
    </View>
  );
};
