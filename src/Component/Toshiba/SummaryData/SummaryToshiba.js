import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { DataSummary } from "../../../Controller/DashboardController";
import { deviceWidth } from "../../../Core/Utility";
import { DashboardAttendantToshiba } from "../../Dashboard/Toshiba/DashboardAttendantToshiba";
import { DashboardSellOutToshiba } from "../../Dashboard/Toshiba/DashboardSellOutToshiba";
import { DashboardSellOutByCateToshiba } from "../../Dashboard/Toshiba/DashboardSellOutByCateToshiba";
import { DashBoardTargetTF } from "../../Dashboard/Tefal/DashBoardTargetTF";
import { DashBoardSellStore } from "../../Dashboard/Tefal/DashboardSellStore";

const type = {
    Menu: 'MENU',
    Attendant: 'ATTENDANT',
    SellOut: 'SELLOUT',
    SellOutByHiend: 'SELLOUTBYHIEND',
    SellOutByCate: 'SELLOUTBYCATE',
    SellIn: 'SELLIN',
    KPI5: 'KPI5',
    Target: 'TARGET',
    Routing: 'ROUTING',
    SSub: 'SSUB',
    SummaryByStore: 'SUMMARYSELLBYDAY'
}

export const SummaryToshiba = ({ navigation, refreshing, viewHeight, downloadData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataMenu, setDataMenu] = useState([])
    const LoadMenu = async () => {
        await DataSummary(type.Menu, async (mData) => {
            if (mData !== null && mData.length > 0) {
                let arr = mData[0].menuList.split(',');
                await setDataMenu(arr)
            }
        })
    }
    useEffect(() => {
        let _load = false
        !refreshing && (_load = LoadMenu())
        return () => _load
    }, [refreshing])
    const styles = StyleSheet.create({
        contentMain: { width: '100%', height: '100%' },
        cardView: { width: '100%', backgroundColor: appcolor.surface, borderRadius: 8, overflow: 'hidden' },
        titleMain: { padding: 8, fontSize: 18, fontWeight: '700', alignSelf: 'center', color: appcolor.dark }
    })

    return (
        viewHeight !== null ?
            <View style={styles.contentMain} >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ height: viewHeight - 40, }}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={downloadData} />} >
                    <ViewDashboard key={'ViewDashboard'} dataMenu={dataMenu} navigation={navigation} viewHeight={viewHeight} />
                </ScrollView>
            </View>
            : null
    )
}
const Indicators = React.memo(({ data, scrollX, appcolor }) => {
    const indicatorPosition = Animated.divide(scrollX, deviceWidth);

    return (
        <View style={{
            flexDirection: 'row',
            position: 'absolute',
            bottom: 0,
            marginTop: 8,
            left: 0,
            right: 0,
            justifyContent: 'center',
        }}>
            {data.map((_, index) => {
                const width = indicatorPosition.interpolate({
                    inputRange: [index - 1, index, index + 1],
                    outputRange: [8, 0.1 * deviceWidth, 8], // Animation sẽ tăng chiều dài của Indicator ở vị trí hiện tại
                    extrapolate: 'clamp',
                });

                return <Animated.View key={index} style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: appcolor.primary,
                    marginHorizontal: 4,
                    width
                }} />;
            })}
        </View>
    );
});
const ViewDashboard = ({ dataMenu, navigation, viewHeight }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const flatListRef = useRef(null)
    const [scrollX] = useState(new Animated.Value(0));

    const styles = StyleSheet.create({
        itemView: { flex: 1, backgroundColor: appcolor.light, borderRadius: 8, elevation: 3, shadowOffset: { width: 3, height: 3 }, shadowColor: appcolor.dark, shadowOpacity: 0.3 }
    })

    return (
        <View style={{ justifyContent: 'space-between' }}>
            <FlatList
                ref={flatListRef}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                snapToAlignment="start"
                style={{ flex: 1, }}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                snapToInterval={deviceWidth}
                decelerationRate={0}
                scrollEventThrottle={16}
                // onMomentumScrollEnd={handlePageChange}
                data={dataMenu}
                keyExtractor={useCallback((_, index) => index.toString(), [])}
                renderItem={({ item, index }) => {
                    return (
                        <View key={'Dashboard' + index} style={{ width: deviceWidth }}>
                            <View style={{ padding: 8, alignItems: "center" }}   >
                                {JSON.parse(item) == type.Attendant &&
                                    <View key={'Attendant_' + index} style={styles.itemView}>
                                        <DashboardAttendantToshiba navigation={navigation} typeDashboard={type.Attendant} viewHeight={viewHeight} />
                                    </View>
                                }
                                {(JSON.parse(item) == type.SellOut || JSON.parse(item) == type.SellOutByHiend) &&
                                    <View key={'SellOut_' + JSON.parse(item) + '_' + index} style={styles.itemView}>
                                        <DashboardSellOutToshiba navigation={navigation} typeDashboard={JSON.parse(item)} viewHeight={viewHeight} />
                                    </View>
                                }
                                {JSON.parse(item) == type.SellOutByCate &&
                                    <View key={'SellOutByCate_' + index} style={styles.itemView}>
                                        {/* <SellOutSummaryByCate
                                            appcolor={appcolor}
                                            dataSellOut={dataSellOut}
                                            navigation={navigation} /> */}
                                        <DashboardSellOutByCateToshiba navigation={navigation} typeDashboard={type.SellOutByCate} viewHeight={viewHeight} />
                                    </View>
                                }
                                {
                                    JSON.parse(item) == type.SummaryByStore &&
                                    <View key={'Dashboard_' + index + '_' + JSON.parse(item)} style={styles.itemView}>
                                        <DashBoardSellStore navigation={navigation} typeDashboard={type.SummaryByStore} viewHeight={viewHeight} />
                                    </View>
                                }
                                {
                                    JSON.parse(item) !== type.SellOut && JSON.parse(item) !== type.SellOutByCate &&
                                    JSON.parse(item) !== type.Attendant && JSON.parse(item) !== type.SellIn &&
                                    JSON.parse(item) !== type.SummaryByStore && JSON.parse(item) !== type.SellOutByHiend &&
                                    <View key={'Dashboard_' + index + '_' + JSON.parse(item)} style={styles.itemView}>
                                        <DashBoardTargetTF navigation={navigation} typeDashboard={JSON.parse(item)} viewHeight={viewHeight} />
                                    </View>
                                }
                            </View>
                        </View>
                    );
                }}
            />
            <View style={{ height: 10, width: '100%', borderRadius: 8, alignSelf: 'center', marginTop: 8, overflow: "hidden" }} >
                <Indicators data={dataMenu} scrollX={scrollX} appcolor={appcolor} />
            </View>
        </View >
    )
}

