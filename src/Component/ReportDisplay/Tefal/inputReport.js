import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { Icon } from '@rneui/themed';
// import NumberFormat from "react-number-format";
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { LoadingView } from "../../../Control/ItemLoading";
import { TabForm } from "../../../Control/TabForm";
import { clearAllDataCompetitor, getListCategoryDisplay, getListCompetitorProduct, getListSubCategoryDisplay, getTabCompetitorReport, updateItemCompetitor } from "../../../Controller/DisplayController";
import { groupDataByKey, Message, ToastError } from "../../../Core/Helper";
import { deviceHeight, deviceWidth, minWidthTab } from "../../../Core/Utility";


export const InputReport = ({ navigation, route, Status }) => {
    const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState)
    const listReport = JSON.parse(kpiinfo.reportItem || '{}')
    const [showProgress, setProgress] = useState(false)
    const [isDone, setDone] = useState(false)
    const [data, setData] = useState({ dataShow: [], dataShowF: [], dataTab: [], dataCategory: [], dataSubCategory: [] })
    const tabRef = useRef()

    const listInput = [
        { id: 1, name: 'Trưng bày', displayType: 'quantity', },
        { id: 2, name: 'thực bán', displayType: 'netValue', },
        { id: 3, name: 'Niêm yết', displayType: 'priceValue', }
    ]

    const loadData = async () => {
        await setProgress(true)
        await loadDataInput()
        setTimeout(async () => { await setProgress(false) }, 100)
    }
    const loadDataInput = async () => {
        await setProgress(true)
        const listProduct = await getListCompetitorProduct(workinfo)
        const listCompetitor = await getTabCompetitorReport()
        const listCategory = await getListCategoryDisplay()
        const listSubCategory = await getListSubCategoryDisplay(workinfo)

        const { arr } = groupDataByKey({
            arr: listProduct,
            key: 'divisionId',
            keyLayer2: 'categoryId'
        })
        await setData({ dataShow: arr, dataShowF: arr, dataTab: listCompetitor, dataCategory: listCategory, dataSubCategory: listSubCategory })
        await setProgress(false)
    }

    useEffect(() => {
        const _load = loadDataInput()
        return () => _load
    }, [])

    const openSheet = (type) => {
        Keyboard.dismiss()

        SheetManager.show('ref_toolsSheet')
    }
    const filterProduct = async (text) => {
        // let dataSearch = []
        // if (isDone)
        //     dataSearch = data.dataShowF.filter(it =>
        //         (it.quantity !== null && it.quantity >= 0) ||
        //         (it.priceValue !== null && it.priceValue >= 0) ||
        //         (it.netValue !== null && it.netValue >= 0) ||
        //         (it.fsmValue !== null && it.fsmValue >= 0))
        // else
        //     dataSearch = data.dataShowF

        // if (text !== null && text.length > 0) {
        //     const mResult = await dataSearch.filter((it) => {
        //         const nameProduct = it.modelName ? it.modelName.toUpperCase() : ''.toUpperCase();
        //         const textData = text.toUpperCase();
        //         return nameProduct.indexOf(textData) > -1
        //     })
        //     data.dataShow = mResult;
        // } else {
        //     data.dataShow = dataSearch;
        // }
        // setMutate(e => !e)
    }
    const keyExtractor = useCallback((it) => it.displayCompetitorId.toString(), [])
    const getItemLayout = (data, index) => ({
        length: 90,
        offset: 90 * index,
        index
    })
    const ViewItem = () => {
        return (
            data.dataTab.map(it => {
                let listDataByCompetitor = []
                listDataByCompetitor = data.dataShow.filter(item => item.divisionId === it.divisionId)
                const totalRow = listDataByCompetitor.length
                return (
                    <Tabs.Tab key={it.division + `(${totalRow})`} label={it.division + `(${totalRow})`} name={it.division + `(${totalRow})`}>
                        <View style={{ flex: 1, marginTop: 0, width: deviceWidth }}>

                            <Tabs.FlatList
                                windowSize={5}
                                getItemLayout={getItemLayout}
                                removeClippedSubviews={true}
                                key={it.categoryId}
                                data={listDataByCompetitor}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ backgroundColor: appcolor.surface }}
                                initialNumToRender={6}
                                keyExtractor={keyExtractor}
                                ListFooterComponent={<Text style={{ height: deviceHeight / 2, textAlign: 'center' }} >Đã xem hết</Text>}
                                renderItem={({ item, index }) =>
                                    <RenderItem item={item} index={index} data={data} listInput={listInput}
                                        appcolor={appcolor} workinfo={workinfo}
                                    />
                                }
                            />
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }

    const clearData = async () => {
        data.dataShowF.map(it => {
            it.quantity = null
            it.priceValue = null
        })
        setData({ ...data, dataShow: data.dataShowF })
    }
    const setClearAll = async () => {
        if (Status !== 1) {
            Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
                async () => {
                    await clearAllDataCompetitor(workinfo);
                    await loadDataInput()
                    await clearData()
                    await setDone(false)
                    SheetManager.hide('ref_toolsSheet')
                })
        } else {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            SheetManager.hide('ref_toolsSheet')
        }
    }
    const filterDoneProduct = async () => {
        if (!isDone) {
            let lstRes = data.dataShow.filter(it => (it.quantity !== null && it.quantity >= 0) || (it.priceValue !== null && it.priceValue >= 0))
            data.dataShow = lstRes;
        } else {
            data.dataShow = data.dataShowF;
        }
        await setDone(e => !e)
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 6, borderRadius: 8, borderWidth: 0.6, borderColor: appcolor.grayLight, padding: 5 }}>
                <FormGroup
                    containerStyle={{ backgroundColor: appcolor.grayLight, padding: 3, marginBottom: 0, paddingEnd: 8, width: '88%' }}
                    inputStyle={{ fontSize: 14, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm' editable
                    iconName='search'
                    onClearTextAndroid={filterProduct}
                    handleChangeForm={filterProduct}
                />

                <TouchableOpacity
                    onPress={openSheet}
                    style={{ width: '10%', height: 38, padding: 3, backgroundColor: appcolor.grayLight, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name='ellipsis-vertical' type='ionicon' size={21} color={appcolor.dark} />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
                <KeyboardAvoidingView
                    style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                    {
                        !showProgress &&
                        <Tabs.Container
                            ref={tabRef}
                            renderTabBar={(props) => (
                                <MaterialTabBar
                                    {...props}
                                    scrollEnabled={true}
                                    // tabStyle={{ minWidth: minWidthTab(data.dataTab), height: 42, }}
                                    tabStyle={{
                                        borderRadius: 8, backgroundColor: appcolor.light, minWidth: minWidthTab(data.dataTab),
                                        height: 38, borderColor: appcolor.grayLight, borderWidth: 1, marginHorizontal: 5
                                    }}
                                    labelStyle={{ fontSize: 14, fontWeight: "600" }}
                                    indicatorStyle={{ backgroundColor: appcolor.transparent }}
                                    inactiveColor={appcolor.dark}
                                    activeColor={appcolor.primary}
                                    style={{ backgroundColor: appcolor.surface }}
                                />
                            )}
                            headerContainerStyle={{ backgroundColor: appcolor.transparent, shadowColor: appcolor.transparent }}
                            containerStyle={{ backgroundColor: appcolor.surface }}
                        >
                            {ViewItem()}
                        </Tabs.Container>
                    }
                </KeyboardAvoidingView>
            </View>
            {
                showProgress &&
                <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 3 }}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
            <ActionSheet
                id={'ref_toolsSheet'}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >
                <View style={{ padding: 8, width: '100%', height: '35%' }}>
                    {/* <View style={{ width: '100%' }}>
                        <Text style={{ color: appcolor.dark, fontSize: 16, padding: 4, fontWeight: '600' }}>Công cụ</Text>
                        <TouchableOpacity
                            style={{ borderColor: appcolor.dark, width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5, marginTop: 12 }}
                            onPress={filterDoneProduct}>
                            <Text style={{ width: '80%', textAlign: 'center', color: appcolor.dark }} >Sản phẩm đã nhập</Text>
                            <Icon name={!isDone ? 'checkmark-circle-outline' : 'check-circle'} type={!isDone ? 'ionicon' : ''} size={23} color={!isDone ? appcolor.dark : appcolor.success} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ borderColor: appcolor.danger, width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5, marginTop: 12 }}
                            onPress={setClearAll}>
                            <Text style={{ width: '80%', textAlign: 'center', color: appcolor.danger }} >Xóa dữ liệu đã nhập</Text>
                            <Icon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
                        </TouchableOpacity>
                    </View> */}

                    <View style={{ width: '100%' }}>
                        <Text style={{ width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '600', color: appcolor.dark }}>Công cụ</Text>
                        <TouchableOpacity onPress={filterDoneProduct}>
                            <View style={{
                                backgroundColor: isDone ? appcolor.light : appcolor.light,
                                borderWidth: isDone ? 0.5 : 0,
                                borderColor: appcolor.success,
                                width: '100%', flexDirection: 'row', alignItems: 'center',
                                padding: 5, marginTop: 8, borderRadius: 5
                            }}>
                                <Icon name={'keyboard'} size={18} color={appcolor.success} />
                                <Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }}>Xem dữ liệu đã nhập</Text>
                            </View>
                        </TouchableOpacity>
                        {
                            Status != 1 && <TouchableOpacity
                                onPress={setClearAll}>
                                <View style={{
                                    backgroundColor: appcolor.light,
                                    borderWidth: 0,
                                    borderColor: appcolor.success,
                                    width: '100%', flexDirection: 'row', alignItems: 'center',
                                    padding: 5, marginTop: 8, borderRadius: 5
                                }}>
                                    <Icon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
                                    <Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }} >Xóa dữ liệu đã nhập</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>

                </View>
            </ActionSheet >
        </View>
    )
}

