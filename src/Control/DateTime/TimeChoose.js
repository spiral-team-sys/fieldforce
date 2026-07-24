import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
//import DatePicker from 'react-native-date-picker';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../Themes/AppsStyle';
import moment from 'moment';

const TimeChoose = ({
  visible = true,
  dateValue,
  title,
  stepTime,
  keyValue,
  onChooseTime,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isOpen, setOpen] = useState(false);
  const [timeValue, setTimeValue] = useState(null);

  const LoadData = () => {
    setTimeValue(moment(dateValue));
    isOpen && setOpen(false);
  };

  const handlerChange = () => {
    setOpen(true);
  };
  const handlerChooseTime = (event, time) => {
    if (event.type == 'dismissed') {
      setOpen(false);
    } else {
      const roundedMoment = moment(time);
      const minutes = roundedMoment.minutes();
      const remainder = minutes % stepTime;

      if (remainder !== 0) roundedMoment.add(stepTime - remainder, 'minutes');
      roundedMoment.seconds(0);
      roundedMoment.milliseconds(0);
      //
      setTimeValue(roundedMoment);
      onChooseTime && onChooseTime(keyValue, roundedMoment);
      Platform.OS == 'android' && setOpen(false);
    }
  };
  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    containerStyle: { flex: 1, marginHorizontal: 4 },
    mainContainer: {
      width: '100%',
      borderWidth: 0.5,
      borderRadius: 5,
      borderColor: appcolor.primary,
      marginEnd: 8,
    },
    titleView: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      padding: 8,
      textAlign: 'center',
    },
    datetimepicker: { backgroundColor: appcolor.primary },
  });
  if (!visible) return <View />;
  return (
    <View style={styles.containerStyle}>
      <TouchableOpacity onPress={handlerChange} style={styles.mainContainer}>
        <Text style={styles.titleView}>
          {title} {timeValue ? moment(timeValue).format('HH:mm') : ''}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <DatePicker
          mode="time"
          date={new Date(dateValue)}
          minuteInterval={stepTime}
          style={styles.datetimepicker}
          onDateChange={handlerChooseTime}
        />
      )}
    </View>
  );
};

export default TimeChoose;
