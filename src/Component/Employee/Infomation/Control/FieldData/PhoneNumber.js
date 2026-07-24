import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../../../Content/FormGroup';
import { ToastError, throttling } from '../../../../../Core/Helper';
import { deviceWidth } from '../../../../../Themes/AppsStyle';
import { SET_EmployeeInfo } from '../../../../../Redux/action';
import _ from 'lodash';

export const PhoneNumber = ({ itemMain, keyValue, isEdit }) => {
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [dataPhone, setDataPhone] = useState([]);
  const inputRef = useRef([]);
  const dispatch = useDispatch();
  //
  const ConfigPhoneNumber = async () => {
    let _defaultPhone = ['0', '', '', '', '', '', '', '', '', ''];
    const _valuePhone = employeeInfo[keyValue].split('');
    for (let index = 0; index < _defaultPhone.length; index++) {
      _defaultPhone[index] = _valuePhone[index] || '';
    }
    await setDataPhone(_defaultPhone);
  };
  const onChangeValue = async (text, index) => {
    if (text !== null && text.length > 0)
      index + 1 < dataPhone.length
        ? inputRef.current[index + 1].focus()
        : inputRef.current[index].blur();
    else inputRef.current[index - 1].focus();
    dataPhone[index] = text;
    const newEmployeeInfo = {
      ...employeeInfo,
      [keyValue]: dataPhone.join('').toString(),
    };
    await dispatch(SET_EmployeeInfo(newEmployeeInfo));
  };
  const onCallAction = () => {
    const phoneNumber = employeeInfo[keyValue];
    let call =
      Platform.OS == 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.canOpenURL(call)
      .then(supported => {
        if (!supported) {
          ToastError(
            'Số điện thoại không đúng hoặc sai định dạng, vui lòng kiểm tra và thử lại sau',
            'Số điện thoại',
          );
        } else {
          return Linking.openURL(call);
        }
      })
      .catch(error => {
        ToastError(`Lỗi: ${error}`);
      });
  };
  //
  useEffect(() => {
    const _config = ConfigPhoneNumber();
    return () => _config;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    contentMain: {
      width: '100%',
      flexDirection: 'row',
      marginTop: 5,
      justifyContent: 'center',
    },
    itemMain: { width: deviceWidth / 13.5, alignItems: 'center', marginEnd: 5 },
    containerStyle: {
      width: '100%',
      justifyContent: 'center',
      marginHorizontal: 4,
      padding: 0,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.greylight,
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '500',
      color: appcolor.dark,
      textAlign: 'center',
    },
    inputViewStyle: { fontSize: 14, fontWeight: '400', color: appcolor.dark },
    inputContainer: {
      padding: 3,
      marginTop: 5,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
  });
  const renderItem = (text, index) => {
    const onChange = value => {
      onChangeValue(value, index);
    };
    const colorBackgroud = index == 0 ? appcolor.dark : appcolor.light;
    const colorText = index == 0 ? appcolor.light : appcolor.dark;
    return (
      <View key={`it_phnm_${index}`} style={styles.itemMain}>
        <FormGroup
          inputRefFull={e => (inputRef.current[index] = e)}
          editable={index > 0}
          selectTextOnFocus
          keyboardType="phone-pad"
          maxLength={1}
          value={text}
          defaultValue={text}
          useClearAndroid={false}
          containerStyle={{
            ...styles.containerStyle,
            backgroundColor: colorBackgroud,
          }}
          inputStyle={{ ...styles.inputStyle, color: colorText }}
          handleChangeForm={onChange}
        />
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {isEdit ? (
        <View style={styles.contentMain}>
          {dataPhone !== null &&
            dataPhone.length > 0 &&
            dataPhone.map((item, index) => {
              return renderItem(item, index);
            })}
        </View>
      ) : (
        <FormGroup
          editable={false}
          useClearAndroid={false}
          defaultValue={employeeInfo[keyValue] || ''}
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputViewStyle}
          iconRight={(itemMain.Ref_Id || 0) == 1 ? 'phone' : null}
          rightFunc={(itemMain.Ref_Id || 0) == 1 ? onCallAction : null}
        />
      )}
    </View>
  );
};
