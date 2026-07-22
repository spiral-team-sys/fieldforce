import React, { useState } from "react"
import { useSelector } from "react-redux"
import { updateItemDisplay } from "../../../../Controller/DisplayController"
import { TextInput, View } from "react-native"
import NumberFormat from "react-number-format"

export const InputQuantity = ({ item, index }) => {
	const { appcolor, workinfo } = useSelector(state => state.GAppState)
	const [___, setMutate] = useState(false)
	const changeValue = async (text) => {
		let display = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
		item.quanity = display !== null ? parseInt(display) : null
		await updateItemDisplay(item, workinfo)
		setMutate(e => !e)
	}
	return (
		<View key={`ppd_${index}`} style={{ flex: 1, alignSelf: 'center' }}  >
			<NumberFormat
				value={item.quanity || ''}
				displayType='text'
				thousandSeparator={true}
				renderText={value =>
					<TextInput
						textAlign={'center'}
						value={value}
						style={{ fontSize: 13, color: appcolor.dark, padding: 8, backgroundColor: appcolor.light, fontWeight: '500', textAlign: 'center', borderRadius: 5 }}
						keyboardType='numeric'
						placeholder='SL'
						placeholderTextColor={appcolor.greydark}
						editable={item.upload == 0}
						selectTextOnFocus
						onChangeText={changeValue}
					/>
				}
			/>
		</View>
	)
}