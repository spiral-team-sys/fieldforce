import React, { Fragment, useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, FlatList, Keyboard } from "react-native";
import FormGroup from '../../Content/FormGroup'
import { Icon } from '@rneui/themed';
import { getCompetitorByProduct, getCategoryByProduct, getListProducts, getListDealer, saveItemSellIn } from "../../Controller/SellInController";
import moment from "moment";
import { alertNotify, deviceHeight } from '../../Core/Utility';
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../Content/HeaderCustom";
import ActionSheet from 'react-native-actions-sheet'
import { ToastError, ToastSuccess } from "../../Core/Helper";
import RNFS from "react-native-fs"
import { AppNameBuild, mitsuApp, psvApp, _competitorId } from "../../Core/URLs";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
const TYPE_ORDER_NO = 'TYPE_ORDER_NO'
const TYPE_COMPETITOR = 'TYPE_COMPETITOR'
const TYPE_CATEGORY = 'TYPE_CATEGORY'
const TYPE_DEALER = 'TYPE_DEALER'
const TYPE_PRODUCTS = 'TYPE_PRODUCTS'
const TYPE_QUANTITY = 'TYPE_QUANTITY'
const TYPE_NOTE = 'TYPE_NOTE'
const TYPE_PRICE = 'TYPE_PRICE'
const TYPE_PRICE_NPP = 'TYPE_PRICE_NPP'

