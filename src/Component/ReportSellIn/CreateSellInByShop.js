import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Platform, SafeAreaView, DeviceEventEmitter } from 'react-native';
import FormGroup from '../../Content/FormGroup';
import { Icon, Text } from '@rneui/themed';
import {
	getCategoryByProduct,
	getListProducts,
	getListDealer,
	getStoreBySellIn,
} from '../../Controller/SellInController';
import moment from 'moment';
import { alertConfirm, ConvertToInt, deviceHeight, toCurrency } from '../../Core/Utility';
import { AppNameBuild, mitsuApp, _competitorId, _competitorName } from '../../Core/URLs';
import { useSelector } from 'react-redux';
import { formatNumber, groupDataByKey, ToastError, ToastSuccess, UUIDGenerator } from '../../Core/Helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { HeaderInApp } from '../../Content/HeaderInApp';
import RenderSelectItem from './RenderSelectItem';
import { PhotoInput } from '../SaleExplain/Page/PhotoInput';
import { REPORT } from '../../API/ReportAPI';

const TYPE_STORELIST = 'TYPE_STORELIST';
const TYPE_ORDER_NO = 'TYPE_ORDER_NO';
const TYPE_COMPETITOR = 'TYPE_COMPETITOR';
const TYPE_CATEGORY = 'TYPE_CATEGORY';
const TYPE_DEALER = 'TYPE_DEALER';
const TYPE_PRODUCTS = 'TYPE_PRODUCTS';
const TYPE_QUANTITY = 'TYPE_QUANTITY';
const TYPE_PRICE = 'TYPE_PRICE';
const TYPE_NOTE = 'TYPE_NOTE';
const TYPE_CALENDAR = 'TYPE_CALENDAR';

