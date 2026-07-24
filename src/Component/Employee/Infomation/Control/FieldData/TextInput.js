import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../../../Content/FormGroup';
import { SET_EmployeeInfo } from '../../../../../Redux/action';

export const TextInput = ({ itemMain, keyValue }) => {
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const dispatch = useDispatch();

  const onChangeValue = async text => {
    employeeInfo[keyValue] =
      text || (keyValue == 'nationality' ? 'Việt Nam' : '');
    await dispatch(SET_EmployeeInfo(employeeInfo));
  };

  useEffect(() => {
    return () => false;
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%', marginTop: 5 },
    inputContainer: {
      padding: 3,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    inputStyle: { fontSize: 14, fontWeight: '400', color: appcolor.dark },
  });

  return (
    <View style={styles.mainContainer}>
      <FormGroup
        editable
        multiline
        defaultValue={
          employeeInfo[keyValue] ||
          (keyValue == 'nationality' ? 'Việt Nam' : '')
        }
        useClearAndroid={false}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputStyle}
        handleChangeForm={onChangeValue}
      />
    </View>
  );
};
