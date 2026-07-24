import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from '@rneui/themed';
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
import {
  MessageInfo,
  defaultSetting,
  colorList,
  ToastError,
} from '../../Core/Helper';
import { useSelector, useDispatch } from 'react-redux';
import { ACTION } from '../../Core/ReduxController';
import { AppNameBuild } from '../../Core/URLs';
import { deviceWidth } from '../../Themes/AppsStyle';

const delay = ms => new Promise(res => setTimeout(res, ms));
const versionApp = DeviceInfo.getVersion();

const LoginBK = ({ onLoginCallBack }) => {
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
  const _refPass = useRef();
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
      ToastError(
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
          ToastError('Chưa lấy được token vui lòng bấm thử lại!');
          return;
        }
      }
    }

    let userStr = username || '';
    if (userStr.includes(' ')) {
      ToastError('Tên đăng nhập không được nhập khoảng trắng!');
      return;
    }
    if (userStr === null || userStr.length == 0) {
      ToastError('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (password == null || password.length == 0) {
      ToastError('Vui lòng nhập mật khẩu.');
      return;
    }
    // Login Action
    await setShowProgress(true);
    let IMEI = await DeviceInfo.getUniqueId();
    const AppId = await DeviceInfo.getBuildId();
    const dataLogin = {
      username: username,
      password: password,
      DeviceToken: tokenFirebase,
      Platform: Platform.OS,
      IMEI: IMEI,
      AppId: AppId,
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
  const renderDot = () => {
    const listdot = [];
    for (a = 0; a < 24; a++) {
      listdot.push(
        <View
          style={{
            transform: [{ rotateZ: '190deg' }],
            marginTop: -a + 10,
            borderRadius: 20,
            borderColor: appcolor.white,
            borderWidth: 8,
            width: 16 + a,
            height: 26 + a,
            backgroundColor: colorList[a],
          }}
        />,
      );
    }
    return listdot;
  };
  useEffect(() => {
    ThemeDefault();
    handlerRequestToken();
    return () => false;
  }, []);
  return (
    <SafeAreaView
      style={{ width: '100%', height: '100%', backgroundColor: appcolor.info }}
    >
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
            width: '100%',
            height: '100%',
            backgroundColor: appcolor.primary,
          }}
        >
          {/* <View style={{ flexDirection: 'row' }}>
                        {renderDot()}
                    </View> */}
          <View
            style={{
              justifyContent: 'center',
              backgroundColor: appcolor.white,
              paddingTop: deviceWidth / 8,
            }}
          >
            <Image
              style={{ minHeight: 120 }}
              source={require('../../Themes/Images/logo_spiral.png')}
              resizeMode="contain"
            />
            <View
              style={{
                height: 50,
                backgroundColor: appcolor.primary,
                borderTopLeftRadius: 120,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '500',
              color: appcolor.white,
              paddingLeft: 12,
              marginTop: -20,
            }}
          >
            Welcome back,
          </Text>
          <View style={{ opacity: 0.8, padding: 12 }}>
            <View
              style={{
                borderRadius: 30,
                borderColor: appcolor.primary,
                marginBottom: 20,
                borderWidth: 0.8,
                backgroundColor: appcolor.light,
                opacity: 0.9,
              }}
            >
              <TextInput
                style={{ fontSize: 13, padding: 10, color: appcolor.dark }}
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => _refPass.current.focus()}
                blurOnSubmit={false}
                placeholder="Username"
                placeholderTextColor={appcolor.primary}
                onChangeText={value => setUsername(value)}
              />
            </View>
            <View
              style={{
                borderRadius: 30,
                borderColor: appcolor.primary,
                marginBottom: 20,
                borderWidth: 0.8,
                backgroundColor: appcolor.light,
                opacity: 0.9,
              }}
            >
              <TextInput
                style={{ padding: 10, color: appcolor.dark, fontSize: 13 }}
                ref={_refPass}
                returnKeyType="done"
                onSubmitEditing={handlerLogin}
                placeholder="Password"
                placeholderTextColor={appcolor.primary}
                secureTextEntry={!isShowPass}
                onChangeText={value => setPassword(value)}
              />
              <TouchableOpacity
                onPress={() => setShowPass(e => !e)}
                style={{
                  zIndex: 121,
                  position: 'absolute',
                  right: 20,
                  top: 16,
                }}
              >
                <SpiralIcon
                  name={isShowPass ? 'eye' : 'eye-slash'}
                  type="ionicon"
                  color={appcolor.primary}
                  size={16}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                paddingLeft: 30,
                paddingRight: 30,
                opacity: 0.8,
                borderRadius: 30,
                padding: 12,
                backgroundColor: appcolor.info,
              }}
              onPress={handlerLogin}
            >
              <Text style={{ textAlign: 'center', color: appcolor.white }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
          {showProgress && <ActivityIndicator />}
          <TouchableOpacity
            style={{ alignSelf: 'center' }}
            onPress={handlerFogotPassword}
          >
            <Text
              style={{
                marginTop: 20,
                padding: 10,
                fontSize: 12,
                color: appcolor.white,
                fontStyle: 'italic',
                textDecorationLine: 'underline',
              }}
            >
              Bạn quên mật khẩu?
            </Text>
          </TouchableOpacity>
          <View style={{ flexGrow: 1 }} />
          <View style={{ width: '100%', bottom: 8 }}>
            <Text
              style={{
                padding: 3,
                textAlign: 'center',
                color: appcolor.light,
                fontSize: 11,
              }}
            >
              {'Version: ' + versionApp}
            </Text>
            <Text
              style={{
                padding: 3,
                textAlign: 'center',
                fontWeight: '900',
                fontSize: 11,
                color: appcolor.light,
              }}
            >
              Spiral Co.,Ltd
            </Text>
            <Text
              style={{
                padding: 3,
                fontSize: 10,
                textAlign: 'center',
                color: appcolor.light,
              }}
            >
              27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
export default LoginBK;
