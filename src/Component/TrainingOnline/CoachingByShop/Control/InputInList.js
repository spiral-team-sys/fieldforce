import React from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { useSelector } from "react-redux"
import FormGroup from "../../../../Content/FormGroup"
import { formatNumber } from "../../../../Core/Helper"

export const InputInList = ({ typeKeyboard = 'default', dataInput, handlerChangeText, isUploaded = false }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const styles = StyleSheet.create({
		itemMain: { padding: 3 },
		viewMainChild: { padding: 5, paddingBottom: 0, width: '33%' }
	})
	const renderItem = ({ item, index }) => {
		const onChangeText = (text) => {
			handlerChangeText(dataInput, index, text)
		}
		return (
			<View key={`opi_${index}`} style={styles.viewMainChild}>
				<FormGroup
					editable={!isUploaded}
					keyboardType={typeKeyboard}
					title={item.ItemName}
					defaultValue={formatNumber(item.ItemValue)}
					placeholder='Nhập số lượng'
					titleStyle={{ color: appcolor.red }}
					containerStyle={{ padding: 0 }}
					clearButtonMode="never"
					useClearAndroid={false}
					handleChangeForm={onChangeText}
				/>
			</View>
		)
	}
	return (
		<View style={styles.itemMain}>
			<FlatList
				data={dataInput}
				renderItem={renderItem}
				showsHorizontalScrollIndicator={false}
				numColumns={3}
			/>
		</View>
	)
}