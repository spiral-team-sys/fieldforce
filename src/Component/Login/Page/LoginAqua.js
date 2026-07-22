import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { Text, Button } from "@rneui/base";
import LottieView from "lottie-react-native";
import { APPNAME } from "../../../Core/URLs";
import { scaleSize } from "../../../Themes/AppsStyle";
import AddressCompany from "../View/AddressCompany";
import TermsAndCondition from "../View/TermsAndCondition";
import { SafeAreaView } from "react-native-safe-area-context";
import { FieldInput } from "../Controls/FieldInput";

const LoginAqua = ({ onLogin, isLoading, onFogetPassword, onShowPrivacy }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [isShowPassword, setShowPassword] = useState(false);
    const refPassword = useRef();

    const handlerLogin = () => {
        onLogin(username, password);
    };
    const handlerFogotPassword = () => {
        onFogetPassword(username);
    };
    const onShowPassword = () => {
        setShowPassword(!isShowPassword);
    };

    useEffect(() => { }, []);

    const styles = StyleSheet.create({
        contentMain: { flex: 1, backgroundColor: appcolor.light },
        logoContainer: { width: '100%', height: '18%', marginTop: 32 },
        formContainer: { paddingHorizontal: 8 },
        titleLogin: { width: '100%', padding: 8, fontSize: scaleSize(25), fontWeight: '700', color: appcolor.dark, textAlign: 'center', marginTop: 8 },
        titleLoginSub: { width: '100%', fontSize: 15, fontWeight: '500', color: appcolor.greydark, textAlign: 'center', marginBottom: 16 },
        buttonLogin: { width: '80%', padding: 12, backgroundColor: appcolor.primary, borderRadius: 10, alignSelf: 'center', marginTop: 16 },
        buttonLoginTitle: { color: appcolor.white, fontSize: 15, fontWeight: '600' },
        titleForgot: { fontSize: 14, fontStyle: 'italic', color: appcolor.dark, fontWeight: '500', textAlign: 'center', padding: 16 },
        titleStyle: { fontSize: 12, fontWeight: '500', color: appcolor.dark },
    });

    return (
        <SafeAreaView style={styles.contentMain} edges={['top']}>
            <View style={[styles.contentMain, { padding: 0 }]}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <LottieView autoPlay style={{ height: '100%' }} source={require('../../../Themes/lotties/welcome_aqua.json')} />
                </View>
                {/* Title */}
                <Text style={styles.titleLogin}>{`Welcome to ${APPNAME}!`}</Text>
                <Text style={styles.titleLoginSub}>Đăng nhập để tiếp tục</Text>
                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Username */}
                    <FieldInput
                        title='Tên đăng nhập'
                        placeholder='Nhập tên đăng nhập'
                        defaultValue={username}
                        iconNameLeft='person-outline'
                        iconColor={appcolor.primary}
                        returnKeyType='next'
                        blurOnSubmit={false}
                        onSubmitEditing={() => refPassword.current?.focus()}
                        onChangeText={(value) => setUsername(value?.trim())}
                        titleStyle={styles.titleStyle}
                    />
                    {/* Password */}
                    <FieldInput
                        inputRef={refPassword}
                        title='Mật khẩu'
                        placeholder='Nhập mật khẩu'
                        defaultValue={password}
                        iconNameLeft='lock-closed-outline'
                        iconColor={appcolor.primary}
                        titleStyle={styles.titleStyle}
                        isPassword={!isShowPassword}
                        iconRight={isShowPassword ? 'eye-outline' : 'eye-off-outline'}
                        iconColorRight={appcolor.primary}
                        onRightIcon={onShowPassword}
                        returnKeyType='done'
                        blurOnSubmit={false}
                        onSubmitEditing={handlerLogin}
                        onChangeText={(value) => setPassword(value?.trim())}
                    />
                    {/* Actions */}
                    <Button
                        title='Đăng nhập'
                        buttonStyle={styles.buttonLogin}
                        titleStyle={styles.buttonLoginTitle}
                        containerStyle={{ flexGrow: 1 }}
                        loading={isLoading}
                        onPress={handlerLogin}
                    />
                    <Text onPress={handlerFogotPassword} style={styles.titleForgot}>Quên mật khẩu?</Text>
                </View>
                <TermsAndCondition
                    appcolor={appcolor}
                    onShowPrivacy={onShowPrivacy}
                />
                <AddressCompany appcolor={appcolor} />
            </View>
        </SafeAreaView>
    );
};

export default LoginAqua;