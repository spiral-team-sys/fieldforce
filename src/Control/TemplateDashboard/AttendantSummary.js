import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Avatar, Icon, Text } from '@rneui/themed';
import _ from 'lodash';
import Carousel from 'react-native-snap-carousel';
import { deviceHeight, deviceWidth } from '../../Core/Utility';
import { PercentView } from '../PercentView';
export const AttendantSummary = ({ appcolor, dataAttendant, navigation }) => {
  // useEffect(() => {
  //     console.log(dataAttendant, "AttendantSummary")
  // }, [])
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={`I01T_${index}`}
        onPress={() => navigation.navigate('attendanthistory')}
      >
        <View style={{ width: '100%', height: '100%', padding: 16 }}>
          <Text
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: 15,
              fontWeight: '700',
              color: appcolor.dark,
            }}
          >
            {item.dashboardName || 'Chấm công'} {item.titleName}
          </Text>
          <View
            style={{
              width: '100%',
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: deviceWidth / 2.3,
                height: deviceHeight / 10,
                backgroundColor: appcolor.success,
                borderRadius: 12,
                alignItems: 'center',
                marginEnd: 8,
                opacity: 0.82,
              }}
            >
              {/* <Avatar title='T' rounded titleStyle={{ color: appcolor.success }}
                                containerStyle={{ backgroundColor: appcolor.light, top: -16 }} /> */}
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 32,
                  fontWeight: '800',
                  top: 7,
                  color: appcolor.light,
                }}
              >
                {item.target || 0}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: appcolor.success,
                  bottom: -20,
                  minWidth: '70%',
                  zIndex: 14,
                  backgroundColor: appcolor.light,
                  borderRadius: 20,
                  padding: 3,
                }}
              >
                {item.lTarget || 'Kế hoạch'}
              </Text>
            </View>
            <View
              style={{
                width: deviceWidth / 2.3,
                height: deviceHeight / 10,
                backgroundColor: appcolor.warning,
                borderRadius: 12,
                alignItems: 'center',
                marginStart: 8,
                opacity: 0.82,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 32,
                  top: 7,
                  fontWeight: '800',
                  color: appcolor.light,
                  paddingBottom: 8,
                }}
              >
                {item.actual || 0}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: appcolor.dark,
                  bottom: -12,
                  minWidth: '70%',
                  zIndex: 14,
                  backgroundColor: appcolor.light,
                  borderRadius: 20,
                  padding: 3,
                }}
              >
                {item.lActual || 'Thực hiện'}
              </Text>
            </View>
          </View>
          <PercentView target={item.target || 100} actual={item.actual || 0} />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
      <Carousel
        data={dataAttendant}
        renderItem={renderItem}
        sliderWidth={deviceWidth}
        itemWidth={deviceWidth}
      />
    </View>
  );
};
