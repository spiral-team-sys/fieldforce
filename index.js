/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { savePendingNotification } from './src/Utils/notificationStorage';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const messaging = getMessaging(getApp());
messaging.setBackgroundMessageHandler(async remoteMessage => {
    await savePendingNotification(remoteMessage);
});
messaging.getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
        savePendingNotification(remoteMessage);
    }
});

AppRegistry.registerComponent(appName, () => App);
