import React from "react"
import { StyleSheet, View } from "react-native"
import { Icon, Text } from '@rneui/themed'
import { formatNumber } from "../../../Core/Helper"
import { useSelector } from "react-redux"

export const CostItemView = ({ title, name, iconName, isUnit = true, isFormat = true, unitTitle = null }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const styles = StyleSheet.create({
		costItemView: { flexDirection: 'row', alignItems: 'center' },
		itemCost: { fontSize: 13, fontWeight: '400' }
	})
	return (
		<View style={styles.costItemView}>
			{iconName !== undefined && iconName.length > 0 &&
				<Icon name={iconName} size={15} color={appcolor.greylight} style={{ width: 30, padding: 3 }} type='font-awesome-5' />
			}
			<Text style={styles.itemCost}>{`${title} ${name == 0 ? 0 : (isFormat ? formatNumber(name, ',') : name)} ${isUnit ? (unitTitle || 'VNĐ') : ''}`}</Text>
		</View>
	)
}