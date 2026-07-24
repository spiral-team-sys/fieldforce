// inAppNotificationRef.js
let handler = null;

export const registerNotificationModalHandler = fn => {
  handler = fn;
};

export const clearNotificationModalHandler = () => {
  handler = null;
};

export const hasNotificationModalHandler = () => {
  return typeof handler === 'function';
};

export const showNotificationModalRef = payload => {
  handler?.(payload);
};
