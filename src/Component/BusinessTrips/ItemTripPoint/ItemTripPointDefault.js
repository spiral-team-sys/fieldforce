import moment from "moment";
import React, { useState, useRef, useEffect } from "react";
import { LayoutAnimation, Modal, Platform, ScrollView, TextInput, TouchableOpacity, UIManager, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { AutoCompleteAddress } from "../AutoCompleteAddress";
import { TYPE, provinceByAddress } from "../UtilityBusiness";
import { ItemInput } from "../InputControl/ItemInput";
import { formatNumber, removeVietnameseTones } from "../../../Core/Helper";
import { CalendarSelected } from "../../../Control/CalendarSelected";
import { alertWarning } from "../../../Core/Utility";
import { FlashList } from "@shopify/flash-list";
import { AttendantController } from "../../../Controller/AttendantController";
import _ from 'lodash';
import { deviceHeight, deviceWidth, fontWeightBold } from "../../../Themes/AppsStyle";

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const parseTripDate = (dateValue) => {
	if (!dateValue) return null

	const parsedDate = moment(dateValue, ['YYYYMMDD', 'YYYY/MM/DD', 'YYYY-MM-DD'], true)
	return parsedDate.isValid() ? parsedDate : moment(dateValue)
}

export const ItemTripPointDefault = ({ item, index, itemTrips, itemPoint, typeVehicle, config, quotaData, dateFilter, dataProvince }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [_mutate, setMutate] = useState(false)
	const [listDistrict, setListDistrict] = useState([])
	const [listProvinceData, setListProvinceData] = useState({ dataMain: dataProvince || [], isShowProvince: false })
	const refRegionList = useRef()
	const refDistrictList = useRef()
	const [itemSelect, setItemSelect] = useState({ provinceSelect: {}, districtSelect: {}, storeSelect: {} })
	const [dataItem, setDataItem] = useState({ dataShow: [], dataSelect: {} })
	const [modalStore, setModalStore] = useState({ visibleModal: false, dataStore: [] });
	const valueItem = (value) => {
		return (value == 0 ? '0' : formatNumber(value, ','))
	}
	const listTypeCost = _.find((itemTrips.listTypeCost || []), it => it.isChoose == 1) || {}
	const arrivedDate = parseTripDate(item.arrivedDay)
	const arrivedDateValue = arrivedDate?.isValid() ? arrivedDate.format('YYYY/MM/DD') : null
	const calendarDefaultDate = (arrivedDate?.isValid() ? arrivedDate : parseTripDate(itemTrips.fromDate))?.format('YYYY-MM-DD')

	const handlerAddressChoose = async (text, typeItem, location) => {
		const { province, district } = provinceByAddress(text)
		if (typeItem == TYPE.PROVINCE_FROM) {
			item.district = district
			item.provinceName = province
			item.addressPoint = text
			item.locationPoint = location
			item.distance = 0
			item.distanceText = ''
		}
		setMutate(e => !e)
		// await AddMarker(dataStage)
	}
	const onEditValue = (value) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : ''
		let intValue = text === '' ? null : parseInt(text);
		item.numberDay = parseInt(intValue || 0)
		item.maxCostHotel = ((listTypeCost.code == 'onlyWorkCosts' || listTypeCost.code == 'onlyOtherCosts') ? 0 : (quotaData.hotelSup && quotaData.hotelSup > 0 ? quotaData.hotelSup * intValue : 0))
		// if (intValue == 0) {
		item.nightRestValue = 0
		// }
		itemTrips.provinceList = [...itemPoint]
		setMutate(e => !e)
	}
	const onEditEatValue = (value) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : ''
		let intValue = text === '' ? null : parseInt(text);
		item.eatDay = parseInt(intValue || 0)
		item.maxCostFood = ((listTypeCost.code == 'onlyWorkCosts' || listTypeCost.code == 'onlyOtherCosts') ? 0 : ((quotaData.foodSup && quotaData.foodSup > 0) ? quotaData.foodSup * intValue : 0))
		item.foodCostPoint = ((listTypeCost.code == 'onlyWorkCosts' || listTypeCost.code == 'onlyOtherCosts') ? 0 : ((quotaData.foodSup && quotaData.foodSup > 0) ? quotaData.foodSup * intValue : 0))

		item.maxCostVehicle = ((listTypeCost.code == 'onlyWorkCosts' || listTypeCost.code == 'onlyOtherCosts') ? 0 : ((quotaData.moveSup && quotaData.moveSup > 0) ? quotaData.moveSup * intValue : 0))
		item.vehicalValue = ((listTypeCost.code == 'onlyWorkCosts' || listTypeCost.code == 'onlyOtherCosts') ? 0 : ((quotaData.moveSup && quotaData.moveSup > 0) ? quotaData.moveSup * intValue : 0))

		itemTrips.provinceList = [...itemPoint]
		setMutate(e => !e)
	}
	const handleSelectDate = (value) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		item.loadCalendar = (item.loadCalendar == true ? false : true)
		setMutate(e => !e)
	}
	const handlerWorkingDate = async (fromValue) => {
		const arrivedDayInt = moment(fromValue, 'YYYY-MM-DD')
		if (arrivedDayInt.isBetween(itemTrips.fromDate, itemTrips.toDate, null, '[]')) {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
			item.arrivedDay = moment(fromValue).format('YYYYMMDD')
			item.loadCalendar = (item.loadCalendar == true ? false : true)
			setMutate(e => !e)
		} else {
			alertWarning('Ngày đến phải nằm trong khoảng ngày đi và ngày về của chuyến công tác')
		}
	}
	const handlerItemChangeText = async (text, typeItem) => {
		if (typeItem == TYPE.TYPE_NOTE) {
			item.note = text
			setMutate(e => !e)
		} else {
			const valueInput = text.length > 0 ? parseInt(text.replace(/,/gm, '')) : null
			if (typeItem == TYPE.TYPE_NIGTH_REST) {
				if (valueInput > item.maxCostHotel) {
					alertWarning(`Chi phí khách sạn phải nhỏ hơn hoặc bằng định mức hỗ trợ ${item.maxCostHotel}`)
					setMutate(e => !e)
					return
				}
				item.nightRestValue = valueInput
				setMutate(e => !e)
			}
			if (typeItem == TYPE.TYPE_LUNCH) {
				setMutate(e => !e)
			}
			if (typeItem == TYPE.TYPE_VEHICAL) {
				if (valueInput > item.maxCostVehicle && typeVehicle?.code == 'DRIVING') {
					alertWarning(`Chi phí di chuyển phải nhỏ hơn hoặc bằng định mức hỗ trợ ${item.maxCostVehicle}`)
					return
				}
				item.vehicalValue = valueInput
				setMutate(e => !e)
			}
		}

	}
	const handleSelectProviceData = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		listProvinceData.isShowProvince = listProvinceData.isShowProvince ? false : true
		setMutate(e => !e)
	}
	const renderItemTag = ({ item, index }) => {
		const onPress = () => {
			handlerSelectTag(item, index);
		};
		return (
			<View key={`ma - ${index} `}>
				<TouchableOpacity
					onPress={onPress}
					style={{
						padding: 8, marginVertical: 4, borderRadius: 20, minWidth: 100,
						backgroundColor: appcolor.light, marginHorizontal: 5,
						shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
						shadowOpacity: 0.5, elevation: 3,
						backgroundColor: itemSelect.provinceSelect?.provinceCode == item.provinceCode ? appcolor.primary : appcolor.light
					}}>
					<Text style={{ color: itemSelect.provinceSelect?.provinceCode == item.provinceCode ? appcolor.white : appcolor.dark, fontWeight: '500' }}>{item.itemName}</Text>
				</TouchableOpacity>
			</View>
		);
	};
	const handlerSelectTag = async (itemP, indexP, key) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		try {
			refRegionList?.current?.scrollToIndex({
				index: indexP > 4 ? 4 : indexP,
				animated: true
			});
		} catch (e) {
			console.log(e, 'ScrollToIndex');
		}
		const dataByProvince = JSON.parse(itemP.dataByProvince || "[]")
		const dataDistrict = _.unionBy(dataByProvince, 'districtCode');

		itemSelect.provinceSelect = itemP
		setListDistrict(dataDistrict)
	};
	const onGetAddress = async (search) => {

		if (search !== null && search.length > 5) {
			await AttendantController.DataLocationFromAddress(search, async (dataLocation) => {
				if (dataLocation !== null && dataLocation.length > 0) {
					dataItem.dataSelect = dataLocation[0]
					dataItem.dataShow = dataLocation
				} else {
					dataItem.dataSelect = {}
					dataItem.dataShow = []
				}
			})
		}
	}
	const renderItemDistrict = ({ item, index }) => {
		const onPress = () => {
			handlerSelectDistrict(item, index);
		};
		const dataByProvince = JSON.parse(itemSelect.provinceSelect?.dataByProvince || "[]")
		const dataByDistrict = dataByProvince.filter((it) => it.districtCode == item.districtCode)
		return (
			<TouchableOpacity
				key={`ma - ${index} `}
				onPress={onPress}
				style={{
					padding: 8, marginVertical: 4, borderRadius: 20,
					backgroundColor: appcolor.light, marginHorizontal: 5,
					shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 },
					shadowOpacity: 0.5, elevation: 3,
					backgroundColor: itemSelect.districtSelect?.districtCode == item.districtCode ? appcolor.primary : appcolor.light
				}}>
				<Text style={{ color: itemSelect.districtSelect?.districtCode == item.districtCode ? appcolor.white : appcolor.dark, fontWeight: '500' }}>{item.district}</Text>
				<View style={{ width: 18, height: 18, borderRadius: 20, backgroundColor: appcolor.danger, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -2, end: -8 }}>
					<Text style={{ fontSize: 9, fontWeight: fontWeightBold, color: appcolor.light }}>{dataByDistrict.length}</Text>
				</View>
			</TouchableOpacity>
		);
	};
	/** Handle Show Overlay */
	const handlePressDetail = (dataByDistrict) => {
		setModalStore({ visibleModal: true, dataStore: dataByDistrict })
		setMutate(e => !e)
	}
	const closeModalStore = () => {
		setModalStore({ visibleModal: false, dataStore: [] })
	}

	const handlerSelectDistrict = async (itemD, indexD, key) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		try {
			refDistrictList?.current?.scrollToIndex({
				index: indexD || 0,
				animated: true
			});
		} catch (e) {
			console.log(e, 'ScrollToIndex');
		}

		const dataByProvince = JSON.parse(itemSelect.provinceSelect?.dataByProvince || "[]")
		const dataByDistrict = dataByProvince.filter((it) => it.districtCode == itemD.districtCode)
		if (dataByDistrict.length > 1) {
			handlePressDetail(dataByDistrict)
		} else {
			handleSelectStore(itemD)
		}
		setMutate(e => !e)
	};

	const handleSelectStore = async (itemD) => {
		itemSelect.districtSelect = itemD
		let isNullLocation = 0
		if (!itemD.latitude || !itemD.longitude) {
			isNullLocation = 1
			await onGetAddress(itemD.address || `${itemD.district},${itemD.province}`)
		}
		if (isNullLocation == 1 && Object.keys(dataItem.dataSelect)?.length > 0) {
			item.shopName = itemD.shopName
			item.district = itemD.district
			item.provinceName = itemD.province
			item.addressPoint = itemD.address || `${itemD.district},${itemD.province}`
			item.locationPoint = `${dataItem.dataSelect.geometry.location.lat || 0},${dataItem.dataSelect.geometry.location.lng || 0}`
			item.distance = 0
			item.distanceText = ''
		} else {
			item.shopName = itemD.shopName
			item.district = itemD.district
			item.provinceName = itemD.province
			item.addressPoint = itemD.address || `${itemD.district},${itemD.province}`
			item.locationPoint = `${itemD?.latitude || 0},${itemD?.longitude || 0}`
			item.distance = 0
			item.distanceText = ''
		}
		await modalStore.visibleModal == true && await closeModalStore()
		await handleSelectProviceData()
		await setMutate(e => !e)
	}

	return (
		<View style={{ borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.primary, padding: 4, margin: 4 }}>
			{
				(quotaData.isFirstPointLastPoint == 1 && ((itemPoint.length - 1) == index)) &&
				<View style={{ width: '80%', height: 40, justifyContent: 'center', paddingLeft: 8 }}>
					<Text style={{ fontWeight: '700', fontSize: 16, color: appcolor.primary }}>Vị trí đi xa nhất</Text>
				</View>
			}

			<View style={{ borderRadius: 50, width: 40, height: 40, borderWidth: 0.8, borderColor: appcolor.primary, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 4, right: 8, zIndex: 1000 }}>
				<Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.primary }}>{index + 1}</Text>
			</View>
			{
				quotaData.isUseProviceList !== 1 && <AutoCompleteAddress
					isRequire
					titleName='Địa chỉ điểm đến'
					placeholder='Địa chỉ điểm đến'
					iconName='map-marker-alt'
					itemValue={item.addressPoint}
					typeFilter={TYPE.PROVINCE_FROM}
					onChooseItem={handlerAddressChoose}
				/>
			}

			{
				quotaData.isUseProviceList == 1 &&
				<TouchableOpacity onPress={() => handleSelectProviceData()} style={{
					width: '80%', padding: 8, justifyContent: 'center',
					flexDirection: 'row', marginVertical: 4, marginHorizontal: 8, borderRadius: 8,
					shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.info,
					shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }
				}}>
					<Text style={{ fontWeight: '700', textAlign: 'center', fontSize: 14, color: appcolor.white }}>{listProvinceData.isShowProvince ? 'Đóng' : 'Mở danh sách'}</Text>
				</TouchableOpacity>
			}
			{
				quotaData.isUseProviceList == 1 && listProvinceData.isShowProvince == true && listProvinceData.dataMain?.length > 0 &&
				<View style={{ width: '100%' }}>
					<FlashList
						estimatedItemSize={50}
						ref={refRegionList}
						key={`dataregionlist`}
						keyExtractor={(_item, index) => _item.provinceCode + index.toString()}
						data={dataProvince}
						extraData={[dataProvince, itemSelect]}
						renderItem={renderItemTag}
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}
						horizontal
					/>
					{
						listDistrict?.length > 0 &&
						<FlashList
							estimatedItemSize={200}
							ref={refDistrictList}
							key={`dataDistrictlist`}
							keyExtractor={(_item, index) => _item.provinceCode + index.toString() + _item.districtCode}
							data={listDistrict}
							extraData={[listDistrict, itemSelect]}
							renderItem={renderItemDistrict}
							showsVerticalScrollIndicator={false}
							showsHorizontalScrollIndicator={false}
							horizontal
						/>
					}
				</View>
			}
			{
				item.addressPoint && quotaData.isUseProviceList == 1 &&
				<View
					key={item.locationPoint}
					style={{
						margin: 4, padding: 12, marginVertical: 8,
						backgroundColor: appcolor.surface, borderRadius: 8, shadowColor: appcolor.dark,
						shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
					}}
				>
					<Text style={{ fontSize: 13, fontWeight: '600', color: appcolor.primary }}>Cửa hàng: {item.shopName}</Text>
					<Text style={{ fontSize: 11, fontWeight: '500', color: appcolor.dark }}>Địa chỉ: {item.addressPoint}</Text>
					<Text style={{ fontSize: 11, fontWeight: '500', color: appcolor.dark }}>Vị trí: {item.locationPoint}</Text>
				</View>
			}

			{
				(item.distance !== null && item.distance > 0) &&
				<Text style={{ paddingHorizontal: 8, paddingBottom: 8, color: appcolor.success, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Khoảng cách từ điểm {index == 0 || (quotaData.isFirstPointLastPoint == 1 && ((itemPoint.length - 1) == index)) ? ('Bắt đầu => ' + (itemPoint.length == 1 || (quotaData.isFirstPointLastPoint == 1 && ((itemPoint.length - 1) == index)) ? 'Kết thúc' : 'điểm 1')) : `${index} => điểm ${index + 1}`} : {item.distanceText} </Text>
			}
			<View key={'dateBusiness'} style={{ width: '100%', borderRadius: 5, paddingBottom: 8, paddingHorizontal: 8, alignItems: 'center' }}>
				<FormGroup
					containerStyle={{ width: '100%', padding: 5, borderRadius: 5 }}
					inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.greylight }}
					// title={`Ngày đến địa điểm công tác ${item.dayAndNight}`}
					iconRight='calendar-alt'
					placeholder={'Ngày đến địa điểm công tác '}
					value={arrivedDateValue}
					rightFunc={handleSelectDate}
				/>
				{item.loadCalendar && <CalendarSelected onChangeData={handlerWorkingDate} isBetween={false} lockOutMonth={config?.isLockOutMonth == 0 ? false : true} defaultDate={calendarDefaultDate} />}
				<FormGroup
					key={`${TYPE.TYPE_NOTE}`}
					selectTextOnFocus={true}
					title={'Ghi chú'}
					titleStyle={{ color: appcolor.info, fontWeight: '700', fontSize: 12 }}
					inputStyle={{ fontSize: 12, backgroundColor: 'transparent' }}
					editable
					iconName='comment'
					value={item.note || null}
					placeholder={'Nội dung ghi chú'}
					useClearAndroid={false}
					handleChangeForm={(text) => handlerItemChangeText(text, TYPE.TYPE_NOTE)}
				/>

			</View>

			<Text style={{ width: '100%', paddingHorizontal: 8, color: appcolor.info, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Thông tin lưu trú</Text>
			<View key={`ViewPointDay`} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', padding: 5 }}>
				<FormGroup
					selectTextOnFocus={true}
					keyboardType="numeric"
					containerStyle={{ width: '45%', borderRadius: 8, marginBottom: 0, padding: 0, backgroundColor: 'transparent' }}
					inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
					editable
					value={item.numberDay?.toString() || null}
					placeholder={`Số đêm lưu trú`}
					titleStyle={{ color: appcolor.info, fontWeight: '700', textAlign: 'center', fontSize: 12, padding: 0 }}
					title={'Đêm lưu trú'}
					useClearAndroid={false}
					handleChangeForm={onEditValue}
				/>
				<FormGroup
					selectTextOnFocus={true}
					keyboardType="numeric"
					containerStyle={{ width: '45%', borderRadius: 8, marginBottom: 0, padding: 0, marginStart: 8, backgroundColor: 'transparent' }}
					inputStyle={{ textAlign: 'center', fontSize: 12, backgroundColor: 'transparent' }}
					editable
					value={item.eatDay?.toString() || null}
					titleStyle={{ color: appcolor.info, fontWeight: '700', textAlign: 'center', fontSize: 12, padding: 0 }}
					title={'Ngày ăn'}
					placeholder={`Số ngày ăn`}
					useClearAndroid={false}
					handleChangeForm={onEditEatValue}
				/>
			</View>

			<View key={`ViewPointCost_` + index} style={{ width: '100%', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', padding: 8 }}>
				{
					(item.numberDay > 0 || item.eatDay > 0) &&
					<Text style={{ width: '100%', paddingTop: 8, color: appcolor.info, textAlign: 'left', fontWeight: '700', fontSize: 12 }}>Chi phí</Text>
				}
				{
					item.numberDay > 0 &&
					<ItemInput
						typeFilter={TYPE.TYPE_NIGTH_REST}
						keyboardType="numeric"
						isRequire
						titleName={`Chi phí khách sạn (${item.numberDay} Đêm)`}
						placeholder={`Tổng tiền khách sạn / nhà nghỉ`}
						iconName='hotel'
						itemValue={valueItem(item.nightRestValue)}
						onChangeText={handlerItemChangeText}
					/>
				}
				{
					item.eatDay > 0 &&
					<ItemInput
						typeFilter={TYPE.TYPE_LUNCH}
						keyboardType="numeric"
						isRequire
						editable={false}
						titleName={`Chi phí ăn uống (${item.eatDay} Ngày)`}
						placeholder={`Tổng chi phí ăn uống (${item.eatDay} Ngày)`}
						iconName='utensils'
						itemValue={valueItem(item.foodCostPoint)}
					// onChangeText={handlerItemChangeText}
					/>
				}
				{
					((typeVehicle?.code == 'DRIVING' && item.eatDay > 0 && item.distance > 0)
						|| (typeVehicle?.code !== 'DRIVING' && item.eatDay > 0)) &&
					<ItemInput
						typeFilter={TYPE.TYPE_VEHICAL}
						keyboardType="numeric"
						isRequire
						titleName='Chi phí di chuyển trong ngày'
						placeholder={`Tổng chi phí di chuyển (${item.eatDay} Ngày)`}
						iconName='car'
						itemValue={valueItem(item.vehicalValue)}
						onChangeText={handlerItemChangeText}
						editable={(typeVehicle?.code == 'DRIVING' || quotaData.lockEditMoveCost == 1) ? false : true}
					/>
				}
			</View>
			<Modal
				animationType="slide"
				visible={modalStore.visibleModal || false}
				transparent={true}
			>
				<ListShop
					dataByDistrict={modalStore.dataStore}
					itemSelect={itemSelect}
					closeModalStore={closeModalStore}
					handleSelectStore={handleSelectStore}
				/>
			</Modal>
		</View>
	)
}

const ListShop = ({ dataByDistrict, itemSelect, closeModalStore, handleSelectStore }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [dataDistrict, setDataDistrict] = useState({ dataMain: [], dataMainF: [] })
	const [_mutate, setMutate] = useState(false)
	const [query, setQuery] = useState('');

	const loadData = () => {
		dataDistrict.dataMain = dataByDistrict.length > 0 ? [...dataByDistrict] : []
		dataDistrict.dataMainF = dataByDistrict.length > 0 ? [...dataByDistrict] : []
		setMutate(e => !e)
	}
	useEffect(() => {
		let isMounted = true
		if (!isMounted)
			return
		loadData()
		return () => { isMounted = false }
	}, [])

	const contains = (shop, query) => {
		const { shopName, address } = shop;
		let Saddress = removeVietnameseTones(address === null ? address : address.toLowerCase())
		let SshopName = removeVietnameseTones(shopName === null ? shopName : shopName.toLowerCase())
		//
		if (SshopName?.includes(query) || Saddress?.includes(query)) {
			return true;
		}
		return false;
	};

	const handleSearch = (text) => {
		const formattedQuery = removeVietnameseTones(text).toLowerCase();
		const filteredData = _.filter(dataDistrict.dataMainF, shop => { return contains(shop, formattedQuery) })
		dataDistrict.dataMain = filteredData
		setQuery(text)
	};

	const checkSelect = (item) => {
		if ((item.latitude || 0) !== 0 && ((item.longitude || 0) !== 0) && ((itemSelect.districtSelect.latitude == item.latitude && itemSelect.districtSelect.longitude == item.longitude) || (itemSelect.districtSelect.address == item.address))) {
			return true
		} else if (itemSelect.districtSelect.address == item.address && itemSelect.districtSelect.latitude !== 0 && itemSelect.districtSelect.longitude !== 0 && !item.latitude && !item.longitude) {
			return true
		} else return false
	}

	return (
		<TouchableOpacity onPress={() => closeModalStore()} activeOpacity={1} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', }}>
			<View style={{ height: deviceHeight * 0.7, width: deviceWidth * 0.9, backgroundColor: appcolor.light, borderRadius: 24 }}>
				<Text style={{ marginTop: 20, textAlign: 'center', fontSize: 20, fontWeight: '600', color: appcolor.primary }}>Cửa hàng</Text>
				<TextInput
					placeholder="Tìm kiếm của hàng..."
					value={query}
					// autoFocus
					onChangeText={handleSearch}
					placeholderTextColor={appcolor.greydark}
					style={{
						width: "95%", height: 50, paddingLeft: 55, marginBottom: 15,
						borderRadius: 30, opacity: 0.8, marginLeft: 10,
						color: appcolor.dark, padding: 10, marginTop: 8,
						backgroundColor: appcolor.homebackground,
					}}
				/>
				<ScrollView style={{ flex: 1, padding: 12 }} >
					{
						dataDistrict.dataMain.length > 0 && dataDistrict.dataMain.map((it, idx) => {
							const isSelect = checkSelect(it)
							return (
								<TouchableOpacity
									key={it.latitude + ',' + it.longitude + '_' + idx}
									activeOpacity={isSelect ? 1 : 0.5}
									onPress={isSelect ? null : () => handleSelectStore(it)}
									style={{
										margin: 4, padding: 12, marginVertical: 8,
										backgroundColor: isSelect ? appcolor.primary : appcolor.surface, borderRadius: 8, shadowColor: appcolor.dark,
										shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
										shadowRadius: 4, elevation: 3,
									}}
								>
									<Text style={{ fontSize: 16, fontWeight: '600', color: isSelect ? appcolor.white : appcolor.primary }}>Cửa hàng: {it.shopName}</Text>
									<Text style={{ fontSize: 13, fontWeight: '500', color: isSelect ? appcolor.white : appcolor.dark }}>Địa chỉ: {it.address}</Text>
									<Text style={{ fontSize: 13, fontWeight: '500', color: isSelect ? appcolor.white : appcolor.dark }}>Vị trí: {it.latitude || (isSelect ? itemSelect.districtSelect.latitude || 0 : 0)}, {it.longitude || (isSelect ? itemSelect.districtSelect.longitude || 0 : 0)}</Text>
								</TouchableOpacity>
							)
						})}
				</ScrollView>
				<View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20 }}>
					<TouchableOpacity
						onPress={() => closeModalStore()}
						style={{
							justifyContent: 'center', alignItems: "center", width: deviceWidth * 0.6,
							borderRadius: 20, backgroundColor: appcolor.surface, padding: 10,
						}}
					>
						<Text style={{ color: appcolor.dark }}>Đóng</Text>
					</TouchableOpacity>
				</View>
			</View>
		</TouchableOpacity>
	)
}
