import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import { Icon, Text } from '@rneui/themed';
import FormGroup from '../Content/FormGroup';
import { deviceWidth, scaleSize } from '../Themes/AppsStyle';
import { useDispatch, useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import { alertError, deviceHeight } from '../Core/Utility';
import { ChangePass } from '../Controller/EmployeeController';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import { onLogout, RemoveUser } from '../Controller/UserController';
import {
  MessageAcept,
  MessageInfo,
  ToastError,
  ToastSuccess,
} from '../Core/Helper';
import LoadingDefault from '../Control/ItemLoading/LoadingDefault';
import { ACTION } from '../Redux/types';
export const ChangePassword = ({ onHideSheet, GAppController }) => {
  const { userinfo, appcolor } = useSelector(state => state.GAppState);
  const [secView, setSecView] = useState(true);
  const [expriedDate, setExpriedDate] = useState(-1);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  var inputRef = [];
  const [passinfo, setPassInfo] = useState({
    oldpass: null,
    newpass: null,
    confirmpass: null,
  });
  useEffect(() => {
    const currentDay = +moment().format('YYYYMMDD');
    const caculatorDay =
      new Date(moment(userinfo.nextDatePassWord.toString())).getTime() -
      new Date().getTime();
    const dayCheck = (caculatorDay / (1000 * 60 * 60 * 24)).toFixed(0);
    //
    if (userinfo.nextDatePassWord <= currentDay) {
      setExpriedDate(0);
    } else if (dayCheck <= 5) {
      setExpriedDate(dayCheck);
    }
  }, []);
  const checkPassword = async () => {
    var pattern = /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W])/;
    if (passinfo.oldpass === null || passinfo.oldpass === '')
      alert('Bạn chưa nhập mật khẩu cũ');
    else if (passinfo.newpass === null || passinfo.newpass === '')
      alert('Bạn chưa nhập mật khẩu mới');
    else if (passinfo.confirmpass === null || passinfo.confirmpass === '')
      alert('Bạn chưa nhập xác nhận lại mật khẩu mới');
    else if (passinfo.newpass === passinfo.oldpass)
      alert('Mật khẩu mới không được giống mật khẩu cũ');
    else if (passinfo.confirmpass !== passinfo.newpass)
      alert('Xác nhận mật khẩu không đúng');
    else if (!pattern.test(passinfo.newpass)) {
      alert(
        'Mật khẩu phải bao gồm chữ In hoa, chữ thường số và kí tự đặc biệt, tối thiểu 8 kí tự',
      );
    } else {
      await setLoading(true);
      const result = await ChangePass(passinfo);
      if (result.statusId === 200) {
        await dispatch({ type: ACTION.SET_USERINFO, userinfo: {} });
        await RemoveUser();
        await setLoading(false);
        await MessageAcept('Thông báo', result.messager, () => {
          onHideSheet(1);
        });
      } else {
        await MessageInfo(result.messager);
        await setLoading(false);
      }
      setTimeout(() => {
        setLoading(false);
      }, 30000);
    }
  };
  const handleChangePassword = async () => {
    Keyboard.dismiss();
    checkPassword();
  };
  const onChangePassword = (key, value) => {
    setPassInfo({ ...passinfo, [key]: value });
  };
  const onSubmitInputPassword = index => {
    inputRef[index]?.focus();
  };
  const signOut = () => {
    Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi ứng dụng?', [
      { text: 'Không', onPress: () => null },
      {
        text: 'Có',
        onPress: async () => {
          let deviceId = await DeviceInfo.getUniqueId();
          await onLogout(deviceId).then(async result => {
            if (result.statusId === 200) {
              GAppController.SetUserInfo({});
              await RemoveUser();
              await onHideSheet(0);
            } else {
              alertError(
                'Lỗi đăng xuất khỏi hệ thống, vui lòng kiểm tra lại mạng',
              );
            }
          });
        },
      },
    ]);
  };
  return (
    <SafeAreaView
      style={{
        height: deviceHeight,
        width: deviceWidth,
        backgroundColor: appcolor.light,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 12,
      }}
    >
      <ScrollView style={{}}>
        <View style={{ padding: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text
              numberOfLines={2}
              style={{
                color: appcolor.danger,
                fontSize: scaleSize(12),
                fontStyle: 'italic',
              }}
            >
              {expriedDate > 0
                ? `Mật khẩu của bạn còn ${
                    expriedDate || 0
                  } ngày nữa là hết hạn. Xin vui lòng đổi lại mật khẩu.`
                : 'Mật khẩu của bạn đã hết hạn. Xin vui lòng đổi lại mật khẩu.'}
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <LottieView
              style={{ height: 150 }}
              autoPlay
              source={require('../Themes/lotties/password-reset.json')}
            />
            <View style={{ flexGrow: 1 }}>
              <Text
                style={{
                  color: appcolor.black,
                  fontWeight: 'bold',
                  fontSize: scaleSize(18),
                  marginBottom: 5,
                }}
              >
                Đổi mật khẩu
              </Text>
            </View>
          </View>

          <FormGroup
            appcolor={appcolor}
            useClearAndroid={false}
            index={'0'}
            editable
            title="Mật khẩu cũ"
            defaultValue={''}
            isSecure={secView}
            inputRef={inputRef}
            handleChangeForm={e => onChangePassword('oldpass', e)}
            iconRight={secView ? 'eye-slash' : 'eye'}
            rightFunc={() => setSecView(!secView)}
            onSubmitEditing={() => onSubmitInputPassword('1')}
            blurOnSubmit={false}
          />
          <FormGroup
            appcolor={appcolor}
            useClearAndroid={false}
            index={'1'}
            editable
            title="Mật khẩu mới"
            defaultValue={''}
            isSecure={secView}
            handleChangeForm={e => onChangePassword('newpass', e)}
            iconRight={secView ? 'eye-slash' : 'eye'}
            rightFunc={() => setSecView(!secView)}
            onSubmitEditing={() => onSubmitInputPassword('2')}
            inputRef={inputRef}
            blurOnSubmit={false}
          />
          <FormGroup
            appcolor={appcolor}
            useClearAndroid={false}
            index={'2'}
            editable
            title="Xác nhận mật khẩu mới"
            defaultValue={''}
            isSecure={secView}
            handleChangeForm={e => onChangePassword('confirmpass', e)}
            iconRight={secView ? 'eye-slash' : 'eye'}
            rightFunc={() => setSecView(!secView)}
            onSubmitEditing={handleChangePassword}
            inputRef={inputRef}
            blurOnSubmit={false}
          />
          <LoadingDefault isLoading={loading} />
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <TouchableOpacity
              onPress={expriedDate > 0 ? () => onHideSheet(1) : signOut}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: appcolor.danger,
                width: '40%',
              }}
            >
              <Text
                style={{
                  color: appcolor.white,
                  fontWeight: 'bold',
                  fontSize: scaleSize(18),
                  textAlign: 'center',
                }}
              >
                {expriedDate > 0 ? 'Để sau' : 'Đăng xuất'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChangePassword}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: appcolor.green,
                width: '40%',
              }}
            >
              <Text
                style={{
                  color: appcolor.white,
                  fontWeight: 'bold',
                  fontSize: scaleSize(18),
                  textAlign: 'center',
                }}
              >
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;
