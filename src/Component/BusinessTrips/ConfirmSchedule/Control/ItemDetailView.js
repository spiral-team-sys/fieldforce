import moment from "moment";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../../../Content/FormGroup";
import { NumberFormatView } from "../../../../Control/NumberFormatView";
import { formatNumber } from "../../../../Core/Helper";
import { ACTION_UPLOAD } from "../../UtilityBusiness";
import { StyleSheet } from "react-native";

export const ItemDetailView = ({ item, index, title, handlerConfirmTrip, handlerNote }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [_mutate, setMutate] = useState(false)

	const styles = StyleSheet.create({
		itemTrips: { width: '100%', padding: 3, backgroundColor: appcolor.surface, borderRadius: 8, marginBottom: 5, marginTop: 5, minHeight: 200 },
		titleView: { fontSize: 13, fontWeight: '600', color: appcolor.dark },
		contentView: { fontSize: 12, fontWeight: '400', color: appcolor.greylight },
		titleContentView: { fontSize: 12, fontWeight: '600', color: appcolor[item.ColorStatus] }
	})

	const listProvinceWork = JSON.parse(item?.ProvinceList || '[]')
	const provincePlan = `${item.ProvinceFromName} - ${item.ProvinceToName}`
	const datePlan = `Từ ${moment(item.FromDate?.toString()).format('DD/MM/YY')} - Đến ${moment(item.ToDate?.toString()).format('DD/MM/YY')}`

	const daysMove = `Ngày di chuyển ${item.Days || 0} Ngày - Thành tiền ${formatNumber(item.Days * 250000, ',')} VNĐ`
	const supportKM = `Di chuyển ${item.SupportKM > 0 ? formatNumber(item.SupportKM, ',') : 0} VNĐ`
	const supportVehicalOther = `Di chuyển khác ${item.SupportVehicalOther > 0 ? formatNumber(item.SupportVehicalOther, ',') : 0} VNĐ`
	const supportNight = `Nghỉ qua đêm ${item.SupportNight > 0 ? formatNumber(item.SupportNight, ',') : 0} VNĐ`
	const supportLunch = `Ăn trưa ${item.SupportLunch > 0 ? formatNumber(item.SupportLunch || 0, ',') : 0} VNĐ`
	const supportDinner = `Ăn tối ${item.SupportDinner > 0 ? formatNumber(item.SupportDinner || 0, ',') : 0} VNĐ`
	const supportOther = `Khác ${item.SupportOther > 0 ? formatNumber(item.SupportOther || 0, ',') : 0} VNĐ`
	const supportCar = `Thuê xe ${item.SupportCar > 0 ? formatNumber(item.SupportCar || 0, ',') : 0} VNĐ`

	const onConfirmTrips = () => {
		const value = item.ConfirmPlan == 1 ? null : 1
		item.ConfirmPlan = value
		setMutate(e => !e)
		handlerConfirmTrip(value)
	}
	const onRejectTrips = () => {
		const value = item.ConfirmPlan == 0 ? null : 0
		item.ConfirmPlan = value
		setMutate(e => !e)
		handlerConfirmTrip(value)
	}
	const onNoteChange = (text) => {
		item.ConfirmNote = text
		setMutate(e => !e)
		handlerNote()
	}

	return (
		<View key={`int_${index}`} style={{ width: '100%', paddingStart: 5, paddingEnd: 5, alignSelf: 'center' }}>
			<View style={styles.itemTrips}>
				<ItemView styleView={styles.titleContentView} value={`${title} - ${item.StatusConfirm} ${item.ConfirmNote || ''}`} iconName='stream' />
				{listProvinceWork.length > 0 ?
					<ScrollView
						contentContainerStyle={{ padding: 5 }}
						style={{ alignSelf: 'center', width: '100%' }}
						horizontal
						showsHorizontalScrollIndicator={false}
						nestedScrollEnabled>
						{listProvinceWork.map((item, index) => {
							return (
								<Text key={`iib_${index}`} style={styles.titleView}>
									{`${index > 0 ? ' -' : ''} ${item.ProvinceName} (${item.NumberDay})`}
								</Text>
							)
						})}
					</ScrollView>
					:
					<ItemView styleView={{ ...styles.titleView, width: '92%' }} value={provincePlan} iconName='plane-departure' />
				}
				<ItemView styleView={styles.contentView} value={datePlan} iconName='calendar-alt' />
				{item.Days !== null && item.Days > 0 && <ItemView styleView={styles.contentView} value={daysMove} iconName='road' />}
				{item.SupportKM !== null && item.SupportKM > 0 && <ItemView styleView={styles.contentView} value={supportKM} iconName='road' />}
				{item.SupportCar !== null && item.SupportCar > 0 && <ItemView styleView={styles.contentView} value={supportCar} iconName='car' />}
				{item.SupportVehicalOther !== null && item.SupportVehicalOther > 0 && <ItemView styleView={styles.contentView} value={supportVehicalOther} iconName='road' />}
				{item.SupportNight !== null && item.SupportNight > 0 && <ItemView styleView={styles.contentView} value={supportNight} iconName='hotel' />}
				{item.SupportLunch !== null && item.SupportLunch > 0 && <ItemView styleView={styles.contentView} value={supportLunch} iconName='utensils' />}
				{item.SupportDinner !== null && item.SupportDinner > 0 && <ItemView styleView={styles.contentView} value={supportDinner} iconName='utensils' />}
				{item.SupportOther !== null && item.SupportOther > 0 && <ItemView styleView={styles.contentView} value={supportOther} iconName='money-bill' />}
				{item.Note !== null && <ItemView styleView={styles.contentView} value={`${item.Note}`} iconName='comment-alt' />}
				<Text style={{ fontSize: 13, fontWeight: '500', textAlign: 'right', end: 3, color: appcolor.info, position: 'absolute', bottom: 8, end: 8 }} >
					Tổng: {<NumberFormatView value={item.TotalSupport} />}
				</Text>
			</View>
			{item.isLockConfirm == 0 &&
				<View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', paddingEnd: 8 }}>
					<View style={{ flexDirection: 'row', end: 0 }}>
						<ActionPress
							title='Xác nhận'
							type={ACTION_UPLOAD.APPROVED}
							colorAction={item.ConfirmPlan == 1 ? appcolor.success : appcolor.placeholderText}
							itemAction={item}
							onPress={onConfirmTrips}
						/>
						<ActionPress
							title='Từ chối'
							type={ACTION_UPLOAD.APPROVED}
							colorAction={item.ConfirmPlan == 0 ? appcolor.red : appcolor.placeholderText}
							itemAction={item}
							onPress={onRejectTrips}
						/>
					</View>
				</View>
			}
			{item.ConfirmPlan == 0 &&
				<FormGroup
					editable
					placeholder='Nhập lý do'
					containerStyle={{ padding: 2, marginTop: 8 }}
					inputStyle={{ fontSize: 13 }}
					useClearAndroid={false}
					clearButtonMode="never"
					handleChangeForm={onNoteChange}
				/>
			}
		</View>
	)
}

const ItemView = ({ value, iconName, styleView }) => {
	const appcolor = useSelector((state) => state.GAppState)
	return (
		<View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
			<Icon type="font-awesome-5" name={iconName} size={14} color={appcolor.dark} style={{ width: 30, padding: 5 }} />
			<Text style={styleView}>
				{value}
			</Text>
		</View>
	)
}
const ActionPress = ({ type, title, onPress, colorAction, itemAction }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const actionItem = () => {
		onPress(itemAction, type)
	}
	return (
		<TouchableOpacity style={{ margin: 3, padding: 8, backgroundColor: colorAction, borderRadius: 3 }} onPress={actionItem}>
			<Text style={{ fontSize: 12, fontWeight: '600', color: appcolor.light }}>{title}</Text>
		</TouchableOpacity>
	)
}