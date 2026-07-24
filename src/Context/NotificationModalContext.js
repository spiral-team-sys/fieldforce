import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearNotificationModalHandler,
  registerNotificationModalHandler,
} from '../Component/Notification/Modal/NotificationModalRef';
import {
  clearPendingNotifications,
  getPendingNotifications,
} from '../Utils/notificationStorage';
import {
  checkSeenInApp,
  fetchDataNotify,
} from '../Controller/NotificationController';
import { GetEmployeeInfo } from '../Core/Helper';
import { NotificationAPI } from '../API/NotificationAPI';

export const NotificationModalContext = createContext();
const LAST_DISMISSED_INAPP_ID_KEY = 'LAST_DISMISSED_INAPP_ID';

export const NotificationModalProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [notifyData, setNotifyData] = useState(null);
  const [, setQueue] = useState([]);
  const appStateRef = useRef(AppState.currentState);
  const notifyDataRef = useRef(null);
  const visibleRef = useRef(false);
  const isLoadingPendingRef = useRef(false);
  const isLoadingInAppRef = useRef(false);

  const showNotificationModal = useCallback(payload => {
    if (visibleRef.current) {
      return;
    }
    visibleRef.current = true;
    notifyDataRef.current = payload;
    setNotifyData(payload);
    setVisible(true);
  }, []);

  const markInAppDismissed = useCallback(async payload => {
    const type = payload?.data?.messageType || payload?.data?.type;
    const inAppId = payload?.data?.newsId || payload?.data?.messengerId;
    if (type === 'InApp' && inAppId) {
      await AsyncStorage.setItem(LAST_DISMISSED_INAPP_ID_KEY, `${inAppId}`);
    }
  }, []);

  const hideNotificationModal = useCallback(async () => {
    await markInAppDismissed(notifyDataRef.current);
    setQueue(prev => {
      if (prev.length > 0) {
        const [next, ...rest] = prev;
        notifyDataRef.current = next;
        setNotifyData(next);
        setVisible(true);
        visibleRef.current = true;
        return rest;
      }
      visibleRef.current = false;
      notifyDataRef.current = null;
      setVisible(false);
      setNotifyData(null);
      return [];
    });
    clearPendingNotifications();
  }, [markInAppDismissed]);

  const loadPendingNotifications = useCallback(async () => {
    if (isLoadingPendingRef.current) {
      return;
    }
    isLoadingPendingRef.current = true;
    try {
      const pending = await getPendingNotifications();
      if (pending.length > 0) {
        pending.forEach(item => showNotificationModal(item));
        await clearPendingNotifications();
      }
    } finally {
      isLoadingPendingRef.current = false;
    }
  }, [showNotificationModal]);

  const getInAppMessage = useCallback(async () => {
    if (isLoadingInAppRef.current) {
      return;
    }
    isLoadingInAppRef.current = true;
    try {
      await fetchDataNotify(async () => {
        const userinfo = await GetEmployeeInfo();
        if (userinfo.employeeId === undefined) {
          return;
        }
        let messageId = 0;
        const lstInApp = await checkSeenInApp();
        if (lstInApp.length > 0) {
          messageId = lstInApp[0].max || 0;
        }
        if (messageId <= 0) {
          return;
        }
        const result = await NotificationAPI.GetInApp(messageId, 0);
        if (result.statusId === 200 && result?.data?.length > 0) {
          const item = result.data[0];
          const inAppId = item?.id || messageId;
          const lastDismissedInAppId = await AsyncStorage.getItem(
            LAST_DISMISSED_INAPP_ID_KEY,
          );
          if (lastDismissedInAppId === `${inAppId}`) {
            return;
          }
          showNotificationModal({
            messageId: `inapp:${inAppId}`,
            notification: {
              title: item?.title || 'Thông báo',
              body: item?.body || '',
            },
            data: {
              messageType: 'InApp',
              newsId: `${inAppId}`,
              messengerId: `${inAppId}`,
            },
            sentTime: Date.now(),
          });
        }
      });
    } finally {
      isLoadingInAppRef.current = false;
    }
  }, [showNotificationModal]);

  useEffect(() => {
    registerNotificationModalHandler(showNotificationModal);
    //
    loadPendingNotifications();
    getInAppMessage();
    const subscription = AppState.addEventListener('change', nextState => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;
      if (prevState.match(/inactive|background/) && nextState === 'active') {
        loadPendingNotifications();
        getInAppMessage();
      }
    });
    return () => {
      subscription?.remove?.();
      clearNotificationModalHandler();
    };
  }, [getInAppMessage, loadPendingNotifications, showNotificationModal]);

  return (
    <NotificationModalContext.Provider
      value={{
        visible,
        notifyData,
        showNotificationModal,
        hideNotificationModal,
      }}
    >
      {children}
    </NotificationModalContext.Provider>
  );
};
