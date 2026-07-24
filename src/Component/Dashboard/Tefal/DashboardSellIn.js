import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, processColor } from 'react-native';
import { DataSummary } from '../../../Controller/DashboardController';
import { deviceHeight } from '../../../Core/Utility';
import { useSelector } from 'react-redux';
import { Text } from '@rneui/base';
import { IconAnimation } from '../../../Control/IconAnimation/IconAnimation';
import _ from 'lodash';
import { BarChart } from 'react-native-charts-wrapper';

export const DashboardSellInTF = ({
  navigation,
  typeDashboard,
  onTitleResolved,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataSellIn, setDataSellIn] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [itemChart, setItemChart] = useState({});

  const LoadData = async () => {
    await setLoading(true);
    await DataSummary(typeDashboard, async mData => {
      await setDataSellIn(mData);
      await configView(mData);
    });
    await setLoading(false);
  };
  const configView = async data => {
    const chartName = data[0]?.chartName || `Số bán (SellIn)`;
    const pageName = data[0]?.pageName || 'dashboardDetail';
    const actualValue = _.map(data, 'actual');
    const targetValue = _.map(data, 'target');
    const confirmValue = _.map(data, 'confirm');
    const xAxisValue = _.map(data, 'xAxis');
    const axisMaximum = data.length;

    const legend = {
      enabled: true,
      textSize: 10,
      form: 'CIRCLE',
      formSize: 10,
      xEntrySpace: 10,
      yEntrySpace: 5,
      wordWrapEnabled: true,
      horizontalAlignment: 'RIGHT',
      textColor: processColor(appcolor.dark),
    };
    const xAxis = {
      valueFormatter: xAxisValue,
      granularityEnabled: true,
      granularity: 1,
      axisMaximum: axisMaximum,
      axisMinimum: 0,
      centerAxisLabels: true,
      drawGridLines: false,
      position: 'BOTTOM',
      textSize: 9,
      xOffset: 0,
      textColor: processColor(appcolor.dark),
    };
    const yAxis = {
      zeroLine: { enabled: true },
      limitLines: [{ limit: 1 }],
      left: { drawGridLines: false, enabled: false },
      right: { drawGridLines: false, enabled: false },
    };
    const dataChart = {
      dataSets: [
        {
          values: targetValue,
          label: 'Target',
          config: {
            drawValues: true,
            valueTextColor: processColor(appcolor.dark),
            colors: [processColor('#336699')],
          },
        },
        {
          values: actualValue,
          label: 'Actual',
          config: {
            drawValues: true,
            valueTextColor: processColor(appcolor.dark),
            colors: [processColor('#FFAC1C')],
          },
        },
        {
          values: confirmValue,
          label: 'Confirm',
          config: {
            drawValues: true,
            valueTextColor: processColor(appcolor.dark),
            colors: [processColor('#6ec793')],
          },
        },
      ],
      config: {
        barWidth: 0.3,
        group: {
          fromX: 0,
          groupSpace: 0.1,
          barSpace: 0,
        },
      },
    };

    await setItemChart({
      chartName: chartName,
      pageName: pageName,
      legend: legend,
      xAxis: xAxis,
      yAxis: yAxis,
      dataChart: dataChart,
    });
  };
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  useEffect(() => {
    if (typeof onTitleResolved === 'function' && itemChart?.chartName) {
      onTitleResolved(itemChart.chartName);
    }
  }, [itemChart?.chartName, onTitleResolved]);
  const styles = StyleSheet.create({
    mainContainer: {
      maxHeight: (deviceHeight / 2) * 0.7 - 60,
      padding: 5,
      paddingTop: 10,
    },
    actionSync: {
      width: 36,
      height: 36,
      borderRadius: 22,
      borderWidth: 0.3,
      borderColor: appcolor.dark,
      position: 'absolute',
      end: 0,
      top: 0,
      zIndex: 10,
      elevation: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isLoading}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={LoadData}
        style={styles.actionSync}
      >
        <SpiralIconAnimation
          isLoop={isLoading}
          sourceIcon={require('../../../Themes/lotties/sync_load.json')}
        />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ width: '100%' }}
        onPress={() =>
          navigation.navigate(itemChart.pageName, {
            typeDashboard: typeDashboard,
          })
        }
      >
        <View
          style={{ width: '100%', minHeight: deviceHeight / 4.5, padding: 8 }}
        >
          <BarChart
            style={{ flex: 1 }}
            xAxis={itemChart.xAxis}
            yAxis={itemChart.yAxis}
            data={itemChart.dataChart}
            legend={itemChart.legend}
            marker={{ enabled: false }}
            pinchZoom={false}
            borderWidth={1}
            doubleTapToZoomEnabled={false}
            drawHighlightArrow={false}
            drawBarShadow={false}
            drawValueAboveBar={false}
            chartDescription={{ textSize: 0, text: ' ' }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
