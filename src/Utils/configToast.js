import { Platform, StyleSheet } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const paddingTop =
  Platform.OS == 'android' ? (Platform.Version >= 35 ? 0 : 0) : 16;
const styles = StyleSheet.create({
  style: {
    borderLeftColor: '#4BB543',
    height: 80,
    zIndex: 2000,
    marginTop: paddingTop,
  },
  contentContainerStyle: {
    paddingHorizontal: 12,
    flexWrap: 'wrap',
    zIndex: 2000,
  },
  text1Style: { fontSize: 13, fontWeight: 'bold', color: '#212121' },
  text2Style: { fontSize: 12, color: '#212121', fontWeight: '500' },
});
const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={styles.style}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text2NumberOfLines={3}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={{ ...styles.style, borderLeftColor: '#FF2C2C' }}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text2NumberOfLines={3}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={{ ...styles.style, borderLeftColor: '#0096FF' }}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text2NumberOfLines={3}
    />
  ),
};

const toastSuccess = (text1, text2 = '') => {
  Toast.show({
    type: 'success',
    text1: text1,
    text2: text2,
    position: 'top',
  });
};
const toastError = (text1, text2 = '') => {
  Toast.show({
    type: 'error',
    text1: text1,
    text2: text2,
    position: 'top',
  });
};
const toastInfo = (text1, text2 = '') => {
  Toast.show({
    type: 'info',
    text1: text1,
    text2: text2,
    position: 'top',
  });
};

export { Toast, toastConfig, toastSuccess, toastError, toastInfo };
