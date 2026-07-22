import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, Platform, StyleSheet, View, processColor } from "react-native";
import { useSelector } from "react-redux";
import { LineChart } from "react-native-charts-wrapper";
import { colorDashboardHex } from "../../../Core/Helper";
import { deviceHeight, deviceWidth } from "../../../Themes/AppsStyle";
import LegendCustom from "./LegendCustom";
import _ from 'lodash';

export const LineChartView = ({ item }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [isLoading, setLoading] = useState(true);
    const [chartSetting, setChartSetting] = useState({});
    const [filter, _setFilter] = useState({ keyValue: null, keyName: null });
    const [_mutate, setMutate] = useState(false)

    const LoadData = async () => {
        await setLoading(true);
        const sumByWeek = _.chain(item)
            .flatMap('dataByWeek')
            .groupBy('label')
            .map((weeklyData, label) => ({
                label: label,
                totalValue: _.sumBy(weeklyData, 'sumValue')
            })).value();

        const xAxisLabels = sumByWeek.map(d => `${d.label} (${d.totalValue})`);
        const chartDataSets = item.map((dataSet, index) => {
            const isSelected = !filter.keyValue || filter.keyValue === dataSet.CompetitorId;
            const values = dataSet.dataByWeek.map(d => ({ y: d.value }));
            const lineColor = isSelected ? (dataSet?.ColorDashboard || colorDashboardHex[index]) : appcolor.surface;
            return {
                keyTable: dataSet.CompetitorId,
                keyTableName: dataSet.CompetitorName,
                label: dataSet.label,
                values: values,
                originalColor: lineColor,
                config: {
                    valueFormatter: `##.#'%'`,
                    color: processColor(lineColor),
                    colorHex: lineColor,
                    drawValues: filter.keyValue === dataSet.CompetitorId,
                    lineWidth: 2,
                    valueTextSize: 11,
                    valueTextColor: processColor(appcolor.blacklight),
                    drawCircleHole: false,
                    circleRadius: 3,
                    circleColor: processColor(lineColor),
                    drawCircles: true,
                    mode: 'CUBIC_BEZIER'
                }
            };
        });
        setChartSetting({
            legend: { enabled: false },
            data: { dataSets: chartDataSets },
            xAxis: {
                valueFormatter: xAxisLabels,
                position: 'BOTTOM',
                granularityEnabled: true,
                granularity: 1,
                textColor: processColor(appcolor.dark),
                textSize: 10,
                drawGridLines: false,
                axisLineColor: processColor(appcolor.grayLight),
                axisLineWidth: 1,
            },
            yAxis: {
                left: {
                    textColor: processColor(appcolor.dark),
                    textSize: 8,
                    gridColor: processColor(appcolor.grayLight),
                    valueFormatter: "#'%'"
                },
                right: { enabled: false }
            },
            description: { text: '' },
        });

        await setLoading(false);
    };

    const handlerSelectLine = async (item) => {
        const value = filter.keyValue == item.keyTable ? null : item.keyTable;
        const name = filter.keyValue == item.keyTable ? null : item.keyTableName;
        filter.keyValue = value;
        filter.keyName = name;
        setMutate(e => !e)
        DeviceEventEmitter.emit('reload_table_products', filter);
    }
    useEffect(() => {
        LoadData();
    }, [item, filter.keyValue]);

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', minHeight: deviceHeight / 3.5, margin: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, borderRadius: 8, backgroundColor: appcolor.light, overflow: 'hidden' },
        chartView: { flex: 1, minHeight: 200 },
        dashboardTitle: { fontSize: 15, fontWeight: Platform.OS == 'ios' ? '600' : '700', color: appcolor.dark, width: '100%', textAlign: 'center', padding: 8 },
        detailMain: { width: '100%', height: deviceHeight / 1.8, padding: 8 },
        titlePageDetail: { fontSize: 16, fontWeight: '700', color: appcolor.highlightDate, textAlign: 'center', padding: 8 },
        titleHeadItem: { color: appcolor.primary, fontSize: 14, fontWeight: '700', fontStyle: 'italic', padding: 8, paddingBottom: 0, textDecorationLine: 'underline' },
        titleItem: { color: appcolor.dark, fontSize: 13, fontWeight: '500', textAlign: 'center' },
        itemContainer: { width: '100%' },
        itemView: { flexDirection: 'row', },
        itemContentView: { width: (deviceWidth / 2) - 16, margin: 8, alignSelf: 'center' }
    });
    return (
        <View style={styles.mainContainer}>
            {!isLoading && !_.isEmpty(chartSetting) &&
                <LineChart
                    style={styles.chartView}
                    data={chartSetting.data}
                    chartDescription={chartSetting.description}
                    legend={chartSetting.legend}
                    xAxis={chartSetting.xAxis}
                    yAxis={chartSetting.yAxis}
                    animation={{ durationY: 0 }}
                    drawGridBackground={false}
                    drawBorders={false}
                    borderColor={processColor(appcolor.grayLight)}
                    touchEnabled={true}
                    dragEnabled={true}
                    scaleEnabled={true}
                    pinchZoom={false}
                    doubleTapToZoomEnabled={false}
                    extraOffsets={{ left: 0, top: 8, right: 32, bottom: 8 }}
                />
            }
            <LegendCustom legend={chartSetting?.data?.dataSets} selectedValue={filter.keyValue} onSelectLine={handlerSelectLine} />
        </View>
    );
}