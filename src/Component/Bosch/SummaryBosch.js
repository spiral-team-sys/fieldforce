import React, { useEffect, useState } from 'react';
import { processColor, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-charts-wrapper';
import { Button, Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { DataSummary } from '../../Controller/DashboardController';
import { deviceHeight } from '../Home';
import { formatNumber } from '../../Core/Helper';
import { LoadingView } from '../../Control/ItemLoading';
import { ConvertToInt } from '../../Core/Utility';
import { SellOutSummary } from '../../Control/TemplateDashboard/SellOutSummary';
import { SellOutSummaryByCate } from '../../Control/TemplateDashboard/SellOutByCate';
import { AttendantSummary } from '../../Control/TemplateDashboard/AttendantSummary';

const typeButton = {
    Menu: 'MENU',
    Attendant: 'ATTENDANT',
    SellOut: 'SELLOUT',
    SellIn: 'SELLIN',
    KPI5: 'KPI5',
    Target: 'TARGET',
    Routing: 'ROUTING'
}
export const SummaryBosch = ({ navigation, isLoading }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dashboardItem, setDashboardItem] = useState(typeButton.Attendant)
    const [dataAttendant, setDataAttendant] = useState([])
    const [dataSellOut, setDataSellOut] = useState({})
    const [dataSellIn, setDataSellIn] = useState([])
    const [dataKPI5, setDataKPI5] = useState([])
    const [dataRouting, setDataRouing] = useState({})
    const [dataTarget, setDataTarget] = useState([])
    const [dataMenu, setDataMenu] = useState([])
    const [isSellOutByCate, setSelloutByCate] = useState(false)

    const [dataWeekly, setDataWeekly] = useState([])
    const [dataMonthly, setDataMonthly] = useState([])

    const LoadMenu = async () => {
        await DataSummary(typeButton.Menu, async (mData) => {
            await setDataMenu(mData)
        })
    }

    const LoadDashboard = async (typeGroup) => {
        await setLoading(true)
        typeGroup == typeButton.Attendant &&
            await DataSummary(typeButton.Attendant, async (mData) => {
                await setDataAttendant(mData)
            });
        typeGroup == typeButton.SellOut &&
            await DataSummary(typeButton.SellOut, async (mData) => {
                // isByCate
                if (mData[0]?.isByCate == 1) {
                    await setDataSellOut(mData || [])
                    await setSelloutByCate(true)
                } else {
                    await setDataSellOut(mData[0] || {})
                    await setSelloutByCate(false)
                }
            });
        typeGroup == typeButton.SellIn &&
            await DataSummary(typeButton.SellIn, async (mData) => {
                await setDataSellIn(mData)
            });
        typeGroup == typeButton.KPI5 &&
            await DataSummary(typeButton.KPI5, async (mData) => {
                await setDataKPI5(mData)
            });
        typeGroup == typeButton.Target &&
            await DataSummary(typeButton.Target, async (mData) => {
                await setDataTarget(mData)
            });
        typeGroup == typeButton.Routing &&
            await DataSummary(typeButton.Routing, async (mData) => {
                await setDataRouing(JSON.parse(mData[0].chartData)[0])
            });
        await setLoading(false)
    }
    const handlerSelectDashboard = async (type) => {
        if (loading)
            return
        await setDashboardItem(type)
        await LoadDashboard(type)
    }
    useEffect(() => {
        const _load = LoadDashboard(typeButton.Attendant)
        return () => _load
    }, [typeButton])
    useEffect(() => {
        const _load = LoadMenu()
        return () => _load
    }, [isLoading])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        btnSelect: {
            backgroundColor: appcolor.light, borderTopRightRadius: 8, borderTopLeftRadius: 8,
            paddingStart: 8, paddingEnd: 8, borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0, marginBottom: 0,
        },
        btnNonSelect: {
            backgroundColor: appcolor.primary,
            padding: 5, borderWidth: 0, borderColor: appcolor.grayLight,
            paddingStart: 8, paddingEnd: 8, borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0, marginBottom: 0,
        },
        titleView: { fontSize: 13, fontWeight: '600', color: appcolor.primary },
        titleNonView: { fontSize: 13, fontWeight: '600', color: appcolor.dark },
        mainViewDashboard: { width: '100%', height: deviceHeight / 3.5, marginBottom: 12, }
    })
    const RenderButton = ({ }) => {
        const dataButtonMenu = dataMenu !== undefined && dataMenu !== null ? (dataMenu[0]?.menuList || '') : ''
        return (
            <ScrollView
                pagingEnabled
                horizontal
                style={{ flex: 1 }}
                showsHorizontalScrollIndicator={false} >
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', marginLeft: 7, marginTop: 7 }}>
                    <Button
                        key={'attendant'}
                        onPress={() => handlerSelectDashboard(typeButton.Attendant)}
                        title='Attendant'
                        type='solid'
                        buttonStyle={dashboardItem == typeButton.Attendant ? styles.btnSelect : styles.btnNonSelect}
                        titleStyle={dashboardItem == typeButton.Attendant ? styles.titleView : styles.titleNonView}
                    />
                    {dataButtonMenu.match(typeButton.SellOut) &&
                        <Button
                            key={'sellOut'}
                            onPress={() => handlerSelectDashboard(typeButton.SellOut)}
                            title='Sell Out'
                            type='solid'
                            buttonStyle={dashboardItem == typeButton.SellOut ? styles.btnSelect : styles.btnNonSelect}
                            titleStyle={dashboardItem == typeButton.SellOut ? styles.titleView : styles.titleNonView}
                        />
                    }
                    {dataButtonMenu.match(typeButton.SellIn) &&
                        <Button
                            key={'sellIn'}
                            onPress={() => handlerSelectDashboard(typeButton.SellIn)}
                            title='Sell In'
                            type='solid'
                            buttonStyle={dashboardItem == typeButton.SellIn ? styles.btnSelect : styles.btnNonSelect}
                            titleStyle={dashboardItem == typeButton.SellIn ? styles.titleView : styles.titleNonView}
                        />
                    }
                    {dataButtonMenu.match(typeButton.KPI5) &&
                        <Button
                            key={'kpi'}
                            onPress={() => handlerSelectDashboard(typeButton.KPI5)}
                            title='KPI5'
                            type='solid'
                            buttonStyle={dashboardItem == typeButton.KPI5 ? styles.btnSelect : styles.btnNonSelect}
                            titleStyle={dashboardItem == typeButton.KPI5 ? styles.titleView : styles.titleNonView}
                        />
                    }
                    {dataButtonMenu.match(typeButton.Target) &&
                        <Button
                            key={'target'}
                            onPress={() => handlerSelectDashboard(typeButton.Target)}
                            title='Target'
                            type='solid'
                            buttonStyle={dashboardItem == typeButton.Target ? styles.btnSelect : styles.btnNonSelect}
                            titleStyle={dashboardItem == typeButton.Target ? styles.titleView : styles.titleNonView}
                        />
                    }
                    {dataButtonMenu.match(typeButton.Routing) &&
                        <Button
                            key={'routing'}
                            onPress={() => handlerSelectDashboard(typeButton.Routing)}
                            title='Routing'
                            type='solid'
                            buttonStyle={dashboardItem == typeButton.Routing ? styles.btnSelect : styles.btnNonSelect}
                            titleStyle={dashboardItem == typeButton.Routing ? styles.titleView : styles.titleNonView}
                        />
                    }
                </View>
            </ScrollView>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <RenderButton key={'buttondashboard'} />
            <View style={styles.mainViewDashboard}>
                <View style={{
                    flex: 1, backgroundColor: appcolor.surface, marginBottom: 12, marginLeft: 7, marginRight: 7,
                    borderBottomLeftRadius: 12, borderBottomRightRadius: 12, opacity: 0.96, marginTop: -3
                }}>
                    <LoadingView isLoading={loading} title=' ' />
                    {/* Sell-Out Daily */}
                    {dashboardItem == typeButton.SellOut && !loading && Object.keys(dataSellOut).length > 0 &&
                        (
                            isSellOutByCate == true ?
                                <SellOutSummaryByCate
                                    appcolor={appcolor}
                                    dataSellOut={dataSellOut}
                                    navigation={navigation} />
                                :
                                <SellOutSummary
                                    appcolor={appcolor}
                                    dataSellOut={dataSellOut}
                                    navigation={navigation} />
                        )
                    }
                    {/* Sell-In Daily */}
                    {dashboardItem == typeButton.SellIn && !loading && dataSellIn !== null &&
                        <BarChartSummary
                            appcolor={appcolor}
                            data={dataSellIn}
                            navigation={navigation}
                        />
                    }
                    {/* KPI-5 Daily */}
                    {dashboardItem == typeButton.KPI5 && !loading && dataKPI5 !== null &&
                        <BarChartSummary
                            appcolor={appcolor}
                            data={dataKPI5}
                            navigation={navigation}
                            colorActual={[processColor('#ff6600')]}
                            colorTarget={[processColor('#51adcf')]}
                        />
                    }
                    {/* Target By Month */}
                    {dashboardItem == typeButton.Target && !loading && dataTarget !== null &&
                        <TargetSummary
                            appcolor={appcolor}
                            dataTarget={dataTarget}
                            navigation={navigation}
                        />
                    }
                    {/* Attendant */}
                    {dashboardItem == typeButton.Attendant && !loading && dataAttendant !== null &&
                        <AttendantSummary
                            appcolor={appcolor}
                            dataAttendant={dataAttendant}
                            navigation={navigation}
                        />
                    }
                    {/* Routing */}
                    {dashboardItem == typeButton.Routing && !loading && dataRouting !== null &&
                        <DashboardRouting navigation={navigation} data={dataRouting} />
                    }
                </View>
            </View>
        </View>
    )
}
const BarChartSummary = ({ appcolor, data, navigation, colorActual, colorTarget, colorConfirm }) => {
    const chartName = data[0]?.chartName || `Số bán (SellIn)`
    const pageName = data[0]?.pageName || 'dashboardDetail'
    const actualValue = _.map(data, 'actual')
    const targetValue = _.map(data, 'target')
    const confirmValue = _.map(data, 'confirm')
    const xAxisValue = _.map(data, 'xAxis')
    const axisMaximum = data.length

    const legend = {
        enabled: true,
        textSize: 10,
        form: "CIRCLE",
        formSize: 10,
        xEntrySpace: 10,
        yEntrySpace: 5,
        wordWrapEnabled: true,
        horizontalAlignment: 'RIGHT',
        textColor: processColor('black')
    }
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
        textColor: processColor('black')
    }
    const yAxis = {
        zeroLine: { enabled: true },
        limitLines: [{ limit: 1 }],
        left: { drawGridLines: false, enabled: false },
        right: { drawGridLines: false, enabled: false }
    }
    const dataChart = {
        dataSets: [{
            values: targetValue,
            label: 'Target',
            config: {
                drawValues: true,
                valueTextColor: processColor('black'),
                colors: colorTarget || [processColor('#336699')],
            }
        },
        {
            values: actualValue,
            label: 'Actual',
            config: {
                drawValues: true,
                valueTextColor: processColor('black'),
                colors: colorActual || [processColor('#FFAC1C')],
            }
        },
        {
            values: confirmValue,
            label: 'Confirm',
            config: {
                drawValues: true,
                valueTextColor: processColor('black'),
                colors: colorConfirm || [processColor('#6ec793')],
            }
        }],
        config: {
            barWidth: 0.3,
            group: {
                fromX: 0,
                groupSpace: 0.1,
                barSpace: 0
            }
        }
    }
    return (
        <TouchableOpacity style={{ zIndex: 10, width: '100%', height: '100%' }} onPress={() => navigation.navigate(pageName)}>
            <Text style={{ width: '100%', position: 'absolute', top: 10, textAlign: 'center', fontSize: 15, fontWeight: '700', color: appcolor.dark, zIndex: 10, elevation: 10 }}>{chartName}</Text>
            <View style={{ width: '100%', height: '100%', padding: 8 }}>
                <View style={{ width: '100%', height: '100%' }}>
                    <BarChart
                        style={{ flex: 1 }}
                        xAxis={xAxis}
                        yAxis={yAxis}
                        data={dataChart}
                        legend={legend}
                        marker={{ enabled: false }}
                        pinchZoom={false}
                        borderWidth={1}
                        doubleTapToZoomEnabled={false}
                        drawHighlightArrow={false}
                        drawBarShadow={false}
                        drawValueAboveBar={false}
                        chartDescription={{
                            textSize: 0,
                            text: ' '
                        }}
                    />
                </View>
            </View>
        </TouchableOpacity >
    )
}
const TargetSummary = ({ appcolor, dataTarget, navigation }) => {
    const chartName = dataTarget[0]?.chartName || ''
    const colorList = ['#90caf9', '#e57373', '#81c784', '#fff176']
    const ColorRand = (index) => {
        if (index === undefined || (index !== undefined && index > colorList.length - 1)) {
            index = ConvertToInt(Math.random() * colorList.length || 0)
        }
        index = index % colorList.length
        return colorList[index];
    }
    return (
        <TouchableOpacity style={{ zIndex: 10, width: '100%', height: '100%' }} >
            <Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '700', color: appcolor.dark, marginTop: 10 }}>{chartName}</Text>
            <View style={{ width: '100%', height: '100%', padding: 8 }}>
                <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                >
                    {dataTarget.map((item, index) => {
                        return (
                            <View key={`idx_tt_${index}`}
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: ColorRand(index), borderRadius: 10, padding: 5, marginBottom: 5, paddingLeft: 16 }}>
                                <Icon name='dot-circle' type='font-awesome-5' color={appcolor.dark} size={15} />
                                <Text style={{ padding: 8, fontSize: 15, fontWeight: '600' }}>{item.unit}</Text>
                                <View style={{ position: 'absolute', end: 16, padding: 3, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 25, fontWeight: '700', fontStyle: 'italic', color: appcolor.blacklight }}>{formatNumber(item.target, ',')}</Text>
                                </View>
                            </View>
                        )
                    }
                    )
                    }
                </ScrollView>
            </View>
        </TouchableOpacity >
    )
}