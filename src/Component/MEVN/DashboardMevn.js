import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Divider } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { Capitalize, deviceHeight } from '../../Core/Utility';

export const DashboardMevn = ({ data }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const details = JSON.parse(data?.Detail || '[]');
  useEffect(() => {
    return () => false;
  }, [data]);
  return (
    <View
      style={{ borderRadius: 10, flex: 1, backgroundColor: appcolor.light }}
    >
      <Text
        style={{
          marginLeft: 12,
          marginTop: 7,
          color: appcolor.greydark,
          fontWeight: '800',
        }}
      >
        Doanh số bán hàng {Capitalize(data.Type || '')}
      </Text>
      <View
        style={{
          justifyContent: 'space-around',
          flexDirection: 'row',
          flexGrow: 1,
          borderRadius: 10,
          padding: 7,
          margin: 12,
          backgroundColor: appcolor.surface,
        }}
      >
        <View style={{ alignItems: 'center', flexGrow: 1 }}>
          <Text
            style={{ fontWeight: '600', fontSize: 20, color: appcolor.dark }}
          >
            {data.Target}
          </Text>
          <Text style={{ fontSize: 16, color: appcolor.dark }}>Chỉ tiêu</Text>
        </View>
        <View style={{ width: 0.3, backgroundColor: appcolor.grey }} />
        <View style={{ alignItems: 'center', flexGrow: 1 }}>
          <Text
            style={{ fontWeight: '600', fontSize: 20, color: appcolor.dark }}
          >
            {data.Actual}
          </Text>
          <Text style={{ fontSize: 16, color: appcolor.dark }}>Đã đạt</Text>
        </View>
        <View style={{ width: 0.3, backgroundColor: appcolor.grey }} />
        <View style={{ alignItems: 'center', flexGrow: 1 }}>
          <Text
            style={{ fontWeight: '600', fontSize: 20, color: appcolor.dark }}
          >
            {data.Percent || '-'}
          </Text>
          <Text style={{ fontSize: 16, color: appcolor.dark }}>Tỷ lệ (%)</Text>
        </View>
      </View>
      {/* <Divider /> */}
      <View style={{ padding: 7, backgroundColor: appcolor.light }}>
        {details.map((value, index) => {
          return (
            <View style={{ marginLeft: 7 }} key={index}>
              <Text
                style={{
                  color: appcolor.dark,
                  fontSize: 10,
                  fontWeight: '600',
                }}
              >
                {value?.Category || ''}
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 7 }}>
                <Text
                  style={{
                    flexGrow: 1,
                    color: appcolor.dark,
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                >
                  {value.Target}
                </Text>
                <Text
                  style={{
                    flexGrow: 1,
                    color: appcolor.dark,
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                >
                  {value.Actual}
                </Text>
                <Text
                  style={{
                    flexGrow: 1,
                    color: appcolor.dark,
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                >
                  {value.Percent}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
