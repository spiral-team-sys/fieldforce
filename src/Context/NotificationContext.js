import { createContext, useEffect, useState } from 'react';
import useApp from '../Hooks/useApp';
import { getTotalNotification } from '../Controller/NotificationController';
import { DeviceEventEmitter } from 'react-native';
import { useSelector } from 'react-redux';
import { stat } from 'react-native-fs';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { userinfo } = useSelector(state => state.GAppState);
  const [countNotification, setCountNotification] = useState(0);

  const handlerCountNotification = async () => {
    if (userinfo.employeeId)
      await getTotalNotification(count => {
        setCountNotification(count);
        DeviceEventEmitter.emit('RELOAD_NOTIFY_LIST');
      });
  };
  //
  useEffect(() => {
    handlerCountNotification();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ countNotification, handlerCountNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
