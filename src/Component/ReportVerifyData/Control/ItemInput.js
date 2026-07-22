import React, { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Icon, Text } from '@rneui/themed'
import { useSelector } from "react-redux"
import FormGroup from "../../../Content/FormGroup"
import { ScanCode } from "./ScanCode"
import { deviceWidth } from "../../../Themes/AppsStyle"

export const ItemInput = ({
	titleName, iconName, isRequire, typeFilter, itemValue, placeholder, onChangeText,
	keyboardType = 'default', editable = true, isViewInput = true, mobileLength = false, isScanIMEI = false, isScanBarCode = false,
	containerStyle, inputContainer, handlerScan, onReadScanCode
}) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [showScan, setShowScan] = useState(false)
	//
	const styles = StyleSheet.create({
		mainItem: [{ flexGrow: 1, padding: 8, marginBottom: 1 }, containerStyle],
		titleHeader: { width: '100%', fontSize: 13, fontWeight: '700', color: appcolor.blacklight, marginStart: 8 },
		placeholderHeader: { width: '100%', fontSize: 13, fontWeight: '300', color: appcolor.placeholderText, marginStart: 8, marginBottom: 8, fontStyle: 'italic' },
		inputView: [{ width: '100%', backgroundColor: appcolor.surface, borderRadius: 5, marginBottom: 0 }, inputContainer]
	})
	const handlerChangeValue = (text) => {
		onChangeText !== undefined && onChangeText(text, typeFilter)
	}
	const handlerScanCode = () => {
		// showScan && handlerScan(typeFilter)
		setShowScan(e => !e)
	}
	const handlerReadScan = (data) => {
		onReadScanCode(data, typeFilter)
		setShowScan(false)
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
			{placeholder && <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>}
			<View style={{ width: '100%', alignItems: 'center' }}>
				{isViewInput &&
					<FormGroup
						keyboardType={keyboardType}
						containerStyle={styles.inputView}
						editable={editable}
						multiline
						useClearAndroid={false}
						value={itemValue}
						iconRight={isScanIMEI ? 'barcode' : isScanBarCode ? 'qrcode' : null}
						maxLength={mobileLength ? 10 : 10000}
						handleChangeForm={handlerChangeValue}
						rightFunc={handlerScanCode}
					/>
				}
				{showScan && (isScanIMEI || isScanBarCode) &&
					<View style={{ backgroundColor: appcolor.dark, marginTop: 16, zIndex: 10, overflow: 'hidden' }}>
						<ScanCode onReadCode={handlerReadScan} />
					</View>
				}
			</View>
		</View>
	)
}