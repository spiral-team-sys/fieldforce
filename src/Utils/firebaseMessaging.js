import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import { toastInfo } from './configToast';

const messaging = getMessaging(getApp());

const requestFCMPermission = async () => {
  try {
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      toastInfo(
        'Thông báo',
        'Quyền thông báo đang bị tắt, vui lòng kiểm tra trong Cài đặt',
      );
    }

    return enabled;
  } catch (error) {
    console.error('FCM permission error:', error);
    return false;
  }
};

const getFCMToken = async () => {
  try {
    const isEmulator = await DeviceInfo.isEmulator();
    if (isEmulator) return 'TEST-TOKEN-123';

    const token = await getToken(messaging);
    return token;
  } catch (error) {
    console.error('Get FCM token error:', error);
    return null;
  }
};

const onMessageReceived = callback => {
  return onMessage(messaging, async remoteMessage => {
    callback?.(remoteMessage);
  });
};

const onNotificationOpenedApp = callback => {
  return messaging.onNotificationOpenedApp(remoteMessage => {
    callback?.(remoteMessage);
  });
};

const getInitialNotification = async callback => {
  const remoteMessage = await messaging.getInitialNotification();
  if (remoteMessage) {
    callback?.(remoteMessage);
  }
};

const onTokenRefreshHandler = callback => {
  return onTokenRefresh(messaging, newToken => {
    callback?.(newToken);
  });
};

const initializeFirebaseMessaging = async () => {
  if (Platform.OS === 'ios') {
    await requestFCMPermission();
  }
};

export const FIREBASE = {
  initializeFirebaseMessaging,
  requestFCMPermission,
  getFCMToken,
  onMessageReceived,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefreshHandler,
};
