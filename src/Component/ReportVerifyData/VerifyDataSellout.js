import React, { useEffect, useRef, useState } from "react"
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { HeaderCustom } from "../../Content/HeaderCustom"
import { SelloutAPI } from "../../API/SelloutAPI"
import { LoadingView } from "../../Control/ItemLoading"
import FormGroup from "../../Content/FormGroup"
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view"
import { alertConfirm, minWidthTab } from "../../Core/Utility"
import { deviceHeight, deviceWidth } from "../../Themes/AppsStyle"
import { Text } from '@rneui/themed'
import { ToastError, ToastSuccess, groupDataByKey } from "../../Core/Helper"
import ActionSheet, { SheetManager } from "react-native-actions-sheet"
import moment from "moment"
import _ from "lodash"
import { YearMonthSelected } from "../../Control/YearMonthSelected"
import { DATE } from "../BusinessTrips/UtilityBusiness"
import { ItemInput } from "./Control/ItemInput"
import { ControlActionData } from "./Control/ControlActionData"
import { AppNameBuild, aquaApp } from "../../Core/URLs"

export const VerifyDataSellout = ({ navigation }) => {
	const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
	const [isLoading, setLoading] = useState(false)
	const [dataPhotos, setDataPhotos] = useState([])
	const [dataVerify, setDataVerify] = useState([])
	const [dataMain, setDataMain] = useState([])
	const [dataUpload, setDataUpload] = useState([])
	const [groupStatus, setGroupStatus] = useState([])
	const [isGroupStatus, setIsGroupStatus] = useState(null)
	const [changeIndex, onChangeIndex] = useState(0)
	const [filterDate, setFilterDate] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}`, "loadYearMonth": false, "jsonFilter": {} })
	const tabRef = useRef()
	const [_mutate, setMutate] = useState(false)

	const LoadData = async () => {
		await setLoading(true)
		await setDataVerify([])
		await setDataMain([])
		await SelloutAPI.getEvidentList(filterDate, async (mData) => {
			const groupList = JSON.parse(mData[0]?.dataGroup || '[]')
			setGroupStatus(groupList)
			await setDataMain(mData)
			await setDataVerify(mData)
		})
		await checkPhotoUpdate()
		await setLoading(false)
	}
	const checkPhotoUpdate = async () => {
		await SelloutAPI.checkPhotoEvident(async (data) => {
			await setDataPhotos(data)
		})
	}
	const updateItemInfo = async (item, modelUpdate) => {
		const photolist = _.filter(dataPhotos, (e) => {
			return (
				e.photoType == `VAT_${item.SaleId}` ||
				e.photoType == `BILL_${item.SaleId}` ||
				e.photoType == `CRM_${item.SaleId}` ||
				e.photoType == `FSM_${item.SaleId}`
			)
		})
		let jsonPhoto = []
		await photolist.forEach(photoInfo => {
			let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
			let dataItem = {
				"shopId": photoInfo.shopId,
				"photoName": ImgName,
				"latitude": photoInfo.latitude,
				"longitude": photoInfo.longitude,
				"accuracy": photoInfo.accuracy,
				"reportId": photoInfo.reportId,
				"photoTime": moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
				"photoType": photoInfo.photoType.toString(),
				"photoDate": photoInfo.photoDate,
				"photoPath": `/uploaded/${photoInfo.photoDate}/${ImgName}`
			}
			jsonPhoto.push(dataItem);
		});

		const dataBySaleId = await _.filter(dataUpload, (e) => { return e.saleId == item.SaleId })
		const itemSave = {
			...dataBySaleId[0],
			saleId: item.SaleId,
			itemUpdate: JSON.stringify(modelUpdate),
			itemPhoto: JSON.stringify(jsonPhoto)
		}
		if (dataBySaleId.length == 0) {
			dataUpload.push(itemSave)
		} else {
			const _update = dataUpload.map((it) => (it.saleId == item.SaleId ? itemSave : it))
			await setDataUpload(_update)
		}
	}
	const UploadData = async () => {
		await handlerCheckData(async (success = false) => {
			if (success) {
				alertConfirm('Gửi báo cáo', 'Sau khi gửi dữ liệu sẽ không chỉnh sửa được. Bạn có chắc chắn không?', async () => {
					await SelloutAPI.UploadDataEvident(dataUpload, async (messeger) => {
						ToastSuccess(messeger, 'Thông báo', 'top')
						await LoadData()
					})
				})
			}
		})
	}
	// handler action
	const handlerCheckData = async (actionResult) => {
		if (AppNameBuild == aquaApp) {
			handleCheckDataAqua(actionResult)
		} else {
			handleCheckDataOtherApp(actionResult)
		}
	}
	const handleCheckDataAqua = (actionResult) => {
		if (dataUpload.length > 0) {
			for (let index = 0; index < dataUpload.length; index++) {
				const item = dataUpload[index];
				const check = _.groupBy(dataPhotos, 'photoType')
				const keyVAT = `VAT_${item.saleId}`
				const keyBILL = `BILL_${item.saleId}`
				const keyCRM = `CRM_${item.saleId}`
				const itemEvident = _.filter(JSON.parse(dataVerify[0].dataDetail), (e) => { return e.SaleId == item.saleId })[0] || {}
				if (item.itemPhoto !== '[]') {
					if ((check[keyVAT]?.length || 0) > 0 && (check[keyBILL]?.length || 0) > 0 && (check[keyCRM]?.length || 0) > 0) {
						continue
					} else {
						if (itemEvident.isImageVAT == 1 && (check[keyVAT]?.length || 0) == 0) {
							ToastError(`Vui lòng cập nhật đầy đủ dữ liệu hình ảnh VAT trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
							actionResult(false)
							return
						} else if (itemEvident.isImageBill == 1 && (check[keyBILL]?.length || 0) == 0) {
							ToastError(`Vui lòng cập nhật đầy đủ dữ liệu hình ảnh "Biên nhận" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
							actionResult(false)
							return
						} else if (itemEvident.isImageCRM == 1 && (check[keyCRM]?.length || 0) == 0) {
							ToastError(`Vui lòng cập nhật đầy đủ dữ liệu hình ảnh "CRM" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
							actionResult(false)
							return
						} else {
							if (itemEvident.billCodeFilter == 1) {
								if ((item.billCodeFilter || '').length == 0) {
									ToastError(`Vui lòng cập nhật đầy đủ dữ liệu mã tra cứu trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
									actionResult(false)
									return
								}
							}
							if (itemEvident.isStatusVerify == 1) {
								if ((item.statusVerify || '').length == 0) {
									ToastError(`Vui lòng cập nhật "Trạng thái đơn hàng" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
									actionResult(false)
									return
								}
							}
							if (itemEvident.infoVerify == 1) {
								const _update = JSON.parse(item.itemUpdate)
								const dataCheck = JSON.parse(_update.dataUpdate || '[]')
								for (let index = 0; index < dataCheck.length; index++) {
									const item = dataCheck[index];
									if ((_update[item.Ref_Code] || '').length == 0 && item.IsRequired == 1) {
										ToastError(`Vui lòng cập nhật thông tin "${item.ItemName}" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
										actionResult(false)
										return
									}
								}
								// const _update = JSON.parse(item.itemUpdate)
								// if ((_update.IMEI || '').length == 0) {
								// 	ToastError(`Vui lòng cập nhật thông tin "IMEI" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
								// 	actionResult(false)
								// 	return
								// }
								// if ((_update.BillCode || '').length == 0) {
								// 	ToastError(`Vui lòng cập nhật thông tin "Mã phiếu xuất" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
								// 	actionResult(false)
								// 	return
								// }
								// if ((_update.WarehouseCode || '').length == 0) {
								// 	ToastError(`Vui lòng cập nhật thông tin "Mã kho xuất" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
								// 	actionResult(false)
								// 	return
								// }
							}
						}
					}
				}
			}
		}
		actionResult(true)
	}
	const handleCheckDataOtherApp = (actionResult) => {

		if (dataUpload.length > 0) {
			for (let index = 0; index < dataUpload.length; index++) {
				const item = dataUpload[index];
				const check = _.groupBy(dataPhotos, 'photoType')
				const keyVAT = `VAT_${item.saleId}`
				const keyBILL = `BILL_${item.saleId}`
				const keyCRM = `CRM_${item.saleId}`
				const itemEvident = _.filter(JSON.parse(dataVerify[0].dataDetail), (e) => { return e.SaleId == item.saleId })[0] || {}
				const _update = JSON.parse(item.itemUpdate)
				if (item.itemPhoto !== '[]' || _update.isCheckInfo == 1) {
					if (((check[keyVAT]?.length || 0) > 0 && (check[keyBILL]?.length || 0) > 0 && (check[keyCRM]?.length || 0) > 0)) {
						continue
					} else {
						if ((itemEvident.isImageVAT == 1 || _update.isImageVAT == 1) && (check[keyVAT]?.length || 0) == 0) {
							ToastError(`Vui lòng cập nhật đầy đủ dữ liệu hình ảnh VAT trước khi gửi báo cáo (SP: ${itemEvident.ProductName || _update.ProductName})`)
							actionResult(false)
							return
						} else if (itemEvident.isImageBill == 1 && (check[keyBILL]?.length || 0) == 0) {
							ToastError(`Vui lòng cập nhật đầy đủ dữ liệu hình ảnh "Biên nhận" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
							actionResult(false)
							return
						} else if (itemEvident.isImageCRM == 1 && (check[keyCRM]?.length || 0) == 0) {
							ToastError(`Vui lòng cập nhật đầy đủ dữ liệu hình ảnh "CRM" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
							actionResult(false)
							return
						} else {

							if (itemEvident.billCodeFilter == 1) {
								if ((item.billCodeFilter || '').length == 0) {
									ToastError(`Vui lòng cập nhật đầy đủ dữ liệu mã tra cứu trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
									actionResult(false)
									return
								}
							}
							if (itemEvident.isStatusVerify == 1) {
								if ((item.statusVerify || '').length == 0) {
									ToastError(`Vui lòng cập nhật "Trạng thái đơn hàng" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
									actionResult(false)
									return
								}
							}
							if (_update.isBillFromLink == 1 && _update.isCheckBillFromLink == 1) {
								if ((item.billFromLink || '').length == 0) {
									ToastError(`Vui lòng cập nhật "Đường dẫn hoá đơn" trước khi gửi báo cáo (SP: ${_update.ProductName})`)
									actionResult(false)
									return
								}
							}
							if (itemEvident.infoVerify == 1) {

								const dataCheck = JSON.parse(_update.dataUpdate || '[]')
								for (let index = 0; index < dataCheck.length; index++) {
									const item = dataCheck[index];
									if ((_update[item.Ref_Code] || '').length == 0 && item.IsRequired == 1) {
										ToastError(`Vui lòng cập nhật thông tin "${item.ItemName}" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
										actionResult(false)
										return
									}
								}

								// console.log(dataCheck[0], '_update_update');
								// if ((_update.IMEI || '').length == 0) {
								// 	ToastError(`Vui lòng cập nhật thông tin "IMEI" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
								// 	actionResult(false)
								// 	return
								// }
								// if ((_update.BillCode || '').length == 0) {
								// 	ToastError(`Vui lòng cập nhật thông tin "Mã phiếu xuất" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
								// 	actionResult(false)
								// 	return
								// }
								// if ((_update.WarehouseCode || '').length == 0) {
								// 	ToastError(`Vui lòng cập nhật thông tin "Mã kho xuất" trước khi gửi báo cáo (SP: ${itemEvident.ProductName})`)
								// 	actionResult(false)
								// 	return
								// }
							}
						}
					}
				}
			}
		}
		actionResult(true)
	}
	const handlerChangeValue = async (type, item, text) => {
		const itemMain = _.filter(dataUpload, (e) => { return e.saleId == item.SaleId })[0] || {}
		if (type == 'BILLCODE') {
			const itemUpdate = { ...itemMain, billCodeFilter: text }
			//
			const _update = dataUpload.map((it) => (it.saleId == item.SaleId ? itemUpdate : it))
			await setDataUpload(_update)
		}
		if (type == 'LINK') {
			const itemUpdate = await { ...itemMain, billFromLink: text }
			//
			const _update = dataUpload.map((it) => (it.saleId == item.SaleId ? itemUpdate : it))
			await setDataUpload(_update)
		}
		if (type == 'NOTE') {
			const itemUpdate = await { ...itemMain, note: text }
			//
			const _update = dataUpload.map((it) => (it.saleId == item.SaleId ? itemUpdate : it))
			await setDataUpload(_update)
		}
	}
	const handlerCancelItem = async (item, type) => {
		const itemMain = _.filter(dataUpload, (e) => { return e.saleId == item.SaleId })[0] || {}
		const cancel = (itemMain.isCancel || 0) == 1 ? 0 : 1
		const itemUpdate = { ...itemMain, isCancel: cancel }
		//
		const _update = dataUpload.map((it) => (it.saleId == item.SaleId ? itemUpdate : it))
		await setDataUpload(_update)
	}
	const handlerUpdateItem = async (item, type) => {
		const itemMain = _.filter(dataUpload, (e) => { return e.saleId == item.SaleId })[0] || {}
		let statusItem = itemMain.statusVerify || 'Trạng thái'
		switch (statusItem) {
			case 'Trạng thái':
				statusItem = 'ONLINE'
				break
			case 'ONLINE':
				statusItem = 'OFFLINE'
				break
			default:
				statusItem = 'Trạng thái'
				break
		}
		const itemUpdate = { ...itemMain, statusVerify: statusItem }
		//
		const _update = dataUpload.map((it) => (it.saleId == item.SaleId ? itemUpdate : it))
		await setDataUpload(_update)
		return statusItem
	}
	const handlerNotVerifyItem = async (item, type) => {
		const itemMain = _.filter(dataUpload, (e) => { return e.saleId == item.SaleId })[0] || {}
		const notVerify = (itemMain.isNotVerify || 0) == 1 ? 0 : 1
		const itemUpdate = { ...itemMain, isNotVerify: notVerify }
		//
		const _update = dataUpload.map((it) => (it.saleId == item.SaleId ? itemUpdate : it))
		await setDataUpload(_update)
	}
	const handlerSearch = (text) => {
		const filterList = dataMain.filter((_item, index) => { return index == changeIndex })
		const itemFilter = JSON.parse(filterList[0]?.dataDetail || '[]').filter(i => {
			return i.ProductName.toLowerCase().match(text.toLowerCase()) ||
				i.ProductCode.toLowerCase().match(text.toLowerCase()) ||
				(i.statusEvident !== undefined && i.statusEvident?.toLowerCase().match(text.toLowerCase()))
		})
		const searchResult = dataVerify.map((item, index) => index === changeIndex ? { ...item, dataDetail: JSON.stringify(itemFilter) } : item)
		setDataVerify(searchResult)
	}
	const handlerChangeTab = (index) => {
		onChangeIndex(index)
		const groupList = JSON.parse(dataMain[index]?.dataGroup || '[]')
		setGroupStatus(groupList)
	}
	const onFilterGroup = (item) => {
		const value = item.groupStatus == isGroupStatus ? '' : item.groupStatus
		setIsGroupStatus(value);
		handlerSearch(value)
	}
	//
	// dataUpdate
	const contains = (item) => {
		const dataUpdate = JSON.parse(item.dataUpdate || '[]')
		let countRequire = 0
		let countHave = 0

		for (let indexM = 0; indexM < dataUpdate.length || 0; indexM++) {
			const itemM = dataUpdate[indexM]
			if (itemM.IsRequired == 1)
				countRequire = countRequire + 1
			if ((item[itemM.Ref_Code] || '').length > 0 && itemM.IsRequired == 1) {
				countHave = countHave + 1
			}
		}

		if (countRequire == countHave && countRequire !== 0)
			return true
		else return false
	};
	const renderItem = ({ item, index }) => {
		const isPhotoVAT = _.filter(dataPhotos, (e) => { return e.photoType == `VAT_${item.SaleId}` }).length > 0
		const isPhotoBILL = _.filter(dataPhotos, (e) => { return e.photoType == `BILL_${item.SaleId}` }).length > 0
		const isPhotoCRM = _.filter(dataPhotos, (e) => { return e.photoType == `CRM_${item.SaleId}` }).length > 0
		const isPhotoFSM = _.filter(dataPhotos, (e) => { return e.photoType == `FSM_${item.SaleId}` }).length > 0
		const isCancel = _.filter(dataUpload, (e) => { return e.saleId == item.SaleId }).isCancel || 0
		const isNotVerify = _.filter(dataUpload, (e) => { return e.saleId == item.SaleId }).isNotVerify || 0
		const itemUpload = _.filter(dataUpload, (e) => { return e.saleId == item.SaleId })
		const isInfoUpdate = contains(JSON.parse(itemUpload[0]?.itemUpdate || '{}'))

		const onBillFilterChange = (text) => {
			handlerChangeValue('BILLCODE', item, text)
		}
		const onBillFromLink = (text) => {
			handlerChangeValue('LINK', item, text)
		}
		const handleChangeNote = (text) => {
			handlerChangeValue('NOTE', item, text)
		}
		return (
			<View key={`iiti_${index}`} style={styles.itemContainer}>
				{/* Header Date */}
				{item.isParent && <Text style={styles.titleView}>{item.SaleDate}</Text>}
				{/* Content */}
				{item.billCodeFilter == 1 &&
					<View style={styles.contentContainer}>
						<ItemInput
							editable={item.isLockEvident == 0}
							titleName={'Mã tra cứu'}
							isRequire={true}
							placeholder={'Nhập mã tra cứu biên nhận (bắt buộc nhập tối thiểu 1 kí tự)'}
							itemValue={item.BillCodeFilterName}
							inputContainer={{ backgroundColor: appcolor.surface }}
							onChangeText={onBillFilterChange}
						/>
					</View>
				}
				{item.isBillFromLink == 1 &&
					<View style={styles.contentContainer}>
						<ItemInput
							editable={item.isLockEvident == 0}
							titleName={'Link hoá đơn'}
							isRequire={true}
							placeholder={'Nhập đường dẫn hoá đơn'}
							itemValue={item.BillFromLink}
							inputContainer={{ backgroundColor: appcolor.surface }}
							onChangeText={onBillFromLink}
						/>
					</View>
				}
				{item.statusEvident !== null && item.statusEvident?.length > 0 && <Text style={{ ...styles.itemView, color: appcolor[item.colorStatus], padding: 5 }}>{`Trạng thái: ${item.statusEvident}`}</Text>}
				<View style={styles.viewHeader}>
					<Text style={styles.itemView}>{`${item.SaleId}. Cửa hàng: ${item.ShopName}`}</Text>
					<Text style={styles.itemView}>{`Đc: ${item.AddressName}`}</Text>
					<View style={{ width: '100%', height: 0.5, backgroundColor: appcolor.greylight, margin: 3, alignSelf: 'center' }} />
					<Text style={styles.itemView}>{`Sản phẩm: ${item.ProductName}`}</Text>
					<Text style={styles.itemView}>{`Số lượng: ${item.Quantity}`}</Text>
					<Text style={styles.itemView}>{`Khách hàng: ${item.CustomerName}`}</Text>
					<Text style={styles.itemView}>{`Đc: ${item.CustomerAddress}`}</Text>
					<Text style={styles.itemView}>{`SĐT: ${item.CustomerPhone}`}</Text>
					<View style={{ marginTop: 8 }}>
						<FormGroup
							nonBorder
							noneRadius
							containerStyle={styles.inputView}
							inputStyle={{ fontSize: 13, padding: 5 }}
							editable={item.isLockEvident == 0}
							multiline
							useClearAndroid={false}
							value={item.note}
							placeholder={'Ghi chú (Nếu có)'}
							handleChangeForm={handleChangeNote}
						/>
					</View>
				</View>
				{item.isLockEvident == 0 &&
					<ControlActionData
						key={item.SaleId}
						navigation={navigation}
						itemChild={item}
						isVAT={isPhotoVAT}
						isBILL={isPhotoBILL}
						isCancel={isCancel == 1}
						isCRM={isPhotoCRM}
						isFSM={isPhotoFSM}
						isInfoUpdate={isInfoUpdate}
						isNotVerify={isNotVerify == 1}
						infoVerify={item.infoVerify == 1}
						dataUpdateInfo={JSON.parse(item.dataUpdate || '[]')}
						handlerUpdate={checkPhotoUpdate}
						updateItemInfo={updateItemInfo}
						cancelItem={handlerCancelItem}
						updateStatusItem={handlerUpdateItem}
						notVerifyItem={handlerNotVerifyItem}
					/>
				}
			</View>
		)
	}
	const styles = StyleSheet.create({
		mainContainer: { flex: 1, backgroundColor: appcolor.light },
		searchContainer: { margin: 8, backgroundColor: appcolor.placeholderBody },
		searchInput: { fontSize: 13, color: appcolor.dark },
		tabViewTop: { margin: 3, borderRadius: 3, backgroundColor: appcolor.transparent, minWidth: minWidthTab(dataVerify), height: 32 },
		itemContainer: { flex: 1, marginBottom: 8, borderWidth: 0.5, borderColor: appcolor.greylight, borderRadius: 8, padding: 8 },
		contentContainer: { flex: 1, borderWidth: 0.3, borderColor: appcolor.greylight, marginBottom: 5, borderRadius: 5 },
		viewHeader: { flex: 1, padding: 8, backgroundColor: appcolor.surface, borderRadius: 8 },
		titleView: { width: '100%', fontSize: 15, fontWeight: '700', color: appcolor.tomato, padding: 8 },
		itemView: { fontSize: 14, fontWeight: '500', color: appcolor.blacklight },
		buttonView: { padding: 8, borderRadius: 3, backgroundColor: appcolor.red },
		textView: { minWidth: 80, textAlign: 'center', color: appcolor.dark, fontSize: 13, fontWeight: '700' },
		buttonApply: { padding: 8, width: '100%', position: 'absolute', bottom: 28 },
		titleApply: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: appcolor.info },
		inputView: { width: '100%', backgroundColor: appcolor.light, borderRadius: 20, marginBottom: 0, },
		tabGroupView: { padding: 8, borderRadius: 20, borderWidth: 0.3, borderColor: appcolor.graylight, margin: 8 },
		tabGroupSelected: { padding: 8, borderRadius: 20, borderWidth: 0.3, borderColor: appcolor.primary, backgroundColor: appcolor.primary, margin: 8 }
	})
	useEffect(() => {
		const _load = LoadData()
		return () => _load
	}, [filterDate])
	return (
		<View style={styles.mainContainer}>
			<HeaderCustom
				title={kpiinfo.menuNameVN || ''}
				iconRight='cloud-upload-alt'
				iconMiddle='search'
				rightFunc={UploadData}
				middleFunc={() => SheetManager.show('filterMonth')}
				leftFunc={() => navigation.goBack()}
			/>
			<FormGroup
				editable
				containerStyle={styles.searchContainer}
				inputStyle={styles.searchInput}
				placeholder='Tìm kiếm'
				iconName='search'
				handleChangeForm={handlerSearch}
			/>
			<LoadingView isLoading={isLoading} title={'Đang cập nhật dữ liệu'} />
			{groupStatus !== null && groupStatus.length > 0 &&
				<View style={{ width: '100%' }}>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{groupStatus.map((item, index) => {
							const handlerFilterTab = () => {
								onFilterGroup(item)
							}
							const isSelected = isGroupStatus == item.groupStatus
							return (
								<TouchableOpacity key={`ggi_${index}`} style={isSelected ? styles.tabGroupSelected : styles.tabGroupView}
									onPress={handlerFilterTab}>
									<Text style={{ fontSize: 14, fontWeight: isSelected ? '400' : '600', color: isSelected ? appcolor.light : appcolor.dark }}>{item.groupStatus}</Text>
								</TouchableOpacity>
							)
						})}
					</ScrollView>
				</View>
			}
			<View style={{ flex: 1 }}>
				{dataVerify.length > 0 && <Tabs.Container
					ref={tabRef}
					renderTabBar={props => (
						<MaterialTabBar
							{...props}
							labelStyle={{ fontSize: 13, fontWeight: '700' }}
							indicatorStyle={{ backgroundColor: appcolor.info }}
							inactiveColor={appcolor.greylight}
							activeColor={appcolor.primary}
							tabStyle={styles.tabViewTop}
							scrollEnabled={true}
						/>
					)}
					onIndexChange={handlerChangeTab}
					containerStyle={{ backgroundColor: appcolor.transparent }}>
					{dataVerify.length > 0 && dataVerify.map((it, i) => {
						let dataDetail = JSON.parse(it.dataDetail || '[]')
						const { arr } = groupDataByKey({
							arr: dataDetail,
							key: 'SaleDate',
							keyLayer2: 'ShopId'
						})
						return (
							<Tabs.Tab key={`itemvvr_${i}`} label={it.dealerName} name={it.dealerName} >
								<View style={{ backgroundColor: appcolor.light, marginTop: 48, paddingBottom: 16, padding: 5, width: deviceWidth }}>
									<FlatList
										key={'lstverifyso'}
										extraData={arr}
										keyExtractor={(_item, index) => index.toString()}
										data={arr}
										removeClippedSubviews={true}
										initialNumToRender={2}
										maxToRenderPerBatch={1}
										updateCellsBatchingPeriod={100}
										windowSize={7}
										renderItem={renderItem}
										showsVerticalScrollIndicator={false}
										ListFooterComponent={<View style={{ paddingBottom: 32 }} />}
									/>
								</View>
							</Tabs.Tab>
						)
					})}
				</Tabs.Container>
				}
			</View>
			<ActionSheet id='filterMonth'>
				<View style={{ width: '100%', height: deviceHeight / 3.5, padding: 8 }}>
					<YearMonthSelected option={filterDate} onYearMonth={setFilterDate} numMonth={4} />
				</View>
			</ActionSheet>
		</View>
	)
} 