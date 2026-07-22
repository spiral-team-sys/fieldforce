import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, ScrollView, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { CreateItemStore, DeleteItemStore, GetConfigNewStore, GetShopLists, GetStoreInfo, updateStoreData } from "../../../Controller/ShopController";
import { Text } from '@rneui/themed';
import { MutipleItemSelected } from "../../../Control/MutipleItemSelected";
import { RegionMain } from "../../../Control/RegionControl/RegionMain";
import { AutoCompleteAddress } from "../../BusinessTrips/AutoCompleteAddress";
import { alertConfirm, deviceHeight, isValid } from "../../../Core/Utility";
import { ToastError, ToastSuccess, isPhone, toTitleCaseText } from "../../../Core/Helper";
import { LoadingView } from '../../../Control/ItemLoading'
import _ from 'lodash'
import { SetShopInfo } from "../../../Redux/action";
import RegionUpdate from "../../../Control/RegionControl/RegionUpdate";
import { ACTION } from "../../../Core/ReduxController";
import { Insert } from "../../../Core/SqliteDbContext";
import { storeList } from "../../../Core/Table";
import { SYNC_DATA_CONFIG } from "../../../Core/URLs";

import MultipleSelect from "../Control/MultipleSelect";
import ItemInput from "../Control/ItemInput";
import NumberInput from "../Control/NumberInput";
import SliderView from "../Control/SliderView";
import { useNavigationState } from "@react-navigation/native";

