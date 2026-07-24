import React, { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { TouchableOpacity, View, Text } from 'react-native';
import { deviceWidth } from '../Themes/AppsStyle';
import Moment from 'moment';

export const RenderCalendar = ({
  appcolor,
  currentDate,
  onSelect,
  handleDisplay,
}) => {
  const [dateShow, setDateShow] = useState(new Date(currentDate) || new Date());
  const onSeleted = () => {
    handleDisplay(Moment(dateShow).format('YYYY-MM-DD'));
    onSelect && onSelect(Moment(dateShow).format('YYYY-MM-DD'));
  };
  const onDateChange = event => {
    setDateShow(event);
    onSelect && onSelect(Moment(event).format('YYYY-MM-DD'));
  };
  return (
    <View style={{ backgroundColor: appcolor.light, overflow: 'hidden' }}>
      <View
        style={{
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: appcolor.dark }}>
          Chọn ngày
        </Text>
        <TouchableOpacity onPress={onSeleted}>
          <Text style={{ fontWeight: '600', color: appcolor.dark }}>XONG</Text>
        </TouchableOpacity>
      </View>
      <DatePicker
        style={{ width: deviceWidth }}
        textColor={appcolor.dark}
        theme={appcolor.light === 'light' ? 'light' : 'dark'}
        mode="date"
        date={dateShow}
        onDateChange={onDateChange}
      />
    </View>
  );
};
