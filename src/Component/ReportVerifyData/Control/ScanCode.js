import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import BarcodeMask from 'react-native-barcode-mask';
import { RNCamera } from 'react-native-camera';
import { useSelector } from 'react-redux';
import { deviceHeight, deviceWidth } from '../../../Themes/AppsStyle';

export const ScanCode = ({ onReadCode }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const handlerReadCode = event => {
    onReadCode(event.data);
  };

  const styles = StyleSheet.create({
    mainContainer: { width: deviceWidth, height: 300 },
  });
  return (
    <View style={styles.mainContainer}>
      <RNCamera
        style={{ flex: 1 }}
        captureAudio={false}
        onBarCodeRead={handlerReadCode}
      >
        <View style={{ width: deviceWidth, height: 300 }}>
          <BarcodeMask width={300} height={200} />
        </View>
      </RNCamera>
    </View>
  );
};
