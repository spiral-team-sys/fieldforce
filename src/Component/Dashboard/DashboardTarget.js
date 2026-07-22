import React, { useEffect, useState } from "react"
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Platform, RefreshControl, LayoutAnimation, UIManager, ScrollView } from "react-native"
import { DataDashboardByType } from '../../Controller/DashboardController'
import { groupDataByKey, removeVietnameseTones, ToastError } from "../../Core/Helper";
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from "react-redux";
import { YearMonthSelected } from "../../Control/YearMonthSelected";
import { LoadingView } from "../../Control/ItemLoading";
import { deviceHeight } from "../../Core/Utility";
import FormGroup from "../../Content/FormGroup";
import ActionSheet, { SheetManager } from "react-native-actions-sheet"
import _ from 'lodash';
import { SafeAreaView } from "react-native-safe-area-context";
const DATE = new Date()
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
export const DashboardTarget = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [refreshing, setRefreshing] = useState(false)
    const [dataDetail, setDataDetail] = useState([])
    const [data, setData] = useState({ dataMain: [], dataF: [], dataById: [], dataTab: [] })
    var [filter, setFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })
    const [beforeData, setBeforeData] = useState({})
    const [_mutate, setMutate] = useState(false)
    const [currentTab, setCurrentTab] = useState({})

    const LoadDataDetail = async (tabSelect) => {
        setRefreshing(true)

        const dataJson = { year: filter.year, month: filter.month, typeDashboard: tabSelect?.typeData || 'SELLOUTTARGETBYDEALER' }
        await DataDashboardByType(dataJson, async (result) => {
            if (result.statusId === 200) {
                const dataResult = result.data
                const dataTab = JSON.parse(dataResult[0]?.tabConfig || '[]')
                const dataById = JSON.parse(dataResult[0]?.dataById || '[]')
                const { arr } = groupDataByKey({
                    arr: dataById,
                    key: "g1"
                })
                await setData({ dataMain: dataResult, dataF: arr, dataById: arr, dataTab: dataTab })
            } else {
                ToastError(result.messager)
            }
        })
        setRefreshing(false)
    }
    const onFilterChange = (searchInfo) => {
        filter = { ...filter, ...searchInfo }
        setFilter(filter)
    }
    const handlerChooseMonth = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        await LoadDataDetail();
        await setCurrentTab({});
        await SheetManager.hide("sheetYear")
    }

    const onSelectItem = async (item) => {
        const dataByItem = JSON.parse(item.DataById || '[]')
        const dataSheet = {
            itemSelect: item,
            dataSheet: dataByItem
        }
        await SheetManager.show('sheetDetail', { payload: dataSheet })
    }
    const renderItem = ({ item, index }) => {
        return (
            <View>
                {
                    item.isParent && item.n1 &&
                    <View style={{ borderRadius: 8, backgroundColor: appcolor.primary, padding: 8 }}>
                        <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.white }}>{item.n1}</Text>
                    </View>
                }
                <TouchableOpacity
                    key={'ItemStore_' + index}
                    onPress={() => onSelectItem(item)}
                    style={{
                        backgroundColor: appcolor.surface, marginVertical: 10, borderRadius: 10, elevation: 6,
                        shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8 }}>
                        <Text style={{ width: '60%', fontWeight: '700', fontSize: 16, color: appcolor.dark }}>
                            {item.n2}
                        </Text>
                        <Text style={{ width: '40%', fontWeight: '500', fontSize: 16, color: appcolor.dark }}>{item.titleStore}{item.TotalStore}</Text>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <DashboardHeaderStock dataMain={item} />
                    </View>
                </TouchableOpacity >
            </View >
        )
    }

    useEffect(() => {
        const _load = LoadDataDetail()
        return () => { _load }
    }, [])

    const contains = (item, query) => {
        const { c1, n1, n2 } = item;
        let Sc1 = c1?.toLowerCase() || c1;
        let Sn1 = n1?.toLowerCase() || n1;
        let Sn2 = n2?.toLowerCase() || n2;
        return removeVietnameseTones(Sc1)?.match(removeVietnameseTones(query)) ||
            removeVietnameseTones(Sn1)?.match(removeVietnameseTones(query)) ||
            removeVietnameseTones(Sn2)?.match(removeVietnameseTones(query))
    };
    const handleSearch = (text) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const formattedQuery = text.toLowerCase();

        const filteredData = _.filter(data.dataF, dataDealer => { return contains(dataDealer, formattedQuery) })
        const { arr } = groupDataByKey({
            arr: filteredData,
            key: "DealerId"
        })
        setData({ ...data, dataById: arr })
    };

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light, alignItems: 'center' },
        modalStyle: { width: '100%', height: '100%', padding: 32, paddingTop: Platform.OS == 'ios' ? 48 : 0, backgroundColor: appcolor.light },
        bottomContainer: { width: '98%', height: 'auto', alignSelf: 'center', backgroundColor: appcolor.light },
        itemMonthStyle: { alignSelf: 'center', width: '100%', height: 'auto', borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: appcolor.grayLight },
        dateSytle: { width: '100%', alignItems: 'center', marginBottom: 8, backgroundColor: appcolor.light },
        viewTitleSellDate: { width: '100%', backgroundColor: appcolor.grayLight, flexDirection: 'row', alignItems: 'center', padding: 5, borderRadius: 8 },
        viewTitleShop: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8 },
        titleMonth: { width: '100%', fontSize: 16, color: appcolor.dark },
        titleSellDate: { width: '86%', fontSize: 16, color: appcolor.dark, padding: 8, fontWeight: '700' },
        titleShop: { width: '80%', fontSize: 15, color: appcolor.dark, padding: 8, fontWeight: '600' },
        contentView: { width: '100%' },
        viewProduct: { width: '95%', alignSelf: 'center' },
        itemStyle: { alignSelf: 'center', width: '90%', height: 'auto', flexDirection: 'row', borderRadius: 8, backgroundColor: appcolor.grayLight },
        sheetView: { width: '100%', height: deviceHeight },
    })

    const LoadDataByTab = (item) => {
        setCurrentTab(item)
        LoadDataDetail(item)
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                leftFunc={() => navigation.goBack()}
                title={`Doanh số chi tiết`}
                iconRight='calendar-alt'
                rightFunc={() => SheetManager.show("sheetYear")}
            />
            <LoadingView isLoading={refreshing} title='Đang cập nhật dữ liệu' styles={{ position: 'absolute', top: deviceHeight / 2.5 }} />
            {/* ListTab */}
            {!refreshing && <ListTab dataGroup={data.dataTab} LoadDataByTab={LoadDataByTab} currentTab={currentTab} />}
            {!refreshing && <FormGroup
                containerStyle={{ margin: 7, backgroundColor: appcolor.homebackground }}
                appcolor={appcolor}
                placeholder={'Tìm kiếm'}
                editable
                handleChangeForm={handleSearch}
                iconName="search"
            />}
            {!refreshing &&
                <FlatList
                    style={{
                        width: '100%', height: '100%', padding: 8,
                        backgroundColor: appcolor.light, marginBottom: Platform.OS == 'ios' ? 20 : 0
                    }}
                    keyExtractor={(_, index) => index.toString()}
                    data={data.dataById}
                    ListHeaderComponent={<DashboardHeaderStock dataMain={data.dataMain[0] || {}} />}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl
                        refreshing={false}
                        onRefresh={LoadDataDetail} />}
                    ListFooterComponent={<View style={{ height: deviceHeight * 0.7, backgroundColor: appcolor.light }} />}
                />
            }
            <ActionSheet id="sheetYear" containerStyle={{ backgroundColor: appcolor.light }}>
                <YearMonthSelected option={filter} onYearMonth={(search) => onFilterChange(search)} numMonth={4} />
                <TouchableOpacity onPress={() => handlerChooseMonth()}
                    style={{ marginBottom: 12, borderTopWidth: 0.31, borderTopColor: appcolor.primary }}>
                    <Text style={{ padding: 12, textAlign: 'center', color: appcolor.primary }}>Áp dụng</Text>
                </TouchableOpacity>
            </ActionSheet>

            <ActionSheet
                id='sheetDetail'
                onBeforeShow={setBeforeData}
                statusBarTranslucent
                gestureEnabled
                keyboardHandlerEnabled={false}
                containerStyle={{ backgroundColor: appcolor.light }}
                drawUnderStatusBar={Platform.OS == 'ios'}
                closable={true}
            >
                <SafeAreaView style={styles.sheetView}>
                    <SheetByItem beforeData={beforeData} />
                </SafeAreaView>
            </ActionSheet>
        </View>
    )
}

