import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { openSettingPermission } from '../Core/Helper';
import { DashboardAPI } from '../API/DashboardAPI';

export const useLocationTracker = (interval = 10000) => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [locked, setLock] = useState(false);
  let intervalId = null;
  var _fistTime = null;
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS sẽ luôn có quyền nếu người dùng đã cấp
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      openSettingPermission.settingLocation('Cho phép sử dụng vị trí');
      return;
    }
    await setTracking(true);
    _fistTime = Date.now(); // Lấy timestamp lần đầu tiên
    intervalId = await Geolocation.watchPosition(
      position => {
        const _currentTime = new Date();
        const { coords, timestamp, mocked, provider } = position;
        const {
          latitude,
          longitude,
          altitude,
          accuracy,
          heading,
          speed,
          altitudeAccuracy,
        } = coords;
        const location = {
          timestamp: timestamp,
          latitude: latitude,
          longitude: longitude,
          altitude: altitude,
          altitudeAccuracy: altitudeAccuracy,
          accuracy: accuracy,
          heading: heading,
          speed: speed,
          mocked: mocked,
          provider: provider,
        };
        // So sánh _firstTime và _currentTime để tránh gọi API nhiều lần
        if (_fistTime == null || _currentTime - _fistTime > interval) {
          _fistTime = _currentTime; // Cập nhật _firstTime sau khi gọi API
          setLock(true);
          locked == false &&
            DashboardAPI.LogUserAccess(location).then(a => {
              setLock(false);
            });
        }
        // setLocation(location);  // Cập nhật vị trí cho UI nếu cần
      },
      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Thay đổi khoảng cách (đơn vị: mét) để giảm số lần gọi liên tục
        interval: interval, // Tùy chọn chỉ hoạt động trên Android
      },
    );
  };

  const stopTracking = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setTracking(false);
  };
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return { location, startTracking, stopTracking, tracking };
};
