import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, TextInput, SafeAreaView, Platform } from 'react-native';
import FormGroup from '../../Content/FormGroup';
import { Icon, Text, Avatar } from '@rneui/themed';
import moment from 'moment';
import { alertWarning, deviceHeight } from '../../Core/Utility';
import { Calendar } from 'react-native-calendars';
////import { NumericFormat } from "react-number-format";;
import { AppNameBuild, psvApp, _competitorId, _competitorName } from '../../Core/URLs';
import { useSelector } from 'react-redux';
import { Message, formatNumber, groupDataByKey, removeVietnameseTones } from '../../Core/Helper';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { HeaderInApp } from '../../Content/HeaderInApp';
import _ from 'lodash';
import CustomListView from '../../Control/Custom/CustomListView';
import { CommonActions } from '@react-navigation/native';

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
const ItemProductsSellIn = ({ navigation, route }) => {
	// Data Start Config
	const { appcolor, kpiinfo } = useSelector((state) => state.GAppState);
	const [searchText, setSearchText] = useState('');
	const [isDone, setDone] = useState(false);
	// const [isClear, setIsClear] = useState(0);
	const { dataModalBS, styles, listReport, dataModalMain, dataProduct, itemSave } = route.params;
	const isChangeRef = useRef(0);
	const config = JSON.parse(kpiinfo.reportItem || '{}');

	useEffect(() => {
		return () => false;
	}, []);

	const [dataListProduct, setDataListProduct] = useState(dataModalBS.data);
	const [showApply, setShowApply] = useState(false);
	const [selectedCount, setSelectedCount] = useState(0);
	const [selectedIds, setSelectedIds] = useState([]);
	const [percentValue, setPercentValue] = useState('');
	const [inputValues, setInputValues] = useState({});
	const categoryName = dataModalMain?.[0]?.dataCategory;


	const updatePreviousRouteParams = (params) => {
		const state = navigation.getState();
		const previousRoute = state.routes[state.index - 1];
		if (!previousRoute) return;
		navigation.dispatch({
			...CommonActions.setParams(params),
			source: previousRoute.key,
		});
	};

	const goBackWithParams = (params) => {
		updatePreviousRouteParams(params);
		navigation.goBack();
	};

	const renderItemSelect = ({ item, index }) => {
		const isPriceVisible = listReport.isHidePrice !== 1;
		const isLockByPrice = listReport.isLockByPrice == 1;
		const originalPrice = Number(item.price?.toString().replace(/,/g, '')) || 0;
		const hasOriginalPrice = originalPrice > 0;
		const isInputLockedByPrice = isPriceVisible && isLockByPrice && !hasOriginalPrice;
		const isProductInputEnabled = !isInputLockedByPrice;
		const quantityValue = Number(item.quantityValue || 0);
		const inputPriceValue = Number(item.priceValue || 0);
		const amountValue = quantityValue > 0 ? quantityValue * (inputPriceValue > 0 ? inputPriceValue : originalPrice) : 0;

		const selectItem = () => {
			(listReport.isMultiProduct !== 1 || dataModalBS.typeSelect !== TYPE_PRODUCTS) &&
				handlerSelectItem(item, dataModalBS.typeSelect);
		};

		const onChangePriceItem = (value) => {
			let display =
				value !== null && value?.length > 0 ? value.toString().replace(/,/g, '') : '';
			let result = display === '' ? null : parseInt(display);
			item.priceValue = result;
			const indexItem = dataProduct?.listProduct.findIndex((it) => it.id === item.id);
			dataProduct.listProduct[indexItem].priceValue = result;
			changeItem();
			setInputValues((prev) => ({ ...prev, [`${item.id}_price`]: value }));
		};

		const handlerValidatePrice = () => {
			if (!isPriceVisible) return;
			if (!config.minPrice || !config.maxPrice) return;

			const priceValue = item.priceValue || 0;
			if (priceValue === 0 || originalPrice === 0) return;

			const minPrice = Math.ceil(originalPrice * (config.minPrice || 1));
			const maxPrice = Math.floor(originalPrice * (config.maxPrice || 1));
			if (priceValue < minPrice || priceValue > maxPrice) {
				alertWarning(
					`Giá nhập phải nằm trong khoảng ${formatNumber(minPrice, ',')}đ đến ${formatNumber(maxPrice, ',')}đ`
				);
				item.priceValue = null;
				const indexItem = dataProduct.listProduct.findIndex((it) => it.id === item.id);
				dataProduct.listProduct[indexItem].priceValue = null;
				setInputValues((prev) => ({ ...prev, [`${item.id}_price`]: '' }));
			}
		};

		const onChangeQuantityProduct = (value) => {
			let display =
				value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : '';
			let result = display === '' ? null : parseInt(display);
			item.quantityValue = result;
			const indexItem = dataProduct?.listProduct.findIndex((it) => it.id === item.id);
			dataProduct.listProduct[indexItem].quantityValue = result;
			changeItem();
			setInputValues((prev) => ({ ...prev, [`${item.id}_quantity`]: value }));
		};
		const onNumChanged = async (e, index) => {
			let numValue = null;
			if (e !== null && parseInt(e) < 1000) numValue = e.toString().replace(/,/g, '.');
			else numValue = e.toString().replace(/,/g, '');
			//
			var sanitizedInput =
				/^\d*\.?\d*$/.test(numValue) && numValue !== '' ? parseFloat(numValue) : null;
			const indexItem = dataProduct?.listProduct.findIndex((it) => it.id === item.id);
			dataProduct.listProduct[indexItem].percentValue = sanitizedInput;
			changeItem();
			setPercentValue(sanitizedInput);
		};

		const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];

		return listReport?.isMultiProduct === 1 && dataModalBS.typeSelect === TYPE_PRODUCTS ? (
			<View style={{ paddingHorizontal: 4 }}>
				{item.isParent && item.categoryId !== undefined &&
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary, padding: 8, borderRadius: 5, marginVertical: 8 }}>
						<Text style={{ flex: 1, fontSize: 14, fontWeight: 'bold', color: appcolor.white }}> {item.categoryName}</Text>
					</View>
				}
				{(keyLayer2 && item.subCategory) &&
					<View style={{ flex: 1, padding: 8, marginTop: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ color: appcolor.primary, fontSize: 16, paddingLeft: 8, fontWeight: '600' }}>{item.subCategory}</Text>
					</View>
				}

				<View
					key={'select_' + index}
					style={{
						backgroundColor: appcolor.surface,
						marginHorizontal: 5,
						marginBottom: 3,
						borderRadius: 12,
						minHeight: 40,
						overflow: 'hidden',
					}}
				>
					<View style={{ flexDirection: 'row' }}>
						<View style={{ flex: 5.5 / 10, justifyContent: 'center', marginRight: 3 }}>
							<Text style={{ fontSize: 14, padding: 8, color: appcolor.dark }}>
								{index + 1}. {item?.name}
							</Text>
							{isPriceVisible && (
								<Text style={{ fontSize: 14, lineHeight: 18, fontWeight: '600', color: appcolor.primary, paddingHorizontal: 8 }}>
									{`${formatNumber(item.price || 0, ',')}đ`}
								</Text>
							)}
							<Text style={{ fontSize: 14, padding: 8, color: appcolor.placeholderText }}>
								{item?.productCode}
							</Text>
						</View>
						<View
							style={{
								flex: 4.5 / 10,
								justifyContent:
									listReport.isUsePercent !== 1 && listReport.isHidePrice == 1
										? 'flex-end'
										: 'space-between',
								alignItems: 'center',
								flexDirection: 'row',
							}}
						>
							<NumericFormat
								value={
									item?.quantityValue?.toString() || inputValues[`${item.id}_quantity`]
								}
								displayType="text"
								thousandSeparator={true}
								renderText={(value) => (
									<TextInput
										style={{
											fontSize: 11,
											color: appcolor.dark,
											backgroundColor: appcolor.light,
											fontWeight: '500',
											flex: 2 / 5,
											textAlign: 'center',
											marginRight: 3,
											padding: 8,
											borderWidth: 0.5,
											borderRadius: 5,
											borderColor: appcolor.greydark,
											textAlignVertical: 'center',
											opacity: isProductInputEnabled ? 1 : 0.5,
										}}
										value={
											item.quantityValue?.toString() ||
											inputValues[`${item.id}_quantity`]
										}
										keyboardType={'number-pad'}
										placeholder={'Số lượng'}
										placeholderTextColor={appcolor.greydark}
										editable={isProductInputEnabled}
										selectTextOnFocus={true}
										onChangeText={onChangeQuantityProduct}
									></TextInput>
								)}
							/>

							{listReport.isUsePercent == 1 && (
								<NumericFormat
									value={percentValue === 0 ? 0 : item.percentValue || ''}
									displayType={'text'}
									// thousandSeparator={true}
									allowLeadingZeros={true}
									renderText={(valueText) => (
										<TextInput
											keyboardType={Platform.OS == 'ios' ? 'decimal-pad' : 'numeric'}
											selectTextOnFocus={true}
											placeholder={listReport.unitPercent || '%'}
											// ref={(ref) => (inputRefs.current[index] = ref)}
											onChangeText={onNumChanged}
											returnKeyType={Platform.OS == 'ios' ? 'done' : 'next'}
											defaultValue={valueText}
											placeholderTextColor={appcolor.greydark}
											editable={true}
											style={{
												fontSize: 11,
												color: appcolor.dark,
												backgroundColor: appcolor.light,
												fontWeight: '500',
												flex: 3 / 5,
												textAlign: 'center',
												marginRight: 3,
												padding: 8,
												borderWidth: 0.5,
												borderRadius: 5,
												borderColor: appcolor.greydark,
												textAlignVertical: 'center',
											}}
										/>
									)}
								/>
							)}
							{isPriceVisible && (
								<NumericFormat
									value={item?.priceValue?.toString() || inputValues[`${item.id}_price`]}
									displayType="text"
									thousandSeparator={true}
									renderText={() => (
										<TextInput
											style={{
												fontSize: 11,
												color: appcolor.dark,
												backgroundColor: appcolor.light,
												fontWeight: '500',
												flex: 3 / 5,
												textAlign: 'center',
												marginRight: 3,
												padding: 8,
												borderWidth: 0.5,
												borderRadius: 5,
												borderColor: appcolor.greydark,
												textAlignVertical: 'center',
												opacity: isProductInputEnabled ? 1 : 0.5,
											}}
											value={formatNumber(item?.priceValue?.toString() || inputValues[`${item.id}_price`] || '', ',')}
											keyboardType={'number-pad'}
											placeholder={listReport.unitPrice || 'Giá'}
											placeholderTextColor={appcolor.greydark}
											editable={isProductInputEnabled}
											selectTextOnFocus
											onChangeText={onChangePriceItem}
											onEndEditing={handlerValidatePrice}
										/>
									)}
								/>
							)}
						</View>
					</View>
					{isInputLockedByPrice && (
						<View style={{ width: '100%', paddingHorizontal: 8, paddingBottom: 8 }}>
							<Text style={{ fontSize: 12, lineHeight: 16, fontWeight: '500', color: appcolor.danger }}>
								Sản phẩm không có giá, liên hệ với admin để cập nhật giá bán gốc
							</Text>
						</View>
					)}
					{amountValue > 0 && (
						<View style={{ width: '100%', paddingHorizontal: 8, paddingBottom: 8 }}>
							<Text style={{ fontSize: 13, lineHeight: 18, fontWeight: '700', color: appcolor.primary, textAlign: 'right' }}>
								{`Thành tiền: ${formatNumber(amountValue, ',')}đ`}
							</Text>
						</View>
					)}
				</View>
			</View>
		) : (
			<View style={{ paddingHorizontal: 4 }}>
				{item.isParent && item.categoryId !== undefined &&
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary, padding: 8, borderRadius: 5, marginVertical: 8 }}>
						<Text style={{ flex: 1, fontSize: 14, fontWeight: 'bold', color: appcolor.white }}> {item.categoryName}</Text>
					</View>
				}
				{(keyLayer2 && item.subCategory) &&
					<View style={{ flex: 1, padding: 8, marginTop: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ color: appcolor.primary, fontSize: 16, paddingLeft: 8, fontWeight: '600' }}>{item.subCategory}</Text>
					</View>
				}

				<TouchableOpacity
					key={'nasdha' + index}
					activeOpacity={
						listReport.isMultiProduct === 1 && dataModalBS.typeSelect === TYPE_PRODUCTS
							? 1
							: 0.5
					}
					onPress={selectItem}
					style={{ marginBottom: 3, borderRadius: 5 }}
				>
					<View
						style={{
							backgroundColor:
								(item.id == itemSave.ShopId ||
									item.id == itemSave.DealerId ||
									item.id == itemSave.CategoryId ||
									item.id == itemSave.ProductId
								)
									? appcolor.primary :
									appcolor.surface,
							borderRadius: 5,
							flex: 1,
							padding: 10,
						}}
					>
						<Text style={{
							fontSize: 14, color:
								(item.id == itemSave.ShopId ||
									item.id == itemSave.DealerId ||
									item.id == itemSave.CategoryId ||
									item.id == itemSave.ProductId
								)
									? appcolor.white :
									appcolor.dark
						}}>
							{index + 1}. {item.name}
						</Text>
						{item?.productCode && <Text style={{ fontSize: 14, padding: 8, color: appcolor.placeholderText }}>{item?.productCode}</Text>}
					</View>
				</TouchableOpacity>
			</View>
		);
	};

	const filterProduct = () => {
		const filter = dataModalMain?.[0].dataProduct.filter((item) =>
			selectedIds.includes(item.categoryId)
		);
		const { arr } = groupDataByKey({
			arr: filter,
			key: 'categoryId',
			keyLayer2: 'subCatId'
		});
		setDataListProduct(arr);
	};

	const handleSelectItemCategory = (id, index) => {
		setShowApply(true);
		let numSelect = 0
		if (selectedCount == 0 && selectedIds?.length > 0) {
			numSelect = selectedIds?.length
		}
		setSelectedIds((prevIds) => {
			if (prevIds.includes(id)) {
				setSelectedCount((prevCount) => (prevCount + numSelect) - 1);
				return prevIds.filter((prevId) => prevId !== id);
			} else {
				setSelectedCount((prevCount) => (prevCount + numSelect) + 1);
				return [...prevIds, id];
			}
		});
	};

	const handlerFilterItem = async (dataBS, value) => {
		// let dataFilter = [];
		let dataMain = dataModalBS.typeSelect === TYPE_PRODUCTS ? (
			listReport.isMultiProduct === 1
				? dataProduct.listProduct
				: dataModalMain[0].dataProduct
		) : dataModalMain

		const _valueSearch = removeVietnameseTones(value || '').toLowerCase()
		const _filterList = _.filter(dataMain, (e) => removeVietnameseTones(e.name).toLowerCase().includes(_valueSearch))

		// if (value !== null && value !== undefined && value.length > 0) {
		// 	dataFilter = dataMain.filter((i) => i.name.toLowerCase().match(value.toLowerCase()));
		// } else {
		// 	dataFilter = dataMain;
		// }
		dataModalBS.data = _filterList;
		dataModalBS.typeSelect = dataBS.typeSelect;
		setDataListProduct(_filterList);
		setSearchText(value);
	};

	const filterDoneProduct = async () => {
		if (!isDone) {
			let lstRes = dataProduct.listProduct.filter(
				(it) =>
					(it.quantityValue !== null &&
						it.quantityValue !== undefined &&
						it.quantityValue > 0) ||
					(it.priceValue !== null && it.priceValue !== undefined && it.priceValue >= 0)
			);
			dataModalBS.data = lstRes;
			setDataListProduct(lstRes);
		} else {
			dataModalBS.data = dataProduct.listProduct;
			setDataListProduct(dataProduct.listProduct);
		}
		setDone((e) => !e);
	};

	const clearData = () => {
		Message('Chú ý', `Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?`, () => {
			dataProduct.listProduct.map((it) => {
				it.quantityValue = null;
				it.priceValue = null;
				it.displayComment = null;
			});
			dataModalMain[0].dataProduct.map((it) => {
				it.quantityValue = null;
				it.priceValue = null;
				it.displayComment = null;
			});

			setInputValues({});
			setDataListProduct(dataProduct.listProduct);
			dataModalBS.data = dataProduct.listProduct;
			SheetManager.hide('actiondisplay');
		});
	};

	const handlerGetCalendarMinDate = () => {
		if (listReport.isLockPast == 1) return moment().format('YYYY-MM-DD');
		if (listReport.isLockMonth == 1) return moment().format('YYYY-MM-01');
		if (listReport.isLockPastOneMonth == 1) return moment().subtract(1, 'month').format('YYYY-MM-01');
		return null;
	};

	const handlerDatePress = async (date) => {
		let dateString = date.dateString;
		const today = moment()
		const dateSelect = moment(dateString);

		if (listReport.isLockPast == 1 && dateSelect.isBefore(today, 'day')) {
			alertWarning('⛔ Không được chọn ngày cũ');
			return
		}

		if (listReport.isLockMonth == 1 && dateSelect.isBefore(today.clone().startOf('month'), 'day')) {
			alertWarning('⛔ Không được chọn ngày thuộc tháng trước');
			return
		}

		if (listReport.isLockPastOneMonth == 1 && dateSelect.isBefore(today.clone().subtract(1, 'month').startOf('month'), 'day')) {
			alertWarning('⛔ Chỉ được chọn ngày từ tháng trước đến hiện tại');
			return
		}

		// if (AppNameBuild == psvApp) {
		// 	if (moment(dateString).format('YYYYMMDD') < moment().format('YYYYMMDD')) {
		// 		alertWarning('Bạn không được nhập dữ liệu ngày cũ');
		// 		return;
		// 	}
		// }
		goBackWithParams({
			itemSave: {
				...itemSave,
				WorkDate: moment(dateString).format('YYYYMMDD'),
				DateShow: dateString,
			},
		});
	};

	const handlerSelectItem = (item, typeView) => {
		let itemParams = itemSave;
		switch (typeView) {
			case TYPE_STORELIST:
				itemParams = {
					...itemParams,
					ShopId: item.id,
					ShopName: item.name,
					DealerId: item.dealerId || 0,
					DealerName: item.dealerName || 'Nhà phân phối',
					ListProduct: listReport.productByStore == 1 ? item.listProduct : null,
					ListCategory: listReport.productByStore == 1 ? item.listCategory : null
				};
				break;
			case TYPE_DEALER:
				itemParams = { ...itemParams, DealerId: item.id, DealerName: item.name };
				break;
			// case TYPE_COMPETITOR:
			//     setItemSave({ ...itemSave, "CompetitorId": itemChoose.id, "CompetitorName": itemChoose.name })
			//     break
			case TYPE_CATEGORY:
				itemParams = { ...itemParams, CategoryId: item.id, CategoryName: item.name };
				break;
			case TYPE_PRODUCTS:
				itemParams = { ...itemParams, CategoryId: item.categoryId, CategoryName: item.categoryName, ProductId: item.id, ProductName: item.name, ProductPrice: item.price || 0 };
				break;
		}

		goBackWithParams({ itemSave: itemParams });
	};

	const changeItem = () => {
		isChangeRef.current += 1;
	};

	const handlerGoback = async () => {
		goBackWithParams({
			isChange: isChangeRef.current,
			dataProduct: dataProduct,
		});
	};
	const getItemLayout = useCallback(
		(data, index) => ({
			length: 40,
			offset: 40 * index,
			index,
		}),
		[]
	);

	const RenderButton = ({
		title,
		iconName,
		iconColor,
		actionPress,
		isShowInput = false,
		type,
	}) => {
		const styleView = {
			backgroundColor: isShowInput ? appcolor.light : appcolor.surface,
			borderWidth: isShowInput ? 0.5 : 0,
			borderColor: appcolor.success,
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			padding: 5,
			marginTop: 8,
			borderRadius: 5,
		};
		return (
			<TouchableOpacity onPress={actionPress}>
				<View style={styleView}>
					<Icon
						name={iconName}
						size={18}
						type={type ? type : 'font-awesome-5'}
						color={iconColor}
					/>
					<Text
						style={{
							width: '100%',
							fontSize: 14,
							fontWeight: '400',
							color: appcolor.dark,
							padding: 8,
						}}
					>
						{title}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	// const getInputCount = (categoryId) => {
	// 	return Object.keys(inputValues).filter((key) => {
	// 		const [inputCategoryId] = key.split('_');
	// 		return inputCategoryId === categoryId;
	// 	}).length;
	// };
	// console.log('inputValues', inputValues);

	const renderHeaderComponent = () => {
		return (
			<>
				<CustomListView
					horizontal
					data={categoryName}
					renderItem={({ item, index }) => {
						// const inputCount = getInputCount(item.item.id);
						// console.log('inputCount', inputCount);
						return (
							<View key={index} style={{ padding: 10 }}>
								<TouchableOpacity
									style={{
										backgroundColor: selectedIds.includes(item.id)
											? appcolor.primary
											: appcolor.light,
										borderWidth: 0.5,
										borderColor: selectedIds.includes(item.id) ? appcolor.primary : appcolor.dark,
										padding: 7,
										borderRadius: 10,
									}}
									onPress={() => handleSelectItemCategory(item.id, index)}
								>
									<Text
										style={{
											fontWeight: '600',
											color: selectedIds.includes(item.id)
												? appcolor.white
												: appcolor.dark,
										}}
									>
										{item.name}
									</Text>
								</TouchableOpacity>
							</View>
						);
					}}
				/>
			</>
		);
	};


	const keyExtractor = ((item) => item.id.toString());
	return (
		<SafeAreaView style={{ backgroundColor: appcolor.light, height: '100%', paddingTop: Platform.OS == 'ios' ? 56 : 40 }}>
			{/* <View
				style={{
					width: '100%',
					padding: 10,
					paddingBottom: 20,
					justifyContent: 'center',
					flexDirection: 'row',
				}}
			>
				<Text style={{ fontWeight: '800', fontSize: 18, color: appcolor.dark }}>{` ${
					dataModalBS.typeSelect == TYPE_CALENDAR
						? 'Chọn ngày'
						: `Danh sách ${titleInput(dataModalBS.typeSelect)}`
				}`}</Text>
			</View> */}
			<HeaderInApp
				leftFunc={() => handlerGoback()}
				iconLeft="close"
				isHome
				title={
					dataModalBS.typeSelect == TYPE_CALENDAR
						? 'Chọn ngày'
						: `Danh sách ${titleInput(dataModalBS.typeSelect)}`
				}
				rightFunc={() => handlerGoback()}
				iconRight="check"
			/>
			{/* Content */}
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					padding: 10,
					alignItems: 'center',
				}}
			>
				{dataModalBS.typeSelect !== TYPE_CALENDAR && (
					<FormGroup
						editable
						multiline
						nonBorder
						containerStyle={{
							marginBottom: 0,
							width:
								listReport.isMultiProduct === 1 &&
									dataModalBS.typeSelect == TYPE_PRODUCTS
									? '80%'
									: '100%',
							fontSize: 13,
							alignSelf: 'center',
							padding: 8,
							backgroundColor: appcolor.surface,
						}}
						placeholder={`Tìm kiếm ${titleInput(dataModalBS.typeSelect)}`}
						iconName="search"
						value={searchText}
						onClearTextAndroid={(value) => handlerFilterItem(dataModalBS, value)}
						handleChangeForm={(value) => handlerFilterItem(dataModalBS, value)}
					/>
				)}
				{listReport.isMultiProduct === 1 && dataModalBS.typeSelect === TYPE_PRODUCTS && (
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<TouchableOpacity
							onPress={() => SheetManager.show('actiondisplay')}
							style={{
								padding: 5,
								justifyContent: 'center',
								alignItems: 'center',
								width: 40,
								height: 40,
								backgroundColor: appcolor.surface,
								borderRadius: 5,
							}}
						>
							<Icon
								name={'bars'}
								type={'font-awesome-5'}
								size={23}
								color={appcolor.dark}
							/>
						</TouchableOpacity>
					</View>
				)}
			</View>
			{/* {dataModalBS.typeSelect !== TYPE_CALENDAR &&
                    <KeyboardAwareScrollView
                        enableOnAndroid
                        showsVerticalScrollIndicator={false}
                        style={{ width: '100%', height: deviceHeight }}
                        extraScrollHeight={120}>
                        <FlatList
                            key="dataSelect"
                            windowSize={18}
                            keyExtractor={keyExtractor}
                            getItemLayout={getItemLayout}
                            data={dataModalBS.data}
                            initialNumToRender={17}
                            maxToRenderPerBatch={10}
                            contentContainerStyle={{ paddingBottom: 30 }}
                            ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
                            renderItem={useCallback(({ item, index }) => {
                                return (
                                    <RenderItemSelect key={'itemSelect_' + index} item={item} index={index} appcolor={appcolor} dataModalBS={dataModalBS} dataProduct={dataProduct} onSelectItem={handlerSelectItem} listReport={listReport} changeItem={changeItem} isClear={isClear} />
                                )
                            })}
                        />
                    </KeyboardAwareScrollView>
                } */}

			{dataModalBS.typeSelect !== TYPE_CALENDAR && (
				<View style={{ height: deviceHeight }}>
					<CustomListView
						data={dataListProduct}
						renderItem={renderItemSelect}
						ListHeader={listReport.isMultiProduct == 1 ? renderHeaderComponent() : null}
						bottomView={{ height: deviceHeight / 1.5, paddingBottom: 0 }}
						initialNumToRender={15}
					/>
				</View>
			)}
			{dataModalBS.typeSelect == TYPE_CALENDAR && (
				<Calendar
					firstDay={1}
					current={moment().format('YYYY-MM-DD')}
					minDate={handlerGetCalendarMinDate()}
					maxDate={listReport.isFuture ? null : moment().format('YYYY-MM-DD')}
					onDayPress={(date) => handlerDatePress(date)}
					monthFormat={'MMMM yyyy'}
					hideExtraDays={true}
					style={{
						backgroundColor: appcolor.light,
						calendarBackground: appcolor.light,
					}}
					theme={{
						backgroundColor: appcolor.light,
						calendarBackground: appcolor.light,
						selectedDayBackgroundColor: appcolor.primary,
						textSectionTitleColor: appcolor.primary,
					}}
					onPressArrowLeft={(subtractMonth) => subtractMonth()}
					onPressArrowRight={(addMonth) => addMonth()}
					markingType={'custom'}
				/>
			)}
			<ActionSheet
				id={'actiondisplay'}
				headerAlwaysVisible={true}
				defaultOverlayOpacity={0.1}
				gestureEnabled={true}
				indicatorColor={appcolor.primary}
				containerStyle={{ backgroundColor: appcolor.light, alignSelf: 'center' }}
			>
				<View style={{ width: '100%', paddingBottom: deviceHeight / 20, padding: 10 }}>
					<Text
						style={{
							width: '100%',
							textAlign: 'center',
							fontSize: 18,
							fontWeight: '600',
							color: appcolor.dark,
						}}
					>
						Công cụ
					</Text>
					<RenderButton
						isShowInput={isDone}
						title="Xem dữ liệu đã nhập"
						iconName="keyboard"
						iconColor={appcolor.success}
						actionPress={filterDoneProduct}
					/>
					<RenderButton
						title="Xoá dữ liệu đã nhập"
						iconName="eraser"
						iconColor={appcolor.red}
						actionPress={clearData}
					/>
				</View>
			</ActionSheet>
			{/* <View style={{ position: 'absolute', top: 50, left: 10 }}>
				<TouchableOpacity
					onPress={() => handlerGoback()}
					style={{ padding: 5, width: 40, height: 40 }}
				>
					<Icon name="close" size={28} color={appcolor.dark} />
				</TouchableOpacity>
			</View> */}
			{showApply && selectedIds.length > 0 && selectedCount > 0 && (
				<View
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						justifyContent: 'center',
						alignItems: 'center',
						paddingBottom: 80,
						width: '100%',
						paddingTop: 40,
						borderRadius: 10,
					}}
				>
					<TouchableOpacity
						onPress={() => {
							// setSelectedIds([]);
							filterProduct();
							setSelectedCount(0);
						}}
						style={{
							padding: 15,
							width: '80%',
							height: '100%',
							backgroundColor: appcolor.primary,
							borderRadius: 10,
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'row',
						}}
					>
						<Text style={{ color: appcolor.light, fontSize: 16, fontWeight: '600' }}>{'Áp dụng'} </Text>
						<Avatar
							size={'small'}
							rounded
							title={selectedCount}
							titleStyle={{ color: appcolor.dark, fontSize: 16 }}
							containerStyle={{ backgroundColor: appcolor.light }}
						></Avatar>
					</TouchableOpacity>
				</View>
			)}
		</SafeAreaView>
	);
};

export default ItemProductsSellIn;
