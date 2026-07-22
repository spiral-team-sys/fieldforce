import moment from "moment"
import React, { useEffect, useState } from "react"
import ActionSheet, { SheetManager } from "react-native-actions-sheet"

import { useSelector } from "react-redux"
import NativeCamera from "../../../Control/NativeCamera"
import { SelloutAPI } from "../../../API/SelloutAPI"
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { Icon, Image, Text } from '@rneui/themed'
import { deviceHeight, deviceWidth } from "../../../Core/Utility"
import { ItemInput } from "./ItemInput"
import { deletePhoto } from "../../../Controller/PhotoController"
import { UUIDGenerator } from "../../../Core/Helper"

const imageOptions = {
	mediaType: 'photo',
	cameraType: Platform.OS === 'android' ? 'front' : 'back',
	quality: 1,
	saveToPhotos: true,
	selectionLimit: 5,
}

export const ControlActionData = ({
	navigation, itemChild,
	isVAT = false, isBILL = false, isCRM = false, isFSM = false, isCancel = false,
	isInfoUpdate = false, infoVerify = false, dataUpdateInfo = [], isNotVerify = false,
	handlerUpdate, updateItemInfo, cancelItem, updateStatusItem, notVerifyItem
}) => {
	const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState)
	const [modeValue, setModeValue] = useState(null)
	const [dataPhoto, setDataPhoto] = useState([])
	const [itemModel, setItemModel] = useState(itemChild)
	const [cancelEvident, setCancelEvident] = useState(isCancel)
	const [statusVerify, setStatusVerify] = useState(itemChild.statusVerify)
	const [_mutate, setMutate] = useState(false)
	const [notVerifyEvident, setNotVerifyEvident] = useState(isNotVerify)
	const mode = {
		VAT: "VAT",
		BILL: "BILL",
		CRM: "CRM",
		FSM: "FSM",
		UPDATESTATUS: "UPDATESTATUS",
		UPDATEINFO: "UPDATEINFO",
		CANCEL: "CANCEL",
		NOTVERIFY: "NOTVERIFY",
	}

	const handlerCancel = () => {
		setCancelEvident(e => !e)
		cancelItem(itemChild, modeValue)
	}
	const handlerNotVerify = () => {
		setNotVerifyEvident(e => !e)
		notVerifyItem(itemChild, modeValue)
	}
	const handlerShowAction = (modePress) => {
		setModeValue(modePress)
		if (modePress == mode.UPDATEINFO) {
			SheetManager.show(`modeData_${itemChild.SaleId}`)
		} else {
			SheetManager.show(`modePicture_${itemChild.SaleId}`)
		}
	}
	const hanlderCloseAction = () => {
		setModeValue(null)
	}
	const handlerChangeStatus = async (item) => {
		const statusResult = await updateStatusItem(itemChild, modeValue)
		setStatusVerify(statusResult)
	}
	const handlerCamera = async () => {
		const photoinfo = {
			"shopId": itemChild.ShopId,
			"shopCode": itemChild.ShopCode,
			"reportId": kpiinfo.id,
			"photoDate": itemChild.WorkDate,
			"photoTime": new Date().getTime(),
			"photoType": `${modeValue}_${itemChild.SaleId}`,
			"dataUpload": 0,
			"fileUpload": 0,
			"photoPath": null,
			"shopLat": null,
			"shopLong": null,
			"guid": UUIDGenerator(),
			"photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
		}
		await NativeCamera.cameraStart(photoinfo, () => { handlerLoadPhoto() }, imageOptions);
	}
	const handlerFile = async () => {
		const photoinfo = {
			"shopId": itemChild.ShopId,
			"shopCode": itemChild.ShopCode,
			"reportId": kpiinfo.id,
			"photoDate": itemChild.WorkDate,
			"photoTime": new Date().getTime(),
			"photoType": `${modeValue}_${itemChild.SaleId}`,
			"dataUpload": 0,
			"fileUpload": 0,
			"photoPath": null,
			"shopLat": null,
			"shopLong": null,
			"guid": UUIDGenerator(),
			"photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
		}
		await NativeCamera.imageGalleryLaunch(photoinfo, () => { handlerLoadPhoto() }, imageOptions);
	}
	const handlerLoadPhoto = async () => {
		await handlerUpdate()
		await updateItemInfo(itemChild, itemModel)
		if (modeValue !== null) {
			const typePhoto = `${modeValue}_${itemChild.SaleId}`
			await SelloutAPI.photoEvident(itemChild, typePhoto, async (photos) => {
				await setDataPhoto(photos)
			})
		}
	}
	const handlerDeletePhoto = (item) => {
		deletePhoto(item)
		handlerLoadPhoto()
	}
	const handlerChangeText = async (text, type, item) => {
		switch (type) {
			case 'IMEI':
				itemModel.IMEI = text
				break
			case 'BillCode':
				itemModel.BillCode = text
				break
			case 'ShopCode':
				itemModel.ShopCode = text
				break
			case 'Model':
				itemModel.Model = text
				break
			case 'CustomerName':
				itemModel.CustomerName = text
				break
			case 'CustomerAddress':
				itemModel.CustomerAddress = text
				break
			case 'CustomerPhone':
				itemModel.CustomerPhone = text
				break
			case 'WarehouseCode':
				itemModel.WarehouseCode = text
				break
		}
		setMutate(e => !e)
	}
	const handlerSaveItem = async () => {
		await updateItemInfo(itemChild, JSON.stringify(itemModel))
		await SheetManager.hide(`modeData_${itemChild.SaleId}`)
	}
	const saveQRCode = async (barcode, type) => {
		switch (type) {
			case 'IMEI':
				itemModel.IMEI = barcode
				break
			case 'BillCode':
				itemModel.BillCode = barcode
				break
			case 'QR':
				itemModel.QR = barcode
				break
		}
		setMutate(e => !e)
	}
	const scanBarCode = (type) => {
		let settingCamera = { ...workinfo, latitude: 1, longitude: 1, QRCode: 1, callBack: (barcode) => { saveQRCode(barcode, type) } };
		navigation.navigate('Camera', settingCamera);
	}
	//
	const renderItem = (item, index) => {
		const onItemPress = () => {
			handlerDeletePhoto(item)
		}
		return (
			<View key={`iid_evd_${index}`} style={{ flex: 1, padding: 8 }}>
				<Image source={{ uri: item.photoPath }} style={{ width: '100%', height: 180, borderRadius: 8, resizeMode: 'cover', alignContent: 'center' }} />
				<TouchableOpacity onPress={onItemPress} style={{ position: 'absolute', top: 16, right: 16 }}>
					<Icon name={"times"} type='font-awesome-5' size={23} color={appcolor.red} />
				</TouchableOpacity>
			</View>
		)
	}
	const renderItemInfo = (item, index) => {
		const onChangeText = (text, typeFilter) => {
			handlerChangeText(text, typeFilter, item)
		}
		return (
			<View key={`iiupi_${index}`}>
				<ItemInput
					key={item.Code}
					typeFilter={item.Ref_Code}
					isRequire={item.IsRequired == 1}
					titleName={item.ItemName}
					itemValue={itemModel[item.Ref_Code]}
					isScanIMEI={item.Ref_Code == 'IMEI'}
					isScanBarCode={item.Ref_Code == 'BillCode' || item.Ref_Code == 'QR'}
					onChangeText={onChangeText}
					handlerScan={scanBarCode}
					onReadScanCode={saveQRCode}
				/>
			</View>
		)
	}
	//
	const styles = StyleSheet.create({
		buttonView: { padding: 8, borderRadius: 3, borderColor: appcolor.greylight, borderWidth: 0.3, backgroundColor: appcolor.light, marginTop: 8, marginEnd: 5 },
		buttonAction: { padding: 8, borderRadius: 3, borderColor: appcolor.info, borderWidth: 0.3, backgroundColor: appcolor.info, marginTop: 8, marginEnd: 5 },
		cameraButtonView: { padding: 12, borderRadius: 50, backgroundColor: appcolor.info, marginEnd: 12 },
		textView: { minWidth: deviceWidth / 7, textAlign: 'center', color: appcolor.dark, fontSize: 13, fontWeight: '700' },
		titleView: { textAlign: 'center', color: appcolor.dark, fontSize: 18, fontWeight: '700', padding: 8 },
		titleAction: { width: '70%', padding: 16, fontWeight: '700', fontSize: 16, color: appcolor.dark, position: 'absolute' },
		actionCamera: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
		inputView: { width: '100%', backgroundColor: appcolor.surface, borderRadius: 5, marginBottom: 0 },
		viewCodeFilter: {},
		viewScan: { backgroundColor: appcolor.dark }
	})
	useEffect(() => {
		const _load = handlerLoadPhoto()
		return () => _load
	}, [modeValue])
	return (
		<View style={{ flex: 1 }}>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
				{!cancelEvident && !notVerifyEvident && infoVerify &&
					<TouchableOpacity
						key={`inputindex`}
						style={isInfoUpdate ? styles.buttonAction : styles.buttonView}
						onPress={() => handlerShowAction(mode.UPDATEINFO)}>
						<Text style={{ ...styles.textView, color: isInfoUpdate ? appcolor.light : appcolor.dark }}>{'Cập nhật'}</Text>
					</TouchableOpacity>
				}
				{!cancelEvident && !notVerifyEvident && itemChild.isImageVAT == 1 &&
					<TouchableOpacity
						key={`vatindex`}
						style={isVAT ? styles.buttonAction : styles.buttonView}
						onPress={() => handlerShowAction(mode.VAT)}>
						<Text style={{ ...styles.textView, color: isVAT ? appcolor.light : appcolor.dark }}>{'VAT'}</Text>
					</TouchableOpacity>
				}
				{!cancelEvident && !notVerifyEvident && itemChild.isImageBill == 1 &&
					<TouchableOpacity
						key={`billindex`}
						style={isBILL ? styles.buttonAction : styles.buttonView}
						onPress={() => handlerShowAction(mode.BILL)}>
						<Text style={{ ...styles.textView, color: isBILL ? appcolor.light : appcolor.dark }}>{itemChild.titleButton || 'Biên nhận'}</Text>
					</TouchableOpacity>
				}
				{!cancelEvident && !notVerifyEvident && itemChild.isImageCRM == 1 &&
					<TouchableOpacity
						key={`cmrindex`}
						style={isCRM ? styles.buttonAction : styles.buttonView}
						onPress={() => handlerShowAction(mode.CRM)}>
						<Text style={{ ...styles.textView, color: isCRM ? appcolor.light : appcolor.dark }}>{'CRM'}</Text>
					</TouchableOpacity>
				}
				{!cancelEvident && !notVerifyEvident && itemChild.isImageFSM == 1 &&
					<TouchableOpacity
						key={`fsmindex`}
						style={isFSM ? styles.buttonAction : styles.buttonView}
						onPress={() => handlerShowAction(mode.FSM)}>
						<Text style={{ ...styles.textView, color: isFSM ? appcolor.light : appcolor.dark }}>{'FSM'}</Text>
					</TouchableOpacity>
				}
				{!cancelEvident && !notVerifyEvident && itemChild.isStatusVerify == 1 &&
					<TouchableOpacity
						key={`statusindex`}
						style={{ ...styles.buttonView, borderColor: statusVerify == 'ONLINE' ? appcolor.success : statusVerify == 'OFFLINE' ? appcolor.red : appcolor.dark }}
						onPress={() => handlerChangeStatus(mode.UPDATESTATUS)}>
						<Text style={{ ...styles.textView, color: statusVerify == 'ONLINE' ? appcolor.success : statusVerify == 'OFFLINE' ? appcolor.red : appcolor.dark }}>{statusVerify || 'Trạng thái'}</Text>
					</TouchableOpacity>
				}
				{!cancelEvident && itemChild.isNotVerify == 1 &&
					<TouchableOpacity
						key={`notVerifyItem`}
						style={{ ...styles.buttonView, backgroundColor: notVerifyEvident ? appcolor.red : appcolor.light }}
						onPress={handlerNotVerify}>
						<Text style={{ ...styles.textView, minWidth: 30, color: notVerifyEvident ? appcolor.light : appcolor.red }}>{itemChild.titleNotVerify || 'không xác minh'}</Text>
					</TouchableOpacity>
				}
				{
					!notVerifyEvident &&
					<TouchableOpacity
						key={`rejectindex`}
						style={{ ...styles.buttonView, backgroundColor: cancelEvident ? appcolor.red : appcolor.light }}
						onPress={handlerCancel}>
						<Text style={{ ...styles.textView, minWidth: 30, color: cancelEvident ? appcolor.light : appcolor.red }}>Hủy</Text>
					</TouchableOpacity>
				}
			</View>
			<ActionSheet id={`modePicture_${itemChild.SaleId}`}
				gestureEnabled
				initialOffsetFromBottom={0.6}
				drawUnderStatusBar={Platform.OS == 'ios'}
				onClose={hanlderCloseAction}>
				<SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }}>
					<Text style={styles.titleAction}>{
						modeValue == mode.VAT ? `VAT - ${itemChild.ProductName}` :
							modeValue == mode.CRM ? `CRM - ${itemChild.ProductName}` :
								modeValue == mode.FSM ? `FSM - ${itemChild.ProductName}` : `Biên nhận - ${itemChild.ProductName}`
					}</Text>
					{/* Header Action */}
					<View style={styles.actionCamera}>
						<TouchableOpacity
							key={`fileaction`}
							style={styles.cameraButtonView}
							onPress={handlerCamera}>
							<Icon name="camera" type="font-awesome-5" color={appcolor.light} size={25} />
						</TouchableOpacity>
						<TouchableOpacity
							key={`cameraaction`}
							style={styles.cameraButtonView}
							onPress={handlerFile}>
							<Icon name="attach-file" color={appcolor.light} size={25} />
						</TouchableOpacity>
					</View>
					{/* Content Action */}
					<View style={{ flex: 1, margin: 8 }}>
						<ScrollView
							contentContainerStyle={{ paddingBottom: deviceHeight / 10 }}
							showsVerticalScrollIndicator={false}
							key={`lstEvident_${itemChild.SaleId}`}>
							{dataPhoto?.map((item, index) => { return renderItem(item, index) })}
						</ScrollView>
					</View>
					{/* // */}
				</SafeAreaView>
			</ActionSheet>
			<ActionSheet id={`modeData_${itemChild.SaleId}`}
				gestureEnabled
				drawUnderStatusBar={Platform.OS == 'ios'}
				onClose={hanlderCloseAction}>
				<SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }}>
					<Text style={styles.titleAction}>Cập nhật thông tin</Text>
					<View style={styles.actionCamera}>
						<TouchableOpacity
							key={`fileaction`}
							style={styles.cameraButtonView}
							onPress={handlerSaveItem}>
							<Icon name="save" color={appcolor.light} size={25} />
						</TouchableOpacity>
					</View>
					<ScrollView nestedScrollEnabled>
						{dataUpdateInfo !== null && dataUpdateInfo.length > 0 && dataUpdateInfo.map((i, ix) => {
							return renderItemInfo(i, ix)
						})}
					</ScrollView>
				</SafeAreaView>
			</ActionSheet>
		</View>
	)
}