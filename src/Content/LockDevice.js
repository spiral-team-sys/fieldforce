import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Modal, AppState } from 'react-native';
import { View, Text } from 'react-native';
import { getUniqueId, getVersion } from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { EmployeeAPI } from '../API/EmployeeAPI';
import { Divider, Icon } from '@rneui/themed';
import { Logout, onSignOut } from '../Controller/UserController';
import Clipboard from '@react-native-clipboard/clipboard';
import SpiralIcon from '../Control/Icon/SpiralIcon';
function LockDevice(props) {
  const deviceId = getUniqueId();
  const [appState, setAppState] = useState(AppState.currentState);
  const { appcolor } = useSelector(state => state.GAppState);
  const [message, setMessage] = useState(null);
  const [access, setAccess] = useState({ access: 1, message: null });
  const appVer = getVersion();
  const dispatch = useDispatch();
  useEffect(() => {
    const _log =
      props?.userinfo?.employeeId > 0 &&
      EmployeeAPI.UserAccess(deviceId, result => {
        // console.log(result, "UserAccess")
        result.statusId == 200 ? setAccess(result.data[0]) : null;
      });
    return () => _log;
  }, [props.userinfo]);
  const onRegistry = () => {
    EmployeeAPI.RegistryDevice(deviceId, result => {
      console.log(result, 'a');
      setMessage(result.messager);
      setTimeout(() => {
        setMessage(null);
      }, 10000);
    });
  };
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Khi app chuyển sang foreground
        const _log =
          props?.userinfo?.employeeId > 0 &&
          EmployeeAPI.UserAccess(deviceId, result => {
            // console.log(result, "UserAccess")
            result.statusId == 200 ? setAccess(result.data[0]) : null;
          });
      } else if (nextAppState === 'background') {
        // Khi app chuyển sang background
      }
      setAppState(nextAppState);
    };
    // Thay đổi cú pháp để phù hợp với các phiên bản React Native mới
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    // Cleanup khi component unmount
    return () => {
      subscription.remove(); // Xóa sự kiện đã đăng ký
    };
  }, [appState]);
  return (
    <Modal visible={access.access == 0 ? true : false}>
      <View style={{ flex: 1, backgroundColor: appcolor.light }}>
        <View style={{ flex: 1, alignItems: 'center', padding: 12 }}>
          <LottieView
            autoPlay
            style={{ width: '80%', height: '50%' }}
            source={require('../Themes/lotties/lock-security.json')}
          />
          <Text
            style={{ color: appcolor.danger, fontSize: 14, fontWeight: '700' }}
          >
            {access?.message ||
              'Tài khoản này chưa được đăng ký sử dụng trên thiết bị này.'}
          </Text>
          <Text
            style={{
              color: appcolor.dark,
              fontSize: 12,
              fontWeight: '300',
              marginTop: 12,
            }}
          >
            Nếu bạn muốn sử dụng hãy gửi mã thiết bị & tài khoản này để yêu cầu
            đăng ký sử dụng.
          </Text>
          <View
            style={{
              alignItems: 'center',
              width: '100%',
              padding: 2,
              backgroundColor: appcolor.surface,
              marginTop: 7,
              marginBottom: 7,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(deviceId);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingEnd: 7,
              }}
            >
              <Text
                style={{
                  flexGrow: 1,
                  color: appcolor.dark,
                  padding: 12,
                  fontWeight: '600',
                }}
              >
                Mã thiết bị {deviceId}
              </Text>
              <SpiralIcon
                type="ionic"
                name="content-copy"
                color={appcolor.primary}
              />
            </TouchableOpacity>
          </View>
          <View>
            <View
              style={{
                borderWidth: 1,
                borderColor: appcolor.surface,
                width: '100%',
              }}
            />
            {message !== null && (
              <Text
                style={{
                  color: appcolor.danger,
                  fontSize: 12,
                  fontWeight: '400',
                }}
              >
                {message}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={onRegistry}
              style={{
                flexGrow: 1,
                backgroundColor: appcolor.surface,
                marginRight: 5,
              }}
            >
              <Text
                style={{
                  color: appcolor.primary,
                  textAlign: 'center',
                  padding: 12,
                }}
              >
                Gửi yêu cầu đăng ký
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSignOut(dispatch)}
              style={{ flexGrow: 1, backgroundColor: appcolor.surface }}
            >
              <Text
                style={{
                  color: appcolor.danger,
                  textAlign: 'center',
                  padding: 12,
                  marginLeft: 5,
                }}
              >
                Thoát tài khoản
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={{
            color: appcolor.dark,
            fontSize: 12,
            fontWeight: '400',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Phiên bản ứng dụng {appVer}
        </Text>
      </View>
    </Modal>
  );
}
export default LockDevice;
