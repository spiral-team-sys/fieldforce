import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { deviceHeight, fontWeightBold } from "../../../Themes/AppsStyle";
import { Icon } from "@rneui/base";
import { useSelector } from "react-redux";
import { YearMonthSelected } from "../../../Control/YearMonthSelected";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import LoadingDefault from "../../../Control/ItemLoading/LoadingDefault";
import { FlashList } from "@shopify/flash-list";
import _ from 'lodash'
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { REPORT } from "../../../API/ReportAPI";
import { URLDEFAULT } from "../../../Core/URLs";

const { width } = Dimensions.get('window');

const SummaryTargetTF = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [dataMain, setDataMain] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [dateSelected, setDateSelected] = useState({})
    const DATE = new Date()
    var filter = { "year": dateSelected?.year || DATE.getFullYear(), "yearname": `Năm ${dateSelected?.year || DATE.getFullYear()}`, "month": dateSelected?.month || DATE.getMonth() + 1, "monthname": `Tháng ${dateSelected?.month || DATE.getMonth() + 1}` }

    const LoadData = () => {
        setLoading(true)
        const params = { month: DATE.getMonth() + 1, year: DATE.getFullYear(), typeReport: 'SUMMARYTARGET', reportId: kpiinfo.id }
        REPORT.GetDataReportByShop_RealTime(params, (data) => {
            setDataMain(data)
        })
        setLoading(false)
    }
    useEffect(() => {
        LoadData()
    }, [])

    const onFilterChange = (searchInfo) => {
        setLoading(true)
        const params = { month: searchInfo.month, year: searchInfo.year, typeReport: 'SUMMARYTARGET', reportId: kpiinfo.id }
        REPORT.GetDataReportByShop_RealTime(params, (data) => {
            setDataMain(data)
        })
        setDateSelected({ month: searchInfo.month, year: searchInfo.year })
        setLoading(false)
    }

    const onFilter = () => {
        SheetManager.show('yearMonthSelected')
    }

    const renderItem = ({ item, index }) => {
        return (
            <View key={index} style={styles.cardItem}>
                <View style={styles.row}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: URLDEFAULT + item.imageUrl }}
                            style={styles.shopImage}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.infoContainer}>
                        <View style={styles.rowBetween}>
                            <Text numberOfLines={2} style={styles.shopName}>{item.shopName}</Text>
                            <Text style={styles.type}>{item.type}</Text>
                        </View>
                        <Text style={styles.shopCode}>{item.shopCode}</Text>
                        <Text style={styles.shopId}>{item.shopId}</Text>
                        <View style={styles.rowBetween}>
                            <Text style={styles.target}>Target: <Text style={styles.targetValue}>{item.targetUnit}</Text></Text>
                            <Text style={styles.actual}>Actual: <Text style={styles.actualValue}>{item.actualUnit}</Text></Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const styles = StyleSheet.create({
        card: { width: '100%', height: '100%', padding: 16, backgroundColor: appcolor.light },
        cardItem: { backgroundColor: appcolor.light, shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 4, borderRadius: 14, marginBottom: 14, padding: 12 },
        row: { flexDirection: 'row', alignItems: 'center' },
        rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
        imageContainer: { marginRight: 12 },
        shopImage: { width: width * 0.18, height: width * 0.18, borderRadius: 12 },
        infoContainer: { flex: 1 },
        shopName: { fontSize: 15, fontWeight: fontWeightBold, color: appcolor.dark, flex: 1, marginBottom: 2 },
        type: { fontSize: 12, color: appcolor.primary, fontWeight: '500', marginLeft: 8 },
        shopCode: { fontSize: 12, color: appcolor.grey, fontWeight: '500', marginBottom: 1 },
        shopId: { fontSize: 12, color: appcolor.grey, fontWeight: '500', marginBottom: 4 },
        target: { fontSize: 12, color: appcolor.grey, fontWeight: '500' },
        targetValue: { color: appcolor.primary, fontWeight: fontWeightBold },
        actual: { fontSize: 12, color: appcolor.grey, fontWeight: '500', marginLeft: 20 },
        actualValue: { color: appcolor.success, fontWeight: fontWeightBold },
    })

    if (isLoading) return <LoadingDefault isLoading={isLoading} />
    return (
        <View style={{ backgroundColor: appcolor.light, height: '100%', width: '100%' }}>
            <HeaderCustom title={'Tổng số target'} leftFunc={() => navigation.goBack()} rightFunc={onFilter} iconRight={'calendar-alt'} />
            <View style={styles.card}>
                <View style={{ flex: 1, width: '100%' }}>
                    <FlashList
                        data={dataMain}
                        renderItem={renderItem}
                        estimatedItemSize={200}
                        extraData={[dataMain]}
                        keyExtractor={(_, index) => index.toString()}
                        ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 10 }} />}
                        ListEmptyComponent={
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                                <Icon name="inbox" type="font-awesome-5" size={48} color={appcolor.grey} style={{ marginBottom: 16 }} />
                                <Text style={{ fontSize: 16, color: appcolor.grey, textAlign: 'center' }}>
                                    Không có dữ liệu
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
            <ActionSheet id="yearMonthSelected">
                <YearMonthSelected option={filter} onYearMonth={(search) => onFilterChange(search)} numMonth={4} />
            </ActionSheet>
        </View>
    )
}

export default SummaryTargetTF;