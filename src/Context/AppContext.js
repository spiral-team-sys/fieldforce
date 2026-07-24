import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTH_SESSION_EXPIRED_EVENT,
  defaultSetting,
  GetEmployeeInfo,
} from '../Core/Helper';
import { SetTheme, SetUserInfo } from '../Redux/action';
import { useDispatch } from 'react-redux';
import { alertConfirm, TODAY } from '../Core/Utility';
import { onLogout, RemoveUser } from '../Controller/UserController';
import { DeviceEventEmitter } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNRestart from 'react-native-restart-newarch';
import { toastError } from '../Utils/configToast';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userinfo, setUserInfo] = useState(false);
  const [mode, setMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch();

  const loadTheme = async () => {
    let settings = {};
    const jsonSetting = await AsyncStorage.getItem('SETTINGS');
    if (jsonSetting) {
      settings = await JSON.parse(jsonSetting || '{}');
    } else {
      settings = defaultSetting;
    }
    setMode(settings.mode);
    dispatch(SetTheme(settings.mode));
  };
  const loadAuth = async () => {
    const _userInfo = await GetEmployeeInfo();
    await setUserInfo(_userInfo);
    //
    if (Object.keys(_userInfo).length > 0) {
      await setIsLoggedIn(true);
      await dispatch(SetUserInfo(_userInfo));
      // Token Expired
      if (_userInfo?.expiredDate <= TODAY) {
        logout(() => {
          RNRestart.Restart();
        });
      }
    } else {
      setIsLoggedIn(false);
      dispatch(SetUserInfo({}));
    }
  };
  const toggleTheme = async () => {
    dispatch(SetTheme(!mode));
    setMode(!mode);
  };
  //
  const logout = async () => {
    alertConfirm(
      'Đăng xuất',
      'Bạn muốn đăng xuất tài khoản này không?',
      async () => {
        let deviceId = await DeviceInfo.getUniqueId();
        await onLogout(deviceId, async result => {
          if (result.statusId === 200) {
            await RemoveUser();
            RNRestart.Restart();
          } else {
            toastError(
              'Lỗi đăng xuất',
              'Lỗi đăng xuất khỏi hệ thống, vui lòng kiểm tra lại mạng',
            );
          }
        });
      },
    );
  };
  //
  useEffect(() => {
    loadAuth();
  }, [isLoggedIn]);

  useEffect(() => {
    const authExpired = DeviceEventEmitter.addListener(
      AUTH_SESSION_EXPIRED_EVENT,
      () => {
        setUserInfo({});
        setIsLoggedIn(false);
        dispatch(SetUserInfo({}));
      },
    );
    return () => {
      authExpired.remove();
    };
  }, []);

  useEffect(() => {
    loadTheme();
  }, [mode]);

  return (
    <AppContext.Provider value={{ userinfo, isLoggedIn, toggleTheme, logout }}>
      {children}
    </AppContext.Provider>
  );
};
