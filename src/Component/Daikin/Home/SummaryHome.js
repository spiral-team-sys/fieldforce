import React, { useEffect, useState } from 'react';
import { processColor, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-charts-wrapper';
import { Button, Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../../Controller/DashboardController';
import { deviceHeight, deviceWidth, scaleSize } from '../../../Themes/AppsStyle';
import { LoadingView } from '../../../Control/ItemLoading/index'
import Carousel from 'react-native-reanimated-carousel';
import { PercentView } from '../../../Control/PercentView';
import _ from 'lodash';
import { DashboardRouting } from '../../../Content/Beko/DashboardRouting';

const typeButton = {
    Menu: 'MENU',
    Attendant: 'ATTENDANT',
    SellOutMonth: 'BYMONTH',
    SellOut: 'SELLOUT',
    SellIn: 'SELLIN',
    KPI5: 'KPI5',
    Target: 'TARGET',
    Routing: 'ROUTING'
}
export const SummaryHome = ({ navigation, isLoading }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dashboardItem, setDashboardItem] = useState(typeButton.Attendant)
    const [dataAttendant, setDataAttendant] = useState([])
    const [dataSellOut, setDataSellOut] = useState({})
    const [dataSellOutMonth, setDataSellOutMonth] = useState([])
    const [dataSellIn, setDataSellIn] = useState([])
    const [dataKPI5, setDataKPI5] = useState([])
    const [dataRouting, setDataRouing] = useState({})
    const [dataTarget, setDataTarget] = useState([])
    const [dataMenu, setDataMenu] = useState([])

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
                await setDataSellOut(mData[0] || {})
            });
        typeGroup == typeButton.SellOutMonth &&
            await DataSummary(typeButton.SellOutMonth, async (mData) => {
                await setDataSellOutMonth(mData)
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
        const _loadh = LoadDashboard(typeButton.Attendant)
        return () => _loadh
    }, [isLoading, typeButton])
    useEffect(() => {
        const _load = LoadMenu()
        return () => _load
    }, [isLoading])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', backgroundColor: appcolor.light },
        btnSelect: { backgroundColor: appcolor.dark, borderRadius: 10, padding: 5, margin: 5, marginEnd: 3, paddingStart: 8, paddingEnd: 8 },
        btnNonSelect: { backgroundColor: appcolor.light, borderRadius: 10, padding: 5, margin: 5, marginEnd: 3, borderWidth: 1, borderColor: appcolor.grayLight, paddingStart: 8, paddingEnd: 8 },
        titleView: { fontSize: 15, fontWeight: '600', color: appcolor.light },
        titleNonView: { fontSize: 15, fontWeight: '600', color: appcolor.dark },
        mainViewDashboard: { width: '100%', height: deviceHeight / 3 }
    })
    const RenderButton = ({ }) => {
        const dataButtonMenu = dataMenu !== undefined && dataMenu !== null ? (dataMenu[0]?.menuList || '') : ''
        return (
            <ScrollView
                pagingEnabled
                horizontal
                style={{ flex: 1 }}
                showsHorizontalScrollIndicator={false} >
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
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
                    {dataButtonMenu.match(typeButton.SellOutMonth) &&
                        <Button
                            key={'sellOutMonth'}
                            onPress={() => handlerSelectDashboard(typeButton.SellOutMonth)}
                            title='Sell Out'
                            type='solid'
                            buttonStyle={dashboardItem == typeButton.SellOutMonth ? styles.btnSelect : styles.btnNonSelect}
                            titleStyle={dashboardItem == typeButton.SellOutMonth ? styles.titleView : styles.titleNonView}
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
                <View style={{ flex: 1, backgroundColor: appcolor.surface, margin: 8, borderRadius: 10 }}>
                    <LoadingView isLoading={loading} title=' ' />
                    {/* Sell-Out Daily */}
                    {dashboardItem == typeButton.SellOut && !loading && Object.keys(dataSellOut).length > 0 &&
                        <SellOutSummary
                            appcolor={appcolor}
                            dataSellOut={dataSellOut}
                            navigation={navigation} />
                    }
                    {/* Sell-Out Monthly */}
                    {dashboardItem == typeButton.SellOutMonth && !loading && dataSellOutMonth !== null &&
                        <BarChartSummary
                            appcolor={appcolor}
                            data={dataSellOutMonth}
                            navigation={navigation}
                        />
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

const SellOutSummary = ({ appcolor, dataSellOut, navigation }) => {
    const target = dataSellOut.targetPercent < dataSellOut.actualPercent ? 0 : dataSellOut.targetPercent - dataSellOut.actualPercent
    const data = {
        dataSets: [{
            values: [{ value: dataSellOut.actualPercent }, { value: target }],
            config: {
                colors: [processColor('#085294'), processColor('#ff6347')],
                valueTextColor: processColor('transparent')
            },
            label: ''
        }],
    }
    const percentValue = `${(dataSellOut.actualPercent / dataSellOut.targetPercent).toFixed(3) * 100}%`
    return (
        <TouchableOpacity style={{ zIndex: 10, width: '100%', height: '100%' }} onPress={() => navigation.navigate(dataSellOut.pageName)}>
            <View style={{ width: '100%', height: '100%', padding: 8 }}>
                <Text style={{ width: '100%', position: 'absolute', top: 12, textAlign: 'center', fontSize: 15, fontWeight: '700', color: appcolor.dark, zIndex: 10, elevation: 10 }}>{dataSellOut.cname}</Text>
                <View style={{ width: '100%', height: '100%', flexDirection: 'row' }}>
                    <View style={{ width: '50%', height: '100%', alignSelf: 'flex-start' }}>
                        <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: appcolor.dark, padding: 5 }}>{`Target`}</Text>
                            <Text style={{ fontSize: scaleSize(32), fontWeight: '800', color: appcolor.tomato, marginStart: 8 }}>{`${dataSellOut.targetValue}`}</Text>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: appcolor.dark, padding: 5 }}>{`Actual`}</Text>
                            <Text style={{ fontSize: scaleSize(18), fontWeight: '700', color: appcolor.info, marginStart: 8 }}>{`${dataSellOut.l1}: ${dataSellOut.v1}`}</Text>
                            <Text style={{ fontSize: scaleSize(18), fontWeight: '700', color: appcolor.info, marginStart: 8 }}>{`${dataSellOut.l2}: ${dataSellOut.v2}`}</Text>
                        </View>
                    </View>
                    <View style={{ width: deviceWidth / 2.3, height: '100%', alignSelf: 'flex-end' }}>
                        <PieChart
                            style={{ flex: 1 }}
                            logEnabled={true}
                            chartBackgroundColor={processColor('transparent')}
                            chartDescription={{ text: '' }}
                            data={data}
                            legend={{ enabled: false }}
                            extraOffsets={{ left: 5, top: 5, right: 5, bottom: 5 }}
                            entryLabelColor={processColor('transparent')}
                            entryLabelTextSize={20}
                            entryLabelFontFamily={'HelveticaNeue-Medium'}
                            styledCenterText={{ text: percentValue, color: processColor('#d1380a'), size: 18, fontWeight: '600', textAlign: 'center' }}
                            centerTextRadiusPercent={100}
                            holeRadius={70}
                            maxAngle={360}
                            onChange={(event) => console.log(event.nativeEvent)}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}
const BarChartSummary = ({ appcolor, data, navigation, colorActual, colorTarget }) => {
    const chartName = data[0]?.chartName || `Số bán (SellIn)`
    const pageName = data[0]?.pageName || 'dashboardDetail'
    const actualValue = _.map(data, 'actual')
    const targetValue = _.map(data, 'target')
    const percentValue = _.map(data, 'targetPercent')
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
        left: { drawGridLines: true, enabled: true },
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
                colors: colorActual || [processColor('#089490')],
            }
        },
        {
            values: percentValue,
            label: 'Percent',
            config: {
                drawValues: true,
                valueTextColor: processColor('black'),
                colors: colorActual || [processColor('#FFAC1C')],
            }
        }],
        config: {
            barWidth: 0.25,
            group: {
                fromX: 0,
                groupSpace: 0.1,
                barSpace: 0.05
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
const AttendantSummary = ({ appcolor, dataAttendant, navigation }) => {
    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity key={`ITT_${index}`} onPress={() => navigation.navigate('attendanthistory')}>
                <View style={{ height: '96%', borderRadius: 12, opacity: 0.9, margin: 3, marginBottom: 12, padding: 16, backgroundColor: appcolor.primary, margin: 5 }}>
                    <Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '700', color: appcolor.white }}>{item.dashboardName}</Text>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.success, borderTopRightRadius: 40, borderBottomLeftRadius: 40, marginVertical: 16, }}>
                        <View style={{ width: deviceWidth / 2.3, height: deviceHeight / 10, borderRadius: 15, justifyContent: 'center', marginEnd: 8 }}>
                            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '800', color: appcolor.white, paddingBottom: 8 }}>{item.tValue}</Text>
                            <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '600', color: appcolor.white }}>{item.target}</Text>
                        </View>
                        <View style={{ width: 1, height: '70%', backgroundColor: appcolor.white }}></View>
                        <View style={{ width: deviceWidth / 2.3, height: deviceHeight / 10, borderRadius: 15, justifyContent: 'center', marginStart: 8 }}>
                            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '800', color: appcolor.warning, paddingBottom: 8 }}>{item.aValue}</Text>
                            <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '600', color: appcolor.warning }}>{item.actual}</Text>
                        </View>
                    </View>
                    <View style={{
                        backgroundColor: appcolor.white, opacity: 0.1, borderRadius: 700,
                        // borderTopRightRadius: 400, borderBottomRightRadius: 400,
                        position: 'absolute', width: 140, height: 140, right: '10%', bottom: '-9%'
                    }} />
                    <View style={{
                        backgroundColor: appcolor.white, opacity: 0.1, borderRadius: 700,
                        // borderTopRightRadius: 400, borderBottomRightRadius: 400,
                        position: 'absolute', width: 40, height: 40, top: '10%', left: '9%'
                    }} />
                    <PercentView target={item.tValue} actual={item.aValue} />
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
            <Carousel
                data={dataAttendant}
                renderItem={renderItem}
                sliderWidth={deviceWidth}
                itemWidth={deviceWidth}
            />
        </View>
    )
}
const TargetSummary = ({ appcolor, dataTarget, navigation }) => {
    const chartName = dataTarget[0]?.chartName || ''

    const colorList = ['#90caf9', '#e57373', '#fff176', '#81c784']
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
                                    <Text style={{ fontSize: 25, fontWeight: '700', fontStyle: 'italic', color: appcolor.blacklight }}>{item.target}</Text>
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