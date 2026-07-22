import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon, Text, Input, Button } from "@rneui/base";
import LottieView from "lottie-react-native";
import { APPNAME } from "../../../Core/URLs";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import AddressCompany from "../View/AddressCompany";
import TermsAndCondition from "../View/TermsAndCondition";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginLG = ({ onLogin, isLoading, onFogetPassword, onShowPrivacy }) => {
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
    //
    useEffect(() => { }, [])
    //
    const styles = StyleSheet.create({
        contentMain: { flex: 1, backgroundColor: appcolor.light },
        logoContainer: { width: '100%', height: '25%' },
        formContainer: { paddingHorizontal: 16 },
        inputStyle: { fontSize: 13, color: appcolor.dark, paddingHorizontal: 8 },
        titleLogin: { fontWeight: fontWeightBold, fontSize: 24, color: appcolor.primary, padding: 16, paddingTop: 0, paddingBottom: 8 },
        actionContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
        buttonStyle: { padding: 8, borderWidth: 1, borderColor: appcolor.primary, backgroundColor: appcolor.transparent, borderRadius: 8 },
        titleButton: { color: appcolor.primary, fontSize: 13, fontWeight: fontWeightBold },
        buttonContainer: { flexGrow: 1, marginRight: 12 }
    })
    return (
        <SafeAreaView style={styles.contentMain} edges={['top']}>
            <View style={styles.contentMain}>
                {/* // Logo */}
                <View style={styles.logoContainer}>
                    <LottieView autoPlay style={{ height: '100%' }} source={require("../../../Themes/lotties/welcome.json")} />
                </View>
                <Text style={styles.titleLogin}>{`Đăng nhập ${APPNAME}`}</Text>
                {/* // Form */}
                <View style={styles.formContainer}>
                    <Input
                        ref={refUsername}
                        defaultValue={username}
                        returnKeyType='next'
                        autoCorrect={false}
                        placeholder='Tên đăng nhập'
                        placeholderTextColor={appcolor.placeholderText}
                        style={styles.inputStyle}
                        onSubmitEditing={() => refPassword.current.focus()}
                        onChangeText={onChangeUsername}
                        leftIcon={<Icon type='ionicon' name='person-outline' color={appcolor.primary} />}
                    />
                    <Input
                        ref={refPassword}
                        defaultValue={password}
                        returnKeyType='done'
                        placeholder='Mật khẩu'
                        secureTextEntry={!isShowPassword}
                        placeholderTextColor={appcolor.placeholderText}
                        style={styles.inputStyle}
                        onSubmitEditing={handlerLogin}
                        leftIcon={<Icon name='lock-closed-outline' type='ionicon' color={appcolor.primary} />}
                        rightIcon={
                            <Icon
                                name={isShowPassword ? 'eye-outline' : 'eye-off-outline'}
                                type='ionicon'
                                color={appcolor.primary}
                                onPress={onShowPassword}
                                size={20}
                            />}
                        onChangeText={onChangePassword}
                    />
                </View>
                <TermsAndCondition appcolor={appcolor} onShowPrivacy={onShowPrivacy} />
                <View style={styles.actionContainer}>
                    <Button
                        title="Lấy lại mật khẩu"
                        buttonStyle={styles.buttonStyle}
                        containerStyle={styles.buttonContainer}
                        titleStyle={styles.titleButton}
                        onPress={handlerFogotPassword}
                    />
                    <Button
                        title='Đăng nhập'
                        buttonStyle={{ ...styles.buttonStyle, backgroundColor: appcolor.primary }}
                        titleStyle={{ ...styles.titleButton, color: appcolor.light }}
                        containerStyle={styles.buttonContainer}
                        loading={isLoading}
                        onPress={handlerLogin}
                    />
                </View>
                <AddressCompany appcolor={appcolor} />
            </View>
        </SafeAreaView>
    )
}

export default LoginLG;