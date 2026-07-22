import moment from "moment"
import React, { useCallback, useRef, useState } from "react"
import { useEffect } from "react"
import { Image, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, StyleSheet, TouchableOpacity, UIManager, View } from "react-native"
import { Badge, Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux"
import FormGroup from "../../../Content/FormGroup"
import { alertConfirm, deviceHeight, deviceWidth, minWidthTab, openFileViewer } from "../../../Core/Utility"
import { pick, types } from '@react-native-documents/picker'
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view"
import { ScrollView } from "react-native"
import { MessageAction, MessageInfo, UUIDGenerator, formatNumber } from "../../../Core/Helper"
import { checkLinkInvoice, SaveNextBill, SendInvoice } from "../../../Controller/BussinessTripController"
//import { NumericFormat } from "react-number-format";
import UploadController from "../../../Controller/UploadController"
import { AppNameBuild, URLDEFAULT, aquaApp, lgApp } from "../../../Core/URLs"
import RNFS from "react-native-fs"
import { MultipleShowImage } from "../../../Control/MultipleShowImage"
import LottieView from 'lottie-react-native';
import { ACTION_UPLOAD, provinceByAddress } from "../UtilityBusiness"
import { launchCamera, launchImageLibrary } from "react-native-image-picker"
import { InsertPhotosItem } from "../../../Controller/PhotoController"
import { PERMISSIONS, check, request } from "react-native-permissions"
import NativeCamera from "../../../Control/NativeCamera"
import { ModalNotify } from "../../../Control/ModalNotify"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const UploadDocument = ({ itemBussiness, filterInvoice, navigation, ItemView, closeAction }) => {
	const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
	const [dataDetail, setDataDetail] = useState({ dataTab: [], hotelCosts: {}, moveCosts: {}, supportKMCosts: {}, foodCost: {}, otherCosts: {}, workCosts: {}, dataUpload: {} })
	const [isShowType, setShowType] = useState(false)
	const [note, setNote] = useState('')
	const provincePlan = `${itemBussiness.provinceFrom}${!itemBussiness.districtFrom ? '' : `(${itemBussiness.districtFrom})`} - ${itemBussiness.provinceTo}${!itemBussiness.districtTo ? '' : `(${itemBussiness.districtTo})`}`
	const listProvinceWork = JSON.parse(itemBussiness.provinceList) || []
	const listReport = JSON.parse(kpiinfo.reportItem || '{}')
	const [isVisible, setVisible] = useState(false)
	const [messager, setMessager] = useState('')

	const loadData = async () => {
		const dataTab = JSON.parse(itemBussiness?.listTab || '[]')
		const dataHotelCost = JSON.parse(itemBussiness.hotelCosts || '[]')
		const dataMoveCosts = JSON.parse(itemBussiness.moveCosts || '[]')
		const dataSupportKMCosts = JSON.parse(itemBussiness.supportKMCosts || '[]')
		const dataFoodCost = JSON.parse(itemBussiness.foodCosts || '[]')
		const dataOtherCosts = JSON.parse(itemBussiness.otherCosts || '[]')
		const dataWorkCosts = JSON.parse(itemBussiness.workCosts || '[]')
		await setDataDetail({ dataTab: dataTab, hotelCosts: dataHotelCost[0], moveCosts: dataMoveCosts[0], supportKMCosts: dataSupportKMCosts[0], foodCosts: dataFoodCost[0], otherCosts: dataOtherCosts[0], workCosts: dataWorkCosts[0], dataUpload: {} })
	}

	useEffect(() => {
		loadData()
		return () => false
	}, [])
	const styles = StyleSheet.create({
		mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
		titleHeader: { textAlign: 'center', fontSize: 15, fontWeight: '600', padding: 8, color: appcolor.light },
		mapsView: { width: '100%', height: '100%' },
		actionView: { zIndex: 0 },
		viewDate: { width: '100%', borderRadius: 5, alignItems: 'center' },
		itemTrips: { width: '100%', padding: 3, backgroundColor: appcolor.surface, borderRadius: 8, marginBottom: 5, marginTop: 5, },
		titleView: { fontSize: 14, fontWeight: '600', color: appcolor.dark },
		contentView: { fontSize: 13, fontWeight: '400', color: appcolor.greylight },
		costView: { backgroundColor: appcolor.light, padding: 8 },
		costItemView: { flexDirection: 'row', alignItems: 'center' },
		itemConfirm: { width: deviceWidth / 4, borderColor: appcolor.blacklight, borderWidth: 0.5, padding: 8, alignItems: 'center', borderRadius: 5, margin: 5 }
	})
	const showTypeUpdate = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setShowType(e => !e)
	}
	const handleChangeNote = (text) => {
		setNote(text)
	}

	const onNextTrim = () => {
		if (note.length == 0 || note == undefined || note == null) {
			MessageInfo(`Bạn chưa nhập ghi chú khi chuyển kỳ sau!`)
			return
		}
		if (note.length < 5) {
			MessageInfo(`Ghi chú phải lớn hơn 5 kí tự`)
			return
		}
		const dataUpload = {
			"note": note,
			"typeNext": "trip",
			"month": filterInvoice.month,
			"year": filterInvoice.year,
			"billInfoId": itemBussiness.billInfoId,
			"detailId": itemBussiness.detailId
		}
		MessageAction(`Bạn chắc chắn muốn chuyển sang kỳ sau?`, async () => {
			const result = await SaveNextBill(JSON.stringify(dataUpload))
			if (result.statusId === 200) {
				if (result.data[0]?.status === 200) {
					MessageInfo(`Cập nhật chuyển kỳ sau thành công!`)
					closeAction(result.data[0])
				} else if (result.data[0]?.status === 500) {
					MessageInfo(result.data[0]?.message)
				}
			} else {
				MessageInfo(`Xảy ra lỗi khi chuyển kỳ sau!`)
			}
		})
	}

	const onCancelItem = () => {
		if (note.length == 0 || note == undefined || note == null) {
			MessageInfo(`Bạn chưa nhập ghi chú khi bỏ quyết toán!`)
			return
		}
		if (note.length < 5) {
			MessageInfo(`Ghi chú phải lớn hơn 5 kí tự`)
			return
		}
		const dataUpload = { detailId: itemBussiness.detailId, note: note, typeCancel: 'trip', billInfoId: itemBussiness.billInfoId, }
		MessageAction('Bạn chắc chắn muốn bỏ quyết toán?', () => uploadAction(dataUpload, 'cancel', 'Bỏ quyết toán'))
	}
	const uploadAction = async (dataUpload, sendType, messageText) => {
		const result = await SendInvoice(JSON.stringify({ ...dataUpload, "sendType": sendType }))
		if (result.statusId === 200) {
			closeAction({ status: 200 })
			MessageInfo(`${messageText} thành công!`)
		} else {
			MessageInfo(`Xảy ra lỗi khi ${messageText} chứng từ`)
		}
	}
	const handleVisibleModal = async (visible) => {
		await setVisible(visible)
	}
	const onPressStage = async () => {
		let pointUI = []
		for (let index = 0; index < listProvinceWork.length; index++) {
			const element = listProvinceWork[index];
			pointUI.push(
				<View key={`ViewPoint_${element.workDate}_${element.provinceTo}_${element.addressPoint}`} style={{ borderRadius: 8, backgroundColor: appcolor.surface, padding: 4, marginBottom: 4 }}>
					<View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: "center" }}>
						{element.id !== null && element.id >= 0 && <Text style={{ width: (element.addressPoint == null || element.addressPoint == '') ? '100%' : '50%', fontWeight: '600', fontSize: 12, color: (element.addressPoint == null || element.addressPoint == '') ? appcolor.tomato : appcolor.dark, paddingHorizontal: 4 }}>Điểm {element.id + 1}</Text>}
						{element.workDate && <Text style={{ width: '100%', fontWeight: '600', fontSize: 12, color: appcolor.tomato, paddingHorizontal: 4 }}>Ngày đi {element.workDate}</Text>}
						{
							(element.distance !== null && element.distance > 0) &&
							<View style={{ justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>
								<Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{element.distanceText}</Text>
							</View>
						}
					</View>
					<View style={{ width: '100%', borderRadius: 4 }}>
						{
							(element.addressPoint !== null || element.shopVisit !== null) &&
							<View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
								<Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Địa chỉ :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.addressPoint || element.shopVisit}</Text>}</Text>
							</View>
						}
						{
							(element.provinceTo !== null) &&
							<View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
								<Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Tỉnh đến :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.provinceTo}</Text>}</Text>
							</View>
						}
						{
							((element.amountHotel != null && element.amountHotel >= 0) ||
								(element.amountAllowance != null && element.amountAllowance >= 0) ||
								(element.amountTransport != null && element.amountTransport >= 0)) &&
							<View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 2 }}>
								<Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Chi phí : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Khách sạn : {formatNumber(element.amountHotel, ',') || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Phụ cấp : {element.amountAllowance || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Di chuyển : {element.amountTransport || 0}</Text>}</Text>
							</View>
						}
						{
							(element.remark !== null && element.remark !== '') &&
							<View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 4 }}>
								<Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.tomato }}>Ghi chú :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.remark}</Text>}</Text>
							</View>
						}
					</View>
				</View>
			)
		}
		await setMessager(<View style={{ height: deviceHeight * 0.3, width: deviceWidth * 0.8 }}>
			<ScrollView style={{ flex: 1 }} >
				{pointUI}
			</ScrollView>
		</View>)
		await handleVisibleModal(true)
	}
	return (
		<View style={styles.mainContainer}>
			<View style={{ minHeight: 150, paddingHorizontal: 8 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, }}>
					<TouchableOpacity style={{ height: 50 }} onPress={() => closeAction(dataDetail.dataUpload)}>
						<Icon reverse name='arrow-back' size={18} />
					</TouchableOpacity>
					<Text style={{ fontWeight: '800', fontSize: 20, color: appcolor.primary }}>Chi tiết chứng từ</Text>
					<TouchableOpacity style={{ height: 50, minWidth: 30 }} onPress={() => (itemBussiness.isCanCancel == 1 || itemBussiness.isCanNext == 1) ? showTypeUpdate() : null}>
						{(itemBussiness.isCanCancel == 1 || itemBussiness.isCanNext == 1) &&
							<Icon reverse name='user-edit' type="font-awesome-5" size={18} />}
					</TouchableOpacity>
				</View>
				{
					isShowType &&
					<View style={{}}>
						{
							((itemBussiness.isCanCancel == 1 && itemBussiness.isCancelInView !== 1) || (itemBussiness.isCanNext == 1 && itemBussiness.isCanNextInView !== 1) || itemBussiness.isCanSubmit == 1) &&
							<FormGroup
								containerStyle={{ padding: 3, marginTop: 5, backgroundColor: appcolor.light }}
								inputStyle={{ fontSize: 13 }}
								editable={true}
								value={note || ''}
								title={`Ghi chú`}
								placeholder='Nhập ghi chú'
								iconName={'comment-alt'}
								onClearTextAndroid={handleChangeNote}
								handleChangeForm={handleChangeNote}
							/>
						}
						<View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 8, }}>
							{itemBussiness.isCanNext == 1 && itemBussiness.isCanNextInView !== 1 && itemBussiness.isCanNextInView !== 2 &&
								<ActionPress
									title='Chuyển kỳ sau cả chuyến'
									type={ACTION_UPLOAD.NEXT}
									colorAction={appcolor.yellow}
									itemAction={itemBussiness}
									onPress={onNextTrim}
								/>
							}
							{itemBussiness.isCanCancel == 1 && itemBussiness.isCancelInView !== 1 &&
								<ActionPress
									title='Bỏ quyết toán'
									type={ACTION_UPLOAD.CANCEL}
									colorAction={appcolor.red}
									itemAction={itemBussiness}
									onPress={onCancelItem}
								/>
							}
						</View>
					</View>
				}
				<View style={{ padding: 8, borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, }}>
					{
						AppNameBuild == lgApp && listProvinceWork.length > 0 && <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: 4 }}>
							<TouchableOpacity onPress={() => onPressStage()} style={{ padding: 4, backgroundColor: appcolor.surface, borderRadius: 8 }}>
								<Text key={`NumPoint`}
									style={{ ...styles.titleDateLine, color: appcolor.info, fontSize: 15 }}>
									{`Xem các điểm đến : ${listProvinceWork.length}`}
								</Text>
							</TouchableOpacity>
						</View>
					}
					<Text style={{ fontWeight: '600', fontSize: 11, color: appcolor.dark }}>Tên : {itemBussiness?.employeeCode + '-' + itemBussiness?.employeeName}</Text>
					<Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>Đợt công tác : {moment(itemBussiness?.fromDate).format('YYYY/MM/DD') + ' - ' + moment(itemBussiness?.toDate).format('YYYY/MM/DD')}</Text>
					{listProvinceWork.length > 0 ?
						<View style={{ flexDirection: 'row' }}>
							{
								itemBussiness.isUsePoint == 1 ?
									<View style={{ flexDirection: 'row' }}>
										<Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>Nơi công tác : </Text>
										<ScrollView
											style={{ alignSelf: 'center', width: '80%' }}
											horizontal
											showsHorizontalScrollIndicator={false}
											nestedScrollEnabled
										>
											{(itemBussiness.provinceFrom !== null && itemBussiness.provinceFrom !== undefined) &&
												<Text key={`ProvinceStart}`} style={{ fontSize: 11, fontWeight: '600', color: appcolor.dark }}>
													{(provinceByAddress(itemBussiness.provinceFrom)).province || ''} -
												</Text>
											}

											{listProvinceWork.map((item, index) => {
												return (
													<Text key={`iib_${index}`} style={{ fontSize: 11, fontWeight: '600', color: appcolor.dark }}>
														{`${index > 0 ? ' -' : ''} ${item.provinceName} (${AppNameBuild == aquaApp ? item.numberStore : item.numberDay})`}
													</Text>
												)
											})}
										</ScrollView>
									</View>
									:
									(
										AppNameBuild != lgApp && <View>
											<Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>Nơi công tác : </Text>
											<ScrollView
												style={{ alignSelf: 'center', width: '100%' }}
												horizontal
												showsHorizontalScrollIndicator={false}
												nestedScrollEnabled
											>
												{listProvinceWork.map((item, index) => {
													return (
														<Text key={`iib_${index}`} style={{ fontSize: 11, fontWeight: '600', color: appcolor.dark }}>
															{`${index > 0 ? ' -' : ''} ${item.provinceName}${!item.district ? '' : `(${item.district})`} (${item.numberDay})`}
														</Text>
													)
												})}
											</ScrollView>
										</View>
									)
							}
						</View>
						: <Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>Nơi công tác : {provincePlan}</Text>
					}
					<Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>Số ngày đi : {`${itemBussiness?.dayWork} ngày - ${itemBussiness?.nightWork} đêm`}</Text>
					<Text style={{ fontWeight: '600', fontSize: 12, color: itemBussiness.colorHightlight || appcolor.dark }}>Trạng thái : {itemBussiness?.statusName || ''}</Text>
					{itemBussiness?.adminNote?.length > 0 && <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Ghi chú Quản trị viên : {itemBussiness?.adminNote || ''}</Text>}
					{itemBussiness?.adminNote?.length > 0 && <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Thời gian ghi chú : {itemBussiness?.adminTime || ''}</Text>}
				</View>
				{
					((itemBussiness.statusId === 3 || itemBussiness.statusId === 4) && dataDetail.dataTab.length > 0) &&
					<ViewListReturn key={'ViewListReturn'} dataDetail={dataDetail} />
				}
			</View>
			<View style={{ flex: 10 }}>
				<KeyboardAvoidingView
					style={{ justifyContent: 'flex-start', flex: 1 }}
					behavior={Platform.OS == "ios" ? "padding" : "padding"}
					enabled keyboardVerticalOffset={Platform.OS !== "ios" ? 50 : 50}>
					{
						dataDetail.dataTab.length > 0 &&
						<Tabs.Container
							pagerProps={{ scrollEnabled: false }}
							renderTabBar={props =>
							(
								<MaterialTabBar
									{...props}
									style={{ borderRadius: 10, margin: 5 }}
									labelStyle={{ fontSize: 13, fontWeight: '700' }}
									indicatorStyle={{ backgroundColor: appcolor.transparent }}
									inactiveColor={appcolor.greylight}
									activeColor={appcolor.info}
									tabStyle={{ borderRadius: 20, backgroundColor: appcolor.placeholderBody, minWidth: minWidthTab(dataDetail.dataTab), height: 38, marginEnd: 8 }}
									scrollEnabled={true}
								/>
							)
							}
							styles={{ borderRadius: 20 }}
							containerStyle={{ width: '100%', }}
							headerContainerStyle={{ backgroundColor: appcolor.transparent, shadowColor: appcolor.transparent }}
						>

							{dataDetail.dataTab?.map((item, index) => {
								return (
									(dataDetail[item.ref_Name] || dataDetail[item.ref_Name]?.length > 0) ?
										<Tabs.Tab
											key={`bill_${index}`}
											label={`${item.nameVN}`}
											name={`${item.nameVN}`}>
											<View style={{ flex: 1, paddingTop: 38, width: deviceWidth, }}>
												<ViewItemBill
													key={'DetailBill_' + index}
													itemTab={item} indexTab={index}
													dataDetail={dataDetail} styles={styles}
													navigation={navigation} itemBussiness={itemBussiness}
													filterInvoice={filterInvoice} ItemView={ItemView}
													isShowType={isShowType} showTypeUpdate={showTypeUpdate}
													listReport={listReport}
												/>
											</View>
										</Tabs.Tab>
										: null
								)
							})}
						</Tabs.Container>
					}
				</KeyboardAvoidingView>
			</View>
			{isVisible &&
				<ModalNotify titleNotify={'Thông tin'} messager={messager} visible={isVisible} titleConfirm={'Đóng'} handleVisibleModal={handleVisibleModal} />
			}
		</View >
	)
}
const ViewListReturn = ({ dataDetail }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [isShowList, setShowList] = useState(false)
	const [listReturn, setListReturn] = useState([])
	const handleShowList = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setShowList(e => !e)
	}
	const loadData = () => {
		const listFilter = dataDetail.dataTab.filter(it => dataDetail[it.ref_Name]?.statusId == 3 || dataDetail[it.ref_Name]?.statusId == 4)
		setListReturn(listFilter)
	}
	useEffect(() => {
		loadData()
		return () => false
	}, [])
	return (
		<View style={{ paddingTop: 2 }}>
			<View style={{ borderRadius: 10, borderWidth: 1, flexDirection: 'row', borderColor: isShowList ? appcolor.primary : appcolor.light, minHeight: 40 }}>
				{
					isShowList &&
					<View style={{ padding: 5 }}>
						<Text style={{ paddingLeft: 5, paddingBottom: 5, fontSize: 13, fontWeight: '600', color: appcolor.dark }}>Danh sách Admin trả</Text>
						{
							listReturn.map((it, idx) => {
								return (
									<View key={'listReturn_' + idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
										<View style={{ height: 8, width: 8, borderRadius: 50, backgroundColor: appcolor.primary }}></View>
										<Text style={{ paddingLeft: 5, fontSize: 11, fontWeight: '300', color: appcolor.dark }}>{it.nameVN}</Text>
									</View>
								)
							})
						}
					</View>
				}
				<TouchableOpacity onPress={() => handleShowList()} style={{ position: 'absolute', top: 0, right: 0, borderRadius: 10, padding: 5, backgroundColor: appcolor.light, flexDirection: 'row', justifyContent: 'flex-end' }}>
					<Icon name='exclamation-circle' size={16} color={appcolor.red} type={"font-awesome-5"} style={{ padding: 5, borderRadius: 50, backgroundColor: appcolor.light }} />
				</TouchableOpacity>
			</View>
		</View>
	)
}
const ViewNextCost = ({ itemTab, indexTab, itemNextCosts, dataDetail }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [_, setMutate] = useState(false)


	const handleChangeCost = (text, type) => {
		switch (type) {
			case 'COSTS':
				let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
				let intValue = value === null ? null : parseInt(value);
				if (intValue > dataDetail[itemTab.ref_Name].costs) {
					MessageInfo("Chi phí tồn không được lớn hơn tổng chi phí!")
				} else {
					const nextPeriod = dataDetail[itemTab.ref_Name].costs - (intValue || 0)
					itemNextCosts.costs = intValue
					itemNextCosts.nextCosts = (nextPeriod || 0)
					setMutate(e => !e)
				}
				break
			case 'NEXTCOST':
				let valueCosts = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
				let intValueCosts = valueCosts === null ? null : parseInt(valueCosts);
				if (intValueCosts > dataDetail[itemTab.ref_Name].costs) {
					MessageInfo("Chi phí chuyển không được lớn hơn tổng chi phí!")
				} else {
					const inventoryCost = dataDetail[itemTab.ref_Name].costs - intValueCosts || 0
					itemNextCosts.costs = inventoryCost
					itemNextCosts.nextCosts = (intValueCosts || 0)
					setMutate(e => !e)
				}
				break
			case 'NOTE':
				itemNextCosts.note = text
				setMutate(e => !e)
				break
		}
	}

	return (
		<View style={{ flex: 1, width: '100%', padding: 6, }}>
			<Text style={{ fontWeight: '800', fontSize: 16, color: appcolor.primary, textAlign: 'center', padding: 10, paddingHorizontal: 40 }}>Chuyển chi phí {itemTab.nameVN} sang kỳ sau</Text>
			<Text style={{ fontSize: 15, fontWeight: '600', color: appcolor.dark, padding: 5 }}>Chi phí tồn</Text>
			<NumericFormat
				key={`Costs_${indexTab}`}
				value={itemNextCosts.costs ? itemNextCosts.costs : ''}
				displayType={'text'}
				thousandSeparator
				renderText={value =>
					<FormGroup
						editable={true}
						key={indexTab}
						returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
						placeholder={'Chi phí'}
						value={(value) || ''}
						inputStyle={{ textAlign: 'left' }}
						keyboardType="numeric"
						handleChangeForm={(text) => handleChangeCost(text, "COSTS")}
						onClearTextAndroid={() => handleChangeCost('', "COSTS")}
						returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
					/>
				} />
			<Text style={{ fontSize: 15, fontWeight: '600', color: appcolor.dark, padding: 5 }}>Chi phí chuyển kỳ sau</Text>
			<NumericFormat
				key={`Next_${indexTab}`}
				value={itemNextCosts.nextCosts ? itemNextCosts.nextCosts : ''}
				displayType={'text'}
				thousandSeparator
				renderText={value =>
					<FormGroup
						editable={true}
						key={indexTab}
						returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
						placeholder={'Chi phí'}
						value={(value) || ''}
						inputStyle={{ textAlign: 'left' }}
						keyboardType="numeric"
						handleChangeForm={(text) => handleChangeCost(text, "NEXTCOST")}
						onClearTextAndroid={() => handleChangeCost('', "NEXTCOST")}
						returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
					/>
				} />
			<FormGroup
				containerStyle={{ padding: 3, marginTop: 5, backgroundColor: appcolor.light }}
				inputStyle={{ fontSize: 13 }}
				editable={true}
				value={itemNextCosts.note || ''}
				title={`Ghi chú`}
				placeholder='Nhập ghi chú'
				handleChangeForm={(text) => handleChangeCost(text, "NOTE")}
				onClearTextAndroid={() => handleChangeCost('', "NOTE")}
			/>
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
			{type === ACTION_UPLOAD.DOCUMENT && <CountFile item={itemAction} />}
			<Text style={{ fontSize: 13, fontWeight: '600', color: appcolor.white }}>{title}</Text>
		</TouchableOpacity>
	)
}
const callbackAction = (result) => {
	if (result === 'blocked' || result === 'unavailable') {
		alertConfirm("Chú ý", "Ứng dụng chưa được cấp quyền, vui lòng cấp quyền để tiếp tục thực hiện", actionYes, null, "Cài đặt", "Từ chối")
		return false;
	}
	return true
}
const ViewItemBill = ({ itemTab, indexTab, styles, dataDetail, itemBussiness, filterInvoice, isShowType, showTypeUpdate, listReport }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [isShowItemDoc, setShowItemDoc] = useState(true)
	const [isShowItemImage, setShowItemImage] = useState(false)
	const [isShowDelete, setShowDelete] = useState(false)
	const [linkInVoice, setLinkInVoice] = useState('')
	const [_, setMutate] = useState(false)
	const [billFiles, setBillFiles] = useState(JSON.parse(dataDetail[itemTab.ref_Name]?.billFile || '[]'))
	const [confirmFile, setConfirmFile] = useState(JSON.parse(dataDetail[itemTab.ref_Name]?.confirmFile || '[]'))
	const [isShowNextCost, setShowNextCost] = useState(false)
	const [visible, setVisible] = useState(false)
	const [dataPhoto, setDataPhoto] = useState({ listPhoto: [], indexImage: 0 })
	const [quantityFile, setQuantityFile] = useState({ fileByDoc: 0, fileByLink: 0, fileByImage: 0 })
	const [itemNextCosts, setItemNextCost] = useState({
		"itemId": dataDetail[itemTab.ref_Name]?.itemId,
		"costs": dataDetail[itemTab.ref_Name]?.costs || 0,
		"nextCosts": dataDetail[itemTab.ref_Name]?.nextCosts || 0,
		"note": ''
	})
	const ref_ScrollDoc = useRef()
	const ref_ScrollLink = useRef()
	const ref_ScrollImage = useRef()

	const countFile = (fileUpload) => {
		let fileByDoc = 0
		let fileByLink = 0
		let fileByImage = 0
		if (fileUpload) {
			fileUpload?.map(it => {
				it.type === 1 ? (fileByLink = fileByLink + 1) :
					it.type === 2 ? (fileByImage = fileByImage + 1) :
						(fileByDoc = fileByDoc + 1)
			})
		} else {
			billFiles?.map(it => {
				it.type === 1 ? (fileByLink = fileByLink + 1) :
					it.type === 2 ? (fileByImage = fileByImage + 1) :
						(fileByDoc = fileByDoc + 1)
			})
		}
		setQuantityFile({ fileByDoc: fileByDoc, fileByLink: fileByLink, fileByImage: fileByImage })
	}

	useEffect(() => {
		countFile()
		return () => false
	}, [])

	const handleDocumentSelection = useCallback(async () => {
		try {
			// const response = await DocumentPicker.pickMultiple({
			// 	presentationStyle: 'pageSheet',
			// 	type: types.pdf,
			// });
			const response = await pick({
				// allowMultiSelection: true,
				presentationStyle: 'pageSheet',
				type: types.pdf,
			});
			let arrBill = [...JSON.parse(dataDetail[itemTab.ref_Name].billFile)]
			await UploadController.uploadFilePDF(response, filterInvoice.year, filterInvoice.month, async (result) => {
				for (let index = 0; index < response.length; index++) {
					const item = response[index];
					const itemResult = result.find(it => it.fileUri === item.uri)
					if (itemResult?.filePath !== undefined) {
						arrBill.push({
							"index": arrBill.length > 0 ? arrBill.length + 1 : 1,
							"link": itemResult.filePath,
							"type": 0,
							"name": item.name,
							"uri": item.uri,
							"size": item.size
						})
					}
				}
				//console.log(arrBill, 'arrBillarrBill');
				dataDetail[itemTab.ref_Name].billFile = await JSON.stringify(arrBill)
				await setBillFiles(arrBill)
				await countFile(arrBill)
				await setMutate(e => !e)
				// }
			}, () => {
				MessageInfo('Lỗi khi gửi tệp tin lên hệ thống, vui lòng thử lại sau!')
			}, 'invoice')
		} catch (err) {
			console.log('cancel');
		}
	}, []);

	const handleImageSelection = useCallback(async () => {
		try {
			let photoinfo = {};
			let options = {
				mediaType: 'photo', quality: 1, includeBase64: true, selectionLimit: 10
			};

			await launchImageLibrary(options, async (response) => {
				if (!response.didCancel) {
					let { assets } = await response || []
					if (assets !== undefined) {
						await assets?.forEach(async res => {
							const newImageUrl = await NativeCamera.resizeImage(await res.uri)
							let timePhotoInsert = await new Date().getTime() + (Math.floor(Math.random() * 112) + 1)
							photoinfo = {
								shopId: 0,
								shopCode: '0',
								reportId: 79,
								photoPath: newImageUrl?.uri || res.uri,
								photoDate: moment(new Date()).format("YYYYMMDD"),
								photoType: `BILL_FILE_${itemBussiness.workingScheduleId}_${itemBussiness.detailId}_${itemTab.ref_Name}`,
								photoTime: timePhotoInsert,
								fileUpload: 0,
								dataUpload: 0,
								guid: UUIDGenerator(),
								photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
							}
							await InsertPhotosItem(photoinfo);
							await handleLoadPhoto(newImageUrl?.uri || res.uri, newImageUrl?.size || res.fileSize)
						});
					}
				}
			});

			await setTimeout(async () => {
				await UploadController.PostFile()
			}, 1000)
		} catch (err) {
			console.log('cancel');
		}
	}, []);

	const onTakephoto = async () => {
		let photoinfo = {};
		let options = {
			mediaType: 'photo',
			cameraType: Platform.OS === 'android' ? 'front' : 'back',
			quality: 1,
			saveToPhotos: true,
		};
		await launchCamera(options, async (response) => {
			if (!response.didCancel) {
				let { assets } = await response || []
				if (assets !== undefined) {
					await assets?.forEach(async res => {
						let timePhotoInsert = await new Date().getTime() + (Math.floor(Math.random() * 112) + 1)
						photoinfo = {
							shopId: 0,
							shopCode: '0',
							reportId: 79,
							photoPath: res.uri,
							photoDate: moment(new Date()).format("YYYYMMDD"),
							photoType: `BILL_FILE_${itemBussiness.workingScheduleId}_${itemBussiness.detailId}_${itemTab.ref_Name}`,
							photoTime: timePhotoInsert,
							fileUpload: 0,
							dataUpload: 0,
							guid: await UUIDGenerator.getRandomUUID(),
							photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
						}
						await InsertPhotosItem(photoinfo);
						await handleLoadPhoto(res.uri, res.fileSize)
					});
				}
			}
		});
	}
	const handleImageTakePhoto = useCallback(async () => {
		try {
			let allow = true;
			if (Platform.OS === 'ios') {
				// * IOS
				allow = await check(PERMISSIONS.IOS.CAMERA).then((res) => callbackAction(res))
				await request(PERMISSIONS.IOS.CAMERA)
			} else {
				// * ANDROID
				allow = await check(PERMISSIONS.ANDROID.CAMERA).then(callbackAction)
				await request(PERMISSIONS.ANDROID.CAMERA)

				allow = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(callbackAction)
				await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
			}
			if (allow === true) {
				await onTakephoto()
			}
		} catch (err) {
			console.log(err, 'cancel');
		}
	}, []);

	const handleLoadPhoto = async (photoPath, fileSize) => {
		try {
			let arrBill = [...JSON.parse(dataDetail[itemTab.ref_Name].billFile)]
			let ImgName = photoPath.substring(photoPath.lastIndexOf('/') + 1, photoPath?.length);
			let fileName = '/uploaded/' + moment(new Date()).format("YYYYMMDD") + '/' + ImgName

			if (photoPath !== undefined) {
				arrBill.push({
					"index": arrBill.length > 0 ? arrBill.length + 1 : 1,
					"link": fileName,
					"type": 2,
					"name": ImgName,
					"uri": photoPath,
					"size": fileSize
				})
			}
			dataDetail[itemTab.ref_Name].billFile = await JSON.stringify(arrBill)
			await setBillFiles(arrBill)
			await countFile(arrBill)
			await setMutate(e => !e)
		} catch (e) {

		}
	}

	const handleDelete = (type) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		const listDelete = JSON.parse(dataDetail[itemTab.ref_Name]?.billFile || '[]').filter(it => it.isSelect === true)
		const dataAfter = JSON.parse(dataDetail[itemTab.ref_Name]?.billFile || '[]').filter(it => it.isSelect !== true)
		if (listDelete.length > 0) {
			MessageAction('Bạn chắc chắn muốn xoá tệp tin chứng từ?', async () => {
				isShowItemDoc ?
					ref_ScrollDoc.current.scrollTo({ x: 0, y: 0, animated: true }) :
					isShowItemImage ? ref_ScrollImage.current.scrollTo({ x: 0, y: 0, animated: true }) :
						ref_ScrollLink.current.scrollTo({ x: 0, y: 0, animated: true });
				dataDetail[itemTab.ref_Name].billFile = JSON.stringify(dataAfter);

				if (isShowItemDoc) {
					dataAfter.filter(it => it.type === 0).length === 0 && setShowDelete(false)
				} if (isShowItemImage) {
					dataAfter.filter(it => it.type === 2).length === 0 && setShowDelete(false)
				} else {
					dataAfter.filter(it => it.type === 1).length === 0 && setShowDelete(false)
				}
				await countFile(dataAfter)
				await setBillFiles(dataAfter)
			})
		} else {
			MessageInfo('Bạn chưa chọn tệp tin cần xoá bỏ!')
		}
	}

	const isLink = (str) => {
		const pattern = /^(?:(?:(?:https?|ftp):)?\/\/)?(?:[\w-]+\.)+[a-z]{2,}([:\/?#].*)?$/i;
		return pattern.test(str);
	};

	const handleCheckLink = async () => {
		if (!isShowDelete) {
			if (linkInVoice === '') {
				MessageInfo('Bạn chưa nhập đường dẫn!')
				return
			}
			const checkLink = await isLink(linkInVoice)
			if (!checkLink) {
				MessageInfo('Sai định dạng đường dẫn!')
				return
			}
			await checkLinkInvoice(linkInVoice, filterInvoice.year, filterInvoice.month, async (result) => {
				if (result.statusId === 200) {
					const link = result.messager
					const jsonBills = {
						"index": billFiles.length > 0 ? billFiles.length + 1 : 1,
						"link": link,
						"type": 1, // type === 1 ? 'link' : 'doccument'
						"name": linkInVoice,
						"url": linkInVoice
					}
					const newBillFiles = [...billFiles, jsonBills]
					dataDetail[itemTab.ref_Name].billFile = await JSON.stringify(newBillFiles)
					await setBillFiles(newBillFiles)
					await countFile(newBillFiles)
					// UploadTripBill
					await setLinkInVoice('')
				} else {
					await MessageInfo('Đường dẫn được gửi sai hoặc không hỗ trợ tải xuống. Bạn vui lòng tải về máy và gửi chứng từ bằng tệp tin. Xin cảm ơn!')
				}
			})
		}
	}

	const onChangeInvoiceLink = async (text) => {
		setLinkInVoice(text)
	}

	const RenderItemDocument = ({ item, index }) => {
		return (
			<TouchableOpacity key={'ItemDoc_' + index} style={{ flexDirection: "row", width: 230, marginRight: 5, backgroundColor: appcolor.light, padding: 3, borderRadius: 8, margin: 3 }}
				onLongPress={() => itemBussiness.isCanEdit == 1 ? handleLongPress(item) : null}
				onPress={() => handlePress(item, 'DOCUMENT')}
			>
				<View style={{ width: 50, height: 65, backgroundColor: appcolor.surface, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
					<Icon name='file-pdf' type="font-awesome-5" size={25} color={'red'} />
					{
						(item.isSend === 1 && !isShowDelete) &&
						<LottieView
							style={{ width: 25, height: 25, position: "absolute", top: -2, right: -2 }}
							source={require('../../../Themes/Images/check-mark-success.json')}
							autoPlay
							loop={false}
						/>
					}
					{
						isShowDelete &&
						<View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 5, justifyContent: 'center', alignItems: "center", backgroundColor: appcolor.black, opacity: item.isSelect ? 0.8 : 0.5 }}>
							<Icon
								color={appcolor.white}
								name={item.isSelect ? 'check-circle' : 'circle'}
								type='font-awesome-5'
								size={30}
							/>
						</View>
					}
				</View>
				<View style={{ flex: 9.5 / 10, }}>
					<View style={{ paddingLeft: 8, flex: 1, justifyContent: "center", }}>
						<Text numberOfLines={2} style={{ fontWeight: '500', fontSize: 15, color: appcolor.dark }}>{item.name}</Text>
						<Text style={{ fontWeight: '300', fontSize: 12, color: appcolor.dark, fontStyle: 'italic' }}>{(item.size >= 1000000 ? ((item.size / 1000000).toFixed(2) + 'MB, ') : ((item.size / 1000).toFixed(2)) + 'KB, ') + 'PDF tài liệu'}</Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}
	const RenderItemLink = ({ item, index }) => {
		return (
			<TouchableOpacity key={'ItemLink_' + index} style={{ flexDirection: "row", width: 250, borderRadius: 5, backgroundColor: appcolor.light, borderWidth: 0.6, alignItems: 'center', height: 55, marginLeft: index !== 0 ? 5 : 0, marginHorizontal: 10 }}
				onLongPress={() => itemBussiness.isCanEdit == 1 ? handleLongPress(item) : null}
				onPress={() => handlePress(item, 'LINK')}
			>

				<View style={{ width: 45, height: 45, backgroundColor: appcolor.surface, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
					<Icon name='file-pdf' type="font-awesome-5" size={25} color={'red'} />
					{
						(item.isSend === 1 && !isShowDelete) &&
						<LottieView
							style={{ width: 25, height: 25, position: "absolute", top: -2, right: -2 }}
							source={require('../../../Themes/Images/check-mark-success.json')}
							autoPlay
							loop={false}
						/>
					}
					{
						isShowDelete &&
						<View style={{ position: 'absolute', width: 50, height: 50, borderRadius: 5, justifyContent: 'center', alignItems: "center", backgroundColor: appcolor.black, opacity: item.isSelect ? 0.8 : 0.5 }}>
							<Icon
								color={appcolor.white}
								name={item.isSelect ? 'check-circle' : 'circle'}
								type='font-awesome-5'
								size={30}
							/>
						</View>
					}
				</View>
				<View style={{ flex: 9.5 / 10, }}>
					<View style={{ paddingLeft: 8, flex: 1, justifyContent: "center", }}>
						<Text numberOfLines={2} style={{ fontWeight: '500', fontSize: 15, color: appcolor.dark }}>{item.name}</Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}
	const RenderItemImageByBill = ({ item, index }) => {
		const uri = item.isSend === 1 ? item.link : item.uri
		const urlImage = uri.indexOf('file://') > -1 || uri.indexOf('https://') > -1 ? uri : URLDEFAULT + uri
		return (
			<TouchableOpacity key={'ItemPhoto_' + index} style={{ width: deviceWidth / 5, height: deviceWidth / 4, backgroundColor: appcolor.surface, justifyContent: 'center', alignItems: "center", borderRadius: 5, backgroundColor: appcolor.light, marginLeft: index !== 0 ? 5 : 0, marginHorizontal: 10 }}
				onLongPress={() => itemBussiness.isCanEdit == 1 ? handleLongPress(item) : null}
				onPress={() => handlePress(item, 'IMAGE')}
			>
				<Image source={{ uri: urlImage }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
				{
					(item.isSend === 1 && !isShowDelete) &&
					<LottieView
						style={{ width: 25, height: 25, position: "absolute", top: -2, right: -2 }}
						source={require('../../../Themes/Images/check-mark-success.json')}
						autoPlay
						loop={false}
					/>
				}
				{
					isShowDelete &&
					<View style={{ position: 'absolute', width: deviceWidth / 5, height: deviceWidth / 4, borderRadius: 12, justifyContent: 'center', alignItems: "center", backgroundColor: appcolor.black, opacity: item.isSelect ? 0.8 : 0.5 }}>
						<Icon
							color={appcolor.white}
							name={item.isSelect ? 'check-circle' : 'circle'}
							type='font-awesome-5'
							size={30}
						/>
					</View>
				}
			</TouchableOpacity>
		)
	}
	const onShowDocument = (type) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		if (type == 'DOCUMENT') {
			isShowItemDoc == false ? setShowItemDoc(true) : null
			setShowItemImage(false)
		} else if (type == 'IMAGE') {
			isShowItemImage == false ? setShowItemImage(true) : null
			setShowItemDoc(false)
		} else {
			isShowItemDoc == true ? setShowItemDoc(false) : null
			isShowItemImage == true ? setShowItemImage(false) : null
		}
	}

	const handleLongPress = (item) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		item.isSelect = item.isSelect ? false : true;
		if (isShowDelete) {
			billFiles.map(it => {
				it.isSelect = false
			})
		}
		dataDetail[itemTab.ref_Name].billFile = JSON.stringify(billFiles)
		isShowDelete ? setShowDelete(false) : setShowDelete(true)
	}
	const handlePress = (item, type) => {
		if (isShowDelete) {
			item.isSelect = item.isSelect ? false : true
			dataDetail[itemTab.ref_Name].billFile = JSON.stringify(billFiles)
			setMutate(e => !e)
		} else if (type == 'IMAGE') {

			handleViewImage(item)
		} else {
			checkExistFile(item)
		}
	}
	const handleViewImage = (item) => {
		let listPhoto = []
		const uriItem = item.isSend === 1 ? item.link : item.uri
		const urlItem = uriItem.indexOf('file://') > -1 || uriItem.indexOf('https://') > -1 ? uriItem : URLDEFAULT + uriItem
		billFiles.map(it => {
			const uri = it.isSend === 1 ? it.link : it.uri
			const urlImage = uri.indexOf('file://') > -1 || uri.indexOf('https://') > -1 ? uri : URLDEFAULT + uri
			it.type == 2 && listPhoto.push({ photoPath: urlImage })
		})
		const indexImage = listPhoto.findIndex(it => it.photoPath == urlItem)
		setDataPhoto({ listPhoto: listPhoto, indexImage: indexImage })
		setVisible(true)
	}
	const openFileInvoice = (pathFile) => {
		openFileViewer(pathFile || "", (e) => {
			console.log('close');
			console.log(pathFile);
		}, false)
	}
	const downloadFile = (uri, path) => {
		RNFS.downloadFile({ fromUrl: URLDEFAULT + uri, toFile: path }).promise
			.then(res => {
				console.log(res);
				if (res.statusCode == 200) {
					openFileInvoice(path);
				} else {
					MessageInfo(`Xảy ra lỗi khi tải file!`)
					return
				}
			});
	}
	const checkExistFile = async (item) => {
		const uri = item.link
		const name = uri.substring(uri.lastIndexOf('/') + 1, uri.length);
		const extension = (Platform.OS === 'android') ? 'file://' : ''
		const path = `${extension}${RNFS.CachesDirectoryPath}/Invoice/`;
		const pathFile = `${path}${name}`;
		RNFS.exists(pathFile).then(exists => {
			if (exists) {
				openFileInvoice(pathFile);
			}
			else {
				RNFS.mkdir(path)
					.catch(err => {
						console.log('mkdir error', err);
					});
				downloadFile(uri, pathFile);
			}
		})
	}
	const handleChangeNoteInvoice = (text) => {
		dataDetail[itemTab.ref_Name].note = text
		setMutate(e => !e)
	}
	const onNumberChanged = (text) => {
		let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
		let intValue = value === null ? null : parseInt(value);
		if ((intValue > 0 || intValue === 0) && intValue != null) {
			dataDetail[itemTab.ref_Name].costs = intValue
		} else {
			dataDetail[itemTab.ref_Name].costs = 0
		}
		setMutate(e => !e)
	}
	const onNumberVATChanged = (text) => {
		let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
		let intValue = value === null ? null : parseInt(value);
		if ((intValue > 0 || intValue === 0) && intValue != null) {
			if (intValue > dataDetail[itemTab.ref_Name].costs) {
				return
			} else {
				dataDetail[itemTab.ref_Name].costVAT = intValue
			}
		} else {
			dataDetail[itemTab.ref_Name].costVAT = 0
		}
		setMutate(e => !e)
	}
	const moveExpensesNext = () => {
		setShowNextCost(e => !e)
	}
	const sendInvoiceByType = () => {
		let sendBillFile = JSON.parse(dataDetail[itemTab.ref_Name]?.billFile || '[]')
		sendBillFile.map(it => {
			it.isSend = 1;
		})
		if (dataDetail[itemTab.ref_Name]?.isRequestNote == 1) {
			if (dataDetail[itemTab.ref_Name]?.note?.length == 0 || dataDetail[itemTab.ref_Name]?.note == undefined || dataDetail[itemTab.ref_Name]?.note == null) {
				MessageInfo(`Bạn chưa nhập ghi chú khi gửi ${itemTab.nameVN}!`)
				return
			}
			if (dataDetail[itemTab.ref_Name]?.note?.length < 5) {
				MessageInfo(`Ghi chú phải lớn hơn 5 kí tự`)
				return
			}
		}
		MessageAction('Bạn chắc chắn gửi thay đổi?', async () => { actionSend(sendBillFile) })
	}
	const actionSend = async (dataBillFile) => {
		const result = await SendInvoice(JSON.stringify({ ...dataDetail[itemTab.ref_Name], "billFile": JSON.stringify(dataBillFile), "sendType": 'save' }))
		if (result.statusId === 200) {
			await UploadController.PostFile()
			dataDetail[itemTab.ref_Name].billFile = JSON.stringify(dataBillFile)
			dataDetail.dataUpload = { status: 200 }
			await setBillFiles(dataBillFile)
			await MessageInfo(`Cập nhật thông tin ${itemTab.nameVN} thành công`)
			await setMutate(e => !e)

		} else {
			MessageInfo(`Xảy ra lỗi khi cập nhật thông tin ${itemTab.nameVN}`)
		}
	}

	const sendNextPeriodByTab = async () => {
		if (!itemNextCosts.nextCosts || itemNextCosts.nextCosts == 0) {
			MessageInfo(`Bạn chưa nhập chi phí cần chuyển kì sau!`)
			return
		}
		if (itemNextCosts.note.length == 0 || itemNextCosts.note == undefined || itemNextCosts.note == null) {
			MessageInfo(`Bạn chưa nhập ghi chú khi chuyển kì sau!`)
			return
		}
		if (itemNextCosts.note.length < 5) {
			MessageInfo(`Ghi chú phải lớn hơn 5 kí tự`)
			return
		}
		const dataUpload = {
			...itemNextCosts,
			"typeNext": "item",
			"month": filterInvoice.month,
			"year": filterInvoice.year,
			"billInfoId": itemBussiness.billInfoId,
			"detailId": itemBussiness.detailId,
		}

		MessageAction(`Bạn chắc chắn muốn chuyển ${itemTab.nameVN} sang kỳ sau?`, async () => {

			const result = await SaveNextBill(JSON.stringify(dataUpload))
			if (result.statusId === 200) {
				if (result.data[0].status === 200) {
					dataDetail.dataUpload = { status: 200 }
					MessageInfo(`Cập nhật thông tin ${itemTab.nameVN} thành công`)
				} else {
					MessageInfo(result.data[0].message)
				}
			} else {
				MessageInfo(`Xảy ra lỗi khi chuyển kỳ sau ${itemTab.nameVN}`)
			}
		})
	}
	const handleSelectImage = async (listPhotoItem, indexImage) => {
		listPhotoItem.map(it => {
			it.photoPath = it.link
		})
		setDataPhoto({ listPhoto: listPhotoItem, indexImage: indexImage })
		setVisible(true)
	}

	const handleSelectImageByBill = async (listPhotoItem, indexImage) => {
		listPhotoItem.map(it => {
			it.photoPath = it.link
		})
		setDataPhoto({ listPhoto: listPhotoItem, indexImage: indexImage })
		setVisible(true)
	}
	const onCancelItemTrip = () => {
		if (dataDetail[itemTab.ref_Name].note == undefined || dataDetail[itemTab.ref_Name].note == null || dataDetail[itemTab.ref_Name].note.length == 0) {
			MessageInfo(`Bạn chưa nhập ghi chú khi bỏ quyết toán!`)
			return
		}
		if (dataDetail[itemTab.ref_Name].note.length < 5) {
			MessageInfo(`Ghi chú phải lớn hơn 5 kí tự`)
			return
		}
		const dataUpload = {
			billInfoId: itemBussiness.billInfoId,
			detailId: itemBussiness.detailId,
			note: dataDetail[itemTab.ref_Name].note,
			typeCancel: 'item',
			itemId: dataDetail[itemTab.ref_Name].itemId
		}
		MessageAction('Bạn chắc chắn muốn bỏ quyết toán?', () => uploadAction(dataUpload, 'cancel', 'Bỏ quyết toán'))
	}
	const uploadAction = async (dataUpload, sendType, messageText) => {
		const result = await SendInvoice(JSON.stringify({ ...dataUpload, "sendType": sendType }))
		if (result.statusId === 200) {
			dataDetail[itemTab.ref_Name].statusId = 7
			dataDetail.dataUpload = { status: 200 }
			MessageInfo(`${messageText} thành công!`)
			setMutate(e => !e)
		} else {
			MessageInfo(`Xảy ra lỗi khi ${messageText} hoá đơn chứng từ`)
		}
	}
	const isShowCurrentAction = dataDetail[itemTab.ref_Name]?.statusId !== 7 && ((itemBussiness.isCanEdit == 1 && itemBussiness.statusId !== 3 && itemBussiness.statusId !== 4) ||
		(itemBussiness.isCanEdit == 1 && ((itemBussiness.statusId == 3 || itemBussiness.statusId == 4) && (dataDetail[itemTab.ref_Name]?.statusId == 3 || dataDetail[itemTab.ref_Name]?.statusId == 4))))
	const currentActionPaddingBottom = 16
	const renderCurrentAction = () => (
		<View key={'ButtonCurrent_' + indexTab} style={{ paddingHorizontal: 5, paddingTop: 6, paddingBottom: 8, backgroundColor: appcolor.light }}>
			<View>
				<View style={{ flexDirection: 'row' }}>
					{
						itemBussiness.isCanNext == 1 &&
						<View style={{ width: '50%', padding: 5 }}>
							<TouchableOpacity onPress={() => moveExpensesNext()}
								style={{ minHeight: 44, padding: 8, borderRadius: 10, borderColor: appcolor.tomato, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}
							>
								<Text style={{ fontWeight: '800', fontSize: 13, color: appcolor.tomato, textAlign: 'center' }}>Chuyển kỳ sau</Text>
							</TouchableOpacity>
						</View>
					}
					<View style={{ width: itemBussiness.isCanNext == 1 ? '50%' : '100%', padding: 5 }}>
						<TouchableOpacity onPress={() => sendInvoiceByType()}
							style={{ minHeight: 44, padding: 8, borderRadius: 10, borderColor: appcolor.primary, backgroundColor: appcolor.primary, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}
						>
							<Text numberOfLines={2} style={{ fontWeight: '800', fontSize: 13, color: appcolor.white, textAlign: 'center' }}>Gửi {`${itemTab.nameVN}`}</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{ width: '100%', padding: 5 }}>
					<TouchableOpacity onPress={() => onCancelItemTrip()}
						style={{ minHeight: 44, padding: 8, borderRadius: 10, borderColor: appcolor.red, backgroundColor: appcolor.red, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}
					>
						<Text numberOfLines={2} style={{ fontWeight: '800', fontSize: 13, color: appcolor.white, textAlign: 'center' }}>Bỏ quyết toán {`${itemTab.nameVN}`}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
	return (
		<View key={'Item_' + indexTab} style={{ flex: 1, width: '100%', padding: 6, paddingBottom: 8, position: 'relative' }}>

			{
				isShowNextCost ?
					<View style={{ flex: 1, paddingBottom: 72 }}>
						<ViewNextCost itemNextCosts={itemNextCosts} key={'ViewNextCost_' + indexTab} itemTab={itemTab} indexTab={indexTab} itemBussiness={itemBussiness} dataDetail={dataDetail} styles={styles} filterInvoice={filterInvoice} />
					</View>
					:
					<View key={'keyTab_' + indexTab} style={{ flex: 1, flexDirection: 'column' }}>
						<ScrollView key={'scrollTab_' + indexTab}
							style={{ flex: 1 }}
							scrollEventThrottle={16}
							nestedScrollEnabled
							onScroll={() => isShowType ? showTypeUpdate() : null}
							contentContainerStyle={{ paddingBottom: currentActionPaddingBottom }}
						>
							{
								dataDetail[itemTab.ref_Name]?.statusName?.length > 0 &&
								<View style={{ padding: 10, flexDirection: "row" }}>
									<Text style={{ fontSize: 14, textAlign: "right", fontWeight: '500', color: appcolor.dark }}>Trạng thái : </Text>
									<Text style={{ fontSize: 14, textAlign: "right", fontWeight: '500', color: dataDetail[itemTab.ref_Name]?.colorHightlight || appcolor.dark }}> {dataDetail[itemTab.ref_Name]?.statusName || ''}</Text>
								</View>
							}
							<View style={{ flexDirection: 'row', marginBottom: 5, justifyContent: 'space-between' }}>
								<View style={{ flexDirection: 'row', paddingLeft: 10, paddingTop: 8 }}>
									<TouchableOpacity key={'Doccumnt_' + indexTab} style={{ paddingHorizontal: 8, height: 30, borderRadius: 10, backgroundColor: isShowItemDoc ? appcolor.primary : appcolor.surface, justifyContent: "center", alignItems: 'center', flexDirection: 'row', marginRight: 5 }}
										onPress={() => onShowDocument('DOCUMENT')}
									>
										<Icon name='attach-file' size={15} color={isShowItemDoc ? appcolor.white : appcolor.dark} />
										<Text style={{ fontWeight: '300', fontSize: 12, color: isShowItemDoc ? appcolor.white : appcolor.dark, textAlign: 'center', paddingLeft: 5 }}>{'Tệp'}</Text>
										<Badge
											containerStyle={{ position: 'absolute', top: -5, end: -10 }}
											textStyle={{ color: appcolor.white, fontSize: 11, fontWeight: '500' }}
											badgeStyle={{ minWidth: 17, height: 17, backgroundColor: appcolor.tomato, borderRadius: 50 }}
											value={quantityFile.fileByDoc}
										/>
									</TouchableOpacity>
									<TouchableOpacity key={'link_' + indexTab} style={{ paddingHorizontal: 8, height: 30, borderRadius: 10, backgroundColor: !isShowItemDoc && !isShowItemImage ? appcolor.primary : appcolor.surface, justifyContent: "center", alignItems: 'center', flexDirection: 'row', marginLeft: 10 }}
										onPress={() => onShowDocument('LINK')}
									>
										<Icon name='link' size={15} color={!isShowItemDoc && !isShowItemImage ? appcolor.white : appcolor.dark} />
										<Text style={{ fontWeight: '300', fontSize: 12, color: !isShowItemDoc && !isShowItemImage ? appcolor.white : appcolor.dark, textAlign: 'center', paddingLeft: 5 }}>{'Link'}</Text>
										<Badge
											containerStyle={{ position: 'absolute', top: -5, end: -10 }}
											textStyle={{ color: appcolor.white, fontSize: 11, fontWeight: '500' }}
											badgeStyle={{ minWidth: 17, height: 17, backgroundColor: appcolor.tomato, borderRadius: 50 }}
											value={quantityFile.fileByLink}
										/>
									</TouchableOpacity>
									{
										listReport.isUseTakePhoto == 1 &&
										<TouchableOpacity key={'Image_' + indexTab} style={{ paddingHorizontal: 8, height: 30, borderRadius: 10, backgroundColor: !isShowItemDoc && isShowItemImage ? appcolor.primary : appcolor.surface, justifyContent: "center", alignItems: 'center', flexDirection: 'row', marginLeft: 10 }}
											onPress={() => onShowDocument('IMAGE')}>
											<Icon name='image' size={15} color={!isShowItemDoc && isShowItemImage ? appcolor.white : appcolor.dark} />
											<Text style={{ fontWeight: '300', fontSize: 12, color: !isShowItemDoc && isShowItemImage ? appcolor.white : appcolor.dark, textAlign: 'center', paddingLeft: 5 }}>{'Hình'}</Text>
											<Badge
												containerStyle={{ position: 'absolute', top: -5, end: -10 }}
												textStyle={{ color: appcolor.white, fontSize: 11, fontWeight: '500' }}
												badgeStyle={{ minWidth: 17, height: 17, backgroundColor: appcolor.tomato, borderRadius: 50 }}
												value={quantityFile.fileByImage}
											/>
										</TouchableOpacity>
									}

								</View>
								<View key={'ToolByTab_' + indexTab} style={{ flexDirection: 'row', paddingTop: 8 }}>
									{
										(!isShowDelete && isShowItemImage && itemBussiness.isCanEdit == 1) &&
										<View style={{ flexDirection: 'row' }}>
											<TouchableOpacity style={{ width: 50, height: 30, borderRadius: 10, backgroundColor: appcolor.surface, justifyContent: "center", alignItems: 'center', marginRight: 5 }} onPress={handleImageTakePhoto}>
												<Icon name='camera' type="ionicon" size={15} color={appcolor.dark} />
											</TouchableOpacity>
											<TouchableOpacity style={{ width: 50, height: 30, borderRadius: 10, backgroundColor: appcolor.surface, justifyContent: "center", alignItems: 'center', marginRight: 5 }} onPress={handleImageSelection}>
												<Icon name='attach-outline' type="ionicon" size={15} color={appcolor.dark} />
											</TouchableOpacity>
										</View>
									}
									{
										(!isShowDelete && isShowItemDoc && itemBussiness.isCanEdit == 1) &&
										<TouchableOpacity style={{ width: 60, height: 30, borderRadius: 10, backgroundColor: appcolor.surface, justifyContent: "center", alignItems: 'center', marginRight: 5 }} onPress={handleDocumentSelection}>
											<Icon name='file-import' type="font-awesome-5" size={15} color={appcolor.dark} />
										</TouchableOpacity>
									}
									{
										(isShowDelete && itemBussiness.isCanEdit == 1) &&
										<TouchableOpacity style={{ width: 60, height: 30, borderRadius: 10, backgroundColor: appcolor.surface, justifyContent: "center", alignItems: 'center', marginRight: 5 }} onPress={handleDelete}>
											<Icon name='trash-alt' type="font-awesome-5" size={15} color={appcolor.red} />
										</TouchableOpacity>
									}
								</View>
							</View>
							{
								(isShowItemDoc && billFiles.length > 0) &&
								<View key={'listByDoc_' + indexTab} style={{ backgroundColor: appcolor.surface, borderRadius: 8, borderColor: appcolor.dark }}>
									<ScrollView key={'listScrollDoc_' + indexTab} ref={ref_ScrollDoc} horizontal={true} showsHorizontalScrollIndicator={false} >
										{
											billFiles.map((it, idx) => {
												return (
													(it.type !== 1 && it.type !== 2) ? <RenderItemDocument key={indexTab + 'File_' + idx} item={it} index={idx} /> : null
												)
											})
										}
									</ScrollView>
								</View>
							}
							{
								isShowItemImage && billFiles.length > 0 &&
								<View key={'listByImage_' + indexTab} style={{}}>
									<ScrollView key={'listScrollLink_' + indexTab} ref={ref_ScrollImage} horizontal={true} showsHorizontalScrollIndicator={false} style={{ padding: 5 }} >
										{
											billFiles.map((it, idx) => {
												return (
													it.type == 2 ? <RenderItemImageByBill key={indexTab + 'image_' + idx} item={it} index={idx} /> : null
												)
											})
										}
									</ScrollView>
								</View>
							}
							{
								!isShowItemDoc && !isShowItemImage &&
								<View key={'listByLink_' + indexTab} style={{ backgroundColor: appcolor.surface, borderRadius: 8, borderColor: appcolor.dark }}>
									{
										((itemBussiness.isCanEdit == 1 && itemBussiness.statusId !== 3 && itemBussiness.statusId !== 4) ||
											(itemBussiness.isCanEdit == 1 && ((itemBussiness.statusId == 3 || itemBussiness.statusId == 4) &&
												(dataDetail[itemTab.ref_Name]?.statusId == 3 || dataDetail[itemTab.ref_Name]?.statusId == 4)))) &&
										<FormGroup
											selectTextOnFocus={true}
											containerStyle={{ backgroundColor: appcolor.light, borderColor: appcolor.dark, borderWidth: 0.5, borderRadius: 5, margin: 5 }}
											inputStyle={{ fontSize: 13 }}
											editable={true}
											value={linkInVoice || ''}
											placeholder='Nhập đường dẫn tại đây'
											iconName={'upload'}
											useClearAndroid={true}
											onClearTextAndroid={onChangeInvoiceLink}
											iconFunc={handleCheckLink}
											handleChangeForm={onChangeInvoiceLink}
										/>
									}

									<ScrollView key={'listScrollLink_' + indexTab} ref={ref_ScrollLink} horizontal={true} showsHorizontalScrollIndicator={false} style={{ padding: 5 }} >
										{
											billFiles.map((it, idx) => {
												return (
													it.type == 1 ? <RenderItemLink key={indexTab + 'link_' + idx} item={it} index={idx} /> : null
												)
											})
										}
									</ScrollView>
								</View>
							}
							<Text style={{ fontSize: 15, fontWeight: '600', color: appcolor.dark, padding: 5 }}>Tổng chi phí</Text>
							<View key={'CostsTab_' + indexTab} style={{ minHeight: 10, minWidth: 10 }}>
								<NumericFormat
									key={`n${indexTab}`}
									value={dataDetail[itemTab.ref_Name]?.costs ? dataDetail[itemTab.ref_Name]?.costs : ''}
									displayType={'text'}
									thousandSeparator
									renderText={value =>
										<FormGroup
											editable={true}
											key={indexTab}
											returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
											placeholder={'Chi phí'}
											value={(value) || ''}
											inputStyle={{ textAlign: 'left' }}
											keyboardType="numeric" handleChangeForm={onNumberChanged}
											returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
											onClearTextAndroid={onNumberChanged}
										/>
									} />
								{
									itemBussiness.isUseVAT == 1 &&
									<View style={{ minHeight: 10, minWidth: 10 }}>
										<NumericFormat
											key={`nVAT${indexTab}`}
											value={dataDetail[itemTab.ref_Name]?.costVAT ? dataDetail[itemTab.ref_Name]?.costVAT : ''}
											displayType={'text'}
											thousandSeparator
											renderText={value =>
												<FormGroup
													editable={true}
													key={indexTab}
													returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
													placeholder={'Chi phí VAT'}
													value={(value) || ''}
													inputStyle={{ textAlign: 'left' }}
													keyboardType="numeric" handleChangeForm={onNumberVATChanged}
													returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
													onClearTextAndroid={onNumberVATChanged}
												/>
											} />
										<Text style={{ fontSize: 15, fontWeight: '600', color: appcolor.dark, padding: 5 }}>Chi phí sau VAT</Text>
										<NumericFormat
											key={`nTotal${indexTab}`}
											value={(dataDetail[itemTab.ref_Name]?.costs || 0) - (dataDetail[itemTab.ref_Name]?.costVAT || 0)}
											displayType={'text'}
											thousandSeparator
											renderText={value =>
												<FormGroup
													editable={false}
													key={indexTab}
													returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
													placeholder={'Chi phí VAT'}
													value={(value) || ''}
													inputStyle={{ textAlign: 'left' }}
													keyboardType="numeric" handleChangeForm={onNumberVATChanged}
													returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
													onClearTextAndroid={onNumberVATChanged}
												/>
											} />
									</View>
								}
							</View>

							<FormGroup
								key={'NoteByTab_' + indexTab}
								containerStyle={{ padding: 3, marginTop: 5, backgroundColor: appcolor.light }}
								inputStyle={{ fontSize: 13 }}
								editable={true}
								value={dataDetail[itemTab.ref_Name]?.note || ''}
								title={`Ghi chú`}
								placeholder='Nhập ghi chú'
								iconName={'comment-alt'}
								rightFunc={handleChangeNoteInvoice}
								handleChangeForm={handleChangeNoteInvoice}
							/>
							{
								(dataDetail[itemTab.ref_Name]?.confirmNote !== '' && dataDetail[itemTab.ref_Name]?.confirmNote?.length > 0) &&
								<FormGroup
									containerStyle={{ padding: 3, marginTop: 5, backgroundColor: appcolor.light, borderWidth: 1 }}
									inputStyle={{ fontSize: 13 }}
									editable={false}
									multiline
									value={dataDetail[itemTab.ref_Name]?.confirmNote || ''}
									title={`Ghi chú của Quản trị viên`}
									placeholder='Không có ghi chú nào'
									iconName={'comment-alt'}
								/>
							}
							{
								confirmFile.length > 0 &&
								<View key={'ViewConfirm_' + indexTab} style={{}}>
									<ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ padding: 5 }} >
										{
											confirmFile.map((it, idx) => {
												return (<RenderItemPhoto key={'ImageConfirm_' + indexTab + '_' + idx} item={it} index={idx} listPhotoItem={confirmFile} handleSelectImage={handleSelectImage} />
												)
											})
										}
									</ScrollView>
								</View>
							}
						</ScrollView>
						{isShowCurrentAction && renderCurrentAction()}
					</View >
			}

			{
				isShowNextCost && <View key={'ButtonNextCost_' + indexTab} style={{ position: 'absolute', left: 6, right: 6, bottom: 0, flexDirection: 'row', paddingHorizontal: 5, paddingTop: 6, paddingBottom: 8, backgroundColor: appcolor.light }}>
					<View style={{ width: '50%', padding: 5 }}>
						<TouchableOpacity onPress={() => moveExpensesNext()}
							style={{ minHeight: 44, padding: 8, borderRadius: 10, borderColor: appcolor.tomato, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}
						>
							<Text style={{ fontWeight: '800', fontSize: 13, color: appcolor.tomato }}>Quay lại</Text>
						</TouchableOpacity>
					</View>
					<View style={{ width: '50%', padding: 5 }}>
						<TouchableOpacity onPress={() => sendNextPeriodByTab()}
							style={{ minHeight: 44, padding: 8, borderRadius: 10, borderColor: appcolor.primary, backgroundColor: appcolor.primary, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}
						>
							<Text numberOfLines={2} style={{ fontWeight: '800', fontSize: 13, color: appcolor.white, textAlign: 'center' }}>Gửi thông tin chuyển</Text>
						</TouchableOpacity>
					</View>
				</View>
			}
			<Modal
				id={'imageSheet'}
				key={'ViewImage_' + indexTab}
				visible={visible}
				containerStyle={{ flex: 1 }}
			>
				<MultipleShowImage key={'ShowItemImage_' + indexTab} listItem={dataPhoto.listPhoto} closeShowImage={() => setVisible(false)} indexItem={dataPhoto.indexImage} />
			</Modal>
		</View >
	)
}
const RenderItemPhoto = ({ item, index, listPhotoItem, handleSelectImage }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [urlImage, setUrlImage] = useState(item.link.indexOf('file://') > -1 || item.link.indexOf('https://') > -1 ? item.link : URLDEFAULT + item.link)

	const onSelectImage = () => {
		handleSelectImage(listPhotoItem, index)
	}
	return (
		<TouchableOpacity key={index} onPress={onSelectImage} style={{ width: deviceWidth / 5, height: deviceWidth / 4, backgroundColor: appcolor.surface, margin: 5, borderRadius: 12, justifyContent: 'center', alignItems: "center" }}  >
			<Image source={{ uri: urlImage }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
		</TouchableOpacity>
	)
}
