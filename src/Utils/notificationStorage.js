import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_NOTIFICATIONS_KEY = 'PENDING_NOTIFICATIONS';
const normalizeNotificationPayload = remoteMessage => {
  if (!remoteMessage) return null;

  return {
    messageId: remoteMessage?.messageId || remoteMessage?.message_id || null,
    sentTime: remoteMessage?.sentTime || null,
    notification: remoteMessage?.notification || null,
    data: remoteMessage?.data || {},
    _savedAt: Date.now(),
  };
};

export const getNotificationKey = remoteMessage => {
  const messageId =
    remoteMessage?.messageId ||
    remoteMessage?.message_id ||
    remoteMessage?.data?.messageId ||
    remoteMessage?.data?.message_id;
  if (messageId) return `id:${messageId}`;
  const title = remoteMessage?.notification?.title || '';
  const body = remoteMessage?.notification?.body || '';
  const sentTime = remoteMessage?.sentTime || remoteMessage?._savedAt || '';
  return `fallback:${title}::${body}::${sentTime}`;
};

//
export const savePendingNotification = async remoteMessage => {
  console.log(remoteMessage, 'Saving pending notification');

  try {
    const payload = normalizeNotificationPayload(remoteMessage);
    if (!payload) return;

    const currentRaw = await AsyncStorage.getItem(PENDING_NOTIFICATIONS_KEY);
    const current =
      currentRaw !== null && currentRaw !== '[]' ? JSON.parse(currentRaw) : [];
    const next = Array.isArray(current) ? current : [];
    next.push(payload);

    await AsyncStorage.setItem(PENDING_NOTIFICATIONS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Save pending notification error:', error);
  }
};
export const getPendingNotifications = async () => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_NOTIFICATIONS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error('Get pending notifications error:', error);
    return [];
  }
};
export const clearPendingNotifications = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Clear pending notifications error:', error);
  }
};
