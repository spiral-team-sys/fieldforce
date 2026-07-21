import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BackHandler, LogBox } from 'react-native';
import store from './src/Redux/store';
import AppNavigator from './src/AppNavigator';
import { enableFreeze, enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/Context/AppContext';
import { NotificationProvider } from './src/Context/NotificationContext';
import { ReportProvider } from './src/Context/ReportContext';
import NotificationModal from './src/Component/Notification/Modal/NotificationModal';
import AdhocModal from './src/Component/Adhoc/AdhocModal';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/Utils/configToast';
import { FIREBASE } from './src/Utils/Firebase/Messaging/firebaseMessaging';
import { NotificationModalProvider } from './src/Context/NotificationModalContext';
import { showNotificationModalRef } from './src/Component/Notification/Modal/NotificationModalRef';
import CodePushManager from './src/Component/CodePush/CodePushManager';
import CodePush from '@revopush/react-native-code-push';
// import { APPCHECK } from './src/Utils/Firebase/AppCheck/firebaseAppCheck';

LogBox.ignoreLogs(["Battery state `unknown` and monitoring disabled, this is normal for simulators and tvOS"]);

enableFreeze(true);
enableScreens(false);

const App: React.FC = () => {
  useEffect(() => {
    CodePush.notifyAppReady();
    FIREBASE.initializeFirebaseMessaging();
    // APPCHECK.initializeAppCheck();
    // Foreground
    const unsubMessage = FIREBASE.onMessageReceived((remoteMessage: any) => {
      showNotificationModalRef(remoteMessage);
    });
    // Open from background
    const unsubOpened = FIREBASE.onNotificationOpenedApp((remoteMessage: any) => {
      showNotificationModalRef(remoteMessage);
    });
    // Kill state
    FIREBASE.getInitialNotification((remoteMessage: any) => {
      showNotificationModalRef(remoteMessage);
    });
    return () => {
      unsubMessage?.();
      unsubOpened?.();
    };
  }, []);
  // useEffect(() => {
  //   const checkSecurity = async () => {
  //     const isSecure = await APPCHECK.verifyDeviceSecurity();
  //     if (!isSecure) {
  //       BackHandler.exitApp();
  //     }
  //   };

  //   checkSecurity();
  // }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppProvider>
            <NotificationProvider>
              <NotificationModalProvider>
                <ReportProvider>
                  <AppNavigator />
                  <NotificationModal />
                  <AdhocModal />
                  <CodePushManager />
                  <Toast config={toastConfig} />
                </ReportProvider>
              </NotificationModalProvider>
            </NotificationProvider>
          </AppProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
