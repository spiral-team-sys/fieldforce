import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../../Content/FormGroup';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight, optionConfirm } from '../../../../Core/Utility';
import { Text } from '@rneui/themed';
import { ToastError } from '../../../../Core/Helper';
import { EmployeeAPI } from '../../../../API/EmployeeAPI';
import { RemoveUser, onLogout } from '../../../../Controller/UserController';
import deviceInfoModule from 'react-native-device-info';
import RNRestart from 'react-native-restart-newarch';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { SetUserInfo } from '../../../../Redux/action';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ChangePass = ({ itemMain, keyValue }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [itemChange, setItemChange] = useState({
    currentPassword: null,
    newPassword: null,
    confirmNewPassword: null,
  });
  const [_mutate, setMutate] = useState(false);
  const dispatch = useDispatch();
  //
  const handlerChangePass = async () => {
    const _valid = await validData();
    if (!_valid) return;
    await EmployeeAPI.changePassword(itemChange, async (statusId, messager) => {
      if (statusId == 200) {
        handlerCloseAction();
        const options = [{ text: 'Đồng ý', onPress: actionLogout }];
        optionConfirm('Thông báo', messager, options);
      } else {
        ToastError(messager, 'Lỗi lưu dữ liệu', 'top');
      }
    });
  };
  const actionLogout = async () => {
    let deviceId = await deviceInfoModule.getUniqueId();
    const result = await onLogout(deviceId);
    if (result.statusId === 200) {
      await dispatch(SetUserInfo({}));
      await RemoveUser();
      RNRestart.Restart();
    } else {
      alertError('Lỗi đăng xuất khỏi hệ thống, vui lòng kiểm tra lại mạng');
    }
  };
  //
  const validData = () => {
    if (
      itemChange.currentPassword == null ||
      itemChange.currentPassword.length == 0
    ) {
      ToastError('Vui lòng nhập mật khẩu cũ', 'Thông báo', 'top');
      return false;
    }
    if (itemChange.newPassword == null || itemChange.newPassword.length == 0) {
      ToastError('Vui lòng nhập mật khẩu mới', 'Thông báo', 'top');
      return false;
    }
    if (
      itemChange.confirmNewPassword == null ||
      itemChange.confirmNewPassword.length == 0
    ) {
      ToastError('Vui lòng nhập lại mật khẩu mới', 'Thông báo', 'top');
      return false;
    }
    if (itemChange.newPassword !== itemChange.confirmNewPassword) {
      ToastError(
        'Vui lòng kiểm tra lại xác nhận mật khẩu mới',
        'Thông báo',
        'top',
      );
      return false;
    }
    const regCheck =
      /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9\!\@\#\$\%\^\&\*\~\,\.\(\)\-]{8,}$/g;
    if (!regCheck.test(itemChange.newPassword)) {
      ToastError(
        'Mật khẩu phải có chữ cái, chữ số và phải tối thiểu 8 ký tự',
        'Thông báo',
        'top',
      );
      return false;
    }
    return true;
  };
  const handlerShowAction = () => {
    SheetManager.show('changepass_info');
  };
  const handlerCloseAction = () => {
    setItemChange({
      currentPassword: null,
      newPassword: null,
      confirmNewPassword: null,
    });
    SheetManager.hide('changepass_info');
  };
  const onChangeValue = (text, keyValue) => {
    itemChange[keyValue] = text;
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    return () => false;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    inputContainer: {
      padding: 3,
      backgroundColor: appcolor.surface,
      marginTop: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    inputStyle: { fontSize: 14, fontWeight: '400', color: appcolor.dark },
    contentMain: { width: '100%', minHeight: deviceHeight / 3, padding: 8 },
    titleHeadChange: {
      width: '100%',
      padding: 8,
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
    },
    titleView: {
      width: '100%',
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.dark,
      fontStyle: 'italic',
    },
    itemMain: { width: '100%' },
    actionSaveView: {
      width: '100%',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingBottom: 8,
    },
    actionView: {
      padding: 8,
      backgroundColor: appcolor.dark,
      borderRadius: 8,
      paddingHorizontal: 32,
      margin: 8,
    },
    titleAction: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
    cancleActionView: {
      padding: 8,
      borderWidth: 0.5,
      borderColor: appcolor.dark,
      borderRadius: 8,
      paddingHorizontal: 32,
      margin: 8,
    },
    titleCancelAction: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <FormGroup
        editable={false}
        useClearAndroid={false}
        iconType="ionicon"
        iconRight="key-outline"
        iconSizeRight={20}
        defaultValue={employeeInfo[keyValue] || ''}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputStyle}
        rightFunc={handlerShowAction}
      />
      <ActionSheet
        id="changepass_info"
        closeOnTouchBackdrop={false}
        closeOnPressBack={false}
        keyboardShouldPersistTaps="handled"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.contentMain}>
          <Text style={styles.titleHeadChange}>{`Đổi mật khẩu`}</Text>
          {/* // */}
          <RenderItemPassword
            key="currentPassword"
            itemChange={itemChange}
            styles={styles}
            title="Mật khẩu cũ"
            keyValue="currentPassword"
            onChangeValue={onChangeValue}
          />
          <RenderItemPassword
            key="newPassword"
            itemChange={itemChange}
            styles={styles}
            title="Mật khẩu mới"
            keyValue="newPassword"
            onChangeValue={onChangeValue}
          />
          <RenderItemPassword
            key="confirmNewPassword"
            itemChange={itemChange}
            styles={styles}
            title="Nhập lại mật khẩu mới"
            keyValue="confirmNewPassword"
            onChangeValue={onChangeValue}
          />
          {/* // */}
          <View style={styles.actionSaveView}>
            <TouchableOpacity
              style={styles.cancleActionView}
              onPress={handlerCloseAction}
            >
              <Text style={styles.titleCancelAction}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionView}
              onPress={handlerChangePass}
            >
              <Text style={styles.titleAction}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
export const RenderItemPassword = ({
  styles,
  title,
  keyValue,
  onChangeValue,
  itemChange,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isShowPassword, setShowPassword] = useState(false);

  const showPass = () => {
    setShowPassword(e => !e);
  };

  const handlerChange = text => {
    onChangeValue(text, keyValue);
  };
  return (
    <View style={styles.itemMain}>
      <Text style={styles.titleView}>{title}</Text>
      <FormGroup
        editable
        isSecure={!isShowPassword}
        iconRight={isShowPassword ? 'eye' : 'eye-slash'}
        defaultValue={itemChange[keyValue] || ''}
        useClearAndroid={false}
        containerStyle={{
          ...styles.inputContainer,
          backgroundColor: appcolor.light,
        }}
        inputStyle={styles.inputStyle}
        handleChangeForm={handlerChange}
        rightFunc={showPass}
      />
    </View>
  );
};