const UpdateStore = ({ navigation, route }) => {
	const { appcolor, shopinfo } = useSelector(state => state.GAppState)
	const [dataMaster, setDataMaster] = useState([])
	const [loading, setLoading] = useState(false)
	const [storeItem, setStoreItem] = useState({
		shopId: route?.params?.shopinfo?.shopId || shopinfo.shopId,
		shopCode: route?.params?.shopinfo?.shopCode || shopinfo.shopCode,
		codeDealer: null,
		shopName: null,
		address: null,
		warehouseName: null,
		warehouseCode: null,
		dealerName: null,
		supDealerName: null,
		supType: '[]',
		dealerId: null,
		email: null,
		phone: null,
		storeSize: null,
		frequencyValue: null,
		frequency: 0,
		provinceCode: null,
		districtCode: null,
		townCode: null,
		provinceName: null,
		districtName: null,
		townName: null,
		potentialOutput: null,
		latitude: 0,
		longitude: 0,
		idStore: null,
		newRegionId: null,
		numberofFSM: null,
		openYear: null,
		contactName: null,
		newAddress: null,
	})
	const dispatch = useDispatch()

	const mainPage = useNavigationState((state) => {
		const routes = state.routes;
		const currentIndex = state.index;
		return routes[currentIndex - 1]?.name; // 👉 tên Form trước đó
	});
	//
	const configData = async () => {
		await setLoading(true)
		await GetConfigNewStore(async (mData) => {
			await setDataMaster(mData)
		})
		const _shopId = route?.params?.shopinfo?.shopId || shopinfo.shopId
		await GetStoreInfo(_shopId, async (mData) => {
			const store = mData[0] || {}
			await setStoreItem({
				...storeItem,
				shopName: store.shopName,
				address: store.address,
				dealerName: store.dealerName,
				supDealerName: store.supDealerName,
				dealerId: store.dealerId,
				email: store.email,
				phone: store.phone,
				contactName: store.contactName,
				storeSize: store.storeSize,
				frequency: store.frequency,
				provinceCode: store.provinceCode,
				districtCode: store.districtCode,
				townCode: store.townCode,
				provinceName: store.provinceName,
				districtName: store.districtName,
				townName: store.townName,
				regionId: store.regionId,
				supType: store.supType || '[]',
				frequencyValue: store.frequencyValue,
				potentialOutput: store.potentialOutput,
				editableProvince: store.editableProvince == 1,
				editableArea: store.editableArea == 1,
				newRegionId: store.newRegionId,
				numberofFSM: store.numberofFSM,
				openYear: store.openYear,
				newAddress: store.newAddress
			})
		})
		await setLoading(false)
	}
	// handler
	const handlerUpdate = async () => {
		await checkInput(async (result, message) => {
			if (!result) {
				ToastError(message, 'Thông báo', 'top')
				return
			} else {
				alertConfirm('Thông báo', 'Bạn có muốn cập nhật cửa hàng này không ?', async () => {
					await setLoading(true)
					await CreateItemStore({ ...storeItem, typeAction: 'UPDATE' }, '', async (data) => {
						console.log(data, 'lưu thông tin thành cônglưu thông tin thành công')
						if (data.status == 200) {

							const listStore = await GetShopLists()
							const currentStore = _.filter(listStore, it => it.shopId == shopinfo.shopId)
							await dispatch(SetShopInfo(currentStore[0] || {}))
							await DeleteItemStore(shopinfo)
							await Insert(storeList, currentStore || []);
							await DeviceEventEmitter.emit(SYNC_DATA_CONFIG)
							await navigation.goBack()

							// ToastSuccess(data.messeger, 'Thông báo', 'top')
							// const updateShopInfo = { ...shopinfo, contactName: storeItem?.contactName, phone: storeItem?.phone, numberofFSM: storeItem?.numberofFSM, openYear: storeItem?.openYear }

							// await dispatch(SetShopInfo(updateShopInfo))
							// await updateStoreData(updateShopInfo)
							// await setLoading(false)
						} else
							ToastError(data.messeger, 'Lỗi', 'top')
					})
				})
			}
		})
	}
	const checkInput = (actionResult) => {
		for (let index = 0; index < dataMaster.length; index++) {
			const i = dataMaster[index];
			if (i.isRequired == 1) {
				if (i.ref_Code == 'shopAddress') {
					if (!isValid(storeItem.provinceCode)) {
						actionResult(false, 'Vui lòng chọn Tỉnh/Thành phố')
						return
					}
					if (!isValid(storeItem.districtCode)) {
						actionResult(false, 'Vui lòng chọn Quận/Huyện')
						return
					}
					if (!isValid(storeItem.townCode)) {
						actionResult(false, 'Vui lòng chọn Phường/Xã')
						return
					}
				} else if (i.ref_Code == 'shopNewAddress') {
					if (!isValid(storeItem.newRegionId)) {
						actionResult(false, `Vui lòng nhập ${i.itemName}`)
						return
					}
				} else if (!isValid(storeItem[i.ref_Code] || null)) {
					actionResult(false, `Vui lòng nhập ${i.itemName}`)
					return
				} else if (i.ref_Code == 'supType') {
					if (!isValid(storeItem[i.ref_Code] || null) || (storeItem[i.ref_Code] || null) == '[]') {
						actionResult(false, `Vui lòng nhập ${i.itemName}`)
						return
					}
				} else {
					if (isValid(storeItem.phone) && storeItem.phone.length > 0) {
						const checkPhone = isPhone(storeItem.phone)
						if (!checkPhone) {
							actionResult(false, 'Số điện thoại không đúng định dạng')
							return
						}
					}
					if (isValid(storeItem.openYear) && storeItem.openYear.length > 0) {
						const currentYear = new Date().getFullYear()
						const validYear = parseInt(storeItem.openYear)
						if (validYear > currentYear || validYear < 1990) {
							actionResult(false, 'Năm khai trương không hợp lệ')
							return
						}
					}

				}
			}
		}
		actionResult(true, null)
	}
	const ResetInput = () => {
		setStoreItem(
			{
				shopCode: shopinfo.shopCode,
				shopName: null,
				address: null,
				warehouseName: null,
				warehouseCode: null,
				dealerName: null,
				supDealerName: null,
				supType: '[]',
				dealerId: null,
				email: null,
				phone: null,
				storeSize: null,
				frequencyValue: null,
				frequency: 0,
				provinceCode: null,
				districtCode: null,
				townCode: null,
				provinceName: null,
				districtName: null,
				townName: null,
				potentialOutput: null,
				latitude: 0,
				longitude: 0,
				idStore: null
			}
		)
	}
	const handlerAddressChoose = async (text, typeItem, _location) => {
		if (typeItem == 'address') {
			await setStoreItem({ ...storeItem, address: text })
		}
	}
	const isTitleCaseTextField = (item = {}) => {
		return item.ref_Name === 'itemInput' && Number(item.ref_Id) === 1
	}
	const handlerItemChangeText = (text, typeItem, itemConfig = {}) => {
		const inputText = isTitleCaseTextField(itemConfig) && text !== null && text !== undefined ? toTitleCaseText(text) : text
		switch (typeItem) {
			case 'shopName':
				setStoreItem({ ...storeItem, shopName: inputText })
				break
			case 'codeDealer':
				setStoreItem({ ...storeItem, codeDealer: inputText })
				break
			case 'email':
				setStoreItem({ ...storeItem, email: inputText })
				break
			case 'phone':
				if (inputText !== null && inputText !== '') {
					let textValue = inputText.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
					if (inputText?.length == 11)
						textValue = inputText.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
					(!storeItem.phone || textValue == '' || textValue?.length < 12) && setStoreItem({ ...storeItem, phone: textValue })
				} else {
					setStoreItem({ ...storeItem, phone: inputText })
				}

				break
			case 'storeSize':
				setStoreItem({ ...storeItem, storeSize: inputText })
				break
			case 'frequency':
				setStoreItem({ ...storeItem, frequency: parseInt(inputText) || 0 })
				break
			case 'contactName':
				setStoreItem({ ...storeItem, contactName: inputText })
				break
			case 'address':
				setStoreItem({ ...storeItem, address: inputText })
				break
			case 'numberofFSM':
				setStoreItem({ ...storeItem, numberofFSM: inputText })
				break
			case 'openYear':
				setStoreItem({ ...storeItem, openYear: inputText })
				break
			default:
				setStoreItem({ ...storeItem, [typeItem]: inputText })
				break

		}
	}
	const handlerSelectItem = (item, type) => {
		switch (type) {
			case 'warehouse':
				setStoreItem({ ...storeItem, warehouseCode: item.wareHouseCode, warehouseName: item.itemName })
				break
			case 'dealerName':
				setStoreItem({ ...storeItem, dealerId: item.dealerId, dealerName: item.itemName, supType: '[]' })
				break
			case 'shopAddress':
				setStoreItem({
					...storeItem,
					provinceCode: item.provinceCode, districtCode: item.districtCode, townCode: item.townCode,
					provinceName: item.provinceName, districtName: item.districtName, townName: item.townName
				})
				break
			case 'frequencyValue':
				setStoreItem({ ...storeItem, frequency: item.itemValue, frequencyValue: item.itemName })
				break
			case 'potentialOutput':
				setStoreItem({ ...storeItem, potentialOutput: item.itemName })
				break
			case 'shopNewAddress':
				setStoreItem({
					...storeItem, newRegionId: item.level2_id
				})
				break

		}
	}
	const handlerSelectMultiItem = (type, dataItem) => {
		switch (type) {
			case 'supType':
				setStoreItem({ ...storeItem, supType: JSON.stringify(dataItem) })
				break
		}
	}
	// 
	const styles = StyleSheet.create({
		mainContainer: { flex: 1, backgroundColor: appcolor.light },
		titleShopCode: {
			width: '50%', alignSelf: 'center', textAlign: 'center', fontSize: 20, fontWeight: '800',
			color: appcolor.info, padding: 8, margin: 8, borderWidth: 0.5, borderRadius: 10, borderColor: appcolor.greydark
		}
	})
	useEffect(() => {
		configData()
		return () => false
	}, [])
	return (
		<View style={styles.mainContainer}>
			<HeaderCustom
				title={'Cập nhật cửa hàng'}
				leftFunc={() => navigation.goBack()}
				iconRight='cloud-upload-alt'
				rightFunc={handlerUpdate}
			/>
			<LoadingView isLoading={loading} styles={{ marginTop: 8 }} title='Đang cập nhật dữ liệu' />
			<ScrollView
				style={{ marginBottom: 16, padding: 8 }}
				showsVerticalScrollIndicator={false}>
				<Text style={{ textAlign: 'center', fontSize: 15, fontWeight: '600', color: appcolor.dark, marginTop: 8 }}>Mã cửa hàng</Text>
				<Text style={styles.titleShopCode}>{storeItem.shopCode}</Text>
				{!loading && dataMaster.length > 0 && dataMaster.map((item, index) => {
					return <RenderItemView
						key={`iifc_${index}`}
						storeItem={storeItem}
						item={item}
						handlerSelectItem={handlerSelectItem}
						handlerItemChangeText={handlerItemChangeText}
						handlerAddressChoose={handlerAddressChoose}
						handlerSelectMultiItem={handlerSelectMultiItem}
					/>
				})
				}
				<View style={{ height: deviceHeight / 2 }} />
			</ScrollView>
		</View>
	)
}
const RenderItemView = ({ storeItem, item, handlerSelectItem, handlerItemChangeText, handlerAddressChoose, handlerSelectMultiItem }) => {
	const data = JSON.parse(item.dataItem || '[]')
	let supData = []
	if (item.filterList !== null) {
		if (storeItem.supType !== '[]') {
			supData = JSON.parse(storeItem.supType || '[]')
		} else {
			supData = _.filter(data, (e) => { return e.dealerName == storeItem[item.filterList] })
		}
	}

	switch (item.ref_Name) {
		case 'itemInput':
			return <ItemInput
				typeFilter={item.ref_Code}
				editable={item.ref_Code == 'shopName' ? (storeItem?.shopName?.length || 0) == 0 : true}
				isRequire={item.isRequired == 1}
				titleName={item.itemName}
				placeholder={item.placeholder}
				iconName={item.iconName}
				itemValue={storeItem[item.ref_Code]}
				onChangeText={(text, typeItem) => handlerItemChangeText(text, typeItem, item)}
			/>
		case 'numberInput':
			return <NumberInput
				typeFilter={item.ref_Code}
				isRequire={item.isRequired == 1}
				titleName={item.itemName}
				placeholder={item.placeholder}
				iconName={item.iconName}
				itemValue={storeItem[item.ref_Code]}
				onChangeText={handlerItemChangeText}
			/>
		case 'itemSelected':
			return <MutipleItemSelected
				isRequire={item.isRequired == 1}
				typeItem={item.ref_Code}
				isFilter={data.length > 5}
				titleName={item.itemName}
				iconName={item.iconName}
				dataItems={data}
				defaultValue={storeItem[item.ref_Code]}
				onItemChoose={handlerSelectItem}
			/>
		case 'mutipleItemSelected':
			return <MultipleSelect
				isRequire={item.isRequired == 1}
				typeItem={item.ref_Code}
				isFilter={data.length > 5}
				titleName={item.itemName}
				iconName={item.iconName}
				dataView={supData}
				placeholder={item.placeholder}
				onItemChange={handlerSelectMultiItem}
			/>
		case 'sliderView':
			return <SliderView
				typeFilter={item.ref_Code}
				isRequire={item.isRequired == 1}
				titleName={item.itemName}
				iconName={item.iconName}
				maxLength={item.lengthValue}
				keyboardType='numeric'
				placeholder={`${item.placeholder} ${storeItem[item.ref_Code]} Lần/Tháng`}
				itemValue={storeItem[item.ref_Code]}
				onChangeText={handlerItemChangeText}
			/>
		case 'regionMain':
			return <RegionMain
				typeFilter={item.ref_Code}
				isRequire={item.isRequired == 1}
				titleName={item.itemName}
				actionResult={handlerSelectItem}
				regionId={storeItem.regionId}
				editableArea={storeItem.editableArea}
				editableProvince={storeItem.editableProvince}
			/>
		case 'regionUpdate':
			return <RegionUpdate
				typeFilter={item.ref_Code}
				isRequire={item.isRequired == 1}
				titleName={item.itemName}
				actionResult={handlerSelectItem}
				newRegionId={storeItem.newRegionId}
			/>
		case 'autocomplete':
			return <AutoCompleteAddress
				typeFilter={item.ref_Code}
				isRequire={item.isRequired == 1}
				titleName={item.itemName}
				placeholder={item.placeholder}
				iconName={item.iconName}
				itemValue={storeItem[item.ref_Code]}
				onChooseItem={handlerAddressChoose}
				isFreeText={true}
				handleTextChange={handlerAddressChoose}
			/>
		default:
			return null
	}
}

export default UpdateStore;
