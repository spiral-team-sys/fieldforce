import React, { useEffect, useState } from "react"
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { Badge, Divider, Icon } from '@rneui/themed';
import { useSelector } from "react-redux"
import { DashboardAPI } from "../../API/DashboardAPI";
import { HeaderCustom } from "../../Content/HeaderCustom";
import LoadingDefault from "../../Control/ItemLoading/LoadingDefault";
import { YearMonthSelected } from "../../Control/YearMonthSelected";
const DATE = new Date()
export const MaketOverView = ({ navigation, route }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
    const [sumdata, setSumData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rootdata, setRootData] = useState([]);
    const [seleteddata, setSelectData] = useState([])
    const [typeSelect, setTypeSelect] = useState('');
    const [filter, setFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })
    const onLoad = async () => {
        await setLoading(true)
        await SheetManager.hide("sheetFilter")
        await setTypeSelect('')
        const result = await DashboardAPI.MaketOverView(filter.month, filter.year)
        if (result.statusId === 200) {//
            const _data = await result.data || [];
            const _sumtag = await _data.filter(f => f.provinceCode === 0);
            await setRootData(_data);
            await setSumData(_sumtag);
        } else {
            await setRootData([])
            await setSumData([])
            await setSelectData([])
        }
        await setLoading(false)
    }
    const onSelectYear = (searchInfo) => {
        setFilter({ ...filter, ...searchInfo })
    }
    const onSeleted = async (item) => {
        const details = await rootdata.filter(d => d.type === item.type && d.provinceCode > 0).sort((a, b) => {
            return a.provinceCode - b.provinceCode
        });
        await setSelectData(details);
        await setTypeSelect(item.type);
    }
    const rowSum = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={() => onSeleted(item)} key={`${index}009q`} style={{ backgroundColor: typeSelect === item.type ? appcolor.surface : appcolor.light, paddingBottom: 10 }}>
                <Text style={{ color: appcolor.greylight, fontSize: 10, margin: 3 }}>{item.type}</Text>
                <View style={{ flexDirection: 'row', width: '100%' }}>
                    <Text style={{ width: "24%", fontWeight: '400', fontSize: 16, color: appcolor.danger }}>
                        {typeSelect === item.type && <Icon color={appcolor.danger} name="arrow-drop-down" />}
                    </Text>
                    <Text style={{ width: "24%", textAlign: 'left', fontWeight: '400', fontSize: 13, color: appcolor.danger }}>{item?.targetValue || 0}{item.unit}</Text>
                    <Text style={{ width: "24%", textAlign: 'left', fontWeight: '400', fontSize: 13, color: appcolor.success }}>{item?.actualValue || 0}{item.unit}</Text>
                    <Text style={{ width: "24%", textAlign: 'right', fontWeight: '400', fontSize: 13, color: appcolor.primary }}>{item?.percentText || '-'}</Text>
                </View>
            </TouchableOpacity>)
    }
    const rowDetails = ({ item, index }) => {
        return (
            <View style={{ backgroundColor: appcolor.light, padding: 7 }} key={`dd${index}29`}>
                {item.category === null &&
                    <View>
                        <Text style={{ fontWeight: '900', color: appcolor.dark }}>{item.province}</Text>
                        <View style={{ borderColor: appcolor.surface, borderWidth: 1, marginTop: 10, width: '100%' }} />
                    </View>
                }
                <View style={{ flexDirection: 'row', padding: 7, width: '100%' }}>
                    <Text style={{ fontSize: 12, width: '30%', color: appcolor.dark }}>{item.category}</Text>
                    <Text style={{ fontWeight: item.category === null ? 'bold' : 'normal', fontSize: 12, width: '23%', color: appcolor.dark }}>{item.targetValue}{item.unit}</Text>
                    <Text style={{ fontWeight: item.category === null ? 'bold' : 'normal', fontSize: 12, width: '24%', color: appcolor.dark }}>{item.actualValue}{item.unit}</Text>
                    <Text style={{ fontWeight: item.category === null ? 'bold' : 'normal', fontSize: 12, width: '24%', color: appcolor.dark }}>{item.percentText}</Text>
                </View >
            </View >
        )
    }
    useEffect(() => {
        const _load = onLoad()
        return () => _load;
    }, [])
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <HeaderCustom leftFunc={() => navigation.goBack()} iconRight="search"
                rightFunc={() => SheetManager.show("sheetFilter")} title={kpiinfo?.menuNameVN} />
            <LoadingDefault styles={{ zIndex: 100 }} isLoading={loading} title="Đang tải..." />
            <View style={{ padding: 7 }}>
                <FlatList data={sumdata}
                    scrollEnabled={false}
                    ListHeaderComponent={
                        <View>
                            <View style={{ backgroundColor: appcolor.light, padding: 8 }}>
                                <Text style={{ color: appcolor.dark }}>{filter.monthname}-{filter.yearname}</Text>
                            </View>
                            <View style={{ paddingTop: 12, paddingBottom: 12, backgroundColor: appcolor.surface, flexDirection: 'row' }}>
                                <View style={{ flexGrow: 1, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: '500', fontSize: 12, textAlign: 'center', flexGrow: 1, color: appcolor.greydark }}>Type</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 12, textAlign: 'center', flexGrow: 1, color: appcolor.greydark }}>Chỉ tiêu</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 12, textAlign: 'center', flexGrow: 1, color: appcolor.greydark }}>Đạt được</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 12, textAlign: 'center', flexGrow: 1, color: appcolor.greydark }}>Phần trăm (%)</Text>
                                </View>
                            </View>
                        </View>}
                    keyExtractor={(_, index) => `ex${index}as`}
                    renderItem={rowSum}
                />
            </View>
            {seleteddata?.length > 0 &&
                <ScrollView style={{ padding: 7, marginBottom: 16 }}>
                    <Text style={{ padding: 7, color: appcolor.danger, fontSize: 17, fontWeight: '600' }}>Chi tiết {typeSelect}</Text>
                    <FlatList data={seleteddata}
                        renderItem={rowDetails}
                        scrollEnabled={false}
                        keyExtractor={(_, index) => `${index}29lla`}
                    />
                </ScrollView>
            }
            <ActionSheet id="sheetFilter" containerStyle={{ backgroundColor: appcolor.surface }} >
                <YearMonthSelected option={filter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
                <TouchableOpacity onPress={onLoad} style={{ marginBottom: 20, }}>
                    <Text style={{ color: appcolor.primary, padding: 12, textAlign: 'center' }}>Áp dụng</Text>
                </TouchableOpacity>
            </ActionSheet>
        </View>
    )
}