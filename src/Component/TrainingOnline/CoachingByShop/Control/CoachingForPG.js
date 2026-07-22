import React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

export const CoachingForPG = ({ }) => {
	const { appcolor } = useSelector(state => state.GAppState)

	const styles = StyleSheet.create({
		mainContainer: { backgroundColor: appcolor.light }
	})

	return (
		<View style={styles.mainContainer}>

		</View>
	)
}