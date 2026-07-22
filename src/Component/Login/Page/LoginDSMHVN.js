import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Text, Button, Image, BackgroundImage } from "@rneui/base";
import { APPNAME } from "../../../Core/URLs";
import { deviceWidth, fontWeightBold } from "../../../Themes/AppsStyle";
import AddressCompany from "../View/AddressCompany";
import { SafeAreaView } from "react-native-safe-area-context";
import { FieldInput } from "../Controls/FieldInput";
import footer from '../../../Themes/Images/dsmhvn.png'
const LoginDSMHVN = ({ onLogin, isLoading, onFogetPassword, onShowPrivacy }) => {
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
        formContainer: { paddingHorizontal: 18, paddingTop: 18 },
        titleView: { fontSize: 12, fontWeight: '500', color: appcolor.dark, padding: 5 },
        inputStyle: { fontSize: 13, color: appcolor.dark, fontWeight: '500' },
        loginCard: {
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 24,
            backgroundColor: 'rgba(255,255,255,0.16)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.28)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 18,
            elevation: 8,
            overflow: 'hidden'
        },
        cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' },
        actionContainer: { paddingHorizontal: 18, paddingBottom: 18, paddingTop: 12 },
        buttonStyle: {
            paddingVertical: 11,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.22)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 14,
            marginTop: 12
        },
        primaryButton: { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(255,255,255,0.96)' },
        titleButton: { color: appcolor.white, fontSize: 13, fontWeight: fontWeightBold, textAlign: 'center', padding: 1, letterSpacing: 0.3 },
        buttonContainer: { flexGrow: 1, marginHorizontal: 0 },
        mainContainer: { flex: 1, backgroundColor: appcolor.primary },
        headerTitle: {
            width: '100%',
            fontSize: 23,
            fontWeight: '800',
            color: appcolor.white,
            textAlign: 'center',
            padding: 8,
            textShadowColor: 'rgba(0,0,0,0.18)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3
        },
        imageContainer: { borderRadius: 102, width: 102, height: 102, overflow: 'hidden', backgroundColor: appcolor.white },
        imageView: { width: 188, height: 102 }
    })
    return (
        <SafeAreaView style={styles.mainContainer}>
            {/* <GradientBackground /> */}
            <BackgroundImage
                source={footer} blurRadius={0}
                style={{ width: deviceWidth, height: '100%', }}
            >
                <View style={{ alignItems: 'center', marginTop: 56, marginHorizontal: 18, backgroundColor: 'rgba(255, 255, 255, 0.14)', padding: 16, borderRadius: 18 }}>
                    <Image source={require('../../../Themes/Images/logo_hvn.png')}
                        style={styles.imageView} />
                    <Text style={styles.headerTitle}>{APPNAME}</Text>
                </View>
                <View style={styles.loginCard}>
                    <View style={styles.cardOverlay} />
                    <View style={styles.formContainer}>
                        <FieldInput
                            inputRef={refUsername}
                            key='username'
                            title='Tên đăng nhập'
                            placeholder='Tên đăng nhập'
                            inputStyle={styles.titleView}
                            defaultValue={username}
                            returnKeyType='next'
                            onSubmitEditing={() => refPassword?.current?.focus()}
                            blurOnSubmit={false}
                            onChangeText={onChangeUsername}
                        />
                        <FieldInput
                            inputRef={refPassword}
                            key='password'
                            title='Mật khẩu'
                            placeholder='Mật khẩu'
                            defaultValue={password}
                            isPassword={!isShowPassword}
                            iconRight={isShowPassword ? 'eye' : 'eye-off'}
                            iconColorRight={isShowPassword ? appcolor.primary : appcolor.greylight}
                            inputStyle={styles.titleView}
                            onRightIcon={onShowPassword}
                            returnKeyType='done'
                            onSubmitEditing={handlerLogin}
                            onChangeText={onChangePassword}
                        />
                    </View>
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={[styles.buttonStyle, styles.primaryButton, { flexGrow: 1, marginTop: 0 }]}
                            onPress={handlerLogin}>
                            {!isLoading ?
                                <Text style={{ ...styles.titleButton, color: appcolor.dark, fontStyle: 'italic' }}>Đăng nhập</Text>
                                :
                                <ActivityIndicator size='small' color={appcolor.primary} />
                            }
                        </TouchableOpacity>
                        <Button
                            title="Lấy lại mật khẩu"
                            buttonStyle={styles.buttonStyle}
                            containerStyle={styles.buttonContainer}
                            titleStyle={styles.titleButton}
                            onPress={handlerFogotPassword}
                        />
                    </View>
                </View>
                <AddressCompany appcolor={appcolor} useBackground />
            </BackgroundImage>
        </SafeAreaView>
    )
}
export default LoginDSMHVN;