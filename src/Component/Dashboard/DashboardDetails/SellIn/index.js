import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { SellInDetails } from './SellInDetails';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight } from '../../../../Core/Utility';
import { YearMonthSelected } from '../../../../Control/YearMonthSelected';
import moment from 'moment';
import { FilterByTag } from '../Controls/FilterByTag';
import { Text } from '@rneui/base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DashboardSellInDetails = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemCalendar, setItemCalendar] = useState({
    tagFilter: 'Dealer',
    year: moment().year(),
    month: moment().month() + 1,
  });
  const [itemCalendarLocal, setCalendarLocal] = useState({
    tagFilter: 'Dealer',
    year: moment().year(),
    month: moment().month() + 1,
  });
  //
  const onBack = () => {
    navigation.goBack();
  };
  const onRightAction = () => {
    SheetManager.show('search_calendar');
  };
  const handlerSearchCalendar = info => {
    setCalendarLocal({
      ...itemCalendarLocal,
      year: info.year,
      month: info.month,
    });
  };
  const onSearchAction = () => {
    setItemCalendar(itemCalendarLocal);
  };
  const handlerFilter = tag => {
    setCalendarLocal({ ...itemCalendarLocal, tagFilter: tag });
  };
  //
  useEffect(() => {
    return () => false;
  }, []);

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentMain: { width: '100%', height: '100%', padding: 8 },
    titleHead: {
      paddingHorizontal: 8,
      fontSize: 14,
      color: appcolor.greylight,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
    },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={`Chi tiết doanh số Tháng ${itemCalendar.month} - ${itemCalendar.year}`}
        leftFunc={onBack}
        iconRight="calendar-alt"
        rightFunc={onRightAction}
      />
      {/* // Content Data */}
      <View style={styles.contentMain}>
        <SellInDetails
          key="SELLIN_DETAILS"
          tagView={itemCalendar.tagFilter}
          yearValue={itemCalendar.year}
          monthValue={itemCalendar.month}
        />
      </View>
      {/* // Search Calendar */}
      <ActionSheet
        id="search_calendar"
        onClose={onSearchAction}
        gestureEnabled
        containerStyle={{
          width: '100%',
          height: deviceHeight / 2.5,
          paddingBottom: insets.bottom,
        }}
      >
        <FilterByTag
          tagValue={itemCalendar.tagFilter}
          actionResult={handlerFilter}
        />
        <Text style={styles.titleHead}>Tìm kiếm theo lịch</Text>
        <YearMonthSelected
          option={itemCalendar}
          onYearMonth={handlerSearchCalendar}
        />
      </ActionSheet>
    </View>
  );
};