const ListTab = ({ dataGroup, LoadDataByTab, currentTab }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const LoadData = async () => {
        !loading && await setLoading(true)
        await setData(dataGroup)
        await setLoading(false)
    }
    useEffect(() => {
        const _load = LoadData()
        return () => { _load }
    }, [])
    const handleSelectTab = (item) => {
        LoadDataByTab(item)
    }
    return (
        <View style={{ flexDirection: 'row', width: '100%', padding: 8 }}>
            <ScrollView horizontal>
                {
                    !loading &&
                    data.map((it, idx) => {
                        return (
                            <TouchableOpacity onPress={() => handleSelectTab(it)} key={'TabGroup_' + idx} style={{
                                padding: 12, borderRadius: 50, borderWidth: 0.6,
                                borderColor: appcolor.primary, marginRight: 8,
                                backgroundColor: !currentTab.id && it.id == 1 ? appcolor.primary :
                                    (currentTab.id == it.id ? appcolor.primary : appcolor.light)
                            }}>
                                <Text style={{
                                    fontWeight: '600', fontSize: 14, color: !currentTab.id && it.id == 1 ? appcolor.white :
                                        (currentTab.id == it.id ? appcolor.white : appcolor.primary)
                                }}>{it.name}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
}

const SheetByItem = ({ beforeData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const LoadData = async () => {
        !loading && await setLoading(true)
        await setData({
            itemSelect: beforeData.itemSelect,
            dataSheet: beforeData.dataSheet,
            dataSheetF: beforeData.dataSheet
        })
        await setLoading(false)
    }
    useEffect(() => {
        const _load = LoadData()
        return () => { _load }
    }, [])
    const contains = (item, query) => {
        const { n1 } = item;
        let Sn1 = n1?.toLowerCase() || n1;
        return removeVietnameseTones(Sn1)?.match(removeVietnameseTones(query))
    };

    const handleSearch = (text) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const formattedQuery = text.toLowerCase();

        const filteredData = _.filter(data.dataSheetF, shop => { return contains(shop, formattedQuery) })
        setData({ ...data, dataSheet: filteredData })
    };
    return (
        <View style={{ flex: 1 }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
                <Text style={{ fontWeight: '600', fontSize: 20, color: appcolor.dark }}>{data.itemSelect?.n2}</Text>
            </View>
            {
                data?.itemSelect?.TotalStore && data?.itemSelect?.TotalStore > 0 &&
                <View style={{
                    backgroundColor: appcolor.light, margin: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between',
                    padding: 8, borderRadius: 12, elevation: 2, shadowColor: appcolor.black,
                    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2,
                }}>
                    {
                        data?.itemSelect?.TotalStore && data?.itemSelect?.TotalStore > 0 &&
                        <View style={{ width: '46%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: appcolor.black, }}>{data?.itemSelect?.titleStore}</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.primary, marginTop: 2, }}>{data?.itemSelect?.TotalStore}</Text>
                        </View>
                    }
                    {
                        data?.itemSelect?.TotalEmployee && data?.itemSelect?.TotalEmployee > 0 &&
                        <View style={{ width: '46%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: appcolor.black, }}>{data?.itemSelect?.titleEmployee}</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.primary, marginTop: 2, }}>{data?.itemSelect?.TotalEmployee}</Text>
                        </View>
                    }
                </View>
            }
            <FormGroup
                containerStyle={{ margin: 7, backgroundColor: appcolor.homebackground }}
                appcolor={appcolor}
                placeholder={'Tìm kiếm'}
                editable
                handleChangeForm={handleSearch}
                iconName="search"
            />
            <ScrollView style={{ padding: 8 }}>
                {
                    data?.dataSheet?.map((it, idx) => {
                        return (
                            <View
                                key={'ItemStore_' + idx}
                                style={{
                                    backgroundColor: appcolor.light, marginVertical: 4, borderRadius: 10, elevation: 6,
                                    shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6,
                                }}
                            >
                                <View style={{ padding: 8 }}>
                                    <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.dark }}>
                                        {it.n1} - <Text style={{ fontWeight: '600', fontSize: 16, fontStyle: 'italic', color: appcolor.dark }}>{it.c1}</Text>
                                    </Text>
                                    {
                                        it.s1 &&
                                        <Text style={{ fontWeight: '500', fontSize: 12, fontStyle: 'italic', color: appcolor.dark }}>
                                            {it.s1}
                                        </Text>
                                    }
                                    {
                                        it.EmployeeName &&
                                        <Text style={{ fontWeight: '500', fontSize: 12, fontStyle: 'italic', color: appcolor.dark }}>
                                            {it.EmployeeName}{it.EmployeeCode}
                                        </Text>
                                    }
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <DashboardHeaderStock dataMain={it} />
                                </View>
                            </View >
                        )
                    })
                }
                <View style={{ paddingBottom: deviceHeight / 2 }} />
            </ScrollView>
        </View>
    )
}

const DashboardHeaderStock = ({ dataMain }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const styles = StyleSheet.create({
        container: { flex: 1, padding: 10 },
        totalStoreContainer: { backgroundColor: appcolor.light, marginBottom: 10, alignItems: 'center', padding: 8, borderRadius: 12, elevation: 2, shadowColor: appcolor.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
        totalStoreTitle: { fontSize: 14, fontWeight: '500', color: appcolor.black, },
        totalStoreValue: { fontSize: 20, fontWeight: 'bold', color: appcolor.primary, marginTop: 2, },
        targetContainer: { flexDirection: 'row', justifyContent: 'space-between', },
        targetCard: { flex: 1, marginHorizontal: 4, padding: 8, borderRadius: 12, alignItems: 'center', elevation: 2, shadowColor: appcolor.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
        targetTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1, },
        targetValue: { fontSize: 16, fontWeight: 'bold', color: appcolor.dark, marginBottom: 4, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1, },
    });
    return (
        <View style={styles.container}>
            {/* Tổng */}
            {
                dataMain?.shopQuantity && dataMain?.shopQuantity > 0 &&
                <View style={styles.totalStoreContainer}>
                    <Text style={styles.totalStoreTitle}>{dataMain?.titleStore}</Text>
                    <Text style={styles.totalStoreValue}>{dataMain?.shopQuantity}</Text>
                </View>
            }
            {/* Targets */}
            <View style={styles.targetContainer}>
                {
                    dataMain?.totalTarget && dataMain?.totalTarget > 0 &&
                    <View style={[styles.targetCard, { backgroundColor: appcolor.surface }]}>
                        <Text style={[styles.targetTitle, { color: appcolor.dark }]}>
                            {dataMain?.titleTarget}
                        </Text>
                        <Text style={styles.targetValue}>{dataMain?.totalTarget}{dataMain?.unitTarget ? dataMain?.unitTarget : ''}</Text>
                    </View>
                }
                {
                    dataMain?.totalActual && dataMain?.totalActual > 0 &&
                    <View style={[styles.targetCard, { backgroundColor: appcolor.surface }]}>
                        <Text style={[styles.targetTitle, { color: appcolor.dark }]}>
                            {dataMain?.titleActual}
                        </Text>
                        <Text style={styles.targetValue}>{dataMain?.totalActual}{dataMain?.unitActual ? dataMain?.unitActual : ''}</Text>
                    </View>
                }
                {
                    dataMain?.totalActual && dataMain?.totalPercent > 0 &&
                    <View style={[styles.targetCard, { backgroundColor: appcolor.surface }]}>
                        <Text style={[styles.targetTitle, { color: appcolor.dark }]}>
                            {dataMain?.titlePercent}
                        </Text>
                        <Text style={styles.targetValue}>{dataMain?.totalPercent}{dataMain?.unitPercent ? dataMain?.unitPercent : ''}</Text>
                    </View>
                }
            </View>
        </View>
    )
}
