import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon, Text, Input, Button } from "@rneui/base";
import LottieView from "lottie-react-native";
import { APPNAME, AppNameBuild, honorApp } from "../../../Core/URLs";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import AddressCompany from "../View/AddressCompany";
import TermsAndCondition from "../View/TermsAndCondition";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginHonor = ({ onLogin, isLoading, onFogetPassword, onShowPrivacy }) => {
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
        contentMain: { flex: 1 },
        logoContainer: { width: '100%', height: '28%' },
        formContainer: { paddingHorizontal: 8 },
        inputStyle: { fontSize: 13, color: appcolor.light, paddingHorizontal: 8, },
        inputContainerStyle: { paddingHorizontal: 16, borderBottomWidth: 0, borderRadius: 64, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
        titleLogin: { fontWeight: fontWeightBold, fontSize: 24, color: appcolor.light, textAlign: 'center', padding: 16, paddingTop: 0 },
        actionContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
        buttonStyle: { padding: 8, borderWidth: 1, borderColor: appcolor.light, backgroundColor: appcolor.transparent, borderRadius: 8 },
        titleButton: { color: appcolor.light, fontSize: 13, fontWeight: fontWeightBold },
        buttonContainer: { flexGrow: 1, marginHorizontal: 4 }
    })

    const sourceLogo = {
        [honorApp]: require("../../../Themes/lotties/welcome_tefal.json")
    }
    return (
        <SafeAreaView style={styles.contentMain} edges={['top']}>
            <View style={styles.contentMain}>
                {/* // Logo */}
                <View style={styles.logoContainer}>
                    <LottieView autoPlay style={{ height: '100%' }} source={sourceLogo[AppNameBuild]} />
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
                        placeholderTextColor={appcolor.grayLight}
                        style={styles.inputStyle}
                        inputContainerStyle={styles.inputContainerStyle}
                        onSubmitEditing={() => refPassword.current.focus()}
                        onChangeText={onChangeUsername}
                        leftIcon={<Icon type='ionicon' name='person-outline' color={appcolor.grayLight} />}
                    />
                    <Input
                        ref={refPassword}
                        defaultValue={password}
                        returnKeyType='done'
                        placeholder='Mật khẩu'
                        secureTextEntry={!isShowPassword}
                        placeholderTextColor={appcolor.grayLight}
                        style={styles.inputStyle}
                        inputContainerStyle={styles.inputContainerStyle}
                        onSubmitEditing={handlerLogin}
                        leftIcon={<Icon name='lock-closed-outline' type='ionicon' color={appcolor.grayLight} />}
                        rightIcon={
                            <Icon
                                name={isShowPassword ? 'eye-outline' : 'eye-off-outline'}
                                type='ionicon'
                                color={appcolor.grayLight}
                                onPress={onShowPassword}
                                size={20}
                            />}
                        onChangeText={onChangePassword}
                    />
                </View>
                <TermsAndCondition
                    useBackground
                    appcolor={appcolor}
                    onShowPrivacy={onShowPrivacy} />
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
                        buttonStyle={{ ...styles.buttonStyle, backgroundColor: isLoading ? 'transparent' : appcolor.light }}
                        titleStyle={{ ...styles.titleButton, color: appcolor.primary }}
                        containerStyle={styles.buttonContainer}
                        loading={isLoading}
                        onPress={handlerLogin}
                    />
                </View>
                <AddressCompany
                    useBackground
                    appcolor={appcolor} />
            </View>
        </SafeAreaView>
    )
}
export default LoginHonor;