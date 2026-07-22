import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { DataSummary } from "../../../../Controller/DashboardController";
import { Text } from '@rneui/themed';
import { deviceWidth } from "../../../../Core/Utility";
import CustomListView from "../../../../Control/Custom/CustomListView";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

export const DashboardStatus = ({ navigation, typeDashboard, isLoadMain }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [loading, setLoading] = useState(false)
	const [dataDashboard, setDataDashboard] = useState([])

	const LoadDashBoard = async () => {
		await setLoading(true)
		await DataSummary(typeDashboard, async (mData) => {
			await setDataDashboard(mData)
		})
		await setLoading(false)
	}

	useEffect(() => {
		LoadDashBoard()
	}, [isLoadMain])

	const styles = StyleSheet.create({
		mainContainer: { backgroundColor: appcolor.light, padding: 8 },
		titleHeader: { fontSize: 13, fontWeight: fontWeightBold, fontStyle: 'italic', color: appcolor.primary },
		contentMain: { width: '100%', height: 100, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', paddingTop: 12 },
		itemMain: { width: deviceWidth / (dataDashboard.length + 0.2), borderEndColor: appcolor.grey },
		titleValue: { fontSize: 32, fontWeight: '800', color: appcolor.blacklight },
		titleName: { fontSize: 12, fontWeight: '400', color: appcolor.blacklight }
	})

	const renderItem = ({ item, index }) => {
		return (
			<View key={`piop_${index}`} style={{ ...styles.itemMain, borderEndWidth: (index + 1) == dataDashboard.length ? 0 : 2 }}>
				<View style={{ padding: 8, alignItems: 'center' }}>
					<Text style={styles.titleValue}>{item.countEmployee || ''}</Text>
					<Text style={styles.titleName}>{item.nameVN || ''}</Text>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.mainContainer}>
			<Text style={styles.titleHeader}>Thống kê nhân viên</Text>
			<View style={styles.contentMain}>
				<CustomListView
					horizontal
					pagingEnabled
					data={dataDashboard}
					renderItem={renderItem}
					endView={{ paddingEnd: 0 }}
				/>
			</View>
		</View>
	)
}