import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../Core/Utility';
import _ from 'lodash';
import { scaleSize } from '../../../Themes/AppsStyle';
import moment, { min } from 'moment';
import { BORDER_WIDTH } from './UtilityOffice';
import { SummaryPlanMonth } from '../Summary/SummaryPlanMonth';

export const CalendarView = ({ dataPlanMonth, changeMonth, onDetailDay }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [calendarValue, setCalendarValue] = useState(moment());
  const [titleCalendar, setTitleCalendar] = useState(
    `Tháng ${calendarValue.month() + 1} ${calendarValue.year()}`,
  );
  const weekdays = [
    { dayOfWeek: 1, weekDayName: 'T2' },
    { dayOfWeek: 2, weekDayName: 'T3' },
    { dayOfWeek: 3, weekDayName: 'T4' },
    { dayOfWeek: 4, weekDayName: 'T5' },
    { dayOfWeek: 5, weekDayName: 'T6' },
    { dayOfWeek: 6, weekDayName: 'T7' },
    { dayOfWeek: 0, weekDayName: 'CN' },
  ];
  const [planByMonth, setPlanByMonth] = useState([]);
  const [dataByDay, setDataByDay] = useState({});
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    await setPlanByMonth(dataPlanMonth);
  };
  // Handler
  const handlerSwitchCalendar = typeChange => {
    let _value = null;
    setDataByDay({});
    if (typeChange == 'MINUS') {
      _value = moment(calendarValue).add('M', -1);
      setTitleCalendar(`Tháng ${_value.month() + 1} ${_value.year()}`);
      setCalendarValue(_value);
    }
    if (typeChange == 'PLUS') {
      _value = moment(calendarValue).add('M', 1);
      setTitleCalendar(`Tháng ${_value.month() + 1} ${_value.year()}`);
      setCalendarValue(_value);
    }
    changeMonth && changeMonth(_value.month() + 1, _value.year());
  };
  const handlerChooseDay = async (isChooseDay, itemDay) => {
    const value = isChooseDay ? {} : itemDay;
    await setDataByDay(value);
    await onDetailDay(value);
  };
  //
  useEffect(() => {
    const _loadconfig = LoadData();
    return () => _loadconfig;
  }, [dataPlanMonth]);

  // View
  const switchMonthAndYear = (titleCalendar, handlerSwitch) => {
    const onBefore = () => {
      handlerSwitch('MINUS');
    };
    const onNext = () => {
      handlerSwitch('PLUS');
    };
    if (!changeMonth)
      return (
        <View style={styles.MYContent}>
          <View style={styles.viewHeaderText}>
            <Text style={styles.MYTitle}>
              {titleCalendar || 'Title Month & Year'}
            </Text>
          </View>
        </View>
      );
    return (
      <View style={styles.MYContent}>
        <SpiralIcon
          name="arrow-left"
          size={scaleSize(32)}
          color={appcolor.primary}
          style={{ paddingStart: 5, paddingEnd: 5 }}
          onPress={onBefore}
        />
        <View style={styles.viewHeaderText}>
          <Text style={styles.MYTitle}>
            {titleCalendar || 'Title Month & Year'}
          </Text>
        </View>
        <SpiralIcon
          name="arrow-right"
          size={scaleSize(32)}
          color={appcolor.primary}
          style={{ paddingStart: 5, paddingEnd: 5 }}
          onPress={onNext}
        />
      </View>
    );
  };
  const renderHeaderWeekDay = () => {
    return (
      <View style={styles.headerCalendar}>
        {weekdays.map((item, index) => {
          return (
            <View key={`mix_${index}`} style={styles.mainHeader}>
              <Text
                style={{
                  ...styles.titleCalendar,
                  color:
                    item.dayOfWeek == 0 ? appcolor.red : appcolor.greylight,
                }}
              >
                {item.weekDayName || ''}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };
  const renderWeeks = () => {
    return (
      <View style={{ width: '100%', alignItems: 'center' }}>
        {planByMonth !== null &&
          planByMonth.length > 0 &&
          planByMonth.map((item, index) => {
            const dayInWeek = JSON.parse(item.dataWeek || '[]');
            return (
              <View
                key={`imp_${index}`}
                style={{
                  borderBottomWidth:
                    index + 1 == planByMonth.length ? 0 : BORDER_WIDTH,
                  borderBottomColor: appcolor.greylight,
                }}
              >
                {renderDays(dayInWeek)}
              </View>
            );
          })}
      </View>
    );
  };
  const renderDays = dataWeek => {
    return (
      <View style={styles.headerDays}>
        {weekdays.map((i, dx) => {
          const onDaysAction = () => {
            itemDay.DayValue !== undefined &&
              itemDay.DayValue !== 0 &&
              handlerChooseDay(isChooseDay, itemDay);
          };
          const itemDay =
            _.filter(dataWeek, e => e.DayOfWeek == i.dayOfWeek)[0] || {};
          const isChooseDay = (dataByDay.DayValue || 0) == itemDay.DayValue;

          return (
            <View
              key={`iopm_${dx}`}
              style={{
                ...styles.mainDays,
                borderEndWidth: dx + 1 == weekdays.length ? 0 : BORDER_WIDTH,
                backgroundColor: isChooseDay ? '#e0e0e0' : appcolor.light,
              }}
            >
              <TouchableOpacity
                style={{ width: '100%' }}
                onPress={onDaysAction}
              >
                <Text
                  style={{
                    ...styles.titleDays,
                    color: i.dayOfWeek == 0 ? appcolor.red : appcolor.greylight,
                  }}
                >
                  {itemDay.DayValue || ''}
                </Text>
                {itemDay.ShiftType !== null &&
                  itemDay.ShiftType?.length > 0 && (
                    <View
                      style={{
                        marginTop: 5,
                        padding: 5,
                        backgroundColor:
                          itemDay.ShiftHighLight || appcolor.primary,
                        borderRadius: 50,
                      }}
                    >
                      <Text style={styles.titleDays}>
                        {`${itemDay.ShiftType || ''}${itemDay.OTValue || ''}`}
                      </Text>
                    </View>
                  )}
                {itemDay.statusOFF !== null &&
                  itemDay.statusOFF?.length > 0 && (
                    <Text
                      style={{
                        ...styles.statusTitle,
                        color: appcolor[itemDay.statusOFF],
                      }}
                    >
                      {itemDay.labelOFF || `OFF`}
                    </Text>
                  )}
                {itemDay.statusOT !== null && itemDay.statusOT?.length > 0 && (
                  <Text
                    style={{
                      ...styles.statusTitle,
                      color: appcolor[itemDay.statusOT],
                    }}
                  >
                    {itemDay.labelOT || `OT`}
                  </Text>
                )}
                {itemDay.statusLate !== null &&
                  itemDay.statusLate?.length > 0 && (
                    <Text
                      style={{
                        ...styles.statusTitle,
                        color: appcolor[itemDay.statusLate],
                      }}
                    >
                      {itemDay.labelLate || `Đi trễ`}
                    </Text>
                  )}
                {itemDay.statusEarlier !== null &&
                  itemDay.statusEarlier?.length > 0 && (
                    <Text
                      style={{
                        ...styles.statusTitle,
                        color: appcolor[itemDay.statusEarlier],
                      }}
                    >
                      {itemDay.labelEarlier || `Về sớm`}
                    </Text>
                  )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };
  //
  const styles = StyleSheet.create({
    mainContainer: { backgroundColor: appcolor.light },
    headerCalendar: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 8,
    },
    mainHeader: { width: (deviceWidth - 8) / 7, alignItems: 'center' },
    titleCalendar: { fontSize: 13, fontWeight: '400' },
    MYContent: {
      width: '100%',
      padding: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    MYTitle: {
      width: '100%',
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      padding: 8,
    },
    headerDays: { width: '100%', flexDirection: 'row' },
    mainDays: {
      width: (deviceWidth - 8) / 7,
      minHeight: (deviceWidth - 8) / 7,
      padding: 8,
      borderEndWidth: BORDER_WIDTH,
      borderEndColor: appcolor.greylight,
    },
    titleDays: {
      width: '100%',
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
      color: appcolor.light,
    },
    summaryMain: {
      width: '100%',
      padding: 5,
      borderRadius: 5,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.greylight,
      alignItems: 'center',
    },
    valueSummary: {
      fontSize: 32,
      fontWeight: '800',
      color: appcolor.helper,
      textAlign: 'center',
    },
    titleSummary: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.blacklight,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    viewHeaderText: {
      width: '85%',
      backgroundColor: appcolor.surface,
      borderRadius: 20,
    },
    contentSummary: { padding: 5, width: deviceWidth / 5.5 },
    statusTitle: {
      textAlign: 'center',
      fontSize: 11,
      marginTop: 5,
      fontWeight: '500',
    },
  });
  return (
    <View style={styles.mainContainer}>
      <SummaryPlanMonth dataSummaryPlan={dataPlanMonth} />
      {switchMonthAndYear(titleCalendar, handlerSwitchCalendar)}
      {renderHeaderWeekDay()}
      <View
        style={{
          borderWidth: BORDER_WIDTH,
          borderColor: appcolor.greylight,
          borderRadius: 5,
          width: '100%',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {renderWeeks()}
      </View>
    </View>
  );
};
