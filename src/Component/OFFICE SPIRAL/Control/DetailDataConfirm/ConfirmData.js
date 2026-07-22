import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { UtilityOffice } from "../UtilityOffice";

export const ConfirmData = ({ typeConfirm, typeNote, itemConfirm, actionConfirm, actionError }) => {
	const { appcolor } = useSelector(state => state.GAppState)

	const onConfirm = () => {
		actionConfirm(1)
		actionError(null)
	}
	const onReject = () => {
		actionConfirm(-1)
		if (itemConfirm[typeConfirm] == -1) {
			const confirmNote = itemConfirm[typeNote] || null
			if (confirmNote == null || confirmNote.length == 0)
				actionError(UtilityOffice.errorNoteTitle)
		}
	}

	const styles = StyleSheet.create({
		mainContainer: { alignItems: 'center', flexDirection: "row", position: 'absolute', top: 8, end: 0 },
		viewConfirm: { minWidth: 50, padding: 5, backgroundColor: itemConfirm[typeConfirm] == 1 ? appcolor.success : itemConfirm[typeConfirm] == -1 ? appcolor.grey : appcolor.info, borderRadius: 5 },
		viewReject: { minWidth: 50, padding: 5, backgroundColor: itemConfirm[typeConfirm] == -1 ? appcolor.red : itemConfirm[typeConfirm] == 1 ? appcolor.grey : appcolor.info, marginEnd: 5, borderRadius: 5 }
	})
	return (
		itemConfirm.isConfirm == 1 ?
			<View style={styles.mainContainer}>
				<TouchableOpacity style={styles.viewReject} onPress={onReject}>
					<Icon name="close" color={appcolor.light} size={18} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.viewConfirm} onPress={onConfirm}>
					<Icon name="check" color={appcolor.light} size={18} />
				</TouchableOpacity>
			</View>
			:
			<View />
	)
}