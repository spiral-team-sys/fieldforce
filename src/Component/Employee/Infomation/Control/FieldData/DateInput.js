import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../../../Content/FormGroup';
import { deviceWidth } from '../../../../../Themes/AppsStyle';
import { Text } from '@rneui/themed';
import moment from 'moment';
import { SET_EmployeeInfo } from '../../../../../Redux/action';

const parseDateValue = value => {
  if (!value) {
    return null;
  }

  const valueString = value.toString();
  const dateByViewFormat = moment(valueString, 'DD/MM/YYYY', true);
  if (dateByViewFormat.isValid()) {
    return dateByViewFormat;
  }

  const dateByIsoDate = moment(valueString, 'YYYY-MM-DD', true);
  if (dateByIsoDate.isValid()) {
    return dateByIsoDate;
  }

  const dateByIsoFormat = moment(valueString, moment.ISO_8601, true);
  return dateByIsoFormat.isValid() ? dateByIsoFormat : null;
};

const isValidDateParts = ({ DD, MM, YYYY }) => {
  const dateText = `${DD}/${MM}/${YYYY}`;
  return moment(dateText, 'DD/MM/YYYY', true).isValid();
};

export const DateInput = ({ keyValue }) => {
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [valueDate, setValueDate] = useState({ DD: '', MM: '', YYYY: '' });
  const [dateError, setDateError] = useState('');
  const dispatch = useDispatch();
  const DD_Ref = useRef();
  const MM_Ref = useRef();
  const YYYY_Ref = useRef();

  const updateEmployeeDate = async dateValue => {
    await dispatch(
      SET_EmployeeInfo({
        ...employeeInfo,
        [keyValue]: dateValue,
      }),
    );
  };

  const onChangeValue = async (text, type) => {
    const nextValueDate = {
      ...valueDate,
      [type]: (text || '').replace(/[^0-9]/g, ''),
    };
    setValueDate(nextValueDate);
    setDateError('');

    if ((nextValueDate.DD || '').length === 2 && type === 'DD') {
      MM_Ref.current?.focus();
    }
    if ((nextValueDate.MM || '').length === 2 && type === 'MM') {
      YYYY_Ref.current?.focus();
    }
    if ((nextValueDate.YYYY || '').length === 4 && type === 'YYYY') {
      YYYY_Ref.current?.blur();
    }
    //
    const isCompleted =
      (nextValueDate.DD || '').length === 2 &&
      (nextValueDate.MM || '').length === 2 &&
      (nextValueDate.YYYY || '').length === 4;
    if (!isCompleted) {
      await updateEmployeeDate(null);
      return;
    }

    const dateText = `${nextValueDate.DD}/${nextValueDate.MM}/${nextValueDate.YYYY}`;
    if (!isValidDateParts(nextValueDate)) {
      setDateError('Ngày không hợp lệ. Vui lòng nhập đúng DD/MM/YYYY');
      await updateEmployeeDate(dateText);
      return;
    }

    await updateEmployeeDate(dateText);
  };
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) {
      return;
    }
    const currentDate = parseDateValue(employeeInfo[keyValue]);
    if (currentDate) {
      setValueDate({
        DD: currentDate.format('DD'),
        MM: currentDate.format('MM'),
        YYYY: currentDate.format('YYYY'),
      });
    }
    return () => {
      isMounted = false;
    };
  }, [employeeInfo, keyValue]);
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', marginTop: 5 },
    inputContainer: {
      width: deviceWidth / 5,
      padding: Platform.OS === 'ios' ? 3 : 0,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      marginEnd: 8,
    },
    inputStyle: {
      fontSize: 14,
      fontWeight: '400',
      color: appcolor.dark,
      textAlign: 'center',
    },
    contentMain: { flexDirection: 'row' },
    characterView: { padding: 8, paddingStart: 0, color: appcolor.blacklight },
    errorText: {
      marginTop: 2,
      fontSize: 11,
      color: appcolor.red,
      fontStyle: 'italic',
    },
  });
  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentMain}>
        <FormGroup
          inputRefFull={DD_Ref}
          editable
          multiline
          selectTextOnFocus
          keyboardType="numeric"
          placeholder="DD"
          maxLength={2}
          value={valueDate.DD}
          useClearAndroid={false}
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          handleChangeForm={text => onChangeValue(text, 'DD')}
        />
        <Text style={styles.characterView}>/</Text>
        <FormGroup
          inputRefFull={MM_Ref}
          editable
          multiline
          selectTextOnFocus
          keyboardType="numeric"
          placeholder="MM"
          maxLength={2}
          value={valueDate.MM}
          useClearAndroid={false}
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          handleChangeForm={text => onChangeValue(text, 'MM')}
        />
        <Text style={styles.characterView}>/</Text>
        <FormGroup
          inputRefFull={YYYY_Ref}
          editable
          multiline
          selectTextOnFocus
          keyboardType="numeric"
          placeholder="YYYY"
          maxLength={4}
          value={valueDate.YYYY}
          useClearAndroid={false}
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          handleChangeForm={text => onChangeValue(text, 'YYYY')}
        />
      </View>
      {dateError.length > 0 && (
        <Text style={styles.errorText}>{dateError}</Text>
      )}
    </View>
  );
};
