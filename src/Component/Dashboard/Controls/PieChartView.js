import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, processColor } from 'react-native';
import { useSelector } from 'react-redux';
import { PieChart } from 'react-native-charts-wrapper';
import { colorDashboard } from '../../../Core/Helper';
import { deviceHeight, deviceWidth } from '../../../Themes/AppsStyle';
import _ from 'lodash';

export const PieChartView = ({
  item,
  handleSelect,
  listColor,
  isPercentValues = true,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [chartSetting, setChartSetting] = useState({});
  const [itemData, setItemData] = useState({});
  //
  const LoadData = async () => {
    await setLoading(true);
    await setItemData(item);
    const dataJson = item;
    const _totalValue = _.sumBy(item, 'sumValue');
    await setChartSetting({
      legend: {
        enabled: true,
        textSize: 11,
        form: 'CIRCLE',
        horizontalAlignment: 'CENTER',
        verticalAlignment: 'BOTTOM',
        orientation: 'HORIZONTAL',
        wordWrapEnabled: true,
        textColor: processColor(appcolor.dark),
      },
      data: {
        dataSets: [
          {
            label: '',
            values: dataJson,
            config: {
              colors: listColor || colorDashboard,
              valueTextSize: 12,
              valueTextColor: processColor(appcolor.dark),
              sliceSpace: 1,
              selectionShift: 8,
              // xValuePosition: 'OUTSIDE_SLICE',
              yValuePosition: 'OUTSIDE_SLICE',
              valueFormatter: isPercentValues ? "##'%'" : '##',
              valueLineColor: processColor(appcolor.dark),
              valueLinePart1Length: 0.6,
              highlightEnabled: true,
            },
          },
        ],
      },
      highlights: [{ x: 2 }],
      description: {
        text: '',
      },
      totalValue: _totalValue || 0,
    });
    await setLoading(false);
  };
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [item]);
  const styles = StyleSheet.create({
    mainContainer: {
      minHeight: deviceHeight / 3.5,
      margin: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      backgroundColor: appcolor.light,
    },
    chartView: { minHeight: 300 },
    dashboardTitle: {
      fontSize: 15,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
      color: appcolor.dark,
      width: '100%',
      textAlign: 'center',
      padding: 8,
    },
    detailMain: { width: '100%', height: deviceHeight / 1.8, padding: 8 },
    titlePageDetail: {
      fontSize: 16,
      fontWeight: '700',
      color: appcolor.highlightDate,
      textAlign: 'center',
      padding: 8,
    },
    titleHeadItem: {
      color: appcolor.primary,
      fontSize: 14,
      fontWeight: '700',
      fontStyle: 'italic',
      padding: 8,
      paddingBottom: 0,
      textDecorationLine: 'underline',
    },
    titleItem: {
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'center',
    },
    itemContainer: { width: '100%' },
    itemView: { flexDirection: 'row' },
    itemContentView: {
      width: deviceWidth / 2 - 16,
      margin: 8,
      alignSelf: 'center',
    },
  });
  return (
    <View style={styles.mainContainer}>
      {!isLoading && (
        <PieChart
          style={styles.chartView}
          chartBackgroundColor={processColor('transparent')}
          chartDescription={chartSetting.description}
          data={chartSetting.data}
          legend={chartSetting.legend}
          highlights={chartSetting.highlights}
          extraOffsets={{ left: 8, top: 8, right: 8, bottom: 8 }}
          animation={{
            durationX: 0,
            durationY: 2000,
            easingX: 'EaseInOutBack',
            easingY: 'EaseOutSine',
          }}
          entryLabelColor={processColor(appcolor.dark)}
          drawEntryLabels={false}
          rotationEnabled={false}
          rotationAngle={36}
          usePercentValues={isPercentValues}
          holeRadius={45}
          maxAngle={360}
          styledCenterText={{
            size: 14,
            color: processColor('#000'),
            text: `Tổng ${chartSetting.totalValue}`,
          }}
          onSelect={handleSelect ? handleSelect : null}
        />
      )}
    </View>
  );
};
