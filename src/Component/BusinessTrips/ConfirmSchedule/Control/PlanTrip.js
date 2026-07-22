import React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { ItemDetailView } from "./ItemDetailView";
import { deviceWidth } from "../../../../Core/Utility";
import { AppNameBuild, lgApp } from "../../../../Core/URLs";
import { ItemDetailViewLG } from "./ItemDetailViewLG";

export const PlanTrip = ({ type, indexMain, data, dataActual, isCheckData = false, handlerConfirm, handlerNote }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const onConfirm = (value) => {
		handlerConfirm(value, type, JSON.stringify(data))
	}
	const onNote = () => {
		handlerNote(type, JSON.stringify(data))
	}
	const styles = StyleSheet.create({
		mainContainer: { width: (isCheckData == 1 ? (dataActual?.length > 0 ? (deviceWidth / 2) : deviceWidth) : (deviceWidth / 2)), backgroundColor: appcolor.light }
	})

	const ViewItem = () => {
		switch (AppNameBuild) {
			case lgApp:
				return <ItemDetailViewLG
					title='Plan'
					key={`pp_a_${indexMain}`}
					styles={styles}
					index={indexMain}
					item={data[0] || {}}
					handlerConfirmTrip={onConfirm}
					handlerNote={onNote}
				/>
			default:
				return <ItemDetailView
					title='Plan'
					key={`pp_a_${indexMain}`}
					styles={styles}
					index={indexMain}
					item={data[0] || {}}
					handlerConfirmTrip={onConfirm}
					handlerNote={onNote}
				/>

		}
	}
	return (
		<View style={styles.mainContainer}>
			{ViewItem()}
		</View>
	)
}