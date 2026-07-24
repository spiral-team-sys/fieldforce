import React, { PureComponent, createRef } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APPNAME } from '../../Core/URLs';
import { Icon, Button, SocialIcon } from '@rneui/themed';
import Moment from 'moment';
import { MessageInfo, defaultSetting, ToastError } from '../../Core/Helper';
import messaging from '@react-native-firebase/messaging';
import { checkNetwork, alertNotify, deviceHeight } from '../../Core/Utility';
import DeviceInfo from 'react-native-device-info';
import * as Progress from 'react-native-progress';
import { connect } from 'react-redux';
import { AppCreateAction } from '../../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { scaleSize } from '../../Themes/AppsStyle';
import { Modal } from 'react-native';
import WebViewUI from '../../Content/WebViewUI';
import { Social } from '../../Control/SocialSignIn';
import {
  saveTokenUser,
  onLogin,
  saveTokenUserToGapp,
  SendEmailPass,
} from '../../Controller/UserController';
import ForgotPassword from '../../Control/ForgotPassword';
import { LocalSignIn, SERCURITY } from '../../Control/LocalSignIn';
const delay = ms => new Promise(res => setTimeout(res, ms));
const versionApp = DeviceInfo.getVersion();
const versionNumBuild = DeviceInfo.getBuildNumber();
const refLogin = createRef();
const refEmail = createRef();
const ePOPTYPE = {
  SOCIAL: 'social',
  PRIVACY: 'privacy',
};
class LoginHisense extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      isShowPass: false,
      username: '', //asmdemo //'testpchuy@hmdretail.vn',////testperson@hmdretail.vn//hue.ttk@hmdretail.vn //long.td@hmdretail.vn
      password: '',
      email: '',
      token: null,
      isUser: false,
      isPass: false,
      requestPass: false,
      isSecLocal: 0,
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
    await LocalSignIn.isSupportID(v => {
      this.setState({ isSecLocal: v });
    });
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === 1) {
      this._requestToken = await this.requestToken();
    }
  }
  componentWillUnmount() {
    this._requestToken && this._requestToken?.remove();
  }
  // Forgot Password
  async onChangeUsername(value) {
    this.setState({ username: value?.trim() });
  }
  async onChangeEmail(value) {
    this.setState({ email: value?.trim() });
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
    if (result.statusId === 200) {
      await AsyncStorage.setItem(SERCURITY.LOCALSECUIRY, '{}');
      this.setState({ requestPass: false });
    }
    alertNotify(result.messager);
  }
  //
  requestToken = async () => {
    let fcmTokenHave = await AsyncStorage.getItem('fcmToken');
    // console.log(fcmTokenHave,"token")
    if (
      fcmTokenHave === null ||
      fcmTokenHave === undefined ||
      fcmTokenHave === ''
    ) {
      messaging()
        .getToken()
        .then(async fcmToken => {
          if (fcmToken) {
            // console.log(fcmToken, "token")
            await this.setState({ token: fcmToken });
            await AsyncStorage.setItem('fcmToken', fcmToken);
          }
        });
      messaging().onTokenRefresh(async fcmToken => {
        // console.log(fcmToken, "token")
        await this.setState({ token: fcmToken });
        await AsyncStorage.setItem('fcmToken', fcmToken);
      });
    } else {
      this.setState({ token: fcmTokenHave });
    }
  };
  onLoginPress = async () => {
    await this.requestToken();
    if (this.state.username == null || this.state.username.length == 0) {
      ToastError('Bạn chưa nhập tên đăng nhập!', 'Lỗi', 'top');
      return;
    }
    if (this.state.password === '') {
      ToastError('Mật khẩu không được để trống!', 'Lỗi', 'top');
      return;
    }
    if (this.state.token === null) {
      ToastError('Không thể lấy được mã thiết bị !', 'Lỗi', 'top');
      return;
    } else {
      await this.SignIn();
    }
  };
  SignInWithOut = async provider => {
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    if (this.state.token === null || this.state.token === '')
      await ToastError('Chưa lấy được mã xác thực');
    else {
      try {
        await this.setShowProgress(true);
        const item = {
          deviceId: DeviceInfo.getUniqueId(),
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
          await saveTokenUser(info).then(() => {
            this.props.GAppController.SetUserInfo(info);
          });
        } else {
          await alert(result.messager);
        }
        await this.setShowProgress(false);
      } catch {
        await this.setShowProgress(false);
      }
    }
  };
  async SignIn() {
    let IMEI = await DeviceInfo.getUniqueId();
    await this.setShowProgress(true);
    const requestInfo = {
      username: this.state.username,
      client_time: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      password: this.state.password,
      DeviceToken: this.state.token,
      Platform: Platform.OS,
      IMEI: IMEI,
      versionid: versionNumBuild,
    };
    await onLogin(
      requestInfo,
      res => {
        saveTokenUserToGapp(
          res,
          this.props.GAppController,
          JSON.stringify(requestInfo),
        ).then(() => {
          this.props?.onLoginCallBack();
        });
        this.setShowProgress(false);
      },
      () => {
        this.setShowProgress(false);
      },
    );
  }
  async SignInTouchID() {
    const localsec =
      (await AsyncStorage.getItem(SERCURITY.LOCALSECUIRY)) || '{}';
    let requestInfo = JSON.parse(localsec || {});
    if (
      requestInfo.username !== undefined &&
      requestInfo.password !== undefined
    ) {
      let IMEI = await DeviceInfo.getUniqueId();
      await this.setShowProgress(true);
      requestInfo.client_time = Moment(new Date()).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      requestInfo.DeviceToken = this.state.token;
      requestInfo.IMEI = IMEI;
      requestInfo.versionid = versionNumBuild;
      await onLogin(
        requestInfo,
        res => {
          saveTokenUserToGapp(
            res,
            this.props.GAppController,
            JSON.stringify(requestInfo),
          );
          this.props?.onLoginCallBack();
          this.setShowProgress(false);
        },
        () => {
          this.setShowProgress(false);
        },
      );
    } else {
      ToastError('Chưa xác thực tài khoản trên thiết bị này', 'Lỗi', 'top');
    }
  }
  render() {
    const appcolor = this.props.appcolor;
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: appcolor.primary,
        }}
      >
        {this.state.requestPass ? (
          <ForgotPassword
            refLoginName={refLogin}
            refEmail={refEmail}
            handlerCloseRequest={() => this.setState({ requestPass: false })}
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
              backgroundColor: appcolor.primary,
            }}
          >
            <View style={{ height: '100%', width: '100%' }}>
              <View style={{ height: '27%', width: '100%', paddingTop: 40 }}>
                <Text
                  style={{
                    marginLeft: 12,
                    width: '100%',
                    fontWeight: 'bold',
                    fontSize: scaleSize(32),
                    color: appcolor.dark,
                  }}
                >
                  Đăng nhập {APPNAME.toLocaleLowerCase()}
                </Text>
                <View style={{ padding: 17 }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ showModel: true })}
                  >
                    <Text
                      style={{ color: appcolor.dark, fontSize: scaleSize(12) }}
                    >
                      Bằng việc đăng nhập bạn đã đồng ý với
                      <Text
                        style={{
                          color: appcolor.black,
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
                          color: appcolor.black,
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
              </View>
              <View
                style={{
                  height: '53%',
                  width: '100%',
                  paddingLeft: 22,
                  paddingRight: 22,
                  borderTopRightRadius: 40,
                  borderTopLeftRadius: 40,
                  backgroundColor: appcolor.light,
                }}
              >
                <View
                  style={{
                    width: '100%',
                    backgroundColor: appcolor.surface,
                    borderRadius: 20,
                    marginTop: 55,
                  }}
                >
                  <TextInput
                    defaultValue={this.state.username?.toLowerCase()}
                    style={{
                      padding: 12,
                      fontSize: 15,
                      zIndex: 100,
                      color: appcolor.dark,
                    }}
                    returnKeyType="next"
                    autoCorrect={false}
                    autoCapitalize="none"
                    autoComplete="username"
                    onSubmitEditing={() => this._refPass.focus()}
                    blurOnSubmit={false}
                    placeholder="Tên đăng nhập"
                    placeholderTextColor="#c2c2c2"
                    onChangeText={value => this.setState({ username: value })}
                  />
                </View>
                <View style={{ height: 20, width: '100%' }}></View>
                <View
                  style={{
                    width: '100%',
                    backgroundColor: appcolor.surface,
                    borderRadius: 20,
                    flexDirection: 'row',
                  }}
                >
                  <TextInput
                    style={{
                      flexGrow: 1,
                      padding: 12,
                      fontSize: 15,
                      color: appcolor.dark,
                    }}
                    ref={ref => {
                      this._refPass = ref;
                    }}
                    returnKeyType="done"
                    onSubmitEditing={() => this.onLoginPress()}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#c2c2c2"
                    secureTextEntry={this.state.isShowPass ? false : true}
                    onChangeText={value =>
                      this.setState({ password: value?.trim() })
                    }
                  />
                  <TouchableOpacity
                    style={{ right: 12, alignSelf: 'center' }}
                    onPress={e =>
                      this.setState({
                        isShowPass: this.state.isShowPass ? false : true,
                      })
                    }
                  >
                    <SpiralIcon
                      name={
                        this.state.isShowPass
                          ? 'eye-outline'
                          : 'eye-off-outline'
                      }
                      type="ionicon"
                      color={appcolor.primary}
                      size={20}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    width: '100%',
                    backgroundColor: appcolor.transparent,
                  }}
                >
                  <TouchableOpacity
                    style={{ padding: 12, alignItems: 'flex-end' }}
                    onPress={() => this.setState({ requestPass: true })}
                  >
                    <Text style={{ color: appcolor.dark, fontStyle: 'italic' }}>
                      Lấy lại mật khẩu ?
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ marginTop: 10, width: '100%' }}>
                  <Button
                    buttonStyle={{
                      padding: 12,
                      backgroundColor: appcolor.black,
                      borderRadius: 20,
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
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    marginTop: 15,
                    alignSelf: 'center',
                    justifyContent: 'center',
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
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {this.state.isSecLocal > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        LocalSignIn.onAuthenticateID(e => {
                          if (e === 1) this.SignInTouchID();
                          else {
                            ToastError(e, 'Lỗi', 'top');
                          }
                        })
                      }
                    >
                      <SpiralIcon
                        raised
                        reverse
                        name="finger-print"
                        type="ionicon"
                        color={appcolor.primary}
                      />
                    </TouchableOpacity>
                  )}
                  <SocialIcon
                    title="Signin with facebook"
                    onPress={() => this.SignInWithOut(Social.PR0VIDER.F)}
                    type={'facebook'}
                    iconType={'font-awesome'}
                  />
                  <SocialIcon
                    title="Signin with facebook"
                    onPress={() => this.SignInWithOut(Social.PR0VIDER.G)}
                    type={'google'}
                    iconType={'font-awesome'}
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
              <View
                style={{
                  height: '20%',
                  justifyContent: 'center',
                  width: '100%',
                  backgroundColor: appcolor.light,
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
                  27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                </Text>
              </View>
              <Modal
                animationType="slide"
                visible={this.state.showModel || false}
              >
                <WebViewUI
                  onClose={() => this.setState({ showModel: false })}
                  pageName="Điều khoản & chính sách"
                  urlPage={'https://hsv.spiral.com.vn/privacy.html?'}
                />
              </Modal>
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
                  marginTop: deviceHeight / 2,
                }}
              />
            )}
          </View>
        )}
      </View>
    );
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
export default connect(mapStateToProps, mapDispathToProps)(LoginHisense);
