import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";

export const FieldInput = ({
	inputRef, title, defaultValue, iconNameLeft, iconColor, iconRight, onRightIcon, iconColorRight, isPassword = false,
	returnKeyType, onSubmitEditing, blurOnSubmit, onChangeText, inputStyle, titleStyle, placeholder, placeholderColor,
}) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const styles = StyleSheet.create({
		mainContainer: { width: '100%', paddingTop: 8 },
		titleView: { fontSize: 12, fontWeight: '500', color: appcolor.white, padding: 5 },
		inputContainer: { padding: Platform.OS == 'ios' ? 8 : 5, borderRadius: 8, backgroundColor: appcolor.placeholderBody },
		inputStyle: { fontSize: 13, color: appcolor.dark, fontWeight: '500' }
	})
	return (
		<View style={styles.mainContainer}>
			<Text style={[styles.titleView, titleStyle]}>{title}</Text>
			<FormGroup
				inputRefFull={inputRef}
				index={0}
				editable
				nonBorder
				placeholder={placeholder}
				placeholderColor={placeholderColor}
				defaultValue={defaultValue}
				containerStyle={styles.inputContainer}
				inputStyle={[styles.inputStyle, inputStyle]}
				clearButtonMode="never"
				useClearAndroid={false}
				iconType='ionicon'
				iconColor={iconColor || appcolor.primary}
				iconName={iconNameLeft}
				iconRight={iconRight}
				rightFunc={onRightIcon}
				iconSizeRight={15}
				iconColorRight={iconColorRight}
				isSecure={isPassword}
				returnKeyType={returnKeyType}
				onSubmitEditing={onSubmitEditing}
				blurOnSubmit={blurOnSubmit}
				handleChangeForm={onChangeText}
			/>
		</View>
	)
}