import React, { useState, useEffect, Fragment } from 'react';
import { View, Text, processColor } from 'react-native';
import { useSelector } from 'react-redux';
import { CombinedChart } from 'react-native-charts-wrapper';
import { scaleSize } from '../../Themes/AppsStyle';

export const EmployeeSOTrend = ({ data }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [optionChart, setChart] = useState({});
  const processData = () => {
    const list = JSON.parse(data.detail || '[]');
    var _barData = [],
      _lineData = [],
      _colData = [];
    list?.forEach(value => {
      _barData.push({ y: [value.Quantity, value.Target || 0] });
      _lineData.push(value.Percent);
      _colData.push('T' + value.Month + ',' + value.Year);
    });
    let updateChart = {
      legend: {
        enabled: true,
        textSize: 12,
        form: 'SQUARE',
        textColor: processColor(appcolor.dark),
        formSize: 12,
        xEntrySpace: 10,
        yEntrySpace: 0,
        wordWrapEnabled: true,
        verticalAlignment: 'TOP',
      },
      xAxis: {},
      yAxis: {
        right: {
          granularityEnabled: true,
          granularity: 10,
          valueFormatterPattern: '### %',
        },
        left: {
          granularityEnabled: true,
          granularity: 10,
        },
      },
      marker: {
        enabled: true,
        textColor: processColor(appcolor.dark),
        markerColor: processColor(appcolor.primary),
        textSize: 12,
      },
      data: { barData: {}, lineData: {} },
    };
    updateChart.xAxis = {
      valueFormatter: _colData,
      granularityEnabled: false,
      granularity: 1,
      axisMaximum: 6,
      axisMinimum: -1,
      textSize: 8,
      drawGridLines: false,
      textColor: processColor(appcolor.dark),
      position: 'BOTTOM',
      // labelRotationAngle: -90,
      centerAxisLabels: false,
    };
    updateChart.data = {
      barData: {
        dataSets: [
          {
            values: _barData,
            label: '',
            colors: [processColor(appcolor.dark)],
            config: {
              colors: [
                processColor(appcolor.primary),
                processColor(appcolor.grey),
              ],
              stackLabels: ['Actual', 'Target'],
            },
          },
        ],
      },
      lineData: {
        dataSets: [
          {
            values: _lineData,
            label: 'Pecent',
            config: {
              drawValues: true,
              colors: [processColor(appcolor.info)],
              mode: 'CUBIC_BEZIER',
              drawCircles: true,
              lineWidth: 1,
              valueFormatterPattern: '### %',
              axisDependency: 'RIGHT',
            },
          },
        ],
      },
    };
    setChart(updateChart);
  };
  useEffect(() => {
    processData();
    return () => false;
  }, []);
  return (
    <Fragment>
      <Text
        style={{
          marginLeft: 12,
          padding: 7,
          fontSize: scaleSize(18),
          color: appcolor.dark,
          fontWeight: '600',
        }}
      >
        {data.groupNameVN}
      </Text>
      <View
        style={{
          height: 260,
          backgroundColor: appcolor.white,
          borderRadius: 12,
          margin: 7,
        }}
      >
        <CombinedChart
          chartBackgroundColor={processColor(appcolor.transparent)}
          legend={optionChart.legend}
          style={{ height: 240 }}
          xAxis={optionChart.xAxis}
          data={optionChart.data}
          animation={{ durationY: 1000 }}
          marker={optionChart.marker}
        />
      </View>
    </Fragment>
  );
};
