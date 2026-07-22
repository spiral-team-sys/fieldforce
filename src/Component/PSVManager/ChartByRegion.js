import React, { useState, useEffect } from 'react';
import { View, Text, processColor } from 'react-native';
import { CombinedChart } from 'react-native-charts-wrapper';
import { PSVManagerSObyRegion } from '../../Controller/PSVManagerController';
const chartConfig = {
    legend: {
        enabled: true,
        textSize: 12,
        form: "SQUARE",
        formSize: 12,
        xEntrySpace: 10,
        yEntrySpace: 5,
        wordWrapEnabled: true,
        verticalAlignment: "TOP"
    },
    xAxis: {},
    yAxis: {
        left: {
            granularityEnabled: true,
            granularity: 10,
            valueFormatter: 'percent',
            valueFormatterPattern: '### %',
        },
        right: {
            granularityEnabled: false,
            granularity: 100,
            axisMinimum: 0,
        }
    },
    marker: {
        enabled: true,
        markerColor: processColor('#f97122'),
        textColor: processColor('white'),
        markerFontSize: 14,
    },
    data: { barData: {}, lineData: {} }
}
export const ChartByRegion = ({ chartdata }) => {
    const [_xAxis, setxAxis] = useState({});
    const [_data, setData] = useState({})
    useEffect(() => {
        handlePress();
        return () => false
    }, [chartdata])
    handlePress = async () => {
        //Set data
        var arrTarget = [];
        var arrActual = [];
        var arrPercent = [];
        var ChartColumn = [];
        var chartcol = chartdata.length;
        await chartdata?.forEach(element => {
            arrTarget.push(element.target);
            arrActual.push(element.actual);
            arrPercent.push(element.percent);
            ChartColumn.push(element.lableName.toString());
        });

        await setxAxis({
            valueFormatter: ChartColumn,
            granularityEnabled: true,
            granularity: 1,
            axisMaximum: chartcol,
            axisMinimum: 0,
            centerAxisLabels: true
        })
        await setData({
            lineData: {
                dataSets: [{
                    values: arrPercent,
                    label: 'Percent',
                    centerAxisLabels: false,
                    config: {
                        colors: [processColor('green')],
                        mode: "CUBIC_BEZIER",
                        drawCircles: true,
                        lineWidth: 2,
                        valueFormatterPattern: '#,## %',
                        axisDependency: "RIGHT",
                    },
                }],
            },
            barData: {
                dataSets: [
                    {
                        values: arrTarget,
                        label: 'Target',
                        config: {
                            drawValues: false,
                            colors: [processColor('#ff8770')],
                        }
                    }, {
                        values: arrActual,
                        label: 'Actual',
                        config: {
                            drawValues: false,
                            colors: [processColor('#4082ed')],
                        }
                    }
                ],
                config: {
                    barWidth: 0.4,
                    group: {
                        fromX: 0,
                        groupSpace: 0.1,
                        barSpace: 0,
                    },
                }
            },
        })
    }
    return (
        <View style={{ height: 330,marginBottom:7}}>
            <Text style={{  padding: 5, color: '#1557c1', fontSize: 16, textAlign: 'center', fontWeight: 'bold', }}>SellOut By Region</Text>
            <CombinedChart
                style={{ width: '100%', height: '100%' }}
                xAxis={_xAxis}
                chartBackgroundColor={processColor('white')}
                data={_data}
                animation={{ durationY: 1000 }}
                legend={chartConfig.legend}
                highlights={chartConfig.highlights}
                marker={chartConfig.marker} />
        </View>
    );
}