import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import moment from "moment";
import { WorkingPlanAPI } from "../../../API/WorkingPlanApi";
import { Icon, Text } from '@rneui/themed';
import LinearGradient from "react-native-linear-gradient";
import { alertConfirm, deviceHeight, deviceWidth } from "../../../Core/Utility";
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { ViewSummaryConfirm } from "../Control/DetailDataConfirm/Page/ViewSummaryConfirm";
import { UtilityOffice } from "../Control/UtilityOffice";
import { ConfirmOT } from "../Control/DetailDataConfirm/Page/ConfirmOT";
import { ConfirmLate } from "../Control/DetailDataConfirm/Page/ConfirmLate";
import { ConfirmEarlier } from "../Control/DetailDataConfirm/Page/ConfirmEarlier";
import { ConfirmOFF } from "../Control/DetailDataConfirm/Page/ConfirmOFF";
import { ToastSuccess, removeVietnameseTones } from "../../../Core/Helper";
import { LoadingView } from "../../../Control/ItemLoading";
import FormGroup from "../../../Content/FormGroup";
import _ from 'lodash';
import { SearchData } from "../../../Control/SearchData/SearchData";

export const ConfirmPlanOffice = ({ navigation }) => {
	const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
	const [isLoading, setLoading] = useState(false)
	const [isWaiting, setWaiting] = useState(false)
	const [dataConfirm, setDataConfirm] = useState([])
	const [dataMain, setDataMain] = useState([])
	const [dataConfirmByEmployee, setDataConfirmByEmployee] = useState([])
	const [itemConfirm, setItemConfirm] = useState({})
	const [errorValueUpload, setErrorValueUpload] = useState(null)

	//
	const LoadDataConfirm = async (_year, _month) => {
		await setLoading(true)
		const yearValue = _year || moment().year()
		const monthValue = _month || (moment().month() + 1)
		//
		const result = await WorkingPlanAPI.GetPlanOfficeConfirm(yearValue, monthValue)
		if (result.statusId == 200) {
			await setDataConfirm(result.data)
			await setDataMain(result.data)
		}
		await setLoading(false)
	}
	const GetDetailByDay = async (item, date) => {
		const _itemdetails = { ...item, Date: date }
		await WorkingPlanAPI.OfficeDetailByConfirm(_itemdetails, async (mData) => {
			await setDataConfirmByEmployee(mData)
		})
	}
	const onSendConfirm = async () => {
		let listEmployees = null
		if (dataConfirmByEmployee !== null && dataConfirmByEmployee.length > 0) {
			for (let index = 0; index < dataConfirmByEmployee.length; index++) {
				const item = dataConfirmByEmployee[index];
				listEmployees = item.employeeId
				if (item.isValidData) {
					setErrorValueUpload(`Vui lòng cập nhật đầy đủ dữ liệu bắt buộc bên dưới trước khi gửi lên hệ thống`)
					return
				}
			}
			setErrorValueUpload(null)
			alertConfirm('Gửi dữ liệu', 'Bạn có chắc chắn với các xác nhận yêu cầu thay đổi bên dưới không ?', async () => {
				await WorkingPlanAPI.ConfirmPlanOffice(listEmployees, dataConfirmByEmployee, async (result) => {
					ToastSuccess(result.messeger, 'Thông báo', 'top')
					if (result.status == 200) {
						SheetManager.hide('confirmoffice')
						await LoadDataConfirm()
					}
				})
			})
		}
	}
	// Handler
	const handlerConfirmItem = (item, itemMain) => {
		setWaiting(true)
		SheetManager.show('confirmoffice')
		setTimeout(async () => {
			const _itemconfirm = { ...item, date: itemMain.date, dateView: itemMain.dateView }
			await setItemConfirm(_itemconfirm)
			await GetDetailByDay(item, itemMain.date)
			setWaiting(false)
		}, 500)
	}
	const handlerBackConfirm = () => {
		SheetManager.hide('confirmoffice')
	}
	const handlerSearch = (text) => {
		const _valueSearch = removeVietnameseTones(text)
		const _searchlist = _.filter(dataMain, (e) => {
			return removeVietnameseTones(e.dateView).toLowerCase().match(_valueSearch.toLowerCase()) ||
				removeVietnameseTones(e.dataEmployee).toLowerCase().match(_valueSearch.toLowerCase())
		})
		setDataConfirm(_searchlist)
	}
	//
	useEffect(() => {
		const _loadconfirm = LoadDataConfirm()
		return () => _loadconfirm
	}, [])
	// View 
	const renderItem = ({ item, index }) => {
		const dataByEmployee = JSON.parse(item.dataEmployee || '[]')
		return (
			<View key={`qpw_p${index}`}>
				<Text style={styles.titleDate}>{item.dateView}</Text>
				<View style={styles.summaryMain} >
					<LinearGradient start={{ x: 0.2, y: 0 }} end={{ x: 1, y: 0 }} colors={[appcolor.surface, appcolor.primary + '15']} style={styles.linearGradient}>
						<ViewSummaryConfirm
							itemMain={item}
							dataSummary={dataByEmployee}
							actionSelected={handlerConfirmItem}
						/>
					</LinearGradient>
				</View>
			</View>
		)
	}
	const renderPageView = () => {
		const itemView = (item) => {
			const dataDetail = JSON.parse(item.dataDetail || '[]')
			switch (item.typePage) {
				case UtilityOffice.typeOT:
					return <ConfirmOT dataDetail={dataDetail} itemMain={item} />
				case UtilityOffice.typeOFF:
					return <ConfirmOFF dataDetail={dataDetail} itemMain={item} />
				case UtilityOffice.typeLATE:
					return <ConfirmLate dataDetail={dataDetail} itemMain={item} />
				case UtilityOffice.typeEARLIER:
					return <ConfirmEarlier dataDetail={dataDetail} itemMain={item} />
				default:
					return null
			}
		}
		return (
			dataConfirmByEmployee !== null && dataConfirmByEmployee.length > 0 &&
			dataConfirmByEmployee.map((item, index) => {
				return (
					<View key={`pid_${index}`} style={{ width: deviceWidth }} >
						{itemView(item)}
					</View>
				)
			})
		)
	}
	const styles = StyleSheet.create({
		mainContainer: { flex: 1, backgroundColor: appcolor.light },
		contentMain: { padding: 8, backgroundColor: appcolor.light },
		titleDate: { fontSize: 14, fontWeight: '700', fontStyle: 'italic', color: appcolor.blacklight },
		summaryMain: { width: '100%', padding: 8 },
		linearGradient: { width: '100%', borderRadius: 8, alignSelf: 'center', padding: 8, overflow: 'hidden' },
		itemMain: { width: deviceWidth / 4.5, padding: 8, alignSelf: 'center', alignItems: 'center' },
		subTitleView: { fontSize: 13, fontWeight: '500', color: appcolor.greylight },
		titleChangeType: { fontSize: 13, fontWeight: '700', color: appcolor.blacklight },
		titleChangeValue: { fontSize: 12, fontWeight: '500', color: appcolor.greylight },
		backMain: { position: 'absolute', bottom: 56, width: deviceWidth - 16, padding: 8, alignItems: 'center', marginTop: 8 },
		backRegisterView: { backgroundColor: appcolor.blacklight, padding: 8, borderRadius: 20 },
		titleSheet: { fontSize: 18, fontWeight: '700', color: appcolor.blacklight, fontStyle: 'italic' },
		errorUploadTitle: { width: deviceWidth - 16, fontSize: 12, fontWeight: '400', color: appcolor.red, fontStyle: 'italic', padding: 8 },
		titleEmployeeSheet: { fontSize: 14, fontWeight: '500', color: appcolor.greylight, fontStyle: 'italic', marginTop: 3 },
		contentViewConfirm: { width: deviceWidth - 16, padding: 8 },
		viewActionUpload: { minWidth: 60, padding: 8, backgroundColor: appcolor.blacklight, borderRadius: 25 },
		searchContainer: { margin: 8, padding: 3, backgroundColor: appcolor.light, borderRadius: 20, borderColor: appcolor.grey },
		searchInput: { fontSize: 13, fontWeight: '500', color: appcolor.blacklight }
	})
	return (
		<View style={styles.mainContainer}>
			<HeaderCustom
				title={kpiinfo.menuNameVN || 'Xác nhận công'}
				leftFunc={() => navigation.goBack()}
				iconRight='clipboard-check'
				rightFunc={() => { console.log('Xác nhận tất cả yêu cầu') }}

			/>
			<SearchData
				placeholder='Tìm kiếm ...'
				onSearchData={handlerSearch}
			/>
			<LoadingView isLoading={isLoading} title='Đang cập nhật dữ liệu' />
			<View style={styles.contentMain}>
				<FlatList
					keyExtractor={(_item, index) => index.toString()}
					data={dataConfirm}
					renderItem={renderItem}
					showsVerticalScrollIndicator={false}
					ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 3 }} />}
					refreshControl={<RefreshControl refreshing={false} onRefresh={LoadDataConfirm} />}
				/>
			</View>
			<ActionSheet id="confirmoffice"
				gestureEnabled
				drawUnderStatusBar
				statusBarTranslucent={false}
				safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
				containerStyle={{ width: '100%', height: deviceHeight / 2, backgroundColor: appcolor.light }}
			>
				<SafeAreaView style={{ width: '100%', height: deviceHeight / 2, margin: 8 }}>
					<Text style={styles.titleSheet}>{itemConfirm.dateView}</Text>
					<Text style={styles.titleEmployeeSheet}>{`${itemConfirm.EmployeeCode} - ${itemConfirm.EmployeeName}`}</Text>
					{errorValueUpload && <Text style={styles.errorUploadTitle}>* {errorValueUpload}</Text>}
					<View style={styles.contentViewConfirm}>
						{!isWaiting && renderPageView()}
					</View>
					<TouchableOpacity style={styles.backMain} onPress={handlerBackConfirm}>
						<View style={styles.backRegisterView}>
							<Icon name="close" size={21} color={appcolor.light} />
						</View>
					</TouchableOpacity>
					<View style={{ position: 'absolute', end: 16, zIndex: 10 }}>
						{isWaiting ?
							<ActivityIndicator style={{ top: 8 }} />
							:
							<TouchableOpacity onPress={onSendConfirm} style={styles.viewActionUpload}>
								<Icon type="font-awesome-5" name="cloud-upload-alt" size={18} color={appcolor.light} />
							</TouchableOpacity>
						}
					</View>
				</SafeAreaView>
			</ActionSheet>
		</View >
	)
}