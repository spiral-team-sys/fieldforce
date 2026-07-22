import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Icon, Text } from '@rneui/themed'
import { useSelector } from "react-redux"
import FormGroup from "../../../Content/FormGroup"
import { formatNumber } from "../../../Core/Helper"

export const ItemInput = ({
	titleName,
	iconName,
	isRequire,
	onActionRight,
	typeFilter,
	itemValue,
	placeholder,
	onChangeText,
	keyboardType = 'default',
	editable = true,
	maxValue = 0
}) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const widthItem = onActionRight !== undefined ? '90%' : '100%'

	const styles = StyleSheet.create({
		mainItem: { padding: 8, marginBottom: 1, width: '100%' },
		titleHeader: { width: '100%', fontSize: 13, fontWeight: '600', color: appcolor.blacklight, marginStart: 8 },
		placeholderHeader: { width: '100%', fontSize: 13, fontWeight: '300', color: appcolor.placeholderText, marginStart: 8, marginBottom: 8, fontStyle: 'italic' },
		inputView: { width: widthItem, backgroundColor: appcolor.surface, borderRadius: 5, marginBottom: 0 }
	})

	const onPress = () => {
		onActionRight?.(typeFilter, itemValue)
	}

	const handlerChangeValue = (text) => {
		let valueItem = text ?? ''

		if (maxValue > 0) {
			const check = valueItem.length > 0 ? parseInt(valueItem.replace(/,/gm, '')) : null
			if (valueItem.length > 0 && check > maxValue) {
				valueItem = formatNumber(maxValue, ',')
			}
		}

		onChangeText?.(valueItem, typeFilter)
	}

	return (
		<View style={styles.mainItem}>
			<View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
				{iconName && <Icon name={iconName} type="font-awesome-5" size={15} color={appcolor.blacklight} />}
				{titleName &&
					<Text style={styles.titleHeader}>{`${titleName} `}
						{isRequire && <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>}
					</Text>
				}
			</View>

			<Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>

			<View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
				<FormGroup
					selectTextOnFocus={true}
					keyboardType={keyboardType}
					containerStyle={styles.inputView}
					editable={editable}
					multiline={false}
					useClearAndroid={false}
					value={itemValue ?? ''}
					handleChangeForm={handlerChangeValue}
				/>

				{onActionRight !== undefined &&
					<TouchableOpacity
						style={{ width: '10%', padding: 8, marginStart: 5, backgroundColor: appcolor.info, borderRadius: 50 }}
						onPress={onPress}>
						<Icon type="font-awesome-5" name="search" size={18} color={appcolor.light} />
					</TouchableOpacity>
				}
			</View>
		</View>
	)
}