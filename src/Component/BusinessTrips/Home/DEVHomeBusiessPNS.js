import React, { useEffect, useRef, useState } from "react";
import { FlatList, LayoutAnimation, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ACTION_UPLOAD, DATE, LATITUDE_DELTA, LONGITUDE_DELTA, MODE, actionBackHeader, actionNextHeader } from "../UtilityBusiness";
import moment from "moment";
import { TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { alertConfirm, alertWarning, deviceHeight, deviceWidth, minWidthTab } from "../../../Core/Utility";
import { Icon, Text } from '@rneui/themed';
import { CheckLocation } from "../../../Core/Helper";
import Geolocation from '@react-native-community/geolocation';
import ActionSheet, { ScrollView as ASScrollView, SheetManager } from "react-native-actions-sheet";
import { SafeAreaView } from "react-native";
import { UploadDocument } from "../DocumentByTrips/UploadDocument";
import { TripResult } from "../TripResult";
import { CostMenu } from "../CostTrips/CostMenu";
import { CreateNewTrip } from "../CreateTrips";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import _ from 'lodash'
import { ACTION } from "../../../Core/ReduxController";
import { NumberFormatView } from "../../../Control/NumberFormatView";
import FormGroup from "../../../Content/FormGroup";
import { CalendarSelected } from "../../../Control/CalendarSelected";
import { InvoiceResultDefault } from "../DocumentByTrips/InvoiceResultDefault";
import { ItemResultView } from "../ItemResultHome";
import { GetBusinesTrips, GetDataTripBills, UploadBusiness } from "../../../Controller/BussinessTripController";
import { LoadingView } from "../../../Control/ItemLoading";
import { YearMonthSelected } from "../../../Control/YearMonthSelected";
import { SetBusinesTrips } from "../../../Redux/action";

export const DEVHomeBusiessPNS = ({ navigation }) => {
	const dispatch = useDispatch()
	const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
	const [loading, setLoading] = useState(false)
	const [marker, setMarker] = useState({ "latitude": 0, "latitudeDelta": 0, "longitude": LATITUDE_DELTA, "longitudeDelta": LONGITUDE_DELTA })
	const [itemTrips, setItemTrips] = useState({ fromDate: moment().startOf('month').format('YYYYMMDD'), toDate: moment().endOf('month').format('YYYYMMDD') })
	const [filter, setFilter] = useState({
		mode: MODE.HISTORY,
		moneyLimit: 0,
		loadCalendar: false,
		fromDate: moment().startOf('month').format('DD/MM/YYYY'),
		toDate: moment().endOf('month').format('DD/MM/YYYY'),
		fromDateCaculator: moment().startOf('month'),
		toDateCaculator: moment().endOf('month'),
		dayAndNight: '', dayValue: 0, nightValue: 0,
		mLatitude: 0,
		mLongitude: 0,
		isReConfirm: false,
		isUpdate: false,
		isPlus: false,
		isLockOutMonth: false
	})
	const [filterInvoice, setFilterInvoice] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}`, "loadYearMonth": false, "jsonFilter": {} })
	const [dataConfirm, setDataConfirm] = useState([])
	const [isConfirmTrip, setIsConfirm] = useState(false)
	const [dataTrips, setDataTrips] = useState([])
	const [dataBill, setDataBill] = useState({ dataDefault: {}, dataDetail: [] })
	const [dataTripsMain, setDataTripsMain] = useState([])
	const [tabStatus, setTabStatus] = useState([])
	const [moneyLimit, setMoneyLimit] = useState(0)
	const [lockResultTrips, setLockResultTrips] = useState(true)
	const [lockCreate, setLockCreate] = useState(false)
	const [lockCreateOld, setLockCreateOld] = useState(false)
	const [isLockOutMonth, setLockOutMonth] = useState(false)
	const [itemDetailView, setItemDetailView] = useState({})
	const [isCreateInMonth, setCreateInMonth] = useState(false)
	const [modeHeader, setModeHeader] = useState('create')
	const [currentItem, setCurrentItem] = useState({})
	const [tripConfig, setTripConfig] = useState('{}')
	const refMaps = useRef()
	const config = JSON.parse(kpiinfo?.reportItem) || {}

	// Setup Data
	const ViewByMode = async () => {
		if (modeHeader == 'create') {
			await LoadDataRegister()
		} else if (modeHeader == 'invoice') {
			await LoadDataInvoice()
		}
	}
	const LoadDataRegister = async (fromDate, toDate) => {
		await setIsConfirm(false)
		await setLoading(true)
		const fromValue = fromDate || itemTrips.fromDate
		const toValue = toDate || itemTrips.toDate
		await setFilter({
			...filter,
			loadCalendar: false,
			fromDate: moment(fromValue).format('DD/MM/YYYY'),
			toDate: moment(toValue).format('DD/MM/YYYY'),
			fromDateCaculator: moment(fromValue),
			toDateCaculator: moment(toValue)
		})
		await setItemTrips({
			fromDate: moment(fromValue).format('YYYYMMDD'),
			toDate: moment(toValue).format('YYYYMMDD')
		})
		await GetBusinesTrips(
			moment(fromValue).format('YYYYMMDD'),
			moment(toValue).format('YYYYMMDD'),
			async (mData) => {
				await setDataTrips(mData)
				await setDataTripsMain(mData)
				await setTabStatus(_.uniqBy(mData, 'status'))
				await setMoneyLimit(mData[0]?.remaining || 0)
				await setLockCreate(mData[0]?.isLockCreate == 1)
				await setLockOutMonth(mData[0]?.isLockOutMonth == 1)
				await setLockResultTrips(mData[0]?.isLockResultTrips == 1)
				await setCreateInMonth(mData[0]?.isCreateInMonth == 1)
				await setTripConfig(mData[0]?.tripConfig)
			}
		)
		await setLoading(false)
	}
	const LoadDataInvoice = async (year, month) => {
		setDataTrips([])
		setDataTripsMain([])
		await setLoading(true)
		const monthFormat = (month && year) ? month : ((filterInvoice.year && filterInvoice.month) ? filterInvoice.month : moment(itemTrips.fromDate, 'YYYYMMDD').format('MM'));
		const yearFormat = (month && year) ? year : ((filterInvoice.year && filterInvoice.month) ? filterInvoice.year : moment(itemTrips.fromDate, 'YYYYMMDD').format('YYYY'));
		await setItemTrips({
			...itemTrips,
			month: monthFormat,
			year: yearFormat
		})
		const result = await GetDataTripBills(JSON.stringify({ "year": yearFormat, "month": monthFormat }))
		if (result.statusId === 200) {
			const mDataBill = result.data?.table1 || []
			await setTabStatus(_.uniqBy(mDataBill, 'status'))
			await setDataBill({ dataDefault: result.data?.table[0], dataDetail: mDataBill })
		}
		await setLoading(false)
	}
	// Handler Action
	const handlerRegionChange = async (value) => {
		setMarker(value)
		setFilter({
			...filter,
			mLatitude: value.latitude,
			mLongitude: value.longitude
		})
	}
	const handlerShowTrip = async () => {
		SheetManager.show('sheetAction')
		setFilter({ ...filter, mode: filter.mode == MODE.CONFIRM ? MODE.HISTORY : MODE.CONFIRM })
	}
	const getMyLocation = async () => {
		await CheckLocation(() => {
			Geolocation.getCurrentPosition((position) => {
				setMarker({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					latitudeDelta: LATITUDE_DELTA,
					longitudeDelta: LONGITUDE_DELTA,
				})
				setFilter({
					...filter,
					mLatitude: position.coords.latitude,
					mLongitude: position.coords.longitude
				})
				refMaps?.current.animateToRegion({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					latitudeDelta: LATITUDE_DELTA,
					longitudeDelta: LONGITUDE_DELTA,
				})
			})
		})
	}
	const handlerBackCreate = (typeArrow) => {
		const mode = actionBackHeader(typeArrow)
		setFilter({ ...filter, mode: mode })
	}
	const handlerNextCreate = async (typeArrow) => {
		if (typeArrow == MODE.CREATE) {
			if (moment(filter.fromDateCaculator).format('YYYYMM') < moment().format('YYYYMM')) {
				alertWarning('Bạn không được đăng kí tháng cũ')
				return
			}
		}
		if (typeArrow == MODE.RESULT)
			await LoadDataRegister(itemTrips.fromDate, itemTrips.toDate)
		const mode = await actionNextHeader(typeArrow)
		if (mode !== undefined)
			await setFilter({ ...filter, mode: mode, loadCalendar: false })
	}
	const handlerAction = async () => {
		switch (modeHeader) {
			case 'create':
				handlerRegisterTrips()
				break
		}
	}
	const handlerChangeHeader = async (mode) => {
		if (loading)
			return
		setModeHeader(mode)
		setCurrentItem({})
		switch (mode) {
			case 'create':
				await LoadDataRegister()
				break
			case 'invoice':
				await LoadDataInvoice()
				break
		}
	}
	const handlerRegisterTrips = async () => {
		if (config.checkLimit == 1 && moneyLimit == 0) {
			alertWarning('Hạn mức còn lại đã hết bạn sẽ không được đăng kí')
			return
		}
		if (moment(filter.fromDateCaculator).format('YYYYMM') < moment().format('YYYYMM')) {
			alertWarning('Bạn không được đăng kí tháng cũ')
			return
		}
		const betweenDate = moment(filter.toDateCaculator).diff(moment(filter.fromDateCaculator), 'days')
		const calculatorDate = `(${betweenDate + 1} Ngày ${betweenDate} Đêm)`
		// await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: {} })
		await dispatch(SetBusinesTrips({}))
		await setFilter({
			...filter,
			moneyLimit: moneyLimit,
			mode: MODE.CREATE,
			dayAndNight: calculatorDate,
			dayValue: betweenDate + 1,
			nightValue: betweenDate,
			itemDate: itemTrips,
			isUpdate: false,
			isPlus: false,
			isLockOutMonth: false,
			isCreateInMonth: isCreateInMonth,
			tripConfig: tripConfig
		})
	}
	const handlerDeleteTrip = (item) => {
		alertConfirm('Chú ý', `Bạn có muốn xoá đăng kí công tác ${item.provinceFromVN} - ${item.provinceToVN} Từ ${moment(item.fromDate.toString()).format('DD/MM/YY')} - Đến ${moment(item.toDate.toString()).format('DD/MM/YY')} không ?`, async () => {
			await UploadBusiness(ACTION_UPLOAD.DELETE, item, async () => {
				await LoadDataRegister(itemTrips.fromDate, itemTrips.toDate)
			})
		})
	}
	const handlerConfirmTrip = (item, type) => {
		const alertTitle = `Bạn có muốn ${type == ACTION_UPLOAD.APPROVED ? 'Xác nhận' : 'Huỷ'} ${isConfirmTrip ? 'kết quả công tác' : 'đăng kí công tác'} Từ ${moment(item.fromDate.toString()).format('DD/MM/YY')} - Đến ${moment(item.toDate.toString()).format('DD/MM/YY')} không ?`
		alertConfirm('Chú ý', alertTitle, async () => {
			await UploadBusiness(type, item, async () => {
				await LoadDataRegister(itemTrips.fromDate, itemTrips.toDate)
			})
		})
	}
	const handlerEditTrips = async (item) => {
		const day = item.toDate - item.fromDate + 1
		const night = item.toDate - item.fromDate
		const calculatorDate = `(${day} Ngày ${night} Đêm)`
		const itemEdit = {
			idTrip: item.idTrip,
			loadCalendar: false,
			moneyLimit: item.remaining + item.totalSupport,
			provinceFrom: item.provinceFromVN || null,
			provinceTo: item.provinceToVN || null,
			provinceList: JSON.parse(item.provinceList) || [],
			provinceCodeFrom: item.provinceFromCode || null,
			provinceCodeTo: item.provinceToCode || null,
			addressFrom: item.addressStart || null,
			addressTo: item.addressEnd || null,
			locationStart: item.locationStart || null,
			locationEnd: item.locationEnd || null,
			fromDate: item.fromDate,
			toDate: item.toDate,
			dayValue: day,
			nightValue: night,
			dateFilterFrom: moment(item.fromDate.toString()).format('DD/MM/YYYY'),
			dateFilterTo: moment(item.toDate.toString()).format('DD/MM/YYYY'),
			dayAndNight: calculatorDate,
			note: item.note || null,
			supportKM: item.supportKM,
			supportVehical: item.supportCar,
			supportVehicalOther: item.supportVehicalOther,
			supportNight: item.supportNight,
			supportLunch: item.supportLunch,
			supportDinner: item.supportDinner,
			supportOther: item.supportOther,
			totalNumberDay: _.sumBy(JSON.parse(item.provinceList), 'numberDay') || 0,
			typePeople: item.typePeople || null,
			typeKM: item.typeKM || null,
			daysMove: item.days || null,
			kmValue: item.kilometer,
			tripReplace: item.tripReplace,
			districtFrom: item.districtFrom || null,
			districtTo: item.districtTo || null,
			districtCodeFrom: item.districtCodeFrom || null,
			districtCodeTo: item.districtCodeTo || null,
		}
		// await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: itemEdit })
		await dispatch(SetBusinesTrips(itemEdit))
		await setFilter({
			...filter,
			moneyLimit: moneyLimit,
			mode: MODE.UPDATE,
			dayAndNight: calculatorDate,
			dayValue: day,
			nightValue: night,
			itemDate: itemTrips,
			isUpdate: true,
			isPlus: false,
			tripConfig: tripConfig
		})
	}
	const handlerReConfirmTrips = async (item) => {
		const day = item.toDate - item.fromDate + 1
		const night = item.toDate - item.fromDate
		const calculatorDate = `(${day} Ngày ${night} Đêm)`
		const itemEdit = {
			idTrip: item.idTrip,
			loadCalendar: false,
			moneyLimit: item.remaining + item.totalSupport,
			provinceFrom: item.provinceFromVN || null,
			provinceTo: item.provinceToVN || null,
			provinceList: JSON.parse(item.provinceList) || [],
			provinceCodeFrom: item.provinceFromCode || null,
			provinceCodeTo: item.provinceToCode || null,
			addressFrom: item.addressStart || null,
			addressTo: item.addressEnd || null,
			locationStart: item.locationStart || null,
			locationEnd: item.locationEnd || null,
			fromDate: item.fromDate,
			toDate: item.toDate,
			dayValue: day,
			nightValue: night,
			dateFilterFrom: moment(item.fromDate.toString()).format('DD/MM/YYYY'),
			dateFilterTo: moment(item.toDate.toString()).format('DD/MM/YYYY'),
			dayAndNight: calculatorDate,
			note: item.note || null,
			supportKM: item.supportKM,
			supportVehical: item.supportCar,
			supportVehicalOther: item.supportVehicalOther,
			supportNight: item.supportNight,
			supportLunch: item.supportLunch,
			supportDinner: item.supportDinner,
			supportOther: item.supportOther,
			totalNumberDay: _.sumBy(JSON.parse(item.provinceList), 'numberDay') || 0,
			typePeople: item.typePeople || null,
			typeKM: item.typeKM || null,
			daysMove: item.days || null,
			kmValue: item.kilometer,
			districtFrom: item.districtFrom || null,
			districtTo: item.districtTo || null,
			districtCodeFrom: item.districtCodeFrom || null,
			districtCodeTo: item.districtCodeTo || null,
		}
		// await dispatch({ type: ACTION.SET_BUSINESS_TRIPS, itemTrips: itemEdit })
		await dispatch(SetBusinesTrips(itemEdit))
		await setFilter({
			...filter,
			moneyLimit: moneyLimit,
			mode: MODE.UPDATE,
			dayAndNight: calculatorDate,
			dayValue: day,
			nightValue: night,
			itemDate: itemTrips,
			isUpdate: false,
			isPlus: false,
			isReConfirm: true,
			tripConfig: tripConfig
		})
	}
	const showCalendar = () => {
		setFilter({ ...filter, loadCalendar: !filter.loadCalendar })
	}
	// Handler Invoice
	const showSelectYearMonth = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setFilterInvoice({ ...filterInvoice, loadYearMonth: filterInvoice.loadYearMonth ? false : true })
	}
	const onFilterChange = (search) => {
		if (search.year && search.month) {
			filterInvoice.jsonFilter = search
			setCurrentItem({})
			submitSearch()
		}
	}
	const submitSearch = async () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		if (Object.keys(filterInvoice.jsonFilter).length > 0) {
			await setFilterInvoice({ ...filterInvoice.jsonFilter, loadYearMonth: false })
			await LoadDataInvoice(filterInvoice.jsonFilter.year, filterInvoice.jsonFilter.month)
		} else {
			await setFilterInvoice({ ...filterInvoice, loadYearMonth: false })
			await LoadDataInvoice(filterInvoice.year, filterInvoice.month)
		}
	}
	const handleReloadInvoice = () => {
		LoadDataInvoice(filterInvoice.year, filterInvoice.month)
	}
	const handleOnScroll = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setFilterInvoice({ ...filterInvoice, loadYearMonth: false })
	}
	const handlerUploadDocument = (currentItem, item, currentIndexHome) => {
		setCurrentItem({ ...currentItem, isCanEdit: item.isCanEdit, isCanNext: item.isCanNext, isCanCancel: item.isCanCancel, currentIndexHome: currentIndexHome })
		setFilter({ ...filter, mode: MODE.DOCUMENT_TRIPS })
	}
	const handlerCloseDocument = async (item) => {
		if (item?.status === 200) {
			await LoadDataInvoice(filterInvoice.year, filterInvoice.month)
		}
		SheetManager.show('sheetAction')
		setFilter({ ...filter, mode: MODE.HISTORY })
	}
	//
	// View
	const renderItem = ({ item, index }) => {
		return (
			<ItemResultView
				key={`HHint_${index}`}
				styles={styles}
				index={index}
				item={item}
				handlerConfirmTrip={handlerConfirmTrip}
				handlerEditTrips={handlerEditTrips}
				handlerDeleteTrip={handlerDeleteTrip}
				handlerReConfirmTrip={handlerReConfirmTrips}
			/>
		)
	}
	useEffect(() => {
		getMyLocation()
		ViewByMode()
		return () => false
	}, [])
	const styles = StyleSheet.create({
		mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
		mapsView: { width: '100%', height: '100%' },
		actionView: { position: 'absolute', top: 30, start: 8, zIndex: 5 },
		sheetView: { width: '100%', height: '100%' },
		titleCreate: { width: '100%', textAlign: 'center', color: appcolor.light, padding: 8, fontSize: 14, fontWeight: '500' },
		actionHeader: { width: '100%', alignItems: 'center', padding: 5 },
		actionHistory: { width: '100%', padding: 8 },
		buttonAction: { borderRadius: 8, backgroundColor: appcolor.success },
		buttonActionRegister: { borderRadius: 8, backgroundColor: appcolor.highlightDate },
		limitView: { fontSize: 23, fontWeight: '800', color: appcolor.info, alignSelf: 'center', paddingBottom: 8, fontStyle: 'italic' },
		viewDate: { width: '100%', borderRadius: 5, alignItems: 'center' },
		historyViewItem: { width: '100%', height: '100%', alignSelf: 'center' },
		itemTrips: { width: '100%', padding: 3, backgroundColor: appcolor.surface, borderRadius: 8, marginBottom: 5, marginTop: 5, },
		titleView: { fontSize: 14, fontWeight: '700', color: appcolor.dark },
		contentView: { fontSize: 13, fontWeight: '400', color: appcolor.greylight },
		contentTopView: { fontSize: 13, fontWeight: '400', color: appcolor.light },
		costView: { backgroundColor: appcolor.light, padding: 8 },
		costItemView: { flexDirection: 'row', alignItems: 'center' },
		itemConfirm: { width: deviceWidth / 4, borderColor: appcolor.blacklight, borderWidth: 0.5, padding: 8, alignItems: 'center', borderRadius: 5, margin: 5 }
	})
	return (
		<View style={styles.mainContainer}>
			<TouchableOpacity style={styles.actionView} onPress={() => navigation.goBack()}>
				<Icon reverse name='arrow-back' size={21} />
			</TouchableOpacity>
			<View style={{ position: 'absolute', top: 30, end: 8, zIndex: 5 }}>
				<TouchableOpacity onPress={handlerShowTrip}>
					<Icon reverse name='briefcase' type='font-awesome' size={21} />
				</TouchableOpacity>
				<TouchableOpacity onPress={getMyLocation}>
					<Icon reverse color={appcolor.info} name='location-arrow' type='font-awesome' size={21} />
				</TouchableOpacity>
			</View>
			<MapView
				ref={refMaps}
				style={styles.mapsView}
				provider={PROVIDER_GOOGLE}
				showsMyLocationButton={false}
				showsUserLocation
				getCurrentPosition
				zoomEnabled
				scrollingEnabled
				onRegionChange={handlerRegionChange}>
				<Marker draggable pinColor={appcolor.red} coordinate={marker} />
			</MapView>
			<ActionSheet id='sheetAction'
				// gestureEnabled
				keyboardHandlerEnabled={false}
				drawUnderStatusBar={Platform.OS == 'ios'}
				closable={filter.mode == MODE.HISTORY || filter.mode == MODE.CONFIRM || filter.mode == MODE.DOCUMENT_TRIPS}>
				{(filter.mode == MODE.HISTORY || filter.mode == MODE.CONFIRM) &&
					<SafeAreaView style={styles.sheetView}>
						{modeHeader !== 'invoice' &&
							<TouchableOpacity style={{ position: 'absolute', bottom: deviceHeight / 10, zIndex: 10, end: 16 }} onPress={handlerAction}>
								<View style={{ width: 50, height: 50, justifyContent: 'center', backgroundColor: appcolor.dark, borderRadius: 50, opacity: 0.8 }}>
									<Icon name="plus" type="font-awesome-5" color={appcolor.light} size={18} />
								</View>
							</TouchableOpacity>
						}

						{/* Header */}
						<View style={styles.actionHeader}>
							{config.checkLimit == 1 && <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 3 }}>Hạn mức còn lại</Text>}
							{config.checkLimit == 1 && <NumberFormatView value={moneyLimit} textStyle={styles.limitView} />}
							<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: 50 }}>
								<View style={{ flexDirection: 'row', padding: 8, }}>
									<TabHeader
										modeValue={modeHeader}
										type='create'
										label='Đăng kí'
										handlerChangeHeader={handlerChangeHeader}
									/>
									{
										config.isResult == 1 &&
										<TabHeader
											modeValue={modeHeader}
											type='result'
											label='Kết quả công tác'
											handlerChangeHeader={handlerChangeHeader}
										/>
									}
									{config.isInvoice == 1 &&
										<TabHeader
											modeValue={modeHeader}
											type='invoice'
											label='Quyết toán chứng từ'
											handlerChangeHeader={handlerChangeHeader}
										/>
									}
								</View>
							</ScrollView>
							<TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 4 }} onPress={() => SheetManager.hide('sheetAction')}>
								<View style={{ width: 40, height: 40, justifyContent: 'center', backgroundColor: appcolor.dark, borderRadius: 50, opacity: 0.8 }}>
									<Icon name="map" type="font-awesome-5" color={appcolor.light} size={18} />
								</View>
							</TouchableOpacity>
						</View>
						{/* Filter Data */}
						<View style={styles.actionHistory}>
							{
								modeHeader === 'invoice' ?
									<View style={styles.viewDate}>
										<FormGroup
											containerStyle={{ width: '100%', padding: 5 }}
											inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.dark }}
											iconRight='calendar-alt'
											title={'Dữ liệu quyết toán'}
											value={`Tháng ${filterInvoice.month} - Năm ${filterInvoice.year}`}
											rightFunc={showSelectYearMonth}
										/>
										{filterInvoice.loadYearMonth &&
											<View style={{ height: 180 }} >
												<YearMonthSelected option={filterInvoice} onYearMonth={onFilterChange} numMonth={4} />
											</View>
										}
										{!loading && dataBill.dataDetail.length == 0 &&
											<Text style={{ margin: 8, fontSize: 14, fontWeight: '500', color: appcolor.red }}>{`Không có dữ liệu quyết toán`}</Text>
										}
									</View>
									:
									<View style={styles.viewDate}>
										<FormGroup
											containerStyle={{ width: '100%', padding: 5 }}
											inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.greylight }}
											title={modeHeader == 'create' ? 'Ngày đăng kí công tác' : 'Ngày công tác'}
											iconRight='calendar-alt'
											value={`${filter.fromDate} - ${filter.toDate}`}
											rightFunc={showCalendar}
										/>
										{filter.loadCalendar && <CalendarSelected
											fromDate={moment(filter.fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')}
											toDate={moment(filter.toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')}
											onChangeData={LoadDataRegister}
											lockOutMonth={true}
										/>}
									</View>
							}

						</View>
						{loading && <LoadingView isLoading={loading} title=' ' />}
						{!loading && tabStatus !== null && tabStatus.length > 0 &&
							<View style={styles.historyViewItem}>
								{modeHeader === 'invoice' ?
									<View style={{ width: '100%', flex: 1 }}>
										<InvoiceResultDefault
											key={'ViewDefaultInvoice'}
											styles={styles}
											ItemView={ItemView}
											dataBill={dataBill}
											handleOnScroll={handleOnScroll}
											filterInvoice={filterInvoice}
											currentItem={currentItem}
											handleReloadInvoice={handleReloadInvoice}
											handlerUploadDocument={handlerUploadDocument}
										/>
									</View >
									:
									<Tabs.Container
										pagerProps={{
											scrollEnabled: false
										}}
										width={deviceWidth}
										renderTabBar={props => (
											<MaterialTabBar
												{...props}
												labelStyle={{ fontSize: 12, fontWeight: '600' }}
												indicatorStyle={{ backgroundColor: appcolor.light }}
												inactiveColor={appcolor.light}
												activeColor={appcolor.light}
												scrollEnabled={true}
												style={{ backgroundColor: appcolor.info, width: deviceWidth }}
												tabStyle={{ minWidth: minWidthTab(tabStatus), height: 36, }}
											/>
										)}>
										{tabStatus?.map((item, index) => {
											const dataTripByStatus = _.filter(dataTrips, { status: item.status })
											const headerName = item.status || 'Không có dữ liệu'
											return (
												<Tabs.Tab
													key={`status_${index}`}
													label={`${headerName} (${dataTripByStatus.length})`}
													name={`${headerName} (${dataTripByStatus.length})`}>
													<View style={{ flex: 1, marginTop: 38, width: deviceWidth }}>
														<ASScrollView>
															{
																dataTripByStatus?.map((it, idx) => {
																	return renderItem({ item: it, index: idx })
																})
															}
															<View style={{ paddingBottom: deviceHeight / 2 }} />
														</ASScrollView>

														{/* <FlatList
															key={`status_${index}`}
															data={dataTripByStatus}
															showsVerticalScrollIndicator={false}
															nestedScrollEnabled
															keyExtractor={(___, i) => i.toString()}
															renderItem={renderItem}
															ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 3 }} />}
														/> */}
													</View>
												</Tabs.Tab>
											)
										})}
									</Tabs.Container>
								}
							</View >
						}
					</SafeAreaView >
				}
				{(filter.mode == MODE.CREATE || filter.mode == MODE.UPDATE) &&
					<SafeAreaView style={styles.sheetView}>
						<CreateNewTrip
							dataTrips={dataTrips}
							dateFilter={filter}
							onCloseCreate={handlerBackCreate}
							onNextCreate={handlerNextCreate} />
					</SafeAreaView>
				}
				{filter.mode == MODE.COST &&
					<SafeAreaView style={styles.sheetView}>
						<CostMenu
							onBack={handlerBackCreate}
							onNext={handlerNextCreate}
						/>
					</SafeAreaView>
				}
				{filter.mode == MODE.RESULT &&
					<SafeAreaView style={styles.sheetView}>
						<TripResult
							onBack={handlerBackCreate}
							onNext={handlerNextCreate}
							isReConfirm={filter.isReConfirm}
							isUpdate={filter.isUpdate}
							isPlusPlan={filter.isPlus}
						/>
					</SafeAreaView>
				}
				{filter.mode == MODE.DOCUMENT_TRIPS &&
					<SafeAreaView style={styles.sheetView}>
						<UploadDocument
							navigation={navigation}
							filterInvoice={filterInvoice}
							itemBussiness={currentItem}
							closeAction={handlerCloseDocument}
							handleReloadInvoice={handleReloadInvoice}
							ItemView={ItemView}
						/>
					</SafeAreaView>
				}
			</ActionSheet>
		</View>
	)
}
const TabHeader = ({ modeValue, type, label, icon, handlerChangeHeader }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const onChange = () => {
		handlerChangeHeader(type)
	}
	const colorByType = type == modeValue ? appcolor.yellowdark : appcolor.light
	const borderWidth = type == modeValue ? 0 : 0.3
	const styles = StyleSheet.create({
		mainContainer: { borderRadius: 20, backgroundColor: colorByType, marginStart: 3, marginEnd: 3, borderWidth: borderWidth, borderColor: appcolor.blacklight, alignSelf: 'center' },
		labelView: { width: deviceWidth / (type == 'create' ? 3.5 : 3), textAlign: 'center', color: appcolor.dark, fontSize: 13, fontWeight: '500' }
	})
	return (
		<TouchableOpacity style={styles.mainContainer} onPress={onChange}>
			<View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
				<Text style={styles.labelView}>{label}</Text>
				{icon && <Icon type="font-awesome-5" name="plus" size={18} />}
			</View>
		</TouchableOpacity>
	)
}
const ItemView = ({ value, iconName, styleView }) => {
	const { appcolor } = useSelector((state) => state.GAppState)
	return (
		<View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
			<Icon type="font-awesome-5" name={iconName} size={14} color={appcolor.blacklight} style={{ width: 30, padding: 5 }} />
			<Text style={styleView}>
				{value}
			</Text>
		</View>
	)
} 
