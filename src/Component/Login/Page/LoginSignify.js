import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Text, Button, Icon } from '@rneui/base';
import { APPNAME } from '../../../Core/URLs';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import AddressCompany from '../View/AddressCompany';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FieldInput } from '../Controls/FieldInput';
import LottieView from 'lottie-react-native';
import TermsAndCondition from '../View/TermsAndCondition';

const LoginSignify = ({
  onLogin,
  isLoading,
  onFogetPassword,
  onShowPrivacy,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isAcceptPrivacy, setAcceptPrivacy] = useState(false);
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
  const onAccept = () => {
    setAcceptPrivacy(!isAcceptPrivacy);
  };
  //
  useEffect(() => {}, []);
  //
  const styles = StyleSheet.create({
    formContainer: { paddingHorizontal: 16 },
    titleStyle: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      padding: 5,
    },
    titleView: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.dark,
      padding: 5,
    },
    inputStyle: { fontSize: 12, color: appcolor.dark, fontWeight: '500' },
    contentContainer: { backgroundColor: appcolor.light, borderRadius: 24 },
    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginTop: 16,
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
      textAlign: 'center',
      padding: 1,
    },
    buttonContainer: { flexGrow: 1, marginHorizontal: 8 },
    mainContainer: { flex: 1, backgroundColor: appcolor.primary, padding: 16 },
    headerTitle: {
      width: '100%',
      fontSize: 23,
      fontWeight: '800',
      color: appcolor.primary,
      textAlign: 'center',
      padding: 8,
    },
    iconContainer: {
      borderRadius: 24,
      width: 86,
      height: 86,
      overflow: 'hidden',
      padding: 8,
      backgroundColor: appcolor.white,
    },
    iconLottieStyle: {
      width: '100%',
      height: 150,
      marginBottom: 16,
      marginTop: 16,
    },
  });
  return (
    <SafeAreaView style={styles.mainContainer}>
      <LottieView
        autoPlay
        style={styles.iconLottieStyle}
        source={require('../../../Themes/lotties/cargill_welcome.json')}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>{`Đăng nhập ${APPNAME}`}</Text>
        <View style={styles.formContainer}>
          <FieldInput
            inputRef={refUsername}
            key="username"
            iconNameLeft="person"
            title="Tên đăng nhập"
            placeholder="Tên đăng nhập"
            inputStyle={styles.inputStyle}
            titleStyle={styles.titleStyle}
            defaultValue={username}
            returnKeyType="next"
            onSubmitEditing={() => refPassword?.current?.focus()}
            blurOnSubmit={false}
            onChangeText={onChangeUsername}
          />
          <FieldInput
            inputRef={refPassword}
            key="password"
            iconNameLeft="lock-closed"
            title="Mật khẩu"
            placeholder="Mật khẩu"
            defaultValue={password}
            isPassword={!isShowPassword}
            iconRight={isShowPassword ? 'eye' : 'eye-off'}
            iconColorRight={
              isShowPassword ? appcolor.primary : appcolor.greylight
            }
            inputStyle={styles.inputStyle}
            titleStyle={styles.titleStyle}
            onRightIcon={onShowPassword}
            returnKeyType="done"
            onSubmitEditing={handlerLogin}
            onChangeText={onChangePassword}
          />
        </View>
        <TermsAndCondition
          isAcceptPrivacy={isAcceptPrivacy}
          onAccept={onAccept}
          onShowPrivacy={onShowPrivacy}
        />
        <View style={styles.actionContainer}>
          <Button
            title="Lấy lại mật khẩu"
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.titleButton}
            onPress={handlerFogotPassword}
          />
          <TouchableOpacity
            style={[
              styles.buttonStyle,
              { backgroundColor: appcolor.primary, flexGrow: 1, marginEnd: 8 },
            ]}
            onPress={handlerLogin}
          >
            {!isLoading ? (
              <Text style={{ ...styles.titleButton, color: appcolor.light }}>
                Đăng nhập
              </Text>
            ) : (
              <ActivityIndicator size="small" color={appcolor.light} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <AddressCompany appcolor={appcolor} useBackground />
    </SafeAreaView>
  );
};

export default LoginSignify;
