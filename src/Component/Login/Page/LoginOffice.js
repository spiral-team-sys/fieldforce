import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Text, Button, Image, color } from '@rneui/base';
import { APPNAME } from '../../../Core/URLs';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import AddressCompany from '../View/AddressCompany';
import iconApp from '../../../Themes/Images/logo_spiral.png';
import { FieldInput } from '../Controls/FieldInput';

const LoginOffice = ({
  onLogin,
  isLoading,
  onFogetPassword,
  onShowPrivacy,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isShowPassword, setShowPassword] = useState(false);
  const refUsername = useRef();
  const refPassword = useRef();

  const handlerLogin = () => {
    onLogin(username, password);
  };
  const handlerFogotPassword = () => {
    onFogetPassword(username);
  };
  const onChangeUsername = value => {
    setUsername(value?.trim());
  };
  const onChangePassword = value => {
    setPassword(value?.trim());
  };
  const onShowPassword = () => {
    setShowPassword(!isShowPassword);
  };
  //
  useEffect(() => {}, []);
  const officeBackground = require('../../../Themes/Images/office/spiral-office.jpg');
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    backgroundImage: { flex: 1 },
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
    },
    topSection: { marginTop: 72 },
    brandBlock: { alignItems: 'center', marginBottom: 12 },
    glassCardWrap: { borderRadius: 28 },
    glassCard: {
      borderRadius: 28,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.34)',
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      paddingVertical: 16,
      shadowColor: '#001636',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 14 },
      elevation: 8,
    },
    formContainer: { paddingHorizontal: 16 },
    titleView: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.dark,
      padding: 5,
    },
    inputStyle: { fontSize: 13, color: appcolor.dark, fontWeight: '500' },
    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    buttonStyle: {
      padding: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
    },
    titleButton: {
      color: appcolor.light,
      fontSize: 13,
      fontWeight: fontWeightBold,
      textAlign: 'center',
      padding: 1,
    },
    buttonContainer: { flex: 1, marginEnd: 8 },
    headerTitle: {
      width: '100%',
      fontSize: 23,
      fontWeight: '800',
      color: appcolor.white,
      textAlign: 'center',
      paddingTop: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.28)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    imageContainer: {
      borderRadius: 102,
      width: 102,
      height: 102,
      overflow: 'hidden',
      backgroundColor: appcolor.white,
    },
    imageView: { width: 102, height: 102 },
    primaryActionButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      flex: 1,
    },
    footerContainer: { paddingBottom: 2 },
  });
  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        blurRadius={6}
        source={officeBackground}
        style={styles.backgroundImage}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <View style={styles.brandBlock}>
              <Image
                source={iconApp}
                resizeMethod="resize"
                resizeMode="center"
                style={styles.imageView}
                containerStyle={styles.imageContainer}
              />
              <Text style={styles.headerTitle}>{APPNAME}</Text>
            </View>
            <View style={styles.glassCardWrap}>
              <View style={styles.glassCard}>
                <View style={styles.formContainer}>
                  <FieldInput
                    inputRef={refUsername}
                    key="username"
                    title="Tên đăng nhập"
                    placeholder="Tên đăng nhập"
                    titleStyle={{ color: appcolor.dark }}
                    inputStyle={styles.titleView}
                    defaultValue={username}
                    returnKeyType="next"
                    onSubmitEditing={() => refPassword?.current?.focus()}
                    blurOnSubmit={false}
                    onChangeText={onChangeUsername}
                  />
                  <FieldInput
                    inputRef={refPassword}
                    key="password"
                    title="Mật khẩu"
                    placeholder="Mật khẩu"
                    defaultValue={password}
                    isPassword={!isShowPassword}
                    iconRight={isShowPassword ? 'eye' : 'eye-off'}
                    iconColorRight={
                      isShowPassword ? appcolor.primary : appcolor.greylight
                    }
                    titleStyle={{ color: appcolor.dark }}
                    inputStyle={styles.titleView}
                    onRightIcon={onShowPassword}
                    returnKeyType="done"
                    onSubmitEditing={handlerLogin}
                    onChangeText={onChangePassword}
                  />
                </View>
                <View style={styles.actionContainer}>
                  <Button
                    title="Lấy lại mật khẩu"
                    buttonStyle={styles.buttonStyle}
                    containerStyle={styles.buttonContainer}
                    titleStyle={[
                      styles.titleButton,
                      { color: appcolor.primary },
                    ]}
                    onPress={handlerFogotPassword}
                  />
                  <TouchableOpacity
                    style={[styles.buttonStyle, styles.primaryActionButton]}
                    onPress={handlerLogin}
                  >
                    {!isLoading ? (
                      <Text
                        style={{ ...styles.titleButton, color: appcolor.dark }}
                      >
                        Đăng nhập
                      </Text>
                    ) : (
                      <ActivityIndicator
                        size="small"
                        color={appcolor.primary}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.footerContainer}>
            <AddressCompany appcolor={appcolor} useBackground />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default LoginOffice;
