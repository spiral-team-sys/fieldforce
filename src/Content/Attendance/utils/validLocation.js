import { getDistance } from 'geolib';
import {
  MessageAction,
  MessageAction2,
  MessageInfo,
  MessageSetting,
  requestTimeout,
} from '../../../Core/Helper';
import { DeviceEventEmitter, Linking, Platform } from 'react-native';
import { APPNAME, GO_OVERVIEW } from '../../../Core/URLs';
import { check, openSettings, RESULTS } from 'react-native-permissions';
import { toastError } from '../../../Utils/configToast';

const checkPermissionLocation = async (
  callbackGranted,
  callbackError,
  callbackTimeout,
) => {
  // #region Request Location
  const requestLocation = async () => {
    try {
      request(
        Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        }),
      ).then(res => {
        if (res == RESULTS.GRANTED) {
          callbackGranted(res);
        } else {
          callbackGranted(res);
        }
      });
    } catch (error) {
      toastError('Lỗi khi yêu cầu quyền truy cập vị trí', error);
      callbackError(error);
    }
  };
  // #region Location With Timeout
  const getLocationWithTimeout = () => {
    requestTimeout(10000, getLocationUser(), async () => {
      await callbackTimeout();
    });
  };
  // #region Permission Location
  check(
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ).then(async result => {
    switch (result) {
      case RESULTS.UNAVAILABLE:
        MessageSetting(
          'Thông báo',
          Platform.OS === 'ios'
            ? 'Vui lòng bật Dịch vụ định vị, Quyền riêng tư -> Dịch vụ định vị -> Dịch vụ định vị (Bật)'
            : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị',
          () => {
            Platform.OS === 'ios'
              ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
              : openSettings().catch(() =>
                  console.warn('cannot open settings'),
                );
          },
        );
        callbackError('Không có quyền truy cập vị trí');
        break;
      case RESULTS.DENIED:
        requestLocation();
        break;
      case RESULTS.GRANTED:
        getLocationWithTimeout();
        break;
      case RESULTS.BLOCKED:
        MessageSetting(
          'Thông báo',
          Platform.OS === 'ios'
            ? 'Vui lòng cho phép App sử dụng Dịch vụ định vị, Quyền riêng tư -> Dịch vụ định vị -> tìm đến App ' +
                APPNAME +
                ' -> tích chọn khi dùng Ứng dụng & chính xác cao'
            : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị',
          () => {
            Platform.OS === 'ios'
              ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
              : openSettings().catch(() =>
                  console.warn('cannot open settings'),
                );
          },
        );
        break;
      default:
        callbackError('Không xác định trạng thái quyền truy cập vị trí');
        break;
    }
  });
};
const checkDistance = async (
  shopinfo,
  locationinfo,
  count,
  callbackMessage,
  callbackGoback,
) => {
  const shopConfig = JSON.parse(shopinfo.config);
  const calculateDistance = () => {
    if (!locationinfo || locationinfo.longitude === 0) {
      callbackMessage('Vị trí không hợp lệ, vui lòng kiểm tra lại');
      return null;
    }

    let distance = getDistance(
      { latitude: shopinfo.latitude, longitude: shopinfo.longitude },
      { latitude: locationinfo.latitude, longitude: locationinfo.longitude },
    );
    return distance;
  };

  const getLocationUser = async () => {
    if (locationinfo.mocked) {
      MessageInfo(
        'Chú ý, Bạn đang sử dụng phần mềm tìm cách thay đổi vị trí của bạn, điều này là không được phép trong việc chấm công.',
      );
      return false;
    }
    return true;
  };
  if (shopinfo.latitude && shopinfo.longitude && shopConfig.Distance > 0) {
    const distance = calculateDistance();
    if (distance === null) return;
    //
    if (distance > shopConfig?.Distance) {
      if (shopConfig.statusDistance == 1) {
        callbackMessage(
          `Vị trí bạn đang Checkin/Checkout cách vị trí cửa hàng lớn hơn ${shopConfig.Distance}m`,
        );
        if (count > 5) {
          callbackMessage('');
          MessageAction2(
            `Hệ thống ghi nhận vị trí bạn chấm công đang cách cửa hàng hơn ${shopConfig.Distance}m, bạn muốn tiếp tục chấm công hay lấy lại vị trí ?`,
            () => {
              // Chấm công
            },
            () => {
              callbackGoback();
              MessageAction(
                'Chọn Đi đến để tới chi tiết cửa hàng, chọn Bản đồ -> Bấm vào biểu tượng góc phải bản đồ để kiểm tra/lấy lại vị trí hiện tại',
                () => {
                  DeviceEventEmitter.emit('GO_SHOP_MAP', null);
                  DeviceEventEmitter.emit(GO_OVERVIEW, null);
                },
                'Không',
                'Đi đến',
              );
            },
            'Lấy lại vị trí',
            'Chấm công',
          );
          return;
        }
        const isValid = await getLocationUser();
        if (!isValid) {
          callbackGoback();
          return;
        }
      }
      if (shopConfig.statusDistance == 2) {
        callbackMessage('Đang định lại vị trí, vui lòng đợi... ');
        if (count > 5) {
          callbackMessage(
            `Bạn đang cách cửa hàng ${distance}m.\n\n` +
              `Ứng dụng chỉ cho phép check-in khi khoảng cách đến cửa hàng không vượt quá ${shopConfig.Distance} m.\n` +
              `Vui lòng di chuyển đến gần cửa hàng rồi thử lại.`,
          );
          return;
        } else {
          getLocationUser();
        }
      }
      if (shopConfig.statusDistance == 3) {
        callbackMessage('Đang định lại vị trí, vui lòng đợi... ');
        if (count > 5) {
          callbackMessage('');
          MessageAction2(
            `Hệ thống ghi nhận vị trí bạn chấm công đang cách cửa hàng hơn ${shopConfig.Distance}m, bạn muốn lấy lại vị trí ?`,
            () => {
              callbackGoback();
              getLocationUser();
              MessageAction(
                'Chọn Đi đến để tới chi tiết cửa hàng, chọn Bản đồ -> Bấm vào biểu tượng góc phải bản đồ để kiểm tra/lấy lại vị trí hiện tại',
                () => {
                  DeviceEventEmitter.emit('GO_SHOP_MAP', null);
                  DeviceEventEmitter.emit(GO_OVERVIEW, null);
                },
                'Không',
                'Đi đến',
              );
            },
            () => {
              callbackGoback();
              callbackMessage('');
            },
            'Không',
            'Lấy lại vị trí',
          );
          return;
        }
      }
    }
  }
};
export const VALID_LOCATION = { checkDistance, checkPermissionLocation };
