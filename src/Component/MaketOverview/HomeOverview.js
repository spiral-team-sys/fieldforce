import React, { useEffect, useState } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { Divider, Icon } from '@rneui/themed';
import { useSelector } from "react-redux"
import { DashboardAPI } from "../../API/DashboardAPI";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { YearMonthSelected } from "../../Control/YearMonthSelected";
import { RowHeader } from "./ItemView/RowHeader";
import { LoadingView } from "../../Control/ItemLoading";
import { RowSummary } from "./ItemView/RowSummary";
const DATE = new Date()

export const HomeOverview = ({ navigation }) => {
	const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
	const [sumdata, setSumData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [rootdata, setRootData] = useState([]);
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
		}
		await setLoading(false)
	}
	const onSelectYear = (searchInfo) => {
		setFilter({ ...filter, ...searchInfo })
	}
	const onSeleted = async (item) => {
		await setTypeSelect(item.type);
	}
	useEffect(() => {
		const _load = onLoad()
		return () => _load;
	}, [])
	return (
		<View style={{ flex: 1, backgroundColor: appcolor.surface }}>
			<HeaderCustom
				title={kpiinfo?.menuNameVN}
				leftFunc={() => navigation.goBack()}
				iconRight="search"
				rightFunc={() => SheetManager.show("sheetFilter")} />
			<LoadingView isLoading={loading} title="Đang tải..." />
			<View style={{ flex: 1, padding: 8 }}>
				<FlatList data={sumdata}
					ListHeaderComponent={<RowHeader filter={filter} />}
					ListFooterComponent={<View style={{ paddingBottom: 16 }} />}
					keyExtractor={(_, index) => `ex${index}as`}
					renderItem={({ item, index }) => <RowSummary item={item} index={index} onSeleted={onSeleted} typeSelect={typeSelect} />}
					showsVerticalScrollIndicator={false}
				/>
			</View>
			<ActionSheet id="sheetFilter" containerStyle={{ backgroundColor: appcolor.surface }} >
				<YearMonthSelected option={filter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
				<View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
				<TouchableOpacity onPress={onLoad} style={{ marginBottom: 20, }}>
					<Text style={{ color: appcolor.primary, padding: 12, textAlign: 'center' }}>Áp dụng</Text>
				</TouchableOpacity>
			</ActionSheet>
		</View>
	)
}