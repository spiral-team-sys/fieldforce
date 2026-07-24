import React, { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, Text, UIManager, View } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
export const ListDateTrip = ({
  defaultDate,
  itemTrips,
  typeItem,
  handleSelectDate,
  theme,
  reloadDate,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataCalendar, setDataCalendar] = useState({
    markingType: 'period',
    markedDates: {
      [defaultDate ? defaultDate : moment().format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.surface,
      },
    },
    isStartDay: false,
    isEndDay: false,
    startDate: '',
    endDate: '',
  });
  const [_mutate, setMutate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const loadData = () => {
    const start = moment(itemTrips.fromDate, 'YYYYMMDD');
    const end = moment(itemTrips.toDate, 'YYYYMMDD');
    let listDate = [];
    if (!Array.isArray(itemTrips[typeItem] || [])) {
      listDate = itemTrips[typeItem]
        ?.split(',')
        .map(d => parseInt(d.trim(), 10))
        .filter(d => !isNaN(d));
    }
    const markedDates = checkDateFromTo(start, end, listDate);

    setDataCalendar({
      markingType: 'period',
      markedDates: markedDates,
      isStartDay: false,
      isEndDay: false,
      startDate: '',
      endDate: '',
    });
  };

  const checkDateFromTo = (start, end, listDate) => {
    const markedDates = {};
    let current = moment(start);

    const listHighlight = [];
    listDate.forEach(day => {
      const date = moment(
        `${start.format('YYYY-MM')}-${String(day).padStart(2, '0')}`,
        'YYYY-MM-DD',
      );

      if (date.isBetween(start, end, null, '[]')) {
        listHighlight.push(date.format('YYYY-MM-DD'));
      }
    });

    while (current.isSameOrBefore(end)) {
      const dateStr = current.format('YYYY-MM-DD');

      const isStart = current.isSame(start, 'day');
      const isEnd = current.isSame(end, 'day');

      const isHighLight = listHighlight.includes(dateStr);

      markedDates[dateStr] = {
        color: appcolor.yellowdark,
        textColor: appcolor.dark,
        customContainerStyle: isHighLight
          ? { borderRadius: 50, elevation: 3, backgroundColor: appcolor.yellow }
          : null,
        startingDay: isStart,
        endingDay: isEnd,
      };
      current.add(1, 'day');
    }
    return markedDates;
  };

  useEffect(() => {
    loadData();
  }, [reloadDate]);

  const onSelectDate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCalendar(e => !e);
  };
  // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const onSelectDay = date => {
    const markedDates = dataCalendar.markedDates;
    const dateString = date.dateString;

    let isEmptyDate = !markedDates[dateString].customContainerStyle;
    markedDates[dateString] = {
      color: appcolor.yellowdark,
      textColor: appcolor.dark,
      customContainerStyle: !markedDates[dateString].customContainerStyle
        ? { borderRadius: 50, elevation: 3, backgroundColor: appcolor.yellow }
        : null,
      startingDay: markedDates[dateString].startingDay,
      endingDay: markedDates[dateString].endingDay,
    };
    const newListDate = handlerSelectData(date.day, isEmptyDate);
    itemTrips[typeItem] = newListDate;

    setMutate(e => !e);
  };
  const handlerSelectData = (dateNumber, isEmptyDate) => {
    let str = itemTrips[typeItem];
    if (!str) return `${dateNumber}`;
    let arr = str.split(',').map(Number);
    if (isEmptyDate) {
      arr.push(dateNumber);
      arr.sort((a, b) => a - b);
    } else {
      arr = arr.filter(num => num !== dateNumber);
    }
    let result = arr.join(',');
    return result;
  };
  const themeCalendar = {
    calendarBackground: theme?.calendarBackground || appcolor.surface,
    todayTextColor: appcolor.dark,
    selectedDayTextColor: appcolor.dark,
    dayTextColor: appcolor.dark,
    monthTextColor: appcolor.dark,
    textDayFontSize: 13,
    textMonthFontSize: 15,
    textDayHeaderFontSize: 13,
    textMonthFontWeight: 'bold',
  };

  return (
    <View style={{ width: '100%' }}>
      <FormGroup
        containerStyle={{ width: '100%', padding: 4, borderRadius: 5 }}
        inputStyle={{
          fontSize: 14,
          fontWeight: '400',
          color: appcolor.greylight,
        }}
        iconRight="calendar-alt"
        placeholder={'Các ngày công tác'}
        value={itemTrips[typeItem]}
        rightFunc={onSelectDate}
      />
      {showCalendar && (
        <Calendar
          style={{ borderRadius: 8 }}
          firstDay={1}
          minDate={
            moment(itemTrips.fromDate, 'YYYYMMDD').format('YYYY-MM-DD') ||
            moment().startOf('month').format('YYYY-MM-DD') ||
            null
          }
          maxDate={
            moment(itemTrips.toDate, 'YYYYMMDD').format('YYYY-MM-DD') ||
            moment().endOf('month').format('YYYY-MM-DD') ||
            null
          }
          current={
            moment(itemTrips.fromDate, 'YYYYMMDD').format('YYYY-MM-DD') ||
            moment().format('yyyy-MM-DD')
          }
          monthFormat={'MMMM - yyyy'}
          hideExtraDays
          theme={themeCalendar}
          markingType={dataCalendar.markingType}
          markedDates={dataCalendar.markedDates}
          onDayPress={onSelectDay}
        />
      )}
    </View>
  );
};
