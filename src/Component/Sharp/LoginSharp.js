import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, Platform, TouchableOpacity, SafeAreaView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input, Button, Image } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome5'
import * as Progress from 'react-native-progress'
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import { onLogin, saveTokenUser, SendEmailPass } from "../../Controller/UserController";
import moment from 'moment';
import { alertNotify, checkNetwork } from "../../Core/Utility";
import ForgotPassword from "../../Control/ForgotPassword";
import { MessageInfo, defaultSetting } from "../../Core/Helper";
import { useSelector, useDispatch } from "react-redux";
import { ACTION } from "../../Core/ReduxController";
import LottieView from "lottie-react-native";

const delay = ms => new Promise(res => setTimeout(res, ms));
const versionApp = DeviceInfo.getVersion();

const LoginSharp = ({ onLoginCallBack }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const refLogin = useRef();
    const refEmail = useRef();
    const [tokenFirebase, setTokenFirebase] = useState('')
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [email, setEmail] = useState(null)
    const [isShowPass, setShowPass] = useState(false)
    const [showProgress, setShowProgress] = useState(false)
    const [requestPass, setRequestPass] = useState(false)
    const dispatch = useDispatch()
    const ThemeDefault = async () => {
        await checkNetwork()
        const json = await AsyncStorage?.getItem("SETTINGS")
        const settings = await JSON.parse(json) || defaultSetting;
        dispatch({ type: ACTION.SET_THEME, mode: settings.mode })
    }
    // Handler Request Token FireBase
    const handlerRequestToken = () => {
        messaging().getToken().then(async fcmToken => {
            if (fcmToken)
                await setTokenFirebase(fcmToken)
        });
        messaging().onTokenRefresh(async fcmToken => {
            await setTokenFirebase(fcmToken)
        });
    }
    const handlerLogin = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            alertNotify("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        // Check Token FireBase
        if (Platform.OS === 'ios') {
            const authorizationStatus = await messaging().requestPermission();
            if (authorizationStatus === 1) {
                if (tokenFirebase == null || tokenFirebase.length == 0) {
                    handlerRequestToken()
                    alertNotify('Chưa lấy được token vui lòng bấm thử lại!');
                    return
                }
            }
        }

        let userStr = username || ''
        if (userStr.includes(' ')) {
            MessageInfo('Tên đăng nhập không được nhập khoảng trắng!');
            return;
        }
        if (userStr === null || userStr.length == 0) {
            MessageInfo("Vui lòng nhập tên đăng nhập.")
            return
        }
        if (password == null || password.length == 0) {
            MessageInfo("Vui lòng nhập mật khẩu.")
            return
        }
        // Login Action
        await setShowProgress(true)
        let IMEI = await DeviceInfo.getUniqueId();
        const dataLogin = {
            "username": username,
            "password": password,
            'DeviceToken': tokenFirebase,
            "Platform": Platform.OS,
            "IMEI": IMEI,
            "versionid": await DeviceInfo.getBuildNumber(),
            "client_time": moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        }
        await onLogin(dataLogin, async (info) => {
            await saveTokenUser(info);
            await delay(2000)
            await dispatch({ type: ACTION.SET_USERINFO, userinfo: info })
            await onLoginCallBack();
            setShowProgress(false)
        }, () => { setShowProgress(false) })
    }
    const handlerFogotPassword = async () => {
        setRequestPass(true)
    }
    const handlerCloseRequestPass = async () => {
        setRequestPass(false)
    }
    const onChangeUsername = (value) => {
        setUsername(value)
    }
    const onChangeEmail = (value) => {
        setEmail(value)
    }
    const SendMailRequest = async () => {
        let emailStr = email || ''
        let usernameStr = username || ''

        if (usernameStr.includes(' ')) {
            MessageInfo('Tên đăng nhập không được nhập khoảng trắng!');
            return;
        }
        else if (emailStr.includes(' ')) {
            MessageInfo('email không được nhập khoảng trắng!');
            return;
        }

        if (usernameStr.length == 0) {
            MessageInfo('Bạn chưa nhập tên đăng nhập!');
            refLogin?.current?.shake();
            return;
        }
        else if (emailStr.length == 0) {
            MessageInfo('Bạn chưa nhập email!');
            refEmail?.current?.shake()
            return
        }
        else if (!emailStr.includes("@")) {
            MessageInfo('Không đúng định dạng mail!');
            refEmail?.current?.shake();
            return;
        }

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            await MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        const result = await SendEmailPass(username, email);
        if (result.statusId === 200)
            setRequestPass(false)
        alertNotify(result.messager);
    }

    useEffect(() => {
        ThemeDefault()
        const _token = handlerRequestToken()
        return () => _token
    }, [])
    return (
        <SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }} >
            {requestPass ?
                <ForgotPassword
                    refLoginName={refLogin} refEmail={refEmail}
                    handlerCloseRequest={handlerCloseRequestPass}
                    UserNameChangeText={onChangeUsername}
                    EmailChangeText={onChangeEmail}
                    SendMail={SendMailRequest}
                />
                :
                <View style={{ padding: 12, margin: 12, height: '97%', backgroundColor: appcolor.light, borderRadius: 8 }}>
                    <View style={{ width: '100%', height: '20%', marginTop: 16, marginBottom: 30 }}>
                        <LottieView autoPlay style={{ height: '100%' }} source={require('../../Themes/lotties/welcome_hpi.json')} />
                        {
                            showProgress == true && <Progress.CircleSnail color={appcolor.primary} thickness={5} size={50} indeterminate={true} style={{ margin: 2, zIndex: 7, alignSelf: "center" }} />
                        }
                    </View>
                    <View style={{ backgroundColor: appcolor.light, flexGrow: 1, }}>
                        <View style={{ justifyContent: 'center', alignItems: "center" }}>
                            <Text style={{ fontWeight: '500', color: appcolor.dark, marginBottom: 12, textAlign: 'center', width: '80%', fontSize: 20 }}>Xin chào,
                                <Text style={{ fontSize: 18, color: appcolor.primary }}> Đăng nhập để làm việc</Text>
                            </Text>
                        </View>
                        <View style={{}}>
                            <Input
                                inputContainerStyle={{ backgroundColor: appcolor.homebackground, paddingHorizontal: 10, borderRadius: 50, borderBottomWidth: 0 }}
                                inputStyle={{ color: appcolor.dark }}
                                style={{ fontSize: 15 }} autoCorrect={false}
                                returnKeyType='next'
                                label="Tài khoản"
                                onSubmitEditing={() => _refPass.focus()}
                                blurOnSubmit={false}
                                placeholder='Tên đăng nhập'
                                leftIcon={<Icon name='user' solid color={appcolor.primary} size={18} />}
                                placeholderTextColor={appcolor.switchDisible}
                                onChangeText={(value) => setUsername(value)}
                            />
                            <Input
                                inputContainerStyle={{ backgroundColor: appcolor.homebackground, paddingHorizontal: 10, borderRadius: 50, borderBottomWidth: 0 }}
                                label="Mật khẩu"
                                style={{ fontSize: 15 }}
                                leftIcon={<Icon name='lock' color={appcolor.primary} size={18} />}
                                ref={ref => _refPass = ref}
                                inputStyle={{ color: appcolor.dark }}
                                returnKeyType='done'
                                onSubmitEditing={handlerLogin}
                                placeholder='Nhập mật khẩu'
                                placeholderTextColor={appcolor.switchDisible}
                                rightIcon={
                                    <Icon
                                        name={isShowPass ? 'eye' : 'eye-slash'}
                                        type='ionicon'
                                        color={appcolor.primary}
                                        onPress={(e) => setShowPass(e => !e)}
                                        size={16}
                                    />}
                                secureTextEntry={!isShowPass}
                                onChangeText={(value) => setPassword(value)}
                            />
                        </View>
                        <View >
                            <View style={{ flexDirection: 'row', justifyContent: "flex-end", paddingBottom: 20 }}>
                                <TouchableOpacity onPress={handlerFogotPassword} >
                                    <Text style={{ width: '100%', fontSize: 15, color: appcolor.dark, textAlign: 'center', fontStyle: 'italic', textDecorationLine: 'underline' }}>Quên mật khẩu?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: "flex-end" }}>
                                <Button
                                    buttonStyle={{ backgroundColor: appcolor.primary, borderRadius: 50 }}
                                    containerStyle={{ alignSelf: 'center', width: '40%', backgroundColor: appcolor.primary, borderRadius: 50 }}
                                    titleStyle={{ color: appcolor.white, fontSize: 15, fontWeight: '500' }}
                                    style={{ padding: 5 }}
                                    onPress={handlerLogin}
                                    title='Đăng nhập' />
                            </View>

                        </View>

                    </View>
                    <Text style={{ textAlign: 'center', color: appcolor.dark, fontSize: 11, paddingTop: 10 }}>{'Version: ' + versionApp}</Text>
                    <View style={{ width: '100%', alignSelf: 'center' }}>
                        <Text style={{ padding: 3, textAlign: 'center', fontSize: 11, color: appcolor.primary }}>Spiral Co.,Ltd</Text>
                        <Text style={{ padding: 3, fontSize: 10, textAlign: 'center', color: appcolor.primary }}>27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh</Text>
                    </View>

                </View>
            }
        </SafeAreaView>
    )
}
export default LoginSharp;