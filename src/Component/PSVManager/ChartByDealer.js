import React, { useState, useEffect } from 'react';
import { View, Text, processColor } from 'react-native';
import { CombinedChart } from 'react-native-charts-wrapper';
const chartConfig = {
    legend: {
        enabled: true,
        textSize: 12,
        form: "SQUARE",
        formSize: 12,
        xEntrySpace: 10,
        yEntrySpace: 0,
        wordWrapEnabled: true,
        verticalAlignment: "TOP"
    },
    xAxis: {},
    yAxis: {
        left: {
            granularityEnabled: true,
            granularity: 10,
            valueFormatterPattern: '### %'
        },
        right: {
            granularityEnabled: true,
            granularity: 100
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
export const ChartByDealer = ({ chartdata }) => {
    const [_xAxis, setxAxis] = useState({});
    const [_data, setData] = useState({});
    useEffect(() => {
        handlePress();
        return () => false;
    }, [chartdata])
    handlePress = async () => {
        var arrdata = [];
        var arrPercent = [];
        var ChartColumn = [];
        if (chartdata.length > 0) {
            var maxcol = chartdata.length;
            await chartdata.forEach(element => {
                arrdata.push({ y: [element.actual, element.target] });
                arrPercent.push(element.percent);
                ChartColumn.push(element.lableName);
            });
            await setxAxis({
                valueFormatter: ChartColumn,
                granularityEnabled: false,
                granularity: 1,
                axisMaximum: maxcol,
                axisMinimum: -1,
                textSize: 8,
                position: 'BOTTOM',
                labelRotationAngle: -90,
                centerAxisLabels: false
            })
            await setData({
                barData: {
                    dataSets: [{
                        values: arrdata,
                        label: '',
                        config: {
                            colors: [processColor('#4082ed'), processColor('#a5dcff')],
                            stackLabels: ['Actual', 'Target']
                        }
                    }],
                },
                lineData: {
                    dataSets: [{
                        values: arrPercent,
                        label: 'Pecent',
                        config: {
                            drawValues: true,
                            colors: [processColor('green')],
                            mode: "CUBIC_BEZIER",
                            drawCircles: true,
                            lineWidth: 1,
                            valueFormatterPattern: '### %',
                            axisDependency: "RIGHT",
                        }
                    }],
                },
            })
        }
    }
    return (
        <View style={{ height: 320, marginBottom: 7 }}>
            <Text style={{ padding: 5, color: '#1557c1', fontSize: 16, textAlign: 'center', fontWeight: 'bold', }}>SellOut By Dealer</Text>
            <CombinedChart
                chartBackgroundColor={processColor('white')}
                style={{ width: '100%', height: '100%' }}
                xAxis={_xAxis}
                data={_data}
                legend={chartConfig.legend}
                animation={{ durationY: 1000 }}
                highlights={chartConfig.highlights}
                marker={chartConfig.marker} />
        </View>

    );
}