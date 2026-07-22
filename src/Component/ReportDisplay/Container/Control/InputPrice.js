import React, { useState } from "react"
import { useSelector } from "react-redux"
import { updateItemDisplay } from "../../../../Controller/DisplayController"
import { ToastError } from "../../../../Core/Helper"
import { StyleSheet, TextInput, View } from "react-native"
import NumberFormat from "react-number-format"

const InputPrice = ({ item, index }) => {
	const { appcolor, workinfo } = useSelector(state => state.GAppState)
	const [_, setMutate] = useState(false)
	const changeValue = (text) => {
		let price = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
		item.price = parseInt(price)
		setMutate(e => !e)
		updateItemDisplay(item, workinfo)
	}
	const checkValuePrice = async () => {
		const priceValue = parseInt(item.price)
		if (priceValue < 10000) {
			ToastError(`Giá sản phẩm ${item.productName} không được nhỏ hơn 10,000 VNĐ`, "Thông báo", "top");
			item.price = null
			item.checkValue = 1
			setMutate(e => !e)
			await updateItemDisplay(item, workinfo)
			return
		} else if (priceValue % 1000 > 0) {
			ToastError(`Giá sản phẩm ${item.productName} không được nhập số lẻ`, "Thông báo", "top");
			item.price = null
			item.checkValue = 1
			setMutate(e => !e)
			await updateItemDisplay(item, workinfo)
			return
		} else {
			item.checkValue = 0
			setMutate(e => !e)
		}
	}
	const styles = StyleSheet.create({
		styleInput: {
			fontSize: 13, color: appcolor.dark, padding: 8, fontWeight: '500', textAlign: 'center', borderRadius: 5,
			backgroundColor: item.checkValue == 0 ? appcolor.light : appcolor.warning,
		}
	})
	return (
		<View key={`ppd_${index}`} style={{ flex: 2, alignSelf: 'center', marginStart: 5 }}  >
			<NumberFormat
				value={item.price || ''}
				displayType='text'
				thousandSeparator={true}
				renderText={value =>
					<TextInput
						textAlign={'center'}
						value={value}
						style={styles.styleInput}
						keyboardType='numeric'
						placeholder='Giá'
						placeholderTextColor={appcolor.greydark}
						editable={item.upload == 0}
						selectTextOnFocus
						onChangeText={changeValue}
						onEndEditing={checkValuePrice}
					/>
				}
			/>
		</View>
	)
}