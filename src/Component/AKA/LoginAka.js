import React, { PureComponent, createRef } from 'react';
import {
  View,
  Text,
  Platform,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppNameBuild,
  APPNAME,
  signifyApp,
  AppStoreURL,
} from './../../Core/URLs';
import { Input, Icon, Button, CheckBox } from '@rneui/themed';
import Moment from 'moment';
import { MessageInfo, defaultSetting, ToastError } from '../../Core/Helper';
import messaging from '@react-native-firebase/messaging';
import { checkNetwork, alertNotify } from '../../Core/Utility';
import DeviceInfo from 'react-native-device-info';
import * as Progress from 'react-native-progress';
import LinearGradient from 'react-native-linear-gradient';

import { connect } from 'react-redux';
import { AppCreateAction } from '../../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { scaleSize } from '../../Themes/AppsStyle';
import { Modal } from 'react-native';
import WebViewUI from '../../Content/WebViewUI';
import { Social } from '../../Control/SocialSignIn';
import LottieView from 'lottie-react-native';
import {
  saveTokenUser,
  onLogin,
  saveTokenUserToGapp,
  SendEmailPass,
} from '../../Controller/UserController';
import ForgotPassword from '../../Control/ForgotPassword';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const versionApp = DeviceInfo.getVersion();
const versionNumBuild = DeviceInfo.getBuildNumber();
const refLogin = createRef();
const refEmail = createRef();
const ePOPTYPE = {
  SOCIAL: 'social',
  PRIVACY: 'privacy',
};
class LoginAka extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      isShowPass: false,
      username: '',
      password: '',
      email: '',
      token: '',
      isUser: false,
      isPass: false,
      requestPass: false,
      popType: ePOPTYPE.PRIVACY,
    };
  }
  setShowProgress = check => {
    this.setState({ showProgress: check });
  };
  ThemeDefault = async () => {
    await checkNetwork();
    const json = await AsyncStorage.getItem('SETTINGS');
    const settings = (await JSON.parse(json)) || defaultSetting;
    this.props.GAppController.SetTheme(settings.mode);
  };
  async componentDidMount() {
    await this.ThemeDefault();
    this._requestToken = await this.requestToken();
  }
  componentWillUnmount() {
    this._requestToken && this._requestToken?.remove();
  }
  // Forgot Password
  async onChangeUsername(value) {
    this.setState({ username: value });
  }
  async onChangeEmail(value) {
    this.setState({ email: value });
  }
  async SendMailRequest() {
    let emailStr = this.state.email || '';
    let usernameStr = this.state.username || '';

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
      MessageInfo(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    const result = await SendEmailPass(this.state.username, this.state.email);
    if (result.statusId === 200) this.setState({ requestPass: false });
    alertNotify(result.messager);
  }
  //
  async requestToken() {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === 1) {
      let fcmTokenHave = await AsyncStorage.getItem('fcmToken');
      if (fcmTokenHave === null || fcmTokenHave.length > 10) {
        await messaging()
          .getToken()
          .then(async fcmToken => {
            if (fcmToken) {
              await this.setState({ token: fcmToken });
              await AsyncStorage.setItem('fcmToken', fcmToken);
            } else {
              console.log(fcmToken);
            }
          });
        await messaging().onTokenRefresh(async fcmToken => {
          await this.setState({ token: fcmToken });
          await AsyncStorage.setItem('fcmToken', fcmToken);
        });
      } else {
        await this.setState({ token: fcmTokenHave });
      }
    } else {
      await ToastError('Chưa lấy mã xác thực thiết bị', 'top');
    }
  }
  onLoginPress = async () => {
    this._requestToken = await this.requestToken();
    if (this.state.token === null || this.state.token.length < 10) {
      ToastError('Chưa lấy được mã xác thực thiết bị', 'token', 'top');
    }
    if (this.state.username == null || this.state.username == 0) {
      ToastError('Bạn chưa nhập tên đăng nhập!', 'ten dang nhap', 'top');
      return;
    }
    if (this.state.password === null || this.state.password.length < 1) {
      ToastError('Mật khẩu không được để trống!', 'mat khau', 'top');
      return;
    } else {
      this.SignIn();
    }
  };
  SignInWithOut = async provider => {
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      alert(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    if (this.state.token === null || this.state.token === '')
      await alert('Chưa lấy được mã xác thực');
    else {
      await this.setShowProgress(true);
      const item = {
        deviceId: await DeviceInfo.getUniqueId(),
        deviceToken: this.state.token,
        deviceType: Platform.OS === 'ios' ? 2 : 1,
      };
      const result = await Social.signWithOut(provider, item);
      if (result.statusId === 200) {
        const info = result.data[0];
        const json = await AsyncStorage.getItem('SETTINGS');
        let settings = JSON.parse(json) || defaultSetting;
        switch (provider) {
          case Social.PR0VIDER.G:
            settings.google = true;
            break;
          case Social.PR0VIDER.F:
            settings.facebook = true;
            break;
          default:
            break;
        }
        // console.log(settings, "signInOut")
        await AsyncStorage.setItem('SETTINGS', JSON.stringify(settings));
        //token
        await saveTokenUser(info);

        await this.props.GAppController.SetUserInfo(info);
      } else {
        await alert(result.messager);
      }
      await this.setShowProgress(false);
    }
  };
  async SignIn() {
    let IMEI = await DeviceInfo.getUniqueId();
    const AppId = await DeviceInfo.getBuildId();
    await this.setShowProgress(true);
    const requestInfo = {
      username: this.state.username,
      client_time: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      password: this.state.password,
      DeviceToken: this.state.token,
      Platform: Platform.OS,
      IMEI: IMEI,
      AppId: AppId,
      versionid: versionNumBuild,
    };
    await onLogin(
      requestInfo,
      async res => {
        await saveTokenUserToGapp(res, this.props.GAppController).then(
          success => {
            this.props?.onLoginCallBack();
          },
        );
        this.setShowProgress(false);
      },
      () => {
        this.setShowProgress(false);
      },
    );
    await this.setShowProgress(false);
  }
  stylesGradient = StyleSheet.create({
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      flex: 1,
      justifyContent: 'flex-end',
    },
    linearGradient: {
      flex: 1,
      borderWidth: 0,
      marginTop: -5,
      paddingLeft: 15,
      paddingRight: 15,
      borderRadius: 5,
    },
    buttonText: {
      fontSize: 18,
      fontFamily: 'Gill Sans',
      textAlign: 'center',
      margin: 10,
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    viewSelect: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 10,
      // shadowColor: DEFAULT_COLOR,
      shadowRadius: 5,
      shadowOpacity: 1.0,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 5,
    },
    viewNotSelect: {
      backgroundColor: '#ffffff',
    },
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: this.props.appcolor.light,
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
    buttonLogin: {},
    inputLogin: {
      width: '100%',
      borderWidth: 0.5,
      borderColor: this.props.appcolor.darklight,
      borderRadius: 5,
      padding: 12,
      alignItems: 'center',
      marginBottom: 16,
    },
    titleLogin: {
      width: '100%',
      padding: 16,
      fontSize: scaleSize(28),
      fontWeight: '700',
      color: this.props.appcolor.dark,
    },
    titleForgot: {
      fontSize: scaleSize(14),
      color: this.props.appcolor.dark,
      fontWeight: '600',
      textAlign: 'center',
      position: 'absolute',
      right: 16,
    },
    mainInput: { width: '100%', height: '40%' },
  });
  render() {
    const appcolor = this.props.appcolor;
    switch (AppNameBuild) {
      case signifyApp:
        return (
          <View style={{ flex: 1 }}>
            {this.state.requestPass ? (
              <ForgotPassword
                refLoginName={refLogin}
                refEmail={refEmail}
                handlerCloseRequest={() =>
                  this.setState({ requestPass: false })
                }
                UserNameChangeText={value => this.onChangeUsername(value)}
                EmailChangeText={value => this.onChangeEmail(value)}
                SendMail={() => this.SendMailRequest()}
              />
            ) : (
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                  flex: 1,
                  backgroundColor: appcolor.light,
                }}
              >
                <View style={{ height: '100%', width: '100%' }}>
                  {/* <Image style={{ maxHeight: 100, minHeight: 100, marginTop: 60 }} source={require('./../Themes/Images/LG_logo.png')} //logo_spiral.png
                                    resizeMode='contain' /> */}
                  <View style={{ width: '100%', height: '20%', marginTop: 40 }}>
                    <LottieView
                      autoPlay
                      style={{ height: '100%' }}
                      source={require('../../Themes/lotties/cargill_welcome.json')}
                    />
                  </View>

                  <View
                    style={{
                      paddingLeft: 12,
                      paddingRight: 12,
                      margin: 12,
                      backgroundColor: appcolor.light,
                      borderTopColor: appcolor.primary,
                      borderTopWidth: 11,
                      borderBottomColor: appcolor.primary,
                      borderBottomWidth: 14,
                      borderRadius: 42,
                      borderLeftWidth: 0.5,
                      borderRightWidth: 0.1,
                    }}
                  >
                    <Text
                      style={{
                        marginLeft: 12,
                        width: '100%',
                        fontWeight: '500',
                        fontSize: scaleSize(23),
                        color: appcolor.primary,
                        padding: 7,
                      }}
                    >
                      Đăng nhập {APPNAME}
                    </Text>
                    <View>
                      <Input
                        defaultValue={this.state.username}
                        style={{ fontSize: 15, color: appcolor.dark }}
                        returnKeyType="next"
                        autoCorrect={false}
                        onSubmitEditing={() => this._refPass.focus()}
                        blurOnSubmit={false}
                        placeholder="Tên đăng nhập"
                        placeholderTextColor="#c2c2c2"
                        onChangeText={value =>
                          this.setState({ username: value?.trim() })
                        }
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
                    <View style={{ height: 6 }}></View>
                    <View>
                      <Input
                        style={{
                          fontSize: 15,
                          color: appcolor.dark,
                          margin: 0,
                          borderWidth: 0,
                        }}
                        ref={ref => {
                          this._refPass = ref;
                        }}
                        returnKeyType="done"
                        onSubmitEditing={() =>
                          this.state.accept ? this.onLoginPress() : null
                        }
                        placeholder="Mật khẩu"
                        placeholderTextColor="#c2c2c2"
                        leftIcon={
                          <SpiralIcon
                            name="lock-closed-outline"
                            type="ionicon"
                            color={appcolor.primary}
                            size={23}
                            style={{ padding: 0 }}
                          />
                        }
                        rightIcon={
                          <SpiralIcon
                            name={
                              this.state.isShowPass
                                ? 'eye-outline'
                                : 'eye-off-outline'
                            }
                            type="ionicon"
                            color={appcolor.primary}
                            onPress={e =>
                              this.setState({
                                isShowPass: this.state.isShowPass
                                  ? false
                                  : true,
                              })
                            }
                            size={20}
                          />
                        }
                        secureTextEntry={this.state.isShowPass ? false : true}
                        onChangeText={value =>
                          this.setState({ password: value?.trim() })
                        }
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('WebView', {
                          urlPage: `${AppStoreURL}/privacyvn.html`,
                        })
                      }
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <CheckBox
                        onPress={() =>
                          this.setState({ accept: !this.state.accept })
                        }
                        checked={this.state.accept}
                        style={{ marginRight: 1 }}
                      />
                      <Text
                        style={{
                          color: appcolor.dark,
                          fontSize: 10,
                          marginRight: 80,
                        }}
                      >
                        Bằng việc đăng nhập bạn đã đồng ý với{' '}
                        <Text
                          style={{
                            color: appcolor.danger,
                            fontSize: 10,
                            fontStyle: 'italic',
                            textDecorationLine: 'underline',
                          }}
                        >
                          Điều khoản, điều kiện cùng chính sách bảo mật chia sẽ
                          thông tin của ứng dụng
                        </Text>
                      </Text>
                    </TouchableOpacity>
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
                        onPress={() => this.setState({ requestPass: true })}
                      />
                      <Button
                        disabled={!this.state.accept}
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
                        onPress={this.onLoginPress}
                        title="Đăng nhập"
                      />
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
                      {'Version: ' + versionApp}
                    </Text>
                  </View>
                  {/* <View style={{ backgroundColor: 'transparent', height: '45%' }} /> */}
                  <View
                    style={{
                      position: 'absolute',
                      zIndex: -1,
                      justifyContent: 'center',
                      bottom: 40,
                      width: '100%',
                    }}
                  >
                    <Text
                      style={{
                        padding: 3,
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
                        fontSize: scaleSize(11),
                        textAlign: 'center',
                        color: appcolor.dark,
                        fontWeight: '600',
                      }}
                    >
                      27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí
                      Minh
                    </Text>
                  </View>
                </View>
                {this.state.showProgress === true && (
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
            )}
          </View>
        );

      default:
        return (
          <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <Text
              style={{
                color: appcolor.danger,
                fontSize: 20,
                textAlign: 'center',
              }}
            >
              No App Config
            </Text>
          </View>
        );
    }
  }
}
const mapStateToProps = state => {
  return {
    appcolor: state.GAppState.appcolor,
  };
};
const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(LoginAka);
