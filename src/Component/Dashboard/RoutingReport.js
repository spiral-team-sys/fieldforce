import moment from "moment"
import React, { useEffect, useState } from "react"
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import ActionSheet, { SheetManager } from "react-native-actions-sheet"
import { Icon } from "@rneui/base"
import { useSelector } from "react-redux"
import { DashboardAPI } from "../../API/DashboardAPI"
import { HeaderCustom } from "../../Content/HeaderCustom"
import LoadingDefault from "../../Control/ItemLoading/LoadingDefault"
import { YearMonthSelected } from "../../Control/YearMonthSelected"
import { colorList } from "../../Core/Helper"
import { scaleSize } from "../../Themes/AppsStyle"
import * as Progress from 'react-native-progress';
import LottieView from "lottie-react-native"
import { Capitalize, ConvertSecondToTime, deviceHeight, deviceWidth } from "../../Core/Utility"
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view"
import { URLDEFAULT } from "../../Core/URLs"
const DATE = new Date()
export const RoutingReport = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([])
    const [summary, setSummary] = useState({})
    const [selected, setSelectedDay] = useState({})
    const [routeData, setRouteData] = useState([])
    const [visitList, setVisitList] = useState([]);
    const [filter, setFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })
    const onSelectYear = (searchInfo) => {
        setFilter({ ...filter, ...searchInfo })
    }

    const onLoad = async () => {
        await setLoading(true)

        // await SheetManager.hide("sheetFilter")

        const result = await DashboardAPI.RoutingMonthLy(filter.month, filter.year)
        if (result.statusId === 200) {//
            const _data = await result.data || [];
            _data.length > 0 && setSummary(JSON.parse(_data[0].total))
            await setData(_data);
        } else {
            await setData([])
        }
        await setLoading(false)
    }
    useEffect(() => {
        onLoad()
    }, [])
    const rowItem = ({ item, index }) => {
        const onShowbyDays = (selected) => {
            const _details = JSON.parse(selected.routeInfo || '[]')
            setSelectedDay(selected)
            setRouteData(_details);
            setVisitList(JSON.parse(item.details || '[]'));
            SheetManager.show("sheetDaily")
        }
        return (
            <View key={`mka${index}d`} style={{ width: '49%', marginRight: 7, marginBottom: 7 }}>
                <TouchableOpacity onPress={() => onShowbyDays(item)}>
                    <View style={{ backgroundColor: appcolor.light, padding: 12, borderRadius: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '500', fontSize: scaleSize(18), color: appcolor.dark }}>{Capitalize(moment(item.startWork).format('dddd, [Ngày] D'))}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: scaleSize(11), color: appcolor.dark }}>Đã đi </Text>
                            <Text style={{ flexGrow: 1, textAlign: 'right', fontSize: scaleSize(18), color: appcolor.dark }}>{item.shopActual || "0"}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: scaleSize(11), color: appcolor.dark }}>Chỉ tiêu </Text>
                            <Text style={{ flexGrow: 1, textAlign: 'right', fontSize: scaleSize(18), color: appcolor.dark }}>{item.shopPlan || "0"}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: scaleSize(11), color: appcolor.dark }}>Số km đã đi </Text>
                            <Text style={{ flexGrow: 1, fontWeight: '700', textAlign: 'right', fontSize: scaleSize(18), color: appcolor.danger }}>{item.distance}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>)
    }

    const HeaderSumaryView = ({ summary }) => {
        const info = summary[0]
        return (<View style={{ margin: 7 }}>
            <View style={{ backgroundColor: appcolor.light, borderRadius: 20, padding: 12, flexDirection: 'row' }}>
                <Progress.Circle color={appcolor.primary}
                    thickness={6} borderColor={appcolor.primary} showsText={true} formatText={() => info?.PercentPlan || "0 %"}
                    progress={info?.PercentValue || 0} size={130} />
                <View style={{ padding: 12, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, color: appcolor.dark }}>
                        Đã đi<Text style={{ fontSize: 17, color: appcolor.dark }}> {data?.length}</Text> ngày trong tháng
                    </Text>
                    <Text style={{ fontSize: 10, color: appcolor.dark }}>
                        Trung bình di chuyển<Text style={{ fontSize: 17, color: appcolor.dark }}> {data.length > 0 ? Number(info?.TotalDistance / data?.length).toFixed(2) : 0}</Text> km/ngày
                    </Text>
                    <Text style={{ fontSize: 10, color: appcolor.dark }}>
                        Tổng <Text style={{ fontSize: 17, color: appcolor.dark }}> {info?.TotalDistance}</Text> KM đã đi trong tháng
                    </Text>
                    <Text style={{ fontSize: 10, color: appcolor.dark }}>
                        Tổng <Text style={{ fontSize: 17, color: appcolor.dark }}>
                            {info?.TotalShopPlan}</Text> cửa hàng kế hoạch
                    </Text>
                    <Text style={{ fontSize: 10, color: appcolor.dark }}>
                        Tổng <Text style={{ fontSize: 17, color: appcolor.dark }}>
                            {info?.TotalShopActual}
                        </Text>
                        cửa hàng đã đến
                    </Text>
                </View>
            </View>
        </View>)
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <HeaderCustom leftFunc={() => navigation.goBack()} iconRight="search"
                rightFunc={() => SheetManager.show("sheetFilter")} title={`Routing ${filter.monthname} ${filter.yearname}`} />
            <LoadingDefault styles={{ zIndex: 100 }} isLoading={loading} title="Đang tải..." />
            <View style={{ flex: 1, marginBottom: 20 }}>
                <FlatList
                    data={data}
                    ListHeaderComponent={() => <HeaderSumaryView summary={summary} />}
                    numColumns={2}
                    keyExtractor={(_, index) => `${index}asmks`}
                    renderItem={rowItem}
                />
            </View>
            <ActionSheet id="sheetDaily" drawUnderStatusBar containerStyle={{ backgroundColor: appcolor.surface }}>
                {/* <View style={{ backgroundColor: appcolor.surface, paddingTop: 20 }}>
                    <Routing onClose={() => SheetManager.hide("sheetDaily")} info={selected} routedata={routeData} />
                </View> */}
                <View style={{ height: deviceHeight - 100 }}>
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                        <Text style={{
                            width: '86%',
                            textAlign: 'center', padding: 12, fontSize: scaleSize(18),
                            color: appcolor.primary, fontWeight: 'bold'
                        }}>
                            Cửa hàng đi ngày {selected.workDate}
                        </Text>
                        <TouchableOpacity style={{ width: '12%', marginEnd: 10 }} onPress={() => SheetManager.hide('sheetDaily')}>
                            <Icon size={14} name="close" raised />
                        </TouchableOpacity>
                    </View>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: appcolor.dark, opacity: 0.1 }} />

                    <Tabs.Container
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 15, color: appcolor.light, fontWeight: '600' }}
                                indicatorStyle={{ backgroundColor: appcolor.white }}
                                inactiveColor={appcolor.white}
                                activeColor={appcolor.white}
                                tabStyle={{ width: '50%', height: 42 }}
                                style={{ backgroundColor: appcolor.primary }}
                            />
                        )}>
                        <Tabs.Tab key={1} name="Lộ trình" label="Lộ trình">
                            <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                <Routing onClose={() => SheetManager.hide("sheetDaily")} info={selected} routedata={routeData} />
                            </View>
                        </Tabs.Tab>
                        <Tabs.Tab key={2} name="Chi tiết" label="Chi tiết">
                            <View style={{ backgroundColor: appcolor.surface, marginTop: 40, padding: 6, width: deviceWidth }}>
                                <Detail visitList={visitList} />
                            </View>
                        </Tabs.Tab>
                    </Tabs.Container>

                </View>
            </ActionSheet>

            {/* <ActionSheet bottomOffset={50} id="sheetDaily"
                containerStyle={{ backgroundColor: appcolor.surface }}>
                <View style={{ height: deviceHeight - 40 }}>
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                        <Text style={{
                            width: '86%',
                            textAlign: 'center', padding: 12, fontSize: scaleSize(18),
                            color: appcolor.primary, fontWeight: 'bold'
                        }}>
                            Cửa hàng đi ngày {selected.workDate}
                        </Text>
                        <TouchableOpacity style={{ width: '12%', marginEnd: 10 }} onPress={() => SheetManager.hide('shopList')}>
                            <Icon size={14} name="close" raised />
                        </TouchableOpacity>
                    </View>
                    <Divider />

                    <Tabs.Container
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 15, color: appcolor.light, fontWeight: '600' }}
                                indicatorStyle={{ backgroundColor: appcolor.white }}
                                inactiveColor={appcolor.white}
                                activeColor={appcolor.white}
                                tabStyle={{ width: '50%', height: 42 }}
                                style={{ backgroundColor: appcolor.primary }}
                            />
                        )}>
                        <Tabs.Tab key={1} name="Lộ trình" label="Lộ trình">
                            <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                <Routing route={selected} data={jsonRoute} />
                            </View>
                        </Tabs.Tab>
                        <Tabs.Tab key={2} name="Chi tiết" label="Chi tiết">
                            <View style={{ backgroundColor: appcolor.surface, marginTop: 40, padding: 6, width: deviceWidth }}>
                                <Detail visitList={visitList} />
                            </View>
                        </Tabs.Tab>
                    </Tabs.Container>

                </View>

            </ActionSheet> */}
            <ActionSheet id="sheetFilter" containerStyle={{ backgroundColor: appcolor.surface }} >
                <YearMonthSelected option={filter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
                <View style={{ borderBottomWidth: 1, borderBottomColor: appcolor.dark, opacity: 0.1 }} />
                <TouchableOpacity onPress={onLoad} style={{ marginBottom: 20, }}>
                    <Text style={{ color: appcolor.primary, padding: 12, textAlign: 'center' }}>Áp dụng</Text>
                </TouchableOpacity>
            </ActionSheet>
        </View>
    )
}
const Detail = ({ visitList }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const rowVisit = ({ item, index }) => {
        const _imageUri = item?.Photo?.includes('https') ? item.Photo : `${URLDEFAULT}${item.Photo}`
        return (
            <View key={`${index}kah`} style={{ padding: 7, backgroundColor: appcolor.light, margin: 7 }}>
                <View style={{ padding: 7 }}>
                    <Text style={{ fontWeight: '900', color: appcolor.dark }}>Cửa hàng {item.ShopCode} {item.ShopName}</Text>
                    <Text style={{ color: appcolor.dark, fontSize: 12 }}>{item?.Address || ''}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Image style={{ width: '30%', height: 120 }}
                        source={{ uri: _imageUri }} />
                    <View style={{ flexGrow: 1, width: '65%', marginLeft: 7 }}>
                        <Text style={{ color: appcolor.dark }}>Thời gian đến cửa hàng {item.AttendantTime}</Text>
                        <Text style={{ color: appcolor.dark, fontSize: 12 }}>{item?.TotalTime}</Text>
                        <Text style={{ color: appcolor.dark, fontSize: 12 }}>{item?.ReportList}</Text>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <ScrollView>
            <FlatList data={visitList}
                showsVerticalScrollIndicator={false}
                renderItem={rowVisit}
            />
        </ScrollView>
    )
}
const Routing = ({ info, routedata, onClose }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    // console.log(routedata, "DS")
    var totalTime = routedata.length ? routedata.map(o => o.Duration.value).reduce((a, c) => { return a + c }) : 0;
    totalTime = ConvertSecondToTime(totalTime);
    // console.log(totalTime, "totalTime")
    const rowTimeLine = ({ item, index }) => {
        // console.log(item)
        totalTime += item?.Distance.value || 0
        return (
            <View key={`${index}29da`} style={{ flexDirection: 'row', marginTop: index === 0 ? 30 : 0, marginBottom: index === routedata.length - 1 ? 90 : 0 }}>
                <View style={{
                    height: 100, top: -20, backgroundColor: appcolor.light, borderRadius: 70,
                    borderColor: colorList[index], borderWidth: 2,
                    width: '40%', alignSelf: 'flex-start', padding: 12, alignItems: 'center'
                }}>
                    <Text style={{}}>Điểm đi {index}</Text>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: appcolor.dark, opacity: 0.1 }} />
                    <Text numberOfLines={4} style={{ textAlign: 'center', color: appcolor.dark, fontSize: 9 }}>
                        {item?.Start_Address}
                    </Text>
                </View>
                <View style={{
                    alignSelf: 'flex-start', justifyContent: 'center', top: 26, width: 20, height: 3,
                    backgroundColor: appcolor.warning
                }}>
                </View>
                <View style={{ justifyContent: 'center', width: 10, height: 230, backgroundColor: colorList[index] }}>

                </View>
                <View style={{ alignSelf: 'center', justifyContent: 'center', top: 40, width: 30, height: 3, backgroundColor: appcolor.danger }}>
                    <View style={{ left: -18, width: 25, height: 25, borderWidth: 7, borderColor: appcolor.white, borderRadius: 20, backgroundColor: colorList[index] }} />
                </View>
                <View style={{ width: '40%' }}>
                    <View style={{ height: 100, justifyContent: 'flex-end', marginBottom: 7, }}>
                        <Text style={{ color: appcolor.dark, fontSize: 10, textAlign: 'center', fontStyle: 'italic' }}>{item?.Distance?.text}</Text>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: appcolor.dark, opacity: 0.1 }} />
                        <Text style={{ color: appcolor.dark, fontSize: 10, textAlign: 'center', fontStyle: 'italic' }}>Di chuyển {item?.Duration?.text}</Text>
                    </View>
                    <View style={{
                        height: 100, backgroundColor: appcolor.light, borderRadius: 49, width: '100%',
                        alignSelf: 'flex-end', padding: 12, alignItems: 'center'
                    }}>
                        <Text style={{ textAlign: 'center', color: appcolor.danger, fontSize: 17 }}>Điểm đến</Text>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: appcolor.dark, opacity: 0.1 }} />
                        <Text numberOfLines={4} style={{ textAlign: 'center', color: appcolor.dark, fontSize: 9 }}>
                            {item?.End_Address}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={{ alignItems: 'center', backgroundColor: appcolor.surface }}>
            <ScrollView
                showsVerticalScrollIndicator={false}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={routedata}
                    scrollEnabled={false}
                    renderItem={rowTimeLine}
                />
            </ScrollView>
            <View style={{
                height: 100, backgroundColor: appcolor.light, width: '100%', padding: 12, borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20, position: 'absolute', bottom: 0
            }}>
                <TouchableOpacity onPress={onClose}>
                    <View style={{ flexDirection: 'row', paddingBottom: 12 }}>
                        <Text style={{ flexGrow: 0.31, fontSize: 28, textAlign: 'right', fontWeight: 'bold', color: appcolor.danger }}>
                            {totalTime}
                        </Text>
                        <LottieView style={{ height: 100, alignItems: 'center', top: -20, width: '20%' }} autoPlay
                            autoSize source={require('../../Themes/lotties/location-finding.json')} />
                        <Text style={{ fontSize: 30, flexGrow: 1, textAlign: 'right', fontWeight: 'bold', color: appcolor.danger }}>
                            {info?.distance}<Text style={{ fontSize: 10, }}>km</Text> </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}