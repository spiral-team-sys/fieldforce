import { getApp } from '@react-native-firebase/app';
import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';
import { alertNotify } from '../Core/Utility';

// Firebase AppCheck
const getTokenAppCheck = async () => {
  try {
    const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
    rnfbProvider.configure({
      android: {
        provider: 'debug',
        debugToken: '420EA3BC-17DB-4612-8F32-56C2415FCF40',
      },
    });

    // Khởi tạo AppCheck
    const appCheck = await initializeAppCheck(getApp(), {
      provider: rnfbProvider,
      isTokenAutoRefreshEnabled: true,
    });
    const token = await appCheck.getToken(false);
    return token?.token;
  } catch (err) {
    return null;
  }
};

export const APPCHECK = { getTokenAppCheck };
