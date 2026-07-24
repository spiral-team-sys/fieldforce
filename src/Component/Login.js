import React, { useState, useEffect, useRef, createRef } from 'react';
import {
    View,
    Text,
    ImageBackground,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AppNameBuild,
    CONTENT_COLOR,
    DEFAULT_COLOR,
    epsonApp,
    hafeleApp,
    hpiApp,
    psvApp,
    mitsuApp,
    demoApp,
    nokiaApp,
    artApp,
    APPNAME,
    lgApp,
} from './../Core/URLs';
import {
    Card,
    Input,
    Icon,
    Button,
    Image,
    Text as TextHead,
} from '@rneui/themed';
import Moment from 'moment';
import { colorList, defaultSetting, ToastError } from '../Core/Helper';
import messaging from '@react-native-firebase/messaging';
import { checkNetwork, alertNotify, deviceHeight } from '../Core/Utility';
import DeviceInfo from 'react-native-device-info';
import * as Progress from 'react-native-progress';
import WavyHeader from './WaveHeader/WavyHeader';
import { scaleSize } from '../Themes/AppsStyle';
import { Modal } from 'react-native';
import WebViewUI from '../Content/WebViewUI';
import { Social } from '../Control/SocialSignIn';
import LottieView from 'lottie-react-native';
import {
    saveTokenUser,
    onLogin,
    SendEmailPass,
    saveTokenUserToGapp,
} from '../Controller/UserController';
import ForgotPassword from '../Control/ForgotPassword';
import LinearGradient from 'react-native-linear-gradient';
import SpiralIcon from '../Control/Icon/SpiralIcon';
const versionApp = DeviceInfo.getVersion();
const versionNumBuild = DeviceInfo.getBuildNumber();
const refLogin = createRef();
const refEmail = createRef();
const ePOPTYPE = {
    SOCIAL: 'social',
    PRIVACY: 'privacy',
};
const Login = props => {
    const [showProgress, setShowProgress] = useState(false);
    const [isShowPass, setIsShowPass] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [isUser, setIsUser] = useState(false);
    const [isPass, setIsPass] = useState(false);
    const [requestPass, setRequestPass] = useState(false);
    const [popType, setPopType] = useState(ePOPTYPE.PRIVACY);

    const _refPass = useRef(null);

    const ThemeDefault = async () => {
        await checkNetwork();
        const json = await AsyncStorage.getItem('SETTINGS');
        const settings = (await JSON.parse(json)) || defaultSetting;
        props.GAppController.SetTheme(settings.mode);
    };

    useEffect(() => {
        const initialize = async () => {
            await ThemeDefault();
            const token = await requestToken();
            setToken(token);
        };
        initialize();
        return () => {
            // Cleanup if needed
        };
    }, []);

    const onChangeUsername = async value => {
        setUsername(value);
    };

    const onChangeEmail = async value => {
        setEmail(value);
    };

    const SendMailRequest = async () => {
        let emailStr = email || '';
        let usernameStr = username || '';

        if (usernameStr.includes(' ')) {
            ToastError('Tên đăng nhập không được nhập khoảng trắng!');
            return;
        } else if (emailStr.includes(' ')) {
            ToastError('email không được nhập khoảng trắng!');
            return;
        }

        if (usernameStr.length == 0) {
            ToastError('Bạn chưa nhập tên đăng nhập!');
            refLogin?.current?.shake();
            return;
        } else if (emailStr.length == 0) {
            ToastError('Bạn chưa nhập email!');
            refEmail?.current?.shake();
            return;
        } else if (!emailStr.includes('@')) {
            ToastError('Không đúng định dạng mail!');
            refEmail?.current?.shake();
            return;
        }

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError(
                'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
            );
            return;
        }

        const result = await SendEmailPass(username, email);
        if (result.statusId === 200) setRequestPass(false);
        alertNotify(result.messager);
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
            ToastError('Chưa lấy mã xác thực thiết bị', 'top');
        }
    };

    const onLoginPress = async () => {
        const isconected = await checkNetwork();
        if (isconected) {
            const token = await requestToken();
            setToken(token);
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
                SignIn();
            }
        } else {
            ToastError('Vui lòng kiểm tra kết nối mạng', 'No Internet');
        }
    };

    const SignInWithOut = async provider => {
        const isNetwork = await checkNetwork();
        if (!isNetwork) {
            alert(
                'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
            );
            return;
        }
        if (token === null || token === '')
            await alert('Chưa lấy được mã xác thực');
        else {
            setShowProgress(true);
            const item = {
                deviceId: await DeviceInfo.getUniqueId(),
                deviceToken: token,
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
                await AsyncStorage.setItem('SETTINGS', JSON.stringify(settings));
                await saveTokenUser(info);
                await props.GAppController.SetUserInfo(info);
            } else {
                await alert(result.messager);
            }
            setShowProgress(false);
        }
    };

    const SignIn = async () => {
        let IMEI = await DeviceInfo.getUniqueId();
        const AppId = await DeviceInfo.getBuildId();
        setShowProgress(true);
        const requestInfo = {
            username: username,
            client_time: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
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
                await saveTokenUserToGapp(res, props.GAppController).then(success => {
                    props?.onLoginCallBack();
                });
                setShowProgress(false);
            },
            () => {
                setShowProgress(false);
            },
        );
        setShowProgress(false);
    };

    const stylesGradient = StyleSheet.create({
        buttonLogin: {
            backgroundColor: props.appcolor.primary,
            padding: 16,
            borderRadius: 20,
            textAlign: 'center',
            alignContent: 'center',
            alignItems: 'center',
            width: '50%',
            alignSelf: 'center',
            marginTop: 12,
        },
        buttonForgot: {
            backgroundColor: props.appcolor.light,
            padding: 16,
            borderRadius: 20,
            textAlign: 'center',
            alignContent: 'center',
            width: '40%',
            marginRight: 20,
            borderWidth: 0.7,
            borderColor: props.appcolor.primary,
            alignSelf: 'center',
            marginTop: 12,
        },
        buttonText: {
            fontSize: 12,
            fontFamily: 'Gill Sans',
            textAlign: 'center',
            color: props.appcolor.light,
        },
        viewSelect: {
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: 10,
            shadowRadius: 5,
            shadowOpacity: 1.0,
            shadowOffset: {
                width: 0,
                height: 3,
            },
            elevation: 5,
        },
        viewNotSelect: {
            backgroundColor: props.appcolor.white,
        },
        mainContainer: {
            width: '100%',
            height: '100%',
            backgroundColor: props.appcolor.light,
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
            borderColor: props.appcolor.darklight,
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
            color: props.appcolor.dark,
        },
        titleForgot: {
            fontSize: scaleSize(14),
            color: props.appcolor.dark,
            fontWeight: '600',
            textAlign: 'center',
            position: 'absolute',
            right: 16,
        },
        mainInput: { width: '100%', height: '40%' },
    });

    const Pattent = () => {
        var pattent = [];
        const marginLeft = 40;
        for (let index = 0; index < 11; index++) {
            pattent.push(
                <View
                    style={{
                        width: 40,
                        height: 190,
                        position: 'absolute',
                        backgroundColor: colorList[index],
                        shadowColor: props.appcolor.dark,
                        shadowOffset: { width: 3, height: 0.3 },
                        shadowOpacity: 0.9,
                        elevation: 5,
                        marginTop: 30 + index * 7,
                        borderRadius: 300,
                        marginLeft: index * marginLeft,
                    }}
                />,
            );
        }
        return pattent;
    };

    const appcolor = props.appcolor;
    switch (AppNameBuild) {
        case lgApp:
            return (
                <View style={{ flex: 1 }}>
                    {requestPass ? (
                        <ForgotPassword
                            refLoginName={refLogin}
                            refEmail={refEmail}
                            handlerCloseRequest={() => setRequestPass(false)}
                            UserNameChangeText={value => onChangeUsername(value)}
                            EmailChangeText={value => onChangeEmail(value)}
                            SendMail={() => SendMailRequest()}
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
                                <View style={{ width: '100%', height: '20%', marginTop: 40 }}>
                                    <LottieView
                                        autoPlay
                                        style={{ height: '100%' }}
                                        source={require('../Themes/lotties/welcome.json')}
                                    />
                                </View>
                                <Text
                                    style={{
                                        marginLeft: 12,
                                        width: '100%',
                                        fontWeight: '500',
                                        fontSize: scaleSize(28),
                                        color: appcolor.primary,
                                    }}
                                >
                                    Đăng nhập {APPNAME}
                                </Text>

                                <View style={{ paddingLeft: 12, paddingRight: 12 }}>
                                    <View>
                                        <Input
                                            defaultValue={username}
                                            style={{ fontSize: 15, color: appcolor.dark }}
                                            returnKeyType="next"
                                            autoCorrect={false}
                                            onSubmitEditing={() => _refPass.current.focus()}
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
                                    <View style={{ height: 15 }}></View>
                                    <View>
                                        <Input
                                            style={{ fontSize: 15, color: appcolor.dark }}
                                            ref={_refPass}
                                            returnKeyType="done"
                                            onSubmitEditing={() => onLoginPress()}
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
                                                    onPress={e => setIsShowPass(!isShowPass)}
                                                    size={20}
                                                />
                                            }
                                            secureTextEntry={!isShowPass}
                                            onChangeText={value => setPassword(value?.trim())}
                                        />
                                    </View>
                                    <View style={{ padding: 7 }}>
                                        <TouchableOpacity onPress={() => setShowModel(true)}>
                                            <Text
                                                style={{
                                                    color: appcolor.dark,
                                                    fontSize: scaleSize(12),
                                                }}
                                            >
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
                                        {'Version: ' + versionApp}
                                    </Text>
                                </View>
                                <WavyHeader flip={true} />
                                <View
                                    style={{
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
                                        27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                                    </Text>
                                </View>
                                <Modal animationType="slide" visible={showModel || false}>
                                    {
                                        <WebViewUI
                                            onClose={() => setShowModel(false)}
                                            pageName="Điều khoản & chính sách"
                                            urlPage={'https://lg-e.spiral.com.vn/privacy.html?'}
                                        />
                                    }
                                </Modal>
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
                    )}
                </View>
            );
        case demoApp:
            return (
                <View
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                        flex: 8,
                        backgroundColor: 'white',
                    }}
                >
                    <SafeAreaView
                        style={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: appcolor.light,
                        }}
                    >
                        <KeyboardAvoidingView
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                            enabled
                            keyboardVerticalOffset={0}
                        >
                            <View style={{ backgroundColor: 'transparent', height: '40%' }} />

                            <View
                                style={{ height: '52%', paddingLeft: 15, paddingRight: 15 }}
                            >
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <Input
                                        style={{ fontSize: 15, color: 'gray' }}
                                        returnKeyType="next"
                                        onSubmitEditing={() => _refPass.current.focus()}
                                        blurOnSubmit={false}
                                        selectTextOnFocus
                                        placeholder="Tên đăng nhập"
                                        placeholderTextColor="#c2c2c2"
                                        onChangeText={value => setUsername(value)}
                                        leftIcon={
                                            <SpiralIcon
                                                name="person-outline"
                                                type="ionicon"
                                                color="black"
                                                size={23}
                                                style={{ padding: 8 }}
                                            />
                                        }
                                    />
                                </View>
                                <View style={{ height: 15 }}></View>
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <Input
                                        style={{ fontSize: 15, color: 'gray' }}
                                        ref={_refPass}
                                        returnKeyType="done"
                                        onSubmitEditing={() => onLoginPress()}
                                        placeholder="Mật khẩu"
                                        placeholderTextColor="#c2c2c2"
                                        leftIcon={
                                            <SpiralIcon
                                                name="lock-closed-outline"
                                                type="ionicon"
                                                color="black"
                                                size={23}
                                                style={{ padding: 8 }}
                                            />
                                        }
                                        rightIcon={
                                            <SpiralIcon
                                                name={isShowPass ? 'eye-outline' : 'eye-off-outline'}
                                                type="ionicon"
                                                onPress={e => setIsShowPass(!isShowPass)}
                                                size={20}
                                            />
                                        }
                                        secureTextEntry={!isShowPass}
                                        containerStyle={{ marginBottom: 20 }}
                                        onChangeText={value => setPassword(value)}
                                    />
                                </View>
                                <Button
                                    buttonStyle={{
                                        backgroundColor: DEFAULT_COLOR,
                                        borderRadius: 10,
                                    }}
                                    containerStyle={{ backgroundColor: DEFAULT_COLOR }}
                                    titleStyle={{
                                        color: 'white',
                                        fontSize: 15,
                                        fontWeight: '700',
                                    }}
                                    style={{ padding: 5 }}
                                    onPress={onLoginPress}
                                    title="Đăng nhập"
                                />

                                <Text
                                    style={{
                                        padding: 3,
                                        width: '100%',
                                        textAlign: 'center',
                                        color: 'white',
                                        marginTop: 25,
                                        fontSize: 11,
                                    }}
                                >
                                    {'Version: ' + versionApp}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    marginBottom: 25,
                                    width: '100%',
                                }}
                            >
                                <Text
                                    style={{
                                        padding: 3,
                                        textAlign: 'center',
                                        fontSize: 11,
                                        color: '#e2e2e2',
                                    }}
                                >
                                    Spiral Co.,Ltd
                                </Text>
                                <Text
                                    style={{
                                        padding: 3,
                                        fontSize: 10,
                                        textAlign: 'center',
                                        color: '#e2e2e2',
                                    }}
                                >
                                    27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                                </Text>
                            </View>
                        </KeyboardAvoidingView>
                    </SafeAreaView>

                    {showProgress === true && (
                        <Progress.CircleSnail
                            color={DEFAULT_COLOR}
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
            );
        case mitsuApp:
            return (
                <View
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                        flex: 8,
                        backgroundColor: '#100E0C',
                    }}
                >
                    <KeyboardAvoidingView
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                        enabled
                        keyboardVerticalOffset={0}
                    >
                        <View
                            style={{
                                width: '100%',
                                height: '30%',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: appcolor.white, fontSize: 39 }}>
                                {APPNAME}
                            </Text>
                            <Text style={{ color: appcolor.white, fontSize: 12 }}>
                                Ứng dụng hỗ trợ đội ngũ nhân viên bán hàng
                            </Text>
                        </View>
                        <View style={{ height: '52%', paddingLeft: 15, paddingRight: 15 }}>
                            <View style={{ backgroundColor: 'transparent' }}>
                                <Input
                                    defaultValue={username}
                                    style={{ fontSize: 15, color: 'white' }}
                                    returnKeyType="next"
                                    autoCorrect={false}
                                    onSubmitEditing={() => _refPass.current.focus()}
                                    blurOnSubmit={false}
                                    placeholder="Tên đăng nhập"
                                    placeholderTextColor="#c2c2c2"
                                    onChangeText={value => setUsername(value)}
                                    leftIcon={
                                        <SpiralIcon
                                            name="person-outline"
                                            type="ionicon"
                                            color="white"
                                            size={23}
                                            style={{ padding: 8 }}
                                        />
                                    }
                                />
                            </View>
                            <View style={{ height: 15 }}></View>
                            <View style={{ backgroundColor: 'transparent' }}>
                                <Input
                                    style={{ fontSize: 15, color: 'white' }}
                                    ref={_refPass}
                                    returnKeyType="done"
                                    autoCorrect={false}
                                    onSubmitEditing={() => onLoginPress()}
                                    placeholder="Mật khẩu"
                                    placeholderTextColor="#c2c2c2"
                                    leftIcon={
                                        <SpiralIcon
                                            name="lock-closed-outline"
                                            type="ionicon"
                                            color="white"
                                            size={23}
                                            style={{ padding: 8 }}
                                        />
                                    }
                                    rightIcon={
                                        <SpiralIcon
                                            name={isShowPass ? 'eye-outline' : 'eye-off-outline'}
                                            type="ionicon"
                                            onPress={e => setIsShowPass(!isShowPass)}
                                            size={20}
                                        />
                                    }
                                    secureTextEntry={!isShowPass}
                                    containerStyle={{ marginBottom: 20 }}
                                    onChangeText={value => setPassword(value)}
                                />
                            </View>
                            <Button
                                buttonStyle={{
                                    backgroundColor: DEFAULT_COLOR,
                                    borderRadius: 10,
                                }}
                                containerStyle={{ backgroundColor: DEFAULT_COLOR }}
                                titleStyle={{ color: 'white', fontSize: 15, fontWeight: '700' }}
                                style={{ padding: 5 }}
                                onPress={onLoginPress}
                                title="Đăng nhập"
                            />

                            <Text
                                style={{
                                    padding: 3,
                                    width: '100%',
                                    textAlign: 'center',
                                    color: 'white',
                                    marginTop: 25,
                                    fontSize: 11,
                                }}
                            >
                                {'Version: ' + versionApp}
                            </Text>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                marginBottom: 25,
                                width: '100%',
                            }}
                        >
                            <Text
                                style={{
                                    padding: 3,
                                    textAlign: 'center',
                                    fontSize: 11,
                                    color: '#e2e2e2',
                                }}
                            >
                                Spiral Co.,Ltd
                            </Text>
                            <Text
                                style={{
                                    padding: 3,
                                    fontSize: 10,
                                    textAlign: 'center',
                                    color: '#e2e2e2',
                                }}
                            >
                                27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                            </Text>
                        </View>
                    </KeyboardAvoidingView>
                    {showProgress === true && (
                        <Progress.CircleSnail
                            color={DEFAULT_COLOR}
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
            );
        case psvApp:
            return (
                <View
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                        flex: 1,
                        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
                    }}
                >
                    {requestPass ? (
                        <ForgotPassword
                            refLoginName={refLogin}
                            refEmail={refEmail}
                            handlerCloseRequest={() => setRequestPass(false)}
                            UserNameChangeText={value => onChangeUsername(value)}
                            EmailChangeText={value => onChangeEmail(value)}
                            SendMail={() => SendMailRequest()}
                        />
                    ) : (
                        <SafeAreaView
                            style={[stylesGradient.mainContainer, { height: deviceHeight }]}
                        >
                            <View
                                style={{
                                    width: '100%',
                                    height: '20%',
                                    marginTop: 12,
                                    justifyContent: 'center',
                                }}
                            >
                                <LottieView
                                    autoPlay
                                    style={{ height: '100%' }}
                                    source={require('../Themes/lotties/welcome4.json')}
                                />
                            </View>
                            <Text
                                style={stylesGradient.titleLogin}
                            >{`Đăng nhập ${APPNAME}`}</Text>
                            <View style={[stylesGradient.mainInput, { flexGrow: 6 }]}>
                                <View
                                    style={{
                                        width: '100%',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        marginBottom: 8,
                                    }}
                                >
                                    <SpiralIcon
                                        name="person-outline"
                                        type="ionicon"
                                        color={appcolor.primary}
                                        size={23}
                                        style={{ padding: 8 }}
                                    />
                                    <Input
                                        defaultValue={username}
                                        style={{ fontSize: 15, color: appcolor.dark }}
                                        containerStyle={{ width: '80%' }}
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
                                    <SpiralIcon
                                        name="lock-closed-outline"
                                        type="ionicon"
                                        color={appcolor.primary}
                                        size={23}
                                        style={{ padding: 8 }}
                                    />
                                    <Input
                                        style={{ fontSize: 15, color: appcolor.dark }}
                                        containerStyle={{ width: '80%' }}
                                        ref={_refPass}
                                        returnKeyType="done"
                                        onSubmitEditing={onLoginPress}
                                        placeholder="Mật khẩu"
                                        placeholderTextColor="#c2c2c2"
                                        rightIcon={
                                            <SpiralIcon
                                                name={isShowPass ? 'eye-outline' : 'eye-off-outline'}
                                                type="ionicon"
                                                color={appcolor.primary}
                                                onPress={e => setIsShowPass(!isShowPass)}
                                                size={20}
                                            />
                                        }
                                        secureTextEntry={!isShowPass}
                                        onChangeText={value => setPassword(value?.trim())}
                                    />
                                </View>
                                <View style={{ padding: 8 }}>
                                    <Text
                                        onPress={() => {
                                            setRequestPass(true);
                                        }}
                                        style={stylesGradient.titleForgot}
                                    >
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
                                    onPress={onLoginPress}
                                    loading={showProgress}
                                    title="Đăng nhập"
                                />
                            </View>
                            <View style={{ bottom: 28, width: '100%', alignSelf: 'center' }}>
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
                        </SafeAreaView>
                    )}
                </View>
            );
        case hafeleApp:
            return (
                <View
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                        flex: 8,
                    }}
                >
                    <KeyboardAvoidingView
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                        enabled
                        keyboardVerticalOffset={0}
                    >
                        <ImageBackground
                            style={{
                                height: '100%',
                                width: '100%',
                                backgroundColor: '#ffffff',
                            }}
                        >
                            <Image
                                style={{ maxHeight: 200, minHeight: 35, marginTop: 70 }}
                                source={require('./../Themes/Images/Haefele_Logo.png')} //logo_spiral.png
                                resizeMode="contain"
                            />
                            <View style={{ backgroundColor: CONTENT_COLOR, height: '10%' }} />

                            <View
                                style={{
                                    backgroundColor: CONTENT_COLOR,
                                    height: '50%',
                                    paddingLeft: 15,
                                    paddingRight: 15,
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: CONTENT_COLOR,
                                        paddingLeft: 15,
                                        marginBottom: 30,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 25,
                                            fontWeight: '700',
                                            height: 45,
                                            color: DEFAULT_COLOR,
                                        }}
                                    >
                                        Login
                                    </Text>
                                    <Text
                                        style={{ fontSize: 15, fontWeight: '100', color: 'gray' }}
                                    >
                                        Vui lòng đăng nhập để bắt đầu
                                    </Text>
                                </View>
                                <View
                                    style={
                                        isUser
                                            ? stylesGradient.viewSelect
                                            : stylesGradient.viewNotSelect
                                    }
                                >
                                    <Input
                                        style={{ fontSize: 15 }}
                                        returnKeyType="next"
                                        onSubmitEditing={() => _refPass.current.focus()}
                                        blurOnSubmit={false}
                                        placeholder="Username"
                                        onChangeText={value => setUsername(value)}
                                        leftIcon={<SpiralIcon name="person" />}
                                    />
                                </View>
                                <View style={{ height: 15 }}></View>
                                <View
                                    style={
                                        isPass
                                            ? stylesGradient.viewSelect
                                            : stylesGradient.viewNotSelect
                                    }
                                >
                                    <Input
                                        style={{ fontSize: 15 }}
                                        ref={_refPass}
                                        returnKeyType="done"
                                        onSubmitEditing={() => onLoginPress()}
                                        placeholder="Password"
                                        leftIcon={<SpiralIcon name="lock" />}
                                        rightIcon={
                                            <SpiralIcon
                                                name={isShowPass ? 'eye' : 'eye-with-line'}
                                                type="entypo"
                                                onPress={e => setIsShowPass(!isShowPass)}
                                            />
                                        }
                                        secureTextEntry={!isShowPass}
                                        containerStyle={{ marginBottom: 20 }}
                                        onChangeText={value => setPassword(value)}
                                    />
                                </View>
                                <View
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    colors={[DEFAULT_COLOR, '#e9adb5']}
                                    style={{
                                        height: 50,
                                        borderRadius: 25,
                                        width: '40%',
                                        alignSelf: 'flex-end',
                                        marginRight: 20,
                                        top: 20,
                                    }}
                                    onTouchStart={() => onLoginPress()}
                                >
                                    <Text style={stylesGradient.buttonText}>Go</Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                    flex: 2,
                                    flexWrap: 'wrap-reverse',
                                    width: '100%',
                                }}
                            ></View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    marginBottom: 5,
                                    width: '100%',
                                }}
                            >
                                <Text
                                    style={{
                                        padding: 3,
                                        textAlign: 'center',
                                        fontSize: 11,
                                        color: 'gray',
                                    }}
                                >
                                    Spiral Co.,Ltd
                                </Text>
                                <Text
                                    style={{
                                        padding: 3,
                                        fontSize: 10,
                                        textAlign: 'center',
                                        color: 'gray',
                                    }}
                                >
                                    27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                                </Text>
                            </View>
                        </ImageBackground>
                    </KeyboardAvoidingView>
                    {showProgress === true && (
                        <Progress.CircleSnail
                            color={DEFAULT_COLOR}
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
            );
        case hpiApp:
            return requestPass ? (
                <ForgotPassword
                    refLoginName={refLogin}
                    refEmail={refEmail}
                    handlerCloseRequest={() => setRequestPass(false)}
                    UserNameChangeText={value => onChangeUsername(value)}
                    EmailChangeText={value => onChangeEmail(value)}
                    SendMail={() => SendMailRequest()}
                />
            ) : (
                <View
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                        flex: 8,
                    }}
                >
                    <KeyboardAvoidingView
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                        enabled
                        keyboardVerticalOffset={0}
                    >
                        <SafeAreaView
                            style={{
                                height: '100%',
                                width: '100%',
                                backgroundColor: appcolor.light,
                            }}
                        >
                            <Image
                                style={{ maxHeight: 200, minHeight: 100, marginTop: 70 }}
                                source={require('./../Themes/Images/logo_hp.png')} //logo_spiral.png
                                resizeMode="contain"
                            />
                            <View style={{ backgroundColor: appcolor.light, height: '5%' }} />

                            <View
                                style={{
                                    backgroundColor: appcolor.light,
                                    height: '50%',
                                    paddingLeft: 15,
                                    paddingRight: 15,
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: appcolor.light,
                                        paddingLeft: 15,
                                        marginBottom: 30,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 25,
                                            fontWeight: '700',
                                            height: 45,
                                            color: appcolor.primary,
                                        }}
                                    >
                                        Đăng nhập
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            fontWeight: '100',
                                            color: appcolor.dark,
                                        }}
                                    >
                                        Vui lòng đăng nhập để bắt đầu
                                    </Text>
                                </View>
                                <View
                                    style={
                                        isUser
                                            ? stylesGradient.viewSelect
                                            : stylesGradient.viewNotSelect
                                    }
                                >
                                    <Input
                                        style={{ fontSize: 15 }}
                                        returnKeyType="next"
                                        onSubmitEditing={() => _refPass.current.focus()}
                                        blurOnSubmit={false}
                                        autoComplete="off"
                                        autoCorrect={false}
                                        placeholder="Username"
                                        onChangeText={value => setUsername(value)}
                                        leftIcon={
                                            <SpiralIcon
                                                name="person-outline"
                                                type="ionicon"
                                                color="#7F7F7F"
                                                size={20}
                                            />
                                        }
                                    />
                                </View>
                                <View style={{ height: 15 }}></View>
                                <View
                                    style={
                                        isPass
                                            ? stylesGradient.viewSelect
                                            : stylesGradient.viewNotSelect
                                    }
                                >
                                    <Input
                                        style={{ fontSize: 15 }}
                                        ref={_refPass}
                                        returnKeyType="done"
                                        autoComplete="off"
                                        onSubmitEditing={() => onLoginPress()}
                                        placeholder="Password"
                                        autoCorrect={false}
                                        leftIcon={
                                            <SpiralIcon
                                                name="lock-closed-outline"
                                                type="ionicon"
                                                color="#7F7F7F"
                                                size={20}
                                            />
                                        }
                                        rightIcon={
                                            <SpiralIcon
                                                name={isShowPass ? 'eye-outline' : 'eye-off-outline'}
                                                type="ionicon"
                                                onPress={e => setIsShowPass(!isShowPass)}
                                                size={20}
                                            />
                                        }
                                        secureTextEntry={!isShowPass}
                                        containerStyle={{ marginBottom: 20 }}
                                        onChangeText={value => setPassword(value)}
                                    />
                                </View>
                                <TouchableOpacity onPress={onLoginPress}>
                                    <LinearGradient
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        colors={[DEFAULT_COLOR, '#7EBBDB']}
                                        style={{
                                            ...stylesGradient.linearGradient,
                                            height: 50,
                                            borderRadius: 25,
                                            width: '40%',
                                            alignSelf: 'flex-end',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 20,
                                            top: 0,
                                        }}
                                    >
                                        <Text style={[stylesGradient.buttonText, { fontSize: 16 }]}>
                                            Đăng nhập
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setRequestPass(true)}>
                                    <Text
                                        style={{
                                            padding: 12,
                                            textAlign: 'center',
                                            color: appcolor.primary,
                                            fontStyle: 'italic',
                                            fontSize: 12,
                                        }}
                                    >
                                        Bạn quên mật khẩu?
                                    </Text>
                                </TouchableOpacity>
                                <Text
                                    style={{
                                        padding: 3,
                                        width: '100%',
                                        textAlign: 'center',
                                        color: 'gray',
                                        marginTop: 25,
                                        fontSize: 11,
                                    }}
                                >
                                    {'Version: ' + versionApp}
                                </Text>
                            </View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                    flex: 2,
                                    flexWrap: 'wrap-reverse',
                                    width: '100%',
                                }}
                            ></View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    marginBottom: 5,
                                    width: '100%',
                                }}
                            >
                                <Text
                                    style={{
                                        padding: 3,
                                        textAlign: 'center',
                                        fontSize: 11,
                                        color: 'gray',
                                    }}
                                >
                                    Spiral Co.,Ltd
                                </Text>
                                <Text
                                    style={{
                                        padding: 3,
                                        fontSize: 10,
                                        textAlign: 'center',
                                        color: 'gray',
                                    }}
                                >
                                    27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                                </Text>
                            </View>
                        </SafeAreaView>
                    </KeyboardAvoidingView>
                    {showProgress === true && (
                        <Progress.CircleSnail
                            color={DEFAULT_COLOR}
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
            );
        case epsonApp:
            return (
                <SafeAreaView
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: appcolor.light,
                    }}
                >
                    {requestPass ? (
                        <ForgotPassword
                            refLoginName={refLogin}
                            refEmail={refEmail}
                            handlerCloseRequest={() => setRequestPass(false)}
                            UserNameChangeText={value => onChangeUsername(value)}
                            EmailChangeText={value => onChangeEmail(value)}
                            SendMail={() => SendMailRequest()}
                        />
                    ) : (
                        <KeyboardAvoidingView
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                            enabled
                            keyboardVerticalOffset={0}
                        >
                            <View
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: appcolor.light,
                                }}
                            >
                                {Pattent()}
                                <TextHead
                                    style={{
                                        textAlign: 'center',
                                        color: props.appcolor.primary,
                                        fontWeight: '400',
                                        marginBottom: 20,
                                    }}
                                    h2
                                >
                                    {APPNAME}
                                </TextHead>
                                <Card
                                    style={{
                                        alignItems: 'center',
                                        alignSelf: 'stretch',
                                        flex: 1,
                                    }}
                                    titleStyle={{ fontSize: 14 }}
                                    containerStyle={{
                                        borderRadius: 5,
                                        marginTop: '30%',
                                        backgroundColor: appcolor.light,
                                    }}
                                >
                                    <TextHead
                                        style={{
                                            textAlign: 'center',
                                            color: props.appcolor.primary,
                                            fontWeight: '400',
                                            marginBottom: 14,
                                        }}
                                        h3
                                    >
                                        Đăng nhập
                                    </TextHead>
                                    <Card.Divider></Card.Divider>
                                    <Text style={{ padding: 3, fontSize: 13 }}>
                                        Tên đăng nhập
                                    </Text>
                                    <Input
                                        style={{ fontSize: 15 }}
                                        returnKeyType="next"
                                        onSubmitEditing={() => _refPass.current.focus()}
                                        blurOnSubmit={false}
                                        placeholder="Username"
                                        onChangeText={value => setUsername(value)}
                                        leftIcon={
                                            <SpiralIcon
                                                name="person"
                                                color={props.appcolor.primary}
                                            />
                                        }
                                    />
                                    <Text style={{ padding: 3, fontSize: 13 }}>Mật khẩu</Text>
                                    <Input
                                        style={{ fontSize: 15 }}
                                        ref={_refPass}
                                        returnKeyType="done"
                                        onSubmitEditing={() => onLoginPress()}
                                        placeholder="Password"
                                        leftIcon={
                                            <SpiralIcon name="lock" color={props.appcolor.primary} />
                                        }
                                        rightIcon={
                                            <SpiralIcon
                                                name={isShowPass ? 'eye' : 'eye-with-line'}
                                                type="entypo"
                                                color="#7EBBDB"
                                                onPress={e => setIsShowPass(!isShowPass)}
                                            />
                                        }
                                        secureTextEntry={!isShowPass}
                                        onChangeText={value => setPassword(value)}
                                    />
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            onPress={() => setRequestPass(true)}
                                            style={{ ...stylesGradient.buttonForgot }}
                                        >
                                            <Text
                                                style={{
                                                    ...stylesGradient.buttonText,
                                                    color: props.appcolor.primary,
                                                }}
                                            >
                                                Lấy lại mật khẩu
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => onLoginPress()}
                                            style={{ ...stylesGradient.buttonLogin }}
                                        >
                                            <Text style={stylesGradient.buttonText}>Đăng nhập</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Card>

                                <Text
                                    style={{
                                        padding: 3,
                                        width: '100%',
                                        textAlign: 'center',
                                        color: 'gray',
                                        top: 8,
                                        fontSize: 11,
                                    }}
                                >
                                    {'Phiên bản ứng dụng : ' + versionApp}
                                </Text>
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        marginBottom: 20,
                                        flex: 2,
                                        flexWrap: 'wrap-reverse',
                                        width: '100%',
                                        height: 60,
                                    }}
                                ></View>
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        marginBottom: 10,
                                        width: '100%',
                                        height: 40,
                                    }}
                                >
                                    <Text
                                        style={{
                                            padding: 3,
                                            textAlign: 'center',
                                            fontSize: 11,
                                            color: 'gray',
                                        }}
                                    >
                                        Spiral Co.,Ltd
                                    </Text>
                                    <Text
                                        style={{
                                            padding: 3,
                                            fontSize: 10,
                                            textAlign: 'center',
                                            color: 'gray',
                                        }}
                                    >
                                        27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                                    </Text>
                                </View>
                            </View>
                            {showProgress === true && (
                                <Progress.CircleSnail
                                    color={DEFAULT_COLOR}
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
                        </KeyboardAvoidingView>
                    )}
                </SafeAreaView>
            );
        case artApp:
            return (
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: DEFAULT_COLOR,
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                    }}
                >
                    <KeyboardAvoidingView
                        style={{
                            width: '100%',
                            height: '95%',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                        enabled
                        keyboardVerticalOffset={0}
                    >
                        <View style={{ width: '100%', height: '79%', paddingTop: 52 }}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 38,
                                    fontWeight: 'bold',
                                    color: 'white',
                                }}
                            >
                                ARISTON
                            </Text>
                            <View
                                style={{
                                    alignSelf: 'center',
                                    width: '95%',
                                    height: '38%',
                                    borderRadius: 20,
                                }}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontSize: 18,
                                        color: 'white',
                                        padding: 16,
                                    }}
                                >
                                    Đăng nhập
                                </Text>
                                <View style={{ paddingLeft: 15, paddingRight: 15 }}>
                                    <View style={{ backgroundColor: 'transparent' }}>
                                        <Input
                                            inputContainerStyle={{
                                                borderWidth: 0.5,
                                                borderRadius: 10,
                                                paddingEnd: 8,
                                                borderColor: 'white',
                                            }}
                                            style={{ fontSize: 14, color: 'white' }}
                                            returnKeyType="next"
                                            onSubmitEditing={() => _refPass.current.focus()}
                                            blurOnSubmit={false}
                                            placeholder="Tên đăng nhập"
                                            placeholderTextColor="#c2c2c2"
                                            onChangeText={value => setUsername(value)}
                                            leftIcon={
                                                <SpiralIcon
                                                    name="person-outline"
                                                    type="ionicon"
                                                    color="white"
                                                    size={23}
                                                    style={{ padding: 8 }}
                                                />
                                            }
                                        />
                                    </View>
                                    <View style={{ backgroundColor: 'transparent' }}>
                                        <Input
                                            inputContainerStyle={{
                                                borderWidth: 0.5,
                                                borderRadius: 10,
                                                paddingEnd: 8,
                                                borderColor: 'white',
                                            }}
                                            style={{ fontSize: 15, color: 'white' }}
                                            ref={_refPass}
                                            returnKeyType="done"
                                            onSubmitEditing={() => onLoginPress()}
                                            placeholder="Mật khẩu"
                                            placeholderTextColor="#c2c2c2"
                                            leftIcon={
                                                <SpiralIcon
                                                    name="lock-closed-outline"
                                                    type="ionicon"
                                                    color="white"
                                                    size={23}
                                                    style={{ padding: 8 }}
                                                />
                                            }
                                            rightIcon={
                                                <SpiralIcon
                                                    name={isShowPass ? 'eye-outline' : 'eye-off-outline'}
                                                    type="ionicon"
                                                    color="white"
                                                    onPress={e => setIsShowPass(!isShowPass)}
                                                    size={20}
                                                />
                                            }
                                            secureTextEntry={!isShowPass}
                                            containerStyle={{ marginBottom: 20 }}
                                            onChangeText={value => setPassword(value)}
                                        />
                                    </View>
                                </View>
                                <Button
                                    buttonStyle={{ backgroundColor: 'white', borderRadius: 10 }}
                                    containerStyle={{
                                        alignSelf: 'center',
                                        width: '90%',
                                        backgroundColor: 'white',
                                    }}
                                    titleStyle={{
                                        color: 'black',
                                        fontSize: 15,
                                        fontWeight: '500',
                                    }}
                                    style={{ padding: 5 }}
                                    onPress={onLoginPress}
                                    title="Đăng nhập"
                                />
                                {showProgress === true && (
                                    <Progress.CircleSnail
                                        color="white"
                                        thickness={5}
                                        size={50}
                                        indeterminate={true}
                                        style={{ margin: 8, zIndex: 7, alignSelf: 'center' }}
                                    />
                                )}
                            </View>
                        </View>
                        <View style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                            <Text
                                style={{
                                    padding: 3,
                                    textAlign: 'center',
                                    color: 'white',
                                    fontSize: 11,
                                }}
                            >
                                {'Version: ' + versionApp}
                            </Text>
                            <Text
                                style={{
                                    padding: 3,
                                    textAlign: 'center',
                                    fontSize: 11,
                                    color: '#e2e2e2',
                                }}
                            >
                                Spiral Co.,Ltd
                            </Text>
                            <Text
                                style={{
                                    padding: 3,
                                    fontSize: 10,
                                    textAlign: 'center',
                                    color: '#e2e2e2',
                                }}
                            >
                                27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
                            </Text>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            );
        default:
            return (
                <View style={{ flex: 1, backgroundColor: appcolor.light }}>
                    <Text
                        style={{ color: appcolor.dark, fontSize: 18, textAlign: 'center' }}
                    >
                        Ứng dụng chưa được cấu hình
                    </Text>
                </View>
            );
    }
};
export default Login;
