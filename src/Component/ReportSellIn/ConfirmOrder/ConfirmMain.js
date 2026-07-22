import React, { useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { SellInAPI } from "../../../API/SellInApi";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { alertConfirm, deviceWidth, minWidthTab } from "../../../Core/Utility";
import _ from 'lodash'
import FormGroup from "../../../Content/FormGroup";
import { Badge, Text } from '@rneui/themed';
// import NumberFormat from "react-number-format";
import { scaleSize } from "../../../Themes/AppsStyle";
import { ToastError, ToastSuccess, groupDataByKey, removeVietnameseTones } from "../../../Core/Helper";
import moment from "moment";
import { getConfirmSellInList } from "../../../Controller/SellInController";
import { TouchableOpacity } from "react-native";
import { LoadingView } from '../../../Control/ItemLoading/index'

export const ConfirmMain = ({ navigation, route }) => {
	const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
	const [isLoading, setLoading] = useState(false)
	const [dataMain, setDataMain] = useState([])
	const [dataConfirm, setDataConfirm] = useState([])
	const [tabList, setTabList] = useState([])
	const [dataConfirmValue, setDataConfirmValue] = useState([])
	const tabRef = useRef()

	const LoadData = async () => {
		await setLoading(true)
		await setDataConfirm([])
		const filter = { 'fromDate': route?.params?.filterItem.FromDate, 'toDate': route?.params?.filterItem.ToDate }
		await SellInAPI.GetOrderConfirm(filter, async (mData) => {
			await setDataMain(mData)
			await setDataConfirm(mData)
			const lstTab = _.uniqBy(mData, 'statusOrder')
			await setTabList(lstTab)
			const confirmValue = await getConfirmSellInList()
			await setDataConfirmValue(confirmValue)
		})
		await setLoading(false)
	}
	const onFilterOrder = async (text) => {
		const valueSearch = removeVietnameseTones(text)
		const lstFilter = _.filter(dataMain, (e) => {
			return removeVietnameseTones(e.productName).toLowerCase().match(valueSearch.toLowerCase()) ||
				removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch.toLowerCase()) ||
				removeVietnameseTones(e.orderNo).toLowerCase().match(valueSearch.toLowerCase())
		})
		setDataConfirm(lstFilter)
	}
	const handlerUpdateOrder = async (item, confirmed, statusUpdate) => {
		alertConfirm(statusUpdate, `Xác nhận ${statusUpdate} đơn hàng này không ?`, async () => {
			item.confirmed = confirmed
			const result = await SellInAPI.UpdateOrder(JSON.stringify(item))
			if (result.statusId == 200) {
				ToastSuccess(result.messager)
				LoadData()
			} else
				ToastError(result.messager)
		}, () => { }, 'Đồng ý', 'Huỷ')
	}
	// View
	useEffect(() => {
		const _load = LoadData()
		return () => _load
	}, [])
	const styles = StyleSheet.create({
		mainContainer: { flex: 1, backgroundColor: appcolor.surface },
		contentView: { flex: 1 },
		itemStyle: { borderRadius: 8, marginBottom: 8, padding: 7, backgroundColor: appcolor.light },
		buttonAction: { borderRadius: 5, marginEnd: 8, marginTop: 5 },
		textButtonAction: { color: appcolor.light, fontSize: 12, fontWeight: '600', borderRadius: 3, borderWidth: 0.5, padding: 8 },
		filterView: { margin: 8 }
	})
	const renderItem = ({ item, index }) => {
		return (
			<View key={`order_${index}`}>
				{item.isParent && <RenderItemText appcolor={appcolor} type="Header" titleName="" itemValue={moment(item.date).format('dddd DD/MMM/YY')} />}
				<View style={{ width: '100%', alignSelf: 'center' }}>
					<View style={styles.itemStyle} key={index}>
						{/* Status Order */}
						{item.statusOrder !== null && <RenderItemText appcolor={appcolor} type="Status" titleName="Trạng thái: " itemValue={item.statusOrder} colorByRow={item.colorStatus} />}
						{item.confirmBy !== null && <RenderItemText appcolor={appcolor} type="Status" titleName="Xác nhận bởi " itemValue={item.confirmByName} colorByRow={item.colorStatus} />}
						{/* Detail Products */}
						<RenderItemText appcolor={appcolor} type="Info" titleName="Mã đơn hàng: " itemValue={item.orderNo} />
						<RenderItemText appcolor={appcolor} type="Info" titleName="NPP: " itemValue={item.dealerName} />
						<RenderItemText appcolor={appcolor} type="ShopName" titleName="Cửa hàng: " itemValue={item.shopName} />
						<RenderItemText appcolor={appcolor} type="Info" titleName="Sản phẩm: " itemValue={item.categoryName + " " + item.productName} />
						{(item.price !== null && item.price !== undefined && item.price !== 0) && <RenderItemText appcolor={appcolor} type="Price" titleName="Giá: " itemValue={item.price} />}
						{(item.priceNPP !== null && item.priceNPP !== undefined && item.priceNPP !== 0) && <RenderItemText appcolor={appcolor} type="PriceNPP" titleName="Giá NPP: " itemValue={item.priceNPP} />}
						<Badge
							containerStyle={{ alignSelf: 'center', position: 'absolute', right: 8, top: 8 }}
							textStyle={{ fontSize: 15, fontWeight: '700', color: appcolor.light }}
							badgeStyle={{ backgroundColor: appcolor.info, height: 40, width: 40, borderRadius: 20 }}
							value={item.quantityValue} />
						{item.isConfirm == 1 &&
							<View style={{ borderTopWidth: 0.3, borderTopColor: appcolor.greydark, marginTop: 5 }}>
								<ScrollView style={{ width: '100%', padding: 8 }} horizontal showsHorizontalScrollIndicator={false}>
									{dataConfirmValue.map((it, idx) => {
										const onPressValue = () => {
											handlerUpdateOrder(item, it.numberValue, it.name)
										}
										return (
											<TouchableOpacity key={`${idx}_AA`} onPress={onPressValue} style={styles.buttonAction} >
												<Text style={{ ...styles.textButtonAction, color: appcolor[it.isColor] }}>{it.name}</Text>
											</TouchableOpacity>
										)
									})}
								</ScrollView>
							</View>
						}
					</View>
				</View>
			</View>
		)
	}
	return (
		<View style={styles.mainContainer}>
			<HeaderCustom
				title={kpiinfo.menuNameVN || 'Xác nhận'}
				leftFunc={() => { navigation.goBack() }}
			/>
			<FormGroup
				editable
				placeholder='Tìm kiếm đơn hàng'
				iconName='search'
				containerStyle={styles.filterView}
				handleChangeForm={onFilterOrder}
			/>
			<LoadingView isLoading={isLoading} title='Đang cập nhật dữ liệu' />
			<View style={styles.contentView}>
				{dataConfirm !== null && dataConfirm.length > 0 &&
					<Tabs.Container
						ref={tabRef}
						renderTabBar={props => (
							<MaterialTabBar
								{...props}
								style={{ margin: 5 }}
								labelStyle={{ fontSize: 14, fontWeight: '700' }}
								indicatorStyle={{ backgroundColor: appcolor.transparent }}
								inactiveColor={appcolor.greylight}
								activeColor={appcolor.red}
								tabStyle={{ margin: 5, borderRadius: 5, backgroundColor: appcolor.surface, minWidth: minWidthTab(tabList), height: 38 }}
								scrollEnabled={true}
							/>
						)}
						containerStyle={{ backgroundColor: appcolor.surface }}>
						{tabList.length > 0 && tabList.map((it, i) => {
							let dataItem = _.filter(dataConfirm, { statusOrder: it.statusOrder })
							const { arr } = groupDataByKey({
								arr: dataItem,
								key: 'date'
							})
							const title = `${it.statusOrder} (${dataItem.length || 0})`
							return (
								<Tabs.Tab key={`iod_${i}`} label={title} name={title} >
									<View style={{ marginTop: 62, padding: 5, width: deviceWidth }}>
										<FlatList
											key={'lstconfirmorder'}
											extraData={arr}
											keyExtractor={(_item, index) => index.toString()}
											data={arr}
											removeClippedSubviews
											renderItem={renderItem}
											showsVerticalScrollIndicator={false}
											refreshControl={<RefreshControl
												refreshing={false}
												onRefresh={LoadData}
											/>}
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
const RenderItemText = ({ type, titleName, itemValue, appcolor, colorByRow = '#000' }) => {
	const colorItem = appcolor.dark
	return (
		<View style={{ width: '100%', height: 'auto' }}>
			<View style={{ width: '90%', padding: 3 }}>
				{type == "Status" && <Text style={{ fontSize: 13, fontWeight: "700", color: appcolor[colorByRow || 'dark'], fontStyle: 'italic' }}>{titleName}{itemValue}</Text>}
				{type == "Header" && <Text style={{ alignSelf: 'center', width: '75%', fontSize: 16, fontWeight: "700", color: colorItem }}>{titleName}{itemValue}</Text>}
				{type == "ShopName" && <Text style={{ width: '100%', fontSize: scaleSize(14), color: colorItem, fontWeight: "600" }}>{titleName}{itemValue}</Text>}
				{type == "Info" && <Text style={{ width: '100%', fontSize: scaleSize(12), color: colorItem }}>{titleName}{itemValue}</Text>}
				{type == "Price" &&
					<NumberFormat
						key='quantity'
						value={itemValue}
						displayType='text'
						thousandSeparator={true}
						renderText={values =>
							<Text style={{ width: '100%', fontSize: scaleSize(12), color: colorItem }}>{titleName}{values}</Text>
						}
					/>
				}
				{type == "PriceNPP" &&
					<NumberFormat
						key='quantity'
						value={itemValue}
						displayType='text'
						thousandSeparator={true}
						renderText={values =>
							<Text style={{ width: '100%', fontSize: scaleSize(12), color: colorItem }}>{titleName}{values}</Text>
						}
					/>
				}
			</View>
		</View>
	)
}