import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { DashboardSellOut } from "../../Component/Dashboard/DashboardSellOut";
import { DashboardSellOutVerify } from "../../Component/Dashboard/DashboardSellOutVerify";
import { deviceWidth } from "../../Themes/AppsStyle";
import { GetDataDashboard } from "../../Controller/DashboardController";
import { useSelector } from "react-redux";
import { DashboardRouting } from "./DashboardRouting";
import { Button } from '@rneui/themed';
import { DashboardSellOutCategory } from "../../Component/Dashboard/DashboardSellOutCategory";

const typeButton = { Routing: 'ROUTING', SellOut: 'SELLOUT' }
const DashboardHome = ({ navigation, refreshDashboard }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dashboardItem, setDashboardItem] = useState('SELLOUT')
    const [dataDashboard, setDataDashboard] = useState([])
    const [activeSlide, setActiveSlide] = useState(0)
    const LoadDashboard = async () => {
        setLoading(true)
        await GetDataDashboard(async (mData) => {
            await setDataDashboard(mData);
            await setDashboardItem(
                userinfo.groupType !== 'SR' && userinfo.groupType !== 'MER' ? 'SELLOUT' : 'ROUTING'
            )
        })
        setLoading(false)
    }
    const handlerSelectDashboard = async (type) => {
        await setDashboardItem(type)
    }
    const styles = StyleSheet.create({
        titleMenu: { marginStart: 8, width: '50%', fontSize: 15, fontWeight: '600', color: appcolor.dark },
        chartView: { width: '95%', height: '80%', alignItems: 'center', alignSelf: 'center', backgroundColor: appcolor.light, borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
        titleViewUpdate: { width: '100%', textAlign: 'center', padding: 32, fontSize: 15, color: appcolor.dark },
        btnSelect: { backgroundColor: appcolor.dark, width: deviceWidth / 3.5, borderRadius: 10, padding: 5, margin: 8 },
        btnNonSelect: { backgroundColor: appcolor.light, width: deviceWidth / 3.5, borderRadius: 10, padding: 5, margin: 8, borderWidth: 1, borderColor: appcolor.grayLight },
        titleView: { fontSize: 15, fontWeight: '600', color: appcolor.light },
        titleNonView: { fontSize: 15, fontWeight: '600', color: appcolor.dark }
    })
    useEffect(() => {
        LoadDashboard()
        return () => loading
    }, [refreshDashboard])
    const renderItemChart = ({ item, index }) => {
        let viewChart = []
        switch (item.pageName) {
            case 'SellOutEmployee':
                viewChart.push(
                    <DashboardSellOut sendNavigate={navigation} info={item} key={index.toString()} />
                )
                break
            case 'SellOutByCategory':
                viewChart.push(
                    <DashboardSellOutCategory sendNavigate={navigation} info={item} key={index.toString()} />
                )
                break
            case 'SellOutVerify':
                viewChart.push(
                    <DashboardSellOutVerify sendNavigate={navigation} info={item} key={index.toString()} />
                )
                break
        }
        return (
            <View style={{ width: '100%', height: '100%' }}>
                {viewChart}
            </View>
        )
    }
    const paginationDot = () => {
        return (
            <Pagination
                containerStyle={{ margin: 0, marginTop: -16, marginBottom: -8, height: 10, padding: 0 }}
                dotsLength={dataDashboard.length}
                activeDotIndex={activeSlide}
                dotStyle={{
                    width: 8,
                    height: 8,
                    borderRadius: 10,
                    marginHorizontal: 1,
                    backgroundColor: appcolor.secondary,
                }}
                dotContainerStyle={{ height: 10 }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6} />
        );
    }
    const RenderButton = ({ }) => {
        const attendantView = dashboardItem == typeButton.Routing ? styles.btnSelect : styles.btnNonSelect
        const dayView = dashboardItem == typeButton.SellOut ? styles.btnSelect : styles.btnNonSelect
        const attendantDay = dashboardItem == typeButton.Routing ? styles.titleView : styles.titleNonView
        const titleDay = dashboardItem == typeButton.SellOut ? styles.titleView : styles.titleNonView
        return (
            <ScrollView
                horizontal={true}
                style={{ width: '100%', height: '100%' }}
                showsHorizontalScrollIndicator={false} >
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                    {userinfo.groupType !== 'SR' && userinfo.groupType !== 'MER' &&
                        <Button
                            key={'sellOut'}
                            onPress={() => handlerSelectDashboard(typeButton.SellOut)}
                            title='Sell Out'
                            type='solid'
                            buttonStyle={dayView}
                            titleStyle={titleDay}
                        />
                    }
                    {userinfo.groupType !== 'PG' &&
                        <Button
                            key={'routing'}
                            onPress={() => handlerSelectDashboard(typeButton.Routing)}
                            title='Routing'
                            type='solid'
                            buttonStyle={attendantView}
                            titleStyle={attendantDay}
                        />
                    }
                </View>
            </ScrollView>
        )
    }
    return (
        !refreshDashboard ?
            <View style={{ flex: 1 }}>
                <RenderButton key={'buttondashboard'} />
                <View style={styles.chartView}>
                    <View style={{ width: '100%', alignItems: 'center', }}>
                        {dashboardItem == typeButton.Routing &&
                            <View style={{ width: '100%' }} >
                                {dataDashboard.length > 0 &&
                                    <DashboardRouting navigation={navigation} data={dataDashboard[0].chartData || dataDashboard[0]} />
                                }
                            </View>
                        }
                        {dashboardItem == typeButton.SellOut &&
                            <Carousel
                                data={dataDashboard}
                                layout='stack'
                                slideStyle={{ backgroundColor: appcolor.light }}
                                sliderWidth={deviceWidth - 30}
                                itemWidth={deviceWidth - 30}
                                renderItem={renderItemChart}
                                onSnapToItem={(index) => setActiveSlide(index)}
                            />
                        }
                    </View>
                </View >

                {/* {paginationDot()} */}
            </View>
            :
            <Text style={styles.titleViewUpdate}>Đang cập nhật dữ liệu</Text>
    )
}

export default DashboardHome;