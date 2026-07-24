import { useContext } from 'react';
import { NotificationModalContext } from '../Context/NotificationModalContext';

const useNotificationModal = () => {
  const { visible, notifyData, showNotificationModal, hideNotificationModal } =
    useContext(NotificationModalContext);
  return { visible, notifyData, showNotificationModal, hideNotificationModal };
};

export default useNotificationModal;
