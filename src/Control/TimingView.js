import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../Core/Utility';
import { scaleSize } from '../Themes/AppsStyle';
export const TimingView = ({}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const tDay = new Date();
  const totalDay = new Date(
    tDay.getFullYear(),
    tDay.getMonth() + 1,
    0,
  ).getDate();
  const currentDay = tDay.getDate();
  const processWith =
    (deviceWidth / totalDay) * (currentDay < 4 ? 3 : currentDay);
  const percent = ((currentDay / totalDay) * 100).toFixed(2);

  const styles = StyleSheet.create({
    container: { width: deviceWidth },
    barBg: {
      width: '96%',
      height: 24,
      backgroundColor: appcolor.light,
      borderRadius: 14,
      overflow: 'hidden',
      justifyContent: 'center',
    },
    barProcess: {
      height: 24,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    percentText: {
      position: 'absolute',
      left: 18,
      fontSize: scaleSize(15),
      fontWeight: '700',
      color: percent < 10 ? appcolor.dark : appcolor.white,
      zIndex: 2,
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barProcess,
            {
              width:
                processWith > deviceWidth - 40 ? deviceWidth - 40 : processWith,
              backgroundColor:
                currentDay > 20
                  ? appcolor.danger
                  : currentDay > 12
                  ? appcolor.warning
                  : appcolor.success,
            },
          ]}
        />
        <Text style={styles.percentText}>
          {percent > 100 ? 100 : percent} %
        </Text>
      </View>
    </View>
  );
};
