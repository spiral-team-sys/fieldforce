import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
} from 'react-native';
import { Icon } from '@rneui/themed';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from 'react-native-vision-camera';
import LottieView from 'lottie-react-native';
const ROI_SIZE = 180;

export const QRCodeScan = ({ navigation, route }) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [zoomRatio, setZoomRatio] = useState(0);
  const zoomRef = useRef(0);
  const scannedRef = useRef(false);

  const getZoomValue = ratio => {
    if (!device) return 1;
    if (Platform.OS === 'ios') return 1;
    //
    const min = device.minZoom ?? 1;
    const max = Math.min(device.maxZoom ?? 1, 8);
    return min + ratio * (max - min);
  };
  const smoothZoom = target => {
    if (zoomRef.current === target) return;
    const step = target > zoomRef.current ? 0.06 : -0.06;
    const i = setInterval(() => {
      zoomRef.current += step;
      if (
        (step > 0 && zoomRef.current >= target) ||
        (step < 0 && zoomRef.current <= target)
      ) {
        zoomRef.current = target;
        clearInterval(i);
      }

      setZoomRatio(Math.max(0, Math.min(1, zoomRef.current)));
    }, 16);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'code-128', 'pdf-417'],
    onCodeScanned: codes => {
      if (scannedRef.current) return;
      if (!codes?.length) return;
      scannedRef.current = true;
      route.params?.onSuccess?.(codes[0].value);
      navigation.goBack();
    },
  });

  useEffect(() => {
    if (!hasPermission) requestPermission();
    const t = setTimeout(() => {
      smoothZoom(0.2);
    }, 300);
    return () => clearTimeout(t);
  }, [hasPermission]);

  if (!hasPermission || !device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Ứng dụng cần quyền truy cập camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
        >
          <Text style={{ color: 'white' }}>Cấp quyền camera</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Camera
        device={device}
        isActive
        style={StyleSheet.absoluteFill}
        codeScanner={codeScanner}
        zoom={getZoomValue(zoomRatio)}
        pixelFormat="yuv"
        enableZoomGesture
      />

      <View style={styles.overlay}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../../../Themes/lotties/qrcode.json')}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.close}
      >
        <SpiralIcon name="close" raised />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainer: {
    width: ROI_SIZE,
    height: ROI_SIZE,
  },
  close: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  permissionText: {
    color: 'white',
    marginTop: 50,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 6,
  },
});
