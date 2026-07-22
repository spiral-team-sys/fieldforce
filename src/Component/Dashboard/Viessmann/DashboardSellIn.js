import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, processColor } from "react-native";
import { DataSummary } from "../../../Controller/DashboardController";
import { deviceHeight } from "../../../Core/Utility";
import { useSelector } from "react-redux";
import { Icon, Text } from "@rneui/base";
import { IconAnimation } from "../../../Control/IconAnimation/IconAnimation";
import _ from 'lodash'
import { BarChart } from "react-native-charts-wrapper";

export const DashboardSellInVSM = ({ navigation, typeDashboard }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [dataSellIn, setDataSellIn] = useState([])
	const [isLoading, setLoading] = useState(false)
	const [itemChart, setItemChart] = useState({})

	const LoadData = async () => {
		await setLoading(true)
		await DataSummary(typeDashboard, async (mData) => {
			await setDataSellIn(mData)
			await configView(mData)
		});
		await setLoading(false)
	}
	const configView = async (data) => {
		const chartName = data[0]?.chartName || `Số bán (SellIn)`
		const pageName = data[0]?.pageName || 'dashboardDetail'
		const actualValue = _.map(data, 'actual')
		const targetValue = _.map(data, 'target')
		const confirmValue = _.map(data, 'confirm')
		const xAxisValue = _.map(data, 'xAxis')
		const axisMaximum = data.length

		const legend = {
			enabled: true,
			textSize: 10,
			form: "CIRCLE",
			formSize: 10,
			xEntrySpace: 10,
			yEntrySpace: 5,
			wordWrapEnabled: true,
			horizontalAlignment: 'RIGHT',
			textColor: processColor(appcolor.dark)
		}
		const xAxis = {
			valueFormatter: xAxisValue,
			granularityEnabled: true,
			granularity: 1,
			axisMaximum: axisMaximum,
			axisMinimum: 0,
			centerAxisLabels: true,
			drawGridLines: false,
			position: 'BOTTOM',
			textSize: 9,
			xOffset: 0,
			textColor: processColor(appcolor.dark)
		}
		const yAxis = {
			zeroLine: { enabled: true },
			limitLines: [{ limit: 1 }],
			left: { drawGridLines: false, enabled: false },
			right: { drawGridLines: false, enabled: false }
		}
		const dataChart = {
			dataSets: [{
				values: targetValue,
				label: 'Target',
				config: {
					drawValues: true,
					valueTextColor: processColor(appcolor.dark),
					colors: [processColor('#336699')],
				}
			},
			{
				values: actualValue,
				label: 'Actual',
				config: {
					drawValues: true,
					valueTextColor: processColor(appcolor.dark),
					colors: [processColor('#FFAC1C')],
				}
			},
			{
				values: confirmValue,
				label: 'Confirm',
				config: {
					drawValues: true,
					valueTextColor: processColor(appcolor.dark),
					colors: [processColor('#6ec793')],
				}
			}],
			config: {
				barWidth: 0.3,
				group: {
					fromX: 0,
					groupSpace: 0.1,
					barSpace: 0
				}
			}
		}

		await setItemChart({ chartName: chartName, pageName: pageName, legend: legend, xAxis: xAxis, yAxis: yAxis, dataChart: dataChart })
	}
	useEffect(() => {
		const _load = LoadData()
		return () => _load
	}, [])
	const styles = StyleSheet.create({
		mainContainer: { flex: 1, padding: 8, minHeight: deviceHeight / 4 },
		titleDashboard: { width: '80%', fontSize: 16, fontWeight: '700', color: appcolor.blacklight },
		headerContent: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
		actionSync: { borderRadius: 30, borderWidth: 0.3, borderColor: appcolor.dark, padding: 5, position: 'absolute', end: 0 }
	})
	return (
		<View style={styles.mainContainer}>
			<View style={styles.headerContent}>
				<Icon name="chart-bar" type="font-awesome-5" size={18} color={appcolor.blacklight} style={{ padding: 5 }} />
				<Text style={styles.titleDashboard}>{itemChart.chartName || 'Thống kê số bán (Sell In)'}</Text>
				<TouchableOpacity onPress={isLoading ? null : LoadData} style={styles.actionSync}>
					<IconAnimation isLoop={isLoading} sourceIcon={require('../../../Themes/lotties/sync_load.json')} />
				</TouchableOpacity>
			</View>
			<TouchableOpacity style={{ width: '100%' }} onPress={() => navigation.navigate(itemChart.pageName)}>
				<View style={{ width: '100%', minHeight: deviceHeight / 4.5, padding: 8 }}>
					<BarChart
						style={{ flex: 1 }}
						xAxis={itemChart.xAxis}
						yAxis={itemChart.yAxis}
						data={itemChart.dataChart}
						legend={itemChart.legend}
						marker={{ enabled: false }}
						pinchZoom={false}
						borderWidth={1}
						doubleTapToZoomEnabled={false}
						drawHighlightArrow={false}
						drawBarShadow={false}
						drawValueAboveBar={false}
						chartDescription={{ textSize: 0, text: ' ' }}
					/>
				</View>
			</TouchableOpacity >
		</View>
	)
}