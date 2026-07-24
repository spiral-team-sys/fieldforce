import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import { Divider } from '@rneui/base';
import { useSelector } from 'react-redux';
import { DashboardDetailSellin } from './DashboardDetailSellin';
import { Modal } from 'react-native';
import { DashboardDetailSynthesis } from './DashboardDetailSynthesis';

export const DashboardSynthesis = ({ info }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [viewDetail, setViewDetail] = useState(false);

  return (
    <TouchableOpacity onPress={() => setViewDetail(e => !e)}>
      <View
        style={{
          backgroundColor: appcolor.surface,
          padding: 8,
          borderRadius: 10,
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SpiralIcon
            type="font-awesome-6"
            color={appcolor.info}
            name="chart-bar"
            size={23}
          />
          <Text
            style={{
              marginEnd: 8,
              color: appcolor.dark,
              marginStart: 8,
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            {' '}
            {info !== null ? info.chartName || 'Thống kê tổng hợp' : ''}
          </Text>
        </View>
        {/* <View style={{ marginTop: 16 }}>
                    <Text style={{ fontSize: 15, color: appcolor.dark, paddingTop: 5, paddingBottom: 5 }}>Thống kê tổng hợp</Text>
                </View> */}
      </View>
      <Modal visible={viewDetail}>
        <DashboardDetailSynthesis
          title={info.chartName}
          dataSummary={JSON.parse(info.detailData)}
          dataHeader={JSON.parse(info.chartData)}
          onClose={() => setViewDetail(false)}
        />
      </Modal>
    </TouchableOpacity>
  );
};
