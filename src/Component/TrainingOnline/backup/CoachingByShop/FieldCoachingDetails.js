import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { alertConfirm, alertWarning, deviceHeight } from "../../../Core/Utility";
import { Icon, Text } from '@rneui/themed';
import FormGroup from "../../../Content/FormGroup";
import { ToastSuccess, formatNumber, groupDataByKey } from "../../../Core/Helper";
import { LoadingView } from "../../../Control/ItemLoading";
import { COACHING } from "../../../API/CoachingAPI";

export const FieldCoachingDetails = ({ itemCoaching, dataGroup, onSaveData, onCloseView }) => {
	const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState)
	const [loading, setLoading] = useState(false)
	const [coachingList, setCoachingList] = useState([])
	const [_mutate, setMutate] = useState(false)
	//
	const LoadData = async () => {
		let _coachingList = []
		if (dataGroup !== null && dataGroup.length > 0) {
			const dataSurvey = JSON.parse(itemCoaching?.DataSurvey) || []
			for (let index = 0; index < dataSurvey.length; index++) {
				const item = dataSurvey[index];
				for (let j = 0; j < dataGroup.length; j++) {
					const e = dataGroup[j];
					if (e.ParentId == item.ParentId)
						_coachingList.push(item)
				}
			}
		}
		const { arr } = await groupDataByKey({
			arr: _coachingList,
			key: 'ParentId'
		})
		await setCoachingList(arr)
	}
	const UploadData = async () => {
		for (let index = 0; index < coachingList.length; index++) {
			const item = coachingList[index];
			if ((item?.ItemValue || null) == null) {
				alertWarning(`Chưa chấm điểm ${item.ItemName}`)
				return
			}
		}
		await setLoading(true)
		alertConfirm('Thông báo', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
			await COACHING.UploadDataByEmployee(shopinfo.shopId, kpiinfo.id, coachingList, async (message) => {
				message && ToastSuccess(message, 'Thông báo', 'top')
				itemCoaching.isUploaded = 1
				setMutate(e => !e)
				await onCloseView(itemCoaching)
			})
		})
		await setLoading(false)
	}
	// Handler
	const onChangeValue = (value, item) => {
		let inputValue = value
		if (value !== null && value.length > 0) {
			if (item.MaxScore > 0 && value > item.MaxScore)
				inputValue = item.MaxScore
		}
		item.ItemValue = inputValue
		itemCoaching.DataSurvey = JSON.stringify(coachingList)
		setMutate(e => !e)
		onSaveData()
	}
	//
	useEffect(() => {
		const _setdetail = LoadData()
		return () => _setdetail
	}, [])
	// View
	const styles = StyleSheet.create({
		mainContainer: { width: '100%', height: deviceHeight, backgroundColor: appcolor.light },
		titleAction: { width: '75%', fontSize: 15, fontWeight: '700', color: appcolor.primary, padding: 8, marginStart: 8, marginEnd: 8 },
		itemMain: { padding: 8, },
		titleView: { width: '80%', fontSize: 13, fontWeight: '600', color: appcolor.blacklight, padding: 5, paddingEnd: 8 },
		headerView: { width: '100%', fontSize: 14, fontWeight: '600', color: appcolor.red, padding: 5 },
		inputContainer: { minWidth: 80, margin: 0, padding: 0 },
		inputView: { color: appcolor.dark, fontSize: 12, borderWidth: 0.5, borderColor: appcolor.grayLight, borderRadius: 5, textAlign: 'center', marginEnd: 8 },
		viewUpload: { width: 80, backgroundColor: appcolor.primary, padding: 8, borderRadius: 50, justifyContent: 'center' }
	})
	const renderItem = (item, index) => {
		const handlerChangeValue = (text) => {
			onChangeValue(text, item)
		}
		return (
			<View key={`kkp_P_${index}`} style={styles.itemMain}>
				{item.isParent && <Text style={styles.headerView}>{`${item.GroupName}`}</Text>}
				<View style={{ width: '100%', flexDirection: 'row' }}>
					<Text style={styles.titleView}>{`${index + 1}. ${item.ItemName}`}</Text>
					<FormGroup
						editable={(itemCoaching?.isUploaded || 0) == 0}
						nonBorder
						noneRadius
						useClearAndroid={false}
						containerStyle={styles.inputContainer}
						inputStyle={styles.inputView}
						keyboardType="numeric"
						clearButtonMode='never'
						placeholder={`${item.MinScore}-${item.MaxScore}`}
						value={formatNumber(item?.ItemValue || null)}
						handleChangeForm={handlerChangeValue}
					/>
				</View>
			</View>
		)
	}
	return (
		<View style={styles.mainContainer}>
			<View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
				<Text style={styles.titleAction}>{`${itemCoaching.EmployeeCode} - ${itemCoaching.EmployeeName}`}</Text>
				{(itemCoaching?.isUploaded || 0) == 0 && <TouchableOpacity style={styles.viewUpload} onPress={UploadData}>
					<Icon
						type="font-awesome-5"
						name="cloud-upload-alt"
						color={appcolor.light}
						size={20}
					/>
				</TouchableOpacity>
				}
			</View>
			<LoadingView isLoading={loading} title='Vui lòng chờ' />
			<ScrollView
				style={{ paddingTop: 8 }}
				showsVerticalScrollIndicator={false}>
				{coachingList !== null && coachingList.length > 0 &&
					coachingList.map((item, index) => {
						return renderItem(item, index)
					})
				}
				<View style={{ paddingBottom: deviceHeight / 2 }} />
			</ScrollView>
		</View>
	)
}