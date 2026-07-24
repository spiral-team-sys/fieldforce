import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';
import { processColor } from 'react-native';
import { deviceHeight, deviceWidth, type } from '../../../Core/Utility';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../../Controller/DashboardController';
import { IconAnimation } from '../../../Control/IconAnimation/IconAnimation';
import { Icon } from '@rneui/base';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const DashboardSellOutByWeek = ({ navigation, viewHeight, info }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { appcolor } = useSelector(state => state.GAppState);

  const LoadData = async () => {
    try {
      setLoading(true);
      if (info) {
        setData(JSON.parse(info.chartData));
      } else {
        await DataSummary(type.SellOutByWeek, async mData => {
          setData(mData);
        });
      }
    } catch (error) {
      console.error('Error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    LoadData();
  }, []);

  const screenWidth =
    viewHeight != undefined && viewHeight > 0 ? deviceWidth - 16 : deviceWidth;
  const chartHeight =
    viewHeight != undefined && viewHeight > 0
      ? viewHeight - 40
      : (deviceHeight / 2) * 0.7 - 60;
  const calculateBarWidth = () => {
    const dataLength = data.length;
    const isShowingAll = !data?.[0]?.isHideTarget && !data?.[0]?.isHideConfirm;

    if (dataLength <= 4) return 0.8;
    if (dataLength <= 7) return isShowingAll ? 0.35 : 0.6;
    if (dataLength <= 10) return isShowingAll ? 0.3 : 0.4;
    return isShowingAll ? 0.25 : 0.3;
  };
  const calculateSpacing = () => {
    const dataLength = data.length;
    const isShowingAll = !data?.[0]?.isHideTarget && !data?.[0]?.isHideConfirm;

    if (isShowingAll) {
      return { groupSpace: 0, barSpace: 0 };
    }

    if (dataLength <= 4) return { groupSpace: 0.3, barSpace: 0.1 };
    if (dataLength <= 7) return { groupSpace: 0.15, barSpace: 0.2 };
    if (dataLength <= 10) return { groupSpace: 0.1, barSpace: 0.05 };
    return { groupSpace: 0.05, barSpace: 0.03 };
  };

  const spacing = calculateSpacing();
  const barWidth = calculateBarWidth();

  const xAxis = {
    valueFormatter: data.map(item => item.xAxis || ''),
    granularityEnabled: true,
    granularity: 1,
    axisMaximum: data.length,
    axisMinimum: 0,
    centerAxisLabels: true,
    drawGridLines: false,
    position: 'BOTTOM',
    textSize: data.length > 7 ? 8 : 10,
    textColor: processColor('black'),
    fontFamily: 'System',
    labelCount: data.length,
    labelRotationAngle: data.length > 7 ? -45 : 0,
    avoidFirstLastClipping: true,
  };

  const yAxis = {
    zeroLine: { enabled: true },
    limitLines: [{ limit: 1 }],
    left: {
      drawGridLines: true,
      enabled: true,
      gridColor: processColor('#ECEFF1'),
      gridLineWidth: 0.5,
      textColor: processColor('#78909C'),
      textSize: 10,
      axisLineColor: processColor('#ECEFF1'),
      axisLineWidth: 1,
      gridDashedLine: { lineLength: 5, spaceLength: 5 },
    },
    right: { drawGridLines: false, enabled: false },
  };

  const chartData = {
    dataSets: [
      {
        values: data.map(item => ({ y: item.target || 0 })),
        label: 'Target',
        config: {
          drawValues: true,
          valueTextColor: processColor(
            data?.[0]?.isHideTarget ? 'transparent' : 'black',
          ),
          colors: [
            processColor(data?.[0]?.isHideTarget ? 'transparent' : '#336699'),
          ],
          valueFormatter: '#.#',
          valueTextSize: 10,
        },
      },
      {
        values: data.map(item => ({ y: item.actual || 0 })),
        label: 'Actual',
        config: {
          drawValues: true,
          valueTextColor: processColor('black'),
          colors: [processColor('#FFAC1C')],
          valueFormatter: '#.#',
          valueTextSize: 10,
        },
      },
      {
        values: data.map(item => ({ y: item.confirm || 0 })),
        label: 'Confirm',
        config: {
          drawValues: true,
          valueTextColor: processColor(
            data?.[0]?.isHideConfirm ? 'transparent' : 'black',
          ),
          colors: [
            processColor(data?.[0]?.isHideConfirm ? 'transparent' : '#6ec793'),
          ],
          valueFormatter: '#.#',
          valueTextSize: 10,
        },
      },
    ],
    config: {
      barWidth: 0.25,
      group: {
        fromX: 0,
        groupSpace: 0.2,
        barSpace: 0,
      },
    },
  };

  const legend = {
    enabled: true,
    textSize: 12,
    form: 'CIRCLE',
    formSize: 12,
    xEntrySpace: 15,
    yEntrySpace: 5,
    wordWrapEnabled: true,
    horizontalAlignment: 'RIGHT',
    verticalAlignment: 'TOP',
    textColor: processColor('#37474F'),
    fontFamily: 'System',
    custom: {
      colors: chartData.dataSets
        .filter(
          dataset =>
            (dataset.label !== 'Target' || !data?.[0]?.isHideTarget) &&
            (dataset.label !== 'Confirm' || !data?.[0]?.isHideConfirm),
        )
        .map(dataset => dataset.config.colors[0]),
      labels: chartData.dataSets
        .filter(
          dataset =>
            (dataset.label !== 'Target' || !data?.[0]?.isHideTarget) &&
            (dataset.label !== 'Confirm' || !data?.[0]?.isHideConfirm),
        )
        .map(dataset => dataset.label),
    },
  };

  const pageName = data[0]?.pageName || 'dashboardDetail';
  const chartName = data[0]?.chartName || 'Số bán (SellOut)';

  const styles = StyleSheet.create({
    actionSync: {
      backgroundColor: appcolor.surface,
      borderRadius: 50,
      borderWidth: 0.3,
      borderColor: appcolor.dark,
      padding: 8,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainContainer: {
      flex: 1,
      width: screenWidth,
      backgroundColor: appcolor.light,
      height: chartHeight,
      padding: 16,
      borderRadius: 12,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    headerContainer: {
      width: '100%',
      height: '20%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    titleContainer: {
      flexDirection: 'row',
      width: '90%',
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: appcolor.dark,
      marginLeft: 12,
      flex: 1,
      textAlign: 'center',
    },
    chartIcon: {
      backgroundColor: appcolor.surface,
      padding: 8,
      borderRadius: 12,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noDataText: { color: appcolor.dark, fontSize: 14, fontWeight: '500' },
  });

  return (
    <TouchableOpacity
      style={styles.mainContainer}
      onPress={() => navigation.navigate(pageName)}
    >
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <View style={styles.chartIcon}>
            <SpiralIcon name="bar-chart" size={24} color={appcolor.primary} />
          </View>
          <Text style={styles.chartTitle}>{chartName}</Text>
        </View>

        <TouchableOpacity
          onPress={loading ? null : LoadData}
          style={styles.actionSync}
        >
          <SpiralIconAnimation
            isLoop={loading}
            sourceIcon={require('../../../Themes/lotties/sync_load.json')}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.noDataContainer}>
          <ActivityIndicator size="large" color={appcolor.primary} />
        </View>
      ) : data.length > 0 ? (
        <View style={{ flex: 1 }}>
          <BarChart
            animation={{
              durationX: 1500,
              durationY: 1500,
              easingX: 'EaseInOutQuart',
              easingY: 'EaseInOutQuart',
            }}
            style={{ flex: 1 }}
            xAxis={xAxis}
            yAxis={yAxis}
            data={chartData}
            legend={legend}
            marker={{ enabled: false }}
            pinchZoom={false}
            borderWidth={0}
            doubleTapToZoomEnabled={false}
            drawHighlightArrow={false}
            drawBarShadow={false}
            drawValueAboveBar={true}
            chartDescription={{
              textSize: 0,
              text: ' ',
            }}
          />
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default DashboardSellOutByWeek;
