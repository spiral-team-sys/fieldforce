import React, { useRef, useState, useEffect } from "react";
import { TextInput, View, StyleSheet, KeyboardAvoidingView, ScrollView, Text, SafeAreaView, VirtualizedList, TouchableOpacity, FlatList, UIManager, Platform, LayoutAnimation, DeviceEventEmitter, Dimensions } from "react-native";
import { CheckBox, Divider, Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import { URL_CHECK_IMEI, _competitorId } from "../../Core/URLs";
import { getSegmentByProduct, getSubSegmentByProduct } from "../../Controller/SellInController";
import { getProductSO } from "../../Controller/ProductController";
import { getCategoryByProduct, SellOutGetList } from "../../Controller/SellOutController";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { ConvertToInt, deviceHeight } from "../../Core/Utility";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { checkIMEI, fetchGet, MessageInfo, ToastError, ToastSuccess } from "../../Core/Helper";
import { CheckIMEISellout } from "../../Controller/WorkController";
import { getMasterlist } from "../../Controller/MasterController";
import { CustomerCheckList } from "./CustomerCheckList";
import moment from "moment";
import { SelloutAPI } from "../../API/SelloutAPI";
import FormGroup from "../../Content/FormGroup";
import { LoadingView } from "../../Control/ItemLoading";
import _ from "lodash"
import AsyncStorage from "@react-native-async-storage/async-storage";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SellOutInputHPI = ({ navigation, route }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [filterData, setFilterData] = useState([]);
    const [currentdata, setCurrentData] = useState([])
    const [currentDataF, setCurrentDataF] = useState([])
    const [dataSheet, setDataSheet] = useState({ currentdata: [], currentDataF: [] })
    const [key, setKey] = useState("cate");
    const [filter, setFilter] = useState({});
    const [Quantity, onQuantity] = useState('1');
    const [Price, onPrice] = useState();
    const [IMEI, onIMEI] = useState();
    const [CustName, onCustName] = useState();
    const [CustAddress, onCustAddress] = useState();
    const [CustPhone, onCustPhone] = useState();
    const [Note, onNote] = useState();
    const [masterList, setMasterList] = useState([]);
    const [custlist, setCheckList] = useState({ custlist: [] });
    const [competitorId, onCompetitorId] = useState(_competitorId);
    const [ItemSaved, setItemSaved] = useState(null);
    const [search, setSearch] = useState('')
    const [reload, setReload] = useState(0)
    const [showProgress, setShowProgress] = useState(false)
    const refSerial = useRef();
    const refCusName = useRef();
    const refCusAdd = useRef();
    const refCusPhone = useRef();
    const refNote = useRef();
    const refPrice = useRef()
    const [infoSave, setInfoSave] = useState(false)

    useEffect(() => {
        const _load = loadData()
        return () => _load;
    }, [])

    useEffect(() => {
        if ((ItemSaved !== null && filterData[0]?.length > 0) || infoSave.isSaveInfo == true) {
            loadItemSave()
            // onQuantity(ItemSaved.quantity);
        }
        else {
            onQuantity('1');
            onIMEI();
        }
    }, [ItemSaved]);
    loadData = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        await setShowProgress(true)
        //category
        var _filterData = []
        const category = await getCategoryByProduct(_competitorId);
        _filterData.push(category?.filter(a => a?.id !== 0));
        await setDataSheet({ currentdata: category?.filter(a => a?.id !== 0), currentDataF: category?.filter(a => a?.id !== 0) })
        // segment
        const segment = await getSegmentByProduct();
        _filterData.push(segment);
        //subsegment
        const subsegment = await getSubSegmentByProduct();
        _filterData.push(subsegment);
        //product
        const product = await getProductSO(_competitorId)
        _filterData.push(product);
        setFilterData(_filterData)
        // customer checklist
        const listmaster = await getMasterlist("CUST_CHECKLIST");
        await setMasterList(listmaster)
        const jsonSellOut = await AsyncStorage.getItem('SELLOUTHP')
        const settings = await JSON.parse(jsonSellOut) || await { isSaveInfo: false, shopId: workinfo.shopId, itemSaveInfo: null };
        if (route.params?.ItemSaved !== undefined && Object.keys(route.params?.ItemSaved).length) {
            setItemSaved(route.params?.ItemSaved || null)
        }
        else if (settings.isSaveInfo === true && settings.shopId == workinfo.shopId) {
            setItemSaved(settings.itemSaveInfo || null)
            setInfoSave(settings.isSaveInfo)
        }
        await setShowProgress(false)
    }
    const loadItemSave = async () => {
        const itemCate = filterData[0]?.find(it => it.name == ItemSaved.category || it.name == ItemSaved.subCategory)
        const itemSegment = filterData[1]?.find(it => it.name == ItemSaved.segment)
        const itemSubSegment = filterData[2]?.find(it => it.name == ItemSaved.subSegment)
        const itemProduct = filterData[3]?.find(it => it.id == ItemSaved.productId)
        let _listtemp = masterList.filter(a => a.ref_Id == itemCate?.id)?.sort((a, b) => a.groupId - b.groupId)
        let listCustInfo = JSON.parse(ItemSaved.customerInfo || '[]')
        _listtemp.map(it => {
            const itemCust = _.find(listCustInfo, { id: it.id })
            if (itemCust?.id != undefined) {
                it.selectValue = itemCust.selectValue
            }
        })

        // const itemCust = _.find(listCustInfo, { id: 52 })
        // // console.log(item, 'check item cust');
        // for (let index = 0; index < _listtemp.length; index++) {
        //     let item = _listtemp[index];
        //     const itemCust = _.find(listCustInfo, { id: item.id })
        //     console.log(item.id, 'check item cust');
        //     //     const jItem = listCustInfo[j];
        //     //     if (item.id == jItem.id) {
        //     //         console.log(jItem, item.id, 'check item');
        //     //         // item.selectValue = true
        //     //     }
        //     // }
        //     // console.log(item.selectValue, 'selectValueselectValue');
        // }

        // console.log(_listtemp, '_listtemp_listtemp');
        custlist.custlist = _listtemp
        setFilter({ cate: itemCate, segment: itemSegment, product: itemProduct, subsegment: itemSubSegment })
        onIMEI(ItemSaved.imeI1);
        onCustAddress(ItemSaved.address);
        onNote(ItemSaved.note);
        onCustPhone(ItemSaved.phone);
        onCustName(ItemSaved.contactName);
    }

    const validateTextInput = async () => {
        if (competitorId === _competitorId) {
            if (filter.product == undefined) {
                ToastError('Bạn chưa nhập sản phẩm bán');
                return;
            }

            if (CustName !== null && CustName !== '' && CustName !== undefined && CustName !== 'undefined') {
                if (CustName == null || CustName.length < 5) {
                    ToastError('Tên khách hàng ngắn, nhập ít nhất 5 ký tự');
                    return;
                }
            }

            if (Quantity == null || ConvertToInt(Quantity) < 1) {
                ToastError('Số lượng không hợp lệ');
                return;
            }

            if (CustPhone !== null && CustPhone !== '' && CustPhone !== undefined && CustPhone !== 'undefined') {
                if (CustPhone.length < 10 || CustPhone.length > 11) {
                    ToastError('Số điện thoại không hợp lệ (nhập 10 hoặc 11 số)');
                    return;
                }
            }

            if (IMEI != null && IMEI != '') {
                if (IMEI.length < 10) {
                    ToastError('Vui lòng nhập số IMEI gồm 10 ký tự');
                    return
                }
                let lstSellout = await CheckIMEISellout(IMEI);
                if (lstSellout.length > 0) {
                    ToastError('Số IMEI này đã nhập rồi vui lòng nhập lại.');
                    return;
                }

                let message = await fetchGet(URL_CHECK_IMEI)
                if (message != null && message != "") {
                    ToastError(message);
                }
            }


        }
        else {
            if (Quantity == null || ConvertToInt(Quantity) < 0) {
                ToastError('Số lượng không hợp lệ');
                return;
            }
        }
    }
    const PostData = async () => {
        if (competitorId === _competitorId) {
            if (filter.product == undefined || filter.product.id == undefined) {
                ToastError('Bạn chưa nhập sản phẩm bán');
                return;
            }
            if (CustName !== null && CustName !== '' && CustName !== undefined && CustName !== 'undefined') {
                if (CustName == null || CustName.length < 5) {
                    ToastError('Tên khách hàng ngắn, nhập ít nhất 5 ký tự');
                    return;
                }
            }

            if (Quantity == null || ConvertToInt(Quantity) < 1) {
                ToastError('Số lượng không hợp lệ');
                return;
            }

            if (CustPhone !== null && CustPhone !== '' && CustPhone !== undefined && CustPhone !== 'undefined') {
                if (CustPhone.length < 10 || CustPhone.length > 11) {
                    MessageInfo('Số điện thoại không hợp lệ (nhập 10 hoặc 11 số)');
                    return;
                }
            }

            if (IMEI != null && IMEI != '' && IMEI != 'undefined' && (ItemSaved == null || ItemSaved == undefined || (ItemSaved.imeI1 !== IMEI) || (ItemSaved.productId !== filter.product.productId))) {
                if (IMEI.length < 10) {
                    ToastError('Vui lòng nhập số IMEI gồm 10 ký tự. ' + IMEI);
                    return
                }
                let lstSellout = await CheckIMEISellout(IMEI);
                if (lstSellout.length > 0) {
                    MessageInfo('Số IMEI này đã nhập rồi vui lòng nhập lại.');
                    return;
                }
                let lstRes = await checkIMEI(IMEI)
                if (Array.isArray(lstRes) && lstRes.length > 0) {
                    ToastError(lstRes[0].messager);
                    return
                }
            }
            if (custlist?.custlist?.length > 0) {
                const countGroup = new Set(custlist.custlist?.map(it => it.groupId)).size;
                const countSelect = custlist.custlist?.filter(it => it.selectValue).length;
                if (countGroup !== countSelect) {
                    ToastError('Bạn chưa chọn hết thông tin mua hàng');
                    return
                }
            }
        }
        else {
            if (Quantity == null || ConvertToInt(Quantity) < 0) {
                ToastError('Số lượng không hợp lệ');
                return;
            }
        }
        setShowProgress(true)

        const sellOutdetail = {
            ProductId: filter.product.id,
            ProductCode: filter.product.productCode,
            Quantity: (ItemSaved !== null && ItemSaved !== undefined) ? ItemSaved.quantity : 1,
            CustName: CustName || null,
            CustPhone: CustPhone || null,
            CustAddress: CustAddress || null,
            Price: Price || null,
            Note: Note || null,
            IMEI1: IMEI || null,
            Id: (ItemSaved !== null && ItemSaved !== undefined) ? ItemSaved.id : 0
        }
        const checklist = custlist.custlist.filter(a => {
            if (a.selectValue == true)
                return { id: a.id, name: a.name }
        })
        const sopost = {
            ShopId: workinfo.shopId,
            SellDate: moment().format("YYYY-MM-DD"),
            Details: JSON.stringify([sellOutdetail]),
            Photos: JSON.stringify(checklist),
        }

        // Lưu dữ liệu về hệ thống
        const result = await SelloutAPI.PostSellOut(sopost);
        if (result.status == 200) {
            if (infoSave === true) {
                const jsonAsync = {
                    isSaveInfo: infoSave,
                    shopId: workinfo.shopId,
                    itemSaveInfo: {
                        category: filter.cate.name,
                        segment: filter.segment.name,
                        subSegment: filter.subsegment.name,
                        productId: filter.product.id,
                        customerInfo: JSON.stringify(custlist.custlist),
                        address: CustAddress,
                        phone: CustPhone,
                        contactName: CustName,
                        quantity: Quantity,
                        price: Price
                    }
                }
                await AsyncStorage.setItem('SELLOUTHP', JSON.stringify(jsonAsync))
            } else {
                custlist.custlist = {}
                setFilter({})
                onCustAddress();
                onCustPhone();
                onCustName();
                setSearch('')
                const jsonAsync = {
                    isSaveInfo: false,
                    shopId: workinfo.shopId,
                    itemSaveInfo: {}
                }
                await AsyncStorage.setItem('SELLOUTHP', JSON.stringify(jsonAsync))
            }
            onIMEI();
            onNote();
            route.params.onLoad()
            ToastSuccess(result.messeger)
        } else
            ToastError(result.messeger)
        setShowProgress(false)
    }

    const onSelected = async (item) => {
        let itemFilter = {}
        var _listtemp = []
        let currentdata = []
        switch (key) {
            case "cate":
                _listtemp = _.filter(masterList, { ref_Id: item.id })?.sort((a, b) => a.groupId - b.groupId)
                //Load currentData by cate Id
                currentdata = _.filter(filterData[1], { categoryId: item.id }) || filterData[1]
                dataSheet.currentdata = currentdata
                dataSheet.currentDataF = currentdata
                if (_listtemp.length > 0 && filter[key]?.id !== item.id) {
                    custlist.custlist = _listtemp
                    setReload(reload + 1)
                }
                await setFilter({ [key]: item })
                await setKey('segment')
                break;
            case "segment":
                if (filter?.cate == undefined) {
                    let cate = _.find(filterData[0], { id: item.categoryId })
                    itemFilter = { cate: cate }
                } else { itemFilter = { cate: filter?.cate } }
                _listtemp = _.filter(masterList, { ref_Id: item.categoryId })?.sort((a, b) => a.groupId - b.groupId)
                //Load currentData by segment Id
                currentdata = _.filter(filterData[2], { segmentId: item.id }) || filterData[2]
                dataSheet.currentdata = currentdata
                dataSheet.currentDataF = currentdata
                _listtemp.length > 0 && (custlist.custlist = _listtemp)
                await setFilter({ ...itemFilter, segment: item })
                await setKey('subsegment')
                break;
            case "subsegment":
                if (filter?.cate == undefined) {
                    let cate = _.find(filterData[0], { id: item.categoryId })
                    itemFilter = { cate: cate }
                } else { itemFilter = { cate: filter?.cate } }
                if (filter?.segment == undefined) {
                    let segment = _.find(filterData[1], { id: item.segmentId })
                    itemFilter = { ...itemFilter, segment: segment }
                } else { itemFilter = { ...itemFilter, segment: filter?.segment } }
                //Load currentData by subsegment Id
                _listtemp = _.filter(masterList, { ref_Id: item.categoryId })?.sort((a, b) => a.groupId - b.groupId)
                currentdata = _.filter(filterData[3], { subSegment: item.name }) || filterData[3]
                dataSheet.currentdata = currentdata
                dataSheet.currentDataF = currentdata
                _listtemp.length > 0 && (custlist.custlist = _listtemp)
                await setFilter({ ...itemFilter, subsegment: item })
                await setKey('product')
                break;
            case "product":
                if (filter?.cate == undefined) {
                    let cate = _.find(filterData[0], { name: item.category })
                    itemFilter = { cate: cate }
                } else { itemFilter = { cate: filter?.cate } }
                if (filter?.segment == undefined) {
                    let segment = _.find(filterData[1], { name: item.segment })
                    itemFilter = { ...itemFilter, segment: segment }
                } else { itemFilter = { ...itemFilter, segment: filter?.segment } }
                if (filter?.subsegment == undefined) {
                    let subsegment = _.find(filterData[2], { name: item.subSegment })
                    itemFilter = { ...itemFilter, subsegment: subsegment }
                } else { itemFilter = { ...itemFilter, subsegment: filter?.subsegment } }
                _listtemp = _.filter(masterList, { ref_Id: itemFilter.cate.id })?.sort((a, b) => a.groupId - b.groupId)
                _listtemp.length > 0 && (custlist.custlist = _listtemp)
                await setFilter({ ...itemFilter, product: item })
                SheetManager.hideAll()
                break;
            default:
                break;
        }
    }
    const showSheetByIndex = async (index, key) => {
        var currentdata = await filterData[index];
        if (index != 0)
            switch (key) {
                case "segment":
                    currentdata = filter?.cate !== undefined ? _.filter(currentdata, { categoryId: filter?.cate.id }) : currentdata
                    break;
                case "subsegment":
                    currentdata = filter?.segment !== undefined ? _.filter(currentdata, { segmentId: filter?.segment?.id }) :
                        (filter?.cate !== undefined ? _.filter(currentdata, { categoryId: filter?.cate.id }) : currentdata)
                    break;
                case "product":
                    currentdata = filter?.subsegment !== undefined ? _.filter(currentdata, { subSegment: filter?.subsegment?.name }) :
                        (filter?.segment !== undefined ? _.filter(currentdata, { segment: filter?.segment?.name }) :
                            (filter?.cate !== undefined ? _.filter(currentdata, { category: filter?.cate.name }) : currentdata))
                    break;
                default:
                    break;
            }
        dataSheet.currentdata = currentdata
        dataSheet.currentDataF = currentdata
        await setKey(key)
        await SheetManager.show("sheetSearch")
    }
    const styles = StyleSheet.create({
        textBox: { color: appcolor.dark, textAlign: 'left', borderWidth: 0.3, padding: 7, marginHorizontal: 5, borderRadius: 5, marginBottom: 5, fontSize: 10, backgroundColor: appcolor.light, borderColor: appcolor.dark },
        textTitle: { color: appcolor.dark, padding: 7, fontWeight: '600', fontSize: 12 },
        containTextBox: { backgroundColor: appcolor.light, marginBottom: 5, marginHorizontal: 7, borderRadius: 5, }
    })
    const onCheckList = (list) => {
        setCheckList({ custlist: list })
    }

    const DropDownView = ({ title, onPress, value }) => {
        return (<View style={{ margin: 7, flex: 1, backgroundColor: appcolor.light, borderRadius: 8, padding: 5 }}>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.textTitle}>{title}</Text>
                <View style={{
                    flexDirection: 'row', padding: 5, borderWidth: 0.2,
                    backgroundColor: appcolor.surface, borderRadius: 5, justifyContent: 'center', alignItems: "center"
                }}>
                    <Text style={{ flexGrow: 0.9, padding: 3, color: appcolor.dark, fontSize: 11 }}>
                        {value}
                    </Text>
                    <Icon type="font-awesome-5" name="chevron-down" size={18} color={appcolor.primary} />
                </View>
            </TouchableOpacity>
        </View>)
    }

    const handleGoBack = () => {
        navigation.goBack()
    }
    const onSelectTick = () => {
        setInfoSave(e => !e)
    }
    const handleChangePrice = (value) => {
        let priceValue = value !== null && value.length > 0 ? value.toString().replace(/[^0-9]/g, '') : ''
        let result = priceValue === '' ? null : priceValue
        onPrice(result)
    }

    return (
        <View style={{ height: deviceHeight * .9, width: '100%', backgroundColor: appcolor.surface }}>
            <HeaderCustom title={"Doanh số bán"}
                leftFunc={() => handleGoBack()}
                iconRight="cloud-upload-alt"
                rightFunc={PostData} />
            {showProgress && <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />}
            {
                !showProgress &&
                <KeyboardAvoidingView
                    style={{ justifyContent: 'flex-start', backgroundColor: appcolor.surface }}
                    behavior={Platform.OS == "ios" ? "padding" : "padding"}
                    enabled keyboardVerticalOffset={Platform.OS !== "ios" ? 1 : 50}>

                    <ScrollView style={{ padding: 3, marginBottom: 20 }} keyboardShouldPersistTaps='always'>

                        <View key={`TickSaveInfo`} style={{ alignItems: 'flex-end' }}>
                            <CheckBox checked={infoSave || false} title={'Giữ thông tin khách hàng'}
                                textStyle={{ color: appcolor.dark }}
                                containerStyle={{ backgroundColor: appcolor.light, borderColor: appcolor.light, borderRadius: 5 }} onPress={() => onSelectTick()}></CheckBox>
                        </View>
                        <DropDownView key="cate" title={"Ngành hàng"}
                            value={filter?.cate?.name}
                            onPress={() => showSheetByIndex(0, "cate")} />
                        <DropDownView key="segment"
                            value={filter?.segment?.name}
                            title={"Loại"} onPress={() => showSheetByIndex(1, "segment")} />
                        <DropDownView key="subsegment" title={"Model"}
                            value={filter?.subsegment?.name}
                            onPress={() => showSheetByIndex(2, "subsegment")} />
                        <DropDownView key="product" title={"Sản phẩm"}
                            value={filter?.product?.name}
                            onPress={() => showSheetByIndex(3, "product")} />
                        {
                            competitorId === _competitorId &&
                            <View key={'sellOut_Price'} style={{ ...styles.containTextBox }}>
                                <Text style={{ color: appcolor.dark, padding: 7, fontSize: 12, fontWeight: 'bold' }}>Giá</Text>
                                <TextInput
                                    key={31}
                                    ref={refPrice}
                                    keyboardType='numeric'
                                    returnKeyLabel='Tiếp'
                                    returnKeyType='next'
                                    onSubmitEditing={() => refSerial.current.focus()}
                                    blurOnSubmit={false}
                                    onChangeText={text => handleChangePrice(text)}
                                    value={(Price !== undefined && Price !== 'undefined') ? Price : ''}
                                    style={{ ...styles.textBox }}
                                    placeholder='Giá'
                                    placeholderTextColor={appcolor.greydark}
                                />
                            </View>
                        }
                        {
                            competitorId === _competitorId &&
                            <View key={'sellOut_Imei'} style={{ ...styles.containTextBox }}>
                                <Text style={{ color: appcolor.dark, padding: 7, fontSize: 12, fontWeight: 'bold' }}>Số IMEI</Text>
                                <TextInput
                                    key={31}
                                    ref={refSerial}
                                    returnKeyLabel='Tiếp'
                                    returnKeyType='next'
                                    onSubmitEditing={() => refCusName.current.focus()}
                                    blurOnSubmit={false}
                                    onChangeText={text => onIMEI(text)}
                                    value={(IMEI !== undefined && IMEI !== 'undefined') ? IMEI : ''}
                                    style={{ ...styles.textBox }}
                                    placeholder='Số IMEI'
                                    placeholderTextColor={appcolor.greydark}
                                />
                            </View>
                        }
                        {
                            custlist?.custlist?.length > 0 &&
                            <View key={'ViewSelloutCustList'} style={{ ...styles.containTextBox }}>
                                <CustomerCheckList key={'selloutCustList'} data={custlist.custlist} callback={onCheckList} reloadView={reload} />
                            </View>
                        }
                        {
                            competitorId === _competitorId &&
                            <View key={'sellOut_CustName'} style={{ ...styles.containTextBox }}>
                                <Text style={styles.textTitle}>Tên khách hàng</Text>
                                <TextInput
                                    key={32}
                                    ref={refCusName}
                                    returnKeyLabel='Tiếp'
                                    returnKeyType='next'
                                    onSubmitEditing={() => refCusAdd.current.focus()}
                                    blurOnSubmit={false}
                                    onChangeText={text => onCustName(text)}
                                    value={(CustName !== undefined && CustName !== 'undefined') ? CustName : ''}
                                    style={{ ...styles.textBox }}
                                    placeholder='Tên khách hàng'
                                    placeholderTextColor={appcolor.greydark}
                                />
                            </View>
                        }
                        {
                            competitorId === _competitorId &&
                            <View key={'sellOut_Address'} style={{ ...styles.containTextBox }}>
                                <Text style={styles.textTitle}>Địa chỉ</Text>
                                <TextInput
                                    ref={refCusAdd}
                                    returnKeyLabel='Tiếp'
                                    returnKeyType='next'
                                    onSubmitEditing={() => refCusPhone.current.focus()}
                                    blurOnSubmit={false}
                                    style={{ ...styles.textBox }}
                                    onChangeText={text => onCustAddress(text)}
                                    value={(CustAddress !== undefined && CustAddress !== 'undefined') ? CustAddress : ''}
                                    placeholder='Địa chỉ'
                                    placeholderTextColor={appcolor.greydark}
                                />
                            </View>
                        }
                        {
                            competitorId === _competitorId &&
                            <View key={'sellOut_Phone'} style={{ ...styles.containTextBox }}>
                                <Text style={styles.textTitle}>Số điện thoại</Text>
                                <TextInput
                                    ref={refCusPhone}
                                    returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
                                    returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
                                    keyboardType='numeric'
                                    onSubmitEditing={() => refNote.current.focus()}
                                    blurOnSubmit={false}
                                    style={{ ...styles.textBox }}
                                    onChangeText={text => onCustPhone(text)}
                                    value={(CustPhone !== undefined && CustPhone !== 'undefined') ? CustPhone : ''}
                                    placeholder='Điện thoại khách hàng'
                                    placeholderTextColor={appcolor.greydark}
                                />
                            </View>
                        }
                        {
                            competitorId === _competitorId &&
                            <View key={'sellOut_Note'} style={{ ...styles.containTextBox }}>
                                <Text style={styles.textTitle}>Ghi chú</Text>
                                <TextInput
                                    ref={refNote}
                                    returnKeyType={"done"}
                                    style={{ ...styles.textBox }}
                                    onSubmitEditing={() => validateTextInput()}
                                    onChangeText={text => onNote(text)}
                                    value={(Note !== undefined && Note !== 'undefined') ? Note : ''}
                                    placeholder='Ghi chú thông tin'
                                    placeholderTextColor={appcolor.greydark}
                                />
                            </View>
                        }
                        <View style={{ height: deviceHeight / 3 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            }

            <ActionSheet id="sheetSearch"
                containerStyle={{ marginBottom: 30, backgroundColor: appcolor.surface }}
            >
                <ViewItemSheet onSelected={onSelected} filter={filter} keySheet={key} dataSheet={dataSheet} />
            </ActionSheet>
        </View>
    )
}
const ViewItemSheet = ({ onSelected, keySheet, filter, dataSheet }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [search, setSearch] = useState('')

    const filterProduct = async (text) => {
        let dataSearch = dataSheet.currentDataF
        if (text !== null && text.length > 0) {
            const newDataShow = dataSearch.filter(it => {
                const nameProduct = it.name ? it.name.toUpperCase() : ''.toUpperCase()
                const textSearch = text.toUpperCase()
                return nameProduct.indexOf(textSearch) > -1
            })
            if (newDataShow?.length > 0)
                dataSheet.currentdata = newDataShow
            await setSearch(text)
        } else {
            dataSheet.currentdata = dataSearch
            await setSearch(text)
        }
    }

    const RowItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{ paddingHorizontal: 5, height: 40, justifyContent: 'center' }}
                key={`${keySheet}_${index}`} onPress={() => onSelected(item)}>
                <View style={{ borderRadius: 5, backgroundColor: filter?.[keySheet]?.id === item.id ? appcolor.primary : appcolor.light, }} key={`w${index}a`}>
                    <Text style={{ padding: 6, fontSize: 12, borderRadius: 5, color: filter?.[keySheet]?.id === item.id ? appcolor.white : appcolor.dark }}>{index + 1}) {item?.name}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            </TouchableOpacity >
        )
    }


    return (
        <View style={{ maxHeight: deviceHeight * 0.7 }}>
            {dataSheet.currentdata?.length > 0 &&
                < FormGroup
                    containerStyle={{ backgroundColor: appcolor.light, margin: 8, marginBottom: 5, alignSelf: 'center' }}
                    inputStyle={{ fontSize: 13, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm' editable
                    onClearTextAndroid={filterProduct}
                    iconName='search'
                    value={search} handleChangeForm={filterProduct}
                />}
            <ScrollView style={{ maxHeight: deviceHeight * 0.65 }}>
                <FlatList
                    scrollEnabled={false}
                    data={dataSheet.currentdata}
                    initialNumToRender={9}
                    renderItem={({ item, index }) => <RowItem item={item} index={index} />}
                    keyExtractor={(index) => { `23${index}da2` }}
                    getItemLayout={(data, index) => ({ length: 40, offset: 40 * index, index })}
                    maxToRenderPerBatch={10}
                    windowSize={12}
                    shouldItemUpdate={(props, nextProps) => props.item !== nextProps.item}
                />
            </ScrollView>
        </View>
    )
}
