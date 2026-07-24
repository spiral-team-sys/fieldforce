import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity, processColor } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { scaleSize } from '../../../Themes/AppsStyle';
import { deviceHeight, deviceWidth } from '../../../Core/Utility';
import { DataSummary } from '../../../Controller/DashboardController';
import { IconAnimation } from '../../../Control/IconAnimation/IconAnimation';

export const DashboardSellOutToshiba = ({
  navigation,
  typeDashboard,
  viewHeight,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataSellOut, setDataSellOut] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [item, setItem] = useState({ data: [], percentValue: '0%' });
  //
  const LoadData = async () => {
    await setLoading(true);
    await DataSummary(typeDashboard, async mData => {
      await setItem({ data: [], percentValue: '0%' });
      await setDataSellOut({});
      if (mData.length > 0) {
        await setDataSellOut(mData[0] || {});
        await configView(mData[0]);
      }
    });
    await setLoading(false);
  };
  const configView = async dataItem => {
    const target =
      dataItem.targetPercent < dataItem.actualPercent
        ? 0
        : dataItem.targetPercent - dataItem.actualPercent;
    const data = {
      dataSets: [
        {
          values: [
            { value: dataItem.actualPercent || 0 },
            { value: target || 0 },
          ],
          config: {
            colors: [processColor('#085294'), processColor('#ff6347')],
            valueTextColor: processColor('transparent'),
          },
          label: '',
        },
      ],
    };
    const percentValue =
      `${dataItem.percentValue || 0}%` ||
      `${(dataItem.actualPercent / dataItem.targetPercent).toFixed(2) * 100}%`;
    await setItem({ data: data, percentValue: percentValue });
  };
  const showDetailData = () => {
    navigation.navigate(dataSellOut.pageName || 'dashboardDetail');
  };
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, padding: 8, minHeight: deviceHeight / 5 },
    titleDashboard: {
      width: '80%',
      fontSize: 14,
      fontWeight: '700',
      color: appcolor.blacklight,
    },
    headerContent: { flexDirection: 'row', alignItems: 'center' },
    actionSync: {
      borderRadius: 30,
      borderWidth: 0.3,
      borderColor: appcolor.dark,
      padding: 5,
      position: 'absolute',
      end: 0,
      backgroundColor: appcolor.surface,
    },
  });

  if (isLoading) {
    return <View></View>;
  } else {
    return (
      <TouchableOpacity
        onPress={showDetailData}
        style={{ maxHeight: viewHeight - 40, padding: 8 }}
      >
        <View style={styles.mainContainer}>
          <View style={styles.headerContent}>
            <SpiralIcon
              name="chart-pie"
              type="font-awesome-5"
              size={18}
              color={appcolor.blacklight}
              style={{ padding: 5 }}
            />
            <Text style={styles.titleDashboard}>
              {dataSellOut.cname || 'Thống kê số bán (Sell Out)'}
            </Text>
            <TouchableOpacity
              onPress={isLoading ? null : LoadData}
              style={styles.actionSync}
            >
              <SpiralIconAnimation
                isLoop={isLoading}
                sourceIcon={require('../../../Themes/lotties/sync_load.json')}
              />
            </TouchableOpacity>
          </View>
          <View style={{ width: '100%', flexDirection: 'row' }}>
            {/* Detail Summary */}
            <View
              style={{
                width: '50%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: '100%', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: appcolor.dark,
                      padding: 5,
                    }}
                  >{`Target`}</Text>
                  <Text
                    style={{
                      fontSize: scaleSize(12),
                      fontWeight: '800',
                      color: appcolor.tomato,
                      marginStart: 8,
                    }}
                  >{`${dataSellOut.targetValue || 0}`}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: appcolor.dark,
                    padding: 5,
                  }}
                >{`Actual`}</Text>
                <Text
                  style={{
                    fontSize: scaleSize(12),
                    fontWeight: '700',
                    color: appcolor.info,
                    marginStart: 8,
                  }}
                >{`${dataSellOut.l1 || 'Số lượng'}: ${
                  dataSellOut.v1 || 0
                }`}</Text>
                <Text
                  style={{
                    fontSize: scaleSize(12),
                    fontWeight: '700',
                    color: appcolor.info,
                    marginStart: 8,
                  }}
                >{`${dataSellOut.l2 || 'Thành tiền'}: ${
                  dataSellOut.v2 || 0
                }`}</Text>
              </View>
            </View>
            {/* Dashboard PieChart */}
            <View style={{ width: '50%', alignItems: 'center' }}>
              {item.data !== null && Object.keys(item.data).length > 0 && (
                <PieChart
                  style={{
                    width: viewHeight * 0.65,
                    height: viewHeight * 0.65,
                  }}
                  logEnabled={true}
                  chartBackgroundColor={processColor('transparent')}
                  chartDescription={{ text: '' }}
                  data={item.data}
                  legend={{ enabled: false }}
                  extraOffsets={{ left: 5, top: 5, right: 5, bottom: 5 }}
                  entryLabelColor={processColor('transparent')}
                  entryLabelTextSize={20}
                  entryLabelFontFamily={'HelveticaNeue-Medium'}
                  styledCenterText={{
                    text: item.percentValue,
                    color: processColor('#d1380a'),
                    size: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                  centerTextRadiusPercent={100}
                  holeRadius={90}
                  maxAngle={360}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
};
