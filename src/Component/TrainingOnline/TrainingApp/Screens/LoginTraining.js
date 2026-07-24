import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ForgotPassword from '../../../../Control/ForgotPassword';
import LottieView from 'lottie-react-native';
import WavyHeader from '../../../WaveHeader/WavyHeader';
import DeviceInfo from 'react-native-device-info';
import { scaleSize } from '../../../../Themes/AppsStyle';
import { Button, Icon, Input } from '@rneui/base';
import { checkNetwork } from '../../../../Core/Utility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  onLogin,
  saveTokenUserToGapp,
  saveTokenUserTraining,
} from '../../../../Controller/UserController';
import { ToastError } from '../../../../Core/Helper';
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import * as Progress from 'react-native-progress';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const LoginTraining = ({ onLoginCallBack }) => {
  const versionNumBuild = DeviceInfo.getBuildNumber();
  const { appcolor } = useSelector(state => state.GAppState);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [requestPass, setRequestPass] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isShowPass, setIsShowPass] = useState(false);
  const [token, setToken] = useState('');
  const dispatch = useDispatch();

  const handlerCloseRequest = () => {
    setRequestPass(false);
  };

  const SignIn = async () => {
    let IMEI = await DeviceInfo.getUniqueId();
    const AppId = await DeviceInfo.getBuildId();
    await setShowProgress(true);
    const requestInfo = {
      username: username,
      client_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      password: password,
      DeviceToken: token,
      Platform: Platform.OS,
      IMEI: IMEI,
      AppId: AppId,
      versionid: versionNumBuild,
    };
    await onLogin(
      requestInfo,
      async res => {
        await saveTokenUserTraining(res, dispatch).then(success => {
          onLoginCallBack();
        });

        setShowProgress(false);
      },
      () => {
        setShowProgress(false);
      },
    );
    await setShowProgress(false);
  };

  const onLoginPress = async () => {
    const isconected = await checkNetwork();
    if (isconected) {
      if (token === null || token.length < 10) {
        ToastError('Chưa lấy được mã xác thực thiết bị', 'token', 'top');
      }
      if (username == null || username == 0) {
        ToastError('Bạn chưa nhập tên đăng nhập!', 'Tên đăng nhập', 'top');
        return;
      }
      if (password === null || password.length < 1) {
        ToastError('Mật khẩu không được để trống!', 'Mật khẩu', 'top');
        return;
      } else {
        await SignIn();
      }
    } else {
      ToastError('Vui lòng kiểm tra kết nối mạng', 'No Internet');
    }
  };

  const requestToken = async () => {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === 1) {
      let fcmTokenHave = await AsyncStorage.getItem('fcmToken');
      if (fcmTokenHave === null || fcmTokenHave.length > 10) {
        await messaging()
          .getToken()
          .then(async fcmToken => {
            if (fcmToken) {
              setToken(fcmToken);
              await AsyncStorage.setItem('fcmToken', fcmToken);
            } else {
              console.log(fcmToken);
            }
          });
        await messaging().onTokenRefresh(async fcmToken => {
          setToken(fcmToken);
          await AsyncStorage.setItem('fcmToken', fcmToken);
        });
      } else {
        setToken(fcmTokenHave);
      }
    } else {
      ToastError('Chưa lấy mã xác thực thiết bị', 'Thông báo', 'top');
    }
  };

  useEffect(() => {
    requestToken();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: 'space-between',
          alignItems: 'stretch',
          flex: 1,
          backgroundColor: appcolor.light,
        }}
      >
        <View style={{ height: '100%', width: '100%' }}>
          <View style={{ width: '100%', height: '20%', marginTop: 40 }}>
            <LottieView
              autoPlay
              style={{ height: '100%' }}
              source={require('../../../../Themes/lotties/bookloading.json')}
            />
          </View>

          <View style={{ paddingLeft: 12, paddingRight: 12 }}>
            <View>
              <Input
                defaultValue={username}
                style={{ fontSize: 15, color: appcolor.dark }}
                returnKeyType="next"
                autoCorrect={false}
                onSubmitEditing={() => { }}
                blurOnSubmit={false}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#c2c2c2"
                onChangeText={value => setUsername(value?.trim())}
                leftIcon={
                  <SpiralIcon
                    name="person-outline"
                    type="ionicon"
                    color={appcolor.primary}
                    size={23}
                    style={{ padding: 8 }}
                  />
                }
              />
            </View>

            <View>
              <Input
                style={{ fontSize: 15, color: appcolor.dark }}
                returnKeyType="done"
                onSubmitEditing={onLoginPress}
                placeholder="Mật khẩu"
                placeholderTextColor="#c2c2c2"
                leftIcon={
                  <SpiralIcon
                    name="lock-closed-outline"
                    type="ionicon"
                    color={appcolor.primary}
                    size={23}
                    style={{ padding: 8 }}
                  />
                }
                rightIcon={
                  <SpiralIcon
                    name={isShowPass ? 'eye-outline' : 'eye-off-outline'}
                    type="ionicon"
                    color={appcolor.primary}
                    onPress={e => setIsShowPass(isShowPass ? false : true)}
                    size={20}
                  />
                }
                secureTextEntry={isShowPass ? false : true}
                onChangeText={value => setPassword(value?.trim())}
              />
            </View>
            <View style={{ padding: 7 }}>
              <TouchableOpacity onPress={() => setShowModel(true)}>
                <Text style={{ color: appcolor.dark, fontSize: scaleSize(12) }}>
                  Bằng việc đăng nhập bạn đã đồng ý với
                  <Text
                    style={{
                      color: appcolor.primary,
                      fontWeight: '500',
                      textDecorationLine: 'underline',
                      fontStyle: 'italic',
                      fontSize: scaleSize(14),
                    }}
                  >
                    {' '}
                    Điều khoản & điều kiện{' '}
                  </Text>{' '}
                  cùng
                  <Text
                    style={{
                      color: appcolor.primary,
                      fontWeight: '500',
                      textDecorationLine: 'underline',
                      fontStyle: 'italic',
                      fontSize: scaleSize(14),
                    }}
                  >
                    {' '}
                    chính sách bảo mật chia sẻ thông tin của Spiral
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Button
                buttonStyle={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: appcolor.primary,
                  backgroundColor: appcolor.transparent,
                  borderRadius: 10,
                }}
                containerStyle={{ flexGrow: 1, marginRight: 12 }}
                titleStyle={{
                  color: appcolor.primary,
                  fontSize: 15,
                  fontWeight: '700',
                }}
                title="Lấy lại mật khẩu"
                onPress={() => setRequestPass(true)}
              />
              <Button
                buttonStyle={{
                  padding: 12,
                  backgroundColor: appcolor.primary,
                  borderRadius: 10,
                }}
                titleStyle={{
                  color: appcolor.white,
                  fontSize: 15,
                  fontWeight: '700',
                }}
                containerStyle={{ flexGrow: 1 }}
                onPress={onLoginPress}
                title="Đăng nhập"
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 15,
                alignSelf: 'center',
              }}
            >
              <Text style={{ color: appcolor.dark }}>-----------</Text>
              <SpiralIcon
                name="information-circle"
                type="ionicon"
                color={appcolor.dark}
              />
              <Text style={{ color: appcolor.dark }}>-----------</Text>
            </View>
            <Text
              style={{
                padding: 3,
                width: '100%',
                textAlign: 'center',
                color: appcolor.dark,
                marginTop: 20,
                fontSize: 11,
              }}
            >
              {'Version: 1.0.0'}
            </Text>
          </View>
          <WavyHeader flip={true} />
        </View>
        {showProgress === true && (
          <Progress.CircleSnail
            color={appcolor.primary}
            thickness={5}
            size={85}
            indeterminate={true}
            style={{
              position: 'absolute',
              zIndex: 7,
              alignSelf: 'center',
              marginTop: Dimensions.get('window').height / 2,
            }}
          />
        )}
      </View>
    </View>
  );
};

export default LoginTraining;
