import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon, Text, Button } from "@rneui/base";
import LottieView from "lottie-react-native";
import { APPNAME } from "../../../Core/URLs";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import { LocalSignIn } from "../../../Control/LocalSignIn";
import { toastError } from "../../../Utils/configToast";
import AddressCompany from "../View/AddressCompany";
import TermsAndCondition from "../View/TermsAndCondition";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginCuckoo = ({ onLogin, isLoading, onFogetPassword, onShowPrivacy, SignInTouchID, isSecLocal }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [isShowPassword, setShowPassword] = useState(false);
    const refUsername = useRef()
    const refPassword = useRef()

    const handlerLogin = () => {
        onLogin(username, password)
    }
    const handlerFogotPassword = () => {
        onFogetPassword(username)
    }
    const onChangeUsername = (value) => {
        setUsername(value?.trim())
    }
    const onChangePassword = (value) => {
        setPassword(value?.trim())
    }
    const onShowPassword = () => {
        setShowPassword(!isShowPassword)
    }
    useEffect(() => {
    }, [])
    //
    const styles = StyleSheet.create({
        contentMain: { flex: 1, backgroundColor: appcolor.primary },
        logoContainer: { width: '100%', height: '20%' },
        formContainer: { flexGrow: 1, paddingLeft: 22, paddingRight: 22, borderTopRightRadius: 40, borderTopLeftRadius: 40, backgroundColor: appcolor.light },
        titleLogin: { fontWeight: fontWeightBold, fontSize: 32, color: appcolor.primary, padding: 16, paddingTop: 20, paddingBottom: 8 },
        viewInputStyle: { backgroundColor: appcolor.surface, borderRadius: 20, marginTop: 20, flexDirection: 'row' },
        inputStyle: { flexGrow: 1, padding: 12, fontSize: 15, zIndex: 100, color: appcolor.dark },
        iconEyePass: { right: 12, alignSelf: 'center' },
        buttonLoginStyle: { height: 50, padding: 12, backgroundColor: appcolor.black, borderRadius: 20, marginTop: 20 },
        titleLoginStyle: { color: appcolor.white, fontSize: 15, fontWeight: '700' },
        buttonForgot: { padding: 12, alignItems: 'flex-end' },
        titleForgot: { color: appcolor.dark, fontStyle: 'italic', textDecorationLine: 'underline' },
        spaceStyle: { flexDirection: 'row', marginTop: 15, alignSelf: 'center' },
        buttonFinger: { flexDirection: 'row', alignItems: 'center', padding: 0, backgroundColor: appcolor.primary, borderRadius: 30 },
        titleFinger: { color: appcolor.white, marginRight: 20, },
        titleSecurity: { color: appcolor.primary, fontWeight: '500', textDecorationLine: 'underline', fontStyle: 'italic', fontSize: 13 },
        actionContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
        buttonStyle: { padding: 8, borderWidth: 1, borderColor: appcolor.primary, backgroundColor: appcolor.transparent, borderRadius: 8 },
        titleButton: { color: appcolor.primary, fontSize: 13, fontWeight: fontWeightBold },
        buttonContainer: { flexGrow: 1, marginRight: 12 },
        titleVersion: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center', padding: 8 }
    })
    return (
        <SafeAreaView style={styles.contentMain} edges={['top']}>
            <View style={styles.contentMain}>
                {/* // Logo */}
                <View style={styles.logoContainer}>
                    <LottieView autoPlay style={{ height: '100%' }} source={require("../../../Themes/lotties/welcome.json")} />
                </View>
                {/* // Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.titleLogin}>Đăng nhập {APPNAME.toLocaleLowerCase()}</Text>
                    <View style={styles.viewInputStyle}>
                        <TextInput
                            ref={refUsername}
                            defaultValue={username}
                            style={styles.inputStyle}
                            returnKeyType='next' autoCorrect={false} autoCapitalize='none'
                            autoComplete="username"
                            onSubmitEditing={() => refUsername.current.focus()}
                            placeholder='Tên đăng nhập'
                            placeholderTextColor='#c2c2c2'
                            onChangeText={onChangeUsername}
                        />
                    </View>
                    <View style={styles.viewInputStyle}>
                        <TextInput
                            style={styles.inputStyle}
                            ref={refPassword}
                            returnKeyType='done'
                            onSubmitEditing={handlerLogin}
                            placeholder='Mật khẩu'
                            placeholderTextColor='#c2c2c2'
                            secureTextEntry={!isShowPassword}
                            onChangeText={onChangePassword}
                        />
                        <TouchableOpacity style={styles.iconEyePass} onPress={onShowPassword}>
                            <Icon
                                name={isShowPassword ? 'eye-outline' : 'eye-off-outline'}
                                type='ionicon' color={appcolor.primary} size={20}
                            />
                        </TouchableOpacity>
                    </View>
                    <Button
                        buttonStyle={styles.buttonLoginStyle}
                        titleStyle={styles.titleLoginStyle}
                        onPress={handlerLogin}
                        loading={isLoading}
                        title='Đăng nhập' />
                    <View style={{ backgroundColor: appcolor.transparent }}>
                        <TouchableOpacity style={styles.buttonForgot} onPress={handlerFogotPassword} >
                            <Text style={styles.titleForgot}>Lấy lại mật khẩu ?</Text>
                        </TouchableOpacity>
                    </View>
                    <TermsAndCondition appcolor={appcolor} onShowPrivacy={onShowPrivacy} />
                    <View style={styles.spaceStyle}>
                        <Text style={{ color: appcolor.dark }}>-----------</Text>
                        <Icon name="information-circle" type="ionicon" color={appcolor.dark} />
                        <Text style={{ color: appcolor.dark }}>-----------</Text>
                    </View>
                    <View style={{ alignSelf: 'center', }}>
                        {
                            isSecLocal > 0 && <TouchableOpacity
                                style={styles.buttonFinger}
                                onPress={() => LocalSignIn.onAuthenticateID((e) => {
                                    if (e === 1)
                                        SignInTouchID();
                                    else {
                                        toastError(e, "Lỗi", "top")
                                    }
                                })}>
                                <Icon reverse name='finger-print' type='ionicon' color={appcolor.primary} />
                                <Text style={{ color: appcolor.white, marginRight: 20, }}> Xác thực ngay</Text>
                            </TouchableOpacity>
                        }
                    </View>
                    <AddressCompany appcolor={appcolor} />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default LoginCuckoo;