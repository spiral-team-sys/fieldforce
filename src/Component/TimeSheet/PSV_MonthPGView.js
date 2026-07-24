import moment from 'moment';
import React from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Badge } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../Core/Utility';
const dayWidth = deviceWidth / 7;
export const PSV_MonthPGView = ({ info, eData, gridColl, onPressDay }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const dayItem = ({ item, index }) => {
    return (
      <View
        key={`${index}$hiaj${item.workDate}`}
        style={{
          width: dayWidth,
          padding: 3,
          alignItems: 'center',
          opacity: item.shift === '' ? 0.5 : 1,
          backgroundColor:
            item.shift === ''
              ? appcolor.grey
              : item.color !== ''
              ? item.color
              : appcolor.light,
          borderBottomWidth: 1.2,
          borderBottomColor: appcolor.surface,
        }}
      >
        <TouchableOpacity onPress={() => onPressDay(item)}>
          {index < 7 && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
                color: appcolor.dark,
              }}
            >
              {moment(item.workDate, 'YYYY-MM-DD').format('dd')}
            </Text>
          )}
          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              textAlign: 'center',
              color: appcolor.dark,
            }}
          >
            {item.shift === ''
              ? moment(item.workDate, 'YYYY-MM-DD').format('DD/MM')
              : moment(item.workDate, 'YYYY-MM-DD').format('DD')}
          </Text>
          {item.shift !== '' && (
            <View style={{}}>
              <Badge
                value={item.shift}
                textStyle={{ color: appcolor.light }}
                badgeStyle={{ backgroundColor: appcolor.dark, borderWidth: 0 }}
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: '600',
                  color: appcolor.dark,
                }}
              >
                {item.totalTime}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: '600',
                  color: appcolor.dark,
                }}
              >
                {item.ot}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={{ backgroundColor: appcolor.light }}>
      {info.employeeCode && (
        <View style={{ padding: 12 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: appcolor.dark }}
          >
            {info.employeeCode}-{info.employeeName}
          </Text>
        </View>
      )}
      <View
        style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }}
      />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexGrow: 1, padding: 8 }}>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Ngày công chuẩn: {info.comWork || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Công thanh toán: {info.pcPaid || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Công thực tế: {info.pcWork || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Tăng ca: {info.weekOT || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Nghỉ tuần: {info.off || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Nghỉ phép: {info.al || 0}
          </Text>
        </View>
        <View style={{ flexGrow: 1, padding: 7 }}>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Nghỉ chế độ: {info.cd || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Nghỉ không lương: {info.ul || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            Sai giờ: {info.pcLate || 0}
          </Text>
          <Text
            style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
          >
            LLV Ko Chấm công: {info.ar || 0}
          </Text>
        </View>
      </View>
      <View
        style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }}
      />
      <FlatList
        data={eData}
        numColumns={gridColl}
        keyExtractor={(item, index) => item.workDate.toString()}
        renderItem={dayItem}
      />
    </View>
  );
};
