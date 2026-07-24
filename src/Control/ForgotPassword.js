import React from 'react';
import { View } from 'react-native';
import { Input, Text, Button } from '@rneui/themed';
import SpiralIcon from './Icon/SpiralIcon';
import { scaleSize } from '../Themes/AppsStyle';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
const ForgotPassword = ({
  refLoginName,
  refEmail,
  handlerCloseRequest,
  SendMail,
  UserNameChangeText,
  EmailChangeText,
}) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        padding: 8,
        backgroundColor: appcolor.light,
      }}
    >
      <View style={{ height: 150 }}>
        <LottieView
          backgroundColor={'transparent'}
          style={{ height: '100%' }}
          autoPlay
          source={require('../Themes/lotties/key_to_mail.json')}
        />
      </View>
      <Text
        style={{ textAlign: 'center', color: appcolor.dark, marginTop: 0 }}
        h3
      >
        Yêu cầu cấp lại mật khẩu
      </Text>
      <Text
        style={{ color: appcolor.dark, fontSize: scaleSize(15), marginTop: 20 }}
      >
        Tên đăng nhập
      </Text>
      <Input
        ref={refLoginName}
        placeholder="Tài khoản"
        autoCorrect={false}
        returnKeyType={'next'}
        onSubmitEditing={() => this.refEmail?.current?.focus()}
        blurOnSubmit={false}
        style={{ color: appcolor.dark }}
        inputContainerStyle={{
          borderBottomWidth: 0.3,
          borderBottomColor: appcolor.primary,
        }}
        onChangeText={UserNameChangeText}
        leftIcon={
          <SpiralIcon
            type="font-awesome-6"
            size={scaleSize(22)}
            name="user-circle"
            style={{ color: appcolor.primary, marginRight: 5 }}
          />
        }
      />
      <Text style={{ color: appcolor.dark, fontSize: scaleSize(15) }}>
        Địa chỉ email
      </Text>
      <Input
        ref={refEmail}
        leftIcon={
          <SpiralIcon
            type="font-awesome-6"
            size={scaleSize(22)}
            color={appcolor.primary}
            name="envelope"
          />
        }
        onChangeText={EmailChangeText}
        style={{ color: appcolor.dark }}
        inputContainerStyle={{
          borderBottomWidth: 0.3,
          borderBottomColor: appcolor.primary,
        }}
        keyboardType="email-address"
        placeholder="Nhập địa chỉ email của bạn"
      />
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Button
          title="  Hủy"
          type="outline"
          icon={
            <SpiralIcon
              type="font-awesome-6"
              size={24}
              color={appcolor.primary}
              name="arrow-left"
            />
          }
          titleStyle={{ color: appcolor.primary }}
          buttonStyle={{
            width: 100,
            borderColor: appcolor.primary,
            marginLeft: 10,
            marginRight: 10,
          }}
          onPress={handlerCloseRequest}
        />
        <Button
          title=" Gửi yêu cầu"
          onPress={SendMail}
          icon={
            <SpiralIcon
              type="font-awesome-6"
              color={appcolor.white}
              name="dove"
              size={24}
            />
          }
          buttonStyle={{ width: '90%', backgroundColor: appcolor.primary }}
          titleStyle={{ color: appcolor.white }}
        />
      </View>
    </View>
  );
};
export default ForgotPassword;
