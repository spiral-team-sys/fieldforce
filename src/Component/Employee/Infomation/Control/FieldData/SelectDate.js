import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../../../Content/FormGroup';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight } from '../../../../../Core/Utility';
import moment from 'moment';
import { ChooseDate } from '../../../../../Control/Calendars';
import { SET_EmployeeInfo } from '../../../../../Redux/action';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SelectDate = ({ keyValue }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [defaultValue, setDefaultValue] = useState('');
  const dispatch = useDispatch();

  const LoadData = async () => {
    await setDefaultValue(employeeInfo[keyValue] || '');
  };

  const onChangeValue = async date => {
    const _formatDate = moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
    employeeInfo[keyValue] = _formatDate;
    employeeInfo.dateValue = date;
    setDefaultValue(_formatDate);
    await dispatch(SET_EmployeeInfo(employeeInfo));
  };

  const handlerShowCalendar = () => {
    SheetManager.show('calendarvalue');
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%', marginTop: 5 },
    inputContainer: {
      padding: 3,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    inputStyle: { fontSize: 14, fontWeight: '400', color: appcolor.dark },
    mainContentCalendar: {
      padding: 8,
      width: '100%',
      minHeight: deviceHeight / 3,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <FormGroup
        editable={false}
        iconRight="calendar-day"
        defaultValue={defaultValue}
        useClearAndroid={false}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputStyle}
        rightFunc={handlerShowCalendar}
      />
      <ActionSheet
        id="calendarvalue"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.mainContentCalendar}>
          <ChooseDate onChangeData={onChangeValue} />
        </View>
      </ActionSheet>
    </View>
  );
};
