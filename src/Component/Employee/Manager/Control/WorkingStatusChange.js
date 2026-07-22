import React from "react"
import { View } from "react-native"
import { StyleSheet } from "react-native"
import { Text } from '@rneui/themed'
import { useSelector } from "react-redux"
import { MutipleItemSelected } from "../../../../Control/MutipleItemSelected"

export const WorkingStatusChange = ({ title, value, statusList = null, onChange }) => {
	const { appcolor } = useSelector(state => state.GAppState)

	const handlerChoose = (item, typeItem) => {
		onChange(item, typeItem)
	}

	const styles = StyleSheet.create({
		mainItem: { flex: 1, padding: 8, paddingBottom: 0 },
		title: { color: appcolor.dark, fontSize: 13, padding: 5, fontWeight: "700" },
		contenMain: { width: '100%' }
	})
	return (
		<View style={styles.mainItem}>
			<Text style={styles.title}>{title}</Text>
			<View style={styles.contenMain}>
				{statusList !== null && statusList.length > 0 &&
					<MutipleItemSelected
						containerStyle={{ padding: 0 }}
						typeItem='workingstatus'
						defaultValue={value}
						dataItems={statusList}
						onItemChoose={handlerChoose}
						isHorizontal={false}
					/>
				}
			</View>
		</View>
	)
}