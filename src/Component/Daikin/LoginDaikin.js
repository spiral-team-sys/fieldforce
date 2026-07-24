import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Input, Icon } from '@rneui/themed';
import DeviceInfo, { getUniqueId } from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import {
  onLogin,
  saveTokenUser,
  SendEmailPass,
} from '../../Controller/UserController';
import moment from 'moment';
import { alertNotify, checkNetwork, deviceHeight } from '../../Core/Utility';
import ForgotPassword from '../../Control/ForgotPassword';
import {
  MessageInfo,
  defaultSetting,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { useSelector, useDispatch } from 'react-redux';
import { ACTION } from '../../Core/ReduxController';
import LottieView from 'lottie-react-native';
import { scaleSize } from '../../Themes/AppsStyle';
import { APPNAME } from '../../Core/URLs';
import Clipboard from '@react-native-clipboard/clipboard';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const delay = ms => new Promise(res => setTimeout(res, ms));
const versionApp = DeviceInfo.getVersion();

const LoginDaikin = ({ onLoginCallBack }) => {
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
  const deviceId = getUniqueId();
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
    handlerRequestToken();
    return () => false;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: deviceHeight,
      backgroundColor: appcolor.light,
      padding: 24,
    },
    headerLogoStyle: {
      width: '100%',
      height: '25%',
      borderBottomEndRadius: 0,
      borderBottomStartRadius: 250,
      justifyContent: 'center',
      marginTop: 16,
    },
    viewInputStyle: { width: '100%' },
    inputLogin: {
      width: '100%',
      borderWidth: 0.5,
      borderColor: appcolor.darklight,
      borderRadius: 5,
      padding: 12,
      alignItems: 'center',
      marginBottom: 16,
    },
    titleLogin: {
      width: '100%',
      padding: 16,
      fontSize: scaleSize(22),
      textAlign: 'center',
      fontWeight: '700',
      color: appcolor.dark,
    },
    titleForgot: {
      fontSize: scaleSize(14),
      textDecorationLine: 'underline',
      color: appcolor.dark,
      fontStyle: 'italic',
      textAlign: 'center',
      position: 'absolute',
      right: 16,
    },
    mainInput: { flexGrow: 5 },
  });
  const setCopy = () => {
    Clipboard.setString(deviceId);
    ToastSuccess('Đã sao chép (copy)');
  };
  return (
    <SafeAreaView
      style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }}
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
        <View style={styles.mainContainer}>
          <View style={{ width: '100%', height: '20%', marginTop: 12 }}>
            <LottieView
              autoPlay
              style={{ height: '100%' }}
              source={require('../../Themes/lotties/daikin_welcome.json')}
            />
          </View>
          <Text style={styles.titleLogin}>{`Đăng nhập ${APPNAME}`}</Text>
          <View style={styles.mainInput}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Input
                defaultValue={username}
                leftIcon={
                  <SpiralIcon
                    name="person-outline"
                    type="ionicon"
                    color={appcolor.primary}
                    size={23}
                    style={{ padding: 8 }}
                  />
                }
                style={{ fontSize: 15, color: appcolor.dark }}
                returnKeyType="next"
                autoCorrect={false}
                onSubmitEditing={() => _refPass.current.focus()}
                blurOnSubmit={false}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#c2c2c2"
                onChangeText={value => setUsername(value?.trim())}
              />
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Input
                leftIcon={
                  <SpiralIcon
                    name="lock-closed-outline"
                    type="ionicon"
                    color={appcolor.primary}
                    size={23}
                    style={{ padding: 8 }}
                  />
                }
                style={{ fontSize: 15, color: appcolor.dark }}
                ref={_refPass}
                returnKeyType="done"
                onSubmitEditing={handlerLogin}
                placeholder="Mật khẩu"
                placeholderTextColor="#c2c2c2"
                rightIcon={
                  <SpiralIcon
                    name={isShowPass ? 'eye-outline' : 'eye-off-outline'}
                    type="ionicon"
                    color={appcolor.primary}
                    onPress={e => setShowPass(i => !i)}
                    size={20}
                  />
                }
                secureTextEntry={isShowPass ? false : true}
                onChangeText={value => setPassword(value?.trim())}
              />
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Input
                defaultValue={deviceId}
                leftIcon={
                  <SpiralIcon
                    name="phone-portrait"
                    type="ionicon"
                    color={appcolor.primary}
                    size={23}
                    style={{ padding: 8 }}
                  />
                }
                style={{ fontSize: 15, color: appcolor.dark }}
                placeholderTextColor="#c2c2c2"
                disabled={true}
                rightIcon={
                  <TouchableOpacity onPress={setCopy}>
                    {
                      <SpiralIcon
                        name="copy"
                        type="ionicon"
                        color={appcolor.primary}
                        size={23}
                        style={{ padding: 8 }}
                      />
                    }
                  </TouchableOpacity>
                }
              />
            </View>
            <View style={{ padding: 8 }}>
              <Text onPress={handlerFogotPassword} style={styles.titleForgot}>
                Quên mật khẩu?
              </Text>
            </View>
            <Button
              buttonStyle={{
                width: '80%',
                padding: 12,
                backgroundColor: appcolor.primary,
                borderRadius: 10,
                alignSelf: 'center',
                marginTop: 16,
              }}
              titleStyle={{
                color: appcolor.white,
                fontSize: 15,
                fontWeight: '600',
              }}
              containerStyle={{ flexGrow: 1 }}
              onPress={handlerLogin}
              loading={showProgress}
              title="Đăng nhập"
            />
          </View>
          <View style={{ width: '100%', flexGrow: 1, alignSelf: 'center' }}>
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
              {'Version: ' + versionApp}
            </Text>
            <Text
              style={{
                padding: 3,
                width: '100%',
                textAlign: 'center',
                fontSize: scaleSize(15),
                color: appcolor.dark,
                fontWeight: '800',
              }}
            >
              Spiral Co.,Ltd
            </Text>
            <Text
              style={{
                padding: 3,
                width: '100%',
                fontSize: scaleSize(11),
                textAlign: 'center',
                color: appcolor.dark,
                fontWeight: '600',
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
export default LoginDaikin;
