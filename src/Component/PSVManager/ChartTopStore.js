import React, { useState, useEffect } from 'react';
import {Text,View,processColor} from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';
import { PSVManagerSOTopStore } from '../../Controller/PSVManagerController';
const chartConfig = {
    legend: {
        enabled: false,
        textSize: 10,
        form: 'SQUARE',
        formSize: 10,
        xEntrySpace: 1,
        yEntrySpace: 2,
        formToTextSpace: 0,
        wordWrapEnabled: true,
        maxSizePercent: 0.5
    },
    highlights: [{ x: 3 }, { x: 6 }],
    data: {}, xAxis: {}
}
export const ChartTopStore = ({ chartdata }) => {
    const [_xAxis, setxAxis] = useState({});
    const [_data, setData] = useState({})
    useEffect(() => {
        handlePress();
    }, [])

    handlePress = async () => {
      
        var ChartValue = [];
        var ChartCols = [];
        await chartdata?.forEach(i => {
            ChartValue.push({ y: i.actual });
            ChartCols.push(i.lableName);
        });
        await setData({
            dataSets: [{
                values: ChartValue,
                label: 'Bar dataSet',
                config: {
                    color: processColor('#5997f9'),
                    barShadowColor: processColor('lightgrey'),
                    highlightAlpha: 90,
                    highlightColor: processColor('#c4ecff'),
                }
            }],
            config: {
                barWidth: 0.6,
            }
        })
        await setxAxis({
            valueFormatter: ChartCols,
            granularityEnabled: true,
            granularity: 1,
            position: 'BOTTOM',
            textSize: 7,
            labelRotationAngle: 90,
            centerAxisLabels: false,
        })
    };

    return (
        <View style={{ height: 320,marginBottom:12 }}>
            <Text style={{ backgroundColor: 'white', padding: 5, color: '#1557c1', fontSize: 16, textAlign: 'center', fontWeight: 'bold', }}>Sellout top 10 Store</Text>
            <BarChart
                style={{ width: '100%', height: '100%' }}
                data={_data}
                xAxis={_xAxis}
                animation={{ durationY: 2000 }}
                chartBackgroundColor={processColor('white')}
                legend={chartConfig.legend}
                gridBackgroundColor={processColor('#ffffff')}
                visibleRange={{ x: { min: 5, max: 5 } }}
                drawBarShadow={false}
                drawValueAboveBar={true}
                drawHighlightArrow={true}
                highlights={chartConfig.highlights}
            />
        </View>

    );
}
