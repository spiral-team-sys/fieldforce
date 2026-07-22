import React, { useEffect } from "react"
import { useState } from "react"
import { Text, TouchableOpacity } from "react-native"
import { FlatList, ScrollView, View } from "react-native"
import ActionSheet, { SheetManager } from "react-native-actions-sheet"
import { useSelector } from "react-redux"
import { TimeSheetAPI } from "../../API/TimeSheetApi"
import { HeaderCustom } from "../../Content/HeaderCustom"
import LoadingDefault from "../../Control/ItemLoading/LoadingDefault"
import { YearMonthSelected } from "../../Control/YearMonthSelected"
const DATE = new Date()
export const ReportTimeSheet = ({ navigation, route }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })
    const onLoad = async (months) => {
        await setLoading(true)
        const monthChoose = months > 0 ? +months : filter.month
        const reportDate = `${filter.year}-${monthChoose > 9 ? monthChoose : "0" + monthChoose}-01`
        const result = await TimeSheetAPI.ReportTimeSheet(reportDate)
        if (result.statusId === 200) {
            await setData(result.data || [])
        }
        await setLoading(false)
        SheetManager.hide("sheetSearch")
    }
    const onSelectYear = (searchInfo) => {
        setFilter({ ...filter, ...searchInfo })
    }
    const rowItem = ({ item, index }) => {
        return (
            <View style={{ backgroundColor: index % 2 === 0 ? appcolor.light : appcolor.graylight, padding: 7 }} key={`${index}l9a`}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ flexGrow: 1, color: appcolor.dark }}>{item.nameVN}</Text>
                    <Text style={{ color: appcolor.dark, marginEnd: 20 }}>{item.colValue}</Text>
                </View>
            </View>)
    }
    useEffect(() => {
        onLoad(0)
    }, [])
    return (<View style={{ flex: 1 }}>
        <HeaderCustom
            title={`${kpiinfo?.menuNameVN}  ${filter.monthname}`}
            iconRight='search'
            leftFunc={() => navigation.goBack()}
            rightFunc={() => SheetManager.show("sheetSearch")}
        />
        <LoadingDefault styles={{ zIndex: 12 }} isLoading={loading} title='Cập nhật dữ liệu...' />
        <FlatList renderItem={rowItem}
            style={{ flex: 1 }}
            keyExtractor={(_, index) => `kka990${index}`}
            showsVerticalScrollIndicator={false}
            data={data} />
        <ActionSheet containerStyle={{ backgroundColor: appcolor.light }} id="sheetSearch">
            <ScrollView>
                <View>
                    <YearMonthSelected option={filter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
                    <TouchableOpacity onPress={() => onLoad(0)} style={{ borderTopColor: appcolor.surface, borderTopWidth: 1, alignItems: 'center' }}>
                        <Text style={{ color: appcolor.primary, padding: 7, marginBottom: 12 }}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ActionSheet>
    </View>)

}
