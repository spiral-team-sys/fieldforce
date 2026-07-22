import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { deviceWidth } from "../../../Core/Utility";

export const RowHeader = ({ filter }) => {
	const { appcolor } = useSelector(state => state.GAppState)

	const styles = StyleSheet.create({
		mainContainer: { backgroundColor: appcolor.light, padding: 8 },
		titleView: { width: deviceWidth / 4.2, fontWeight: '500', fontSize: 12, textAlign: 'center', flexGrow: 1, color: appcolor.greydark }
	})

	return (
		<View>
			<View style={styles.mainContainer}>
				<Text style={{ color: appcolor.dark }}>{filter.monthname}-{filter.yearname}</Text>
			</View>
			<View style={{ paddingTop: 12, paddingBottom: 12, backgroundColor: appcolor.surface, flexDirection: 'row' }}>
				<View style={{ flexGrow: 1, flexDirection: 'row' }}>
					<Text style={{ ...styles.titleView, textAlign: 'left', paddingStart: 10 }}>Type</Text>
					<Text style={styles.titleView}>Chỉ tiêu</Text>
					<Text style={styles.titleView}>Đạt được</Text>
					<Text style={styles.titleView}>Phần trăm (%)</Text>
				</View>
			</View>
		</View>
	)
}