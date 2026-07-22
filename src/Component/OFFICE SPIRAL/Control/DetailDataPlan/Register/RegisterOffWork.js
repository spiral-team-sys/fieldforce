import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { Icon, Slider, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceHeight, deviceWidth, fontWeightBold } from '../../../../../Themes/AppsStyle';
import { BORDER_WIDTH, TimeDefault, getTimeDefault } from '../../UtilityOffice';
import FormGroup from '../../../../../Content/FormGroup';
import { WorkingPlanAPI } from '../../../../../API/WorkingPlanApi';
import { ToastSuccess } from '../../../../../Core/Helper';
import { alertConfirm, alertWarning } from '../../../../../Core/Utility';
import moment from 'moment';
import _ from 'lodash';

export const RegisterOffWork = ({ dataDetail, itemMain, actionBack }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [itemData, setItemData] = useState({})
	const [dataShift, setDataShift] = useState([])
	const [registerSave, setRegisterSave] = useState({
		stepTime: 5,
		shiftCode: null,
		isTimeWorking: 0,
		timeFrom: '00:00',
		timeTo: '00:00',
		changeNote: null,
		sliderValueFrom: 0,
		sliderValueTo: 0,
		sliderFromMin: '08:30',
		sliderFromMax: '12:00',
		sliderToMin: '13:00',
		sliderToMax: '17:30'
	})
	const [_mutate, setMutate] = useState(false)
	//
	const LoadData = () => {
		const itemDetail = dataDetail[0] || {}
		if ((itemDetail?.WPChangeShift || null) !== null) {
			const shiftChange = _.filter(itemDetail.DataShift, (e) => { return e.ShiftCode == itemDetail.WPChangeShift })[0] || {}
			registerSave.isTimeWorking = shiftChange.isTimeWorking
			registerSave.shiftCode = itemDetail.WPChangeShift
			registerSave.timeFrom = itemDetail.WPChangeTimeFrom
			registerSave.timeTo = itemDetail.WPChangeTimeTo
			registerSave.changeNote = itemDetail.WPChangeNote
			if ((itemDetail?.ChangeTimeFrom || null) !== null) {
				const hour = parseInt(moment(new Date(itemDetail.ChangeTimeFrom)).format('HH'))
				const minute = parseInt(moment(new Date(itemDetail.ChangeTimeFrom)).format('mm'))
				registerSave.sliderValueFrom = minute + (hour * 60)
			}
			if ((itemDetail?.ChangeTimeTo || null) !== null) {
				const hour = parseInt(moment(new Date(itemDetail.ChangeTimeTo)).format('HH'))
				const minute = parseInt(moment(new Date(itemDetail.ChangeTimeTo)).format('mm'))
				registerSave.sliderValueTo = minute + (hour * 60)
			}
		}
		setItemData(itemDetail)
		setDataShift(itemDetail.DataShift)
		// 
	}
	// Handler
	const onChangeNote = (text) => {
		registerSave.changeNote = text
		setMutate(e => !e)
	}
	const handlerSendRegister = async () => {
		const checkData = await validData()
		if (checkData) {
			const itemSave = {
				...registerSave,
				planId: itemMain.planId
			}
			await WorkingPlanAPI.PlanOfficeRegister('OFF', itemSave, async (result) => {
				ToastSuccess(result.messeger, 'Thông báo', 'top')
				if (result.status == 200)
					actionBack()
			})
		}
	}
	const validData = async () => {
		if (registerSave.shiftCode == null || registerSave.shiftCode == '' || registerSave.shiftCode.length == 0) {
			alertWarning(`Vui lòng chọn ca xin nghỉ`)
			return false
		}
		if (registerSave.isTimeWorking == 1 && (registerSave.sliderValueFrom == 0 || registerSave.sliderValueTo == 0)) {
			alertWarning(`Vui lòng chọn đầy đủ thời gian xin nghỉ`)
			return false
		}
		if (registerSave.changeNote == null || registerSave.changeNote.length < 5) {
			alertWarning(`Vui lòng nhập lí do nghỉ phép (Tối thiểu 5 kí tự)`)
			return false
		}
		return true;
	}
	const handlerCancel = () => {
		alertConfirm('Huỷ yêu cầu', 'Bạn có muốn huỷ yêu cầu xin nghỉ không?', async () => {
			const itemSave = {
				shiftCode: null,
				type: null,
				planId: itemMain.planId
			}
			await WorkingPlanAPI.PlanOfficeRegister('CANCEL_OFF', itemSave, async (result) => {
				ToastSuccess(result.messeger, 'Thông báo', 'top')
				if (result.status == 200)
					actionBack()
			})
		})
	}
	const onSelected = (item) => {
		const isDuplicate = item.ShiftCode == registerSave.shiftCode
		registerSave.shiftCode = isDuplicate ? null : item.ShiftCode
		registerSave.isTimeWorking = isDuplicate ? 0 : item.isTimeWorking
		setMutate(e => !e)
	}
	const onChangeTimeFrom = (time) => {
		const timeDefault = getTimeDefault()
		const changeFrom = moment(timeDefault).add('minute', time)
		registerSave.timeFrom = changeFrom.format('HH:mm')
		registerSave.sliderValueFrom = time
		setMutate(e => !e)
	}
	const onChangeTimeTo = (time) => {
		const timeDefault = getTimeDefault()
		const changeTo = moment(timeDefault).add('minute', time)
		registerSave.timeTo = changeTo.format('HH:mm')
		registerSave.sliderValueTo = time
		setMutate(e => !e)
	}
	//
	useEffect(() => {
		const _itemdata = LoadData()
		return () => _itemdata
	}, [dataDetail])
	//
	const renderShiftView = () => {
		const renderItem = (item, index) => {
			const handlerSelected = () => {
				onSelected(item)
			}
			const isChoose = registerSave.shiftCode == item.ShiftCode
			return (
				<View key={`idpa_${index}`}>
					<TouchableOpacity style={isChoose ? styles.buttonSelected : styles.buttonChange} onPress={handlerSelected}>
						<Text style={{ ...styles.titleNameButton, color: isChoose ? appcolor.light : appcolor.greylight, textAlign: 'left' }}>
							{`${item.ShiftCode} - ${item.ShiftName}`}
						</Text>
					</TouchableOpacity>
				</View>
			)
		}
		return (
			dataShift !== null && dataShift.length > 0 &&
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
				{dataShift.map((item, index) => {
					return (renderItem(item, index))
				})}
			</View>
		)
	}
	// View
	const styles = StyleSheet.create({
		mainContainer: { width: deviceWidth - 32, backgroundColor: appcolor.light, paddingTop: 8, paddingBottom: 8 },
		titleSummary: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.greylight },
		contentView: { marginTop: 8 },
		buttonChange: { borderRadius: 5, padding: 8, borderWidth: BORDER_WIDTH, borderColor: appcolor.greylight, margin: 8, marginStart: 0, marginBottom: 0 },
		buttonSelected: { borderRadius: 5, padding: 8, borderWidth: BORDER_WIDTH, borderColor: appcolor.red, margin: 8, marginStart: 0, marginBottom: 0, backgroundColor: appcolor.red },
		buttonConfirm: { width: deviceWidth / 2.2, borderRadius: 25, padding: 8, borderWidth: BORDER_WIDTH, borderColor: appcolor.primary, backgroundColor: appcolor.primary },
		buttonCancel: { width: deviceWidth / 2.2, borderRadius: 25, padding: 8, borderWidth: BORDER_WIDTH, borderColor: appcolor.primary, backgroundColor: appcolor.light, marginEnd: 8 },
		titleNameButton: { fontSize: 13, fontWeight: '600', color: appcolor.light, textAlign: 'center' },
		mainButtonAction: { width: '100%', flexDirection: 'row', justifyContent: 'center' },
		mainInput: { marginTop: 8, borderColor: appcolor.greylight, borderWidth: BORDER_WIDTH, borderRadius: 5 },
		inputStyle: { fontSize: 13, color: appcolor.dark },
		titleStyle: { fontWeight: '500', fontSize: 13 },
		buttonChangeTime: { width: (deviceWidth - 40) / 2, borderRadius: 5, padding: 8, marginTop: 8, borderWidth: BORDER_WIDTH, borderColor: appcolor.greylight, marginEnd: 8 },
		titleTimeButton: { fontSize: 13, fontWeight: '600', color: appcolor.primary, textAlign: 'center' },
		mainTimer: { borderRadius: 5, padding: 8, borderWidth: BORDER_WIDTH, borderColor: appcolor.greylight, marginTop: 8 },
		titleTimeHeader: { fontSize: 13, fontWeight: '600', color: appcolor.red },
	})
	return (
		<View style={styles.mainContainer}>
			<Text style={styles.titleSummary}>{itemMain.titlePage}</Text>
			<View style={styles.contentView}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={{ marginTop: -8 }}>
						{renderShiftView()}
					</View>
					{registerSave.isTimeWorking == 1 &&
						<View style={styles.mainTimer}>
							<Text style={styles.titleTimeHeader}>{`Thời gian: Từ ${registerSave.timeFrom} - Đến ${registerSave.timeTo}`}</Text>
							<View style={{ marginEnd: 8, marginTop: 16 }}>
								<Text style={{ position: 'absolute', start: 0, fontSize: 11, fontWeight: '500', fontStyle: 'italic', top: -5 }}>{`${registerSave.sliderFromMin}`}</Text>
								<Text style={{ position: 'absolute', end: 0, fontSize: 11, fontWeight: '500', fontStyle: 'italic', top: -5 }}>{`${registerSave.sliderFromMax}`}</Text>
								<Slider
									value={registerSave.sliderValueFrom}
									minimumValue={TimeDefault.FROM_MIN}
									maximumValue={TimeDefault.FROM_MAX}
									step={registerSave.stepTime}
									allowTouchTrack
									minimumTrackTintColor={appcolor.info}
									thumbStyle={{ width: 20, height: 20 }}
									thumbTintColor={appcolor.info}
									onValueChange={onChangeTimeFrom}
								/>
							</View>
							<View style={{ marginEnd: 8, marginTop: 8 }}>
								<Text style={{ position: 'absolute', start: 0, fontSize: 11, fontWeight: '500', fontStyle: 'italic', top: -5 }}>{`${registerSave.sliderToMin}`}</Text>
								<Text style={{ position: 'absolute', end: 0, fontSize: 11, fontWeight: '500', fontStyle: 'italic', top: -5 }}>{`${registerSave.sliderToMax}`}</Text>
								<Slider
									value={registerSave.sliderValueTo}
									minimumValue={TimeDefault.TO_MIN}
									maximumValue={TimeDefault.TO_MAX}
									step={registerSave.stepTime}
									allowTouchTrack
									minimumTrackTintColor={appcolor.info}
									thumbStyle={{ width: 20, height: 20 }}
									thumbTintColor={appcolor.info}
									onValueChange={onChangeTimeTo}
								/>
							</View>
						</View>
					}
					<FormGroup
						editable
						title='Lý do xin nghỉ'
						useClearAndroid={false}
						clearButtonMode='never'
						containerStyle={styles.mainInput}
						inputStyle={styles.inputStyle}
						titleStyle={styles.titleStyle}
						value={registerSave.changeNote}
						handleChangeForm={onChangeNote}
					/>
					<View style={styles.mainButtonAction}>
						{(itemData?.WPConfirm || 0) == 3 &&
							<TouchableOpacity style={styles.buttonCancel} onPress={handlerCancel}>
								<Text style={{ ...styles.titleNameButton, color: appcolor.primary }}>Hủy yêu cầu</Text>
							</TouchableOpacity>
						}
						{(itemData?.WPConfirm || 0) == 0 && (itemData?.isLockSend || 0) == 0 &&
							<TouchableOpacity style={styles.buttonConfirm} onPress={handlerSendRegister}>
								<Text style={styles.titleNameButton}>Gửi</Text>
							</TouchableOpacity>
						}
					</View>
					<View style={{ height: deviceHeight / 5 }} />
				</ScrollView>
			</View>
		</View>
	)
}