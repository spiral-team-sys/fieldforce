import React, { useEffect, useState } from 'react';
import { processColor, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
import { Button, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../Controller/DashboardController';
import { deviceHeight, deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import { LoadingView } from '../../Control/ItemLoading/index'
import Carousel from 'react-native-reanimated-carousel';
import { PercentView } from '../../Control/PercentView';
import _ from 'lodash';
import { DashboardRouting } from '../../Content/Beko/DashboardRouting';

const typeButton = {
    Menu: 'MENU',
    Attendant: 'ATTENDANT',
    SellOut: 'SELLOUT',
    Routing: 'ROUTING'
}
export const SummaryHomeAqua = ({ navigation, isLoading }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dashboardItem, setDashboardItem] = useState(typeButton.Attendant)
    const [dataAttendant, setDataAttendant] = useState([])
    const [dataSellOut, setDataSellOut] = useState({})
    const [dataRouting, setDataRouing] = useState({})
    const [dataMenu, setDataMenu] = useState([])

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
        LoadDashboard(typeButton.Attendant)
        return () => false
    }, [isLoading, typeButton])
    useEffect(() => {
        LoadMenu()
        return () => false
    }, [isLoading])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
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
                <View style={{ flex: 1, backgroundColor: appcolor.light, margin: 10, borderRadius: 10 }}>
                    <LoadingView isLoading={loading} title=' ' />
                    {/* Sell-Out Daily */}
                    {dashboardItem == typeButton.SellOut && !loading && Object.keys(dataSellOut).length > 0 &&
                        <SellOutSummary
                            appcolor={appcolor}
                            dataSellOut={dataSellOut}
                            navigation={navigation} />
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
const AttendantSummary = ({ appcolor, dataAttendant, navigation }) => {
    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity key={`ITT_${index}`} onPress={() => navigation.navigate('attendanthistory')}>
                <View style={{ width: '100%', height: '100%', padding: 16 }}>
                    <Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '700', color: appcolor.dark }}>{item.dashboardName}</Text>
                    <View style={{ width: '100%', padding: 16, flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{ width: deviceWidth / 2.3, height: deviceHeight / 10, backgroundColor: appcolor.success, borderRadius: 15, justifyContent: 'center', marginEnd: 8 }}>
                            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '800', color: appcolor.light, paddingBottom: 8 }}>{item.tValue}</Text>
                            <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '600', color: appcolor.light }}>{item.target}</Text>
                        </View>
                        <View style={{ width: deviceWidth / 2.3, height: deviceHeight / 10, backgroundColor: appcolor.warning, borderRadius: 15, justifyContent: 'center', marginStart: 8 }}>
                            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '800', color: appcolor.light, paddingBottom: 8 }}>{item.aValue}</Text>
                            <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '600', color: appcolor.light }}>{item.actual}</Text>
                        </View>
                    </View>
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
                width={deviceWidth}
                height={deviceHeight / 3}
            />
        </View>
    )
} 