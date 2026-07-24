import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkNetwork } from '../../Core/Utility';
import LottieView from 'lottie-react-native';
import { Button, Icon, Input, Text } from '@rneui/base';
import { fontWeightBold } from '../../Themes/AppsStyle';
import { toastError, toastInfo } from '../../Utils/configToast';
import { SendEmailPass } from '../../Controller/UserController';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const refUsername = useRef(null);
  const refEmail = useRef(null);
  //
  const handlerFogotPassword = async () => {
    const isValid = await validData();
    if (!isValid) return;
    //
    const result = await SendEmailPass(username, email);
    if (result.statusId === 200) handlerClose();
    toastInfo('Thông báo', `${result.messager}`);
  };
  const handlerClose = () => {
    navigation.goBack();
  };
  const validData = async () => {
    const isConnected = await checkNetwork();
    if (isConnected) {
      if (username == null || username.length == 0) {
        toastError('Tên đăng nhập', 'Bạn chưa nhập tên đăng nhập!');
        return false;
      }
      if (email === null || email.length == 0) {
        toastError('Email', 'Email không được để trống!');
        return false;
      } else {
        if (!email.includes('@')) {
          toastError(
            'Email',
            'Email không đúng định dạng, Vui lòng kiểm tra lại!',
          );
          return false;
        }
      }
    } else {
      toastError('Mất kết nối', 'Vui lòng kiểm tra kết nối mạng');
      return false;
    }
    return true;
  };
  //
  useEffect(() => {}, []);
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    sheetContainer: { flex: 1, backgroundColor: '#121820' },
    contentMain: { flex: 1, backgroundColor: appcolor.light },
    logoContainer: { width: '100%', height: '25%' },
    formContainer: { paddingHorizontal: 16 },
    securityContainer: { paddingTop: 8, paddingHorizontal: 16 },
    inputStyle: { fontSize: 13, color: appcolor.dark, paddingHorizontal: 8 },
    titleLogin: {
      fontWeight: fontWeightBold,
      fontSize: 24,
      color: appcolor.primary,
      padding: 16,
      paddingTop: 0,
      paddingBottom: 8,
    },
    companyContainer: {
      justifyContent: 'center',
      bottom: 0,
      width: '100%',
      position: 'absolute',
    },
    titleCompany: {
      textAlign: 'center',
      fontSize: 15,
      color: appcolor.placeholderText,
      fontWeight: 'bold',
    },
    addressCompany: {
      fontSize: 11,
      textAlign: 'center',
      color: appcolor.placeholderText,
      fontWeight: '500',
    },
    titleSecurityMain: { color: appcolor.dark, fontSize: 13 },
    titleSecurity: {
      color: appcolor.primary,
      fontWeight: '500',
      textDecorationLine: 'underline',
      fontStyle: 'italic',
      fontSize: 13,
    },
    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    buttonStyle: {
      padding: 8,
      borderWidth: 1,
      borderColor: appcolor.primary,
      backgroundColor: appcolor.transparent,
      borderRadius: 8,
    },
    titleButton: {
      color: appcolor.primary,
      fontSize: 13,
      fontWeight: fontWeightBold,
    },
    buttonContainer: { flexGrow: 1, marginRight: 12 },
  });
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.contentMain}>
        <View style={styles.contentMain}>
          {/* // Logo */}
          <View style={styles.logoContainer}>
            <LottieView
              autoPlay
              style={{ height: '100%' }}
              source={require('../../Themes/lotties/welcome.json')}
            />
          </View>
          <Text
            style={styles.titleLogin}
          >{`Gửi yêu cầu lấy lại mật khẩu`}</Text>
          {/* // Form */}
          <View style={styles.formContainer}>
            <Input
              ref={refUsername}
              defaultValue={username}
              returnKeyType="next"
              autoCorrect={false}
              placeholder="Tên đăng nhập"
              placeholderTextColor={appcolor.placeholderText}
              style={styles.inputStyle}
              onSubmitEditing={() => refEmail.current.focus()}
              onChangeText={text => setUsername(text.trim())}
              leftIcon={
                <SpiralIcon
                  type="ionicon"
                  name="person-outline"
                  color={appcolor.primary}
                />
              }
            />
            <Input
              ref={refEmail}
              defaultValue={email}
              returnKeyType="next"
              autoCorrect={false}
              placeholder="Nhập email nhận yêu cầu"
              placeholderTextColor={appcolor.placeholderText}
              style={styles.inputStyle}
              onChangeText={text => setEmail(text.trim())}
              leftIcon={
                <SpiralIcon
                  type="ionicon"
                  name="mail-outline"
                  color={appcolor.primary}
                />
              }
            />
          </View>
          <View style={styles.actionContainer}>
            <Button
              title="Đóng"
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleButton}
              onPress={handlerClose}
            />
            <Button
              title="Gửi yêu cầu"
              buttonStyle={{
                ...styles.buttonStyle,
                backgroundColor: appcolor.primary,
              }}
              titleStyle={{ ...styles.titleButton, color: appcolor.light }}
              containerStyle={styles.buttonContainer}
              onPress={handlerFogotPassword}
            />
          </View>
          {/* // Company Info */}
          <View style={styles.companyContainer}>
            <Text style={styles.titleCompany}>Spiral Co.,Ltd</Text>
            <Text style={styles.addressCompany}>
              27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default ForgotPasswordScreen;
