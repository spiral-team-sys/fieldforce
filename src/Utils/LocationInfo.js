import Geolocation from '@react-native-community/geolocation';
import { Linking, Platform } from 'react-native';
import { formatNumber } from '../Core/Helper';

const getCurrentLocation = (successCallback, errorCallback) => {
  let isSettled = false;
  let fastResult = null;
  let upgradeTimer = null;
  // Watchdog giảm xuống 10s — nếu cả hai path đều không trả kết quả trong 10s thì fail
  const watchdogTimer = setTimeout(() => {
    if (isSettled) return;
    if (fastResult) {
      settle(fastResult); // dùng fast result nếu có
    } else {
      isSettled = true;
      errorCallback && errorCallback('Lấy vị trí thất bại: Hết thời gian chờ');
    }
  }, 5000);

  const settle = payload => {
    if (isSettled) return;
    isSettled = true;
    clearTimeout(watchdogTimer);
    clearTimeout(upgradeTimer);
    successCallback && successCallback(payload);
  };

  const makePayload = (position, isFast) => {
    const { latitude, longitude, accuracy } = position.coords;
    return {
      latitude,
      longitude,
      accuracy,
      isFast,
      usedHighAccuracy: !isFast,
      isLikelyPreciseFix: typeof accuracy === 'number' && accuracy <= 30,
    };
  };

  // --- Path 1: Low-accuracy (WiFi/Cell) — phản hồi nhanh ~1-3s ---
  Geolocation.getCurrentPosition(
    position => {
      if (isSettled) return;
      fastResult = makePayload(position, true);
      // Chờ thêm 2.5s để high-accuracy có cơ hội upgrade; nếu không đến thì dùng fast
      upgradeTimer = setTimeout(() => {
        settle(fastResult);
      }, 2500);
    },
    () => {
      /* fast path fail → để high-accuracy xử lý */
    },
    {
      enableHighAccuracy: false,
      timeout: 6000,
      maximumAge: 30000,
    },
  );

  // --- Path 2: High-accuracy (GPS) — chạy song song, upgrade nếu đến kịp ---
  Geolocation.getCurrentPosition(
    position => {
      settle(makePayload(position, false));
    },
    error => {
      if (error?.code === 1) {
        // Permission denied — huỷ hết, không dùng fast result
        isSettled = true;
        clearTimeout(watchdogTimer);
        clearTimeout(upgradeTimer);
        errorCallback && errorCallback(error.message);
        return;
      }
      // GPS fail → dùng fast result nếu có, không thì chờ watchdog
      if (fastResult && !isSettled) settle(fastResult);
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 30000,
      forceRequestLocation: true,
      showLocationDialog: true,
    },
  );
};
const startWatchingPosition = (successCallback, errorCallback) => {
  const watchId = Geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      successCallback && successCallback({ latitude, longitude });
    },
    error => {
      errorCallback &&
        errorCallback(error.message || 'Không thể theo dõi vị trí');
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Cập nhật vị trí khi di chuyển 10m
    },
  );
  return watchId;
};
const stopWatchingPosition = watchId => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
  }
};
//
const getDistance = (
  lat1 = 0,
  lon1 = 0,
  lat2 = 0,
  lon2 = 0,
  isReturnNumber = false,
) => {
  const R = 6371; // Bán kính Trái Đất (đơn vị: km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Khoảng cách theo đường chim bay (km)
  const distance = R * c;
  // Chuyển qua (m)
  const distanceInMeters = parseInt(distance * 1000);
  if (isReturnNumber) {
    return distanceInMeters;
  } else {
    return parseInt(distance);
  }
};
const openGoogleMapsDirections = (latitude, longitude) => {
  const url = Platform.select({
    ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
    android: `google.navigation:q=${latitude},${longitude}`,
  });

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const browser_url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(browser_url);
      }
    })
    .catch(err => console.error('An error occurred', err));
};
//
export const LOCATION_INFO = {
  getCurrentLocation,
  startWatchingPosition,
  stopWatchingPosition,
  getDistance,
  openGoogleMapsDirections,
};
