import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth, fontWeightBold } from '../../../../../Themes/AppsStyle';
import { BORDER_WIDTH, UtilityOffice } from '../../UtilityOffice';
import FormGroup from '../../../../../Content/FormGroup';
import { ConfirmData } from '../ConfirmData';

export const ConfirmOT = ({ dataDetail, itemMain }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [itemData, setItemData] = useState({})
	const [error, setError] = useState({ isError: false, errorValue: null })
	const [_mutate, setMutate] = useState(false)

	const LoadData = () => {
		setItemData(dataDetail[0] || {})
	}
	const handlerConfirm = (value) => {
		const _value = itemData.OTConfirm == value ? 3 : value
		itemData.OTConfirm = _value
		const dataUpdate = dataDetail.map((item, _index) => ({ ...item, OTConfirm: _value }))
		itemMain.dataDetail = JSON.stringify(dataUpdate)
		if (_value == 3) {
			itemMain.isValidData = false
			error.isError = false
			error.errorValue = null
		}
		setMutate(e => !e)
	}
	const handlerError = (text) => {
		if (text !== null && text.length > 0) {
			itemMain.isValidData = true
			error.isError = true
			error.errorValue = text
		} else {
			itemMain.isValidData = false
			error.isError = false
			error.errorValue = null
		}
	}
	const onChangeNote = (text) => {
		if (itemData.OTConfirm == -1 && (text == null || (text?.length || '') == 0)) {
			itemMain.isValidData = true
			error.isError = true
			error.errorValue = UtilityOffice.errorNoteTitle
		} else {
			itemMain.isValidData = false
			error.isError = false
			error.errorValue = null
		}

		itemData.OTConfirmNote = text
		const dataUpdate = dataDetail.map((item, _index) => ({ ...item, OTConfirmNote: text }))
		itemMain.dataDetail = JSON.stringify(dataUpdate)
		setMutate(e => !e)
	}

	useEffect(() => {
		const _itemdata = LoadData()
		return () => _itemdata
	}, [dataDetail])

	const styles = StyleSheet.create({
		mainContainer: { flexDirection: 'row', width: deviceWidth - 32, backgroundColor: appcolor.light, borderBottomWidth: BORDER_WIDTH, borderBottomColor: appcolor.greylight, paddingTop: 8, paddingBottom: 8 },
		lineStartView: { width: 5, minHeight: 50, backgroundColor: (itemData?.OTConfirm || 0) == 0 ? appcolor.yellowdark : appcolor[itemData.colorStatusName] },
		contentSummary: { minHeight: 80, marginStart: 8, justifyContent: 'center', backgroundColor: appcolor.light },
		titleSummary: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.blacklight, marginBottom: 3 },
		descriptionSummary: { fontSize: 12, fontWeight: '400', color: appcolor.greylight, marginTop: 2 },
		mainInput: { width: deviceWidth - 54, marginTop: 5, borderColor: appcolor.greylight, borderWidth: 0.3, borderRadius: 5, padding: 8 },
		inputStyle: { fontSize: 12, color: appcolor.greylight, paddingStart: 0, paddingBottom: 0 },
		titleStyle: { fontWeight: '500', fontSize: 12, padding: 0 }
	})

	return (
		<View style={styles.mainContainer}>
			<View style={styles.lineStartView} />
			<View style={styles.contentSummary}>
				<Text style={styles.titleSummary}>{itemMain.titlePage}</Text>
				{/* // Description */}
				{itemData.OTTypeName && <Text style={styles.descriptionSummary}>{itemData.OTTypeName}</Text>}
				{itemData.TotalTimeOT && <Text style={styles.descriptionSummary}>{`Thời gian: ${itemData.TotalTimeOT}`}</Text>}
				{itemData.OTNote && <Text style={styles.descriptionSummary}>{`Lý do: ${itemData.OTNote}`}</Text>}
				{/* // Status Confirm */}
				{itemData.isConfirm !== 1 && itemData.OTConfirmNote !== null && itemData.OTConfirmNote !== undefined &&
					<Text style={styles.descriptionSummary}>{`QL ghi chú: ${itemData.OTConfirmNote}`}</Text>
				}
				{itemData.isConfirm == 1 &&
					<FormGroup
						editable
						title='Ghi chú'
						useClearAndroid={false}
						clearButtonMode='never'
						containerStyle={styles.mainInput}
						inputStyle={styles.inputStyle}
						titleStyle={styles.titleStyle}
						value={itemData.otNote}
						handleChangeForm={onChangeNote}
						isWarning={error.isError}
						titleWarning={error.errorValue}
					/>
				}
			</View>
			<ConfirmData
				typeConfirm='OTConfirm'
				typeNote='OTConfirmNote'
				itemConfirm={itemData}
				actionConfirm={handlerConfirm}
				actionError={handlerError}
			/>
		</View>
	)
}