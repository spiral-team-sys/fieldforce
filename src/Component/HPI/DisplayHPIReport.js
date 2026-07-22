import React, { useEffect, useRef, useState } from "react";
import { FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { AuditAPI } from "../../API/AuditDisplayAPI";
import { ToastError, ToastSuccess, groupDataByKey } from "../../Core/Helper";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { CheckBox, Text } from '@rneui/themed';
import _ from 'lodash';
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { TODAY, alertConfirm, deviceHeight, deviceWidth, minWidthTab } from "../../Core/Utility";
import Icon from '@react-native-vector-icons/fontawesome6';
import FormGroup from "../../Content/FormGroup";
import { LoadingView } from "../../Control/ItemLoading";
import { REPORT } from "../../API/ReportAPI";
import { getDataPhotoByReport, itemUploaded, saveJsonData } from "../../Controller/ReportController";
// import NumberFormat from "react-number-format";

export const DisplayHPIReport = ({ navigation }) => {
	const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
	const [loading, setLoading] = useState(false)
	const [dataMain, setDataMain] = useState([])
	const [dataPOSM, setDataPOSM] = useState([])
	const [dataFilter, setDataFilter] = useState([])
	const [dataGroup, setDataGroup] = useState([])
	const [filter, setFilter] = useState({ displayId: 0 })
	const [_mutate, setMutate] = useState(false)
	const [isUploaded, setUploaded] = useState(false)
	const tabRef = useRef()

	const LoadData = async () => {
		await setLoading(true)
		const dataFilter = {
			shopId: shopinfo.shopId, reportId: kpiinfo.id, typeReport: 'DISPLAY'
		}
		await REPORT.GetDataReportByShop(dataFilter, async (mData, mesager) => {
			mesager && ToastSuccess(mesager)
			await setDataMain(mData)
			if (mData !== null && mData.length > 0)
				await setupDataView(mData)
		})
		const itemUpdate = await itemUploaded(shopinfo, kpiinfo.id)
		await setUploaded(itemUpdate.isUploaded == 1)
		await setLoading(false)
	}
	const setupDataView = async (data, displayId) => {
		await setDataGroup([])
		const _id = displayId || data[0].DisplayId
		await setFilter({ displayId: _id })
		//
		const dataPOSM = data.filter((item, _index) => { return item.DisplayId == _id })
		const posmListResult = dataPOSM[0].DataDetail || []
		await setDataPOSM(posmListResult)
		await setDataFilter(posmListResult)
		const groupList = _.uniqBy(posmListResult, 'CategoryName')
		await setDataGroup(groupList)
	}
	// Handler 
	const uploadData = async () => {
		const checkData = await validationData()
		if (checkData) {
			alertConfirm('Thông báo', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
				await REPORT.UploadDataRaw(shopinfo, kpiinfo.id)
				await LoadData()
			})
		}
	}
	const validationData = async () => {
		const dataPhoto = await getDataPhotoByReport(kpiinfo.id, shopinfo.shopId)
		for (let index = 0; index < dataMain.length; index++) {
			const itemMain = dataMain[index];
			const dataGroupCheck = _.uniqBy(itemMain.DataDetail, 'RefName')
			// Check item child
			for (let index = 0; index < dataGroupCheck.length; index++) {
				const i = dataGroupCheck[index];
				const dataItem = _.filter(itemMain.DataDetail, (e) => {
					return e.CategoryName == i.CategoryName && e.RefName == i.RefName && e.itemValue !== null && e.itemValue !== undefined
				})
				if (dataItem.length > 0) {
					const lstPhoto = _.filter(dataPhoto, (e) => { return e.photoType == `${itemMain.DisplayId}_${i.RefId}` })
					const photoConfig = i.ImageList[0] || {}
					if (photoConfig?.numberIMG || 0 > 0) {
						if (lstPhoto.length < (photoConfig?.numberIMG || 0)) {
							ToastError(`Vui lòng chụp đủ hình ảnh ${itemMain.DisplayName} - ${i.CategoryName}/${i.RefName} (Tối thiểu ${photoConfig?.numberIMG} tấm)`, 'Thông báo', 'top')
							return false
						}
					}
				}
			}
		}
		return true
	}
	const onItemSelected = async (item) => {
		await setupDataView(dataMain, item.DisplayId)
	}
	const cameraAction = (item) => {
		const ImageByList = item.ImageList || []
		navigation.navigate('photogroup', { Status: isUploaded ? 1 : 0, hideIcon: true, dataImageList: ImageByList })
	}
	const onValueChange = async (item, text) => {
		let display = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
		item.itemValue = display !== null ? parseInt(display) : null
		setMutate(e => !e)
		await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMain)
	}
	const onTextChange = async (item, text) => {
		let mText = ''
		if (text == '') {
			mText = null
		} else {
			mText = text
		}
		item.remarkValue = mText
		setMutate(e => !e)
		await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMain)
	}
	const searchData = (text) => {
		const searchList = dataFilter.filter(i => { return i.ItemName.toLowerCase().match(text.toLowerCase()) })
		setDataPOSM(searchList)
	}
	// View
	const renderItem = ({ item, index }) => {
		return (
			<View key={`eeq${index}`} style={styles.mainItem}>
				{item.isParent && <Text style={styles.titleHeader}>{`${item.RefName}`}</Text>}
				<View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
					<View style={{ width: '70%' }}>
						{item.ItemCode && <Text style={styles.codeItem}>{`${item.ItemCode}`}</Text>}
						<Text style={styles.titleItem}>{`${index + 1}. ${item.ItemName}`}</Text>
					</View>
					<View style={{ width: '30%', flexDirection: 'row', justifyContent: 'flex-end' }}>

						{
							item.InputType !== 'T' &&
							<InputQuantity
								item={item}
								index={index}
								isUploaded={isUploaded}
								changeValue={onValueChange}
							/>
						}
					</View>
				</View>
				{
					item.InputType == 'T' &&
					<FormGroup
						key={`TextValue_${item.Id}_${index}`}
						iconName={'comment-alt'}
						multiline={true} selectTextOnFocus={true}
						containerStyle={{
							backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3,
							marginTop: 4, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5,
						}}
						inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
						placeholder='Nhập nội dung...'
						editable={!isUploaded}
						onClearTextAndroid={() => onTextChange(item, '')}
						handleChangeForm={(text) => onTextChange(item, text)}
						defaultValue={item.remarkValue || ''}
					/>
				}
			</View>
		)
	}
	const getItemLayout = (data, index) => (
		{ length: 50, offset: 50 * index, index }
	);
	useEffect(() => {
		const _load = LoadData()
		return () => _load
	}, [])
	//
	const styles = StyleSheet.create({
		mainContainer: { flex: 1, backgroundColor: appcolor.light },
		contentView: { flex: 1 },
		categroyView: { padding: 8, minWidth: 100, alignItems: 'center', marginEnd: 8, borderRadius: 16, borderColor: appcolor.grayLight },
		mainItem: { flex: 1, borderBottomWidth: 0.3, borderColor: appcolor.greylight, paddingTop: 4, paddingBottom: 4 },
		titleHeader: { width: '100%', fontSize: 16, fontWeight: '700', color: appcolor.info, fontStyle: 'italic', padding: 8 },
		titleItem: { width: '100%', fontSize: 13, fontWeight: '500', color: appcolor.dark, padding: 8 },
		codeItem: { width: '100%', fontSize: 14, fontWeight: '700', color: appcolor.dark, paddingTop: 8, paddingHorizontal: 8, fontStyle: 'italic' },
		checkboxContainer: { backgroundColor: appcolor.light, padding: 0, borderWidth: 0 },
	})
	return (
		<View style={styles.mainContainer}>
			<HeaderCustom
				title={kpiinfo.menuNameVN}
				leftFunc={() => navigation.goBack()}
				iconRight='cloud-upload-alt'
				rightFunc={isUploaded == 1 ? null : uploadData}
			/>
			<FormGroup
				editable
				containerStyle={{ margin: 8, backgroundColor: appcolor.surface }}
				iconName='search'
				placeholder='Tìm kiếm'
				handleChangeForm={searchData}
			/>
			<LoadingView isLoading={loading} title='Đang xử lý dữ liệu' />
			<View style={{ padding: 5 }} >
				<ScrollView style={{ width: '100%', paddingBottom: 8 }} horizontal showsHorizontalScrollIndicator={false}>
					{dataMain !== null && dataMain.map((item, index) => {
						const isSelected = item.DisplayId == filter.displayId
						const handlerSelected = () => {
							onItemSelected(item)
						}
						return (
							<TouchableOpacity
								key={`id@_${index}`}
								style={{ ...styles.categroyView, backgroundColor: isSelected ? appcolor.placeholderBody : appcolor.light, borderWidth: isSelected ? 0 : 0.5 }}
								onPress={handlerSelected}>
								<Text style={{ fontSize: 15, fontWeight: '700', color: isSelected ? appcolor.red : appcolor.greydark, marginStart: 8, marginEnd: 8 }}>{item.DisplayName}</Text>
							</TouchableOpacity>
						)
					})}
				</ScrollView>
			</View>
			<View style={styles.contentView}>
				{dataGroup.length > 0 &&
					<Tabs.Container
						ref={tabRef}
						renderTabBar={props => (
							<MaterialTabBar
								{...props}
								scrollEnabled
								labelStyle={{ fontSize: 14, fontWeight: '600' }}
								indicatorStyle={{ backgroundColor: appcolor.primary }}
								inactiveColor={appcolor.greylight}
								activeColor={appcolor.dark}
								tabStyle={{ minWidth: minWidthTab(dataGroup), height: 38 }}
								style={{ backgroundColor: appcolor.light }}
							/>
						)}
						containerStyle={{ backgroundColor: appcolor.surface }}>
						{dataGroup.length > 0 && dataGroup.map((it, i) => {
							let dataItem = dataPOSM.filter(e => { return e.DisplayId == it.DisplayId && e.CategoryName == it.CategoryName })
							const { arr } = groupDataByKey({
								arr: dataItem,
								key: 'RefName'
							})
							const labelItem = `${it.CategoryName} (${arr.length || 0})`
							return (
								<Tabs.Tab key={`id_${i}`} label={labelItem} name={labelItem} >
									<View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
										<FlatList
											extraData={arr}
											keyExtractor={(_item, index) => index.toString()}
											data={arr}
											renderItem={renderItem}
											getItemLayout={getItemLayout}
											removeClippedSubviews
											showsVerticalScrollIndicator={false}
											ListFooterComponent={
												<View style={{ paddingBottom: deviceHeight / 2.5 }} />
											}
											ListHeaderComponent={
												<HeaderItemView
													index={i}
													itemHeader={it}
													handlerCamera={cameraAction}
												/>
											}
										/>
									</View>
								</Tabs.Tab>
							)
						})}
					</Tabs.Container>
				}
			</View>
		</View>
	)
}
const HeaderItemView = ({ itemHeader, index, handlerCamera }) => {
	const { appcolor } = useSelector(state => state.GAppState)

	const RenderButton = ({ iconName, titleName, onAction }) => {
		const pressItem = () => {
			onAction(itemHeader)
		}
		return (
			<TouchableOpacity
				style={{ width: deviceWidth / 2.2, backgroundColor: appcolor.surface, marginEnd: 3, marginStart: 3, borderRadius: 5 }}
				key={`iid_oop_${index}`} onPress={pressItem}>
				<View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', padding: 5 }}>
					<Icon name={iconName} size={21} color={appcolor.yellow} solid />
					<Text style={{ fontSize: 13, fontWeight: '400', color: appcolor.dark, padding: 5, marginStart: 5 }}>{titleName}</Text>
				</View>
			</TouchableOpacity>
		)
	}

	return (
		<View style={{ width: '100%', flexDirection: 'row', borderRadius: 5, justifyContent: 'center', marginBottom: 8, marginTop: 8 }}>
			<RenderButton iconName='camera' titleName='Chụp hình' onAction={handlerCamera} />
		</View>
	)
}
const InputQuantity = ({ item, index, isUploaded, changeValue }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const handlerChange = (text) => {
		changeValue(item, text)
	}
	return (
		<View key={`ppd_${index}`} style={{ flex: 1, alignSelf: 'center', marginEnd: 8 }}  >
			<NumberFormat
				value={(item.itemValue == 0 ? '0' : item.itemValue) || ''}
				displayType='text'
				thousandSeparator={true}
				renderText={value =>
					<TextInput
						textAlign={'center'}
						value={value}
						style={{ fontSize: 13, color: appcolor.dark, padding: 8, backgroundColor: appcolor.placeholderBody, textAlign: 'center', borderRadius: 5 }}
						keyboardType='numeric'
						placeholder={item.Unit || 'Số lượng'}
						placeholderTextColor={appcolor.greydark}
						editable={!isUploaded}
						selectTextOnFocus
						onChangeText={handlerChange}
					/>
				}
			/>
		</View>
	)
}