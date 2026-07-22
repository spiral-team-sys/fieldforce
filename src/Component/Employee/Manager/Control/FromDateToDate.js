import moment from "moment"
import React from "react"
import { StyleSheet, View } from "react-native"
import ActionSheet, { SheetManager } from "react-native-actions-sheet"
import { Text } from '@rneui/themed'
import { useSelector } from "react-redux"
import FormGroup from "../../../../Content/FormGroup"
import { CalendarSelected } from "../../../../Control/CalendarSelected"

export const FromDateToDate = ({ title, fromDate, toDate, onFilterChangeTime }) => {
	const { appcolor } = useSelector(state => state.GAppState)

	const handlerShowCalendar = () => {
		SheetManager.show('fromtoview')
	}

	const styles = StyleSheet.create({
		mainItem: { flex: 1, backgroundColor: appcolor.light, padding: 8, paddingBottom: 0 },
		title: { color: appcolor.dark, fontSize: 13, padding: 5, fontWeight: "700" },
		containerStyleField: { backgroundColor: appcolor.placeholderBody, padding: 3 }
	})

	const valueTitle = `Từ ${fromDate !== null ? moment(fromDate).format('DD/MM/YYYY') : 'ngày'} - Đến ${toDate !== null ? moment(toDate).format('DD/MM/YYYY') : 'ngày'}`
	return (
		<View style={styles.mainItem}>
			<Text style={styles.title}>{title}<Text style={{ color: appcolor.red, fontSize: 13 }}>*</Text></Text>
			<FormGroup
				iconRight='calendar-alt'
				iconRightStyle={{ marginTop: 3 }}
				containerStyle={styles.containerStyleField}
				inputStyle={{ fontSize: 14, color: appcolor.blacklight }}
				value={valueTitle}
				rightFunc={handlerShowCalendar}
			/>
			<ActionSheet id='fromtoview'
				gestureEnabled
				drawUnderStatusBar={Platform.OS == 'ios'} >
				<View style={{ marginBottom: 16 }}>
					<CalendarSelected
						theme={{ calendarBackground: appcolor.light }}
						onChangeData={onFilterChangeTime} />
				</View>
			</ActionSheet>
		</View>
	)
}