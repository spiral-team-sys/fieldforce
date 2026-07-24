import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { ToastError } from '../../../../Core/Helper';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';
//////import DatePicker from "react-native-date-picker";;

const DateChoose = ({
  onChooseDate,
  allowPast = false,
  allowFuture = false,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isOpen, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  const handlerChange = () => {
    setOpen(true);
  };
  const handlerChooseDate = date => {
    const today = moment().format('YYYY-MM-DD');
    const workingDay = moment(date).format('YYYY-MM-DD');
    if (!allowPast && workingDay < today) {
      ToastError(`Không được phép chọn ngày quá khứ`, 'Chọn ngày lại', 'top');
      setOpen(false);
      return;
    }
    if (!allowFuture && workingDay > today) {
      ToastError(
        `Không được phép chọn ngày quá tương lai`,
        'Chọn ngày lại',
        'top',
      );
      setOpen(false);
      return;
    }
    setDateValue(date);
    onChooseDate && onChooseDate(workingDay);
    setOpen(false);
  };
  const handlerCancel = () => {
    setOpen(false);
  };
  useEffect(() => { }, []);

  const styles = StyleSheet.create({
    containerStyle: { flex: 1 },
    mainContainer: {
      minHeight: 52,
      paddingHorizontal: 4,
      paddingVertical: 7,
      borderWidth: 1,
      borderRadius: 12,
      borderColor: appcolor.primary + '45',
      backgroundColor: appcolor.light,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 28,
      height: 28,
      borderRadius: 9,
      backgroundColor: appcolor.primary + '12',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
    },
    content: { flex: 1 },
    label: {
      fontSize: 10,
      fontWeight: fontWeightBold,
      color: appcolor.placeholderText,
    },
    titleView: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '700',
      color: appcolor.primary,
    },
    datetimepicker: { backgroundColor: appcolor.light },
  });
  return (
    <View style={styles.containerStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlerChange}
        style={styles.mainContainer}
      >
        <View style={styles.iconContainer}>
          <SpiralIcon
            name="calendar"
            type="feather"
            size={15}
            color={appcolor.primary}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>Ngày</Text>
          <Text style={styles.titleView}>
            {moment(dateValue).format('DD/MM/YYYY')}
          </Text>
        </View>
      </TouchableOpacity>
      <DatePicker
        modal
        open={isOpen}
        mode="date"
        date={dateValue}
        minimumDate={allowPast ? undefined : moment().startOf('day').toDate()}
        maximumDate={allowFuture ? undefined : moment().endOf('day').toDate()}
        style={styles.datetimepicker}
        theme="light"
        buttonColor={appcolor.primary}
        onConfirm={handlerChooseDate}
        onCancel={handlerCancel}
      />
    </View>
  );
};

export default DateChoose;
