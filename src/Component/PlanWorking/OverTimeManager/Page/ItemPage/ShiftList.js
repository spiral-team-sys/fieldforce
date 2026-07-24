import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/themed';
import { deviceHeight, fontWeightBold } from '../../../../../Themes/AppsStyle';
import { removeVietnameseTones, ToastError } from '../../../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import DateChoose from '../../Control/DateChoose';
import moment from 'moment';
import _ from 'lodash';
import TimeChoose from '../../Control/TimeChoose';

export const ShiftList = ({ data = [], info, callIndex }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [config, setConfig] = useState({});
  const [dataMain, setDataMain] = useState([]);
  const [dataShift, setDataShift] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const [dateValue, _setDateValue] = useState({
    shiftValue: 0,
    shiftCode: null,
    shiftName: null,
    timeDefault: new Date(),
    workingDay: new Date(),
    timeFrom: null,
    timeTo: null,
    totalTimeView: null,
  });
  const _config = JSON.parse(kpiinfo.reportItem || '{ "stepTime": 5 }');

  //
  const LoadData = async () => {
    await setConfig(_config);
    await setDataMain(data);
    await setDataShift(data);
  };
  // Handler
  const onItemChoose = item => {
    dateValue.shiftName = item.ShiftName;
    dateValue.shiftCode = item.ShiftCode;
    dateValue.shiftValue = item.Value;
    if (item.From && item.To) {
      dateValue.timeFrom = item.From;
      dateValue.timeTo = item.To;
    }
    if (dateValue.timeFrom) {
      dateValue.timeTo = moment(dateValue.timeFrom).add(
        'hour',
        dateValue.shiftValue,
      );
    }
    //
    const objectUpdate = { item: dateValue, type: 'SHIFT' };
    DeviceEventEmitter.emit('UPDATE_REQUEST_INFO', objectUpdate);
    setMutate(e => !e);
  };
  const handlerSearchInfo = text => {
    const valueSearch = removeVietnameseTones(text).toLowerCase();
    const lstFilter = _.filter(dataMain, e => {
      return (
        removeVietnameseTones(e.ShiftName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.ShiftCode).toLowerCase().match(valueSearch)
      );
    });
    setDataShift(lstFilter);
  };
  const onChangeDate = workingDay => {
    dateValue.workingDay = workingDay;
    if (
      (dateValue.timeFrom || null) !== null &&
      (dateValue.timeTo || null) !== null &&
      (dateValue.shiftCode || null) !== null
    ) {
      callIndex(3);
    }
    const objectUpdate = { item: dateValue, type: 'SHIFT' };
    DeviceEventEmitter.emit('UPDATE_REQUEST_INFO', objectUpdate);
  };
  const onChangeTime = (keyValue, time) => {
    try {
      dateValue[keyValue] = moment(time);
      if (
        (dateValue.timeFrom || null) !== null &&
        (dateValue.timeTo || null) !== null &&
        (dateValue.shiftCode || null) !== null
      ) {
        if (
          moment(dateValue.timeFrom).isSameOrAfter(moment(dateValue.timeTo))
        ) {
          dateValue.timeTo = moment(dateValue.timeTo).add(1, 'days');
        }
        const totalTime = moment(dateValue.timeFrom).add(
          'hours',
          dateValue.shiftValue,
        );
        if (moment(dateValue.timeTo).isAfter(totalTime)) {
          ToastError(
            `Ca ${dateValue.shiftName} có tổng thời gian là ${dateValue.shiftValue}h, Vui lòng chọn lại`,
            'Thông báo',
            'top',
          );
          dateValue.timeTo = null;
        } else {
          const diff = moment.duration(
            dateValue.timeTo.diff(dateValue.timeFrom),
          );
          const hours = Math.floor(diff.asHours());
          const minutes = diff.minutes();
          dateValue.totalTimeView = `(${hours}h ${minutes}p)`;
        }
      }
      const objectUpdate = { item: dateValue, type: 'SHIFT' };
      DeviceEventEmitter.emit('UPDATE_REQUEST_INFO', objectUpdate);
    } catch (e) {
      console.log(e);
    }
  };
  const handlerChangeData = typeId => {
    const dataShift = _.filter(
      data,
      e => e.PositionId == typeId || e.PositionId == 0,
    );
    setDataShift(dataShift);
  };
  //
  useEffect(() => {
    const _setData = DeviceEventEmitter.addListener(
      'SET_DATA_SHIFT',
      handlerChangeData,
    );
    LoadData();
    return () => {
      _setData.remove();
    };
  }, [data, info]);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    inputStyle: { fontSize: 12, color: appcolor.homebackground },
    contentItem: { flex: 1 },
    itemContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 5,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    titleMain: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.blacklight,
      padding: 5,
      paddingHorizontal: 0,
    },
    subTitleMain: { fontSize: 11, fontWeight: '500', color: appcolor.gray },
    viewIconSelected: { padding: 8, paddingStart: 0, justifyContent: 'center' },
    itemShiftContainer: {
      minWidth: 80,
      marginEnd: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 5,
    },
    titleItem: {
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.primary,
      padding: 8,
      textAlign: 'center',
    },
    titleShiftItem: {
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.dark,
      padding: 8,
    },
    otViewDate: {
      width: '30%',
      borderWidth: 0.5,
      borderRadius: 5,
      borderColor: appcolor.primary,
      marginEnd: 8,
    },
    otViewTime: {
      width: '68%',
      borderWidth: 0.5,
      borderRadius: 5,
      borderColor: appcolor.primary,
    },
    groupView: {
      width: '100%',
      flexWrap: 'wrap',
      flexDirection: 'row',
      paddingBottom: 8,
    },
    viewDateValue: { flexDirection: 'row' },
    datetimepicker: { backgroundColor: appcolor.primary },
  });
  const renderItem = ({ item }) => {
    const onPress = () => onItemChoose(item);
    const isChoose = info.shiftCode == item.ShiftCode;
    const colorChoose = isChoose ? appcolor.success : appcolor.grey;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.viewIconSelected}>
          <SpiralIcon
            type="ionicon"
            name={isChoose ? 'checkmark-circle' : 'add-circle-outline'}
            size={24}
            color={colorChoose}
          />
        </View>
        <View style={{ width: '70%' }}>
          <TouchableOpacity onPress={onPress}>
            <Text style={styles.titleMain}>{`${item.ShiftName}`}</Text>
            <Text
              style={styles.subTitleMain}
            >{`Mã ca: ${item.ShiftCode}`}</Text>
            {item.From && (
              <Text
                style={styles.subTitleMain}
              >{`Thời gian: ${item.From} - ${item.To}`}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (data.length == 0) return <View />;
  return (
    <View style={styles.mainContainer}>
      <SearchData
        placeholder="Tìm kiếm ca"
        iconName="search"
        inputStyle={styles.inputStyle}
        onSearchData={handlerSearchInfo}
      />
      <View style={styles.contentItem}>
        <View style={styles.viewDateValue}>
          <DateChoose
            onChooseDate={onChangeDate}
            allowPast={config.allowPast}
            allowFuture={config.allowFuture}
          />
          <TimeChoose
            visible={dateValue.shiftCode}
            title="Từ"
            keyValue="timeFrom"
            dateValue={moment(dateValue.timeFrom || new Date()).toDate()}
            stepTime={config.stepTime || 30}
            onChooseTime={onChangeTime}
          />
          <TimeChoose
            visible={dateValue.shiftCode}
            title="Đến"
            keyValue="timeTo"
            dateValue={moment(dateValue.timeTo || new Date()).toDate()}
            stepTime={config.stepTime || 30}
            onChooseTime={onChangeTime}
          />
        </View>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataShift}
          extraData={[dataShift]}
          renderItem={renderItem}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ paddingBottom: deviceHeight / 3 }} />
          }
        />
      </View>
    </View>
  );
};