const RenderItem = ({ item, index, data, workinfo, deleteItem, Styles, listInput, appcolor }) => {
    const [itemDisplay, _] = useState(item)
    const keyLayer2 = item[`${item.divisionId}${item.categoryId}`];

    return (
        <View style={{ marginHorizontal: 5, }}>
            {(keyLayer2) &&
                <View style={{ flex: 1, padding: 8, marginTop: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.greydark, }}>
                    <Icon name='tags' type='font-awesome-5' size={15} color={appcolor.white} />
                    <Text style={{ color: appcolor.white, fontSize: 14, paddingLeft: 8, fontWeight: '600' }}>{item.categoryName}</Text>
                </View>
            }
            <View style={{ height: 90, backgroundColor: appcolor.light, padding: 5, marginTop: 5, marginLeft: 5, elevation: 2, borderRadius: 10 }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: appcolor.dark, fontSize: 14, padding: 4, fontWeight: '600' }}>{`${index + 1}. ` + item.modelName}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }} >
                    {listInput.map((it, id) => {
                        return (
                            <RenderItemInput key={it.id + itemDisplay.displayCompetitorId} itemInput={it} indexInput={id} item={itemDisplay} listInput={listInput} appcolor={appcolor} data={data} workinfo={workinfo} />
                        )
                    })}
                </View>
            </View >
        </View>
    )
}
const RenderItemInput = ({ itemInput, indexInput, item, listInput, Styles, appcolor, data, workinfo }) => {
    const [input, setInput] = useState(itemInput.displayType == 'fsmValue' ? (item.fsmValue === 0 ? 0 : (item.fsmValue || '')) :
        itemInput.displayType == 'priceValue' ? (item.priceValue === 0 ? 0 : (item.priceValue || '')) :
            itemInput.displayType == 'netValue' ? (item.netValue === 0 ? 0 : (item.netValue || '')) :
                (item.quantity === 0 ? 0 : (item.quantity || '')));
    const [_, setmutate] = useState()

    const changeValue = async (text) => {
        let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        if (intValue && intValue > 0) {
            item[itemInput.displayType] = intValue
        } else if ((itemInput.displayType === 'quantity') && intValue === 0) {
            item[itemInput.displayType] = 0
            intValue = 0
        } else {
            item[itemInput.displayType] = null
            intValue = null
        }

        setInput(intValue)

        if (item.displayCompetitorId) {
            const indexF = data.dataShowF.findIndex(it => it.displayCompetitorId === item.displayCompetitorId)
            const index = data.dataShow.findIndex(it => it.displayCompetitorId === item.displayCompetitorId)
            data.dataShowF[indexF][itemInput.displayType] = intValue;
            data.dataShow[index][itemInput.displayType] = intValue;
            await updateItemCompetitor(item, workinfo)
        }
    }

    const endInput = async (e) => {
        let value = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        let isError = 0
        if (intValue < 1000 && (itemInput.displayType === 'priceValue' || itemInput.displayType === 'netValue' || itemInput.displayType === 'fsmValue')) {
            item[itemInput.displayType] = null
            intValue = null;
            isError = 1;
            setInput(null)
            ToastError("Nhập số tiền không được nhỏ hơn 1000!", "Lỗi", "top");
        } else if (intValue % 1000 > 0 && (itemInput.displayType === 'priceValue' || itemInput.displayType === 'netValue' || itemInput.displayType === 'fsmValue')) {
            item[itemInput.displayType] = null
            intValue = null;
            isError = 1;
            setInput(null)
            ToastError("Nhập số tiền không được lẻ!", "lỗi", "top");
        } else {
            isError = 0
        }

        const indexF = data.dataShowF.findIndex(it => it.displayCompetitorId === item.displayCompetitorId)
        item.displayCompetitorId ? (data.dataShowF[indexF][itemInput.displayType] = intValue) : null
        if (itemInput.displayType === 'priceValue') {
            item.displayCompetitorId ? (data.dataShowF[indexF].isPriceError = isError) : null
            item.isPriceError = isError;
            setmutate(e => !e)
        } else if (itemInput.displayType === 'fsmValue') {
            item.displayCompetitorId ? (data.dataShowF[indexF].isFsmValueError = isError) : null
            item.isFsmValueError = isError;
            setmutate(e => !e)
        } else if (itemInput.displayType === 'netValue') {
            item.displayCompetitorId ? (data.dataShowF[indexF].isNetValue = isError) : null
            item.isNetValue = isError;
            setmutate(e => !e)
        }
        if (item.displayCompetitorId) {
            await updateItemCompetitor(item, workinfo)
        }
    }
    const indexItem = (listInput.length > 4 || listInput.length === 3) ? 2 : 1
    return (
        <View style={{ height: 50, width: ((indexInput > 2 && indexInput < 5) || (listInput.length % 2 === 0)) ? '49.3%' : '32.6%' }}>
            {indexItem >= indexInput && <Text style={{ textAlign: 'center', color: appcolor.dark }} >{itemInput.name}</Text>}
            <NumberFormat
                value={input === 0 ? 0 : (input || '')}
                displayType='text'
                thousandSeparator={true}
                renderText={value =>
                    <TextInput
                        textAlign={'center'}
                        value={value}
                        style={{
                            height: 30, fontSize: 12, color: appcolor.dark, fontWeight: '500', textAlign: 'center', borderWidth: 0.5,
                            borderColor: appcolor.greydark, padding: 8, marginBottom: 2, textAlign: 'center',
                            color: appcolor.dark, borderRadius: 5, backgroundColor: (itemInput.displayType === 'fsmValue' && item.isFsmValueError === 1)
                                || (itemInput.displayType === 'netValue' && item.isNetValue === 1)
                                || (itemInput.displayType === 'priceValue' && item.isPriceError === 1)
                                ? appcolor.warning : appcolor.light
                        }}
                        keyboardType='numeric'
                        placeholder={itemInput.displayType === 'fsmValue' ? 'Tiền thưởng' : (itemInput.displayType === 'priceValue' ? 'Giá' : (itemInput.displayType === 'netValue' ? 'Giá' : 'Số lượng'))}
                        placeholderTextColor={appcolor.greydark}
                        editable={item.upload !== 1}
                        selectTextOnFocus={item.upload !== 1}
                        onChangeText={changeValue}
                        onEndEditing={endInput}
                    />
                }
            />
            {indexInput > indexItem && <Text style={{ textAlign: 'center', color: appcolor.dark }} >{itemInput.name}</Text>}
        </View>
    )
}