const titleInput = (type) => {
    let titleName = ''
    switch (type) {
        case TYPE_COMPETITOR:
            titleName = 'Hãng'
            break;
        case TYPE_CATEGORY:
            titleName = 'Ngành hàng'
            break;
        case TYPE_DEALER:
            titleName = 'Nhà phân phối'
            break;
        case TYPE_PRODUCTS:
            titleName = 'Sản phẩm'
            break;
        case TYPE_ORDER_NO:
            titleName = 'Số hóa đơn'
            break;
        case TYPE_PRICE_NPP:
            titleName = 'Giá nhà phân phối'
            break;
        case TYPE_PRICE:
            titleName = 'Giá'
            break;
        case TYPE_QUANTITY:
            titleName = 'Số lượng'
            break;
        case TYPE_NOTE:
            titleName = 'Ghi chú'
            break;
        default:
            titleName = 'UNDERFINED'
            break;
    }
    return titleName
}
const CreateItemSellIn = ({ dataWork, resultEvent, itemSellIn }) => {
    // Data Start Config
    const [mainData, setMainData] = useState({})
    //..
    const [itemSave, setItemSave] = useState({})
    const _sheetSearch = useRef()
    const [dataModalBS, setDataModalBS] = useState({ 'data': [], 'typeSelect': '' })
    const [dataModalMain, setDataModalMain] = useState([])
    // const [itemSellIn, setItemSellIn] = useState(itemSellIn)
    const appcolor = useSelector(state => state.GAppState.appcolor);
    const LoadDataCreate = async () => {
        let mainData = {}
        await configDataItem()
        const lstDealer = await getListDealer();
        const lstCompetitor = await getCompetitorByProduct()
        const lstCategory = await getCategoryByProduct()
        const lstProducts = await getListProducts()
        mainData = {
            "dataCompetitor": lstCompetitor,
            "dataCategory": lstCategory,
            "dataProduct": lstProducts,
            "dataDealer": lstDealer
        }
        await setMainData(mainData)
    }
    const configDataItem = async () => {
        let dataItem =
            itemSellIn !== undefined ?
                dataItem = {
                    "id": itemSellIn.id,
                    "OrderNo": itemSellIn.orderNo,
                    "DealerId": itemSellIn.dealerId,
                    "DealerName": itemSellIn.dealerName,
                    "CompetitorId": itemSellIn.competitorId,
                    "CompetitorName": itemSellIn.competitorName,
                    "CategoryId": itemSellIn.categoryId,
                    "CategoryName": itemSellIn.categoryName,
                    "ProductId": itemSellIn.productId,
                    "ProductName": itemSellIn.productName,
                    "Quantity": itemSellIn.quantityValue,
                    "Notes": itemSellIn.notes,
                    "Price": itemSellIn.priceValue,
                    "PriceNPP": itemSellIn.priceNPP,
                    "isUploaded": itemSellIn.isUploaded
                } :
                dataItem = {
                    "OrderNo": 'HD' + moment(new Date()).format('DDMMYY'),
                    "DealerId": 0,
                    "DealerName": 'Nhà phân phối',
                    "CompetitorId": 0,
                    "CompetitorName": 'Hãng',
                    "CategoryId": 0,
                    "CategoryName": 'Ngành hàng',
                    "ProductId": 0,
                    "ProductName": 'Sản phẩm',
                    "Quantity": '',
                    "Notes": '',
                    "Price": '',
                    "PriceNPP": ''
                }

        await setItemSave(dataItem)
    }
    const getProductBySelection = (currentItem) => {
        return mainData.dataProduct.filter(i =>
            (currentItem.CompetitorId == 0 || i.competitorId == currentItem.CompetitorId) &&
            (currentItem.CategoryId == 0 || i.categoryId == currentItem.CategoryId)
        )
    }
    const nextStack = (NEXT, currentItem = itemSave) => {
        switch (NEXT) {
            case TYPE_DEALER:
                setDataModalBS({ 'data': mainData.dataDealer, 'typeSelect': NEXT })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataDealer)
                break;
            case TYPE_COMPETITOR:
                setDataModalBS({ 'data': mainData.dataCompetitor, 'typeSelect': NEXT })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataCompetitor)
                break;
            case TYPE_CATEGORY:
                setDataModalBS({ 'data': mainData.dataCategory, 'typeSelect': NEXT })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataCategory)
                break;
            case TYPE_PRODUCTS:
                let lstProduct = getProductBySelection(currentItem)
                setDataModalBS({ 'data': lstProduct, 'typeSelect': NEXT })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataProduct)
                break;
        }
    }
    const handlerChangeItem = (typeView) => {
        Keyboard.dismiss()
        switch (typeView) {
            case TYPE_DEALER:
                setDataModalBS({ 'data': mainData.dataDealer, 'typeSelect': typeView })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataDealer)

                break;
            case TYPE_COMPETITOR:
                setDataModalBS({ 'data': mainData.dataCompetitor, 'typeSelect': typeView })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataCompetitor)

                break;
            case TYPE_CATEGORY:
                setDataModalBS({ 'data': mainData.dataCategory, 'typeSelect': typeView })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataCategory)
                break;
            case TYPE_PRODUCTS:
                let lstProduct = getProductBySelection(itemSave)
                setDataModalBS({ 'data': lstProduct, 'typeSelect': typeView })
                _sheetSearch?.current?.show()
                setDataModalMain(mainData.dataProduct)
                break;
        }
    }
    const getNumberValue = (text) => {
        if (text === null || text === '' || text.toString().trim() === '') {
            return null
        }

        var intValue = text.toString().replace(/,/g, '')
        intValue = parseInt(intValue)
        intValue = isNaN(intValue) ? null : Math.round(intValue);
        return intValue
    }
    const handlerTextChange = async (typeInput, value) => {
        let itemUpdate = { ...itemSave }
        switch (typeInput) {
            case TYPE_ORDER_NO:
                itemUpdate.OrderNo = value
                break
            case TYPE_QUANTITY:
                itemUpdate.Quantity = getNumberValue(value)
                break
            case TYPE_PRICE_NPP:
                itemUpdate.PriceNPP = getNumberValue(value)
                break
            case TYPE_PRICE:
                itemUpdate.Price = getNumberValue(value)
                break
            case TYPE_NOTE:
                itemUpdate.Notes = value
                break
        }
        await setItemSave(itemUpdate)
    }
    const handlerFilterItem = async (dataBS, value) => {
        let dataFilter = []
        if (value !== null && value !== undefined && value.length > 0) {
            dataFilter = dataModalMain.filter(i => i.name.toLowerCase().match(value.toLowerCase()))

        } else {
            dataFilter = dataModalMain
        }
        setDataModalBS({
            'data': dataFilter,
            'typeSelect': dataBS.typeSelect
        })
    }
    const onSelectItem = (itemChoose, typeView) => {
        let itemUpdate = { ...itemSave }
        switch (typeView) {
            case TYPE_DEALER:
                itemUpdate.DealerId = itemChoose.id
                itemUpdate.DealerName = itemChoose.name
                nextStack(TYPE_COMPETITOR, itemUpdate)
                break
            case TYPE_COMPETITOR:
                itemUpdate.CompetitorId = itemChoose.id
                itemUpdate.CompetitorName = itemChoose.name
                if (itemChoose.id !== _competitorId) {
                    itemUpdate.ProductId = 0
                    itemUpdate.ProductName = 'Sản phẩm'
                }
                nextStack(TYPE_CATEGORY, itemUpdate)
                break
            case TYPE_CATEGORY:
                if (itemUpdate.CategoryId !== itemChoose.id) {
                    itemUpdate.ProductId = 0
                    itemUpdate.ProductName = 'Sản phẩm'
                }
                itemUpdate.CategoryId = itemChoose.id
                itemUpdate.CategoryName = itemChoose.name
                if (itemUpdate.CompetitorId !== 0 && itemUpdate.CompetitorId !== _competitorId) {
                    _sheetSearch.current.hide()
                } else {
                    nextStack(TYPE_PRODUCTS, itemUpdate)
                }
                break
            case TYPE_PRODUCTS:
                const categoryNameSelect = (mainData.dataCategory.find((it) => it.id === itemChoose.categoryId)).name
                itemUpdate.CategoryName = categoryNameSelect
                itemUpdate.CategoryId = itemChoose.categoryId
                itemUpdate.ProductId = itemChoose.id
                itemUpdate.ProductName = itemChoose.name
                _sheetSearch.current.hide()
                break
        }
        setItemSave(itemUpdate)
    }
    const handlerSaveItem = async () => {
        Keyboard.dismiss()
        if (itemSave.isUploaded == 1) {
            ToastError("Bạn đã gửi hóa đơn này lên hệ thống, \nKhông thể lại chỉnh sửa!")
            return
        }
        if (itemSave.DealerId == 0) {
            ToastError("Bạn chưa chọn nhà phân phối")
            return
        }
        if (itemSave.CompetitorId == 0 || itemSave.competitorName == 'Hãng') {
            ToastError("Bạn chưa chọn hãng")
            return
        }
        if (itemSave.CategoryId == 0 || itemSave.CategoryName === 'Ngành hàng') {
            ToastError("Bạn chưa chọn ngành hàng")
            return
        }
        if (itemSave.ProductId == 0 && itemSave.CompetitorId === _competitorId) {
            ToastError("Bạn chưa chọn sản phẩm")
            return
        }

        if (itemSave.PriceNPP > 0 && itemSave.PriceNPP < 1000) {
            ToastError("Giá nhà phân phối phải lớn hơn 1000 VNĐ")
            return
        }
        if (itemSave.Price > 0 && itemSave.Price < 1000) {
            ToastError("Giá phải lớn hơn 10000 VNĐ")
            return
        }

        if (itemSave.Quantity == 0 || itemSave.Quantity == 'null') {
            ToastError("Số lượng phải lớn hơn 0")
            return
        }
        let dataSellIn = {
            "shopId": dataWork.shopId,
            "workDate": dataWork.workDate,
            'orderNo': itemSave.OrderNo,
            'dealerId': itemSave.DealerId,
            'productId': itemSave.CompetitorId === _competitorId ? itemSave.ProductId : 0,
            'competitorId': itemSave.CompetitorId,
            'categoryId': itemSave.CategoryId,
            'priceNPP': itemSave.PriceNPP > 0 ? parseInt(itemSave.PriceNPP) : 0,
            'priceValue': itemSave.Price > 0 ? parseInt(itemSave.Price) : 0,
            'quantityValue': parseInt(itemSave.Quantity),
            'notes': itemSave.Notes || '',
            'isUploaded': 0
        }

        if (itemSave.id) {
            dataSellIn = { ...dataSellIn, 'id': itemSave.id }
            itemSellIn = {
                ...itemSellIn,
                dealerId: itemSave.DealerId,
                dealerName: itemSave.DealerName,
                productId: itemSave.CompetitorId === _competitorId ? itemSave.ProductId : 0,
                productName: itemSave.CompetitorId === _competitorId ? itemSave.ProductName : '',
                competitorId: itemSave.CompetitorId,
                CompetitorName: itemSave.CompetitorName,
                categoryId: itemSave.CategoryId,
                categoryName: itemSave.CategoryName,
                priceNPP: parseInt(itemSave.PriceNPP),
                priceValue: parseInt(itemSave.Price),
                quantityValue: parseInt(itemSave.Quantity),
                notes: itemSave.Notes || ''
            }
        }
        await saveItemSellIn(dataSellIn, async (resultMessage) => {
            ToastSuccess(resultMessage)
            await setItemSave({ ...itemSave, quantityValue: '', priceNPP: '', priceValue: '', notes: null })
            await LoadDataCreate()
        })
    }
    useEffect(() => {
        LoadDataCreate()
        return () => false
    }, [])
    const styles = StyleSheet.create({
        selectStyle: {
            flexDirection: 'row',
            width: '98%',
            alignSelf: 'center',
            alignItems: "center",
            backgroundColor: appcolor.light,
            paddingVertical: 10,
            paddingHorizontal: 12,
            margin: 3,
            marginBottom: 8,
            borderRadius: 8,
            borderWidth: 0.5,
            borderColor: appcolor.grayLight,
            shadowColor: appcolor.dark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 2
        },
        selectContent: { flex: 1, paddingRight: 8 },
        selectLabel: { fontSize: 12, color: appcolor.greydark, marginBottom: 3, fontWeight: '500' },
        selectValue: { fontSize: 15, color: appcolor.dark, fontWeight: '600' },
        selectPlaceholder: { color: appcolor.greydark, fontWeight: '500' },
        selectIcon: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: appcolor.primary,
            justifyContent: 'center',
            alignItems: 'center'
        },
        sheetItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 8,
            marginVertical: 3,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 8,
            backgroundColor: appcolor.light,
            borderWidth: 0.5,
            borderColor: appcolor.grayLight,
            shadowColor: appcolor.dark,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.10,
            shadowRadius: 2,
            elevation: 1
        },
        sheetItemIndex: {
            minWidth: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: appcolor.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8
        },
        sheetItemIndexText: {
            textAlign: 'center',
            color: appcolor.light,
            fontSize: 12,
            fontWeight: '700'
        },
        sheetItemName: { flex: 1, fontSize: 15, color: appcolor.dark, fontWeight: '500' },
        inputStyle: { width: '98%', height: 'auto', alignSelf: 'center', padding: 8, margin: 3, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.greydark },

    })
    const renderItemSelect = ({ item, index }) => {
        const selectItem = () => {
            onSelectItem(item, dataModalBS.typeSelect)
        }
        return (
            <TouchableOpacity key={index + "mda"} onPress={selectItem} activeOpacity={0.75} delayPressIn={0}>
                <View style={styles.sheetItem}>
                    <View style={styles.sheetItemIndex}>
                        <Text style={styles.sheetItemIndexText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.sheetItemName} numberOfLines={1}>{item.name}</Text>
                    <Icon name='chevron-right' type='font-awesome-5' size={11} color={appcolor.greydark} />
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <HeaderCustom title="Khai báo số bán" rightFunc={handlerSaveItem} iconRight="save" leftFunc={resultEvent} />
            <View style={{ width: '100%', height: '100%', backgroundColor: appcolor.light, zIndex: 10 }}>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%', height: deviceHeight, marginBottom: deviceHeight / 5 }}
                    extraHeight={deviceHeight / 4}
                    enableOnAndroid >
                    <View style={{ width: '100%', backgroundColor: appcolor.light, padding: 8 }} >
                        <RenderInput appcolor={appcolor} typeView={TYPE_ORDER_NO} styles={styles} inputValue={itemSave.OrderNo} handlerTextChange={handlerTextChange} />
                        <RenderSelectItem appcolor={appcolor} typeView={TYPE_DEALER} styles={styles} selectValue={itemSave.DealerName} onPress={handlerChangeItem} />
                        <RenderSelectItem appcolor={appcolor} typeView={TYPE_COMPETITOR} styles={styles} selectValue={itemSave.CompetitorName} onPress={handlerChangeItem} />
                        <RenderSelectItem appcolor={appcolor} typeView={TYPE_CATEGORY} styles={styles} selectValue={itemSave.CategoryName} onPress={handlerChangeItem} />
                        {(itemSave.CompetitorId == _competitorId || itemSave.CompetitorId === 0) && <RenderSelectItem appcolor={appcolor} typeView={TYPE_PRODUCTS} styles={styles} selectValue={itemSave.ProductName} onPress={handlerChangeItem} />}
                        {
                            AppNameBuild === psvApp &&
                            <RenderInput appcolor={appcolor} typeView={TYPE_PRICE_NPP} styles={styles} inputValue={itemSave.PriceNPP} handlerTextChange={handlerTextChange} />
                        }
                        {
                            AppNameBuild === psvApp &&
                            <RenderInput appcolor={appcolor} typeView={TYPE_PRICE} styles={styles} inputValue={itemSave.Price} handlerTextChange={handlerTextChange} />
                        }
                        <RenderInput appcolor={appcolor} typeView={TYPE_QUANTITY} styles={styles} inputValue={itemSave.Quantity} handlerTextChange={handlerTextChange} />
                        <RenderInput appcolor={appcolor} typeView={TYPE_NOTE} styles={styles} inputValue={itemSave.Notes} handlerTextChange={handlerTextChange} />
                    </View>
                </KeyboardAwareScrollView>
                <ActionSheet
                    ref={_sheetSearch}>
                    <View style={{ backgroundColor: appcolor.light }}>
                        <View style={{ width: '100%', flexDirection: 'row', padding: 8, }}>
                            <Text style={{ flexGrow: 1, start: 0, fontSize: 16, fontWeight: '700', color: appcolor.dark }} >
                                {dataModalBS.typeSelect == TYPE_DEALER && 'Tìm kiếm nhà phân phối'}
                                {dataModalBS.typeSelect == TYPE_COMPETITOR && 'Tìm kiếm hãng'}
                                {dataModalBS.typeSelect == TYPE_CATEGORY && 'Tìm kiếm ngành hàng'}
                                {dataModalBS.typeSelect == TYPE_PRODUCTS && 'Tìm kiếm sản phẩm'}
                            </Text>
                        </View>
                        <View style={{ marginLeft: 8, marginRight: 8 }}>
                            <FormGroup
                                placeholder={"Tìm kiếm..."}
                                editable
                                handleChangeForm={text => handlerFilterItem(dataModalBS, text)}
                                multiline iconName='search' />
                        </View>
                        {/* } */}
                        <FlatList
                            key="dataSelect"
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            data={dataModalBS.data}
                            renderItem={renderItemSelect}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="handled"
                            initialNumToRender={20}
                            maxToRenderPerBatch={20}
                            style={{ height: deviceHeight / 2, marginBottom: 50 }}
                            onMomentumScrollEnd={() =>
                                _sheetSearch.current?.handleChildScrollEnd()
                            }
                        />
                    </View>
                </ActionSheet>
            </View>
        </View>
    )
}
const RenderSelectItem = ({ typeView, styles, selectValue, onPress, appcolor }) => {
    const eventPress = () => {
        onPress(typeView, selectValue)
    }
    const isPlaceholder = selectValue === titleInput(typeView)
    return (
        <TouchableOpacity onPress={eventPress} activeOpacity={0.75}>
            <View style={styles.selectStyle}>
                <View style={styles.selectContent}>
                    <Text style={styles.selectLabel}>{titleInput(typeView)}</Text>
                    <Text style={[styles.selectValue, isPlaceholder && styles.selectPlaceholder]} numberOfLines={1}>{selectValue}</Text>
                </View>
                <View style={styles.selectIcon}>
                    <Icon name='chevron-right' type='font-awesome-5' size={11} color={appcolor.light} />
                </View>
            </View>
        </TouchableOpacity>
    )
}
const RenderInput = ({ typeView, inputValue, handlerTextChange }) => {
    let text = typeof (inputValue) === 'number' ? inputValue.toString() : inputValue

    const textChangeEvent = (value) => {
        handlerTextChange(typeView, value)
    }
    return (
        <View style={{ width: '98%', alignSelf: 'center', margin: 3 }}>
            {typeView === TYPE_ORDER_NO ?
                <FormGroup
                    title={"Số hóa đơn"}
                    autoCapitalize="characters"
                    value={text || ''}
                    editable
                    handleChangeForm={textChangeEvent}
                    onClearTextAndroid={textChangeEvent}
                />
                : (typeView === TYPE_QUANTITY || typeView === TYPE_PRICE_NPP || typeView === TYPE_PRICE) ?
                    <FormGroup
                        title={typeView === TYPE_PRICE_NPP ? "Giá nhà phân phối" : (typeView === TYPE_PRICE ? "Giá sản phẩm" : "Số lượng")}
                        inputStyle={{ textAlign: 'right' }}
                        value={text || ''}
                        placeholder={(typeView === TYPE_PRICE_NPP || typeView === TYPE_PRICE) ? "Nhập giá" : "Nhập số lượng"}
                        keyboardType='numeric' editable
                        handleChangeForm={textChangeEvent}
                        onClearTextAndroid={textChangeEvent}
                    /> : <FormGroup
                        title="Ghi chú"
                        value={text || ''}
                        editable placeholder="Nhập ghi chú"
                        handleChangeForm={textChangeEvent}
                        onClearTextAndroid={textChangeEvent}
                    />
            }
        </View>
    )
}
export default CreateItemSellIn;
