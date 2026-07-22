import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view";
import { useSelector } from "react-redux";
import { _competitorId, _competitorName } from "../../../Core/URLs";
import { deviceHeight, deviceWidth, minWidthTab, removeDuplicate } from "../../../Core/Utility";
import { clearAllDataDisplay, getDisplayProduct, updateItemDisplay } from '../../../Controller/DisplayController'
import { updateNoteDisplayReport } from "../../../Controller/WorkController";
// import NumberFormat from "react-number-format";
import { Message, ToastError, ToastSuccess } from "../../../Core/Helper";
import ActionSheet from "react-native-actions-sheet";
import FormGroup from "../../../Content/FormGroup";
import { Icon } from '@rneui/themed';
import { LoadingView } from "../../../Control/ItemLoading";
import { FlashList } from "@shopify/flash-list";


export const InputDisplayStockCasper = ({ navigation, route, Status, reloadView }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [isDone, setDone] = useState(false)
    const [_, setMutate] = useState(false)
    const [data, setData] = useState({ dataTab: [], dataShow: [], dataShowF: [] })
    const [showProgress, setProgress] = useState(false)
    const ref_toolsSheet = useRef()
    const tabRef = useRef()

    const loadDataShow = async () => {
        await setProgress(true)
        const listProduct = await getDisplayProduct(workinfo)
        const listTab = await removeDuplicate(listProduct, "categoryName")
        await setData({ dataTab: listTab, dataShow: listProduct, dataShowF: listProduct })
        await setTimeout(async () => { await setProgress(false) }, 100)
    }

    useEffect(() => {
        const _load = loadDataShow()
        // console.log("useEffect");
        return () => { _load }
    }, [])

    const filterDoneProduct = async () => {
        if (!isDone) {
            let lstRes = data.dataShowF.filter(it =>
                (it.quanity !== null && it.quanity >= 0) || (it.price !== null && it.price >= 0) || (it.quantityStock !== null && it.quantityStock >= 0)
                // || (it.quantitySuggest !== null && it.quantitySuggest >= 0)
                // || (it.fsmValue !== null && it.fsmValue >= 0)
            )
            data.dataShow = lstRes;
            // await setData({ ...data, dataShow: lstRes, dataShowD: lstRes })
        } else {
            data.dataShow = data.dataShowF;
            // await setData({ ...data, dataShow: data.dataShowF, dataShowD: data.dataShowF })
            // await setSearch('')
        }
        setDone(e => !e)
    }
    const filterProduct = async (text) => {
        let dataSearch = []
        if (isDone)
            dataSearch = data.dataShowF.filter(it => (it.quanity !== null && it.quanity >= 0) || (it.price !== null && it.price >= 0) || (it.quantityStock !== null && it.quantityStock >= 0))
        else
            dataSearch = data.dataShowF
        //
        if (text !== null && text.length > 0) {
            const mResult = await dataSearch.filter((it) => {
                const nameProduct = it.productName ? it.productName.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return nameProduct.indexOf(textData) > -1
            })
            data.dataShow = mResult;
            // await setSearch(text)
        } else {
            data.dataShow = dataSearch;
            // isDone ? await setDone(false) : null
            // await setSearch('')
        }
        setMutate(e => !e)
    }
    const setClearAll = async () => {

        if (Status !== 1) {
            Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
                async () => {
                    await clearAllDataDisplay(workinfo);
                    await reloadView()
                    await setDone(false)
                    await loadDataShow()
                    ref_toolsSheet.current?.hide()
                })
        } else {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            ref_toolsSheet.current?.hide()
        }
    }
    const onUpdateNote = async (note, categoryName) => {
        let itemNote = {
            workId: workinfo.workId,
            displayRef: data.dataTab[tabRef.current.getCurrentIndex()].displayRef,
            displayComment: note || '',
            division: _competitorName
        }
        data.dataShow.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
        data.dataShowF.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
        await updateNoteDisplayReport(itemNote);
    }
    const endUpdateNote = async (note, categoryName) => {
        let itemNote = {
            workId: workinfo.workId,
            displayRef: data.dataTab[tabRef.current.getCurrentIndex()].displayRef,
            displayComment: '',
            division: _competitorName
        }
        if (note?.length > 0 && note?.length < 5) {
            ToastError('Vui lòng nhập ghi chú ít nhất 5 ký tự.', 'Thông báo', 'top');
            data.dataShow.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
            data.dataShowF.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
            await updateNoteDisplayReport(itemNote);
            return
        }
        note?.length > 5 && ToastSuccess('Đã lưu ghi chú.', 'Thông báo', 'top');
    }
    const getItemLayout = (data, index) => ({
        length: 100,
        offset: 100 * index,
        index
    })
    const ViewItem = () => {
        return (
            data.dataTab.map(it => {
                // console.log(moment().format("SSS"))
                let listDataByCate = data.dataShow.filter(item => item.categoryId === it.categoryId)
                const totalRow = listDataByCate.length
                const onChangeNote = (text) => {
                    onUpdateNote(text, it.categoryName)
                }
                const endChangeNote = (event) => {
                    endUpdateNote(event.nativeEvent.text, it.categoryName)
                }
                return (
                    <Tabs.Tab key={it.categoryName + `(${totalRow})`}
                        label={it.categoryName + `(${totalRow})`} name={it.categoryName + `(${totalRow})`}>
                        <View style={Style.viewTabStyle}  >
                            <View style={{
                                backgroundColor: appcolor.surface, flexDirection: 'row',
                                justifyContent: 'space-between', padding: 8
                            }}>
                                <TextInput
                                    editable={Status !== 1 ? true : false}
                                    selectTextOnFocus={Status !== 1 ? true : false}
                                    multiline={true}
                                    autoCorrect={false}
                                    onChangeText={onChangeNote}
                                    style={Style.inputNoteStyle}
                                    onEndEditing={endChangeNote}
                                    placeholderTextColor={appcolor.greydark}
                                    defaultValue={listDataByCate[0]?.displayComment || ''}
                                    placeholder='Nhập ghi chú ở đây.'
                                />
                            </View >
                            {/* <KeyboardAvoidingView
                                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                                behavior={Platform.OS == "ios" ? "padding" : null}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} > */}
                            <FlashList
                                key={it.categoryId}
                                data={listDataByCate}
                                initialNumToRender={5}
                                estimatedItemSize={200}
                                // getItemLayout={getItemLayout}
                                keyExtractor={(_, index) => index.toString()}
                                ListFooterComponent={<Text style={Style.footerStyle} >Đã xem hết</Text>}
                                renderItem={({ item, index }) => <RenderItem item={item}
                                    index={index} data={data} Style={Style}
                                    appcolor={appcolor} workinfo={workinfo} />}
                            />
                            {/* </KeyboardAvoidingView> */}
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }
    const openSheet = () => {
        Keyboard.dismiss()
        ref_toolsSheet.current.show()
    }
    const Style = StyleSheet.create({
        container: { flex: 1, backgroundColor: appcolor.light },
        headerStyle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
        searchStyle: { backgroundColor: appcolor.grayLight, margin: 8, padding: 3, paddingEnd: 8, width: '80%' },
        buttonHeaderStyle: { width: '10%', height: 38, padding: 3, backgroundColor: appcolor.grayLight, borderRadius: 50, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
        progressStyle: { position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 3 },
        actionSheetStyle: { padding: 8, width: '100%', height: '30%' },
        buttonSheetStyle: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5, marginTop: 12 },
        textSheetStyle: { width: '80%', textAlign: 'center' },
        titleStyle: { color: appcolor.dark, fontSize: 16, fontWeight: '600' },
        viewTabStyle: { flex: 1, backgroundColor: appcolor.light, marginTop: 40, padding: 5, width: deviceWidth, display: !showProgress ? 'flex' : 'none' },
        inputNoteStyle: {
            flex: 1, color: appcolor.dark, height: 60,
            textAlignVertical: 'top', borderWidth: 0.4, borderRadius: 10, borderColor: appcolor.dark,
            backgroundColor: appcolor.light, fontSize: 12
        },
        itemStyle: { height: 100, backgroundColor: appcolor.surface, padding: 5, margin: 5, elevation: 2, borderRadius: 10 },
        textItemStyle: { color: appcolor.dark, fontSize: 12, fontStyle: 'italic' },
        itemInputStyle: { height: 50, width: '33%', marginEnd: 2 },
        textInputStyle: { height: 30, fontSize: 13, color: appcolor.dark, fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: appcolor.greydark, padding: 8 },
        titleInputStyle: { textAlign: 'center', color: appcolor.dark },
        footerStyle: { height: 100, textAlign: 'center', color: appcolor.dark },
    })
    return (
        <View style={Style.container}>
            <View style={Style.headerStyle}>
                <FormGroup
                    containerStyle={Style.searchStyle}
                    inputStyle={{ fontSize: 12, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm' editable
                    iconName='search'
                    onClearTextAndroid={filterProduct}
                    // value={search} 
                    handleChangeForm={filterProduct}
                />
                <TouchableOpacity
                    onPress={openSheet}
                    style={Style.buttonHeaderStyle}>
                    <Icon name='ellipsis-vertical' type='ionicon' size={21} color={appcolor.dark} />
                </TouchableOpacity>
            </View>
            <View style={Style.container}>
                <Tabs.Container
                    ref={tabRef}
                    renderTabBar={(props) => (
                        <MaterialTabBar
                            {...props}
                            scrollEnabled={true}
                            tabStyle={{ minWidth: minWidthTab(data.dataTab), height: 42, }}
                            labelStyle={{ fontSize: 14, fontWeight: "600" }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}
                >
                    {ViewItem()}
                </Tabs.Container>
            </View>
            {
                showProgress &&
                <View style={Style.progressStyle}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
            <ActionSheet
                ref={ref_toolsSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >

                <View style={Style.actionSheetStyle}>
                    <View style={{ width: '100%' }}>
                        <Text style={Style.titleStyle} >Công cụ</Text>
                        <TouchableOpacity
                            style={[Style.buttonSheetStyle, { borderColor: appcolor.dark }]}
                            onPress={filterDoneProduct}>
                            <Text style={[Style.textSheetStyle, { color: appcolor.dark }]} >Sản phẩm đã nhập</Text>
                            <Icon name={!isDone ? 'checkmark-circle-outline' : 'check-circle'} type={!isDone ? 'ionicon' : ''} size={23} color={!isDone ? appcolor.dark : appcolor.success} />
                        </TouchableOpacity>
                        {/* <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'red' }}> */}
                        <TouchableOpacity
                            style={[Style.buttonSheetStyle, { borderColor: appcolor.danger }]}
                            onPress={setClearAll}>
                            <Text style={[Style.textSheetStyle, { color: appcolor.danger }]} >Xóa dữ liệu đã nhập</Text>
                            <Icon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
                        </TouchableOpacity>
                        {/* </View> */}
                    </View>
                </View>
            </ActionSheet >
        </View>
    )
}


const RenderItem = ({ item, index, data, workinfo, Style, appcolor }) => {
    const getItemLayout = (data, index) => ({
        length: 50,
        offset: 50 * index,
        index
    })
    return (
        <View style={Style.itemStyle}>
            <Text style={Style.titleStyle}>{`${index + 1}. ` + item.productName}</Text>
            <Text style={Style.textItemStyle}>{item.productCode}</Text>
            <View style={{ width: '100%', flexDirection: 'row' }}>
                <RenderItemInput
                    itemInput={{ name: 'Trưng bày', displayType: 'quanity', }}
                    indexInput={index} item={item}
                    Style={Style} appcolor={appcolor} data={data}
                    workinfo={workinfo} />
                <RenderItemInput
                    itemInput={{ name: 'Tồn kho', displayType: 'quantityStock', }}
                    indexInput={index} item={item}
                    Style={Style} appcolor={appcolor} data={data}
                    workinfo={workinfo} />
            </View>
        </View>
    )
}
const RenderItemInput = ({ itemInput, indexInput, item, Style, appcolor, data, workinfo }) => {
    const [input, setInput] = useState(itemInput.displayType == 'fsmValue' ? (item.fsmValue || '') :
        itemInput.displayType == 'price' ? (item.price || '') :
            itemInput.displayType == 'quanity' ? (item.quanity === 0 ? 0 : (item.quanity || '')) :
                itemInput.displayType == 'quantityStock' ? (item.quantityStock === 0 ? 0 : (item.quantityStock || '')) :
                    (item.quantitySuggest === 0 ? 0 : (item.quantitySuggest || '')));
    const [_, setmutate] = useState()
    // useEffect(() => {
    //     console.log("sac", "RenderItemInput")
    // }, [])

    const changeValue = async (text) => {
        let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        if (intValue && intValue > 0) {
            item[itemInput.displayType] = intValue
        } else if ((itemInput.displayType === 'quanity' || itemInput.displayType === 'quantityStock' || itemInput.displayType === 'quantitySuggest') && intValue === 0) {
            item[itemInput.displayType] = 0
            intValue = 0
        } else {
            item[itemInput.displayType] = null
            intValue = null
        }
        setInput(intValue)
        const indexF = data.dataShowF.findIndex(it => it.productId === item.productId && it.workId === item.workId)
        const index = data.dataShow.findIndex(it => it.productId === item.productId && it.workId === item.workId)

        data.dataShowF[indexF][itemInput.displayType] = intValue;
        data.dataShow[index][itemInput.displayType] = intValue;
        await updateItemDisplay(item, workinfo)
    }

    const endInput = async (e) => {
        let value = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        let isError = 0
        if (intValue < 10000 && (itemInput.displayType === 'price' || itemInput.displayType === 'fsmValue')) {
            item[itemInput.displayType] = null
            intValue = null;
            isError = 1;
            setInput(null)
            // displayType === 'price' ? setInputPrice(null) : setFsmValue(null)
            ToastError("Nhập số tiền không được nhỏ hơn 10.000!", "Lỗi", "top");
        } else if (intValue % 1000 > 0 && (itemInput.displayType === 'price' || itemInput.displayType === 'fsmValue')) {
            item[itemInput.displayType] = null
            intValue = null;
            isError = 1;
            setInput(null)
            // displayType === 'price' ? setInputPrice(null) : setFsmValue(null)
            ToastError("Nhập số tiền không được lẻ!", "lỗi", "top");
        } else {
            isError = 0
        }


        const indexF = data.dataShowF.findIndex(it => it.productId === item.productId && it.workId === item.workId)
        data.dataShowF[indexF][itemInput.displayType] = intValue;
        if (itemInput.displayType === 'price') {
            data.dataShowF[indexF].priceError = isError;
            item.priceError = isError;
            setmutate(e => !e)
        } else if (itemInput.displayType === 'fsmValue') {
            data.dataShowF[indexF].fsmValueError = isError;
            item.fsmValueError = isError;
            setmutate(e => !e)
        }
        await updateItemDisplay(item, workinfo)
    }

    return (
        <View style={[Style.itemInputStyle, { flexGrow: 1 }]}>
            {<Text style={Style.titleInputStyle}>{itemInput.name}</Text>}
            <NumberFormat
                value={input === 0 ? 0 : (input || '')}
                displayType='text'
                thousandSeparator={true}
                renderText={value =>
                    <TextInput
                        textAlign={'center'}
                        value={value}
                        style={[Style.textInputStyle, { backgroundColor: (itemInput.displayType === 'fsmValue' && item.fsmValueError === 1) || (itemInput.displayType === 'price' && item.priceError === 1) ? appcolor.warning : appcolor.light, }]}
                        keyboardType='numeric'
                        placeholder={itemInput.displayType === 'fsmValue' ? 'Tiền thưởng' : (itemInput.displayType === 'price' ? 'Giá' : 'Số lượng')}
                        placeholderTextColor={appcolor.greydark}
                        editable={item.upload !== 1}
                        selectTextOnFocus={item.upload !== 1}
                        onChangeText={changeValue}
                        onEndEditing={endInput}
                    />
                }
            />
        </View>
    )
}
