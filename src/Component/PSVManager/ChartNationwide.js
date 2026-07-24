import React, { PureComponent, useState, useEffect } from 'react';
import { View, processColor, Text } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
const chartConfig = {
  Percent: '0%',
  legend: {
    enabled: true,
    textSize: 16,
    color: '#1557c1',
    form: 'CIRCLE',
    horizontalAlignment: 'CENTER', //CENTER,LEFT,RIGHT
    verticalAlignment: 'TOP', //Canh lable
    //orientation: "VERTICAL",
    wordWrapEnabled: true,
  },
  data: {},
  highlights: [{ x: 2 }],
  description: {
    textSize: 12,
    textColor: processColor('white'),
  },
};
export const ChartNationwide = ({ chartdata }) => {
  //log
  const [_data, setData] = useState({});
  const [_percent, setPercent] = useState('');
  useEffect(() => {
    console.log(chartdata, 'd1');
    handlePress();
    return () => false;
  }, [chartdata]);
  handlePress = async () => {
    const item = (await chartdata.length) > 0 ? chartdata[0] : {};
    await setData({
      dataSets: [
        {
          values: [
            { value: item.target || 100, label: 'Target' },
            { value: item.actual || 0, label: 'Actual' },
          ],
          label: item?.lableName || 'No Sell',
          config: {
            colors: [processColor('#8bb6f9'), processColor('#2b67c4')],
            valueTextSize: 14,
            valueTextColor: processColor('#020202'),
            sliceSpace: 0,
            selectionShift: 13,
            valueFormatter: '#,###',
            valueLineColor: processColor('#020202'),
            valueLinePart1Length: 0,
          },
        },
      ],
    });
    await setPercent(item?.percentText || '0%');
  };
  return (
    <View style={{ width: '100%', height: 320, marginBottom: 7 }}>
      <PieChart
        style={{ width: '100%', height: '100%' }}
        logEnabled={true}
        animation={{ durationY: 1000 }}
        chartBackgroundColor={processColor('white')}
        chartDescription={chartConfig.description}
        data={_data}
        legend={chartConfig.legend}
        highlights={chartConfig.highlights}
        entryLabelColor={processColor('black')}
        entryLabelTextSize={14}
        drawEntryLabels={false}
        rotationAngle={45}
        usePercentValues={false}
        styledCenterText={{
          text: _percent,
          color: processColor('#d1380a'),
          size: 26,
        }}
        centerTextRadiusPercent={100}
        holeRadius={90}
        holeColor={processColor('#ffffff')}
        transparentCircleRadius={45}
        transparentCircleColor={processColor('#f0f0f088')}
        maxAngle={360}
      />
    </View>
  );
};
