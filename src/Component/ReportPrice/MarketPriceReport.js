import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Text, StyleSheet, View, TextInput, Modal, TouchableOpacity } from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { FlatList } from 'react-native';
import { getListMarketPrice, dataTabMarketPrice, updateItemPrice, getListUpload_MarketPrice, uploadMarketPrice, dataCompetitorMarketPrice, checkDataUpload, getHistoryMarketPrice, getListAllMarketPrice, uploadDataMarketPrice } from '../../Controller/PriceController';
import { DEFAULT_COLOR, _competitorId } from '../../Core/URLs';
////import { NumericFormat } from "react-number-format";;
// import Icon from '@react-native-vector-icons/fontawesome6';
import { Icon, } from '@rneui/themed';
import moment from 'moment';
import { SearchBar, CheckBox } from '@rneui/themed';
import { alertWarning, alertNotify, alertConfirm, checkNetwork, ConvertToInt, alertToast, deviceWidth, minWidthTab, deviceHeight } from '../../Core/Utility';
import { useSelector } from 'react-redux';
import { groupDataByKey, ToastError } from '../../Core/Helper';
import { template } from '@babel/core';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { LoadingView } from '../../Control/ItemLoading';
import ActionSheet from 'react-native-actions-sheet';
import { ScrollView } from 'react-native';
import { scaleSize } from '../../Themes/AppsStyle';
import { Keyboard } from 'react-native';
import FormGroup from '../../Content/FormGroup';
const delay = ms => new Promise(res => setTimeout(res, ms));
const PRICE_VALUE = 1
const NET_VALUE = 2
const FSM_VALUE = 3
const MarketPriceReport = ({ navigation, route }) => {
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [isOldDay, setIsOldDay] = useState(false)
    const [isUpload, setIsUpload] = useState(false)
    const [isCheckViewInput, setCheckViewInput] = useState(false)
    const [isCheckViewError, setCheckViewError] = useState(false)
    const [searchValue, _] = useState(null)

    const [dataTabView, setDataTab] = useState([])
    const [mData, setData] = useState([])
    const [mDataMain, setDataMain] = useState([])
    const [dataCompetitor, setDataCompetitor] = useState([])
    const [dataTabByCompe, setDataTabByCompe] = useState([])

    const [__, setMutate] = useState(false)
    const [colorInput, setColorInput] = useState([]);
    const [reload, setReload] = useState(0)
    const [showProgress, setProgress] = useState(false)
    const [taskDone, setDone] = useState([]);
    const ref = useRef()
    const _sheet = useRef()
    const ref_toolSheet = useRef()
    const LoadData = async () => {
        await setProgress(true)
        await getHistoryMarketPrice(workinfo.shopId)
        const lstData = await getListByCompetitor(_competitorId)
        const lstTabList = await dataTabMarketPrice()
        const lstCompetitor = await dataCompetitorMarketPrice()
        const lstTabByCompe = lstTabList?.filter(it => it.competitorId === _competitorId)
        await setIsUpload(lstData[0].isUploaded)
        await setData(lstData)
        await setDataMain(lstData)
        await setDataTab(lstTabList)
        await setDataTabByCompe(lstTabByCompe)
        await setDataCompetitor(lstCompetitor.map(i => i.competitorId === _competitorId ? { ...i, isSelect: 1 } : i))
        await setIsOldDay(ConvertToInt(moment(new Date()).format('YYYYMMDD').toString()) !== workinfo.workDate ? true : false)
        setTimeout(async () => { await setProgress(false) }, 1000)
    }
    const getListByCompetitor = async (competitorId) => {
        const lstData = await getListMarketPrice(workinfo, competitorId);
        const { arr } = groupDataByKey({
            arr: lstData,
            key: 'subCatId'
        })
        return arr;
    }

    const uploadAction = async () => {
        await Keyboard.dismiss()
        const lstUpload = await getListUpload_MarketPrice(workinfo);
        const dataAll = await getListAllMarketPrice(workinfo);
        let data = [];
        let uiTask = [];
        let isDone = true;
        lstUpload.forEach((it) => {
            dataAll?.forEach((i) => {
                if (i.productId === it.productId) {
                    data.push(i);
                }
            });
        });
        await dataCompetitor.forEach(async (it) => {
            let countCompetitor = 0;
            let countPriceFalse = 0;
            let countNetFalse = 0;
            let countFsmFalse = 0;
            await data?.forEach(async (i) => {
                if (i.competitorId === it.competitorId) {
                    countCompetitor += 1;
                    (i.priceValue === null || i.priceValue % 1000 > 0) &&
                        (countPriceFalse += 1);
                    (i.netValue === null || i.netValue % 1000 > 0) &&
                        (countNetFalse += 1);
                    (i.fsmValue === null || i.fsmValue % 1000 > 0) &&
                        (countFsmFalse += 1);
                }
            });
            const dataMainById = dataAll?.filter(
                (i) => i.competitorId === it.competitorId
            );
            let totalData = dataMainById.length;

            isDone === true && countCompetitor !== 0 ? (isDone = false) : null;
            await uiTask.push(
                <View
                    key={it.competitorId}
                    style={{ justifyContent: "center", alignItems: "center", borderRadius: 10, margin: 5, backgroundColor: appcolor.grayLight, }}
                >
                    <View style={{ width: "95%", flexDirection: "row", justifyContent: "space-between", padding: 5, }}>
                        <Text style={{ color: countCompetitor === 0 ? appcolor.success : appcolor.danger, }}  >
                            {it.competitorName}
                        </Text>
                        <Text style={{ color: countCompetitor === 0 ? appcolor.success : appcolor.danger, }} >
                            {totalData - countCompetitor}/{totalData}
                        </Text>
                    </View>
                    <View
                        style={{
                            width: "100%", flexDirection: "row", justifyContent: "space-between", borderColor: countCompetitor === 0 ? appcolor.success : appcolor.danger,
                            borderWidth: 0.3, borderRadius: 5, backgroundColor: appcolor.surface,
                        }}
                    >
                        <View style={{ width: "30%", flexDirection: "column", justifyContent: "center", alignItems: "center", }} >
                            <Text style={{ color: countPriceFalse === 0 ? appcolor.success : appcolor.danger, }} >
                                Niêm yết
                            </Text>
                            <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, height: 0.5, margin: 2, width: "100%", flexDirection: "row", }} />
                            <Text style={{ color: countPriceFalse === 0 ? appcolor.success : appcolor.danger, }}  >
                                {totalData - countPriceFalse}/{totalData}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, width: 0.3, margin: 4, flexDirection: "row", }} />
                        <View style={{ width: "30%", flexDirection: "column", justifyContent: "center", alignItems: "center", }} >
                            <Text style={{ color: countNetFalse === 0 ? appcolor.success : appcolor.danger, }}  >
                                Thực bán
                            </Text>
                            <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, height: 0.5, margin: 2, width: "100%", flexDirection: "row", }} />
                            <Text style={{ color: countNetFalse === 0 ? appcolor.success : appcolor.danger, }} >
                                {totalData - countNetFalse}/{totalData}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, width: 0.3, margin: 4, flexDirection: "row", }} />
                        <View style={{ width: "30%", flexDirection: "column", justifyContent: "center", alignItems: "center", }}   >
                            <Text style={{ color: countFsmFalse === 0 ? appcolor.success : appcolor.danger, }}  >
                                FSM Incentive
                            </Text>
                            <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, height: 0.5, margin: 2, width: "100%", }} />
                            <Text style={{ color: countFsmFalse === 0 ? appcolor.success : appcolor.danger, }}  >
                                {totalData - countFsmFalse}/{totalData}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        });
        await setDone(uiTask);

        if ((await isDone) === false || isUpload) {
            //chua nhap xong du lieu
            await _sheet.current.show();
        } else {
            let isNetwork = await checkNetwork();
            if (!isNetwork) {
                alertWarning(
                    "Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại."
                );
                return;
            }
            await alertConfirm(
                "Chú ý",
                "Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?",
                async () => {
                    await uploadMarketPrice(
                        { ...workinfo, reportId: kpiinfo.kpiId },
                        async (message) => {
                            alertNotify(message);
                            await LoadData();
                            await setReload(reload + 1)
                        }
                    );
                }
            );
        }
    };

    const filterProduct = async (str) => {
        let ROW_NUMBER = 0
        let mDataFilter = [];
        if (str !== null && str !== undefined && str.length > 0) {
            mDataFilter = mDataMain.filter(i => i.productName.toLowerCase().match(str.toLowerCase()))
        } else {
            mDataFilter = mDataMain;
        }
        await mDataFilter.forEach(i => {
            i.indexMain = ROW_NUMBER
            ROW_NUMBER++
        })
        await setData(mDataFilter)
    }
    const viewItemInput = async () => {
        if (!isCheckViewInput) {
            let ROW_NUMBER = 0
            let dataChange = await mDataMain.filter(i => i.priceValue != null && i.priceValue >= 1000 || i.netValue != null && i.netValue >= 1000 || i.fsmValue != null && i.fsmValue >= 1000)
            dataChange.forEach(i => {
                i.indexMain = ROW_NUMBER
                ROW_NUMBER++
            })
            await setData(dataChange)
        } else {
            let ROW_NUMBER = 0
            let dataChange = mDataMain
            dataChange.forEach(i => {
                i.indexMain = ROW_NUMBER
                ROW_NUMBER++
            })
            await setData(dataChange)
        }
        await setCheckViewInput(!isCheckViewInput);
        isCheckViewError === true && await setCheckViewError(false);
    }
    const filterItemError = async () => {
        if (!isCheckViewError) {
            let ROW_NUMBER = 0
            let dataChange = await mDataMain.filter(i =>
                i.priceValue == null || (i.priceValue !== 0 && i.priceValue < 1000) || (i.priceValue % 1000 > 0) ||
                i.netValue == null || (i.netValue !== 0 && i.netValue < 1000) || (i.netValue % 1000 > 0) ||
                i.fsmValue == null || (i.fsmValue !== 0 && i.fsmValue < 1000) || (i.fsmValue % 1000 > 0))
            dataChange.forEach(i => {
                i.indexMain = ROW_NUMBER
                ROW_NUMBER++
            })
            await setData(dataChange)
        } else {
            let ROW_NUMBER = 0
            let dataChange = mDataMain
            dataChange.forEach(i => {
                i.indexMain = ROW_NUMBER
                ROW_NUMBER++
            })
            await setData(dataChange)
        }
        await setCheckViewError(!isCheckViewError);
        isCheckViewInput === true && await setCheckViewInput(false);
    }
    const competitorSelected = async (item, index) => {
        await setProgress(true)
        let productFilter = []
        const selected = item.isSelect === 0 ? 1 : 0
        let dataFilter = dataCompetitor.map(i => i.competitorId === item.competitorId ? { ...i, isSelect: selected } : { ...i, isSelect: 0 })

        if (selected == 1) {
            productFilter = await getListByCompetitor(item.competitorId);
        } else {
            productFilter = await getListByCompetitor(_competitorId);
        }
        const lstTabByCompe = dataTabView?.filter(it => it.competitorId === item.competitorId)
        ref.current.scrollToIndex({
            animated: true,
            index: index,
            viewPosition: 0.5
        })
        await setData(productFilter)
        await setDataMain(productFilter)
        await setDataCompetitor(dataFilter)
        await setCheckViewInput(false)
        await setDataTabByCompe(lstTabByCompe)
        setReload(reload + 1)
        setTimeout(async () => { await setProgress(false) }, 1000)
    }
    useEffect(() => {
        LoadData();
    }, [])
    const styles = StyleSheet.create({
        viewHeaderTab: { backgroundColor: '#004d40', width: '100%', height: '5%' },
        viewProduct: { backgroundColor: appcolor.surface, borderRadius: 5, margin: 5, padding: 5 },
        titleSubCategory: { color: DEFAULT_COLOR, fontSize: 16, fontWeight: '700' },
        titleProduct: { fontWeight: '500', color: appcolor.dark, fontSize: 14, padding: 8 },
        viewInputPrice: { width: '100%', flexDirection: 'row', justifyContent: "center" },
        inputNumber: { color: appcolor.dark, width: '100%', borderBottomWidth: 1, borderBottomColor: 'black', padding: 5, textAlign: 'center' },
        ViewInput: { width: '30%', margin: 5 },
        styleModal: { flex: 1, backgroundColor: appcolor.light, padding: 16, paddingTop: 50, overflow: 'hidden' },
        modalHeader: { padding: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
    })

    const renderItemCompetitor = ({ item, index }) => {
        return (

            <View key={'itemPrice' + index} style={{ flex: 1, flexDirection: 'row', alignContent: 'center', borderBottomWidth: 0.5, borderBottomColor: '#e3e3e3' }}>
                < TouchableOpacity
                    onPress={() => { competitorSelected(item, index) }}
                    style={{
                        width: (deviceWidth * 0.5) * 0.8 - 20, marginHorizontal: 10, padding: 10, height: 40, justifyContent: 'center', alignItems: 'center', padding: 8,
                        backgroundColor: item.isSelect == 1 ? appcolor.primary : appcolor.grayLight, borderRadius: 50
                    }}>
                    <Text style={{
                        color: item.isSelect == 1 ? appcolor.white : appcolor.dark, fontSize: 14, fontWeight: '600'
                    }}>{item.competitorName}</Text>

                </TouchableOpacity>
                {/* <TouchableOpacity style={{ width: '90%', padding: 5 }} onPress={() => competitorSelected(item)} >
                    <Text h4 style={{ color: appcolor.dark, fontWeight: '500', fontSize: 16, padding: 5 }}>{(index + 1) + ". " + item.competitorName}</Text>
                </TouchableOpacity>
                <Icon style={{ padding: 13, textAlignVertical: 'center' }} name={item.isSelect == 1 ? 'check' : ''} size={15} color={appcolor.black} /> */}
            </View>
        )
    }
    const openSheet = () => {
        ref_toolSheet.current.show();
    }

    return (
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: appcolor.light }} >
            <HeaderCustom
                title={kpiinfo.name}
                leftFunc={() => navigation.goBack()}
                rightFunc={isOldDay ? null : !isUpload ? uploadAction : null}
                iconRight={isOldDay ? '' : !isUpload ? 'cloud-upload-alt' : 'check'} />
            {/* <View style={{ backgroundColor: appcolor.light, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}> */}
            {/* <SearchBar
                    containerStyle={{ width: '70%', borderTopColor: appcolor.transparent, backgroundColor: appcolor.light, borderBottomColor: appcolor.transparent }}
                    inputContainerStyle={{ backgroundColor: '#e2e2e2', height: 35 }}
                    inputStyle={{ fontSize: 14, color: 'black' }}
                    placeholder='Tìm kiếm sản phẩm' lightTheme round clearIcon
                    value={searchValue} onChangeText={filterProduct}
                />
                <CheckBox
                    title='đã nhập'
                    containerStyle={{ width: '30%', backgroundColor: appcolor.light, borderColor: appcolor.transparent }}
                    textStyle={{ fontSize: 14, color: appcolor.dark }}
                    checked={isCheckViewInput}
                    onPress={viewItemInput}
                /> */}

            {/* </View> */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <FormGroup
                    containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, padding: 3, paddingEnd: 8, width: '80%' }}
                    inputStyle={{ fontSize: 14, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm' editable
                    iconName='search'
                    value={searchValue}
                    onClearTextAndroid={filterProduct}
                    handleChangeForm={filterProduct}
                />
                <TouchableOpacity
                    onPress={() => openSheet()}
                    style={{
                        width: '10%', height: 38, padding: 3,
                        backgroundColor: appcolor.grayLight, borderRadius: 50,
                        marginRight: 15,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <Icon name='ellipsis-vertical' type='ionicon' size={21} color={appcolor.dark} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'column', width: '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.light, marginBottom: 10 }}>
                <FlatList
                    horizontal
                    ref={ref}
                    style={{ width: '95%' }}
                    data={dataCompetitor}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItemCompetitor}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS == "ios" ? "padding" : null} >
                {
                    dataTabByCompe.length > 0 &&
                    <ViewItem
                        navigation={navigation} appcolor={appcolor} workinfo={workinfo} isOldDay={isOldDay} isUpload={isUpload}
                        kpiinfo={kpiinfo} mData={mData} mDataMain={mDataMain} styles={styles} reload={reload} showProgress={showProgress} dataTabByCompe={dataTabByCompe} />
                }
            </KeyboardAvoidingView>
            {
                showProgress &&
                <View style={{ width: '100%', position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 2 }}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
            <ActionSheet
                ref={ref_toolSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >

                <View style={{ padding: 8, width: '100%', height: '30%' }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: appcolor.dark, fontSize: 17, fontWeight: '600', padding: 8 }}>Công cụ</Text>
                        <TouchableOpacity
                            style={{
                                width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                borderColor: appcolor.dark
                            }}
                            onPress={() => viewItemInput()}>
                            <Text style={{ color: appcolor.dark, width: '80%', textAlign: 'center' }} >Sản phẩm đã nhập lớn hơn 0</Text>
                            <Icon name={!isCheckViewInput ? 'checkmark-circle-outline' : 'check-circle'} type={!isCheckViewInput ? 'ionicon' : ''} size={23} color={!isCheckViewInput ? appcolor.dark : appcolor.success} />
                        </TouchableOpacity>

                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                            <TouchableOpacity
                                style={{
                                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                    borderColor: appcolor.dark
                                }}
                                onPress={() => filterItemError()}>
                                <Text style={{ color: appcolor.dark, width: '80%', textAlign: 'center' }} >Sản phẩm nhập lỗi</Text>
                                <Icon name={!isCheckViewError ? 'checkmark-circle-outline' : 'check-circle'} type={!isCheckViewError ? 'ionicon' : ''} size={23} color={!isCheckViewError ? appcolor.dark : appcolor.success} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </ActionSheet >
            <ActionSheet
                // headerAlwaysVisible gestureEnabled
                containerStyle={{ backgroundColor: appcolor.light }}
                onClose={() => { setDone([]); }}
                ref={_sheet}
            >
                {taskDone.length > 0 && (
                    <View style={{ height: "95%", justifyContent: "flex-end", }} >
                        <Text key={"dasda"} style={{ padding: 12, color: appcolor.dark, fontSize: scaleSize(18), }} >
                            {isUpload ? "Báo cáo đã gửi lên hệ thống" : "Bạn chưa hoàn thành các mục màu đỏ bên dưới"}
                        </Text>
                        <ScrollView>
                            <View>{taskDone}</View>
                        </ScrollView>
                        <TouchableOpacity
                            style={{ width: "100%", padding: 7, alignItems: "center", }}
                            onPress={async () => { setDone([]); _sheet.current.hide(); }}
                        >
                            <Text style={{ color: appcolor.primary, fontSize: scaleSize(18), }}>Đã biết</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ActionSheet>
        </View >
    )
}

const ViewItem = ({ appcolor, mData, mDataMain, styles, reload, dataTabByCompe, isOldDay, isUpload, showProgress, workinfo }) => {

    const [colorInput, setColorInput] = useState([]);
    const [dataTab, setDataTab] = useState([])
    const [__, setMutate] = useState(false)

    const loadDataShow = async () => {
        await setDataTab(dataTabByCompe)
    }

    useEffect(() => {
        loadDataShow();
        return () => false
    }, [reload])

    const saveItem = async (item, value, type) => {
        let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : null
        let mPrice = text === null ? null : parseInt(text);
        let itemInsert = {}
        switch (type) {
            case PRICE_VALUE:
                itemInsert = {
                    workId: workinfo.workId,
                    productId: item.productId,
                    priceValue: mPrice,
                    netValue: item.netValue,
                    fsmValue: item.fsmValue
                }
                mData[item.indexMain].priceValue = mPrice
                mDataMain[item.indexMain].priceValue = mPrice
                break;
            case NET_VALUE:
                itemInsert = {
                    workId: workinfo.workId,
                    productId: item.productId,
                    priceValue: item.priceValue,
                    netValue: mPrice,
                    fsmValue: item.fsmValue
                }
                mData[item.indexMain].netValue = mPrice
                mDataMain[item.indexMain].netValue = mPrice
                break;
            case FSM_VALUE:
                itemInsert = {
                    workId: workinfo.workId,
                    productId: item.productId,
                    priceValue: item.priceValue,
                    netValue: item.netValue,
                    fsmValue: mPrice
                }
                mData[item.indexMain].fsmValue = mPrice
                mDataMain[item.indexMain].fsmValue = mPrice
                break;
        }
        setMutate(e => !e)
        await updateItemPrice(item.id, itemInsert)
    }
    const checkFormatNumber = async (event, index, type, item) => {

        let mPrice = 0
        let value = event.nativeEvent.text
        if (value == '') {
            mPrice = null
        } else {
            let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : null
            mPrice = (text === '' || text === null) ? null : parseInt(text);
        }

        let foundValue = colorInput.filter(obj => obj.index === index && obj.type === type && obj.categoryId === item.categoryId && obj.competitorId === item.competitorId);
        if (mPrice % 1000 > 0 || (mPrice == null)) {
            let textAlert = ''
            let itemInsert = {}
            switch (type) {
                case PRICE_VALUE:
                    itemInsert = {
                        ...item,
                        priceValue: null,
                    }
                    mData[item.indexMain].priceValue = null
                    mDataMain[item.indexMain].priceValue = null
                    textAlert = 'Niêm yết'
                    break;
                case NET_VALUE:
                    itemInsert = {
                        ...item,
                        netValue: null
                    }
                    mData[item.indexMain].netValue = null
                    mDataMain[item.indexMain].netValue = null
                    textAlert = 'Thực bán'
                    break;
                case FSM_VALUE:
                    itemInsert = {
                        ...item,
                        fsmValue: null
                    }
                    mData[item.indexMain].fsmValue = null
                    mDataMain[item.indexMain].fsmValue = null
                    textAlert = 'Tiền thưởng'
                    break;
            }
            if (foundValue.length == 0)
                setColorInput(data => [...data, { type: type, index: index, categoryId: item.categoryId, competitorId: item.competitorId }]);
            await updateItemPrice(item.id, itemInsert)
            setMutate(e => !e)
            if (mPrice == null) {
                ToastError("Sản phẩm thứ " + (index + 1) + " : " + item.productName + "\nMục : " + textAlert + ", chưa nhập giá trị!", "Error", "top")
            } else if (mPrice >= 1000) {
                ToastError("Sản phẩm thứ " + (index + 1) + " : " + item.productName + "\nMục : " + textAlert + ", Số tiền không được lẻ!", "Error", "top")
            } else {
                ToastError("Sản phẩm thứ " + (index + 1) + " : " + item.productName + "\nMục : " + textAlert + ", Nhập sai định dạng!", "Error", "top")
            }
        } else {
            let foundValue = colorInput.filter(obj => (obj.index !== index || obj.type !== type || obj.categoryId !== item.categoryId || obj.competitorId !== item.competitorId));
            setColorInput(foundValue)

        }
    }

    const renderItem = ({ item, index }) => {
        return (
            <View key={index} style={{ flex: 1, }}>

                {item.isParent &&
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name='tags' type='font-awesome-5' color={appcolor.primary} style={{ padding: 8, }} size={20} />
                        <Text style={styles.titleSubCategory}>{item?.subCategory}</Text>
                    </View>
                }
                <View style={styles.viewProduct}>
                    <Text style={styles.titleProduct}>{(index + 1) + ". " + item.productName}</Text>
                    <View style={styles.viewInputPrice}>
                        <RenderInputNumber
                            appcolor={appcolor} type={PRICE_VALUE}
                            styles={styles} itemInput={item}
                            valueInput={item.priceValue === 0 ? 0 : (item.priceValue || '')}
                            placeholder={"Niêm yết"}
                            editable={isOldDay ? false : !isUpload}
                            onChangeText={saveItem}
                            onEndEdit={checkFormatNumber}
                            itemIndex={index} colorInput={colorInput} />
                        <RenderInputNumber
                            appcolor={appcolor} type={NET_VALUE}
                            styles={styles} itemInput={item}
                            valueInput={item.netValue === 0 ? 0 : (item.netValue || '')}
                            placeholder={"Thực bán"}
                            editable={isOldDay ? false : !isUpload}
                            onChangeText={saveItem}
                            onEndEdit={checkFormatNumber}
                            itemIndex={index} colorInput={colorInput} />
                        <RenderInputNumber
                            appcolor={appcolor} type={FSM_VALUE}
                            styles={styles} itemInput={item}
                            valueInput={item.fsmValue === 0 ? 0 : (item.fsmValue || '')}
                            placeholder={"FSM Incentive"}
                            editable={isOldDay ? false : !isUpload}
                            onChangeText={saveItem}
                            onEndEdit={checkFormatNumber}
                            itemIndex={index} colorInput={colorInput} />
                    </View>
                </View>
            </View>
        )
    }

    const renderTabView = () => {
        let dataByCategoryId = []
        return (
            dataTab.map(tab => {
                dataByCategoryId = mData.filter(i => i.categoryId === tab.categoryId)
                const totalRow = dataByCategoryId.length
                return (
                    <Tabs.Tab key={tab.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`} label={tab.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`} name={tab.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`} >
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth, height: '100%' }}>
                            {/* <View style={{ flex: 1, flexDirection: 'column' }} tabLabel={tab.tabName}> */}
                            <KeyboardAvoidingView
                                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                                behavior={Platform.OS == "ios" ? "padding" : null}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} >
                                <FlatList
                                    scrollEnabled
                                    style={{ flex: 1, padding: 5, marginBottom: Platform.OS === 'ios' ? 20 : 0 }}
                                    keyExtractor={(_, index) => index.toString()}
                                    data={dataByCategoryId}
                                    renderItem={renderItem}
                                    showsVerticalScrollIndicator={false}
                                    ListFooterComponent={<Text style={{ width: '100%', height: 320, textAlign: 'center', color: appcolor.dark, padding: 8, marginBottom: 30 }}>{totalRow > 6 ? 'Đã xem hết' : ''}</Text>}
                                />
                            </KeyboardAvoidingView>
                            {/* </View> */}
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }
    return (
        <View style={{ flex: 1 }}>
            {
                dataTab.length === dataTabByCompe.length && !showProgress &&
                <Tabs.Container
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            scrollEnabled={true}
                            tabStyle={{ minWidth: minWidthTab(dataTab), height: 32 }}
                            labelStyle={{ fontSize: 14, fontWeight: '600' }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}>
                    {renderTabView()}
                </Tabs.Container>
            }
        </View>
    )
}

const RenderInputNumber = ({ styles, valueInput, itemInput, placeholder, type, onChangeText, editable, appcolor, onEndEdit, itemIndex, colorInput }) => {
    const onChange = async (item, text, type) => {
        await onChangeText(item, text, type)
    }
    const formatNumber = async (text, index, type, item) => {
        await onEndEdit(text, index, type, item)
    }
    const dataColor = colorInput.find(obj => (obj.index === itemIndex && obj.type === type && obj.categoryId === itemInput.categoryId && obj.competitorId === itemInput.competitorId))
    return (
        <View style={styles.ViewInput} >
            <NumericFormat
                value={valueInput} displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
                renderText={values => <TextInput
                    onEndEditing={event => formatNumber(event, itemIndex, type, itemInput)}
                    value={values}
                    editable={editable}
                    keyboardType='numeric'
                    selectTextOnFocus
                    onChangeText={text => onChange(itemInput, text, type)}
                    style={[styles.inputNumber, {
                        backgroundColor: dataColor == undefined ||
                            (dataColor.type != type && dataColor.index != itemIndex && dataColor.categoryId != itemInput.categoryId
                                && dataColor.competitorId != itemInput.competitorId) ? appcolor.grey : appcolor.warning
                    }]}
                    placeholder={type == FSM_VALUE ? 'Tiền thưởng' : 'Giá'}
                    placeholderTextColor={appcolor.greydark}
                />}
            />
            <Text style={{ textAlign: 'center', color: appcolor.dark, fontSize: 13, marginTop: 5 }} >{placeholder}</Text>
        </View>
    )
}

export default MarketPriceReport;