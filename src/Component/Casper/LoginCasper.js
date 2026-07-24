import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input, Button, Image } from '@rneui/themed';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import * as Progress from 'react-native-progress';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import {
  onLogin,
  saveTokenUser,
  SendEmailPass,
} from '../../Controller/UserController';
import moment from 'moment';
import { alertNotify, checkNetwork } from '../../Core/Utility';
import ForgotPassword from '../../Control/ForgotPassword';
import { MessageInfo, defaultSetting } from '../../Core/Helper';
import { useSelector, useDispatch } from 'react-redux';
import { ACTION } from '../../Core/ReduxController';
import { BackgroundImage } from '@rneui/base/dist/config';

const delay = ms => new Promise(res => setTimeout(res, ms));
const versionApp = DeviceInfo.getVersion();

const LoginCasper = ({ onLoginCallBack }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const refLogin = useRef();
  const refEmail = useRef();
  const [tokenFirebase, setTokenFirebase] = useState('');
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [email, setEmail] = useState(null);
  const [isShowPass, setShowPass] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [requestPass, setRequestPass] = useState(false);
  const dispatch = useDispatch();
  const ThemeDefault = async () => {
    await checkNetwork();
    const json = await AsyncStorage?.getItem('SETTINGS');
    const settings = (await JSON.parse(json)) || defaultSetting;
    dispatch({ type: ACTION.SET_THEME, mode: settings.mode });
  };
  // Handler Request Token FireBase
  const handlerRequestToken = () => {
    messaging()
      .getToken()
      .then(async fcmToken => {
        if (fcmToken) await setTokenFirebase(fcmToken);
      });
    messaging().onTokenRefresh(async fcmToken => {
      await setTokenFirebase(fcmToken);
    });
  };
  const handlerLogin = async () => {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      alertNotify(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    // Check Token FireBase
    if (Platform.OS === 'ios') {
      const authorizationStatus = await messaging().requestPermission();
      if (authorizationStatus === 1) {
        if (tokenFirebase == null || tokenFirebase.length == 0) {
          handlerRequestToken();
          alertNotify('Chưa lấy được token vui lòng bấm thử lại!');
          return;
        }
      }
    }

    let userStr = username || '';
    if (userStr.includes(' ')) {
      MessageInfo('Tên đăng nhập không được nhập khoảng trắng!');
      return;
    }
    if (userStr === null || userStr.length == 0) {
      MessageInfo('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (password == null || password.length == 0) {
      MessageInfo('Vui lòng nhập mật khẩu.');
      return;
    }
    // Login Action
    await setShowProgress(true);
    let IMEI = await DeviceInfo.getUniqueId();
    const dataLogin = {
      username: username,
      password: password,
      DeviceToken: tokenFirebase,
      Platform: Platform.OS,
      IMEI: IMEI,
      versionid: await DeviceInfo.getBuildNumber(),
      client_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await onLogin(
      dataLogin,
      async info => {
        await saveTokenUser(info);
        await delay(2000);
        await dispatch({ type: ACTION.SET_USERINFO, userinfo: info });
        await onLoginCallBack();
        setShowProgress(false);
      },
      () => {
        setShowProgress(false);
      },
    );
  };
  const handlerFogotPassword = async () => {
    setRequestPass(true);
  };
  const handlerCloseRequestPass = async () => {
    setRequestPass(false);
  };
  const onChangeUsername = value => {
    setUsername(value);
  };
  const onChangeEmail = value => {
    setEmail(value);
  };
  const SendMailRequest = async () => {
    let emailStr = email || '';
    let usernameStr = username || '';

    if (usernameStr.includes(' ')) {
      MessageInfo('Tên đăng nhập không được nhập khoảng trắng!');
      return;
    } else if (emailStr.includes(' ')) {
      MessageInfo('email không được nhập khoảng trắng!');
      return;
    }

    if (usernameStr.length == 0) {
      MessageInfo('Bạn chưa nhập tên đăng nhập!');
      refLogin?.current?.shake();
      return;
    } else if (emailStr.length == 0) {
      MessageInfo('Bạn chưa nhập email!');
      refEmail?.current?.shake();
      return;
    } else if (!emailStr.includes('@')) {
      MessageInfo('Không đúng định dạng mail!');
      refEmail?.current?.shake();
      return;
    }

    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      await MessageInfo(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    const result = await SendEmailPass(username, email);
    if (result.statusId === 200) setRequestPass(false);
    alertNotify(result.messager);
  };

  useEffect(() => {
    ThemeDefault();
    const _token = handlerRequestToken();
    return () => _token;
  }, []);
  return (
    <SafeAreaView
      style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }}
    >
      <View style={{ height: '100%', width: '100%' }}>
        {requestPass ? (
          <ForgotPassword
            refLoginName={refLogin}
            refEmail={refEmail}
            handlerCloseRequest={handlerCloseRequestPass}
            UserNameChangeText={onChangeUsername}
            EmailChangeText={onChangeEmail}
            SendMail={SendMailRequest}
          />
        ) : (
          <View
            style={{
              padding: 12,
              margin: 12,
              height: '97%',
              backgroundColor: appcolor.light,
              borderRadius: 8,
            }}
          >
            <View>
              <Image
                style={{ maxHeight: 170, minHeight: 130 }}
                source={require('../../Themes/Images/logo_spiral.png')}
                resizeMode="contain"
              />
              {showProgress == true && (
                <Progress.CircleSnail
                  color={appcolor.primary}
                  thickness={5}
                  size={50}
                  indeterminate={true}
                  style={{ margin: 2, zIndex: 7, alignSelf: 'center' }}
                />
              )}
            </View>
            <View style={{ backgroundColor: appcolor.light, flexGrow: 1 }}>
              <Text
                style={{
                  fontWeight: '500',
                  color: appcolor.dark,
                  marginBottom: 12,
                }}
              >
                Xin chào,
                <Text style={{ fontSize: 13, color: appcolor.primary }}>
                  {' '}
                  Đăng nhập để làm việc
                </Text>
              </Text>
              <View style={{}}>
                <Input
                  inputStyle={{ color: appcolor.dark }}
                  style={{ fontSize: 15 }}
                  autoCorrect={false}
                  returnKeyType="next"
                  label="User name"
                  onSubmitEditing={() => this._refPass.focus()}
                  blurOnSubmit={false}
                  placeholder="Tên đăng nhập"
                  leftIcon={
                    <SpiralIcon
                      type="font-awesome-6"
                      name="user"
                      solid
                      color={appcolor.primary}
                      size={18}
                    />
                  }
                  placeholderTextColor={appcolor.grayLight}
                  onChangeText={value => setUsername(value)}
                />
                <Input
                  label="Password"
                  leftIcon={
                    <SpiralIcon
                      type="font-awesome-6"
                      name="lock"
                      color={appcolor.primary}
                      size={18}
                    />
                  }
                  ref={ref => (this._refPass = ref)}
                  inputStyle={{ color: appcolor.dark }}
                  returnKeyType="done"
                  onSubmitEditing={handlerLogin}
                  placeholder="Mật khẩu"
                  placeholderTextColor={appcolor.grayLight}
                  rightIcon={
                    <SpiralIcon
                      name={isShowPass ? 'eye' : 'eye-slash'}
                      type="ionicon"
                      color={appcolor.primary}
                      onPress={e => setShowPass(e => !e)}
                      size={16}
                    />
                  }
                  secureTextEntry={!isShowPass}
                  onChangeText={value => setPassword(value)}
                />
              </View>
              <View>
                <Button
                  buttonStyle={{
                    backgroundColor: appcolor.primary,
                    borderRadius: 5,
                  }}
                  containerStyle={{
                    alignSelf: 'center',
                    width: '95%',
                    backgroundColor: appcolor.primary,
                  }}
                  titleStyle={{
                    color: appcolor.light,
                    fontSize: 15,
                    fontWeight: '500',
                  }}
                  style={{ padding: 5 }}
                  onPress={handlerLogin}
                  title="Đăng nhập"
                />
                <TouchableOpacity onPress={handlerFogotPassword}>
                  <Text
                    style={{
                      width: '100%',
                      padding: 16,
                      fontSize: 15,
                      color: appcolor.dark,
                      textAlign: 'center',
                      fontStyle: 'italic',
                      textDecorationLine: 'underline',
                    }}
                  >
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    textAlign: 'center',
                    color: appcolor.dark,
                    fontSize: 11,
                  }}
                >
                  {'Version: ' + versionApp}
                </Text>
              </View>
            </View>
            <View style={{ flexGrow: 1 }} />
            <View style={{ width: '100%', alignSelf: 'center' }}>
              <Text
                style={{
                  padding: 3,
                  textAlign: 'center',
                  fontSize: 11,
                  color: appcolor.primary,
                }}
              >
                Spiral Co.,Ltd
              </Text>
              <Text
                style={{
                  padding: 3,
                  fontSize: 10,
                  textAlign: 'center',
                  color: appcolor.primary,
                }}
              >
                27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
export default LoginCasper;