const titleInput = (type) => {
	let titleName = '';
	switch (type) {
		case TYPE_STORELIST:
			titleName = 'Cửa hàng';
			break;
		case TYPE_COMPETITOR:
			titleName = 'Hãng';
			break;
		case TYPE_CATEGORY:
			titleName = 'Ngành hàng';
			break;
		case TYPE_DEALER:
			titleName = 'Nhà phân phối';
			break;
		case TYPE_PRODUCTS:
			titleName = 'Sản phẩm';
			break;
		case TYPE_ORDER_NO:
			titleName = 'Số hóa đơn';
			break;
		case TYPE_QUANTITY:
			titleName = 'Số lượng';
			break;
		case TYPE_PRICE:
			titleName = 'Giá';
			break;
		case TYPE_NOTE:
			titleName = 'Ghi chú';
			break;
		default:
			titleName = 'UNDERFINED';
			break;
	}
	return titleName;
};
const CreateSellInByShop = ({ navigation, route }) => {
	// Data Start Config
	const defaultTemplate = {
		WorkDate: moment(new Date()).format('YYYYMMDD'),
		DateShow: moment(new Date()).format('YYYY-MM-DD'),
		ShopId: 0,
		ShopName: 'Danh sách cửa hàng',
		OrderNo: 'HD' + moment(new Date()).format('DDMMYY'),
		DealerId: 0,
		DealerName: 'Nhà phân phối',
		CompetitorId: _competitorId,
		CompetitorName: _competitorName,
		CategoryId: 0,
		CategoryName: 'Ngành hàng',
		ProductId: 0,
		ProductName: 'Sản phẩm',
		ProductPrice: 0,
		Quantity: '',
		Price: '',
		Notes: '',
	};
	const { appcolor, kpiinfo } = useSelector((state) => state.GAppState);
	const [mainData, setMainData] = useState({});
	//..
	const [itemSave, setItemSave] = useState(defaultTemplate);
	const [dataModalBS, setDataModalBS] = useState({ data: [], typeSelect: '', dataAll: [] });
	const [dataModalMain, setDataModalMain] = useState([]);
	const [dataProduct, setDataProduct] = useState({ listProduct: [], listSelect: [], listProductM: [] });
	const [photoData, setPhotoData] = useState({ guid: UUIDGenerator(), listPhoto: [] });
	const { listReport, priceValue } = route.params;
	console.log('listReport', listReport)

	const LoadDataCreate = async () => {
		let dataMain = {};
		const lstStore = await getStoreBySellIn();
		const lstDealer = await getListDealer();
		const lstCategory = await getCategoryByProduct();
		const lstProducts = await getListProducts();
		const { arr } = groupDataByKey({
			arr: [...lstProducts],
			key: 'categoryId',
			keyLayer2: 'subCatId'
		});
		dataMain = {
			dataStore: lstStore,
			dataCategory: lstCategory,
			dataProduct: arr,
			dataDealer: lstDealer,
		};
		if (itemSave.ShopName == 'Danh sách cửa hàng' && listReport.shopName !== undefined) {
			itemSave.ShopName = listReport.shopName
		}
		if (route?.params?.itemSave?.ShopId > 0) {
			itemSave.ShopId = route.params.itemSave.ShopId
			itemSave.ShopName = route.params.itemSave.ShopName || itemSave.ShopName
		}
		if (itemSave.DealerName == 'Nhà phân phối' && listReport.dealerName !== undefined) {
			itemSave.DealerName = listReport.dealerName
		}

		if (lstDealer?.length > 0 && lstDealer?.length == 1) {
			itemSave.DealerId = lstDealer[0].id
			itemSave.DealerName = lstDealer[0].name
		}
		dataProduct.listProduct?.length === 0 &&
			listReport.isMultiProduct === 1 &&
			(await setDataProduct({ ...dataProduct, listProduct: arr, listProductM: [...arr] }));
		await setMainData(dataMain);
		await setItemSave({ ...itemSave });

	};
	const handlerChangeItem = async (typeView) => {
		let jsonModal = { data: [], typeSelect: '', dataAll: [] };
		let dataModal = [];
		switch (typeView) {
			case TYPE_STORELIST:
				jsonModal = {
					data: mainData.dataStore,
					typeSelect: typeView,
					dataAll: dataProduct.listProduct,
				};
				dataModal = mainData.dataStore;
				dataModalBS.data = mainData.dataStore;
				dataModalBS.typeSelect = typeView;
				dataModalBS.dataAll = dataProduct.listProduct;
				await setDataModalMain(mainData.dataStore);
				break;
			case TYPE_DEALER:
				jsonModal = {
					data: mainData.dataDealer,
					typeSelect: typeView,
					dataAll: dataProduct.listProduct,
				};
				dataModalBS.data = mainData.dataDealer;
				dataModalBS.typeSelect = typeView;
				dataModalBS.dataAll = dataProduct.listProduct;
				dataModal = mainData.dataDealer;
				await setDataModalMain(mainData.dataDealer);
				break;
			case TYPE_COMPETITOR:
				jsonModal = {
					data: mainData.dataCompetitor,
					typeSelect: typeView,
					dataAll: dataProduct.listProduct,
				};
				dataModalBS.data = mainData.dataCompetitor;
				dataModalBS.typeSelect = typeView;
				dataModalBS.dataAll = dataProduct.listProduct;
				dataModal = mainData.dataCompetitor;
				setDataModalMain(mainData.dataCompetitor);
				break;
			case TYPE_CATEGORY:
				jsonModal = {
					data: mainData.dataCategory,
					typeSelect: typeView,
					dataAll: dataProduct.listProduct,
				};
				dataModalBS.data = mainData.dataCategory;
				dataModalBS.typeSelect = typeView;
				dataModalBS.dataAll = dataProduct.listProduct;
				dataModal = mainData.dataCategory;
				setDataModalMain(mainData.dataCategory);
				break;
			case TYPE_PRODUCTS:
				let lstProduct = [];
				if (listReport.isMultiProduct === 1) {
					lstProduct = dataProduct.listProduct?.filter(
						(i) =>
							itemSave.CategoryId == 0 ||
							(i.categoryId == itemSave.CategoryId &&
								i.competitorId == itemSave.CompetitorId)
					);
				} else {
					lstProduct = mainData.dataProduct.filter(
						(i) =>
							itemSave.CategoryId == 0 ||
							(i.categoryId == itemSave.CategoryId &&
								i.competitorId == itemSave.CompetitorId)
					);
				}
				jsonModal = {
					data: lstProduct,
					typeSelect: typeView,
					dataAll: dataProduct.listProduct,
				};
				dataModalBS.data = lstProduct;
				dataModalBS.typeSelect = typeView;
				dataModalBS.dataAll = dataProduct.listProduct;

				const categoryByStore = JSON.parse(route?.params?.itemSave?.ListCategory || '[]')
				// dataModal = mainData.dataProduct;
				dataModal = [
					{
						dataProduct: mainData.dataProduct,
						dataCategory: categoryByStore.length > 0 ? categoryByStore : mainData.dataCategory,
					},
				];
				await setDataModalMain(mainData.dataProduct);
				break;
			case TYPE_CALENDAR:
				jsonModal = { data: [], typeSelect: typeView, dataAll: dataProduct.listProduct };
				dataModalBS.data = [];
				dataModalBS.typeSelect = typeView;
				dataModalBS.dataAll = [];
				dataModal = [];
				await setDataModalMain([]);
				break;
		}
		await navigation.navigate('itemproductssellin', {
			isChange: 0,
			dataModalBS: jsonModal,
			styles: styles,
			listReport: listReport,
			dataModalMain: dataModal,
			dataProduct: dataProduct,
			mainData: mainData,
			itemSave: itemSave,
			typeSelect: jsonModal.typeSelect,
		});
	};
	const handlerTextChange = async (typeInput, value) => {
		await setItemSave({ ...itemSave, [typeInput]: value });
	};

	const handlerGetNumberValue = (value) => {
		if (value === null || value === undefined || value === '') return 0;
		return ConvertToInt(`${value}`.replace(/,/g, '')) || 0;
	};

	const handlerGetAmountValue = (quantity, price, originalPrice) => {
		const quantityValue = handlerGetNumberValue(quantity);
		const priceValue = handlerGetNumberValue(price) || handlerGetNumberValue(originalPrice);
		return quantityValue * priceValue;
	};

	const handlerGetTotalAmountValue = (listProduct = []) => {
		return (listProduct || []).reduce((total, item) => {
			return total + handlerGetAmountValue(item.quantityValue, item.priceValue, item.price);
		}, 0);
	};

	const handlerAddImage = (listPhoto) => {
		setPhotoData((currentPhoto) => ({ ...currentPhoto, listPhoto }));
	};


	const handlerUploadDataRaw = async (itemUpload) => {
		return await REPORT.UploadDataRaw_Realtime(
			itemUpload,
			{ shopId: itemSave.ShopId, auditDate: itemSave.WorkDate },
			kpiinfo.id
		);
	};

	const handlerValidatePhoto = () => {
		if (listReport.isCheckIMG != 1) return true;
		const numIMG = Number(listReport.numIMG || 0);
		if (numIMG > 0 && (photoData.listPhoto || []).length < numIMG) {
			ToastError(`Bạn cần chụp tối thiểu ${numIMG} hình ảnh`, 'Thông báo', 'top');
			return false;
		}
		return true;
	};

	const handlerConfirmAlertSave = (onConfirm) => {
		if (listReport.isAlertSave == 1) {
			alertConfirm(
				'Thông báo',
				'Đơn đã gửi không thể chỉnh sửa, bạn kiểm tra đơn',
				onConfirm,
				() => { },
				'Đồng ý',
				'Không'
			);
			return;
		}
		onConfirm();
	};

	const handlerSaveItem = async () => {
		const { Quantity, Price } = itemSave;
		const itemQuantity = Quantity.length > 0 ? ConvertToInt(Quantity.replace(/,/g, '')) : '';
		const itemPrice = Price.length > 0 ? ConvertToInt(Price.replace(/,/g, '')) : '';
		if (itemSave.ShopId == 0) {
			ToastError('Bạn chưa chọn cửa hàng');
			return;
		}
		if (itemSave.DealerId == 0) {
			ToastError('Bạn chưa chọn nhà phân phối');
			return;
		}
		if (itemSave.ProductId == 0) {
			ToastError('Bạn chưa chọn sản phẩm');
			return;
		}

		if (Quantity.length === 0 || itemQuantity == 0) {
			ToastError('Số lượng phải lớn hơn 0');
			return;
		}
		if (AppNameBuild === mitsuApp || listReport.isCheckPrice === 1) {
			if (Price.length == 0 || itemPrice == 0 || itemPrice % 1000 !== 0) {
				ToastError('Giá phải lớn hơn 0đ,hoặc bội số tối thiếu 1000đ');
				return;
			}
		}
		if (!handlerValidatePhoto()) return;

		const dataSellIn = {
			shopId: itemSave.ShopId,
			workDate: itemSave.WorkDate,
			orderNo: itemSave.OrderNo,
			dealerId: itemSave.DealerId,
			productId: itemSave.ProductId,
			competitorId: itemSave.CompetitorId,
			categoryId: itemSave.CategoryId,
			quantityValue: itemQuantity,
			priceValue: itemPrice,
			notes: itemSave.Notes,
			guid: photoData.guid,
			isUploaded: 0,
		};
		handlerConfirmAlertSave(async () => {
			const result = await handlerUploadDataRaw([dataSellIn]);
			if (result.statusId == 200) {
				DeviceEventEmitter.emit('RELOAD_DATA_SELLIN');
				ToastSuccess(result.messager, 'Đã gửi', 'top');
				setPhotoData({ guid: UUIDGenerator(), listPhoto: [] });
				setItemSave({
					...itemSave,
					productId: 0,
					ProductName: 'Sản phẩm',
					ProductPrice: 0,
					CategoryId: 0,
					CategoryName: 'Ngành hàng',
					Quantity: '',
					Notes: '',
					Price: '',
				});
			} else {
				ToastError(result.messager, 'Lỗi', 'top');
			}
		});
	};

	const handlerSaveMultiItem = async () => {
		if (itemSave.ShopId == 0) {
			ToastError('Bạn chưa chọn cửa hàng');
			return;
		}
		if (itemSave.DealerId == 0) {
			ToastError('Bạn chưa chọn nhà phân phối');
			return;
		}
		if (dataProduct.listSelect?.length === 0) {
			ToastError('Bạn chưa chọn sản phẩm');
			return;
		}
		let items =
			listReport.isUsePercent == 1
				? dataProduct.listProduct.filter(
					(it) =>
						(it.quantityValue === 'null' ||
							it.quantityValue === null ||
							it.quantityValue === undefined ||
							it.quantityValue === 'undefined' ||
							it.quantityValue == 0) &&
						it.percentValue !== 'null' &&
						it.percentValue !== null &&
						it.percentValue !== 'undefined' &&
						it.percentValue !== undefined &&
						it.percentValue > 0
				)
				: dataProduct.listProduct.filter(
					(it) =>
						(it.quantityValue === 'null' ||
							it.quantityValue === null ||
							it.quantityValue === undefined ||
							it.quantityValue === 'undefined' ||
							it.quantityValue == 0) &&
						it.priceValue !== 'null' &&
						it.priceValue !== null &&
						it.priceValue !== 'undefined' &&
						it.priceValue !== undefined &&
						it.priceValue > 0
				);

		if (items.length > 0) {
			if (listReport.isUsePercent == 1) {
				ToastError(
					'Bạn đã nhập % nhưng chưa nhập số lượng. sản phẩm: ' + items[0].name,
					'Thông báo',
					'top'
				);
			} else {
				ToastError(
					'Bạn đã nhập giá nhưng chưa nhập số lượng. sản phẩm: ' + items[0].name,
					'Thông báo',
					'top'
				);
			}
			return;
		}

		if (AppNameBuild === mitsuApp || listReport.isCheckPrice === 1) {
			let checkPrice = dataProduct.listProduct.filter(
				(it) =>
					it.quantityValue !== 'null' &&
					it.quantityValue !== null &&
					it.quantityValue !== undefined &&
					it.quantityValue !== 'undefined' &&
					it.quantityValue > 0 &&
					(it.priceValue === 'null' ||
						it.priceValue === null ||
						it.priceValue === 'undefined' ||
						it.priceValue === undefined ||
						it.priceValue == 0 ||
						it.priceValue?.length == 0 ||
						it.priceValue % 1000 !== 0)
			);
			if (checkPrice.length > 0) {
				ToastError(
					'Giá phải lớn hơn 0đ, hoặc bội số tối thiếu 1000đ. sản phẩm: ' +
					checkPrice[0].name,
					'Thông báo',
					'top'
				);
				return;
			}
		}
		if (!handlerValidatePhoto()) return;

		const dataUpload = dataProduct.listSelect.map((it) => ({
			...it,
			shopId: itemSave.ShopId,
			workDate: itemSave.WorkDate,
			orderNo: itemSave.OrderNo,
			dealerId: itemSave.DealerId,
			notes: itemSave.Notes,
			guid: photoData.guid,
			isUploaded: 0,
			productId: it.id,
			priceValue: !it.priceValue ? '' : it.priceValue,
		}));
		handlerConfirmAlertSave(async () => {
			const result = await handlerUploadDataRaw(dataUpload);
			if (result.statusId != 200) {
				ToastError(result.messager, 'Lỗi', 'top');
				return;
			}
			DeviceEventEmitter.emit('RELOAD_DATA_SELLIN');
			ToastSuccess('Đã gửi các sản phẩm', 'Đã gửi', 'top');
			setPhotoData({ guid: UUIDGenerator(), listPhoto: [] });
			dataProduct.listSelect = [];
			const productByStore = JSON.parse(itemSave.ListProduct || '[]')
			dataProduct.listProduct = productByStore.length > 0 ? [...productByStore] : [...dataProduct.listProductM]
			mainData.dataProduct = productByStore.length > 0 ? [...productByStore] : [...dataProduct.listProductM]

			await setItemSave({
				...itemSave,
				productId: 0,
				ProductName: 'Sản phẩm',
				ProductPrice: 0,
				CategoryId: 0,
				CategoryName: 'Ngành hàng',
				Quantity: '',
				Notes: '',
				Price: '',
			});
		});
	};
	useEffect(() => {
		LoadDataCreate();
		return () => false;
	}, []);

	useEffect(() => {
		if (
			route?.params?.dataProduct?.listProduct?.length > 0 &&
			dataModalBS.typeSelect === TYPE_PRODUCTS &&
			listReport.isMultiProduct === 1
		) {
			let list = route?.params?.dataProduct?.listProduct.filter(
				(it) => it.quantityValue > 0 || it.priceValue > 0 || it.percentValue > 0
			);
			const { arr } = groupDataByKey({
				arr: list,
				key: 'categoryId',
				keyLayer2: 'subCatId'
			});
			setDataProduct({
				...dataProduct,
				listProduct: route?.params?.dataProduct?.listProduct,
				listSelect: arr,
			});
		}
		// LoadDataCreate()
		return () => false;
	}, [route?.params?.isChange, route?.params]);

	useEffect(() => {
		switch (dataModalBS.typeSelect) {
			case TYPE_CALENDAR:
				setItemSave({
					...itemSave,
					WorkDate: route?.params?.itemSave?.WorkDate,
					DateShow: route?.params?.itemSave?.DateShow,
				});
				break;
			case TYPE_STORELIST:
				const productByStore = JSON.parse(route?.params?.itemSave?.ListProduct || '[]')
				if (productByStore.length > 0) {
					dataProduct.listProduct = productByStore || [];
					mainData.dataProduct = productByStore || [];
					dataProduct.listSelect = []
				} else {
					dataProduct.listProduct = dataProduct.listProductM || []
					mainData.dataProduct = dataProduct.listProductM || []
					dataProduct.listSelect = []
				}
				// dataProduct.listProduct
				setItemSave({
					...itemSave,
					ShopId: route?.params?.itemSave?.ShopId,
					ShopName: route?.params?.itemSave?.ShopName,
					DealerId: route?.params?.itemSave?.DealerId,
					DealerName: route?.params?.itemSave?.DealerName,
					ListProduct: route?.params?.itemSave?.ListProduct,
					ListCategory: route?.params?.itemSave?.ListCategory
				});
				break;
			case TYPE_DEALER:
				setItemSave({
					...itemSave,
					DealerId: route?.params?.itemSave?.DealerId,
					DealerName: route?.params?.itemSave?.DealerName,
				});
				break;
			case TYPE_CATEGORY:
				setItemSave({
					...itemSave,
					CategoryId: route?.params?.itemSave?.CategoryId,
					CategoryName: route?.params?.itemSave?.CategoryName,
				});
				break;
			case TYPE_PRODUCTS:
				if (listReport.isMultiProduct !== 1) {
					setItemSave({
						...itemSave,
						CategoryId: route?.params?.itemSave?.CategoryId,
						CategoryName: route?.params?.itemSave?.CategoryName,
						ProductId: route?.params?.itemSave?.ProductId,
						ProductName: route?.params?.itemSave?.ProductName,
						ProductPrice: route?.params?.itemSave?.ProductPrice || 0,
					});
				}
				break;
		}
		return () => false;
	}, [route?.params?.itemSave]);

	const styles = StyleSheet.create({
		mainContainer: {
			flex: 1,
			backgroundColor: appcolor.primary,
			zIndex: 10,
			paddingTop: Platform.OS === 'ios' ? 0 : 56,
		},
		buttonContainer: { borderRadius: 10, zIndex: 1000 },
		contentStyles: { width: '100%', height: '100%', backgroundColor: appcolor.surface },
		selectStyle: {
			flexDirection: 'row',
			alignSelf: 'center',
			alignItems: 'center',
			padding: 7,
		},
		bottomContainer: { width: '98%', height: 'auto', alignSelf: 'center' },
		modalStyle: { width: '100%', padding: 12 },

		inputStyle: {
			width: '100%',
			backgroundColor: appcolor.light,
			borderWidth: 0.5,
			borderColor: appcolor.grey,
			borderRadius: 5,
			padding: 5,
		},
		photoContainer: { paddingHorizontal: 4 },
		amountBox: { marginTop: 8, borderRadius: 8, borderWidth: 1, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, paddingHorizontal: 12, paddingVertical: 10 },
		amountText: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: appcolor.primary, textAlign: 'right' },
		listProductHeader: { padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
		listProductTitle: { flex: 1, fontWeight: '800', fontSize: 16, lineHeight: 22, color: appcolor.dark },
		categoryHeader: { padding: 8, flexDirection: 'row', alignItems: 'center' },
		categoryName: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '800', color: appcolor.dark },
		productSelectCard: { flex: 1, padding: 8, backgroundColor: appcolor.light, borderRadius: 5, marginBottom: 5 },
		productSelectRow: { flexDirection: 'row', alignItems: 'center' },
		productSelectNameBox: { flex: 4 / 7 },
		productSelectName: { fontSize: 10, lineHeight: 14, fontWeight: '500', color: appcolor.dark },
		productSelectInfoBox: { flex: 3 / 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' },
		productSelectInfo: { fontSize: 10, lineHeight: 14, fontWeight: '500', color: appcolor.dark },
		productSelectAmount: { marginTop: 4, fontSize: 11, lineHeight: 16, fontWeight: '700', color: appcolor.primary, textAlign: 'right' },
		totalAmountValue: { marginLeft: 8, fontSize: 14, lineHeight: 18, fontWeight: '700', color: appcolor.primary },
	});

	const RenderProductSelect = ({ item, index }) => {
		const amountValue = handlerGetAmountValue(item.quantityValue, item.priceValue, item.price)
		return (
			<View>
				{item.isParent && (
					<View style={styles.categoryHeader}>
						<Text style={styles.categoryName}>
							{item.categoryName}
						</Text>
					</View>
				)}
				<View style={styles.productSelectCard}>
					<View style={styles.productSelectRow}>
						<View style={styles.productSelectNameBox}>
							<Text style={styles.productSelectName}>
								{item.name}
							</Text>
						</View>
						<View style={styles.productSelectInfoBox}>
							<Text style={styles.productSelectInfo}>
								Số lượng : {item.quantityValue || 0}
							</Text>
							{item.priceValue !== undefined &&
								item.priceValue !== null &&
								item.priceValue > 0 &&
								listReport.isUsePercent !== 1 && (
									<Text style={styles.productSelectInfo}>
										{' '}
										- Giá : {toCurrency(item.priceValue || '')}
									</Text>
								)}
							{item.percentValue !== undefined &&
								item.percentValue !== null &&
								item.percentValue > 0 &&
								listReport.isUsePercent == 1 && (
									<Text style={styles.productSelectInfo}>
										{' '}
										- {item.percentValue || ''}%
									</Text>
								)}
						</View>
					</View>
					{amountValue > 0 && listReport.isUsePercent !== 1 && (
						<Text style={styles.productSelectAmount}>
							{`Thành tiền: ${toCurrency(amountValue)}`}
						</Text>
					)}
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.mainContainer}>
			<HeaderInApp
				title="Thêm đơn hàng"
				leftFunc={() => navigation.goBack()}
				// leftFunc={resultEvent}
				rightFunc={() =>
					listReport.isMultiProduct !== 1 ? handlerSaveItem() : handlerSaveMultiItem()
				}
				iconRight="save"
				iconLeft="close"
			/>
			<KeyboardAwareScrollView
				enableOnAndroid
				showsVerticalScrollIndicator={false}
				style={{
					width: '100%',
					height: deviceHeight,
					borderBottomLeftRadius: 20,
					borderBottomRightRadius: 20,
				}}
				extraHeight={120}
			>
				<View
					style={{
						backgroundColor: appcolor.surface,
						padding: 8,
						borderRadius: 10,
						margin: 5,
						marginBottom: 10,
					}}
				>
					<FormGroup
						title={titleInput(TYPE_ORDER_NO)}
						multiline
						key="orderno"
						useClearAndroid={false}
						containerStyle={{
							width: '100%',
							backgroundColor: appcolor.light,
							borderRadius: 5,
							padding: 5,
							marginBottom: 5,
						}}
						value={itemSave.OrderNo}
						handleChangeForm={(values) => handlerTextChange('OrderNo', values)}
						editable
					/>
					<RenderSelectItem
						appcolor={appcolor}
						typeView={TYPE_CALENDAR}
						styles={styles}
						selectValue={itemSave.DateShow}
						onPress={handlerChangeItem}
					/>
					<RenderSelectItem
						appcolor={appcolor}
						typeView={TYPE_COMPETITOR}
						styles={styles}
						selectValue={itemSave.CompetitorName}
					/>
					<RenderSelectItem
						appcolor={appcolor}
						typeView={TYPE_STORELIST}
						styles={styles}
						selectValue={itemSave.ShopName}
						onPress={handlerChangeItem}
					/>
					{
						(itemSave.ShopId > 0) &&
						<RenderSelectItem
							appcolor={appcolor}
							typeView={TYPE_DEALER}
							styles={styles}
							selectValue={itemSave.DealerId !== 0 ? `Nhà phân phối : ${itemSave.DealerName}` : itemSave.DealerName}
							onPress={handlerChangeItem}
						/>
					}
					{
						((itemSave.ShopId > 0) && listReport.isMultiProduct !== 1)
						&&
						<RenderSelectItem
							appcolor={appcolor}
							typeView={TYPE_CATEGORY}
							styles={styles}
							selectValue={itemSave.CategoryName}
							onPress={handlerChangeItem}
						/>
					}
					{
						(itemSave.ShopId > 0) &&
						<RenderSelectItem
							appcolor={appcolor}
							typeView={TYPE_PRODUCTS}
							styles={styles}
							selectValue={itemSave.ProductName}
							onPress={handlerChangeItem}
						/>
						}
						{((itemSave.ShopId > 0) && listReport.isMultiProduct === 1) && (
								<View>
									{dataProduct.listSelect.length > 0 && (
										<View style={styles.listProductHeader}>
											<Text style={styles.listProductTitle}>
												Danh sách sản phẩm đã nhập
											</Text>
											{listReport.isUsePercent !== 1 && (
												<Text style={styles.totalAmountValue}>
													{toCurrency(handlerGetTotalAmountValue(dataProduct.listSelect)) || '0'}
												</Text>
											)}
										</View>
									)}

								{
								dataProduct.listSelect?.length > 0 &&
								dataProduct.listSelect.map((item, index) => {
									return (
										<RenderProductSelect key={`ProductSelect_${item.id}`} item={item} index={index} />
									)
								})
							}

							{/* <FlatList
								scrollEnabled={false}
								key="listProductSelect"
								keyExtractor={(_, index) => index.toString()}
								data={dataProduct.listSelect}
								initialNumToRender={20}
								renderItem={renderProductSelect}
							/> */}
						</View>
					)}
					{/* Input View */}
					{((itemSave.ShopId > 0) && listReport.isMultiProduct !== 1) && (
						<FormGroup
							editable
							title={titleInput(TYPE_QUANTITY)}
							keyboardType="numeric"
							key="quantity"
							useClearAndroid={false}
							placeholderTextColor={appcolor.placeholderText}
							placeholder="Số lượng"
							containerStyle={{ ...styles.inputStyle, marginTop: 8 }}
							inputStyle={{ textAlign: 'right' }}
							value={formatNumber(itemSave.Quantity, ',')}
							handleChangeForm={(values) => handlerTextChange('Quantity', values)}
						/>
					)}
					{((itemSave.ShopId > 0) && listReport.isMultiProduct !== 1) && (
						<FormGroup
							title={titleInput(TYPE_PRICE)}
							editable
							keyboardType="numeric"
							key="price"
							placeholderTextColor={appcolor.placeholderText}
							placeholder="Giá nhập"
							useClearAndroid={false}
							containerStyle={styles.inputStyle}
							inputStyle={{ textAlign: 'right' }}
							value={formatNumber(itemSave.Price, ',')}
							handleChangeForm={(values) => handlerTextChange('Price', values)}
						/>
					)}
					<FormGroup
						editable
						title={titleInput(TYPE_NOTE)}
						multiline
						useClearAndroid={false}
						key="notes"
						placeholderTextColor={appcolor.placeholderText}
						placeholder="Ghi chú"
						containerStyle={styles.inputStyle}
						value={itemSave.Notes}
						handleChangeForm={(values) => handlerTextChange('Notes', values)}
					/>
						{itemSave.ShopId > 0 && listReport.isCheckIMG == 1 && (
							<View style={styles.photoContainer}>
								<PhotoInput
									key={photoData.guid}
									_guid={photoData.guid}
									enableTakePhoto
									shopId={itemSave.ShopId}
									shopCode={itemSave.ShopId}
									photoType="SELLIN"
									photoDate={itemSave.WorkDate}
									listPhoto={photoData.listPhoto}
									handlerAddImage={handlerAddImage}
								/>
							</View>
						)}
					<View style={{ height: deviceHeight / 3 }} />
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	);
};

export default CreateSellInByShop;
