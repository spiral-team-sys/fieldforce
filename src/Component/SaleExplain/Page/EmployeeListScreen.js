import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, } from "react-native";
import { useSelector } from "react-redux";
import { removeVietnameseTones } from "../../../Core/Helper";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { SearchData } from "../../../Control/SearchData/SearchData";
import _ from 'lodash';
import { REPORT } from "../../../API/ReportAPI";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { YearMonthSelected } from "../../../Control/YearMonthSelected";
import { deviceWidth } from "../../../Core/Utility";
import CustomListView from "../../../Control/Custom/CustomListView";

const getCacheDate = () => {
    const date = new Date();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${date.getFullYear()}${month}${day}`;
};

const createDefaultFilter = () => ({
    year: new Date().getFullYear(),
    yearname: `Năm ${new Date().getFullYear()}`,
    month: new Date().getMonth() + 1,
    monthname: `Tháng ${new Date().getMonth() + 1}`,
    cacheDate: getCacheDate(),
});

const EmployeeListScreen = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector((state) => state.GAppState);
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [dataMain, setDataMain] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState(createDefaultFilter())
    let debounceTimeout

    const KeyStore = `SALEEXPLAIN_${kpiinfo.id}`
    const styles = useMemo(() => createStyles(appcolor), [appcolor]);

    const buildFilterCache = (selectedFilter = filter) => ({
        ...selectedFilter,
        cacheDate: getCacheDate(),
    });

    const getValidCacheFilter = async () => {
        const dataCache = await AsyncStorage.getItem(KeyStore);
        if (!dataCache) return null;

        const itemCache = JSON.parse(dataCache || '{}');
        if (itemCache.cacheDate !== getCacheDate()) {
            await AsyncStorage.removeItem(KeyStore);
            return null;
        }

        return itemCache;
    };

    const loadData = async (selectedFilter = filter) => {
        try {
            setLoading(true);

            const params = { reportId: kpiinfo.id, typeReport: 'LIST_EMPLOYEE', month: selectedFilter.month, year: selectedFilter.year }
            await REPORT.GetDataReportByShop_RealTime(params, async (mData) => {
                setDataMain(mData)
            })
        } catch (error) {
            toastError("Thông báo", "Không tải được dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initData();
    }, []);

    const initData = async () => {
        const cacheFilter = await getValidCacheFilter();
        const selectedFilter = cacheFilter || createDefaultFilter();

        setFilter(selectedFilter);
        loadData(selectedFilter);
    };

    const _searchData = (filterList) => {
        const valueSearch = removeVietnameseTones(search.text).toLowerCase()
        // 
        const searchData = _.filter(filterList, (item) => {
            const name = removeVietnameseTones((item.employeeName || "").toLowerCase());
            const code = removeVietnameseTones((item.employeeCode || "").toLowerCase());
            const shop = removeVietnameseTones((item.shopName || "").toLowerCase());

            return name.includes(valueSearch) || code.includes(valueSearch) || shop.includes(valueSearch);
        })
        return searchData
    }

    const onPressEmployee = (employee) => {
        navigation.navigate("homesaleexplain", { employee, filter });
    };

    const onSearchData = (text) => {
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => {
            search.text = text
            const listUpdate = _searchData(dataMain)
            setDataMain(listUpdate)
        }, 100)
    }
    const showMonth = async () => {
        const itemCache = await getValidCacheFilter();
        if (itemCache && (itemCache.month != filter.month || itemCache.year != filter.year)) {
            await AsyncStorage.setItem(KeyStore, JSON.stringify(buildFilterCache(filter)))
        }
        SheetManager.show("monthSheetEmployee");
    }
    const handleCloseMonth = async () => {
        const itemFilter = buildFilterCache({ ...filter, month: filter.month, monthname: `Tháng ${filter.month}`, year: filter.year, yearname: `Năm ${filter.year}` })
        await AsyncStorage.setItem(KeyStore, JSON.stringify(itemFilter));
        setFilter(itemFilter)
        loadData(itemFilter)
    }
    const onSelectYear = (searchInfo) => {
        setFilter({ ...filter, ...searchInfo })
    }

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => onPressEmployee(item)}
            >
                <View style={styles.cardTop}>
                    <Text style={styles.name}>{item.employeeName}</Text>
                    <Text style={styles.code}>{item.employeeCode}</Text>
                </View>
                <Text style={styles.subText}>Chức vụ: {item.typeName}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || "Giải trình số bán"}
                leftFunc={() => navigation.goBack()}
                rightFunc={() => showMonth()}
                iconRight={"calendar"}
            />
            <View style={{ flex: 1, backgroundColor: appcolor.light }}>

                <TouchableOpacity style={styles.monthYearStyle} onPress={showMonth} >
                    <Text style={styles.monthYearText}  >
                        {filter.monthname} {filter.yearname}
                    </Text>
                </TouchableOpacity>

                <View style={styles.searchWrap}>
                    <SearchData
                        placeholder={`Tìm kiếm`}
                        value={search.text}
                        onSearchData={onSearchData}
                    />
                </View>

                <CustomListView
                    data={dataMain}
                    extraData={dataMain}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>Không tìm thấy nhân viên</Text>
                        </View>
                    }
                />
            </View>
            <ActionSheet
                id={'monthSheetEmployee'}
                containerStyle={{ backgroundColor: appcolor.surface, borderWidth: 0.2, borderColor: appcolor.dark }}
                onClose={() => handleCloseMonth()}
                initialOffsetFromBottom={1}
                gestureEnabled={true}
                indicatorColor={'#f0f0f0'}
                defaultOverlayOpacity={0.5}
            >
                <View style={{ width: deviceWidth, minHeight: '40%', paddingBottom: 30 }} >
                    <YearMonthSelected option={filter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
                </View>
            </ActionSheet>
        </View>
    );
};

export default EmployeeListScreen;

const createStyles = (appcolor) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: appcolor?.light || "#F9FAFB", },
        monthYearStyle: {
            flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, marginVertical: 8, borderWidth: 1,
            borderColor: appcolor.primary, borderRadius: 16, backgroundColor: appcolor.surface, alignSelf: 'center', paddingHorizontal: 16, minWidth: 120,
        },
        monthYearText: { fontSize: 16, color: appcolor.primary, fontWeight: 'bold', letterSpacing: 1, },
        searchWrap: { paddingHorizontal: 16, paddingBottom: 8, },
        searchInput: {
            backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB",
            paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111827",
        },
        card: {
            backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.05,
            shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        },
        cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, },
        name: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1, marginRight: 10, },
        code: { fontSize: 13, fontWeight: "700", color: "#2563EB", },
        subText: { fontSize: 13, color: "#4B5563", marginBottom: 4, },
        emptyWrap: { alignItems: "center", marginTop: 40, },
        emptyText: { color: "#6B7280", fontSize: 15, },
    });
