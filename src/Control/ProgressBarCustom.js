import React, { useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { useSelector } from 'react-redux';
const ProgressBarCustom = ({
  viewPercent = false,
  progressValue,
  titleValue,
  titleName,
  colorPercent,
  colorValuePercent,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const animation = new Animated.Value(0);
  const styles = StyleSheet.create({
    mainContainer: {
      width: '95%',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 16,
      marginBottom: 8,
      backgroundColor: appcolor.homebackground,
    },
    innerStyle: {
      width: '100%',
      height: 8,
      borderRadius: 8,
      backgroundColor: appcolor.secondary,
    },
    label: {
      width: '50%',
      fontSize: 14,
      color: appcolor.light,
      textAlign: 'right',
      padding: 5,
    },
    labelPercent: {
      fontSize: 13,
      color: colorValuePercent || appcolor.dark,
      position: 'absolute',
      zIndex: 1,
      alignSelf: 'center',
      fontWeight: '700',
    },
  });
  return (
    <View style={{ width: '100%' }}>
      {viewPercent ? (
        <View style={styles.mainContainer}>
          <Animated.Text style={[styles.labelPercent]}>
            {progressValue}%
          </Animated.Text>
          <Animated.View
            style={[
              styles.innerStyle,
              {
                width: progressValue > 100 ? '100%' : `${progressValue}%`,
                height: 21,
                backgroundColor: colorPercent || appcolor.yellowdark,
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <Animated.Text style={[styles.label, { textAlign: 'left' }]}>
              {titleName}
            </Animated.Text>
            <Animated.Text style={styles.label}>{titleValue}</Animated.Text>
          </View>
          <Animated.View
            style={[styles.innerStyle, { width: progressValue + '%' }]}
          />
        </View>
      )}
    </View>
  );
};

export default ProgressBarCustom;
