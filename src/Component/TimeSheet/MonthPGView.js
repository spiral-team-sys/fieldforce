import moment from 'moment';
import React from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Badge } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../Core/Utility';
const dayWidth = deviceWidth / 7;
export const MonthPGView = ({ info, eData, gridColl, onPressDay }) => {
  const dataSummaryDetail = JSON.parse(info.summaryDetail || '[]') || [];
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
          borderRightWidth: 1.2,
          borderRightColor: appcolor.surface,
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
            {/* {item.shift === '' ? moment(item.workDate, 'YYYY-MM-DD').format('DD/MM') : moment(item.workDate, 'YYYY-MM-DD').format('DD')} */}
            {moment(item.workDate, 'YYYY-MM-DD').format('DD/MM')}
          </Text>
          {
            // item.shift !== '' &&
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
          }
        </TouchableOpacity>
      </View>
    );
  };
  const renderItem = (item, index) => {
    return (
      <View
        key={`dd_ei_${index}`}
        style={{
          width: deviceWidth / 2 - 8,
          padding: 3,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomColor: appcolor.grey,
          borderBottomWidth: 0.3,
        }}
      >
        {/* <Text style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}>
                    {`${item.Name}: `} <Text style={{ color: appcolor.bluenavylight, fontSize: 12, fontWeight: '700' }}>{item.Value || 0}</Text>
                </Text> */}
        <Text
          style={{
            color: appcolor.dark,
            fontSize: 12,
            fontWeight: '700',
            width: '70%',
          }}
        >
          {`${item.Name}: `}
        </Text>
        <Text
          style={{
            width: '30%',
            color: appcolor.bluenavylight,
            fontSize: 12,
            fontWeight: '700',
            paddingStart: 8,
            textAlign: 'center',
          }}
        >
          {item.Value || 0}
        </Text>
      </View>
    );
  };
  return (
    <View style={{ backgroundColor: appcolor.light, width: deviceWidth }}>
      {info.employeeCode && (
        <View style={{ padding: 10 }}>
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
      {dataSummaryDetail.length > 0 ? (
        <View style={{ width: deviceWidth }}>
          <ScrollView
            scrollEnabled={false}
            horizontal={false}
            contentContainerStyle={{
              width: deviceWidth,
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {dataSummaryDetail?.map((item, index) => {
              return renderItem(item, index);
            })}
          </ScrollView>
        </View>
      ) : (
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
              Thực tế: {info.pcWork || 0}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
            >
              Nghỉ: {info.al || 0}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
            >
              Ngày tính công: {info.pcPaid || 0}
            </Text>
          </View>
          <View style={{ flexGrow: 1, padding: 7 }}>
            <Text
              style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
            >
              LLV Ko Chấm công: {info.ar || 0}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
            >
              Nghỉ lễ: {info.gov || 0}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
            >
              Sai giờ: {info.pcLate || 0}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontSize: 12, fontWeight: '700' }}
            >
              Tăng ca: {info.weekOT || 0}
            </Text>
          </View>
        </View>
      )}
      <View
        style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }}
      />

      <View style={{ width: deviceWidth }}>
        <FlatList
          data={eData}
          numColumns={gridColl}
          keyExtractor={(item, _index) => item.workDate.toString()}
          renderItem={dayItem}
        />
      </View>
    </View>
  );
};
